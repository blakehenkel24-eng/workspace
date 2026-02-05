/**
 * SlideTheory v2.0 - Frontend Application
 * MBB-Inspired Slide Generation with Knowledge Base
 */

// ============================================
// STATE MANAGEMENT
// ============================================

const state = {
  version: 'v2',
  isGenerating: false,
  currentSlide: null,
  presentationMode: 'presentation', // 'presentation' or 'read'
  templates: {}
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
  loadingOverlay: document.getElementById('loadingOverlay'),
  loadingSteps: document.getElementById('loadingSteps'),
  slideImage: document.getElementById('slideImage'),
  actionBar: document.getElementById('actionBar'),
  regenerateBtn: document.getElementById('regenerateBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  downloadMenu: document.getElementById('downloadMenu'),
  errorContainer: document.getElementById('errorContainer'),
  toastContainer: document.getElementById('toastContainer'),
  shortcutsModal: document.getElementById('shortcutsModal'),
  modalClose: document.getElementById('modalClose'),
  versionBtns: document.querySelectorAll('.version-btn'),
  toggleVersionBtn: document.getElementById('toggleVersionBtn')
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
// INITIALIZATION
// ============================================

async function init() {
  await loadV2Templates();
  setupEventListeners();
  validateV2Form();
  
  // Check URL for version preference
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
  v2Elements.slideType?.addEventListener('change', updateSlideTypeHint);
  v2Elements.audience?.addEventListener('change', validateV2Form);
  v2Elements.keyTakeaway?.addEventListener('input', () => {
    updateCharCounter(v2Elements.keyTakeaway, v2Elements.counters.keyTakeaway, 150);
    validateV2Form();
  });
  v2Elements.context?.addEventListener('input', () => {
    updateCharCounter(v2Elements.context, v2Elements.counters.context, 2000);
    validateV2Form();
  });
  v2Elements.dataFile?.addEventListener('change', handleFileUpload);
  
  // Presentation mode toggles
  v2Elements.toggles.presentation?.addEventListener('click', () => setPresentationMode('presentation'));
  v2Elements.toggles.read?.addEventListener('click', () => setPresentationMode('read'));
  
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
  
  sharedElements.downloadBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    sharedElements.downloadMenu?.classList.toggle('open');
  });
  
  document.querySelectorAll('.dropdown-item[data-format]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      handleDownload(item.dataset.format);
      sharedElements.downloadMenu?.classList.remove('open');
    });
  });
  
  document.addEventListener('click', () => {
    sharedElements.downloadMenu?.classList.remove('open');
  });
  
  // Modal
  document.getElementById('helpBtn')?.addEventListener('click', () => {
    sharedElements.shortcutsModal?.classList.remove('hidden');
  });
  
  sharedElements.modalClose?.addEventListener('click', closeModal);
  sharedElements.shortcutsModal?.querySelector('.modal-backdrop')?.addEventListener('click', closeModal);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard);
}

// ============================================
// VERSION SWITCHING
// ============================================

function switchVersion(version) {
  state.version = version;
  
  // Update toggle buttons
  sharedElements.versionBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.version === version);
  });
  
  // Show/hide forms
  v2Form?.classList.toggle('hidden', version !== 'v2');
  v1Form?.classList.toggle('hidden', version !== 'v1');
  
  // Update URL
  const url = new URL(window.location);
  if (version === 'v1') {
    url.searchParams.set('version', 'v1');
  } else {
    url.searchParams.delete('version');
  }
  window.history.replaceState({}, '', url);
  
  // Update toggle button text
  if (sharedElements.toggleVersionBtn) {
    sharedElements.toggleVersionBtn.innerHTML = `<span style="font-size: 11px; font-weight: 600;">${version === 'v2' ? 'V1' : 'V2'}</span>`;
    sharedElements.toggleVersionBtn.title = `Switch to ${version === 'v2' ? 'v1' : 'v2'}`;
  }
  
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
  const isValid = 
    v2Elements.slideType?.value &&
    v2Elements.audience?.value &&
    v2Elements.keyTakeaway?.value.length >= 5 &&
    v2Elements.context?.value.length >= 10;
  
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
    
    // Read file content
    const reader = new FileReader();
    reader.onload = (event) => {
      if (v2Elements.dataInput) {
        v2Elements.dataInput.value = event.target.result;
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
  
  const requestData = {
    slideType: v2Elements.slideType.value,
    audience: v2Elements.audience.value,
    context: v2Elements.context.value,
    keyTakeaway: v2Elements.keyTakeaway.value,
    presentationMode: state.presentationMode,
    dataInput: v2Elements.dataInput.value
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
  
  // Update button
  const btn = state.version === 'v2' ? v2Elements.generateBtn : v1Elements.generateBtn;
  const icon = state.version === 'v2' ? v2Elements.generateIcon : null;
  const text = state.version === 'v2' ? v2Elements.generateText : null;
  
  if (btn) btn.disabled = true;
  if (text) text.textContent = 'Generating...';
  if (icon) icon.classList.add('spinning');
  
  // Show loading overlay
  sharedElements.emptyState?.classList.add('hidden');
  sharedElements.slideImage?.classList.add('hidden');
  sharedElements.loadingOverlay?.classList.remove('hidden');
  sharedElements.actionBar.style.display = 'none';
  
  // Animate loading steps
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
  
  // Reset button
  const btn = state.version === 'v2' ? v2Elements.generateBtn : v1Elements.generateBtn;
  const icon = state.version === 'v2' ? v2Elements.generateIcon : null;
  const text = state.version === 'v2' ? v2Elements.generateText : null;
  
  if (btn) btn.disabled = false;
  if (text) text.textContent = 'Generate Slide';
  if (icon) icon.classList.remove('spinning');
  
  // Hide loading
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
  state.currentSlide = data;
  
  sharedElements.slideImage.src = data.imageUrl;
  sharedElements.slideImage.classList.remove('hidden');
  sharedElements.previewContainer.classList.remove('slide-preview--empty');
  sharedElements.actionBar.style.display = 'flex';
  
  stopLoading();
}

function showEmptyState() {
  sharedElements.slideImage?.classList.add('hidden');
  sharedElements.emptyState?.classList.remove('hidden');
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
    showError('Download Failed', 'Could not download the slide.');
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
    
    // Download file
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
    showError('Export Failed', error.message);
  }
}

// ============================================
// FEEDBACK & MESSAGES
// ============================================

function showError(title, message) {
  if (!sharedElements.errorContainer) return;
  
  sharedElements.errorContainer.innerHTML = `
    <div class="alert alert--error">
      <div class="alert__title">${title}</div>
      <div class="alert__message">${message}</div>
    </div>
  `;
  sharedElements.errorContainer.classList.remove('hidden');
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
  sharedElements.toastContainer.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}

function closeModal() {
  sharedElements.shortcutsModal?.classList.add('hidden');
  sharedElements.downloadMenu?.classList.remove('open');
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
  
  // Help: ?
  if (e.key === '?' && !e.ctrlKey && !e.shiftKey) {
    e.preventDefault();
    sharedElements.shortcutsModal?.classList.remove('hidden');
  }
  
  // Close modal: Esc
  if (e.key === 'Escape') {
    closeModal();
  }
}

// ============================================
// START APP
// ============================================

document.addEventListener('DOMContentLoaded', init);
