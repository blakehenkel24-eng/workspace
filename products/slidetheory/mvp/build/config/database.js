/**
 * Database Configuration
 * Placeholder for future database connections
 */

const config = {
  // Future database configurations
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/slidetheory',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  
  postgresql: {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432'),
    database: process.env.PG_DATABASE || 'slidetheory',
    user: process.env.PG_USER || 'slidetheory',
    password: process.env.PG_PASSWORD || ''
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  },
  
  // Current file-based storage
  fileStorage: {
    enabled: true,
    basePath: process.env.DATA_DIR || require('path').join(__dirname, '..', 'tmp')
  }
};

/**
 * Initialize database connections
 * Currently returns file-based storage config
 */
async function initializeDatabase() {
  // Future: Connect to MongoDB, PostgreSQL, Redis, etc.
  console.log('[Database] Using file-based storage (database not configured)');
  return {
    type: 'file',
    config: config.fileStorage
  };
}

module.exports = {
  config,
  initializeDatabase
};
