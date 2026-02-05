/**
 * Rate Limiting Middleware
 * 
 * Protects API endpoints from abuse using sliding window rate limiting.
 * Supports different limits by tier: anonymous, free, pro, enterprise.
 */

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map();

// Cleanup interval (run every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    // Remove entries older than 1 hour
    if (now - data.resetTime > 3600000) {
      rateLimitStore.delete(key);
    }
  }
}, 300000);

/**
 * Rate limit configuration by tier
 */
const RATE_LIMITS = {
  anonymous: {
    generate: { limit: 5, window: 3600 },    // 5 per hour
    export: { limit: 0, window: 3600 },       // Not allowed
    status: { limit: 60, window: 3600 },      // 60 per hour
    default: { limit: 60, window: 3600 }      // 60 per hour
  },
  free: {
    generate: { limit: 20, window: 3600 },    // 20 per hour
    export: { limit: 10, window: 3600 },      // 10 per hour
    status: { limit: 120, window: 3600 },     // 120 per hour
    default: { limit: 120, window: 3600 }     // 120 per hour
  },
  pro: {
    generate: { limit: 100, window: 3600 },   // 100 per hour
    export: { limit: 50, window: 3600 },      // 50 per hour
    status: { limit: 600, window: 3600 },     // 600 per hour
    default: { limit: 600, window: 3600 }     // 600 per hour
  },
  enterprise: {
    generate: { limit: 1000, window: 3600 },  // 1000 per hour
    export: { limit: 500, window: 3600 },     // 500 per hour
    status: { limit: 5000, window: 3600 },    // 5000 per hour
    default: { limit: 5000, window: 3600 }    // 5000 per hour
  }
};

/**
 * Get client identifier from request
 */
function getClientId(req) {
  // Use authenticated user ID if available
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }
  
  // Use API key if available
  const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
  if (apiKey) {
    return `api:${apiKey.slice(-8)}`; // Use last 8 chars of key
  }
  
  // Fall back to IP address (with anonymization)
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  return `ip:${ip.replace(/\.\d+$/, '.0')}`; // Anonymize last octet
}

/**
 * Get user's tier from request
 */
function getUserTier(req) {
  if (req.user?.plan) {
    return req.user.plan;
  }
  
  if (req.headers['authorization']) {
    return 'free'; // Authenticated but no plan = free tier
  }
  
  return 'anonymous';
}

/**
 * Get rate limit for endpoint and tier
 */
function getRateLimit(tier, endpoint) {
  const tierConfig = RATE_LIMITS[tier] || RATE_LIMITS.anonymous;
  
  // Map endpoints to limit categories
  let category = 'default';
  if (endpoint.includes('/generate')) category = 'generate';
  else if (endpoint.includes('/export')) category = 'export';
  else if (endpoint.includes('/status')) category = 'status';
  
  return tierConfig[category] || tierConfig.default;
}

/**
 * Check if request is within rate limit
 */
function checkRateLimit(clientId, tier, endpoint) {
  const now = Date.now();
  const { limit, window } = getRateLimit(tier, endpoint);
  const key = `${clientId}:${endpoint}`;
  
  let data = rateLimitStore.get(key);
  
  if (!data) {
    data = {
      count: 0,
      resetTime: now + (window * 1000),
      window: window
    };
    rateLimitStore.set(key, data);
  }
  
  // Reset if window has passed
  if (now > data.resetTime) {
    data.count = 0;
    data.resetTime = now + (window * 1000);
  }
  
  // Check limit
  const allowed = data.count < limit;
  
  if (allowed) {
    data.count++;
  }
  
  return {
    allowed,
    limit,
    remaining: Math.max(0, limit - data.count),
    resetTime: data.resetTime,
    retryAfter: allowed ? 0 : Math.ceil((data.resetTime - now) / 1000)
  };
}

/**
 * Express middleware for rate limiting
 * 
 * Usage:
 *   app.use('/api/', rateLimitMiddleware());
 *   
 * Or with options:
 *   app.use('/api/slides/generate', rateLimitMiddleware({ skipSuccessfulRequests: true }));
 */
function rateLimitMiddleware(options = {}) {
  const {
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = null,
    handler = null
  } = options;
  
  return function rateLimit(req, res, next) {
    // Skip rate limiting for health checks
    if (req.path === '/health' || req.path === '/api/health') {
      return next();
    }
    
    const clientId = keyGenerator ? keyGenerator(req) : getClientId(req);
    const tier = getUserTier(req);
    const result = checkRateLimit(clientId, tier, req.path);
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', result.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));
    
    // Check if allowed
    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter);
      
      // Use custom handler if provided
      if (handler) {
        return handler(req, res, next, result);
      }
      
      // Default rate limit response
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
          details: {
            limit: result.limit,
            remaining: 0,
            retryAfter: result.retryAfter
          },
          requestId: req.id
        }
      });
    }
    
    // Track successful/failed requests if needed
    if (skipSuccessfulRequests || skipFailedRequests) {
      const originalEnd = res.end;
      
      res.end = function(chunk, encoding) {
        res.end = originalEnd;
        res.end(chunk, encoding);
        
        const isSuccess = res.statusCode < 400;
        
        if ((skipSuccessfulRequests && isSuccess) || (skipFailedRequests && !isSuccess)) {
          // Decrement the counter for skipped requests
          const key = `${clientId}:${req.path}`;
          const data = rateLimitStore.get(key);
          if (data && data.count > 0) {
            data.count--;
          }
        }
      };
    }
    
    next();
  };
}

/**
 * Middleware for strict rate limiting (admin endpoints, etc.)
 */
function strictRateLimit(req, res, next) {
  const clientId = getClientId(req);
  const key = `strict:${clientId}:${req.path}`;
  const now = Date.now();
  
  // Very strict: 10 requests per minute
  const limit = 10;
  const window = 60; // 1 minute
  
  let data = rateLimitStore.get(key);
  
  if (!data || now > data.resetTime) {
    data = { count: 0, resetTime: now + (window * 1000) };
    rateLimitStore.set(key, data);
  }
  
  if (data.count >= limit) {
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please slow down.',
        requestId: req.id
      }
    });
  }
  
  data.count++;
  next();
}

/**
 * Middleware to bypass rate limiting (for internal/admin requests)
 */
function bypassRateLimit(req, res, next) {
  req.rateLimitBypass = true;
  next();
}

/**
 * Get current rate limit status for a client
 * Useful for dashboard display
 */
function getRateLimitStatus(clientId, tier, endpoint) {
  const { limit, window } = getRateLimit(tier, endpoint);
  const key = `${clientId}:${endpoint}`;
  const data = rateLimitStore.get(key);
  const now = Date.now();
  
  if (!data || now > data.resetTime) {
    return {
      limit,
      remaining: limit,
      resetTime: now + (window * 1000)
    };
  }
  
  return {
    limit,
    remaining: Math.max(0, limit - data.count),
    resetTime: data.resetTime
  };
}

module.exports = {
  rateLimitMiddleware,
  strictRateLimit,
  bypassRateLimit,
  getRateLimitStatus,
  RATE_LIMITS,
  // Exposed for testing
  _resetStore: () => rateLimitStore.clear(),
  _getStore: () => rateLimitStore
};
