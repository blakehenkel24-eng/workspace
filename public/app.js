/**
 * SlideTheory v2.0 - Frontend Application
 * MBB-Inspired Slide Generation with Knowledge Base
 * Enhanced with: Auto-save, Undo/Redo, Compare View, Skeleton Loading
 */

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  MAX_INPUT_LENGTH: 10000,
  LONG_INPUT_THRESHOLD: 3000,
  AUTOSAVE_DELAY: 2000,
  AUTOSAVE_KEY: 'slidetheory_draft_v2',
  MAX_HISTORY_SIZE: 50
};

// ============================================
// STATE MANAGEMENT
// ============================================

const state = {
  version: 'v2',
  isGenerating: false,
  currentSlide: null,
  previousSlide: null, // For compare view
  presentationMode: 'presentation',
  templates: {},
  currentJobId: null,
  progressEventSource: null,
  
  // Undo/Redo history
  history: [],
  historyIndex: -1,
  isUndoingRedoing: false,
  
  // Auto-save
  autosaveTimer: null,
  hasUnsavedChanges: false
};

// ============================================
// DOM ELEMENTS - V2
// ============================================

const v2Form = document.getElementById('slideFormV2');
const v2Elements = {
  slideType: document.getElementById('slideTypeV2'),
  audience: document.getElementById('audienceV2'),
  keyTakeaway: document.getElementById('keyTakeawayV2'),
  context: document.getElementById('contextV2'),
  dataInput: document.getElementById('dataInputV2'),
  dataFile: document.getElementById('dataFileV2'),
  generateBtn: document.getElementById('generateBtnV2'),
  generateIcon: document.getElementById('generateIconV2'),
  generateText: document.getElementById('generateTextV2'),
  fileName: document.getElementById('fileNameV2'),
  counters: {
    keyTakeaway: document.getElementById('keyTakeawayCounterV2'),
    context: document.getElementById('contextCounterV2')
  },
  hints: {
    slideType: document.getElementById('slideTypeHintV2'),
    audience: document.getElementById('audienceHintV2')
  },
  toggles: {
    presentation: document.getElementById('modePresentationV2'),
    read: document.getElementById('modeReadV2')
  },
  warnings: {
    context: document.getElementById('contextWarning')
  }
};

// ============================================
// DOM ELEMENTS - V1 (LEGACY)
// ============================================

const v1Form = document.getElementById('slideFormV1');
const v1Elements = {
  slideType: document.getElementById('slideTypeV1'),
  context: document.getElementById('contextV1'),
  dataPoints: document.getElementById('dataPointsV1'),
  audience: document.getElementById('audienceV1'),
  framework: document.getElementById('frameworkV1'),
  generateBtn: document.getElementById('generateBtnV1'),
  counter: document.getElementById('contextCounterV1')
};

// ============================================
// DOM ELEMENTS - SHARED
// ============================================

const sharedElements = {
  previewContainer: document.getElementById('previewContainer'),
  emptyState: document.getElementById('emptyState'),
  skeletonState: document.getElementById('skeletonState'),
  loadingOverlay: document.getElementById('loadingOverlay'),
  loadingSteps: document.getElementById('loadingSteps'),
  slideImage: document.getElementById('slideImage'),
  actionBar: document.getElementById('actionBar'),
  regenerateBtn: document.getElementById('regenerateBtn'),
  compareBtn: document.getElementById('compareBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  downloadMenu: document.getElementById('downloadMenu'),
  errorContainer: document.getElementById('errorContainer'),
  toastContainer: document.getElementById('toastContainer'),
  shortcutsModal: document.getElementById('shortcutsModal'),
  modalClose: document.getElementById('modalClose'),
  versionBtns: document.querySelectorAll('.version-btn'),
  toggleVersionBtn: document.getElementById('toggleVersionBtn'),
  statusAnnouncer: document.getElementById('statusAnnouncer'),
  successOverlay: document.getElementById('successOverlay'),
  truncatedNotice: document.getElementById('truncatedNotice'),
  
  // New elements
  recoveryBanner: document.getElementById('recoveryBanner'),
  discardRecoveryBtn: document.getElementById('discardRecoveryBtn'),
  restoreRecoveryBtn: document.getElementById('restoreRecoveryBtn'),
  autosaveIndicator: document.getElementById('autosaveIndicator'),
  autosaveText: document.getElementById('autosaveText'),
  undoBtn: document.getElementById('undoBtn'),
  redoBtn: document.getElementById('redoBtn'),
  resetBtn: document.getElementById('resetBtn'),
  compareModal: document.getElementById('compareModal'),
  compareModalClose: document.getElementById('compareModalClose'),
  compareCloseBtn: document.getElementById('compareCloseBtn'),
  compareUseOldBtn: document.getElementById('compareUseOldBtn'),
  compareOldImage: document.getElementById('compareOldImage'),
  compareNewImage: document.getElementById('compareNewImage')
};

// ============================================
// LOADING STEPS
// ============================================

const loadingStepMessages = [
  'Analyzing context...',
  'Selecting optimal template...',
  'Synthesizing content...',
  'Applying MBB styling...',
  'Finalizing slide...'
];

let loadingStepInterval = null;

// ============================================
// FOCUS TRAP FOR MODALS
// ============================================

function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  element.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  });
}

