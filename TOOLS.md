# TOOLS.md - Tool Configuration & Notes

> Document tool-specific configurations, gotchas, and credentials here.

Last Updated: 2026-02-10 (Perplexity + MCP + Full Tool Stack)

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

## MCP Servers (External Stack)

**Note:** These are configured in Blake's Cursor/Claude Desktop environment per USER.md, but not currently available in OpenClaw.

### GitHub MCP
**Status:** ⚠️ Not configured in OpenClaw (available in Cursor)

**Purpose:** GitHub repo management, issues, PRs, code search

**What it does:**
- Create/read/update issues and PRs
- Search code across repositories
- Manage branches and commits
- Read file contents from repos

**Gotchas:**
- Uses `gh` CLI as fallback in OpenClaw
- Rate limits apply for unauthenticated requests

---

### Supabase MCP
**Status:** ⚠️ Not configured in OpenClaw (available in Cursor)

**Purpose:** Database management, queries, schema operations

**What it does:**
- Execute SQL queries
- Manage tables and schemas
- Handle migrations
- Query realtime data

**Gotchas:**
- Use Supabase dashboard or `psql` CLI as fallback
- Edge Functions managed via CLI

---

### Puppeteer MCP
**Status:** ⚠️ Not configured in OpenClaw (available in Cursor)

**Purpose:** Browser automation, screenshots, scraping

**What it does:**
- Navigate web pages
- Take screenshots
- Extract data
- Fill forms

**Gotchas:**
- Use OpenClaw `browser` tool as fallback
- Can be resource-intensive

---

## Additional Tools Available

### Vercel CLI
**Status:** ✅ Available (via exec)

**Common Operations:**
```bash
# Deploy
cd my-app && vercel --prod

# Check deployments
vercel list

# View logs
vercel logs my-app
```

**Gotchas:**
- Requires `VERCEL_TOKEN` env var for non-interactive use
- Team/scope may need specification

---

### Supabase CLI
**Status:** ✅ Available (via exec)

**Common Operations:**
```bash
# Login (one-time)
supabase login

# Link project
supabase link --project-ref <ref>

# Push migrations
supabase db push

# Start local dev
supabase start

# Generate types
supabase gen types typescript --project-id <id>
```

**Gotchas:**
- Local dev requires Docker
- Migrations should be version controlled

---

### GitHub CLI (`gh`)
**Status:** ✅ Available (via exec)

**Common Operations:**
```bash
# Repo operations
gh repo view
gh repo create

# Issues
gh issue create --title "Bug" --body "Description"
gh issue list

# PRs
gh pr create --title "Feature" --body "Changes"
gh pr merge

# Codespaces
gh codespace list
```

**Gotchas:**
- Authenticate with `gh auth login` or `GH_TOKEN` env var
- Enterprise GitHub may need `GH_HOST` set

---

### npm / Node.js
**Status:** ✅ Available (via exec)

**Common Operations:**
```bash
# Install dependencies
npm install

# Run scripts
npm run dev
npm run build
npm test

# Global packages
npm install -g <package>
```

**Gotchas:**
- Node version managed via `nvm` if installed
- `package-lock.json` should be committed

---

### Image Generation (OpenAI)
**Status:** ✅ Working (via `image` tool)

**Configuration:**
- Provider: OpenAI
- Model: `gpt-4o` (DALL-E 3)
- Key: `OPENAI_API_KEY`

**Common Operations:**
```javascript
// Generate image
{
  "tool": "image",
  "prompt": "description of image",
  "size": "1024x1024"  // or 1792x1024, 1024x1792
}
```

**Gotchas:**
- Costs per image (not per token)
- Quality: standard or hd (hd costs more)
- Style: vivid or natural

---

### Text-to-Speech (TTS)
**Status:** ✅ Working (via `tts` tool)

**Configuration:**
- Provider: OpenAI
- Model: `tts-1` or `tts-1-hd`
- Voices: alloy, echo, fable, onyx, nova, shimmer

