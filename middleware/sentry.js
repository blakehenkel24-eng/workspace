/**
 * Sentry Middleware for Express
 * 
 * Usage in server.js:
 * 
 * const sentry = require('./lib/sentry');
 * 
 * // Initialize Sentry first
 * sentry.initSentry();
 * 
 * // Add request handler middleware
 * app.use(sentry.requestHandler());
 * 
 * // ... your routes ...
 * 
 * // Add error handler middleware (must be last)
 * app.use(sentry.errorHandler());
 */

const { 
  initSentry, 
  requestHandler, 
  errorHandler, 
  setUser, 
  addBreadcrumb,
  captureException 
} = require('../lib/sentry');

/**
 * Middleware to set Sentry user context from session/token
 */
function sentryUserMiddleware(req, res, next) {
  if (req.user) {
    setUser(req.user);
  }
  next();
}

/**
 * Middleware to track API requests as breadcrumbs
 */
function sentryBreadcrumbMiddleware(req, res, next) {
  // Add breadcrumb for API requests
  if (req.path.startsWith('/api/')) {
    addBreadcrumb('api', `${req.method} ${req.path}`, {
      query: req.query,
      // Don't include body as it may contain sensitive data
    });
  }
  next();
}

/**
 * Middleware to track slow requests
 */
function sentryPerformanceMiddleware(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow requests (>5 seconds)
    if (duration > 5000) {
      addBreadcrumb('performance', 'Slow request detected', {
        path: req.path,
        method: req.method,
        duration: `${duration}ms`,
        statusCode: res.statusCode
      });
    }
  });
  
  next();
}

/**
 * Error logging middleware - logs errors but doesn't handle them
 * Use this before your error handlers
 */
function sentryLoggingMiddleware(err, req, res, next) {
  // Add request context
  const context = {
    tags: {
      url: req.path,
      method: req.method,
      statusCode: res.statusCode
    },
    extra: {
      query: req.query,
      // Include sanitized headers
      headers: sanitizeHeaders(req.headers),
      // Include user if available
      userId: req.user?.id
    }
  };
  
  // Capture the exception
  captureException(err, context);
  
  // Pass to next error handler
  next(err);
}

/**
 * Sanitize headers to remove sensitive information
 */
function sanitizeHeaders(headers) {
  const sanitized = { ...headers };
  const sensitive = ['cookie', 'authorization', 'x-api-key', 'x-auth-token'];
  
  sensitive.forEach(header => {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

module.exports = {
  initSentry,
  requestHandler,
  errorHandler,
  sentryUserMiddleware,
  sentryBreadcrumbMiddleware,
  sentryPerformanceMiddleware,
  sentryLoggingMiddleware
};
