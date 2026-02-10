# 📊 MONITORING SETUP GUIDE
## Security Monitoring & Alerting for SlideTheory

**Version:** 1.0  
**Last Updated:** February 5, 2026

---

## Overview

This guide covers setting up comprehensive security monitoring for the SlideTheory infrastructure to detect and respond to security incidents.

---

## 1. Infrastructure Monitoring

### 1.1 Install and Configure OSSEC (HIDS)

```bash
# Install OSSEC server
wget -q -O - https://updates.atomicorp.com/installers/atomic | sudo bash
sudo apt-get install ossec-hids-server

# Configure
sudo nano /var/ossec/etc/ossec.conf
```

Add monitoring rules:

```xml
<ossec_config>
  <global>
    <jsonout_output>yes</jsonout_output>
    <alerts_log>yes</alerts_log>
    <logall>no</logall>
  </global>

  <!-- Monitor auth logs -->
  <localfile>
    <log_format>syslog</log_format>
    <location>/var/log/auth.log</location>
  </localfile>

  <!-- Monitor nginx logs -->
  <localfile>
    <log_format>nginx</log_format>
    <location>/var/log/nginx/access.log</location>
  </localfile>

  <!-- File integrity monitoring -->
  <syscheck>
    <directories check_all="yes">/etc,/usr/bin,/usr/sbin</directories>
    <directories check_all="yes">/opt/slidetheory/deployment/config</directories>
    <ignore>/etc/mtab</ignore>
    <ignore>/etc/prelink.cache</ignore>
  </syscheck>

  <!-- Rootkit detection -->
  <rootcheck>
    <rootkit_files>/var/ossec/etc/shared/rootkit_files.txt</rootkit_files>
    <rootkit_trojans>/var/ossec/etc/shared/rootkit_trojans.txt</rootkit_trojans>
  </rootcheck>

  <!-- Active response -->
  <active-response>
    <command>host-deny</command>
    <location>local</location>
    <level>6</level>
    <timeout>600</timeout>
  </active-response>
</ossec_config>
```

Start OSSEC:

```bash
sudo systemctl enable ossec
sudo systemctl start ossec
```

### 1.2 AIDE - File Integrity Monitoring

```bash
# Install AIDE
sudo apt-get install aide

# Initialize database
sudo aideinit
sudo cp /var/lib/aide/aide.db.new /var/lib/aide/aide.db

# Create daily check script
sudo tee /etc/cron.daily/aide-check << 'EOF'
#!/bin/bash
/usr/bin/aide --check | mail -s "AIDE Check $(hostname)" admin@slidetheory.app
EOF

sudo chmod +x /etc/cron.daily/aide-check
```

### 1.3 Log Aggregation with Promtail + Loki

