#!/bin/bash
# =============================================================================
# SlideTheory MVP Deployment Script
# One-command deploy to VPS with error handling and rollback
# =============================================================================

set -e  # Exit on any error

# Configuration - EDIT THESE VALUES
VPS_USER="${VPS_USER:-deploy}"
VPS_HOST="${VPS_HOST:-your-vps-ip-or-domain}"
VPS_PORT="${VPS_PORT:-22}"
APP_DIR="${APP_DIR:-/var/www/slidetheory}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/slidetheory}"
PM2_NAME="${PM2_NAME:-slidetheory}"
REPO_URL="${REPO_URL:-https://github.com/yourusername/slidetheory.git}"
BRANCH="${BRANCH:-main}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# =============================================================================
# Pre-flight checks
# =============================================================================

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if SSH key is available
    if ! ssh -o BatchMode=yes -p "$VPS_PORT" "$VPS_USER@$VPS_HOST" "echo 'SSH OK'" 2>/dev/null; then
        log_error "Cannot connect to VPS. Check SSH keys and configuration."
        log_info "VPS_USER: $VPS_USER"
        log_info "VPS_HOST: $VPS_HOST"
        log_info "VPS_PORT: $VPS_PORT"
        exit 1
    fi
    log_success "SSH connection OK"
    
    # Check if PM2 is available on VPS
    if ! ssh -p "$VPS_PORT" "$VPS_USER@$VPS_HOST" "which pm2" 2>/dev/null; then
        log_warn "PM2 not found on VPS. Will install if needed."
    fi
    
    log_success "Prerequisites check passed"
}

# =============================================================================
# Remote deployment commands
# =============================================================================

run_remote() {
    ssh -p "$VPS_PORT" "$VPS_USER@$VPS_HOST" "$1"
}

create_backup() {
    log_info "Creating backup of current deployment..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_path="$BACKUP_DIR/backup_$timestamp"
    
    run_remote "
        sudo mkdir -p '$BACKUP_DIR'
        if [ -d '$APP_DIR' ]; then
            sudo cp -r '$APP_DIR' '$backup_path'
            sudo chown \$(stat -c '%U:%G' '$APP_DIR') '$backup_path' -R
            echo 'BACKUP_CREATED:$backup_path'
        else
            echo 'NO_EXISTING_DEPLOYMENT'
        fi
    "
    
    log_success "Backup created at $backup_path"
}

deploy_code() {
    log_info "Deploying code to $APP_DIR..."
    
    run_remote "
        set -e
        
        # Create app directory if it doesn't exist
        sudo mkdir -p '$APP_DIR'
        sudo chown \$USER:\$USER '$APP_DIR'
        
        if [ -d '$APP_DIR/.git' ]; then
            # Update existing repo
            cd '$APP_DIR'
            git fetch origin
            git reset --hard origin/$BRANCH
            git clean -fd
        else
            # Clone fresh
            rm -rf '$APP_DIR'
            git clone -b '$BRANCH' '$REPO_URL' '$APP_DIR'
        fi
        
        # Ensure we're in the build directory
        cd '$APP_DIR'
        
        echo 'CODE_DEPLOYED'
    "
    
    log_success "Code deployed"
}

install_dependencies() {
    log_info "Installing dependencies..."
    
    run_remote "
        set -e
        cd '$APP_DIR'
        npm install --production
        echo 'DEPS_INSTALLED'
    "
    
    log_success "Dependencies installed"
}

setup_environment() {
    log_info "Setting up environment..."
    
    # Check if .env exists, create from example if not
    run_remote "
        set -e
        cd '$APP_DIR'
        
        if [ ! -f '.env' ]; then
            if [ -f '.env.example' ]; then
                cp .env.example .env
                echo 'ENV_CREATED_FROM_EXAMPLE'
            else
                echo 'NO_ENV_FILE'
            fi
        else
            echo 'ENV_EXISTS'
        fi
    "
    
    log_warn "Make sure to update .env file with your API keys on the VPS!"
}

start_or_restart_app() {
    log_info "Starting/restarting application with PM2..."
    
    run_remote "
        set -e
        cd '$APP_DIR'
        
        # Check if app is already running
        if pm2 list | grep -q '$PM2_NAME'; then
            pm2 reload '$PM2_NAME' --update-env
        else
            pm2 start server.js --name '$PM2_NAME' --env production
        fi
        
        # Save PM2 config
        pm2 save
        
        echo 'APP_STARTED'
    "
    
    log_success "Application started with PM2"
}

