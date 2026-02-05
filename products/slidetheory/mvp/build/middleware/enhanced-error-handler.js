/**
 * Enhanced Error Handler Middleware
 * Global error handling with recovery actions and user-friendly messages
 */

const { STATUS, ERROR_CODES, MESSAGES } = require('../config/constants');
const { logger } = require('./logger');
const { logError, generateRecoverySuggestions } = require('../services/error-logger');
const { getCircuitBreaker } = require('../services/circuit-breaker');

/**
 * Custom Application Error with Recovery Actions
 */
class AppError extends Error {
  constructor(code, message, statusCode = STATUS.INTERNAL_ERROR, details = null, recoveryActions = null) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.recoveryActions = recoveryActions;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
  
  /**
   * Add recovery actions to error
   */
  withRecovery(actions) {
    this.recoveryActions = actions;
    return this;
  }
  
  /**
   * Convert to JSON response
   */
  toJSON(includeStack = false) {
    const response = {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp
    };
    
    if (this.details) {
      response.details = this.details;
    }
    
    if (this.recoveryActions) {
      response.recovery = {
        available: true,
        actions: this.recoveryActions
      };
    }
    
    if (includeStack && this.stack) {
      response.stack = this.stack.split('\n').slice(0, 5);
    }
    
    return response;
  }
}

/**
 * Error types with predefined recovery actions
 */
const ErrorTypes = {
  AI_GENERATION_FAILED: (details) => new AppError(
    ERROR_CODES.GENERATION_FAILED,
    MESSAGES.GENERATION_FAILED,
    STATUS.SERVICE_UNAVAILABLE,
    details,
    [
      {
        action: 'regenerate',
        label: 'Regenerate',
        description: 'Try generating the slide again with the same parameters',
        method: 'POST',
        endpoint: '/api/generate',
        icon: 'refresh'
      },
      {
        action: 'simplify',
        label: 'Try simpler prompt',
        description: 'Reduce context length and complexity for better results',
        method: 'POST',
        endpoint: '/api/generate',
        hint: 'Keep context under 500 characters',
        icon: 'minimize'
      },
      {
        action: 'fallback_template',
        label: 'Use template',
        description: 'Use a pre-built template instead',
        method: 'GET',
        endpoint: '/api/templates',
        icon: 'template'
      },
      {
        action: 'contact_support',
        label: 'Contact Support',
        description: 'Get help from our team',
        type: 'link',
        url: 'mailto:support@slidetheory.com?subject=AI%20Generation%20Error',
        icon: 'support'
      }
    ]
  ),
  
  EXPORT_FAILED: (format, details) => new AppError(
    ERROR_CODES.EXPORT_FAILED,
    `Failed to generate ${format.toUpperCase()} export`,
    STATUS.INTERNAL_ERROR,
    details,
    [
      {
        action: 'retry_export',
        label: 'Retry Export',
        description: `Try the ${format.toUpperCase()} export again`,
        method: 'POST',
        endpoint: `/api/export/${format}`,
        icon: 'retry'
      },
      {
        action: 'try_png',
        label: 'Export as PNG',
        description: 'Try exporting as an image instead',
        method: 'POST',
        endpoint: '/api/generate',
        icon: 'image'
      },
      {
        action: 'contact_support',
        label: 'Contact Support',
        description: 'Report this export issue',
        type: 'link',
        url: 'mailto:support@slidetheory.com?subject=Export%20Error',
        icon: 'support'
      }
    ]
  ),
  
  VALIDATION_ERROR: (errors) => new AppError(
    ERROR_CODES.VALIDATION_ERROR,
    'Invalid input provided',
    STATUS.BAD_REQUEST,
    { errors },
    [
      {
        action: 'view_docs',
        label: 'View API Docs',
        description: 'Check the API documentation for correct parameters',
        type: 'link',
        url: '/API.md',
        icon: 'docs'
      },
      {
        action: 'check_health',
        label: 'Check API Status',
        description: 'Verify the API is running correctly',
        method: 'GET',
        endpoint: '/api/health',
        icon: 'health'
      }
    ]
  ),
  
  RATE_LIMIT_ERROR: () => new AppError(
    ERROR_CODES.GENERATION_FAILED,
    MESSAGES.RATE_LIMIT,
    429,
    null,
    [
      {
        action: 'wait_retry',
        label: 'Wait and Retry',
        description: 'Wait 30-60 seconds before trying again',
        hint: 'Rate limits reset after 60 seconds',
        icon: 'clock'
      },
      {
        action: 'check_status',
        label: 'Check Status',
        description: 'View current rate limit status',
        method: 'GET',
        endpoint: '/api/health',
        icon: 'status'
      }
    ]
  ),
  
  TIMEOUT_ERROR: () => new AppError(
    ERROR_CODES.GENERATION_FAILED,
    MESSAGES.TIMEOUT,
    STATUS.SERVICE_UNAVAILABLE,
    null,
    [
      {
        action: 'reduce_complexity',
        label: 'Reduce Complexity',
        description: 'Simplify your request with fewer data points',
        hint: 'Use 3-5 data points maximum',
        icon: 'minimize'
      },
      {
        action: 'regenerate',
        label: 'Try Again',
        description: 'Sometimes requests succeed on retry',
        method: 'POST',
        endpoint: '/api/generate',
        icon: 'refresh'
      }
    ]
  ),
  
  AI_NOT_CONFIGURED: () => new AppError(
    ERROR_CODES.GENERATION_FAILED,
    MESSAGES.AI_NOT_CONFIGURED,
    STATUS.SERVICE_UNAVAILABLE,
    null,
    [
      {
        action: 'use_fallback',
        label: 'Use Fallback Mode',
        description: 'Generate slides using templates without AI',
        hint: 'Falls back to templates automatically',
        icon: 'template'
      },
      {
        action: 'view_docs',
        label: 'Setup Guide',
        description: 'Learn how to configure AI providers',
        type: 'link',
        url: '/DEPLOYMENT.md',
        icon: 'docs'
      }
    ]
  ),
  
  CIRCUIT_OPEN: (service) => new AppError(
    ERROR_CODES.GENERATION_FAILED,
    `${service} service temporarily unavailable`,
    STATUS.SERVICE_UNAVAILABLE,
    { service },
    [
      {
        action: 'wait_retry',
        label: 'Wait Moment',
        description: 'Service will recover automatically in 30 seconds',
        hint: 'Circuit breaker will reset shortly',
        icon: 'clock'
      },
      {
        action: 'use_fallback',
        label: 'Use Fallback',
        description: 'Generate using fallback templates',
        icon: 'template'
      },
      {
        action: 'check_status',
        label: 'Check Status',
        description: 'View service status',
        method: 'GET',
        endpoint: '/api/health',
        icon: 'status'
      }
    ]
  )
};

