# 🔧 HARDENING GUIDE
## Step-by-Step Security Hardening for SlideTheory

**Version:** 1.0  
**Last Updated:** February 5, 2026  
**Target Audience:** Blake + DevOps Team

---

## Table of Contents
1. [Pre-Hardening Checklist](#pre-hardening-checklist)
2. [Git History Cleanup](#1-git-history-cleanup---remove-exposed-secrets)
3. [VPS Hardening](#2-vps-hardening)
4. [Application Hardening](#3-application-hardening)
5. [Docker Hardening](#4-docker-hardening)
6. [Database Hardening](#5-database-hardening)
7. [Monitoring Hardening](#6-monitoring-hardening)
8. [GitHub Hardening](#7-github-hardening)
9. [Post-Hardening Verification](#post-hardening-verification)

---

## Pre-Hardening Checklist

Before starting hardening:
- [ ] Backup current configurations
- [ ] Schedule maintenance window
- [ ] Notify team members
- [ ] Have rollback plan ready

---

## 1. Git History Cleanup - Remove Exposed Secrets

⚠️ **WARNING:** This rewrites Git history. Coordinate with team before proceeding.

### Step 1.1: Install git-filter-repo (Recommended)

```bash
# On Ubuntu/Debian
sudo apt-get install git-filter-repo

# Or using pip
pip install git-filter-repo
```

### Step 1.2: Clone Fresh Repository

```bash
# Create backup first
cd /tmp
git clone --mirror https://github.com/slidetheory/slidetheory-mvp.git repo-backup

# Clone working copy
git clone https://github.com/slidetheory/slidetheory-mvp.git repo-clean
cd repo-clean
```

### Step 1.3: Remove Exposed Files from History

```bash
# Remove the .env file with exposed key
git filter-repo --path archive/2026-02/mbb-slide-generator/.env --invert-paths

# Verify removal
git log --all --full-history -- "archive/**/*.env"
# Should return nothing
```

### Step 1.4: Add to .gitignore

```bash
# Add to root .gitignore
echo "archive/**/.env" >> .gitignore
echo "**/.env" >> .gitignore
git add .gitignore
git commit -m "security: Add .env files to .gitignore"
```

### Step 1.5: Force Push (Caution!)

```bash
# WARNING: This rewrites history for everyone
git push origin --force --all
git push origin --force --tags

# Notify all team members to reclone:
echo "Team: Please reclone the repository:
rm -rf slidetheory-mvp
git clone https://github.com/slidetheory/slidetheory-mvp.git"
```

### Alternative: If You Can't Rewrite History

If team coordination is difficult, use this approach:

```bash
# 1. Delete the archive folder entirely
git rm -rf archive/
git commit -m "security: Remove archive folder containing exposed secrets"
git push

# 2. Add BFG Repo-Cleaner to CI to prevent future commits
# .github/workflows/security.yml
```

---

## 2. VPS Hardening

### 2.1 SSH Configuration

Edit `/etc/ssh/sshd_config`:

```bash
sudo nano /etc/ssh/sshd_config
```

Apply these settings:

```conf
# Disable root login
PermitRootLogin no

# Disable password authentication
PasswordAuthentication no
ChallengeResponseAuthentication no

# Use key authentication only
PubkeyAuthentication yes

# Change default port (optional but recommended)
Port 2222

# Limit authentication attempts
MaxAuthTries 3
LoginGraceTime 30

# Disable empty passwords
PermitEmptyPasswords no

# Allow only specific users
AllowUsers deploy slidetheory
```

Restart SSH:

```bash
sudo systemctl restart sshd
# OR
sudo service ssh restart
```

Test new connection (keep current session open!):

```bash
# In new terminal
ssh -p 2222 deploy@slidetheory.app
```

### 2.2 Install and Configure Fail2ban

```bash
# Install
sudo apt-get update
sudo apt-get install fail2ban

# Create custom configuration
sudo nano /etc/fail2ban/jail.local
```

Add configuration:

```ini
[DEFAULT]
# Ban for 1 hour after 3 failed attempts
bantime = 3600
findtime = 600
maxretry = 3

# Email notifications (optional)
destemail = admin@slidetheory.app
sendername = Fail2Ban-SlideTheory

[sshd]
enabled = true
port = 2222
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-badbots]
enabled = true
port = http,https
filter = nginx-badbots
logpath = /var/log/nginx/access.log
maxretry = 2

[nginx-noscript]
enabled = true
port = http,https
filter = nginx-noscript
logpath = /var/log/nginx/access.log
maxretry = 6
```

Start fail2ban:

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Check status
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

### 2.3 Configure UFW Firewall

```bash
# Install UFW if not present
sudo apt-get install ufw

# Default deny
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (use your custom port if changed)
sudo ufw allow 2222/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Explicitly deny Redis port
sudo ufw deny 6379/tcp

# Enable firewall
sudo ufw enable

# Verify status
sudo ufw status verbose
```

Expected output:
```
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
2222/tcp                   ALLOW IN    Anywhere
80/tcp                     ALLOW IN    Anywhere
443/tcp                    ALLOW IN    Anywhere
6379/tcp                   DENY IN     Anywhere
```

### 2.4 Automatic Security Updates

```bash
# Install unattended-upgrades
sudo apt-get install unattended-upgrades

# Configure
sudo dpkg-reconfigure -plow unattended-upgrades

# Edit configuration
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

Ensure these lines are present:

```conf
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};

// Auto-remove unused dependencies
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";

// Auto-reboot if needed
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "04:00";
```

### 2.5 System Hardening Script

Save as `/opt/hardening/system-hardening.sh`:

```bash
#!/bin/bash
# System hardening script for SlideTheory VPS

# Disable IPv6 if not needed
echo "net.ipv6.conf.all.disable_ipv6 = 1" | sudo tee -a /etc/sysctl.conf
echo "net.ipv6.conf.default.disable_ipv6 = 1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Kernel hardening
cat << EOF | sudo tee /etc/sysctl.d/99-security.conf
# IP Spoofing protection
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Ignore ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0

# Ignore source routed packets
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0

# Log suspicious packets
net.ipv4.conf.all.log_martians = 1

# Disable IPv6
net.ipv6.conf.all.disable_ipv6 = 1
EOF

sudo sysctl --system

# Set secure permissions on sensitive files
sudo chmod 600 /etc/ssh/sshd_config
sudo chmod 600 /etc/fail2ban/jail.local

# Secure shared memory
sudo chmod 1777 /dev/shm

echo "System hardening complete!"
```

Run it:

```bash
chmod +x /opt/hardening/system-hardening.sh
sudo /opt/hardening/system-hardening.sh
```

---

## 3. Application Hardening

### 3.1 Environment Variable Security

Create production environment template:

```bash
# /opt/slidetheory/deployment/config/.env.production.secure
# Restrict file permissions
sudo chmod 600 /opt/slidetheory/deployment/config/.env.production
sudo chown root:slidetheory /opt/slidetheory/deployment/config/.env.production
```

Required secure environment variables:

```env
# Required Security Variables
NODE_ENV=production
API_KEY=$(openssl rand -hex 32)
KIMI_API_KEY=sk-kimi-NEW_KEY_HERE

# Redis Security
REDIS_PASSWORD=$(openssl rand -base64 32)
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379

# Session Security (if implementing sessions)
SESSION_SECRET=$(openssl rand -base64 64)

# CORS
ALLOWED_ORIGINS=https://slidetheory.app,https://www.slidetheory.app

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3.2 Add Security Middleware

Install required packages:

```bash
cd products/slidetheory/mvp/build
npm install helmet cors express-rate-limit hpp xss-clean
```

Update `server.js`:

```javascript
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

// 1. Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://api.moonshot.cn"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginEmbedderPolicy: false, // May need adjustment for CDN
}));

// 2. CORS
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'https://slidetheory.app',
      'https://www.slidetheory.app'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-API-Key'],
  credentials: false,
  maxAge: 86400
};
app.use(cors(corsOptions));

// 3. Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'RATE_LIMITED',
      message: 'Too many requests, please try again later.'
    });
  }
});
app.use('/api/', limiter);

// 4. Prevent Parameter Pollution
app.use(hpp());

// 5. Request Size Limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
```

### 3.3 Input Validation Hardening

Update `middleware/validator.js`:

```javascript
// Add sanitization
const sanitize = require('sanitize-html');

function sanitizeInput(input) {
  if (typeof input === 'string') {
    return sanitize(input, {
      allowedTags: [],
      allowedAttributes: {}
    }).trim();
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (typeof input === 'object' && input !== null) {
    return Object.fromEntries(
      Object.entries(input).map(([k, v]) => [k, sanitizeInput(v)])
    );
  }
  return input;
}

// Apply to all routes
app.use((req, res, next) => {
  if (req.body) req.body = sanitizeInput(req.body);
  if (req.query) req.query = sanitizeInput(req.query);
  next();
});
```

---

## 4. Docker Hardening

### 4.1 Update Dockerfile

```dockerfile
# Stage 3: Production image (hardened)
FROM base AS production

# Create non-root user with minimal permissions
RUN groupadd -r slidetheory -g 1000 && \
    useradd -r -g slidetheory -u 1000 -d /app -s /sbin/nologin slidetheory

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application code with proper ownership
COPY --chown=slidetheory:slidetheory . .

# Create required directories
RUN mkdir -p tmp/slides tmp/exports logs && \
    chown -R slidetheory:slidetheory /app

# Remove unnecessary tools
RUN apt-get remove -y wget curl && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Switch to non-root user
USER slidetheory

# Read-only filesystem where possible
VOLUME ["/app/tmp", "/app/logs"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

EXPOSE 3000

CMD ["node", "server.js"]
```

### 4.2 Docker Compose Security

Update `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app-prod:
    build:
      context: ../../mvp/build
      dockerfile: ../../deployment/docker/Dockerfile
      target: production
    read_only: true  # Read-only root filesystem
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - CHOWN  # Only if needed
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 2G
          pids: 100
        reservations:
          cpus: '0.5'
          memory: 512M
    restart: unless-stopped
    # ... rest of config

  redis:
    image: redis:7-alpine
    # REMOVE ports exposure - internal only
    # ports:
    #   - "6379:6379"
    command: >
      redis-server
      --requirepass ${REDIS_PASSWORD}
      --appendonly yes
      --maxmemory 256mb
      --maxmemory-policy allkeys-lru
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    volumes:
      - redis-data:/data
    networks:
      - slidetheory-prod

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    read_only: true
    tmpfs:
      - /var/cache/nginx:noexec,nosuid,size=100m
      - /var/run:noexec,nosuid,size=10m
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
      - CHOWN
      - SETGID
      - SETUID
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - slidetheory-logs:/var/log/nginx
    networks:
      - slidetheory-prod
```

### 4.3 Docker Network Security

```yaml
networks:
  slidetheory-prod:
    driver: bridge
    internal: false  # External access needed for nginx
    ipam:
      config:
        - subnet: 172.20.0.0/16
  slidetheory-internal:
    driver: bridge
    internal: true  # No external access
    ipam:
      config:
        - subnet: 172.21.0.0/16
```

---

## 5. Database Hardening

### 5.1 Redis Security

Create `redis.conf`:

```conf
# Security
requirepass YOUR_STRONG_PASSWORD_HERE
rename-command FLUSHALL ""
rename-command FLUSHDB ""
rename-command CONFIG "CONFIG_a1b2c3"
rename-command SHUTDOWN "SHUTDOWN_a1b2c3"

# Network
bind 0.0.0.0
protected-mode yes
port 6379

# Persistence
appendonly yes
appendfsync everysec

# Memory
maxmemory 256mb
maxmemory-policy allkeys-lru

# Logging
loglevel warning
```

### 5.2 Connection Encryption (if Redis exposed)

If Redis must be accessible externally:

```bash
# Generate TLS certificates
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout redis-server.key -out redis-server.crt

# Configure Redis for TLS
# redis.conf
tls-port 6379
port 0
tls-cert-file /etc/redis/redis-server.crt
tls-key-file /etc/redis/redis-server.key
tls-auth-clients optional
```

---

## 6. Monitoring Hardening

### 6.1 Secure Grafana

Create `grafana.ini`:

```ini
[security]
admin_user = admin
admin_password = ${GRAFANA_ADMIN_PASSWORD}
secret_key = ${GRAFANA_SECRET_KEY}
login_remember_days = 7
cookie_username = grafana_user
cookie_remember_name = grafana_remember
disable_gravatar = true

[auth]
disable_login_form = false
disable_signout_menu = false

[auth.anonymous]
enabled = false

[session]
provider = file
provider_config = sessions
cookie_name = grafana_sess
cookie_secure = true
cookie_samesite = strict
session_life_time = 86400

[smtp]  # For alerts
enabled = true
host = smtp.sendgrid.net:587
user = apikey
password = ${SENDGRID_API_KEY}
from_address = alerts@slidetheory.app
from_name = SlideTheory Alerts
```

### 6.2 Prometheus Security

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  external_labels:
    monitor: 'slidetheory'

# Basic auth for scrape endpoints
scrape_configs:
  - job_name: 'slidetheory'
    static_configs:
      - targets: ['app-prod:3000']
    basic_auth:
      username: prometheus
      password_file: /etc/prometheus/password.txt
```

---

## 7. GitHub Hardening

### 7.1 Enable Security Features

Navigate to: `https://github.com/slidetheory/slidetheory-mvp/settings/security`

Enable:
- [ ] **Private vulnerability reporting**
- [ ] **Dependency graph**
- [ ] **Dependabot alerts**
- [ ] **Dependabot security updates**
- [ ] **Code scanning** (CodeQL)
- [ ] **Secret scanning**

### 7.2 Branch Protection Rules

Navigate to: `https://github.com/slidetheory/slidetheory-mvp/settings/branches`

Add rule for `main`:
- [ ] **Require pull request reviews** (1 reviewer)
- [ ] **Dismiss stale reviews**
- [ ] **Require review from Code Owners**
- [ ] **Require status checks** (tests, security scan)
- [ ] **Require signed commits**
- [ ] **Require linear history**
- [ ] **Include administrators**
- [ ] **Restrict pushes** to specific teams

### 7.3 Add Security Policy

Create `SECURITY.md`:

```markdown
# Security Policy

## Reporting Vulnerabilities

Please report security vulnerabilities to security@slidetheory.com.

**DO NOT** create public GitHub issues for security problems.

## Response Timeline

- Acknowledgment: Within 24 hours
- Initial assessment: Within 72 hours
- Fix timeline: Depends on severity
  - Critical: 24-48 hours
  - High: 1 week
  - Medium: 1 month

## Security Measures

- All code is reviewed before merging
- Dependencies are automatically scanned
- Security updates are applied within 48 hours
- Penetration testing conducted quarterly
```

### 7.4 Pre-commit Hooks

Create `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: detect-private-key
      - id: detect-aws-credentials
      - id: check-added-large-files
      - id: check-json
      - id: check-yaml

  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
```

Install:

```bash
pip install pre-commit
cd slidetheory-mvp
pre-commit install
pre-commit run --all-files
```

---

## Post-Hardening Verification

### Security Checklist

- [ ] SSH password auth disabled
- [ ] SSH root login disabled
- [ ] Fail2ban running and configured
- [ ] UFW active with correct rules
- [ ] Automatic security updates enabled
- [ ] Docker containers run as non-root
- [ ] Docker read-only filesystems
- [ ] Redis has authentication
- [ ] API requires authentication
- [ ] Rate limiting enabled
- [ ] Security headers present
- [ ] CORS configured
- [ ] Input validation working
- [ ] HTTPS enforced
- [ ] Secrets not in Git history
- [ ] GitHub branch protection enabled
- [ ] Monitoring dashboards secured

### Verification Commands

```bash
# SSH security
ssh -o PasswordAuthentication=no user@slidetheory.app
# Should fail

# Check fail2ban
sudo fail2ban-client status

# Check UFW
sudo ufw status verbose

# Check Docker security
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
docker exec slidetheory-app-prod whoami
# Should be: slidetheory (not root)

# Test Redis auth
docker exec slidetheory-redis redis-cli ping
# Should fail (no auth)
docker exec slidetheory-redis redis-cli -a YOUR_PASSWORD ping
# Should succeed

# Test API auth
curl https://slidetheory.app/api/generate -X POST
# Should return 401

# Check security headers
curl -I https://slidetheory.app/api/health
# Look for: X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security

# Check CSP
curl -I https://slidetheory.app/api/health | grep -i content-security-policy
```

---

## Maintenance Schedule

| Task | Frequency | Command/Action |
|------|-----------|----------------|
| Security updates | Daily | Automatic via unattended-upgrades |
| Dependency audit | Weekly | `npm audit` in CI |
| Fail2ban review | Weekly | `sudo fail2ban-client status` |
| Log review | Weekly | Check `/var/log/auth.log` |
| SSL certificate renewal | Auto | cert-manager handles this |
| Full security scan | Monthly | Run vulnerability scanner |
| Access review | Quarterly | Review who has server access |
| Penetration test | Quarterly | External security firm |

---

**Document Owner:** DevOps Team  
**Last Review:** February 5, 2026  
**Next Review:** May 5, 2026