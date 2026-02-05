/**
 * Template Routes
 * Template retrieval endpoints
 */

const express = require('express');
const router = express.Router();
const { getTemplates, getTemplateById } = require('../controllers/template-controller');
const { validateParams } = require('../middleware/validator');

/**
 * @route   GET /api/templates
 * @desc    Get all available templates
 * @access  Public
 */
router.get('/templates', getTemplates);

/**
 * @route   GET /api/templates/:id
 * @desc    Get specific template by ID
 * @access  Public
 */
router.get('/templates/:id', validateParams('id'), getTemplateById);

module.exports = router;
