# 🗄️ Configuración de Base de Datos

Guía paso a paso para configurar la base de datos MySQL del proyecto Borderless Techno Company.

## 📋 Prerrequisitos

1. **MySQL Server** instalado y ejecutándose
2. **Node.js** y **npm** instalados
3. Acceso a un usuario MySQL con permisos para crear bases de datos

## 🚀 Configuración Rápida

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `server/` basado en `.env.example`:

```bash
cd server
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de MySQL:

```env
# Ejemplo de configuración
DATABASE_URL=mysql://root:tu_password@localhost:3306/borderless_db
PORT=4000
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
NODE_ENV=development
```

### 2. Instalar Dependencias

```bash
cd server
npm install
```

### 3. Configurar Base de Datos

**Opción A: Configuración Automática (Recomendado)**
```bash
npm run db:setup
```

**Opción B: Configuración Manual**
1. Crea la base de datos manualmente en MySQL
2. Ejecuta el archivo `src/migrations/init.sql`

### 4. Verificar Conexión

```bash
npm run db:test
```

## 📊 Estructura de la Base de Datos

El script `init.sql` crea las siguientes tablas:

### Tablas Principales:
- **`clientes`** - Usuarios y administradores del sistema
- **`quotes`** - Solicitudes de cotización desde el sitio web
- **`pedidos`** - Proyectos confirmados y órdenes de trabajo
- **`pagos`** - Historial de transacciones y pagos
- **`notificaciones`** - Sistema de notificaciones
- **`solicitudes`** - Solicitudes adicionales de servicios
- **`configuracion`** - Configuraciones del sistema

### Relaciones:
```
clientes (1) ──→ (N) quotes
clientes (1) ──→ (N) pedidos  
clientes (1) ──→ (N) pagos
clientes (1) ──→ (N) notificaciones
pedidos (1) ──→ (N) pagos
```

## 🔐 Datos de Prueba

Después de ejecutar `npm run db:setup`, tendrás estas credenciales:

### Administrador:
- **Email:** admin@borderlesstechno.com
- **Password:** password

### Cliente de Prueba:
- **Email:** juan@example.com  
- **Password:** password

## 🛠️ Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run db:setup` | Configura la base de datos completa |
| `npm run db:test` | Verifica la conexión a la base de datos |
| `npm run db:reset` | Reinicia la base de datos (mismo que setup) |
| `npm run dev` | Inicia el servidor en modo desarrollo |

## ⚠️ Solución de Problemas

### Error: "ER_ACCESS_DENIED_ERROR"
- Verifica las credenciales en el archivo `.env`
- Asegúrate de que el usuario MySQL tenga permisos

### Error: "ECONNREFUSED"
- Verifica que MySQL esté ejecutándose
- Confirma que el puerto (3306) sea correcto

### Error: "Database does not exist"
- El script debería crear la base de datos automáticamente
- Si persiste, créala manualmente: `CREATE DATABASE borderless_db;`

### Tablas no se crean
- Revisa los permisos del usuario MySQL
- Ejecuta manualmente el archivo `src/migrations/init.sql`

## 🔄 Reiniciar Base de Datos

Para limpiar y reiniciar todo:

```bash
# Opción 1: Usar el script
npm run db:reset

# Opción 2: Manual
mysql -u root -p
DROP DATABASE borderless_db;
exit
npm run db:setup
```

## 📱 Siguientes Pasos

Una vez configurada la base de datos:

1. ✅ Ejecuta `npm run dev` para iniciar el servidor
2. ✅ Ve al frontend y prueba el login con las credenciales de prueba
3. ✅ Verifica que las nuevas páginas carguen datos reales
4. ✅ Testa la funcionalidad completa del sistema

## 🆘 Soporte

Si encuentras problemas:

1. Ejecuta `npm run db:test` para diagnosticar
2. Revisa los logs del servidor
3. Verifica que todas las dependencias estén instaladas
4. Confirma que MySQL esté ejecutándose correctamente

---

🎉 **¡Base de datos lista para usar!** Ahora puedes continuar con la integración frontend-backend.