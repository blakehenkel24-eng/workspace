/**
 * SlideTheory MVP - Template Selector v1.0
 * Selects optimal slide structure based on user intent and audience
 */

const fs = require('fs').promises;
const path = require('path');

// Template archetypes mapping
const TEMPLATE_ARCHETYPES = {
  'Executive Summary': {
    structures: ['hero-message', 'three-pillars', 'situation-complication-resolution'],
    defaultStructure: 'hero-message',
    audienceAdjustments: {
      'C-Suite': { emphasis: 'insights-first', maxBullets: 3, tone: 'directive' },
      'Board': { emphasis: 'governance-focus', maxBullets: 4, tone: 'formal' },
      'PE': { emphasis: 'value-creation', maxBullets: 3, tone: 'analytical' },
      'VC': { emphasis: 'growth-potential', maxBullets: 3, tone: 'ambitious' }
    }
  },
  'Market Analysis': {
    structures: ['market-sizing', 'trend-analysis', 'opportunity-map'],
    defaultStructure: 'market-sizing',
    audienceAdjustments: {
      'C-Suite': { emphasis: 'strategic-implications', chartType: 'trend-bar' },
      'Board': { emphasis: 'risk-opportunity', chartType: 'growth-curve' },
      'PE': { emphasis: 'market-concentration', chartType: 'market-share' },
      'VC': { emphasis: 'tam-sam-som', chartType: 'stacked-bar' }
    }
  },
  'Financial Model': {
    structures: ['metrics-cards', 'waterfall-chart', 'scenario-analysis'],
    defaultStructure: 'metrics-cards',
    audienceAdjustments: {
      'C-Suite': { emphasis: 'efficiency-metrics', detailLevel: 'summary' },
      'Board': { emphasis: 'governance-kpis', detailLevel: 'detailed' },
      'PE': { emphasis: 'unit-economics', detailLevel: 'granular' },
      'VC': { emphasis: 'growth-metrics', detailLevel: 'summary' }
    }
  },
  'Competitive Analysis': {
    structures: ['2x2-matrix', 'feature-comparison', 'perceptual-map'],
    defaultStructure: '2x2-matrix',
    audienceAdjustments: {
      'C-Suite': { emphasis: 'strategic-positioning', competitors: 4 },
      'Board': { emphasis: 'market-dynamics', competitors: 5 },
      'PE': { emphasis: 'market-fragmentation', competitors: 6 },
      'VC': { emphasis: 'differentiation', competitors: 4 }
    }
  },
  'Growth Strategy': {
    structures: ['flywheel', 'initiative-roadmap', 'growth-tower'],
    defaultStructure: 'flywheel',
    audienceAdjustments: {
      'C-Suite': { emphasis: 'strategic-pillars', timeframe: '3-year' },
      'Board': { emphasis: 'resource-allocation', timeframe: 'annual' },
      'PE': { emphasis: 'value-levers', timeframe: 'hold-period' },
      'VC': { emphasis: 'scaling-playbook', timeframe: '18-month' }
    }
  },
  'Risk Assessment': {
    structures: ['risk-matrix', 'heat-map', 'mitigation-table'],
    defaultStructure: 'risk-matrix',
    audienceAdjustments: {
      'C-Suite': { emphasis: 'top-risks', maxRisks: 4 },
      'Board': { emphasis: 'enterprise-risks', maxRisks: 6 },
      'PE': { emphasis: 'investment-risks', maxRisks: 5 },
      'VC': { emphasis: 'execution-risks', maxRisks: 4 }
    }
  }
};

