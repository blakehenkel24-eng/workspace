# 🚨 INCIDENT RESPONSE PLAN
## What To Do If SlideTheory Is Compromised

**Version:** 1.0  
**Last Updated:** February 5, 2026  
**Classification:** CONFIDENTIAL

---

## Quick Reference Card

```
🚨 SECURITY INCIDENT DETECTED

1. DON'T PANIC - Follow this guide
2. Contain → Eradicate → Recover → Learn
3. Document EVERYTHING
4. Call for help if needed

EMERGENCY CONTACTS:
- Blake (Owner): [PHONE]
- Hostinger Support: control panel
- Kimi API Support: support@moonshot.cn
- GitHub Security: github.com/security
```

---

## Incident Severity Levels

| Level | Description | Examples | Response Time |
|-------|-------------|----------|---------------|
| **P1 - Critical** | System compromised, data breach, service down | API key exposed, unauthorized root access, ransomware | Immediate |
| **P2 - High** | Active attack in progress, significant risk | Brute force attack, suspicious outbound traffic | 1 hour |
| **P3 - Medium** | Potential vulnerability exploited, limited impact | Individual account compromise, minor config exposure | 4 hours |
| **P4 - Low** | Policy violation, minor security event | Failed login attempts, port scan detected | 24 hours |

---

## Phase 1: Detection & Initial Response

### 1.1 Signs of Compromise

Watch for these indicators:

**Infrastructure Level:**
- [ ] Unusual CPU/memory usage spikes
- [ ] Unexpected network connections
- [ ] Unknown processes running
- [ ] Files modified without authorization
- [ ] New user accounts created
- [ ] SSH logins from unknown IPs
- [ ] Docker containers running as root unexpectedly

**Application Level:**
- [ ] Unauthorized API requests
- [ ] Unusual AI generation patterns (high volume, strange prompts)
- [ ] Rate limiting triggered abnormally
- [ ] Error logs showing exploitation attempts
- [ ] Analytics showing impossible geography

**Data Level:**
- [ ] Unexpected data downloads
- [ ] Database queries outside normal patterns
- [ ] File exports by unknown users
- [ ] Redis cache anomalies

### 1.2 Immediate Actions (First 15 Minutes)

**STOP. BREATHE. ASSESS.**

```bash
# 1. Verify it's a real incident (not a false positive)
# Check if this is normal behavior or truly suspicious

# 2. Document the initial finding
# Screenshot or save logs showing the issue
# Note exact time of discovery
# Note who discovered it

# 3. Notify team (for P1/P2 incidents)
# Slack/phone call to Blake
# Subject: "SECURITY INCIDENT - [Severity] - [Brief Description]"
```

### 1.3 Preserve Evidence

```bash
# Create incident directory
INCIDENT_ID="INC-$(date +%Y%m%d-%H%M%S)"
mkdir -p /opt/incidents/$INCIDENT_ID

# Save current state
ps aux > /opt/incidents/$INCIDENT_ID/processes.txt
netstat -tulpn > /opt/incidents/$INCIDENT_ID/connections.txt
docker ps > /opt/incidents/$INCIDENT_ID/containers.txt
iptables -L > /opt/incidents/$INCIDENT_ID/firewall.txt

# Save recent logs
cp /var/log/auth.log /opt/incidents/$INCIDENT_ID/
cp /var/log/nginx/access.log /opt/incidents/$INCIDENT_ID/
docker logs slidetheory-app-prod &> /opt/incidents/$INCIDENT_ID/app-logs.txt

# Save environment variables (check for exposure)
env | grep -v PASSWORD | grep -v KEY | grep -v SECRET > /opt/incidents/$INCIDENT_ID/env.txt
```

---

## Phase 2: Containment

### 2.1 Short-term Containment (Stop the bleeding)

#### If API Key Compromised:

```bash
# IMMEDIATE - Revoke the key
# Login to https://platform.moonshot.cn/
# Go to API Keys → Find compromised key → Revoke

# Block traffic if specific IP identified
sudo iptables -A INPUT -s [ATTACKER_IP] -j DROP

# Rotate to new key immediately
# See PRIORITY-FIXES.md for rotation procedure
```

#### If Server Compromised:

