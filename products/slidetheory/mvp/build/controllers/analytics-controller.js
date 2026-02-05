/**
 * Analytics Controller
 * Handles analytics dashboard and API endpoints
 */

const path = require('path');
const { STATUS } = require('../config/constants');
const { 
  getAnalyticsSummary, 
  getDailyReport, 
  resetAnalytics,
  exportAnalytics,
  recordFunnelStep 
} = require('../services/enhanced-analytics-service');
const { logger } = require('../middleware/logger');
const { asyncHandler } = require('../middleware/error-handler');

/**
 * Get analytics summary API
 * GET /api/analytics/summary
 */
const getAnalytics = asyncHandler(async (req, res) => {
  const { range = '7d' } = req.query;
  const validRanges = ['24h', '7d', '30d'];
  const timeRange = validRanges.includes(range) ? range : '7d';
  
  const analytics = await getAnalyticsSummary(timeRange);
  logger.info(req, 'Analytics summary retrieved', { range: timeRange });
  
  res.status(STATUS.OK).json({
    success: true,
    ...analytics
  });
});

/**
 * Get daily report
 * GET /api/analytics/daily-report
 */
const getDailyReportHandler = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const report = await getDailyReport(date);
  
  res.status(STATUS.OK).json({
    success: true,
    report
  });
});

/**
 * Get trends data
 * GET /api/analytics/trends
 */
const getTrends = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;
  const analytics = await getAnalyticsSummary(`${days}d`);
  
  res.status(STATUS.OK).json({
    success: true,
    trends: analytics.trends,
    timeRange: analytics.timeRange
  });
});

/**
 * Get funnel analytics
 * GET /api/analytics/funnel
 */
const getFunnel = asyncHandler(async (req, res) => {
  const analytics = await getAnalyticsSummary('30d');
  
  res.status(STATUS.OK).json({
    success: true,
    funnel: analytics.funnel
  });
});

/**
 * Get errors analytics
 * GET /api/analytics/errors
 */
const getErrors = asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;
  const analytics = await getAnalyticsSummary('7d');
  
  res.status(STATUS.OK).json({
    success: true,
    errors: {
      ...analytics.errors,
      recent: analytics.errors.recent.slice(0, parseInt(limit))
    }
  });
});

/**
 * Export analytics data
 * GET /api/analytics/export
 */
const exportAnalyticsData = asyncHandler(async (req, res) => {
  const data = await exportAnalytics();
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="analytics-${new Date().toISOString().split('T')[0]}.json"`);
  res.status(STATUS.OK).json(data);
});

/**
 * Reset analytics (with confirmation)
 * POST /api/analytics/reset
 */
const resetAnalyticsHandler = asyncHandler(async (req, res) => {
  const { confirm } = req.body;
  
  if (confirm !== 'RESET_ALL_DATA') {
    return res.status(STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Confirmation required. Send { "confirm": "RESET_ALL_DATA" }'
    });
  }
  
  await resetAnalytics();
  logger.info(req, 'Analytics data reset');
  
  res.status(STATUS.OK).json({
    success: true,
    message: 'Analytics data has been reset'
  });
});

/**
 * Track funnel step
 * POST /api/analytics/track
 */
const trackEvent = asyncHandler(async (req, res) => {
  const { step } = req.body;
  const validSteps = ['landing', 'form_start', 'form_complete', 'generation_start', 'generation_complete', 'export_start', 'export_complete'];
  
  if (!validSteps.includes(step)) {
    return res.status(STATUS.BAD_REQUEST).json({
      success: false,
      message: `Invalid step. Must be one of: ${validSteps.join(', ')}`
    });
  }
  
  await recordFunnelStep(step, req);
  
  res.status(STATUS.OK).json({
    success: true,
    tracked: step
  });
});

/**
 * Serve analytics dashboard HTML
 * GET /admin/analytics
 */
const serveDashboard = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin/analytics.html'));
};

module.exports = {
  getAnalytics,
  getDailyReport: getDailyReportHandler,
  getTrends,
  getFunnel,
  getErrors,
  exportAnalyticsData,
  resetAnalytics: resetAnalyticsHandler,
  trackEvent,
  serveDashboard
};
