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
        WHERE email = (SELECT email FROM usuarios WHERE id = ?)
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
        fecha_pedido as date,
        fecha_entrega as deliveryDate,
        prioridad as priority
      FROM pedidos 
      WHERE cliente_id = ?
      ORDER BY fecha_pedido DESC
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
        p.fecha_pago as date,
        p.estado as status,
        p.metodo_pago as method,
        pe.descripcion as projectName
      FROM pagos p
      LEFT JOIN pedidos pe ON p.pedido_id = pe.id
      WHERE p.cliente_id = ?
      ORDER BY p.fecha_pago DESC
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
        fecha_pedido as time,
        'normal' as priority
      FROM pedidos 
      WHERE cliente_id = ?
      ORDER BY fecha_pedido DESC
      LIMIT 5
    `, [clientId]);

    // Actividades de pagos
    const [paymentActivities] = await pool.execute(`
      SELECT 
        'payment' as type,
        CONCAT('Pago de $', FORMAT(monto, 2), ' - ', concepto, ' (', estado, ')') as message,
        fecha_pago as time,
        CASE 
          WHEN estado = 'Pagado' THEN 'normal'
          WHEN estado = 'Vencido' THEN 'alta'
          ELSE 'baja'
        END as priority
      FROM pagos 
      WHERE cliente_id = ?
      ORDER BY fecha_pago DESC
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

module.exports = {
  getClientStats,
  getClientProjects,
  getClientPayments,
  getClientActivity
};