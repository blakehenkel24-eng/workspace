/**
 * SlideTheory MVP - Prompt Builder v1.0
 * Constructs optimized AI prompts for Kimi API
 */

const { selectTemplate, getAudienceStyling } = require('./template-selector');
const { extractDataPoints } = require('./validators');

// Directional prompt templates by slide type
const DIRECTIONAL_PROMPTS = {
  'Executive Summary': {
    role: 'You are an elite McKinsey strategy consultant presenting to C-Suite executives.',
    approach: `Lead with a bold, actionable headline (5-8 words) that states the recommendation.
Structure using the Pyramid Principle:
1. Single compelling headline (the "so what")
2. 3 supporting points with data
3. Clear recommendation or next step`,
    rules: [
      'Every bullet must have data or evidence',
      'Use active voice and strong verbs',
      'No hedging language ("could", "might", "possibly")',
      'Format numbers as: $XM, +X%, Xpp'
    ],
    outputFormat: {
      title: 'Action headline (5-8 words)',
      subtitle: 'Supporting insight (max 10 words)',
      keyPoints: [
        { heading: 'Point heading (3-5 words)', text: '2-3 sentences with data' }
      ],
      recommendation: 'Clear action statement',
      footer: { source: 'Source', date: 'Mon YYYY' }
    }
  },

  'Market Analysis': {
    role: 'You are a market strategy expert presenting market opportunity analysis.',
    approach: `Present market size and growth dynamics clearly:
1. State TAM/SAM/SOM or market size headline
2. Show growth trajectory with specific CAGR
3. Identify 3 key market insights
4. Include chart data for visualization`,
    rules: [
      'Lead with the market size number',
      'Show year-over-year growth rates',
      'Identify market trends with evidence',
      'Format: $XB, +X% CAGR'
    ],
    outputFormat: {
      title: 'Market headline (5-7 words)',
      marketSize: '$X.XB growing X% annually',
      insights: ['Key insight with data'],
      chartData: {
        type: 'bar',
        labels: ['2022', '2023', '2024E', '2025E'],
        values: [25, 35, 48, 65]
      },
      footer: { source: 'Industry reports', date: 'Mon YYYY' }
    }
  },

  'Financial Model': {
    role: 'You are a private equity associate presenting financial analysis to investment committee.',
    approach: `Present financial performance with rigor:
1. 3 key financial metrics (Revenue, Margin, EBITDA)
2. Year-over-year changes with basis points
3. Multi-year financial table
4. Clear footnotes on assumptions`,
    rules: [
      'All numbers must show YoY changes',
      'Use pp (percentage points) for margin changes',
      'Round to meaningful precision',
      'Include unit economics if relevant'
    ],
    outputFormat: {
      title: 'Financial headline (5-7 words)',
      metrics: [
        { label: 'Revenue', value: '$X.XM', change: '+XX%', period: 'YoY' }
      ],
      tableData: {
        headers: ['Metric', '2023', '2024', '2025E'],
        rows: [['Revenue ($M)', '$X.X', '$X.X', '$X.X']]
      },
      footer: { source: 'Financial data', date: 'Mon YYYY' }
    }
  },

  'Competitive Analysis': {
    role: 'You are a competitive intelligence analyst presenting market positioning.',
    approach: `Map competitive landscape effectively:
1. 2x2 positioning matrix with 3-5 competitors
2. Clear axis definitions (e.g., Innovation vs Scale)
3. Feature comparison table
4. Highlight differentiation`,
    rules: [
      'Position competitors objectively',
      'Use quantifiable axis labels',
      'Show feature parity clearly',
      'Highlight sustainable advantages'
    ],
    outputFormat: {
      title: 'Competitive positioning headline',
      matrixTitle: '2x2 Matrix: X vs Y',
      xAxis: { low: 'Low X', high: 'High X' },
      yAxis: { low: 'Low Y', high: 'High Y' },
      competitors: [
        { name: 'Competitor', xPosition: 50, yPosition: 50, features: [true, false] }
      ],
      features: ['Feature 1', 'Feature 2'],
      footer: { source: 'Competitive analysis', date: 'Mon YYYY' }
    }
  },

  'Growth Strategy': {
    role: 'You are a growth strategist presenting expansion initiatives.',
    approach: `Articulate growth strategy clearly:
1. Growth flywheel or engine diagram
2. 3-4 strategic initiatives
3. Initiative descriptions with expected impact
4. Logical sequencing if applicable`,
    rules: [
      'Show how initiatives interconnect',
      'Quantify impact where possible',
      'Prioritize by strategic importance',
      'Include timeline context'
    ],
    outputFormat: {
      title: 'Growth strategy headline',
      flywheelTitle: 'Growth Flywheel',
      flywheel: [{ label: 'Stage 1' }, { label: 'Stage 2' }],
      initiatives: [
        { title: 'Initiative (5-7 words)', description: 'Brief description' }
      ],
      footer: { source: 'Strategy team', date: 'Mon YYYY' }
    }
  },

  'Risk Assessment': {
    role: 'You are a risk management consultant presenting enterprise risk analysis.',
    approach: `Assess risks systematically:
1. Probability-Impact matrix
2. 4-6 key risks categorized
3. Mitigation actions for top risks
4. Clear risk ownership if applicable`,
    rules: [
      'Categorize by probability and impact',
      'Quantify risks where possible',
      'Provide concrete mitigations',
      'Distinguish inherent vs residual risk'
    ],
    outputFormat: {
      title: 'Risk assessment headline',
      risks: [
        { name: 'Risk 1', probability: 'High/Medium/Low', impact: 'High/Medium/Low' }
      ],
      mitigations: [
        { risk: 'Risk name', level: 'high/medium/low', action: 'Mitigation action' }
      ],
      footer: { source: 'Risk assessment', date: 'Mon YYYY' }
    }
  }
};

