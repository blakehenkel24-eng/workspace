# TOOLS.md - Tool Configuration & Notes

> Document tool-specific configurations, gotchas, and credentials here.

Last Updated: 2026-02-10 (Perplexity models added)

---

## Credentials Location

All API keys stored in `/home/node/.openclaw/openclaw.json` (env section):
- `KIMI_API_KEY` — Primary LLM API
- `OPENAI_API_KEY` — Fallback models + image generation
- `OPENROUTER_API_KEY` — Perplexity models (web search + deep research)
- `BRAVE_API_KEY` — Backup web search (deprecated, use Perplexity)

**Backup location:** `.credentials/` directory (gitignored)

---

## Model APIs

### Kimi API (Primary)
**Status:** ✅ Working

**Configuration:**
```json
{
  "primary": "kimi-coding/k2p5",
  "alias": "Kimi K2.5"
}
```

**Environment:**
- Key: `KIMI_API_KEY`
- Endpoint: Moonshot API

**Gotchas:**
- Kimi K2.5 is Blake's preferred default — **never switch without explicit permission**
- High context window (128k tokens)
- Good for coding tasks

**Common Operations:**
```bash
# Check current model
gateway config.get | grep primary

# No direct CLI for Kimi — used via OpenClaw agent system
```

---

### OpenAI API (Fallbacks)
**Status:** ✅ Working

**Configuration:**
Fallback chain: `gpt-5.1` → `gpt-5.2` → `gpt-5-mini`

**Available Models:**
| Model | Alias | Use Case |
|-------|-------|----------|
| `kimi-coding/k2p5` | Kimi K2.5 | **Primary default** — never change without permission |
| `openai/gpt-5.1` | GPT-5.1 | Primary fallback |
| `openai/gpt-5.2` | GPT-5.2 | Secondary fallback |
| `openai/gpt-5-mini` | GPT-5 Mini | Fast/cheap fallback |
| `openai/gpt-4o` | GPT-4o | Image generation |
| `openai/gpt-4o-mini` | GPT-4o Mini | Lightweight tasks |
| `openai/gpt-5-nano` | GPT-5 Nano | Minimal tasks |
| `perplexity/sonar-pro-search` | Perplexity Sonar Pro | Web search (default) |
| `perplexity/sonar-deep-research` | Perplexity Deep Research | Intensive research only |

### Perplexity Models (via OpenRouter)
**Status:** ✅ Working

**Models:**
- `perplexity/sonar-pro-search` — Default web search model
- `perplexity/sonar-deep-research` — Deep research (expensive, use sparingly)

**API Key:** `OPENROUTER_API_KEY`

**Usage Rules:**
1. `sonar-pro-search` — Use for all regular web searches
2. `sonar-deep-research` — **ONLY** when Blake explicitly says "deep research" or similar

**Cost Warning:** Deep research is significantly more expensive. Respect the trigger words.

**Environment:**
- Key: `OPENAI_API_KEY`

**Gotchas:**
- Used automatically when Kimi is unavailable
- GPT-4o used for `image` tool (image generation/editing)
- Anthropic models (Sonnet, Opus) configured but may have billing issues

---

### Anthropic Models (Claude)
**Status:** ⚠️ Issues

**Configuration:**
- `anthropic/claude-sonnet-4-5` → alias: "Sonnet"
- `anthropic/claude-opus-4-5` → alias: "Opus"
- `anthropic/claude-haiku-4-5` → used for heartbeats

**Gotchas:**
- **Credit balance too low** — Anthropic API currently failing with billing error
- Sonnet/Opus have `cacheRetention: "short"` for cost control
- Haiku used for heartbeat checks (lightweight)

---

## Web Search & Research

### OpenRouter (Perplexity Models)
**Status:** ✅ Working (Primary search provider)

**Configuration:**
- Key: `OPENROUTER_API_KEY`
- Provider: OpenRouter → Perplexity

**Models:**

#### perplexity/sonar-pro-search
- **Alias:** Perplexity Sonar Pro
- **Use:** Default web search (replaces Brave)
- **Cost:** Standard
- **When to use:** All regular web searches

#### perplexity/sonar-deep-research
- **Alias:** Perplexity Deep Research
- **Use:** Intensive research tasks only
- **Cost:** Higher (⚠️ use sparingly)
- **When to use:** Only when Blake explicitly requests "deep research" or "a ton of research"

**⚠️ CRITICAL RULE:**
> Only use `perplexity/sonar-deep-research` when Blake **explicitly** mentions:
> - "deep research"
> - "do a ton of research" 
> - "extensive research"
> - Similar phrasing
>
> Default to `perplexity/sonar-pro-search` for all other web searches.

**Common Operations:**
```javascript
// Default web search (standard cost)
{
  "tool": "web_search",
  "query": "search terms",
  "model": "perplexity/sonar-pro-search"
}

// Deep research (higher cost - only when explicitly requested)
{
  "tool": "web_search", 
  "query": "search terms",
  "model": "perplexity/sonar-deep-research"
}
```

**Gotchas:**
- Perplexity models provide citations with results
- Deep research is significantly more expensive — respect the trigger words
- OpenRouter bills per token; monitor usage for deep research

---

### Brave Search API (Deprecated)
**Status:** ⚠️ Fallback only

