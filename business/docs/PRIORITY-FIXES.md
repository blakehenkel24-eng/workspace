# 🚨 PRIORITY FIXES
## Immediate Actions Required for SlideTheory Security

**Document Version:** 1.0  
**Last Updated:** February 5, 2026  
**Classification:** URGENT

---

## Quick Reference

| Priority | Finding | Action | Effort | Owner |
|----------|---------|--------|--------|-------|
| P0 | Exposed API Key | Revoke + Rotate | 15 min | Blake |
| P0 | npm Vulnerabilities | Update packages | 30 min | Blake |
| P1 | Redis Auth | Add password | 20 min | Blake |
| P1 | API Authentication | Implement keys | 2 hours | Dev |
| P2 | Security Headers | Add Helmet.js | 30 min | Dev |

---

## 🔴 P0 - CRITICAL (Fix Within 24 Hours)

### P0-001: REVOKE EXPOSED KIMI API KEY
**Finding:** CRIT-001  
**Impact:** Unauthorized API access, potential cost abuse  
**Effort:** 15 minutes

#### Immediate Steps:

```bash
# Step 1: REVOKE the key immediately
# Go to: https://platform.moonshot.cn/
# Navigate to API Keys → Find the exposed key → Click Revoke

# Step 2: Generate new API key
# Same page → Create New Key → Copy the new key
```

#### Update Environment Variables:

```bash
# SSH into production server
ssh user@slidetheory.app

# Edit production environment
sudo nano /opt/slidetheory/deployment/config/.env.production

# Replace KIMI_API_KEY with new key
KIMI_API_KEY=sk-kimi-NEW_KEY_HERE

# Save and exit (Ctrl+O, Enter, Ctrl+X)
```

#### Restart Services:

```bash
# Restart containers to pick up new env
cd /opt/slidetheory
docker-compose -f deployment/docker/docker-compose.yml restart app-prod

# Verify new key is working
curl https://slidetheory.app/api/health
# Should show: "aiGeneration": true
```

#### Repeat for Staging:

```bash
# SSH into staging
ssh user@staging.slidetheory.app
# Update .env.staging with new key
docker-compose restart app-staging
```

#### Update GitHub Secrets:

1. Go to: https://github.com/slidetheory/slidetheory-mvp/settings/secrets
2. Update `KIMI_API_KEY` secret with new key

#### Verify Revocation:

```bash
# Test old key (should fail)
curl https://api.moonshot.cn/v1/models \
  -H "Authorization: Bearer sk-kimi-Rpw52XJQVdDYeixWg3hmZq1tN6IY0ZX8I4b1iawcSVVuLGyFnmzaGWFx6Klbelgm"
# Expected: 401 Unauthorized
```

---

### P0-002: PATCH HIGH-SEVERITY NPM VULNERABILITIES
**Finding:** HIGH-001  
**Impact:** Path traversal, DoS attacks  
**Effort:** 30 minutes

#### Immediate Steps:

```bash
# Navigate to project
cd products/slidetheory/mvp/build

# Check current vulnerabilities
npm audit

# Fix automatically (updates to compatible versions)
npm audit fix

# If major version updates needed:
npm install node-html-to-image@5.0.0

# Verify fix
npm audit
# Should show: 0 vulnerabilities
```

#### Rebuild and Deploy:

```bash
# Build new image
docker build -f deployment/docker/Dockerfile -t slidetheory:patched .

# Push to registry
docker tag slidetheory:patched ghcr.io/slidetheory/slidetheory-mvp:latest
docker push ghcr.io/slidetheory/slidetheory-mvp:latest

# Deploy (if not using CI/CD)
ssh user@slidetheory.app << 'EOF'
  cd /opt/slidetheory
  docker-compose pull
  docker-compose up -d
EOF
```

#### Test After Deployment:

```bash
# Verify application works
curl https://slidetheory.app/api/health
curl -X POST https://slidetheory.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{"slideType":"Executive Summary","context":"Test after security patch","targetAudience":"Test"}'
```

---

## 🟠 P1 - HIGH (Fix Within 1 Week)

### P1-001: SECURE REDIS WITH AUTHENTICATION
**Finding:** HIGH-003  
**Impact:** Unauthorized cache access, data poisoning  
**Effort:** 20 minutes

#### Option A: Add Redis Password (Recommended)

```bash
# SSH to server
ssh user@slidetheory.app

# Create Redis config
cat > /opt/slidetheory/redis.conf << 'EOF'
# Redis configuration with authentication
requirepass YOUR_STRONG_PASSWORD_HERE
appendonly yes
maxmemory 256mb
maxmemory-policy allkeys-lru
EOF

# Generate strong password
openssl rand -base64 32
```

#### Update Docker Compose:

```yaml
# deployment/docker/docker-compose.yml
redis:
  image: redis:7-alpine
  # REMOVE: ports:
  #   - "6379:6379"  # Don't expose externally
  volumes:
    - redis-data:/data
    - ./redis.conf:/usr/local/etc/redis/redis.conf:ro
  command: redis-server /usr/local/etc/redis/redis.conf
  networks:
    - slidetheory-prod
    - slidetheory-staging
```

#### Update Application Config:

```javascript
// config/index.js
redis: {
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,  // Add this
}
```

```bash
# Add to .env.production
REDIS_PASSWORD=YOUR_STRONG_PASSWORD_HERE
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
```

#### Restart Services:

```bash
cd /opt/slidetheory
docker-compose down
docker-compose up -d
```

---

### P1-002: IMPLEMENT API KEY AUTHENTICATION
**Finding:** HIGH-002  
**Impact:** Unauthorized API abuse  
**Effort:** 2 hours

#### Quick Implementation:

