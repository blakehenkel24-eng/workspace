# SlideTheory Deployment Guide

## System Requirements

### Minimum Requirements
- Node.js 18.0.0 or higher
- 1GB RAM
- 2GB disk space
- Linux/macOS/Windows

### Recommended for Production
- Node.js 20 LTS
- 2GB+ RAM
- 5GB disk space
- Ubuntu 22.04 LTS or similar

## Installation

### 1. Clone/Extract Application

```bash
cd /var/www/slidetheory
# or your preferred directory
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- `express` - Web framework
- `node-html-to-image` - PNG generation
- `pptxgenjs` - PowerPoint generation
- `puppeteer` - PDF generation
- `dotenv` - Environment configuration

### 3. Environment Configuration

Create `.env` file:

```bash
cat > .env << 'EOF'
# Server
PORT=3000

# Optional: Kimi API for AI content generation
# Leave blank to use fallback content generation
KIMI_API_KEY=your_moonshot_api_key_here
KIMI_MODEL=kimi-coding/k2p5

# Analytics
ANALYTICS_FILE=./tmp/analytics.json

# Optional: Restrict CORS in production
# ALLOWED_ORIGINS=https://yourdomain.com
EOF
```

### 4. Create Directories

```bash
mkdir -p tmp/slides tmp/exports
chmod 755 tmp
```

## Running the Application

### Development Mode

```bash
npm run dev
```

Uses Node.js `--watch` for auto-restart on file changes.

### Production Mode

```bash
npm start
```

Or with PM2:

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
npm run pm2:start

# View logs
pm2 logs slidetheory

# Restart
npm run pm2:restart

# Stop
npm run pm2:stop
```

## Web Server Configuration

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout for PDF generation
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

### SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Database/Storage

### Current Setup (File-based)

No database required. Analytics stored in JSON file:
- Location: `tmp/analytics.json`
- Auto-created on first write
- Backup recommended

### Backup Script

```bash
#!/bin/bash
# backup-analytics.sh
BACKUP_DIR="/backups/slidetheory"
mkdir -p $BACKUP_DIR

cp tmp/analytics.json $BACKUP_DIR/analytics-$(date +%Y%m%d).json

# Keep only last 30 days
find $BACKUP_DIR -name "analytics-*.json" -mtime +30 -delete
```

Add to crontab:
```bash
0 2 * * * /var/www/slidetheory/backup-analytics.sh
```

## Monitoring

### Health Check Endpoint

```bash
curl https://yourdomain.com/api/health
```

Expected response: `{"status":"ok","version":"1.1.0"}`

### PM2 Monitoring

```bash
pm2 monit
pm2 status
```

### Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 10
```

## Security Checklist

- [ ] Change default port if needed
- [ ] Configure firewall (allow 80, 443; block 3000 from external)
- [ ] Set up SSL/TLS
- [ ] Restrict API key access
- [ ] Enable rate limiting (implement in code)
- [ ] Set up log monitoring
- [ ] Configure automatic security updates

## Troubleshooting Deployment

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process or use different port
PORT=3001 npm start
```

### Permission Denied

```bash
# Fix permissions
sudo chown -R $USER:$USER /var/www/slidetheory
chmod -R 755 /var/www/slidetheory
```

### Puppeteer/Chromium Issues

```bash
# Install Chromium dependencies (Ubuntu)
sudo apt-get install -y libnss3 libatk-bridge2.0-0 libxss1 libgtk-3-0

# Or use system Chrome
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
```

## Scaling

### Vertical Scaling
- Increase RAM for more concurrent PDF generation
- CPU cores help with parallel exports

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Shared storage for exports (S3, NFS)
- Redis for session state (if added)

## Updates

### Update Application

```bash
git pull origin main
npm install
npm run pm2:restart
```

### Update Node.js

```bash
# Using nvm
nvm install 20
nvm use 20
npm install
npm run pm2:restart
```

## Docker Deployment (Optional)

```dockerfile
FROM node:20-slim

# Install Chromium dependencies
RUN apt-get update && apt-get install -y \
    libnss3 libatk-bridge2.0-0 libxss1 libgtk-3-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 3000

CMD ["npm", "start"]
```

```bash
docker build -t slidetheory .
docker run -p 3000:3000 -v $(pwd)/tmp:/app/tmp slidetheory
```

## Support

For issues:
1. Check logs: `pm2 logs slidetheory`
2. Review API.md for endpoint details
3. See TROUBLESHOOTING.md for common issues