Update `promtail-config.yml`:

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  # System logs
  - job_name: system
    static_configs:
      - targets:
          - localhost
        labels:
          job: system
          __path__: /var/log/*.log
    pipeline_stages:
      - multiline:
          firstline: '^\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}'
      - regex:
          expression: '^(?P\u003ctime\u003e\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(?P\u003chost\u003e\S+)\s+(?P\u003cmessage\u003e.*)$'
      - timestamp:
          source: time
          format: Jan 2 15:04:05

  # Auth logs (security critical)
  - job_name: auth
    static_configs:
      - targets:
          - localhost
        labels:
          job: auth
          __path__: /var/log/auth.log
    pipeline_stages:
      - regex:
          expression: '^(?P\u003ctime\u003e\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+\S+\s+(?P\u003cmessage\u003e.*)$'
      - match:
          selector: '{job="auth"} =~ "Failed password|Invalid user|authentication failure"'
          action: keep

  # Application logs
  - job_name: slidetheory
    static_configs:
      - targets:
          - localhost
        labels:
          job: slidetheory
          __path__: /opt/slidetheory/logs/*.log

  # Nginx access logs
  - job_name: nginx-access
    static_configs:
      - targets:
          - localhost
        labels:
          job: nginx
          __path__: /var/log/nginx/access.log
    pipeline_stages:
      - json:
          expressions:
            status: status
            method: method
            uri: uri
      - labels:
          status:
          method:
```

### 1.4 Security Dashboards in Grafana

Create `grafana-dashboard-security.json`:

```json
{
  "dashboard": {
    "title": "SlideTheory Security Monitoring",
    "panels": [
      {
        "title": "Failed SSH Logins",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(rate({job=\"auth\"} |= \"Failed password\" [5m]))"
          }
        ],
        "alert": {
          "conditions": [
            {
              "evaluator": {"type": "gt", "params": [10]},
              "operator": {"type": "and"},
              "query": {"params": ["A", "5m", "now"]},
              "reducer": {"type": "avg"}
            }
          ],
          "executionErrorState": "alerting",
          "frequency": "1m",
          "handler": 1,
          "name": "High SSH Failure Rate"
        }
      },
      {
        "title": "API Rate Limit Hits",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(slidetheory_requests_total{status=\"429\"}[5m])"
          }
        ]
      },
      {
        "title": "401 Unauthorized Requests",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(slidetheory_requests_total{status=\"401\"}[5m])"
          }
        ]
      },
      {
        "title": "File Integrity Changes",
        "type": "table",
        "targets": [
          {
            "expr": "aide_files_changed"
          }
        ]
      }
    ]
  }
}
```

---

## 2. Application Security Monitoring

### 2.1 Application Log Security Events

Update `middleware/logger.js`:

```javascript
const { recordSecurityEvent } = require('../services/security-monitor');

// Security event logging
function securityLogger(req, type, details = {}) {
  const event = {
    timestamp: new Date().toISOString(),
    type,
    severity: getSeverity(type),
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    path: req.path,
    method: req.method,
    ...details
  };

  // Log to console/file
  console.error('[SECURITY]', JSON.stringify(event));

  // Send to security monitoring
  recordSecurityEvent(event);

  // Alert if high severity
  if (event.severity === 'critical' || event.severity === 'high') {
    sendSecurityAlert(event);
  }
}

// Monitor for suspicious patterns
function detectSuspiciousActivity(req, res, next) {
  const suspiciousPatterns = [
    { pattern: /\.(git|env|config|sql|bak|old|backup)$/i, type: 'SENSITIVE_FILE_ACCESS' },
    { pattern: /(union|select|insert|update|delete|drop|script|alert)/i, type: 'POTENTIAL_INJECTION' },
    { pattern: /(\.\.|%2e%2e|%252e)/i, type: 'PATH_TRAVERSAL' },
    { pattern: /(eval\(|exec\(|system\(|passthru\()/i, type: 'CODE_INJECTION' }
  ];

  const path = req.path + (req.query ? JSON.stringify(req.query) : '');

  for (const { pattern, type } of suspiciousPatterns) {
    if (pattern.test(path)) {
      securityLogger(req, type, { matchedPattern: pattern.toString() });
      
      // Rate limit the IP
      blockIpIfNeeded(req.ip);
    }
  }

  next();
}

module.exports = { securityLogger, detectSuspiciousActivity };
```

### 2.2 Security Event Types to Monitor

```javascript
// services/security-monitor.js
const SECURITY_EVENTS = {
  // Authentication events
  AUTH_FAILURE: { severity: 'medium', threshold: 5 },
  AUTH_SUCCESS_AFTER_FAILURES: { severity: 'high', threshold: 1 },
  API_KEY_INVALID: { severity: 'medium', threshold: 10 },
  
  // Access events
  SENSITIVE_FILE_ACCESS: { severity: 'high', threshold: 1 },
  PATH_TRAVERSAL_ATTEMPT: { severity: 'high', threshold: 1 },
  RATE_LIMIT_EXCEEDED: { severity: 'low', threshold: 100 },
  
  // Input validation
  VALIDATION_FAILURE: { severity: 'low', threshold: 50 },
  POTENTIAL_INJECTION: { severity: 'high', threshold: 1 },
  PAYLOAD_TOO_LARGE: { severity: 'medium', threshold: 10 },
  
  // System events
  FILE_INTEGRITY_CHANGE: { severity: 'critical', threshold: 1 },
  PRIVILEGE_ESCALATION: { severity: 'critical', threshold: 1 },
  CONTAINER_BREAKOUT: { severity: 'critical', threshold: 1 }
};

// Track events per IP
const eventTracker = new Map();

async function recordSecurityEvent(event) {
  const config = SECURITY_EVENTS[event.type];
  if (!config) return;

  const key = `${event.ip}:${event.type}`;
  const now = Date.now();
  
  if (!eventTracker.has(key)) {
    eventTracker.set(key, { count: 0, firstSeen: now, events: [] });
  }
  
  const tracker = eventTracker.get(key);
  tracker.count++;
  tracker.events.push(event);
  
  // Clean old events
  tracker.events = tracker.events.filter(e => 
    now - new Date(e.timestamp).getTime() < 3600000 // 1 hour
  );
  tracker.count = tracker.events.length;

  // Check threshold
  if (tracker.count >= config.threshold) {
    await triggerSecurityResponse(event, tracker);
  }

  // Log to file
  await appendFile(
    '/app/logs/security.log',
    JSON.stringify(event) + '\n'
  );
}

async function triggerSecurityResponse(event, tracker) {
  // Block IP if needed
  if (['critical', 'high'].includes(SECURITY_EVENTS[event.type].severity)) {
    await blockIp(event.ip);
  }

  // Send alert
  await sendSecurityAlert({
    ...event,
    occurrenceCount: tracker.count,
    timeWindow: '1 hour'
  });
}
```

---

## 3. Alerting Configuration

### 3.1 Prometheus Alert Rules

Update `alerts.yml`:

```yaml
groups:
  - name: security
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(slidetheory_errors_total[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is above 10% for more than 2 minutes"

      # Suspicious 401 spike
      - alert: UnauthorizedAccessSpike
        expr: rate(slidetheory_requests_total{status="401"}[5m]) > 0.5
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Spike in unauthorized requests"
          description: "More than 0.5 unauthorized requests per second"

      # Rate limiting triggered
      - alert: RateLimitTriggered
        expr: rate(slidetheory_requests_total{status="429"}[5m]) > 0.1
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Rate limiting is actively blocking requests"

      # SSH brute force
      - alert: SSHBruteForce
        expr: rate(fail2ban_failed_attempts_total[5m]) > 0.2
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Possible SSH brute force attack"
          description: "Multiple failed SSH attempts detected"

      # File integrity violation
      - alert: FileIntegrityViolation
        expr: aide_files_changed > 0
        for: 0m
        labels:
          severity: critical
        annotations:
          summary: "File integrity violation detected"
          description: "Critical system files have been modified"

      # Container security
      - alert: ContainerRunningAsRoot
        expr: container_processes{user="root"} > 0
        for: 0m
        labels:
          severity: high
        annotations:
          summary: "Container running as root"

      # SSL certificate expiration
      - alert: SSLCertificateExpiringSoon
        expr: (ssl_certificate_expiry_seconds - time()) / 86400 < 7
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "SSL certificate expiring in less than 7 days"
```

### 3.2 Alertmanager Configuration

Update `alertmanager.yml`:

```yaml
global:
  smtp_smarthost: 'smtp.sendgrid.net:587'
  smtp_from: 'alerts@slidetheory.app'
  smtp_auth_username: 'apikey'
  smtp_auth_password: '${SENDGRID_API_KEY}'
  slack_api_url: '${SLACK_WEBHOOK_URL}'

route:
  receiver: 'default'
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  routes:
    - match:
        severity: critical
      receiver: 'critical'
      continue: true
    - match:
        severity: high
      receiver: 'high'

receivers:
  - name: 'default'
    slack_configs:
      - channel: '#alerts'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

  - name: 'critical'
    email_configs:
      - to: 'admin@slidetheory.app'
        subject: '[CRITICAL] SlideTheory Security Alert'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Severity: {{ .Labels.severity }}
          Description: {{ .Annotations.description }}
          Time: {{ .StartsAt }}
          {{ end }}
    slack_configs:
      - channel: '#security-alerts'
        title: '🚨 CRITICAL: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}@channel {{ .Annotations.summary }}{{ end }}'
        send_resolved: true

  - name: 'high'
    email_configs:
      - to: 'devops@slidetheory.app'
        subject: '[HIGH] SlideTheory Security Alert'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname']
```

---

## 4. Automated Response

### 4.1 IP Blocking Script

Create `/opt/slidetheory/scripts/block-ip.sh`:

```bash
#!/bin/bash
# Block IP using iptables and fail2ban

IP=$1
REASON=$2
DURATION=${3:-3600}  # Default 1 hour

if [[ ! $IP =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Invalid IP address: $IP"
    exit 1
fi

# Add to iptables
sudo iptables -A INPUT -s $IP -j DROP

# Add to fail2ban
sudo fail2ban-client set sshd banip $IP

# Log the action
echo "$(date): Blocked IP $IP - Reason: $REASON - Duration: ${DURATION}s" | sudo tee -a /var/log/security-blocks.log

# Notify
if command -v curl &> /dev/null; then
    curl -X POST ${SLACK_WEBHOOK_URL} \
        -H 'Content-type: application/json' \
        --data "{\"text\":\"🚫 Blocked IP: $IP\\nReason: $REASON\\nDuration: ${DURATION}s\"}"
fi

# Schedule unblock if duration specified
if [ $DURATION -gt 0 ]; then
    (sleep $DURATION && sudo iptables -D INPUT -s $IP -j DROP && echo "$(date): Unblocked IP $IP" | sudo tee -a /var/log/security-blocks.log) &
fi
```

```bash
chmod +x /opt/slidetheory/scripts/block-ip.sh
```

### 4.2 Automated Incident Response

Create `/opt/slidetheory/scripts/auto-respond.sh`:

```bash
#!/bin/bash
# Automated security incident response

INCIDENT_TYPE=$1
SEVERITY=$2
DETAILS=$3

case $INCIDENT_TYPE in
    "ssh-brute-force")
        # Extract IP from details
        IP=$(echo $DETAILS | grep -oE '\b[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+\b' | head -1)
        /opt/slidetheory/scripts/block-ip.sh $IP "SSH brute force" 86400
        ;;
    
    "web-attack")
        IP=$(echo $DETAILS | grep -oE '\b[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+\b' | head -1)
        /opt/slidetheory/scripts/block-ip.sh $IP "Web attack detected" 3600
        ;;
    
    "file-integrity")
        # Immediate admin notification
        echo "CRITICAL: File integrity violation" | mail -s "CRITICAL Security Incident" admin@slidetheory.app
        # Stop application
        docker-compose -f /opt/slidetheory/deployment/docker/docker-compose.yml stop app-prod
        ;;
    
    *)
        echo "Unknown incident type: $INCIDENT_TYPE"
        exit 1
        ;;
esac
```

---

## 5. Log Retention & Analysis

### 5.1 Log Rotation

Create `/etc/logrotate.d/slidetheory`:

```
/opt/slidetheory/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0600 slidetheory slidetheory
    postrotate
        /usr/bin/docker kill --signal="SIGUSR1" slidetheory-app-prod 2>/dev/null || true
    endscript
}

/var/log/security-blocks.log {
    daily
    rotate 90
    compress
    delaycompress
    missingok
    notifempty
    create 0600 root root
}
```

### 5.2 Weekly Security Report

Create `/opt/slidetheory/scripts/weekly-security-report.sh`:

```bash
#!/bin/bash
# Generate weekly security report

REPORT_FILE="/tmp/security-report-$(date +%Y%m%d).txt"

echo "SlideTheory Weekly Security Report" > $REPORT_FILE
echo "Generated: $(date)" >> $REPORT_FILE
echo "========================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "1. SSH Login Attempts:" >> $REPORT_FILE
grep "sshd" /var/log/auth.log | grep -E "(Failed|Accepted)" | wc -l >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "2. Blocked IPs:" >> $REPORT_FILE
wc -l /var/log/security-blocks.log >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "3. API Errors (401/403/429):" >> $REPORT_FILE
docker logs slidetheory-app-prod --since="7 days ago" 2>>1 | grep -E '"status":(401|403|429)' | wc -l >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "4. File Integrity Changes:" >> $REPORT_FILE
if [ -f /var/log/aide/aide.log ]; then
    grep "changed" /var/log/aide/aide.log | wc -l >> $REPORT_FILE
else
    echo "N/A" >> $REPORT_FILE
fi
echo "" >> $REPORT_FILE

echo "5. Container Restarts:" >> $REPORT_FILE
docker events --since="7 days ago" --filter "event=restart" --filter "container=slidetheory" | wc -l >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Send report
mail -s "Weekly Security Report - SlideTheory" admin@slidetheory.app < $REPORT_FILE
```

```bash
chmod +x /opt/slidetheory/scripts/weekly-security-report.sh

# Add to cron (Sundays at 9 AM)
echo "0 9 * * 0 /opt/slidetheory/scripts/weekly-security-report.sh" | sudo crontab -
```

---

## 6. Monitoring Checklist

### Daily Checks
- [ ] Review overnight security alerts
- [ ] Check fail2ban banned IPs
- [ ] Verify log aggregation working
- [ ] Review container resource usage

### Weekly Checks
- [ ] Review security dashboard
- [ ] Analyze blocked IP patterns
- [ ] Check for new vulnerabilities
- [ ] Review and rotate logs

### Monthly Checks
- [ ] Full security scan
- [ ] Review access logs for anomalies
- [ ] Update threat intelligence feeds
- [ ] Test incident response procedures

---

**Document Owner:** Security Team  
**Next Review:** March 5, 2026