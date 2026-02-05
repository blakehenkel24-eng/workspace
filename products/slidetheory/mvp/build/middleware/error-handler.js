/**
 * Centralized Error Handler
 * Global error handling middleware
 */

const { STATUS, ERROR_CODES, MESSAGES } = require('../config/constants');
const logger = require('./logger');

/**
 * Custom Application Error
 */
class AppError extends Error {
  constructor(code, message, statusCode = STATUS.INTERNAL_ERROR, details = null) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
  // Log the error
  logger.error(req, err.message, err, {
    code: err.code || ERROR_CODES.INTERNAL_ERROR,
    stack: err.stack?.split('\n').slice(0, 3)
  });
  
  // Default error response
  let statusCode = err.statusCode || STATUS.INTERNAL_ERROR;
  let errorCode = err.code || ERROR_CODES.INTERNAL_ERROR;
  let message = err.message || MESSAGES.INTERNAL_ERROR;
  let details = err.details || null;
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = STATUS.BAD_REQUEST;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
  } else if (err.code === 'ENOENT') {
    statusCode = STATUS.NOT_FOUND;
    errorCode = ERROR_CODES.NOT_FOUND;
    message = 'Resource not found';
  } else if (err.message?.includes('timeout')) {
    statusCode = STATUS.SERVICE_UNAVAILABLE;
    errorCode = ERROR_CODES.GENERATION_FAILED;
    message = MESSAGES.TIMEOUT;
  } else if (err.message?.includes('rate limit')) {
    statusCode = STATUS.TOO_MANY_REQUESTS || 429;
    errorCode = ERROR_CODES.GENERATION_FAILED;
    message = MESSAGES.RATE_LIMIT;
  }
  
  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    message = MESSAGES.INTERNAL_ERROR;
    details = null;
  }
  
  const response = {
    success: false,
    error: errorCode,
    message
  };
  
  if (details) {
    response.details = details;
  }
  
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack?.split('\n').slice(0, 5);
  }
  
  res.status(statusCode).json(response);
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  logger.warn(req, 'Endpoint not found', { path: req.path, method: req.method });
  
  res.status(STATUS.NOT_FOUND).json({
    success: false,
    error: ERROR_CODES.NOT_FOUND,
    message: 'Endpoint not found. Check the API documentation.'
  });
}

/**
 * Async handler wrapper for controllers
 * Eliminates need for try-catch in every async controller
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  asyncHandler
};
