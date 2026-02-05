/**
 * Health Routes
 * System health and status endpoints
 */

const express = require('express');
const router = express.Router();
const { 
  getHealth, 
  getDetailedHealth, 
  getReadiness, 
  getLiveness, 
  getMetrics 
} = require('../controllers/health-controller');

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

/**
 * @route   GET /api/health/ready
 * @desc    Readiness probe for Kubernetes
 * @access  Public
 */
router.get('/health/ready', getReadiness);

/**
 * @route   GET /api/health/live
 * @desc    Liveness probe for Kubernetes
 * @access  Public
 */
router.get('/health/live', getLiveness);

/**
 * @route   GET /api/metrics
 * @desc    Prometheus metrics endpoint
 * @access  Public
 */
router.get('/metrics', getMetrics);

module.exports = router;
