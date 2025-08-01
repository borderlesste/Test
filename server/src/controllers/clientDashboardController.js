const { pool } = require('../config/db.js');

// Obtener estadísticas del cliente específico
const getClientStats = async (req, res) => {
  try {
    const clientId = req.user.id; // Obtenido del middleware de autenticación
    
    // Obtener estadísticas del cliente
    const statsQueries = await Promise.all([
      // Información personal del cliente
      pool.execute('SELECT nombre, email, created_at as fecha_registro, estado FROM usuarios WHERE id = ?', [clientId]),
      
      // Proyectos del cliente
      pool.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN estado IN ('Pendiente', 'En progreso') THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN estado = 'Completado' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN estado = 'Pendiente' THEN 1 ELSE 0 END) as pending,
          AVG(CASE WHEN total IS NOT NULL THEN total END) as averageValue,
          SUM(CASE WHEN total IS NOT NULL THEN total END) as totalValue
        FROM pedidos 
        WHERE cliente_id = ?
      `, [clientId]),
      
      // Pagos del cliente
      pool.execute(`
        SELECT 
          SUM(CASE WHEN estado = 'Pagado' THEN monto ELSE 0 END) as paid,
          SUM(CASE WHEN estado = 'Pendiente' THEN monto ELSE 0 END) as pending,
          SUM(CASE WHEN estado = 'Vencido' THEN monto ELSE 0 END) as overdue,
          COUNT(*) as totalPayments
        FROM pagos 
        WHERE cliente_id = ?
      `, [clientId]),
      
      // Cotizaciones del cliente
      pool.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN estado = 'Pendiente' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN estado = 'Aprobada' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN estado = 'Rechazada' THEN 1 ELSE 0 END) as rejected
        FROM cotizaciones 
        WHERE email_prospecto = (SELECT email FROM usuarios WHERE id = ?)
      `, [clientId]),
      
      // Notificaciones del cliente
      pool.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN leida = 0 THEN 1 ELSE 0 END) as unread,
          SUM(CASE WHEN prioridad = 'alta' THEN 1 ELSE 0 END) as urgent
        FROM notificaciones 
        WHERE usuario_id = ?
      `, [clientId])
    ]);

    const [
      [personalInfo],
      [projectStats],
      [paymentStats], 
      [quoteStats],
      [notificationStats]
    ] = statsQueries;

    // Procesar información personal
    const clientInfo = personalInfo[0] || {
      nombre: 'Cliente',
      email: 'cliente@ejemplo.com',
      fecha_registro: new Date().toISOString(),
      estado: 'active'
    };

    // Procesar estadísticas
    const projects = projectStats[0] || { total: 0, active: 0, completed: 0, pending: 0, averageValue: 0, totalValue: 0 };
    const payments = paymentStats[0] || { paid: 0, pending: 0, overdue: 0, totalPayments: 0 };
    const quotes = quoteStats[0] || { total: 0, pending: 0, approved: 0, rejected: 0 };
    const notifications = notificationStats[0] || { total: 0, unread: 0, urgent: 0 };

    const clientData = {
      personalInfo: {
        name: clientInfo.nombre,
        email: clientInfo.email,
        joinDate: clientInfo.fecha_registro,
        status: clientInfo.estado
      },
      projects: {
        active: parseInt(projects.active) || 0,
        completed: parseInt(projects.completed) || 0,
        pending: parseInt(projects.pending) || 0,
        total: parseInt(projects.total) || 0,
        averageValue: parseFloat(projects.averageValue) || 0,
        totalValue: parseFloat(projects.totalValue) || 0
      },
      payments: {
        paid: parseFloat(payments.paid) || 0,
        pending: parseFloat(payments.pending) || 0,
        overdue: parseFloat(payments.overdue) || 0,
        totalPayments: parseInt(payments.totalPayments) || 0,
        nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Mock: 30 días desde ahora
      },
      quotes: {
        pending: parseInt(quotes.pending) || 0,
        approved: parseInt(quotes.approved) || 0,
        rejected: parseInt(quotes.rejected) || 0,
        total: parseInt(quotes.total) || 0
      },
      notifications: {
        unread: parseInt(notifications.unread) || 0,
        total: parseInt(notifications.total) || 0,
        urgent: parseInt(notifications.urgent) || 0
      }
    };

    res.json(clientData);
  } catch (error) {
    console.error('Error al obtener estadísticas del cliente:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas del cliente',
      error: error.message 
    });
  }
};

// Obtener proyectos detallados del cliente
const getClientProjects = async (req, res) => {
  try {
    const clientId = req.user.id;
    
    const [projects] = await pool.execute(`
      SELECT 
        id,
        descripcion as name,
        total as value,
        estado as status,
        created_at as date,
        updated_at as deliveryDate,
        'media' as priority
      FROM pedidos 
      WHERE cliente_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `, [clientId]);

    // Formatear proyectos
    const formattedProjects = projects.map(project => ({
      id: project.id,
      name: project.name || 'Proyecto sin nombre',
      value: parseFloat(project.value) || 0,
      status: project.status || 'Pendiente',
      date: project.date,
      deliveryDate: project.deliveryDate,
      priority: project.priority || 'media'
    }));

    res.json(formattedProjects);
  } catch (error) {
    console.error('Error al obtener proyectos del cliente:', error);
    res.status(500).json({ 
      message: 'Error al obtener proyectos del cliente',
      error: error.message 
    });
  }
};

// Obtener historial de pagos del cliente
const getClientPayments = async (req, res) => {
  try {
    const clientId = req.user.id;
    
    const [payments] = await pool.execute(`
      SELECT 
        p.id,
        p.concepto as concept,
        p.monto as amount,
        p.created_at as date,
        p.estado as status,
        'Transferencia' as method,
        'Proyecto' as projectName
      FROM pagos p
      WHERE p.cliente_id = ?
      ORDER BY p.created_at DESC
      LIMIT 20
    `, [clientId]);

    // Formatear pagos
    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      concept: payment.concept || payment.projectName || 'Pago sin concepto',
      amount: parseFloat(payment.amount) || 0,
      date: payment.date,
      status: payment.status || 'Pendiente',
      method: payment.method || 'Transferencia'
    }));

    res.json(formattedPayments);
  } catch (error) {
    console.error('Error al obtener pagos del cliente:', error);
    res.status(500).json({ 
      message: 'Error al obtener pagos del cliente',
      error: error.message 
    });
  }
};

// Obtener actividad reciente del cliente
const getClientActivity = async (req, res) => {
  try {
    const clientId = req.user.id;
    
    // Actividades del dashboard relacionadas con el cliente
    const [dashboardActivities] = await pool.execute(`
      SELECT 
        'activity' as type,
        descripcion as message,
        created_at as time,
        'normal' as priority
      FROM actividades 
      WHERE usuario_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [clientId]);

    // Actividades de proyectos
    const [projectActivities] = await pool.execute(`
      SELECT 
        'project' as type,
        CONCAT('Proyecto "', descripcion, '" cambió a estado: ', estado) as message,
        created_at as time,
        'normal' as priority
      FROM pedidos 
      WHERE cliente_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `, [clientId]);

    // Actividades de pagos
    const [paymentActivities] = await pool.execute(`
      SELECT 
        'payment' as type,
        CONCAT('Pago de $', FORMAT(monto, 2), ' - ', concepto, ' (', estado, ')') as message,
        created_at as time,
        CASE 
          WHEN estado = 'Pagado' THEN 'normal'
          WHEN estado = 'Vencido' THEN 'alta'
          ELSE 'baja'
        END as priority
      FROM pagos 
      WHERE cliente_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `, [clientId]);

    // Combinar todas las actividades
    const allActivities = [
      ...dashboardActivities,
      ...projectActivities,
      ...paymentActivities
    ];

    // Ordenar por fecha y tomar las más recientes
    const sortedActivities = allActivities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 15);

    res.json(sortedActivities);
  } catch (error) {
    console.error('Error al obtener actividad del cliente:', error);
    res.status(500).json({ 
      message: 'Error al obtener actividad del cliente',
      error: error.message 
    });
  }
};

