#!/bin/bash
# =============================================================================
# SlideTheory MVP - Daily Slide Backup Script
# Archives generated slides, keeps last 30 days, deletes older
# =============================================================================

set -e  # Exit on any error

# Configuration
SLIDES_DIR="${SLIDES_DIR:-./tmp/slides}"
BACKUP_ROOT="${BACKUP_ROOT:-./backups/slides}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DATE=$(date +%Y%m%d)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARN${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR${NC} $1"
}

# =============================================================================
# Backup Functions
# =============================================================================

check_slides_directory() {
    if [ ! -d "$SLIDES_DIR" ]; then
        log_error "Slides directory not found: $SLIDES_DIR"
        exit 1
    fi
    
    local slide_count=$(find "$SLIDES_DIR" -type f 2>/dev/null | wc -l)
    log_info "Found $slide_count slides in $SLIDES_DIR"
    
    if [ "$slide_count" -eq 0 ]; then
        log_warn "No slides to backup"
        exit 0
    fi
}

create_backup_directory() {
    local backup_dir="$BACKUP_ROOT/$DATE"
    
    if [ ! -d "$backup_dir" ]; then
        mkdir -p "$backup_dir"
        log_info "Created backup directory: $backup_dir"
    fi
    
    echo "$backup_dir"
}

backup_slides() {
    local backup_dir="$1"
    local archive_name="slides_${TIMESTAMP}.tar.gz"
    local archive_path="$backup_dir/$archive_name"
    
    log_info "Creating backup archive: $archive_name"
    
    # Create tar.gz archive with slides
    tar -czf "$archive_path" -C "$(dirname "$SLIDES_DIR")" "$(basename "$SLIDES_DIR")" 2>/dev/null || {
        log_error "Failed to create archive"
        return 1
    }
    
    # Get archive size
    local archive_size=$(du -h "$archive_path" | cut -f1)
    local file_count=$(tar -tzf "$archive_path" | wc -l)
    
    log_success "Archive created: $archive_name ($archive_size, $file_count files)"
    
    # Create manifest
    cat > "$backup_dir/manifest_${TIMESTAMP}.txt" << EOF
SlideTheory Backup Manifest
============================
Date: $(date '+%Y-%m-%d %H:%M:%S')
Archive: $archive_name
Source: $SLIDES_DIR
Files: $file_count
Size: $archive_size
Hostname: $(hostname)
User: $(whoami)
EOF
    
    echo "$archive_path"
}

cleanup_old_backups() {
    log_info "Cleaning up backups older than $RETENTION_DAYS days..."
    
    if [ ! -d "$BACKUP_ROOT" ]; then
        log_warn "Backup root directory does not exist"
        return 0
    fi
    
    local deleted_count=0
    local total_freed=0
    
    # Find and remove old backup directories
    find "$BACKUP_ROOT" -maxdepth 1 -type d -mtime +$RETENTION_DAYS ! -path "$BACKUP_ROOT" -print0 2>/dev/null | while IFS= read -r -d '' dir; do
        if [ -n "$dir" ]; then
            local dir_size=$(du -sm "$dir" 2>/dev/null | cut -f1)
            rm -rf "$dir"
            deleted_count=$((deleted_count + 1))
            total_freed=$((total_freed + dir_size))
            log_info "Deleted old backup: $(basename "$dir") (${dir_size}MB)"
        fi
    done
    
    # Also clean up old tar.gz files
    find "$BACKUP_ROOT" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    log_success "Cleanup completed"
}

show_backup_stats() {
    if [ ! -d "$BACKUP_ROOT" ]; then
        return
    fi
    
    local total_backups=$(find "$BACKUP_ROOT" -name "*.tar.gz" | wc -l)
    local total_size=$(du -sh "$BACKUP_ROOT" 2>/dev/null | cut -f1)
    
    echo ""
    log_info "Backup Statistics:"
    echo "  Total backups: $total_backups"
    echo "  Total size: $total_size"
    echo "  Backup location: $BACKUP_ROOT"
    echo "  Retention period: $RETENTION_DAYS days"
}

# =============================================================================
# Main
# =============================================================================

main() {
    echo "=================================================================="
    echo "  SlideTheory Slide Backup"
    echo "  $(date '+%Y-%m-%d %H:%M:%S')"
    echo "=================================================================="
    echo ""
    
    # Allow loading config from environment file
    if [ -f ".backup.env" ]; then
        log_info "Loading configuration from .backup.env"
        source .backup.env
    fi
    
    # Ensure backup root exists
    mkdir -p "$BACKUP_ROOT"
    
    # Check slides directory
    check_slides_directory
    
    # Create backup
    local backup_dir=$(create_backup_directory)
    local archive_path=$(backup_slides "$backup_dir")
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Show statistics
    show_backup_stats
    
    echo ""
    log_success "Backup completed successfully!"
    echo "  Archive: $archive_path"
    echo "=================================================================="
}

# Handle script interruption
trap 'log_error "Backup interrupted"; exit 1' INT TERM

# Run main function
main "$@"
