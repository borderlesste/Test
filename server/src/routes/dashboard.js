const express = require('express');
const router = express.Router();
const { getAdminStats, getRecentActivity, getTopClients } = require('../controllers/dashboardController.js');
const { isAuthenticated } = require('../middleware/authMiddleware.js');

// Middleware para verificar que el usuario sea admin
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Solo para administradores.' });
  }
  next();
};

// Todas las rutas requieren autenticación y rol de admin
router.use(isAuthenticated);
router.use(adminOnly);

// GET /admin/stats - Obtener estadísticas del dashboard
router.get('/stats', getAdminStats);

// GET /admin/recent-activity - Obtener actividades recientes
router.get('/recent-activity', getRecentActivity);

// GET /admin/top-clients - Obtener mejores clientes
router.get('/top-clients', getTopClients);

module.exports = router;