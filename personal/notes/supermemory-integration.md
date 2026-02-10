# Supermemory.ai Integration

> Long-term semantic memory for conversations, context, and knowledge.

## API Key Location
`~/.openclaw/workspace/.credentials/supermemory-api-key.txt`

## Setup
```bash
npm install supermemory
```

## Usage

### Store Memory
```typescript
import Supermemory from 'supermemory';
const client = new Supermemory({ apiKey: process.env.SUPERMEMORY_API_KEY });

await client.add({
  content: "Blake prefers Kimi K2.5 over OpenAI models for cost reasons",
  customId: "blake-model-preference",
  containerTag: "blake",
  metadata: { category: "preferences", topic: "ai-models" }
});
```

### Search Memories
```typescript
const results = await client.search.memories({
  q: "what AI model does Blake prefer",
  containerTag: "blake",
  searchMode: "hybrid",
  limit: 5
});
```

## Integration Points

1. **Session Summaries** - Store key decisions at end of each session
2. **User Preferences** - Remember Blake's preferences (stack, style, etc.)
3. **Project Context** - Store SlideTheory progress, decisions, open items
4. **Cross-session Recall** - Retrieve relevant past context for current work

## Container Tag Strategy
- `blake` - User profile and preferences
- `slidetheory` - Project-specific knowledge
- `session-{date}` - Individual session summaries
- `decisions` - Key decisions made
- `learnings` - Lessons and insights

## Environment Variable
```bash
export SUPERMEMORY_API_KEY=$(cat ~/.openclaw/workspace/.credentials/supermemory-api-key.txt)
```
