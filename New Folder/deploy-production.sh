#!/bin/bash

# Script de despliegue para Borderless Techno - Producción
echo "🚀 Iniciando despliegue de producción..."

# Configurar variables de entorno para producción
export NODE_ENV=production

# 1. Construir frontend
echo "📦 Construyendo frontend..."
cd client
npm run build
cd ..

# 2. Copiar archivos del frontend al servidor
echo "📁 Copiando archivos frontend al servidor..."
rm -rf server/public
cp -r client/dist server/public

# 3. Instalar dependencias del servidor (si es necesario)
echo "📥 Verificando dependencias del servidor..."
cd server
npm install --production

# 4. Crear estructura de archivos para hosting
echo "📋 Creando paquete de despliegue..."
cd ..
rm -rf deployment-package
mkdir deployment-package

# Copiar archivos del servidor
cp -r server/* deployment-package/
cp server/.env deployment-package/ 2>/dev/null || echo "⚠️  Archivo .env no encontrado, asegúrate de configurarlo en el hosting"

# Crear archivo de configuración para PM2 (si tu hosting lo soporta)
cat > deployment-package/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'borderless-techno',
    script: 'src/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
};
EOF

# Crear instrucciones de despliegue
cat > deployment-package/DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# Instrucciones de Despliegue - Borderless Techno

## Pasos para desplegar en tu hosting:

### 1. Subir archivos
- Sube todos los archivos de esta carpeta a tu servidor
- Asegúrate de que el directorio `public/` contenga los archivos del frontend

### 2. Configurar variables de entorno
Crea un archivo `.env` con:
```
NODE_ENV=production
PORT=4000
DATABASE_URL=mysql://usuario:password@localhost:3306/tu_base_datos
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=tu_base_datos
SESSION_SECRET=tu_session_secret_seguro
JWT_SECRET=tu_jwt_secret_seguro
JWT_EXPIRATION=7d
PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret
PAYPAL_ENVIRONMENT=live
```

### 3. Configurar servidor web (Apache/Nginx)

#### Para Apache (.htaccess):
```apache
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:4000/api/$1 [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

#### Para Nginx:
```nginx
location /api/ {
    proxy_pass http://localhost:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### 4. Iniciar aplicación
```bash
npm install --production
node src/index.js
```

O con PM2 (recomendado):
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Verificar funcionamiento
- Visita tu dominio: debería cargar el frontend de React
- Verifica la API: https://tudominio.com/api/health
- Revisa los logs para cualquier error

## Solución de problemas:

### Si ves solo JSON de la API:
- Verifica que los archivos estén en `public/`
- Asegúrate de que NODE_ENV=production
- Revisa la configuración del servidor web

### Si las rutas de la API no funcionan:
- Verifica el proxy del servidor web
- Asegúrate de que el backend esté ejecutándose en el puerto correcto
- Revisa las configuraciones de CORS
EOF

# Crear archivo comprimido para subir
echo "🗜️  Comprimiendo archivos para despliegue..."
tar -czf borderless-production-$(date +%Y%m%d-%H%M%S).tar.gz deployment-package/

echo "✅ Despliegue preparado!"
echo "📁 Archivos listos en: deployment-package/"
echo "📦 Archivo comprimido: borderless-production-*.tar.gz"
echo "📋 Lee DEPLOYMENT_INSTRUCTIONS.md para instrucciones detalladas"