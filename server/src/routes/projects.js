// server/src/routes/projects.js
const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectsController.js');

// Rutas públicas
router.get('/', getAllProjects);
router.get('/:id', getProjectById);

// Ruta para crear datos de muestra (temporal)
router.post('/create-sample-data', async (req, res) => {
  try {
    const { pool } = require('../config/db.js');
    
    // Verificar si la tabla proyectos existe
    const [tables] = await pool.execute("SHOW TABLES LIKE 'proyectos'");
    if (tables.length === 0) {
      // Crear tabla si no existe
      await pool.execute(`
        CREATE TABLE proyectos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          codigo VARCHAR(20) UNIQUE NOT NULL,
          nombre VARCHAR(255) NOT NULL,
          descripcion TEXT,
          imagen_principal VARCHAR(500),
          repositorio VARCHAR(500),
          url_demo VARCHAR(500),
          tecnologias JSON,
          categoria VARCHAR(50) DEFAULT 'web',
          estado VARCHAR(50) DEFAULT 'planificacion',
          es_publico BOOLEAN DEFAULT 1,
          es_destacado BOOLEAN DEFAULT 0,
          orden_portfolio INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
    }
    
    // Verificar si ya hay datos
    const [existing] = await pool.execute('SELECT COUNT(*) as count FROM proyectos');
    if (existing[0].count > 0) {
      return res.json({
        success: true,
        message: `Ya existen ${existing[0].count} proyectos en la base de datos`
      });
    }
    
    // Crear proyectos de muestra
    const sampleProjects = [
      {
        codigo: 'WEB001',
        nombre: 'Sistema de Gestión Empresarial',
        descripcion: 'Plataforma completa para la gestión de clientes, pedidos y pagos de empresas. Incluye dashboard administrativo, gestión de usuarios y reportes avanzados.',
        imagen_principal: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        repositorio: 'https://github.com/borderlesste/saas-platform',
        url_demo: 'https://borderlesstechno.com',
        tecnologias: JSON.stringify(['React', 'Node.js', 'MySQL', 'Express', 'Tailwind CSS']),
        categoria: 'web',
        estado: 'completado',
        es_publico: 1,
        es_destacado: 1,
        orden_portfolio: 1
      },
      {
        codigo: 'WEB002',
        nombre: 'E-commerce Moderno',
        descripcion: 'Tienda online completa con carrito de compras, integración de pagos, gestión de inventario y panel administrativo.',
        imagen_principal: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
        repositorio: null,
        url_demo: null,
        tecnologias: JSON.stringify(['Vue.js', 'Laravel', 'MySQL', 'Stripe', 'Bootstrap']),
        categoria: 'ecommerce',
        estado: 'en_desarrollo',
        es_publico: 1,
        es_destacado: 0,
        orden_portfolio: 2
      },
      {
        codigo: 'APP001',
        nombre: 'App Móvil de Delivery',
        descripcion: 'Aplicación móvil para pedidos de comida con geolocalización, seguimiento en tiempo real y múltiples métodos de pago.',
        imagen_principal: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
        repositorio: null,
        url_demo: null,
        tecnologias: JSON.stringify(['React Native', 'Firebase', 'Google Maps API', 'PayPal']),
        categoria: 'mobile',
        estado: 'completado',
        es_publico: 1,
        es_destacado: 1,
        orden_portfolio: 3
      }
    ];
    
    for (const project of sampleProjects) {
      await pool.execute(
        'INSERT INTO proyectos (codigo, nombre, descripcion, imagen_principal, repositorio, url_demo, tecnologias, categoria, estado, es_publico, es_destacado, orden_portfolio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          project.codigo,
          project.nombre,
          project.descripcion,
          project.imagen_principal,
          project.repositorio,
          project.url_demo,
          project.tecnologias,
          project.categoria,
          project.estado,
          project.es_publico,
          project.es_destacado,
          project.orden_portfolio
        ]
      );
    }
    
    res.json({
      success: true,
      message: `Se crearon ${sampleProjects.length} proyectos de muestra exitosamente`,
      data: sampleProjects.map(p => ({ codigo: p.codigo, nombre: p.nombre }))
    });
    
  } catch (error) {
    console.error('Error creando datos de muestra:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando datos de muestra',
      error: error.message
    });
  }
});

// Rutas protegidas (requieren autenticación admin)
// TODO: Agregar middleware de autenticación para admin
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

module.exports = router;