
// server/src/index.js
// Ruta base: monta todas las rutas del backend
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); // Importar path
const { pool } = require('./config/db.js'); // Importar el pool de conexión

const authRoutes = require('./routes/auth.js');
const ordersRoutes = require('./routes/orders.js');
const paymentsRoutes = require('./routes/payments.js');
const clientPaymentsRoutes = require('./routes/clientPayments.js');
const configRoutes = require('./routes/config.js');
const contactRoutes = require('./routes/contact.js');
const usersRoutes = require('./routes/users.js');
const quotesRoutes = require('./routes/quotes.js');
const notificationsRoutes = require('./routes/notifications.js');
const dashboardRoutes = require('./routes/dashboard.js');
const clientDashboardRoutes = require('./routes/clientDashboard.js');
const projectsRoutes = require('./routes/projects.js');
const statsRoutes = require('./routes/stats.js');
const invoicesRoutes = require('./routes/invoices.js');
const integrationsRoutes = require('./routes/integrations.js');
const securityRoutes = require('./routes/security.js');
const configurationRoutes = require('./routes/configuration.js');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// Configure trust proxy GLOBALLY for Render deployment
app.set('trust proxy', true);

// Opciones para el almacén de sesiones con configuración específica para Render
const sessionStore = new MySQLStore({
  expiration: 1000 * 60 * 60 * 24 * 7, // 7 días
  createDatabaseTable: false, // No crear tabla, ya existe
  clearExpired: true,
  checkExpirationInterval: 900000, // 15 minutos
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, pool.promise ? pool : pool.promise()); // Usar pool compatible

// Configuración CORS adaptable para desarrollo y producción
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origin (aplicaciones móviles, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const isProduction = process.env.NODE_ENV === 'production';
    
    const allowedOrigins = isProduction ? [
      'https://borderlesstechno.com',
      'https://www.borderlesstechno.com',
      'https://saas-backend-33g1.onrender.com'
    ] : [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174'
    ];
    
    // En desarrollo, permitir cualquier localhost
    if (!isProduction && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

// Security middleware
if (process.env.NODE_ENV === 'production') {
  // Security headers for production
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });
  
  // Rate limiting for production - simplified for Render
  const rateLimit = require('express-rate-limit');
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Increased limit for production
    message: {
      error: 'Too many requests, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Remove trustProxy from here since it's set globally
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health';
    }
  });
  app.use('/api/', limiter);
}

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore, // Usar el almacén de MySQL
  cookie: { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', // Secure en producción
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  }
}));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/client-payments', clientPaymentsRoutes);
app.use('/api/config', configRoutes);
app.use('/api/contacto', contactRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', dashboardRoutes);
app.use('/api/client', clientDashboardRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/configuration', configurationRoutes);

// Static files removed - frontend is deployed separately

// API Health Check (solo para ruta específica)
app.get('/api/health', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.json({ 
    message: `API Borderless Techno - ${isProduction ? 'Production' : 'Development'}`, 
    version: '1.0.0',
    status: 'active',
    environment: isProduction ? 'production' : 'development'
  });
});

// Root endpoint for API status
app.get('/', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.json({ 
    message: `API Borderless Techno - ${isProduction ? 'Production' : 'Development'}`, 
    version: '1.0.0',
    status: 'active',
    environment: isProduction ? 'production' : 'development',
    frontend: 'https://borderlesstechno.com'
  });
});

// Inicializar integraciones automáticamente al arrancar
const integrationsService = require('./services/integrationsService.js');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  
  // Sincronizar integraciones automáticamente (sin bloquear el servidor)
  setTimeout(async () => {
    try {
      console.log('🔄 Sincronizando integraciones automáticamente...');
      const results = await integrationsService.syncIntegrations();
      console.log(`✅ Integraciones sincronizadas: ${results.created} creadas, ${results.updated} actualizadas`);
      
      if (results.errors.length > 0) {
        console.log('⚠️ Errores en sincronización:', results.errors);
      }
    } catch (error) {
      console.log('❌ Error sincronizando integraciones:', error.message);
      console.error(error);
    }
  }, 1000); // Delay 1 second to ensure server is fully started
});
// Exportar la aplicación para pruebas
module.exports = app;