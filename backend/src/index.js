const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Project Management System API is healthy.',
    timestamp: new Date().toISOString()
  });
});

// Centralized Error-Handling Middleware
app.use((err, req, res, next) => {
  console.error(`[Error] ${err.stack || err.message}`);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[Server] Listening on port ${PORT}`);
});
