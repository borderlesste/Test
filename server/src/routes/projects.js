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

// Rutas protegidas (requieren autenticación admin)
// TODO: Agregar middleware de autenticación para admin
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

module.exports = router;