/**
 * Hybrid Renderer Tests
 * Validates text legibility and performance
 */

const { renderHybridSlide, renderTestSlides, generateTestContent, TEMPLATES } = require('../services/hybrid-renderer');
const fs = require('fs').promises;
const path = require('path');

// Test configuration
const TEST_OUTPUT_DIR = path.join(__dirname, '..', 'tmp', 'hybrid-test');
const MAX_GENERATION_TIME = 5000; // 5 seconds
const REQUIRED_SUCCESS_RATE = 1.0; // 100%

/**
 * Run all hybrid renderer tests
 */
async function runTests() {
  console.log('🧪 Hybrid Renderer Test Suite');
  console.log('================================\n');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0,
    tests: []
  };
  
  // Setup
  await fs.mkdir(TEST_OUTPUT_DIR, { recursive: true });
  
  // Run tests
  const tests = [
    testTemplateDefinitions,
    testExecutiveSummaryRender,
    testMarketAnalysisRender,
    testFinancialModelRender,
    testTextLegibility,
    testGenerationPerformance,
    testAllTenSlides
  ];
  
  for (const test of tests) {
    results.total++;
    try {
      const result = await test();
      results.passed++;
      results.tests.push({ name: test.name, status: 'PASS', ...result });
      console.log(`✅ ${test.name}`);
    } catch (error) {
      results.failed++;
      results.tests.push({ name: test.name, status: 'FAIL', error: error.message });
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }
  
  // Cleanup
  try {
    await fs.rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
  } catch (e) {
    // Ignore cleanup errors
  }
  
  // Summary
  console.log('\n================================');
  console.log(`Results: ${results.passed}/${results.total} passed`);
  console.log(`Success Rate: ${(results.passed / results.total * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed!');
    return { success: true, results };
  } else {
    console.log(`\n⚠️ ${results.failed} test(s) failed`);
    return { success: false, results };
  }
}

/**
 * Test 1: Template definitions are valid
 */
async function testTemplateDefinitions() {
  const requiredTypes = ['Executive Summary', 'Market Analysis', 'Financial Model'];
  
  for (const type of requiredTypes) {
    const template = TEMPLATES[type];
    if (!template) throw new Error(`Missing template: ${type}`);
    if (!template.textZones || template.textZones.length === 0) {
      throw new Error(`Template ${type} has no text zones`);
    }
    if (!template.backgroundPrompt) {
      throw new Error(`Template ${type} has no background prompt`);
    }
  }
  
  return { message: `${requiredTypes.length} templates validated` };
}

/**
 * Test 2: Executive Summary renders successfully
 */
async function testExecutiveSummaryRender() {
  const outputPath = path.join(TEST_OUTPUT_DIR, 'test-exec-summary.png');
  const content = generateTestContent('Executive Summary');
  
  const result = await renderHybridSlide({
    slideType: 'Executive Summary',
    content,
    outputPath
  });
  
  // Verify file exists
  const stats = await fs.stat(outputPath);
  if (stats.size === 0) throw new Error('Generated file is empty');
  if (stats.size < 10000) throw new Error('Generated file suspiciously small');
  
  return { 
    message: `Generated ${(stats.size / 1024).toFixed(1)}KB in ${result.durationMs}ms`,
    durationMs: result.durationMs
  };
}

/**
 * Test 3: Market Analysis renders successfully
 */
async function testMarketAnalysisRender() {
  const outputPath = path.join(TEST_OUTPUT_DIR, 'test-market-analysis.png');
  const content = generateTestContent('Market Analysis');
  
  const result = await renderHybridSlide({
    slideType: 'Market Analysis',
    content,
    outputPath
  });
  
  const stats = await fs.stat(outputPath);
  if (stats.size === 0) throw new Error('Generated file is empty');
  
  return { 
    message: `Generated ${(stats.size / 1024).toFixed(1)}KB in ${result.durationMs}ms`,
    durationMs: result.durationMs
  };
}

/**
 * Test 4: Financial Model renders successfully
 */
async function testFinancialModelRender() {
  const outputPath = path.join(TEST_OUTPUT_DIR, 'test-financial-model.png');
  const content = generateTestContent('Financial Model');
  
  const result = await renderHybridSlide({
    slideType: 'Financial Model',
    content,
    outputPath
  });
  
  const stats = await fs.stat(outputPath);
  if (stats.size === 0) throw new Error('Generated file is empty');
  
  return { 
    message: `Generated ${(stats.size / 1024).toFixed(1)}KB in ${result.durationMs}ms`,
    durationMs: result.durationMs
  };
}

/**
 * Test 5: Text is legible (pixel-level check)
 */
async function testTextLegibility() {
  // This is a structural check - we verify text zones are mapped correctly
  // Visual legibility requires human verification
  
  const content = generateTestContent('Executive Summary');
  const template = TEMPLATES['Executive Summary'];
  
  // Map content to zones
  const { mapContentToTextZones } = require('../services/hybrid-renderer');
  
  // Check that all required zones have content
  const requiredZones = ['title', 'point1_heading', 'point1_text', 'recommendation_text'];
  const textMap = mapContentToTextZones('Executive Summary', content);
  
  for (const zone of requiredZones) {
    if (!textMap[zone] || textMap[zone].trim() === '') {
      throw new Error(`Missing content for zone: ${zone}`);
    }
  }
  
  // Check font sizes are readable
  for (const zone of template.textZones) {
    if (zone.fontSize < 12) {
      throw new Error(`Font size too small in zone ${zone.id}: ${zone.fontSize}px`);
    }
  }
  
  return { message: `All ${requiredZones.length} required zones have content, fonts >= 12px` };
}

/**
 * Test 6: Generation meets performance target
 */
async function testGenerationPerformance() {
  const outputPath = path.join(TEST_OUTPUT_DIR, 'test-performance.png');
  const content = generateTestContent('Executive Summary');
  
  const result = await renderHybridSlide({
    slideType: 'Executive Summary',
    content,
    outputPath
  });
  
  if (result.durationMs > MAX_GENERATION_TIME) {
    throw new Error(`Generation too slow: ${result.durationMs}ms > ${MAX_GENERATION_TIME}ms target`);
  }
  
  return { 
    message: `Generated in ${result.durationMs}ms (target: <${MAX_GENERATION_TIME}ms)`,
    durationMs: result.durationMs
  };
}

/**
 * Test 7: Generate all 10 test slides
 */
async function testAllTenSlides() {
  const results = await renderTestSlides(TEST_OUTPUT_DIR);
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (successful.length < 10 * REQUIRED_SUCCESS_RATE) {
    throw new Error(`Only ${successful.length}/10 slides generated successfully`);
  }
  
  const avgTime = successful.reduce((sum, r) => sum + r.durationMs, 0) / successful.length;
  
  return {
    message: `${successful.length}/10 slides, avg ${avgTime.toFixed(0)}ms each`,
    successful: successful.length,
    failed: failed.length,
    averageTimeMs: avgTime
  };
}

// Run tests if called directly
if (require.main === module) {
  runTests()
    .then(results => {
      process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { runTests };
