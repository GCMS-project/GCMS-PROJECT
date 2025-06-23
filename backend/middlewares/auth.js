const { verifyToken, extractTokenFromHeader, hasRole } = require('../utils/auth');
const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Middleware to verify JWT token and attach user to request
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
        code: 'TOKEN_REQUIRED'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from database
    const userResult = await query(
      'SELECT id, email, phone, first_name, last_name, role, is_active, is_verified FROM users WHERE id = $1 AND deleted_at IS NULL',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated',
        code: 'USER_DEACTIVATED'
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;
    
    logger.info('User authenticated', { userId: user.id, email: user.email, role: user.role });
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.message === 'Token expired') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
};

/**
 * Middleware to check if user has required role(s)
 * @param {string|Array} roles - Required role(s)
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    if (!hasRole(req.user.role, roles)) {
      logger.warn('Access denied - insufficient role', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles
      });
      
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is verified
 */
const requireVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTHENTICATION_REQUIRED'
    });
  }

  if (!req.user.is_verified) {
    return res.status(403).json({
      success: false,
      message: 'Account verification required',
      code: 'VERIFICATION_REQUIRED'
    });
  }

  next();
};

/**
 * Middleware to check if user owns the resource or has admin role
 * @param {string} resourceUserIdField - Field name containing the user ID in the resource
 */
const requireOwnership = (resourceUserIdField = 'user_id') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    const resourceId = req.params.id || req.params.pickupId || req.params.tenderId || req.params.bidId;
    
    if (!resourceId) {
      return res.status(400).json({
        success: false,
        message: 'Resource ID is required',
        code: 'RESOURCE_ID_REQUIRED'
      });
    }

    try {
      // Determine table name from request path
      let tableName = 'pickup_requests';
      if (req.path.includes('/tenders')) {
        tableName = 'tenders';
      } else if (req.path.includes('/bids')) {
        tableName = 'bids';
      } else if (req.path.includes('/payments')) {
        tableName = 'payments';
      } else if (req.path.includes('/verifications')) {
        tableName = 'dump_verifications';
      }

      const result = await query(
        `SELECT ${resourceUserIdField} FROM ${tableName} WHERE id = $1 AND deleted_at IS NULL`,
        [resourceId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
          code: 'RESOURCE_NOT_FOUND'
        });
      }

      const resourceUserId = result.rows[0][resourceUserIdField];
      
      if (resourceUserId !== req.user.id) {
        logger.warn('Access denied - resource ownership', {
          userId: req.user.id,
          resourceId,
          resourceUserId
        });
        
        return res.status(403).json({
          success: false,
          message: 'Access denied - you can only access your own resources',
          code: 'ACCESS_DENIED'
        });
      }

      next();
    } catch (error) {
      logger.error('Error checking resource ownership:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      
      const userResult = await query(
        'SELECT id, email, phone, first_name, last_name, role, is_active, is_verified FROM users WHERE id = $1 AND deleted_at IS NULL',
        [decoded.id]
      );

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        if (user.is_active) {
          req.user = user;
          req.userId = user.id;
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    logger.debug('Optional authentication failed:', error.message);
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireVerification,
  requireOwnership,
  optionalAuth,
}; 