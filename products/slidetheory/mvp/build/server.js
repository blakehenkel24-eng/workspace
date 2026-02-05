/**
 * SlideTheory MVP Server v2.0 (Modular Architecture)
 * Production-ready with scalable folder structure
 */

require('dotenv').config();
const express = require('express');
const path = require('path');

// Configuration
const config = require('./config');
const { VERSION } = require('./config/constants');

// Middleware
const { requestId, requestLogger, performanceMonitor } = require('./middleware/logger');
const { errorHandler, notFoundHandler } = require('./middleware/error-handler');

// Routes
const routes = require('./routes');

// Services
const { ensureDirectory } = require('./utils/helpers');

// Initialize Express app
const app = express();

// ==================== MIDDLEWARE SETUP ====================

// Request ID middleware (must be first)
app.use(requestId);

// Request logging
app.use(requestLogger);

// Performance monitoring (logs slow requests > 5s)
app.use(performanceMonitor(5000));

// Body parsing
app.use(express.json({ limit: config.validation.maxRequestSize }));
app.use(express.urlencoded({ extended: true, limit: config.validation.maxRequestSize }));

// Static files
app.use(express.static(config.paths.public));

// ==================== ROUTES ====================

// API routes
app.use('/api', routes.api);

// File serving routes (at root level)
app.use(routes.files);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ==================== INITIALIZATION ====================

/**
 * Initialize directories and start server
 */
async function startServer() {
  try {
    // Ensure required directories exist
    await ensureDirectory(config.paths.slides);
    await ensureDirectory(config.paths.exports);
    await ensureDirectory(path.dirname(config.paths.analytics));
    
    console.log('[Server] Directories initialized');
    
    // Start server
    app.listen(config.port, () => {
      const { isAIAvailable, getProviderDisplayName } = require('./config/ai-providers');
      
      console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║     SlideTheory MVP Server v${VERSION}                      ║
║                                                        ║
║     Environment: ${config.nodeEnv.padEnd(33)}  ║
║     Port: ${String(config.port).padEnd(42)}  ║
║                                                        ║
║     Features:                                          ║
║     • AI Generation: ${(isAIAvailable() ? '✅ ' + getProviderDisplayName() : '⚠️  Fallback Mode').padEnd(32)}  ║
║     • Export Formats: ${config.exports.formats.join(', ').padEnd(30)}  ║
║     • Slide Types: ${String(config.slides.validTypes.length).padEnd(33)}  ║
║                                                        ║
║     http://localhost:${config.port}                            ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

// Start the server
startServer();

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('[Fatal] Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Fatal] Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