verify_deployment() {
    log_info "Verifying deployment..."
    
    sleep 3  # Give the app time to start
    
    local health_check
    health_check=$(run_remote "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health" || echo "000")
    
    if [ "$health_check" = "200" ]; then
        log_success "Health check passed!"
        
        # Get version info
        local version_info
        version_info=$(run_remote "curl -s http://localhost:3000/api/health")
        log_info "Server info: $version_info"
    else
        log_error "Health check failed! HTTP $health_check"
        return 1
    fi
}

rollback() {
    local backup_path="$1"
    
    log_warn "Rolling back to previous version..."
    
    run_remote "
        if [ -d '$backup_path' ]; then
            pm2 stop '$PM2_NAME' 2>/dev/null || true
            sudo rm -rf '$APP_DIR'
            sudo cp -r '$backup_path' '$APP_DIR'
            sudo chown \$USER:\$USER '$APP_DIR' -R
            cd '$APP_DIR'
            pm2 start server.js --name '$PM2_NAME' || pm2 restart '$PM2_NAME'
            echo 'ROLLBACK_COMPLETE'
        else
            echo 'ROLLBACK_FAILED: No backup found'
        fi
    "
    
    log_success "Rollback complete"
}

cleanup_old_backups() {
    log_info "Cleaning up old backups (keeping last 10)..."
    
    run_remote "
        cd '$BACKUP_DIR' 2>/dev/null || exit 0
        ls -t | tail -n +11 | xargs -r sudo rm -rf
        echo 'CLEANUP_DONE'
    "
}

print_summary() {
    echo ""
    echo "=================================================================="
    log_success "Deployment Complete!"
    echo "=================================================================="
    echo ""
    echo "  App Directory: $APP_DIR"
    echo "  PM2 Process:   $PM2_NAME"
    echo "  VPS Host:      $VPS_USER@$VPS_HOST:$VPS_PORT"
    echo ""
    echo "  Useful commands:"
    echo "    View logs:    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST 'pm2 logs $PM2_NAME'"
    echo "    Restart:      ssh -p $VPS_PORT $VPS_USER@$VPS_HOST 'pm2 restart $PM2_NAME'"
    echo "    Status:       ssh -p $VPS_PORT $VPS_USER@$VPS_HOST 'pm2 status'"
    echo ""
    echo "=================================================================="
}

# =============================================================================
# Main deployment flow
# =============================================================================

main() {
    echo "=================================================================="
    echo "  SlideTheory MVP Deployment"
    echo "=================================================================="
    echo ""
    
    # Allow environment overrides
    if [ -f ".deploy.env" ]; then
        log_info "Loading configuration from .deploy.env"
        source .deploy.env
    fi
    
    # Check for required variables
    if [ "$VPS_HOST" = "your-vps-ip-or-domain" ]; then
        log_error "Please configure VPS_HOST in this script or set environment variable"
        log_info "Usage: VPS_USER=deploy VPS_HOST=1.2.3.4 ./deploy.sh"
        exit 1
    fi
    
    local backup_path=""
    local deploy_failed=false
    
    # Run deployment steps
    check_prerequisites
    
    # Create backup before making changes
    backup_result=$(create_backup)
    if echo "$backup_result" | grep -q "BACKUP_CREATED:"; then
        backup_path=$(echo "$backup_result" | grep "BACKUP_CREATED:" | cut -d: -f2-)
    fi
    
    # Deploy with error handling
    if ! deploy_code; then
        log_error "Failed to deploy code"
        deploy_failed=true
    fi
    
    if [ "$deploy_failed" = false ] && ! install_dependencies; then
        log_error "Failed to install dependencies"
        deploy_failed=true
    fi
    
    if [ "$deploy_failed" = false ]; then
        setup_environment
    fi
    
    if [ "$deploy_failed" = false ] && ! start_or_restart_app; then
        log_error "Failed to start application"
        deploy_failed=true
    fi
    
    if [ "$deploy_failed" = false ] && ! verify_deployment; then
        log_error "Deployment verification failed"
        deploy_failed=true
    fi
    
    # Handle failure or success
    if [ "$deploy_failed" = true ]; then
        log_error "Deployment failed!"
        
        if [ -n "$backup_path" ]; then
            rollback "$backup_path"
        else
            log_error "No backup available for rollback"
        fi
        
        exit 1
    fi
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Print success summary
    print_summary
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"
