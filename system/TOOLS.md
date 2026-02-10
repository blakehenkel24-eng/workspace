# TOOLS.md - Tool Configuration & Notes

> Living document of tool configurations, credentials, and gotchas. **READ THIS WHEN SPINNING UP FRESH SESSIONS.**

---

## 🔑 Credentials Location

All credentials stored in `.credentials/` (gitignored):
- `kimi-api-key.txt` — Kimi API key
- `github-token.txt` — GitHub personal access token
- `brave-api-key.txt` — Brave Search API key
- `vercel-token.txt` — Vercel deployment token
- `openrouter-api-key.txt` — OpenRouter API key (sk-or-v1-...)

**Also in env:**
- `KIMI_API_KEY` — Set in OpenClaw config
- `BRAVE_API_KEY` — Set in OpenClaw config
- `OPENAI_API_KEY` — Set but avoid using (Kimi preferred)
- `OPENROUTER_API_KEY` — To be added for multi-model access

---

## 🤖 AI Models

### Kimi (Primary)
**Status:** ✅ Working | **Default:** `kimi-coding/k2p5`

**Configuration:**
```json
{
  "primary": "kimi-coding/k2p5",
  "fallbacks": ["openai/gpt-5.1", "openai/gpt-5.2", "openai/gpt-5-mini"]
}
```

**Gotchas:**
- Kimi K2.5 is Blake's preferred model — **NEVER switch without explicit permission**
- Rate limits: Generally generous but watch for 429s on heavy usage
- Context window: 128k tokens for k2.5

**Aliases:**
- `kimi-coding/k2p5` → Kimi K2.5
- `kimi-coding/k2` → Kimi K2
- `kimi-coding/k1.5` → Kimi K1.5

### Anthropic (Secondary)
**Status:** ✅ Available | **Models:** Sonnet 4.5, Opus 4.5

**Configuration:**
- Sonnet: `anthropic/claude-sonnet-4-5` — Fast, capable
- Opus: `anthropic/claude-opus-4-5` — Heavy lifting, expensive
- Haiku: `anthropic/claude-haiku-4-5` — Cheap, used for heartbeats

**Gotchas:**
- Opus is pricey — use for complex reasoning only
- Haiku 4.5 is the new heartbeat model (cheap, fast)

### OpenRouter (Multi-Model Gateway)
**Status:** ✅ Key stored | **Key:** `sk-or-v1-...` (in .credentials/)

**Purpose:** Access to 100+ models through unified API. Use when Blake explicitly requests specific models.

**Available Models:**
- `anthropic/claude-opus-4-5` — Best reasoning
- `anthropic/claude-sonnet-4-5` — Fast + capable
- `anthropic/claude-haiku-4-5` — Cheap, quick tasks
- `openai/gpt-5.2` — When explicitly requested
- `openai/gpt-4o` — Vision tasks
- `google/gemini-2.5-pro` — Long context
- `meta-llama/llama-4-maverick` — Open source
- `deepseek/deepseek-v3.2` — Coding

**Gotchas:**
- **ONLY use when Blake explicitly says** — Default remains Kimi K2.5
- Rate limits vary by model provider
- Pricing different per model — check costs for heavy usage
- Some models have different context windows

**Usage:**
```typescript
// When Blake says "use OpenRouter for this"
// or "try with Opus" or "compare models"
```

---

## 🗄️ Supabase (Database + Auth)
**Status:** ✅ Connected via MCP

**Configuration:**
- Project: Connected via Supabase MCP server
- Uses: Auth, PostgreSQL, Edge Functions, pgvector
- Vector store: Enabled for SlideTheory RAG

**Common Operations:**
```bash
# MCP commands available:
supabase table list
supabase table fetch <table>
supabase query "SELECT * FROM ..."
```

**Gotchas:**
- Field mapping bugs are common — always validate at runtime
- Edge functions cold start can be slow
- RLS policies must be explicitly enabled

**Tables (SlideTheory):**
- `users` — Auth + profiles
- `decks` — User slide decks
- `slides` — Individual slides
- `templates` — Slide templates
- `vector_store` — RAG embeddings

---

