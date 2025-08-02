const express = require('express');
const { body } = require('express-validator');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationsController.js');
const { isAuthenticated } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Get user notifications
router.get('/', isAuthenticated, getNotifications);

// Mark notification as read
router.put('/:id/read', isAuthenticated, markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', isAuthenticated, markAllAsRead);

// Delete notification
router.delete('/:id', isAuthenticated, deleteNotification);

module.exports = router;