/**
 * Health Controller
 * Handles health check endpoints
 */

const config = require('../config');
const { VERSION, STATUS } = require('../config/constants');
const { isAIAvailable, getProviderDisplayName } = require('../config/ai-providers');

/**
 * Get health status
 * GET /api/health
 */
function getHealth(req, res) {
  res.status(STATUS.OK).json({
    status: 'ok',
    version: VERSION,
    timestamp: new Date().toISOString(),
    features: {
      aiGeneration: isAIAvailable(),
      aiProvider: getProviderDisplayName(),
      exports: config.exports.formats,
      slideTypes: config.slides.validTypes
    },
    environment: config.nodeEnv
  });
}

/**
 * Get detailed system status (future use)
 * GET /api/health/detailed
 */
async function getDetailedHealth(req, res) {
  // Future: Check database, cache, external services
  res.status(STATUS.OK).json({
    status: 'ok',
    version: VERSION,
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'ok', type: 'file' },
      ai: { status: isAIAvailable() ? 'ok' : 'degraded', provider: getProviderDisplayName() },
      storage: { status: 'ok' }
    }
  });
}

module.exports = {
  getHealth,
  getDetailedHealth
};
