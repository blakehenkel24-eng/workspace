const Supermemory = require('supermemory').default;
const fs = require('fs');

const API_KEY = fs.readFileSync('/home/node/.openclaw/workspace/.credentials/supermemory-api-key.txt', 'utf8').trim();
const client = new Supermemory({ apiKey: API_KEY });

async function storeCriticalLearning() {
  // Store as a lesson with high confidence
  await client.add({
    content: "CRITICAL WORK PREFERENCE: When Blake asks to create/build something, he expects 100% fully functional implementation, not a shell or prototype. Always: 1) Implement all features completely, 2) Connect to real data/services, 3) Test thoroughly, 4) Confirm functionality works. Never deliver partial implementations or placeholders.",
    customId: "blake-full-build-requirement",
    containerTag: "blake",
    metadata: { 
      category: "work_preferences", 
      priority: "critical",
      topic: "implementation_standards",
      date: "2026-02-07"
    }
  });

  // Store as a decision
  await client.add({
    content: "DECISION: All future build requests from Blake require complete functional implementation with real data integration and testing. Shell/prototype-only delivery is unacceptable.",
    customId: "decision-full-implementation",
    containerTag: "decisions", 
    metadata: {
      category: "work_standards",
      confidence: 100,
      date: "2026-02-07"
    }
  });

  console.log("✅ Critical learning stored in Supermemory");
}

storeCriticalLearning().catch(console.error);
