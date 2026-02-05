/**
 * Progress Routes
 * Server-Sent Events endpoint for real-time progress updates
 */

const express = require('express');
const router = express.Router();
const { getExistingTracker, cancelJob, getActiveJobs } = require('../services/progress-service');

/**
 * @route   GET /api/progress/:jobId
 * @desc    Get real-time progress updates via SSE
 * @access  Public
 */
router.get('/:jobId', (req, res) => {
  const { jobId } = req.params;
  const tracker = getExistingTracker(jobId);
  
  if (!tracker) {
    return res.status(404).json({
      success: false,
      message: 'Job not found or already completed'
    });
  }
  
  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Send initial status
  res.write(`data: ${JSON.stringify({
    type: 'connected',
    ...tracker.getStatus()
  })}\n\n`);
  
  // Listen for progress updates
  const onProgress = (data) => {
    res.write(`data: ${JSON.stringify({
      type: 'progress',
      ...data
    })}\n\n`);
  };
  
  const onComplete = (data) => {
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      ...data
    })}\n\n`);
    res.end();
    cleanup();
  };
  
  const onError = (data) => {
    res.write(`data: ${JSON.stringify({
      type: 'error',
      ...data
    })}\n\n`);
    res.end();
    cleanup();
  };
  
  const onCancelled = (data) => {
    res.write(`data: ${JSON.stringify({
      type: 'cancelled',
      ...data
    })}\n\n`);
    res.end();
    cleanup();
  };
  
  // Attach listeners
  tracker.on('progress', onProgress);
  tracker.on('complete', onComplete);
  tracker.on('error', onError);
  tracker.on('cancelled', onCancelled);
  
  // Handle client disconnect
  req.on('close', () => {
    cleanup();
  });
  
  function cleanup() {
    tracker.off('progress', onProgress);
    tracker.off('complete', onComplete);
    tracker.off('error', onError);
    tracker.off('cancelled', onCancelled);
  }
});

/**
 * @route   POST /api/progress/:jobId/cancel
 * @desc    Cancel a running job
 * @access  Public
 */
router.post('/:jobId/cancel', (req, res) => {
  const { jobId } = req.params;
  const cancelled = cancelJob(jobId);
  
  if (cancelled) {
    res.json({
      success: true,
      message: 'Job cancelled'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Job not found or already completed'
    });
  }
});

/**
 * @route   GET /api/progress
 * @desc    Get list of active jobs (monitoring)
 * @access  Public
 */
router.get('/', (req, res) => {
  const jobs = getActiveJobs();
  res.json({
    success: true,
    count: jobs.length,
    jobs
  });
});

module.exports = router;
