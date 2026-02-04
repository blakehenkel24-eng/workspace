/**
 * SlideTheory MVP - Slide Generator v2.0
 * Enhanced with new slide types and McKinsey-level professional styling
 */

const nodeHtmlToImage = require('node-html-to-image');
const fs = require('fs').promises;
const path = require('path');

// Slide dimensions
const SLIDE_WIDTH = 1920;
const SLIDE_HEIGHT = 1080;

// Track if Puppeteer is available
let puppeteerAvailable = true;
let lastPuppeteerError = null;

/**
 * Generate CSS styles for slide templates
 * McKinsey-level professional design system
 */
function getSlideStyles() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      width: ${SLIDE_WIDTH}px;
      height: ${SLIDE_HEIGHT}px;
      overflow: hidden;
    }
    
    .slide {
      width: 100%;
      height: 100%;
      padding: 60px 80px;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    
    /* McKinsey-style header */
    .slide-header {
      border-bottom: 3px solid #0d2137;
      padding-bottom: 24px;
      margin-bottom: 40px;
    }
    
    .slide-title {
      font-size: 52px;
      font-weight: 700;
      color: #0d2137;
      line-height: 1.15;
      letter-spacing: -0.02em;
    }
    
    .slide-subtitle {
      font-size: 28px;
      font-weight: 300;
      color: #52525b;
      margin-top: 12px;
    }
    
    .slide-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    /* Executive Summary Styles */
    .key-points {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    
    .key-point {
      display: flex;
      align-items: flex-start;
      gap: 20px;
    }
    
    .point-marker {
      width: 48px;
      height: 48px;
      background: #0d2137;
      color: white;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 700;
      flex-shrink: 0;
    }
    
    .point-content h3 {
      font-size: 24px;
      font-weight: 600;
      color: #0d2137;
      margin-bottom: 8px;
    }
    
    .point-content p {
      font-size: 18px;
      color: #52525b;
      line-height: 1.6;
    }
    
    .recommendation-box {
      background: #0d2137;
      color: white;
      padding: 32px 40px;
      border-radius: 8px;
      margin-top: 40px;
    }
    
    .recommendation-label {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      opacity: 0.8;
      margin-bottom: 12px;
    }
    
    .recommendation-text {
      font-size: 24px;
      font-weight: 500;
      line-height: 1.4;
    }
    
    /* Footer */
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 24px;
      border-top: 1px solid #e4e4e7;
      margin-top: auto;
      font-size: 14px;
      color: #a1a1aa;
    }
    
    .footer-left {
      display: flex;
      gap: 24px;
    }
    
    .confidential {
      font-weight: 600;
      color: #71717a;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    /* Market Analysis Styles */
    .market-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      flex: 1;
    }
    
    .market-info {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    
    .market-size-box {
      background: #f4f4f5;
      padding: 32px;
      border-radius: 8px;
      border-left: 4px solid #0d2137;
    }
    
    .market-size-label {
      font-size: 14px;
      font-weight: 600;
      color: #71717a;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }
    
    .market-size-value {
      font-size: 42px;
      font-weight: 700;
      color: #0d2137;
    }
    
    .insights-list {
      list-style: none;
    }
    
    .insights-list li {
      font-size: 20px;
      color: #3f3f46;
      padding: 16px 0;
      border-bottom: 1px solid #e4e4e7;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .insights-list li::before {
      content: "→";
      color: #0d2137;
      font-weight: 700;
    }
    
    .chart-container {
      background: #fafafa;
      border-radius: 8px;
      padding: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 1px solid #e4e4e7;
    }
    
    .chart-placeholder {
      width: 100%;
      height: 300px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 40px;
      padding: 20px;
    }
    
    .bar {
      width: 80px;
      background: linear-gradient(180deg, #334e68 0%, #0d2137 100%);
      border-radius: 4px 4px 0 0;
      position: relative;
    }
    
    .bar-label {
      position: absolute;
      bottom: -30px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 14px;
      font-weight: 600;
      color: #71717a;
      white-space: nowrap;
    }
    
    .bar-value {
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 16px;
      font-weight: 700;
      color: #0d2137;
    }
    
    /* Financial Model Styles */
    .metrics-row {
      display: flex;
      gap: 32px;
      margin-bottom: 40px;
    }
    
    .metric-card {
      flex: 1;
      background: #fafafa;
      padding: 28px 32px;
      border-radius: 8px;
      border-top: 4px solid #0d2137;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    
    .metric-label {
      font-size: 14px;
      font-weight: 600;
      color: #71717a;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }
    
    .metric-value {
      font-size: 36px;
      font-weight: 700;
      color: #0d2137;
      margin-bottom: 8px;
    }
    
    .metric-change {
      font-size: 16px;
      font-weight: 600;
    }
    
    .metric-change.positive {
      color: #16a34a;
    }
    
    .metric-change.negative {
      color: #dc2626;
    }
    
    .table-container {
      background: #fafafa;
      border-radius: 8px;
      overflow: hidden;
      margin-top: auto;
      border: 1px solid #e4e4e7;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .data-table th {
      background: #0d2137;
      color: white;
      font-size: 16px;
      font-weight: 600;
      padding: 20px 24px;
      text-align: left;
    }
    
    .data-table td {
      font-size: 18px;
      padding: 20px 24px;
      border-bottom: 1px solid #e4e4e7;
      color: #3f3f46;
    }
    
    .data-table tr:last-child td {
      border-bottom: none;
    }
    
    .data-table tr:nth-child(even) {
      background: #f4f4f5;
    }
    
    /* Competitive Analysis Styles */
    .competitive-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      flex: 1;
    }
    
    .matrix-container {
      background: #fafafa;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      padding: 40px;
      position: relative;
    }
    
    .matrix-title {
      font-size: 18px;
      font-weight: 600;
      color: #0d2137;
      margin-bottom: 24px;
      text-align: center;
    }
    
    .matrix {
      position: relative;
      width: 100%;
      height: 400px;
    }
    
    .matrix-axis {
      position: absolute;
      font-size: 14px;
      font-weight: 600;
      color: #71717a;
    }
    
    .matrix-axis.x-left { bottom: -30px; left: 0; }
    .matrix-axis.x-right { bottom: -30px; right: 0; }
    .matrix-axis.y-bottom { left: -80px; bottom: 0; transform: rotate(-90deg); transform-origin: left center; }
    .matrix-axis.y-top { left: -80px; top: 0; transform: rotate(-90deg); transform-origin: left center; }
    
    .matrix-quadrants {
      position: absolute;
      inset: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
    }
    
    .quadrant {
      border: 1px dashed #d4d4d8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #a1a1aa;
    }
    
    .matrix-bubble {
      position: absolute;
      padding: 12px 20px;
      background: #0d2137;
      color: white;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .matrix-bubble.us {
      background: #2563eb;
    }
    
    .comparison-table {
      width: 100%;
    }
    
    .comparison-table th {
      background: #0d2137;
      color: white;
      font-size: 14px;
      font-weight: 600;
      padding: 16px;
      text-align: left;
    }
    
    .comparison-table td {
      font-size: 16px;
      padding: 16px;
      border-bottom: 1px solid #e4e4e7;
    }
    
    .comparison-table tr:nth-child(even) {
      background: #f4f4f5;
    }
    
    .check {
      color: #16a34a;
      font-weight: bold;
    }
    
    .cross {
      color: #dc2626;
    }
    
    /* Growth Strategy Styles */
    .growth-container {
      display: flex;
      flex-direction: column;
      gap: 40px;
      flex: 1;
    }
    
    .flywheel-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
    }
    
    .flywheel-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    
    .flywheel-circle {
      width: 140px;
      height: 140px;
      background: #0d2137;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 20px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(13, 33, 55, 0.2);
    }
    
    .flywheel-arrow {
      font-size: 32px;
      color: #0d2137;
    }
    
    .initiatives-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    
    .initiative-card {
      background: #f4f4f5;
      padding: 24px;
      border-radius: 8px;
      border-left: 4px solid #0d2137;
    }
    
    .initiative-number {
      font-size: 32px;
      font-weight: 700;
      color: #0d2137;
      margin-bottom: 8px;
    }
    
    .initiative-title {
      font-size: 18px;
      font-weight: 600;
      color: #0d2137;
      margin-bottom: 8px;
    }
    
    .initiative-desc {
      font-size: 14px;
      color: #52525b;
      line-height: 1.5;
    }
    
    /* Risk Assessment Styles */
    .risk-container {
      display: flex;
      flex-direction: column;
      gap: 32px;
      flex: 1;
    }
    
    .risk-matrix {
      display: grid;
      grid-template-columns: 100px repeat(3, 1fr);
      grid-template-rows: 40px repeat(3, 1fr);
      gap: 8px;
      height: 360px;
    }
    
    .risk-matrix-header {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      color: #71717a;
    }
    
    .risk-matrix-label {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      color: #3f3f46;
    }
    
    .risk-cell {
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .risk-cell.low { background: #dcfce7; }
    .risk-cell.medium { background: #fef9c3; }
    .risk-cell.high { background: #fee2e2; }
    
    .risk-cell-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #3f3f46;
    }
    
    .risk-item {
      font-size: 13px;
      padding: 6px 10px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 4px;
      font-weight: 500;
    }
    
    .mitigation-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .mitigation-table th {
      background: #0d2137;
      color: white;
      font-size: 14px;
      font-weight: 600;
      padding: 16px;
      text-align: left;
    }
    
    .mitigation-table td {
      font-size: 15px;
      padding: 16px;
      border-bottom: 1px solid #e4e4e7;
      color: #3f3f46;
    }
    
    .mitigation-table tr:nth-child(even) {
      background: #f4f4f5;
    }
    
    .risk-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .risk-badge.high { background: #fee2e2; color: #dc2626; }
    .risk-badge.medium { background: #fef9c3; color: #a16207; }
    .risk-badge.low { background: #dcfce7; color: #16a34a; }
  `;
}

/**
 * Build Executive Summary slide HTML
 */
function buildExecutiveSummaryHTML(content) {
  const keyPointsHTML = (content.keyPoints || []).map((point, i) => `
    <div class="key-point">
      <div class="point-marker">${i + 1}</div>
      <div class="point-content">
        <h3>${point.heading}</h3>
        <p>${point.text}</p>
      </div>
    </div>
  `).join('');
  
  return `
    <div class="slide">
      <div class="slide-header">
        <h1 class="slide-title">${content.title}</h1>
        ${content.subtitle ? `<p class="slide-subtitle">${content.subtitle}</p>` : ''}
      </div>
      
      <div class="slide-content">
        <div class="key-points">
          ${keyPointsHTML}
        </div>
        
        ${content.recommendation ? `
        <div class="recommendation-box">
          <div class="recommendation-label">Recommendation</div>
          <div class="recommendation-text">${content.recommendation}</div>
        </div>
        ` : ''}
      </div>
      
      <div class="slide-footer">
        <div class="footer-left">
          ${content.footer?.source ? `<span>Source: ${content.footer.source}</span>` : ''}
          ${content.footer?.date ? `<span>${content.footer.date}</span>` : ''}
        </div>
        <span class="confidential">Confidential</span>
      </div>
    </div>
  `;
}

/**
 * Build Market Analysis slide HTML
 */
function buildMarketAnalysisHTML(content) {
  const insightsHTML = (content.insights || []).map(insight => `
    <li>${insight}</li>
  `).join('');
  
  // Simple bar chart visualization
  const chartData = content.chartData || { labels: ['A', 'B', 'C'], values: [30, 40, 30] };
  const maxValue = Math.max(...chartData.values);
  const barsHTML = chartData.labels.map((label, i) => {
    const value = chartData.values[i];
    const height = (value / maxValue) * 250;
    return `
      <div class="bar" style="height: ${height}px;">
        <span class="bar-value">${value}%</span>
        <span class="bar-label">${label}</span>
      </div>
    `;
  }).join('');
  
  return `
    <div class="slide">
      <div class="slide-header">
        <h1 class="slide-title">${content.title}</h1>
      </div>
      
      <div class="slide-content">
        <div class="market-grid">
          <div class="market-info">
            ${content.marketSize ? `
            <div class="market-size-box">
              <div class="market-size-label">Total Addressable Market</div>
              <div class="market-size-value">${content.marketSize}</div>
            </div>
            ` : ''}
            
            <ul class="insights-list">
              ${insightsHTML}
            </ul>
          </div>
          
          <div class="chart-container">
            <div class="chart-placeholder">
              ${barsHTML}
            </div>
          </div>
        </div>
      </div>
      
      <div class="slide-footer">
        <div class="footer-left">
          ${content.footer?.source ? `<span>Source: ${content.footer.source}</span>` : ''}
          ${content.footer?.date ? `<span>${content.footer.date}</span>` : ''}
        </div>
        <span class="confidential">Confidential</span>
      </div>
    </div>
  `;
}

/**
 * Build Financial Model slide HTML
 */
function buildFinancialModelHTML(content) {
  const metricsHTML = (content.metrics || []).map(metric => {
    const isPositive = metric.change?.startsWith('+');
    return `
      <div class="metric-card">
        <div class="metric-label">${metric.label}</div>
        <div class="metric-value">${metric.value}</div>
        <div class="metric-change ${isPositive ? 'positive' : 'negative'}">
          ${metric.change} ${metric.period || ''}
        </div>
      </div>
    `;
  }).join('');
  
  const tableData = content.tableData || { headers: [], rows: [] };
  const headersHTML = tableData.headers.map(h => `<th>${h}</th>`).join('');
  const rowsHTML = tableData.rows.map(row => `
    <tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>
  `).join('');
  
  return `
    <div class="slide">
      <div class="slide-header">
        <h1 class="slide-title">${content.title}</h1>
      </div>
      
      <div class="slide-content">
        <div class="metrics-row">
          ${metricsHTML}
        </div>
        
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>${headersHTML}</tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="slide-footer">
        <div class="footer-left">
          ${content.footer?.source ? `<span>Source: ${content.footer.source}</span>` : ''}
          ${content.footer?.date ? `<span>${content.footer.date}</span>` : ''}
        </div>
        <span class="confidential">Confidential</span>
      </div>
    </div>
  `;
}

/**
 * Build Competitive Analysis slide HTML
 */
function buildCompetitiveAnalysisHTML(content) {
  const competitors = content.competitors || [];
  
  // 2x2 Matrix
  const bubblesHTML = competitors.map((comp, i) => {
    const left = comp.xPosition || (i * 25) + 10;
    const top = comp.yPosition || (i * 20) + 10;
    const isUs = comp.name?.toLowerCase().includes('we') || comp.name?.toLowerCase().includes('us');
    return `
      <div class="matrix-bubble ${isUs ? 'us' : ''}" style="left: ${left}%; top: ${top}%;">
        ${comp.name}
      </div>
    `;
  }).join('');
  
  // Feature comparison table
  const features = content.features || ['Feature 1', 'Feature 2', 'Feature 3'];
  const tableHeaders = ['Company', ...features].map(h => `<th>${h}</th>`).join('');
  
  const tableRows = competitors.map(comp => {
    const cells = [comp.name || 'Company'];
    features.forEach((feat, i) => {
      const hasFeature = comp.features?.[i] || false;
      cells.push(hasFeature ? '<span class="check">✓</span>' : '<span class="cross">—</span>');
    });
    return `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
  }).join('');
  
  return `
    <div class="slide">
      <div class="slide-header">
        <h1 class="slide-title">${content.title || 'Competitive Positioning'}</h1>
      </div>
      
      <div class="slide-content">
        <div class="competitive-grid">
          <div class="matrix-container">
            <div class="matrix-title">${content.matrixTitle || 'Competitive Matrix'}</div>
            <div class="matrix">
              <div class="matrix-axis x-left">${content.xAxis?.low || 'Low'}</div>
              <div class="matrix-axis x-right">${content.xAxis?.high || 'High'}</div>
              <div class="matrix-axis y-bottom">${content.yAxis?.low || 'Low'}</div>
              <div class="matrix-axis y-top">${content.yAxis?.high || 'High'}</div>
              <div class="matrix-quadrants">
                <div class="quadrant"></div>
                <div class="quadrant"></div>
                <div class="quadrant"></div>
                <div class="quadrant"></div>
              </div>
              ${bubblesHTML}
            </div>
          </div>
          
          <div class="comparison-table-container">
            <table class="comparison-table">
              <thead>
                <tr>${tableHeaders}</tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div class="slide-footer">
        <div class="footer-left">
          ${content.footer?.source ? `<span>Source: ${content.footer.source}</span>` : ''}
          ${content.footer?.date ? `<span>${content.footer.date}</span>` : ''}
        </div>
        <span class="confidential">Confidential</span>
      </div>
    </div>
  `;
}

/**
 * Build Growth Strategy slide HTML
 */
function buildGrowthStrategyHTML(content) {
  const flywheelItems = content.flywheel || [
    { label: 'Attract' },
    { label: 'Engage' },
    { label: 'Delight' },
    { label: 'Retain' }
  ];
  
  const flywheelHTML = flywheelItems.map((item, i) => {
    const isLast = i === flywheelItems.length - 1;
    return `
      <div class="flywheel-item">
        <div class="flywheel-circle">${item.label}</div>
        ${!isLast ? '<div class="flywheel-arrow">→</div>' : ''}
      </div>
    `;
  }).join('');
  
  const initiatives = content.initiatives || [];
  const initiativesHTML = initiatives.map((init, i) => `
    <div class="initiative-card">
      <div class="initiative-number">${i + 1}</div>
      <div class="initiative-title">${init.title}</div>
      <div class="initiative-desc">${init.description}</div>
    </div>
  `).join('');
  
  return `
    <div class="slide">
      <div class="slide-header">
        <h1 class="slide-title">${content.title || 'Growth Strategy'}</h1>
      </div>
      
      <div class="slide-content">
        <div class="growth-container">
          ${content.flywheelTitle ? `<div style="font-size: 18px; font-weight: 600; color: #71717a; text-align: center;">${content.flywheelTitle}</div>` : ''}
          
          <div class="flywheel-container">
            ${flywheelHTML}
          </div>
          
          ${initiatives.length > 0 ? `<div style="font-size: 18px; font-weight: 600; color: #0d2137; margin-top: 20px;">Strategic Initiatives</div>` : ''}
          
          <div class="initiatives-grid">
            ${initiativesHTML}
          </div>
        </div>
      </div>
      
      <div class="slide-footer">
        <div class="footer-left">
          ${content.footer?.source ? `<span>Source: ${content.footer.source}</span>` : ''}
          ${content.footer?.date ? `<span>${content.footer.date}</span>` : ''}
        </div>
        <span class="confidential">Confidential</span>
      </div>
    </div>
  `;
}

/**
 * Build Risk Assessment slide HTML
 */
function buildRiskAssessmentHTML(content) {
  const risks = content.risks || [];
  
  // Organize risks by probability/impact
  const riskCells = { high: [], medium: [], low: [] };
  risks.forEach(risk => {
    const prob = (risk.probability || '').toLowerCase();
    if (prob.includes('high')) riskCells.high.push(risk);
    else if (prob.includes('medium') || prob.includes('med')) riskCells.medium.push(risk);
    else riskCells.low.push(risk);
  });
  
  const makeRiskItems = (items) => items.slice(0, 2).map(r => `
    <div class="risk-item">${r.name}</div>
  `).join('');
  
  const mitigations = content.mitigations || [];
  const mitigationRows = mitigations.map(m => `
    <tr>
      <td>${m.risk}</td>
      <td><span class="risk-badge ${m.level}">${m.level}</span></td>
      <td>${m.action}</td>
    </tr>
  `).join('');
  
  return `
    <div class="slide">
      <div class="slide-header">
        <h1 class="slide-title">${content.title || 'Risk Assessment'}</h1>
      </div>
      
      <div class="slide-content">
        <div class="risk-container">
          <div class="risk-matrix">
            <div></div>
            <div class="risk-matrix-header">Low Impact</div>
            <div class="risk-matrix-header">Medium Impact</div>
            <div class="risk-matrix-header">High Impact</div>
            
            <div class="risk-matrix-label">High Probability</div>
            <div class="risk-cell medium">
              <div class="risk-cell-title">Medium Risk</div>
              ${makeRiskItems(riskCells.high.filter(r => !r.impact?.includes('high')))}
            </div>
            <div class="risk-cell high">
              <div class="risk-cell-title">High Risk</div>
              ${makeRiskItems(riskCells.high.filter(r => r.impact?.includes('medium')))}
            </div>
            <div class="risk-cell high">
              <div class="risk-cell-title">Critical</div>
              ${makeRiskItems(riskCells.high.filter(r => r.impact?.includes('high')))}
            </div>
            
            <div class="risk-matrix-label">Medium Probability</div>
            <div class="risk-cell low">
              <div class="risk-cell-title">Low Risk</div>
              ${makeRiskItems(riskCells.medium.filter(r => !r.impact))}
            </div>
            <div class="risk-cell medium">
              <div class="risk-cell-title">Medium Risk</div>
              ${makeRiskItems(riskCells.medium.filter(r => r.impact))}
            </div>
            <div class="risk-cell high">
              <div class="risk-cell-title">High Risk</div>
              ${makeRiskItems(riskCells.medium.filter(r => r.impact?.includes('high')))}
            </div>
            
            <div class="risk-matrix-label">Low Probability</div>
            <div class="risk-cell low">
              <div class="risk-cell-title">Minimal</div>
              ${makeRiskItems(riskCells.low)}
            </div>
            <div class="risk-cell low">
              <div class="risk-cell-title">Low Risk</div>
            </div>
            <div class="risk-cell medium">
              <div class="risk-cell-title">Monitor</div>
            </div>
          </div>
          
          ${mitigations.length > 0 ? `
          <div style="margin-top: 20px;">
            <table class="mitigation-table">
              <thead>
                <tr>
                  <th>Risk</th>
                  <th>Level</th>
                  <th>Mitigation</th>
                </tr>
              </thead>
              <tbody>
                ${mitigationRows}
              </tbody>
            </table>
          </div>
          ` : ''}
        </div>
      </div>
      
      <div class="slide-footer">
        <div class="footer-left">
          ${content.footer?.source ? `<span>Source: ${content.footer.source}</span>` : ''}
          ${content.footer?.date ? `<span>${content.footer.date}</span>` : ''}
        </div>
        <span class="confidential">Confidential</span>
      </div>
    </div>
  `;
}

/**
 * Render slide content to HTML
 */
function buildSlideHTML(slideType, content) {
  let bodyHTML = '';
  
  switch (slideType) {
    case 'Executive Summary':
      bodyHTML = buildExecutiveSummaryHTML(content);
      break;
    case 'Market Analysis':
      bodyHTML = buildMarketAnalysisHTML(content);
      break;
    case 'Financial Model':
      bodyHTML = buildFinancialModelHTML(content);
      break;
    case 'Competitive Analysis':
      bodyHTML = buildCompetitiveAnalysisHTML(content);
      break;
    case 'Growth Strategy':
      bodyHTML = buildGrowthStrategyHTML(content);
      break;
    case 'Risk Assessment':
      bodyHTML = buildRiskAssessmentHTML(content);
      break;
    default:
      bodyHTML = buildExecutiveSummaryHTML(content);
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>${getSlideStyles()}</style>
    </head>
    <body>
      ${bodyHTML}
    </body>
    </html>
  `;
}

/**
 * Generate a placeholder SVG as fallback when Puppeteer isn't available
 */
function generatePlaceholderSVG(content, slideType) {
  const title = content.title || 'Consulting Slide';
  const subtitle = content.subtitle || '';
  
  // Create a simple SVG representation with McKinsey-style colors
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SLIDE_WIDTH}" height="${SLIDE_HEIGHT}" viewBox="0 0 ${SLIDE_WIDTH} ${SLIDE_HEIGHT}">
    <rect width="100%" height="100%" fill="#fafafa"/>
    <rect x="80" y="60" width="${SLIDE_WIDTH - 160}" height="4" fill="#0d2137"/>
    <text x="80" y="130" font-family="Arial, sans-serif" font-size="52" font-weight="bold" fill="#0d2137">${escapeXml(title)}</text>
    ${subtitle ? `<text x="80" y="190" font-family="Arial, sans-serif" font-size="28" fill="#52525b">${escapeXml(subtitle)}</text>` : ''}
    <rect x="80" y="280" width="800" height="200" rx="8" fill="#f4f4f5"/>
    <text x="100" y="340" font-family="Arial, sans-serif" font-size="18" fill="#71717a">Slide Type: ${slideType}</text>
    <text x="100" y="380" font-family="Arial, sans-serif" font-size="16" fill="#a1a1aa">Generated by SlideTheory</text>
    <text x="100" y="420" font-family="Arial, sans-serif" font-size="16" fill="#a1a1aa">Note: Install Chromium for full image rendering</text>
    
    <text x="${SLIDE_WIDTH - 80}" y="${SLIDE_HEIGHT - 60}" font-family="Arial, sans-serif" font-size="14" fill="#a1a1aa" text-anchor="end">Confidential</text>
  </svg>`;
  
  return svg;
}

/**
 * Escape special XML characters
 */
function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/\u0026/g, '&amp;')
    .replace(/\u003c/g, '&lt;')
    .replace(/\u003e/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Render slide to image file
 */
async function renderSlideToImage({ slideType, content, outputPath }) {
  const html = buildSlideHTML(slideType, content);
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });
  
  // If we already know Puppeteer isn't available, skip to fallback
  if (!puppeteerAvailable) {
    console.log('[SlideGenerator] Using fallback SVG rendering (Puppeteer unavailable)');
    const svg = generatePlaceholderSVG(content, slideType);
    // Change extension to .svg for proper browser rendering
    const svgPath = outputPath.replace('.png', '.svg');
    await fs.writeFile(svgPath, svg);
    return svgPath;
  }
  
  try {
    // Generate image using node-html-to-image
    await nodeHtmlToImage({
      html,
      output: outputPath,
      puppeteerArgs: {
        defaultViewport: {
          width: SLIDE_WIDTH,
          height: SLIDE_HEIGHT,
          deviceScaleFactor: 2 // High resolution
        },
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      },
      type: 'png'
    });
    
    return outputPath;
  } catch (error) {
    console.error('[SlideGenerator] Puppeteer error:', error.message);
    
    // Mark Puppeteer as unavailable for future requests
    if (error.message.includes('Failed to launch') || error.message.includes('browser')) {
      puppeteerAvailable = false;
      lastPuppeteerError = error.message;
      console.log('[SlideGenerator] Switching to fallback SVG rendering mode');
    }
    
    // Fallback: Generate SVG placeholder with correct extension
    const svg = generatePlaceholderSVG(content, slideType);
    const svgPath = outputPath.replace('.png', '.svg');
    await fs.writeFile(svgPath, svg);
    
    return svgPath;
  }
}

module.exports = { renderSlideToImage, buildSlideHTML };