let lastFocusedElement = null;

function openModal(modalElement) {
  lastFocusedElement = document.activeElement;
  modalElement.classList.remove('hidden');
  trapFocus(modalElement);
  const firstFocusable = modalElement.querySelector('button, [href], input, select, textarea');
  if (firstFocusable) {
    firstFocusable.focus();
  }
}

function closeModalFunc(modalElement = null) {
  if (modalElement) {
    modalElement.classList.add('hidden');
  } else {
    sharedElements.shortcutsModal?.classList.add('hidden');
    sharedElements.compareModal?.classList.add('hidden');
    sharedElements.downloadMenu?.classList.remove('open');
  }
  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

// ============================================
// STATUS ANNOUNCEMENTS
// ============================================

function announceStatus(message) {
  if (sharedElements.statusAnnouncer) {
    sharedElements.statusAnnouncer.textContent = message;
    setTimeout(() => {
      if (sharedElements.statusAnnouncer) {
        sharedElements.statusAnnouncer.textContent = '';
      }
    }, 1000);
  }
}

// ============================================
// INITIALIZATION
// ============================================

async function init() {
  await loadV2Templates();
  setupEventListeners();
  setupAutoSave();
  setupHistory();
  validateV2Form();
  checkForRecoveredData();
  
  const params = new URLSearchParams(window.location.search);
  if (params.get('version') === 'v1') {
    switchVersion('v1');
  }
}

async function loadV2Templates() {
  try {
    const response = await fetch('/api/v2/templates');
    const data = await response.json();
    
    if (data.success) {
      data.templates.forEach(t => {
        state.templates[t.id] = t;
      });
    }
  } catch (error) {
    console.error('Failed to load v2 templates:', error);
  }
}

// ============================================
// AUTO-SAVE FUNCTIONALITY
// ============================================

function setupAutoSave() {
  const inputs = [
    v2Elements.slideType,
    v2Elements.audience,
    v2Elements.keyTakeaway,
    v2Elements.context,
    v2Elements.dataInput
  ];
  
  inputs.forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        state.hasUnsavedChanges = true;
        scheduleAutoSave();
      });
      input.addEventListener('change', () => {
        state.hasUnsavedChanges = true;
        saveToLocalStorage();
      });
    }
  });
}

function scheduleAutoSave() {
  updateAutosaveIndicator('saving');
  
  if (state.autosaveTimer) {
    clearTimeout(state.autosaveTimer);
  }
  
  state.autosaveTimer = setTimeout(() => {
    saveToLocalStorage();
  }, CONFIG.AUTOSAVE_DELAY);
}

function saveToLocalStorage() {
  try {
    const data = {
      version: state.version,
      slideType: v2Elements.slideType?.value || '',
      audience: v2Elements.audience?.value || '',
      keyTakeaway: v2Elements.keyTakeaway?.value || '',
      context: v2Elements.context?.value || '',
      dataInput: v2Elements.dataInput?.value || '',
      presentationMode: state.presentationMode,
      timestamp: Date.now()
    };
    
    localStorage.setItem(CONFIG.AUTOSAVE_KEY, JSON.stringify(data));
    state.hasUnsavedChanges = false;
    updateAutosaveIndicator('saved');
  } catch (error) {
    console.error('Failed to auto-save:', error);
    updateAutosaveIndicator('error');
  }
}

function updateAutosaveIndicator(status) {
  if (!sharedElements.autosaveIndicator || !sharedElements.autosaveText) return;
  
  sharedElements.autosaveIndicator.classList.remove('saving', 'saved', 'error');
  
  switch (status) {
    case 'saving':
      sharedElements.autosaveIndicator.classList.add('saving');
      sharedElements.autosaveText.textContent = 'Saving...';
      break;
    case 'saved':
      sharedElements.autosaveIndicator.classList.add('saved');
      sharedElements.autosaveText.textContent = 'Auto-saved';
      break;
    case 'error':
      sharedElements.autosaveIndicator.classList.add('error');
      sharedElements.autosaveText.textContent = 'Save failed';
      break;
    default:
      sharedElements.autosaveText.textContent = 'Auto-save';
  }
}

function checkForRecoveredData() {
  try {
    const saved = localStorage.getItem(CONFIG.AUTOSAVE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      const age = Date.now() - data.timestamp;
      
      // Only show recovery if data is less than 7 days old and not empty
      if (age < 7 * 24 * 60 * 60 * 1000 && hasFormData(data)) {
        showRecoveryBanner(data);
      }
    }
  } catch (error) {
    console.error('Failed to check for recovered data:', error);
  }
}

