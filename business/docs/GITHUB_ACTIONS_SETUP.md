# GitHub Actions Auto-Deploy Setup

## ✅ What's Been Configured

I've set up a complete CI/CD pipeline that automatically:

1. **Tests** - Runs on every PR and push
2. **Security Scans** - npm audit + Trivy vulnerability scanning  
3. **Builds** - Creates Docker image on push to main/develop
4. **Deploys** - Staging (develop branch) / Production (version tags)
5. **Notifies** - Slack notifications on success/failure

## 📁 Files Created

```
.github/workflows/
├── deploy.yml    # Main CI/CD pipeline
└── rollback.yml  # Manual rollback workflow
```

## 🔐 Secrets Required (Action Needed)

Blake needs to add these secrets to the GitHub repository:

### For Staging Deployment
| Secret | Value | How to Get |
|--------|-------|------------|
| `STAGING_SSH_KEY` | Private SSH key for staging server | Generate with `ssh-keygen -t ed25519 -C "github-actions"` |
| `STAGING_HOST` | Staging server IP/hostname | From Hostinger VPS |
| `STAGING_USER` | SSH username (e.g., `root` or `ubuntu`) | From Hostinger setup |

### For Production Deployment  
| Secret | Value | How to Get |
|--------|-------|------------|
| `PRODUCTION_SSH_KEY` | Private SSH key for production server | Same as staging (or separate key) |
| `PRODUCTION_HOST` | Production server IP/hostname | From Hostinger VPS |
| `PRODUCTION_USER` | SSH username | From Hostinger setup |

### Optional
| Secret | Value | Purpose |
|--------|-------|---------|
| `SLACK_WEBHOOK_URL` | Slack webhook URL | Deployment notifications |

## 🚀 How to Add Secrets

1. Go to: `https://github.com/Blake/slidetheory/settings/secrets/actions`
2. Click "New repository secret"
3. Add each secret from the table above

## 📋 Deployment Triggers

| Action | Result |
|--------|--------|
| Push to `develop` | Auto-deploy to staging |
| Push to `main` | Build image only (no auto-deploy) |
| Tag `v*` (e.g., `v1.2.3`) | Auto-deploy to production |
| Manual workflow run | Trigger rollback if needed |

## 🔄 Rollback Process

If a deployment fails:

1. Go to **Actions** → **Rollback**
2. Click **Run workflow**
3. Select environment (staging/production)
4. Enter version (or "rollback" for previous)
5. Click **Run workflow**

## 🛠️ Server Setup Required

Before deployments work, the server needs:

1. **Docker & Docker Compose installed**
2. **Directory structure**:
   ```
   /opt/slidetheory/
   ├── deployment/
   │   └── docker/
   │       └── docker-compose.yml
   └── docker-compose.override.yml (if needed)
   ```
3. **SSH key added** to `~/.ssh/authorized_keys`
4. **GitHub Container Registry login**:
   ```bash
   echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
   ```

## 🧪 Testing the Pipeline

After adding secrets, test with:

```bash
# Push to develop branch
git checkout develop
git commit --allow-empty -m "Test staging deploy"
git push origin develop

# Check Actions tab for deployment progress
```

## 📊 Pipeline Features

- ✅ Multi-arch builds (AMD64 + ARM64)
- ✅ Rolling deployments with zero downtime
- ✅ Automatic rollback on health check failure
- ✅ Security scanning with Trivy
- ✅ npm audit for dependency vulnerabilities
- ✅ Docker layer caching for faster builds
- ✅ Slack notifications (optional)

## 🆘 Troubleshooting

### "Permission denied" during deploy
- SSH key not added to server: `cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys`
- Wrong key format: Ensure PEM format (`-----BEGIN OPENSSH PRIVATE KEY-----`)

### "Cannot connect to Docker daemon"
- User not in docker group: `sudo usermod -aG docker $USER`
- Need to re-login: `newgrp docker`

### Health check fails
- Check app logs: `docker-compose logs -f app-prod`
- Verify `.env` file exists with required variables
- Test locally: `curl http://localhost:3000/api/health`

## 📚 Related Documentation

- [Deployment README](../products/slidetheory/deployment/README.md)
- [Operations Guide](../products/slidetheory/deployment/OPERATIONS.md)
- [MVP Architecture](../products/slidetheory/mvp/build/ARCHITECTURE.md)

---

**Status:** ✅ Ready for Blake to add SSH secrets
