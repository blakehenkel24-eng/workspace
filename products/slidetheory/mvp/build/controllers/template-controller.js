/**
 * Template Controller
 * Handles template retrieval endpoints
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const { STATUS, ERROR_CODES } = require('../config/constants');
const { logger } = require('../middleware/logger');
const { AppError, asyncHandler } = require('../middleware/error-handler');
const { safeResolvePath } = require('../utils/helpers');

const TEMPLATES_DIR = config.paths.templates;

/**
 * Get all templates
 * GET /api/templates
 */
const getTemplates = asyncHandler(async (req, res) => {
  const templatesPath = path.join(TEMPLATES_DIR, 'index.json');
  const data = await fs.readFile(templatesPath, 'utf-8');
  const templates = JSON.parse(data);
  
  logger.info(req, 'Templates retrieved', { count: templates.length });
  
  res.status(STATUS.OK).json({
    success: true,
    templates
  });
});

/**
 * Get specific template
 * GET /api/templates/:id
 */
const getTemplateById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Security: Ensure path stays within templates directory
  const templatePath = safeResolvePath(TEMPLATES_DIR, `${id}.json`);
  
  if (!templatePath) {
    throw new AppError(
      ERROR_CODES.FORBIDDEN,
      'Invalid template path',
      STATUS.FORBIDDEN
    );
  }
  
  try {
    const data = await fs.readFile(templatePath, 'utf-8');
    const template = JSON.parse(data);
    
    logger.info(req, 'Template retrieved', { id });
    
    res.status(STATUS.OK).json({
      success: true,
      template
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        'Template not found',
        STATUS.NOT_FOUND
      );
    }
    throw error;
  }
});

module.exports = {
  getTemplates,
  getTemplateById
};
