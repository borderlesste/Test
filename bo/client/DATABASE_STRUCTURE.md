# 📊 Estructura de Base de Datos - Sistema de Gestión Integral

## 🎯 Resumen del Proyecto

Este proyecto ha evolucionado significativamente y ahora incluye múltiples módulos integrados:

- **Gestión de Usuarios y Autenticación**
- **Sistema de Pedidos y Cotizaciones** 
- **Gestión de Clientes**
- **Sistema Financiero (Pagos, Reportes, Facturas)**
- **Sistema de Comunicaciones (Notificaciones, Mensajes, Email Marketing)**
- **Panel de Administración Integral**

## 🗂️ Estructura de Tablas Necesarias

### 1. **USUARIOS Y AUTENTICACIÓN**

#### `users` (Tabla Principal de Usuarios)
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  role ENUM('admin', 'client') DEFAULT 'client',
  estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo',
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  email_verificado BOOLEAN DEFAULT FALSE,
  ultimo_acceso TIMESTAMP NULL,
  avatar_url VARCHAR(500),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### `user_sessions` (Sesiones de Usuario)
```sql
CREATE TABLE user_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 2. **SISTEMA DE COTIZACIONES Y PEDIDOS**

#### `quotes` (Cotizaciones)
```sql
CREATE TABLE quotes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cliente_id INT,
  cliente_nombre VARCHAR(255) NOT NULL,
  cliente_email VARCHAR(255),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  precio_estimado DECIMAL(10,2),
  moneda VARCHAR(3) DEFAULT 'MXN',
  estado ENUM('Pendiente', 'Aprobada', 'Rechazada', 'Expirada') DEFAULT 'Pendiente',
  prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
  fecha_expiracion DATE,
  notas_internas TEXT,
  terminos_condiciones TEXT,
  tiempo_entrega_dias INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES users(id) ON DELETE SET NULL
);
```

#### `orders` (Pedidos)
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quote_id INT NULL,
  cliente_id INT,
  cliente_nombre VARCHAR(255) NOT NULL,
  cliente_email VARCHAR(255),
  descripcion TEXT NOT NULL,
  precio_total DECIMAL(10,2) NOT NULL,
  moneda VARCHAR(3) DEFAULT 'MXN',
  estado ENUM('Pendiente', 'En progreso', 'Completado', 'Cancelado', 'Enviado') DEFAULT 'Pendiente',
  prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
  fecha_entrega_estimada DATE,
  fecha_entrega_real DATE,
  notas_cliente TEXT,
  notas_internas TEXT,
  progreso_porcentaje INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL,
  FOREIGN KEY (cliente_id) REFERENCES users(id) ON DELETE SET NULL
);
```

#### `order_items` (Detalles de Pedidos)
```sql
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  cantidad INT DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  precio_total DECIMAL(10,2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

#### `order_status_history` (Historial de Estados)
```sql
CREATE TABLE order_status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  estado_anterior VARCHAR(50),
  estado_nuevo VARCHAR(50) NOT NULL,
  comentario TEXT,
  changed_by INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### 3. **SISTEMA FINANCIERO**

#### `payments` (Pagos)
```sql
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NULL,
  cliente_id INT NULL,
  cliente_nombre VARCHAR(255),
  cliente_email VARCHAR(255),
  concepto VARCHAR(255) NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  moneda VARCHAR(3) DEFAULT 'MXN',
  metodo_pago ENUM('tarjeta', 'transferencia', 'efectivo', 'paypal', 'otro') NOT NULL,
  estado ENUM('Pendiente', 'Pagado', 'Vencido', 'Rechazado', 'Procesando') DEFAULT 'Pendiente',
  fecha_pago TIMESTAMP NULL,
  fecha_vencimiento DATE,
  referencia_transferencia VARCHAR(100),
  transaction_id VARCHAR(100),
  gateway_response TEXT,
  notas TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (cliente_id) REFERENCES users(id) ON DELETE SET NULL
);
```

#### `invoices` (Facturas)
```sql
CREATE TABLE invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT NULL,
  order_id INT NULL,
  numero_factura VARCHAR(50) UNIQUE NOT NULL,
  cliente_id INT NULL,
  cliente_nombre VARCHAR(255) NOT NULL,
  cliente_email VARCHAR(255),
  cliente_direccion TEXT,
  cliente_rfc VARCHAR(20),
  concepto TEXT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  iva DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  moneda VARCHAR(3) DEFAULT 'MXN',
  estado ENUM('Borrador', 'Enviada', 'Pagada', 'Vencida', 'Cancelada') DEFAULT 'Borrador',
  fecha_emision DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  metodo_pago VARCHAR(50),
  condiciones_pago TEXT,
  notas TEXT,
  archivo_pdf_url VARCHAR(500),
  enviada_por_email BOOLEAN DEFAULT FALSE,
  fecha_envio_email TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (cliente_id) REFERENCES users(id) ON DELETE SET NULL
);
```

#### `invoice_items` (Detalles de Facturas)
```sql
CREATE TABLE invoice_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_id INT NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  cantidad INT DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  precio_total DECIMAL(10,2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);
```

### 4. **SISTEMA DE COMUNICACIONES**

#### `notifications` (Notificaciones)
```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  tipo ENUM('info', 'warning', 'error', 'success', 'payment', 'order', 'system') DEFAULT 'info',
  prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
  leida BOOLEAN DEFAULT FALSE,
  fecha_lectura TIMESTAMP NULL,
  datos_adicionales JSON,
  expires_at TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE SET NULL
);
```

