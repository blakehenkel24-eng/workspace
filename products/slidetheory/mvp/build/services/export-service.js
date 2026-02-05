/**
 * Export Generation Service - Professional Edition
 * Handles PowerPoint (.pptx), PDF, and high-resolution PNG exports
 * 
 * Features:
 * - High-resolution PNG export (2x for retina)
 * - PowerPoint export with editable text boxes
 * - PDF with embedded fonts
 * - Configurable dimensions (4:3, 16:9, custom)
 * - Quality settings
 * - Batch export support
 * - Export history tracking
 */

const PptxGenJS = require('pptxgenjs');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const config = require('../config');
const { COLORS } = require('../config/constants');

// ============================================
// ASPECT RATIO CONFIGURATIONS
// ============================================

const ASPECT_RATIOS = {
  '16:9': { width: 10, height: 5.625, pixels: { width: 1920, height: 1080 } },
  '4:3': { width: 10, height: 7.5, pixels: { width: 1600, height: 1200 } },
  ' widescreen': { width: 13.333, height: 7.5, pixels: { width: 1920, height: 1080 } },
  'letter': { width: 10, height: 7.75, pixels: { width: 2550, height: 3300 } }, // Portrait
  'a4': { width: 10, height: 7.06, pixels: { width: 2480, height: 3508 } }, // Portrait
};

const QUALITY_SETTINGS = {
  low: { scale: 1, jpegQuality: 70 },
  medium: { scale: 1.5, jpegQuality: 85 },
  high: { scale: 2, jpegQuality: 90 },
  ultra: { scale: 3, jpegQuality: 95 }
};

// ============================================
// EXPORT HISTORY TRACKING
// ============================================

const exportHistory = new Map();
const MAX_HISTORY_ENTRIES = 1000;

/**
 * Record export in history
 */
function recordExport(exportId, data) {
  const entry = {
    exportId,
    timestamp: new Date().toISOString(),
    ...data
  };
  
  exportHistory.set(exportId, entry);
  
  // Cleanup old entries if exceeding max
  if (exportHistory.size > MAX_HISTORY_ENTRIES) {
    const oldestKey = exportHistory.keys().next().value;
    exportHistory.delete(oldestKey);
  }
  
  return entry;
}

/**
 * Get export history entry
 */
function getExportHistory(exportId) {
  return exportHistory.get(exportId);
}

/**
 * Get all export history (with optional filtering)
 */
function getExportHistoryList(options = {}) {
  const { format, startDate, endDate, limit = 100 } = options;
  
  let entries = Array.from(exportHistory.values());
  
  if (format) {
    entries = entries.filter(e => e.format === format);
  }
  
  if (startDate) {
    entries = entries.filter(e => new Date(e.timestamp) >= new Date(startDate));
  }
  
  if (endDate) {
    entries = entries.filter(e => new Date(e.timestamp) <= new Date(endDate));
  }
  
  // Sort by timestamp descending
  entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return entries.slice(0, limit);
}

/**
 * Clear export history
 */
function clearExportHistory() {
  const count = exportHistory.size;
  exportHistory.clear();
  return count;
}

// ============================================
// HIGH-RESOLUTION PNG EXPORT
// ============================================

/**
 * Generate high-resolution PNG from slide content
 * Supports 2x retina scaling and quality settings
 */
