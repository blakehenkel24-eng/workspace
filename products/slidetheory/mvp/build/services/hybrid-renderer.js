/**
 * Hybrid Renderer Service
 * AI-generated backgrounds + SVG text overlays for perfect legibility
 * 
 * Approach:
 * 1. Generate background using Kimi (shapes, colors, layout - NO TEXT)
 * 2. Overlay text using SVG (crisp, selectable, accessible)
 * 3. Composite to PNG using node-canvas or sharp
 * 
 * Benefits:
 * - Perfect text legibility (not AI-generated)
 * - Professional visual design (AI-generated backgrounds)
 * - Fast generation (< 5 sec target)
 */

const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const config = require('../config');

// Slide dimensions (16:9 at 2x for high DPI)
const SLIDE_WIDTH = 1920;
const SLIDE_HEIGHT = 1080;
const SCALE_FACTOR = 2;

/**
 * Template definitions with text zones
 * Each template defines where text should be placed on the slide
 */
const TEMPLATES = {
  'Executive Summary': {
    backgroundPrompt: `Professional consulting slide background, McKinsey/BCG style.
Dark navy header bar (#0d2137) spanning full width at top.
Clean white content area.
Subtle light gray (#f4f4f5) accent areas for key points.
NO TEXT. NO WORDS. NO LETTERS. ONLY SHAPES AND COLORS.
Minimalist, premium, executive presentation style.`,
    textZones: [
      { id: 'title', x: 80, y: 60, width: 1760, fontSize: 52, fontWeight: '700', color: '#0d2137', maxLines: 2 },
      { id: 'subtitle', x: 80, y: 140, width: 1760, fontSize: 28, fontWeight: '300', color: '#52525b', maxLines: 1 },
      { id: 'point1_heading', x: 140, y: 240, width: 1600, fontSize: 24, fontWeight: '600', color: '#0d2137' },
      { id: 'point1_text', x: 140, y: 275, width: 1600, fontSize: 18, fontWeight: '400', color: '#52525b', lineHeight: 1.6 },
      { id: 'point2_heading', x: 140, y: 380, width: 1600, fontSize: 24, fontWeight: '600', color: '#0d2137' },
      { id: 'point2_text', x: 140, y: 415, width: 1600, fontSize: 18, fontWeight: '400', color: '#52525b', lineHeight: 1.6 },
      { id: 'point3_heading', x: 140, y: 520, width: 1600, fontSize: 24, fontWeight: '600', color: '#0d2137' },
      { id: 'point3_text', x: 140, y: 555, width: 1600, fontSize: 18, fontWeight: '400', color: '#52525b', lineHeight: 1.6 },
      { id: 'recommendation_label', x: 100, y: 720, width: 1700, fontSize: 14, fontWeight: '600', color: '#ffffff', align: 'left' },
      { id: 'recommendation_text', x: 100, y: 750, width: 1700, fontSize: 24, fontWeight: '500', color: '#ffffff', align: 'left' },
      { id: 'footer_source', x: 80, y: 1020, width: 600, fontSize: 14, fontWeight: '400', color: '#a1a1aa' },
      { id: 'footer_date', x: 680, y: 1020, width: 300, fontSize: 14, fontWeight: '400', color: '#a1a1aa' },
      { id: 'footer_confidential', x: 1600, y: 1020, width: 240, fontSize: 14, fontWeight: '600', color: '#71717a', align: 'right' }
    ],
    visualElements: [
      { type: 'marker', x: 80, y: 230, size: 48, color: '#0d2137' },
      { type: 'marker', x: 80, y: 370, size: 48, color: '#0d2137' },
      { type: 'marker', x: 80, y: 510, size: 48, color: '#0d2137' },
      { type: 'box', x: 80, y: 700, width: 1760, height: 120, color: '#0d2137', borderRadius: 8 }
    ]
  },
  
  'Market Analysis': {
    backgroundPrompt: `Professional consulting slide background, McKinsey style.
Dark navy header bar at top.
Two-column layout: left for text, right for chart area.
Light gray chart container on right side.
Accent bar for market size highlight.
NO TEXT. NO WORDS. NO LETTERS. ONLY SHAPES AND COLORS.`,
    textZones: [
      { id: 'title', x: 80, y: 60, width: 1760, fontSize: 52, fontWeight: '700', color: '#0d2137' },
      { id: 'market_size_label', x: 100, y: 200, width: 600, fontSize: 14, fontWeight: '600', color: '#71717a' },
      { id: 'market_size_value', x: 100, y: 230, width: 600, fontSize: 42, fontWeight: '700', color: '#0d2137' },
      { id: 'insight1', x: 100, y: 350, width: 700, fontSize: 20, fontWeight: '400', color: '#3f3f46' },
      { id: 'insight2', x: 100, y: 420, width: 700, fontSize: 20, fontWeight: '400', color: '#3f3f46' },
      { id: 'insight3', x: 100, y: 490, width: 700, fontSize: 20, fontWeight: '400', color: '#3f3f46' },
      { id: 'footer_source', x: 80, y: 1020, width: 600, fontSize: 14, fontWeight: '400', color: '#a1a1aa' }
    ],
    visualElements: [
      { type: 'box', x: 80, y: 180, width: 800, height: 120, color: '#f4f4f5', borderLeft: 4, borderColor: '#0d2137' },
      { type: 'box', x: 920, y: 180, width: 920, height: 700, color: '#fafafa', borderRadius: 8 }
    ]
  },
  
  'Financial Model': {
    backgroundPrompt: `Professional consulting slide background, McKinsey style.
Three metric card placeholders at top.
Large table area below.
Clean grid lines, subtle shadows.
NO TEXT. NO WORDS. ONLY SHAPES AND COLORS.`,
    textZones: [
      { id: 'title', x: 80, y: 60, width: 1760, fontSize: 52, fontWeight: '700', color: '#0d2137' },
      { id: 'metric1_label', x: 100, y: 180, width: 500, fontSize: 14, fontWeight: '600', color: '#71717a' },
      { id: 'metric1_value', x: 100, y: 210, width: 500, fontSize: 36, fontWeight: '700', color: '#0d2137' },
      { id: 'metric1_change', x: 100, y: 260, width: 500, fontSize: 16, fontWeight: '600', color: '#16a34a' },
      { id: 'metric2_label', x: 650, y: 180, width: 500, fontSize: 14, fontWeight: '600', color: '#71717a' },
      { id: 'metric2_value', x: 650, y: 210, width: 500, fontSize: 36, fontWeight: '700', color: '#0d2137' },
      { id: 'metric2_change', x: 650, y: 260, width: 500, fontSize: 16, fontWeight: '600', color: '#16a34a' },
      { id: 'metric3_label', x: 1200, y: 180, width: 500, fontSize: 14, fontWeight: '600', color: '#71717a' },
      { id: 'metric3_value', x: 1200, y: 210, width: 500, fontSize: 36, fontWeight: '700', color: '#0d2137' },
      { id: 'metric3_change', x: 1200, y: 260, width: 500, fontSize: 16, fontWeight: '600', color: '#16a34a' },
      { id: 'table_header1', x: 100, y: 400, width: 400, fontSize: 16, fontWeight: '600', color: '#ffffff' },
      { id: 'table_header2', x: 500, y: 400, width: 400, fontSize: 16, fontWeight: '600', color: '#ffffff' },
      { id: 'footer_source', x: 80, y: 1020, width: 600, fontSize: 14, fontWeight: '400', color: '#a1a1aa' }
    ],
    visualElements: [
      { type: 'box', x: 80, y: 160, width: 550, height: 140, color: '#fafafa', borderTop: 4, borderColor: '#0d2137' },
      { type: 'box', x: 650, y: 160, width: 550, height: 140, color: '#fafafa', borderTop: 4, borderColor: '#0d2137' },
      { type: 'box', x: 1220, y: 160, width: 550, height: 140, color: '#fafafa', borderTop: 4, borderColor: '#0d2137' },
      { type: 'box', x: 80, y: 380, width: 1760, height: 50, color: '#0d2137' }
    ]
  }
};