function hasFormData(data) {
  return data.slideType || data.keyTakeaway || data.context;
}

function showRecoveryBanner(data) {
  if (!sharedElements.recoveryBanner) return;
  
  sharedElements.recoveryBanner.classList.remove('hidden');
  
  sharedElements.discardRecoveryBtn?.addEventListener('click', () => {
    localStorage.removeItem(CONFIG.AUTOSAVE_KEY);
    sharedElements.recoveryBanner.classList.add('hidden');
    showToast('Recovered data discarded', 'info');
  });
  
  sharedElements.restoreRecoveryBtn?.addEventListener('click', () => {
    restoreFormData(data);
    sharedElements.recoveryBanner.classList.add('hidden');
    showToast('Previous session restored', 'success');
  });
}

function restoreFormData(data) {
  if (data.version === 'v1') {
    switchVersion('v1');
    v1Elements.slideType.value = data.slideType || '';
    v1Elements.context.value = data.context || '';
    v1Elements.dataPoints.value = data.dataInput || '';
    v1Elements.audience.value = data.audience || '';
    validateV1Form();
  } else {
    v2Elements.slideType.value = data.slideType || '';
    v2Elements.audience.value = data.audience || '';
    v2Elements.keyTakeaway.value = data.keyTakeaway || '';
    v2Elements.context.value = data.context || '';
    v2Elements.dataInput.value = data.dataInput || '';
    setPresentationMode(data.presentationMode || 'presentation');
    validateV2Form();
    updateCharCounters();
  }
  
  pushToHistory();
}

function updateCharCounters() {
  updateCharCounter(v2Elements.keyTakeaway, v2Elements.counters.keyTakeaway, 150);
  updateCharCounter(v2Elements.context, v2Elements.counters.context, 10000);
  checkLongInput(v2Elements.context, v2Elements.warnings.context);
}

// ============================================
// UNDO/REDO HISTORY
// ============================================

function setupHistory() {
  const inputs = [
    v2Elements.slideType,
    v2Elements.audience,
    v2Elements.keyTakeaway,
    v2Elements.context,
    v2Elements.dataInput
  ];
  
  inputs.forEach(input => {
    if (input) {
      input.addEventListener('change', () => {
        if (!state.isUndoingRedoing) {
          pushToHistory();
        }
      });
    }
  });
  
  // Initial state
  pushToHistory();
  
  // Button handlers
  sharedElements.undoBtn?.addEventListener('click', undo);
  sharedElements.redoBtn?.addEventListener('click', redo);
  sharedElements.resetBtn?.addEventListener('click', resetForm);
}

function getFormState() {
  return {
    version: state.version,
    slideType: v2Elements.slideType?.value || '',
    audience: v2Elements.audience?.value || '',
    keyTakeaway: v2Elements.keyTakeaway?.value || '',
    context: v2Elements.context?.value || '',
    dataInput: v2Elements.dataInput?.value || '',
    presentationMode: state.presentationMode
  };
}

function pushToHistory() {
  const currentState = getFormState();
  
  // Don't push duplicate states
  if (state.historyIndex >= 0) {
    const lastState = state.history[state.historyIndex];
    if (JSON.stringify(lastState) === JSON.stringify(currentState)) {
      return;
    }
  }
  
  // Remove any future history if we're in the middle
  if (state.historyIndex < state.history.length - 1) {
    state.history = state.history.slice(0, state.historyIndex + 1);
  }
  
  state.history.push(currentState);
  
  // Limit history size
  if (state.history.length > CONFIG.MAX_HISTORY_SIZE) {
    state.history.shift();
  } else {
    state.historyIndex++;
  }
  
  updateHistoryButtons();
}

function undo() {
  if (state.historyIndex > 0) {
    state.historyIndex--;
    restoreHistoryState(state.history[state.historyIndex]);
    showToast('Undo', 'info');
  }
}

function redo() {
  if (state.historyIndex < state.history.length - 1) {
    state.historyIndex++;
    restoreHistoryState(state.history[state.historyIndex]);
    showToast('Redo', 'info');
  }
}

function restoreHistoryState(historyState) {
  state.isUndoingRedoing = true;
  
  if (historyState.version !== state.version) {
    switchVersion(historyState.version);
  }
  
  if (historyState.version === 'v1') {
    v1Elements.slideType.value = historyState.slideType || '';
    v1Elements.context.value = historyState.context || '';
    v1Elements.dataPoints.value = historyState.dataInput || '';
    v1Elements.audience.value = historyState.audience || '';
    validateV1Form();
  } else {
    v2Elements.slideType.value = historyState.slideType || '';
    v2Elements.audience.value = historyState.audience || '';
    v2Elements.keyTakeaway.value = historyState.keyTakeaway || '';
    v2Elements.context.value = historyState.context || '';
    v2Elements.dataInput.value = historyState.dataInput || '';
    setPresentationMode(historyState.presentationMode || 'presentation');
    validateV2Form();
    updateCharCounters();
  }
  
  updateHistoryButtons();
  
  setTimeout(() => {
    state.isUndoingRedoing = false;
  }, 0);
}

