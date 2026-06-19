const prisma = require('../prisma');

// Valid ProjectStatus enum values
const VALID_STATUSES = ['Not_Started', 'In_Progress', 'Completed'];

/**
 * Get all projects for the authenticated user
 * GET /api/projects
 */
const getAllProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        userId: req.user.id
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific project by ID
 * GET /api/projects/:id
 */
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Validate ID is provided
    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: [{ field: 'id', message: 'Project ID is required.' }]
      });
    }

    // 2. Query project with tenant isolation
    const project = await prisma.project.findUnique({
      where: { id: id.trim() },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        userId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Project not found.'
      });
    }

    // 3. Verify tenant isolation - user can only access their own projects
    if (project.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to access this project.'
      });
    }

    // Return project without userId field
    const { userId, ...projectData } = project;
    return res.status(200).json({
      success: true,
      data: projectData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new project
 * POST /api/projects
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description, status, startDate, endDate } = req.body;

    // 1. Validate name (required, non-empty string)
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: [{ field: 'name', message: 'Project name is required.' }]
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

    // 3. Validate status (optional, but if provided must be valid enum value)
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

    // 4. Validate dates (optional, but if provided must be valid ISO dates)
    if (startDate !== undefined && startDate !== null) {
      const parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: [{ field: 'startDate', message: 'Start date must be a valid ISO date.' }]
        });
      }
    }

    if (endDate !== undefined && endDate !== null) {
      const parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: [{ field: 'endDate', message: 'End date must be a valid ISO date.' }]
        });
      }
    }

    // 5. Create the project with tenant isolation
    const newProject = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        status: status || 'Not_Started',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        userId: req.user.id
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: newProject
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing project
 * PUT /api/projects/:id
 */
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status, startDate, endDate } = req.body;

    // 1. Validate ID
    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: [{ field: 'id', message: 'Project ID is required.' }]
      });
    }

    // 2. Verify project exists and belongs to user
    const existingProject = await prisma.project.findUnique({
      where: { id: id.trim() }
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Project not found.'
      });
    }

    if (existingProject.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to update this project.'
      });
    }

    // 3. Validate provided fields
    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: [{ field: 'name', message: 'Project name must be a non-empty string.' }]
      });
    }

    if (description !== undefined && description !== null && typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: [{ field: 'description', message: 'Description must be a string.' }]
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

    if (startDate !== undefined && startDate !== null) {
      const parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: [{ field: 'startDate', message: 'Start date must be a valid ISO date.' }]
        });
      }
    }

    if (endDate !== undefined && endDate !== null) {
      const parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: [{ field: 'endDate', message: 'End date must be a valid ISO date.' }]
        });
      }
    }

    // 4. Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (status !== undefined) updateData.status = status;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;

    // 5. Update the project
    const updatedProject = await prisma.project.update({
      where: { id: id.trim() },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      data: updatedProject
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a project
 * DELETE /api/projects/:id
 */
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Validate ID
    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: [{ field: 'id', message: 'Project ID is required.' }]
      });
    }

    // 2. Verify project exists and belongs to user
    const project = await prisma.project.findUnique({
      where: { id: id.trim() }
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
        message: 'You do not have permission to delete this project.'
      });
    }

    // 3. Delete the project (cascades to associated tasks)
    await prisma.project.delete({
      where: { id: id.trim() }
    });

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