**Configuration:**
- Key: `BRAVE_API_KEY`
- Tool: `web_search`
- Default: 10 results, US region

**When to use:** Only if OpenRouter/Perplexity fails

**Gotchas:**
- Rate limits apply (free tier generous)
- Supports `freshness` filter for recent results

---

## Gateway & System

### OpenClaw Gateway
**Status:** ✅ Working

**Configuration:**
```json
{
  "mode": "local",
  "commands": {
    "native": "auto",
    "nativeSkills": "auto",
    "restart": true  // Enabled 2026-02-10
  },
  "auth": {
    "mode": "token",
    "token": "***"
  }
}
```

**Common Operations:**
```bash
# Config management
gateway config.get
gateway config.patch '{"key": "value"}'
gateway restart

# Check status
gateway status
```

**Gotchas:**
- Config changes require restart to take effect
- `commands.restart: true` enabled 2026-02-10 — can now restart via agent
- Running in Docker container: `openclaw-dxad-openclaw-1`

**Docker Commands:**
```bash
# From VPS host (not inside container)
docker ps | grep openclaw
docker restart openclaw-dxad-openclaw-1
docker logs -f openclaw-dxad-openclaw-1
```

---

## Channels

### Telegram Bot
**Status:** ✅ Working

**Configuration:**
```json
{
  "telegram": {
    "dmPolicy": "pairing",
    "botToken": "***",
    "allowFrom": ["P6809895825"],
    "groupPolicy": "allowlist",
    "streamMode": "partial"
  }
}
```

**Bot Info:**
- Bot ID: `8145922224`
- Allowed user: Blake Henkel (P6809895825)
- Policy: Pairing required for DMs, allowlist for groups

**Gotchas:**
- Stream mode is "partial" (not full streaming)
- Must pair with bot before DM works
- Group chats require explicit allowlist

---

## Skills (Enabled)

### blogwatcher
**Status:** ✅ Enabled

**Purpose:** Monitor blogs and RSS/Atom feeds for updates

**CLI:** `blogwatcher` command available

---

### copy-editing
**Status:** ✅ Enabled

**Purpose:** Edit and review marketing copy

**Triggers:** "edit this copy", "review my copy", "proofread", "polish this"

---

### copywriter
**Status:** ✅ Enabled

**Purpose:** Write UX copy, marketing content, product messaging

**Triggers:** Writing button labels, landing pages, emails, CTAs

---

### slack
**Status:** ❌ Disabled

---

## Agent Configuration

### Memory Search
**Configuration:**
```json
{
  "sources": ["memory", "sessions"],
  "experimental": {
    "sessionMemory": true
  }
}
```

**Behavior:**
- Searches `MEMORY.md`, `memory/*.md`, and session transcripts
- Mandatory before answering questions about prior work
- Session memory enabled (experimental)

---

### Context & Compaction
**Configuration:**
```json
{
  "contextPruning": {
    "mode": "cache-ttl",
    "ttl": "1h"
  },
  "compaction": {
    "mode": "safeguard",
    "memoryFlush": {
      "enabled": true
    }
  }
}
```

**Behavior:**
- Context pruned after 1 hour TTL
- Compaction runs at 262k context limit (safeguard mode)
- Memory flush enabled — writes to daily notes before compaction

---

### Heartbeat
**Configuration:**
```json
{
  "every": "30m",
  "model": "anthropic/claude-haiku-4-5"
}
```

**Behavior:**
- Runs every 30 minutes
- Uses lightweight Haiku model
- Checks HEARTBEAT.md for tasks

---

### Subagents
**Configuration:**
```json
{
  "maxConcurrent": 8,
  "model": "kimi-coding/k2p5"
}
```

**Behavior:**
- Up to 8 parallel subagents
- Uses same model as main (Kimi K2.5)

---

## Gotchas & Lessons Learned

### Model Switching
- **Never change default model without explicit permission**
- Kimi K2.5 is Blake's preferred default
- Anthropic API has billing issues — don't rely on it

### Restarts
- Config changes require gateway restart
- Docker container: `docker restart openclaw-dxad-openclaw-1`
- Agent restart capability enabled 2026-02-10

### Session Context
- Each message is stateless — context comes from conversation history
- Memory files (`memory/*.md`) persist across sessions
- Session restarts = fresh context (unless memory loaded)

### Tool Failures
- `openclaw` CLI not available inside Docker container
- Use `gateway` tool instead for config management
- `exec` tool runs commands inside container, not on VPS host

### Security
- API keys in `openclaw.json` — never commit this file
- Credentials directory `.credentials/` is gitignored
- Gateway control UI allows insecure auth (local mode only)

---

## Quick Reference

### Restart Gateway
```bash
# Via agent (now enabled)
gateway restart

# Via Docker (on VPS host)
docker restart openclaw-dxad-openclaw-1
```

### Check Config
```bash
gateway config.get
```

### Update Config
```bash
# Patch specific values
gateway config.patch '{"commands":{"restart":true}}'

# Or edit file directly
/home/node/.openclaw/openclaw.json
```

### Session Management
```bash
# List sessions
sessions_list

# Spawn subagent
sessions_spawn --task "do something"

# Send message to session
sessions_send --sessionKey <key> --message "hello"
```

---

*Keep this updated when adding new tools or discovering gotchas.*
