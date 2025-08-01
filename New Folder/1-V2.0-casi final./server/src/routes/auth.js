const express = require('express');
const { body } = require('express-validator');
const { login, register, logout, getUsers, changePassword, getProfile, updateProfile } = require('../controllers/authController.js');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/register', [
    body('nombre', 'El nombre es obligatorio').not().isEmpty(),
    body('email', 'Por favor, incluye un email válido').isEmail(),
    body('password', 'La contraseña debe tener 6 o más caracteres').isLength({ min: 6 }),
    body('direccion', 'La dirección es obligatoria').not().isEmpty(),
    body('telefono', 'El teléfono es obligatorio').not().isEmpty(),
    body('empresa').optional(),
    body('rfc').optional()
], register);

router.post('/login', [
    body('email', 'Por favor, incluye un email válido').isEmail(),
    body('password', 'La contraseña es obligatoria').exists()
], login);

router.post('/logout', logout);

router.post('/change-password', [
    isAuthenticated,
    body('oldPassword', 'La contraseña antigua es obligatoria').exists(),
    body('newPassword', 'La nueva contraseña debe tener 6 o más caracteres').isLength({ min: 6 })
], changePassword);

router.get('/profile', isAuthenticated, getProfile);
router.put('/profile', isAuthenticated, updateProfile);

router.get('/users', isAuthenticated, isAdmin, getUsers);

module.exports = router;