const express = require('express');
const { body } = require('express-validator');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getUnreadCount
} = require('../controllers/notificationsController.js');
const { isAuthenticated } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Get user notifications
router.get('/', isAuthenticated, getNotifications);

// Get unread count
router.get('/unread-count', isAuthenticated, getUnreadCount);

// Create notification
router.post('/', 
  isAuthenticated,
  [
    body('usuario_id').isInt().withMessage('Usuario ID debe ser un número'),
    body('tipo').notEmpty().withMessage('Tipo es requerido'),
    body('titulo').notEmpty().withMessage('Título es requerido'),
    body('mensaje').notEmpty().withMessage('Mensaje es requerido'),
    body('prioridad').optional().isIn(['baja', 'normal', 'alta', 'urgente']).withMessage('Prioridad inválida')
  ],
  createNotification
);

// Mark notification as read
router.put('/:id/read', isAuthenticated, markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', isAuthenticated, markAllAsRead);

// Delete notification
router.delete('/:id', isAuthenticated, deleteNotification);

module.exports = router;