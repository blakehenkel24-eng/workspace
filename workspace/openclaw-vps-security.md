# OpenClaw VPS Security Hardening Guide

*Security guide compiled for Blake - Todoist Task #9987182586*

---

## Overview

This guide covers securing a VPS (Virtual Private Server) for running OpenClaw safely. Following these practices will minimize attack surface and protect your API keys, user data, and system integrity.

---

## 1. Initial Server Setup

### 1.1 Create Non-Root User
```bash
# Create new user
sudo adduser clawuser
sudo usermod -aG sudo clawuser

# Set up SSH key for new user
sudo mkdir -p /home/clawuser/.ssh
sudo cp ~/.ssh/authorized_keys /home/clawuser/.ssh/
sudo chown -R clawuser:clawuser /home/clawuser/.ssh
sudo chmod 700 /home/clawuser/.ssh
sudo chmod 600 /home/clawuser/.ssh/authorized_keys
```

### 1.2 Harden SSH Configuration
Edit `/etc/ssh/sshd_config`:
```bash
# Disable root login
PermitRootLogin no

# Disable password authentication
PasswordAuthentication no
ChallengeResponseAuthentication no

# Use key-only authentication
PubkeyAuthentication yes

# Change default port (optional but recommended)
Port 2222

# Limit users
AllowUsers clawuser

# Disable X11 forwarding
X11Forwarding no

# Reduce timeout
ClientAliveInterval 300
ClientAliveCountMax 2
```

Restart SSH:
```bash
sudo systemctl restart sshd
```

---

## 2. Firewall Configuration (UFW)

### 2.1 Setup UFW
```bash
# Install if not present
sudo apt update
sudo apt install ufw

# Default deny
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (custom port if changed)
sudo ufw allow 2222/tcp

# Allow HTTP/HTTPS if running web server
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow OpenClaw port (if exposing)
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable
```

### 2.2 Verify Rules
```bash
sudo ufw status verbose
```

---

## 3. Automatic Security Updates

### 3.1 Configure Unattended Upgrades
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 3.2 Customize Update Behavior
Edit `/etc/apt/apt.conf.d/50unattended-upgrades`:
```bash
// Automatically reboot if needed
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "02:00";

// Email notifications
Unattended-Upgrade::Mail "admin@yourdomain.com";
Unattended-Upgrade::MailOnlyOnError "true";
```

---

## 4. Fail2ban - Intrusion Prevention

### 4.1 Install and Configure
```bash
sudo apt install fail2ban

# Create custom config
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

Edit `/etc/fail2ban/jail.local`:
```ini
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 3
backend = systemd

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
```

Start fail2ban:
```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 5. Application Security (OpenClaw)

### 5.1 Run in Isolated Environment

#### Option A: Docker (Recommended)
```dockerfile
# Dockerfile
FROM node:20-alpine

# Create non-root user
RUN addgroup -g 1001 -S claw && \
    adduser -u 1001 -S claw -G claw

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY . .

# Change ownership
RUN chown -R claw:claw /app

# Switch to non-root user
USER claw

EXPOSE 3000

CMD ["node", "server.js"]
```

Run with security options:
```bash
docker run -d \
  --name openclaw \
  --restart unless-stopped \
  --read-only \
  --tmpfs /tmp:noexec,nosuid,size=100m \
  -p 127.0.0.1:3000:3000 \
  -e NODE_ENV=production \
  --env-file /secure/path/to/.env \
  openclaw:latest
```

#### Option B: systemd Service with Restrictions
Create `/etc/systemd/system/openclaw.service`:
```ini
[Unit]
Description=OpenClaw Service
After=network.target

[Service]
Type=simple
User=clawuser
Group=clawuser
WorkingDirectory=/opt/openclaw
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/openclaw/data
PrivateTmp=true
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true

[Install]
WantedBy=multi-user.target
```

### 5.2 Secrets Management

**DON'T:** Store secrets in code or docker-compose files
**DO:** Use proper secret management:

