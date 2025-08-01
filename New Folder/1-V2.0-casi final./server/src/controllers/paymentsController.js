const { validationResult } = require('express-validator');
const { paymentService } = require('../services/paymentService.js');
const paymentGatewayService = require('../services/paymentGatewayService');
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

// Obtener todos los pagos (admin) o los pagos de un usuario (cliente)
exports.getPayments = async (req, res) => {
  try {
    const payments = await paymentService.getPayments(req.user.id, req.user.role);
    res.json({
      success: true,
      data: payments
    });
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener los pagos.' 
    });
  }
};

// Obtener un pago por ID
exports.getPaymentById = async (req, res) => {
  const { id } = req.params;
  try {
    const payment = await paymentService.getPaymentById(id);
    res.json(payment);
  } catch (error) {
    console.error(`Error fetching payment with id ${id}:`, error);
    res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo pago
exports.createPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { cliente_id, pedido_id, concepto, monto, metodo_pago_pago, estado, referencia, referencia_transferencia } = req.body;
  try {
    const newPayment = await paymentService.createPayment(cliente_id, pedido_id, concepto, monto, metodo_pago, estado, referencia, referencia_transferencia);
    
    // Registrar actividad de nuevo pago
    const clienteName = await getClienteName(cliente_id);
    await logActivity(
      'new_payment',
      `${clienteName} realizó un pago de $${monto.toLocaleString('es-MX')}`,
      'normal',
      cliente_id,
      newPayment.id,
      'pago'
    );

    // Enviar confirmación de pago por email (no bloquear si falla)
    try {
      const [clientData] = await pool.execute(
        'SELECT email FROM usuarios WHERE id = ?',
        [cliente_id]
      );
      
      if (clientData.length > 0) {
        emailService.sendPaymentConfirmation({
          client_email: clientData[0].email,
          monto,
          metodo_pago,
          referencia
        })
        .then(result => {
          if (result.success) {
            console.log('✅ Confirmación de pago enviada por email');
          } else {
            console.log('⚠️ Fallo enviando confirmación de pago:', result.error);
          }
        })
        .catch(err => {
          console.log('⚠️ Error enviando confirmación de pago:', err.message);
        });
      }
    } catch (emailError) {
      console.log('⚠️ Error obteniendo datos de cliente para email:', emailError);
    }

    // Crear notificación de nuevo pago
    try {
      await notificationService.notifyNewPayment({
        monto,
        metodo_pago,
        concepto
      }, clienteName);
    } catch (notificationError) {
      console.log('⚠️ Error creando notificación de pago:', notificationError);
    }
    
    res.status(201).json(newPayment);
  } catch (err) {
    console.error('Error creating payment:', err);
    res.status(500).json({ message: 'Error al crear el pago.' });
  }
};

// Actualizar un pago
exports.updatePayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { cliente_id, pedido_id, concepto, monto, metodo_pago_pago, estado, referencia, referencia_transferencia } = req.body;
  try {
    const updatedPayment = await paymentService.updatePayment(id, cliente_id, pedido_id, concepto, monto, metodo_pago, estado, referencia, referencia_transferencia);
    res.json(updatedPayment);
  } catch (err) {
    console.error(`Error updating payment with id ${id}:`, err);
    res.status(500).json({ message: 'Error al actualizar el pago.' });
  }
};

// Eliminar un pago
exports.deletePayment = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await paymentService.deletePayment(id);
    res.status(200).json(result);
  } catch (err) {
    console.error(`Error deleting payment with id ${id}:`, err);
    res.status(500).json({ message: 'Error al eliminar el pago.' });
  }
};

// Crear un nuevo pago por un cliente
exports.createClientPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const cliente_id = req.user.id;
  const { pedido_id, concepto, monto, metodo_pago, referencia_transferencia } = req.body;

  let estado;
  if (metodo_pago === 'Transferencia Bancaria') {
    estado = 'Pendiente de Verificación';
  } else if (metodo_pago === 'PayPal') {
    estado = 'Pagado'; // Asumimos que el pago de PayPal es instantáneo
  } else {
    estado = 'Pendiente';
  }

  try {
    const newPayment = await paymentService.createPayment(
      cliente_id,
      pedido_id,
      concepto,
      monto,
      metodo_pago,
      estado,
      null, // referencia (para PayPal real, aquí iría el ID)
      referencia_transferencia
    );
    res.status(201).json(newPayment);
  } catch (err) {
    console.error('Error creating client payment:', err);
    res.status(500).json({ message: 'Error al procesar el pago.' });
  }
};

