/**
 * Sentry Error Tracking Integration
 * 
 * This module initializes Sentry for error tracking and performance monitoring.
 * Include this early in your application startup.
 */

const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

// Initialize Sentry only if DSN is configured
function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  
  if (!dsn) {
    console.log('[Sentry] DSN not configured, error tracking disabled');
    return null;
  }

  Sentry.init({
    dsn: dsn,
    environment: process.env.SENTRY_ENVIRONMENT || 'development',
    release: process.env.SENTRY_RELEASE || process.env.npm_package_version,
    
    // Performance monitoring
    tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE 
      ? parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) 
      : 0.1, // Sample 10% of transactions
    
    // Enable profiling (requires @sentry/profiling-node)
    // profilesSampleRate: 0.1,
    
    // Before send hook to scrub sensitive data
    beforeSend(event) {
      // Remove sensitive headers
      if (event.request) {
        delete event.request.headers?.cookie;
        delete event.request.headers?.authorization;
        delete event.request.headers?['x-api-key'];
        
        // Scrub request body if present
        if (event.request.data) {
          event.request.data = '[SCRUBBED]';
        }
      }
      
      // Remove sensitive user data
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
        // Keep only a hashed user ID for tracking
        if (event.user.id) {
          event.user.id = hashUserId(event.user.id);
        }
      }
      
      return event;
    },
    
    // Ignore common non-actionable errors
    ignoreErrors: [
      // Network errors
      'Network Error',
      'Failed to fetch',
      'Network request failed',
      // Browser extensions
      /^.*extension.*$/i,
      /^.*plugin.*$/i,
      // Common spam errors
      'top.GLOBALS',
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'http://tt.epicplay.com',
      'Can't find variable: ZiteReader',
      'jigsaw is not defined',
      'ComboSearch is not defined',
      'http://loading.retry.widdit.com/',
      'atomicFindClose',
      // Facebook borked
      'fb_xd_fragment',
      // ISP "optimizing" proxy
      'bmi_SafeAddOnload',
      'EBCallBackMessageReceived',
      // Random plugins
      /^conduitPage$/i
    ],
    
    // Ignore certain URLs
    denyUrls: [
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      // Firefox extensions
      /^resource:\/\//i,
      // Google Tag Manager
      /gtm\.js/i,
      // Facebook
      /connect\.facebook\.net/i,
      // Other common third parties
      /google-analytics\.com/i,
      /googletagmanager\.com/i
    ]
  });

  console.log(`[Sentry] Initialized for ${process.env.SENTRY_ENVIRONMENT || 'development'}`);
  
  return Sentry;
}

/**
 * Hash user ID for privacy while maintaining ability to track errors by user
 */
function hashUserId(userId) {
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(String(userId))
    .update(process.env.SENTRY_DSN || 'salt') // Add salt from DSN
    .digest('hex')
    .substring(0, 16);
}

/**
 * Set user context for Sentry
 * Call this when a user logs in
 */
function setUser(user) {
  if (!user || !user.id) {
    Sentry.setUser(null);
    return;
  }
  
  Sentry.setUser({
    id: hashUserId(user.id),
    // Only include non-PII data
    role: user.role,
    plan: user.plan
  });
}

/**
 * Clear user context on logout
 */
function clearUser() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for tracking user actions
 */
function addBreadcrumb(category, message, data = {}) {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: Sentry.Severity.Info
  });
}

/**
 * Capture exception with additional context
 */
function captureException(error, context = {}) {
  Sentry.withScope(scope => {
    // Add extra context
    if (context.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    
    if (context.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    
    if (context.level) {
      scope.setLevel(context.level);
    }
    
    Sentry.captureException(error);
  });
}

/**
 * Capture message
 */
function captureMessage(message, level = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Start performance transaction
 */
function startTransaction(name, op) {
  return Sentry.startTransaction({
    name,
    op
  });
}

/**
 * Express middleware to track requests
 */
function requestHandler() {
  return Sentry.Handlers.requestHandler({
    ip: false // Don't capture IP addresses
  });
}

/**
 * Express error handler
 */
function errorHandler() {
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Don't report 4xx errors (client errors)
      if (error.statusCode >= 400 && error.statusCode < 500) {
        return false;
      }
      // Only report 5xx and unhandled errors
      return true;
    }
  });
}

module.exports = {
  initSentry,
  setUser,
  clearUser,
  addBreadcrumb,
  captureException,
  captureMessage,
  startTransaction,
  requestHandler,
  errorHandler,
  Sentry
};