// Framework recommendations based on slide type + audience
const FRAMEWORK_RECOMMENDATIONS = {
  'Executive Summary': {
    'C-Suite': 'SCR Framework (Situation-Complication-Resolution)',
    'Board': 'MECE Issue Tree',
    'PE': 'Value Creation Framework',
    'VC': 'Traction-Team-Market',
    'default': 'Pyramid Principle'
  },
  'Market Analysis': {
    'PE': 'Porter\'s Five Forces',
    'C-Suite': 'Market Attractiveness Matrix',
    'default': 'TAM-SAM-SOM Analysis'
  },
  'Financial Model': {
    'PE': 'Waterfall Chart',
    'Board': 'Scenario Analysis',
    'default': 'Three-Statement Model'
  },
  'Competitive Analysis': {
    'PE': 'Competitive Positioning Matrix',
    'C-Suite': 'Strategic Group Mapping',
    'default': 'Feature Comparison'
  },
  'Growth Strategy': {
    'VC': 'AARRR Pirate Metrics',
    'PE': 'Buy-Build-Partner Framework',
    'C-Suite': 'Ansoff Matrix',
    'default': 'Flywheel Model'
  },
  'Risk Assessment': {
    'Board': 'Enterprise Risk Matrix',
    'PE': 'Due Diligence Risk Register',
    'default': 'Probability-Impact Matrix'
  }
};

// Presentation mode adjustments
const PRESENTATION_MODE_ADJUSTMENTS = {
  'live': {
    textDensity: 'medium',
    visualRatio: 0.6,
    speakerNotes: true,
    animationHints: true
  },
  'email': {
    textDensity: 'high',
    visualRatio: 0.4,
    selfContained: true,
    detailedLabels: true
  },
  'pre-read': {
    textDensity: 'high',
    visualRatio: 0.5,
    executiveSummary: true,
    appendixReference: true
  },
  'board-deck': {
    textDensity: 'medium',
    visualRatio: 0.5,
    governanceContext: true,
    decisionFocus: true
  },
  'pitch-deck': {
    textDensity: 'low',
    visualRatio: 0.7,
    storyArc: true,
    hookFocus: true
  }
};

/**
 * Select the best template structure for given inputs
 * @param {Object} params - Selection parameters
 * @param {string} params.slideType - Type of slide
 * @param {string} params.audience - Target audience
 * @param {string} params.presentationMode - Mode of presentation
 * @param {string} params.context - User context
 * @returns {Object} - Selected template configuration
 */
function selectTemplate(params) {
  const { slideType, audience = 'General', presentationMode = 'live', context = '' } = params;

  // Get archetype for slide type
  const archetype = TEMPLATE_ARCHETYPES[slideType];
  if (!archetype) {
    return getDefaultTemplate(slideType, audience);
  }

  // Determine structure
  const structure = selectStructure(archetype, context);
  
  // Get audience adjustments
  const audienceAdjustment = archetype.audienceAdjustments[audience] || 
                            archetype.audienceAdjustments['C-Suite'] || {};

  // Get presentation mode adjustments
  const modeAdjustment = PRESENTATION_MODE_ADJUSTMENTS[presentationMode] || 
                        PRESENTATION_MODE_ADJUSTMENTS['live'];

  // Get framework recommendation
  const framework = selectFramework(slideType, audience);

  // Build template configuration
  return {
    slideType,
    structure,
    framework,
    layout: {
      type: structure,
      columns: getColumnCount(structure, presentationMode),
      emphasis: audienceAdjustment.emphasis || 'balanced'
    },
    content: {
      maxBullets: audienceAdjustment.maxBullets || 4,
      maxRisks: audienceAdjustment.maxRisks || 5,
      maxCompetitors: audienceAdjustment.competitors || 5,
      detailLevel: audienceAdjustment.detailLevel || 'summary',
      tone: audienceAdjustment.tone || 'professional',
      textDensity: modeAdjustment.textDensity,
      timeframe: audienceAdjustment.timeframe || '3-year'
    },
    visuals: {
      chartType: audienceAdjustment.chartType || 'bar',
      visualRatio: modeAdjustment.visualRatio,
      includeSpeakerNotes: modeAdjustment.speakerNotes || false
    },
    // Structural inspiration (NOT content extraction)
    structuralHints: getStructuralHints(slideType, structure)
  };
}

