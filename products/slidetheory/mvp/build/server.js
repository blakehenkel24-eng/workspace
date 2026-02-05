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

// ==================== ENDPOINTS ====================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: '1.1.1',
    timestamp: new Date().toISOString(),
    features: {
      aiGeneration: !!process.env.KIMI_API_KEY,
      exports: ['png', 'pptx', 'pdf'],
      slideTypes: VALID_SLIDE_TYPES
    }
  });
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
║     SlideTheory MVP Server v1.1.1              ║
║                                                ║
║     Export Formats: PNG, PPTX, PDF             ║
║     Slide Types: ${VALID_SLIDE_TYPES.length}                           ║
║     AI Status: ${process.env.KIMI_API_KEY ? '✅ Connected' : '⚠️  Fallback Mode'}        ║
║                                                ║
║     http://localhost:${PORT}                       ║
║                                                ║
╚════════════════════════════════════════════════╝
    `);
  });
});

module.exports = app;
