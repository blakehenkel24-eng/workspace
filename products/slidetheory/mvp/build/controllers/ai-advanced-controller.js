/**
 * AI Advanced Controller
 * Handles advanced AI feature endpoints
 */

const {
  suggestTemplates,
  generateDeckFromDocument,
  recommendVisualizations,
  rewriteContent,
  createStoryFlow,
  generateSpeakerNotes,
  anticipateQuestions,
  translateContent,
  generateSpeakerNotesForDeck,
  translateDeck
} = require('../services/ai-advanced');
const { STATUS, ERROR_CODES } = require('../config/constants');
const { logger } = require('../middleware/logger');
const { AppError, asyncHandler } = require('../middleware/error-handler');

/**
 * POST /api/ai/suggest-templates
 * Get smart template suggestions based on content
 */
const suggestTemplatesHandler = asyncHandler(async (req, res) => {
  const { content, purpose, targetAudience } = req.body;
  
  if (!content || typeof content !== 'string') {
    throw new AppError('Content is required and must be a string', STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  if (content.length > 10000) {
    throw new AppError('Content too long (max 10000 characters)', STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  logger.info(req, 'Requesting template suggestions');
  
  const result = await suggestTemplates({
    content,
    purpose,
    targetAudience
  });
  
  res.status(STATUS.OK).json({
    success: true,
    ...result
  });
});

/**
 * POST /api/ai/generate-deck
 * Generate a complete slide deck from document content
 */
const generateDeckHandler = asyncHandler(async (req, res) => {
  const { documentContent, documentType, title, targetAudience, maxSlides } = req.body;
  
  if (!documentContent || typeof documentContent !== 'string') {
    throw new AppError('Document content is required', STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  if (!documentType || !['pdf', 'word', 'text'].includes(documentType)) {
    throw new AppError('Document type must be pdf, word, or text', STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  const slideLimit = Math.min(parseInt(maxSlides) || 10, 20);
  
  logger.info(req, 'Generating deck from document', { documentType, title: title || 'Untitled' });
  
  const result = await generateDeckFromDocument({
    documentContent,
    documentType,
    title,
    targetAudience,
    maxSlides: slideLimit
  });
  
  res.status(STATUS.OK).json({
    success: true,
    ...result
  });
});

/**
 * POST /api/ai/recommend-visualizations
 * Get AI-powered data visualization recommendations
 */
const recommendVisualizationsHandler = asyncHandler(async (req, res) => {
  const { data, dataDescription, insightGoal } = req.body;
  
  if (!data || !Array.isArray(data)) {
    throw new AppError('Data array is required', STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  if (data.length === 0) {
    throw new AppError('Data array cannot be empty', STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  if (data.length > 1000) {
    throw new AppError('Data too large (max 1000 rows)', STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  logger.info(req, 'Requesting visualization recommendations', { dataPoints: data.length });
  
  const result = await recommendVisualizations({
    data,
    dataDescription,
    insightGoal
  });
  
  res.status(STATUS.OK).json({
    success: true,
    dataPoints: data.length,
    ...result
  });
});

/**
 * POST /api/ai/rewrite
 * Rewrite content (shorten, expand, simplify, etc.)
 */
const rewriteContentHandler = asyncHandler(async (req, res) => {
  const { content, style, targetLength } = req.body;
  
  if (!content || typeof content !== 'string') {
    throw new AppError('Content is required', STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  if (content.length > 5000) {
    throw new AppError('Content too long (max 5000 characters)', STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  const validStyles = ['shorten', 'expand', 'simplify', 'executive', 'technical'];
  if (!style || !validStyles.includes(style)) {
    throw new AppError(`Style must be one of: ${validStyles.join(', ')}`, STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  logger.info(req, 'Rewriting content', { style, originalLength: content.length });
  
  const result = await rewriteContent({
    content,
    style,
    targetLength
  });
  
  res.status(STATUS.OK).json({
    success: true,
    ...result
  });
});

/**
 * POST /api/ai/story-flow
 * Create a narrative arc across multiple slides
 */
const createStoryFlowHandler = asyncHandler(async (req, res) => {
  const { topic, objective, slideCount, targetAudience } = req.body;
  
  if (!topic || typeof topic !== 'string') {
    throw new AppError('Topic is required', STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  if (!objective || typeof objective !== 'string') {
    throw new AppError('Objective is required - what should the audience do/think?', STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  const count = Math.min(Math.max(parseInt(slideCount) || 5, 3), 12);
  
  logger.info(req, 'Creating story flow', { topic, slideCount: count });
  
  const result = await createStoryFlow({
    topic,
    objective,
    slideCount: count,
    targetAudience
  });
  
  res.status(STATUS.OK).json({
    success: true,
    ...result
  });
});

/**
 * POST /api/ai/speaker-notes
 * Generate speaker notes for a slide
 */
const generateSpeakerNotesHandler = asyncHandler(async (req, res) => {
  const { slideContent, slideType, duration, audienceLevel } = req.body;
  
  if (!slideContent) {
    throw new AppError('Slide content is required', STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  const validAudienceLevels = ['novice', 'intermediate', 'expert'];
  if (audienceLevel && !validAudienceLevels.includes(audienceLevel)) {
    throw new AppError(`Audience level must be one of: ${validAudienceLevels.join(', ')}`, STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  const durationMinutes = Math.min(Math.max(parseInt(duration) || 2, 1), 10);
  
  logger.info(req, 'Generating speaker notes', { slideType, duration: durationMinutes });
  
  const result = await generateSpeakerNotes({
    slideContent,
    slideType: slideType || 'Executive Summary',
    duration: durationMinutes,
    audienceLevel: audienceLevel || 'intermediate'
  });
  
  res.status(STATUS.OK).json({
    success: true,
    ...result
  });
});

/**
 * POST /api/ai/speaker-notes/deck
 * Generate speaker notes for an entire deck
 */
const generateSpeakerNotesForDeckHandler = asyncHandler(async (req, res) => {
  const { slides, durationPerSlide, audienceLevel } = req.body;
  
  if (!slides || !Array.isArray(slides)) {
    throw new AppError('Slides array is required', STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  if (slides.length === 0 || slides.length > 50) {
    throw new AppError('Slides must be between 1 and 50', STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  logger.info(req, 'Generating speaker notes for deck', { slideCount: slides.length });
  
  const result = await generateSpeakerNotesForDeck(slides, {
    durationPerSlide,
    audienceLevel
  });
  
  res.status(STATUS.OK).json({
    success: true,
    ...result
  });
});

/**
 * POST /api/ai/anticipate-questions
 * Anticipate Q&A questions based on content
 */
const anticipateQuestionsHandler = asyncHandler(async (req, res) => {
  const { content, targetAudience, purpose } = req.body;
  
  if (!content) {
    throw new AppError('Content is required', STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  const contentStr = typeof content === 'object' 
    ? JSON.stringify(content)
    : content;
    
  if (contentStr.length > 10000) {
    throw new AppError('Content too long (max 10000 characters)', STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  logger.info(req, 'Anticipating questions');
  
  const result = await anticipateQuestions({
    content,
    targetAudience,
    purpose
  });
  
  res.status(STATUS.OK).json({
    success: true,
    ...result
  });
});

/**
 * POST /api/ai/translate
 * Translate content to another language
 */
const translateContentHandler = asyncHandler(async (req, res) => {
  const { content, targetLanguage, sourceLanguage, preserveFormatting } = req.body;
  
  if (!content) {
    throw new AppError('Content is required', STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  if (!targetLanguage || typeof targetLanguage !== 'string') {
    throw new AppError('Target language is required', STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  const contentStr = typeof content === 'object' 
    ? JSON.stringify(content)
    : content;
    
  if (contentStr.length > 5000) {
    throw new AppError('Content too long (max 5000 characters)', STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  logger.info(req, 'Translating content', { targetLanguage, sourceLanguage: sourceLanguage || 'auto' });
  
  const result = await translateContent({
    content,
    targetLanguage,
    sourceLanguage,
    preserveFormatting: preserveFormatting !== false
  });
  
  res.status(STATUS.OK).json({
    success: true,
    ...result
  });
});

/**
 * POST /api/ai/translate/deck
 * Translate an entire slide deck
 */
const translateDeckHandler = asyncHandler(async (req, res) => {
  const { slides, targetLanguage, sourceLanguage, preserveFormatting } = req.body;
  
  if (!slides || !Array.isArray(slides)) {
    throw new AppError('Slides array is required', STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  if (slides.length === 0 || slides.length > 30) {
    throw new AppError('Slides must be between 1 and 30', STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  if (!targetLanguage) {
    throw new AppError('Target language is required', STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  
  logger.info(req, 'Translating deck', { slideCount: slides.length, targetLanguage });
  
  const result = await translateDeck(slides, targetLanguage, {
    sourceLanguage,
    preserveFormatting
  });
  
  res.status(STATUS.OK).json({
    success: true,
    ...result
  });
});

/**
 * GET /api/ai/advanced/features
 * List available advanced AI features
 */
const listFeatures = asyncHandler(async (req, res) => {
  const features = [
    {
      id: 'suggest-templates',
      name: 'Smart Template Suggestions',
      description: 'AI analyzes your content and suggests optimal slide templates',
      endpoint: 'POST /api/ai/suggest-templates',
      parameters: ['content', 'purpose', 'targetAudience']
    },
    {
      id: 'generate-deck',
      name: 'Document to Deck',
      description: 'Auto-generate complete slide decks from PDF, Word, or text documents',
      endpoint: 'POST /api/ai/generate-deck',
      parameters: ['documentContent', 'documentType', 'title', 'targetAudience', 'maxSlides']
    },
    {
      id: 'recommend-visualizations',
      name: 'Data Visualization Recommendations',
      description: 'AI-powered chart and visualization recommendations based on your data',
      endpoint: 'POST /api/ai/recommend-visualizations',
      parameters: ['data', 'dataDescription', 'insightGoal']
    },
    {
      id: 'rewrite',
      name: 'Content Rewriting',
      description: 'Rewrite content to shorten, expand, simplify, or adapt tone',
      endpoint: 'POST /api/ai/rewrite',
      parameters: ['content', 'style', 'targetLength']
    },
    {
      id: 'story-flow',
      name: 'Story Flow Generator',
      description: 'Create narrative arcs across multiple slides with proper pacing',
      endpoint: 'POST /api/ai/story-flow',
      parameters: ['topic', 'objective', 'slideCount', 'targetAudience']
    },
    {
      id: 'speaker-notes',
      name: 'Speaker Notes Generator',
      description: 'Generate detailed speaker notes for confident presentation delivery',
      endpoint: 'POST /api/ai/speaker-notes',
      parameters: ['slideContent', 'slideType', 'duration', 'audienceLevel']
    },
    {
      id: 'anticipate-questions',
      name: 'Q&A Anticipation',
      description: 'Predict questions your audience might ask with suggested answers',
      endpoint: 'POST /api/ai/anticipate-questions',
      parameters: ['content', 'targetAudience', 'purpose']
    },
    {
      id: 'translate',
      name: 'Content Translation',
      description: 'Translate slide content to other languages while preserving formatting',
      endpoint: 'POST /api/ai/translate',
      parameters: ['content', 'targetLanguage', 'sourceLanguage', 'preserveFormatting']
    }
  ];
  
  res.status(STATUS.OK).json({
    success: true,
    features,
    totalFeatures: features.length
  });
});

module.exports = {
  suggestTemplates: suggestTemplatesHandler,
  generateDeck: generateDeckHandler,
  recommendVisualizations: recommendVisualizationsHandler,
  rewriteContent: rewriteContentHandler,
  createStoryFlow: createStoryFlowHandler,
  generateSpeakerNotes: generateSpeakerNotesHandler,
  generateSpeakerNotesForDeck: generateSpeakerNotesForDeckHandler,
  anticipateQuestions: anticipateQuestionsHandler,
  translateContent: translateContentHandler,
  translateDeck: translateDeckHandler,
  listFeatures
};
