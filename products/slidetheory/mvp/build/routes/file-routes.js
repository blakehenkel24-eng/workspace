/**
 * File Routes
 * Static file serving endpoints
 */

const express = require('express');
const router = express.Router();
const { serveSlide, serveExport } = require('../controllers/file-controller');
const { validateParams } = require('../middleware/validator');

/**
 * @route   GET /slides/:filename
 * @desc    Serve generated slide image
 * @access  Public
 */
router.get('/slides/:filename', validateParams('filename'), serveSlide);

/**
 * @route   GET /exports/:filename
 * @desc    Serve export file
 * @access  Public
 */
router.get('/exports/:filename', validateParams('filename'), serveExport);

module.exports = router;
