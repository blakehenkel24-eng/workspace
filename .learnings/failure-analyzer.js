/**
 * Failure Analyzer - SAKI Self-Improvement System
 * 
 * Analyzes failures to extract root causes, recovery strategies,
 * and avoidance patterns for future interactions.
 */

const fs = require('fs');
const path = require('path');
const { searchEpisodes, EPISODE_TYPES, OUTCOMES } = require('./episode-logger');

const LEARNINGS_DIR = path.join(__dirname);

// Root cause categories
const ROOT_CAUSES = {
  // Understanding failures
  MISUNDERSTOOD_REQUIREMENT: 'misunderstood_requirement',
  MISSING_CONTEXT: 'missing_context',
  AMBIGUOUS_INSTRUCTION: 'ambiguous_instruction',
  
  // Tool/execution failures
  TOOL_ERROR: 'tool_error',
  TOOL_UNAVAILABLE: 'tool_unavailable',
  WRONG_TOOL_CHOICE: 'wrong_tool_choice',
  
  // Knowledge gaps
  MISSING_KNOWLEDGE: 'missing_knowledge',
  OUTDATED_INFO: 'outdated_info',
  INCORRECT_ASSUMPTION: 'incorrect_assumption',
  
  // Planning failures
  POOR_PLANNING: 'poor_planning',
  SCOPE_CREEP: 'scope_creep',
  TIME_ESTIMATE_ERROR: 'time_estimate_error',
  
  // Execution failures
  SYNTAX_ERROR: 'syntax_error',
  LOGIC_ERROR: 'logic_error',
  RACE_CONDITION: 'race_condition',
  RESOURCE_EXHAUSTION: 'resource_exhaustion',
  
  // Communication failures
  UNCLEAR_EXPLANATION: 'unclear_explanation',
  FAILED_TO_ASK_CLARIFICATION: 'failed_to_ask_clarification',
  PREMATURE_ASSUMPTION: 'premature_assumption',
  
  // External factors
  EXTERNAL_DEPENDENCY: 'external_dependency',
  NETWORK_ERROR: 'network_error',
  PERMISSION_DENIED: 'permission_denied',
  
  // Meta failures
  FAILED_TO_LOG: 'failed_to_log',
  RECURSIVE_ERROR: 'recursive_error'
};

// Recovery strategies
const RECOVERY_STRATEGIES = {
  CLARIFY: 'ask_user_clarification',
  RESEARCH: 'research_before_acting',
  RETRY: 'retry_with_correction',
  ROLLBACK: 'rollback_and_restart',
  SIMPLIFY: 'simplify_approach',
  ALTERNATIVE: 'try_alternative_method',
  ESCALATE: 'escalate_to_user',
  DOCUMENT: 'document_limitation',
  PARTIAL: 'deliver_partial_solution',
  SKIP: 'skip_and_continue'
};

/**
 * Analyze a failure episode and extract insights
 * @param {Object} episode - The failed episode
 * @returns {Object} Failure analysis
 */