## 🐙 GitHub (Code Management)
**Status:** ✅ Connected via MCP

**Configuration:**
- Auth: Personal access token
- MCP server: `gh` CLI integration

**Common Operations:**
```bash
# Via MCP:
gh issue list --repo blakehenkel24-eng/slidetheory
gh pr create --title "..." --body "..."
gh repo view
gh run list
```

**Key Repos:**
- `blakehenkel24-eng/slidetheory` — Main product
- `blakehenkel24-eng/agent-studio` — Agent management UI
- `blakehenkel24-eng/workspace` — This workspace

**Gotchas:**
- PAT needs `repo`, `workflow`, `write:packages` scopes
- Large repos may timeout on clone operations

---

## 🔍 Web Research (Primary: Perplexity Sonar Pro)
**Status:** ✅ Via OpenRouter | **Model:** `perplexity/sonar-pro`

**Configuration:**
- Provider: OpenRouter (using stored API key)
- Model: `perplexity/sonar-pro` — Real-time web search with citations
- Deep Research: `perplexity/sonar-deep-research` — **ONLY when explicitly mentioned**
- Fallback: Brave Search (if Perplexity unavailable)

**Common Operations:**
```typescript
// Standard research (Perplexity Sonar Pro)
web_search({ query: "..." })

// Deep Research — ONLY when Blake says "deep research"
// Uses: perplexity/sonar-deep-research via OpenRouter
// Cost: Significantly higher — use sparingly

// Fallback to Brave:
web_search({ query: "...", count: 5, freshness: "pw" })
```

**Gotchas:**
- **Perplexity Sonar Deep Research** — Only use when Blake explicitly says "deep research"
- Perplexity Sonar Pro provides citations and reasoning
- Rate limits vary by OpenRouter tier
- Brave fallback: 2000 queries/month on free tier
- `freshness` param (Brave): pd (day), pw (week), pm (month), py (year)

**When to use what:**
- **Perplexity Sonar Pro:** Default for all research
- **Perplexity Sonar Deep Research:** ONLY when Blake explicitly says "deep research" (costly)
- **Brave:** Quick lookups, high-volume searches, simple queries

---

## 🚀 Vercel (Hosting)
**Status:** ✅ Connected

**Configuration:**
- CLI installed globally
- Auth via token (stored in credentials)
- Default team: personal (blakehenkel24-eng)

**Common Operations:**
```bash
# Deploy current directory
vercel --prod

# Deploy with specific settings
vercel --build-env NODE_ENV=production

# View deployments
vercel list
```

**Active Deployments:**
- `slidetheory.io` — Landing page
- `frontend-rose-chi-52.vercel.app` — SlideTheory app
- `agent-studio-woad.vercel.app` — Agent Studio v1 (deprecated)

**Gotchas:**
- Native modules (better-sqlite3) may fail — use serverless-friendly DBs
- Edge functions have cold starts
- Build cache can cause stale deployments — use `--force` if needed

---

## ⏰ Cron Jobs (GTM Engine)
**Status:** ✅ 5 jobs running | **Timezone:** America/Chicago (CST)

**Daily Jobs:**
| Time (CST) | Job | Description |
|------------|-----|-------------|
| 8:00 AM | Market Intel | Competitor brief + trends |
| 10:00 AM | Content Creation | 1 piece for approval |
| 2:00 PM | Prospect Research | 5 qualified leads |
| 6:00 PM | Analytics | Metrics + optimization |
| 9:00 PM | Health Check | System status report |

**Weekly Jobs:**
| Time (CST) | Job |
|------------|-----|
| Sunday 8:00 PM | Weekly Strategy Review |

**Configuration:**
- Managed via OpenClaw `cron` tool
- All jobs use Kimi K2.5
- Outputs saved to `gtm/` directory

**Common Operations:**
```typescript
cron_list()          // View all jobs
cron_run(jobId)      // Trigger manually
cron_add({...})      // Create new job
cron_update(id, {...}) // Modify job
cron_remove(id)      // Delete job
```

---

## 📰 Blogwatcher (RSS Monitoring)
**Status:** ✅ Installed

