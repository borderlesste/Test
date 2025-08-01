
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `dblzyyrh_techno`
--

-- --------------------------------------------------------

--
-- Table structure for table `actividades`
--

CREATE TABLE `actividades` (
  `id` bigint(20) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `tipo` varchar(50) NOT NULL,
  `descripcion` text NOT NULL,
  `entidad_tipo` varchar(50) DEFAULT NULL,
  `entidad_id` int(11) DEFAULT NULL,
  `datos_adicionales` text DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `configuracion_general`
--

CREATE TABLE `configuracion_general` (
  `id` int(11) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `company_description` text DEFAULT NULL,
  `company_slogan` varchar(255) DEFAULT NULL,
  `company_email` varchar(255) DEFAULT NULL,
  `company_phone` varchar(50) DEFAULT NULL,
  `company_whatsapp` varchar(50) DEFAULT NULL,
  `company_address` text DEFAULT NULL,
  `company_website` varchar(255) DEFAULT NULL,
  `company_logo` varchar(255) DEFAULT NULL,
  `company_favicon` varchar(255) DEFAULT NULL,
  `company_timezone` varchar(64) NOT NULL DEFAULT 'America/Mexico_City',
  `company_language` varchar(10) NOT NULL DEFAULT 'es',
  `company_currency` varchar(10) NOT NULL DEFAULT 'MXN',
  `company_rfc` varchar(20) DEFAULT NULL,
  `company_regimen_fiscal` varchar(100) DEFAULT NULL,
  `theme_mode` enum('light','dark','auto') NOT NULL DEFAULT 'light',
  `theme_primary_color` char(7) NOT NULL DEFAULT '#7c3aed',
  `theme_secondary_color` char(7) NOT NULL DEFAULT '#06b6d4',
  `theme_compact_mode` tinyint(1) NOT NULL DEFAULT 0,
  `theme_animations` tinyint(1) NOT NULL DEFAULT 1,
  `business_hours` text DEFAULT NULL,
  `auto_response_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `auto_response_message` text DEFAULT NULL,
  `maintenance_mode` tinyint(1) NOT NULL DEFAULT 0,
  `maintenance_message` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `configuracion_general`
--

INSERT INTO `configuracion_general` (`id`, `company_name`, `company_description`, `company_slogan`, `company_email`, `company_phone`, `company_whatsapp`, `company_address`, `company_website`, `company_logo`, `company_favicon`, `company_timezone`, `company_language`, `company_currency`, `company_rfc`, `company_regimen_fiscal`, `theme_mode`, `theme_primary_color`, `theme_secondary_color`, `theme_compact_mode`, `theme_animations`, `business_hours`, `auto_response_enabled`, `auto_response_message`, `maintenance_mode`, `maintenance_message`, `created_at`, `updated_at`) VALUES
(1, 'Techno Solutions', 'Soluciones tecnológicas innovadoras', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'America/Mexico_City', 'es', 'MXN', NULL, NULL, 'light', '#7c3aed', '#06b6d4', 0, 1, '{\"monday\":{\"start\":\"09:00\",\"end\":\"18:00\"},\"tuesday\":{\"start\":\"09:00\",\"end\":\"18:00\"},\"wednesday\":{\"start\":\"09:00\",\"end\":\"18:00\"},\"thursday\":{\"start\":\"09:00\",\"end\":\"18:00\"},\"friday\":{\"start\":\"09:00\",\"end\":\"18:00\"},\"saturday\":{\"start\":\"10:00\",\"end\":\"14:00\"},\"sunday\":{\"closed\":true}}', 1, NULL, 0, NULL, '2025-07-25 00:53:23', '2025-07-25 00:53:23');

-- --------------------------------------------------------

--
-- Table structure for table `configuracion_notificaciones`
--

CREATE TABLE `configuracion_notificaciones` (
  `id` int(11) NOT NULL,
  `tipo_evento` varchar(50) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `email_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `sms_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `push_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `webhook_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `roles_notificar` text DEFAULT NULL,
  `plantilla_email` text DEFAULT NULL,
  `plantilla_sms` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `configuracion_notificaciones`
--

INSERT INTO `configuracion_notificaciones` (`id`, `tipo_evento`, `nombre`, `descripcion`, `email_enabled`, `sms_enabled`, `push_enabled`, `webhook_enabled`, `roles_notificar`, `plantilla_email`, `plantilla_sms`, `created_at`, `updated_at`) VALUES
(1, 'pedido_creado', 'Nuevo Pedido', 'Notificación cuando se crea un nuevo pedido', 1, 0, 0, 0, NULL, NULL, NULL, '2025-07-25 00:53:23', '2025-07-25 00:53:23'),
(2, 'pago_recibido', 'Pago Recibido', 'Notificación cuando se recibe un pago', 1, 0, 0, 0, NULL, NULL, NULL, '2025-07-25 00:53:23', '2025-07-25 00:53:23'),
(3, 'factura_vencida', 'Factura Vencida', 'Notificación cuando una factura vence', 1, 0, 0, 0, NULL, NULL, NULL, '2025-07-25 00:53:23', '2025-07-25 00:53:23'),
(4, 'cotizacion_aceptada', 'Cotización Aceptada', 'Notificación cuando se acepta una cotización', 1, 0, 0, 0, NULL, NULL, NULL, '2025-07-25 00:53:23', '2025-07-25 00:53:23');

-- --------------------------------------------------------

--
-- Table structure for table `configuracion_pagos`
--

CREATE TABLE `configuracion_pagos` (
  `id` int(11) NOT NULL,
  `metodo` varchar(50) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 0,
  `es_online` tinyint(1) NOT NULL DEFAULT 0,
  `configuracion` text DEFAULT NULL,
  `instrucciones` text DEFAULT NULL,
  `comision_porcentaje` decimal(5,2) NOT NULL DEFAULT 0.00,
  `comision_fija` decimal(10,2) NOT NULL DEFAULT 0.00,
  `orden` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `configuracion_pagos`
--

INSERT INTO `configuracion_pagos` (`id`, `metodo`, `nombre`, `descripcion`, `enabled`, `es_online`, `configuracion`, `instrucciones`, `comision_porcentaje`, `comision_fija`, `orden`, `created_at`, `updated_at`) VALUES
(1, 'efectivo', 'Efectivo', 'Pago en efectivo', 1, 0, NULL, NULL, 0.00, 0.00, 1, '2025-07-25 00:53:23', '2025-07-25 00:53:23'),
(2, 'transferencia', 'Transferencia Bancaria', 'Transferencia electrónica', 1, 0, NULL, NULL, 0.00, 0.00, 2, '2025-07-25 00:53:23', '2025-07-25 00:53:23'),
(3, 'tarjeta', 'Tarjeta Crédito/Débito', 'Pago con tarjeta', 1, 1, NULL, NULL, 0.00, 0.00, 3, '2025-07-25 00:53:23', '2025-07-25 00:53:23'),
(4, 'paypal', 'PayPal', 'Pago mediante PayPal', 0, 1, NULL, NULL, 0.00, 0.00, 4, '2025-07-25 00:53:23', '2025-07-25 00:53:23');

-- --------------------------------------------------------

--
-- Table structure for table `configuracion_seguridad`
--

CREATE TABLE `configuracion_seguridad` (
  `id` int(11) NOT NULL,
  `password_min_length` int(11) NOT NULL DEFAULT 8,
  `password_require_uppercase` tinyint(1) NOT NULL DEFAULT 1,
  `password_require_lowercase` tinyint(1) NOT NULL DEFAULT 1,
  `password_require_numbers` tinyint(1) NOT NULL DEFAULT 1,
  `password_require_symbols` tinyint(1) NOT NULL DEFAULT 1,
  `password_expiration_days` int(11) NOT NULL DEFAULT 90,
  `password_history_count` int(11) NOT NULL DEFAULT 5,
  `login_max_attempts` int(11) NOT NULL DEFAULT 5,
  `login_lockout_minutes` int(11) NOT NULL DEFAULT 30,
  `session_timeout_minutes` int(11) NOT NULL DEFAULT 60,
  `session_max_concurrent` int(11) NOT NULL DEFAULT 3,
  `two_factor_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `ip_whitelist` text DEFAULT NULL,
  `ip_blacklist` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `configuracion_seguridad`
--

INSERT INTO `configuracion_seguridad` (`id`, `password_min_length`, `password_require_uppercase`, `password_require_lowercase`, `password_require_numbers`, `password_require_symbols`, `password_expiration_days`, `password_history_count`, `login_max_attempts`, `login_lockout_minutes`, `session_timeout_minutes`, `session_max_concurrent`, `two_factor_enabled`, `ip_whitelist`, `ip_blacklist`, `created_at`, `updated_at`) VALUES
(1, 8, 1, 1, 1, 1, 90, 5, 5, 30, 60, 3, 0, NULL, NULL, '2025-07-25 00:53:23', '2025-07-25 00:53:23');

-- --------------------------------------------------------

--
-- Table structure for table `cotizaciones`
--

CREATE TABLE `cotizaciones` (
  `id` int(11) NOT NULL,
  `numero_cotizacion` varchar(50) NOT NULL,
  `cliente_id` int(11) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `nombre_prospecto` varchar(255) DEFAULT NULL,
  `email_prospecto` varchar(255) DEFAULT NULL,
  `telefono_prospecto` varchar(50) DEFAULT NULL,
  `empresa_prospecto` varchar(255) DEFAULT NULL,
  `estado` enum('borrador','enviada','aceptada','rechazada','vencida') NOT NULL DEFAULT 'borrador',
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `descuento` decimal(12,2) NOT NULL DEFAULT 0.00,
  `iva` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `fecha_emision` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_vencimiento` date NOT NULL,
  `condiciones_pago` text DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cotizacion_items`
--

CREATE TABLE `cotizacion_items` (
  `id` int(11) NOT NULL,
  `cotizacion_id` int(11) NOT NULL,
  `servicio_id` int(11) DEFAULT NULL,
  `descripcion` text NOT NULL,
  `cantidad` decimal(10,2) NOT NULL DEFAULT 1.00,
  `precio_unitario` decimal(12,2) NOT NULL,
  `descuento` decimal(12,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(12,2) NOT NULL,
  `orden` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dashboard_widgets`
--

CREATE TABLE `dashboard_widgets` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `configuracion` text DEFAULT NULL,
  `posicion_x` int(11) NOT NULL DEFAULT 0,
  `posicion_y` int(11) NOT NULL DEFAULT 0,
  `ancho` int(11) NOT NULL DEFAULT 4,
  `alto` int(11) NOT NULL DEFAULT 2,
  `visible` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `estadisticas_mensuales`
--

CREATE TABLE `estadisticas_mensuales` (
  `id` int(11) NOT NULL,
  `anio` int(11) NOT NULL,
  `mes` int(11) NOT NULL,
  `total_ingresos` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_egresos` decimal(12,2) NOT NULL DEFAULT 0.00,
  `nuevos_clientes` int(11) NOT NULL DEFAULT 0,
  `clientes_activos` int(11) NOT NULL DEFAULT 0,
  `cotizaciones_enviadas` int(11) NOT NULL DEFAULT 0,
  `cotizaciones_aceptadas` int(11) NOT NULL DEFAULT 0,
  `pedidos_nuevos` int(11) NOT NULL DEFAULT 0,
  `pedidos_completados` int(11) NOT NULL DEFAULT 0,
  `facturas_emitidas` int(11) NOT NULL DEFAULT 0,
  `facturas_pagadas` int(11) NOT NULL DEFAULT 0,
  `proyectos_iniciados` int(11) NOT NULL DEFAULT 0,
  `proyectos_completados` int(11) NOT NULL DEFAULT 0,
  `ticket_promedio` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `facturas`
--

CREATE TABLE `facturas` (
  `id` int(11) NOT NULL,
  `numero_factura` varchar(50) NOT NULL,
  `serie` varchar(10) DEFAULT NULL,
  `folio` int(11) DEFAULT NULL,
  `cliente_id` int(11) NOT NULL,
  `pedido_id` int(11) DEFAULT NULL,
  `tipo` enum('factura','nota_credito','nota_debito') NOT NULL DEFAULT 'factura',
  `estado` enum('borrador','emitida','timbrada','cancelada','pagada') NOT NULL DEFAULT 'borrador',
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `descuento` decimal(12,2) NOT NULL DEFAULT 0.00,
  `iva` decimal(12,2) NOT NULL DEFAULT 0.00,
  `isr_retenido` decimal(12,2) NOT NULL DEFAULT 0.00,
  `iva_retenido` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `saldo_pendiente` decimal(12,2) NOT NULL DEFAULT 0.00,
  `moneda` varchar(10) NOT NULL DEFAULT 'MXN',
  `tipo_cambio` decimal(10,4) NOT NULL DEFAULT 1.0000,
  `metodo_pago` varchar(50) DEFAULT NULL,
  `forma_pago` varchar(50) DEFAULT NULL,
  `uso_cfdi` varchar(10) DEFAULT NULL,
  `fecha_emision` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_vencimiento` date NOT NULL,
  `fecha_pago` datetime DEFAULT NULL,
  `uuid` varchar(36) DEFAULT NULL,
  `xml_path` varchar(500) DEFAULT NULL,
  `pdf_path` varchar(500) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `factura_items`
--

CREATE TABLE `factura_items` (
  `id` int(11) NOT NULL,
  `factura_id` int(11) NOT NULL,
  `pedido_item_id` int(11) DEFAULT NULL,
  `clave_prod_serv` varchar(10) DEFAULT NULL,
  `clave_unidad` varchar(10) DEFAULT NULL,
  `descripcion` text NOT NULL,
  `cantidad` decimal(10,2) NOT NULL DEFAULT 1.00,
  `precio_unitario` decimal(12,2) NOT NULL,
  `descuento` decimal(12,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(12,2) NOT NULL,
  `orden` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `integraciones`
--

CREATE TABLE `integraciones` (
  `id` int(11) NOT NULL,
  `tipo` enum('payment','email','sms','facturacion','analytics','crm','other') NOT NULL,
  `proveedor` varchar(50) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('connected','disconnected','error','maintenance') NOT NULL DEFAULT 'disconnected',
  `configuracion` text DEFAULT NULL,
  `ultimo_error` text DEFAULT NULL,
  `ultima_sincronizacion` datetime DEFAULT NULL,
  `proxima_sincronizacion` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `mensaje` text NOT NULL,
  `prioridad` enum('baja','normal','alta','urgente') NOT NULL DEFAULT 'normal',
  `leida` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_lectura` datetime DEFAULT NULL,
  `entidad_tipo` varchar(50) DEFAULT NULL,
  `entidad_id` int(11) DEFAULT NULL,
  `accion_url` varchar(500) DEFAULT NULL,
  `enviada_email` tinyint(1) NOT NULL DEFAULT 0,
  `enviada_sms` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pagos`
--

CREATE TABLE `pagos` (
  `id` int(11) NOT NULL,
  `numero_pago` varchar(50) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `tipo` enum('anticipo','parcial','total','devolucion') NOT NULL DEFAULT 'total',
  `estado` enum('pendiente','procesando','aplicado','rechazado','cancelado') NOT NULL DEFAULT 'pendiente',
  `monto` decimal(12,2) NOT NULL,
  `moneda` varchar(10) NOT NULL DEFAULT 'MXN',
  `tipo_cambio` decimal(10,4) NOT NULL DEFAULT 1.0000,
  `metodo_pago` enum('efectivo','transferencia','tarjeta','cheque','paypal','otro') NOT NULL,
  `referencia` varchar(255) DEFAULT NULL,
  `banco_origen` varchar(100) DEFAULT NULL,
  `cuenta_destino` varchar(50) DEFAULT NULL,
  `fecha_pago` datetime NOT NULL,
  `fecha_aplicacion` datetime DEFAULT NULL,
  `concepto` text DEFAULT NULL,
  `comprobante_path` varchar(500) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pago_aplicaciones`
--

CREATE TABLE `pago_aplicaciones` (
  `id` int(11) NOT NULL,
  `pago_id` int(11) NOT NULL,
  `factura_id` int(11) NOT NULL,
  `monto_aplicado` decimal(12,2) NOT NULL,
  `fecha_aplicacion` datetime NOT NULL DEFAULT current_timestamp(),
  `applied_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `pago_aplicaciones`
--
DELIMITER $$
CREATE TRIGGER `tr_actualizar_saldo_factura_after_pago` AFTER INSERT ON `pago_aplicaciones` FOR EACH ROW BEGIN
  UPDATE facturas
  SET saldo_pendiente = saldo_pendiente - NEW.monto_aplicado,
      estado = CASE 
        WHEN (saldo_pendiente - NEW.monto_aplicado) <= 0 THEN 'pagada'
        ELSE estado
      END,
      fecha_pago = CASE
        WHEN (saldo_pendiente - NEW.monto_aplicado) <= 0 THEN NOW()
        ELSE fecha_pago
      END
  WHERE id = NEW.factura_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `numero_pedido` varchar(50) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `cotizacion_id` int(11) DEFAULT NULL,
  `estado` enum('nuevo','confirmado','en_proceso','completado','cancelado','en_pausa') NOT NULL DEFAULT 'nuevo',
  `prioridad` enum('baja','normal','alta','urgente') NOT NULL DEFAULT 'normal',
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `descuento` decimal(12,2) NOT NULL DEFAULT 0.00,
  `iva` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `anticipo` decimal(12,2) NOT NULL DEFAULT 0.00,
  `saldo_pendiente` decimal(12,2) NOT NULL DEFAULT 0.00,
  `fecha_inicio` datetime DEFAULT NULL,
  `fecha_entrega_estimada` date DEFAULT NULL,
  `fecha_entrega_real` datetime DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `notas_internas` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `pedidos`
--
DELIMITER $$
CREATE TRIGGER `tr_notificar_nuevo_pedido` AFTER INSERT ON `pedidos` FOR EACH ROW BEGIN
  INSERT INTO notificaciones
      (usuario_id, tipo, titulo, mensaje, prioridad, entidad_tipo, entidad_id)
  VALUES
      (NEW.cliente_id, 'pedido_creado', 'Nuevo Pedido Creado',
       CONCAT('Su pedido #', NEW.numero_pedido, ' ha sido creado exitosamente.'),
       'normal', 'pedido', NEW.id);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `pedido_items`
--

CREATE TABLE `pedido_items` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `servicio_id` int(11) DEFAULT NULL,
  `descripcion` text NOT NULL,
  `cantidad` decimal(10,2) NOT NULL DEFAULT 1.00,
  `precio_unitario` decimal(12,2) NOT NULL,
  `descuento` decimal(12,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(12,2) NOT NULL,
  `estado` enum('pendiente','en_proceso','completado') NOT NULL DEFAULT 'pendiente',
  `orden` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proyectos`
--

CREATE TABLE `proyectos` (
  `id` int(11) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text NOT NULL,
  `cliente_id` int(11) DEFAULT NULL,
  `pedido_id` int(11) DEFAULT NULL,
  `categoria` varchar(100) NOT NULL DEFAULT 'web',
  `tecnologias` text DEFAULT NULL,
  `imagen_principal` varchar(500) DEFAULT NULL,
  `url_demo` varchar(500) DEFAULT NULL,
  `url_produccion` varchar(500) DEFAULT NULL,
  `repositorio` varchar(500) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado` enum('planificacion','desarrollo','revision','completado','mantenimiento') NOT NULL DEFAULT 'planificacion',
  `es_destacado` tinyint(1) NOT NULL DEFAULT 0,
  `es_publico` tinyint(1) NOT NULL DEFAULT 1,
  `orden_portfolio` int(11) NOT NULL DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proyecto_imagenes`
--

CREATE TABLE `proyecto_imagenes` (
  `id` int(11) NOT NULL,
  `proyecto_id` int(11) NOT NULL,
  `titulo` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `url` varchar(500) NOT NULL,
  `tipo` enum('screenshot','diagrama','mockup','otro') NOT NULL DEFAULT 'screenshot',
  `orden` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `seguridad_log`
--

CREATE TABLE `seguridad_log` (
  `id` bigint(20) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `tipo` enum('login_exitoso','login_fallido','logout','cambio_password','reseteo_password','bloqueo_cuenta','desbloqueo_cuenta','acceso_denegado') NOT NULL,
  `email_intento` varchar(255) DEFAULT NULL,
  `ip` varchar(45) NOT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `dispositivo` varchar(255) DEFAULT NULL,
  `ubicacion` varchar(255) DEFAULT NULL,
  `detalles` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `servicios`
--

CREATE TABLE `servicios` (
  `id` int(11) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `categoria` varchar(100) NOT NULL,
  `precio_base` decimal(12,2) NOT NULL DEFAULT 0.00,
  `unidad_medida` enum('hora','proyecto','mes','año','unidad') NOT NULL DEFAULT 'proyecto',
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sesiones`
--

CREATE TABLE `sesiones` (
  `id` bigint(20) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `ip` varchar(45) NOT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `dispositivo` varchar(255) DEFAULT NULL,
  `ubicacion` varchar(255) DEFAULT NULL,
  `fecha_inicio` datetime NOT NULL DEFAULT current_timestamp(),
  `ultima_actividad` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_expiracion` datetime NOT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','cliente','empleado') NOT NULL DEFAULT 'cliente',
  `estado` enum('activo','inactivo','bloqueado') NOT NULL DEFAULT 'activo',
  `telefono` varchar(50) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `empresa` varchar(255) DEFAULT NULL,
  `rfc` varchar(20) DEFAULT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT current_timestamp(),
  `ultimo_acceso` datetime DEFAULT NULL,
  `intentos_fallidos` int(11) NOT NULL DEFAULT 0,
  `bloqueado_hasta` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol`, `estado`, `telefono`, `direccion`, `empresa`, `rfc`, `fecha_registro`, `ultimo_acceso`, `intentos_fallidos`, `bloqueado_hasta`, `created_at`, `updated_at`) VALUES
(1, 'Administrador', 'admin@techno.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'activo', NULL, NULL, NULL, NULL, '2025-07-25 00:53:23', NULL, 0, NULL, '2025-07-25 00:53:23', '2025-07-25 00:53:23');

--
-- Triggers `usuarios`
--
DELIMITER $$
CREATE TRIGGER `tr_log_login_exitoso` AFTER UPDATE ON `usuarios` FOR EACH ROW BEGIN
  IF NEW.ultimo_acceso <> OLD.ultimo_acceso THEN
    INSERT INTO actividades
        (usuario_id, tipo, descripcion, entidad_tipo, entidad_id)
    VALUES
        (NEW.id, 'login', 'Inicio de sesión exitoso', 'usuario', NEW.id);
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_estado_pedidos`
-- (See below for the actual view)
--
CREATE TABLE `v_estado_pedidos` (
`id` int(11)
,`numero_pedido` varchar(50)
,`estado` enum('nuevo','confirmado','en_proceso','completado','cancelado','en_pausa')
,`prioridad` enum('baja','normal','alta','urgente')
,`cliente_nombre` varchar(255)
,`cliente_empresa` varchar(255)
,`total` decimal(12,2)
,`saldo_pendiente` decimal(12,2)
,`fecha_entrega_estimada` date
,`dias_para_entrega` int(8)
,`created_at` datetime
,`asignado_a` varchar(255)
,`total_items` bigint(21)
,`items_completados` decimal(22,0)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_flujo_efectivo`
-- (See below for the actual view)
--
CREATE TABLE `v_flujo_efectivo` (
`fecha` date
,`tipo` varchar(7)
,`concepto` mediumtext
,`monto` decimal(12,2)
,`metodo_pago` varchar(13)
,`cliente` varchar(255)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_resumen_cliente`
-- (See below for the actual view)
--
CREATE TABLE `v_resumen_cliente` (
`id` int(11)
,`nombre` varchar(255)
,`email` varchar(255)
,`empresa` varchar(255)
,`fecha_registro` datetime
,`total_pedidos` bigint(21)
,`total_facturas` bigint(21)
,`total_facturado` decimal(34,2)
,`saldo_pendiente_total` decimal(34,2)
,`ultimo_pedido` datetime
,`ultima_factura` datetime
,`ultimo_pago` datetime
,`estado_comercial` varchar(10)
);

-- --------------------------------------------------------

--
-- Table structure for table `webhooks`
--

CREATE TABLE `webhooks` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `url` text NOT NULL,
  `eventos` text NOT NULL,
  `headers` text DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `intentos_max` int(11) NOT NULL DEFAULT 3,
  `timeout_segundos` int(11) NOT NULL DEFAULT 30,
  `ultimo_intento` datetime DEFAULT NULL,
  `ultimo_status` int(11) DEFAULT NULL,
  `ultimo_error` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `webhook_logs`
--

CREATE TABLE `webhook_logs` (
  `id` bigint(20) NOT NULL,
  `webhook_id` int(11) NOT NULL,
  `evento` varchar(50) NOT NULL,
  `payload` text NOT NULL,
  `response_status` int(11) DEFAULT NULL,
  `response_body` text DEFAULT NULL,
  `duracion_ms` int(11) DEFAULT NULL,
  `exitoso` tinyint(1) NOT NULL DEFAULT 0,
  `error` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `actividades`
--
ALTER TABLE `actividades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario_id` (`usuario_id`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_entidad` (`entidad_tipo`,`entidad_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `configuracion_general`
--
ALTER TABLE `configuracion_general`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `configuracion_notificaciones`
--
ALTER TABLE `configuracion_notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_tipo_evento` (`tipo_evento`);

--
-- Indexes for table `configuracion_pagos`
--
ALTER TABLE `configuracion_pagos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_metodo` (`metodo`);

--
-- Indexes for table `configuracion_seguridad`
--
ALTER TABLE `configuracion_seguridad`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cotizaciones`
--
ALTER TABLE `cotizaciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_numero_cotizacion` (`numero_cotizacion`),
  ADD KEY `idx_cliente_id` (`cliente_id`),
  ADD KEY `idx_usuario_id` (`usuario_id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_fecha_vencimiento` (`fecha_vencimiento`),
  ADD KEY `idx_created_by` (`created_by`);

--
-- Indexes for table `cotizacion_items`
--
ALTER TABLE `cotizacion_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cotizacion_id` (`cotizacion_id`),
  ADD KEY `idx_servicio_id` (`servicio_id`);

--
-- Indexes for table `dashboard_widgets`
--
ALTER TABLE `dashboard_widgets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario_id` (`usuario_id`),
  ADD KEY `idx_visible` (`visible`);

--
-- Indexes for table `estadisticas_mensuales`
--
ALTER TABLE `estadisticas_mensuales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_anio_mes` (`anio`,`mes`),
  ADD KEY `idx_anio` (`anio`);

--
-- Indexes for table `facturas`
--
ALTER TABLE `facturas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_numero_factura` (`numero_factura`),
  ADD UNIQUE KEY `uk_uuid` (`uuid`),
  ADD KEY `idx_cliente_id` (`cliente_id`),
  ADD KEY `idx_pedido_id` (`pedido_id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_fecha_emision` (`fecha_emision`),
  ADD KEY `idx_fecha_vencimiento` (`fecha_vencimiento`),
  ADD KEY `idx_created_by` (`created_by`);

--
-- Indexes for table `factura_items`
--
ALTER TABLE `factura_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_factura_id` (`factura_id`),
  ADD KEY `idx_pedido_item_id` (`pedido_item_id`);

--
-- Indexes for table `integraciones`
--
ALTER TABLE `integraciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_tipo_proveedor` (`tipo`,`proveedor`),
  ADD KEY `idx_enabled` (`enabled`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario_id` (`usuario_id`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_leida` (`leida`),
  ADD KEY `idx_prioridad` (`prioridad`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `pagos`
--
ALTER TABLE `pagos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_numero_pago` (`numero_pago`),
  ADD KEY `idx_cliente_id` (`cliente_id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_fecha_pago` (`fecha_pago`),
  ADD KEY `idx_metodo_pago` (`metodo_pago`),
  ADD KEY `idx_created_by` (`created_by`),
  ADD KEY `idx_verified_by` (`verified_by`);

--
-- Indexes for table `pago_aplicaciones`
--
ALTER TABLE `pago_aplicaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pago_id` (`pago_id`),
  ADD KEY `idx_factura_id` (`factura_id`),
  ADD KEY `idx_applied_by` (`applied_by`);

--
-- Indexes for table `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_numero_pedido` (`numero_pedido`),
  ADD KEY `idx_cliente_id` (`cliente_id`),
  ADD KEY `idx_cotizacion_id` (`cotizacion_id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_prioridad` (`prioridad`),
  ADD KEY `idx_fecha_entrega_estimada` (`fecha_entrega_estimada`),
  ADD KEY `idx_created_by` (`created_by`),
  ADD KEY `idx_assigned_to` (`assigned_to`);

--
-- Indexes for table `pedido_items`
--
ALTER TABLE `pedido_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pedido_id` (`pedido_id`),
  ADD KEY `idx_servicio_id` (`servicio_id`),
  ADD KEY `idx_estado` (`estado`);

--
-- Indexes for table `proyectos`
--
ALTER TABLE `proyectos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_codigo` (`codigo`),
  ADD KEY `idx_cliente_id` (`cliente_id`),
  ADD KEY `idx_pedido_id` (`pedido_id`),
  ADD KEY `idx_categoria` (`categoria`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_es_destacado` (`es_destacado`),
  ADD KEY `idx_es_publico` (`es_publico`),
  ADD KEY `idx_created_by` (`created_by`);

--
-- Indexes for table `proyecto_imagenes`
--
ALTER TABLE `proyecto_imagenes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_proyecto_id` (`proyecto_id`);

--
-- Indexes for table `seguridad_log`
--
ALTER TABLE `seguridad_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario_id` (`usuario_id`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_email_intento` (`email_intento`),
  ADD KEY `idx_ip` (`ip`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `servicios`
--
ALTER TABLE `servicios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_codigo` (`codigo`),
  ADD KEY `idx_categoria` (`categoria`),
  ADD KEY `idx_estado` (`estado`);

--
-- Indexes for table `sesiones`
--
ALTER TABLE `sesiones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_token` (`token`),
  ADD KEY `idx_usuario_id` (`usuario_id`),
  ADD KEY `idx_activa` (`activa`),
  ADD KEY `idx_fecha_expiracion` (`fecha_expiracion`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_email` (`email`),
  ADD KEY `idx_rol` (`rol`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_ultimo_acceso` (`ultimo_acceso`);

--
-- Indexes for table `webhooks`
--
ALTER TABLE `webhooks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_active` (`active`);

--
-- Indexes for table `webhook_logs`
--
ALTER TABLE `webhook_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_webhook_id` (`webhook_id`),
  ADD KEY `idx_evento` (`evento`),
  ADD KEY `idx_exitoso` (`exitoso`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `actividades`
--
ALTER TABLE `actividades`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `configuracion_general`
--
ALTER TABLE `configuracion_general`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `configuracion_notificaciones`
--
ALTER TABLE `configuracion_notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `configuracion_pagos`
--
ALTER TABLE `configuracion_pagos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `configuracion_seguridad`
--
ALTER TABLE `configuracion_seguridad`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `cotizaciones`
--
ALTER TABLE `cotizaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cotizacion_items`
--
ALTER TABLE `cotizacion_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dashboard_widgets`
--
ALTER TABLE `dashboard_widgets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `estadisticas_mensuales`
--
ALTER TABLE `estadisticas_mensuales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `facturas`
--
ALTER TABLE `facturas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `factura_items`
--
ALTER TABLE `factura_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `integraciones`
--
ALTER TABLE `integraciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pagos`
--
ALTER TABLE `pagos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pago_aplicaciones`
--
ALTER TABLE `pago_aplicaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pedido_items`
--
ALTER TABLE `pedido_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `proyectos`
--
ALTER TABLE `proyectos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `proyecto_imagenes`
--
ALTER TABLE `proyecto_imagenes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `seguridad_log`
--
ALTER TABLE `seguridad_log`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `servicios`
--
ALTER TABLE `servicios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sesiones`
--
ALTER TABLE `sesiones`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `webhooks`
--
ALTER TABLE `webhooks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `webhook_logs`
--
ALTER TABLE `webhook_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

-- --------------------------------------------------------

--
-- Structure for view `v_estado_pedidos`
--
DROP TABLE IF EXISTS `v_estado_pedidos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`cpses_dbxrj0on70`@`localhost` SQL SECURITY DEFINER VIEW `v_estado_pedidos`  AS SELECT `p`.`id` AS `id`, `p`.`numero_pedido` AS `numero_pedido`, `p`.`estado` AS `estado`, `p`.`prioridad` AS `prioridad`, `u`.`nombre` AS `cliente_nombre`, `u`.`empresa` AS `cliente_empresa`, `p`.`total` AS `total`, `p`.`saldo_pendiente` AS `saldo_pendiente`, `p`.`fecha_entrega_estimada` AS `fecha_entrega_estimada`, to_days(`p`.`fecha_entrega_estimada`) - to_days(curdate()) AS `dias_para_entrega`, `p`.`created_at` AS `created_at`, coalesce(`asignado`.`nombre`,'Sin asignar') AS `asignado_a`, count(distinct `pi`.`id`) AS `total_items`, sum(case when `pi`.`estado` = 'completado' then 1 else 0 end) AS `items_completados` FROM (((`pedidos` `p` join `usuarios` `u` on(`p`.`cliente_id` = `u`.`id`)) left join `usuarios` `asignado` on(`p`.`assigned_to` = `asignado`.`id`)) left join `pedido_items` `pi` on(`p`.`id` = `pi`.`pedido_id`)) GROUP BY `p`.`id` ;

-- --------------------------------------------------------

--
-- Structure for view `v_flujo_efectivo`
--
DROP TABLE IF EXISTS `v_flujo_efectivo`;

CREATE ALGORITHM=UNDEFINED DEFINER=`cpses_dbxrj0on70`@`localhost` SQL SECURITY DEFINER VIEW `v_flujo_efectivo`  AS SELECT cast(`p`.`fecha_pago` as date) AS `fecha`, 'Ingreso' AS `tipo`, `p`.`concepto` AS `concepto`, `p`.`monto` AS `monto`, `p`.`metodo_pago` AS `metodo_pago`, `u`.`nombre` AS `cliente` FROM (`pagos` `p` join `usuarios` `u` on(`p`.`cliente_id` = `u`.`id`)) WHERE `p`.`estado` = 'aplicado' AND `p`.`tipo` <> 'devolucion'union all select cast(`p`.`fecha_pago` as date) AS `fecha`,'Egreso' AS `tipo`,`p`.`concepto` AS `concepto`,-`p`.`monto` AS `monto`,`p`.`metodo_pago` AS `metodo_pago`,`u`.`nombre` AS `cliente` from (`pagos` `p` join `usuarios` `u` on(`p`.`cliente_id` = `u`.`id`)) where `p`.`estado` = 'aplicado' and `p`.`tipo` = 'devolucion' order by `fecha` desc  ;

-- --------------------------------------------------------

--
-- Structure for view `v_resumen_cliente`
--
DROP TABLE IF EXISTS `v_resumen_cliente`;

CREATE ALGORITHM=UNDEFINED DEFINER=`cpses_dbxrj0on70`@`localhost` SQL SECURITY DEFINER VIEW `v_resumen_cliente`  AS SELECT `u`.`id` AS `id`, `u`.`nombre` AS `nombre`, `u`.`email` AS `email`, `u`.`empresa` AS `empresa`, `u`.`fecha_registro` AS `fecha_registro`, count(distinct `p`.`id`) AS `total_pedidos`, count(distinct `f`.`id`) AS `total_facturas`, coalesce(sum(`f`.`total`),0) AS `total_facturado`, coalesce(sum(`f`.`saldo_pendiente`),0) AS `saldo_pendiente_total`, max(`p`.`created_at`) AS `ultimo_pedido`, max(`f`.`fecha_emision`) AS `ultima_factura`, max(`pg`.`fecha_pago`) AS `ultimo_pago`, CASE WHEN sum(`f`.`saldo_pendiente`) > 0 THEN 'Con adeudo' WHEN count(`p`.`id`) > 0 THEN 'Activo' ELSE 'Prospecto' END AS `estado_comercial` FROM (((`usuarios` `u` left join `pedidos` `p` on(`u`.`id` = `p`.`cliente_id`)) left join `facturas` `f` on(`u`.`id` = `f`.`cliente_id`)) left join `pagos` `pg` on(`u`.`id` = `pg`.`cliente_id`)) WHERE `u`.`rol` = 'cliente' GROUP BY `u`.`id` ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `actividades`
--
ALTER TABLE `actividades`
  ADD CONSTRAINT `fk_actividades_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `cotizaciones`
--
ALTER TABLE `cotizaciones`
  ADD CONSTRAINT `fk_cotizaciones_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_cotizaciones_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_cotizaciones_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `cotizacion_items`
--
ALTER TABLE `cotizacion_items`
  ADD CONSTRAINT `fk_cotizacion_items_cotizacion` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cotizacion_items_servicio` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `dashboard_widgets`
--
ALTER TABLE `dashboard_widgets`
  ADD CONSTRAINT `fk_dashboard_widgets_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `facturas`
--
ALTER TABLE `facturas`
  ADD CONSTRAINT `fk_facturas_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `fk_facturas_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_facturas_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `factura_items`
--
ALTER TABLE `factura_items`
  ADD CONSTRAINT `fk_factura_items_factura` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_factura_items_pedido_item` FOREIGN KEY (`pedido_item_id`) REFERENCES `pedido_items` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `fk_notificaciones_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pagos`
--
ALTER TABLE `pagos`
  ADD CONSTRAINT `fk_pagos_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `fk_pagos_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pagos_verified_by` FOREIGN KEY (`verified_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `pago_aplicaciones`
--
ALTER TABLE `pago_aplicaciones`
  ADD CONSTRAINT `fk_pago_aplicaciones_applied_by` FOREIGN KEY (`applied_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pago_aplicaciones_factura` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pago_aplicaciones_pago` FOREIGN KEY (`pago_id`) REFERENCES `pagos` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `fk_pedidos_assigned_to` FOREIGN KEY (`assigned_to`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pedidos_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `fk_pedidos_cotizacion` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pedidos_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `pedido_items`
--
ALTER TABLE `pedido_items`
  ADD CONSTRAINT `fk_pedido_items_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pedido_items_servicio` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `proyectos`
--
ALTER TABLE `proyectos`
  ADD CONSTRAINT `fk_proyectos_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_proyectos_created_by` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_proyectos_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `proyecto_imagenes`
--
ALTER TABLE `proyecto_imagenes`
  ADD CONSTRAINT `fk_proyecto_imagenes_proyecto` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `seguridad_log`
--
ALTER TABLE `seguridad_log`
  ADD CONSTRAINT `fk_seguridad_log_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `sesiones`
--
ALTER TABLE `sesiones`
  ADD CONSTRAINT `fk_sesiones_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `webhook_logs`
--
ALTER TABLE `webhook_logs`
  ADD CONSTRAINT `fk_webhook_logs_webhook` FOREIGN KEY (`webhook_id`) REFERENCES `webhooks` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
