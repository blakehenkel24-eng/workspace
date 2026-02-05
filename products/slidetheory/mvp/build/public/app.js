/**
 * SlideTheory v2.0 - Frontend Application
 * Form handling, preview updates, theme toggle
 */

// ========================================
// DOM Elements
// ========================================

const form = document.getElementById('slideForm');
const slideType = document.getElementById('slideType');
const audience = document.getElementById('audience');
const context = document.getElementById('context');
const dataInput = document.getElementById('dataInput');
const keyTakeaway = document.getElementById('keyTakeaway');
const generateBtn = document.getElementById('generateBtn');
const fileUpload = document.getElementById('fileUpload');
const fileUploadBtn = document.getElementById('fileUploadBtn');

const slideWrapper = document.getElementById('slideWrapper');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const slideContent = document.getElementById('slideContent');
const slidePreviewFrame = document.getElementById('slidePreviewFrame');
const exportBar = document.getElementById('exportBar');
const loadingSubtext = document.getElementById('loadingSubtext');

const themeToggle = document.getElementById('themeToggle');
const helpBtn = document.getElementById('helpBtn');
const shortcutsModal = document.getElementById('shortcutsModal');
const modalClose = document.getElementById('modalClose');
const toastContainer = document.getElementById('toastContainer');
const errorContainer = document.getElementById('errorContainer');

// Toggle buttons
const toggleBtns = document.querySelectorAll('.toggle-btn');
const modeHint = document.getElementById('modeHint');

// ========================================
// State
// ========================================

let state = {
  isGenerating: false,
  presentationMode: 'presentation', // 'presentation' | 'read'
  theme: 'light',
  currentSlide: null
};

const loadingSteps = [
  'Analyzing context',
  'Structuring content',
  'Designing slide',
  'Finalizing'
];

// ========================================
// Initialization
// ========================================

function init() {
  loadTheme();
  setupEventListeners();
  validateForm();
}

// ========================================
// Theme Management
// ========================================

function loadTheme() {
  const savedTheme = localStorage.getItem('slidetheory-theme');
  if (savedTheme) {
    state.theme = savedTheme;
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    state.theme = 'dark';
  }
  applyTheme();
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('slidetheory-theme', state.theme);
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  applyTheme();
}

// ========================================
// Event Listeners
// ========================================

function setupEventListeners() {
  // Form validation
  [slideType, audience, context].forEach(el => {
    el.addEventListener('input', validateForm);
    el.addEventListener('change', validateForm);
  });

  // Form submission
  form.addEventListener('submit', handleSubmit);

  // File upload
  fileUploadBtn.addEventListener('click', () => fileUpload.click());
  fileUpload.addEventListener('change', handleFileUpload);

  // Toggle buttons
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => handleModeToggle(btn));
  });

  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);

  // Help modal
  helpBtn.addEventListener('click', openModal);
  modalClose.addEventListener('click', closeModal);
  shortcutsModal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

  // Export buttons
  document.querySelectorAll('.export-btn').forEach(btn => {
    btn.addEventListener('click', () => handleExport(btn.dataset.format));
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard);

  // Drag and drop for file upload
  const dataWrapper = document.querySelector('.data-input-wrapper');
  if (dataWrapper) {
    dataWrapper.addEventListener('dragover', handleDragOver);
    dataWrapper.addEventListener('dragleave', handleDragLeave);
    dataWrapper.addEventListener('drop', handleDrop);
  }
}

// ========================================
// Form Handling
// ========================================

function validateForm() {
  const isValid = slideType.value && audience.value && context.value.trim().length >= 10;
  generateBtn.disabled = !isValid || state.isGenerating;
}

function handleModeToggle(btn) {
  const mode = btn.dataset.mode;
  state.presentationMode = mode;

  // Update UI
  toggleBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Update hint
  modeHint.textContent = mode === 'presentation' 
    ? 'Less detail — optimized for live presentations'
    : 'More detail — comprehensive for reading';
}

async function handleSubmit(e) {
  e.preventDefault();
  if (state.isGenerating) return;

  await generateSlide();
}

// ========================================
// File Upload
// ========================================

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
}

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (file) {
    processFile(file);
  }
}

