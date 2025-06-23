const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require('./logger');

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_for_gcms_system_2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} - True if passwords match
 */
const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logger.error('Error comparing passwords:', error);
    throw new Error('Failed to compare passwords');
  }
};

/**
 * Generate JWT token for user
 * @param {Object} payload - Token payload
 * @returns {string} - JWT token
 */
const generateToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'gcms-backend',
      audience: 'gcms-users',
    });
  } catch (error) {
    logger.error('Error generating JWT token:', error);
    throw new Error('Failed to generate token');
  }
};

/**
 * Generate refresh token
 * @param {Object} payload - Token payload
 * @returns {string} - Refresh token
 */
const generateRefreshToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: 'gcms-backend',
      audience: 'gcms-users',
    });
  } catch (error) {
    logger.error('Error generating refresh token:', error);
    throw new Error('Failed to generate refresh token');
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} - Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'gcms-backend',
      audience: 'gcms-users',
    });
  } catch (error) {
    logger.error('Error verifying JWT token:', error);
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Decode JWT token without verification (for logging purposes)
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded token payload or null
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error('Error decoding JWT token:', error);
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header
 * @returns {string|null} - Token or null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

/**
 * Create user payload for JWT token
 * @param {Object} user - User object
 * @returns {Object} - Token payload
 */
const createUserPayload = (user) => {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name,
    is_verified: user.is_verified,
  };
};

/**
 * Check if user has required role
 * @param {string} userRole - User's role
 * @param {string|Array} requiredRole - Required role(s)
 * @returns {boolean} - True if user has required role
 */
const hasRole = (userRole, requiredRole) => {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  return userRole === requiredRole;
};

/**
 * Check if user has required permission
 * @param {Object} userPermissions - User's permissions
 * @param {string} resource - Resource name
 * @param {string} action - Action name
 * @returns {boolean} - True if user has required permission
 */
const hasPermission = (userPermissions, resource, action) => {
  if (!userPermissions) return false;
  
  // Check for admin permission
  if (userPermissions.all === true) return true;
  
  // Check for specific resource permission
  if (userPermissions[resource]) {
    if (Array.isArray(userPermissions[resource])) {
      return userPermissions[resource].includes(action);
    }
    return userPermissions[resource] === true;
  }
  
  return false;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
  extractTokenFromHeader,
  createUserPayload,
  hasRole,
  hasPermission,
  JWT_SECRET,
  JWT_EXPIRES_IN,
}; 