async function generatePNG({ slideType, content, outputPath, options = {} }) {
  const {
    quality = 'high',
    aspectRatio = '16:9',
    scale = null, // Override quality scale if provided
    transparent = false
  } = options;
  
  const qualityConfig = QUALITY_SETTINGS[quality] || QUALITY_SETTINGS.high;
  const finalScale = scale || qualityConfig.scale;
  const dimensions = ASPECT_RATIOS[aspectRatio] || ASPECT_RATIOS['16:9'];
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Calculate high-resolution viewport
    const viewportWidth = Math.round(dimensions.pixels.width * finalScale);
    const viewportHeight = Math.round(dimensions.pixels.height * finalScale);
    
    // Build HTML for the slide
    const { buildSlideHTML } = require('./slide-service');
    const html = buildSlideHTML(slideType, content, {
      scale: finalScale,
      transparent
    });
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.setViewport({
      width: viewportWidth,
      height: viewportHeight,
      deviceScaleFactor: 1 // We handle scaling ourselves
    });
    
    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);
    
    // Additional wait for any animations/images
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Capture screenshot
    const screenshotOptions = {
      path: outputPath,
      type: 'png',
      fullPage: false,
      omitBackground: transparent
    };
    
    await page.screenshot(screenshotOptions);
    
    // Record in history
    recordExport(path.basename(outputPath, '.png'), {
      format: 'png',
      slideType,
      quality,
      aspectRatio,
      scale: finalScale,
      dimensions: { width: viewportWidth, height: viewportHeight }
    });
    
    return outputPath;
  } finally {
    await browser.close();
  }
}

// ============================================
// ENHANCED POWERPOINT EXPORT
// ============================================

/**
 * Generate PowerPoint (.pptx) with editable text boxes
 * Supports multiple aspect ratios and professional formatting
 */
async function generatePPTX({ slideType, content, outputPath, options = {} }) {
  const {
    aspectRatio = '16:9',
    includeSpeakerNotes = false,
    editableText = true // New: ensures text is editable
  } = options;
  
  const dimensions = ASPECT_RATIOS[aspectRatio] || ASPECT_RATIOS['16:9'];
  
  const pptx = new PptxGenJS();
  
  // Set presentation properties
  pptx.author = content.author || 'SlideTheory';
  pptx.company = content.company || 'SlideTheory';
  pptx.title = content.title || 'Consulting Slide';
  pptx.subject = slideType;
  pptx.comments = content.notes || '';
  
  // Define layout based on aspect ratio
  const layoutName = `SLIDETHEORY_${aspectRatio.replace(':', '_')}`;
  pptx.defineLayout({
    name: layoutName,
    width: dimensions.width,
    height: dimensions.height
  });
  pptx.layout = layoutName;
  
  // Add slide
  const slide = pptx.addSlide();
  
  // Add background
  slide.background = { color: content.backgroundColor || COLORS.white };
  
  // Add header bar
  slide.addShape('rect', {
    x: 0, y: 0, w: dimensions.width, h: 0.05,
    fill: { color: COLORS.navy }
  });
  
  // Calculate positions based on aspect ratio
  const is43 = aspectRatio === '4:3';
  const titleY = 0.3;
  const titleH = 0.6;
  const subtitleY = is43 ? 1.0 : 0.9;
  const contentStartY = is43 ? (content.subtitle ? 1.5 : 1.3) : (content.subtitle ? 1.4 : 1.1);
  
  // Add title - using text box for editability
  slide.addText(content.title || 'Untitled Slide', {
    x: 0.5, y: titleY, w: dimensions.width - 1, h: titleH,
    fontSize: is43 ? 22 : 24,
    fontFace: editableText ? 'Calibri' : 'Arial',
    bold: true,
    color: COLORS.navy,
    valign: 'middle',
    editable: editableText
  });
  
  // Add subtitle if exists
  if (content.subtitle) {
    slide.addText(content.subtitle, {
      x: 0.5, y: subtitleY, w: dimensions.width - 1, h: 0.4,
      fontSize: is43 ? 13 : 14,
      fontFace: editableText ? 'Calibri' : 'Arial',
      color: COLORS.grayDark,
      valign: 'middle',
      editable: editableText
    });
  }
  
  // Add content based on slide type
  const contentOptions = { ...options, dimensions, is43, editableText, contentStartY };
  
  if (slideType === 'Executive Summary' && content.keyPoints) {
    addExecutiveSummaryContent(slide, content, contentOptions);
  } else if (slideType === 'Market Analysis') {
    addMarketAnalysisContent(slide, content, contentOptions);
  } else if (slideType === 'Financial Model') {
    addFinancialModelContent(slide, content, contentOptions);
  } else if (slideType === 'Competitive Analysis') {
    addCompetitiveAnalysisContent(slide, content, contentOptions);
  } else if (slideType === 'Growth Strategy') {
    addGrowthStrategyContent(slide, content, contentOptions);
  } else if (slideType === 'Risk Assessment') {
    addRiskAssessmentContent(slide, content, contentOptions);
  }
  
  // Add footer
  addFooter(slide, content.footer, dimensions);
  
  // Add speaker notes if provided
  if (includeSpeakerNotes && content.speakerNotes) {
    slide.addNotes(content.speakerNotes);
  }
  
  // Save file
  await pptx.writeFile({ fileName: outputPath });
  
  // Record in history
  recordExport(path.basename(outputPath, '.pptx'), {
    format: 'pptx',
    slideType,
    aspectRatio,
    editableText
  });
  
  return outputPath;
}

