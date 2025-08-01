const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware.js');
const { pool } = require('../config/db.js');

// Obtener todas las facturas
router.get('/', isAuthenticated, async (req, res) => {
  try {
    let query = `
      SELECT 
        f.*,
        c.email as cliente_email_real,
        c.telefono as cliente_telefono,
        pd.descripcion as pedido_descripcion
      FROM facturas f
      LEFT JOIN usuarios c ON f.cliente_id = c.id
      LEFT JOIN pedidos pd ON f.pedido_id = pd.id
    `;
    
    const params = [];
    
    // Si no es admin, solo mostrar sus propias facturas
    if (req.user.role !== 'admin') {
      query += ` WHERE f.cliente_id = ?`;
      params.push(req.user.id);
    }
    
    query += ` ORDER BY f.created_at DESC`;
    
    const [rows] = await pool.execute(query, params);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las facturas',
      error: error.message
    });
  }
});

// Obtener una factura específica
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    let query = `
      SELECT 
        f.*,
        c.email as cliente_email_real,
        c.telefono as cliente_telefono,
        pd.descripcion as pedido_descripcion
      FROM facturas f
      LEFT JOIN usuarios c ON f.cliente_id = c.id
      LEFT JOIN pedidos pd ON f.pedido_id = pd.id
      WHERE f.id = ?
    `;
    
    const params = [req.params.id];
    
    // Si no es admin, verificar que la factura le pertenece
    if (req.user.role !== 'admin') {
      query += ` AND f.cliente_id = ?`;
      params.push(req.user.id);
    }
    
    const [rows] = await pool.execute(query, params);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la factura',
      error: error.message
    });
  }
});

// Crear nueva factura (solo admin)
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const {
      cliente_id,
      cliente_nombre,
      cliente_email,
      pedido_id,
      concepto,
      subtotal,
      iva,
      total,
      fecha_vencimiento,
      metodo_pago,
      moneda = 'MXN',
      notas,
      referencia
    } = req.body;

    // Validar campos requeridos
    if (!cliente_nombre || !concepto || !total) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos: cliente_nombre, concepto, total'
      });
    }

    // Generar número de factura automático
    const year = new Date().getFullYear();
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM facturas WHERE YEAR(fecha_emision) = ?', 
      [year]
    );
    const nextNumber = String(countResult[0].count + 1).padStart(3, '0');
    const numero_factura = `FAC-${year}-${nextNumber}`;

    // Calcular fechas
    const fecha_emision = new Date();
    const fecha_venc = fecha_vencimiento ? new Date(fecha_vencimiento) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const query = `
      INSERT INTO facturas (
        numero_factura, cliente_id, cliente_nombre, cliente_email,
        pedido_id, concepto, subtotal, iva, total,
        fecha_emision, fecha_vencimiento, metodo_pago, moneda,
        notas, referencia
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      numero_factura, cliente_id, cliente_nombre, cliente_email,
      pedido_id, concepto, subtotal || 0, iva || 0, total,
      fecha_emision, fecha_venc, metodo_pago, moneda,
      notas, referencia
    ]);

    // Registrar actividad
    const activityQuery = `
      INSERT INTO recent_activity (type, message, priority, date, user_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    await pool.execute(activityQuery, [
      'new_invoice',
      `Nueva factura ${numero_factura} creada para ${cliente_nombre}`,
      'medium',
      new Date(),
      req.user.id
    ]);

    res.status(201).json({
      success: true,
      message: 'Factura creada exitosamente',
      data: {
        id: result.insertId,
        numero_factura,
        ...req.body
      }
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la factura',
      error: error.message
    });
  }
});