```bash
# Option A: Isolate the server (if multi-server setup)
# Block all traffic except your admin IP
sudo iptables -A INPUT -s [YOUR_ADMIN_IP] -j ACCEPT
sudo iptables -A INPUT -j DROP

# Option B: Stop compromised containers (if container breakout suspected)
docker stop slidetheory-app-prod
docker stop slidetheory-redis

# Option C: Snapshot for forensics (if using cloud provider)
# Create snapshot before any changes
```

#### If Redis Compromised:

```bash
# Flush cache immediately
docker exec slidetheory-redis redis-cli FLUSHALL

# Change Redis password immediately
# Edit redis.conf and restart

# Check for backdoors in cache
docker exec slidetheory-redis redis-cli KEYS '*'
```

### 2.2 Long-term Containment (Secure the perimeter)

```bash
# Enable enhanced logging
sudo auditctl -w /etc/passwd -p wa -k identity-changes
sudo auditctl -w /opt/slidetheory/ -p wa -k app-changes

# Increase fail2ban sensitivity
sudo fail2ban-client set sshd maxretry 2
sudo fail2ban-client set sshd bantime 86400

# Enable all security rules
sudo ufw enable
sudo ufw default deny incoming
```

---

## Phase 3: Eradication

### 3.1 Remove Threat Actor Access

```bash
# 1. Check for backdoor accounts
grep -v "^#" /etc/passwd | grep -v "nologin" | grep -v "false"
# Remove any unauthorized accounts
sudo userdel -r [UNAUTHORIZED_USER]

# 2. Check for SSH keys
find /home -name "authorized_keys" -exec cat {} \;
# Remove unauthorized keys

# 3. Check cron jobs for persistence
crontab -l
sudo crontab -l
ls -la /etc/cron.*
cat /etc/crontab
# Remove any suspicious entries

# 4. Check for running malicious processes
ps aux | grep -E "(nc|netcat|ncat|python -m http.server)"
kill -9 [SUSPICIOUS_PID]

# 5. Check Docker for malicious containers
docker ps -a | grep -v slidetheory
docker rm -f [SUSPICIOUS_CONTAINER]

# 6. Check for modified binaries
sudo aide --check
# Or manually check:
md5sum /usr/bin/ssh /usr/sbin/sshd
# Compare with known good hashes
```

### 3.2 Clean and Rebuild (If Deeply Compromised)

**Nuclear Option - Complete Rebuild:**

```bash
# If you suspect rootkit or deep compromise:

# 1. Backup data (verify it's clean first!)
rsync -avz /opt/slidetheory/data/ [SAFE_BACKUP_LOCATION]/

# 2. Snapshot compromised system for forensics
# (If cloud provider: create image/snapshot)

# 3. Provision new clean server
# - Use latest OS image
# - Apply all HARDENING-GUIDE.md steps
# - Use NEW SSH keys

# 4. Restore data to new server
# - Scan all files for malware before restore
# - Don't restore executables or configs from compromised system
# - Rebuild application from Git (verified clean commit)

# 5. Update DNS to point to new server
# - Lower TTL beforehand if possible

# 6. Decommission compromised server
# - Keep for forensics if needed
# - Otherwise destroy completely
```

### 3.3 Patch Vulnerabilities

```bash
# Update all packages
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get dist-upgrade -y

# Update Docker images
docker pull node:20-slim
docker pull redis:7-alpine
docker pull nginx:alpine

# Rebuild application with latest dependencies
cd /opt/slidetheory
git pull origin main
npm audit fix
docker-compose build --no-cache

# Update SSL certificates if compromised
sudo certbot revoke --cert-name slidetheory.app
sudo certbot certonly --nginx -d slidetheory.app -d www.slidetheory.app
```

---

## Phase 4: Recovery

### 4.1 Restore Services

```bash
# 1. Start with monitoring only first
docker-compose -f docker-compose.monitoring.yml up -d

# 2. Verify monitoring is working
curl http://localhost:9090/api/v1/status/targets

# 3. Start Redis with new password
docker-compose up -d redis

# 4. Start application with new API key
docker-compose up -d app-prod

# 5. Verify health
curl https://slidetheory.app/api/health
curl https://slidetheory.app/api/health/detailed

# 6. Start nginx
docker-compose up -d nginx

# 7. Verify SSL
curl -vI https://slidetheory.app 2>&1 | grep "SSL\|TLS"
```

### 4.2 Verify Integrity