// Obtener cotizaciones del cliente
const getClientQuotes = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { status, limit = 20, offset = 0 } = req.query;
    
    // Obtener email del cliente para buscar cotizaciones
    const [userInfo] = await pool.execute('SELECT email FROM usuarios WHERE id = ?', [clientId]);
    
    if (userInfo.length === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    const clientEmail = userInfo[0].email;
    
    // Construir query con filtros opcionales
    let query = `
      SELECT 
        id,
        numero_cotizacion,
        nombre_prospecto,
        email_prospecto,
        telefono_prospecto,
        empresa_prospecto,
        tipo_servicio,
        descripcion,
        estado,
        subtotal,
        descuento,
        iva,
        total,
        fecha_emision,
        fecha_vencimiento,
        condiciones_pago,
        notas,
        created_at,
        updated_at
      FROM cotizaciones 
      WHERE email_prospecto = ?
    `;
    
    const queryParams = [clientEmail];
    
    // Filtrar por estado si se proporciona
    if (status) {
      query += ' AND estado = ?';
      queryParams.push(status);
    }
    
    // Ordenar por fecha de creación descendente
    query += ' ORDER BY created_at DESC';
    
    // Agregar límite y offset para paginación
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const [quotes] = await pool.execute(query, queryParams);
    
    // Obtener total de cotizaciones para paginación
    let countQuery = 'SELECT COUNT(*) as total FROM cotizaciones WHERE email_prospecto = ?';
    const countParams = [clientEmail];
    
    if (status) {
      countQuery += ' AND estado = ?';
      countParams.push(status);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    const totalQuotes = countResult[0].total;
    
    // Formatear cotizaciones
    const formattedQuotes = quotes.map(quote => ({
      id: quote.id,
      numeroConsecutivo: quote.numero_cotizacion,
      tipoServicio: quote.tipo_servicio,
      descripcion: quote.descripcion,
      estado: quote.estado,
      subtotal: parseFloat(quote.subtotal) || 0,
      descuento: parseFloat(quote.descuento) || 0,
      iva: parseFloat(quote.iva) || 0,
      total: parseFloat(quote.total) || 0,
      fechaEmision: quote.fecha_emision,
      fechaVencimiento: quote.fecha_vencimiento,
      condicionesPago: quote.condiciones_pago,
      notas: quote.notas,
      createdAt: quote.created_at,
      updatedAt: quote.updated_at,
      // Campos de cliente
      nombreProspecto: quote.nombre_prospecto,
      emailProspecto: quote.email_prospecto,
      telefonoProspecto: quote.telefono_prospecto,
      empresaProspecto: quote.empresa_prospecto
    }));
    
    res.json({
      success: true,
      data: formattedQuotes,
      pagination: {
        total: totalQuotes,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(totalQuotes / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener cotizaciones del cliente:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener cotizaciones del cliente',
      error: error.message 
    });
  }
};

// Actualizar estado de cotización por parte del cliente
const updateClientQuoteStatus = async (req, res) => {
  try {
    const clientId = req.user.id;
    const quoteId = req.params.id;
    const { status, notas } = req.body;
    
    // Validar estados permitidos para clientes
    const allowedStatuses = ['aceptada', 'rechazada'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido. Los clientes solo pueden aceptar o rechazar cotizaciones.'
      });
    }
    
    // Obtener email del cliente
    const [userInfo] = await pool.execute('SELECT email FROM usuarios WHERE id = ?', [clientId]);
    
    if (userInfo.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Cliente no encontrado' 
      });
    }
    
    const clientEmail = userInfo[0].email;
    
    // Verificar que la cotización pertenece al cliente y está en estado válido para cambio
    const [quote] = await pool.execute(
      'SELECT id, estado, email_prospecto FROM cotizaciones WHERE id = ? AND email_prospecto = ?',
      [quoteId, clientEmail]
    );
    
    if (quote.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cotización no encontrada o no pertenece al cliente'
      });
    }
    
    const currentQuote = quote[0];
    
    // Verificar que la cotización esté en estado "enviada" para poder ser modificada
    if (currentQuote.estado !== 'enviada') {
      return res.status(400).json({
        success: false,
        message: `No se puede modificar una cotización en estado "${currentQuote.estado}"`
      });
    }
    
    // Actualizar la cotización
    const updateQuery = `
      UPDATE cotizaciones 
      SET estado = ?, notas = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND email_prospecto = ?
    `;
    
    const updateParams = [status, notas || null, quoteId, clientEmail];
    
    const [result] = await pool.execute(updateQuery, updateParams);
    
    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo actualizar la cotización'
      });
    }
    
    // Si la cotización fue aceptada, crear notificación para el admin
    if (status === 'aceptada') {
      try {
        const notificationService = require('../services/notificationService');
        await notificationService.createAdminNotification(
          'cotizacion_aceptada',
          'Cotización Aceptada',
          `El cliente ha aceptado la cotización #${quoteId}`
        );
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
        // No fallar la operación principal por error de notificación
      }
    }
    
    res.json({
      success: true,
      message: `Cotización ${status === 'aceptada' ? 'aceptada' : 'rechazada'} exitosamente`,
      data: {
        id: quoteId,
        estado: status,
        notas: notas
      }
    });
  } catch (error) {
    console.error('Error al actualizar estado de cotización:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar estado de cotización',
      error: error.message 
    });
  }
};

