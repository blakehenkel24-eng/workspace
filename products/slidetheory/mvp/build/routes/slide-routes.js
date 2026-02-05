/**
 * Slide Routes
 * Slide generation endpoints
 */

const express = require('express');
const router = express.Router();
const { generateSlide, generateSlideV2 } = require('../controllers/slide-controller');
const { validate } = require('../middleware/validator');

/**
 * @route   POST /api/generate
 * @desc    Generate a new slide (v1 - legacy)
 * @access  Public
 */
router.post('/generate', validate('generateSlide'), generateSlide);

/**
 * @route   POST /api/generate-slide-v2
 * @desc    Generate a new slide (v2 - with progress tracking)
 * @access  Public
 */
router.post('/generate-slide-v2', validate('generateSlideV2'), generateSlideV2);

module.exports = router;
