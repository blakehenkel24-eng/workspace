/**
 * Test Setup - Test Environment Configuration
 * Run with: npm test
 */

const { before, beforeEach, afterEach, after } = require('node:test');

// Test configuration
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.KIMI_API_KEY = 'test-api-key';
process.env.KIMI_MODEL = 'kimi-coding/k2p5';

// Track test metrics
global.testMetrics = {
  startTime: null,
  passed: 0,
  failed: 0,
  skipped: 0
};

// Setup before all tests
before(() => {
  global.testMetrics.startTime = Date.now();
  console.log('\n🧪 Starting Test Suite...\n');
});

// Setup before each test
beforeEach((t) => {
  console.log(`  ▶ ${t.name}`);
});

// Teardown after each test
afterEach((t) => {
  if (t.error) {
    global.testMetrics.failed++;
    console.log(`    ❌ FAILED: ${t.error.message}`);
  } else {
    global.testMetrics.passed++;
    console.log(`    ✅ PASSED`);
  }
});

// Teardown after all tests
after(() => {
  const duration = Date.now() - global.testMetrics.startTime;
  const total = global.testMetrics.passed + global.testMetrics.failed;
  
  console.log('\n📊 Test Results:');
  console.log(`  ✅ Passed: ${global.testMetrics.passed}`);
  console.log(`  ❌ Failed: ${global.testMetrics.failed}`);
  console.log(`  ⏱️  Duration: ${duration}ms`);
  console.log(`  📈 Success Rate: ${Math.round((global.testMetrics.passed / total) * 100)}%\n`);
});

// Helper functions for tests
global.testHelpers = {
  /**
   * Create a mock request object
   */
  createMockRequest(overrides = {}) {
    return {
      id: 'test-req-123',
      body: {},
      params: {},
      query: {},
      headers: {},
      ...overrides
    };
  },

  /**
   * Create a mock response object
   */
  createMockResponse() {
    const res = {
      statusCode: 200,
      jsonData: null,
      sentData: null,
      headers: {},
      
      status(code) {
        this.statusCode = code;
        return this;
      },
      
      json(data) {
        this.jsonData = data;
        return this;
      },
      
      send(data) {
        this.sentData = data;
        return this;
      },
      
      sendFile(path) {
        this.sentFile = path;
        return this;
      },
      
      setHeader(key, value) {
        this.headers[key] = value;
        return this;
      }
    };
    return res;
  },

  /**
   * Assert that a promise rejects with specific error
   */
  async assertRejects(promise, expectedMessage) {
    try {
      await promise;
      throw new Error(`Expected rejection with "${expectedMessage}" but promise resolved`);
    } catch (error) {
      if (!error.message.includes(expectedMessage)) {
        throw new Error(`Expected error containing "${expectedMessage}" but got "${error.message}"`);
      }
    }
  },

  /**
   * Wait for specified milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Generate a random string
   */
  randomString(length = 10) {
    return Math.random().toString(36).substring(2, 2 + length);
  }
};

module.exports = { testHelpers: global.testHelpers };
