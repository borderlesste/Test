// server/src/controllers/projectsController.js
const { pool } = require('../config/db.js');

// Obtener todos los proyectos
const getAllProjects = async (req, res) => {
  try {
    const { categoria, limit } = req.query;
    
    let query = 'SELECT * FROM proyectos WHERE es_publico = 1';
    const params = [];
    
    if (categoria && categoria !== 'all') {
      query += ' AND categoria = ?';
      params.push(categoria);
    }
    
    query += ' ORDER BY orden_portfolio ASC, created_at DESC';
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }
    
    const [rows] = await pool.execute(query, params);
    
    // Mapear los datos a la estructura esperada por el frontend
    const projects = rows.map(project => ({
      id: project.id,
      nombre: project.nombre,
      descripcion: project.descripcion,
      imagen: project.imagen_principal,
      url: project.repositorio,
      demo: project.url_demo,
      categoria: project.categoria,
      estado: project.estado,
      tecnologias: project.tecnologias ? (
        typeof project.tecnologias === 'string' ? 
        JSON.parse(project.tecnologias) : 
        project.tecnologias.split(',').map(t => t.trim())
      ) : [],
      es_destacado: project.es_destacado,
      created_at: project.created_at
    }));
    
    res.json({
      success: true,
      data: projects,
      total: projects.length
    });
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener un proyecto por ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(
      'SELECT * FROM proyectos WHERE id = ? AND es_publico = 1',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }
    
    const project = {
      id: rows[0].id,
      nombre: rows[0].nombre,
      descripcion: rows[0].descripcion,
      imagen: rows[0].imagen_principal,
      url: rows[0].repositorio,
      demo: rows[0].url_demo,
      categoria: rows[0].categoria,
      estado: rows[0].estado,
      tecnologias: rows[0].tecnologias ? (
        typeof rows[0].tecnologias === 'string' ? 
        JSON.parse(rows[0].tecnologias) : 
        rows[0].tecnologias.split(',').map(t => t.trim())
      ) : [],
      es_destacado: rows[0].es_destacado,
      created_at: rows[0].created_at
    };
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error al obtener proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear nuevo proyecto (solo para admin)
const createProject = async (req, res) => {
  try {
    const { nombre, descripcion, imagen, url, demo, tecnologias, categoria, estado } = req.body;
    
    if (!nombre || !descripcion) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y descripción son requeridos'
      });
    }
    
    const tecnologiasJson = JSON.stringify(tecnologias || []);
    
    // Generar código único para el proyecto
    const codigo = `${(categoria || 'web').toUpperCase()}${Date.now().toString().slice(-6)}`;
    
    const [result] = await pool.execute(
      'INSERT INTO proyectos (codigo, nombre, descripcion, imagen_principal, repositorio, url_demo, tecnologias, categoria, estado, es_publico, es_destacado, orden_portfolio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        codigo,
        nombre, 
        descripcion, 
        imagen || null, 
        url || null, 
        demo || null, 
        tecnologiasJson, 
        categoria || 'web',
        estado || 'planificacion',
        1, // es_publico por defecto
        0, // no destacado por defecto
        0  // orden por defecto
      ]
    );
    
    res.status(201).json({
      success: true,
      message: 'Proyecto creado exitosamente',
      data: {
        id: result.insertId,
        codigo,
        nombre,
        descripcion,
        imagen,
        url,
        demo,
        tecnologias,
        categoria: categoria || 'web',
        estado: estado || 'planificacion'
      }
    });
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar proyecto (solo para admin)
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, imagen, url, demo, tecnologias, categoria, estado, es_destacado, es_publico } = req.body;
    
    // Verificar que el proyecto existe
    const [existing] = await pool.execute('SELECT id FROM proyectos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }
    
    const tecnologiasJson = tecnologias ? JSON.stringify(tecnologias) : null;
    
    const [result] = await pool.execute(
      'UPDATE proyectos SET nombre = ?, descripcion = ?, imagen_principal = ?, repositorio = ?, url_demo = ?, tecnologias = ?, categoria = ?, estado = ?, es_destacado = ?, es_publico = ? WHERE id = ?',
      [
        nombre, 
        descripcion, 
        imagen || null, 
        url || null, 
        demo || null, 
        tecnologiasJson, 
        categoria, 
        estado,
        es_destacado || 0,
        es_publico !== undefined ? es_publico : 1,
        id
      ]
    );
    
    res.json({
      success: true,
      message: 'Proyecto actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar proyecto (solo para admin)
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute('DELETE FROM proyectos WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Proyecto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};