function updateHistoryButtons() {
  if (sharedElements.undoBtn) {
    sharedElements.undoBtn.disabled = state.historyIndex <= 0;
  }
  if (sharedElements.redoBtn) {
    sharedElements.redoBtn.disabled = state.historyIndex >= state.history.length - 1;
  }
}

function resetForm() {
  if (confirm('Reset all form fields? This cannot be undone.')) {
    v2Form?.reset();
    v1Form?.reset();
    pushToHistory();
    validateV2Form();
    validateV1Form();
    showToast('Form reset', 'info');
  }
}

// ============================================
// LONG INPUT HANDLING
// ============================================

function checkLongInput(input, warningElement) {
  if (!input || !warningElement) return;
  
  const length = input.value.length;
  
  if (length > CONFIG.LONG_INPUT_THRESHOLD) {
    warningElement.classList.remove('hidden');
  } else {
    warningElement.classList.add('hidden');
  }
}

function truncateIfNeeded(text, maxLength = CONFIG.MAX_INPUT_LENGTH) {
  if (text.length <= maxLength) return { text, wasTruncated: false };
  
  // Try to truncate at a sentence boundary
  const truncated = text.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  const lastParagraph = truncated.lastIndexOf('\n\n');
  const lastBreak = Math.max(lastSentence, lastParagraph);
  
  if (lastBreak > maxLength * 0.8) {
    return { 
      text: truncated.substring(0, lastBreak + 1), 
      wasTruncated: true 
    };
  }
  
  return { text: truncated, wasTruncated: true };
}

function showTruncatedNotice() {
  if (sharedElements.truncatedNotice) {
    sharedElements.truncatedNotice.classList.remove('hidden');
    setTimeout(() => {
      sharedElements.truncatedNotice?.classList.add('hidden');
    }, 5000);
  }
}

// ============================================
// COMPARE VIEW
// ============================================

function showCompareView() {
  if (!state.previousSlide || !state.currentSlide) return;
  
  sharedElements.compareOldImage.src = state.previousSlide.imageUrl;
  sharedElements.compareNewImage.src = state.currentSlide.imageUrl;
  
  openModal(sharedElements.compareModal);
}

