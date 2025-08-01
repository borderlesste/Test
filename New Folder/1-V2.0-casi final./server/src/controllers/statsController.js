// server/src/controllers/statsController.js
const { pool } = require('../config/db.js');

// Obtener estadísticas históricas mensuales
const getMonthlyStats = async (req, res) => {
  try {
    const { months = 6, year } = req.query;
    
    let query = `
      SELECT 
        year,
        month,
        revenue,
        new_clients,
        active_projects,
        completed_projects,
        pending_quotes,
        total_orders,
        created_at
      FROM monthly_stats 
    `;
    
    const params = [];
    
    if (year) {
      query += ' WHERE year = ?';
      params.push(parseInt(year));
    }
    
    query += ' ORDER BY year DESC, month DESC';
    
    if (months && !year) {
      query += ' LIMIT ?';
      params.push(parseInt(months));
    }
    
    const [rows] = await pool.execute(query, params);
    
    // Formatear datos para los gráficos
    const formattedData = rows.reverse().map(row => ({
      year: row.year,
      month: row.month,
      monthName: new Date(row.year, row.month - 1).toLocaleDateString('es-ES', { month: 'short' }),
      revenue: parseFloat(row.revenue),
      newClients: row.new_clients,
      activeProjects: row.active_projects,
      completedProjects: row.completed_projects,
      pendingQuotes: row.pending_quotes,
      totalOrders: row.total_orders,
      date: row.created_at
    }));
    
    res.json({
      success: true,
      data: formattedData,
      total: formattedData.length
    });
  } catch (error) {
    console.error('Error al obtener estadísticas mensuales:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de crecimiento acumulado
const getGrowthStats = async (req, res) => {
  try {
    const { months = 12 } = req.query;
    
    const [rows] = await pool.execute(`
      SELECT 
        year,
        month,
        revenue,
        new_clients,
        active_projects,
        completed_projects,
        (
          SELECT SUM(new_clients) 
          FROM monthly_stats ms2 
          WHERE (ms2.year < ms1.year) 
             OR (ms2.year = ms1.year AND ms2.month <= ms1.month)
        ) as accumulated_clients,
        (
          SELECT SUM(revenue) 
          FROM monthly_stats ms3 
          WHERE ms3.year = ms1.year AND ms3.month <= ms1.month
        ) as yearly_revenue
      FROM monthly_stats ms1
      ORDER BY year DESC, month DESC
      LIMIT ?
    `, [parseInt(months)]);
    
    const formattedData = rows.reverse().map(row => ({
      year: row.year,
      month: row.month,
      monthName: new Date(row.year, row.month - 1).toLocaleDateString('es-ES', { month: 'short' }),
      revenue: parseFloat(row.revenue),
      newClients: row.new_clients,
      accumulatedClients: row.accumulated_clients || 0,
      yearlyRevenue: parseFloat(row.yearly_revenue || 0),
      activeProjects: row.active_projects,
      completedProjects: row.completed_projects
    }));
    
    res.json({
      success: true,
      data: formattedData,
      total: formattedData.length
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de crecimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener resumen de estadísticas por año
const getYearlyStats = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        year,
        SUM(revenue) as total_revenue,
        SUM(new_clients) as total_new_clients,
        AVG(active_projects) as avg_active_projects,
        SUM(completed_projects) as total_completed_projects,
        SUM(pending_quotes) as total_pending_quotes,
        SUM(total_orders) as total_orders,
        COUNT(*) as months_recorded
      FROM monthly_stats
      GROUP BY year
      ORDER BY year DESC
    `);
    
    const formattedData = rows.map(row => ({
      year: row.year,
      totalRevenue: parseFloat(row.total_revenue),
      totalNewClients: row.total_new_clients,
      avgActiveProjects: Math.round(row.avg_active_projects),
      totalCompletedProjects: row.total_completed_projects,
      totalPendingQuotes: row.total_pending_quotes,
      totalOrders: row.total_orders,
      monthsRecorded: row.months_recorded,
      avgMonthlyRevenue: parseFloat(row.total_revenue) / row.months_recorded
    }));
    
    res.json({
      success: true,
      data: formattedData,
      total: formattedData.length
    });
  } catch (error) {
    console.error('Error al obtener estadísticas anuales:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear o actualizar estadísticas de un mes específico
const updateMonthlyStats = async (req, res) => {
  try {
    const { year, month, revenue, newClients, activeProjects, completedProjects, pendingQuotes, totalOrders } = req.body;
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Año y mes son requeridos'
      });
    }
    
    const [result] = await pool.execute(`
      INSERT INTO monthly_stats (year, month, revenue, new_clients, active_projects, completed_projects, pending_quotes, total_orders)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        revenue = VALUES(revenue),
        new_clients = VALUES(new_clients),
        active_projects = VALUES(active_projects),
        completed_projects = VALUES(completed_projects),
        pending_quotes = VALUES(pending_quotes),
        total_orders = VALUES(total_orders),
        updated_at = CURRENT_TIMESTAMP
    `, [
      year, 
      month, 
      revenue || 0, 
      newClients || 0, 
      activeProjects || 0, 
      completedProjects || 0, 
      pendingQuotes || 0, 
      totalOrders || 0
    ]);
    
    res.json({
      success: true,
      message: 'Estadísticas actualizadas exitosamente',
      data: {
        year,
        month,
        revenue: revenue || 0,
        newClients: newClients || 0,
        activeProjects: activeProjects || 0,
        completedProjects: completedProjects || 0,
        pendingQuotes: pendingQuotes || 0,
        totalOrders: totalOrders || 0
      }
    });
  } catch (error) {
    console.error('Error al actualizar estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener comparación entre períodos
const getComparison = async (req, res) => {
  try {
    const { currentYear, currentMonth, compareYear, compareMonth } = req.query;
    
    if (!currentYear || !currentMonth || !compareYear || !compareMonth) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren los parámetros de ambos períodos para comparar'
      });
    }
    
    const [currentData] = await pool.execute(
      'SELECT * FROM monthly_stats WHERE year = ? AND month = ?',
      [parseInt(currentYear), parseInt(currentMonth)]
    );
    
    const [compareData] = await pool.execute(
      'SELECT * FROM monthly_stats WHERE year = ? AND month = ?',
      [parseInt(compareYear), parseInt(compareMonth)]
    );
    
    if (currentData.length === 0 || compareData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron datos para uno de los períodos especificados'
      });
    }
    
    const current = currentData[0];
    const compare = compareData[0];
    
    const comparison = {
      current: {
        period: `${current.year}-${current.month.toString().padStart(2, '0')}`,
        revenue: parseFloat(current.revenue),
        newClients: current.new_clients,
        activeProjects: current.active_projects,
        completedProjects: current.completed_projects
      },
      compare: {
        period: `${compare.year}-${compare.month.toString().padStart(2, '0')}`,
        revenue: parseFloat(compare.revenue),
        newClients: compare.new_clients,
        activeProjects: compare.active_projects,
        completedProjects: compare.completed_projects
      },
      changes: {
        revenueChange: parseFloat(current.revenue) - parseFloat(compare.revenue),
        revenuePercentage: ((parseFloat(current.revenue) - parseFloat(compare.revenue)) / parseFloat(compare.revenue) * 100).toFixed(2),
        clientsChange: current.new_clients - compare.new_clients,
        clientsPercentage: ((current.new_clients - compare.new_clients) / compare.new_clients * 100).toFixed(2),
        projectsChange: current.active_projects - compare.active_projects,
        projectsPercentage: ((current.active_projects - compare.active_projects) / compare.active_projects * 100).toFixed(2)
      }
    };
    
    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Error al obtener comparación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getMonthlyStats,
  getGrowthStats,
  getYearlyStats,
  updateMonthlyStats,
  getComparison
};