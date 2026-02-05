/**
 * Export Routes - Professional Edition
 * Export generation endpoints with enhanced options
 */

const express = require('express');
const router = express.Router();
const { 
  exportPPTX, 
  exportPDF, 
  exportPNG,
  exportBatch,
  getExportHistory,
  getExportHistoryEntry,
  clearHistory,
  getExportOptions
} = require('../controllers/export-controller');
const { validate } = require('../middleware/validator');

/**
 * @route   POST /api/export/pptx
 * @desc    Export slide to PowerPoint
 * @access  Public
 */
router.post('/export/pptx', validate('exportSlide'), exportPPTX);

/**
 * @route   POST /api/export/pdf
 * @desc    Export slide to PDF with embedded fonts
 * @access  Public
 */
router.post('/export/pdf', validate('exportSlide'), exportPDF);

/**
 * @route   POST /api/export/png
 * @desc    Export slide to high-resolution PNG
 * @access  Public
 */
router.post('/export/png', validate('exportSlide'), exportPNG);

/**
 * @route   POST /api/export/batch
 * @desc    Batch export multiple slides
 * @access  Public
 */
router.post('/export/batch', exportBatch);

/**
 * @route   GET /api/export/options
 * @desc    Get available export options
 * @access  Public
 */
router.get('/export/options', getExportOptions);

/**
 * @route   GET /api/export/history
 * @desc    Get export history list
 * @access  Public
 */
router.get('/export/history', getExportHistory);

/**
 * @route   GET /api/export/history/:exportId
 * @desc    Get single export history entry
 * @access  Public
 */
router.get('/export/history/:exportId', getExportHistoryEntry);

/**
 * @route   DELETE /api/export/history
 * @desc    Clear export history
 * @access  Public
 */
router.delete('/export/history', clearHistory);

module.exports = router;