/**
 * Add Executive Summary content to PPTX slide
 */
function addExecutiveSummaryContent(slide, content, options) {
  const { dimensions, is43, editableText, contentStartY } = options;
  let yPos = contentStartY;
  const pointSpacing = is43 ? 1.0 : 0.85;
  
  if (content.keyPoints && content.keyPoints.length > 0) {
    content.keyPoints.forEach((point, index) => {
      // Point number circle
      slide.addShape('ellipse', {
        x: 0.5, y: yPos, w: 0.35, h: 0.35,
        fill: { color: COLORS.navy }
      });
      
      slide.addText(String(index + 1), {
        x: 0.5, y: yPos, w: 0.35, h: 0.35,
        fontSize: 14,
        fontFace: 'Arial',
        bold: true,
        color: COLORS.white,
        align: 'center',
        valign: 'middle'
      });
      
      // Point heading - editable text box
      slide.addText(point.heading, {
        x: 1.0, y: yPos, w: dimensions.width - 1.5, h: 0.25,
        fontSize: is43 ? 12 : 13,
        fontFace: editableText ? 'Calibri' : 'Arial',
        bold: true,
        color: COLORS.black,
        editable: editableText
      });
      
      // Point text - editable text box
      slide.addText(point.text, {
        x: 1.0, y: yPos + 0.25, w: dimensions.width - 1.5, h: is43 ? 0.6 : 0.5,
        fontSize: is43 ? 10 : 11,
        fontFace: editableText ? 'Calibri' : 'Arial',
        color: COLORS.grayDark,
        valign: 'top',
        editable: editableText
      });
      
      yPos += pointSpacing;
    });
  }
  
  // Add recommendation box
  if (content.recommendation) {
    const recY = is43 ? 5.2 : 4.0;
    const recH = is43 ? 1.2 : 0.9;
    
    slide.addShape('rect', {
      x: 0.5, y: recY, w: dimensions.width - 1, h: recH,
      fill: { color: COLORS.navy },
      rectRadius: 0.1
    });
    
    slide.addText('RECOMMENDATION', {
      x: 0.7, y: recY + 0.05, w: dimensions.width - 1.4, h: 0.2,
      fontSize: 9,
      fontFace: 'Arial',
      bold: true,
      color: COLORS.white,
      valign: 'top'
    });
    
    slide.addText(content.recommendation, {
      x: 0.7, y: recY + 0.25, w: dimensions.width - 1.4, h: recH - 0.35,
      fontSize: is43 ? 11 : 12,
      fontFace: editableText ? 'Calibri' : 'Arial',
      bold: true,
      color: COLORS.white,
      valign: 'top',
      editable: editableText
    });
  }
}

/**
 * Add Market Analysis content to PPTX slide
 */
