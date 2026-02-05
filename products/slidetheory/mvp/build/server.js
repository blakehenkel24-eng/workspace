/**
 * SlideTheory MVP - Express Server v1.1.1 (Polished)
 * Production-ready with enhanced error handling and logging
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

const { generateSlideContent } = require('./lib/openai-client');
const { renderSlideToImage } = require('./lib/slide-generator');
const { generatePPTX, generatePDF } = require('./lib/export-generator');

// V2 AI Generation Pipeline
const { generateSlideV2 } = require('./lib/slide-generator-v2');
const { validateSlideInputs } = require('./lib/validators');
const { selectTemplate } = require('./lib/template-selector');
const { buildPrompt } = require('./lib/prompt-builder');

const app = express();
const PORT = process.env.PORT || 3000;
const ANALYTICS_FILE = process.env.ANALYTICS_FILE || path.join(__dirname, 'tmp', 'analytics.json');

// Valid slide types
const VALID_SLIDE_TYPES = [
  'Executive Summary',
  'Market Analysis', 
  'Financial Model',
  'Competitive Analysis',
  'Growth Strategy',
  'Risk Assessment'
];

// V2 Slide Types (MBB-inspired)
const V2_SLIDE_TYPES = [
  'Executive Summary',
  'Horizontal Flow',
  'Vertical Flow', 
  'Graph/Chart',
  'General'
];

// V2 Audiences
const V2_AUDIENCES = [
  'C-Suite/Board',
  'External Client', 
  'Internal/Working Team',
  'PE/Investors'
];

// Knowledge Base Path
const KB_PATH = path.join(__dirname, 'knowledge-base', 'templates');

// Request ID middleware
app.use((req, res, next) => {
  req.id = crypto.randomUUID().slice(0, 8);
  next();
});

// Logger utility
const logger = {
  info: (req, message, meta = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      requestId: req?.id,
      message,
      ...meta
    }));
  },
  error: (req, message, error, meta = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      requestId: req?.id,
      message,
      error: error?.message || error,
      stack: error?.stack?.split('\n')[0],
      ...meta
    }));
  },
  warn: (req, message, meta = {}) => {
    console.warn(JSON.stringify({
      level: 'warn',
      timestamp: new Date().toISOString(),
      requestId: req?.id,
      message,
      ...meta
    }));
  }
};

// Middleware
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Ensure directories exist
const SLIDES_DIR = path.join(__dirname, 'tmp', 'slides');
const EXPORTS_DIR = path.join(__dirname, 'tmp', 'exports');

async function initializeDirectories() {
  try {
    await fs.mkdir(SLIDES_DIR, { recursive: true });
    await fs.mkdir(EXPORTS_DIR, { recursive: true });
    await fs.mkdir(path.dirname(ANALYTICS_FILE), { recursive: true });
    logger.info(null, 'Directories initialized');
  } catch (err) {
    logger.error(null, 'Failed to create directories', err);
    process.exit(1);
  }
}

// ==================== ANALYTICS ====================

async function loadAnalytics() {
  try {
    const data = await fs.readFile(ANALYTICS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return {
      totalSlides: 0,
      byType: VALID_SLIDE_TYPES.reduce((acc, type) => ({ ...acc, [type]: 0 }), {}),
      byDay: {},
      lastGenerated: null,
      createdAt: new Date().toISOString()
    };
  }
}

async function saveAnalytics(analytics) {
  try {
    await fs.writeFile(ANALYTICS_FILE, JSON.stringify(analytics, null, 2));
  } catch (err) {
    logger.error(null, 'Failed to save analytics', err);
  }
}

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
    logger.error(null, 'Analytics recording failed', err);
  }
}

// ==================== VALIDATION ====================

function validateGenerateRequest(body) {
  const { slideType, context, targetAudience } = body;
  const errors = [];

  if (!slideType) {
    errors.push({ field: 'slideType', message: 'Slide type is required' });
  } else if (!VALID_SLIDE_TYPES.includes(slideType)) {
    errors.push({ 
      field: 'slideType', 
      message: `Invalid slide type. Must be one of: ${VALID_SLIDE_TYPES.join(', ')}`
    });
  }

  if (!context) {
    errors.push({ field: 'context', message: 'Context is required' });
  } else if (typeof context !== 'string') {
    errors.push({ field: 'context', message: 'Context must be a string' });
  } else if (context.length < 10) {
    errors.push({ field: 'context', message: 'Context must be at least 10 characters' });
  } else if (context.length > 2000) {
    errors.push({ field: 'context', message: 'Context must be less than 2000 characters' });
  }

  if (!targetAudience) {
    errors.push({ field: 'targetAudience', message: 'Target audience is required' });
  } else if (typeof targetAudience !== 'string') {
    errors.push({ field: 'targetAudience', message: 'Target audience must be a string' });
  }

  return errors;
}

// ==================== V2 VALIDATION & UTILITIES ====================

function validateV2Request(body) {
  const { slideType, context, audience, keyTakeaway } = body;
  const errors = [];

  if (!slideType) {
    errors.push({ field: 'slideType', message: 'Slide type is required' });
  } else if (!V2_SLIDE_TYPES.includes(slideType)) {
    errors.push({ 
      field: 'slideType', 
      message: `Invalid slide type. Must be one of: ${V2_SLIDE_TYPES.join(', ')}`
    });
  }

  if (!context) {
    errors.push({ field: 'context', message: 'Context is required' });
  } else if (typeof context !== 'string') {
    errors.push({ field: 'context', message: 'Context must be a string' });
  } else if (context.length < 10) {
    errors.push({ field: 'context', message: 'Context must be at least 10 characters' });
  } else if (context.length > 5000) {
    errors.push({ field: 'context', message: 'Context must be less than 5000 characters' });
  }

  if (!audience) {
    errors.push({ field: 'audience', message: 'Audience is required' });
  } else if (!V2_AUDIENCES.includes(audience)) {
    errors.push({ 
      field: 'audience', 
      message: `Invalid audience. Must be one of: ${V2_AUDIENCES.join(', ')}`
    });
  }

  if (!keyTakeaway) {
    errors.push({ field: 'keyTakeaway', message: 'Key takeaway is required' });
  } else if (typeof keyTakeaway !== 'string') {
    errors.push({ field: 'keyTakeaway', message: 'Key takeaway must be a string' });
  } else if (keyTakeaway.length < 5) {
    errors.push({ field: 'keyTakeaway', message: 'Key takeaway must be at least 5 characters' });
  }

  return errors;
}

async function loadTemplate(templateId) {
  try {
    const templatePath = path.join(KB_PATH, `${templateId}.json`);
    const data = await fs.readFile(templatePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    logger.error(null, `Failed to load template: ${templateId}`, error);
    return null;
  }
}

function getAudienceConfig(template, audience) {
  const audienceKey = audience.toLowerCase().replace(/[^a-z]/g, '-');
  return template?.audienceAdaptations?.[audienceKey] || {};
}

function getPresentationModeConfig(template, mode) {
  const modeKey = mode === 'presentation' ? 'presentation' : 'read';
  return template?.presentationMode?.[modeKey] || {};
}

// ==================== ENDPOINTS ====================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    features: {
      aiGeneration: !!process.env.KIMI_API_KEY,
      exports: ['png', 'pptx', 'pdf'],
      slideTypes: VALID_SLIDE_TYPES,
      v2SlideTypes: V2_SLIDE_TYPES,
      v2Enabled: true
    }
  });
});

// ==================== V2 KNOWLEDGE BASE ENDPOINTS ====================

app.get('/api/v2/templates', async (req, res) => {
  try {
    const templates = [];
    for (const type of V2_SLIDE_TYPES) {
      const templateId = type.toLowerCase().replace(/[^a-z]/g, '-');
      const template = await loadTemplate(templateId);
      if (template) {
        templates.push({
          id: template.id,
          name: template.name,
          description: template.description
        });
      }
    }
    res.json({ success: true, templates });
  } catch (error) {
    logger.error(req, 'Failed to load v2 templates', error);
    res.status(500).json({ success: false, error: 'Failed to load templates' });
  }
});

app.get('/api/v2/templates/:id', async (req, res) => {
  try {
    const template = await loadTemplate(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    res.json({ success: true, template });
  } catch (error) {
    logger.error(req, 'Failed to load template', error);
    res.status(500).json({ success: false, error: 'Failed to load template' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const analytics = await loadAnalytics();
    logger.info(req, 'Stats retrieved');
    res.json({ success: true, ...analytics });
  } catch (error) {
    logger.error(req, 'Stats retrieval failed', error);
    res.status(500).json({
      success: false,
      error: 'STATS_ERROR',
      message: 'Failed to load analytics. Please try again.'
    });
  }
});

app.get('/api/templates', async (req, res) => {
  try {
    const templatesPath = path.join(__dirname, 'public', 'templates', 'index.json');
    const data = await fs.readFile(templatesPath, 'utf-8');
    const templates = JSON.parse(data);
    logger.info(req, 'Templates retrieved', { count: templates.length });
    res.json({ success: true, templates });
  } catch (error) {
    logger.error(req, 'Templates retrieval failed', error);
    res.status(500).json({
      success: false,
      error: 'TEMPLATES_ERROR',
      message: 'Failed to load templates. Please refresh the page.'
    });
  }
});

app.get('/api/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const templatePath = path.join(__dirname, 'public', 'templates', `${id}.json`);
    
    const resolvedPath = path.resolve(templatePath);
    const templatesDir = path.resolve(path.join(__dirname, 'public', 'templates'));
    if (!resolvedPath.startsWith(templatesDir)) {
      return res.status(403).json({ success: false, error: 'FORBIDDEN' });
    }
    
    const data = await fs.readFile(templatePath, 'utf-8');
    const template = JSON.parse(data);
    logger.info(req, 'Template retrieved', { id });
    res.json({ success: true, template });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Template not found'
      });
    }
    logger.error(req, 'Template retrieval failed', error);
    res.status(500).json({
      success: false,
      error: 'TEMPLATE_ERROR',
      message: 'Failed to load template'
    });
  }
});

app.post('/api/generate', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const validationErrors = validateGenerateRequest(req.body);
    if (validationErrors.length > 0) {
      logger.warn(req, 'Validation failed', { errors: validationErrors });
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid input',
        errors: validationErrors
      });
    }

    const { slideType, context, dataPoints, targetAudience, framework } = req.body;
    
    logger.info(req, 'Starting slide generation', { slideType, targetAudience });
    
    // Generate content
    const content = await generateSlideContent({
      slideType,
      context,
      dataPoints: dataPoints || [],
      targetAudience,
      framework
    });
    
    // Generate slide image
    const slideId = crypto.randomUUID();
    const imagePath = path.join(SLIDES_DIR, `${slideId}.png`);
    
    const actualPath = await renderSlideToImage({ slideType, content, outputPath: imagePath });
    const isSVG = actualPath.endsWith('.svg');
    const fileExtension = isSVG ? '.svg' : '.png';
    
    const duration = Date.now() - startTime;
    logger.info(req, 'Slide generated successfully', { slideId, durationMs: duration, format: isSVG ? 'SVG' : 'PNG' });
    
    // Record analytics
    await recordSlideGenerated(slideType);
    
    // Schedule cleanup
    setTimeout(async () => {
      try {
        await fs.unlink(actualPath);
        logger.info(null, 'Slide cleaned up', { slideId });
      } catch (err) {
        // Ignore cleanup errors
      }
    }, 24 * 60 * 60 * 1000);
    
    res.json({
      success: true,
      slideId,
      imageUrl: `/slides/${slideId}${fileExtension}`,
      title: content.title,
      content,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(req, 'Generation failed', error, { durationMs: duration });
    
    // User-friendly error messages
    let message = 'Failed to generate slide. Please try again.';
    if (error.message?.includes('API key')) {
      message = 'AI service not configured. Please check your KIMI_API_KEY.';
    } else if (error.message?.includes('timeout')) {
      message = 'Generation timed out. Please try with a shorter context.';
    } else if (error.message?.includes('rate limit')) {
      message = 'Too many requests. Please wait a moment and try again.';
    }
    
    res.status(500).json({
      success: false,
      error: 'GENERATION_FAILED',
      message,
      suggestion: 'Try simplifying your input or refreshing the page.'
    });
  }
});

// ==================== V2 GENERATION ENDPOINT ====================

app.post('/api/generate-slide-v2', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const validationErrors = validateV2Request(req.body);
    if (validationErrors.length > 0) {
      logger.warn(req, 'V2 validation failed', { errors: validationErrors });
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid input',
        errors: validationErrors
      });
    }

    const { 
      slideType, 
      audience, 
      context, 
      presentationMode = 'read',
      dataInput = '',
      keyTakeaway 
    } = req.body;
    
    logger.info(req, 'Starting v2 slide generation', { slideType, audience, presentationMode });
    
    // 1. Load the appropriate template
    const templateId = slideType.toLowerCase().replace(/[^a-z]/g, '-');
    const template = await loadTemplate(templateId);
    
    if (!template) {
      return res.status(500).json({
        success: false,
        error: 'TEMPLATE_ERROR',
        message: 'Failed to load slide template'
      });
    }
    
    // 2. Get audience and presentation mode configurations
    const audienceConfig = getAudienceConfig(template, audience);
    const modeConfig = getPresentationModeConfig(template, presentationMode);
    
    // 3. Parse data input if provided
    const parsedData = parseDataInput(dataInput);
    
    // 4. Generate content using Kimi with structure-aware prompting
    const content = await generateV2SlideContent({
      slideType,
      template,
      audience,
      context,
      keyTakeaway,
      dataInput: parsedData,
      presentationMode,
      audienceConfig,
      modeConfig
    });
    
    // 5. Generate slide HTML using template structure
    const slideId = crypto.randomUUID();
    const html = buildV2SlideHTML({
      template,
      content,
      audienceConfig,
      modeConfig
    });
    
    // 6. Render to image
    const imagePath = path.join(SLIDES_DIR, `${slideId}.png`);
    const actualPath = await renderSlideToImage({ 
      slideType: 'Executive Summary', // Use existing renderer
      content: { ...content, html },
      outputPath: imagePath 
    });
    
    const isSVG = actualPath.endsWith('.svg');
    const fileExtension = isSVG ? '.svg' : '.png';
    
    const duration = Date.now() - startTime;
    logger.info(req, 'V2 slide generated successfully', { slideId, durationMs: duration });
    
    // 7. Record analytics
    await recordSlideGenerated(slideType);
    
    // 8. Schedule cleanup
    setTimeout(async () => {
      try { await fs.unlink(actualPath); } catch (err) {}
    }, 24 * 60 * 60 * 1000);
    
    res.json({
      success: true,
      slideId,
      imageUrl: `/slides/${slideId}${fileExtension}`,
      title: content.title,
      content,
      metadata: {
        template: template.id,
        audience,
        presentationMode,
        generatedAt: new Date().toISOString()
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(req, 'V2 generation failed', error, { durationMs: duration });
    
    let message = 'Failed to generate slide. Please try again.';
    if (error.message?.includes('API key')) {
      message = 'AI service not configured. Please check your KIMI_API_KEY.';
    } else if (error.message?.includes('timeout')) {
      message = 'Generation timed out. Please try with a shorter context.';
    }
    
    res.status(500).json({
      success: false,
      error: 'GENERATION_FAILED',
      message,
      suggestion: 'Try simplifying your input or refreshing the page.'
    });
  }
});

function parseDataInput(dataInput) {
  if (!dataInput || typeof dataInput !== 'string') return [];
  
  const lines = dataInput.split(/\n/).map(l => l.trim()).filter(l => l.length > 0);
  const data = [];
  
  for (const line of lines) {
    // Try to parse key: value pairs
    const match = line.match(/^(.+?)[:\t]+(.+)$/);
    if (match) {
      data.push({ key: match[1].trim(), value: match[2].trim() });
    } else {
      data.push({ value: line });
    }
  }
  
  return data;
}

async function generateV2SlideContent({ slideType, template, audience, context, keyTakeaway, dataInput, presentationMode, audienceConfig, modeConfig }) {
  const apiKey = process.env.KIMI_API_KEY;
  
  if (!apiKey) {
    console.log('[V2] No API key, using fallback content');
    return generateV2FallbackContent(slideType, context, keyTakeaway, dataInput, template);
  }
  
  const templateDescription = template.structure ? 
    `Structure: ${JSON.stringify(template.structure.zones?.map(z => z.id) || [])}` : 
    'Standard consulting slide';
  
  const systemPrompt = `You are an expert McKinsey/BCG/Bain strategy consultant creating executive presentation slides.

TEMPLATE STRUCTURE:
${templateDescription}

AUDIENCE: ${audience}
${audienceConfig.titleMaxWords ? `- Title max ${audienceConfig.titleMaxWords} words` : ''}
${audienceConfig.bulletMaxLength ? `- Bullet max ${audienceConfig.bulletMaxLength} characters` : ''}
${audienceConfig.whitespaceRatio ? `- Design for ${Math.round(audienceConfig.whitespaceRatio * 100)}% whitespace` : ''}

PRESENTATION MODE: ${presentationMode}
${modeConfig.detailLevel ? `- Detail level: ${modeConfig.detailLevel}` : ''}
${modeConfig.maxPoints ? `- Max ${modeConfig.maxPoints} main points` : ''}

RULES:
- Output ONLY valid JSON
- Be concise, action-oriented
- Use consulting format: $XM, +X%, Xpp
- No filler words, no hedging
- Tailor depth for ${audience}
- Key takeaway must be prominent`;

  const dataText = dataInput?.length > 0 
    ? `DATA POINTS:\n${dataInput.map(d => d.key ? `${d.key}: ${d.value}` : d.value).join('\n')}` 
    : 'No specific data provided - generate appropriate metrics.';

  const userPrompt = `Create a ${slideType} slide with:

KEY TAKEAWAY: ${keyTakeaway}

CONTEXT:
${context}

${dataText}

Generate slide content as JSON matching this structure:
{
  "title": "Action headline (5-8 words)",
  "subtitle": "Optional supporting insight",
  "mainContent": [...],
  "supportingPoints": [...],
  "metrics": [...],
  "recommendation": "Clear action statement"
}

Only return valid JSON. No markdown, no explanation.`;

  try {
    console.log(`[V2] Generating ${slideType} for ${audience}`);
    const startTime = Date.now();
    
    const KIMI_API_BASE = 'https://api.moonshot.cn/v1';
    const DEFAULT_MODEL = process.env.KIMI_MODEL || 'kimi-coding/k2p5';
    
    const response = await fetch(`${KIMI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.6,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Kimi API error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    const duration = Date.now() - startTime;
    console.log(`[V2] Generated in ${duration}ms`);
    
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response');
      }
    }
    
    parsedContent._slideType = slideType;
    parsedContent._template = template.id;
    
    return parsedContent;
    
  } catch (error) {
    console.error('[V2] Generation error:', error.message);
    return generateV2FallbackContent(slideType, context, keyTakeaway, dataInput, template);
  }
}

function generateV2FallbackContent(slideType, context, keyTakeaway, dataInput, template) {
  const today = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  
  const fallbacks = {
    'Executive Summary': () => ({
      title: keyTakeaway,
      subtitle: 'Strategic Recommendations',
      mainContent: [
        { heading: 'Market Position', text: context?.substring(0, 100) + '...' || 'Strong market position with growth opportunities' },
        { heading: 'Key Drivers', text: 'Operational excellence and customer focus drive sustainable advantage' },
        { heading: 'Strategic Priority', text: 'Accelerate execution to capture market opportunities' }
      ],
      recommendation: 'Invest in growth initiatives while optimizing operations for maximum value creation.',
      footer: { source: 'Internal analysis', date: today }
    }),
    'Horizontal Flow': () => ({
      title: keyTakeaway,
      steps: [
        { number: 1, label: 'Phase 1', title: 'Discovery', description: 'Assess current state and opportunities' },
        { number: 2, label: 'Phase 2', title: 'Analysis', description: 'Deep dive into key findings' },
        { number: 3, label: 'Phase 3', title: 'Solution', description: 'Develop recommendations' },
        { number: 4, label: 'Phase 4', title: 'Implementation', description: 'Execute with excellence' }
      ],
      footer: { source: 'Process framework', date: today }
    }),
    'Vertical Flow': () => ({
      title: keyTakeaway,
      levels: [
        { level: 1, title: 'Strategic Objective', description: keyTakeaway },
        { level: 2, title: 'Key Initiatives', description: 'Three core programs to drive outcomes' },
        { level: 3, title: 'Tactical Actions', description: 'Specific workstreams and deliverables' },
        { level: 4, title: 'Execution Metrics', description: 'KPIs to track progress' }
      ],
      footer: { source: 'Strategic framework', date: today }
    }),
    'Graph/Chart': () => ({
      title: keyTakeaway,
      chartType: 'bar',
      chartData: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        values: [25, 40, 35, 55]
      },
      insights: [
        'Strong Q4 performance driven by strategic initiatives',
        'Consistent growth trajectory across all quarters',
        'Market conditions favorable for continued expansion'
      ],
      footer: { source: 'Performance data', date: today }
    }),
    'General': () => ({
      title: keyTakeaway,
      blocks: [
        { type: 'text', heading: 'Overview', content: context?.substring(0, 120) || 'Strategic assessment completed' },
        { type: 'highlight', heading: 'Key Finding', content: 'Significant opportunity for value creation identified' },
        { type: 'metric', label: 'Impact', value: '+25%', change: 'projected' }
      ],
      footer: { source: 'Analysis', date: today }
    })
  };
  
  const generator = fallbacks[slideType] || fallbacks['General'];
  return generator();
}

function buildV2SlideHTML({ template, content, audienceConfig, modeConfig }) {
  // Use the slide-generator's buildSlideHTML for now
  // This creates an Executive Summary style slide that works for all v2 types
  const { buildSlideHTML } = require('./lib/slide-generator');
  
  // Map v2 types to v1 types for rendering
  const typeMapping = {
    'Executive Summary': 'Executive Summary',
    'Horizontal Flow': 'Growth Strategy',
    'Vertical Flow': 'Growth Strategy',
    'Graph/Chart': 'Market Analysis',
    'General': 'Executive Summary'
  };
  
  // Adapt content structure to match what the renderer expects
  const adaptedContent = {
    ...content,
    title: content.title || 'Untitled Slide',
    subtitle: content.subtitle || '',
    keyPoints: content.mainContent || content.supportingPoints || content.blocks || [],
    recommendation: content.recommendation || '',
    footer: content.footer || { source: 'SlideTheory', date: new Date().toLocaleDateString() }
  };
  
  return buildSlideHTML(typeMapping[content._slideType] || 'Executive Summary', adaptedContent);
}

app.post('/api/export/pptx', async (req, res) => {
  try {
    const { slideType, content } = req.body;
    
    if (!slideType || !content) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'slideType and content are required'
      });
    }
    
    logger.info(req, 'Starting PPTX export');
    const exportId = crypto.randomUUID();
    const outputPath = path.join(EXPORTS_DIR, `${exportId}.pptx`);
    
    await generatePPTX({ slideType, content, outputPath });
    
    setTimeout(async () => {
      try { await fs.unlink(outputPath); } catch (err) {}
    }, 60 * 60 * 1000);
    
    logger.info(req, 'PPTX export complete', { exportId });
    
    res.json({
      success: true,
      exportId,
      downloadUrl: `/exports/${exportId}.pptx`,
      format: 'pptx',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    });
    
  } catch (error) {
    logger.error(req, 'PPTX export failed', error);
    res.status(500).json({
      success: false,
      error: 'EXPORT_FAILED',
      message: 'Failed to generate PowerPoint. Please try again.'
    });
  }
});

app.post('/api/export/pdf', async (req, res) => {
  try {
    const { slideType, content } = req.body;
    
    if (!slideType || !content) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'slideType and content are required'
      });
    }
    
    logger.info(req, 'Starting PDF export');
    const exportId = crypto.randomUUID();
    const outputPath = path.join(EXPORTS_DIR, `${exportId}.pdf`);
    
    await generatePDF({ slideType, content, outputPath });
    
    setTimeout(async () => {
      try { await fs.unlink(outputPath); } catch (err) {}
    }, 60 * 60 * 1000);
    
    logger.info(req, 'PDF export complete', { exportId });
    
    res.json({
      success: true,
      exportId,
      downloadUrl: `/exports/${exportId}.pdf`,
      format: 'pdf',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    });
    
  } catch (error) {
    logger.error(req, 'PDF export failed', error);
    res.status(500).json({
      success: false,
      error: 'EXPORT_FAILED',
      message: 'Failed to generate PDF. Please try again.'
    });
  }
});

// Serve generated slides (PNG or SVG)
app.get('/slides/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(SLIDES_DIR, filename);
    
    const resolvedPath = path.resolve(filePath);
    const resolvedSlidesDir = path.resolve(SLIDES_DIR);
    
    if (!resolvedPath.startsWith(resolvedSlidesDir)) {
      return res.status(403).send('Forbidden');
    }
    
    try {
      await fs.access(resolvedPath);
    } catch (err) {
      return res.status(404).json({ 
        error: 'SLIDE_NOT_FOUND',
        message: 'Slide not found or has expired (slides are stored for 24 hours)'
      });
    }
    
    // Set correct content type
    if (filename.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
    
    res.sendFile(resolvedPath);
  } catch (error) {
    logger.error(req, 'Slide retrieval failed', error);
    res.status(500).send('Server error');
  }
});

// Serve exports
app.get('/exports/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(EXPORTS_DIR, filename);
    
    const resolvedPath = path.resolve(filePath);
    const resolvedExportsDir = path.resolve(EXPORTS_DIR);
    
    if (!resolvedPath.startsWith(resolvedExportsDir)) {
      return res.status(403).send('Forbidden');
    }
    
    try {
      await fs.access(resolvedPath);
    } catch (err) {
      return res.status(404).json({
        error: 'EXPORT_NOT_FOUND',
        message: 'Export not found or has expired (exports are stored for 1 hour)'
      });
    }
    
    res.sendFile(resolvedPath);
  } catch (error) {
    logger.error(req, 'Export retrieval failed', error);
    res.status(500).send('Server error');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(req, 'Unhandled error', err);
  res.status(500).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred. Please refresh and try again.'
  });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: 'Endpoint not found. Check the API documentation.'
  });
});

// Start server
initializeDirectories().then(() => {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║                                                ║
║     SlideTheory v2.0 - MBB Edition             ║
║                                                ║
║     Export Formats: PNG, PPTX, PDF             ║
║     V1 Slide Types: ${VALID_SLIDE_TYPES.length}                       ║
║     V2 Slide Types: ${V2_SLIDE_TYPES.length} (MBB Templates)          ║
║     AI Status: ${process.env.KIMI_API_KEY ? '✅ Connected' : '⚠️  Fallback Mode'}        ║
║                                                ║
║     http://localhost:${PORT}                       ║
║                                                ║
╚════════════════════════════════════════════════╝
    `);
  });
});

module.exports = app;
