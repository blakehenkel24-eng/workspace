/**
 * Progress Tracking Service
 * Provides real-time progress updates for slide generation
 * 
 * Features:
 * - Step-by-step progress tracking (validate → prompt → generate → render → export)
 * - Server-Sent Events (SSE) for real-time client updates
 * - Cancel token support via AbortController
 * - Time estimation based on step durations
 */

const { EventEmitter } = require('events');

// Progress step definitions with weights
const PROGRESS_STEPS = {
  VALIDATE: { 
    id: 'validate', 
    label: 'Validating input...', 
    weight: 5, 
    estimatedDuration: 100 
  },
  BUILD_PROMPT: { 
    id: 'prompt_build', 
    label: 'Building prompt...', 
    weight: 10, 
    estimatedDuration: 200 
  },
  AI_GENERATE: { 
    id: 'ai_generate', 
    label: 'Generating content...', 
    weight: 50, 
    estimatedDuration: 3000 
  },
  RENDER: { 
    id: 'render', 
    label: 'Rendering slide...', 
    weight: 25, 
    estimatedDuration: 1000 
  },
  EXPORT: { 
    id: 'export', 
    label: 'Finalizing...', 
    weight: 10, 
    estimatedDuration: 500 
  }
};

// Active jobs storage
const activeJobs = new Map();

/**
 * Progress Tracker class for individual jobs
 */
class ProgressTracker extends EventEmitter {
  constructor(jobId) {
    super();
    this.jobId = jobId;
    this.startTime = Date.now();
    this.currentStep = null;
    this.completedSteps = new Set();
    this.stepStartTimes = {};
    this.abortController = new AbortController();
    
    // Store in active jobs
    activeJobs.set(jobId, this);
    
    // Auto-cleanup after 5 minutes
    setTimeout(() => this.cleanup(), 5 * 60 * 1000);
  }
  
  /**
   * Start a progress step
   */
  startStep(stepId) {
    const step = Object.values(PROGRESS_STEPS).find(s => s.id === stepId);
    if (!step) throw new Error(`Unknown step: ${stepId}`);
    
    this.currentStep = step;
    this.stepStartTimes[stepId] = Date.now();
    
    this.emit('progress', {
      jobId: this.jobId,
      step: step.id,
      stepLabel: step.label,
      percent: this.calculatePercent(),
      estimate: this.calculateEstimate()
    });
  }
  
  /**
   * Complete a progress step
   */
  completeStep(stepId) {
    this.completedSteps.add(stepId);
    
    // Calculate actual duration for future estimates
    if (this.stepStartTimes[stepId]) {
      const duration = Date.now() - this.stepStartTimes[stepId];
      // Could store this for adaptive estimates
    }
    
    this.emit('progress', {
      jobId: this.jobId,
      step: stepId,
      stepLabel: 'Complete',
      percent: this.calculatePercent(),
      estimate: this.calculateEstimate()
    });
  }
  
  /**
   * Mark job as complete
   */
  complete(result) {
    this.emit('complete', {
      jobId: this.jobId,
      result,
      durationMs: Date.now() - this.startTime
    });
    this.cleanup();
  }
  
  /**
   * Mark job as failed
   */
  fail(error) {
    this.emit('error', {
      jobId: this.jobId,
      error: error.message,
      durationMs: Date.now() - this.startTime
    });
    this.cleanup();
  }
  
  /**
   * Cancel the job
   */
  cancel() {
    this.abortController.abort();
    this.emit('cancelled', { jobId: this.jobId });
    this.cleanup();
  }
  
  /**
   * Check if job is cancelled
   */
  isCancelled() {
    return this.abortController.signal.aborted;
  }
  
  /**
   * Get abort signal for async operations
   */
  getSignal() {
    return this.abortController.signal;
  }
  
  /**
   * Calculate current progress percentage
   */
  calculatePercent() {
    let percent = 0;
    
    // Add completed steps
    for (const stepId of this.completedSteps) {
      const step = Object.values(PROGRESS_STEPS).find(s => s.id === stepId);
      if (step) percent += step.weight;
    }
    
    // Add partial progress for current step
    if (this.currentStep && !this.completedSteps.has(this.currentStep.id)) {
      const stepStart = this.stepStartTimes[this.currentStep.id] || this.startTime;
      const elapsed = Date.now() - stepStart;
      const estimated = this.currentStep.estimatedDuration;
      const stepProgress = Math.min(elapsed / estimated, 1);
      percent += this.currentStep.weight * stepProgress;
    }
    
    return Math.min(Math.round(percent), 99); // Cap at 99 until complete
  }
  
  /**
   * Calculate estimated time remaining
   */
  calculateEstimate() {
    const currentPercent = this.calculatePercent();
    if (currentPercent === 0) return null;
    
    const elapsed = Date.now() - this.startTime;
    const estimatedTotal = elapsed / (currentPercent / 100);
    const remaining = estimatedTotal - elapsed;
    
    return Math.max(Math.round(remaining / 1000), 1); // seconds
  }
  
  /**
   * Get current status
   */
  getStatus() {
    return {
      jobId: this.jobId,
      currentStep: this.currentStep?.id || null,
      currentStepLabel: this.currentStep?.label || null,
      percent: this.calculatePercent(),
      estimateSeconds: this.calculateEstimate(),
      isCancelled: this.isCancelled(),
      durationMs: Date.now() - this.startTime
    };
  }
  
  /**
   * Clean up resources
   */
  cleanup() {
    activeJobs.delete(this.jobId);
    this.removeAllListeners();
  }
}

/**
 * Get or create a progress tracker for a job
 */
function getProgressTracker(jobId) {
  if (!activeJobs.has(jobId)) {
    return new ProgressTracker(jobId);
  }
  return activeJobs.get(jobId);
}

/**
 * Get existing tracker (returns null if not found)
 */
function getExistingTracker(jobId) {
  return activeJobs.get(jobId) || null;
}

/**
 * Cancel a job
 */
function cancelJob(jobId) {
  const tracker = activeJobs.get(jobId);
  if (tracker) {
    tracker.cancel();
    return true;
  }
  return false;
}

/**
 * Get all active jobs (for monitoring)
 */
function getActiveJobs() {
  return Array.from(activeJobs.entries()).map(([id, tracker]) => ({
    jobId: id,
    ...tracker.getStatus()
  }));
}

module.exports = {
  ProgressTracker,
  PROGRESS_STEPS,
  getProgressTracker,
  getExistingTracker,
  cancelJob,
  getActiveJobs
};