function addMarketAnalysisContent(slide, content, options) {
  const { dimensions, is43, editableText } = options;
  let yPos = 1.2;
  
  if (content.marketSize) {
    slide.addShape('rect', {
      x: 0.5, y: yPos, w: is43 ? 5 : 4, h: 0.8,
      fill: { color: COLORS.gray },
      line: { color: COLORS.navy, width: 2 }
    });
    
    slide.addText('Total Addressable Market', {
      x: 0.7, y: yPos + 0.1, w: is43 ? 4.6 : 3.6, h: 0.2,
      fontSize: 10,
      fontFace: 'Arial',
      color: COLORS.grayDark
    });
    
    slide.addText(content.marketSize, {
      x: 0.7, y: yPos + 0.3, w: is43 ? 4.6 : 3.6, h: 0.4,
      fontSize: 18,
      fontFace: editableText ? 'Calibri' : 'Arial',
      bold: true,
      color: COLORS.navy,
      editable: editableText
    });
    
    yPos += 1.0;
  }
  
  if (content.insights && content.insights.length > 0) {
    content.insights.forEach((insight, index) => {
      slide.addText('→ ' + insight, {
        x: 0.5, y: yPos + (index * 0.4), w: is43 ? 6 : 4.5, h: 0.35,
        fontSize: 11,
        fontFace: editableText ? 'Calibri' : 'Arial',
        color: COLORS.black,
        valign: 'middle',
        editable: editableText
      });
    });
  }
  
  if (content.chartData) {
    const chartX = is43 ? 6.5 : 5.2;
    const chartW = is43 ? 3 : 4.3;
    
    slide.addShape('rect', {
      x: chartX, y: 1.2, w: chartW, h: 2.5,
      fill: { color: COLORS.gray },
      rectRadius: 0.1
    });
    
    const maxValue = Math.max(...content.chartData.values);
    const barWidth = is43 ? 0.6 : 0.8;
    const barSpacing = is43 ? 0.9 : 1.1;
    
    content.chartData.labels.forEach((label, index) => {
      const value = content.chartData.values[index];
      const barHeight = (value / maxValue) * 1.5;
      const xPos = chartX + 0.3 + (index * barSpacing);
      const yBarPos = 3.2 - barHeight;
      
      slide.addShape('rect', {
        x: xPos, y: yBarPos, w: barWidth, h: barHeight,
        fill: { color: COLORS.accent }
      });
      
      slide.addText(label, {
        x: xPos, y: 3.25, w: barWidth, h: 0.3,
        fontSize: 9,
        fontFace: 'Arial',
        color: COLORS.grayDark,
        align: 'center'
      });
      
      slide.addText(String(value) + '%', {
        x: xPos, y: yBarPos - 0.25, w: barWidth, h: 0.2,
        fontSize: 10,
        fontFace: 'Arial',
        bold: true,
        color: COLORS.black,
        align: 'center'
      });
    });
  }
}

/**
 * Add Financial Model content to PPTX slide
 */
function addFinancialModelContent(slide, content, options) {
  const { dimensions, is43, editableText } = options;
  
  if (content.metrics && content.metrics.length > 0) {
    const cardWidth = is43 ? 2.2 : 2.8;
    const cardSpacing = 0.2;
    const startX = 0.5;
    
    content.metrics.forEach((metric, index) => {
      const xPos = startX + (index * (cardWidth + cardSpacing));
      
      slide.addShape('rect', {
        x: xPos, y: 1.2, w: cardWidth, h: 1.0,
        fill: { color: COLORS.gray },
        line: { color: COLORS.navy, width: 2 }
      });
      
      slide.addText(metric.label.toUpperCase(), {
        x: xPos + 0.15, y: 1.3, w: cardWidth - 0.3, h: 0.2,
        fontSize: 9,
        fontFace: 'Arial',
        color: COLORS.grayDark
      });
      
      slide.addText(metric.value, {
        x: xPos + 0.15, y: 1.55, w: cardWidth - 0.3, h: 0.35,
        fontSize: is43 ? 18 : 20,
        fontFace: editableText ? 'Calibri' : 'Arial',
        bold: true,
        color: COLORS.navy,
        editable: editableText
      });
      
      const changeColor = metric.change?.startsWith('+') ? COLORS.green : COLORS.red;
      slide.addText((metric.change || '') + ' ' + (metric.period || ''), {
        x: xPos + 0.15, y: 1.9, w: cardWidth - 0.3, h: 0.2,
        fontSize: 11,
        fontFace: editableText ? 'Calibri' : 'Arial',
        bold: true,
        color: changeColor,
        editable: editableText
      });
    });
  }
  
  if (content.tableData && content.tableData.headers) {
    const tableY = 2.5;
    const rowHeight = 0.35;
    const colWidth = (dimensions.width - 1) / content.tableData.headers.length;
    
    content.tableData.headers.forEach((header, index) => {
      slide.addShape('rect', {
        x: 0.5 + (index * colWidth), y: tableY, w: colWidth, h: rowHeight,
        fill: { color: COLORS.navy }
      });
      
      slide.addText(header, {
        x: 0.5 + (index * colWidth), y: tableY, w: colWidth, h: rowHeight,
        fontSize: 11,
        fontFace: editableText ? 'Calibri' : 'Arial',
        bold: true,
        color: COLORS.white,
        align: 'center',
        valign: 'middle',
        editable: editableText
      });
    });
    
    if (content.tableData.rows) {
      content.tableData.rows.forEach((row, rowIndex) => {
        const yPos = tableY + ((rowIndex + 1) * rowHeight);
        const bgColor = rowIndex % 2 === 0 ? COLORS.white : COLORS.gray;
        
        row.forEach((cell, colIndex) => {
          slide.addShape('rect', {
            x: 0.5 + (colIndex * colWidth), y: yPos, w: colWidth, h: rowHeight,
            fill: { color: bgColor },
            line: { color: 'E5E5E5', width: 0.5 }
          });
          
          slide.addText(String(cell), {
            x: 0.5 + (colIndex * colWidth), y: yPos, w: colWidth, h: rowHeight,
            fontSize: 10,
            fontFace: editableText ? 'Calibri' : 'Arial',
            color: COLORS.black,
            align: colIndex === 0 ? 'left' : 'right',
            valign: 'middle',
            editable: editableText
          });
        });
      });
    }
  }
}

