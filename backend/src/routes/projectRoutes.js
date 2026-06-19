const express = require('express');
const authenticateToken = require('../middleware/auth');
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

const router = express.Router();

/**
 * GET /api/projects
 * Retrieve all projects for the authenticated user
 * Protected: Yes (requires valid JWT)
 */
router.get('/', authenticateToken, getAllProjects);

/**
 * GET /api/projects/:id
 * Retrieve a specific project by ID
 * Protected: Yes (requires valid JWT, user must own the project)
 */
router.get('/:id', authenticateToken, getProjectById);

/**
 * POST /api/projects
 * Create a new project
 * Protected: Yes (requires valid JWT)
 * Body: { name, description?, status?, startDate?, endDate? }
 */
router.post('/', authenticateToken, createProject);

/**
 * PUT /api/projects/:id
 * Update an existing project
 * Protected: Yes (requires valid JWT, user must own the project)
 * Body: { name?, description?, status?, startDate?, endDate? }
 */
router.put('/:id', authenticateToken, updateProject);

/**
 * DELETE /api/projects/:id
 * Delete a project (cascades to associated tasks)
 * Protected: Yes (requires valid JWT, user must own the project)
 */
router.delete('/:id', authenticateToken, deleteProject);

module.exports = router;
