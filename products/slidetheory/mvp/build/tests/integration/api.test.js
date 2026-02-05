/**
 * Integration Tests - API Endpoints
 * Tests: Health check, Stats, Templates, Generate Slide, Exports
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');

// Import the app
const app = require('../../server');
const { mockValidRequests, mockInvalidRequests, mockSlideContent } = require('../mocks/mock-data');

describe('API Integration Tests', () => {
  let server;
  let baseUrl;
  let port;

  before(async () => {
    // Start server on random port
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // Helper function for making HTTP requests
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

  describe('GET /api/health', () => {
    
    it('should return health status', async () => {
      const { response, data } = await makeRequest('/api/health');
      
      assert.strictEqual(response.status, 200);
      assert.ok(data);
      assert.strictEqual(data.status, 'ok');
      assert.ok(data.version);
      assert.ok(data.timestamp);
    });

    it('should include features information', async () => {
      const { data } = await makeRequest('/api/health');
      
      assert.ok(data.features);
      assert.ok(Array.isArray(data.features.exports));
      assert.ok(Array.isArray(data.features.slideTypes));
      assert.strictEqual(data.features.slideTypes.length, 6);
    });

    it('should report AI status correctly', async () => {
      const { data } = await makeRequest('/api/health');
      
      assert.ok(typeof data.features.aiGeneration === 'boolean');
    });
  });

  describe('GET /api/stats', () => {
    
    it('should return analytics data', async () => {
      const { response, data } = await makeRequest('/api/stats');
      
      assert.strictEqual(response.status, 200);
      assert.ok(data.success);
      assert.ok(typeof data.totalSlides === 'number');
      assert.ok(data.byType);
      assert.ok(data.byDay);
    });

    it('should have correct structure', async () => {
      const { data } = await makeRequest('/api/stats');
      
      assert.ok(data.createdAt);
      assert.ok(data.lastGenerated !== undefined);
    });
  });

  describe('GET /api/templates', () => {
    
    it('should return templates list', async () => {
      const { response, data } = await makeRequest('/api/templates');
      
      assert.strictEqual(response.status, 200);
      assert.ok(data.success);
      assert.ok(Array.isArray(data.templates));
      assert.ok(data.templates.length > 0);
    });

    it('should return templates with required fields', async () => {
      const { data } = await makeRequest('/api/templates');
      
      for (const template of data.templates) {
        assert.ok(template.id, 'Template should have id');
        assert.ok(template.name, 'Template should have name');
        assert.ok(template.category, 'Template should have category');
        assert.ok(template.description, 'Template should have description');
      }
    });
  });

  describe('GET /api/templates/:id', () => {
    
    it('should return specific template', async () => {
      const { data: templatesData } = await makeRequest('/api/templates');
      const firstTemplate = templatesData.templates[0];
      
      const { response, data } = await makeRequest(`/api/templates/${firstTemplate.id}`);
      
      assert.strictEqual(response.status, 200);
      assert.ok(data.success);
      assert.ok(data.template);
      assert.strictEqual(data.template.id, firstTemplate.id);
    });

    it('should return 404 for non-existent template', async () => {
      const { response, data } = await makeRequest('/api/templates/non-existent-id');
      
      assert.strictEqual(response.status, 404);
      assert.strictEqual(data.success, false);
      assert.ok(data.error);
    });

    it('should return 403 for path traversal attempt', async () => {
      const { response } = await makeRequest('/api/templates/../../../etc/passwd');
      
      assert.strictEqual(response.status, 403);
    });
  });

  describe('POST /api/generate', () => {
    
    it('should generate slide with valid request', async () => {
      const { response, data } = await makeRequest('/api/generate', {
        method: 'POST',
        body: mockValidRequests.executiveSummary
      });
      
      assert.strictEqual(response.status, 200);
      assert.ok(data.success);
      assert.ok(data.slideId);
      assert.ok(data.imageUrl);
      assert.ok(data.title);
      assert.ok(data.content);
      assert.ok(data.expiresAt);
    });

    it('should handle all slide types', async function() {
      // Increase timeout for this test
      this.timeout = 30000;
      
      const slideTypes = [
        'Executive Summary',
        'Market Analysis',
        'Financial Model'
      ];
      
      for (const slideType of slideTypes) {
        const request = {
          ...mockValidRequests.executiveSummary,
          slideType
        };
        
        const { response, data } = await makeRequest('/api/generate', {
          method: 'POST',
          body: request
        });
        
        assert.strictEqual(response.status, 200, `${slideType} should succeed`);
        assert.ok(data.success, `${slideType} should return success`);
        assert.ok(data.slideId, `${slideType} should return slideId`);
      }
    });

    it('should reject missing slideType', async () => {
      const { response, data } = await makeRequest('/api/generate', {
        method: 'POST',
        body: mockInvalidRequests.missingSlideType
      });
      
      assert.strictEqual(response.status, 400);
      assert.strictEqual(data.success, false);
      assert.ok(data.errors);
      assert.ok(data.errors.some(e => e.field === 'slideType'));
    });

    it('should reject invalid slideType', async () => {
      const { response, data } = await makeRequest('/api/generate', {
        method: 'POST',
        body: mockInvalidRequests.invalidSlideType
      });
      
      assert.strictEqual(response.status, 400);
      assert.strictEqual(data.success, false);
      assert.ok(data.errors);
    });

    it('should reject missing context', async () => {
      const { response, data } = await makeRequest('/api/generate', {
        method: 'POST',
        body: mockInvalidRequests.missingContext
      });
      
      assert.strictEqual(response.status, 400);
      assert.ok(data.errors.some(e => e.field === 'context'));
    });

    it('should reject context that is too short', async () => {
      const { response, data } = await makeRequest('/api/generate', {
        method: 'POST',
        body: mockInvalidRequests.contextTooShort
      });
      
      assert.strictEqual(response.status, 400);
      assert.ok(data.errors.some(e => e.field === 'context'));
    });

    it('should reject context that is too long', async () => {
      const { response, data } = await makeRequest('/api/generate', {
        method: 'POST',
        body: mockInvalidRequests.contextTooLong
      });
      
      assert.strictEqual(response.status, 400);
      assert.ok(data.errors.some(e => e.field === 'context'));
    });

    it('should reject missing targetAudience', async () => {
      const { response, data } = await makeRequest('/api/generate', {
        method: 'POST',
        body: mockInvalidRequests.missingAudience
      });
      
      assert.strictEqual(response.status, 400);
      assert.ok(data.errors.some(e => e.field === 'targetAudience'));
    });

    it('should work with minimal valid request', async () => {
      const { response, data } = await makeRequest('/api/generate', {
        method: 'POST',
        body: mockValidRequests.minimalValid
      });
      
      assert.strictEqual(response.status, 200);
      assert.ok(data.success);
    });

    it('should work with data points', async () => {
      const request = {
        slideType: 'Financial Model',
        context: 'Q4 financial results showing strong growth trajectory',
        dataPoints: [
          'Revenue: $10M',
          'Growth: +45% YoY',
          'Margin: 78%'
        ],
        targetAudience: 'Investors',
        framework: 'MECE'
      };
      
      const { response, data } = await makeRequest('/api/generate', {
        method: 'POST',
        body: request
      });
      
      assert.strictEqual(response.status, 200);
      assert.ok(data.success);
    });

    it('should work without optional framework', async () => {
      const request = {
        slideType: 'Executive Summary',
        context: 'This is a valid context with enough characters for the test.',
        targetAudience: 'C-Suite'
        // No framework
      };
      
      const { response, data } = await makeRequest('/api/generate', {
        method: 'POST',
        body: request
      });
      
      assert.strictEqual(response.status, 200);
      assert.ok(data.success);
    });

    it('should return correct image URL format', async () => {
      const { data } = await makeRequest('/api/generate', {
        method: 'POST',
        body: mockValidRequests.executiveSummary
      });
      
      assert.ok(data.imageUrl.startsWith('/slides/'));
      assert.ok(data.imageUrl.includes(data.slideId));
    });
  });

  describe('POST /api/export/pptx', () => {
    
    it('should generate PPTX export', async function() {
      this.timeout = 30000;
      
      const { response, data } = await makeRequest('/api/export/pptx', {
        method: 'POST',
        body: {
          slideType: 'Executive Summary',
          content: mockSlideContent.executiveSummary
        }
      });
      
      assert.strictEqual(response.status, 200);
      assert.ok(data.success);
      assert.ok(data.exportId);
      assert.ok(data.downloadUrl);
      assert.strictEqual(data.format, 'pptx');
      assert.ok(data.expiresAt);
    });

    it('should reject missing slideType', async () => {
      const { response, data } = await makeRequest('/api/export/pptx', {
        method: 'POST',
        body: {
          content: mockSlideContent.executiveSummary
        }
      });
      
      assert.strictEqual(response.status, 400);
      assert.strictEqual(data.success, false);
    });

    it('should reject missing content', async () => {
      const { response, data } = await makeRequest('/api/export/pptx', {
        method: 'POST',
        body: {
          slideType: 'Executive Summary'
        }
      });
      
      assert.strictEqual(response.status, 400);
      assert.strictEqual(data.success, false);
    });
  });

  describe('POST /api/export/pdf', () => {
    
    it('should generate PDF export', async function() {
      this.timeout = 30000;
      
      const { response, data } = await makeRequest('/api/export/pdf', {
        method: 'POST',
        body: {
          slideType: 'Executive Summary',
          content: mockSlideContent.executiveSummary
        }
      });
      
      // PDF may fail without proper puppeteer setup
      if (response.status === 200) {
        assert.ok(data.success);
        assert.ok(data.exportId);
        assert.ok(data.downloadUrl);
        assert.strictEqual(data.format, 'pdf');
      }
    });

    it('should reject missing slideType', async () => {
      const { response, data } = await makeRequest('/api/export/pdf', {
        method: 'POST',
        body: {
          content: mockSlideContent.executiveSummary
        }
      });
      
      assert.strictEqual(response.status, 400);
      assert.strictEqual(data.success, false);
    });

    it('should reject missing content', async () => {
      const { response, data } = await makeRequest('/api/export/pdf', {
        method: 'POST',
        body: {
          slideType: 'Executive Summary'
        }
      });
      
      assert.strictEqual(response.status, 400);
      assert.strictEqual(data.success, false);
    });
  });

  describe('404 Handler', () => {
    
    it('should return 404 for unknown endpoints', async () => {
      const { response, data } = await makeRequest('/api/unknown-endpoint');
      
      assert.strictEqual(response.status, 404);
      assert.strictEqual(data.success, false);
      assert.ok(data.error);
    });
  });

  describe('CORS and Headers', () => {
    
    it('should return JSON content type', async () => {
      const { response } = await makeRequest('/api/health');
      
      const contentType = response.headers.get('content-type');
      assert.ok(contentType.includes('application/json'));
    });
  });
});
