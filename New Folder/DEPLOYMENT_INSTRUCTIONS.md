# Instrucciones de Despliegue Separado - Borderless Techno Company

## Estructura de Archivos Generada

### 1. Frontend Build (`frontend-build/`)
Contiene los archivos estáticos compilados de React:
- `index.html` - Página principal
- `assets/` - CSS, JS y recursos compilados
- `.htaccess` - Configuración Apache (proxy API + SPA routing)

### 2. Backend Build (`backend-build/`)
Contiene la API Node.js/Express:
- `src/` - Código fuente del servidor
- `scripts/` - Scripts de base de datos
- `package.json` - Dependencias
- `.env.example` - Variables de entorno de ejemplo
- `ecosystem.config.js` - Configuración PM2

## Instrucciones de Despliegue en Hosting

### PASO 1: Desplegar Frontend

**Ubicación en hosting:** Directorio raíz del dominio (public_html/)
```bash
# En tu hosting, coloca todos los archivos de frontend-build/ en:
/public_html/
├── index.html
├── assets/
└── .htaccess
```

**Configuración Apache necesaria:**
- Asegúrate que mod_rewrite esté habilitado
- El .htaccess incluido maneja el proxy API y SPA routing

### PASO 2: Desplegar Backend

**Ubicación en hosting:** Directorio separado (fuera del public_html)
```bash
# En tu hosting, coloca backend-build/ en:
/api/ (o directorio similar fuera de public_html)
├── src/
├── scripts/
├── package.json
├── .env
└── ecosystem.config.js
```

### PASO 3: Configuración del Backend

1. **Instalar dependencias:**
```bash
cd /ruta/al/backend
npm install --production
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tus credenciales reales
```

3. **Configurar base de datos:**
```bash
npm run db:setup
```

4. **Iniciar con PM2:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### PASO 4: Verificación del Proxy API

El archivo `.htaccess` en el frontend incluye:
```apache
# Proxy para API
RewriteRule ^api/(.*)$ http://localhost:4000/api/$1 [P,L,QSA]
```

**Asegúrate que:**
- El backend esté corriendo en puerto 4000
- mod_proxy esté habilitado en Apache
- La configuración de proxy funcione correctamente

## Variables de Entorno Importantes

### Backend (.env)
```
DB_HOST=localhost
DB_USER=tu_usuario_db
DB_PASSWORD=tu_password_db
DB_NAME=boderless_db
PORT=4000
NODE_ENV=production
JWT_SECRET=tu_jwt_secreto
```

### Frontend (ya configurado en build)
- API URL: https://borderlesstechno.com

## URLs de Acceso Final

- **Sitio web:** https://borderlesstechno.com/
- **API Health:** https://borderlesstechno.com/api/health
- **Admin Panel:** https://borderlesstechno.com/admin
- **Client Panel:** https://borderlesstechno.com/client

## Comandos de Mantenimiento

### Backend
```bash
# Ver logs
pm2 logs borderless-api

# Reiniciar servidor
pm2 restart borderless-api

# Ver estado
pm2 status

# Actualizar código
pm2 stop borderless-api
# (actualizar archivos)
pm2 start borderless-api
```

### Base de Datos
```bash
# Test conexión
npm run db:test

# Reinicializar BD
npm run db:setup

# Solo tablas básicas
npm run db:init
```

## Troubleshooting

### Problema: Frontend no carga
- Verificar que `index.html` esté en public_html/
- Revisar configuración de .htaccess
- Comprobar permisos de archivos

### Problema: API no responde
- Verificar que PM2 esté corriendo: `pm2 status`
- Revisar logs: `pm2 logs borderless-api`
- Comprobar puerto 4000 disponible
- Verificar configuración proxy Apache

### Problema: Base de datos
- Verificar credenciales en .env
- Comprobar conexión: `npm run db:test`
- Revisar logs del servidor

### Problema: Portafolio sin datos
- La página de portafolio muestra proyectos desde la tabla `proyectos`
- Si está vacía, agregar datos de ejemplo via scripts/

## Estructura Final en Hosting

```
Tu Hosting:
├── public_html/              # Frontend (acceso web directo)
│   ├── index.html
│   ├── assets/
│   └── .htaccess
├── api/                      # Backend (fuera de public_html)
│   ├── src/
│   ├── scripts/
│   ├── package.json
│   ├── .env
│   └── ecosystem.config.js
└── logs/                     # Logs PM2
    ├── err.log
    ├── out.log
    └── combined.log
```

## Contacto para Soporte

Si tienes problemas con el despliegue, contacta con el desarrollador con los logs específicos del error.