/**
 * Cache Service
 * Redis-based caching for generated slides and other data
 */

const crypto = require('crypto');
const config = require('../config');

// In-memory cache fallback when Redis is not available
const memoryCache = new Map();
const memoryCacheTimestamps = new Map();

// Redis client (lazy loaded)
let redisClient = null;
let redisAvailable = false;

/**
 * Initialize Redis connection
 */
async function initRedis() {
  if (redisClient) return redisAvailable;
  
  try {
    // Dynamic import to avoid hard dependency
    const { createClient } = require('redis');
    
    redisClient = createClient({
      url: config.cache?.redisUrl || process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    });
    
    redisClient.on('error', (err) => {
      if (redisAvailable) {
        console.log('[Cache] Redis error, falling back to memory cache:', err.message);
        redisAvailable = false;
      }
    });
    
    redisClient.on('connect', () => {
      console.log('[Cache] Redis connected');
      redisAvailable = true;
    });
    
    await redisClient.connect();
    redisAvailable = true;
    
    // Test connection
    await redisClient.ping();
    
    return true;
  } catch (error) {
    console.log('[Cache] Redis not available, using memory cache:', error.message);
    redisAvailable = false;
    return false;
  }
}

/**
 * Generate cache key from content using hash
 */
function generateCacheKey(slideType, context, dataPoints, targetAudience, framework) {
  const content = JSON.stringify({
    slideType,
    context,
    dataPoints: dataPoints || [],
    targetAudience,
    framework: framework || 'default',
    version: config.VERSION || '1.1.1'
  });
  
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Get cache TTL based on content type
 */
function getCacheTTL(type) {
  const ttls = {
    slide: config.cache?.ttl?.slide || 7 * 24 * 60 * 60, // 7 days
    content: config.cache?.ttl?.content || 24 * 60 * 60, // 24 hours
    template: config.cache?.ttl?.template || 30 * 24 * 60 * 60, // 30 days
    analytics: config.cache?.ttl?.analytics || 60 * 60 // 1 hour
  };
  
  return ttls[type] || ttls.content;
}

/**
 * Get value from cache
 */
async function get(key, type = 'content') {
  const startTime = Date.now();
  
  try {
    // Try Redis first
    if (redisAvailable && redisClient) {
      const value = await redisClient.get(key);
      
      if (value) {
        recordMetric('cache_hit', type, Date.now() - startTime);
        return JSON.parse(value);
      }
    }
    
    // Fall back to memory cache
    if (memoryCache.has(key)) {
      const timestamp = memoryCacheTimestamps.get(key);
      const ttl = getCacheTTL(type) * 1000; // Convert to ms
      
      // Check if expired
      if (Date.now() - timestamp > ttl) {
        memoryCache.delete(key);
        memoryCacheTimestamps.delete(key);
        recordMetric('cache_miss', type, Date.now() - startTime);
        return null;
      }
      
      recordMetric('cache_hit', type, Date.now() - startTime);
      return memoryCache.get(key);
    }
    
    recordMetric('cache_miss', type, Date.now() - startTime);
    return null;
  } catch (error) {
    console.error('[Cache] Get error:', error.message);
    recordMetric('cache_error', type, Date.now() - startTime);
    return null;
  }
}

/**
 * Set value in cache
 */
async function set(key, value, type = 'content', customTTL = null) {
  try {
    const ttl = customTTL || getCacheTTL(type);
    const serialized = JSON.stringify(value);
    
    // Try Redis first
    if (redisAvailable && redisClient) {
      await redisClient.setEx(key, ttl, serialized);
      recordMetric('cache_set', type, 0);
      return true;
    }
    
    // Fall back to memory cache
    memoryCache.set(key, value);
    memoryCacheTimestamps.set(key, Date.now());
    
    // Cleanup old entries if memory cache gets too large
    if (memoryCache.size > 1000) {
      cleanupMemoryCache();
    }
    
    recordMetric('cache_set', type, 0);
    return true;
  } catch (error) {
    console.error('[Cache] Set error:', error.message);
    recordMetric('cache_error', type, 0);
    return false;
  }
}

/**
 * Delete value from cache
 */
async function del(key) {
  try {
    if (redisAvailable && redisClient) {
      await redisClient.del(key);
    }
    memoryCache.delete(key);
    memoryCacheTimestamps.delete(key);
    return true;
  } catch (error) {
    console.error('[Cache] Delete error:', error.message);
    return false;
  }
}

/**
 * Clear all cache
 */
async function clear() {
  try {
    if (redisAvailable && redisClient) {
      await redisClient.flushAll();
    }
    memoryCache.clear();
    memoryCacheTimestamps.clear();
    console.log('[Cache] Cache cleared');
    return true;
  } catch (error) {
    console.error('[Cache] Clear error:', error.message);
    return false;
  }
}

/**
 * Get cache stats
 */
async function getStats() {
  const stats = {
    redis: redisAvailable,
    memoryEntries: memoryCache.size,
    metrics: { ...cacheMetrics }
  };
  
  if (redisAvailable && redisClient) {
    try {
      const info = await redisClient.info('memory');
      const usedMatch = info.match(/used_memory:(\d+)/);
      if (usedMatch) {
        stats.redisMemory = parseInt(usedMatch[1]);
      }
    } catch (e) {
      // Ignore
    }
  }
  
  return stats;
}

// Metrics tracking
const cacheMetrics = {
  hits: 0,
  misses: 0,
  errors: 0,
  sets: 0,
  byType: {}
};

function recordMetric(operation, type, durationMs) {
  cacheMetrics[operation === 'cache_hit' ? 'hits' : 
               operation === 'cache_miss' ? 'misses' :
               operation === 'cache_error' ? 'errors' : 'sets']++;
  
  if (!cacheMetrics.byType[type]) {
    cacheMetrics.byType[type] = { hits: 0, misses: 0, errors: 0, sets: 0 };
  }
  
  const typeMetrics = cacheMetrics.byType[type];
  typeMetrics[operation === 'cache_hit' ? 'hits' : 
              operation === 'cache_miss' ? 'misses' :
              operation === 'cache_error' ? 'errors' : 'sets']++;
  
  // Track average response time
  if (!typeMetrics.totalDuration) typeMetrics.totalDuration = 0;
  if (!typeMetrics.count) typeMetrics.count = 0;
  typeMetrics.totalDuration += durationMs;
  typeMetrics.count++;
}

/**
 * Cleanup old memory cache entries
 */
function cleanupMemoryCache() {
  const now = Date.now();
  const entriesToDelete = [];
  
  for (const [key, timestamp] of memoryCacheTimestamps.entries()) {
    // Remove entries older than 24 hours
    if (now - timestamp > 24 * 60 * 60 * 1000) {
      entriesToDelete.push(key);
    }
  }
  
  // Delete oldest 20% of entries if still too many
  if (entriesToDelete.length < memoryCache.size * 0.2) {
    const entries = Array.from(memoryCacheTimestamps.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, Math.floor(memoryCache.size * 0.2));
    
    entriesToDelete.push(...entries.map(e => e[0]));
  }
  
  for (const key of entriesToDelete) {
    memoryCache.delete(key);
    memoryCacheTimestamps.delete(key);
  }
  
  console.log(`[Cache] Cleaned up ${entriesToDelete.length} memory cache entries`);
}

/**
 * Warm cache with commonly accessed data
 */
async function warmCache(templates) {
  console.log('[Cache] Warming cache...');
  
  try {
    // Cache templates
    for (const template of templates || []) {
      await set(`template:${template.id}`, template, 'template');
    }
    
    console.log(`[Cache] Cached ${templates?.length || 0} templates`);
  } catch (error) {
    console.error('[Cache] Warm cache error:', error.message);
  }
}

// Initialize Redis on module load
initRedis().catch(() => {
  // Redis is optional, continue without it
});

module.exports = {
  initRedis,
  generateCacheKey,
  get,
  set,
  del,
  clear,
  getStats,
  warmCache,
  isRedisAvailable: () => redisAvailable
};
