/**
 * Export Routes
 * Export generation endpoints
 */

const express = require('express');
const router = express.Router();
const { exportPPTX, exportPDF } = require('../controllers/export-controller');
const { validate } = require('../middleware/validator');

/**
 * @route   POST /api/export/pptx
 * @desc    Export slide to PowerPoint
 * @access  Public
 */
router.post('/export/pptx', validate('exportSlide'), exportPPTX);

/**
 * @route   POST /api/export/pdf
 * @desc    Export slide to PDF
 * @access  Public
 */
router.post('/export/pdf', validate('exportSlide'), exportPDF);

module.exports = router;
