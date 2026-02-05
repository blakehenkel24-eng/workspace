# Database Setup Guide

SlideTheory uses PostgreSQL for data persistence.

## Quick Start

### 1. Install PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql-15 postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE slidetheory;
CREATE USER slidetheory_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE slidetheory TO slidetheory_user;

# Exit
\q
```

### 3. Set Environment Variable

```bash
export DATABASE_URL="postgresql://slidetheory_user:your_secure_password@localhost:5432/slidetheory"
```

Add to `.env` file:
```bash
DATABASE_URL=postgresql://slidetheory_user:your_secure_password@localhost:5432/slidetheory
```

### 4. Run Migrations

```bash
node scripts/migrate.js up
```

## Schema Overview

### Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts, profiles, billing |
| `api_keys` | API authentication keys |
| `slides` | Generated slide records |
| `exports` | Export jobs and results |
| `templates` | Slide templates |
| `activity_log` | Audit trail |
| `webhooks` | Webhook configurations |
| `migrations` | Migration tracking |

### Entity Relationships

```
users ||--o{ api_keys : has
users ||--o{ slides : generates
users ||--o{ exports : creates
users ||--o{ webhooks : configures
users ||--o{ activity_log : generates
slides ||--o{ exports : has
```

## Migrations

### Run All Pending Migrations

```bash
node scripts/migrate.js up
```

### Check Status

```bash
node scripts/migrate.js status
```

### Create New Migration

```bash
node scripts/migrate.js create add_user_preferences
```

This creates:
- `migrations/20260205120000_add_user_preferences.sql`
- `migrations/20260205120000_add_user_preferences_down.sql`

### Rollback Last Migration

```bash
node scripts/migrate.js down
```

## Production Setup

### Using Managed PostgreSQL

**AWS RDS:**
```bash
DATABASE_URL=postgresql://user:pass@slidetheory.abc123.us-east-1.rds.amazonaws.com:5432/slidetheory?sslmode=require
```

**Google Cloud SQL:**
```bash
DATABASE_URL=postgresql://user:pass@/slidetheory?host=/cloudsql/project:region:instance
```

**Heroku Postgres:**
```bash
# Heroku sets DATABASE_URL automatically
```

### Connection Pooling

Use PgBouncer for connection pooling:

```bash
# Connection string for PgBouncer
DATABASE_URL=postgresql://user:pass@localhost:6432/slidetheory?pool_mode=transaction
```

### Backup Strategy

**Automated Backups:**
```bash
# Daily backup script
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d).sql.gz
```

**Point-in-Time Recovery:**
- Enable WAL archiving
- Use continuous archiving to S3

## Performance Optimization

### Indexes

Key indexes are created automatically:
- `idx_users_email` — Email lookups
- `idx_slides_user` — User slide history
- `idx_slides_created` — Recent slides
- `idx_slides_search` — Full-text search
- `idx_activity_user` — User activity queries

### Partitioning

For high-volume installations, partition `activity_log`:

```sql
-- Create monthly partitions
CREATE TABLE activity_log_2026_02 PARTITION OF activity_log
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

### Connection Tuning

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Increase max connections (postgresql.conf)
max_connections = 200

-- Shared buffers
shared_buffers = 256MB
```

## Common Queries

### User Usage Stats

```sql
SELECT * FROM user_usage_summary 
WHERE plan = 'pro' 
ORDER BY slides_last_30_days DESC;
```

### Daily Activity

```sql
SELECT * FROM daily_stats 
WHERE date > CURRENT_DATE - INTERVAL '7 days';
```

### Expired Slides Cleanup

```sql
-- Soft delete expired slides
UPDATE slides 
SET deleted_at = CURRENT_TIMESTAMP
WHERE expires_at < CURRENT_TIMESTAMP 
  AND deleted_at IS NULL;
```

## Troubleshooting

### Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"

# Check logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Migration Failures

```bash
# Check migration status
node scripts/migrate.js status

# Manual rollback
psql $DATABASE_URL -f migrations/xxx_down.sql

# Mark migration as applied (careful!)
psql $DATABASE_URL -c "INSERT INTO migrations (filename, checksum) VALUES ('xxx.sql', 'manual')"
```

### Performance Issues

```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check table sizes
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_stat_user_tables 
ORDER BY pg_total_relation_size(relid) DESC;
```
