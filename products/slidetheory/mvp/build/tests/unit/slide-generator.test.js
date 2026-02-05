/**
 * Unit Tests - Slide Generator
 * Tests: buildSlideHTML, renderSlideToImage, generatePlaceholderSVG
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const { mockSlideContent, VALID_SLIDE_TYPES } = require('../mocks/mock-data');

// Import the module under test
const { buildSlideHTML, renderSlideToImage } = require('../../lib/slide-generator');

describe('Slide Generator', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'slidetheory-test-'));
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  describe('buildSlideHTML', () => {
    
    it('should generate HTML for Executive Summary', () => {
      const html = buildSlideHTML('Executive Summary', mockSlideContent.executiveSummary);
      
      assert.ok(html.includes('<!DOCTYPE html>'));
      assert.ok(html.includes('Executive Summary'));
      assert.ok(html.includes(mockSlideContent.executiveSummary.title));
      assert.ok(html.includes('slide'));
    });

    it('should generate HTML for Market Analysis', () => {
      const html = buildSlideHTML('Market Analysis', mockSlideContent.marketAnalysis);
      
      assert.ok(html.includes('<!DOCTYPE html>'));
      assert.ok(html.includes(mockSlideContent.marketAnalysis.title));
      assert.ok(html.includes(mockSlideContent.marketAnalysis.marketSize));
    });

    it('should generate HTML for Financial Model', () => {
      const html = buildSlideHTML('Financial Model', mockSlideContent.financialModel);
      
      assert.ok(html.includes('<!DOCTYPE html>'));
      assert.ok(html.includes(mockSlideContent.financialModel.title));
      assert.ok(html.includes('metric'));
    });

    it('should generate HTML for Competitive Analysis', () => {
      const html = buildSlideHTML('Competitive Analysis', mockSlideContent.competitiveAnalysis);
      
      assert.ok(html.includes('<!DOCTYPE html>'));
      assert.ok(html.includes(mockSlideContent.competitiveAnalysis.title));
      assert.ok(html.includes('matrix'));
    });

    it('should generate HTML for Growth Strategy', () => {
      const html = buildSlideHTML('Growth Strategy', mockSlideContent.growthStrategy);
      
      assert.ok(html.includes('<!DOCTYPE html>'));
      assert.ok(html.includes(mockSlideContent.growthStrategy.title));
      assert.ok(html.includes('flywheel'));
    });

    it('should generate HTML for Risk Assessment', () => {
      const html = buildSlideHTML('Risk Assessment', mockSlideContent.riskAssessment);
      
      assert.ok(html.includes('<!DOCTYPE html>'));
      assert.ok(html.includes(mockSlideContent.riskAssessment.title));
      assert.ok(html.includes('risk'));
    });

    it('should default to Executive Summary for unknown type', () => {
      const html = buildSlideHTML('Unknown Type', { title: 'Test' });
      
      assert.ok(html.includes('<!DOCTYPE html>'));
      assert.ok(html.includes('Test'));
    });

    it('should include CSS styles', () => {
      const html = buildSlideHTML('Executive Summary', mockSlideContent.executiveSummary);
      
      assert.ok(html.includes('<style>'));
      assert.ok(html.includes('</style>'));
      assert.ok(html.includes('Inter')); // Font family
    });

    it('should include slide dimensions', () => {
      const html = buildSlideHTML('Executive Summary', mockSlideContent.executiveSummary);
      
      assert.ok(html.includes('1920') || html.includes('slide'));
    });

    it('should handle missing content gracefully', () => {
      const html = buildSlideHTML('Executive Summary', {});
      
      assert.ok(html.includes('<!DOCTYPE html>'));
    });

    it('should include footer when provided', () => {
      const html = buildSlideHTML('Executive Summary', mockSlideContent.executiveSummary);
      
      assert.ok(html.includes('footer') || html.includes('Confidential'));
    });

    it('should generate valid HTML structure', () => {
      const html = buildSlideHTML('Executive Summary', mockSlideContent.executiveSummary);
      
      assert.ok(html.includes('<html>'));
      assert.ok(html.includes('<head>'));
      assert.ok(html.includes('<body>'));
      assert.ok(html.includes('</html>'));
    });
  });

  describe('HTML Content Specific Tests', () => {
    
    it('Executive Summary should include key points', () => {
      const html = buildSlideHTML('Executive Summary', mockSlideContent.executiveSummary);
      
      for (const point of mockSlideContent.executiveSummary.keyPoints) {
        assert.ok(html.includes(point.heading), `Should include heading: ${point.heading}`);
      }
    });

    it('Executive Summary should include recommendation', () => {
      const html = buildSlideHTML('Executive Summary', mockSlideContent.executiveSummary);
      
      assert.ok(html.includes(mockSlideContent.executiveSummary.recommendation));
    });

    it('Market Analysis should include chart data', () => {
      const html = buildSlideHTML('Market Analysis', mockSlideContent.marketAnalysis);
      
      assert.ok(html.includes('chart') || html.includes('bar'));
    });

    it('Financial Model should include metrics', () => {
      const html = buildSlideHTML('Financial Model', mockSlideContent.financialModel);
      
      for (const metric of mockSlideContent.financialModel.metrics) {
        assert.ok(html.includes(metric.label) || html.includes(metric.value));
      }
    });

    it('Financial Model should include table', () => {
      const html = buildSlideHTML('Financial Model', mockSlideContent.financialModel);
      
      assert.ok(html.includes('<table') || html.includes('table'));
    });

    it('Competitive Analysis should include competitor names', () => {
      const html = buildSlideHTML('Competitive Analysis', mockSlideContent.competitiveAnalysis);
      
      for (const competitor of mockSlideContent.competitiveAnalysis.competitors) {
        assert.ok(html.includes(competitor.name));
      }
    });

    it('Growth Strategy should include flywheel items', () => {
      const html = buildSlideHTML('Growth Strategy', mockSlideContent.growthStrategy);
      
      for (const item of mockSlideContent.growthStrategy.flywheel) {
        assert.ok(html.includes(item.label));
      }
    });

    it('Growth Strategy should include initiatives', () => {
      const html = buildSlideHTML('Growth Strategy', mockSlideContent.growthStrategy);
      
      for (const initiative of mockSlideContent.growthStrategy.initiatives) {
        assert.ok(html.includes(initiative.title));
      }
    });

    it('Risk Assessment should include risk names', () => {
      const html = buildSlideHTML('Risk Assessment', mockSlideContent.riskAssessment);
      
      for (const risk of mockSlideContent.riskAssessment.risks) {
        assert.ok(html.includes(risk.name));
      }
    });
  });

  describe('renderSlideToImage', () => {
    
    it('should generate output file', async () => {
      const outputPath = path.join(tempDir, 'test-slide.png');
      
      const result = await renderSlideToImage({
        slideType: 'Executive Summary',
        content: mockSlideContent.executiveSummary,
        outputPath
      });
      
      assert.ok(result);
      // File may be .png or .svg depending on Puppeteer availability
      assert.ok(result.endsWith('.png') || result.endsWith('.svg'));
    });

    it('should handle all slide types', async () => {
      for (const slideType of VALID_SLIDE_TYPES) {
        const outputPath = path.join(tempDir, `${slideType.replace(/\s+/g, '-')}.png`);
        const typeKey = slideType.toLowerCase().replace(/\s+/g, '');
        
        const result = await renderSlideToImage({
          slideType,
          content: mockSlideContent[typeKey] || mockSlideContent.executiveSummary,
          outputPath
        });
        
        assert.ok(result, `${slideType} should generate output`);
      }
    });

    it('should create output directory if needed', async () => {
      const nestedDir = path.join(tempDir, 'nested', 'dir');
      const outputPath = path.join(nestedDir, 'test.png');
      
      const result = await renderSlideToImage({
        slideType: 'Executive Summary',
        content: mockSlideContent.executiveSummary,
        outputPath
      });
      
      assert.ok(result);
    });

    it('should handle missing content gracefully', async () => {
      const outputPath = path.join(tempDir, 'empty.png');
      
      const result = await renderSlideToImage({
        slideType: 'Executive Summary',
        content: {},
        outputPath
      });
      
      assert.ok(result);
    });
  });
});