/**
 * Generate background image using Kimi
 * Note: For MVP, we're using HTML/CSS backgrounds for reliability
 * This can be swapped for true AI image generation when available
 */
async function generateBackground(slideType, content) {
  const template = TEMPLATES[slideType] || TEMPLATES['Executive Summary'];
  
  // For MVP: Use canvas to generate structured background
  // Future: Call Kimi image generation API with template.backgroundPrompt
  
  const canvas = createCanvas(SLIDE_WIDTH, SLIDE_HEIGHT);
  const ctx = canvas.getContext('2d');
  
  // White base
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);
  
  // Render visual elements
  for (const element of template.visualElements || []) {
    renderVisualElement(ctx, element);
  }
  
  return canvas;
}

/**
 * Render a visual element (box, marker, etc.)
 */
function renderVisualElement(ctx, element) {
  switch (element.type) {
    case 'box':
      ctx.fillStyle = element.color;
      if (element.borderRadius) {
        roundRect(ctx, element.x, element.y, element.width, element.height, element.borderRadius);
      } else {
        ctx.fillRect(element.x, element.y, element.width, element.height);
      }
      if (element.borderLeft) {
        ctx.fillStyle = element.borderColor;
        ctx.fillRect(element.x, element.y, element.borderLeft, element.height);
      }
      if (element.borderTop) {
        ctx.fillStyle = element.borderColor;
        ctx.fillRect(element.x, element.y, element.width, element.borderTop);
      }
      break;
      
    case 'marker':
      ctx.fillStyle = element.color;
      ctx.fillRect(element.x, element.y, element.size, element.size);
      break;
  }
}