/**
 * Select appropriate structure based on archetype and context
 * @param {Object} archetype - Template archetype
 * @param {string} context - User context
 * @returns {string} - Selected structure
 */
function selectStructure(archetype, context) {
  const contextLower = context.toLowerCase();
  
  // Keyword-based structure selection
  const keywords = {
    'hero-message': ['summary', 'overview', 'recommendation', 'conclusion'],
    'three-pillars': ['strategic', 'pillars', 'foundations', 'approach'],
    'situation-complication-resolution': ['problem', 'challenge', 'issue', 'crisis'],
    'market-sizing': ['market', 'size', 'growth', 'opportunity'],
    'trend-analysis': ['trend', 'forecast', 'projection', 'future'],
    'metrics-cards': ['kpi', 'metrics', 'performance', 'dashboard'],
    'waterfall-chart': ['bridge', 'walk', 'reconciliation', 'variance'],
    '2x2-matrix': ['positioning', 'quadrant', 'matrix', 'landscape'],
    'flywheel': ['growth', 'loop', 'cycle', 'momentum'],
    'risk-matrix': ['risk', 'mitigation', 'assessment']
  };

  // Check for keyword matches
  for (const [structure, words] of Object.entries(keywords)) {
    if (archetype.structures.includes(structure)) {
      if (words.some(word => contextLower.includes(word))) {
        return structure;
      }
    }
  }

  // Default to first structure
  return archetype.defaultStructure;
}

/**
 * Select appropriate framework based on slide type and audience
 * @param {string} slideType - Type of slide
 * @param {string} audience - Target audience
 * @returns {string} - Recommended framework
 */
function selectFramework(slideType, audience) {
  const frameworks = FRAMEWORK_RECOMMENDATIONS[slideType];
  if (!frameworks) return 'Consulting Best Practices';
  
  return frameworks[audience] || frameworks['default'];
}

/**
 * Get column count based on structure and presentation mode
 * @param {string} structure - Selected structure
 * @param {string} presentationMode - Presentation mode
 * @returns {number} - Number of columns
 */
function getColumnCount(structure, presentationMode) {
  if (presentationMode === 'email') return 1;
  
  const multiColumnStructures = ['2x2-matrix', 'market-sizing', 'feature-comparison'];
  return multiColumnStructures.includes(structure) ? 2 : 1;
}

/**
 * Get structural hints for content organization
 * @param {string} slideType - Type of slide
 * @param {string} structure - Selected structure
 * @returns {Object} - Structural hints
 */
function getStructuralHints(slideType, structure) {
  const hints = {
    'Executive Summary': {
      'hero-message': {
        leadWith: 'single compelling headline',
        supportingElements: ['3 supporting bullets', 'clear recommendation'],
        order: ['title', 'subtitle', 'key points', 'recommendation']
      },
      'three-pillars': {
        leadWith: 'strategic overview',
        supportingElements: ['3 strategic pillars', 'interconnection'],
        order: ['title', 'pillar 1', 'pillar 2', 'pillar 3']
      }
    },
    'Market Analysis': {
      'market-sizing': {
        leadWith: 'market size headline',
        supportingElements: ['growth trajectory', 'key insights', 'chart'],
        order: ['title', 'market size', 'insights', 'chart']
      }
    },
    'Financial Model': {
      'metrics-cards': {
        leadWith: 'financial headline',
        supportingElements: ['3 key metrics', 'trend table', 'footnotes'],
        order: ['title', 'metrics', 'table', 'footnotes']
      }
    },
    'Competitive Analysis': {
      '2x2-matrix': {
        leadWith: 'positioning headline',
        supportingElements: ['matrix visualization', 'feature comparison'],
        order: ['title', 'matrix', 'comparison table']
      }
    },
    'Growth Strategy': {
      'flywheel': {
        leadWith: 'growth headline',
        supportingElements: ['flywheel diagram', 'strategic initiatives'],
        order: ['title', 'flywheel', 'initiatives']
      }
    },
    'Risk Assessment': {
      'risk-matrix': {
        leadWith: 'risk headline',
        supportingElements: ['probability-impact matrix', 'mitigation table'],
        order: ['title', 'matrix', 'mitigations']
      }
    }
  };

  return hints[slideType]?.[structure] || {
    leadWith: 'clear headline',
    supportingElements: ['relevant content', 'supporting visuals'],
    order: ['title', 'content', 'footer']
  };
}

