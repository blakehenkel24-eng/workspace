/**
 * Health Routes
 * System health and status endpoints
 */

const express = require('express');
const router = express.Router();
const { getHealth, getDetailedHealth } = require('../controllers/health-controller');

/**
 * @route   GET /api/health
 * @desc    Get basic health status
 * @access  Public
 */
router.get('/health', getHealth);

/**
 * @route   GET /api/health/detailed
 * @desc    Get detailed system health
 * @access  Public
 */
router.get('/health/detailed', getDetailedHealth);

module.exports = router;
