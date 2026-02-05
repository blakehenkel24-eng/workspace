/**
 * Resilience Controller
 * Health monitoring, circuit breaker status, and recovery endpoints
 */

const { asyncHandler } = require('../middleware/error-handler');
const { getAllCircuitStates } = require('../services/circuit-breaker');
const { getRetryQueue } = require('../services/retry-queue');
const { getErrorStats, getRecentErrors, clearOldErrors } = require('../services/error-logger');
const config = require('../config');
const { isAIAvailable, getProviderDisplayName } = require('../config/ai-providers');
const os = require('os');

/**
 * Get comprehensive system health status
 */
const getHealthStatus = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  // Check AI service status
  const aiAvailable = isAIAvailable();
  const aiProvider = getProviderDisplayName();
  
  // Get circuit breaker states
  const circuits = getAllCircuitStates();
  
  // Get queue stats
  const queueStats = getRetryQueue().getStats();
  
  // Get error stats (last 24 hours)
  const errorStats = await getErrorStats(24);
  
  // System resources
  const systemInfo = {
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      system: Math.round(os.totalmem() / 1024 / 1024),
      free: Math.round(os.freemem() / 1024 / 1024)
    },
    cpu: os.loadavg(),
    nodeVersion: process.version,
    platform: os.platform()
  };
  
  // Determine overall health
  let status = 'healthy';
  const issues = [];
  
  if (!aiAvailable) {
    status = 'degraded';
    issues.push({
      component: 'ai',
      severity: 'warning',
      message: 'AI service not configured - running in fallback mode'
    });
  }
  
  // Check circuit breakers
  for (const [name, state] of Object.entries(circuits)) {
    if (state.state === 'open') {
      status = 'unhealthy';
      issues.push({
        component: name,
        severity: 'critical',
        message: `${name} circuit breaker is OPEN`
      });
    } else if (state.state === 'half_open') {
      if (status === 'healthy') status = 'degraded';
      issues.push({
        component: name,
        severity: 'warning',
        message: `${name} circuit breaker is HALF_OPEN`
      });
    }
  }
  
  // Check error rate
  if (errorStats.total > 100) {
    if (status === 'healthy') status = 'degraded';
    issues.push({
      component: 'errors',
      severity: 'warning',
      message: `High error count: ${errorStats.total} errors in last 24h`
    });
  }
  
  // Check memory usage
  const memoryPercent = (systemInfo.memory.used / systemInfo.memory.total) * 100;
  if (memoryPercent > 90) {
    status = 'unhealthy';
    issues.push({
      component: 'memory',
      severity: 'critical',
      message: `High memory usage: ${memoryPercent.toFixed(1)}%`
    });
  } else if (memoryPercent > 75) {
    if (status === 'healthy') status = 'degraded';
    issues.push({
      component: 'memory',
      severity: 'warning',
      message: `Elevated memory usage: ${memoryPercent.toFixed(1)}%`
    });
  }
  
  const responseTime = Date.now() - startTime;
  
  res.status(status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503).json({
    success: true,
    status,
    timestamp: new Date().toISOString(),
    responseTimeMs: responseTime,
    version: require('../config/constants').VERSION,
    issues: issues.length > 0 ? issues : undefined,
    services: {
      ai: {
        available: aiAvailable,
        provider: aiProvider,
        circuitState: circuits.ai?.state || 'closed'
      },
      export: {
        circuitState: circuits.export?.state || 'closed',
        queueSize: queueStats.queueLength
      }
    },
    queue: queueStats,
    errors: errorStats,
    system: systemInfo
  });
});

/**
 * Get circuit breaker status
 */
const getCircuitStatus = asyncHandler(async (req, res) => {
  const circuits = getAllCircuitStates();
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    circuits
  });
});

/**
 * Reset a circuit breaker (admin endpoint)
 */
const resetCircuit = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const { getCircuitBreaker } = require('../services/circuit-breaker');
  
  const breaker = getCircuitBreaker(name);
  breaker.reset();
  
  res.json({
    success: true,
    message: `Circuit breaker '${name}' has been reset`,
    state: breaker.getState()
  });
});

/**
 * Get retry queue status
 */
