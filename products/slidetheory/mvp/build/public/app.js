/**
 * SlideTheory MVP - Frontend Application v2.0
 * With Templates and Multi-Format Export
 */

// DOM Elements
const form = document.getElementById('slideForm');
const generateBtn = document.getElementById('generateBtn');
const generateText = document.getElementById('generateText');
const generateIcon = document.getElementById('generateIcon');
const slideType = document.getElementById('slideType');
const context = document.getElementById('context');
const dataPoints = document.getElementById('dataPoints');
const audience = document.getElementById('audience');
const framework = document.getElementById('framework');
const contextCounter = document.getElementById('contextCounter');
const dataPointsCounter = document.getElementById('dataPointsCounter');
const errorContainer = document.getElementById('errorContainer');
const previewContainer = document.getElementById('previewContainer');
const emptyState = document.getElementById('emptyState');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingSteps = document.getElementById('loadingSteps');
const slideImage = document.getElementById('slideImage');
const actionBar = document.getElementById('actionBar');
const regenerateBtn = document.getElementById('regenerateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const downloadMenu = document.getElementById('downloadMenu');
const toastContainer = document.getElementById('toastContainer');
const templatesGrid = document.getElementById('templatesGrid');
const templatesToggle = document.getElementById('templatesToggle');
const helpBtn = document.getElementById('helpBtn');
const shortcutsModal = document.getElementById('shortcutsModal');
const modalClose = document.getElementById('modalClose');

// State
let isGenerating = false;
let currentSlideUrl = null;
let currentSlideContent = null;
let currentSlideType = null;
let loadingStepInterval = null;

// Loading steps
const loadingStepMessages = [
  'Analyzing context...',
  'Structuring content...',
  'Designing slide...',
  'Finalizing...'
];

// Initialize
async function init() {
  await loadTemplates();
  setupEventListeners();
  validateForm();
}

// ==================== TEMPLATES ====================

async function loadTemplates() {
  try {
    const response = await fetch('/api/templates');
    const data = await response.json();
    
    if (data.success && data.templates) {
      renderTemplates(data.templates);
    }
  } catch (error) {
    console.error('Failed to load templates:', error);
  }
}

function renderTemplates(templates) {
  // Use existing template cards in HTML but wire them up
  document.querySelectorAll('.template-card').forEach(card => {
    const templateId = card.dataset.template;
    
    card.addEventListener('click', () => loadTemplate(templateId));
  });
}

async function loadTemplate(templateId) {
  try {
    const response = await fetch(`/api/templates/${templateId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to load template');
    }
    
    const template = data.template;
    
    // Populate form
    slideType.value = template.slideType || '';
    context.value = template.context || '';
    dataPoints.value = template.dataPoints ? template.dataPoints.join('\n') : '';
    audience.value = template.targetAudience || '';
    framework.value = template.framework || '';
    
    // Update counters
    contextCounter.textContent = `${context.value.length} / 500`;
    dataPointsCounter.textContent = `${dataPoints.value.length} / 1000`;
    
    // Update hints
    updateSlideTypeHint();
    
    // Validate
    validateForm();
    
    showToast(`Loaded template: ${template.name}`);
    
    // Collapse templates section on mobile
    if (window.innerWidth <= 767) {
      templatesGrid.classList.add('collapsed');
      templatesToggle.classList.remove('open');
    }
    
  } catch (error) {
    showError('Template Error', error.message);
  }
}

// ==================== FORM HANDLING ====================

function setupEventListeners() {
  // Character counters
  context.addEventListener('input', () => {
    const len = context.value.length;
    contextCounter.textContent = `${len} / 500`;
    contextCounter.classList.toggle('warning', len > 450);
    contextCounter.classList.toggle('error', len >= 500);
    validateForm();
  });

  dataPoints.addEventListener('input', () => {
    const len = dataPoints.value.length;
    dataPointsCounter.textContent = `${len} / 1000`;
    dataPointsCounter.classList.toggle('warning', len > 900);
    dataPointsCounter.classList.toggle('error', len >= 1000);
  });

  // Form validation
  [slideType, context, audience].forEach(el => {
    el.addEventListener('change', () => {
      updateSlideTypeHint();
      validateForm();
    });
    el.addEventListener('input', validateForm);
  });

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    generateSlide();
  });

  // Templates toggle
  templatesToggle?.addEventListener('click', () => {
    templatesGrid.classList.toggle('collapsed');
    templatesToggle.classList.toggle('open');
  });

  // Regenerate button
  regenerateBtn.addEventListener('click', () => {
    generateSlide();
  });

  // Download dropdown
  downloadBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    downloadMenu.classList.toggle('open');
  });

  // Download format options
  document.querySelectorAll('.dropdown-item[data-format]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const format = item.dataset.format;
      handleDownload(format);
      downloadMenu.classList.remove('open');
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    downloadMenu.classList.remove('open');
  });

  // Help modal
  helpBtn?.addEventListener('click', () => {
    shortcutsModal.classList.remove('hidden');
  });

  modalClose?.addEventListener('click', () => {
    shortcutsModal.classList.add('hidden');
  });

  shortcutsModal?.querySelector('.modal-backdrop')?.addEventListener('click', () => {
    shortcutsModal.classList.add('hidden');
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard);
}

function updateSlideTypeHint() {
  const hints = {
    'Executive Summary': 'Best for: Board presentations, investor pitches, final recommendations',
    'Market Analysis': 'Best for: Market sizing, competitive landscape, growth opportunities',
    'Financial Model': 'Best for: Financial projections, metrics tracking, performance reviews'
  };
  
  const hintEl = document.getElementById('slideTypeHint');
  if (hintEl) {
    hintEl.textContent = hints[slideType.value] || '';
  }
}

function validateForm() {
  const isValid = slideType.value && 
                  context.value.length >= 10 && 
                  audience.value;
  generateBtn.disabled = !isValid || isGenerating;
}

// ==================== SLIDE GENERATION ====================

function showError(title, message) {
  errorContainer.innerHTML = `
    <div class="alert alert--error">
      <div class="alert__title">${title}</div>
      <div class="alert__message">${message}</div>
    </div>
  `;
  errorContainer.classList.remove('hidden');
}

function clearError() {
  errorContainer.innerHTML = '';
  errorContainer.classList.add('hidden');
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function startLoading() {
  isGenerating = true;
  generateBtn.disabled = true;
  generateText.textContent = 'Generating...';
  generateIcon.classList.add('spinning');
  generateIcon.innerHTML = `
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="60" stroke-dashoffset="10"/>
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" stroke-width="2"/>
  `;
  
  emptyState.classList.add('hidden');
  slideImage.classList.add('hidden');
  loadingOverlay.classList.remove('hidden');
  actionBar.style.display = 'none';
  
  let stepIndex = 0;
  loadingSteps.textContent = loadingStepMessages[0];
  loadingStepInterval = setInterval(() => {
    stepIndex = (stepIndex + 1) % loadingStepMessages.length;
    loadingSteps.textContent = loadingStepMessages[stepIndex];
  }, 1500);
}

function stopLoading() {
  isGenerating = false;
  generateBtn.disabled = false;
  generateText.textContent = 'Generate Slide';
  generateIcon.classList.remove('spinning');
  generateIcon.innerHTML = `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`;
  
  loadingOverlay.classList.add('hidden');
  if (loadingStepInterval) {
    clearInterval(loadingStepInterval);
    loadingStepInterval = null;
  }
}

function displaySlide(imageUrl, content, slideTypeValue) {
  currentSlideUrl = imageUrl;
  currentSlideContent = content;
  currentSlideType = slideTypeValue;
  slideImage.src = imageUrl;
  slideImage.classList.remove('hidden');
  previewContainer.classList.remove('slide-preview--empty');
  actionBar.style.display = 'flex';
}

async function generateSlide() {
  clearError();
  
  const dataPointsArray = dataPoints.value
    .split(/\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  const requestData = {
    slideType: slideType.value,
    context: context.value,
    dataPoints: dataPointsArray,
    targetAudience: audience.value,
    framework: framework.value || undefined
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
    
    displaySlide(data.imageUrl, data.content, slideType.value);
    showToast('Slide generated successfully!');
    
  } catch (error) {
    showError('Generation Failed', error.message);
    stopLoading();
    emptyState.classList.remove('hidden');
    previewContainer.classList.add('slide-preview--empty');
  } finally {
    stopLoading();
  }
}

// ==================== DOWNLOAD HANDLING ====================

async function handleDownload(format) {
  if (format === 'png') {
    downloadPNG();
  } else if (format === 'pptx') {
    await downloadPPTX();
  } else if (format === 'pdf') {
    await downloadPDF();
  } else if (format === 'html') {
    copyHTML();
  }
}

async function downloadPNG() {
  if (!currentSlideUrl) return;
  
  try {
    const response = await fetch(currentSlideUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `slidetheory-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    window.URL.revokeObjectURL(url);
    showToast('PNG download started!');
  } catch (error) {
    showError('Download Failed', 'Could not download the slide. Please try again.');
  }
}

async function downloadPPTX() {
  if (!currentSlideContent || !currentSlideType) {
    showError('Export Failed', 'No slide content available. Generate a slide first.');
    return;
  }
  
  showToast('Generating PowerPoint...', 'success');
  
  try {
    const response = await fetch('/api/export/pptx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slideType: currentSlideType,
        content: currentSlideContent
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to generate PPTX');
    }
    
    // Download the file
    const fileResponse = await fetch(data.downloadUrl);
    const blob = await fileResponse.blob();
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `slidetheory-${Date.now()}.pptx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    window.URL.revokeObjectURL(url);
    showToast('PowerPoint download started!');
    
  } catch (error) {
    showError('Export Failed', error.message);
  }
}

async function downloadPDF() {
  if (!currentSlideContent || !currentSlideType) {
    showError('Export Failed', 'No slide content available. Generate a slide first.');
    return;
  }
  
  showToast('Generating PDF...', 'success');
  
  try {
    const response = await fetch('/api/export/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slideType: currentSlideType,
        content: currentSlideContent
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to generate PDF');
    }
    
    // Download the file
    const fileResponse = await fetch(data.downloadUrl);
    const blob = await fileResponse.blob();
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `slidetheory-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    window.URL.revokeObjectURL(url);
    showToast('PDF download started!');
    
  } catch (error) {
    showError('Export Failed', error.message);
  }
}

function copyHTML() {
  // This would require storing the HTML - for now show a message
  showToast('HTML copy coming in next update!', 'success');
}

// ==================== KEYBOARD SHORTCUTS ====================

function handleKeyboard(e) {
  // Ctrl+Enter to generate
  if (e.ctrlKey && e.key === 'Enter' && !isGenerating) {
    e.preventDefault();
    if (!generateBtn.disabled) {
      generateSlide();
    }
  }
  
  // Ctrl+R to regenerate
  if (e.ctrlKey && e.key === 'r' && currentSlideUrl && !isGenerating) {
    e.preventDefault();
    generateSlide();
  }
  
  // Ctrl+D to download PNG
  if (e.ctrlKey && e.key === 'd' && currentSlideUrl) {
    e.preventDefault();
    downloadPNG();
  }
  
  // ? to show help
  if (e.key === '?' && !e.ctrlKey && !e.shiftKey) {
    e.preventDefault();
    shortcutsModal.classList.remove('hidden');
  }
  
  // Esc to close modal
  if (e.key === 'Escape') {
    shortcutsModal.classList.add('hidden');
    downloadMenu.classList.remove('open');
  }
}

// Initialize app
init();