/**
 * Draw rounded rectangle
 */
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

/**
 * Render text onto canvas using text zones
 */
function renderTextOverlay(ctx, slideType, content) {
  const template = TEMPLATES[slideType] || TEMPLATES['Executive Summary'];
  
  // Map content to text zones
  const textMap = mapContentToTextZones(slideType, content);
  
  for (const zone of template.textZones) {
    const text = textMap[zone.id];
    if (!text) continue;
    
    ctx.font = `${zone.fontWeight} ${zone.fontSize}px Inter, Arial, sans-serif`;
    ctx.fillStyle = zone.color;
    ctx.textAlign = zone.align || 'left';
    ctx.textBaseline = 'top';
    
    // Handle multi-line text
    const maxWidth = zone.width;
    const lineHeight = zone.fontSize * (zone.lineHeight || 1.4);
    
    if (zone.maxLines && zone.maxLines > 1) {
      wrapText(ctx, text, zone.x, zone.y, maxWidth, lineHeight, zone.maxLines);
    } else {
      ctx.fillText(text, zone.x, zone.y);
    }
  }
}

/**
 * Map slide content to text zone IDs
 */
function mapContentToTextZones(slideType, content) {
  const map = {};
  
  switch (slideType) {
    case 'Executive Summary':
      map.title = content.title || '';
      map.subtitle = content.subtitle || '';
      if (content.keyPoints) {
        content.keyPoints.forEach((point, i) => {
          map[`point${i+1}_heading`] = point.heading || '';
          map[`point${i+1}_text`] = point.text || '';
        });
      }
      map.recommendation_label = 'RECOMMENDATION';
      map.recommendation_text = content.recommendation || '';
      map.footer_source = content.footer?.source ? `Source: ${content.footer.source}` : '';
      map.footer_date = content.footer?.date || '';
      map.footer_confidential = 'Confidential';
      break;
      
    case 'Market Analysis':
      map.title = content.title || '';
      map.market_size_label = 'TOTAL ADDRESSABLE MARKET';
      map.market_size_value = content.marketSize || '';
      if (content.insights) {
        content.insights.forEach((insight, i) => {
          map[`insight${i+1}`] = `→ ${insight}`;
        });
      }
      map.footer_source = content.footer?.source ? `Source: ${content.footer.source}` : '';
      break;
      
    case 'Financial Model':
      map.title = content.title || '';
      if (content.metrics) {
        content.metrics.forEach((metric, i) => {
          map[`metric${i+1}_label`] = (metric.label || '').toUpperCase();
          map[`metric${i+1}_value`] = metric.value || '';
          map[`metric${i+1}_change`] = `${metric.change} ${metric.period || ''}`;
        });
      }
      if (content.tableData?.headers) {
        content.tableData.headers.forEach((header, i) => {
          map[`table_header${i+1}`] = header;
        });
      }
      map.footer_source = content.footer?.source ? `Source: ${content.footer.source}` : '';
      break;
  }
  
  return map;
}

/**
 * Wrap text to fit within maxWidth
 */
