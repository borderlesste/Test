// Utilidades de validación para los componentes del cliente

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePassword = (password) => {
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

export const validateProfileForm = (formData) => {
  const errors = {};
  
  // Validar nombre
  if (!formData.nombre || formData.nombre.trim().length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres';
  }
  
  if (formData.nombre && formData.nombre.length > 100) {
    errors.nombre = 'El nombre no puede exceder los 100 caracteres';
  }
  
  // Validar teléfono si se proporciona
  if (formData.telefono && !validatePhone(formData.telefono)) {
    errors.telefono = 'El formato del teléfono no es válido';
  }
  
  // Validar empresa si se proporciona
  if (formData.empresa && formData.empresa.length > 100) {
    errors.empresa = 'El nombre de la empresa no puede exceder los 100 caracteres';
  }
  
  // Validar dirección si se proporciona
  if (formData.direccion && formData.direccion.length > 500) {
    errors.direccion = 'La dirección no puede exceder los 500 caracteres';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validatePasswordChangeForm = (formData) => {
  const errors = {};
  
  // Validar contraseña actual
  if (!formData.currentPassword) {
    errors.currentPassword = 'La contraseña actual es obligatoria';
  }
  
  // Validar nueva contraseña
  const passwordValidation = validatePassword(formData.newPassword);
  if (!passwordValidation.isValid) {
    errors.newPassword = passwordValidation.errors.join(', ');
  }
  
  // Validar confirmación de contraseña
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Debes confirmar la nueva contraseña';
  } else if (formData.newPassword !== formData.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
  }
  
  // Verificar que la nueva contraseña sea diferente de la actual
  if (formData.currentPassword === formData.newPassword) {
    errors.newPassword = 'La nueva contraseña debe ser diferente de la actual';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .substring(0, 1000); // Limit length
};

export const validateNumericInput = (value, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Debe ser un número válido' };
  }
  
  if (num < min) {
    return { isValid: false, error: `El valor mínimo es ${min}` };
  }
  
  if (num > max) {
    return { isValid: false, error: `El valor máximo es ${max}` };
  }
  
  return { isValid: true };
};

export const formatCurrency = (amount) => {
  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  } catch (error) {
    return `$${(amount || 0).toFixed(2)}`;
  }
};

export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    return date.toLocaleDateString('es-MX', defaultOptions);
  } catch (error) {
    return 'Fecha inválida';
  }
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};