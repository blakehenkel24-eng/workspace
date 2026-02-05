/**
 * Utilities Index
 * Centralized utility exports
 */

const { parseCSV, parseExcel, detectFileType, parseDataFile, extractDataPoints } = require('./file-parser');
const { 
  generateExportId, 
  getExportPath, 
  scheduleCleanup, 
  isValidFormat,
  getMimeType,
  sanitizeFilename,
  buildDownloadUrl,
  calculateExpiry
} = require('./exporter');
const {
  sleep,
  retry,
  ensureDirectory,
  safeResolvePath,
  escapeHtml,
  escapeXml,
  truncate,
  formatConsultingDate,
  deepMerge,
  generateId,
  safeJsonParse
} = require('./helpers');

module.exports = {
  // File parsing
  parseCSV,
  parseExcel,
  detectFileType,
  parseDataFile,
  extractDataPoints,
  
  // Export helpers
  generateExportId,
  getExportPath,
  scheduleCleanup,
  isValidFormat,
  getMimeType,
  sanitizeFilename,
  buildDownloadUrl,
  calculateExpiry,
  
  // General helpers
  sleep,
  retry,
  ensureDirectory,
  safeResolvePath,
  escapeHtml,
  escapeXml,
  truncate,
  formatConsultingDate,
  deepMerge,
  generateId,
  safeJsonParse
};
