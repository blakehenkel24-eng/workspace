# Agent 3: Real Progress Indication

## Task
Replace fake loading with actual progress tracking across generation pipeline.

## Current State
- Fake spinner with no real progress
- Static "Creating your slide..." message
- Animated progress bar that's just decorative
- No cancel functionality

## Target State
- Real progress: validate → prompt → generate → render → export
- Accurate percentage (0-100%)
- Time estimate ("~3 seconds remaining")
- Cancel button that aborts generation

## Architecture

### Server-Sent Events (SSE) Approach
```
Client                          Server
  │                                │
  │──── POST /api/slides ─────────→│
  │         (starts generation)    │
  │                                │
  │←──── SSE /api/slides/:id/progress
  │         { step: 'ai_generate',  │
  │           percent: 45,          │
  │           estimate: 2000 }      │
  │                                │
  │←──── SSE { complete: true,     │
  │            url: '/slide.png' }  │
```

### Progress Steps
```javascript
const PROGRESS_STEPS = {
  VALIDATE:     { weight: 5,  duration: 100 },
  BUILD_PROMPT: { weight: 10, duration: 200 },
  AI_GENERATE:  { weight: 50, duration: 3000 },
  RENDER:       { weight: 25, duration: 1000 },
  EXPORT:       { weight: 10, duration: 500 }
};
```

## Deliverables

### 1. Server-Side Progress Tracking
```javascript
// routes/slides.js
router.post('/api/slides', async (req, res) => {
  const jobId = generateId();
  const abortController = new AbortController();
  activeJobs.set(jobId, abortController);
  
  // Start generation with progress callbacks
  const result = await generateSlide(req.body, {
    signal: abortController.signal,
    onProgress: (step, percent) => {
      progressEmitter.emit(jobId, { step, percent });
    }
  });
});

router.get('/api/slides/:id/progress', (req, res) => {
  // SSE endpoint
  res.setHeader('Content-Type', 'text/event-stream');
  progressEmitter.on(req.params.id, (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
});
```

### 2. Client-Side Progress UI
```javascript
// app.js
class ProgressTracker {
  constructor() {
    this.startTime = Date.now();
    this.currentStep = null;
  }
  
  connect(jobId) {
    const eventSource = new EventSource(`/api/slides/${jobId}/progress`);
    
    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      this.updateUI(data);
    };
  }
  
  updateUI({ step, percent, estimate }) {
    // Update progress bar
    // Update step label
    // Update time estimate
  }
  
  cancel() {
    fetch(`/api/slides/${this.jobId}/cancel`, { method: 'POST' });
  }
}
```

### 3. HTML Updates
```html
<div id="loadingOverlay" class="loading-overlay">
  <div class="spinner"></div>
  <p class="loading-step" id="loadingStep">Generating...</p>
  
  <div class="loading-progress">
    <div class="loading-progress-bar" id="progressBar" style="width: 0%"></div>
  </div>
  
  <p class="loading-estimate" id="timeEstimate">~3 seconds remaining</p>
  
  <button class="btn-cancel" id="cancelBtn">Cancel</button>
</div>
```

## Status
- [ ] SSE route implementation
- [ ] Progress tracking in AI service
- [ ] Cancel functionality
- [ ] Client-side progress UI
- [ ] Time estimation
- [ ] Tests

## Blockers
None - can run in parallel.

## Integration Points
- Agent 1: Hybrid renderer reports progress
- Agent 5: Loading state accessibility (aria-live)
