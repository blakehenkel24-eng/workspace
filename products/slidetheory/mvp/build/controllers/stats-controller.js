/**
 * Stats Controller
 * Handles analytics and statistics endpoints
 */

const { STATUS } = require('../config/constants');
const { getAnalyticsSummary } = require('../services/analytics-service');
const { logger } = require('../middleware/logger');
const { asyncHandler } = require('../middleware/error-handler');

/**
 * Get usage statistics
 * GET /api/stats
 */
const getStats = asyncHandler(async (req, res) => {
  const analytics = await getAnalyticsSummary();
  logger.info(req, 'Stats retrieved');
  
  res.status(STATUS.OK).json({
    success: true,
    ...analytics
  });
});

module.exports = {
  getStats
};
