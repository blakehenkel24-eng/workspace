/**
 * Enhanced Health Controller
 * Comprehensive health checks for production monitoring
 */

const os = require('os');
const fs = require('fs').promises;
const config = require('../config');
const { VERSION, STATUS } = require('../config/constants');
const { isAIAvailable, getProviderDisplayName } = require('../config/ai-providers');
const { isPuppeteerAvailable } = require('../services/export-service');

// Simple in-memory metrics store
const metrics = {
  requests: { total: 0, errors: 0 },
  responseTime: [],
  startTime: Date.now()
};

/**
 * Record a request metric
 */
function recordRequest(duration, isError = false) {
  metrics.requests.total++;
  if (isError) metrics.requests.errors++;
  metrics.responseTime.push(duration);
  
  // Keep last 1000 response times
  if (metrics.responseTime.length > 1000) {
    metrics.responseTime.shift();
  }
}

/**
 * Get basic health status
 * GET /api/health
 */
async function getHealth(req, res) {
  const uptime = Date.now() - metrics.startTime;
  const puppeteerAvailable = await isPuppeteerAvailable();
  
  res.status(STATUS.OK).json({
    status: 'ok',
    version: VERSION,
    timestamp: new Date().toISOString(),
    uptime: uptime,
    environment: config.nodeEnv,
    features: {
      aiGeneration: isAIAvailable(),
      aiProvider: getProviderDisplayName(),
      exports: config.exports.formats,
      slideTypes: config.slides.validTypes,
      puppeteer: puppeteerAvailable
    }
  });
}

/**
 * Get detailed system health
 * GET /api/health/detailed
 */
async function getDetailedHealth(req, res) {
  try {
    const checks = await Promise.all([
      checkAIProvider(),
      checkStorage(),
      checkMemory(),
      checkDiskSpace(),
      checkPuppeteer()
    ]);

    const checkResults = {
      ai: checks[0],
      storage: checks[1],
      memory: checks[2],
      disk: checks[3],
      puppeteer: checks[4]
    };
    
    // Determine overall status
    const hasFailures = Object.values(checkResults).some(c => c.status === 'error');
    const hasWarnings = Object.values(checkResults).some(c => c.status === 'warning');
    
    const overallStatus = hasFailures ? 'error' : hasWarnings ? 'warning' : 'ok';
    const statusCode = hasFailures ? STATUS.SERVICE_UNAVAILABLE : STATUS.OK;
    
    res.status(statusCode).json({
      status: overallStatus,
      version: VERSION,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - metrics.startTime,
      checks: checkResults
    });
  } catch (err) {
    res.status(STATUS.SERVICE_UNAVAILABLE).json({
      status: 'error',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Get readiness probe
 * GET /api/health/ready
 */
function getReadiness(req, res) {
  // Check if the application is ready to receive traffic
  const isReady = isAIAvailable() !== undefined;
  
  if (isReady) {
    res.status(STATUS.OK).json({ ready: true });
  } else {
    res.status(STATUS.SERVICE_UNAVAILABLE).json({ ready: false });
  }
}

/**
 * Get liveness probe
 * GET /api/health/live
 */
function getLiveness(req, res) {
  // Check if the application is alive
  res.status(STATUS.OK).json({ alive: true });
}

/**
 * Get Prometheus metrics
 * GET /api/metrics
 */
function getMetrics(req, res) {
  const uptime = (Date.now() - metrics.startTime) / 1000;
  const avgResponseTime = metrics.responseTime.length > 0 
    ? metrics.responseTime.reduce((a, b) => a + b, 0) / metrics.responseTime.length 
    : 0;
  
  const output = `# HELP slidetheory_uptime_seconds Total uptime in seconds
# TYPE slidetheory_uptime_seconds gauge
slidetheory_uptime_seconds ${uptime}

# HELP slidetheory_requests_total Total number of requests
# TYPE slidetheory_requests_total counter
slidetheory_requests_total ${metrics.requests.total}

# HELP slidetheory_errors_total Total number of errors
# TYPE slidetheory_errors_total counter
slidetheory_errors_total ${metrics.requests.errors}

# HELP slidetheory_request_duration_seconds Average request duration
# TYPE slidetheory_request_duration_seconds gauge
slidetheory_request_duration_seconds ${avgResponseTime / 1000}

# HELP slidetheory_info Application information
# TYPE slidetheory_info gauge
slidetheory_info{version="${VERSION}",environment="${config.nodeEnv}"} 1
`;
  
  res.set('Content-Type', 'text/plain');
  res.send(output);
}

// Helper functions for health checks
async function checkAIProvider() {
  try {
    const available = isAIAvailable();
    return {
      status: available ? 'ok' : 'warning',
      provider: getProviderDisplayName(),
      message: available ? 'Connected' : 'Running in fallback mode'
    };
  } catch (err) {
    return {
      status: 'warning',
      provider: 'unknown',
      message: err.message
    };
  }
}

async function checkStorage() {
  try {
    // Check if required directories are writable
    const testFile = `${config.paths.slides}/.healthcheck`;
    await fs.writeFile(testFile, '');
    await fs.unlink(testFile);
    
    return {
      status: 'ok',
      type: 'filesystem',
      path: config.paths.slides
    };
  } catch (err) {
    return {
      status: 'error',
      type: 'filesystem',
      error: err.message
    };
  }
}

async function checkMemory() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedPercent = ((totalMem - freeMem) / totalMem) * 100;
  
  let status = 'ok';
  if (usedPercent > 90) status = 'error';
  else if (usedPercent > 80) status = 'warning';
  
  return {
    status,
    total: Math.round(totalMem / 1024 / 1024) + 'MB',
    free: Math.round(freeMem / 1024 / 1024) + 'MB',
    used: Math.round(usedPercent) + '%'
  };
}

async function checkDiskSpace() {
  // Simplified check - in production, use diskusage package
  return {
    status: 'ok',
    note: 'Disk check requires diskusage package'
  };
}

async function checkPuppeteer() {
  try {
    const available = await isPuppeteerAvailable();
    return {
      status: available ? 'ok' : 'warning',
      available,
      message: available ? 'Puppeteer is available for PDF/PNG generation' : 'Puppeteer not available - PDF/PNG exports will fail. Install with: npm install puppeteer'
    };
  } catch (err) {
    return {
      status: 'warning',
      available: false,
      message: err.message
    };
  }
}

module.exports = {
  getHealth,
  getDetailedHealth,
  getReadiness,
  getLiveness,
  getMetrics,
  recordRequest
};