function analyzeFailure(episode) {
  if (episode.outcome.status !== OUTCOMES.FAILURE && 
      episode.outcome.status !== OUTCOMES.PARTIAL) {
    return null;
  }
  
  const analysis = {
    episodeId: episode.id,
    timestamp: episode.timestamp,
    type: episode.type,
    task: episode.context.task,
    
    // Root cause analysis
    rootCause: {
      primary: null,
      secondary: [],
      evidence: [],
      confidence: 'medium'
    },
    
    // Recovery analysis
    recovery: {
      attempted: [],
      successful: null,
      timeToRecover: 0,
      couldHaveRecoveredFaster: false
    },
    
    // Prevention
    prevention: {
      earlyWarningSigns: [],
      avoidancePatterns: [],
      checklist: []
    },
    
    // Learning
    lessons: {
      keyInsight: '',
      behaviorChange: '',
      preventSimilar: ''
    }
  };
  
  // Analyze based on error patterns
  const errors = episode.metadata.errors;
  const actions = episode.actions;
  const lessons = episode.lessons;
  
  // Pattern matching for root cause
  for (const error of errors) {
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('permission') || errorLower.includes('access denied')) {
      analysis.rootCause.primary = ROOT_CAUSES.PERMISSION_DENIED;
    } else if (errorLower.includes('not found') || errorLower.includes('enoent')) {
      analysis.rootCause.primary = ROOT_CAUSES.MISSING_CONTEXT;
    } else if (errorLower.includes('syntax') || errorLower.includes('parse')) {
      analysis.rootCause.primary = ROOT_CAUSES.SYNTAX_ERROR;
    } else if (errorLower.includes('timeout') || errorLower.includes('etimedout')) {
      analysis.rootCause.primary = ROOT_CAUSES.NETWORK_ERROR;
    } else if (errorLower.includes('tool') && errorLower.includes('not')) {
      analysis.rootCause.primary = ROOT_CAUSES.TOOL_UNAVAILABLE;
    }
  }
  
  // If no specific error, look at what failed
  if (!analysis.rootCause.primary && lessons.whatFailed.length > 0) {
    if (lessons.whatFailed.some(f => f.includes('assum'))) {
      analysis.rootCause.primary = ROOT_CAUSES.INCORRECT_ASSUMPTION;
    } else if (lessons.whatFailed.some(f => f.includes('plan'))) {
      analysis.rootCause.primary = ROOT_CAUSES.POOR_PLANNING;
    } else if (lessons.whatFailed.some(f => f.includes('understand'))) {
      analysis.rootCause.primary = ROOT_CAUSES.MISUNDERSTOOD_REQUIREMENT;
    }
  }
  
  // Default to unknown if still not determined
  if (!analysis.rootCause.primary) {
    analysis.rootCause.primary = ROOT_CAUSES.INCORRECT_ASSUMPTION;
  }
  
  // Extract recovery strategies from actions
  let recovering = false;
  let recoveryStartTime = null;
  
  for (const action of actions) {
    const desc = action.description.toLowerCase();
    
    if (desc.includes('retry') || desc.includes('again')) {
      analysis.recovery.attempted.push(RECOVERY_STRATEGIES.RETRY);
      recovering = true;
    }
    if (desc.includes('clarif') || desc.includes('ask')) {
      analysis.recovery.attempted.push(RECOVERY_STRATEGIES.CLARIFY);
      recovering = true;
    }
    if (desc.includes('research') || desc.includes('search')) {
      analysis.recovery.attempted.push(RECOVERY_STRATEGIES.RESEARCH);
      recovering = true;
    }
    if (desc.includes('alternative') || desc.includes('instead')) {
      analysis.recovery.attempted.push(RECOVERY_STRATEGIES.ALTERNATIVE);
      recovering = true;
    }
    if (desc.includes('simplif')) {
      analysis.recovery.attempted.push(RECOVERY_STRATEGIES.SIMPLIFY);
      recovering = true;
    }
  }
  
  // Generate avoidance patterns
  analysis.prevention.avoidancePatterns = generateAvoidancePatterns(
    analysis.rootCause.primary,
    episode
  );
  
  // Generate checklist items
  analysis.prevention.checklist = generateChecklist(
    analysis.rootCause.primary,
    episode.type
  );
  
  // Key insight
  analysis.lessons.keyInsight = extractKeyInsight(episode, analysis.rootCause.primary);
  
  // Behavior change
  analysis.lessons.behaviorChange = generateBehaviorChange(analysis);
  
  return analysis;
}

/**
 * Generate avoidance patterns for a root cause
 */
