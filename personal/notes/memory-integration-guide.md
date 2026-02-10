# Memory System Integration Guide

> How to use the hybrid memory system in daily work

**Status:** ✅ Active  
**Location:** `tools/memory/`  
**API:** `tools/memory/index.ts`

---

## Quick Start

### 1. Set Environment Variable

```bash
# Add to ~/.bashrc or ~/.zshrc
export SUPERMEMORY_API_KEY=$(cat ~/.openclaw/workspace/.credentials/supermemory-api-key.txt)
```

### 2. Import the Memory API

```typescript
import {
  remember,
  recall,
  storePreference,
  getPreference,
  storeDecision,
  storeLearning,
  smartRecall,
} from './tools/memory/index.js';
```

### 3. Store and Retrieve

```typescript
// Store a fact
await remember('key-name', 'The value to remember', {
  container: 'slidetheory',
  category: 'preferences',
});

// Retrieve it
const results = await recall('what was the key name');
console.log(results[0]?.content);
```

---

## Common Patterns

### Store User Preference

```typescript
await storePreference('AI model', 'Kimi K2.5', {
  confidence: 'certain',
  source: 'explicitly stated',
});
```

### Store Project Status

```typescript
await storeProjectStatus('SlideTheory', {
  status: 'live',
  url: 'https://slidetheory.io',
  stack: ['Next.js', 'Supabase', 'Kimi API'],
  goals: ['$1K MRR'],
});
```

### Store a Decision

```typescript
await storeDecision(
  'Disabled AI image generation',
  'AI cannot reliably render coherent text - hallucinates gibberish',
  {
    alternatives: ['Try different models', 'Accept text errors'],
    reversible: true,
  }
);
```

### Store a Learning

```typescript
await storeLearning(
  'AI image generators cannot render text reliably',
  'Tested Gemini, DALL-E, GPT Image 1.5. All produce gibberish text shapes.',
  {
    category: 'ai-limitations',
    impact: 'critical',
  }
);
```

### Smart Recall (Auto-Routing)

```typescript
// Automatically routes to best container based on query
const { results, source, intent } = await smartRecall(
  'what AI model does Blake prefer'
);
// source = 'supermemory:blake'
// intent = 'user_preference'
```

---

## Container Reference

| Container | Use For | Example |
|-----------|---------|---------|
| `blake` | User preferences, profile | AI model preference, communication style |
| `slidetheory` | Project facts and status | Deployment URL, stack, milestones |
| `decisions` | Key decisions with rationale | Why we disabled AI images |
| `learnings` | Insights and lessons | AI text limitation discovery |
| `sessions` | Session summaries | What we built each day |
| `people` | Contact and relationship info | Vendor contacts, collaborators |

---

## When to Use What

### Daily Notes (`memory/YYYY-MM-DD.md`)

**Use for:**
- Raw session logs
- Today's accomplishments
- Open threads for tomorrow
- Debugging notes
- Temporary context

**Write it when:**
- Session ends (summary)
- Bug is fixed (with context)
- Decision is made (temporary log)

### Supermemory (Semantic Search)

**Use for:**
- Facts that need to be searchable
- User preferences
- Project milestones
- Technical solutions
- Decision rationale

**Store it when:**
- Blake states a preference
- We discover something important
- We make a key decision
- We solve a tricky problem

### MEMORY.md

**Use for:**
- Curated project dashboard
- Active project summaries
- Key relationships
- Long-term lessons

**Update it when:**
- Project status changes significantly
- New long-term context emerges
- Weekly review

---

## Session Start Checklist

At the start of each session, read:

1. **Daily notes** — `memory/2026-02-06.md` (today)
2. **Yesterday's notes** — `memory/2026-02-05.md` (context)
3. **MEMORY.md** — Curated long-term state

```typescript
// Optional: Check for any urgent context in Supermemory
const recent = await recall('urgent blockers OR critical issues', {
  limit: 3,
});
```

---

## Automation Hooks

### Auto-Store Triggers (Add to agent workflow)

```typescript
// At end of session
await storeSessionSummary(date, {
  focus: sessionFocus,
  accomplishments: accomplishments,
  decisions: decisionsMade,
  learnings: insightsGained,
  openThreads: openItems,
});

// When preference detected
if (message.includes('I prefer')) {
  await storePreference(extractTopic(message), extractValue(message));
}

// When decision made
if (message.includes('we decided') || message.includes('let\'s go with')) {
  await storeDecision(extractDecision(message), extractRationale(message));
}
```

---

## Testing

### Test the System

```bash
cd tools/memory
npm install
npm run backfill  # Seed with critical context
```

### Verify Backfill

```typescript
// Test retrieval
const result = await recall('what AI model does Blake prefer');
console.assert(result[0]?.content.includes('Kimi'));

const status = await recall('SlideTheory status');
console.assert(status[0]?.content.includes('slidetheory.io'));
```

---

## Troubleshooting

### "SUPERMEMORY_API_KEY not set"

```bash
export SUPERMEMORY_API_KEY=$(cat .credentials/supermemory-api-key.txt)
```

### No results returned

- Check container tag matches
- Try broader search terms
- Use `smartRecall()` for auto-routing

### Duplicate memories

Use `preventDuplicates` option (coming soon) or check with `recall()` before storing.

---

## API Reference

### Core Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `remember(key, value, opts)` | Simple store | `{ success, id }` |
| `recall(query, opts)` | Semantic search | `MemoryResult[]` |
| `smartRecall(query)` | Auto-routed search | `{ results, source, intent }` |

### Specialized Functions

| Function | Purpose |
|----------|---------|
| `storePreference(topic, value)` | User preferences |
| `getPreference(topic)` | Get specific preference |
| `storeProjectStatus(name, status)` | Project state |
| `getProjectStatus(name)` | Get project state |
| `storeDecision(decision, rationale)` | Decision record |
| `storeLearning(insight, context)` | Lesson learned |
| `storeSessionSummary(date, summary)` | Archive session |

### Types

See `tools/memory/types.ts` for full TypeScript definitions.

---

## Maintenance

### Weekly
- Review daily notes → extract key facts to Supermemory
- Update MEMORY.md with current project status

### Monthly
- Archive old daily notes to `memory/topics/`
- Groom Supermemory (remove outdated info)

### Quarterly
- Full review of MEMORY.md
- Update architecture if needed

---

*Questions? Check `notes/memory-architecture.md` for full design.*
