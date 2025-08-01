# Borderless Techno Company - Deployment Guide

## 📋 Resumen
Este proyecto contiene una aplicación full-stack con React (frontend) y Node.js/Express (backend) preparada para deployment en Vercel.

## 🚀 Deployment en Vercel

### Frontend (Client)
1. **Conectar repositorio:** Conecta tu repositorio GitHub a Vercel
2. **Configurar proyecto:**
   - Framework: `Vite`
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Root Directory: `client`

3. **Variables de entorno requeridas:**
   ```
   VITE_API_URL=https://tu-dominio.com
   VITE_CLIENT_URL=https://tu-dominio.com
   VITE_SERVER_URL=https://tu-dominio.com
   VITE_APP_NAME=Borderless Techno Company
   VITE_APP_VERSION=1.0.0
   VITE_ENVIRONMENT=production
   ```

### Backend (Server)
1. **Crear nuevo proyecto en Vercel**
2. **Configurar proyecto:**
   - Framework: `Other`
   - Root Directory: `server`

3. **Variables de entorno requeridas:**
   ```
   NODE_ENV=production
   PORT=4000
   DATABASE_URL=mysql://user:pass@host:port/database?multipleStatements=true
   SESSION_SECRET=tu-session-secret-super-seguro
   JWT_SECRET=tu-jwt-secret-super-seguro
   JWT_EXPIRATION=1h
   PAYPAL_CLIENT_ID=tu-paypal-client-id
   PAYPAL_CLIENT_SECRET=tu-paypal-client-secret
   PAYPAL_ENVIRONMENT=live
   ALLOWED_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
   ```

## 🔧 Configuración de Dominio
1. **Frontend:** Configura tu dominio principal (ej: borderlesstechno.com)
2. **Backend:** Configura un subdominio (ej: api.borderlesstechno.com) o usa el mismo dominio

## 📦 Archivos incluidos para deployment:
- `client/vercel.json` - Configuración de Vercel para frontend
- `server/vercel.json` - Configuración de Vercel para backend
- `client/.env.production` - Variables de entorno de producción para cliente
- `server/.env.production` - Variables de entorno de producción para servidor

## ⚠️ Notas importantes:
1. **Seguridad:** Cambia todos los secrets en producción
2. **Database:** Asegúrate de que tu base de datos MySQL esté accesible desde Vercel
3. **CORS:** Actualiza ALLOWED_ORIGINS con tus dominios reales
4. **PayPal:** Usa credenciales live para producción

## 🎯 Proceso de deployment:
1. Haz push de tu código a GitHub
2. Conecta el repositorio a Vercel
3. Configura las variables de entorno
4. Deploy automático activado

## 📱 Funcionalidades incluidas:
- ✅ Sistema de autenticación completo
- ✅ Panel de administración
- ✅ Panel de clientes
- ✅ Gestión de pedidos y pagos
- ✅ Integración con PayPal
- ✅ Sistema de notificaciones
- ✅ Multi-idioma (ES/EN/FR/PT)
- ✅ Responsive design
- ✅ Dark mode ready