```bash
# Run all security checks

# Check file integrity
sudo aide --check

# Check for listening ports (should only be 80, 443, 2222 for SSH)
sudo netstat -tulpn | grep LISTEN

# Check running processes
ps aux | grep -v "^USER" | awk '{print $1}' | sort | uniq
# Should only see: root, slidetheory, nobody, www-data, redis

# Check for unauthorized users
who
last | head -20

# Check for modified files in last 24 hours
find /opt/slidetheory -mtime -1 -type f

# Test application security
curl -X POST https://slidetheory.app/api/generate
# Should return 401 (if auth enabled) or validation error
# Should NOT return 500 or server errors
```

### 4.3 Monitor for Re-infection

```bash
# Enable verbose logging
sudo tail -f /var/log/auth.log | grep -iE "fail|error|invalid" &
sudo tail -f /var/log/nginx/access.log | grep -v "200" &

# Monitor for 1 hour minimum
echo "Monitoring for re-infection... Press Ctrl+C to stop"
sleep 3600
```

---

## Phase 5: Post-Incident

### 5.1 Incident Documentation

Create incident report:

```markdown
# Incident Report: [INCIDENT_ID]

## Summary
- **Date/Time:** [When discovered]
- **Severity:** [P1/P2/P3/P4]
- **Duration:** [How long until resolved]
- **Reporter:** [Who found it]

## Timeline
- [TIME]: Initial detection
- [TIME]: Containment started
- [TIME]: Threat eradicated
- [TIME]: Services restored
- [TIME]: Incident closed

## Root Cause
[What happened and why]

## Impact
- **Data:** [What data was accessed/exposed]
- **Services:** [What was affected]
- **Users:** [How many affected]
- **Financial:** [Cost of incident]

## Actions Taken
1. [Immediate response actions]
2. [Containment steps]
3. [Eradication steps]
4. [Recovery steps]

## Lessons Learned
- [What went wrong]
- [What worked well]
- [What to improve]

## Follow-up Actions
- [ ] Task 1 (Owner: @user, Due: DATE)
- [ ] Task 2 (Owner: @user, Due: DATE)
```

### 5.2 Notify Affected Parties

**If user data was compromised:**

```
Subject: Important Security Notice - SlideTheory

Dear SlideTheory User,

We are writing to inform you of a security incident that may have affected your account.

WHAT HAPPENED:
[Brief, clear description without technical jargon]

WHAT INFORMATION WAS INVOLVED:
[List specific data types: email, passwords, etc.]

WHAT WE'VE DONE:
[List immediate actions taken]

WHAT YOU SHOULD DO:
1. Change your password immediately
2. Enable two-factor authentication
3. Monitor your account for suspicious activity

We sincerely apologize for this incident...
```

### 5.3 Legal/Regulatory Requirements

**GDPR (if EU users affected):**
- Notify supervisory authority within 72 hours
- Notify affected users without undue delay
- Document breach for authorities

**State Laws (California, etc.):**
- Check specific state breach notification laws
- Typically 72-hour notification requirement

---

## Specific Incident Scenarios

### Scenario 1: API Key Compromised

**Detection:** High API usage, unusual AI prompts, cost spike  
**Impact:** Financial loss, potential data exposure through prompts

```bash
# 1. Revoke key immediately
# Login to Kimi platform → Revoke

# 2. Check API usage logs
docker logs slidetheory-app-prod | grep "api.moonshot.cn"

# 3. Analyze what was accessed
# Check if any sensitive data was in prompts
grep -r "password\|secret\|key" /opt/slidetheory/logs/

# 4. Generate new key and rotate
# See PRIORITY-FIXES.md

# 5. Check for secondary compromises
# Did attacker access logs? configs? other systems?
```

### Scenario 2: Docker Container Breakout

**Detection:** Root process running, container escaped, host files modified

```bash
# 1. Check if container is running as root
docker exec slidetheory-app-prod id

# 2. Check for modified host files
sudo aide --check

# 3. Check host processes
ps aux | grep -v "^root\|^slidetheory\|^www-data\|^redis\|^message"

# 4. If confirmed breakout:
# - Stop all containers immediately
# - Check for backdoors in host
# - Consider full rebuild (nuclear option)

# 5. Fix container security
# - Ensure USER directive in Dockerfile
# - Enable user namespaces
# - Drop all capabilities
```

