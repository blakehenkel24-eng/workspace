/**
 * Export Controller
 * Handles export generation endpoints
 */

const crypto = require('crypto');
const path = require('path');
const config = require('../config');
const { STATUS, ERROR_CODES, MESSAGES, TIME } = require('../config/constants');
const { generatePPTX, generatePDF } = require('../services/export-service');
const { logger } = require('../middleware/logger');
const { AppError, asyncHandler } = require('../middleware/error-handler');
const { scheduleCleanup, buildDownloadUrl, calculateExpiry } = require('../utils/exporter');
const { ExportRequest } = require('../models/slide-model');

const EXPORTS_DIR = config.paths.exports;

/**
 * Export to PowerPoint
 * POST /api/export/pptx
 */
const exportPPTX = asyncHandler(async (req, res) => {
  const request = new ExportRequest({ ...req.body, format: 'pptx' });
  const validation = request.validate();
  
  if (!validation.isValid) {
    return res.status(STATUS.BAD_REQUEST).json({
      success: false,
      error: ERROR_CODES.INVALID_INPUT,
      message: 'slideType and content are required'
    });
  }
  
  const { slideType, content } = request;
  
  logger.info(req, 'Starting PPTX export');
  
  const exportId = crypto.randomUUID();
  const outputPath = path.join(EXPORTS_DIR, `${exportId}.pptx`);
  
  await generatePPTX({ slideType, content, outputPath });
  
  scheduleCleanup(outputPath, TIME.EXPORT_EXPIRY_MS);
  
  logger.info(req, 'PPTX export complete', { exportId });
  
  res.status(STATUS.OK).json({
    success: true,
    exportId,
    downloadUrl: buildDownloadUrl(exportId, 'pptx'),
    format: 'pptx',
    expiresAt: calculateExpiry(TIME.EXPORT_EXPIRY_MS)
  });
});

/**
 * Export to PDF
 * POST /api/export/pdf
 */
const exportPDF = asyncHandler(async (req, res) => {
  const request = new ExportRequest({ ...req.body, format: 'pdf' });
  const validation = request.validate();
  
  if (!validation.isValid) {
    return res.status(STATUS.BAD_REQUEST).json({
      success: false,
      error: ERROR_CODES.INVALID_INPUT,
      message: 'slideType and content are required'
    });
  }
  
  const { slideType, content } = request;
  
  logger.info(req, 'Starting PDF export');
  
  const exportId = crypto.randomUUID();
  const outputPath = path.join(EXPORTS_DIR, `${exportId}.pdf`);
  
  await generatePDF({ slideType, content, outputPath });
  
  scheduleCleanup(outputPath, TIME.EXPORT_EXPIRY_MS);
  
  logger.info(req, 'PDF export complete', { exportId });
  
  res.status(STATUS.OK).json({
    success: true,
    exportId,
    downloadUrl: buildDownloadUrl(exportId, 'pdf'),
    format: 'pdf',
    expiresAt: calculateExpiry(TIME.EXPORT_EXPIRY_MS)
  });
});

module.exports = {
  exportPPTX,
  exportPDF
};