// Generar factura desde un pago (solo admin) - DESHABILITADO: tabla facturas no tiene pago_id
/*router.post('/generate-from-payment', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { pago_id } = req.body;

    if (!pago_id) {
      return res.status(400).json({
        success: false,
        message: 'pago_id es requerido'
      });
    }

    // Verificar que el pago existe
    const [paymentRows] = await pool.execute(`
      SELECT p.*, c.email as cliente_email, c.telefono as cliente_telefono
      FROM pagos p 
      LEFT JOIN usuarios c ON p.cliente_id = c.id 
      WHERE p.id = ?
    `, [pago_id]);

    if (paymentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    const payment = paymentRows[0];

    // Verificar que no exista ya una factura para este pago
    const [existingInvoice] = await pool.execute(
      'SELECT id FROM facturas WHERE pago_id = ?', 
      [pago_id]
    );

    if (existingInvoice.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una factura para este pago'
      });
    }

    // Calcular montos (asumiendo IVA del 16%)
    const total = parseFloat(payment.monto) || 0;
    const subtotal = total / 1.16;
    const iva = total - subtotal;

    // Generar número de factura
    const year = new Date().getFullYear();
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM facturas WHERE YEAR(fecha_emision) = ?', 
      [year]
    );
    const nextNumber = String(countResult[0].count + 1).padStart(3, '0');
    const numero_factura = `FAC-${year}-${nextNumber}`;

    const fecha_emision = payment.fecha_pago || new Date();
    const fecha_vencimiento = new Date(new Date(fecha_emision).getTime() + 30 * 24 * 60 * 60 * 1000);

    const query = `
      INSERT INTO facturas (
        numero_factura, cliente_id, cliente_nombre, cliente_email,
        pago_id, concepto, subtotal, iva, total, estado,
        fecha_emision, fecha_vencimiento, metodo_pago, moneda,
        notas, referencia
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      numero_factura,
      payment.cliente_id,
      payment.cliente_nombre,
      payment.cliente_email || '',
      payment.concepto || 'Pago recibido',
      subtotal.toFixed(2),
      iva.toFixed(2),
      total.toFixed(2),
      payment.estado === 'Pagado' ? 'Pagada' : 'Pendiente',
      fecha_emision,
      fecha_vencimiento,
      payment.metodo_pago,
      'MXN',
      `Factura generada automáticamente para pago #${pago_id}`,
      payment.referencia
    ]);

    // Registrar actividad
    const activityQuery = `
      INSERT INTO recent_activity (type, message, priority, date, user_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    await pool.execute(activityQuery, [
      'new_invoice',
      `Factura ${numero_factura} generada desde pago #${pago_id}`,
      'medium',
      new Date(),
      req.user.id
    ]);

    res.status(201).json({
      success: true,
      message: 'Factura generada exitosamente desde el pago',
      data: {
        id: result.insertId,
        numero_factura,
          total
      }
    });
  } catch (error) {
    console.error('Error generating invoice from payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar la factura desde el pago',
      error: error.message
    });
  }
});*/

// Actualizar factura (solo admin)
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = [];
    const updateValues = [];

    // Campos permitidos para actualizar
    const allowedFields = [
      'cliente_nombre', 'cliente_email', 'concepto', 'subtotal', 'iva', 'total',
      'fecha_vencimiento', 'metodo_pago', 'moneda', 'notas', 'referencia'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(req.body[field]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
    }

    updateValues.push(id);
    
    const query = `UPDATE facturas SET ${updateFields.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(query, updateValues);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Factura actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la factura',
      error: error.message
    });
  }
});

// Actualizar estado de factura (solo admin)
router.put('/:id/status', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const validStates = ['Pendiente', 'Pagada', 'Vencida', 'Cancelada'];
    if (!validStates.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Estados válidos: ' + validStates.join(', ')
      });
    }

    const [result] = await pool.execute(
      'UPDATE facturas SET estado = ? WHERE id = ?',
      [estado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    // Obtener información de la factura para la actividad
    const [invoiceRows] = await pool.execute(
      'SELECT numero_factura, cliente_nombre FROM facturas WHERE id = ?',
      [id]
    );

    if (invoiceRows.length > 0) {
      const invoice = invoiceRows[0];
      // Registrar actividad
      const activityQuery = `
        INSERT INTO recent_activity (type, message, priority, date, user_id)
        VALUES (?, ?, ?, ?, ?)
      `;
      await pool.execute(activityQuery, [
        'invoice_status_change',
        `Factura ${invoice.numero_factura} cambió a estado: ${estado}`,
        estado === 'Vencida' ? 'high' : 'medium',
        new Date(),
        req.user.id
      ]);
    }

    res.json({
      success: true,
      message: 'Estado de factura actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el estado de la factura',
      error: error.message
    });
  }
});

// Eliminar factura (solo admin)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener información de la factura antes de eliminarla
    const [invoiceRows] = await pool.execute(
      'SELECT numero_factura, cliente_nombre FROM facturas WHERE id = ?',
      [id]
    );

    const [result] = await pool.execute('DELETE FROM facturas WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    // Registrar actividad si se obtuvo la información
    if (invoiceRows.length > 0) {
      const invoice = invoiceRows[0];
      const activityQuery = `
        INSERT INTO recent_activity (type, message, priority, date, user_id)
        VALUES (?, ?, ?, ?, ?)
      `;
      await pool.execute(activityQuery, [
        'invoice_deleted',
        `Factura ${invoice.numero_factura} eliminada`,
        'low',
        new Date(),
        req.user.id
      ]);
    }

    res.json({
      success: true,
      message: 'Factura eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la factura',
      error: error.message
    });
  }
});

// Actualizar facturas vencidas (tarea de mantenimiento)
router.post('/update-overdue', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const [result] = await pool.execute(`
      UPDATE facturas 
      SET estado = 'Vencida' 
      WHERE estado = 'Pendiente' 
      AND fecha_vencimiento < NOW()
    `);

    res.json({
      success: true,
      message: `${result.affectedRows} facturas marcadas como vencidas`,
      updated_count: result.affectedRows
    });
  } catch (error) {
    console.error('Error updating overdue invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar facturas vencidas',
      error: error.message
    });
  }
});

module.exports = router;