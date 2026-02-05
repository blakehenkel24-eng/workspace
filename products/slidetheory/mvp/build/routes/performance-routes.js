/**
 * Performance Routes
 * Monitoring and health check endpoints
 */

const express = require('express');
const router = express.Router();
const performanceMonitor = require('../services/performance-monitor');
const cacheService = require('../services/cache-service');
const config = require('../config');

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', async (req, res) => {
  const cacheStats = await cacheService.getStats();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: config.VERSION,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cache: {
      enabled: config.cache.enabled,
      redis: cacheStats.redis,
      memoryEntries: cacheStats.memoryEntries
    }
  });
});

/**
 * @route   GET /api/health/detailed
 * @desc    Detailed health check with dependencies
 * @access  Public
 */
router.get('/health/detailed', async (req, res) => {
  const checks = {
    server: true,
    cache: false,
    ai: false,
    timestamp: new Date().toISOString()
  };
  
  // Check cache
  try {
    const cacheStats = await cacheService.getStats();
    checks.cache = cacheStats.redis || cacheStats.memoryEntries > 0;
  } catch (e) {
    checks.cache = false;
  }
  
  // Check AI provider
  try {
    const { isAIAvailable } = require('../config/ai-providers');
    checks.ai = isAIAvailable();
  } catch (e) {
    checks.ai = false;
  }
  
  const allHealthy = Object.values(checks).every(v => typeof v === 'boolean' ? v : true);
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'degraded',
    checks
  });
});

/**
 * @route   GET /api/metrics
 * @desc    Performance metrics
 * @access  Public
 */
router.get('/metrics', (req, res) => {
  const range = req.query.range || '1h';
  const stats = performanceMonitor.getStats(range);
  
  res.json({
    success: true,
    range,
    timestamp: new Date().toISOString(),
    metrics: stats
  });
});

/**
 * @route   GET /api/metrics/realtime
 * @desc    Real-time metrics
 * @access  Public
 */
router.get('/metrics/realtime', (req, res) => {
  const metrics = performanceMonitor.getRealtimeMetrics();
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    metrics
  });
});

/**
 * @route   GET /api/metrics/cache
 * @desc    Cache statistics
 * @access  Public
 */
router.get('/metrics/cache', async (req, res) => {
  const stats = await cacheService.getStats();
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    cache: stats
  });
});

/**
 * @route   POST /api/metrics/reset
 * @desc    Reset metrics (admin only)
 * @access  Private
 */
router.post('/metrics/reset', (req, res) => {
  performanceMonitor.reset();
  
  res.json({
    success: true,
    message: 'Metrics reset'
  });
});

/**
 * @route   GET /api/benchmark
 * @desc    Run performance benchmark
 * @access  Public
 */
router.get('/benchmark', async (req, res) => {
  const stats = performanceMonitor.getStats('1h');
  const { benchmarks } = stats;
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    benchmarks: {
      targets: {
        cachedSlideMax: 2000,
        newSlideMax: 5000
      },
      current: {
        cachedSlideAvg: Math.round(benchmarks.currentCachedAvg || 0),
        newSlideAvg: Math.round(benchmarks.currentNewAvg || 0)
      },
      status: {
        cached: benchmarks.cachedPerformance,
        new: benchmarks.newPerformance,
        overall: benchmarks.cachedPerformance === 'PASS' && benchmarks.newPerformance === 'PASS' 
          ? 'PASS' : 'FAIL'
      },
      recommendations: generateRecommendations(benchmarks)
    }
  });
});

function generateRecommendations(benchmarks) {
  const recommendations = [];
  
  if (benchmarks.cachedPerformance === 'FAIL') {
    recommendations.push({
      priority: 'high',
      issue: 'Cached slide response time exceeds 2s target',
      suggestion: 'Check Redis connection or enable memory cache fallback'
    });
  }
  
  if (benchmarks.newPerformance === 'FAIL') {
    recommendations.push({
      priority: 'high',
      issue: 'New slide generation exceeds 5s target',
      suggestion: 'Consider optimizing AI prompts or enabling response streaming'
    });
  }
  
  if (recommendations.length === 0) {
    recommendations.push({
      priority: 'info',
      message: 'All performance targets are met'
    });
  }
  
  return recommendations;
}

module.exports = router;
