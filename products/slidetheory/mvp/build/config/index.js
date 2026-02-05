/**
 * Configuration Loader
 * Centralized configuration management
 */

require('dotenv').config();

const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
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
  
  // Export Settings
  exports: {
    formats: ['png', 'pptx', 'pdf'],
    cleanupSlidesMs: 24 * 60 * 60 * 1000, // 24 hours
    cleanupExportsMs: 60 * 60 * 1000 // 1 hour
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
  }
};

module.exports = config;
