/**
 * SlideTheory MVP - Export Generator
 * Handles PowerPoint (.pptx) and PDF export generation
 */

const PptxGenJS = require('pptxgenjs');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// McKinsey color palette
const COLORS = {
  navy: '003366',
  navyLight: '1a4d7a',
  gray: 'F5F5F5',
  grayDark: '666666',
  accent: '4A90E2',
  white: 'FFFFFF',
  black: '1a1a1a',
  green: '16a34a',
  red: 'dc2626'
};

/**
 * Generate PowerPoint (.pptx) file from slide content
 */
async function generatePPTX({ slideType, content, outputPath }) {
  const pptx = new PptxGenJS();
  
  // Set presentation properties
  pptx.author = 'SlideTheory';
  pptx.company = 'SlideTheory';
  pptx.title = content.title || 'Consulting Slide';
  pptx.subject = slideType;
  
  // Define layout (16:9)
  pptx.defineLayout({ name: 'SLIDETHEORY', width: 10, height: 5.625 });
  pptx.layout = 'SLIDETHEORY';
  
  // Add slide
  const slide = pptx.addSlide();
  
  // Add background
  slide.background = { color: COLORS.white };
  
  // Add header bar
  slide.addShape('rect', {
    x: 0, y: 0, w: 10, h: 0.05,
    fill: { color: COLORS.navy }
  });
  
  // Add title
  slide.addText(content.title || 'Untitled Slide', {
    x: 0.5, y: 0.3, w: 9, h: 0.6,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.navy,
    valign: 'middle'
  });
  
  // Add subtitle if exists
  if (content.subtitle) {
    slide.addText(content.subtitle, {
      x: 0.5, y: 0.9, w: 9, h: 0.4,
      fontSize: 14,
      fontFace: 'Arial',
      color: COLORS.grayDark,
      valign: 'middle'
    });
  }
  
  // Add content based on slide type
  if (slideType === 'Executive Summary' && content.keyPoints) {
    addExecutiveSummaryContent(slide, content);
  } else if (slideType === 'Market Analysis') {
    addMarketAnalysisContent(slide, content);
  } else if (slideType === 'Financial Model') {
    addFinancialModelContent(slide, content);
  }
  
  // Add footer
  addFooter(slide, content.footer);
  
  // Save file
  await pptx.writeFile({ fileName: outputPath });
  
  return outputPath;
}

/**
 * Add Executive Summary content to PPTX slide
 */
function addExecutiveSummaryContent(slide, content) {
  let yPos = content.subtitle ? 1.4 : 1.1;
  
  // Add key points
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
      
      // Point heading
      slide.addText(point.heading, {
        x: 1.0, y: yPos, w: 8.5, h: 0.25,
        fontSize: 13,
        fontFace: 'Arial',
        bold: true,
        color: COLORS.black
      });
      
      // Point text
      slide.addText(point.text, {
        x: 1.0, y: yPos + 0.25, w: 8.5, h: 0.5,
        fontSize: 11,
        fontFace: 'Arial',
        color: COLORS.grayDark,
        valign: 'top'
      });
      
      yPos += 0.85;
    });
  }
  
  // Add recommendation box
  if (content.recommendation) {
    slide.addShape('rect', {
      x: 0.5, y: 4.0, w: 9, h: 0.9,
      fill: { color: COLORS.navy },
      rectRadius: 0.1
    });
    
    slide.addText('RECOMMENDATION', {
      x: 0.7, y: 4.05, w: 8.6, h: 0.2,
      fontSize: 9,
      fontFace: 'Arial',
      bold: true,
      color: COLORS.white,
      valign: 'top'
    });
    
    slide.addText(content.recommendation, {
      x: 0.7, y: 4.25, w: 8.6, h: 0.6,
      fontSize: 12,
      fontFace: 'Arial',
      bold: true,
      color: COLORS.white,
      valign: 'top'
    });
  }
}

/**
 * Add Market Analysis content to PPTX slide
 */
