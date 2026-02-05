/**
 * Enhanced Analytics Service
 * Comprehensive analytics tracking and reporting - Privacy Compliant (no PII)
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const config = require('../config');
const { SLIDE_TYPES, EXPORT_FORMATS } = require('../config/constants');

const ANALYTICS_FILE = config.paths.analytics;
const SESSION_FILE = path.join(path.dirname(ANALYTICS_FILE), 'sessions.json');

// In-memory tracking (non-PII session data)
const activeSessions = new Map();

/**
 * Default analytics structure
 */
function getDefaultAnalytics() {
  const today = new Date().toISOString().split('T')[0];
  return {
    version: '2.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    
    // Slide generation metrics
    slides: {
      totalGenerated: 0,
      totalCached: 0,
      byType: SLIDE_TYPES.reduce((acc, type) => ({ ...acc, [type]: 0 }), {}),
      byTemplate: {},
      byFramework: {},
      byDay: {},
      generationTime: {
        totalMs: 0,
        count: 0,
        avgMs: 0,
        minMs: Infinity,
        maxMs: 0,
        p50: 0,
        p95: 0,
        p99: 0
      }
    },
    
    // Export metrics
    exports: {
      total: 0,
      byFormat: EXPORT_FORMATS.reduce((acc, fmt) => ({ ...acc, [fmt]: 0 }), {}),
      byDay: {},
      avgTimeMs: 0,
      totalTimeMs: 0
    },
    
    // Error tracking
    errors: {
      total: 0,
      byType: {},
      byEndpoint: {},
      byDay: {},
      recent: []
    },
    
    // User journey / funnel tracking (anonymized)
    funnel: {
      landingPage: 0,
      formStarted: 0,
      formCompleted: 0,
      generationStarted: 0,
      generationCompleted: 0,
      exportStarted: 0,
      exportCompleted: 0,
      dropOffPoints: {
        landingToForm: 0,
        formStartToComplete: 0,
        formToGeneration: 0,
        generationToExport: 0
      }
    },
    
    // Popular templates
    templates: {
      usage: {},
      ratings: {}
    },
    
    // Time-based metrics
    hourlyDistribution: Array(24).fill(0),
    dayOfWeekDistribution: Array(7).fill(0)
  };
}

/**
 * Load analytics from file
 */
async function loadAnalytics() {
  try {
    const data = await fs.readFile(ANALYTICS_FILE, 'utf-8');
    const analytics = JSON.parse(data);
    // Ensure all fields exist (migration)
    return { ...getDefaultAnalytics(), ...analytics };
  } catch (err) {
    return getDefaultAnalytics();
  }
}

/**
 * Save analytics to file
 */
async function saveAnalytics(analytics) {
  try {
    analytics.updatedAt = new Date().toISOString();
    await fs.mkdir(path.dirname(ANALYTICS_FILE), { recursive: true });
    await fs.writeFile(ANALYTICS_FILE, JSON.stringify(analytics, null, 2));
  } catch (err) {
    console.error('[Analytics] Failed to save analytics:', err.message);
  }
}

/**
 * Generate anonymous session ID (no PII)
 */