function processFile(file) {
  const allowedTypes = ['.xlsx', '.csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
  const isAllowed = allowedTypes.some(type => 
    file.name.toLowerCase().endsWith(type) || file.type === type
  );

  if (!isAllowed) {
    showError('Invalid file type', 'Please upload a .xlsx or .csv file');
    return;
  }

  const reader = new FileReader();
  
  reader.onload = (e) => {
    const content = e.target.result;
    dataInput.value = content;
    showToast(`Loaded: ${file.name}`);
  };

  reader.onerror = () => {
    showError('File error', 'Could not read the file. Please try again.');
  };

  if (file.name.toLowerCase().endsWith('.csv')) {
    reader.readAsText(file);
  } else {
    // For xlsx, we'd need a library like SheetJS - for now just show filename
    dataInput.value = `[File: ${file.name}]\n[Excel data would be parsed here]`;
    showToast(`Loaded: ${file.name} (Excel parsing coming soon)`);
  }
}

// ========================================
// Slide Generation
// ========================================

async function generateSlide() {
  state.isGenerating = true;
  validateForm();

  // Show loading state
  emptyState.classList.add('hidden');
  slideContent.classList.add('hidden');
  exportBar.classList.remove('visible');
  loadingState.classList.remove('hidden');

  // Animate loading steps
  let stepIndex = 0;
  loadingSubtext.textContent = loadingSteps[0];
  
  const stepInterval = setInterval(() => {
    stepIndex = (stepIndex + 1) % loadingSteps.length;
    loadingSubtext.textContent = loadingSteps[stepIndex];
  }, 800);

  try {
    // Prepare request data
    const requestData = {
      slideType: slideType.value,
      audience: audience.value,
      context: context.value,
      dataInput: dataInput.value,
      keyTakeaway: keyTakeaway.value,
      presentationMode: state.presentationMode
    };

    // Simulate API call (replace with actual endpoint)
    // const response = await fetch('/api/generate', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(requestData)
    // });
    // const data = await response.json();

    // Simulate delay for demo
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate sample slide for preview
    const sampleSlide = generateSampleSlide(requestData);
    
    clearInterval(stepInterval);
    displaySlide(sampleSlide);
    showToast('Slide generated successfully!');

  } catch (error) {
    clearInterval(stepInterval);
    showError('Generation failed', error.message || 'Something went wrong. Please try again.');
    showEmptyState();
  } finally {
    state.isGenerating = false;
    validateForm();
  }
}

function generateSampleSlide(data) {
  // Generate a sample slide HTML based on the input
  const points = [
    'Strategic analysis reveals significant market opportunity',
    'Key metrics indicate strong growth trajectory',
    'Competitive positioning shows distinct advantages',
    'Recommended actions align with organizational goals'
  ];

  const slideHtml = `
    <div class="sample-slide">
      <div class="sample-slide__header">
        <h2 class="sample-slide__title">${escapeHtml(data.slideType)}</h2>
        <p class="sample-slide__subtitle">${escapeHtml(data.audience)}</p>
      </div>
      <div class="sample-slide__content">
        <ul class="sample-slide__points">
          ${points.map(p => `<li>${escapeHtml(p)}</li>`).join('')}
        </ul>
        ${data.keyTakeaway ? `
          <div class="sample-slide__takeaway">
            <div class="sample-slide__takeaway-label">Key Takeaway</div>
            <div class="sample-slide__takeaway-text">${escapeHtml(data.keyTakeaway)}</div>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  return slideHtml;
}

function displaySlide(slideHtml) {
  loadingState.classList.add('hidden');
  slidePreviewFrame.innerHTML = slideHtml;
  slideContent.classList.remove('hidden');
  exportBar.classList.add('visible');
  state.currentSlide = slideHtml;
}

function showEmptyState() {
  loadingState.classList.add('hidden');
  slideContent.classList.add('hidden');
  exportBar.classList.remove('visible');
  emptyState.classList.remove('hidden');
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ========================================
// Export
// ========================================

async function handleExport(format) {
  if (!state.currentSlide) {
    showError('No slide to export', 'Generate a slide first before exporting.');
    return;
  }

  showToast(`Exporting as ${format.toUpperCase()}...`);

  try {
    switch (format) {
      case 'png':
        await exportPNG();
        break;
      case 'pptx':
        await exportPPTX();
        break;
      case 'pdf':
        await exportPDF();
        break;
    }
  } catch (error) {
    showError('Export failed', error.message || 'Could not export the slide.');
  }
}

async function exportPNG() {
  // Use html2canvas or similar library
  // For now, simulate the download
  await simulateDownload('slide.png');
  showToast('PNG downloaded!');
}

async function exportPPTX() {
  // Call backend API to generate PPTX
  // const response = await fetch('/api/export/pptx', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ slide: state.currentSlide })
  // });
  await simulateDownload('slide.pptx');
  showToast('PowerPoint downloaded!');
}

async function exportPDF() {
  // Call backend API to generate PDF
  // const response = await fetch('/api/export/pdf', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ slide: state.currentSlide })
  // });
  await simulateDownload('slide.pdf');
  showToast('PDF downloaded!');
}

function simulateDownload(filename) {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`[Demo] Downloaded: ${filename}`);
      resolve();
    }, 500);
  });
}

// ========================================
// UI Helpers
// ========================================

function showError(title, message) {
  errorContainer.innerHTML = `
    <div class="alert alert--error">
      <div class="alert__title">${escapeHtml(title)}</div>
      <div class="alert__message">${escapeHtml(message)}</div>
    </div>
  `;
  errorContainer.classList.remove('hidden');
  
  setTimeout(() => {
    errorContainer.classList.add('hidden');
  }, 5000);
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

function openModal() {
  shortcutsModal.classList.remove('hidden');
}

function closeModal() {
  shortcutsModal.classList.add('hidden');
}

// ========================================
// Keyboard Shortcuts
// ========================================

function handleKeyboard(e) {
  // Ctrl+Enter - Generate
  if (e.ctrlKey && e.key === 'Enter' && !state.isGenerating) {
    e.preventDefault();
    if (!generateBtn.disabled) {
      generateSlide();
    }
  }
  
  // Ctrl+R - Regenerate
  if (e.ctrlKey && e.key === 'r' && state.currentSlide && !state.isGenerating) {
    e.preventDefault();
    generateSlide();
  }
  
  // Ctrl+D - Download/Export
  if (e.ctrlKey && e.key === 'd' && state.currentSlide) {
    e.preventDefault();
    exportPNG();
  }
  
  // Ctrl+T - Toggle theme
  if (e.ctrlKey && e.key === 't') {
    e.preventDefault();
    toggleTheme();
  }
  
  // ? - Show help
  if (e.key === '?' && !e.ctrlKey && !e.altKey) {
    e.preventDefault();
    openModal();
  }
  
  // Esc - Close modal
  if (e.key === 'Escape') {
    closeModal();
  }
}

// ========================================
// Start
// ========================================

init();
