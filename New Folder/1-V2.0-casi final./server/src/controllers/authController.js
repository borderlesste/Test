const { validationResult } = require('express-validator');
const { authService } = require('../services/authService.js');
const { logActivity } = require('./dashboardController.js');
const emailService = require('../services/emailService.js');
const notificationService = require('../services/notificationService.js');
const securityLogService = require('../services/securityLogService.js');

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { user } = await authService.registerUser(req.body);
    
    // Crear sesión automáticamente después del registro
    req.session.userId = user.id;
    req.session.userRole = user.rol;
    req.session.userEmail = user.email;
    req.session.userName = user.nombre;
    
    // Registrar actividad de nuevo cliente (solo si no es admin)
    if (user.rol !== 'admin') {
      await logActivity(
        'new_client',
        `Nuevo cliente registrado: ${user.nombre}`,
        user.id,
        user.id,
        'cliente'
      );

      // Enviar email de bienvenida (no bloquear si falla)
      emailService.sendWelcomeEmail({ nombre: user.nombre, email: user.email })
        .then(result => {
          if (result.success) {
            console.log('✅ Email de bienvenida enviado a:', user.email);
          } else {
            console.log('⚠️ Fallo enviando email de bienvenida:', result.error);
          }
        })
        .catch(err => {
          console.log('⚠️ Error enviando email de bienvenida:', err.message);
        });

      // Crear notificación de nuevo cliente
      try {
        await notificationService.notifyNewClient({
          nombre: user.nombre,
          email: user.email
        });
      } catch (notificationError) {
        console.log('⚠️ Error creando notificación de nuevo cliente:', notificationError);
      }
    }
    
    res.status(201).json({
      message: 'Registrado',
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
      sessionId: req.session.id
    });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const ip = securityLogService.constructor.extractIP(req);
  const userAgent = securityLogService.constructor.extractUserAgent(req);
  const { email } = req.body;

  try {
    // Verificar si la cuenta está bloqueada
    const isLocked = await securityLogService.isAccountLocked(email);
    if (isLocked) {
      await securityLogService.logFailedLogin(email, ip, userAgent, 'cuenta_bloqueada');
      return res.status(423).json({ message: 'Cuenta bloqueada por intentos fallidos. Contacte al administrador.' });
    }

    const { user } = await authService.loginUser(req.body);
    
    // Crear sesión en lugar de JWT
    req.session.userId = user.id;
    req.session.userRole = user.rol;
    req.session.userEmail = user.email;
    req.session.userName = user.nombre;
    
    // Registrar actividad de login
    await logActivity(
      'login',
      `Usuario ${user.nombre} ha iniciado sesión`,
      user.id,
      user.id,
      user.rol
    );

    // Registrar login exitoso en log de seguridad
    await securityLogService.logSuccessfulLogin(
      user.id,
      user.email,
      ip,
      userAgent,
      { rol: user.rol, session_id: req.session.id }
    );
    
    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
      sessionId: req.session.id
    });
  } catch (err) {
    // Registrar login fallido en log de seguridad
    await securityLogService.logFailedLogin(email, ip, userAgent, 'credenciales_invalidas');
    
    // Verificar si necesitamos bloquear la cuenta
    const failedAttempts = await securityLogService.getRecentFailedAttempts(email, 15);
    if (failedAttempts >= 5) {
      // Buscar usuario para obtener ID
      try {
        const { pool } = require('../config/db.js');
        const [userRows] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        const userId = userRows.length > 0 ? userRows[0].id : null;
        
        await securityLogService.logAccountLockout(userId, email, ip, userAgent, 'intentos_fallidos_excedidos');
      } catch (lockError) {
        console.error('Error bloqueando cuenta:', lockError);
      }
      
      return res.status(423).json({ message: 'Cuenta bloqueada por múltiples intentos fallidos.' });
    }
    
    res.status(401).json({ message: err.message });
  }
};

exports.logout = async (req, res) => {
  const ip = securityLogService.constructor.extractIP(req);
  const userAgent = securityLogService.constructor.extractUserAgent(req);
  
  try {
    if (req.session.userId) {
      // Registrar actividad de logout
      await logActivity(
        'logout',
        `Usuario ${req.session.userName} cerró sesión`,
        req.session.userId,
        req.session.userId,
        req.session.userRole
      );

      // Registrar logout en log de seguridad
      await securityLogService.logLogout(
        req.session.userId,
        req.session.userEmail,
        ip,
        userAgent
      );
    }
    
    // Destruir la sesión
    req.session.destroy((err) => {
      if (err) {
        console.error('Error al destruir sesión:', err);
        return res.status(500).json({ message: 'Error al cerrar sesión' });
      }
      
      // Limpiar cookie
      res.clearCookie('sid');
      res.json({ message: 'Sesión cerrada exitosamente' });
    });
  } catch (err) {
    console.error('Error during logout:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const ip = securityLogService.constructor.extractIP(req);
  const userAgent = securityLogService.constructor.extractUserAgent(req);

  try {
    await authService.changeUserPassword({ ...req.body, userId: req.user.id });
    
    // Registrar cambio de contraseña en log de seguridad
    await securityLogService.logPasswordChange(
      req.user.id,
      req.user.email,
      ip,
      userAgent,
      'cambio_voluntario'
    );
    
    res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await authService.getUserProfile(req.user.id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await authService.updateUserProfile({ ...req.body, userId: req.user.id });
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
}

exports.getUsers = async (req, res) => {
  try {
    const users = await authService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios.' });
  }
};

