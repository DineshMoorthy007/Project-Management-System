const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Extracts and verifies the JSON Web Token (JWT) from the Authorization header.
 * Attaches the authenticated user metadata to both `req.user` and `req.currentUser`.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Extract token from "Bearer <token>" format
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Access token is missing or malformed.'
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('[Middleware Error] JWT_SECRET environment variable is missing.');
    // Fail-safe default for development environments only
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error: Secure session configuration missing.'
      });
    }
  }

  // Verify the JWT
  jwt.verify(token, secret || 'default-dev-secret-key-10293847', (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Access token is invalid or has expired.'
      });
    }

    // Extract the identity subject / userId from standard JWT claims
    const userContext = {
      id: decoded.sub || decoded.userId || decoded.id
    };

    // Attach user data to req object
    req.user = userContext;         // User's request requirement
    req.currentUser = userContext;  // Compatibility for requirements.md specs

    next();
  });
};

module.exports = authenticateToken;