// Audience-specific modifications
const AUDIENCE_MODIFIERS = {
  'C-Suite': {
    tone: 'executive-directive',
    focus: 'strategic implications and decisions',
    depth: 'high-level with drill-down availability',
    language: 'business outcomes, not features',
    timeContext: '3-5 year horizon'
  },
  'Board': {
    tone: 'governance-formal',
    focus: 'oversight and fiduciary responsibilities',
    depth: 'sufficient for governance decisions',
    language: 'fiduciary duty, shareholder value',
    timeContext: 'annual and multi-year'
  },
  'PE': {
    tone: 'analytical-precise',
    focus: 'value creation and investment returns',
    depth: 'granular unit economics',
    language: 'IRR, MOIC, EBITDA, cash flows',
    timeContext: 'hold period (3-7 years)'
  },
  'VC': {
    tone: 'ambitious-visionary',
    focus: 'market opportunity and growth potential',
    depth: 'TAM expansion and scaling mechanics',
    language: 'unicorn potential, market dominance',
    timeContext: '18-36 month milestones'
  },
  'Internal': {
    tone: 'collaborative-practical',
    focus: 'execution and operational impact',
    depth: 'actionable details',
    language: 'team alignment, resource needs',
    timeContext: 'quarterly and annual'
  },
  'Sales': {
    tone: 'persuasive-benefit-focused',
    focus: 'customer value and differentiation',
    depth: 'proof points and case studies',
    language: 'ROI, outcomes, competitive wins',
    timeContext: 'current quarter focus'
  }
};

// Presentation mode context
const MODE_CONTEXT = {
  'live': 'This slide will be presented live with verbal narration. Keep text concise and visual-forward.',
  'email': 'This slide must be self-contained for email distribution. Include sufficient context and detailed labels.',
  'pre-read': 'This is a pre-read for a meeting. Include enough detail for informed discussion, with clear action items.',
  'board-deck': 'Formal board presentation. Emphasize governance implications and decision requirements.',
  'pitch-deck': 'Investor pitch context. Lead with the most compelling insight and build a compelling narrative.'
};

