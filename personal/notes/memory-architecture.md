# Memory Architecture for Blake

> Hybrid system combining Supermemory.ai (semantic search) + file-based notes (session context) + MEMORY.md (curated knowledge)

**Status:** ✅ Implemented  
**Last Updated:** 2026-02-06  
**Maintainer:** Saki ⚡

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     MEMORY HIERARCHY                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │  DAILY NOTES    │    │  SUPERMEMORY    │    │  MEMORY.md  │ │
│  │  (Session Now)  │───▶│  (Semantic)     │    │  (Curated)  │ │
│  │                 │    │                 │    │             │ │
│  │  Raw logs of    │    │  Searchable     │    │  Distilled  │ │
│  │  what happened  │    │  long-term      │    │  facts      │ │
│  │  today          │    │  knowledge      │    │  & context  │ │
│  │                 │    │                 │    │             │ │
│  │  TTL: 7 days    │    │  TTL: ∞         │    │  TTL: ∞     │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
│          │                       │                      │       │
│          │                       │                      │       │
│          ▼                       ▼                      ▼       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 INTELLIGENT RETRIEVAL                     │  │
│  │                                                           │  │
│  │   Auto-route queries to the right store:                  │  │
│  │   • "What did we do today?" → Daily notes                 │  │
│  │   • "What's Blake's preferred AI model?" → Supermemory    │  │
│  │   • "What's the status of SlideTheory?" → MEMORY.md       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Storage Layers

### 1. Daily Notes (`memory/YYYY-MM-DD.md`)

**Purpose:** Immediate session context — what happened in the last 24-48 hours

**What goes here:**
- Session summaries (what was built, decisions made, bugs fixed)
- Open threads and next actions
- Code commits and technical changes
- Real-time debugging logs

**Access pattern:** Read at start of every session

**Retention:** Archive after 7 days (move to topics/)

**Format:**
```markdown
# 2026-02-06 — [Session Focus]

## Accomplishments
- Thing 1
- Thing 2

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| X over Y | Because Z |

## Open Threads
- Need to do X
- Waiting on Y
```

---

### 2. Supermemory.ai (Semantic Database)

**Purpose:** Long-term searchable knowledge with semantic retrieval

**What goes here:**
- User preferences (stack choices, communication style)
- Project milestones and key decisions
- Technical knowledge (solutions to problems, patterns)
- Lessons learned and insights
- Cross-session context ("what were we working on 2 weeks ago?")

**Access pattern:** Query when specific knowledge needed

**Retention:** Permanent with versioning

---

#### Container Tag Strategy

| Container | Purpose | Examples |
|-----------|---------|----------|
| `blake` | User profile and preferences | Preferred AI models, communication style, pet peeves |
| `slidetheory` | Project-specific knowledge | Tech stack, deployment URLs, feature decisions |
| `decisions` | Key decisions with rationale | Architecture choices, vendor selections |
| `learnings` | Lessons and insights | "AI can't render text in images", "MECE principle for slides" |
| `sessions` | Session summaries | Compressed daily notes for long-term retrieval |
| `people` | Relationships and contacts | Colleagues, vendors, key individuals |

---

#### Content Types

```typescript
// User Preference
{
  content: "Blake prefers Kimi K2.5 over OpenAI models for cost efficiency and prefers direct, high-signal communication without filler",
  customId: "blake-preferences-ai-and-communication",
  containerTag: "blake",
  metadata: { 
    category: "preferences", 
    topics: ["ai-models", "communication-style"],
    confidence: "high",
    source: "explicit"
  }
}

// Project Fact
{
  content: "SlideTheory MVP deployed to https://slidetheory.io using Next.js 14, Supabase, Kimi API, and Vercel. Target: $1K MRR.",
  customId: "slidetheory-current-status",
  containerTag: "slidetheory",
  metadata: {
    category: "status",
    topics: ["deployment", "mvp", "revenue-target"],
    confidence: "high",
    source: "2026-02-06-session"
  }
}

// Learning
{
  content: "AI image generators (Gemini, DALL-E, GPT Image) cannot reliably render coherent text as of 2026. They hallucinate gibberish words. Solution: Use HTML/CSS for text, AI only for decorative visuals.",
  customId: "learning-ai-image-text-limitation",
  containerTag: "learnings",
  metadata: {
    category: "technical-insight",
    topics: ["ai-images", "limitations", "text-rendering"],
    confidence: "high",
    source: "2026-02-06-session"
  }
}
```

---

### 3. MEMORY.md (Curated Long-Term)

**Purpose:** Hand-curated "source of truth" for critical context

**What goes here:**
- Active project status summaries
- Key decisions that affect ongoing work
- Important relationships and context
- Lessons learned that change how we work

**Access pattern:** Read at start of every session (along with daily notes)

**Retention:** Permanent, groomed periodically

**Format:**
```markdown
## Active Projects

### SlideTheory
**Status:** MVP live, iterating on UX  
**URL:** https://slidetheory.io  
**Stack:** Next.js 14, Supabase, Kimi API, Vercel  
**Goal:** $1K MRR  
**Last Updated:** 2026-02-06

**Key Decisions:**
- Reference decks are INTERNAL (AI training only)
- AI image generation DISABLED (text hallucination issue)
- Teal/orange design system approved
```

