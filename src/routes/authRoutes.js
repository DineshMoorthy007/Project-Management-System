const express = require('express');
const { rateLimit } = require('express-rate-limit');
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Rate limiter configured strictly for the login endpoint
// Limits each IP to 5 attempts per 15-minute window to mitigate brute-force attempts
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,                  // Max 5 attempts
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in standard headers
  legacyHeaders: false,  // Disable non-standard legacy headers
});

// Authentication endpoints mounting
router.post('/register', authController.register);
router.post('/login', loginRateLimiter, authController.login);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
