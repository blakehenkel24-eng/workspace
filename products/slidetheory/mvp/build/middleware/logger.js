/**
 * Request Logger Middleware
 * Structured logging for all requests
 */

const crypto = require('crypto');

// Store for request timing
const requestStartTimes = new WeakMap();

/**
 * Logger utility with structured output
 */
const logger = {
  info: (req, message, meta = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      requestId: req?.id,
      message,
      ...meta
    }));
  },
  
  error: (req, message, error, meta = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      requestId: req?.id,
      message,
      error: error?.message || error,
      stack: error?.stack?.split('\n')[0],
      ...meta
    }));
  },
  
  warn: (req, message, meta = {}) => {
    console.warn(JSON.stringify({
      level: 'warn',
      timestamp: new Date().toISOString(),
      requestId: req?.id,
      message,
      ...meta
    }));
  },
  
  debug: (req, message, meta = {}) => {
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(JSON.stringify({
        level: 'debug',
        timestamp: new Date().toISOString(),
        requestId: req?.id,
        message,
        ...meta
      }));
    }
  }
};

/**
 * Request ID middleware
 * Assigns unique ID to each request
 */
function requestId(req, res, next) {
  req.id = crypto.randomUUID().slice(0, 8);
  res.setHeader('X-Request-Id', req.id);
  next();
}

/**
 * Request logging middleware
 * Logs incoming requests and responses
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();
  requestStartTimes.set(req, startTime);
  
  logger.info(req, 'Request started', {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip || req.connection?.remoteAddress
  });
  
  // Capture response finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration
    };
    
    if (level === 'warn') {
      logger.warn(req, 'Request completed with warning', logData);
    } else {
      logger.info(req, 'Request completed', logData);
    }
  });
  
  next();
}

/**
 * Performance monitoring middleware
 * Logs slow requests
 */
function performanceMonitor(thresholdMs = 5000) {
  return (req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      if (duration > thresholdMs) {
        logger.warn(req, 'Slow request detected', {
          method: req.method,
          path: req.path,
          durationMs: duration,
          thresholdMs
        });
      }
    });
    
    next();
  };
}

module.exports = {
  logger,
  requestId,
  requestLogger,
  performanceMonitor
};
