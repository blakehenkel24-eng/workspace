/**
 * Analytics Routes
 * Analytics dashboard and API endpoints
 */

const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getDailyReport,
  getTrends,
  getFunnel,
  getErrors,
  exportAnalyticsData,
  resetAnalytics,
  trackEvent,
  serveDashboard
} = require('../controllers/analytics-controller');

// Analytics Dashboard (HTML page)
router.get('/admin/analytics', serveDashboard);

// Analytics API endpoints
router.get('/api/analytics/summary', getAnalytics);
router.get('/api/analytics/daily-report', getDailyReport);
router.get('/api/analytics/trends', getTrends);
router.get('/api/analytics/funnel', getFunnel);
router.get('/api/analytics/errors', getErrors);
router.get('/api/analytics/export', exportAnalyticsData);
router.post('/api/analytics/reset', resetAnalytics);
router.post('/api/analytics/track', trackEvent);

module.exports = router;
