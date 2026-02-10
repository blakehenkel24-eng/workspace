# Semantic Memory Configuration

## Overview
Semantic memory enables intelligent, context-aware retrieval of past conversations, decisions, and information using vector embeddings and semantic search.

## Configuration

### OpenClaw Memory Settings

Add to your OpenClaw config (or environment):

```yaml
# config.yaml or environment variables
memory:
  # Enable semantic search
  semanticSearch:
    enabled: true
    provider: "openai"  # or "local" for self-hosted
    model: "text-embedding-3-small"  # cheap, fast embeddings
    
  # Memory compaction settings
  compaction:
    enabled: true
    interval: "24h"
    maxSessionMemory: "100MB"
    archiveTo: "memory/archive/"
    
  # Cross-session memory
  persistence:
    memoryFiles: true
    sessionMemory: true
    longTermMemory: true
    
  # Search settings
  search:
    defaultResults: 5
    minScore: 0.7
    includeTranscripts: true
```

### Environment Variables

```bash
# In ~/.bashrc or ~/.zshrc
export OPENCLAW_MEMORY_SEMANTIC=true
export OPENCLAW_MEMORY_MODEL="text-embedding-3-small"
export OPENCLAW_MEMORY_COMPACTION="24h"
export OPENCLAW_MEMORY_FLUSH="06:00"
```

## File Structure

```
memory/
├── current-session.md          # Current context
├── long-term.md               # Persistent knowledge
├── semantic-index.json        # Vector embeddings index
├── archive/
│   ├── 2026-02-01.md
│   ├── 2026-02-02.md
│   └── ...
└── topics/
    ├── business-ideas.md
    ├── decisions.md
    ├── contacts.md
    └── lessons-learned.md
```

## Usage

### From Agent Side

I will now automatically:
1. **Search memory before answering** — Check past context for relevant information
2. **Store important context** — Save decisions, facts, preferences to memory
3. **Cross-reference** — Link related topics across sessions
4. **Compact intelligently** — Archive old sessions while keeping key insights

### Memory Search Syntax

```
# I can now use these patterns:
- "What did we decide about..."
- "Remember when we discussed..."
- "What's the status of..."
- "Show me previous work on..."
```

## Implementation Status

✅ **PHASE 1: Basic Setup** (Complete)
- Memory directory structure created
- Daily files enabled
- Long-term memory file (MEMORY.md)

🔄 **PHASE 2: Semantic Search** (Implementing)
- Vector embeddings for key memories
- Semantic search across sessions
- Topic-based organization

⏳ **PHASE 3: Advanced Features** (Next)
- Auto-summarization of long sessions
- Knowledge graph of relationships
- Predictive memory (suggest relevant past context)

## Benefits You'll See

1. **Better Continuity** — I remember context from days/weeks ago
2. **Smarter Answers** — Reference past decisions and work
3. **No Repetition** — Don't need to remind me of things
4. **Pattern Recognition** — Connect ideas across sessions
5. **Knowledge Building** — Accumulate wisdom over time

## Commands You Can Use

```
"Search memory for our pricing discussion"
"What did we decide about the logo?"
"Show me all our business ideas"
"Summarize what we worked on last week"
"Remember that I prefer [X] over [Y]"
```

## Active Now

Semantic memory is being activated. You'll notice:
- I search MEMORY.md and daily files before responding
- I proactively reference past context
- I store key information for future retrieval
- I maintain continuity across sessions

Test it: Ask me about something we discussed earlier today.
