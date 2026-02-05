/**
 * Error Logger Service
 * Logs errors to file for debugging and monitoring
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('../config');

// Ensure logs directory exists
const LOGS_DIR = path.join(__dirname, '..', 'tmp', 'logs');

// Error severity levels
const SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

// Error categories for classification
const CATEGORIES = {
  AI_GENERATION: 'ai_generation',
  EXPORT: 'export',
  VALIDATION: 'validation',
  RENDER: 'render',
  SYSTEM: 'system',
  NETWORK: 'network',
  TIMEOUT: 'timeout',
  RATE_LIMIT: 'rate_limit',
  UNKNOWN: 'unknown'
};

/**
 * Initialize error logger
 */
async function initializeErrorLogger() {
  try {
    await fs.mkdir(LOGS_DIR, { recursive: true });
    console.log('[ErrorLogger] Initialized at:', LOGS_DIR);
  } catch (err) {
    console.error('[ErrorLogger] Failed to initialize:', err.message);
  }
}

/**
 * Classify error into category
 */
function classifyError(error) {
  const message = error.message?.toLowerCase() || '';
  
  if (message.includes('ai') || message.includes('kimi') || message.includes('generation')) {
    return CATEGORIES.AI_GENERATION;
  }
  if (message.includes('export') || message.includes('pptx') || message.includes('pdf')) {
    return CATEGORIES.EXPORT;
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return CATEGORIES.VALIDATION;
  }
  if (message.includes('render') || message.includes('puppeteer')) {
    return CATEGORIES.RENDER;
  }
  if (message.includes('timeout') || message.includes('etimedout')) {
    return CATEGORIES.TIMEOUT;
  }
  if (message.includes('rate limit') || message.includes('429')) {
    return CATEGORIES.RATE_LIMIT;
  }
  if (message.includes('network') || message.includes('econnrefused')) {
    return CATEGORIES.NETWORK;
  }
  if (message.includes('system') || message.includes('memory') || message.includes('disk')) {
    return CATEGORIES.SYSTEM;
  }
  
  return CATEGORIES.UNKNOWN;
}

/**
 * Determine error severity
 */
function determineSeverity(error, category) {
  if (error.isCritical || category === CATEGORIES.SYSTEM) {
    return SEVERITY.CRITICAL;
  }
  if (category === CATEGORIES.AI_GENERATION || category === CATEGORIES.EXPORT) {
    return SEVERITY.ERROR;
  }
  if (category === CATEGORIES.TIMEOUT || category === CATEGORIES.RATE_LIMIT) {
    return SEVERITY.WARNING;
  }
  return SEVERITY.ERROR;
}

/**
 * Generate recovery suggestions based on error
 */
function generateRecoverySuggestions(error, category) {
  const suggestions = [];
  
  switch (category) {
    case CATEGORIES.AI_GENERATION:
      suggestions.push({
        action: 'regenerate',
        label: 'Regenerate',
        description: 'Try generating the slide again with the same parameters',
        method: 'POST',
        endpoint: '/api/generate'
      });
      suggestions.push({
        action: 'simplify',
        label: 'Try simpler prompt',
        description: 'Reduce context length and complexity',
        method: 'POST',
        endpoint: '/api/generate',
        hint: 'Reduce your context to under 500 characters'
      });
      break;
      
    case CATEGORIES.EXPORT:
      suggestions.push({
        action: 'retry_export',
        label: 'Retry Export',
        description: 'Attempt the export again',
        method: 'POST',
        endpoint: '/api/export/{format}'
      });
      suggestions.push({
        action: 'try_different_format',
        label: 'Try different format',
        description: 'Export in an alternative format',
        method: 'POST',
        endpoint: '/api/export/{alternativeFormat}'
      });
      break;
      
    case CATEGORIES.TIMEOUT:
      suggestions.push({
        action: 'reduce_complexity',
        label: 'Reduce complexity',
        description: 'Simplify your request to complete faster',
        method: 'POST',
        endpoint: '/api/generate',
        hint: 'Fewer data points and shorter context'
      });
      break;
      
    case CATEGORIES.RATE_LIMIT:
      suggestions.push({
        action: 'wait_retry',
        label: 'Wait and retry',
        description: 'Wait a moment before trying again',
        method: 'POST',
        endpoint: '/api/generate',
        hint: 'Wait 30-60 seconds between requests'
      });
      break;
      
    case CATEGORIES.VALIDATION:
      suggestions.push({
        action: 'check_input',
        label: 'Check input',
        description: 'Review the API documentation for correct parameters',
        method: 'GET',
        endpoint: '/api/health'
      });
      break;
      
    default:
      suggestions.push({
        action: 'retry',
        label: 'Retry',
        description: 'Try the request again',
        method: 'POST',
        endpoint: '/api/generate'
      });
  }
  
  // Always add contact support option for errors
  if (category !== CATEGORIES.VALIDATION) {
    suggestions.push({
      action: 'contact_support',
      label: 'Contact Support',
      description: 'Get help from our support team',
      type: 'link',
      url: 'mailto:support@slidetheory.com?subject=Error%20Report'
    });
  }
  
  return suggestions;
}