```javascript
// middleware/auth.js - Update authenticateApiKey
function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const validKey = process.env.API_KEY;
  
  // ALWAYS require API key in production
  if (process.env.NODE_ENV === 'production' && !validKey) {
    console.error('[Security] API_KEY not configured in production!');
    return res.status(500).json({
      success: false,
      error: 'SERVER_CONFIG_ERROR',
      message: 'Server configuration error'
    });
  }
  
  if (!apiKey || apiKey !== validKey) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Invalid or missing API key'
    });
  }
  
  next();
}
```

#### Generate API Key:

```bash
# Generate secure API key
openssl rand -hex 32
# Example: a3f7c8d9e2b1... (64 chars)
```

#### Apply to Routes:

```javascript
// routes/slide-routes.js
const { authenticateApiKey } = require('../middleware/auth');

router.post('/generate', authenticateApiKey, validate('generateSlide'), generateSlide);
router.post('/generate-slide-v2', authenticateApiKey, validate('generateSlideV2'), generateSlideV2);
```

#### Update Environment:

```bash
# Add to .env.production
API_KEY=YOUR_GENERATED_KEY_HERE

# Add to GitHub Secrets
# Name: API_KEY
# Value: YOUR_GENERATED_KEY_HERE
```

#### Client Usage:

```bash
# API calls now require header
curl -X POST https://slidetheory.app/api/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_GENERATED_KEY_HERE" \
  -d '{"slideType":"Executive Summary",...}'
```

---

## 🟡 P2 - MEDIUM (Fix Within 1 Month)

### P2-001: ADD SECURITY HEADERS WITH HELMET
**Finding:** MED-002, LOW-001  
**Impact:** XSS, clickjacking protection  
**Effort:** 30 minutes

```bash
# Install helmet
cd products/slidetheory/mvp/build
npm install helmet
```

```javascript
// server.js - Add after express initialization
const helmet = require('helmet');

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://api.moonshot.cn"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
```

---

### P2-002: CONFIGURE CORS PROPERLY
**Finding:** MED-005  
**Impact:** Prevent cross-origin attacks  
**Effort:** 20 minutes

```bash
npm install cors
```

```javascript
// server.js
const cors = require('cors');

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'https://slidetheory.app',
    'https://www.slidetheory.app',
    'https://staging.slidetheory.app'
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-API-Key'],
  credentials: false,
  maxAge: 86400
};

app.use(cors(corsOptions));
```

---

### P2-003: RESTRICT HEALTH ENDPOINT ACCESS
**Finding:** MED-003  
**Impact:** Reduce information disclosure  
**Effort:** 30 minutes

```javascript
// routes/health-routes.js
const { authenticateApiKey } = require('../middleware/auth');

// Public - for load balancers
router.get('/health', getHealth);
router.get('/health/live', getLiveness);
router.get('/health/ready', getReadiness);

// Protected - detailed info
router.get('/health/detailed', authenticateApiKey, getDetailedHealth);
router.get('/metrics', authenticateApiKey, getMetrics);
```

---

### P2-004: SECURE GRAFANA
**Finding:** MED-001  
**Impact:** Prevent monitoring access  
**Effort:** 15 minutes

```bash
# Set strong password
export GRAFANA_ADMIN_PASSWORD=$(openssl rand -base64 24)

# Add to docker-compose.monitoring.yml
# Or create .env file in monitoring directory
echo "GRAFANA_ADMIN_PASSWORD=$GRAFANA_ADMIN_PASSWORD" > .env.monitoring

# Restart Grafana
docker-compose -f docker-compose.monitoring.yml restart grafana
```

---

## Implementation Checklist

### Day 1 (Critical)
- [ ] Revoke exposed Kimi API key
- [ ] Generate new API key
- [ ] Update production environment
- [ ] Update staging environment
- [ ] Update GitHub secrets
- [ ] Run `npm audit fix`
- [ ] Deploy patched application
- [ ] Verify old key returns 401

### Week 1 (High Priority)
- [ ] Add Redis password authentication
- [ ] Remove Redis port exposure
- [ ] Implement API key authentication
- [ ] Update API documentation
- [ ] Test all endpoints with auth

### Month 1 (Medium Priority)
- [ ] Install and configure Helmet.js
- [ ] Configure CORS
- [ ] Restrict detailed health endpoints
- [ ] Secure Grafana with strong password
- [ ] Enable GitHub secret scanning
- [ ] Set up fail2ban on VPS

---

## Testing Verification

### After Each Fix:

```bash
# 1. Test API with old key (should fail)
curl -H "X-API-Key: OLD_KEY" https://slidetheory.app/api/generate
# Expected: 401 Unauthorized

# 2. Test API with new key (should succeed)
curl -H "X-API-Key: NEW_KEY" https://slidetheory.app/api/generate \
  -X POST -H "Content-Type: application/json" \
  -d '{"slideType":"Executive Summary","context":"Test","targetAudience":"Test"}'
# Expected: 200 OK with slide data

# 3. Check security headers
curl -I https://slidetheory.app/api/health
# Expected: X-Frame-Options, X-Content-Type-Options, etc.

# 4. Test CORS
curl -H "Origin: https://evil.com" https://slidetheory.app/api/health
# Expected: 403 or no Access-Control-Allow-Origin header

# 5. Verify Redis not accessible externally
redis-cli -h slidetheory.app -p 6379 ping
# Expected: Connection refused or timeout
```

---

## Emergency Contacts

| Role | Contact | Use When |
|------|---------|----------|
| Kimi Support | support@moonshot.cn | API key issues |
| Hostinger Support | control panel | VPS access issues |
| GitHub Support | support.github.com | Repository issues |

---

**Document Owner:** Security Team  
**Review Cycle:** After each security incident