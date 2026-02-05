/**
 * Services Index
 * Centralized service exports
 */

const { generateSlideContent } = require('./ai-service');
const { generateFallbackContent } = require('./fallback-service');
const { renderSlideToImage, buildSlideHTML, generatePlaceholderSVG } = require('./slide-service');
const { getSlideStyles, buildSlideBody } = require('./slide-templates');
const { generatePPTX, generatePDF } = require('./export-service');
const { 
  loadAnalytics, 
  saveAnalytics, 
  recordSlideGenerated, 
  getAnalyticsSummary,
  getPopularSlideTypes,
  resetAnalytics
} = require('./analytics-service');

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
  
  // Analytics
  loadAnalytics,
  saveAnalytics,
  recordSlideGenerated,
  getAnalyticsSummary,
  getPopularSlideTypes,
  resetAnalytics
};
