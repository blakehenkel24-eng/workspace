/**
 * Episode Logger - SAKI Self-Improvement System
 * 
 * Logs every interaction for pattern extraction and continuous improvement.
 * Uses JSONL format for easy append-only writes and streaming analysis.
 */

const fs = require('fs');
const path = require('path');

const LEARNINGS_DIR = path.join(__dirname);
const ARCHIVE_DIR = path.join(LEARNINGS_DIR, 'episode-archive');

// Episode types for categorization
const EPISODE_TYPES = {
  CODING: 'coding',           // Programming tasks, code changes
  CONTENT: 'content',         // Writing, editing, creating content
  STRATEGY: 'strategy',       // Planning, architecture, decisions
  ERROR: 'error',             // Failures, bugs, mistakes
  COMMUNICATION: 'comm',      // User interactions, clarifications
  RESEARCH: 'research',       // Web search, analysis tasks
  AUTOMATION: 'automation',   // Scripts, cron jobs, tooling
  META: 'meta'                // Self-improvement, logging, analysis
};

// Confidence levels for decisions
const CONFIDENCE_LEVELS = {
  HIGH: 'high',      // >90% certain, standard approach
  MEDIUM: 'medium',  // 70-90%, some uncertainty
  LOW: 'low',        // 50-70%, significant uncertainty
  GUESS: 'guess'     // <50%, educated guess required
};

// Outcome status
const OUTCOMES = {
  SUCCESS: 'success',
  PARTIAL: 'partial',
  FAILURE: 'failure',
  UNKNOWN: 'unknown'
};

/**
 * Create a new episode log entry
 * @param {Object} data - Episode data
 * @returns {Object} Formatted episode object
 */
function createEpisode(data) {
  const timestamp = new Date().toISOString();
  const date = timestamp.split('T')[0];
  
  return {
    id: generateId(),
    timestamp,
    date,
    type: data.type || EPISODE_TYPES.META,
    
    // Context
    context: {
      task: data.task || '',
      userRequest: data.userRequest || '',
      sessionId: data.sessionId || '',
      channel: data.channel || '',
      toolsAvailable: data.toolsAvailable || [],
      constraints: data.constraints || []
    },
    
    // Actions taken
    actions: data.actions || [],
    // Each action: { tool, description, duration, result }
    
    // Decisions made
    decisions: data.decisions || [],
    // Each decision: { point, confidence, reasoning, alternatives }
    
    // Outcome
    outcome: {
      status: data.outcome?.status || OUTCOMES.UNKNOWN,
      userSatisfied: data.outcome?.userSatisfied || null,
      deliverables: data.outcome?.deliverables || [],
      completionPercent: data.outcome?.completionPercent || 0
    },
    
    // Lessons learned
    lessons: {
      whatWorked: data.lessons?.whatWorked || [],
      whatFailed: data.lessons?.whatFailed || [],
      whatToImprove: data.lessons?.whatToImprove || [],
      patternsIdentified: data.lessons?.patternsIdentified || []
    },
    
    // Metadata for analysis
    metadata: {
      toolCount: data.actions?.length || 0,
      duration: data.duration || 0,
      retries: data.retries || 0,
      errors: data.errors || [],
      tags: data.tags || []
    }
  };
}

/**
 * Generate unique ID for episode
 */
