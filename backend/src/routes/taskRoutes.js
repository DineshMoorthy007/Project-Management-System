const express = require('express');
const authenticateToken = require('../middleware/auth');
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

const router = express.Router();

/**
 * GET /api/tasks
 * Retrieve all tasks for the authenticated user
 * Query params: projectId (optional - filter by project)
 * Protected: Yes (requires valid JWT)
 */
router.get('/', authenticateToken, getAllTasks);

/**
 * GET /api/tasks/:id
 * Retrieve a specific task by ID
 * Protected: Yes (requires valid JWT, user must own the task)
 */
router.get('/:id', authenticateToken, getTaskById);

/**
 * POST /api/tasks
 * Create a new task
 * Protected: Yes (requires valid JWT)
 * Body: { name, description?, priority?, status?, dueDate?, projectId }
 * Note: projectId must belong to the authenticated user
 */
router.post('/', authenticateToken, createTask);

/**
 * PUT /api/tasks/:id
 * Update an existing task
 * Protected: Yes (requires valid JWT, user must own the task)
 * Body: { name?, description?, priority?, status?, dueDate?, projectId? }
 * Note: if projectId is provided, it must belong to the authenticated user
 */
router.put('/:id', authenticateToken, updateTask);

/**
 * DELETE /api/tasks/:id
 * Delete a task
 * Protected: Yes (requires valid JWT, user must own the task)
 */
router.delete('/:id', authenticateToken, deleteTask);

module.exports = router;