function useOldVersion() {
  if (!state.previousSlide) return;
  
  // Swap current and previous
  const temp = state.currentSlide;
  state.currentSlide = state.previousSlide;
  state.previousSlide = temp;
  
  // Update display
  sharedElements.slideImage.src = state.currentSlide.imageUrl;
  sharedElements.compareOldImage.src = state.previousSlide.imageUrl;
  sharedElements.compareNewImage.src = state.currentSlide.imageUrl;
  
  showToast('Restored previous version', 'success');
  closeModalFunc(sharedElements.compareModal);
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  // Version switching
  sharedElements.versionBtns.forEach(btn => {
    btn.addEventListener('click', () => switchVersion(btn.dataset.version));
  });
  
  sharedElements.toggleVersionBtn?.addEventListener('click', () => {
    const newVersion = state.version === 'v2' ? 'v1' : 'v2';
    switchVersion(newVersion);
  });
  
  // V2 Form
  v2Form?.addEventListener('submit', handleV2Submit);
  v2Elements.slideType?.addEventListener('change', () => {
    updateSlideTypeHint();
    pushToHistory();
  });
  v2Elements.audience?.addEventListener('change', () => {
    validateV2Form();
    pushToHistory();
  });
  v2Elements.keyTakeaway?.addEventListener('input', () => {
    updateCharCounter(v2Elements.keyTakeaway, v2Elements.counters.keyTakeaway, 150);
    validateV2Form();
  });
  v2Elements.context?.addEventListener('input', () => {
    updateCharCounter(v2Elements.context, v2Elements.counters.context, 10000);
    checkLongInput(v2Elements.context, v2Elements.warnings.context);
    validateV2Form();
  });
  v2Elements.dataFile?.addEventListener('change', handleFileUpload);
  
  // Presentation mode toggles
  v2Elements.toggles.presentation?.addEventListener('click', () => {
    setPresentationMode('presentation');
    pushToHistory();
  });
  v2Elements.toggles.read?.addEventListener('click', () => {
    setPresentationMode('read');
    pushToHistory();
  });
  
  // V1 Form (legacy)
  v1Form?.addEventListener('submit', handleV1Submit);
  v1Elements.context?.addEventListener('input', () => {
    const len = v1Elements.context.value.length;
    v1Elements.counter.textContent = `${len} / 500`;
    validateV1Form();
  });
  [v1Elements.slideType, v1Elements.audience].forEach(el => {
    el?.addEventListener('change', validateV1Form);
  });
  
  // Shared actions
  sharedElements.regenerateBtn?.addEventListener('click', () => {
    if (state.version === 'v2') {
      handleV2Submit(new Event('submit'));
    } else {
      handleV1Submit(new Event('submit'));
    }
  });
  
  sharedElements.compareBtn?.addEventListener('click', showCompareView);
  
  sharedElements.downloadBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = sharedElements.downloadMenu?.classList.toggle('open');
    sharedElements.downloadBtn?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  sharedElements.downloadMenu?.addEventListener('keydown', (e) => {
    const items = sharedElements.downloadMenu.querySelectorAll('[role="menuitem"]');
    const currentIndex = Array.from(items).indexOf(document.activeElement);
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      items[nextIndex].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      items[prevIndex].focus();
    } else if (e.key === 'Escape') {
      sharedElements.downloadMenu?.classList.remove('open');
      sharedElements.downloadBtn?.setAttribute('aria-expanded', 'false');
      sharedElements.downloadBtn?.focus();
    }
  });
  
  document.querySelectorAll('.dropdown-item[data-format]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      handleDownload(item.dataset.format);
      sharedElements.downloadMenu?.classList.remove('open');
      sharedElements.downloadBtn?.setAttribute('aria-expanded', 'false');
      sharedElements.downloadBtn?.focus();
    });
  });
  
  document.addEventListener('click', () => {
    sharedElements.downloadMenu?.classList.remove('open');
    sharedElements.downloadBtn?.setAttribute('aria-expanded', 'false');
  });
  
  // Modal
  document.getElementById('helpBtn')?.addEventListener('click', () => {
    if (sharedElements.shortcutsModal) {
      openModal(sharedElements.shortcutsModal);
    }
  });
  
  sharedElements.modalClose?.addEventListener('click', () => closeModalFunc(sharedElements.shortcutsModal));
  sharedElements.shortcutsModal?.querySelector('.modal-backdrop')?.addEventListener('click', () => closeModalFunc(sharedElements.shortcutsModal));
  
  // Compare modal
  sharedElements.compareModalClose?.addEventListener('click', () => closeModalFunc(sharedElements.compareModal));
  sharedElements.compareCloseBtn?.addEventListener('click', () => closeModalFunc(sharedElements.compareModal));
  sharedElements.compareUseOldBtn?.addEventListener('click', useOldVersion);
  sharedElements.compareModal?.querySelector('.modal-backdrop')?.addEventListener('click', () => closeModalFunc(sharedElements.compareModal));
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard);
  
  // Empty state quick templates
  document.querySelectorAll('.empty-state__template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const template = btn.dataset.template;
      const takeaway = btn.dataset.takeaway;
      
      v2Elements.slideType.value = template;
      v2Elements.keyTakeaway.value = takeaway;
      v2Elements.audience.value = 'C-Suite/Board';
      v2Elements.context.value = `This slide presents ${template.toLowerCase()} information for stakeholder review. Key insights and strategic recommendations are highlighted.`;
      
      updateSlideTypeHint();
      updateCharCounters();
      validateV2Form();
      pushToHistory();
      
      showToast('Template applied! Press Ctrl+Enter to generate.', 'success');
    });
  });
  
  // Cancel button
  document.getElementById('cancelBtn')?.addEventListener('click', cancelGeneration);
}

// ============================================
// VERSION SWITCHING
// ============================================

function switchVersion(version) {
  state.version = version;
  
  sharedElements.versionBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.version === version);
  });
  
  v2Form?.classList.toggle('hidden', version !== 'v2');
  v1Form?.classList.toggle('hidden', version !== 'v1');
  
  const url = new URL(window.location);
  if (version === 'v1') {
    url.searchParams.set('version', 'v1');
  } else {
    url.searchParams.delete('version');
  }
  window.history.replaceState({}, '', url);
  
  if (sharedElements.toggleVersionBtn) {
    sharedElements.toggleVersionBtn.innerHTML = `<span style="font-size: 11px; font-weight: 600;">${version === 'v2' ? 'V1' : 'V2'}</span>`;
    sharedElements.toggleVersionBtn.title = `Switch to ${version === 'v2' ? 'v1' : 'v2'}`;
  }
  
  pushToHistory();
  showToast(`Switched to ${version.toUpperCase()}`, 'success');
}

function setPresentationMode(mode) {
  state.presentationMode = mode;
  
  Object.values(v2Elements.toggles).forEach(btn => {
    btn?.classList.toggle('active', btn.dataset.mode === mode);
  });
}

// ============================================
// FORM VALIDATION
// ============================================

function validateV2Form() {
  const contextResult = truncateIfNeeded(v2Elements.context?.value || '');
  
  const isValid = 
    v2Elements.slideType?.value &&
    v2Elements.audience?.value &&
    v2Elements.keyTakeaway?.value.length >= 5 &&
    contextResult.text.length >= 10;
  
  if (v2Elements.generateBtn) {
    v2Elements.generateBtn.disabled = !isValid || state.isGenerating;
  }
}