function generateAvoidancePatterns(rootCause, episode) {
  const patterns = [];
  
  const patternsMap = {
    [ROOT_CAUSES.MISUNDERSTOOD_REQUIREMENT]: [
      'ALWAYS restate requirements before acting',
      'ASK for clarification on ambiguous terms',
      'BREAK down complex requests into sub-tasks'
    ],
    [ROOT_CAUSES.MISSING_CONTEXT]: [
      'CHECK for required files before operations',
      'VERIFY environment state before changes',
      'READ relevant files before editing'
    ],
    [ROOT_CAUSES.INCORRECT_ASSUMPTION]: [
      'QUESTION assumptions explicitly',
      'VERIFY default values before relying on them',
      'TEST assumptions with minimal probes'
    ],
    [ROOT_CAUSES.POOR_PLANNING]: [
      'PLAN before executing multi-step tasks',
      'ESTIMATE scope before committing',
      'IDENTIFY dependencies upfront'
    ],
    [ROOT_CAUSES.WRONG_TOOL_CHOICE]: [
      'CONSIDER all available tools',
      'EVALUATE tool fit for the specific task',
      'FALLBACK gracefully when tools fail'
    ],
    [ROOT_CAUSES.SYNTAX_ERROR]: [
      'VALIDATE syntax before saving',
      'USE linting tools when available',
      'TEST small changes incrementally'
    ],
    [ROOT_CAUSES.TOOL_ERROR]: [
      'HANDLE tool errors gracefully',
      'RETRY with backoff on transient errors',
      'LOG tool errors for pattern analysis'
    ],
    [ROOT_CAUSES.NETWORK_ERROR]: [
      'ASSUME network is unreliable',
      'TIMEOUT appropriately on network calls',
      'CACHE results when possible'
    ],
    [ROOT_CAUSES.PERMISSION_DENIED]: [
      'CHECK permissions before destructive operations',
      'ASK before elevating privileges',
      'VERIFY ownership before modifications'
    ]
  };
  
  return patternsMap[rootCause] || ['DOCUMENT the issue for future reference'];
}

/**
 * Generate checklist items for prevention
 */
function generateChecklist(rootCause, episodeType) {
  const baseChecklist = [
    'Understand the request fully',
    'Check available context',
    'Plan the approach',
    'Execute carefully',
    'Verify the outcome'
  ];
  
  const typeSpecific = {
    [EPISODE_TYPES.CODING]: [
      'Review existing code patterns',
      'Test changes locally',
      'Handle edge cases'
    ],
    [EPISODE_TYPES.CONTENT]: [
      'Match tone and style',
      'Verify facts and links',
      'Check formatting'
    ],
    [EPISODE_TYPES.STRATEGY]: [
      'Consider trade-offs',
      'Evaluate alternatives',
      'Document decisions'
    ]
  };
  
  return [...baseChecklist, ...(typeSpecific[episodeType] || [])];
}

/**
 * Extract key insight from failure
 */
function extractKeyInsight(episode, rootCause) {
  if (episode.lessons.keyInsight) {
    return episode.lessons.keyInsight;
  }
  
  const insights = {
    [ROOT_CAUSES.MISUNDERSTOOD_REQUIREMENT]: 'Taking time to clarify upfront saves time later',
    [ROOT_CAUSES.MISSING_CONTEXT]: 'Context gathering is not optional - it prevents errors',
    [ROOT_CAUSES.INCORRECT_ASSUMPTION]: 'Assumptions are risks - verify or eliminate them',
    [ROOT_CAUSES.POOR_PLANNING]: 'A few minutes of planning prevents hours of fixing',
    [ROOT_CAUSES.WRONG_TOOL_CHOICE]: 'Right tool for the job beats familiarity',
    [ROOT_CAUSES.SYNTAX_ERROR]: 'Machines are unforgiving - validate early',
    [ROOT_CAUSES.TOOL_ERROR]: 'Tools fail - design for resilience',
    [ROOT_CAUSES.NETWORK_ERROR]: 'Network calls are inherently unreliable'
  };
  
  return insights[rootCause] || 'Every failure contains a lesson - extract it';
}

/**
 * Generate behavior change recommendation
 */
function generateBehaviorChange(analysis) {
  const changes = {
    [ROOT_CAUSES.MISUNDERSTOOD_REQUIREMENT]: 'Always paraphrase user requests before acting',
    [ROOT_CAUSES.MISSING_CONTEXT]: 'Proactively gather context before starting',
    [ROOT_CAUSES.INCORRECT_ASSUMPTION]: 'State assumptions explicitly and verify them',
    [ROOT_CAUSES.POOR_PLANNING]: 'Create a plan for tasks with >3 steps',
    [ROOT_CAUSES.WRONG_TOOL_CHOICE]: 'Review tool options before selection',
    [ROOT_CAUSES.SYNTAX_ERROR]: 'Use syntax validation before file writes',
    [ROOT_CAUSES.TOOL_ERROR]: 'Implement retry logic for flaky tools',
    [ROOT_CAUSES.NETWORK_ERROR]: 'Add timeouts and caching to network calls',
    [ROOT_CAUSES.PERMISSION_DENIED]: 'Check permissions before destructive ops'
  };
  
  return changes[analysis.rootCause.primary] || 'Document and learn from this pattern';
}

