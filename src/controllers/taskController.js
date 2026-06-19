const prisma = require('../prisma');

// Valid TaskPriority enum values
const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

// Valid TaskStatus enum values
const VALID_STATUSES = ['Pending', 'In_Progress', 'Completed'];

/**
 * Get all tasks for the authenticated user
 * GET /api/tasks
 * Optional query params: projectId (to filter by project)
 */
const getAllTasks = async (req, res, next) => {
  try {
    const { projectId } = req.query;

    // Build where clause for tenant isolation
    const whereClause = {
      userId: req.user.id
    };

    // If projectId filter is provided, validate it belongs to user
    if (projectId) {
      if (typeof projectId !== 'string' || !projectId.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: [{ field: 'projectId', message: 'Project ID must be a non-empty string.' }]
        });
      }

      // Verify project exists and belongs to user
      const project = await prisma.project.findUnique({
        where: { id: projectId.trim() },
        select: { userId: true }
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Project not found.'
        });
      }

      if (project.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to access this project.'
        });
      }

      whereClause.projectId = projectId.trim();
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        priority: true,
        status: true,
        dueDate: true,
        projectId: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific task by ID
 * GET /api/tasks/:id
 */
const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Validate ID
    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: [{ field: 'id', message: 'Task ID is required.' }]
      });
    }

    // 2. Query task with tenant isolation
    const task = await prisma.task.findUnique({
      where: { id: id.trim() },
      select: {
        id: true,
        name: true,
        description: true,
        priority: true,
        status: true,
        dueDate: true,
        projectId: true,
        userId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Task not found.'
      });
    }

    // 3. Verify tenant isolation - user can only access their own tasks
    if (task.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to access this task.'
      });
    }

    // Return task without userId field
    const { userId, ...taskData } = task;
    return res.status(200).json({
      success: true,
      data: taskData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new task
 * POST /api/tasks
 */
const createTask = async (req, res, next) => {
  try {
    const { name, description, priority, status, dueDate, projectId } = req.body;

    // 1. Validate name (required, non-empty string)
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: [{ field: 'name', message: 'Task name is required.' }]
      });
    }

    // 2. Validate description (optional, but if provided must be string)
    if (description !== undefined && typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: [{ field: 'description', message: 'Description must be a string.' }]
      });
    }

    // 3. Validate priority (optional, but if provided must be valid enum value)
    if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: [{
          field: 'priority',
          message: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}`
        }]
      });
    }

    // 4. Validate status (optional, but if provided must be valid enum value)
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: [{
          field: 'status',
          message: `Status must be one of: ${VALID_STATUSES.join(', ')}`
        }]
      });
    }

    // 5. Validate dueDate (optional, but if provided must be valid ISO date)
    if (dueDate !== undefined && dueDate !== null) {
      const parsedDueDate = new Date(dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: [{ field: 'dueDate', message: 'Due date must be a valid ISO date.' }]
        });
      }
    }

    // 6. Validate projectId (required)
    if (!projectId || typeof projectId !== 'string' || !projectId.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: [{ field: 'projectId', message: 'Project ID is required.' }]
      });
    }

    // 7. Verify project exists and belongs to the authenticated user
    const project = await prisma.project.findUnique({
      where: { id: projectId.trim() },
      select: { userId: true }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Project not found.'
      });
    }

    if (project.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to create tasks in this project.'
      });
    }

    // 8. Create the task with tenant isolation
    const newTask = await prisma.task.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        priority: priority || 'Medium',
        status: status || 'Pending',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: projectId.trim(),
        userId: req.user.id
      },
      select: {
        id: true,
        name: true,
        description: true,
        priority: true,
        status: true,
        dueDate: true,
        projectId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: newTask
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing task
 * PUT /api/tasks/:id
 */
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, priority, status, dueDate, projectId } = req.body;

    // 1. Validate ID
    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: [{ field: 'id', message: 'Task ID is required.' }]
      });
    }

    // 2. Verify task exists and belongs to user
    const existingTask = await prisma.task.findUnique({
      where: { id: id.trim() }
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Task not found.'
      });
    }

    if (existingTask.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to update this task.'
      });
    }

    // 3. Validate provided fields
    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: [{ field: 'name', message: 'Task name must be a non-empty string.' }]
      });
    }

    if (description !== undefined && description !== null && typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: [{ field: 'description', message: 'Description must be a string.' }]
      });
    }

    if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: [{
          field: 'priority',
          message: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}`
        }]
      });
    }

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: [{
          field: 'status',
          message: `Status must be one of: ${VALID_STATUSES.join(', ')}`
        }]
      });
    }

    if (dueDate !== undefined && dueDate !== null) {
      const parsedDueDate = new Date(dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: [{ field: 'dueDate', message: 'Due date must be a valid ISO date.' }]
        });
      }
    }

    // 4. If projectId is provided, verify it belongs to user
    if (projectId !== undefined) {
      if (typeof projectId !== 'string' || !projectId.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: [{ field: 'projectId', message: 'Project ID must be a non-empty string.' }]
        });
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId.trim() },
        select: { userId: true }
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Project not found.'
        });
      }

      if (project.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to move tasks to this project.'
        });
      }
    }

    // 5. Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (projectId !== undefined) updateData.projectId = projectId.trim();

    // 6. Update the task
    const updatedTask = await prisma.task.update({
      where: { id: id.trim() },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        priority: true,
        status: true,
        dueDate: true,
        projectId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task
 * DELETE /api/tasks/:id
 */
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Validate ID
    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: [{ field: 'id', message: 'Task ID is required.' }]
      });
    }

    // 2. Verify task exists and belongs to user
    const task = await prisma.task.findUnique({
      where: { id: id.trim() }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Task not found.'
      });
    }

    if (task.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to delete this task.'
      });
    }

    // 3. Delete the task
    await prisma.task.delete({
      where: { id: id.trim() }
    });

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
