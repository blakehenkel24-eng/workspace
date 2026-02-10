/**
 * Memory System Test
 * 
 * Test script to verify memory system functionality
 */

import {
  recall,
  smartRecall,
  getPreference,
  getProjectStatus,
  getMemoryStats,
  initMemory,
} from './index.js';

async function runTests(): Promise<void> {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Memory System Tests');
  console.log('═══════════════════════════════════════════════════\n');

  // Initialize
  const init = await initMemory();
  console.log(`Status: ${init.message}\n`);

  // Test 1: Retrieve user preference
  console.log('Test 1: User Preference Retrieval');
  console.log('-----------------------------------');
  const prefResults = await recall('what AI model does Blake prefer', { container: 'blake' });
  console.log(`Query: "what AI model does Blake prefer"`);
  console.log(`Results: ${prefResults.length}`);
  if (prefResults.length > 0) {
    console.log(`Top result: ${prefResults[0].content.slice(0, 100)}...\n`);
  }

  // Test 2: Smart recall with routing
  console.log('Test 2: Smart Recall (Auto-Routing)');
  console.log('-------------------------------------');
  const smart = await smartRecall('what is SlideTheory status');
  console.log(`Query: "what is SlideTheory status"`);
  console.log(`Intent: ${smart.intent}`);
  console.log(`Source: ${smart.source}`);
  console.log(`Results: ${smart.results.length}\n`);

  // Test 3: Project status
  console.log('Test 3: Project Status');
  console.log('------------------------');
  const statusResults = await recall('SlideTheory deployment URL', { container: 'slidetheory' });
  console.log(`Query: "SlideTheory deployment URL"`);
  console.log(`Results: ${statusResults.length}`);
  if (statusResults.length > 0) {
    console.log(`Top result: ${statusResults[0].content.slice(0, 150)}...\n`);
  }

  // Test 4: Decisions
  console.log('Test 4: Decision Retrieval');
  console.log('----------------------------');
  const decisionResults = await recall('why did we disable AI images', { container: 'decisions' });
  console.log(`Query: "why did we disable AI images"`);
  console.log(`Results: ${decisionResults.length}`);
  if (decisionResults.length > 0) {
    console.log(`Top result: ${decisionResults[0].content.slice(0, 150)}...\n`);
  }

  // Test 5: Learnings
  console.log('Test 5: Learning/Insight Retrieval');
  console.log('------------------------------------');
  const learningResults = await recall('AI image text hallucination', { container: 'learnings' });
  console.log(`Query: "AI image text hallucination"`);
  console.log(`Results: ${learningResults.length}`);
  if (learningResults.length > 0) {
    console.log(`Top result: ${learningResults[0].content.slice(0, 150)}...\n`);
  }

  // Test 6: Statistics
  console.log('Test 6: Memory Statistics');
  console.log('---------------------------');
  const stats = getMemoryStats();
  console.log(`Total memories: ${stats.total}`);
  console.log('By container:');
  for (const [container, count] of Object.entries(stats.byContainer)) {
    console.log(`  ${container}: ${count}`);
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  All Tests Complete!');
  console.log('═══════════════════════════════════════════════════');
}

runTests().catch(console.error);