const getQueueStatus = asyncHandler(async (req, res) => {
  const queue = getRetryQueue();
  const stats = queue.getStats();
  const jobs = queue.getJobs();
  
  // Filter by state if requested
  const { state } = req.query;
  const filteredJobs = state 
    ? jobs.filter(j => j.state === state).slice(0, 50)
    : jobs.slice(0, 50);
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    stats,
    jobs: filteredJobs.map(j => ({
      id: j.id,
      type: j.type,
      state: j.state,
      attempts: j.attempts,
      maxAttempts: j.maxAttempts,
      createdAt: j.createdAt,
      updatedAt: j.updatedAt,
      scheduledFor: j.scheduledFor,
      error: j.error?.message
    }))
  });
});

/**
 * Retry a failed job
 */
const retryJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const queue = getRetryQueue();
  
  const job = queue.getJob(jobId);
  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: `Job ${jobId} not found`
    });
  }
  
  if (job.state !== 'failed' && job.state !== 'cancelled') {
    return res.status(400).json({
      success: false,
      error: 'INVALID_STATE',
      message: `Cannot retry job in state: ${job.state}`
    });
  }
  
  // Reset job state
  job.state = 'pending';
  job.attempts = 0;
  job.error = null;
  job.scheduledFor = Date.now();
  
  // Re-add to queue
  queue.queue.push(job);
  queue.start();
  
  res.json({
    success: true,
    message: `Job ${jobId} has been queued for retry`,
    job: {
      id: job.id,
      type: job.type,
      state: job.state
    }
  });
});

/**
 * Get error statistics
 */
const getErrorReport = asyncHandler(async (req, res) => {
  const { hours = 24, category } = req.query;
  
  const stats = await getErrorStats(parseInt(hours));
  const recent = await getRecentErrors(50, category);
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    period: {
      hours: parseInt(hours),
      since: new Date(Date.now() - parseInt(hours) * 60 * 60 * 1000).toISOString()
    },
    stats,
    recentErrors: recent.map(e => ({
      timestamp: e.timestamp,
      severity: e.severity,
      category: e.category,
      message: e.error?.message,
      requestId: e.requestId,
      recoveryActions: e.recoveryActions
    }))
  });
});

/**
 * Clear old error logs
 */
const clearErrors = asyncHandler(async (req, res) => {
  const { days = 30 } = req.body;
  
  const result = await clearOldErrors(parseInt(days));
  
  res.json({
    success: true,
    message: `Cleared ${result.cleared} old error logs`,
    remaining: result.remaining,
    daysKept: parseInt(days)
  });
});

/**
 * Get recovery suggestions for an error
 */
const getRecoveryOptions = asyncHandler(async (req, res) => {
  const { errorType } = req.params;
  const { generateRecoverySuggestions } = require('../services/error-logger');
  
  // Create a mock error based on type
  const mockError = new Error(errorType);
  const suggestions = generateRecoverySuggestions(mockError, errorType);
  
  res.json({
    success: true,
    errorType,
    recoveryActions: suggestions
  });
});

/**
 * Trigger graceful degradation test
 */
const testDegradation = asyncHandler(async (req, res) => {
  const { mode } = req.query;
  
  if (mode === 'circuit_open') {
    const { getCircuitBreaker } = require('../services/circuit-breaker');
    const breaker = getCircuitBreaker('ai');
    breaker.forceState('open');
    
    return res.json({
      success: true,
      message: 'AI circuit breaker forced to OPEN state',
      state: breaker.getState()
    });
  }
  
  if (mode === 'circuit_close') {
    const { getCircuitBreaker } = require('../services/circuit-breaker');
    const breaker = getCircuitBreaker('ai');
    breaker.forceState('closed');
    
    return res.json({
      success: true,
      message: 'AI circuit breaker forced to CLOSED state',
      state: breaker.getState()
    });
  }
  
  res.json({
    success: true,
    message: 'Degradation test endpoint - use ?mode=circuit_open or ?mode=circuit_close'
  });
});

module.exports = {
  getHealthStatus,
  getCircuitStatus,
  resetCircuit,
  getQueueStatus,
  retryJob,
  getErrorReport,
  clearErrors,
  getRecoveryOptions,
  testDegradation
};
