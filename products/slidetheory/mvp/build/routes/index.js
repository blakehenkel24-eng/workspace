/**
 * API Routes Index
 * Aggregates all API routes
 */

const express = require('express');
const router = express.Router();

// Import route modules
const healthRoutes = require('./health-routes');
const statsRoutes = require('./stats-routes');
const templateRoutes = require('./template-routes');
const slideRoutes = require('./slide-routes');
const exportRoutes = require('./export-routes');
const fileRoutes = require('./file-routes');
const progressRoutes = require('./progress-routes');
const performanceRoutes = require('./performance-routes');
const analyticsRoutes = require('./analytics-routes');

// Mount routes
router.use(healthRoutes);
router.use(statsRoutes);
router.use(templateRoutes);
router.use(slideRoutes);
router.use(exportRoutes);
router.use('/progress', progressRoutes);
router.use(performanceRoutes);
router.use(analyticsRoutes);

// Static file serving routes (mounted at root level in server)
module.exports = {
  api: router,
  files: fileRoutes
};