**Common Operations:**
```javascript
// Generate speech
{
  "tool": "tts",
  "text": "Hello world",
  "voice": "alloy"
}
```

**Gotchas:**
- Returns audio file path (MEDIA:)
- Supports multiple output formats

---

### Canvas (Browser Rendering)
**Status:** ✅ Working (via `canvas` tool)

**Purpose:** Present/evaluate HTML/CSS/JS, take screenshots

**Common Operations:**
```bash
# Present HTML
canvas present --html "<h1>Hello</h1>"

# Navigate to URL
canvas navigate --url "https://example.com"

# Take screenshot
canvas screenshot
```

**Gotchas:**
- Good for previewing components before deploying
- Limited interaction (no clicking)

---

### Browser Automation
**Status:** ✅ Working (via `browser` tool)

**Purpose:** Full browser control (Playwright-based)

**Common Operations:**
```bash
# Open page
browser open --url "https://example.com"

# Take snapshot (accessible tree)
browser snapshot

# Click element
browser click --ref e12

# Type text
browser type --ref e15 --text "hello"

# Screenshot
browser screenshot --fullPage
```

**Gotchas:**
- Requires Chrome extension for Chrome profile
- Sandbox mode available for isolated browsing
- Supports both `role` and `aria` refs

---

### Cron Jobs
**Status:** ✅ Working (via `cron` tool)

**Purpose:** Schedule automated tasks

**Common Operations:**
```bash
# List jobs
cron list

# Add job
cron add --schedule '{"kind":"every","everyMs":3600000}' \
  --payload '{"kind":"agentTurn","message":"Do task"}'

# Remove job
cron remove --jobId <id>

# Trigger now
cron run --jobId <id>
```

**Gotchas:**
- Supports `at`, `every`, and `cron` schedules
- AgentTurn payload runs in isolated session
- SystemEvent payload injects into main session

---

### Nodes (Paired Devices)
**Status:** ✅ Available

**Purpose:** Control paired mobile devices

**Common Operations:**
```bash
# List devices
nodes status

# Take photo
nodes camera_snap --facing back

# Record screen
nodes screen_record --duration 30s

# Run command on device
nodes run --command ["ls","-la"]
```

**Gotchas:**
- Requires device pairing via QR code
- Limited to allowed operations

---

### Messaging
**Status:** ✅ Working (via `message` tool)

**Purpose:** Send messages via configured channels

**Common Operations:**
```bash
# Send message
message send --target "channel-name" --message "Hello"

# Create thread
message send --target "channel" --message "Topic" --threadName "Discussion"

# Send poll
message send --target "channel" --pollQuestion "Vote?" --pollOption "Yes" --pollOption "No"
```

**Supported Channels:**
- Telegram ✅ (configured)
- WhatsApp, Discord, Slack, etc. (if configured)

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

## Potential Future Tools

### To Consider Adding:

**APIs & Services:**
- **Stripe** — Payment processing, subscription management
- **SendGrid/Mailgun** — Transactional emails
- **Twilio** — SMS, phone calls
- **Airtable** — Database/spreadsheet hybrid
- **Notion API** — Docs, wikis, databases
- **Linear** — Issue tracking (alternative to GitHub Issues)
- **Figma API** — Design system integration
- **Cloudflare API** — DNS, Workers, R2 storage

**Development Tools:**
- **Docker CLI** — Container management
- **Terraform** — Infrastructure as code
- **AWS CLI** — Cloud resource management
- **Fly.io CLI** — Alternative deployment platform

**Data & Analytics:**
- **Google Analytics API** — Traffic analysis
- **Mixpanel/Amplitude** — Product analytics
- **PostHog** — Open-source product analytics
- **Tinybird** — Real-time analytics

**Monitoring:**
- **Sentry** — Error tracking
- **Better Stack** — Uptime monitoring
- **LogRocket** — Session replay

**Communication:**
- **Discord bot** — Community management
- **Slack app** — Team notifications (enable existing skill)
- **Cal.com** — Scheduling

---

*Keep this updated when adding new tools or discovering gotchas.*