function addMarketAnalysisContent(slide, content) {
  let yPos = 1.2;
  
  // Market size box
  if (content.marketSize) {
    slide.addShape('rect', {
      x: 0.5, y: yPos, w: 4, h: 0.8,
      fill: { color: COLORS.gray },
      line: { color: COLORS.navy, width: 2 }
    });
    
    slide.addText('Total Addressable Market', {
      x: 0.7, y: yPos + 0.1, w: 3.6, h: 0.2,
      fontSize: 10,
      fontFace: 'Arial',
      color: COLORS.grayDark
    });
    
    slide.addText(content.marketSize, {
      x: 0.7, y: yPos + 0.3, w: 3.6, h: 0.4,
      fontSize: 18,
      fontFace: 'Arial',
      bold: true,
      color: COLORS.navy
    });
    
    yPos += 1.0;
  }
  
  // Insights
  if (content.insights && content.insights.length > 0) {
    content.insights.forEach((insight, index) => {
      slide.addText('→ ' + insight, {
        x: 0.5, y: yPos + (index * 0.4), w: 4.5, h: 0.35,
        fontSize: 11,
        fontFace: 'Arial',
        color: COLORS.black,
        valign: 'middle'
      });
    });
  }
  
  // Chart area (placeholder)
  if (content.chartData) {
    slide.addShape('rect', {
      x: 5.2, y: 1.2, w: 4.3, h: 2.5,
      fill: { color: COLORS.gray },
      rectRadius: 0.1
    });
    
    // Simple bar chart visualization
    const maxValue = Math.max(...content.chartData.values);
    const barWidth = 0.8;
    const barSpacing = 1.1;
    
    content.chartData.labels.forEach((label, index) => {
      const value = content.chartData.values[index];
      const barHeight = (value / maxValue) * 1.5;
      const xPos = 5.5 + (index * barSpacing);
      const yBarPos = 3.2 - barHeight;
      
      // Bar
      slide.addShape('rect', {
        x: xPos, y: yBarPos, w: barWidth, h: barHeight,
        fill: { color: COLORS.accent }
      });
      
      // Label
      slide.addText(label, {
        x: xPos, y: 3.25, w: barWidth, h: 0.3,
        fontSize: 9,
        fontFace: 'Arial',
        color: COLORS.grayDark,
        align: 'center'
      });
      
      // Value
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
function addFinancialModelContent(slide, content) {
  // Metrics row
  if (content.metrics && content.metrics.length > 0) {
    const cardWidth = 2.8;
    const cardSpacing = 0.2;
    const startX = 0.5;
    
    content.metrics.forEach((metric, index) => {
      const xPos = startX + (index * (cardWidth + cardSpacing));
      
      // Card background
      slide.addShape('rect', {
        x: xPos, y: 1.2, w: cardWidth, h: 1.0,
        fill: { color: COLORS.gray },
        line: { color: COLORS.navy, width: 2 }
      });
      
      // Label
      slide.addText(metric.label.toUpperCase(), {
        x: xPos + 0.15, y: 1.3, w: cardWidth - 0.3, h: 0.2,
        fontSize: 9,
        fontFace: 'Arial',
        color: COLORS.grayDark
      });
      
      // Value
      slide.addText(metric.value, {
        x: xPos + 0.15, y: 1.55, w: cardWidth - 0.3, h: 0.35,
        fontSize: 20,
        fontFace: 'Arial',
        bold: true,
        color: COLORS.navy
      });
      
      // Change
      const changeColor = metric.change.startsWith('+') ? COLORS.green : COLORS.red;
      slide.addText(metric.change + ' ' + (metric.period || ''), {
        x: xPos + 0.15, y: 1.9, w: cardWidth - 0.3, h: 0.2,
        fontSize: 11,
        fontFace: 'Arial',
        bold: true,
        color: changeColor
      });
    });
  }
  
  // Table
  if (content.tableData && content.tableData.headers) {
    const tableY = 2.5;
    const rowHeight = 0.35;
    const colWidth = 2.0;
    
    // Header row
    content.tableData.headers.forEach((header, index) => {
      slide.addShape('rect', {
        x: 0.5 + (index * colWidth), y: tableY, w: colWidth, h: rowHeight,
        fill: { color: COLORS.navy }
      });
      
      slide.addText(header, {
        x: 0.5 + (index * colWidth), y: tableY, w: colWidth, h: rowHeight,
        fontSize: 11,
        fontFace: 'Arial',
        bold: true,
        color: COLORS.white,
        align: 'center',
        valign: 'middle'
      });
    });
    
    // Data rows
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
          
          slide.addText(cell, {
            x: 0.5 + (colIndex * colWidth), y: yPos, w: colWidth, h: rowHeight,
            fontSize: 10,
            fontFace: 'Arial',
            color: COLORS.black,
            align: colIndex === 0 ? 'left' : 'right',
            valign: 'middle'
          });
        });
      });
    }
  }
}

/**
 * Add footer to PPTX slide
 */
function addFooter(slide, footer) {
  const footerY = 5.35;
  
  // Source and date
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
      x: 4.5, y: footerY, w: 2, h: 0.2,
      fontSize: 8,
      fontFace: 'Arial',
      color: COLORS.grayDark
    });
  }
  
  // Confidential
  slide.addText('Confidential', {
    x: 8.5, y: footerY, w: 1, h: 0.2,
    fontSize: 8,
    fontFace: 'Arial',
    bold: true,
    color: COLORS.grayDark,
    align: 'right'
  });
}

/**
 * Generate PDF from HTML slide content using Puppeteer
 */
async function generatePDF({ slideType, content, outputPath }) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Build HTML for the slide
    const html = buildSlideHTML(slideType, content);
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Set viewport to slide dimensions
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Generate PDF
    await page.pdf({
      path: outputPath,
      width: '1920px',
      height: '1080px',
      printBackground: true,
      preferCSSPageSize: false
    });
    
    return outputPath;
  } finally {
    await browser.close();
  }
}

/**
 * Build HTML for PDF generation
 */
function buildSlideHTML(slideType, content) {
  const { buildSlideHTML: buildHTML } = require('./slide-generator');
  return buildHTML(slideType, content);
}

module.exports = {
  generatePPTX,
  generatePDF
};
