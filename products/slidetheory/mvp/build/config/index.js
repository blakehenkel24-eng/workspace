/**
 * Configuration Loader
 * Centralized configuration management
 */

require('dotenv').config();

const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Version
  VERSION: process.env.npm_package_version || '2.1.0',
  
  // Paths
  paths: {
    slides: process.env.SLIDES_DIR || require('path').join(__dirname, '..', 'tmp', 'slides'),
    exports: process.env.EXPORTS_DIR || require('path').join(__dirname, '..', 'tmp', 'exports'),
    analytics: process.env.ANALYTICS_FILE || require('path').join(__dirname, '..', 'tmp', 'analytics.json'),
    public: require('path').join(__dirname, '..', 'public'),
    templates: require('path').join(__dirname, '..', 'public', 'templates')
  },
  
  // AI Provider Settings
  ai: {
    provider: process.env.AI_PROVIDER || 'kimi',
    kimi: {
      apiKey: process.env.KIMI_API_KEY,
      baseUrl: process.env.KIMI_API_BASE || 'https://api.moonshot.cn/v1',
      model: process.env.KIMI_MODEL || 'kimi-coding/k2p5',
      timeout: parseInt(process.env.AI_TIMEOUT || '25000'),
      maxRetries: parseInt(process.env.AI_MAX_RETRIES || '2'),
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.6')
    }
  },
  
  // Cache Settings
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: {
      slide: parseInt(process.env.CACHE_TTL_SLIDE || '604800'),     // 7 days
      content: parseInt(process.env.CACHE_TTL_CONTENT || '86400'),  // 24 hours
      template: parseInt(process.env.CACHE_TTL_TEMPLATE || '2592000'), // 30 days
      analytics: parseInt(process.env.CACHE_TTL_ANALYTICS || '3600')   // 1 hour
    }
  },
  
  // Performance Settings
  performance: {
    slowThreshold: parseInt(process.env.SLOW_REQUEST_THRESHOLD || '2000'), // ms
    operationThresholds: {
      slide_generation: 5000,
      ai_content_generation: 3000,
      slide_rendering: 2000,
      export_generation: 10000
    },
    enableCompression: process.env.ENABLE_COMPRESSION !== 'false',
    enableCaching: process.env.ENABLE_CACHING !== 'false',
    maxConcurrentGenerations: parseInt(process.env.MAX_CONCURRENT_GENERATIONS || '5')
  },
  
  // Export Settings
  exports: {
    formats: ['png', 'pptx', 'pdf', 'zip'],
    aspectRatios: ['16:9', '4:3', 'widescreen', 'letter', 'a4'],
    qualities: ['low', 'medium', 'high', 'ultra'],
    cleanupSlidesMs: 24 * 60 * 60 * 1000, // 24 hours
    cleanupExportsMs: 60 * 60 * 1000, // 1 hour
    maxBatchSize: 50,
    defaultQuality: 'high',
    defaultAspectRatio: '16:9'
  },
  
  // Slide Settings
  slides: {
    validTypes: [
      'Executive Summary',
      'Market Analysis',
      'Financial Model',
      'Competitive Analysis',
      'Growth Strategy',
      'Risk Assessment'
    ],
    dimensions: {
      width: 1920,
      height: 1080,
      scaleFactor: 2
    }
  },
  
  // Validation
  validation: {
    maxContextLength: 2000,
    minContextLength: 10,
    maxRequestSize: '2mb'
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json' // 'json' | 'pretty'
  },
  
  // CDN / Asset Optimization
  cdn: {
    enabled: process.env.CDN_ENABLED === 'true',
    baseUrl: process.env.CDN_BASE_URL || '',
    enableBrotli: process.env.CDN_BROTLI !== 'false',
    enableGzip: process.env.CDN_GZIP !== 'false'
  }
};

module.exports = config;
