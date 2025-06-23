const logger = require('../utils/logger');

/**
 * Middleware to validate request body using Zod schema
 * @param {Object} schema - Zod validation schema
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      logger.warn('Validation error:', {
        path: req.path,
        method: req.method,
        errors: error.errors
      });

      const errorMessages = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages,
        code: 'VALIDATION_ERROR'
      });
    }
  };
};

/**
 * Middleware to validate query parameters using Zod schema
 * @param {Object} schema - Zod validation schema
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData;
      next();
    } catch (error) {
      logger.warn('Query validation error:', {
        path: req.path,
        method: req.method,
        errors: error.errors
      });

      const errorMessages = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));

      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: errorMessages,
        code: 'QUERY_VALIDATION_ERROR'
      });
    }
  };
};

/**
 * Middleware to validate URL parameters using Zod schema
 * @param {Object} schema - Zod validation schema
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData;
      next();
    } catch (error) {
      logger.warn('Parameter validation error:', {
        path: req.path,
        method: req.method,
        errors: error.errors
      });

      const errorMessages = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));

      return res.status(400).json({
        success: false,
        message: 'Invalid URL parameters',
        errors: errorMessages,
        code: 'PARAM_VALIDATION_ERROR'
      });
    }
  };
};

/**
 * Middleware to validate file uploads
 * @param {Object} options - Upload options
 */
const validateFileUpload = (options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    maxFiles = 5
  } = options;

  return (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded',
        code: 'NO_FILES_UPLOADED'
      });
    }

    const files = Array.isArray(req.files) ? req.files : Object.values(req.files);

    if (files.length > maxFiles) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${maxFiles} files allowed`,
        code: 'TOO_MANY_FILES'
      });
    }

    for (const file of files) {
      // Check file size
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File ${file.name} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`,
          code: 'FILE_TOO_LARGE'
        });
      }

      // Check file type
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `File type ${file.mimetype} is not allowed`,
          code: 'INVALID_FILE_TYPE'
        });
      }
    }

    next();
  };
};

/**
 * Middleware to sanitize input data
 */
const sanitizeInput = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Remove HTML tags and trim whitespace
        req.body[key] = req.body[key].replace(/<[^>]*>/g, '').trim();
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].replace(/<[^>]*>/g, '').trim();
      }
    });
  }

  next();
};

/**
 * Middleware to validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (page < 1) {
    return res.status(400).json({
      success: false,
      message: 'Page number must be greater than 0',
      code: 'INVALID_PAGE'
    });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100',
      code: 'INVALID_LIMIT'
    });
  }

  req.pagination = { page, limit };
  next();
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
  validateFileUpload,
  sanitizeInput,
  validatePagination,
}; 