/**
 * DocuGen - Mobile UX + Accessibility JavaScript
 * Handles stepper navigation, swipe gestures, bottom sheet, and accessibility
 */

(function() {
  'use strict';

  // State
  const state = {
    currentStep: 1,
    isSwiping: false,
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
    touchStartTime: 0,
    bottomSheetOpen: false
  };

  // DOM Elements
  const elements = {
    formStep: document.getElementById('formStep'),
    previewStep: document.getElementById('previewStep'),
    mainContent: document.getElementById('mainContent'),
    stepToggle: document.getElementById('stepToggle'),
    swipeHint: document.getElementById('swipeHint'),
    steps: document.querySelectorAll('.step'),
    docForm: document.getElementById('docForm'),
    exportBtn: document.getElementById('exportBtn'),
    bottomSheet: document.getElementById('bottomSheet'),
    bottomSheetOverlay: document.getElementById('bottomSheetOverlay'),
    closeBottomSheet: document.getElementById('closeBottomSheet'),
    exportOptions: document.querySelectorAll('.export-option'),
    toast: document.getElementById('toast'),
    previewTitle: document.getElementById('previewTitle'),
    previewBody: document.getElementById('previewBody'),
    lastUpdated: document.getElementById('lastUpdated'),
    refreshPreview: document.getElementById('refreshPreview')
  };

  // Constants
  const SWIPE_THRESHOLD = 80; // Minimum pixels to trigger swipe
  const SWIPE_TIME_THRESHOLD = 300; // Maximum time for a swipe
  const TOUCH_SLOP = 10; // Tolerance for accidental movement

  /**
   * Initialize the application
   */
  function init() {
    bindEvents();
    updateStepper(1);
    
    // Show swipe hint briefly on first load
    setTimeout(() => {
      if (state.currentStep === 1) {
        showSwipeHint();
      }
    }, 1000);
  }

  /**
   * Bind all event listeners
   */
  function bindEvents() {
    // Stepper buttons
    elements.steps.forEach((step, index) => {
      step.addEventListener('click', () => {
        goToStep(index + 1);
      });
    });

    // Floating toggle button
    elements.stepToggle.addEventListener('click', toggleStep);

    // Touch/Swipe events
    elements.mainContent.addEventListener('touchstart', handleTouchStart, { passive: true });
    elements.mainContent.addEventListener('touchmove', handleTouchMove, { passive: true });
    elements.mainContent.addEventListener('touchend', handleTouchEnd, { passive: true });
    elements.mainContent.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    // Mouse swipe support (for desktop testing)
    elements.mainContent.addEventListener('mousedown', handleMouseDown);

    // Form submission
    elements.docForm.addEventListener('submit', handleFormSubmit);

    // Export button
    elements.exportBtn.addEventListener('click', openBottomSheet);

    // Bottom sheet
    elements.bottomSheetOverlay.addEventListener('click', closeBottomSheetFunc);
    elements.closeBottomSheet.addEventListener('click', closeBottomSheetFunc);
    elements.exportOptions.forEach(option => {
      option.addEventListener('click', handleExport);
    });

    // Refresh preview
    elements.refreshPreview.addEventListener('click', refreshPreview);

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyDown);

    // Handle visibility change (pause swipe when hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        state.isSwiping = false;
      }
    });

    // Prevent double-tap zoom on buttons
    const buttons = document.querySelectorAll('button, .touch-target');
    buttons.forEach(btn => {
      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        btn.click();
      });
    });
  }

  /**
   * Navigate to a specific step
   */
  function goToStep(step) {
    if (step < 1 || step > 2) return;
    if (step === 2 && !validateForm()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    state.currentStep = step;
    updateStepper(step);
    updatePanels(step);
    updateFab(step);
    
    // Announce step change to screen readers
    announceStepChange(step);
  }

  /**
   * Toggle between steps using FAB
   */
  function toggleStep() {
    const targetStep = state.currentStep === 1 ? 2 : 1;
    goToStep(targetStep);
  }

  /**
   * Update stepper visual state
   */
  function updateStepper(step) {
    elements.steps.forEach((s, index) => {
      const stepNum = index + 1;
      s.classList.toggle('active', stepNum === step);
      s.setAttribute('aria-current', stepNum === step ? 'step' : 'false');
    });
  }

  /**
   * Update panel visibility with animation
   */
  function updatePanels(step) {
    if (step === 1) {
      elements.formStep.classList.add('active');
      elements.formStep.removeAttribute('hidden');
      elements.previewStep.classList.remove('active');
      setTimeout(() => {
        if (state.currentStep !== 2) {
          elements.previewStep.setAttribute('hidden', '');
        }
      }, 300);
    } else {
      elements.previewStep.removeAttribute('hidden');
      // Small delay to allow display:block to apply
      requestAnimationFrame(() => {
        elements.previewStep.classList.add('active');
        elements.formStep.classList.remove('active');
        setTimeout(() => {
          if (state.currentStep !== 1) {
            elements.formStep.setAttribute('hidden', '');
          }
        }, 300);
      });
      updatePreviewContent();
    }
  }

  /**
   * Update floating action button
   */
  function updateFab(step) {
    const fab = elements.stepToggle;
    if (step === 1) {
      fab.setAttribute('data-target', 'preview');
      fab.setAttribute('aria-label', 'Switch to preview');
      fab.querySelector('.fab-text').textContent = 'Preview';
      fab.querySelector('.fab-icon').innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      `;
    } else {
      fab.setAttribute('data-target', 'form');
      fab.setAttribute('aria-label', 'Back to form');
      fab.querySelector('.fab-text').textContent = 'Back';
      fab.querySelector('.fab-icon').innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
      `;
    }
  }

  /**
   * Touch event handlers for swipe
   */
  function handleTouchStart(e) {
    if (state.bottomSheetOpen) return;
    
    const touch = e.touches[0];
    state.startX = touch.clientX;
    state.startY = touch.clientY;
    state.touchStartTime = Date.now();
    state.isSwiping = true;
    state.deltaX = 0;
    state.deltaY = 0;
  }

  function handleTouchMove(e) {
    if (!state.isSwiping || state.bottomSheetOpen) return;

    const touch = e.touches[0];
    state.deltaX = touch.clientX - state.startX;
    state.deltaY = touch.clientY - state.startY;

    // Check if scrolling vertically - if so, don't swipe
    if (Math.abs(state.deltaY) > Math.abs(state.deltaX) && Math.abs(state.deltaY) > TOUCH_SLOP) {
      state.isSwiping = false;
      return;
    }

    // Add visual feedback during swipe
    if (Math.abs(state.deltaX) > SWIPE_THRESHOLD / 2) {
      const direction = state.deltaX > 0 ? 'right' : 'left';
      const canSwipe = (direction === 'right' && state.currentStep === 1) ||
                       (direction === 'left' && state.currentStep === 2);
      
      if (canSwipe) {
        elements.mainContent.style.transform = `translateX(${state.deltaX * 0.1}px)`;
      }
    }
  }

  function handleTouchEnd(e) {
    if (!state.isSwiping) return;
    
    state.isSwiping = false;
    elements.mainContent.style.transform = '';

    const elapsed = Date.now() - state.touchStartTime;
    const absDeltaX = Math.abs(state.deltaX);
    const absDeltaY = Math.abs(state.deltaY);

    // Check if valid swipe
    if (absDeltaX < SWIPE_THRESHOLD && elapsed > SWIPE_TIME_THRESHOLD) return;
    if (absDeltaY > absDeltaX * 0.8) return; // More vertical than horizontal

    // Swipe right: go to preview (step 2)
    if (state.deltaX > SWIPE_THRESHOLD && state.currentStep === 1) {
      if (validateForm()) {
        goToStep(2);
      } else {
        showToast('Please fill in all fields first', 'error');
      }
    }
    // Swipe left: go back to form (step 1)
    else if (state.deltaX < -SWIPE_THRESHOLD && state.currentStep === 2) {
      goToStep(1);
    }
  }

  /**
   * Mouse event handlers for desktop swipe testing
   */
  function handleMouseDown(e) {
    if (state.bottomSheetOpen) return;
    
    state.startX = e.clientX;
    state.startY = e.clientY;
    state.touchStartTime = Date.now();
    state.isSwiping = true;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  function handleMouseMove(e) {
    if (!state.isSwiping) return;
    state.deltaX = e.clientX - state.startX;
    state.deltaY = e.clientY - state.startY;
  }

  function handleMouseUp(e) {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    handleTouchEnd(e);
  }

  /**
   * Validate form before going to preview
   */
  function validateForm() {
    const template = document.getElementById('template').value;
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    return template && title && content;
  }

  /**
   * Handle form submission
   */
  function handleFormSubmit(e) {
    e.preventDefault();
    if (validateForm()) {
      goToStep(2);
    } else {
      showToast('Please fill in all required fields', 'error');
    }
  }

  /**
   * Update preview content with form data
   */
  function updatePreviewContent() {
    const title = document.getElementById('title').value.trim() || 'Untitled Document';
    const content = document.getElementById('content').value.trim();
    const template = document.getElementById('template').value;
    const aiEnhance = document.getElementById('aiEnhance').checked;
    
    elements.previewTitle.textContent = title;
    
    // Convert line breaks to paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    let bodyHtml = paragraphs.map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('');
    
    // Add AI enhancement note if enabled
    if (aiEnhance) {
      bodyHtml += `<p><em>✨ Enhanced with AI</em></p>`;
    }
    
    elements.previewBody.innerHTML = bodyHtml || '<p>No content provided.</p>';
    
    // Update timestamp
    const now = new Date();
    elements.lastUpdated.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    elements.lastUpdated.setAttribute('datetime', now.toISOString());
  }

  /**
   * Refresh preview
   */
  function refreshPreview() {
    updatePreviewContent();
    showToast('Preview updated', 'success');
  }

  /**
   * Bottom Sheet Functions
   */
  function openBottomSheet() {
    state.bottomSheetOpen = true;
    elements.bottomSheet.removeAttribute('hidden');
    elements.bottomSheetOverlay.classList.add('active');
    
    requestAnimationFrame(() => {
      elements.bottomSheet.classList.add('active');
    });

    // Focus first option for accessibility
    setTimeout(() => {
      elements.exportOptions[0]?.focus();
    }, 100);

    // Trap focus in bottom sheet
    trapFocus(elements.bottomSheet);
  }

  function closeBottomSheetFunc() {
    state.bottomSheetOpen = false;
    elements.bottomSheet.classList.remove('active');
    elements.bottomSheetOverlay.classList.remove('active');
    
    setTimeout(() => {
      elements.bottomSheet.setAttribute('hidden', '');
      // Return focus to trigger button
      elements.exportBtn?.focus();
    }, 300);
  }

  /**
   * Handle export option selection
   */
  function handleExport(e) {
    const format = e.currentTarget.dataset.format;
    const formatNames = {
      pdf: 'PDF',
      docx: 'Word',
      md: 'Markdown',
      txt: 'Text'
    };
    
    closeBottomSheetFunc();
    
    setTimeout(() => {
      showToast(`Exporting as ${formatNames[format]}...`, 'success');
      
      // Simulate download delay
      setTimeout(() => {
        showToast(`Downloaded as ${formatNames[format]}`, 'success');
      }, 1500);
    }, 300);
  }

  /**
   * Keyboard navigation
   */
  function handleKeyDown(e) {
    // ESC closes bottom sheet
    if (e.key === 'Escape' && state.bottomSheetOpen) {
      closeBottomSheetFunc();
      return;
    }

    // Arrow keys for step navigation
    if (e.key === 'ArrowRight' && state.currentStep === 1 && !state.bottomSheetOpen) {
      e.preventDefault();
      if (validateForm()) {
        goToStep(2);
      }
    }
    if (e.key === 'ArrowLeft' && state.currentStep === 2 && !state.bottomSheetOpen) {
      e.preventDefault();
      goToStep(1);
    }
  }

  /**
   * Focus trap for modal
   */
  function trapFocus(element) {
    const focusable = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    element.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    });
  }

  /**
   * Show/hide swipe hint
   */
  function showSwipeHint() {
    elements.swipeHint.classList.add('show');
    setTimeout(() => {
      elements.swipeHint.classList.remove('show');
    }, 3000);
  }

  /**
   * Toast notification
   */
  function showToast(message, type = 'info') {
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type}`;
    elements.toast.classList.add('show');

    setTimeout(() => {
      elements.toast.classList.remove('show');
    }, 3000);
  }

  /**
   * Announce step change to screen readers
   */
  function announceStepChange(step) {
    const stepNames = { 1: 'Form step', 2: 'Preview step' };
    elements.toast.textContent = `Now on ${stepNames[step]}`;
    elements.toast.setAttribute('role', 'status');
    
    // Use aria-live region for announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = `Navigated to ${stepNames[step]}`;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
