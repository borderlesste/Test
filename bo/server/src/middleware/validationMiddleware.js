const sanitizeHtml = require('sanitize-html');
const validator = require('validator');

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard'
  }).trim();
};

const validateEmail = (email) => {
  return validator.isEmail(email);
};

const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validatePhone = (phone) => {
  return validator.isMobilePhone(phone, 'any', { strictMode: false });
};

const validateProject = (projectData) => {
  const errors = {};
  
  if (!projectData.titulo || projectData.titulo.trim().length < 3) {
    errors.titulo = 'El título debe tener al menos 3 caracteres';
  }
  
  if (projectData.titulo && projectData.titulo.length > 200) {
    errors.titulo = 'El título no puede exceder los 200 caracteres';
  }
  
  if (!projectData.descripcion || projectData.descripcion.trim().length < 10) {
    errors.descripcion = 'La descripción debe tener al menos 10 caracteres';
  }
  
  if (projectData.descripcion && projectData.descripcion.length > 2000) {
    errors.descripcion = 'La descripción no puede exceder los 2000 caracteres';
  }
  
  if (!projectData.categoria || projectData.categoria.trim().length === 0) {
    errors.categoria = 'La categoría es obligatoria';
  }
  
  if (!projectData.estado || !['activo', 'pausado', 'completado', 'cancelado'].includes(projectData.estado)) {
    errors.estado = 'El estado debe ser uno de: activo, pausado, completado, cancelado';
  }
  
  if (projectData.presupuesto !== undefined && projectData.presupuesto !== null) {
    if (isNaN(projectData.presupuesto) || projectData.presupuesto < 0) {
      errors.presupuesto = 'El presupuesto debe ser un número positivo';
    }
    if (projectData.presupuesto > 10000000) {
      errors.presupuesto = 'El presupuesto no puede exceder los $10,000,000';
    }
  }
  
  if (projectData.fecha_inicio && !validator.isISO8601(projectData.fecha_inicio)) {
    errors.fecha_inicio = 'La fecha de inicio debe tener un formato válido';
  }
  
  if (projectData.fecha_fin && !validator.isISO8601(projectData.fecha_fin)) {
    errors.fecha_fin = 'La fecha de fin debe tener un formato válido';
  }
  
  if (projectData.fecha_inicio && projectData.fecha_fin) {
    const startDate = new Date(projectData.fecha_inicio);
    const endDate = new Date(projectData.fecha_fin);
    if (endDate <= startDate) {
      errors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const validateNotification = (notificationData) => {
  const errors = {};
  
  if (!notificationData.titulo || notificationData.titulo.trim().length < 3) {
    errors.titulo = 'El título debe tener al menos 3 caracteres';
  }
  
  if (notificationData.titulo && notificationData.titulo.length > 100) {
    errors.titulo = 'El título no puede exceder los 100 caracteres';
  }
  
  if (!notificationData.mensaje || notificationData.mensaje.trim().length < 5) {
    errors.mensaje = 'El mensaje debe tener al menos 5 caracteres';
  }
  
  if (notificationData.mensaje && notificationData.mensaje.length > 500) {
    errors.mensaje = 'El mensaje no puede exceder los 500 caracteres';
  }
  
  if (!notificationData.tipo || !['info', 'success', 'warning', 'error'].includes(notificationData.tipo)) {
    errors.tipo = 'El tipo debe ser uno de: info, success, warning, error';
  }
  
  if (!notificationData.prioridad || !['baja', 'normal', 'alta', 'urgente'].includes(notificationData.prioridad)) {
    errors.prioridad = 'La prioridad debe ser una de: baja, normal, alta, urgente';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const validateUser = (userData) => {
  const errors = {};
  
  if (!userData.nombre || userData.nombre.trim().length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres';
  }
  
  if (userData.nombre && userData.nombre.length > 100) {
    errors.nombre = 'El nombre no puede exceder los 100 caracteres';
  }
  
  if (!userData.email || !validateEmail(userData.email)) {
    errors.email = 'El email no tiene un formato válido';
  }
  
  if (userData.password) {
    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors.join(', ');
    }
  }
  
  if (userData.telefono && !validatePhone(userData.telefono)) {
    errors.telefono = 'El formato del teléfono no es válido';
  }
  
  if (userData.empresa && userData.empresa.length > 100) {
    errors.empresa = 'El nombre de la empresa no puede exceder los 100 caracteres';
  }
  
  if (userData.direccion && userData.direccion.length > 500) {
    errors.direccion = 'La dirección no puede exceder los 500 caracteres';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const sanitizeObjectInputs = (obj) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObjectInputs(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// Middleware de sanitización
const sanitizationMiddleware = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObjectInputs(req.body);
  }
  
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObjectInputs(req.query);
  }
  
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObjectInputs(req.params);
  }
  
  next();
};

// Middleware genérico de validación
const createValidationMiddleware = (validator) => {
  return (req, res, next) => {
    const validation = validator(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: validation.errors
      });
    }
    
    next();
  };
};

// Middlewares específicos de validación
const validateProjectMiddleware = createValidationMiddleware(validateProject);
const validateNotificationMiddleware = createValidationMiddleware(validateNotification);
const validateUserMiddleware = createValidationMiddleware(validateUser);

// Middleware de validación de login
const validateLoginMiddleware = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};
  
  if (!email || !validateEmail(email)) {
    errors.email = 'Email requerido y debe tener un formato válido';
  }
  
  if (!password || password.length < 6) {
    errors.password = 'Contraseña requerida con al menos 6 caracteres';
  }
  
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Datos de login inválidos',
      errors
    });
  }
  
  next();
};

// Middleware de rate limiting simple
const createRateLimitMiddleware = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(identifier)) {
      requests.set(identifier, []);
    }
    
    const userRequests = requests.get(identifier);
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
        retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
      });
    }
    
    validRequests.push(now);
    requests.set(identifier, validRequests);
    
    // Headers informativos
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': maxRequests - validRequests.length,
      'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
    });
    
    next();
  };
};

// Middleware de validación de archivos
const validateFileMiddleware = (options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    required = false
  } = options;
  
  return (req, res, next) => {
    if (!req.file && required) {
      return res.status(400).json({
        success: false,
        message: 'Archivo requerido'
      });
    }
    
    if (req.file) {
      if (req.file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `Archivo demasiado grande. Máximo ${Math.round(maxSize / 1024 / 1024)}MB permitido`
        });
      }
      
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `Tipo de archivo no permitido. Tipos aceptados: ${allowedMimeTypes.join(', ')}`
        });
      }
    }
    
    next();
  };
};

// Middleware de validación de ID
const validateIdMiddleware = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || !validator.isNumeric(id.toString()) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: `ID inválido: ${paramName} debe ser un número positivo`
      });
    }
    
    next();
  };
};

module.exports = {
  sanitizationMiddleware,
  validateProjectMiddleware,
  validateNotificationMiddleware,
  validateUserMiddleware,
  validateLoginMiddleware,
  createRateLimitMiddleware,
  validateFileMiddleware,
  validateIdMiddleware,
  createValidationMiddleware,
  
  // Funciones de validación exportadas para uso directo
  validateProject,
  validateNotification,
  validateUser,
  validateEmail,
  validatePassword,
  validatePhone,
  sanitizeInput,
  sanitizeObjectInputs
};