// Obtener perfil del cliente
const getClientProfile = async (req, res) => {
  try {
    const clientId = req.user.id;
    
    const [user] = await pool.execute(
      'SELECT id, nombre, email, telefono, empresa, direccion, created_at, updated_at FROM usuarios WHERE id = ?',
      [clientId]
    );
    
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    const clientProfile = user[0];
    
    res.json({
      success: true,
      data: {
        id: clientProfile.id,
        nombre: clientProfile.nombre,
        email: clientProfile.email,
        telefono: clientProfile.telefono,
        empresa: clientProfile.empresa,
        direccion: clientProfile.direccion,
        fechaRegistro: clientProfile.created_at,
        ultimaActualizacion: clientProfile.updated_at
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil del cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil del cliente',
      error: error.message
    });
  }
};

// Actualizar perfil del cliente
const updateClientProfile = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { nombre, telefono, empresa, direccion } = req.body;
    
    // Validaciones básicas
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El nombre es obligatorio'
      });
    }
    
    // Actualizar perfil (sin email por seguridad)
    const [result] = await pool.execute(
      'UPDATE usuarios SET nombre = ?, telefono = ?, empresa = ?, direccion = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [nombre.trim(), telefono || null, empresa || null, direccion || null, clientId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    // Obtener datos actualizados
    const [updatedUser] = await pool.execute(
      'SELECT id, nombre, email, telefono, empresa, direccion, updated_at FROM usuarios WHERE id = ?',
      [clientId]
    );
    
    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        id: updatedUser[0].id,
        nombre: updatedUser[0].nombre,
        email: updatedUser[0].email,
        telefono: updatedUser[0].telefono,
        empresa: updatedUser[0].empresa,
        direccion: updatedUser[0].direccion,
        ultimaActualizacion: updatedUser[0].updated_at
      }
    });
  } catch (error) {
    console.error('Error al actualizar perfil del cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil del cliente',
      error: error.message
    });
  }
};