function validateV1Form() {
  const isValid = 
    v1Elements.slideType?.value &&
    v1Elements.audience?.value &&
    v1Elements.context?.value.length >= 10;
  
  if (v1Elements.generateBtn) {
    v1Elements.generateBtn.disabled = !isValid || state.isGenerating;
  }
}

// ============================================
// UI HELPERS
// ============================================

function updateCharCounter(input, counter, max) {
  if (!input || !counter) return;
  const len = input.value.length;
  counter.textContent = `${len} / ${max}`;
  counter.classList.toggle('warning', len > max * 0.9);
  counter.classList.toggle('error', len >= max);
}

function updateSlideTypeHint() {
  const type = v2Elements.slideType?.value;
  const hints = {
    'Executive Summary': 'Top insight + 3 supporting points + recommendation',
    'Horizontal Flow': 'Left-to-right process, workflow, or timeline',
    'Vertical Flow': 'Top-to-bottom hierarchy, waterfall, or org chart',
    'Graph/Chart': 'Data visualization with insights panel',
    'General': 'Flexible multi-section layout'
  };
  
  if (v2Elements.hints.slideType) {
    v2Elements.hints.slideType.textContent = hints[type] || '';
  }
}

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (file && v2Elements.fileName) {
    v2Elements.fileName.textContent = file.name;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (v2Elements.dataInput) {
        v2Elements.dataInput.value = event.target.result;
        pushToHistory();
      }
    };
    reader.readAsText(file);
  }
}

// ============================================
// SLIDE GENERATION - V2
// ============================================

async function handleV2Submit(e) {
  e.preventDefault();
  if (state.isGenerating) return;
  
  clearError();
  
  // Handle long inputs
  const contextResult = truncateIfNeeded(v2Elements.context.value);
  if (contextResult.wasTruncated) {
    showTruncatedNotice();
  }
  
  const requestData = {
    slideType: v2Elements.slideType.value,
    audience: v2Elements.audience.value,
    context: contextResult.text,
    keyTakeaway: v2Elements.keyTakeaway.value,
    presentationMode: state.presentationMode,
    dataInput: truncateIfNeeded(v2Elements.dataInput.value).text
  };
  
  startLoading();
  
  try {
    const response = await fetch('/api/generate-slide-v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    
    const data = await response.json();
    
    if (!data.success) {
      // Handle missing/broken data gracefully
      if (data.missingFields || data.partialData) {
        showWarning('Some data was missing', data.message || 'Using available information to generate slide.');
      } else {
        throw new Error(data.message || 'Failed to generate slide');
      }
    }
    
    state.currentJobId = data.jobId;
    connectProgressSSE(data.jobId);
    await waitForCompletion(data.jobId);
    
    displaySlide(data);
    showToast('Slide generated successfully!', 'success');
    
    // Clear auto-save on successful generation
    localStorage.removeItem(CONFIG.AUTOSAVE_KEY);
    
  } catch (error) {
    if (error.message !== 'Request cancelled') {
      showError('Generation Failed', error.message);
    }
    stopLoading();
    showEmptyState();
  } finally {
    closeProgressSSE();
    state.currentJobId = null;
  }
}

async function waitForCompletion(jobId, maxAttempts = 60) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (!state.isGenerating) {
      throw new Error('Request cancelled');
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  throw new Error('Generation timed out');
}

// ============================================
// PROGRESS TRACKING (SSE)
// ============================================

function connectProgressSSE(jobId) {
  closeProgressSSE();
  
  const evtSource = new EventSource(`/api/progress/${jobId}`);
  state.progressEventSource = evtSource;
  
  evtSource.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data);
      handleProgressUpdate(data);
    } catch (error) {
      console.error('Failed to parse progress update:', error);
    }
  });
  
  evtSource.addEventListener('error', (error) => {
    console.error('SSE error:', error);
  });
  
  return evtSource;
}

function closeProgressSSE() {
  if (state.progressEventSource) {
    state.progressEventSource.close();
    state.progressEventSource = null;
  }
}

function handleProgressUpdate(data) {
  const { type, percent, stepLabel, estimateSeconds } = data;
  
  switch (type) {
    case 'connected':
      console.log('[Progress] Connected to job:', data.jobId);
      break;
      
    case 'progress':
      updateProgressBar(percent);
      
      if (stepLabel && sharedElements.loadingSteps) {
        let text = stepLabel;
        if (estimateSeconds && estimateSeconds > 0) {
          text += ` (~${estimateSeconds}s remaining)`;
        }
        sharedElements.loadingSteps.textContent = text;
      }
      break;
      
    case 'complete':
      closeProgressSSE();
      break;
      
    case 'error':
      closeProgressSSE();
      showWarning('Generation Warning', data.error || 'Some elements may be missing from the slide.');
      break;
      
    case 'cancelled':
      closeProgressSSE();
      showToast('Generation cancelled', 'info');
      stopLoading();
      break;
  }
}