/**
 * Add Competitive Analysis content
 */
function addCompetitiveAnalysisContent(slide, content, options) {
  const { dimensions, is43, editableText } = options;
  
  if (content.matrixTitle) {
    slide.addText(content.matrixTitle, {
      x: 0.5, y: 1.5, w: dimensions.width - 1, h: 0.4,
      fontSize: 16,
      fontFace: editableText ? 'Calibri' : 'Arial',
      bold: true,
      color: COLORS.navy,
      editable: editableText
    });
  }
  
  // Simple competitor list visualization
  if (content.competitors && content.competitors.length > 0) {
    content.competitors.forEach((competitor, index) => {
      const yPos = 2.0 + (index * 0.5);
      
      slide.addShape('rect', {
        x: 0.5, y: yPos, w: dimensions.width - 1, h: 0.4,
        fill: { color: index % 2 === 0 ? COLORS.gray : COLORS.white },
        line: { color: COLORS.grayDark, width: 0.5 }
      });
      
      slide.addText(competitor.name || competitor, {
        x: 0.7, y: yPos, w: 3, h: 0.4,
        fontSize: 12,
        fontFace: editableText ? 'Calibri' : 'Arial',
        bold: true,
        color: COLORS.navy,
        valign: 'middle',
        editable: editableText
      });
    });
  }
}

/**
 * Add Growth Strategy content
 */
function addGrowthStrategyContent(slide, content, options) {
  const { dimensions, editableText } = options;
  
  if (content.flywheelTitle) {
    slide.addText(content.flywheelTitle, {
      x: 0.5, y: 1.5, w: dimensions.width - 1, h: 0.4,
      fontSize: 16,
      fontFace: editableText ? 'Calibri' : 'Arial',
      bold: true,
      color: COLORS.navy,
      editable: editableText
    });
  }
  
  if (content.initiatives && content.initiatives.length > 0) {
    content.initiatives.forEach((initiative, index) => {
      const xPos = 0.5 + (index * 3);
      
      slide.addShape('rect', {
        x: xPos, y: 2.5, w: 2.5, h: 1.5,
        fill: { color: COLORS.gray },
        line: { color: COLORS.navy, width: 2 },
        rectRadius: 0.1
      });
      
      slide.addText(initiative.title || initiative, {
        x: xPos + 0.1, y: 2.6, w: 2.3, h: 0.4,
        fontSize: 12,
        fontFace: editableText ? 'Calibri' : 'Arial',
        bold: true,
        color: COLORS.navy,
        editable: editableText
      });
    });
  }
}

