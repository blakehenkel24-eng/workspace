/**
 * Slide Routes
 * Slide generation endpoints
 */

const express = require('express');
const router = express.Router();
const { generateSlide } = require('../controllers/slide-controller');
const { validate } = require('../middleware/validator');

/**
 * @route   POST /api/generate
 * @desc    Generate a new slide
 * @access  Public
 */
router.post('/generate', validate('generateSlide'), generateSlide);

module.exports = router;
