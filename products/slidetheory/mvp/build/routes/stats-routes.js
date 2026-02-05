/**
 * Stats Routes
 * Analytics and statistics endpoints
 */

const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/stats-controller');

/**
 * @route   GET /api/stats
 * @desc    Get usage statistics
 * @access  Public
 */
router.get('/stats', getStats);

module.exports = router;
