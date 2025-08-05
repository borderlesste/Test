
// src/api/axios.js
import axios from 'axios';


// Solo agrega baseURL si realmente necesitas hacer peticiones al backend
// Para la landing, los componentes que no requieran backend no deben importar ni usar este archivo
// Si algún componente lo importa pero no lo usa, no habrá problema
// Si quieres que axios nunca haga peticiones automáticas, asegúrate de que solo se use en handlers (onSubmit, etc.)

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://saas-backend-33g1.onrender.com',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor para logging y modificaciones de request
api.interceptors.request.use(
  (config) => {
    // Agregar timestamp a requests para debugging
    config.metadata = { startTime: new Date() };
    
    // Log request en modo desarrollo
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor para manejo de errores y logging
api.interceptors.response.use(
  (response) => {
    // Calcular tiempo de respuesta
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    
    // Log response en modo desarrollo
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, response.data);
    }
    
    return response;
  },
  (error) => {
    // Calcular tiempo de respuesta para errores
    let duration = 'unknown';
    if (error.config?.metadata?.startTime) {
      const endTime = new Date();
      duration = endTime - error.config.metadata.startTime;
    }
    
    // Log error - pero no para errores 401 en auth/profile (es normal)
    const isAuthProfileCheck = error.config?.url?.includes('/api/auth/profile') && error.response?.status === 401;
    if (!isAuthProfileCheck) {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase() || 'UNKNOWN'} ${error.config?.url || 'UNKNOWN'} (${duration}ms)`, error);
    }
    
    // Manejo específico de errores
    const errorMessage = getErrorMessage(error);
    const enhancedError = {
      ...error,
      userMessage: errorMessage,
      statusCode: error.response?.status,
      duration: duration
    };
    
    // Mostrar toast automático para ciertos errores (si toast está disponible)
    if (typeof window !== 'undefined' && window.showToast) {
      if (error.response?.status >= 500) {
        window.showToast({
          type: 'error',
          message: 'Error del servidor. Intenta de nuevo más tarde.',
          duration: 5000
        });
      } else if (error.response?.status === 401) {
        window.showToast({
          type: 'warning',
          message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
          duration: 5000
        });
      } else if (error.response?.status === 403) {
        window.showToast({
          type: 'error',
          message: 'No tienes permisos para realizar esta acción.',
          duration: 5000
        });
      } else if (error.response?.status === 429) {
        window.showToast({
          type: 'warning',
          message: 'Demasiadas solicitudes. Intenta de nuevo en unos momentos.',
          duration: 5000
        });
      }
    }
    
    return Promise.reject(enhancedError);
  }
);

// Función para extraer mensajes de error user-friendly
const getErrorMessage = (error) => {
  // Error de red
  if (error.code === 'NETWORK_ERROR' || !error.response) {
    return 'Error de conexión. Verifica tu conexión a internet.';
  }
  
  // Error de timeout
  if (error.code === 'ECONNABORTED') {
    return 'La solicitud tardó demasiado. Intenta de nuevo.';
  }
  
  // Errores con respuesta del servidor
  if (error.response) {
    const { status, data } = error.response;
    
    // Mensaje específico del servidor
    if (data?.message) {
      return data.message;
    }
    
    // Mensajes por código de estado
    switch (status) {
      case 400:
        return 'Datos de entrada inválidos.';
      case 401:
        return 'No autorizado. Inicia sesión nuevamente.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 409:
        return 'Conflicto con el estado actual del recurso.';
      case 422:
        return 'Los datos proporcionados no son válidos.';
      case 429:
        return 'Demasiadas solicitudes. Intenta más tarde.';
      case 500:
        return 'Error interno del servidor.';
      case 502:
        return 'Servidor no disponible temporalmente.';
      case 503:
        return 'Servicio no disponible.';
      default:
        return `Error del servidor (${status}).`;
    }
  }
  
  return 'Ha ocurrido un error inesperado.';
};

// Con sesiones basadas en cookies, no necesitamos el interceptor de tokens
// Las cookies se envían automáticamente con withCredentials: true

// --- User Management ---
export const getUsers = () => api.get('/api/users');
export const getUser = (id) => api.get(`/api/users/${id}`);
export const createUser = (userData) => api.post('/api/users', userData);
export const updateUser = (id, userData) => api.put(`/api/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/api/users/${id}`);

// --- Auth Management ---
export const changePassword = (passwords) => api.post('/api/auth/change-password', passwords);

// --- Order Management (Pedidos) ---
export const getOrders = () => api.get('/api/orders');
export const getOrder = (id) => api.get(`/api/orders/${id}`);
export const createOrder = (orderData) => api.post('/api/orders', orderData);
export const updateOrder = (id, orderData) => api.put(`/api/orders/${id}`, orderData);
export const deleteOrder = (id) => api.delete(`/api/orders/${id}`);
export const updateOrderStatus = (id, status) => api.put(`/api/orders/${id}/status`, { estado: status });
export const getOrderItems = (orderId) => api.get(`/api/orders/${orderId}/items`);

// --- Payment Management (Pagos) ---
export const getPayments = () => api.get('/api/payments');
export const getPayment = (id) => api.get(`/api/payments/${id}`);
export const createAdminPayment = (paymentData) => api.post('/api/payments', paymentData);
export const updateAdminPayment = (id, paymentData) => api.put(`/api/payments/${id}`, paymentData);
export const deletePayment = (id) => api.delete(`/api/payments/${id}`);
export const updatePaymentStatus = (id, status) => api.put(`/api/payments/${id}/status`, { estado: status });

// --- Client-specific Payment Routes ---
export const createClientPayment = (paymentData) => api.post('/api/client-payments', paymentData);
export const updateClientPayment = (id, paymentData) => api.put(`/api/client-payments/${id}`, paymentData);

// --- Payment Applications (Aplicación de Pagos) ---
export const applyPaymentToInvoice = (paymentId, invoiceId, amount) => api.post('/api/payments/apply', { 
  pago_id: paymentId, 
  factura_id: invoiceId, 
  monto_aplicado: amount 
});
export const getPaymentApplications = (paymentId) => api.get(`/api/payments/${paymentId}/applications`);


// --- Config Management ---
export const getConfig = () => api.get('/api/config');
export const updateConfig = (configData) => api.put('/api/config', configData);

// --- Quotes Management (Cotizaciones) ---
export const getQuotes = () => api.get('/api/quotes');
export const getQuote = (id) => api.get(`/api/quotes/${id}`);
export const createQuote = (quoteData) => api.post('/api/quotes', quoteData);
export const updateQuote = (id, quoteData) => api.put(`/api/quotes/${id}`, quoteData);
export const deleteQuote = (id) => api.delete(`/api/quotes/${id}`);
export const updateQuoteStatus = (id, status) => api.put(`/api/quotes/${id}/status`, { estado: status });
export const convertQuoteToOrder = (id) => api.post(`/api/quotes/${id}/convert`);
export const getQuoteItems = (quoteId) => api.get(`/api/quotes/${quoteId}/items`);


// --- Auth Management (additional) ---
export const login = (credentials) => api.post('/api/auth/login', credentials);
export const register = (userData) => api.post('/api/auth/register', userData);
export const getProfile = () => api.get('/api/auth/profile');
export const updateProfile = (profileData) => api.put('/api/auth/profile', profileData);

// --- Client Dashboard Management ---
export const getClientStats = () => api.get('/api/client/stats');
export const getClientProjects = () => api.get('/api/client/projects');
export const getClientPayments = () => api.get('/api/client/payments');
export const getClientActivity = () => api.get('/api/client/activity');

// --- Client Quotes Management ---
export const getClientQuotes = (params = {}) => api.get('/api/client/quotes', { params });
export const updateClientQuoteStatus = (id, data) => api.put(`/api/client/quotes/${id}/status`, data);

// --- Client Profile Management ---
export const getClientProfile = () => api.get('/api/client/profile');
export const updateClientProfile = (data) => api.put('/api/client/profile', data);
export const changeClientPassword = (data) => api.put('/api/client/change-password', data);

// --- Client Orders Management ---
export const getClientOrders = (params = {}) => api.get('/api/client/orders', { params });
export const updateClientOrderStatus = (id, data) => api.put(`/api/client/orders/${id}/status`, data);

// --- Admin Dashboard Management ---
export const getAdminStats = () => api.get('/api/admin/stats');
export const getRecentActivity = () => api.get('/api/admin/recent-activity');
export const getTopClients = () => api.get('/api/admin/top-clients');
export const getChartsData = (period = 'month') => api.get(`/api/admin/charts?period=${period}`);
export const getFinancialSummary = () => api.get('/api/admin/financial-summary');

// --- Projects Management ---
export const getProjects = () => api.get('/api/projects');
export const getProject = (id) => api.get(`/api/projects/${id}`);
export const uploadProjectImage = (formData) => api.post('/api/projects/upload-image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const uploadProjectGallery = (projectId, formData) => api.post(`/api/projects/${projectId}/gallery`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getProjectGallery = (projectId) => api.get(`/api/projects/${projectId}/gallery`);
export const deleteProjectImage = (imageId) => api.delete(`/api/projects/images/${imageId}`);
export const createProject = (projectData) => api.post('/api/projects', projectData);
export const updateProject = (id, projectData) => api.put(`/api/projects/${id}`, projectData);
export const deleteProject = (id) => api.delete(`/api/projects/${id}`);
export const updateProjectStatus = (id, status) => api.put(`/api/projects/${id}/status`, { estado: status });

// --- Services Management ---
export const getServices = () => api.get('/api/services');
export const getService = (id) => api.get(`/api/services/${id}`);
export const createService = (serviceData) => api.post('/api/services', serviceData);
export const updateService = (id, serviceData) => api.put(`/api/services/${id}`, serviceData);
export const deleteService = (id) => api.delete(`/api/services/${id}`);

// --- Configuration Management ---
export const getGeneralConfig = () => api.get('/api/config/general');
export const updateGeneralConfig = (configData) => api.put('/api/config/general', configData);
export const getPaymentConfig = () => api.get('/api/config/payments');
export const updatePaymentConfig = (configData) => api.put('/api/config/payments', configData);
export const getNotificationConfig = () => api.get('/api/config/notifications');
export const updateNotificationConfig = (configData) => api.put('/api/config/notifications', configData);
export const getSecurityConfig = () => api.get('/api/config/security');
export const updateSecurityConfig = (configData) => api.put('/api/config/security', configData);

// --- Monthly Statistics ---
export const getMonthlyStats = (year, month) => api.get(`/api/stats/monthly?year=${year}&month=${month}`);
export const getAllMonthlyStats = () => api.get('/api/stats/monthly');

// --- Activities Log ---
export const getActivities = () => api.get('/api/activities');
export const getActivityById = (id) => api.get(`/api/activities/${id}`);

// --- Security Log ---
export const getSecurityLog = () => api.get('/api/security/log');
export const getSecurityStats = () => api.get('/api/security/stats');

// --- Sessions Management ---
export const getActiveSessions = () => api.get('/api/sessions');
export const terminateSession = (id) => api.delete(`/api/sessions/${id}`);
export const terminateAllSessions = () => api.delete('/api/sessions/all');

// --- Dashboard Widgets ---
export const getDashboardWidgets = () => api.get('/api/dashboard/widgets');
export const updateDashboardWidget = (id, widgetData) => api.put(`/api/dashboard/widgets/${id}`, widgetData);
export const createDashboardWidget = (widgetData) => api.post('/api/dashboard/widgets', widgetData);
export const deleteDashboardWidget = (id) => api.delete(`/api/dashboard/widgets/${id}`);

// --- Integrations Management ---
export const getIntegrations = () => api.get('/api/integrations');
export const getIntegration = (id) => api.get(`/api/integrations/${id}`);
export const updateIntegration = (id, integrationData) => api.put(`/api/integrations/${id}`, integrationData);
export const testIntegration = (id) => api.post(`/api/integrations/${id}/test`);

// --- Webhooks Management ---
export const getWebhooks = () => api.get('/api/webhooks');
export const getWebhook = (id) => api.get(`/api/webhooks/${id}`);
export const createWebhook = (webhookData) => api.post('/api/webhooks', webhookData);
export const updateWebhook = (id, webhookData) => api.put(`/api/webhooks/${id}`, webhookData);
export const deleteWebhook = (id) => api.delete(`/api/webhooks/${id}`);
export const getWebhookLogs = (webhookId) => api.get(`/api/webhooks/${webhookId}/logs`);

// --- Messages Management ---
export const getMessages = () => api.get('/api/messages');
export const getMessage = (id) => api.get(`/api/messages/${id}`);
export const createMessage = (messageData) => api.post('/api/messages', messageData);
export const updateMessage = (id, messageData) => api.put(`/api/messages/${id}`, messageData);
export const markMessageAsRead = (id) => api.put(`/api/messages/${id}/read`);
export const deleteMessage = (id) => api.delete(`/api/messages/${id}`);

// --- Email Campaigns Management ---
export const getEmailCampaigns = () => api.get('/api/email-campaigns');
export const getEmailCampaign = (id) => api.get(`/api/email-campaigns/${id}`);
export const createEmailCampaign = (campaignData) => api.post('/api/email-campaigns', campaignData);
export const updateEmailCampaign = (id, campaignData) => api.put(`/api/email-campaigns/${id}`, campaignData);
export const deleteEmailCampaign = (id) => api.delete(`/api/email-campaigns/${id}`);
export const sendEmailCampaign = (id) => api.post(`/api/email-campaigns/${id}/send`);

// --- Invoices Management (Facturas) ---
export const getInvoices = (params = {}) => api.get('/api/invoices', { params });
export const getInvoice = (id) => api.get(`/api/invoices/${id}`);
export const createInvoice = (invoiceData) => api.post('/api/invoices', invoiceData);
export const updateInvoice = (id, invoiceData) => api.put(`/api/invoices/${id}`, invoiceData);
export const deleteInvoice = (id) => api.delete(`/api/invoices/${id}`);
export const updateInvoiceStatus = (id, statusData) => api.put(`/api/invoices/${id}/status`, statusData);
export const generateInvoiceFromQuotation = (quotationData) => api.post('/api/invoices/generate-from-quotation', quotationData);
export const getInvoiceStats = () => api.get('/api/invoices/stats');
export const generateInvoiceFromPayment = (paymentId) => api.post('/api/invoices/generate-from-payment', { pago_id: paymentId });
export const updateOverdueInvoices = () => api.post('/api/invoices/update-overdue');
export const getInvoiceItems = (invoiceId) => api.get(`/api/invoices/${invoiceId}/items`);
export const generateInvoiceFromOrder = (orderId) => api.post('/api/invoices/generate-from-order', { pedido_id: orderId });

// --- Notifications Management ---
export const getNotifications = () => api.get('/api/notifications');
export const getUnreadCount = () => api.get('/api/notifications/unread-count');
export const createNotification = (notificationData) => api.post('/api/notifications', notificationData);
export const markNotificationAsRead = (id) => api.put(`/api/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => api.put('/api/notifications/mark-all-read');
export const deleteNotification = (id) => api.delete(`/api/notifications/${id}`);

// --- Clients Management ---
export const getClients = (params = {}) => api.get('/api/clients', { params });
export const getClient = (id) => api.get(`/api/clients/${id}`);
export const createClient = (clientData) => api.post('/api/clients', clientData);
export const updateClient = (id, clientData) => api.put(`/api/clients/${id}`, clientData);
export const deleteClient = (id) => api.delete(`/api/clients/${id}`);
export const getAllClientsStats = () => api.get('/api/clients/stats');
export const sendMessageToClient = (id, messageData) => api.post(`/api/clients/${id}/message`, messageData);

// --- Quotations Management ---
export const getQuotations = (params = {}) => api.get('/api/quotations', { params });
export const getQuotation = (id) => api.get(`/api/quotations/${id}`);
export const createQuotation = (quotationData) => api.post('/api/quotations', quotationData);
export const updateQuotation = (id, quotationData) => api.put(`/api/quotations/${id}`, quotationData);
export const deleteQuotation = (id) => api.delete(`/api/quotations/${id}`);
export const updateQuotationStatus = (id, statusData) => api.put(`/api/quotations/${id}/status`, statusData);
export const convertQuotationToProject = (id) => api.post(`/api/quotations/${id}/convert`);
export const getQuotationStats = () => api.get('/api/quotations/stats');

// --- Database Update (temporary) ---
export const updateDatabaseForClients = () => api.post('/api/db-update/update-for-clients');
export const createSampleClients = () => api.post('/api/db-update/create-sample-clients');

export default api;