**Configuration:**
- CLI: `blogwatcher` (Go binary)
- Database: Local SQLite

**Common Operations:**
```bash
blogwatcher add "Name" https://example.com/feed
blogwatcher scan           // Check for updates
blogwatcher articles       // List articles
blogwatcher read 1         // Mark read
```

**Gotchas:**
- Requires Go runtime
- Feed parsing can fail on malformed RSS

---

## 📱 Telegram (Messaging)
**Status:** ✅ Connected | **Blake's ID:** P6809895825

**Configuration:**
- Bot token in OpenClaw config
- DM policy: pairing (secure)
- Group policy: allowlist

**Capabilities:**
- Send/receive messages
- Media attachments
- Reactions
- Silent sends

---

## 🎨 Image Generation

### Nano Banana Pro (Gemini)
**Status:** ✅ Skill installed
- Gemini 3 Pro Image
- Supports 1K/2K/4K, text-to-image + image-to-image

### OpenAI Images API
**Status:** ⚠️ Available but **AVOID for text**
- AI cannot reliably render coherent text
- Use HTML/CSS for slide text instead
- OK for decorative visuals only

---

## 🔧 MCP Servers

### Connected:
1. **GitHub** — Code, issues, PRs, actions
2. **Supabase** — Database, auth, edge functions
3. **Puppeteer** — Browser automation

### To Connect (if needed):
- Slack — For team integrations
- Linear — Issue tracking
- Notion — Documentation
- Figma — Design assets

---

## 🛠️ Skills Installed

| Skill | Purpose | Location |
|-------|---------|----------|
| agent-swarm | Multi-agent orchestration | `skills/agent-swarm/` |
| proactive-agent | Self-improving patterns | `skills/proactive-agent/` |
| ui-ux-pro-max | UI/UX design | `skills/ui-ux-pro-max/` |
| deep-research | Research subagents | `skills/deep-research/` |
| humanizer | Remove AI patterns | `skills/humanizer/` |
| copywriter | UX/marketing copy | `skills/copywriter/` |
| copy-editing | Edit existing copy | `skills/copy-editing/` |
| blogwatcher | RSS monitoring | `skills/blogwatcher/` |
| github | GitHub CLI | `skills/github/` |
| nano-banana-pro | Image generation | `skills/nano-banana-pro/` |
| summarize | Content summarization | `skills/summarize/` |
| mcporter | MCP server management | `skills/mcporter/` |
| slidetheory-content-creator | SlideTheory blog content | `skills/slidetheory-content-creator/` |
| weather | Weather data | `skills/weather/` |
| openai-whisper-api | Audio transcription | `skills/openai-whisper-api/` |
| openai-image-gen | Batch image gen | `skills/openai-image-gen/` |
| healthcheck | Security hardening | `skills/healthcheck/` |
| skill-creator | Create new skills | `skills/skill-creator/` |

---

## 🚨 Critical Work Standards

**When Blake says "build/create something":**
→ Deliver **100% functional implementation**
- NO shells, NO prototypes, NO placeholder functionality
- MUST integrate real data and services
- MUST test thoroughly and confirm working
- MUST verify all features are functional

**Model Switching Protocol:**
→ **NEVER switch AI models without explicit permission**
- Default: Kimi K2.5
- Only switch if explicitly requested
- Always confirm before changing

---

## 📝 Writing Preferences

**Voice:** Direct, high signal, zero bullshit
- Be concise
- No filler or hedging
- If something's weak, say so
- Occasional profanity acceptable (per Blake's request)
- Have fun with it — life's too short for boring copy

**Code:** 
- Next.js 14 + TypeScript
- Tailwind CSS
- shadcn/ui components
- Kimi API for AI features
- Real data, never mocks

---

## 🔄 Session Recovery

**If context is lost or compacted:**
1. Read MEMORY.md for long-term context
2. Read memory/YYYY-MM-DD.md for recent activity
3. Check this file for tool configurations
4. Review USER.md for Blake's preferences
5. Read SOUL.md for personality/voice

**Never assume defaults** — always verify with files above.

---

*Last updated: 2026-02-10*
*If this file is outdated, slap me and I'll fix it.*