function generateId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ep-${timestamp}-${random}`;
}

/**
 * Log an episode to the archive
 * @param {Object} episodeData - Raw episode data
 * @returns {Promise<string>} Path to log file
 */
async function logEpisode(episodeData) {
  const episode = createEpisode(episodeData);
  const filename = `${episode.date}.jsonl`;
  const filepath = path.join(ARCHIVE_DIR, filename);
  
  const line = JSON.stringify(episode) + '\n';
  
  return new Promise((resolve, reject) => {
    fs.appendFile(filepath, line, (err) => {
      if (err) reject(err);
      else resolve(filepath);
    });
  });
}

/**
 * Quick log helper for common use cases
 * @param {string} type - Episode type
 * @param {string} task - Brief task description
 * @param {Object} options - Additional options
 */
async function quickLog(type, task, options = {}) {
  const episode = createEpisode({
    type,
    task,
    userRequest: options.userRequest || task,
    actions: options.actions || [],
    decisions: options.decisions || [],
    outcome: options.outcome || { status: OUTCOMES.UNKNOWN },
    lessons: options.lessons || {},
    duration: options.duration,
    tags: options.tags || []
  });
  
  return logEpisode(episode);
}

/**
 * Log an action within the current context
 * @param {string} tool - Tool name used
 * @param {string} description - What was done
 * @param {Object} result - Result data
 */
function logAction(tool, description, result = {}) {
  return {
    timestamp: new Date().toISOString(),
    tool,
    description,
    success: result.success !== false,
    error: result.error || null,
    duration: result.duration || 0
  };
}

/**
 * Log a decision point
 * @param {string} point - What was decided
 * @param {string} confidence - Confidence level
 * @param {string} reasoning - Why this decision
 * @param {Array} alternatives - Other options considered
 */
function logDecision(point, confidence = CONFIDENCE_LEVELS.MEDIUM, reasoning = '', alternatives = []) {
  return {
    timestamp: new Date().toISOString(),
    point,
    confidence,
    reasoning,
    alternatives
  };
}

/**
 * Search/filter episodes
 * @param {Object} filters - Filter criteria
 * @param {string} date - Specific date file (YYYY-MM-DD) or 'all'
 * @returns {Promise<Array>} Matching episodes
 */
async function searchEpisodes(filters = {}, date = 'all') {
  const episodes = [];
  const files = date === 'all' 
    ? fs.readdirSync(ARCHIVE_DIR).filter(f => f.endsWith('.jsonl'))
    : [`${date}.jsonl`];
  
  for (const file of files) {
    const filepath = path.join(ARCHIVE_DIR, file);
    if (!fs.existsSync(filepath)) continue;
    
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.trim().split('\n').filter(l => l);
    
    for (const line of lines) {
      try {
        const episode = JSON.parse(line);
        
        // Apply filters
        if (filters.type && episode.type !== filters.type) continue;
        if (filters.outcome && episode.outcome.status !== filters.outcome) continue;
        if (filters.tag && !episode.metadata.tags.includes(filters.tag)) continue;
        if (filters.taskContains && !episode.context.task.toLowerCase().includes(filters.taskContains.toLowerCase())) continue;
        if (filters.hasErrors && episode.metadata.errors.length === 0) continue;
        
        episodes.push(episode);
      } catch (e) {
        // Skip malformed lines
      }
    }
  }
  
  return episodes;
}

/**
 * Get statistics for a date range
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {Object} Statistics
 */
async function getStats(startDate, endDate) {
  const episodes = await searchEpisodes({}, 'all');
  
  const stats = {
    totalEpisodes: 0,
    byType: {},
    byOutcome: {},
    avgDuration: 0,
    totalErrors: 0,
    successRate: 0
  };
  
  let totalDuration = 0;
  let successCount = 0;
  
  for (const ep of episodes) {
    // Date filtering (simple string comparison works for ISO dates)
    if (startDate && ep.date < startDate) continue;
    if (endDate && ep.date > endDate) continue;
    
    stats.totalEpisodes++;
    stats.byType[ep.type] = (stats.byType[ep.type] || 0) + 1;
    stats.byOutcome[ep.outcome.status] = (stats.byOutcome[ep.outcome.status] || 0) + 1;
    stats.totalErrors += ep.metadata.errors.length;
    totalDuration += ep.metadata.duration;
    
    if (ep.outcome.status === OUTCOMES.SUCCESS) successCount++;
  }
  
  stats.avgDuration = stats.totalEpisodes > 0 ? totalDuration / stats.totalEpisodes : 0;
  stats.successRate = stats.totalEpisodes > 0 ? (successCount / stats.totalEpisodes) * 100 : 0;
  
  return stats;
}

/**
 * Extract common patterns from episodes
 * @param {Array} episodes - Episodes to analyze
 * @returns {Object} Patterns found
 */
function extractPatterns(episodes) {
  const patterns = {
    commonActions: {},
    commonErrors: {},
    decisionTrends: [],
    improvementAreas: []
  };
  
  for (const ep of episodes) {
    // Count actions
    for (const action of ep.actions) {
      const key = action.tool || action.description;
      patterns.commonActions[key] = (patterns.commonActions[key] || 0) + 1;
    }
    
    // Count errors
    for (const error of ep.metadata.errors) {
      patterns.commonErrors[error] = (patterns.commonErrors[error] || 0) + 1;
    }
    
    // Collect improvement areas
    patterns.improvementAreas.push(...ep.lessons.whatToImprove);
  }
  
  return patterns;
}

module.exports = {
  EPISODE_TYPES,
  CONFIDENCE_LEVELS,
  OUTCOMES,
  createEpisode,
  logEpisode,
  quickLog,
  logAction,
  logDecision,
  searchEpisodes,
  getStats,
  extractPatterns
};

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'stats') {
    const startDate = args[1];
    const endDate = args[2];
    getStats(startDate, endDate).then(stats => {
      console.log(JSON.stringify(stats, null, 2));
    });
  } else if (args[0] === 'search') {
    const filters = JSON.parse(args[1] || '{}');
    searchEpisodes(filters).then(episodes => {
      console.log(JSON.stringify(episodes, null, 2));
    });
  } else {
    console.log(`
Episode Logger - Usage:
  node episode-logger.js stats [startDate] [endDate]
  node episode-logger.js search '{"type":"error"}'

Episode Types: ${Object.values(EPISODE_TYPES).join(', ')}
`);
  }
}