/**
 * Global error handler middleware
 */
async function errorHandler(err, req, res, next) {
  // Log the error
  logger.error(req, err.message, err, {
    code: err.code || ERROR_CODES.INTERNAL_ERROR,
    stack: err.stack?.split('\n').slice(0, 3)
  });
  
  // Log to file for debugging
  await logError(req, err, {
    body: req.body,
    query: req.query,
    params: req.params
  });
  
  // Default error response
  let statusCode = err.statusCode || STATUS.INTERNAL_ERROR;
  let errorCode = err.code || ERROR_CODES.INTERNAL_ERROR;
  let message = err.message || MESSAGES.INTERNAL_ERROR;
  let details = err.details || null;
  let recoveryActions = err.recoveryActions || null;
  
  // Handle specific error types
  if (err.code === 'CIRCUIT_OPEN') {
    const circuitError = ErrorTypes.CIRCUIT_OPEN(err.service || 'AI');
    statusCode = circuitError.statusCode;
    errorCode = circuitError.code;
    message = circuitError.message;
    recoveryActions = circuitError.recoveryActions;
  } else if (err.message?.includes('timeout') || err.name === 'AbortError') {
    const timeoutError = ErrorTypes.TIMEOUT_ERROR();
    statusCode = timeoutError.statusCode;
    errorCode = timeoutError.code;
    message = timeoutError.message;
    recoveryActions = timeoutError.recoveryActions;
  } else if (err.message?.includes('rate limit') || err.statusCode === 429) {
    const rateError = ErrorTypes.RATE_LIMIT_ERROR();
    statusCode = rateError.statusCode;
    errorCode = rateError.code;
    message = rateError.message;
    recoveryActions = rateError.recoveryActions;
  } else if (err.name === 'ValidationError' || err.code === ERROR_CODES.VALIDATION_ERROR) {
    const validationError = ErrorTypes.VALIDATION_ERROR(details?.errors || err.errors);
    statusCode = validationError.statusCode;
    errorCode = validationError.code;
    message = validationError.message;
    details = validationError.details;
    recoveryActions = validationError.recoveryActions;
  } else if (err.code === 'ENOENT') {
    statusCode = STATUS.NOT_FOUND;
    errorCode = ERROR_CODES.NOT_FOUND;
    message = 'Resource not found';
  } else if (err.message?.includes('AI service not configured') || err.message?.includes('API key')) {
    const configError = ErrorTypes.AI_NOT_CONFIGURED();
    statusCode = configError.statusCode;
    errorCode = configError.code;
    message = configError.message;
    recoveryActions = configError.recoveryActions;
  }
  
  // Generate recovery actions if not already set
  if (!recoveryActions && statusCode >= 500) {
    recoveryActions = generateRecoverySuggestions(err, 'unknown');
  }
  
  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    message = MESSAGES.INTERNAL_ERROR;
    details = null;
  }
  
  // Build response
  const response = {
    success: false,
    error: errorCode,
    message,
    requestId: req.id
  };
  
  if (details) {
    response.details = details;
  }
  
  if (recoveryActions) {
    response.recovery = {
      available: true,
      actions: recoveryActions
    };
  }
  
  // Add debugging info in development
  if (process.env.NODE_ENV !== 'production') {
    response.debug = {
      stack: err.stack?.split('\n').slice(0, 5),
      originalError: err.message,
      circuitState: getCircuitBreaker('ai').getState().state
    };
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
    message: 'Endpoint not found. Check the API documentation.',
    recovery: {
      available: true,
      actions: [
        {
          action: 'view_docs',
          label: 'View API Documentation',
          type: 'link',
          url: '/API.md',
          icon: 'docs'
        },
        {
          action: 'list_endpoints',
          label: 'List Available Endpoints',
          method: 'GET',
          endpoint: '/api/health',
          icon: 'list'
        }
      ]
    }
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

/**
 * Wrap controller with circuit breaker
 */
function withCircuitBreaker(controller, breakerName) {
  const breaker = getCircuitBreaker(breakerName);
  return asyncHandler(async (req, res, next) => {
    try {
      await breaker.execute(() => controller(req, res, next));
    } catch (err) {
      next(err);
    }
  });
}

/**
 * Validation error wrapper
 */
function validationError(errors) {
  return ErrorTypes.VALIDATION_ERROR(errors);
}

module.exports = {
  AppError,
  ErrorTypes,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  withCircuitBreaker,
  validationError
};
