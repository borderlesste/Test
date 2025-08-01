const { validationResult } = require('express-validator');
const { invoiceService } = require('../services/invoiceService.js');
const { logActivity } = require('./dashboardController.js');
const { pool } = require('../config/db.js');
const emailService = require('../services/emailService.js');
const notificationService = require('../services/notificationService.js');

// Helper function para obtener el nombre del cliente
const getClienteName = async (clienteId) => {
  try {
    const [rows] = await pool.execute('SELECT nombre FROM usuarios WHERE id = ?', [clienteId]);
    return rows.length > 0 ? rows[0].nombre : 'Cliente desconocido';
  } catch (error) {
    return 'Cliente desconocido';
  }
};

// Obtener todas las facturas (admin) o las facturas de un usuario (cliente)
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await invoiceService.getInvoices(req.user.id, req.user.role);
    res.json(invoices);
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ message: 'Error al obtener las facturas.' });
  }
};

// Obtener una factura por ID
exports.getInvoiceById = async (req, res) => {
  const { id } = req.params;
  try {
    const invoice = await invoiceService.getInvoiceById(id);
    
    // Verificar que el cliente solo pueda ver sus propias facturas
    if (req.user.role !== 'admin' && invoice.cliente_id !== req.user.id) {
      return res.status(403).json({ message: 'Acceso denegado a esta factura.' });
    }
    
    res.json(invoice);
  } catch (error) {
    console.error(`Error fetching invoice with id ${id}:`, error);
    if (error.message === 'Factura no encontrada') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }
};

// Crear una nueva factura
exports.createInvoice = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newInvoice = await invoiceService.createInvoice(req.body);
    
    // Registrar actividad de nueva factura
    const clienteName = await getClienteName(newInvoice.cliente_id);
    await logActivity(
      'new_order', // Usando new_order como tipo de actividad más cercano
      `Nueva factura ${newInvoice.numero_factura} creada para ${clienteName} por $${newInvoice.total.toLocaleString('es-MX')}`,
      'normal',
      newInvoice.cliente_id,
      newInvoice.id,
      'pedido' // Usando pedido como objeto_tipo más cercano
    );

    // Enviar notificación de nueva factura por email (no bloquear si falla)
    try {
      emailService.sendInvoiceNotification({
        client_email: newInvoice.cliente_email,
        numero_factura: newInvoice.numero_factura,
        total: newInvoice.total,
        fecha_vencimiento: newInvoice.fecha_vencimiento,
        concepto: newInvoice.concepto
      })
      .then(result => {
        if (result.success) {
          console.log('✅ Notificación de factura enviada por email');
        } else {
          console.log('⚠️ Fallo enviando notificación de factura:', result.error);
        }
      })
      .catch(err => {
        console.log('⚠️ Error enviando notificación de factura:', err.message);
      });
    } catch (emailError) {
      console.log('⚠️ Error configurando envío de factura:', emailError);
    }

    // Crear notificación de nueva factura
    try {
      await notificationService.notifyNewInvoice({
        numero_factura: newInvoice.numero_factura,
        total: newInvoice.total,
        concepto: newInvoice.concepto
      }, clienteName);
    } catch (notificationError) {
      console.log('⚠️ Error creando notificación de factura:', notificationError);
    }
    
    res.status(201).json(newInvoice);
  } catch (err) {
    console.error('Error creating invoice:', err);
    if (err.message === 'Cliente no encontrado') {
      res.status(404).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'Error al crear la factura.' });
    }
  }
};

// Actualizar una factura
exports.updateInvoice = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  try {
    const updatedInvoice = await invoiceService.updateInvoice(id, req.body);
    
    // Registrar actividad de factura actualizada
    const clienteName = await getClienteName(updatedInvoice.cliente_id);
    await logActivity(
      'new_order', // Usando new_order como tipo de actividad más cercano
      `Factura ${updatedInvoice.numero_factura} actualizada para ${clienteName}`,
      'normal',
      updatedInvoice.cliente_id,
      updatedInvoice.id,
      'pedido'
    );
    
    res.json(updatedInvoice);
  } catch (err) {
    console.error(`Error updating invoice with id ${id}:`, err);
    if (err.message === 'Factura no encontrada' || err.message === 'Cliente no encontrado') {
      res.status(404).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'Error al actualizar la factura.' });
    }
  }
};