/**
 * Get default template for unknown slide types
 * @param {string} slideType - Slide type
 * @param {string} audience - Target audience
 * @returns {Object} - Default template
 */
function getDefaultTemplate(slideType, audience) {
  return {
    slideType,
    structure: 'standard',
    framework: 'Consulting Best Practices',
    layout: {
      type: 'standard',
      columns: 1,
      emphasis: 'balanced'
    },
    content: {
      maxBullets: 4,
      detailLevel: 'summary',
      tone: 'professional',
      textDensity: 'medium'
    },
    visuals: {
      chartType: 'bar',
      visualRatio: 0.5
    },
    structuralHints: {
      leadWith: 'clear headline',
      supportingElements: ['key points', 'supporting details'],
      order: ['title', 'content', 'footer']
    }
  };
}

/**
 * Load template examples from knowledge base (for structural inspiration only)
 * @param {string} slideType - Type of slide to find examples for
 * @returns {Promise<Array>} - Template examples
 */
async function loadTemplateExamples(slideType) {
  try {
    const templatesPath = path.join(__dirname, '..', 'knowledge-base', 'templates');
    const files = await fs.readdir(templatesPath);
    
    const examples = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const content = await fs.readFile(path.join(templatesPath, file), 'utf-8');
          const template = JSON.parse(content);
          
          // Only use for structural inspiration if slide type matches
          if (template.slideType === slideType) {
            examples.push({
              id: template.id,
              slideType: template.slideType,
              structure: template.framework || 'standard',
              targetAudience: template.targetAudience,
              // Note: We only extract structural metadata, NOT content
              structuralInspiration: {
                hasDataPoints: Array.isArray(template.dataPoints) && template.dataPoints.length > 0,
                dataPointCount: template.dataPoints?.length || 0,
                framework: template.framework
              }
            });
          }
        } catch (e) {
          // Skip invalid files
        }
      }
    }

    return examples;
  } catch (error) {
    // Knowledge base not available or error reading
    return [];
  }
}

/**
 * Generate audience-specific styling hints
 * @param {string} audience - Target audience
 * @returns {Object} - Styling hints
 */
function getAudienceStyling(audience) {
  const styling = {
    'C-Suite': {
      colorScheme: 'corporate-blue',
      typography: 'clean-professional',
      dataPresentation: 'high-level-metrics',
      avoid: ['excessive-detail', 'jargon-without-context']
    },
    'Board': {
      colorScheme: 'conservative-navy',
      typography: 'traditional-formal',
      dataPresentation: 'governance-focused',
      avoid: ['operational-minutiae', 'unsubstantiated-projections']
    },
    'PE': {
      colorScheme: 'financial-gray',
      typography: 'data-dense',
      dataPresentation: 'unit-economics-heavy',
      avoid: ['fluffy-metrics', 'vanity-numbers']
    },
    'VC': {
      colorScheme: 'modern-tech',
      typography: 'bold-contemporary',
      dataPresentation: 'growth-story',
      avoid: ['overly-conservative', 'missing-market-context']
    }
  };

  return styling[audience] || styling['C-Suite'];
}

module.exports = {
  selectTemplate,
  loadTemplateExamples,
  getAudienceStyling,
  TEMPLATE_ARCHETYPES,
  FRAMEWORK_RECOMMENDATIONS,
  PRESENTATION_MODE_ADJUSTMENTS
};
