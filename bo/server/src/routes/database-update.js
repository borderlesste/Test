const express = require('express');
const router = express.Router();
const { pool } = require('../config/db.js');

// Route to update database schema for clients system
router.post('/update-for-clients', async (req, res) => {
  try {
    const updates = [];
    
    // 1. Add client_id column to projects table if it doesn't exist
    try {
      await pool.execute(`
        ALTER TABLE proyectos 
        ADD COLUMN cliente_id INT NULL AFTER id,
        ADD INDEX idx_cliente_id (cliente_id),
        ADD FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE SET NULL
      `);
      updates.push('Added cliente_id to proyectos table');
    } catch (error) {
      if (!error.message.includes('Duplicate column name')) {
        throw error;
      }
      updates.push('cliente_id column already exists in proyectos table');
    }
    
    // 2. Create notifications table if it doesn't exist
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS notificaciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        tipo VARCHAR(50) NOT NULL DEFAULT 'info',
        titulo VARCHAR(255) NOT NULL,
        mensaje TEXT NOT NULL,
        prioridad ENUM('baja', 'normal', 'alta', 'critica') DEFAULT 'normal',
        leida BOOLEAN DEFAULT FALSE,
        entidad_tipo VARCHAR(50) NULL,
        entidad_id INT NULL,
        accion_url VARCHAR(500) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_usuario_id (usuario_id),
        INDEX idx_tipo (tipo),
        INDEX idx_leida (leida),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    updates.push('Created/verified notificaciones table');
    
    // 3. Verify that activities table has the correct structure
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS actividades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        descripcion TEXT NOT NULL,
        entidad_tipo VARCHAR(50) NULL,
        entidad_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_usuario_id (usuario_id),
        INDEX idx_tipo (tipo),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    updates.push('Created/verified actividades table');
    
    // 4. Create project gallery table for multiple images
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS proyecto_galeria (
        id INT AUTO_INCREMENT PRIMARY KEY,
        proyecto_id INT NOT NULL,
        imagen_url VARCHAR(500) NOT NULL,
        descripcion VARCHAR(255) NULL,
        orden INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_proyecto_id (proyecto_id),
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    updates.push('Created/verified proyecto_galeria table');

    // 5. Create quotations table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS cotizaciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        numero_cotizacion VARCHAR(20) UNIQUE NOT NULL,
        cliente_id INT NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT NULL,
        subtotal DECIMAL(10,2) DEFAULT 0.00,
        impuestos DECIMAL(10,2) DEFAULT 0.00,
        total DECIMAL(10,2) DEFAULT 0.00,
        moneda VARCHAR(3) DEFAULT 'MXN',
        estado ENUM('borrador', 'enviada', 'aprobada', 'rechazada', 'expirada', 'convertida', 'cancelada') DEFAULT 'borrador',
        validez_dias INT DEFAULT 30,
        fecha_expiracion DATE NULL,
        notas TEXT NULL,
        template_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_cliente_id (cliente_id),
        INDEX idx_numero_cotizacion (numero_cotizacion),
        INDEX idx_estado (estado),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    updates.push('Created/verified cotizaciones table');

    // 6. Create quotation items table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS cotizacion_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cotizacion_id INT NOT NULL,
        descripcion TEXT NOT NULL,
        cantidad DECIMAL(8,2) DEFAULT 1.00,
        precio_unitario DECIMAL(10,2) DEFAULT 0.00,
        subtotal DECIMAL(10,2) DEFAULT 0.00,
        orden INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_cotizacion_id (cotizacion_id),
        FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    updates.push('Created/verified cotizacion_items table');

    // 7. Create quotation templates table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS cotizacion_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT NULL,
        contenido_html LONGTEXT NULL,
        estilos_css TEXT NULL,
        variables_disponibles JSON NULL,
        es_activo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    updates.push('Created/verified cotizacion_templates table');
    
    // 8. Get current table structures for verification
    const [projectsStructure] = await pool.execute('DESCRIBE proyectos');
    const [notificationsStructure] = await pool.execute('DESCRIBE notificaciones');
    const [activitiesStructure] = await pool.execute('DESCRIBE actividades');
    const [galleryStructure] = await pool.execute('DESCRIBE proyecto_galeria');
    const [quotationsStructure] = await pool.execute('DESCRIBE cotizaciones');
    const [quotationItemsStructure] = await pool.execute('DESCRIBE cotizacion_items');
    const [quotationTemplatesStructure] = await pool.execute('DESCRIBE cotizacion_templates');
    
    // 9. Get table counts
    const [projectsCount] = await pool.execute('SELECT COUNT(*) as count FROM proyectos');
    const [usersCount] = await pool.execute('SELECT COUNT(*) as count FROM usuarios');
    const [notificationsCount] = await pool.execute('SELECT COUNT(*) as count FROM notificaciones');
    const [activitiesCount] = await pool.execute('SELECT COUNT(*) as count FROM actividades');
    const [quotationsCount] = await pool.execute('SELECT COUNT(*) as count FROM cotizaciones');
    const [quotationItemsCount] = await pool.execute('SELECT COUNT(*) as count FROM cotizacion_items');
    
    res.json({
      success: true,
      message: 'Database updated successfully for clients system',
      updates,
      verification: {
        tables: {
          proyectos: {
            columns: projectsStructure.map(col => col.Field),
            count: projectsCount[0].count
          },
          usuarios: {
            count: usersCount[0].count
          },
          notificaciones: {
            columns: notificationsStructure.map(col => col.Field),
            count: notificationsCount[0].count
          },
          actividades: {
            columns: activitiesStructure.map(col => col.Field),
            count: activitiesCount[0].count
          },
          proyecto_galeria: {
            columns: galleryStructure.map(col => col.Field),
            count: 0 // New table
          },
          cotizaciones: {
            columns: quotationsStructure.map(col => col.Field),
            count: quotationsCount[0].count
          },
          cotizacion_items: {
            columns: quotationItemsStructure.map(col => col.Field),
            count: quotationItemsCount[0].count
          },
          cotizacion_templates: {
            columns: quotationTemplatesStructure.map(col => col.Field),
            count: 0 // New table
          }
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error updating database for clients:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating database for clients system',
      error: error.message
    });
  }
});

// Route to create sample clients for testing
router.post('/create-sample-clients', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    
    // Check if sample clients already exist
    const [existingClients] = await pool.execute(
      'SELECT COUNT(*) as count FROM usuarios WHERE rol = "cliente"'
    );
    
    if (existingClients[0].count > 0) {
      return res.json({
        success: true,
        message: `Already have ${existingClients[0].count} clients in database`
      });
    }
    
    const sampleClients = [
      {
        nombre: 'Juan Pérez González',
        email: 'juan.perez@empresa1.com',
        telefono: '+52 55 1234 5678',
        direccion: 'Av. Reforma 123, Col. Centro, CDMX',
        empresa: 'Tecnología Innovadora S.A.',
        rfc: 'PEGJ850123ABC'
      },
      {
        nombre: 'María Carmen López',
        email: 'maria.lopez@startup2.com',
        telefono: '+52 55 9876 5432',
        direccion: 'Calle Insurgentes 456, Col. Roma Norte, CDMX',
        empresa: 'Startup Digital MX',
        rfc: 'LOCM901215DEF'
      },
      {
        nombre: 'Carlos Rodriguez Mendoza',
        email: 'carlos.rodriguez@comercial3.com',
        telefono: '+52 55 5555 1111',
        direccion: 'Blvd. Avila Camacho 789, Polanco, CDMX',
        empresa: 'Comercial Internacional Ltd.',
        rfc: 'ROMC750308GHI'
      }
    ];
    
    const hashedPassword = await bcrypt.hash('cliente123', 10);
    
    for (const client of sampleClients) {
      await pool.execute(
        `INSERT INTO usuarios (nombre, email, password, telefono, direccion, empresa, rfc, rol, estado) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'cliente', 'activo')`,
        [client.nombre, client.email, hashedPassword, client.telefono, client.direccion, client.empresa, client.rfc]
      );
    }
    
    res.json({
      success: true,
      message: `Created ${sampleClients.length} sample clients successfully`,
      clients: sampleClients.map(c => ({ nombre: c.nombre, email: c.email, empresa: c.empresa })),
      default_password: 'cliente123'
    });
    
  } catch (error) {
    console.error('Error creating sample clients:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating sample clients',
      error: error.message
    });
  }
});

module.exports = router;