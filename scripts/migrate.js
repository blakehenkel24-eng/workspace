#!/usr/bin/env node
/**
 * Database Migration Runner
 * 
 * Usage:
 *   node scripts/migrate.js up        # Run all pending migrations
 *   node scripts/migrate.js down      # Rollback last migration
 *   node scripts/migrate.js status    # Show migration status
 *   node scripts/migrate.js create    # Create a new migration file
 * 
 * Environment:
 *   DATABASE_URL - PostgreSQL connection string
 *   MIGRATIONS_DIR - Directory containing migration files (default: ./migrations)
 */

const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

// Configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/slidetheory';
const MIGRATIONS_DIR = process.env.MIGRATIONS_DIR || path.join(__dirname, '..', 'migrations');

// Create migrations tracking table
const CREATE_MIGRATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) UNIQUE NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    checksum VARCHAR(64) NOT NULL
);
`;

// Database connection
async function getDb() {
    const pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    return pool;
}

// Calculate file checksum
async function getChecksum(filepath) {
    const crypto = require('crypto');
    const content = await fs.readFile(filepath, 'utf8');
    return crypto.createHash('sha256').update(content).digest('hex');
}

// Get all migration files sorted
async function getMigrationFiles() {
    try {
        const files = await fs.readdir(MIGRATIONS_DIR);
        return files
            .filter(f => f.endsWith('.sql'))
            .sort();
    } catch (err) {
        console.error(`Error reading migrations directory: ${err.message}`);
        return [];
    }
}

// Get applied migrations from database
async function getAppliedMigrations(client) {
    const result = await client.query('SELECT filename, checksum FROM migrations ORDER BY id');
    return result.rows;
}

// Run migration up
async function migrateUp() {
    const db = await getDb();
    const client = await db.connect();
    
    try {
        // Ensure migrations table exists
        await client.query(CREATE_MIGRATIONS_TABLE);
        
        // Get pending migrations
        const files = await getMigrationFiles();
        const applied = await getAppliedMigrations(client);
        const appliedMap = new Map(applied.map(a => [a.filename, a]));
        
        const pending = files.filter(f => !appliedMap.has(f));
        
        if (pending.length === 0) {
            console.log('✓ No pending migrations');
            return;
        }
        
        console.log(`Running ${pending.length} migration(s)...\n`);
        
        // Run each pending migration
        for (const filename of pending) {
            const filepath = path.join(MIGRATIONS_DIR, filename);
            const sql = await fs.readFile(filepath, 'utf8');
            const checksum = await getChecksum(filepath);
            
            console.log(`→ ${filename}`);
            
            try {
                await client.query('BEGIN');
                await client.query(sql);
                await client.query(
                    'INSERT INTO migrations (filename, checksum) VALUES ($1, $2)',
                    [filename, checksum]
                );
                await client.query('COMMIT');
                console.log(`  ✓ Applied\n`);
            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`  ✗ Failed: ${err.message}`);
                throw err;
            }
        }
        
        console.log('✓ All migrations completed successfully');
        
    } finally {
        client.release();
        await db.end();
    }
}

// Rollback last migration
async function migrateDown() {
    const db = await getDb();
    const client = await db.connect();
    
    try {
        // Get last applied migration
        const result = await client.query(
            'SELECT filename FROM migrations ORDER BY id DESC LIMIT 1'
        );
        
        if (result.rows.length === 0) {
            console.log('✓ No migrations to rollback');
            return;
        }
        
        const { filename } = result.rows[0];
        
        console.log(`Rolling back: ${filename}`);
        
        // Look for down migration file
        const downFilename = filename.replace('.sql', '_down.sql');
        const downPath = path.join(MIGRATIONS_DIR, downFilename);
        
        try {
            const downSql = await fs.readFile(downPath, 'utf8');
            
            await client.query('BEGIN');
            await client.query(downSql);
            await client.query('DELETE FROM migrations WHERE filename = $1', [filename]);
            await client.query('COMMIT');
            
            console.log('✓ Rollback completed');
        } catch (err) {
            await client.query('ROLLBACK');
            if (err.code === 'ENOENT') {
                console.error(`✗ No down migration found: ${downFilename}`);
                console.error('  Create it or rollback manually');
            } else {
                throw err;
            }
        }
        
    } finally {
        client.release();
        await db.end();
    }
}

// Show migration status
async function migrateStatus() {
    const db = await getDb();
    const client = await db.connect();
    
    try {
        // Ensure migrations table exists
        await client.query(CREATE_MIGRATIONS_TABLE);
        
        const files = await getMigrationFiles();
        const applied = await getAppliedMigrations(client);
        const appliedMap = new Map(applied.map(a => [a.filename, a]));
        
        console.log('\nMigration Status:');
        console.log('=================\n');
        
        for (const filename of files) {
            const appliedMigration = appliedMap.get(filename);
            
            if (appliedMigration) {
                // Verify checksum
                const filepath = path.join(MIGRATIONS_DIR, filename);
                const currentChecksum = await getChecksum(filepath);
                const checksumOk = currentChecksum === appliedMigration.checksum;
                
                const status = checksumOk ? '✓' : '⚠ (modified)';
                console.log(`${status} ${filename}`);
                console.log(`  Applied: ${appliedMigration.applied_at}`);
                if (!checksumOk) {
                    console.log(`  Warning: File has been modified since application`);
                }
            } else {
                console.log(`○ ${filename} (pending)`);
            }
        }
        
        const pendingCount = files.length - applied.length;
        console.log(`\n${files.length} total, ${applied.length} applied, ${pendingCount} pending`);
        
    } finally {
        client.release();
        await db.end();
    }
}

// Create new migration file
async function createMigration() {
    const name = process.argv[3];
    
    if (!name) {
        console.error('Usage: node migrate.js create <migration-name>');
        process.exit(1);
    }
    
    // Generate filename
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
    const filename = `${timestamp}_${name.replace(/\s+/g, '_').toLowerCase()}.sql`;
    const filepath = path.join(MIGRATIONS_DIR, filename);
    
    // Template content
    const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}

-- Add your migration SQL here

-- Example:
-- ALTER TABLE users ADD COLUMN new_field VARCHAR(100);

-- Note: Create a corresponding ${filename.replace('.sql', '_down.sql')} file for rollback
`;
    
    await fs.writeFile(filepath, template);
    console.log(`✓ Created: ${filename}`);
    
    // Create down migration template
    const downFilename = filename.replace('.sql', '_down.sql');
    const downPath = path.join(MIGRATIONS_DIR, downFilename);
    const downTemplate = `-- Rollback: ${name}
-- Created: ${new Date().toISOString()}

-- Add your rollback SQL here

-- Example:
-- ALTER TABLE users DROP COLUMN new_field;
`;
    
    await fs.writeFile(downPath, downTemplate);
    console.log(`✓ Created: ${downFilename}`);
}

// Main
async function main() {
    const command = process.argv[2] || 'status';
    
    switch (command) {
        case 'up':
            await migrateUp();
            break;
        case 'down':
            await migrateDown();
            break;
        case 'status':
            await migrateStatus();
            break;
        case 'create':
            await createMigration();
            break;
        default:
            console.log(`
Usage: node migrate.js <command>

Commands:
  up       Run all pending migrations
  down     Rollback last migration
  status   Show migration status
  create   Create a new migration file

Examples:
  node migrate.js up
  node migrate.js create add_user_preferences
            `);
    }
}

main().catch(err => {
    console.error('Migration failed:', err.message);
    process.exit(1);
});