exports.updateClientPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const paymentId = req.params.id;
  const cliente_id = req.user.id; // ID del usuario autenticado
  const { metodo_pago, referencia_transferencia } = req.body;

  try {
    // 1. Verificar que el pago pertenece al usuario
    const existingPayment = await paymentService.getPaymentById(paymentId);
    if (existingPayment.cliente_id !== cliente_id) {
      return res.status(403).json({ message: 'Acción no autorizada.' });
    }

    // 2. Determinar el nuevo estado en el backend
    const estado = metodo_pago === 'Transferencia Bancaria' ? 'Pendiente de Verificación' : 'Pagado';

    // 3. Actualizar el pago usando el servicio
    const updatedPayment = await paymentService.updatePayment(
      paymentId,
      cliente_id,
      existingPayment.pedido_id,
      existingPayment.concepto,
      existingPayment.monto,
      metodo_pago,
      estado,
      null, // referencia (se llenaría en una integración real de PayPal)
      referencia_transferencia
    );

    res.json(updatedPayment);
  } catch (err) {
    console.error(`Error updating client payment with id ${paymentId}:`, err);
    res.status(500).json({ message: 'Error al actualizar el pago.' });
  }
};

// ============ NUEVAS FUNCIONES PARA PASARELAS DE PAGO ============

// Crear Payment Intent de Stripe
exports.createStripePayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  const { amount, currency = 'mxn', order_id, client_email } = req.body;

  try {
    const result = await paymentGatewayService.createStripePayment(
      amount, 
      currency, 
      { 
        order_id, 
        client_email,
        user_id: req.user?.id 
      }
    );

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error creating Stripe payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Confirmar pago de Stripe
exports.confirmStripePayment = async (req, res) => {
  const { payment_intent_id, client_email } = req.body;

  try {
    const result = await paymentGatewayService.processPayment(
      { 
        payment_id: payment_intent_id, 
        client_email 
      }, 
      'stripe'
    );

    if (result.success) {
      // Guardar el pago en la base de datos
      try {
        await paymentService.createPayment(
          req.user?.id || null,
          req.body.order_id || null,
          'Pago por servicios de desarrollo',
          result.data.amount,
          'Stripe',
          'Completado',
          result.data.id,
          null
        );
      } catch (dbError) {
        console.error('Error saving payment to database:', dbError);
      }

      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error confirming Stripe payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear orden de PayPal
exports.createPayPalOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  const { amount, currency = 'USD', service, reference_id } = req.body;

  try {
    const result = await paymentGatewayService.createPayPalOrder(
      amount, 
      currency, 
      { 
        service, 
        reference_id: reference_id || `ORDER_${Date.now()}`,
        user_id: req.user?.id 
      }
    );

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Capturar pago de PayPal
exports.capturePayPalPayment = async (req, res) => {
  const { order_id, client_email } = req.body;

  try {
    const result = await paymentGatewayService.processPayment(
      { 
        payment_id: order_id, 
        client_email 
      }, 
      'paypal'
    );

    if (result.success) {
      // Guardar el pago en la base de datos
      try {
        await paymentService.createPayment(
          req.user?.id || null,
          req.body.order_ref || null,
          'Pago por servicios de desarrollo',
          result.data.amount,
          'PayPal',
          'Completado',
          result.data.id,
          null
        );
      } catch (dbError) {
        console.error('Error saving PayPal payment to database:', dbError);
      }

      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener información de pago
exports.getPaymentInfo = async (req, res) => {
  const { payment_id } = req.params;
  const { method = 'stripe' } = req.query;

  try {
    const result = await paymentGatewayService.getPaymentInfo(payment_id, method);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error getting payment info:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear reembolso
exports.createRefund = async (req, res) => {
  const { payment_id, amount, method = 'stripe', reason } = req.body;

  try {
    const result = await paymentGatewayService.createRefund(payment_id, amount, method);

    if (result.success) {
      // Actualizar el estado en la base de datos
      try {
        // Aquí podrías agregar lógica para actualizar el estado del pago en la BD
        console.log(`Refund created: ${result.data.id}`);
      } catch (dbError) {
        console.error('Error updating refund in database:', dbError);
      }

      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error creating refund:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
