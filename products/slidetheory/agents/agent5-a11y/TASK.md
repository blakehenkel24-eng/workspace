# Agent 5: Accessibility + Polish

## Task
Achieve WCAG AA compliance and add polish animations.

## WCAG AA Checklist

### Perceivable
- [ ] 1.1.1 Non-text Content - Images have alt text
- [ ] 1.3.1 Info and Relationships - Proper heading structure
- [ ] 1.4.3 Contrast (Minimum) - 4.5:1 for normal text
- [ ] 1.4.11 Non-text Contrast - 3:1 for UI components

### Operable
- [ ] 2.1.1 Keyboard - All functionality via keyboard
- [ ] 2.4.3 Focus Order - Logical tab order
- [ ] 2.4.7 Focus Visible - Visible focus indicators
- [ ] 2.5.5 Target Size - Touch targets >= 44x44px

### Understandable
- [ ] 3.3.1 Error Identification - Clear error messages
- [ ] 3.3.2 Labels or Instructions - Form labels

### Robust
- [ ] 4.1.2 Name, Role, Value - ARIA attributes
- [ ] 4.1.3 Status Messages - aria-live for updates

## Deliverables

### 1. ARIA Enhancements
```html
<!-- Status announcements -->
<div aria-live="polite" aria-atomic="true" class="sr-only" id="statusRegion">
</div>

<!-- Modal -->
<div role="dialog" aria-modal="true" aria-labelledby="modalTitle">
  ...
</div>

<!-- Buttons with icons -->
<button aria-label="Generate slide" aria-keyshortcuts="Control+Enter">
  <svg aria-hidden="true">...</svg>
  Generate
</button>
```

### 2. Focus Management
```javascript
// Focus trap for modal
class FocusTrap {
  constructor(element) {
    this.element = element;
    this.focusable = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    this.first = this.focusable[0];
    this.last = this.focusable[this.focusable.length - 1];
  }
  
  handleTab(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === this.first) {
        e.preventDefault();
        this.last.focus();
      } else if (!e.shiftKey && document.activeElement === this.last) {
        e.preventDefault();
        this.first.focus();
      }
    }
  }
}
```

### 3. Focus Styles
```css
/* Visible focus */
:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Skip link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### 4. Success Animation
```css
@keyframes success-check {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.success-animation {
  animation: success-check 0.5s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 5. Color Contrast Fixes
```css
/* Current issues to fix */
--text-muted: #64748b; /* Check contrast on white */
--text-placeholder: #a1a1aa; /* Likely fails WCAG */
--border-subtle: #e4e4e7; /* Check contrast */

/* Minimum ratios needed:
   Normal text: 4.5:1
   Large text: 3:1
   UI components: 3:1
*/
```

## Status
- [ ] ARIA live regions
- [ ] Focus trap implementation
- [ ] Focus visible styles
- [ ] Color contrast audit
- [ ] Success animation
- [ ] Reduced motion support
- [ ] ACCESSIBILITY_REPORT.md

## Blockers
- Agent 4: Need to know which features exist to make them accessible
- Agent 2: Mobile stepper needs a11y
- Agent 3: Loading states need aria-live

## Integration Points
- Agent 2: Stepper keyboard navigation
- Agent 3: Progress announcements
- All: Focus management for any new UI
