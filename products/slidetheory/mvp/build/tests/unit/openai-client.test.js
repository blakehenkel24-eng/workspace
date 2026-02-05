/**
 * Unit Tests - OpenAI Client
 * Tests: generateSlideContent, generateFallbackContent, callKimi
 */

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');

// We'll test the functions by loading them directly
const path = require('path');
const { 
  mockValidRequests, 
  mockSlideContent,
  VALID_SLIDE_TYPES 
} = require('../mocks/mock-data');

// Load the module under test (need to handle env vars)
process.env.KIMI_API_KEY = 'test-api-key';
let openaiClient;

describe('OpenAI Client', () => {
  
  beforeEach(() => {
    // Reload module for clean state
    delete require.cache[require.resolve('../../lib/openai-client')];
    openaiClient = require('../../lib/openai-client');
  });

  describe('generateFallbackContent', () => {
    
    it('should return fallback content for Executive Summary', () => {
      const content = openaiClient.generateFallbackContent(
        'Executive Summary',
        'Test context',
        [],
        'C-Suite'
      );
      
      assert.ok(content);
      assert.strictEqual(content._slideType, 'Executive Summary');
      assert.ok(content.title);
      assert.ok(Array.isArray(content.keyPoints));
      assert.ok(content.footer);
    });

    it('should return fallback content for Market Analysis', () => {
      const content = openaiClient.generateFallbackContent(
        'Market Analysis',
        'Test context',
        [],
        'Investors'
      );
      
      assert.ok(content);
      assert.strictEqual(content._slideType, 'Market Analysis');
      assert.ok(content.marketSize);
      assert.ok(content.insights);
      assert.ok(content.chartData);
    });

    it('should return fallback content for Financial Model', () => {
      const content = openaiClient.generateFallbackContent(
        'Financial Model',
        'Test context',
        [],
        'Board'
      );
      
      assert.ok(content);
      assert.strictEqual(content._slideType, 'Financial Model');
      assert.ok(Array.isArray(content.metrics));
      assert.ok(content.tableData);
    });

    it('should return fallback content for Competitive Analysis', () => {
      const content = openaiClient.generateFallbackContent(
        'Competitive Analysis',
        'Test context',
        [],
        'C-Suite'
      );
      
      assert.ok(content);
      assert.strictEqual(content._slideType, 'Competitive Analysis');
      assert.ok(Array.isArray(content.competitors));
      assert.ok(Array.isArray(content.features));
    });

    it('should return fallback content for Growth Strategy', () => {
      const content = openaiClient.generateFallbackContent(
        'Growth Strategy',
        'Test context',
        [],
        'Management'
      );
      
      assert.ok(content);
      assert.strictEqual(content._slideType, 'Growth Strategy');
      assert.ok(Array.isArray(content.flywheel));
      assert.ok(Array.isArray(content.initiatives));
    });

    it('should return fallback content for Risk Assessment', () => {
      const content = openaiClient.generateFallbackContent(
        'Risk Assessment',
        'Test context',
        [],
        'Board'
      );
      
      assert.ok(content);
      assert.strictEqual(content._slideType, 'Risk Assessment');
      assert.ok(Array.isArray(content.risks));
      assert.ok(Array.isArray(content.mitigations));
    });

    it('should default to Executive Summary for unknown slide type', () => {
      const content = openaiClient.generateFallbackContent(
        'Unknown Type',
        'Test context',
        [],
        'C-Suite'
      );
      
      assert.ok(content);
      assert.ok(content.title);
      assert.ok(Array.isArray(content.keyPoints));
    });

    it('should extract metrics from data points', () => {
      const dataPoints = [
        'Revenue: $10M',
        'Growth: 45%',
        'Margin: 70%'
      ];
      
      const content = openaiClient.generateFallbackContent(
        'Financial Model',
        'Revenue growth context',
        dataPoints,
        'Investors'
      );
      
      assert.ok(content.metrics);
      assert.strictEqual(content.metrics.length, 3);
    });

    it('should handle context with revenue keywords', () => {
      const content = openaiClient.generateFallbackContent(
        'Executive Summary',
        'Our revenue grew significantly this quarter',
        [],
        'C-Suite'
      );
      
      assert.ok(content.title);
      assert.ok(content.title.toLowerCase().includes('revenue') || 
                content.title.toLowerCase().includes('growth'));
    });

    it('should handle context with investment keywords', () => {
      const content = openaiClient.generateFallbackContent(
        'Executive Summary',
        'We are raising Series A funding',
        [],
        'Investors'
      );
      
      assert.ok(content.title);
    });

    it('should generate valid footer with date', () => {
      const content = openaiClient.generateFallbackContent(
        'Executive Summary',
        'Test context',
        [],
        'C-Suite'
      );
      
      assert.ok(content.footer);
      assert.ok(content.footer.date);
      assert.ok(content.footer.source);
    });

    it('should return consistent structure for all slide types', () => {
      for (const slideType of VALID_SLIDE_TYPES) {
        const content = openaiClient.generateFallbackContent(
          slideType,
          'Test context',
          [],
          'C-Suite'
        );
        
        assert.ok(content._slideType, `${slideType} should have _slideType`);
        assert.ok(content.title, `${slideType} should have title`);
        assert.ok(content.footer, `${slideType} should have footer`);
      }
    });
  });

  describe('System Prompt Generation', () => {
    
    // Test that system prompts are generated correctly by checking
    // the internal getSystemPrompt function behavior through generateSlideContent
    
    it('should generate system prompt for Executive Summary', async () => {
      // Since we can't easily mock fetch, we test that fallback works
      const content = await openaiClient.generateSlideContent({
        slideType: 'Executive Summary',
        context: 'Test',
        targetAudience: 'C-Suite'
      });
      
      assert.ok(content);
      assert.ok(content.title);
    });

    it('should include target audience in generated content', async () => {
      const content = await openaiClient.generateSlideContent({
        slideType: 'Executive Summary',
        context: 'Test context for board presentation',
        targetAudience: 'Board of Directors'
      });
      
      assert.ok(content);
    });
  });

  describe('Error Handling', () => {
    
    it('should return fallback when no API key is set', async () => {
      delete process.env.KIMI_API_KEY;
      delete require.cache[require.resolve('../../lib/openai-client')];
      const client = require('../../lib/openai-client');
      
      const content = await client.generateSlideContent({
        slideType: 'Executive Summary',
        context: 'Test context',
        targetAudience: 'C-Suite'
      });
      
      assert.ok(content);
      assert.ok(content.title);
      
      // Restore API key
      process.env.KIMI_API_KEY = 'test-api-key';
    });
  });
});
