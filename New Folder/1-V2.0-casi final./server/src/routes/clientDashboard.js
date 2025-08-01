const express = require('express');
const router = express.Router();
const { getClientStats, getClientProjects, getClientPayments, getClientActivity } = require('../controllers/clientDashboardController.js');
const { isAuthenticated } = require('../middleware/authMiddleware.js');

// Middleware para verificar que el usuario sea cliente
const clientOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'client') {
    return res.status(403).json({ message: 'Acceso denegado. Solo para clientes.' });
  }
  next();
};

// Todas las rutas requieren autenticación y rol de cliente
router.use(isAuthenticated);
router.use(clientOnly);

// GET /client/stats - Obtener estadísticas del cliente
router.get('/stats', getClientStats);

// GET /client/projects - Obtener proyectos del cliente
router.get('/projects', getClientProjects);

// GET /client/payments - Obtener pagos del cliente
router.get('/payments', getClientPayments);

// GET /client/activity - Obtener actividad reciente del cliente
router.get('/activity', getClientActivity);

module.exports = router;