/**
 * Export Helper Utilities
 * Helpers for PNG, PPTX, and PDF exports
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Generate unique export ID
 * @returns {string} UUID v4
 */
function generateExportId() {
  return crypto.randomUUID();
}

/**
 * Get export file path
 * @param {string} exportId - Export identifier
 * @param {string} format - File format extension
 * @returns {string} Full file path
 */
function getExportPath(exportId, format) {
  const exportsDir = process.env.EXPORTS_DIR || 
    path.join(__dirname, '..', 'tmp', 'exports');
  return path.join(exportsDir, `${exportId}.${format}`);
}

/**
 * Schedule file cleanup after a delay
 * @param {string} filePath - File to clean up
 * @param {number} delayMs - Delay in milliseconds
 */
function scheduleCleanup(filePath, delayMs = 60 * 60 * 1000) {
  setTimeout(async () => {
    try {
      await fs.unlink(filePath);
      console.log(`[Exporter] Cleaned up: ${path.basename(filePath)}`);
    } catch (err) {
      // Ignore cleanup errors (file may already be deleted)
    }
  }, delayMs);
}

/**
 * Validate export format
 * @param {string} format - Format to validate
 * @param {string[]} allowedFormats - Allowed formats
 * @returns {boolean} Whether format is valid
 */
function isValidFormat(format, allowedFormats = ['png', 'pptx', 'pdf']) {
  return allowedFormats.includes(format?.toLowerCase());
}

/**
 * Get MIME type for export format
 * @param {string} format - File format
 * @returns {string} MIME type
 */
function getMimeType(format) {
  const types = {
    png: 'image/png',
    svg: 'image/svg+xml',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    pdf: 'application/pdf',
    json: 'application/json'
  };
  
  return types[format?.toLowerCase()] || 'application/octet-stream';
}

/**
 * Sanitize filename for safe file system usage
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100);
}

/**
 * Build download URL for export
 * @param {string} exportId - Export identifier
 * @param {string} format - File format
 * @returns {string} Download URL path
 */
function buildDownloadUrl(exportId, format) {
  return `/exports/${exportId}.${format}`;
}

/**
 * Calculate expiry timestamp
 * @param {number} durationMs - Duration in milliseconds
 * @returns {string} ISO timestamp
 */
function calculateExpiry(durationMs = 60 * 60 * 1000) {
  return new Date(Date.now() + durationMs).toISOString();
}

module.exports = {
  generateExportId,
  getExportPath,
  scheduleCleanup,
  isValidFormat,
  getMimeType,
  sanitizeFilename,
  buildDownloadUrl,
  calculateExpiry
};
