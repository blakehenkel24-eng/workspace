/**
 * File Controller
 * Handles file serving endpoints
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const { STATUS, ERROR_CODES } = require('../config/constants');
const { logger } = require('../middleware/logger');
const { AppError, asyncHandler } = require('../middleware/error-handler');
const { safeResolvePath, getMimeType } = require('../utils/helpers');

const SLIDES_DIR = config.paths.slides;
const EXPORTS_DIR = config.paths.exports;

/**
 * Serve generated slide image
 * GET /slides/:filename
 */
const serveSlide = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  
  // Security: Resolve and validate path
  const filePath = safeResolvePath(SLIDES_DIR, filename);
  
  if (!filePath) {
    throw new AppError(ERROR_CODES.FORBIDDEN, 'Access denied', STATUS.FORBIDDEN);
  }
  
  try {
    await fs.access(filePath);
  } catch (err) {
    throw new AppError(
      ERROR_CODES.NOT_FOUND,
      'Slide not found or has expired (slides are stored for 24 hours)',
      STATUS.NOT_FOUND
    );
  }
  
  // Set correct content type
  if (filename.endsWith('.svg')) {
    res.setHeader('Content-Type', 'image/svg+xml');
  }
  
  res.sendFile(filePath);
});

/**
 * Serve export file
 * GET /exports/:filename
 */
const serveExport = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  
  // Security: Resolve and validate path
  const filePath = safeResolvePath(EXPORTS_DIR, filename);
  
  if (!filePath) {
    throw new AppError(ERROR_CODES.FORBIDDEN, 'Access denied', STATUS.FORBIDDEN);
  }
  
  try {
    await fs.access(filePath);
  } catch (err) {
    throw new AppError(
      ERROR_CODES.NOT_FOUND,
      'Export not found or has expired (exports are stored for 1 hour)',
      STATUS.NOT_FOUND
    );
  }
  
  res.sendFile(filePath);
});

module.exports = {
  serveSlide,
  serveExport
};