#### `messages` (Mensajes)
```sql
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  remitente_id INT NULL,
  destinatario_id INT NULL,
  remitente_email VARCHAR(255),
  destinatario_email VARCHAR(255),
  asunto VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  tipo ENUM('consulta_general', 'consulta_pedido', 'soporte', 'cotizacion', 'feedback', 'interno') DEFAULT 'consulta_general',
  prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
  estado ENUM('no_leido', 'leido', 'respondido', 'archivado') DEFAULT 'no_leido',
  parent_message_id INT NULL,
  order_id INT NULL,
  quote_id INT NULL,
  adjuntos JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  fecha_lectura TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (remitente_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (destinatario_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (parent_message_id) REFERENCES messages(id) ON DELETE SET NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL
);
```

#### `email_campaigns` (Campañas de Email Marketing)
```sql
CREATE TABLE email_campaigns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  asunto VARCHAR(255) NOT NULL,
  contenido TEXT NOT NULL,
  contenido_html TEXT,
  tipo ENUM('promocional', 'bienvenida', 'seguimiento', 'reactivacion', 'newsletter') DEFAULT 'promocional',
  audiencia ENUM('todos', 'nuevos_clientes', 'clientes_activos', 'inactivos', 'segmento_personalizado') DEFAULT 'todos',
  estado ENUM('borrador', 'programada', 'enviando', 'enviada', 'pausada', 'cancelada') DEFAULT 'borrador',
  fecha_programada TIMESTAMP NULL,
  fecha_envio TIMESTAMP NULL,
  creado_por INT NOT NULL,
  total_destinatarios INT DEFAULT 0,
  enviados INT DEFAULT 0,
  abiertos INT DEFAULT 0,
  clicks INT DEFAULT 0,
  conversiones INT DEFAULT 0,
  bounces INT DEFAULT 0,
  spam_reports INT DEFAULT 0,
  unsubscribes INT DEFAULT 0,
  configuracion JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (creado_por) REFERENCES users(id) ON DELETE CASCADE
);
```

#### `email_campaign_recipients` (Destinatarios de Campañas)
```sql
CREATE TABLE email_campaign_recipients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  user_id INT NULL,
  email VARCHAR(255) NOT NULL,
  nombre VARCHAR(255),
  estado ENUM('pendiente', 'enviado', 'abierto', 'click', 'bounce', 'spam', 'unsubscribed') DEFAULT 'pendiente',
  fecha_envio TIMESTAMP NULL,
  fecha_apertura TIMESTAMP NULL,
  fecha_click TIMESTAMP NULL,
  clicks_count INT DEFAULT 0,
  datos_adicionales JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### 5. **CONFIGURACIÓN Y SISTEMA**

#### `system_config` (Configuración del Sistema)
```sql
CREATE TABLE system_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT,
  config_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  description TEXT,
  is_sensitive BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### `audit_logs` (Logs de Auditoría)
```sql
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id INT NULL,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

#### `file_uploads` (Archivos Subidos)
```sql
CREATE TABLE file_uploads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_type ENUM('image', 'document', 'video', 'audio', 'other') DEFAULT 'other',
  related_table VARCHAR(100),
  related_id INT,
  is_public BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

## 📈 Estadísticas del Proyecto

### **Páginas Implementadas**: 15+
- **Dashboard Principal**: 1
- **Pedidos y Cotizaciones**: 3 páginas (Cotizaciones, Pedidos, Historial)
- **Gestión de Clientes**: 3 páginas (Ver, Nuevo, Estadísticas)
- **Finanzas**: 3 páginas (Pagos, Reportes, Facturas)
- **Comunicaciones**: 3 páginas (Notificaciones, Mensajes, Email Marketing)
- **Configuración y Panel Admin**: Múltiples secciones

### **Tablas de Base de Datos**: 18
- **Usuarios y Autenticación**: 2 tablas
- **Pedidos y Cotizaciones**: 4 tablas
- **Sistema Financiero**: 4 tablas
- **Comunicaciones**: 4 tablas
- **Sistema y Configuración**: 4 tablas

### **APIs Necesarias**: 25+
- **CRUD completo** para cada entidad principal
- **APIs especializadas** para estadísticas y reportes
- **APIs de comunicación** para emails y notificaciones

## 🔧 Consideraciones Técnicas

### **Rendimiento**
- **Índices recomendados** en campos de búsqueda frecuente
- **Particionado** para tablas con gran volumen (logs, notificaciones)
- **Caché** para consultas de estadísticas complejas

### **Seguridad**
- **Encriptación** de contraseñas con bcrypt
- **Sanitización** de datos de entrada
- **Auditoría completa** de acciones críticas
- **Backup automático** y recuperación

### **Escalabilidad**
- **Arquitectura modular** preparada para microservicios
- **APIs RESTful** bien estructuradas
- **Separación clara** entre frontend y backend

## 📋 Próximos Pasos Recomendados

1. **Implementar las tablas faltantes** en la base de datos
2. **Crear APIs backend** para todas las funcionalidades
3. **Implementar sistema de archivos** para uploads
4. **Configurar sistema de emails** reales
5. **Añadir tests unitarios** y de integración
6. **Implementar sistema de backup** automático
7. **Configurar monitoreo** y logging avanzado

## 🎯 Conclusión

El proyecto ha evolucionado hacia **un sistema de gestión integral** que abarca:
- ✅ **Gestión completa de clientes**
- ✅ **Sistema de pedidos y cotizaciones**  
- ✅ **Módulo financiero completo**
- ✅ **Sistema de comunicaciones**
- ✅ **Panel administrativo unificado**

La estructura de base de datos propuesta **soporta completamente** todas las funcionalidades implementadas y está **preparada para escalar** con el crecimiento del sistema.