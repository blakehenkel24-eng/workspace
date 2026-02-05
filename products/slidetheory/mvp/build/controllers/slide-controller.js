/**
 * Slide Controller
 * Handles slide generation endpoints
 */

const crypto = require('crypto');
const path = require('path');
const config = require('../config');
const { STATUS, ERROR_CODES, MESSAGES, TIME } = require('../config/constants');
const { generateSlideContent } = require('../services/ai-service');
const { renderSlideToImage } = require('../services/slide-service');
const { recordSlideGenerated } = require('../services/analytics-service');
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
  const startTime = Date.now();
  
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
  
  const { slideType, context, dataPoints, targetAudience, framework } = request.toJSON();
  
  logger.info(req, 'Starting slide generation', { slideType, targetAudience });
  
  // Generate content
  const content = await generateSlideContent({
    slideType,
    context,
    dataPoints,
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
  logger.info(req, 'Slide generated successfully', { 
    slideId, 
    durationMs: duration, 
    format: isSVG ? 'SVG' : 'PNG' 
  });
  
  // Record analytics
  await recordSlideGenerated(slideType);
  
  // Schedule cleanup
  scheduleCleanup(actualPath, TIME.SLIDE_EXPIRY_MS);
  
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
  
  res.status(STATUS.OK).json(response.toJSON());
});

module.exports = {
  generateSlide
};