// Actualizar solo el estado de una factura
exports.updateInvoiceStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { estado } = req.body;
  
  try {
    const updatedInvoice = await invoiceService.updateInvoiceStatus(id, estado);
    
    // Registrar actividad de cambio de estado
    const clienteName = await getClienteName(updatedInvoice.cliente_id);
    let activityType = 'new_order';
    let priority = 'normal';
    
    if (estado === 'Pagada') {
      activityType = 'new_payment';
      priority = 'normal';
    } else if (estado === 'Vencida') {
      activityType = 'overdue_payment';
      priority = 'urgent';
    }
    
    await logActivity(
      activityType,
      `Factura ${updatedInvoice.numero_factura} marcada como ${estado.toLowerCase()} para ${clienteName}`,
      priority,
      updatedInvoice.cliente_id,
      updatedInvoice.id,
      'pedido'
    );

    // Si la factura se marca como vencida, enviar notificación
    if (estado === 'Vencida') {
      try {
        emailService.sendOverdueInvoiceNotification({
          client_email: updatedInvoice.cliente_email,
          numero_factura: updatedInvoice.numero_factura,
          total: updatedInvoice.total,
          fecha_vencimiento: updatedInvoice.fecha_vencimiento
        })
        .then(result => {
          if (result.success) {
            console.log('✅ Notificación de factura vencida enviada por email');
          }
        })
        .catch(err => {
          console.log('⚠️ Error enviando notificación de factura vencida:', err.message);
        });
      } catch (emailError) {
        console.log('⚠️ Error configurando envío de notificación de vencimiento:', emailError);
      }
    }
    
    res.json(updatedInvoice);
  } catch (err) {
    console.error(`Error updating invoice status with id ${id}:`, err);
    if (err.message === 'Factura no encontrada' || err.message === 'Estado inválido') {
      res.status(404).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'Error al actualizar el estado de la factura.' });
    }
  }
};

// Eliminar una factura
exports.deleteInvoice = async (req, res) => {
  const { id } = req.params;
  try {
    // Obtener datos de la factura antes de eliminarla para logging
    const invoice = await invoiceService.getInvoiceById(id);
    const clienteName = await getClienteName(invoice.cliente_id);
    
    const result = await invoiceService.deleteInvoice(id);
    
    // Registrar actividad de factura eliminada
    await logActivity(
      'new_order',
      `Factura ${invoice.numero_factura} eliminada para ${clienteName}`,
      'normal',
      invoice.cliente_id,
      null,
      'pedido'
    );
    
    res.status(200).json(result);
  } catch (err) {
    console.error(`Error deleting invoice with id ${id}:`, err);
    if (err.message === 'Factura no encontrada') {
      res.status(404).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'Error al eliminar la factura.' });
    }
  }
};

// Generar factura desde un pago
exports.generateInvoiceFromPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { payment_id, concepto, moneda, notas } = req.body;
  
  try {
    const newInvoice = await invoiceService.generateInvoiceFromPayment(payment_id, {
      concepto,
      moneda,
      notas
    });
    
    // Registrar actividad de factura generada desde pago
    const clienteName = await getClienteName(newInvoice.cliente_id);
    await logActivity(
      'new_payment',
      `Factura ${newInvoice.numero_factura} generada automáticamente desde pago para ${clienteName}`,
      'normal',
      newInvoice.cliente_id,
      newInvoice.id,
      'pago'
    );

    // Enviar notificación de nueva factura
    try {
      emailService.sendInvoiceNotification({
        client_email: newInvoice.cliente_email,
        numero_factura: newInvoice.numero_factura,
        total: newInvoice.total,
        fecha_vencimiento: newInvoice.fecha_vencimiento,
        concepto: newInvoice.concepto
      })
      .then(result => {
        if (result.success) {
          console.log('✅ Notificación de factura generada enviada por email');
        }
      })
      .catch(err => {
        console.log('⚠️ Error enviando notificación de factura generada:', err.message);
      });
    } catch (emailError) {
      console.log('⚠️ Error enviando notificación de factura generada:', emailError);
    }
    
    res.status(201).json(newInvoice);
  } catch (err) {
    console.error('Error generating invoice from payment:', err);
    if (err.message === 'Pago no encontrado') {
      res.status(404).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'Error al generar la factura desde el pago.' });
    }
  }
};

// Actualizar facturas vencidas (tarea de mantenimiento)
exports.updateOverdueInvoices = async (req, res) => {
  try {
    const result = await invoiceService.updateOverdueInvoices();
    
    // Registrar actividad de mantenimiento
    await logActivity(
      'overdue_payment',
      `${result.count} facturas marcadas como vencidas automáticamente`,
      result.count > 0 ? 'high' : 'normal',
      null,
      null,
      null
    );
    
    res.json(result);
  } catch (err) {
    console.error('Error updating overdue invoices:', err);
    res.status(500).json({ message: 'Error al actualizar facturas vencidas.' });
  }
};