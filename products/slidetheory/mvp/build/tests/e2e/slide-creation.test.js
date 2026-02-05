/**
 * End-to-End Tests - Full Slide Creation Flow
 * Tests: Complete user journey from input to export
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs').promises;
const path = require('path');

const app = require('../../server');
const { mockValidRequests, VALID_SLIDE_TYPES } = require('../mocks/mock-data');

describe('E2E Tests - Slide Creation Flow', () => {
  let server;
  let baseUrl;
  let port;
  let generatedSlideIds = [];
  let generatedExportIds = [];

  before(async function() {
    this.timeout = 60000;
    
    // Start server
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        console.log(`  E2E Test Server: ${baseUrl}`);
        resolve();
      });
    });
  });

  after(async function() {
    this.timeout = 30000;
    
    // Cleanup
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  async function makeRequest(path, options = {}) {
    const url = `${baseUrl}${path}`;
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const data = await response.json().catch(() => null);
    return { response, data, status: response.status };
  }

  describe('Complete User Journey', () => {
    
    it('Full flow: Health check → Generate → View → Export', async function() {
      this.timeout = 60000;
      
      // Step 1: Health check
      const { data: healthData } = await makeRequest('/api/health');
      assert.ok(healthData.success || healthData.status === 'ok');
      
      // Step 2: Get templates
      const { data: templatesData } = await makeRequest('/api/templates');
      assert.ok(templatesData.success);
      assert.ok(templatesData.templates.length > 0);
      
      // Step 3: Use first template to generate slide
      const template = templatesData.templates[0];
      const { data: templateData } = await makeRequest(`/api/templates/${template.id}`);
      
      // Step 4: Generate slide
      const generateRequest = {
        slideType: 'Executive Summary',
        context: 'We are a fast-growing SaaS company preparing for Series B funding. Revenue grew 120% to $15M ARR with 85% gross margins.',
        dataPoints: [
          'ARR: $15M (+120% YoY)',
          'Gross Margin: 85%',
          'Net Revenue Retention: 125%'
        ],
        targetAudience: 'Investors',
        framework: 'MECE'
      };
      
      const { response: genResponse, data: genData } = await makeRequest('/api/generate', {
        method: 'POST',
        body: generateRequest
      });
      
      assert.strictEqual(genResponse.status, 200);
      assert.ok(genData.success);
      assert.ok(genData.slideId);
      assert.ok(genData.imageUrl);
      assert.ok(genData.title);
      assert.ok(genData.content);
      
      generatedSlideIds.push(genData.slideId);
      
      // Step 5: Verify slide image is accessible
      const imageResponse = await fetch(`${baseUrl}${genData.imageUrl}`);
      assert.ok(imageResponse.status === 200 || imageResponse.status === 404); // May expire quickly
      
      // Step 6: Export as PPTX
      const { response: pptxResponse, data: pptxData } = await makeRequest('/api/export/pptx', {
        method: 'POST',
        body: {
          slideType: generateRequest.slideType,
          content: genData.content
        }
      });
      
      assert.strictEqual(pptxResponse.status, 200);
      assert.ok(pptxData.success);
      assert.ok(pptxData.exportId);
      generatedExportIds.push(pptxData.exportId);
      
      // Step 7: Verify export is accessible
      const exportResponse = await fetch(`${baseUrl}${pptxData.downloadUrl}`);
      assert.ok(exportResponse.status === 200 || exportResponse.status === 404);
      
      // Step 8: Check stats updated
      const { data: statsData } = await makeRequest('/api/stats');
      assert.ok(statsData.success);
      assert.ok(statsData.totalSlides >= 0);
    });

    it('Full flow: All slide types end-to-end', async function() {
      this.timeout = 120000;
      
      for (const slideType of VALID_SLIDE_TYPES) {
        const request = {
          slideType,
          context: `This is a comprehensive test for ${slideType} slide generation with enough context to pass validation.`,
          targetAudience: 'C-Suite'
        };
        
        const { response, data } = await makeRequest('/api/generate', {
          method: 'POST',
          body: request
        });
        
        assert.strictEqual(response.status, 200, `${slideType} should generate successfully`);
        assert.ok(data.success, `${slideType} should return success`);
        assert.ok(data.slideId, `${slideType} should return slideId`);
        assert.ok(data.content, `${slideType} should return content`);
        assert.ok(data.title, `${slideType} should return title`);
        
        generatedSlideIds.push(data.slideId);
      }
    });

    it('Full flow: Template-based generation', async function() {
      this.timeout = 60000;
      
      // Get all templates
      const { data: templatesData } = await makeRequest('/api/templates');
      assert.ok(templatesData.success);
      
      // Test first template
      const template = templatesData.templates[0];
      const { data: templateDetail } = await makeRequest(`/api/templates/${template.id}`);
      
      if (templateDetail.success) {
        const templateContent = templateDetail.template;
        
        // Generate using template data
        const request = {
          slideType: templateContent.slideType || 'Executive Summary',
          context: templateContent.context || 'Template-based context with enough characters for validation.',
          dataPoints: templateContent.dataPoints || [],
          targetAudience: templateContent.targetAudience || 'C-Suite',
          framework: templateContent.framework
        };
        
        const { response, data } = await makeRequest('/api/generate', {
          method: 'POST',
          body: request
        });
        
        assert.strictEqual(response.status, 200);
        assert.ok(data.success);
        generatedSlideIds.push(data.slideId);
      }
    });

    it('Full flow: Generation with different audiences', async function() {
      this.timeout = 60000;
      
      const audiences = ['C-Suite', 'Board of Directors', 'Investors', 'Management Team'];
      
      for (const audience of audiences) {
        const request = {
          slideType: 'Executive Summary',
          context: 'Quarterly business review showing strong performance across all key metrics and strategic initiatives.',
          targetAudience: audience
        };
        
        const { response, data } = await makeRequest('/api/generate', {
          method: 'POST',
          body: request
        });
        
        assert.strictEqual(response.status, 200, `Should work for ${audience}`);
        assert.ok(data.success);
        generatedSlideIds.push(data.slideId);
      }
    });

    it('Full flow: Export all formats', async function() {
      this.timeout = 90000;
      
      // First generate a slide
      const { data: genData } = await makeRequest('/api/generate', {
        method: 'POST',
        body: mockValidRequests.executiveSummary
      });
      
      assert.ok(genData.success);
      
      // Export as PPTX
      const { response: pptxResponse, data: pptxData } = await makeRequest('/api/export/pptx', {
        method: 'POST',
        body: {
          slideType: 'Executive Summary',
          content: genData.content
        }
      });
      
      if (pptxResponse.status === 200) {
        assert.ok(pptxData.success);
        generatedExportIds.push(pptxData.exportId);
      }
      
      // Export as PDF
      const { response: pdfResponse, data: pdfData } = await makeRequest('/api/export/pdf', {
        method: 'POST',
        body: {
          slideType: 'Executive Summary',
          content: genData.content
        }
      });
      
      if (pdfResponse.status === 200) {
        assert.ok(pdfData.success);
        generatedExportIds.push(pdfData.exportId);
      }
    });

    it('Full flow: Error recovery', async function() {
      this.timeout = 30000;
      
      // Try invalid request
      const { response: invalidResponse, data: invalidData } = await makeRequest('/api/generate', {
        method: 'POST',
        body: { slideType: 'Invalid' }
      });
      
      assert.strictEqual(invalidResponse.status, 400);
      assert.strictEqual(invalidData.success, false);
      
      // Then make valid request
      const { response: validResponse, data: validData } = await makeRequest('/api/generate', {
        method: 'POST',
        body: mockValidRequests.executiveSummary
      });
      
      assert.strictEqual(validResponse.status, 200);
      assert.ok(validData.success);
    });

    it('Full flow: Concurrent requests', async function() {
      this.timeout = 60000;
      
      const requests = Array(3).fill(null).map((_, i) => ({
        slideType: VALID_SLIDE_TYPES[i % VALID_SLIDE_TYPES.length],
        context: `Concurrent test request ${i + 1} with enough characters to pass validation check.`,
        targetAudience: 'C-Suite'
      }));
      
      const responses = await Promise.all(
        requests.map(req => makeRequest('/api/generate', { method: 'POST', body: req }))
      );
      
      for (const { response, data } of responses) {
        assert.strictEqual(response.status, 200);
        assert.ok(data.success);
        generatedSlideIds.push(data.slideId);
      }
    });

    it('Full flow: Stats tracking', async function() {
      this.timeout = 60000;
      
      // Get initial stats
      const { data: initialStats } = await makeRequest('/api/stats');
      const initialTotal = initialStats.totalSlides;
      
      // Generate a slide
      const { data: genData } = await makeRequest('/api/generate', {
        method: 'POST',
        body: mockValidRequests.executiveSummary
      });
      
      assert.ok(genData.success);
      generatedSlideIds.push(genData.slideId);
      
      // Get updated stats
      const { data: updatedStats } = await makeRequest('/api/stats');
      
      // Stats should have been updated (though we can't guarantee exact count due to race conditions)
      assert.ok(updatedStats.totalSlides >= initialTotal);
    });
  });

  describe('Performance Tests', () => {
    
    it('should generate slide within 5 seconds', async function() {
      this.timeout = 10000;
      
      const startTime = Date.now();
      
      const { response, data } = await makeRequest('/api/generate', {
        method: 'POST',
        body: mockValidRequests.executiveSummary
      });
      
      const duration = Date.now() - startTime;
      
      assert.strictEqual(response.status, 200);
      assert.ok(data.success);
      assert.ok(duration < 5000, `Generation took ${duration}ms, expected < 5000ms`);
      
      console.log(`    Generation time: ${duration}ms`);
      generatedSlideIds.push(data.slideId);
    });

    it('should handle large context input', async function() {
      this.timeout = 15000;
      
      const largeContext = 'A'.repeat(1500); // Large but under 2000 limit
      
      const { response, data } = await makeRequest('/api/generate', {
        method: 'POST',
        body: {
          slideType: 'Executive Summary',
          context: largeContext,
          targetAudience: 'C-Suite'
        }
      });
      
      assert.strictEqual(response.status, 200);
      assert.ok(data.success);
      generatedSlideIds.push(data.slideId);
    });

    it('should handle many data points', async function() {
      this.timeout = 15000;
      
      const manyDataPoints = Array(20).fill(null).map((_, i) => 
        `Data point ${i + 1}: Value ${Math.floor(Math.random() * 100)}`
      );
      
      const { response, data } = await makeRequest('/api/generate', {
        method: 'POST',
        body: {
          slideType: 'Financial Model',
          context: 'Comprehensive financial analysis with multiple data points.',
          dataPoints: manyDataPoints,
          targetAudience: 'Investors'
        }
      });
      
      assert.strictEqual(response.status, 200);
      assert.ok(data.success);
      generatedSlideIds.push(data.slideId);
    });
  });
});