/**
 * Add Risk Assessment content
 */
function addRiskAssessmentContent(slide, content, options) {
  const { dimensions, editableText } = options;
  
  if (content.risks && content.risks.length > 0) {
    content.risks.forEach((risk, index) => {
      const yPos = 1.5 + (index * 0.8);
      
      // Risk level indicator
      const riskColor = risk.level === 'High' ? COLORS.red : 
                        risk.level === 'Medium' ? 'f59e0b' : COLORS.green;
      
      slide.addShape('rect', {
        x: 0.5, y: yPos, w: 0.2, h: 0.6,
        fill: { color: riskColor }
      });
      
      slide.addText(risk.title || risk, {
        x: 0.8, y: yPos, w: dimensions.width - 1.5, h: 0.3,
        fontSize: 12,
        fontFace: editableText ? 'Calibri' : 'Arial',
        bold: true,
        color: COLORS.black,
        editable: editableText
      });
      
      if (risk.mitigation) {
        slide.addText('Mitigation: ' + risk.mitigation, {
          x: 0.8, y: yPos + 0.3, w: dimensions.width - 1.5, h: 0.3,
          fontSize: 10,
          fontFace: editableText ? 'Calibri' : 'Arial',
          color: COLORS.grayDark,
          editable: editableText
        });
      }
    });
  }
}

/**
 * Add footer to PPTX slide
 */
function addFooter(slide, footer, dimensions) {
  const footerY = dimensions.height - 0.25;
  
  if (footer && footer.source) {
    slide.addText(`Source: ${footer.source}`, {
      x: 0.5, y: footerY, w: 4, h: 0.2,
      fontSize: 8,
      fontFace: 'Arial',
      color: COLORS.grayDark
    });
  }
  
  if (footer && footer.date) {
    slide.addText(footer.date, {
      x: dimensions.width / 2 - 1, y: footerY, w: 2, h: 0.2,
      fontSize: 8,
      fontFace: 'Arial',
      color: COLORS.grayDark,
      align: 'center'
    });
  }
  
  slide.addText('Confidential', {
    x: dimensions.width - 1.5, y: footerY, w: 1, h: 0.2,
    fontSize: 8,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.grayDark,
    align: 'right'
  });
}

// ============================================
// ENHANCED PDF EXPORT WITH EMBEDDED FONTS
// ============================================

/**
 * Generate PDF with embedded fonts and high-quality rendering
 */
async function generatePDF({ slideType, content, outputPath, options = {} }) {
  const {
    quality = 'high',
    aspectRatio = '16:9',
    includeFonts = true,
    compress = false
  } = options;
  
  const qualityConfig = QUALITY_SETTINGS[quality] || QUALITY_SETTINGS.high;
  const dimensions = ASPECT_RATIOS[aspectRatio] || ASPECT_RATIOS['16:9'];
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Build HTML with embedded fonts
    const html = buildPDFHTML(slideType, content, {
      embedFonts: includeFonts,
      dimensions
    });
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Set high-resolution viewport
    const viewportWidth = Math.round(dimensions.pixels.width * qualityConfig.scale);
    const viewportHeight = Math.round(dimensions.pixels.height * qualityConfig.scale);
    await page.setViewport({ width: viewportWidth, height: viewportHeight });
    
    // Wait for fonts to load completely
    await page.evaluate(() => document.fonts.ready);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate PDF with embedded fonts
    await page.pdf({
      path: outputPath,
      width: `${viewportWidth}px`,
      height: `${viewportHeight}px`,
      printBackground: true,
      preferCSSPageSize: false,
      scale: 1,
      pdfViewport: { width: viewportWidth, height: viewportHeight }
    });
    
    // Record in history
    recordExport(path.basename(outputPath, '.pdf'), {
      format: 'pdf',
      slideType,
      quality,
      aspectRatio,
      embedFonts: includeFonts
    });
    
    return outputPath;
  } finally {
    await browser.close();
  }
}