function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let lines = 0;
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
      lines++;
      
      if (lines >= maxLines - 1) {
        // Add ellipsis for last line
        const remaining = words.slice(i).join(' ');
        let truncated = remaining;
        while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
          truncated = truncated.slice(0, -1);
        }
        ctx.fillText(truncated.trim() + '...', x, currentY);
        return;
      }
    } else {
      line = testLine;
    }
  }
  
  ctx.fillText(line.trim(), x, currentY);
}

/**
 * Main render function - Hybrid approach
 */
async function renderHybridSlide({ slideType, content, outputPath }) {
  const startTime = Date.now();
  
  // Step 1: Generate background
  const canvas = await generateBackground(slideType, content);
  const ctx = canvas.getContext('2d');
  
  // Step 2: Render text overlay
  renderTextOverlay(ctx, slideType, content);
  
  // Step 3: Export to PNG
  const buffer = canvas.toBuffer('image/png');
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, buffer);
  
  const duration = Date.now() - startTime;
  console.log(`[HybridRenderer] Generated ${slideType} in ${duration}ms`);
  
  return {
    path: outputPath,
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    durationMs: duration
  };
}

/**
 * Render multiple test slides for validation
 */
async function renderTestSlides(outputDir) {
  const testResults = [];
  const testSlides = [
    { type: 'Executive Summary', content: generateTestContent('Executive Summary') },
    { type: 'Market Analysis', content: generateTestContent('Market Analysis') },
    { type: 'Financial Model', content: generateTestContent('Financial Model') }
  ];
  
  // Generate 10 total (repeat with variations)
  for (let i = 0; i < 10; i++) {
    const test = testSlides[i % testSlides.length];
    const outputPath = path.join(outputDir, `test-slide-${i + 1}-${test.type.toLowerCase().replace(' ', '-')}.png`);
    
    try {
      const result = await renderHybridSlide({
        slideType: test.type,
        content: test.content,
        outputPath
      });
      
      testResults.push({
        id: i + 1,
        type: test.type,
        path: outputPath,
        durationMs: result.durationMs,
        success: true
      });
    } catch (error) {
      testResults.push({
        id: i + 1,
        type: test.type,
        path: outputPath,
        error: error.message,
        success: false
      });
    }
  }
  
  return testResults;
}

/**
 * Generate test content for a slide type
 */
function generateTestContent(slideType) {
  const contents = {
    'Executive Summary': {
      title: 'Revenue Growth Accelerates to 25%',
      subtitle: 'Strategic initiatives driving strong Q3 performance',
      keyPoints: [
        { heading: 'Market Expansion', text: 'Successfully entered 3 new markets with $2.4M incremental revenue in first quarter.' },
        { heading: 'Product Innovation', text: 'Launched premium tier increasing average deal size by 35%.' },
        { heading: 'Operational Efficiency', text: 'Reduced CAC by 18% through optimized digital channels.' }
      ],
      recommendation: 'Accelerate Series B fundraising to capitalize on market momentum.',
      footer: { source: 'Financial Analysis', date: 'Jan 2025' }
    },
    'Market Analysis': {
      title: '$12.4B Market Opportunity',
      marketSize: '$12.4B growing 18% annually',
      insights: [
        'Fragmented market with no dominant player over 15% share',
        'Enterprise segment growing 2x faster than SMB',
        'Regulatory tailwinds driving adoption in regulated industries'
      ],
      footer: { source: 'Industry Research' }
    },
    'Financial Model': {
      title: 'Financial Performance Overview',
      metrics: [
        { label: 'Revenue', value: '$5.2M', change: '+23%', period: 'YoY' },
        { label: 'Gross Margin', value: '68%', change: '+4pp', period: 'YoY' },
        { label: 'EBITDA', value: '$1.1M', change: '+45%', period: 'YoY' }
      ],
      tableData: {
        headers: ['Metric', '2023', '2024', '2025E'],
        rows: [
          ['Revenue ($M)', '$4.2', '$5.2', '$6.5'],
          ['Growth %', '12%', '23%', '25%'],
          ['Margin %', '64%', '68%', '70%']
        ]
      },
      footer: { source: 'Internal Data' }
    }
  };
  
  return contents[slideType];
}

module.exports = {
  renderHybridSlide,
  renderTestSlides,
  generateTestContent,
  TEMPLATES
};
