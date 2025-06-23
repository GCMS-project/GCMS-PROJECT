const logger = require('../utils/logger');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, code = null, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ApiError(404, message, 'RESOURCE_NOT_FOUND');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = new ApiError(400, message, 'DUPLICATE_FIELD');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ApiError(400, message, 'VALIDATION_ERROR');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new ApiError(401, message, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new ApiError(401, message, 'TOKEN_EXPIRED');
  }

  // PostgreSQL errors
  if (err.code === '23505') { // Unique violation
    const message = 'Resource already exists';
    error = new ApiError(409, message, 'DUPLICATE_RESOURCE');
  }

  if (err.code === '23503') { // Foreign key violation
    const message = 'Referenced resource does not exist';
    error = new ApiError(400, message, 'FOREIGN_KEY_VIOLATION');
  }

  if (err.code === '23502') { // Not null violation
    const message = 'Required field is missing';
    error = new ApiError(400, message, 'NULL_VIOLATION');
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    const message = 'Validation failed';
    error = new ApiError(400, message, 'VALIDATION_ERROR');
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const code = error.code || 'INTERNAL_ERROR';

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(statusCode).json({
    success: false,
    message: isDevelopment ? message : 'Something went wrong',
    code,
    ...(isDevelopment && { stack: err.stack }),
    ...(isDevelopment && { details: error }),
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
};

/**
 * 404 handler for undefined routes
 */
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND');
  next(error);
};

/**
 * Async error wrapper for controllers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle unhandled promise rejections
 */
const handleUnhandledRejection = (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
};

/**
 * Handle uncaught exceptions
 */
const handleUncaughtException = (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
};

module.exports = {
  ApiError,
  errorHandler,
  notFound,
  asyncHandler,
  handleUnhandledRejection,
  handleUncaughtException,
}; 