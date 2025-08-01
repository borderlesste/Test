SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE IF NOT EXISTS `auditoria_logs` (
  `id` bigint(20) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `evento` varchar(50) NOT NULL,
  `descripcion` text NOT NULL,
  `entidad_tipo` varchar(50) DEFAULT NULL,
  `entidad_id` int(11) DEFAULT NULL,
  `datos_adicionales` text DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `configuracion` (
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

CREATE TABLE IF NOT EXISTS `configuracion_notificaciones` (
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

CREATE TABLE IF NOT EXISTS `configuracion_pagos` (
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

CREATE TABLE IF NOT EXISTS `cotizaciones` (
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

CREATE TABLE IF NOT EXISTS `cotizacion_items` (
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

CREATE TABLE IF NOT EXISTS `dashboard_widgets` (
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

CREATE TABLE IF NOT EXISTS `estadisticas_mensuales` (
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

CREATE TABLE IF NOT EXISTS `facturas` (
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

CREATE TABLE IF NOT EXISTS `factura_items` (
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

CREATE TABLE IF NOT EXISTS `integraciones` (
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

CREATE TABLE IF NOT EXISTS `notificaciones` (
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

CREATE TABLE IF NOT EXISTS `pagos` (
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

CREATE TABLE IF NOT EXISTS `pago_aplicaciones` (
  `id` int(11) NOT NULL,
  `pago_id` int(11) NOT NULL,
  `factura_id` int(11) NOT NULL,
  `monto_aplicado` decimal(12,2) NOT NULL,
  `fecha_aplicacion` datetime NOT NULL DEFAULT current_timestamp(),
  `applied_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pedidos` (
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

CREATE TABLE IF NOT EXISTS `pedido_items` (
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

CREATE TABLE IF NOT EXISTS `proyectos` (
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

CREATE TABLE IF NOT EXISTS `proyecto_imagenes` (
  `id` int(11) NOT NULL,
  `proyecto_id` int(11) NOT NULL,
  `titulo` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `url` varchar(500) NOT NULL,
  `tipo` enum('screenshot','diagrama','mockup','otro') NOT NULL DEFAULT 'screenshot',
  `orden` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `servicios` (
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

CREATE TABLE IF NOT EXISTS `sesiones` (
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

CREATE TABLE IF NOT EXISTS `usuarios` (
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

CREATE TABLE IF NOT EXISTS `webhooks` (
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

CREATE TABLE IF NOT EXISTS `webhook_logs` (
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

CREATE OR REPLACE VIEW `v_estado_pedidos` AS SELECT `p`.`id` AS `id`, `p`.`numero_pedido` AS `numero_pedido`, `p`.`estado` AS `estado`, `p`.`prioridad` AS `prioridad`, `u`.`nombre` AS `cliente_nombre`, `u`.`empresa` AS `cliente_empresa`, `p`.`total` AS `total`, `p`.`saldo_pendiente` AS `saldo_pendiente`, `p`.`fecha_entrega_estimada` AS `fecha_entrega_estimada`, to_days(`p`.`fecha_entrega_estimada`) - to_days(curdate()) AS `dias_para_entrega`, `p`.`created_at` AS `created_at`, coalesce(`asignado`.`nombre`,'Sin asignar') AS `asignado_a`, count(distinct `pi`.`id`) AS `total_items`, sum(case when `pi`.`estado` = 'completado' then 1 else 0 end) AS `items_completados` FROM (((`pedidos` `p` join `usuarios` `u` on(`p`.`cliente_id` = `u`.`id`)) left join `usuarios` `asignado` on(`p`.`assigned_to` = `asignado`.`id`)) left join `pedido_items` `pi` on(`p`.`id` = `pi`.`pedido_id`)) GROUP BY `p`.`id`;

CREATE OR REPLACE VIEW `v_flujo_efectivo` AS SELECT cast(`p`.`fecha_pago` as date) AS `fecha`, 'Ingreso' AS `tipo`, `p`.`concepto` AS `concepto`, `p`.`monto` AS `monto`, `p`.`metodo_pago` AS `metodo_pago`, `u`.`nombre` AS `cliente` FROM (`pagos` `p` join `usuarios` `u` on(`p`.`cliente_id` = `u`.`id`)) WHERE `p`.`estado` = 'aplicado' AND `p`.`tipo` <> 'devolucion' union all select cast(`p`.`fecha_pago` as date) AS `fecha`,'Egreso' AS `tipo`,`p`.`concepto` AS `concepto`,-`p`.`monto` AS `monto`,`p`.`metodo_pago` AS `metodo_pago`,`u`.`nombre` AS `cliente` from (`pagos` `p` join `usuarios` `u` on(`p`.`cliente_id` = `u`.`id`)) where `p`.`estado` = 'aplicado' and `p`.`tipo` = 'devolucion' order by `fecha` desc;

CREATE OR REPLACE VIEW `v_resumen_cliente` AS SELECT `u`.`id` AS `id`, `u`.`nombre` AS `nombre`, `u`.`email` AS `email`, `u`.`empresa` AS `empresa`, `u`.`fecha_registro` AS `fecha_registro`, count(distinct `p`.`id`) AS `total_pedidos`, count(distinct `f`.`id`) AS `total_facturas`, coalesce(sum(`f`.`total`),0) AS `total_facturado`, coalesce(sum(`f`.`saldo_pendiente`),0) AS `saldo_pendiente_total`, max(`p`.`created_at`) AS `ultimo_pedido`, max(`f`.`fecha_emision`) AS `ultima_factura`, max(`pg`.`fecha_pago`) AS `ultimo_pago`, CASE WHEN sum(`f`.`saldo_pendiente`) > 0 THEN 'Con adeudo' WHEN count(`p`.`id`) > 0 THEN 'Activo' ELSE 'Prospecto' END AS `estado_comercial` FROM (((`usuarios` `u` left join `pedidos` `p` on(`u`.`id` = `p`.`cliente_id`)) left join `facturas` `f` on(`u`.`id` = `f`.`cliente_id`)) left join `pagos` `pg` on(`u`.`id` = `pg`.`cliente_id`)) WHERE `u`.`rol` = 'cliente' GROUP BY `u`.`id`;