/**
 * Log error to file
 */
async function logError(req, error, context = {}) {
  try {
    const timestamp = new Date();
    const dateStr = timestamp.toISOString().split('T')[0];
    const logFile = path.join(LOGS_DIR, `errors-${dateStr}.jsonl`);
    
    const category = classifyError(error);
    const severity = determineSeverity(error, category);
    const recoveryActions = generateRecoverySuggestions(error, category);
    
    const errorLog = {
      timestamp: timestamp.toISOString(),
      severity,
      category,
      requestId: req?.id,
      path: req?.path,
      method: req?.method,
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack?.split('\n').slice(0, 5),
        isOperational: error.isOperational || false
      },
      context: {
        ...context,
        userAgent: req?.headers?.['user-agent'],
        ip: req?.ip || req?.connection?.remoteAddress
      },
      recoveryActions
    };
    
    // Append to log file
    await fs.appendFile(logFile, JSON.stringify(errorLog) + '\n');
    
    // Also write to structured error log for easier querying
    await writeStructuredError(errorLog);
    
    return errorLog;
  } catch (logErr) {
    // Fallback to console if file logging fails
    console.error('[ErrorLogger] Failed to log error:', logErr.message);
    console.error('[ErrorLogger] Original error:', error.message);
  }
}

/**
 * Write error to structured log for analysis
 */
async function writeStructuredError(errorLog) {
  try {
    const categoryFile = path.join(LOGS_DIR, `category-${errorLog.category}.jsonl`);
    await fs.appendFile(categoryFile, JSON.stringify(errorLog) + '\n');
  } catch (err) {
    // Non-critical, can fail silently
  }
}

/**
 * Get error statistics
 */
async function getErrorStats(timeRangeHours = 24) {
  try {
    const since = Date.now() - (timeRangeHours * 60 * 60 * 1000);
    const files = await fs.readdir(LOGS_DIR);
    const stats = {
      total: 0,
      byCategory: {},
      bySeverity: {},
      recent: []
    };
    
    for (const file of files) {
      if (!file.startsWith('errors-')) continue;
      
      const content = await fs.readFile(path.join(LOGS_DIR, file), 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean);
      
      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          const entryTime = new Date(entry.timestamp).getTime();
          
          if (entryTime < since) continue;
          
          stats.total++;
          stats.byCategory[entry.category] = (stats.byCategory[entry.category] || 0) + 1;
          stats.bySeverity[entry.severity] = (stats.bySeverity[entry.severity] || 0) + 1;
          
          if (stats.recent.length < 10) {
            stats.recent.push({
              timestamp: entry.timestamp,
              category: entry.category,
              message: entry.error.message
            });
          }
        } catch (e) {
          // Skip malformed entries
        }
      }
    }
    
    return stats;
  } catch (err) {
    return { total: 0, byCategory: {}, bySeverity: {}, recent: [] };
  }
}

/**
 * Get recent errors for debugging
 */
async function getRecentErrors(limit = 50, category = null) {
  try {
    const files = await fs.readdir(LOGS_DIR);
    const errors = [];
    
    // Sort files by date (newest first)
    const sortedFiles = files
      .filter(f => f.startsWith('errors-'))
      .sort()
      .reverse();
    
    for (const file of sortedFiles) {
      if (errors.length >= limit) break;
      
      const content = await fs.readFile(path.join(LOGS_DIR, file), 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean).reverse();
      
      for (const line of lines) {
        if (errors.length >= limit) break;
        
        try {
          const entry = JSON.parse(line);
          if (!category || entry.category === category) {
            errors.push(entry);
          }
        } catch (e) {
          // Skip malformed entries
        }
      }
    }
    
    return errors;
  } catch (err) {
    return [];
  }
}

/**
 * Clear old error logs (maintenance)
 */
async function clearOldErrors(daysToKeep = 30) {
  try {
    const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const files = await fs.readdir(LOGS_DIR);
    let cleared = 0;
    
    for (const file of files) {
      if (!file.startsWith('errors-')) continue;
      
      const filePath = path.join(LOGS_DIR, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtime.getTime() < cutoff) {
        await fs.unlink(filePath);
        cleared++;
      }
    }
    
    return { cleared, daysToKeep };
  } catch (err) {
    return { cleared: 0, error: err.message };
  }
}

// Initialize on module load
initializeErrorLogger();

module.exports = {
  SEVERITY,
  CATEGORIES,
  logError,
  classifyError,
  generateRecoverySuggestions,
  getErrorStats,
  getRecentErrors,
  clearOldErrors,
  initializeErrorLogger
};