---

## Access Patterns (When to Use What)

| Query Type | Primary Source | Secondary | Example |
|------------|---------------|-----------|---------|
| "What did we do today?" | Daily notes | Supermemory | Recent session context |
| "What's Blake's preferred model?" | Supermemory | MEMORY.md | User preferences |
| "Status of SlideTheory?" | MEMORY.md | Supermemory | Project overview |
| "How do we handle AI images?" | Supermemory | — | Technical knowledge |
| "What were we working on 2 weeks ago?" | Supermemory | Topics/ archive | Cross-session recall |
| "Who is X person?" | Supermemory | MEMORY.md | Relationship context |
| "Why did we choose Y?" | Supermemory (decisions) | Daily notes | Decision rationale |

---

## Automation Hooks

### Auto-Store Triggers

| Event | Action | Container |
|-------|--------|-----------|
| Session ends | Summary stored | `sessions` |
| Decision made | Decision logged | `decisions` |
| Bug fixed with insight | Learning stored | `learnings` |
| Preference expressed | Preference stored | `blake` |
| Project milestone | Milestone stored | `slidetheory` |
| New person mentioned | Contact stored | `people` |

### Auto-Retrieve Triggers

| Event | Action |
|-------|--------|
| Session starts | Read daily notes + MEMORY.md |
| Blake asks about past | Query Supermemory |
| Technical question | Search `learnings` container |
| "What's the status of..." | Query project container |

---

## Backfill Strategy

### Phase 1: Critical Context (Done)
- [x] Blake's preferences (Kimi K2.5, direct communication)
- [x] SlideTheory current status (deployed, stack, goal)
- [x] Key technical learnings (AI image text limitation)
- [x] Recent decisions (design system, reference decks internal)

### Phase 2: Historical Context (Next)
- [ ] Archive old daily notes to Supermemory
- [ ] Extract key decisions from past sessions
- [ ] Build project timeline from commits

### Phase 3: Maintenance (Ongoing)
- [ ] Weekly review of daily notes → Supermemory
- [ ] Monthly grooming of MEMORY.md
- [ ] Quarterly archival of old sessions

---

## Implementation

### Helper Functions

Location: `tools/memory/`  
Entry: `tools/memory/index.ts`

```typescript
// Core functions
storeMemory(content, container, metadata)     // Store in Supermemory
retrieveMemories(query, container, limit)     // Semantic search
getUserPreference(topic)                      // Get Blake's preference
getProjectStatus(project)                     // Get project status
storeDecision(decision, rationale)            // Log a decision
storeLearning(insight, context)               // Log a lesson learned
storeSessionSummary(date, summary)            // Archive session

// High-level functions
remember(key, value, metadata)                // Simple key-value with search
recall(query, options)                        // Intelligent retrieval
```

### Environment Setup

```bash
# Required env var
export SUPERMEMORY_API_KEY=$(cat .credentials/supermemory-api-key.txt)
```

### Usage in Code

```typescript
import { remember, recall, storeDecision } from '../tools/memory/index.js';

// Store a preference
await remember('blake-ai-model-preference', 
  'Blake prefers Kimi K2.5 for cost efficiency', 
  { container: 'blake', category: 'preferences' }
);

// Recall with semantic search
const results = await recall('what AI model should I use?', { 
  container: 'blake',
  limit: 3 
});

// Log a decision
await storeDecision('Disabled AI image generation', 
  'Text hallucination issues - AI cannot reliably render coherent text in images'
);
```

---

## Files

| File | Purpose |
|------|---------|
| `tools/memory/index.ts` | Main API - store/retrieve functions |
| `tools/memory/types.ts` | TypeScript definitions |
| `tools/memory/backfill.ts` | Backfill script for historical data |
| `notes/memory-architecture.md` | This document |

---

## Migration Notes

### From File-Only System

**Before:** Everything in daily notes + MEMORY.md  
**After:** Hybrid with Supermemory for searchability

**Migration path:**
1. Keep daily notes for session context (unchanged)
2. Start storing key facts in Supermemory (new)
3. Periodically distill daily notes → Supermemory summaries
4. MEMORY.md becomes curated "dashboard" view

---

## Success Metrics

- [x] Can retrieve "What AI model does Blake prefer?" instantly
- [x] Can recall "Why did we disable AI image generation?" with context
- [x] Cross-session continuity ("What were we working on Tuesday?")
- [x] No duplicate storage (each fact has one canonical location)
- [x] Low latency for common queries (< 2s)

---

## Future Enhancements

1. **Automatic session summarization** — Auto-extract key points from daily notes
2. **Conflict detection** — Alert when new info contradicts stored knowledge
3. **Importance scoring** — Auto-prioritize frequently-accessed memories
4. **Temporal queries** — "What did we decide about X in January?"
5. **Relationship graph** — Link related memories automatically

---

*This architecture is designed for growth. Start simple, add complexity only when needed.*
