# Rate Limiting Configuration

SlideTheory uses tiered rate limiting to protect API endpoints from abuse while allowing legitimate usage.

## Rate Limit Tiers

| Tier | Generate | Export | Status | Other |
|------|----------|--------|--------|-------|
| **Anonymous** | 5/hour | N/A | 60/hour | 60/hour |
| **Free** | 20/hour | 10/hour | 120/hour | 120/hour |
| **Pro** | 100/hour | 50/hour | 600/hour | 600/hour |
| **Enterprise** | 1000/hour | 500/hour | 5000/hour | 5000/hour |

## Response Headers

Every API response includes rate limit headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1707139200
```

## Rate Limit Response

When limit is exceeded:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 2457

{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Try again in 2457 seconds.",
    "details": {
      "limit": 100,
      "remaining": 0,
      "retryAfter": 2457
    }
  }
}
```

## Usage

### Basic Setup

```javascript
const express = require('express');
const { rateLimitMiddleware } = require('./middleware/rate-limit');

const app = express();

// Apply to all API routes
app.use('/api/', rateLimitMiddleware());
```

### Per-Route Configuration

```javascript
const { rateLimitMiddleware } = require('./middleware/rate-limit');

// Strict limits for slide generation
app.post('/api/slides/generate', 
  rateLimitMiddleware({ skipSuccessfulRequests: true }),
  generateController
);

// Lenient limits for status checks
app.get('/api/slides/:id/status', 
  rateLimitMiddleware(),
  statusController
);
```

### Custom Handler

```javascript
app.use('/api/', rateLimitMiddleware({
  handler: (req, res, next, rateLimitInfo) => {
    // Log rate limit hits
    console.log(`Rate limit hit: ${req.ip}`);
    
    // Custom response
    res.status(429).json({
      error: 'Custom rate limit message',
      upgradeUrl: '/pricing'
    });
  }
}));
```

### Admin Bypass

```javascript
const { bypassRateLimit, strictRateLimit } = require('./middleware/rate-limit');

// Bypass rate limiting for admin
app.use('/api/admin/', bypassRateLimit);

// Extra strict for sensitive endpoints
app.post('/api/admin/users', strictRateLimit, createUser);
```

## Production Considerations

### Redis Backend

For production with multiple servers, use Redis:

```javascript
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

// Replace in-memory store with Redis
async function checkRateLimit(clientId, tier, endpoint) {
  const key = `ratelimit:${clientId}:${endpoint}`;
  const { limit, window } = getRateLimit(tier, endpoint);
  
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window);
  }
  
  const ttl = await redis.ttl(key);
  
  return {
    allowed: current <= limit,
    limit,
    remaining: Math.max(0, limit - current),
    retryAfter: ttl
  };
}
```

### Monitoring

Track rate limiting metrics:

```javascript
// Log rate limit events
const { captureMessage } = require('./lib/sentry');

app.use((req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(body) {
    if (res.statusCode === 429) {
      captureMessage('Rate limit exceeded', 'warning', {
        userId: req.user?.id,
        path: req.path,
        tier: req.user?.plan || 'anonymous'
      });
    }
    return originalJson.call(this, body);
  };
  
  next();
});
```

## Testing Rate Limits

```bash
# Test anonymous limit (should fail after 5 requests)
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/slides/generate \
    -H "Content-Type: application/json" \
    -d '{"slideType":"General","context":"test"}'
  echo ""
done

# Test with API key
for i in {1..25}; do
  curl -X POST http://localhost:3000/api/slides/generate \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"slideType":"General","context":"test"}'
  echo ""
done
```
