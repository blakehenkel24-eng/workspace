/**
 * Services Index
 * Centralized service exports
 */

const { generateSlideContent } = require('./ai-service');
const { generateFallbackContent } = require('./fallback-service');
const { renderSlideToImage, buildSlideHTML, generatePlaceholderSVG } = require('./slide-service');
const { getSlideStyles, buildSlideBody } = require('./slide-templates');
const { 
  generatePPTX, 
  generatePDF, 
  generatePNG,
  batchExport,
  getExportHistory,
  getExportHistoryList,
  clearExportHistory,
  ASPECT_RATIOS,
  QUALITY_SETTINGS
} = require('./export-service');
const { 
  loadAnalytics, 
  saveAnalytics, 
  recordSlideGenerated, 
  getAnalyticsSummary,
  getPopularSlideTypes,
  resetAnalytics
} = require('./analytics-service');

// Performance & Caching
const cacheService = require('./cache-service');
const performanceMonitor = require('./performance-monitor');
const assetOptimizer = require('./asset-optimizer');

module.exports = {
  // AI
  generateSlideContent,
  generateFallbackContent,
  
  // Slide Rendering
  renderSlideToImage,
  buildSlideHTML,
  generatePlaceholderSVG,
  
  // Templates
  getSlideStyles,
  buildSlideBody,
  
  // Export
  generatePPTX,
  generatePDF,
  generatePNG,
  batchExport,
  getExportHistory,
  getExportHistoryList,
  clearExportHistory,
  ASPECT_RATIOS,
  QUALITY_SETTINGS,
  
  // Analytics
  loadAnalytics,
  saveAnalytics,
  recordSlideGenerated,
  getAnalyticsSummary,
  getPopularSlideTypes,
  resetAnalytics,
  
  // Performance & Caching
  cacheService,
  performanceMonitor,
  assetOptimizer
};
