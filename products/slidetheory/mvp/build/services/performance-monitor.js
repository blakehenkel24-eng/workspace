/**
 * Performance Monitoring Service
 * Tracks response times, throughput, and performance metrics
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('../config');

// In-memory metrics store
const metrics = {
  requests: [],
  operations: new Map(),
  cache: {
    hits: 0,
    misses: 0,
    hitRate: 0
  },
  generation: {
    total: 0,
    cached: 0,
    new: 0,
    avgTimeCached: 0,
    avgTimeNew: 0
  },
  exports: {
    total: 0,
    avgTime: 0
  },
  errors: [],
  startTime: Date.now()
};

// Configuration
const MAX_REQUESTS_STORED = 10000;
const MAX_ERRORS_STORED = 1000;
const METRICS_FLUSH_INTERVAL = 60 * 1000; // 1 minute

/**
 * Record a request metric
 */
function recordRequest(req, res, durationMs) {
  const metric = {
    timestamp: Date.now(),
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    durationMs,
    requestId: req.id,
    cacheHit: res.getHeader('X-Cache') === 'HIT'
  };
  
  metrics.requests.push(metric);
  
  // Keep only recent requests
  if (metrics.requests.length > MAX_REQUESTS_STORED) {
    metrics.requests = metrics.requests.slice(-MAX_REQUESTS_STORED / 2);
  }
  
  // Track slow requests
  if (durationMs > (config.performance?.slowThreshold || 2000)) {
    recordSlowRequest(metric);
  }
}

/**
 * Record slide generation metric
 */
function recordGeneration(durationMs, cached = false, success = true) {
  metrics.generation.total++;
  
  if (cached) {
    metrics.generation.cached++;
    // Update running average
    const n = metrics.generation.cached;
    metrics.generation.avgTimeCached = 
      (metrics.generation.avgTimeCached * (n - 1) + durationMs) / n;
  } else {
    metrics.generation.new++;
    const n = metrics.generation.new;
    metrics.generation.avgTimeNew = 
      (metrics.generation.avgTimeNew * (n - 1) + durationMs) / n;
  }
  
  if (!success) {
    recordError('generation_failed', { durationMs, cached });
  }
}

/**
 * Record export metric
 */
function recordExport(durationMs, format, success = true) {
  metrics.exports.total++;
  const n = metrics.exports.total;
  metrics.exports.avgTime = 
    (metrics.exports.avgTime * (n - 1) + durationMs) / n;
  
  if (!success) {
    recordError('export_failed', { durationMs, format });
  }
}

/**
 * Record cache metrics
 */
function recordCache(hit) {
  if (hit) {
    metrics.cache.hits++;
  } else {
    metrics.cache.misses++;
  }
  
  const total = metrics.cache.hits + metrics.cache.misses;
  metrics.cache.hitRate = total > 0 ? (metrics.cache.hits / total) * 100 : 0;
}

/**
 * Record error
 */
function recordError(type, details = {}) {
  const error = {
    timestamp: Date.now(),
    type,
    details
  };
  
  metrics.errors.push(error);
  
  if (metrics.errors.length > MAX_ERRORS_STORED) {
    metrics.errors = metrics.errors.slice(-MAX_ERRORS_STORED / 2);
  }
}

/**
 * Record slow request for analysis
 */
const slowRequests = [];
function recordSlowRequest(metric) {
  slowRequests.push(metric);
  
  // Keep only last 100 slow requests
  if (slowRequests.length > 100) {
    slowRequests.shift();
  }
}

/**
 * Start timing an operation
 */
function startTimer(operation) {
  const startTime = process.hrtime.bigint();
  
  return {
    end: (meta = {}) => {
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1000000;
      
      recordOperation(operation, durationMs, meta);
      return durationMs;
    }
  };
}

/**
 * Record operation timing
 */
function recordOperation(name, durationMs, meta = {}) {
  if (!metrics.operations.has(name)) {
    metrics.operations.set(name, {
      count: 0,
      totalDuration: 0,
      avgDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      p95: [],
      p99: []
    });
  }
  
  const op = metrics.operations.get(name);
  op.count++;
  op.totalDuration += durationMs;
  op.avgDuration = op.totalDuration / op.count;
  op.minDuration = Math.min(op.minDuration, durationMs);
  op.maxDuration = Math.max(op.maxDuration, durationMs);
  
  // Track percentiles (keep last 1000 samples)
  op.p95.push(durationMs);
  if (op.p95.length > 1000) op.p95.shift();
  
  // Log slow operations
  const threshold = config.performance?.operationThresholds?.[name] || 1000;
  if (durationMs > threshold) {
    console.warn(`[Perf] Slow operation: ${name} took ${durationMs.toFixed(2)}ms`, meta);
  }
}