### Scenario 3: Redis Data Exposure

**Detection:** Redis accessible externally, data exfiltrated

```bash
# 1. Check Redis exposure
redis-cli -h slidetheory.app -p 6379 ping
# If returns PONG, Redis is exposed!

# 2. Check what data was in Redis
docker exec slidetheory-redis redis-cli KEYS '*'

# 3. Clear all data immediately
docker exec slidetheory-redis redis-cli FLUSHALL

# 4. Add authentication
# Update redis.conf with requirepass

# 5. Remove port exposure
docker-compose stop redis
# Edit docker-compose.yml to remove ports:
#   - "6379:6379"
docker-compose up -d redis

# 6. Check logs for data exfiltration
docker logs slidetheory-redis | grep -i "get\|keys"
```

### Scenario 4: Web Application Attack

**Detection:** XSS attempts, SQL injection, path traversal in logs

```bash
# 1. Block attacker IP
sudo /opt/slidetheory/scripts/block-ip.sh [ATTACKER_IP] "Web attack" 86400

# 2. Check if attack succeeded
docker logs slidetheory-app-prod | grep -iE "error|exception|stack"

# 3. Check for webshells
find /opt/slidetheory -name "*.php" -o -name "*.jsp" -o -name "*.asp"
find /opt/slidetheory -type f -name "shell*" -o -name "backdoor*"

# 4. If webshell found:
# - Don't just delete it (preserve evidence)
# - Stop web server
# - Check what commands were executed
# - Full system scan for other backdoors

# 5. Apply WAF rules
# Update nginx config to block attack patterns
```

### Scenario 5: Ransomware/Malware

**Detection:** Files encrypted, ransom note, unusual extensions

```bash
# 1. ISOLATE IMMEDIATELY
sudo iptables -A INPUT -j DROP
sudo iptables -A OUTPUT -j DROP

# 2. Don't pay the ransom
# 3. Preserve evidence
# 4. Restore from clean backups

# 5. Check backup integrity before restore
# Mount backup and scan:
clamscan -r /mnt/backup-location/

# 6. Full system rebuild required
# Follow nuclear option in Section 3.2
```

---

## Emergency Contacts

| Contact | Purpose | When to Call |
|---------|---------|--------------|
| Blake (Owner) | Decision making | All P1/P2 incidents |
| Hostinger | VPS issues | Server down, network issues |
| Kimi Support | API issues | Key compromise, abuse |
| GitHub Security | Repo compromise | Source code exposed |
| Legal Counsel | Data breach | User data exposed |

---

## Useful Commands Reference

```bash
# Process analysis
ps auxf                          # Process tree
lsof -p [PID]                    # What files process has open
strace -p [PID]                  # Trace system calls

# Network analysis
netstat -tulpn                   # Listening ports
ss -tulpn                        # Modern replacement
lsof -i :[PORT]                  # What's using port
tcpdump -i any -w capture.pcap   # Capture traffic

# File analysis
find / -mtime -1 -type f         # Recently modified files
find / -perm -4000 -type f       # SUID files (potential backdoors)
aide --check                     # File integrity
rpm -Va / dpkg -V                # Package integrity

# Log analysis
grep "Failed password" /var/log/auth.log | wc -l
grep "session opened" /var/log/auth.log | tail -20
lastb | head -20                 # Failed login attempts

# Memory analysis
lsmod | grep -v "^Module"        # Loaded kernel modules
cat /proc/modules                # Same as lsmod
ls /dev | grep -E "mem| port"    # Memory devices

# Docker forensics
docker history [image]           # Image layers
docker inspect [container]       # Container details
docker diff [container]          # Changed files in container
docker export [container] > c.tar # Export container
```

---

## Incident Response Checklist

- [ ] Incident detected and documented
- [ ] Severity assessed
- [ ] Team notified
- [ ] Evidence preserved
- [ ] Short-term containment applied
- [ ] Threat actor access removed
- [ ] Backdoors eliminated
- [ ] Vulnerabilities patched
- [ ] Services restored
- [ ] Integrity verified
- [ ] Monitoring for re-infection
- [ ] Incident report written
- [ ] Affected parties notified
- [ ] Follow-up actions assigned
- [ ] Lessons learned documented

---

**Document Owner:** Security Team  
**Tested During Drill:** [Date]  
**Next Drill:** [Date]