/**
 * Build optimized prompt for Kimi API
 * @param {Object} params - Build parameters
 * @returns {Object} - { systemPrompt, userPrompt, options }
 */
function buildPrompt(params) {
  const {
    slideType,
    audience = 'C-Suite',
    context = '',
    presentationMode = 'live',
    data = null,
    dataPoints = [],
    keyTakeaway = '',
    framework = null
  } = params;

  // Get template selection for structural guidance
  const template = selectTemplate({ slideType, audience, presentationMode, context });

  // Get directional prompt for slide type
  const directional = DIRECTIONAL_PROMPTS[slideType] || DIRECTIONAL_PROMPTS['Executive Summary'];

  // Get audience modifier
  const audienceModifier = AUDIENCE_MODIFIERS[audience] || AUDIENCE_MODIFIERS['C-Suite'];

  // Get mode context
  const modeContext = MODE_CONTEXT[presentationMode] || MODE_CONTEXT['live'];

  // Process data
  const processedData = processDataInput(data, dataPoints, context);

  // Build system prompt
  const systemPrompt = buildSystemPrompt(directional, audienceModifier, template);

  // Build user prompt
  const userPrompt = buildUserPrompt({
    slideType,
    context,
    processedData,
    keyTakeaway,
    framework: framework || template.framework,
    directional,
    modeContext,
    template
  });

  // Build options for API call
  const options = {
    jsonMode: true,
    temperature: 0.5, // Lower for more consistent output
    max_tokens: 2000,
    timeout: 30000
  };

  return {
    systemPrompt,
    userPrompt,
    options,
    metadata: {
      slideType,
      audience,
      presentationMode,
      template: template.structure,
      framework: framework || template.framework
    }
  };
}

/**
 * Build system prompt
 * @param {Object} directional - Directional prompt template
 * @param {Object} audienceModifier - Audience-specific modifications
 * @param {Object} template - Selected template
 * @returns {string}
 */
function buildSystemPrompt(directional, audienceModifier, template) {
  return `${directional.role}

YOUR TASK:
Create a ${template.slideType} slide following consulting best practices.

${directional.approach}

AUDIENCE ADAPTATION:
- Tone: ${audienceModifier.tone}
- Focus: ${audienceModifier.focus}
- Depth: ${audienceModifier.depth}
- Language: ${audienceModifier.language}
- Time Context: ${audienceModifier.timeContext}

STRICT RULES:
${directional.rules.map(rule => `- ${rule}`).join('\n')}

OUTPUT FORMAT:
Return ONLY valid JSON in this exact structure:
${JSON.stringify(directional.outputFormat, null, 2)}

ADDITIONAL REQUIREMENTS:
- Title: 5-8 words, action-oriented
- All text: Concise, no filler words
- Numbers: Use consulting format ($XM, +X%, Xpp)
- Tone: Professional, confident, evidence-based`;
}

/**
 * Build user prompt
 * @param {Object} params - Prompt parameters
 * @returns {string}
 */
