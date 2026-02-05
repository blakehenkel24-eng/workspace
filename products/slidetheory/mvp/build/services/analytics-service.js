/**
 * Analytics Service
 * Handles analytics tracking and reporting
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const { SLIDE_TYPES } = require('../config/constants');

const ANALYTICS_FILE = config.paths.analytics;

/**
 * Default analytics structure
 */
function getDefaultAnalytics() {
  return {
    totalSlides: 0,
    byType: SLIDE_TYPES.reduce((acc, type) => ({ ...acc, [type]: 0 }), {}),
    byDay: {},
    lastGenerated: null,
    createdAt: new Date().toISOString()
  };
}

/**
 * Load analytics from file
 */
async function loadAnalytics() {
  try {
    const data = await fs.readFile(ANALYTICS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return getDefaultAnalytics();
  }
}

/**
 * Save analytics to file
 */
async function saveAnalytics(analytics) {
  try {
    // Ensure directory exists
    await fs.mkdir(path.dirname(ANALYTICS_FILE), { recursive: true });
    await fs.writeFile(ANALYTICS_FILE, JSON.stringify(analytics, null, 2));
  } catch (err) {
    console.error('[Analytics] Failed to save analytics:', err.message);
  }
}

/**
 * Record a slide generation event
 */
async function recordSlideGenerated(slideType) {
  try {
    const analytics = await loadAnalytics();
    const today = new Date().toISOString().split('T')[0];
    
    analytics.totalSlides++;
    analytics.lastGenerated = new Date().toISOString();
    analytics.byType[slideType] = (analytics.byType[slideType] || 0) + 1;
    
    if (!analytics.byDay[today]) {
      analytics.byDay[today] = { total: 0, byType: {} };
    }
    analytics.byDay[today].total++;
    analytics.byDay[today].byType[slideType] = (analytics.byDay[today].byType[slideType] || 0) + 1;
    
    await saveAnalytics(analytics);
  } catch (err) {
    console.error('[Analytics] Recording failed:', err.message);
  }
}

/**
 * Get analytics summary
 */
async function getAnalyticsSummary() {
  const analytics = await loadAnalytics();
  
  // Calculate additional stats
  const days = Object.keys(analytics.byDay);
  const today = new Date().toISOString().split('T')[0];
  
  return {
    ...analytics,
    stats: {
      daysTracked: days.length,
      today: analytics.byDay[today] || { total: 0, byType: {} },
      averagePerDay: days.length > 0 
        ? Math.round(analytics.totalSlides / days.length * 10) / 10 
        : 0
    }
  };
}

/**
 * Get popular slide types
 */
async function getPopularSlideTypes(limit = 3) {
  const analytics = await loadAnalytics();
  
  return Object.entries(analytics.byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([type, count]) => ({ type, count }));
}

/**
 * Reset analytics (use with caution)
 */
async function resetAnalytics() {
  await saveAnalytics(getDefaultAnalytics());
}

module.exports = {
  loadAnalytics,
  saveAnalytics,
  recordSlideGenerated,
  getAnalyticsSummary,
  getPopularSlideTypes,
  resetAnalytics
};
