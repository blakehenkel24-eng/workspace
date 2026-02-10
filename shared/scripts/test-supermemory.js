const Supermemory = require('supermemory').default;
const fs = require('fs');

const API_KEY = fs.readFileSync('/home/node/.openclaw/workspace/.credentials/supermemory-api-key.txt', 'utf8').trim();

const client = new Supermemory({ apiKey: API_KEY });

async function testConnection() {
  try {
    // Test: Store a memory
    const result = await client.add({
      content: "Blake Henkel is building SlideTheory - an AI-powered slide generation tool for strategy consultants. Target: $1,000 MRR.",
      customId: "blake-slidetheory-overview",
      containerTag: "blake",
      metadata: { category: "project", priority: "high" }
    });
    console.log("✅ Store memory success:", result.id);

    // Test: Search memories
    const search = await client.search.memories({
      q: "What is Blake building",
      containerTag: "blake",
      limit: 3
    });
    console.log("✅ Search success:", search.results.length, "results");
    console.log("Top result:", search.results[0]?.memory || search.results[0]?.chunk);

  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

testConnection();