function updateProgressBar(percent) {
  const progressBar = document.getElementById('loadingProgressBar');
  if (progressBar) {
    progressBar.style.width = `${percent}%`;
  }
}

async function cancelGeneration() {
  if (!state.currentJobId) return;
  
  try {
    const response = await fetch(`/api/progress/${state.currentJobId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      showToast('Cancelling...', 'info');
      state.isGenerating = false;
    }
  } catch (error) {
    console.error('Failed to cancel:', error);
  }
}

// ============================================
// SLIDE GENERATION - V1 (LEGACY)
// ============================================

async function handleV1Submit(e) {
  e.preventDefault();
  if (state.isGenerating) return;
  
  clearError();
  
  const dataPointsArray = v1Elements.dataPoints.value
    .split(/\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  const requestData = {
    slideType: v1Elements.slideType.value,
    context: v1Elements.context.value,
    dataPoints: dataPointsArray,
    targetAudience: v1Elements.audience.value,
    framework: v1Elements.framework.value || undefined
  };
  
  startLoading();
  
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to generate slide');
    }
    
    displaySlide(data);
    showToast('Slide generated successfully!', 'success');
    
  } catch (error) {
    showError('Generation Failed', error.message);
    stopLoading();
    showEmptyState();
  }
}

// ============================================
// LOADING STATES
// ============================================

function startLoading() {
  state.isGenerating = true;

  announceStatus('Generating slide, please wait...');

  const btn = state.version === 'v2' ? v2Elements.generateBtn : v1Elements.generateBtn;
  const icon = state.version === 'v2' ? v2Elements.generateIcon : null;
  const text = state.version === 'v2' ? v2Elements.generateText : null;

  if (btn) btn.disabled = true;
  if (text) text.textContent = 'Generating...';
  if (icon) icon.classList.add('spinning');

  // Show skeleton first, then loading overlay
  sharedElements.emptyState?.classList.add('hidden');
  sharedElements.slideImage?.classList.add('hidden');
  sharedElements.skeletonState?.classList.remove('hidden');
  sharedElements.loadingOverlay?.classList.add('hidden');
  sharedElements.actionBar.style.display = 'none';
  
  // After a brief delay, show the loading overlay with progress
  setTimeout(() => {
    if (state.isGenerating) {
      sharedElements.skeletonState?.classList.add('hidden');
      sharedElements.loadingOverlay?.classList.remove('hidden');
    }
  }, 800);

  let stepIndex = 0;
  if (sharedElements.loadingSteps) {
    sharedElements.loadingSteps.textContent = loadingStepMessages[0];
    loadingStepInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % loadingStepMessages.length;
      sharedElements.loadingSteps.textContent = loadingStepMessages[stepIndex];
    }, 1500);
  }
}

function stopLoading() {
  state.isGenerating = false;
  
  const btn = state.version === 'v2' ? v2Elements.generateBtn : v1Elements.generateBtn;
  const icon = state.version === 'v2' ? v2Elements.generateIcon : null;
  const text = state.version === 'v2' ? v2Elements.generateText : null;
  
  if (btn) btn.disabled = false;
  if (text) text.textContent = 'Generate Slide';
  if (icon) icon.classList.remove('spinning');
  
  sharedElements.skeletonState?.classList.add('hidden');
  sharedElements.loadingOverlay?.classList.add('hidden');
  
  if (loadingStepInterval) {
    clearInterval(loadingStepInterval);
    loadingStepInterval = null;
  }
}

// ============================================
// DISPLAY & DOWNLOAD
// ============================================

function displaySlide(data) {
  // Store previous slide for compare view
  if (state.currentSlide) {
    state.previousSlide = state.currentSlide;
  }
  
  state.currentSlide = data;

  sharedElements.slideImage.src = data.imageUrl;
  sharedElements.slideImage.classList.remove('hidden');
  sharedElements.previewContainer.classList.remove('slide-preview--empty');
  sharedElements.actionBar.style.display = 'flex';
  
  // Show compare button if we have a previous version
  if (state.previousSlide && sharedElements.compareBtn) {
    sharedElements.compareBtn.style.display = 'inline-flex';
  }

  showSuccessAnimation();

  announceStatus('Slide generated successfully!');

  stopLoading();
}

function showSuccessAnimation() {
  if (sharedElements.successOverlay) {
    sharedElements.successOverlay.classList.remove('hidden');
    setTimeout(() => {
      if (sharedElements.successOverlay) {
        sharedElements.successOverlay.classList.add('hidden');
      }
    }, 1500);
  }
}

function showEmptyState() {
  sharedElements.slideImage?.classList.add('hidden');
  sharedElements.emptyState?.classList.remove('hidden');
  sharedElements.skeletonState?.classList.add('hidden');
  sharedElements.previewContainer?.classList.add('slide-preview--empty');
  sharedElements.actionBar.style.display = 'none';
}

async function handleDownload(format) {
  if (!state.currentSlide) return;
  
  switch (format) {
    case 'png':
      downloadPNG();
      break;
    case 'pptx':
      await downloadExport('pptx');
      break;
    case 'pdf':
      await downloadExport('pdf');
      break;
  }
}

async function downloadPNG() {
  if (!state.currentSlide?.imageUrl) return;
  
  try {
    const response = await fetch(state.currentSlide.imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `slidetheory-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    window.URL.revokeObjectURL(url);
    showToast('PNG download started!', 'success');
  } catch (error) {
    showWarning('Download Issue', 'Could not download the slide. Please try again.');
  }
}

async function downloadExport(format) {
  if (!state.currentSlide?.content) return;
  
  showToast(`Generating ${format.toUpperCase()}...`, 'success');
  
  try {
    const endpoint = `/api/export/${format}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slideType: state.currentSlide.content._slideType || 'Executive Summary',
        content: state.currentSlide.content
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || `Failed to generate ${format}`);
    }
    
    const fileResponse = await fetch(data.downloadUrl);
    const blob = await fileResponse.blob();
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `slidetheory-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    window.URL.revokeObjectURL(url);
    showToast(`${format.toUpperCase()} download started!`, 'success');
    
  } catch (error) {
    showWarning('Export Issue', error.message);
  }
}

// ============================================
// FEEDBACK & MESSAGES
// ============================================

function showError(title, message) {
  if (!sharedElements.errorContainer) return;

  sharedElements.errorContainer.innerHTML = `
    <div class="alert alert--error" role="alert" aria-live="assertive">
      <div class="alert__title">${title}</div>
      <div class="alert__message">${message}</div>
    </div>
  `;
  sharedElements.errorContainer.classList.remove('hidden');

  announceStatus(`Error: ${title}. ${message}`);
}

function showWarning(title, message) {
  if (!sharedElements.errorContainer) return;

  sharedElements.errorContainer.innerHTML = `
    <div class="alert" role="alert" aria-live="polite" style="
      padding: var(--space-4);
      border-radius: var(--radius-md);
      border-left: 3px solid var(--warning-500);
      margin-bottom: var(--space-4);
      background: var(--warning-50);
    ">
      <div class="alert__title" style="font-weight: var(--font-semibold); font-size: var(--text-sm); margin-bottom: var(--space-1); color: var(--warning-700);">${title}</div>
      <div class="alert__message" style="font-size: var(--text-sm); color: var(--warning-600);">${message}</div>
    </div>
  `;
  sharedElements.errorContainer.classList.remove('hidden');

  announceStatus(`Warning: ${title}. ${message}`);
}

function clearError() {
  if (!sharedElements.errorContainer) return;
  sharedElements.errorContainer.innerHTML = '';
  sharedElements.errorContainer.classList.add('hidden');
}

function showToast(message, type = 'success') {
  if (!sharedElements.toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  sharedElements.toastContainer.appendChild(toast);

  announceStatus(message);

  setTimeout(() => toast.remove(), 3000);
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

function handleKeyboard(e) {
  // Generate: Ctrl+Enter
  if (e.ctrlKey && e.key === 'Enter' && !state.isGenerating) {
    e.preventDefault();
    if (state.version === 'v2') {
      v2Form?.dispatchEvent(new Event('submit'));
    } else {
      v1Form?.dispatchEvent(new Event('submit'));
    }
  }
  
  // Regenerate: Ctrl+R
  if (e.ctrlKey && e.key === 'r' && state.currentSlide && !state.isGenerating) {
    e.preventDefault();
    sharedElements.regenerateBtn?.click();
  }
  
  // Download PNG: Ctrl+D
  if (e.ctrlKey && e.key === 'd' && state.currentSlide) {
    e.preventDefault();
    downloadPNG();
  }
  
  // Undo: Ctrl+Z
  if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
    e.preventDefault();
    undo();
  }
  
  // Redo: Ctrl+Y or Ctrl+Shift+Z
  if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
    e.preventDefault();
    redo();
  }
  
  // Compare: Ctrl+Shift+C
  if (e.ctrlKey && e.shiftKey && e.key === 'C') {
    e.preventDefault();
    if (state.previousSlide) {
      showCompareView();
    } else {
      showToast('No previous version to compare', 'info');
    }
  }
  
  // Help: ?
  if (e.key === '?' && !e.ctrlKey && !e.shiftKey) {
    e.preventDefault();
    sharedElements.shortcutsModal?.classList.remove('hidden');
  }
  
  // Close modal: Esc
  if (e.key === 'Escape') {
    closeModalFunc();
    sharedElements.downloadMenu?.classList.remove('open');
    sharedElements.downloadBtn?.setAttribute('aria-expanded', 'false');
  }
}

// ============================================
// START APP
// ============================================

document.addEventListener('DOMContentLoaded', init);
