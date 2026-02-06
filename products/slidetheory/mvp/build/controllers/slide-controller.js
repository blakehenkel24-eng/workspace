/**
 * Slide Controller
 * Handles slide generation endpoints with caching
 */

const crypto = require('crypto');
const path = require('path');
const config = require('../config');
const { STATUS, ERROR_CODES, MESSAGES, TIME } = require('../config/constants');
const { generateSlideContent } = require('../services/ai-service');
const { renderSlideToImage } = require('../services/slide-service');
const { recordSlideGenerated, recordError, recordFunnelStep } = require('../services/enhanced-analytics-service');
const { generateCacheKey, get, set } = require('../services/cache-service');
const { recordGeneration, startTimer, recordCache } = require('../services/performance-monitor');
const { logger } = require('../middleware/logger');
const { AppError, asyncHandler } = require('../middleware/error-handler');
const { scheduleCleanup } = require('../utils/exporter');
const { SlideGenerationRequest, SlideGenerationResponse } = require('../models/slide-model');

const SLIDES_DIR = config.paths.slides;

/**
 * Generate a new slide
 * POST /api/generate
 */
const generateSlide = asyncHandler(async (req, res) => {
  const requestStartTime = Date.now();
  const timer = startTimer('slide_generation');
  
  // Validate request
  const request = new SlideGenerationRequest(req.body);
  const validation = request.validate();
  
  if (!validation.isValid) {
    logger.warn(req, 'Validation failed', { errors: validation.errors });
    return res.status(STATUS.BAD_REQUEST).json({
      success: false,
      error: ERROR_CODES.VALIDATION_ERROR,
      message: 'Invalid input',
      errors: validation.errors
    });
  }
  
  // Support both V1 (targetAudience) and V2 (audience) field names
  const requestData = request.toJSON();
  const slideType = requestData.slideType;
  const context = requestData.context;
  const dataPoints = requestData.dataPoints;
  const targetAudience = requestData.targetAudience || requestData.audience;
  const framework = requestData.framework;
  
  // Generate cache key
  const cacheKey = generateCacheKey(slideType, context, dataPoints, targetAudience, framework);
  
  // Check cache first
  const cachedResult = await get(cacheKey, 'slide');
  
  if (cachedResult) {
    const duration = Date.now() - requestStartTime;
    recordCache(true);
    recordGeneration(duration, true);
    timer.end({ cached: true, duration });
    
    logger.info(req, 'Slide served from cache', { 
      slideId: cachedResult.slideId,
      durationMs: duration
    });
    
    // Add cache header
    res.setHeader('X-Cache', 'HIT');
    res.setHeader('X-Cache-Key', cacheKey.slice(0, 16));
    res.setHeader('X-Response-Time', `${duration}ms`);
    
    return res.status(STATUS.OK).json({
      ...cachedResult,
      cached: true,
      durationMs: duration
    });
  }
  
  // Not cached - generate new slide
  logger.info(req, 'Starting slide generation', { slideType, targetAudience });
  await recordFunnelStep('generation_start', req);
  
  // Generate content
  const contentTimer = startTimer('ai_content_generation');
  const content = await generateSlideContent({
    slideType,
    context,
    dataPoints,
    targetAudience,
    framework
  });
  contentTimer.end({ slideType });
  
  // Generate slide image
  const slideId = crypto.randomUUID();
  const imagePath = path.join(SLIDES_DIR, `${slideId}.png`);
  
  const renderTimer = startTimer('slide_rendering');
  const actualPath = await renderSlideToImage({ slideType, content, outputPath: imagePath });
  renderTimer.end({ format: actualPath.endsWith('.svg') ? 'SVG' : 'PNG' });
  
  const isSVG = actualPath.endsWith('.svg');
  const fileExtension = isSVG ? '.svg' : '.png';
  
  const duration = Date.now() - requestStartTime;
  
  // Build response
  const response = new SlideGenerationResponse({
    slideId,
    imageUrl: `/slides/${slideId}${fileExtension}`,
    title: content.title,
    content,
    expiresAt: new Date(Date.now() + TIME.SLIDE_EXPIRY_MS).toISOString(),
    durationMs: duration,
    format: isSVG ? 'SVG' : 'PNG'
  });
  
  const responseData = response.toJSON();
  
  // Cache the result (without the expiresAt for longer cache)
  const cacheData = {
    ...responseData,
    _cachedAt: Date.now()
  };
  await set(cacheKey, cacheData, 'slide');
  
  recordCache(false);
  recordGeneration(duration, false);
  timer.end({ cached: false, duration });
  
  logger.info(req, 'Slide generated successfully', { 
    slideId, 
    durationMs: duration, 
    format: isSVG ? 'SVG' : 'PNG'
  });
  
  // Record analytics with enhanced tracking
  await recordSlideGenerated(slideType, slideType, framework, duration, false);
  await recordFunnelStep('generation_complete', req);
  
  // Schedule cleanup
  scheduleCleanup(actualPath, TIME.SLIDE_EXPIRY_MS);
  
  // Add performance headers
  res.setHeader('X-Cache', 'MISS');
  res.setHeader('X-Response-Time', `${duration}ms`);
  
  res.status(STATUS.OK).json(responseData);
});

// V2 implementation - normalizes field names before calling shared logic
const generateSlideV2 = asyncHandler(async (req, res) => {
  // Normalize V2 field names to match V1 model expectations
  // V2 uses 'audience', V1 model expects 'targetAudience'
  if (req.body.audience !== undefined && req.body.targetAudience === undefined) {
    req.body.targetAudience = req.body.audience;
  }
  
  // Call the shared implementation
  return generateSlide(req, res);
});

module.exports = {
  generateSlide,
  generateSlideV2
};