/**
 * Batch analyze all failures in date range
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {Object} Analysis summary
 */
async function analyzeFailures(startDate, endDate) {
  const episodes = await searchEpisodes({}, 'all');
  
  const failures = episodes.filter(ep => 
    ep.outcome.status === OUTCOMES.FAILURE || 
    ep.outcome.status === OUTCOMES.PARTIAL
  );
  
  const dateFiltered = failures.filter(ep => {
    if (startDate && ep.date < startDate) return false;
    if (endDate && ep.date > endDate) return false;
    return true;
  });
  
  const analyses = dateFiltered.map(analyzeFailure).filter(Boolean);
  
  // Aggregate insights
  const rootCauseCounts = {};
  const recoveryCounts = {};
  const allAvoidancePatterns = [];
  const allBehaviorChanges = [];
  
  for (const a of analyses) {
    rootCauseCounts[a.rootCause.primary] = (rootCauseCounts[a.rootCause.primary] || 0) + 1;
    
    for (const r of a.recovery.attempted) {
      recoveryCounts[r] = (recoveryCounts[r] || 0) + 1;
    }
    
    allAvoidancePatterns.push(...a.prevention.avoidancePatterns);
    allBehaviorChanges.push(a.lessons.behaviorChange);
  }
  
  return {
    period: { startDate, endDate },
    totalFailuresAnalyzed: analyses.length,
    rootCauseDistribution: rootCauseCounts,
    recoveryStrategiesUsed: recoveryCounts,
    topAvoidancePatterns: getTopItems(allAvoidancePatterns, 10),
    topBehaviorChanges: getTopItems(allBehaviorChanges, 5),
    detailedAnalyses: analyses
  };
}

/**
 * Get top N items by frequency
 */
function getTopItems(items, n) {
  const counts = {};
  for (const item of items) {
    counts[item] = (counts[item] || 0) + 1;
  }
  
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([item, count]) => ({ item, count }));
}

/**
 * Generate failure prevention guide
 * @returns {string} Markdown guide
 */
function generatePreventionGuide() {
  return `# Failure Prevention Guide - SAKI

## Common Root Causes and How to Avoid Them

${Object.entries(ROOT_CAUSES).map(([key, value]) => {
  const patterns = generateAvoidancePatterns(value, EPISODE_TYPES.CODING);
  return `### ${key.replace(/_/g, ' ')}

**Avoidance Patterns:**
${patterns.map(p => `- ${p}`).join('\n')}
`;
}).join('\n---\n')}

## Recovery Strategy Hierarchy

1. **CLARIFY** - When unsure, ask
2. **RESEARCH** - When ignorant, learn
3. **RETRY** - When failed transiently, retry
4. **SIMPLIFY** - When stuck, reduce scope
5. **ALTERNATIVE** - When blocked, find another way
6. **ESCALATE** - When all else fails, involve user

## Quick Reference: Before You Start

- [ ] Do I understand the request?
- [ ] Do I have all needed context?
- [ ] Have I planned the approach?
- [ ] Do I know which tools to use?
- [ ] Have I considered what could go wrong?
`;
}

/**
 * Save analysis results
 * @param {Object} analysis - Analysis results
 * @param {string} filename - Output filename
 */
async function saveAnalysis(analysis, filename) {
  const filepath = path.join(LEARNINGS_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(analysis, null, 2));
  return filepath;
}

module.exports = {
  ROOT_CAUSES,
  RECOVERY_STRATEGIES,
  analyzeFailure,
  analyzeFailures,
  generatePreventionGuide,
  saveAnalysis
};

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'analyze') {
    const startDate = args[1];
    const endDate = args[2];
    analyzeFailures(startDate, endDate).then(analysis => {
      console.log(JSON.stringify(analysis, null, 2));
    });
  } else if (args[0] === 'guide') {
    console.log(generatePreventionGuide());
  } else {
    console.log(`
Failure Analyzer - Usage:
  node failure-analyzer.js analyze [startDate] [endDate]
  node failure-analyzer.js guide
`);
  }
}