/**
 * Build HTML for PDF with embedded font support
 */
function buildPDFHTML(slideType, content, options = {}) {
  const { embedFonts, dimensions } = options;
  const { buildSlideHTML } = require('./slide-service');
  
  // Base slide HTML
  const slideHTML = buildSlideHTML(slideType, content);
  
  // Font embedding CSS
  const fontCSS = embedFonts ? `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: local('Inter Regular'), local('Inter-Regular');
    }
    
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 600;
      font-display: swap;
      src: local('Inter SemiBold'), local('Inter-SemiBold');
    }
    
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: local('Inter Bold'), local('Inter-Bold');
    }
  ` : '';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        ${fontCSS}
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .slide-container {
          width: 100%;
          height: 100%;
          position: relative;
        }
      </style>
    </head>
    <body>
      <div class="slide-container">
        ${slideHTML}
      </div>
    </body>
    </html>
  `;
}

// ============================================
// BATCH EXPORT
// ============================================

/**
 * Batch export multiple slides
 * @param {Array} slides - Array of { slideType, content, options } objects
 * @param {string} outputDir - Output directory
 * @param {Object} options - Batch options
 * @returns {Object} Batch export results
 */
async function batchExport(slides, outputDir, options = {}) {
  const {
    format = 'pptx',
    aspectRatio = '16:9',
    quality = 'high',
    zipOutput = false
  } = options;
  
  const batchId = crypto.randomUUID();
  const results = [];
  const errors = [];
  
  const batchDir = path.join(outputDir, `batch-${batchId}`);
  await fs.mkdir(batchDir, { recursive: true });
  
  // Process slides sequentially to avoid memory issues
  for (let i = 0; i < slides.length; i++) {
    const { slideType, content, options: slideOptions = {} } = slides[i];
    const filename = `slide-${String(i + 1).padStart(3, '0')}`;
    const outputPath = path.join(batchDir, `${filename}.${format}`);
    
    try {
      const exportOptions = {
        aspectRatio,
        quality,
        ...slideOptions
      };
      
      let resultPath;
      switch (format) {
        case 'png':
          resultPath = await generatePNG({ slideType, content, outputPath, options: exportOptions });
          break;
        case 'pdf':
          resultPath = await generatePDF({ slideType, content, outputPath, options: exportOptions });
          break;
        case 'pptx':
        default:
          resultPath = await generatePPTX({ slideType, content, outputPath, options: exportOptions });
          break;
      }
      
      results.push({
        index: i,
        slideType,
        filename: `${filename}.${format}`,
        path: resultPath,
        success: true
      });
    } catch (error) {
      errors.push({
        index: i,
        slideType,
        error: error.message,
        success: false
      });
    }
  }
  
  // Create zip if requested
  let zipPath = null;
  if (zipOutput && results.length > 0) {
    zipPath = await createZipArchive(batchDir, path.join(outputDir, `batch-${batchId}.zip`));
  }
  
  // Record batch in history
  recordExport(batchId, {
    format: 'batch',
    batchFormat: format,
    slideCount: slides.length,
    successCount: results.length,
    errorCount: errors.length,
    aspectRatio,
    quality
  });
  
  return {
    batchId,
    format,
    totalSlides: slides.length,
    successful: results.length,
    failed: errors.length,
    results,
    errors,
    outputDir: batchDir,
    zipPath
  };
}

/**
 * Create ZIP archive from directory
 */
async function createZipArchive(sourceDir, outputPath) {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  
  try {
    await execAsync(`cd "${sourceDir}" && zip -r "${outputPath}" .`);
    return outputPath;
  } catch (error) {
    // Fallback: return the directory if zip fails
    console.error('[Export Service] Zip creation failed:', error.message);
    return null;
  }
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Main export functions
  generatePPTX,
  generatePDF,
  generatePNG,
  
  // Batch export
  batchExport,
  
  // History tracking
  recordExport,
  getExportHistory,
  getExportHistoryList,
  clearExportHistory,
  
  // Constants
  ASPECT_RATIOS,
  QUALITY_SETTINGS
};