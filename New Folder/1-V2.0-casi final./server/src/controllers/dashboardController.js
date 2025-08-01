const { pool } = require('../config/db.js');

// Obtener estadísticas del dashboard admin
const getAdminStats = async (req, res) => {
  try {
    // Obtener estadísticas básicas
    const statsQueries = await Promise.all([
      // Total de clientes
      pool.execute('SELECT COUNT(*) as total FROM usuarios WHERE rol != "admin"'),
      
      // Proyectos activos (pedidos en progreso)
      pool.execute('SELECT COUNT(*) as total FROM pedidos WHERE estado IN ("Pendiente", "En progreso")'),
      
      // Cotizaciones pendientes
      pool.execute('SELECT COUNT(*) as total FROM cotizaciones WHERE estado = "Pendiente"'),
      
      // Ingresos del mes actual
      pool.execute(`
        SELECT COALESCE(SUM(monto), 0) as total 
        FROM pagos 
        WHERE estado = 'Pagado' 
        AND MONTH(fecha_pago) = MONTH(CURRENT_DATE()) 
        AND YEAR(fecha_pago) = YEAR(CURRENT_DATE())
      `),
      
      // Proyectos completados
      pool.execute('SELECT COUNT(*) as total FROM pedidos WHERE estado = "Completado"'),
      
      // Pagos pendientes (monto total)
      pool.execute('SELECT COALESCE(SUM(monto), 0) as total FROM pagos WHERE estado = "Pendiente"'),
      
      // Nuevos clientes este mes
      pool.execute(`
        SELECT COUNT(*) as total 
        FROM usuarios 
        WHERE rol != "admin" 
        AND MONTH(created_at) = MONTH(CURRENT_DATE()) 
        AND YEAR(created_at) = YEAR(CURRENT_DATE())
      `),
      
      // Valor promedio de proyectos
      pool.execute('SELECT AVG(total) as promedio FROM pedidos WHERE total IS NOT NULL')
    ]);

    const [
      [totalClients],
      [activeProjects], 
      [pendingQuotes],
      [monthlyRevenue],
      [completedProjects],
      [pendingPayments],
      [newClientsThisMonth],
      [avgProjectValue]
    ] = statsQueries;

    const stats = {
      totalClients: totalClients[0].total,
      activeProjects: activeProjects[0].total,
      pendingQuotes: pendingQuotes[0].total,
      monthlyRevenue: parseFloat(monthlyRevenue[0].total) || 0,
      completedProjects: completedProjects[0].total,
      pendingPayments: parseFloat(pendingPayments[0].total) || 0,
      newClientsThisMonth: newClientsThisMonth[0].total,
      averageProjectValue: parseFloat(avgProjectValue[0].promedio) || 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del admin:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas',
      error: error.message 
    });
  }
};

// Obtener actividades recientes
const getRecentActivity = async (req, res) => {
  try {
    const [activities] = await pool.execute(`
      SELECT 
        a.id,
        a.tipo as type,
        a.descripcion as message,
        'normal' as priority,
        a.created_at as time
      FROM actividades a
      ORDER BY a.created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error al obtener actividades recientes:', error);
    res.status(500).json({ 
      message: 'Error al obtener actividades recientes',
      error: error.message 
    });
  }
};

// Obtener mejores clientes
const getTopClients = async (req, res) => {
  try {
    const [clients] = await pool.execute(`
      SELECT 
        c.id,
        c.nombre as name,
        c.email,
        COALESCE(SUM(p.monto), 0) as totalSpent,
        COUNT(DISTINCT pe.id) as projectsCount,
        CASE 
          WHEN COUNT(DISTINCT pe.id) > 0 AND SUM(CASE WHEN pe.estado IN ('Pendiente', 'En progreso') THEN 1 ELSE 0 END) > 0 
          THEN 'active'
          ELSE 'completed'
        END as status
      FROM usuarios c
      LEFT JOIN pagos p ON c.id = p.cliente_id AND p.estado = 'Pagado'
      LEFT JOIN pedidos pe ON c.id = pe.cliente_id
      WHERE c.rol != 'admin'
      GROUP BY c.id, c.nombre, c.email
      HAVING COUNT(DISTINCT pe.id) > 0 OR SUM(p.monto) > 0
      ORDER BY totalSpent DESC, projectsCount DESC
      LIMIT 10
    `);

    // Convertir valores a números
    const formattedClients = clients.map(client => ({
      ...client,
      totalSpent: parseFloat(client.totalSpent) || 0,
      projectsCount: parseInt(client.projectsCount) || 0
    }));

    res.json({
      success: true,
      data: formattedClients
    });
  } catch (error) {
    console.error('Error al obtener mejores clientes:', error);
    res.status(500).json({ 
      message: 'Error al obtener mejores clientes',
      error: error.message 
    });
  }
};

// Función helper para registrar actividades
const logActivity = async (tipo, descripcion, usuarioId = null, entidadId = null, entidadTipo = null) => {
  try {
    await pool.execute(`
      INSERT INTO actividades (usuario_id, tipo, descripcion, entidad_tipo, entidad_id)
      VALUES (?, ?, ?, ?, ?)
    `, [usuarioId, tipo, descripcion, entidadTipo, entidadId]);
  } catch (error) {
    console.error('Error al registrar actividad:', error);
  }
};

module.exports = {
  getAdminStats,
  getRecentActivity,
  getTopClients,
  logActivity
};