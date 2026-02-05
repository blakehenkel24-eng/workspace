/**
 * Export Controller - Professional Edition
 * Handles export generation endpoints with enhanced options
 */

const crypto = require('crypto');
const path = require('path');
const config = require('../config');
const { STATUS, ERROR_CODES, MESSAGES, TIME } = require('../config/constants');
const { 
  generatePPTX, 
  generatePDF, 
  generatePNG,
  batchExport,
  getExportHistory,
  getExportHistoryList,
  clearExportHistory,
  ASPECT_RATIOS,
  QUALITY_SETTINGS
} = require('../services/export-service');
const { recordExport, recordFunnelStep } = require('../services/enhanced-analytics-service');
const { logger } = require('../middleware/logger');
const { AppError, asyncHandler } = require('../middleware/error-handler');
const { scheduleCleanup, buildDownloadUrl, calculateExpiry } = require('../utils/exporter');
const { ExportRequest } = require('../models/slide-model');

const EXPORTS_DIR = config.paths.exports;

/**
 * Validate export options
 */
function validateExportOptions(options) {
  const errors = [];
  
  if (options.aspectRatio && !ASPECT_RATIOS[options.aspectRatio]) {
    errors.push(`Invalid aspect ratio. Must be one of: ${Object.keys(ASPECT_RATIOS).join(', ')}`);
  }
  
  if (options.quality && !QUALITY_SETTINGS[options.quality]) {
    errors.push(`Invalid quality. Must be one of: ${Object.keys(QUALITY_SETTINGS).join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Export to PowerPoint
 * POST /api/export/pptx
 */
const exportPPTX = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const request = new ExportRequest({ ...req.body, format: 'pptx' });
  const validation = request.validate();
  
  if (!validation.isValid) {
    return res.status(STATUS.BAD_REQUEST).json({
      success: false,
      error: ERROR_CODES.INVALID_INPUT,
      message: 'slideType and content are required',
      details: validation.errors
    });
  }
  
  const { slideType, content, options = {} } = req.body;
  
  const optionValidation = validateExportOptions(options);
  if (!optionValidation.isValid) {
    return res.status(STATUS.BAD_REQUEST).json({
      success: false,
      error: ERROR_CODES.INVALID_INPUT,
      message: 'Invalid export options',
      details: optionValidation.errors
    });
  }
  
  logger.info(req, 'Starting PPTX export', { slideType, options });
  await recordFunnelStep('export_start', req);
  
  const exportId = crypto.randomUUID();
  const outputPath = path.join(EXPORTS_DIR, `${exportId}.pptx`);
  
  await generatePPTX({ 
    slideType, 
    content, 
    outputPath,
    options
  });
  
  const duration = Date.now() - startTime;
  await recordExport('pptx', duration, true);
  await recordFunnelStep('export_complete', req);
  scheduleCleanup(outputPath, TIME.EXPORT_EXPIRY_MS);
  
  logger.info(req, 'PPTX export complete', { exportId });
  
  res.status(STATUS.OK).json({
    success: true,
    exportId,
    downloadUrl: buildDownloadUrl(exportId, 'pptx'),
    format: 'pptx',
    expiresAt: calculateExpiry(TIME.EXPORT_EXPIRY_MS),
    options: {
      aspectRatio: options.aspectRatio || '16:9',
      editableText: options.editableText !== false
    }
  });
});

/**
 * Export to PDF
 * POST /api/export/pdf
 */
const exportPDF = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const request = new ExportRequest({ ...req.body, format: 'pdf' });
  const validation = request.validate();
  
  if (!validation.isValid) {
    return res.status(STATUS.BAD_REQUEST).json({
      success: false,
      error: ERROR_CODES.INVALID_INPUT,
      message: 'slideType and content are required',
      details: validation.errors
    });
  }
  
  const { slideType, content, options = {} } = req.body;
  
  const optionValidation = validateExportOptions(options);
  if (!optionValidation.isValid) {
    return res.status(STATUS.BAD_REQUEST).json({
      success: false,
      error: ERROR_CODES.INVALID_INPUT,
      message: 'Invalid export options',
      details: optionValidation.errors
    });
  }
  
  logger.info(req, 'Starting PDF export', { slideType, options });
  await recordFunnelStep('export_start', req);
  
  const exportId = crypto.randomUUID();
  const outputPath = path.join(EXPORTS_DIR, `${exportId}.pdf`);
  
  await generatePDF({ 
    slideType, 
    content, 
    outputPath,
    options: {
      quality: options.quality || 'high',
      aspectRatio: options.aspectRatio || '16:9',
      includeFonts: options.includeFonts !== false,
      ...options
    }
  });
  
  const duration = Date.now() - startTime;
  await recordExport('pdf', duration, true);
  await recordFunnelStep('export_complete', req);
  scheduleCleanup(outputPath, TIME.EXPORT_EXPIRY_MS);
  
  logger.info(req, 'PDF export complete', { exportId });
  
  res.status(STATUS.OK).json({
    success: true,
    exportId,
    downloadUrl: buildDownloadUrl(exportId, 'pdf'),
    format: 'pdf',
    expiresAt: calculateExpiry(TIME.EXPORT_EXPIRY_MS),
    options: {
      quality: options.quality || 'high',
      aspectRatio: options.aspectRatio || '16:9',
      embedFonts: options.includeFonts !== false
    }
  });
});

/**
 * Export to PNG (High Resolution)
 * POST /api/export/png
 */
const exportPNG = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const request = new ExportRequest({ ...req.body, format: 'png' });
  const validation = request.validate();
  
  if (!validation.isValid) {
    return res.status(STATUS.BAD_REQUEST).json({
      success: false,
      error: ERROR_CODES.INVALID_INPUT,
      message: 'slideType and content are required',
      details: validation.errors
    });
  }
  
  const { slideType, content, options = {} } = req.body;
  
  const optionValidation = validateExportOptions(options);
  if (!optionValidation.isValid) {
    return res.status(STATUS.BAD_REQUEST).json({
      success: false,
      error: ERROR_CODES.INVALID_INPUT,
      message: 'Invalid export options',
      details: optionValidation.errors
    });
  }
  
  logger.info(req, 'Starting PNG export', { slideType, options });
  await recordFunnelStep('export_start', req);
  
  const exportId = crypto.randomUUID();
  const outputPath = path.join(EXPORTS_DIR, `${exportId}.png`);
  
  await generatePNG({ 
    slideType, 
    content, 
    outputPath,
    options: {
      quality: options.quality || 'high',
      aspectRatio: options.aspectRatio || '16:9',
      scale: options.scale,
      transparent: options.transparent || false,
      ...options
    }
  });
  
  const duration = Date.now() - startTime;
  await recordExport('png', duration, true);
  await recordFunnelStep('export_complete', req);
  scheduleCleanup(outputPath, TIME.EXPORT_EXPIRY_MS);
  
  logger.info(req, 'PNG export complete', { exportId });
  
  res.status(STATUS.OK).json({
    success: true,
    exportId,
    downloadUrl: buildDownloadUrl(exportId, 'png'),
    format: 'png',
    expiresAt: calculateExpiry(TIME.EXPORT_EXPIRY_MS),
    options: {
      quality: options.quality || 'high',
      aspectRatio: options.aspectRatio || '16:9',
      retina: (options.quality === 'high' || options.quality === 'ultra')
    }
  });
});

/**
 * Batch export multiple slides
 * POST /api/export/batch
 */
const exportBatch = asyncHandler(async (req, res) => {
  const { slides, format = 'pptx', options = {} } = req.body;
  
  if (!Array.isArray(slides) || slides.length === 0) {
    return res.status(STATUS.BAD_REQUEST).json({
      success: false,
      error: ERROR_CODES.INVALID_INPUT,
      message: 'slides array is required and must not be empty'
    });
  }
  
  if (slides.length > 50) {
    return res.status(STATUS.BAD_REQUEST).json({
      success: false,
      error: ERROR_CODES.INVALID_INPUT,
      message: 'Maximum 50 slides allowed per batch'
    });
  }
  
  // Validate each slide
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    if (!slide.slideType || !slide.content) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        error: ERROR_CODES.INVALID_INPUT,
        message: `Slide ${i + 1} is missing slideType or content`
      });
    }
  }
  
  logger.info(req, 'Starting batch export', { 
    slideCount: slides.length, 
    format,
    options 
  });
  
  const batchResult = await batchExport(slides, EXPORTS_DIR, {
    format,
    aspectRatio: options.aspectRatio || '16:9',
    quality: options.quality || 'high',
    zipOutput: options.zipOutput !== false
  });
  
  // Schedule cleanup
  if (batchResult.zipPath) {
    scheduleCleanup(batchResult.zipPath, TIME.EXPORT_EXPIRY_MS);
  }
  scheduleCleanup(batchResult.outputDir, TIME.EXPORT_EXPIRY_MS);
  
  logger.info(req, 'Batch export complete', { 
    batchId: batchResult.batchId,
    successful: batchResult.successful,
    failed: batchResult.failed
  });
  
  res.status(STATUS.OK).json({
    success: true,
    batchId: batchResult.batchId,
    format,
    totalSlides: batchResult.totalSlides,
    successful: batchResult.successful,
    failed: batchResult.failed,
    downloadUrl: batchResult.zipPath 
      ? buildDownloadUrl(path.basename(batchResult.zipPath, '.zip'), 'zip')
      : null,
    individualUrls: batchResult.results.map(r => ({
      filename: r.filename,
      url: buildDownloadUrl(path.basename(r.path, `.${format}`), format)
    })),
    expiresAt: calculateExpiry(TIME.EXPORT_EXPIRY_MS),
    errors: batchResult.errors
  });
});

/**
 * Get export history
 * GET /api/export/history
 */
const getExportHistoryController = asyncHandler(async (req, res) => {
  const { format, limit = 100, startDate, endDate } = req.query;
  
  const history = getExportHistoryList({
    format,
    startDate,
    endDate,
    limit: parseInt(limit) || 100
  });
  
  res.status(STATUS.OK).json({
    success: true,
    count: history.length,
    history
  });
});

/**
 * Get single export history entry
 * GET /api/export/history/:exportId
 */
const getExportHistoryEntry = asyncHandler(async (req, res) => {
  const { exportId } = req.params;
  
  const entry = getExportHistory(exportId);
  
  if (!entry) {
    return res.status(STATUS.NOT_FOUND).json({
      success: false,
      error: ERROR_CODES.NOT_FOUND,
      message: 'Export history entry not found'
    });
  }
  
  res.status(STATUS.OK).json({
    success: true,
    entry
  });
});

/**
 * Clear export history
 * DELETE /api/export/history
 */
const clearHistory = asyncHandler(async (req, res) => {
  const count = clearExportHistory();
  
  logger.info(req, 'Export history cleared', { count });
  
  res.status(STATUS.OK).json({
    success: true,
    message: `Cleared ${count} history entries`
  });
});

/**
 * Get export options/info
 * GET /api/export/options
 */
const getExportOptions = asyncHandler(async (req, res) => {
  res.status(STATUS.OK).json({
    success: true,
    options: {
      formats: ['png', 'pptx', 'pdf'],
      aspectRatios: Object.keys(ASPECT_RATIOS),
      qualities: Object.keys(QUALITY_SETTINGS),
      qualityDetails: Object.entries(QUALITY_SETTINGS).map(([key, value]) => ({
        name: key,
        scale: value.scale,
        description: key === 'low' ? 'Standard resolution' :
                     key === 'medium' ? 'Better quality' :
                     key === 'high' ? '2x Retina quality' :
                     '3x Ultra-high quality'
      })),
      aspectRatioDetails: Object.entries(ASPECT_RATIOS).map(([key, value]) => ({
        name: key,
        width: value.pixels.width,
        height: value.pixels.height,
        description: key === '16:9' ? 'Widescreen (Standard)' :
                     key === '4:3' ? 'Standard (Legacy)' :
                     key === 'widescreen' ? 'Ultra-widescreen' :
                     key === 'letter' ? 'US Letter (Print)' :
                     'A4 (Print)'
      }))
    }
  });
});

module.exports = {
  exportPPTX,
  exportPDF,
  exportPNG,
  exportBatch,
  getExportHistory: getExportHistoryController,
  getExportHistoryEntry,
  clearHistory,
  getExportOptions
};