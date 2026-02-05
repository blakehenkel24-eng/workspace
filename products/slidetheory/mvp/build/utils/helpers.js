/**
 * Common Helper Utilities
 * Shared utility functions
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Sleep/delay utility
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} Function result
 */
async function retry(fn, options = {}) {
  const maxRetries = options.maxRetries || 3;
  const baseDelay = options.baseDelay || 1000;
  const maxDelay = options.maxDelay || 10000;
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelay
      );
      
      console.log(`[Retry] Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${Math.round(delay)}ms`);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Ensure directory exists
 * @param {string} dirPath - Directory path
 */
async function ensureDirectory(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
}

/**
 * Safe file path resolution (prevents directory traversal)
 * @param {string} basePath - Base directory
 * @param {string} targetPath - Target file path
 * @returns {string|null} Resolved path or null if invalid
 */
function safeResolvePath(basePath, targetPath) {
  const resolved = path.resolve(basePath, targetPath);
  const baseResolved = path.resolve(basePath);
  
  if (!resolved.startsWith(baseResolved)) {
    return null; // Path traversal attempt
  }
  
  return resolved;
}

/**
 * Escape special HTML characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escape special XML characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
function truncate(str, maxLength = 100) {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Format date to consulting format (Mon YYYY)
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
function formatConsultingDate(date = new Date()) {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  });
}

/**
 * Deep merge objects
 * @param {...Object} objects - Objects to merge
 * @returns {Object} Merged object
 */
function deepMerge(...objects) {
  const result = {};
  
  for (const obj of objects) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          result[key] = deepMerge(result[key] || {}, obj[key]);
        } else {
          result[key] = obj[key];
        }
      }
    }
  }
  
  return result;
}

/**
 * Generate random ID
 * @param {number} length - ID length
 * @returns {string} Random ID
 */
function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Parse JSON safely
 * @param {string} str - JSON string
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {any} Parsed value or default
 */
function safeJsonParse(str, defaultValue = null) {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

module.exports = {
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
