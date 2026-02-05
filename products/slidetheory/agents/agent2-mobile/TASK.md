# Agent 2: Mobile UX Redesign

## Task
Implement mobile-first stepper UI for slide generation flow.

## Current Problem
- Desktop-first layout doesn't work on mobile
- Form and preview side-by-side is too cramped
- iOS zooms on textarea focus (font-size < 16px)
- No touch gesture support

## Solution: Stepper Pattern

### Mobile Flow (< 768px)
```
┌─────────────────────┐
│ Step 1 of 2    • ○ │  ← Step indicator
├─────────────────────┤
│                     │
│   [Form Fields]     │  ← Full screen form
│   [Inputs...]       │
│                     │
│   [Generate →]      │
│                     │
├─────────────────────┤
│   [← Step 2 →]     │  ← Floating toggle
└─────────────────────┘
```

After Generate:
```
┌─────────────────────┐
│ Step 2 of 2    • ● │
├─────────────────────┤
│                     │
│   [Slide Preview]   │  ← Full screen preview
│                     │
│   [Download ↓]      │
│                     │
├─────────────────────┤
│   [← Step 1 →]     │  ← Floating toggle
└─────────────────────┘
```

## Deliverables

### 1. HTML Structure Updates
```html
<!-- Mobile stepper wrapper -->
<div class="mobile-stepper" data-current-step="1">
  <div class="step step-1" data-step="1">
    <!-- Form content -->
  </div>
  <div class="step step-2" data-step="2">
    <!-- Preview content -->
  </div>
  
  <div class="step-toggle" aria-label="Toggle between form and preview">
    <button data-goto="1">Edit</button>
    <button data-goto="2">Preview</button>
  </div>
</div>
```

### 2. CSS Changes
```css
/* Desktop: unchanged */
@media (min-width: 768px) {
  .mobile-stepper { display: contents; }
  .step-toggle { display: none; }
}

/* Mobile: stepper */
@media (max-width: 767px) {
  .mobile-stepper {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }
  
  .step {
    flex: 1;
    overflow-y: auto;
    display: none;
  }
  
  .step.active { display: block; }
  
  .step-toggle {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    border-radius: 24px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 8px;
    display: flex;
    gap: 8px;
    z-index: 100;
  }
  
  /* iOS zoom fix */
  input, textarea, select {
    font-size: 16px !important;
  }
}
```

### 3. JavaScript Updates
```javascript
class MobileStepper {
  constructor() {
    this.currentStep = 1;
    this.setupEventListeners();
    this.setupSwipeGestures();
  }
  
  goToStep(step) {
    this.currentStep = step;
    // Update UI, focus management, aria
  }
  
  setupSwipeGestures() {
    // touchstart, touchend for swipe detection
    // Swipe left → next step, Swipe right → prev step
  }
}
```

## Status
- [ ] Stepper HTML structure
- [ ] Mobile CSS styles
- [ ] Step toggle component
- [ ] Swipe gestures
- [ ] iOS zoom fix
- [ ] Tests

## Blockers
None - can run in parallel.

## Integration Points
- Agent 5: Focus management in step toggle
- Agent 3: Auto-advance to preview on generate complete
