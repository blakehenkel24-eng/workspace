# Agent Task: OpenClaw VPS Security Hardening

**Source:** Todoist Task #9987182586
**Original Task:** "Lookup for to run open claw safely and securely on a VPS. Want to ensure that it is completely secure and there are safeguards in place"

## Objective
Research and document best practices for running OpenClaw securely on a VPS.

## Deliverables
1. Create `/home/node/.openclaw/workspace/workspace/openclaw-vps-security.md`
2. Cover these security areas:

### Server Hardening
- SSH key-only access (disable password auth)
- Fail2ban setup
- Firewall configuration (UFW)
- Automatic security updates

### Application Security
- Running OpenClaw in isolated environment
- Containerization (Docker) benefits
- Secrets management (API keys, tokens)
- Environment variable security

### Network Security
- VPN/tunnel options (Tailscale, WireGuard)
- Reverse proxy setup (Nginx/Caddy)
- SSL/TLS configuration
- Rate limiting

### Monitoring & Safeguards
- Log aggregation
- Intrusion detection
- Backup strategies
- Recovery procedures

### Access Control
- Least privilege principles
- User account management
- API key rotation

## Format
- Step-by-step where applicable
- Include example configs (nginx, ufw, etc.)
- Prioritize by security impact

Report back with complete security guide.