function buildUserPrompt(params) {
  const {
    slideType,
    context,
    processedData,
    keyTakeaway,
    framework,
    directional,
    modeContext,
    template
  } = params;

  const sections = [
    `SLIDE TYPE: ${slideType}`,
    ``,
    `PRESENTATION CONTEXT:`,
    modeContext,
    ``,
    `FRAMEWORK: ${framework}`,
    ``,
    `STRUCTURAL GUIDANCE:`,
    `- Structure: ${template.structure}`,
    `- Lead with: ${template.structuralHints.leadWith}`,
    `- Include: ${template.structuralHints.supportingElements.join(', ')}`,
    ``,
    `USER CONTEXT:`,
    context,
    ``
  ];

  // Add key takeaway if provided
  if (keyTakeaway) {
    sections.push(
      `KEY TAKEAWAY TO EMPHASIZE:`,
      keyTakeaway,
      ``
    );
  }

  // Add data section
  if (processedData.hasData) {
    sections.push(
      `DATA POINTS TO INCORPORATE:`,
      processedData.formatted,
      ``
    );
  }

  // Add content constraints
  sections.push(
    `CONTENT CONSTRAINTS:`,
    `- Max bullets: ${template.content.maxBullets}`,
    `- Detail level: ${template.content.detailLevel}`,
    `- Text density: ${template.content.textDensity}`,
    `- Tone: ${template.content.tone}`,
    ``,
    `INSTRUCTIONS:`,
    `1. Generate content that follows the JSON structure exactly`,
    `2. Incorporate the provided data points naturally`,
    `3. Lead with the most important insight`,
    `4. Every claim must have supporting data or logic`,
    `5. Return ONLY the JSON object, no markdown or explanation`
  );

  return sections.join('\n');
}

/**
 * Process data input into formatted string
 * @param {any} data - Raw data input
 * @param {Array} dataPoints - Legacy data points
 * @param {string} context - Context for extraction
 * @returns {Object} - { hasData, formatted }
 */
function processDataInput(data, dataPoints, context) {
  const allData = [];

  // Add explicit data points
  if (Array.isArray(dataPoints) && dataPoints.length > 0) {
    allData.push(...dataPoints);
  }

  // Add structured data
  if (data) {
    if (Array.isArray(data)) {
      allData.push(...data.filter(item => typeof item === 'string'));
    } else if (data.headers && data.rows) {
      // CSV-like structure
      allData.push(`Data: ${data.rowCount} rows, ${data.columnCount} columns`);
      allData.push(`Columns: ${data.headers.join(', ')}`);
    } else if (typeof data === 'object') {
      allData.push(...Object.entries(data).map(([k, v]) => `${k}: ${v}`));
    }
  }

  // Extract additional data points from context if sparse
  if (allData.length < 3 && context) {
    const extracted = extractDataPoints(context);
    allData.push(...extracted.slice(0, 10));
  }

  // Deduplicate and format
  const uniqueData = [...new Set(allData)];
  
  if (uniqueData.length === 0) {
    return { hasData: false, formatted: '' };
  }

  return {
    hasData: true,
    formatted: uniqueData.map((dp, i) => `${i + 1}. ${dp}`).join('\n'),
    count: uniqueData.length,
    items: uniqueData
  };
}

/**
 * Build follow-up prompt for refinement
 * @param {Object} originalContent - Original generated content
 * @param {string} refinement - Refinement instruction
 * @returns {Object} - { systemPrompt, userPrompt }
 */
function buildRefinementPrompt(originalContent, refinement) {
  return {
    systemPrompt: `You are refining consulting slide content based on feedback.
Maintain the original structure and JSON format.
Make minimal changes to address the specific refinement request.`,
    userPrompt: `Original content:
${JSON.stringify(originalContent, null, 2)}

Refinement request: ${refinement}

Return the updated content in the same JSON structure.`
  };
}

/**
 * Get prompt statistics for debugging
 * @param {Object} promptResult - Result from buildPrompt
 * @returns {Object} - Statistics
 */
function getPromptStats(promptResult) {
  return {
    systemPromptLength: promptResult.systemPrompt.length,
    userPromptLength: promptResult.userPrompt.length,
    totalTokens: Math.round((promptResult.systemPrompt.length + promptResult.userPrompt.length) / 4),
    metadata: promptResult.metadata
  };
}

module.exports = {
  buildPrompt,
  buildRefinementPrompt,
  getPromptStats,
  DIRECTIONAL_PROMPTS,
  AUDIENCE_MODIFIERS,
  MODE_CONTEXT
};
