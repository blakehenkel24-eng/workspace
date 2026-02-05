/**
 * HTML Fallback Templates
 * Static HTML templates for graceful degradation when AI fails
 */

const { formatConsultingDate } = require('../utils/helpers');

// McKinsey-style color palette
const COLORS = {
  navy: '#003366',
  navyLight: '#1a4d7a',
  gray: '#F5F5F5',
  grayDark: '#666666',
  accent: '#4A90E2',
  white: '#FFFFFF',
  black: '#1a1a1a',
  green: '#16a34a',
  red: '#dc2626',
  amber: '#f59e0b'
};

/**
 * Generate base HTML template with common styling
 */
function generateBaseHTML(title, content, options = {}) {
  const today = formatConsultingDate();
  const source = options.source || 'SlideTheory';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: ${COLORS.white};
      color: ${COLORS.black};
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      position: relative;
    }
    
    .slide-container {
      width: 100%;
      height: 100%;
      padding: 60px 80px;
      display: flex;
      flex-direction: column;
    }
    
    .header-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 8px;
      background: ${COLORS.navy};
    }
    
    .slide-title {
      font-size: 42px;
      font-weight: 700;
      color: ${COLORS.navy};
      margin-bottom: 16px;
      line-height: 1.2;
    }
    
    .slide-subtitle {
      font-size: 24px;
      color: ${COLORS.grayDark};
      margin-bottom: 40px;
    }
    
    .slide-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 20px;
      border-top: 1px solid ${COLORS.gray};
      font-size: 14px;
      color: ${COLORS.grayDark};
    }
    
    .footer-source {
      font-style: italic;
    }
    
    .footer-date {
      color: ${COLORS.grayDark};
    }
    
    .footer-confidential {
      font-weight: 600;
      color: ${COLORS.navy};
    }
    
    .fallback-notice {
      position: absolute;
      top: 20px;
      right: 80px;
      background: ${COLORS.amber}20;
      border: 1px solid ${COLORS.amber};
      border-radius: 4px;
      padding: 8px 16px;
      font-size: 12px;
      color: ${COLORS.amber};
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .fallback-notice::before {
      content: "⚠️";
    }
  </style>
</head>
<body>
  <div class="header-bar"></div>
  ${options.showFallbackNotice ? `
  <div class="fallback-notice">
    Fallback Mode - AI generation unavailable
  </div>` : ''}
  <div class="slide-container">
    ${content}
    <div class="slide-footer">
      <span class="footer-source">Source: ${escapeHtml(source)}</span>
      <span class="footer-date">${today}</span>
      <span class="footer-confidential">Confidential</span>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Executive Summary fallback template
 */
function generateExecutiveSummaryFallback(data = {}) {
  const title = data.title || 'Strategic Recommendations for Leadership';
  const subtitle = data.subtitle || 'Executive Summary';
  const keyPoints = data.keyPoints || [
    { heading: 'Market Opportunity', text: 'Significant growth potential identified in target segments.' },
    { heading: 'Competitive Position', text: 'Strong differentiation enables premium positioning.' },
    { heading: 'Strategic Priority', text: 'Focus on core capabilities to maximize value.' }
  ];
  const recommendation = data.recommendation || 'Pursue aggressive growth while optimizing operations.';
  
  const content = `
    <h1 class="slide-title">${escapeHtml(title)}</h1>
    <p class="slide-subtitle">${escapeHtml(subtitle)}</p>
    <div class="slide-content">
      <div class="key-points">
        ${keyPoints.map((point, i) => `
          <div class="key-point" style="
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
            align-items: flex-start;
          ">
            <div class="point-number" style="
              width: 40px;
              height: 40px;
              background: ${COLORS.navy};
              color: ${COLORS.white};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              font-size: 18px;
              flex-shrink: 0;
            ">${i + 1}</div>
            <div class="point-content">
              <h3 style="
                font-size: 22px;
                font-weight: 600;
                color: ${COLORS.black};
                margin-bottom: 8px;
              ">${escapeHtml(point.heading)}</h3>
              <p style="
                font-size: 18px;
                color: ${COLORS.grayDark};
                line-height: 1.5;
              ">${escapeHtml(point.text)}</p>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="recommendation-box" style="
        background: ${COLORS.navy};
        color: ${COLORS.white};
        padding: 24px 32px;
        border-radius: 8px;
        margin-top: auto;
      ">
        <div style="
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
          opacity: 0.8;
        ">Recommendation</div>
        <div style="
          font-size: 20px;
          font-weight: 600;
        ">${escapeHtml(recommendation)}</div>
      </div>
    </div>
  `;
  
  return generateBaseHTML(title, content, { showFallbackNotice: true });
}

/**
 * Market Analysis fallback template
 */
function generateMarketAnalysisFallback(data = {}) {
  const title = data.title || 'Market Landscape and Growth Opportunity';
  const marketSize = data.marketSize || '$2.4B (growing 18% annually)';
  const insights = data.insights || [
    'Market shows strong double-digit growth with expanding opportunities',
    'Competitive landscape consolidating, creating entry opportunities',
    'Customer preferences shifting toward integrated solutions'
  ];
  
  const content = `
    <h1 class="slide-title">${escapeHtml(title)}</h1>
    <div class="slide-content" style="flex-direction: row; gap: 60px;">
      <div class="left-column" style="flex: 1;">
        <div class="market-size-card" style="
          background: ${COLORS.gray};
          border: 2px solid ${COLORS.navy};
          border-radius: 8px;
          padding: 32px;
          margin-bottom: 40px;
        ">
          <div style="
            font-size: 14px;
            color: ${COLORS.grayDark};
            margin-bottom: 8px;
          ">Total Addressable Market</div>
          <div style="
            font-size: 36px;
            font-weight: 700;
            color: ${COLORS.navy};
          ">${escapeHtml(marketSize)}</div>
        </div>
        <div class="insights">
          <h3 style="
            font-size: 20px;
            font-weight: 600;
            color: ${COLORS.black};
            margin-bottom: 16px;
          ">Key Insights</h3>
          ${insights.map(insight => `
            <div class="insight" style="
              display: flex;
              align-items: flex-start;
              gap: 12px;
              margin-bottom: 16px;
              font-size: 18px;
              color: ${COLORS.black};
            ">
              <span style="color: ${COLORS.accent};">→</span>
              <span>${escapeHtml(insight)}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="right-column" style="
        flex: 1;
        background: ${COLORS.gray};
        border-radius: 8px;
        padding: 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          font-size: 18px;
          color: ${COLORS.grayDark};
          margin-bottom: 24px;
        ">Market Growth Trajectory</div>
        <div class="chart-placeholder" style="
          width: 100%;
          height: 300px;
          background: linear-gradient(to top, ${COLORS.navy}20, ${COLORS.navy}05);
          border-radius: 8px;
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          padding: 20px;
        ">
          ${[25, 35, 48, 65].map((val, i) => `
            <div style="text-align: center;">
              <div style="
                width: 80px;
                height: ${val * 3}px;
                background: ${COLORS.accent};
                border-radius: 4px 4px 0 0;
                margin-bottom: 8px;
              "></div>
              <div style="
                font-size: 14px;
                color: ${COLORS.grayDark};
              ">${['2022', '2023', '2024E', '2025E'][i]}</div>
              <div style="
                font-size: 16px;
                font-weight: 600;
                color: ${COLORS.navy};
              ">${val}%</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  
  return generateBaseHTML(title, content, { showFallbackNotice: true });
}

/**
 * Financial Model fallback template
 */
function generateFinancialModelFallback(data = {}) {
  const title = data.title || 'Financial Performance & Trajectory';
  const metrics = data.metrics || [
    { label: 'Revenue', value: '$5.2M', change: '+23%', period: 'YoY' },
    { label: 'Gross Margin', value: '68%', change: '+4pp', period: 'YoY' },
    { label: 'EBITDA', value: '$1.2M', change: '+31%', period: 'YoY' }
  ];
  
  const content = `
    <h1 class="slide-title">${escapeHtml(title)}</h1>
    <div class="slide-content">
      <div class="metrics-row" style="
        display: flex;
        gap: 24px;
        margin-bottom: 40px;
      ">
        ${metrics.map(metric => `
          <div class="metric-card" style="
            flex: 1;
            background: ${COLORS.gray};
            border: 2px solid ${COLORS.navy};
            border-radius: 8px;
            padding: 28px;
          ">
            <div style="
              font-size: 14px;
              color: ${COLORS.grayDark};
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 8px;
            ">${escapeHtml(metric.label)}</div>
            <div style="
              font-size: 36px;
              font-weight: 700;
              color: ${COLORS.navy};
              margin-bottom: 8px;
            ">${escapeHtml(metric.value)}</div>
            <div style="
              font-size: 16px;
              font-weight: 600;
              color: ${metric.change.startsWith('+') ? COLORS.green : COLORS.red};
            ">${escapeHtml(metric.change)} ${escapeHtml(metric.period || '')}</div>
          </div>
        `).join('')}
      </div>
      <div class="table-container">
        <table style="
          width: 100%;
          border-collapse: collapse;
          font-size: 18px;
        ">
          <thead>
            <tr style="background: ${COLORS.navy};">
              ${['Metric', '2023', '2024', '2025E'].map(header => `
                <th style="
                  padding: 16px 24px;
                  text-align: left;
                  color: ${COLORS.white};
                  font-weight: 600;
                ">${header}</th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${[
              ['Revenue ($M)', '4.2', '5.2', '6.8'],
              ['Growth %', '15%', '23%', '31%'],
              ['Gross Margin %', '64%', '68%', '71%']
            ].map((row, i) => `
              <tr style="background: ${i % 2 === 0 ? COLORS.white : COLORS.gray};">
                ${row.map((cell, j) => `
                  <td style="
                    padding: 16px 24px;
                    border-bottom: 1px solid ${COLORS.gray};
                    text-align: ${j === 0 ? 'left' : 'right'};
                  ">${cell}</td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  return generateBaseHTML(title, content, { showFallbackNotice: true });
}

/**
 * Generic error slide template
 */
function generateErrorSlide(error, context = {}) {
  const title = 'Generation Issue Detected';
  
  const content = `
    <h1 class="slide-title" style="color: ${COLORS.red};">⚠️ ${title}</h1>
    <div class="slide-content" style="align-items: center; justify-content: center; text-align: center;">
      <div style="
        max-width: 800px;
        padding: 48px;
        background: ${COLORS.gray};
        border-radius: 12px;
        border-left: 4px solid ${COLORS.red};
      ">
        <div style="
          font-size: 20px;
          color: ${COLORS.grayDark};
          margin-bottom: 16px;
        ">We encountered an issue while generating your slide</div>
        <div style="
          font-size: 24px;
          font-weight: 600;
          color: ${COLORS.black};
          margin-bottom: 32px;
        ">${escapeHtml(error.message || 'Unknown error')}</div>
        <div style="
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        ">
          <div style="
            padding: 12px 24px;
            background: ${COLORS.navy};
            color: ${COLORS.white};
            border-radius: 6px;
            font-weight: 600;
          ">Try: Regenerate</div>
          <div style="
            padding: 12px 24px;
            background: ${COLORS.white};
            color: ${COLORS.navy};
            border: 2px solid ${COLORS.navy};
            border-radius: 6px;
            font-weight: 600;
          ">Try: Simplify Prompt</div>
          <div style="
            padding: 12px 24px;
            background: ${COLORS.white};
            color: ${COLORS.grayDark};
            border: 2px solid ${COLORS.grayDark};
            border-radius: 6px;
            font-weight: 600;
          ">Contact Support</div>
        </div>
      </div>
    </div>
  `;
  
  return generateBaseHTML(title, content, { showFallbackNotice: true, source: 'Error Recovery' });
}

/**
 * Get fallback template by slide type
 */
function getFallbackTemplate(slideType, data = {}) {
  switch (slideType) {
    case 'Executive Summary':
      return generateExecutiveSummaryFallback(data);
    case 'Market Analysis':
      return generateMarketAnalysisFallback(data);
    case 'Financial Model':
      return generateFinancialModelFallback(data);
    default:
      return generateExecutiveSummaryFallback(data);
  }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = {
  generateExecutiveSummaryFallback,
  generateMarketAnalysisFallback,
  generateFinancialModelFallback,
  generateErrorSlide,
  getFallbackTemplate,
  escapeHtml,
  COLORS
};
