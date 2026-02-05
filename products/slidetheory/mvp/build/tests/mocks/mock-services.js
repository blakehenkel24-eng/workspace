/**
 * Mock Services - Mock implementations of external dependencies
 */

const { mockSlideContent, mockKimiResponses } = require('./mock-data');

/**
 * Mock OpenAI/Kimi Client
 */
class MockKimiClient {
  constructor(options = {}) {
    this.shouldFail = options.shouldFail || false;
    this.failWithTimeout = options.failWithTimeout || false;
    this.failWithRateLimit = options.failWithRateLimit || false;
    this.returnInvalidJSON = options.returnInvalidJSON || false;
    this.callCount = 0;
    this.lastCallArgs = null;
  }

  async callKimi(messages, options = {}) {
    this.callCount++;
    this.lastCallArgs = { messages, options };

    if (this.failWithTimeout) {
      const error = new Error('Request timeout - AI generation took too long');
      error.name = 'AbortError';
      throw error;
    }

    if (this.failWithRateLimit) {
      const error = new Error('Rate limit exceeded');
      error.status = 429;
      throw error;
    }

    if (this.shouldFail) {
      throw new Error('API call failed');
    }

    if (this.returnInvalidJSON) {
      return 'This is not valid JSON';
    }

    // Return appropriate mock content based on slide type
    const userMessage = messages.find(m => m.role === 'user')?.content || '';
    const slideTypeMatch = userMessage.match(/Create a ([\w\s]+) slide/);
    const slideType = slideTypeMatch ? slideTypeMatch[1] : 'Executive Summary';
    
    const typeKey = slideType.toLowerCase().replace(/\s+/g, '');
    return JSON.stringify(mockSlideContent[typeKey] || mockSlideContent.executiveSummary);
  }

  async generateSlideContent({ slideType, context, dataPoints, targetAudience, framework }) {
    if (this.shouldFail) {
      // Return fallback content on failure
      return this.generateFallbackContent(slideType, context, dataPoints, targetAudience);
    }

    const content = await this.callKimi([
      { role: 'system', content: 'Test system prompt' },
      { role: 'user', content: `Create a ${slideType} slide` }
    ]);

    try {
      return JSON.parse(content);
    } catch (e) {
      return this.generateFallbackContent(slideType, context, dataPoints, targetAudience);
    }
  }

  generateFallbackContent(slideType, context, dataPoints, targetAudience) {
    const typeKey = slideType.toLowerCase().replace(/\s+/g, '');
    return mockSlideContent[typeKey] || mockSlideContent.executiveSummary;
  }

  reset() {
    this.callCount = 0;
    this.lastCallArgs = null;
    this.shouldFail = false;
    this.failWithTimeout = false;
    this.failWithRateLimit = false;
    this.returnInvalidJSON = false;
  }
}

/**
 * Mock Slide Generator
 */
class MockSlideGenerator {
  constructor(options = {}) {
    this.shouldFail = options.shouldFail || false;
    this.useSVG = options.useSVG || false;
    this.callCount = 0;
    this.generatedSlides = [];
  }

  async renderSlideToImage({ slideType, content, outputPath }) {
    this.callCount++;
    
    if (this.shouldFail) {
      throw new Error('Slide rendering failed');
    }

    const slideInfo = {
      slideType,
      content,
      outputPath,
      timestamp: new Date().toISOString()
    };
    this.generatedSlides.push(slideInfo);

    // Return path with appropriate extension
    if (this.useSVG) {
      return outputPath.replace('.png', '.svg');
    }
    return outputPath;
  }

  buildSlideHTML(slideType, content) {
    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body>
  <div class="slide" data-type="${slideType}">
    <h1>${content.title || 'Untitled'}</h1>
  </div>
</body>
</html>`;
  }

  reset() {
    this.callCount = 0;
    this.generatedSlides = [];
    this.shouldFail = false;
  }
}

/**
 * Mock Export Generator
 */
class MockExportGenerator {
  constructor(options = {}) {
    this.shouldFail = options.shouldFail || false;
    this.pptxCallCount = 0;
    this.pdfCallCount = 0;
    this.generatedExports = [];
  }

  async generatePPTX({ slideType, content, outputPath }) {
    this.pptxCallCount++;
    
    if (this.shouldFail) {
      throw new Error('PPTX generation failed');
    }

    this.generatedExports.push({ format: 'pptx', slideType, outputPath });
    return outputPath;
  }

  async generatePDF({ slideType, content, outputPath }) {
    this.pdfCallCount++;
    
    if (this.shouldFail) {
      throw new Error('PDF generation failed');
    }

    this.generatedExports.push({ format: 'pdf', slideType, outputPath });
    return outputPath;
  }

  reset() {
    this.pptxCallCount = 0;
    this.pdfCallCount = 0;
    this.generatedExports = [];
    this.shouldFail = false;
  }
}

/**
 * Mock File System
 */
class MockFileSystem {
  constructor() {
    this.files = new Map();
    this.directories = new Set();
  }

  async mkdir(path, options = {}) {
    if (options.recursive) {
      const parts = path.split('/');
      let currentPath = '';
      for (const part of parts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        this.directories.add(currentPath);
      }
    } else {
      this.directories.add(path);
    }
  }

  async writeFile(path, data) {
    this.files.set(path, data);
  }

  async readFile(path, encoding) {
    if (!this.files.has(path)) {
      const error = new Error(`ENOENT: no such file or directory, open '${path}'`);
      error.code = 'ENOENT';
      throw error;
    }
    const data = this.files.get(path);
    return encoding === 'utf-8' ? data.toString() : data;
  }

  async access(path) {
    if (!this.files.has(path)) {
      const error = new Error(`ENOENT: no such file or directory, access '${path}'`);
      error.code = 'ENOENT';
      throw error;
    }
  }

  async unlink(path) {
    if (!this.files.has(path)) {
      const error = new Error(`ENOENT: no such file or directory, unlink '${path}'`);
      error.code = 'ENOENT';
      throw error;
    }
    this.files.delete(path);
  }

  exists(path) {
    return this.files.has(path) || this.directories.has(path);
  }

  reset() {
    this.files.clear();
    this.directories.clear();
  }
}

/**
 * Mock Analytics Store
 */
class MockAnalyticsStore {
  constructor() {
    this.data = {
      totalSlides: 0,
      byType: {},
      byDay: {},
      lastGenerated: null,
      createdAt: new Date().toISOString()
    };
  }

  async load() {
    return { ...this.data };
  }

  async save(data) {
    this.data = { ...data };
  }

  async recordSlide(slideType) {
    const today = new Date().toISOString().split('T')[0];
    
    this.data.totalSlides++;
    this.data.lastGenerated = new Date().toISOString();
    this.data.byType[slideType] = (this.data.byType[slideType] || 0) + 1;
    
    if (!this.data.byDay[today]) {
      this.data.byDay[today] = { total: 0, byType: {} };
    }
    this.data.byDay[today].total++;
    this.data.byDay[today].byType[slideType] = (this.data.byDay[today].byType[slideType] || 0) + 1;
  }

  reset() {
    this.data = {
      totalSlides: 0,
      byType: {},
      byDay: {},
      lastGenerated: null,
      createdAt: new Date().toISOString()
    };
  }
}

module.exports = {
  MockKimiClient,
  MockSlideGenerator,
  MockExportGenerator,
  MockFileSystem,
  MockAnalyticsStore
};