// Cambiar contraseña del cliente
const changeClientPassword = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Validaciones
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas no coinciden'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }
    
    // Obtener contraseña actual del usuario
    const [user] = await pool.execute(
      'SELECT password FROM usuarios WHERE id = ?',
      [clientId]
    );
    
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    // Verificar contraseña actual
    const bcrypt = require('bcrypt');
    const isValidPassword = await bcrypt.compare(currentPassword, user[0].password);
    
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }
    
    // Hashear nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizar contraseña
    const [result] = await pool.execute(
      'UPDATE usuarios SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedNewPassword, clientId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar la contraseña'
      });
    }
    
    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña del cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña del cliente',
      error: error.message
    });
  }
};

// Obtener pedidos del cliente
const getClientOrders = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { status, limit = 20, offset = 0 } = req.query;
    
    // Construir query con filtros opcionales
    let query = `
      SELECT 
        id,
        descripcion,
        estado,
        total,
        created_at as fecha_pedido,
        updated_at as fecha_entrega,
        'media' as prioridad,
        created_at,
        updated_at
      FROM pedidos 
      WHERE cliente_id = ?
    `;
    
    const queryParams = [clientId];
    
    // Filtrar por estado si se proporciona
    if (status) {
      query += ' AND estado = ?';
      queryParams.push(status);
    }
    
    // Ordenar por fecha de creación descendente
    query += ' ORDER BY created_at DESC';
    
    // Agregar límite y offset para paginación
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const [orders] = await pool.execute(query, queryParams);
    
    // Obtener total de pedidos para paginación
    let countQuery = 'SELECT COUNT(*) as total FROM pedidos WHERE cliente_id = ?';
    const countParams = [clientId];
    
    if (status) {
      countQuery += ' AND estado = ?';
      countParams.push(status);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    const totalOrders = countResult[0].total;
    
    // Formatear pedidos
    const formattedOrders = orders.map(order => ({
      id: order.id,
      descripcion: order.descripcion,
      estado: order.estado,
      total: parseFloat(order.total) || 0,
      fechaPedido: order.fecha_pedido,
      fechaEntrega: order.fecha_entrega,
      prioridad: order.prioridad || 'media',
      createdAt: order.created_at,
      updatedAt: order.updated_at
    }));
    
    res.json({
      success: true,
      data: formattedOrders,
      pagination: {
        total: totalOrders,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(totalOrders / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener pedidos del cliente:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener pedidos del cliente',
      error: error.message 
    });
  }
};

// Actualizar estado de pedido por parte del cliente (solo cancelar)
const updateClientOrderStatus = async (req, res) => {
  try {
    const clientId = req.user.id;
    const orderId = req.params.id;
    const { status, notas } = req.body;
    
    // Validar estados permitidos para clientes
    const allowedStatuses = ['cancelado', 'pausado', 'activo'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido. Los clientes solo pueden cancelar, pausar o reactivar pedidos.'
      });
    }
    
    // Verificar que el pedido pertenece al cliente
    const [order] = await pool.execute(
      'SELECT id, estado, cliente_id FROM pedidos WHERE id = ? AND cliente_id = ?',
      [orderId, clientId]
    );
    
    if (order.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado o no pertenece al cliente'
      });
    }
    
    const currentOrder = order[0];
    
    // Verificar que el pedido esté en estado válido para ser modificado
    const validStatesForChange = ['pendiente', 'en progreso', 'pausado', 'activo'];
    if (!validStatesForChange.includes(currentOrder.estado.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `No se puede modificar un pedido en estado "${currentOrder.estado}"`
      });
    }
    
    // Actualizar el pedido
    const updateQuery = `
      UPDATE pedidos 
      SET estado = ?, notas = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND cliente_id = ?
    `;
    
    const updateParams = [status, notas || null, orderId, clientId];
    
    const [result] = await pool.execute(updateQuery, updateParams);
    
    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo actualizar el pedido'
      });
    }
    
    // Crear notificación para el admin si el pedido fue cancelado
    if (status === 'cancelado') {
      try {
        const notificationService = require('../services/notificationService');
        await notificationService.createAdminNotification(
          'pedido_cancelado',
          'Pedido Cancelado',
          `El cliente ha cancelado el pedido #${orderId}`
        );
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
        // No fallar la operación principal por error de notificación
      }
    }
    
    res.json({
      success: true,
      message: `Pedido ${status} exitosamente`,
      data: {
        id: orderId,
        estado: status,
        notas: notas
      }
    });
  } catch (error) {
    console.error('Error al actualizar estado de pedido:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar estado de pedido',
      error: error.message 
    });
  }
};

module.exports = {
  getClientStats,
  getClientProjects,
  getClientPayments,
  getClientActivity,
  getClientQuotes,
  updateClientQuoteStatus,
  getClientProfile,
  updateClientProfile,
  changeClientPassword,
  getClientOrders,
  updateClientOrderStatus
};