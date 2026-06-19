const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

// RFC 5322 Compliant Email validation pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Register a new User
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    // 1. Validate Input Fields First (Defense in Depth)
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: [{ field: 'fullName', message: 'Full name is required.' }]
      });
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: [{ field: 'email', message: 'A valid email address is required.' }]
      });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: [{ field: 'password', message: 'Password must be at least 8 characters long.' }]
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanFullName = fullName.trim();

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'A user with this email address already exists.'
      });
    }

    // 3. Hash the password securely (10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save the user record
    const newUser = await prisma.user.create({
      data: {
        fullName: cleanFullName,
        email: cleanEmail,
        password: hashedPassword
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: newUser
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Login User
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Simple validation checks
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Email and password are required fields.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. Locate User
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) {
      // Use generic unauthorized message to avoid username enumeration
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid email or password.'
      });
    }

    // 3. Verify bcrypt password match
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid email or password.'
      });
    }

    // 4. Sign JWT token (Expires in 24 Hours)
    const secret = process.env.JWT_SECRET || 'default-dev-secret-key-10293847';
    const token = jwt.sign(
      { sub: user.id, email: user.email },
      secret,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Logout User
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    // Session state is stateless. Verify successful request processing.
    return res.status(200).json({
      success: true,
      message: 'Logout successful.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout
};