/**
 * Calculate percentiles
 */
function calculatePercentile(sortedArray, percentile) {
  const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
  return sortedArray[Math.max(0, index)];
}

/**
 * Get performance statistics
 */
function getStats(timeRange = '1h') {
  const now = Date.now();
  const rangeMs = timeRange === '1h' ? 60 * 60 * 1000 :
                  timeRange === '24h' ? 24 * 60 * 60 * 1000 :
                  timeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 :
                  60 * 60 * 1000;
  
  const cutoff = now - rangeMs;
  const recentRequests = metrics.requests.filter(r => r.timestamp > cutoff);
  
  // Calculate request statistics
  const requestStats = {
    total: recentRequests.length,
    success: recentRequests.filter(r => r.statusCode < 400).length,
    error: recentRequests.filter(r => r.statusCode >= 400).length,
    cacheHits: recentRequests.filter(r => r.cacheHit).length,
    avgDuration: recentRequests.length > 0 
      ? recentRequests.reduce((a, b) => a + b.durationMs, 0) / recentRequests.length 
      : 0,
    p95: 0,
    p99: 0
  };
  
  if (recentRequests.length > 0) {
    const durations = recentRequests.map(r => r.durationMs).sort((a, b) => a - b);
    requestStats.p95 = calculatePercentile(durations, 95);
    requestStats.p99 = calculatePercentile(durations, 99);
  }
  
  // Operation statistics
  const operationStats = {};
  for (const [name, op] of metrics.operations) {
    const sortedP95 = [...op.p95].sort((a, b) => a - b);
    operationStats[name] = {
      count: op.count,
      avgDuration: op.avgDuration,
      minDuration: op.minDuration === Infinity ? 0 : op.minDuration,
      maxDuration: op.maxDuration,
      p95: calculatePercentile(sortedP95, 95),
      p99: calculatePercentile(sortedP95, 99)
    };
  }
  
  // Generation stats
  const generationStats = {
    ...metrics.generation,
    hitRate: metrics.generation.total > 0 
      ? (metrics.generation.cached / metrics.generation.total) * 100 
      : 0
  };
  
  return {
    uptime: Date.now() - metrics.startTime,
    requests: requestStats,
    operations: operationStats,
    cache: metrics.cache,
    generation: generationStats,
    exports: metrics.exports,
    recentErrors: metrics.errors.slice(-10),
    slowRequests: slowRequests.slice(-5),
    benchmarks: {
      cachedSlideTarget: 2000, // < 2s
      newSlideTarget: 5000,    // < 5s
      currentCachedAvg: metrics.generation.avgTimeCached,
      currentNewAvg: metrics.generation.avgTimeNew,
      cachedPerformance: metrics.generation.avgTimeCached < 2000 ? 'PASS' : 'FAIL',
      newPerformance: metrics.generation.avgTimeNew < 5000 ? 'PASS' : 'FAIL'
    }
  };
}

/**
 * Get real-time metrics for monitoring
 */
function getRealtimeMetrics() {
  const now = Date.now();
  const lastMinute = now - 60 * 1000;
  const recentRequests = metrics.requests.filter(r => r.timestamp > lastMinute);
  
  return {
    timestamp: now,
    rps: recentRequests.length / 60,
    activeRequests: metrics.requests.filter(r => r.timestamp > now - 5000).length,
    cacheHitRate: metrics.cache.hitRate,
    avgResponseTime: metrics.generation.avgTimeCached || 0,
    errorRate: recentRequests.length > 0 
      ? (recentRequests.filter(r => r.statusCode >= 500).length / recentRequests.length) * 100 
      : 0
  };
}

/**
 * Reset metrics (for testing)
 */
function reset() {
  metrics.requests = [];
  metrics.operations.clear();
  metrics.cache = { hits: 0, misses: 0, hitRate: 0 };
  metrics.generation = { total: 0, cached: 0, new: 0, avgTimeCached: 0, avgTimeNew: 0 };
  metrics.exports = { total: 0, avgTime: 0 };
  metrics.errors = [];
  slowRequests.length = 0;
}

/**
 * Save metrics to file periodically
 */
async function saveMetrics() {
  try {
    const stats = getStats('24h');
    const filePath = path.join(config.paths.exports || './tmp', 'metrics.json');
    await fs.writeFile(filePath, JSON.stringify(stats, null, 2));
  } catch (error) {
    console.error('[Perf] Failed to save metrics:', error.message);
  }
}

// Auto-save metrics every minute
setInterval(saveMetrics, METRICS_FLUSH_INTERVAL);

module.exports = {
  recordRequest,
  recordGeneration,
  recordExport,
  recordCache,
  recordError,
  startTimer,
  getStats,
  getRealtimeMetrics,
  reset
};
