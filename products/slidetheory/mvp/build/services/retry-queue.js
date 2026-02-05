/**
 * Retry Queue Service
 * Manages retry logic for failed operations with exponential backoff
 */

const EventEmitter = require('events');
const crypto = require('crypto');

// Job states
const JOB_STATES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

// Job types
const JOB_TYPES = {
  EXPORT_PPTX: 'export_pptx',
  EXPORT_PDF: 'export_pdf',
  GENERATE_SLIDE: 'generate_slide',
  AI_GENERATION: 'ai_generation'
};

/**
 * Retry Queue Manager
 * Handles queued operations with automatic retry
 */
class RetryQueue extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.concurrency = options.concurrency || 2;
    this.jobTimeout = options.jobTimeout || 60000;
    
    this.jobs = new Map();
    this.processing = new Set();
    this.queue = [];
    this.handlers = new Map();
    
    this.isRunning = false;
    this.stats = {
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      retriedJobs: 0
    };
  }
  
  /**
   * Register a job handler
   */
  registerHandler(type, handler) {
    this.handlers.set(type, handler);
    return this;
  }
  
  /**
   * Add a job to the queue
   */
  async add(type, payload, options = {}) {
    const jobId = options.jobId || crypto.randomUUID();
    const priority = options.priority || 0;
    
    const job = {
      id: jobId,
      type,
      payload,
      state: JOB_STATES.PENDING,
      attempts: 0,
      maxAttempts: options.maxRetries || this.maxRetries,
      priority,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      error: null,
      result: null,
      scheduledFor: Date.now()
    };
    
    this.jobs.set(jobId, job);
    this.stats.totalJobs++;
    
    // Insert into queue based on priority
    const insertIndex = this.queue.findIndex(j => j.priority < priority);
    if (insertIndex === -1) {
      this.queue.push(job);
    } else {
      this.queue.splice(insertIndex, 0, job);
    }
    
    this.emit('job:added', job);
    
    // Start processing if not already running
    if (!this.isRunning) {
      this.start();
    }
    
    return jobId;
  }
  
  /**
   * Get job by ID
   */
  getJob(jobId) {
    return this.jobs.get(jobId);
  }
  
  /**
   * Cancel a job
   */
  cancel(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    
    if (job.state === JOB_STATES.PROCESSING) {
      // Mark for cancellation, actual cancellation depends on handler
      job.cancelled = true;
      return true;
    }
    
    if (job.state === JOB_STATES.PENDING) {
      job.state = JOB_STATES.CANCELLED;
      job.updatedAt = Date.now();
      
      // Remove from queue
      const queueIndex = this.queue.findIndex(j => j.id === jobId);
      if (queueIndex !== -1) {
        this.queue.splice(queueIndex, 1);
      }
      
      this.emit('job:cancelled', job);
      return true;
    }
    
    return false;
  }
  
  /**
   * Calculate delay with exponential backoff and jitter
   */
  calculateDelay(attempt) {
    // Exponential backoff: baseDelay * 2^attempt
    const exponentialDelay = this.baseDelay * Math.pow(2, attempt);
    
    // Cap at max delay
    const cappedDelay = Math.min(exponentialDelay, this.maxDelay);
    
    // Add jitter (±25%) to prevent thundering herd
    const jitter = cappedDelay * 0.25;
    const randomizedDelay = cappedDelay + (Math.random() * jitter * 2 - jitter);
    
    return Math.floor(randomizedDelay);
  }
  
  /**
   * Process a single job
   */
  async processJob(job) {
    const handler = this.handlers.get(job.type);
    if (!handler) {
      throw new Error(`No handler registered for job type: ${job.type}`);
    }
    
    job.state = JOB_STATES.PROCESSING;
    job.attempts++;
    job.updatedAt = Date.now();
    this.processing.add(job.id);
    
    this.emit('job:started', job);
    
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.jobTimeout);
      
      // Execute handler with abort signal
      const result = await handler(job.payload, {
        signal: controller.signal,
        attempt: job.attempts,
        job
      });
      
      clearTimeout(timeoutId);
      
      if (job.cancelled) {
        job.state = JOB_STATES.CANCELLED;
        this.emit('job:cancelled', job);
        return;
      }
      
      job.state = JOB_STATES.COMPLETED;
      job.result = result;
      job.updatedAt = Date.now();
      this.stats.completedJobs++;
      
      this.emit('job:completed', job, result);
      
    } catch (error) {
      job.error = {
        message: error.message,
        code: error.code,
        stack: error.stack?.split('\n').slice(0, 3)
      };
      
      // Check if we should retry
      if (job.attempts < job.maxAttempts && this.shouldRetry(error)) {
        const delay = this.calculateDelay(job.attempts);
        job.scheduledFor = Date.now() + delay;
        job.state = JOB_STATES.PENDING;
        this.stats.retriedJobs++;
        
        this.emit('job:retrying', job, delay);
        
        // Re-queue with delay
        setTimeout(() => {
          this.queue.push(job);
          this.process();
        }, delay);
      } else {
        job.state = JOB_STATES.FAILED;
        job.updatedAt = Date.now();
        this.stats.failedJobs++;
        
        this.emit('job:failed', job, error);
      }
    } finally {
      this.processing.delete(job.id);
    }
  }
  
  /**
   * Determine if an error is retryable
   */
  shouldRetry(error) {
    // Don't retry validation errors
    if (error.name === 'ValidationError') return false;
    if (error.code === 'VALIDATION_ERROR') return false;
    
    // Retry on specific error codes
    const retryableCodes = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ECONNREFUSED',
      'ENOTFOUND',
      'EAI_AGAIN',
      'GENERATION_FAILED',
      'EXPORT_FAILED'
    ];
    
    if (retryableCodes.includes(error.code)) return true;
    
    // Retry on network errors
    if (error.message?.includes('network')) return true;
    if (error.message?.includes('timeout')) return true;
    if (error.message?.includes('rate limit')) return true;
    if (error.message?.includes('temporary')) return true;
    
    // Retry on 5xx errors (simulated)
    if (error.statusCode >= 500) return true;
    
    return false;
  }
  
  /**
   * Process queue
   */
  async process() {
    if (this.processing.size >= this.concurrency) return;
    if (this.queue.length === 0) return;
    
    // Sort by priority and scheduled time
    this.queue.sort((a, b) => {
      if (a.scheduledFor !== b.scheduledFor) {
        return a.scheduledFor - b.scheduledFor;
      }
      return b.priority - a.priority;
    });
    
    // Get next ready job
    const now = Date.now();
    const readyJob = this.queue.find(j => j.scheduledFor <= now);
    
    if (!readyJob) {
      // Schedule next check
      const nextJob = this.queue[0];
      if (nextJob) {
        const waitTime = Math.max(0, nextJob.scheduledFor - now);
        setTimeout(() => this.process(), Math.min(waitTime, 1000));
      }
      return;
    }
    
    // Remove from queue and process
    const jobIndex = this.queue.indexOf(readyJob);
    this.queue.splice(jobIndex, 1);
    
    this.processJob(readyJob).finally(() => {
      this.process();
    });
    
    // Try to process more if capacity available
    if (this.processing.size < this.concurrency) {
      setImmediate(() => this.process());
    }
  }
  
  /**
   * Start the queue processor
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.emit('queue:started');
    
    const processLoop = () => {
      if (!this.isRunning) return;
      
      this.process();
      
      // Continue loop if there are jobs
      if (this.queue.length > 0 || this.processing.size > 0) {
        setTimeout(processLoop, 100);
      } else {
        this.isRunning = false;
        this.emit('queue:idle');
      }
    };
    
    processLoop();
  }
  
  /**
   * Stop the queue processor
   */
  stop() {
    this.isRunning = false;
    this.emit('queue:stopped');
  }
  
  /**
   * Get queue statistics
   */
  getStats() {
    const pending = Array.from(this.jobs.values()).filter(j => j.state === JOB_STATES.PENDING).length;
    const processing = this.processing.size;
    const completed = Array.from(this.jobs.values()).filter(j => j.state === JOB_STATES.COMPLETED).length;
    const failed = Array.from(this.jobs.values()).filter(j => j.state === JOB_STATES.FAILED).length;
    
    return {
      ...this.stats,
      pending,
      processing,
      completed,
      failed,
      queueLength: this.queue.length
    };
  }
  
  /**
   * Get all jobs
   */
  getJobs(state = null) {
    const jobs = Array.from(this.jobs.values());
    if (state) {
      return jobs.filter(j => j.state === state);
    }
    return jobs;
  }
  
  /**
   * Clear completed/failed jobs older than specified time
   */
  cleanup(maxAgeMs = 24 * 60 * 60 * 1000) {
    const cutoff = Date.now() - maxAgeMs;
    let cleared = 0;
    
    for (const [id, job] of this.jobs) {
      if ((job.state === JOB_STATES.COMPLETED || job.state === JOB_STATES.FAILED || job.state === JOB_STATES.CANCELLED) 
          && job.updatedAt < cutoff) {
        this.jobs.delete(id);
        cleared++;
      }
    }
    
    return { cleared, remaining: this.jobs.size };
  }
}

// Singleton instance
let queueInstance = null;

function getRetryQueue(options = {}) {
  if (!queueInstance) {
    queueInstance = new RetryQueue(options);
  }
  return queueInstance;
}

module.exports = {
  RetryQueue,
  JOB_STATES,
  JOB_TYPES,
  getRetryQueue
};
