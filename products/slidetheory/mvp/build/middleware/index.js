/**
 * Middleware Index
 * Centralized middleware exports
 */

const { errorHandler, notFoundHandler, asyncHandler, AppError } = require('./error-handler');
const { validate, validateParams } = require('./validator');
const { authenticate, authenticateApiKey, authorize, rateLimit } = require('./auth');
const { logger, requestId, requestLogger, performanceMonitor } = require('./logger');

module.exports = {
  // Error handling
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  
  // Validation
  validate,
  validateParams,
  
  // Authentication
  authenticate,
  authenticateApiKey,
  authorize,
  rateLimit,
  
  // Logging
  logger,
  requestId,
  requestLogger,
  performanceMonitor
};