function generateSessionId(req) {
  // Hash IP + user agent + date to create anonymous session
  const data = `${req.ip || 'unknown'}_${req.headers['user-agent'] || 'unknown'}_${new Date().toISOString().split('T')[0]}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Record a slide generation event
 */
async function recordSlideGenerated(slideType, template, framework, durationMs, cached = false) {
  try {
    const analytics = await loadAnalytics();
    const today = new Date().toISOString().split('T')[0];
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    
    // Update totals
    analytics.slides.totalGenerated++;
    if (cached) analytics.slides.totalCached++;
    
    // By type
    analytics.slides.byType[slideType] = (analytics.slides.byType[slideType] || 0) + 1;
    
    // By template
    if (template) {
      analytics.slides.byTemplate[template] = (analytics.slides.byTemplate[template] || 0) + 1;
    }
    
    // By framework
    if (framework) {
      analytics.slides.byFramework[framework] = (analytics.slides.byFramework[framework] || 0) + 1;
    }
    
    // By day
    if (!analytics.slides.byDay[today]) {
      analytics.slides.byDay[today] = { total: 0, cached: 0, types: {} };
    }
    analytics.slides.byDay[today].total++;
    if (cached) analytics.slides.byDay[today].cached++;
    analytics.slides.byDay[today].types[slideType] = (analytics.slides.byDay[today].types[slideType] || 0) + 1;
    
    // Generation time stats
    if (!cached && durationMs) {
      const gen = analytics.slides.generationTime;
      gen.totalMs += durationMs;
      gen.count++;
      gen.avgMs = Math.round(gen.totalMs / gen.count);
      gen.minMs = Math.min(gen.minMs, durationMs);
      gen.maxMs = Math.max(gen.maxMs, durationMs);
    }
    
    // Time distribution
    analytics.hourlyDistribution[hour]++;
    analytics.dayOfWeekDistribution[dayOfWeek]++;
    
    await saveAnalytics(analytics);
  } catch (err) {
    console.error('[Analytics] Recording slide failed:', err.message);
  }
}

/**
 * Record an export event
 */
async function recordExport(format, durationMs, success = true) {
  try {
    const analytics = await loadAnalytics();
    const today = new Date().toISOString().split('T')[0];
    
    if (!success) return;
    
    analytics.exports.total++;
    analytics.exports.byFormat[format] = (analytics.exports.byFormat[format] || 0) + 1;
    
    // By day
    if (!analytics.exports.byDay[today]) {
      analytics.exports.byDay[today] = { total: 0, formats: {} };
    }
    analytics.exports.byDay[today].total++;
    analytics.exports.byDay[today].formats[format] = (analytics.exports.byDay[today].formats[format] || 0) + 1;
    
    // Time stats
    if (durationMs) {
      analytics.exports.totalTimeMs += durationMs;
      analytics.exports.avgTimeMs = Math.round(analytics.exports.totalTimeMs / analytics.exports.total);
    }
    
    await saveAnalytics(analytics);
  } catch (err) {
    console.error('[Analytics] Recording export failed:', err.message);
  }
}

/**
 * Record an error event
 */
async function recordError(errorType, endpoint, details = {}) {
  try {
    const analytics = await loadAnalytics();
    const today = new Date().toISOString().split('T')[0];
    
    analytics.errors.total++;
    analytics.errors.byType[errorType] = (analytics.errors.byType[errorType] || 0) + 1;
    analytics.errors.byEndpoint[endpoint] = (analytics.errors.byEndpoint[endpoint] || 0) + 1;
    
    // By day
    if (!analytics.errors.byDay[today]) {
      analytics.errors.byDay[today] = { total: 0, types: {} };
    }
    analytics.errors.byDay[today].total++;
    analytics.errors.byDay[today].types[errorType] = (analytics.errors.byDay[today].types[errorType] || 0) + 1;
    
    // Recent errors (keep last 100)
    analytics.errors.recent.unshift({
      timestamp: new Date().toISOString(),
      type: errorType,
      endpoint,
      details: sanitizeErrorDetails(details)
    });
    analytics.errors.recent = analytics.errors.recent.slice(0, 100);
    
    await saveAnalytics(analytics);
  } catch (err) {
    console.error('[Analytics] Recording error failed:', err.message);
  }
}

/**
 * Sanitize error details to remove any potential PII
 */
function sanitizeErrorDetails(details) {
  const sensitiveKeys = ['email', 'name', 'user', 'password', 'token', 'key', 'secret', 'ip', 'id'];
  const sanitized = {};
  
  for (const [key, value] of Object.entries(details)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeErrorDetails(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Record funnel step (privacy-compliant, no session linking)
 */
async function recordFunnelStep(step, req) {
  try {
    const analytics = await loadAnalytics();
    const sessionId = generateSessionId(req);
    
    // Only count unique sessions per step per day
    const today = new Date().toISOString().split('T')[0];
    const sessionKey = `${today}_${sessionId}_${step}`;
    
    if (activeSessions.has(sessionKey)) {
      return; // Already recorded for this session today
    }
    activeSessions.set(sessionKey, Date.now());
    
    // Clean old sessions (keep last 24 hours)
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    for (const [key, time] of activeSessions) {
      if (time < cutoff) activeSessions.delete(key);
    }
    
    switch (step) {
      case 'landing':
        analytics.funnel.landingPage++;
        break;
      case 'form_start':
        analytics.funnel.formStarted++;
        analytics.funnel.dropOffPoints.landingToForm = 
          analytics.funnel.landingPage - analytics.funnel.formStarted;
        break;
      case 'form_complete':
        analytics.funnel.formCompleted++;
        analytics.funnel.dropOffPoints.formStartToComplete = 
          analytics.funnel.formStarted - analytics.funnel.formCompleted;
        break;
      case 'generation_start':
        analytics.funnel.generationStarted++;
        break;
      case 'generation_complete':
        analytics.funnel.generationCompleted++;
        analytics.funnel.dropOffPoints.formToGeneration = 
          analytics.funnel.formCompleted - analytics.funnel.generationCompleted;
        break;
      case 'export_start':
        analytics.funnel.exportStarted++;
        break;
      case 'export_complete':
        analytics.funnel.exportCompleted++;
        analytics.funnel.dropOffPoints.generationToExport = 
          analytics.funnel.generationCompleted - analytics.funnel.exportCompleted;
        break;
    }
    
    await saveAnalytics(analytics);
  } catch (err) {
    console.error('[Analytics] Recording funnel failed:', err.message);
  }
}

/**
 * Record template usage
 */
async function recordTemplateUsage(templateId, rating = null) {
  try {
    const analytics = await loadAnalytics();
    
    analytics.templates.usage[templateId] = (analytics.templates.usage[templateId] || 0) + 1;
    
    if (rating !== null) {
      if (!analytics.templates.ratings[templateId]) {
        analytics.templates.ratings[templateId] = { total: 0, count: 0, avg: 0 };
      }
      analytics.templates.ratings[templateId].total += rating;
      analytics.templates.ratings[templateId].count++;
      analytics.templates.ratings[templateId].avg = 
        analytics.templates.ratings[templateId].total / analytics.templates.ratings[templateId].count;
    }
    
    await saveAnalytics(analytics);
  } catch (err) {
    console.error('[Analytics] Recording template failed:', err.message);
  }
}

/**
 * Get analytics summary
 */
async function getAnalyticsSummary(timeRange = '7d') {
  const analytics = await loadAnalytics();
  const now = new Date();
  
  // Calculate date range
  const rangeDays = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 7;
  const cutoffDate = new Date(now - rangeDays * 24 * 60 * 60 * 1000);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];
  
  // Filter recent data
  const recentDays = Object.keys(analytics.slides.byDay)
    .filter(d => d >= cutoffStr)
    .sort();
  
  const recentExports = Object.keys(analytics.exports.byDay)
    .filter(d => d >= cutoffStr)
    .sort();
  
  // Calculate trends
  const slidesTrend = recentDays.map(d => ({
    date: d,
    total: analytics.slides.byDay[d]?.total || 0,
    cached: analytics.slides.byDay[d]?.cached || 0
  }));
  
  const exportsTrend = recentExports.map(d => ({
    date: d,
    total: analytics.exports.byDay[d]?.total || 0,
    ...analytics.exports.byDay[d]?.formats
  }));
  
  // Get popular templates
  const popularTemplates = Object.entries(analytics.templates.usage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({
      id,
      usage: count,
      rating: analytics.templates.ratings[id]?.avg || null
    }));
  
  // Get top errors
  const topErrors = Object.entries(analytics.errors.byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type, count]) => ({ type, count }));
  
  // Calculate conversion rates
  const funnel = analytics.funnel;
  const conversionRates = {
    landingToForm: funnel.landingPage > 0 
      ? Math.round((funnel.formStarted / funnel.landingPage) * 100) : 0,
    formToGeneration: funnel.formCompleted > 0 
      ? Math.round((funnel.generationCompleted / funnel.formCompleted) * 100) : 0,
    generationToExport: funnel.generationCompleted > 0 
      ? Math.round((funnel.exportCompleted / funnel.generationCompleted) * 100) : 0,
    overall: funnel.landingPage > 0 
      ? Math.round((funnel.exportCompleted / funnel.landingPage) * 100) : 0
  };
  
  return {
    summary: {
      totalSlides: analytics.slides.totalGenerated,
      totalExports: analytics.exports.total,
      totalErrors: analytics.errors.total,
      avgGenerationTime: analytics.slides.generationTime.avgMs,
      avgExportTime: analytics.exports.avgTimeMs,
      cacheHitRate: analytics.slides.totalGenerated > 0 
        ? Math.round((analytics.slides.totalCached / analytics.slides.totalGenerated) * 100) 
        : 0
    },
    timeRange: {
      range: timeRange,
      from: cutoffStr,
      to: now.toISOString().split('T')[0],
      days: recentDays
    },
    trends: {
      slides: slidesTrend,
      exports: exportsTrend
    },
    popular: {
      slideTypes: Object.entries(analytics.slides.byType)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => ({ type, count })),
      templates: popularTemplates,
      frameworks: Object.entries(analytics.slides.byFramework)
        .sort((a, b) => b[1] - a[1])
        .map(([fw, count]) => ({ framework: fw, count }))
    },
    exports: {
      byFormat: analytics.exports.byFormat,
      total: analytics.exports.total
    },
    errors: {
      total: analytics.errors.total,
      byType: analytics.errors.byType,
      recent: analytics.errors.recent.slice(0, 10),
      top: topErrors
    },
    funnel: {
      ...funnel,
      conversionRates
    },
    performance: analytics.slides.generationTime,
    timeDistribution: {
      hourly: analytics.hourlyDistribution,
      dayOfWeek: analytics.dayOfWeekDistribution
    },
    updatedAt: analytics.updatedAt
  };
}

/**
 * Get popular slide types
 */
async function getPopularSlideTypes(limit = 3) {
  const analytics = await loadAnalytics();
  
  return Object.entries(analytics.slides.byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([type, count]) => ({ type, count }));
}

/**
 * Get daily report data
 */
async function getDailyReport(date = null) {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const analytics = await loadAnalytics();
  
  const dayData = analytics.slides.byDay[targetDate] || { total: 0, cached: 0, types: {} };
  const exportData = analytics.exports.byDay[targetDate] || { total: 0, formats: {} };
  const errorData = analytics.errors.byDay[targetDate] || { total: 0, types: {} };
  
  return {
    date: targetDate,
    slides: {
      total: dayData.total,
      cached: dayData.cached,
      new: dayData.total - dayData.cached,
      byType: dayData.types
    },
    exports: {
      total: exportData.total,
      byFormat: exportData.formats
    },
    errors: {
      total: errorData.total,
      byType: errorData.types
    },
    hourly: analytics.hourlyDistribution
  };
}

/**
 * Reset analytics (use with caution)
 */
async function resetAnalytics() {
  await saveAnalytics(getDefaultAnalytics());
}

/**
 * Export analytics data (for backups)
 */
async function exportAnalytics() {
  const analytics = await loadAnalytics();
  return {
    ...analytics,
    exportedAt: new Date().toISOString()
  };
}

module.exports = {
  // Core functions
  loadAnalytics,
  saveAnalytics,
  generateSessionId,
  
  // Recording functions
  recordSlideGenerated,
  recordExport,
  recordError,
  recordFunnelStep,
  recordTemplateUsage,
  
  // Reporting functions
  getAnalyticsSummary,
  getPopularSlideTypes,
  getDailyReport,
  resetAnalytics,
  exportAnalytics
};