```bash
# Create secure directory
sudo mkdir -p /etc/openclaw/secrets
sudo chmod 700 /etc/openclaw/secrets
sudo chown clawuser:clawuser /etc/openclaw/secrets

# Store secrets in files
echo "your-api-key" | sudo tee /etc/openclaw/secrets/api_key
sudo chmod 600 /etc/openclaw/secrets/api_key

# Or use environment file
sudo tee /etc/openclaw/secrets/env <<EOF
NODE_ENV=production
API_KEY=your-key
DB_PASSWORD=db-pass
EOF
sudo chmod 600 /etc/openclaw/secrets/env
```

### 5.3 Reverse Proxy with SSL (Nginx)

Install Nginx and Certbot:
```bash
sudo apt install nginx certbot python3-certbot-nginx
```

Create `/etc/nginx/sites-available/openclaw`:
```nginx
server {
    listen 80;
    server_name claw.yourdomain.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    location / {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Enable site and get SSL:
```bash
sudo ln -s /etc/nginx/sites-available/openclaw /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d claw.yourdomain.com
```

---

## 6. Monitoring and Logging

### 6.1 Install and Configure Auditd
```bash
sudo apt install auditd

# Monitor sensitive files
sudo auditctl -w /etc/openclaw/secrets/ -p rwxa -k openclaw_secrets
sudo auditctl -w /opt/openclaw/ -p rwxa -k openclaw_app
```

### 6.2 Log Aggregation
```bash
# Install rsyslog for centralized logging
sudo apt install rsyslog

# Forward logs to external service if needed
# Example: Forward to Papertrail, Datadog, etc.
```

### 6.3 Setup Log Rotation
Create `/etc/logrotate.d/openclaw`:
```
/var/log/openclaw/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 clawuser clawuser
    sharedscripts
    postrotate
        /bin/kill -HUP $(cat /var/run/syslogd.pid 2> /dev/null) > /dev/null 2>&1 || true
    endscript
}
```

---

## 7. Backup Strategy

### 7.1 Automated Backups
```bash
# Create backup script
sudo tee /usr/local/bin/backup-openclaw.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/backup/openclaw"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup application data
tar -czf $BACKUP_DIR/openclaw_data_$DATE.tar.gz /opt/openclaw/data

# Backup secrets (encrypt with GPG)
tar -czf - /etc/openclaw/secrets | \
    gpg --encrypt --recipient admin@yourdomain.com \
    > $BACKUP_DIR/secrets_$DATE.tar.gz.gpg

# Keep only last 7 backups
ls -t $BACKUP_DIR/*.tar.gz | tail -n +8 | xargs -r rm
EOF

sudo chmod +x /usr/local/bin/backup-openclaw.sh

# Add to crontab
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-openclaw.sh
```

### 7.2 Offsite Backup
```bash
# Sync to S3/R2 (install rclone first)
rclone sync /backup/openclaw remote:backup-bucket/openclaw
```

---

## 8. Security Checklist

### Pre-Deployment
- [ ] Non-root user created
- [ ] SSH key-only authentication
- [ ] SSH port changed or fail2ban configured
- [ ] Firewall enabled (UFW)
- [ ] Automatic updates configured
- [ ] Docker or systemd hardening applied
- [ ] Secrets stored securely (not in code)
- [ ] Reverse proxy with SSL configured
- [ ] Rate limiting enabled

### Post-Deployment
- [ ] Security headers verified (securityheaders.com)
- [ ] SSL certificate valid (ssllabs.com/ssltest)
- [ ] Logs are being written
- [ ] Backup job running
- [ ] Monitoring alerts configured
- [ ] Fail2ban blocking test

### Ongoing
- [ ] Weekly: Review logs for anomalies
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review user access
- [ ] Quarterly: Security audit
- [ ] Quarterly: Penetration test (if possible)

---

## Emergency Procedures

### If Compromised
1. Isolate the server (disconnect from network)
2. Preserve logs for forensics
3. Spin up new clean instance
4. Restore from known-good backup
5. Rotate ALL secrets/API keys
6. Post-incident review

### Contact Information
- Document emergency contacts
- Have hosting provider support number
- Keep backup decryption keys secure but accessible

---

## Resources

- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks) - Industry standard hardening guides
- [Lynis](https://cisofy.com/lynis/) - Security auditing tool
- [Mozilla SSL Config Generator](https://ssl-config.mozilla.org/)

---

*This guide prioritizes security while maintaining usability. Adjust based on your specific threat model.*
