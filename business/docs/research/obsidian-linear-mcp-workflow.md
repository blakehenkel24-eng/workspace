# Obsidian + Linear MCP Workflow Integration Guide

**Prepared for:** Blake Henkel  
**Date:** February 7, 2026  
**Topic:** Using MCP Servers to Connect Obsidian (Knowledge Management) with Linear (Issue Tracking)

---

## Executive Summary

You can create a powerful workflow bridge between your Obsidian vault (ideas, research, notes) and Linear (tasks, projects, execution) using **Model Context Protocol (MCP) servers**. This allows AI assistants (like Claude) to seamlessly move information between thinking space (Obsidian) and action space (Linear).

---

## What is MCP?

**Model Context Protocol (MCP)** is an open standard developed by Anthropic that enables AI systems to securely connect with external tools and data sources. Think of it as a "USB-C for AI" — a standardized way for AI assistants to interact with your apps.

**Key Benefits:**
- AI can read from and write to your tools directly
- No more copy-pasting between apps
- Context-aware automation (AI knows what's in your notes AND your task tracker)
- Works with Claude, ChatGPT Enterprise, Cursor, and other MCP-compatible clients

---

## Part 1: Obsidian MCP Server

### Option A: mcp-obsidian (Recommended for Direct Vault Access)

**GitHub:** `bitbonsai/mcp-obsidian`  
**NPM:** `@mauricio.wolff/mcp-obsidian`

**What it does:**
Provides direct filesystem access to your Obsidian vault — no plugins required. Reads/writes markdown files directly.

**Tools Available:**
| Tool | Purpose |
|------|---------|
| `read_note` | Read any note with frontmatter |
| `write_note` | Create or overwrite notes |
| `list_directory` | Browse vault structure |
| `search_notes` | Search across all notes |
| `manage_tags` | Add/remove tags |
| `move_note` | Rename/relocate notes |
| `delete_note` | Remove notes (with confirmation) |
| `get_frontmatter` | Extract metadata only |
| `update_frontmatter` | Modify metadata without changing content |
| `read_multiple_notes` | Batch read up to 10 files |
| `get_notes_info` | Get file metadata (size, modified date) |

**Installation:**

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "obsidian": {
      "command": "npx",
      "args": ["@mauricio.wolff/mcp-obsidian@latest", "/path/to/your/vault"]
    }
  }
}
```

**Pros:**
- ✅ Zero Obsidian plugins needed
- ✅ Works with any vault structure
- ✅ Fast, direct filesystem access
- ✅ Batch operations (read multiple notes)
- ✅ Token-optimized responses (40-60% smaller)

**Cons:**
- ❌ No real-time sync with Obsidian app
- ❌ Can't access Obsidian-specific features (canvas, graph view)

---

### Option B: obsidian-mcp-server (via Local REST API)

**GitHub:** `cyanheads/obsidian-mcp-server`  
**NPM:** `obsidian-mcp-server`

**What it does:**
Connects through Obsidian's **Local REST API** plugin — integrates with Obsidian's native functionality.

**Tools Available:**
| Tool | Purpose |
|------|---------|
| `obsidian_read_note` | Read note content & metadata |
| `obsidian_update_note` | Append, prepend, or overwrite |
| `obsidian_search_replace` | Find/replace within notes |
| `obsidian_global_search` | Search entire vault |
| `obsidian_list_notes` | Browse with tree view |
| `obsidian_manage_frontmatter` | Atomic frontmatter updates |
| `obsidian_manage_tags` | Tag operations |
| `obsidian_delete_note` | Delete with safety checks |

**Installation:**

1. **Install Local REST API plugin** in Obsidian (Settings → Community Plugins)
2. **Generate API key** in plugin settings
3. **Configure MCP:**

```json
{
  "mcpServers": {
    "obsidian-mcp-server": {
      "command": "npx",
      "args": ["obsidian-mcp-server"],
      "env": {
        "OBSIDIAN_API_KEY": "YOUR_API_KEY",
        "OBSIDIAN_BASE_URL": "http://127.0.0.1:27123",
        "OBSIDIAN_VERIFY_SSL": "false",
        "OBSIDIAN_ENABLE_CACHE": "true"
      }
    }
  }
}
```

**Pros:**
- ✅ Integrates with Obsidian app (respects settings)
- ✅ Can target "active note" in Obsidian
- ✅ Supports periodic notes (daily/weekly)
- ✅ Built-in vault cache for faster searches

**Cons:**
- ❌ Requires Local REST API plugin
- ❌ More complex setup

---

## Part 2: Linear MCP Server

### Official Linear MCP Server

**URL:** `https://mcp.linear.app/sse` (Remote MCP Server)  
**Alternative:** `jerhadf/linear-mcp-server` (Community, now deprecated)

**What it does:**
Enables AI to create, update, search, and manage Linear issues programmatically.

**Tools Available:**
| Tool | Purpose |
|------|---------|
| `linear_create_issue` | Create new issues |
| `linear_update_issue` | Modify existing issues |
| `linear_search_issues` | Search with filters |
| `linear_get_user_issues` | Get assigned issues |
| `linear_add_comment` | Add comments to issues |

**Installation (Official Remote Server):**

```json
{
  "mcpServers": {
    "linear": {
      "url": "https://mcp.linear.app/sse",
      "env": {
        "LINEAR_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

**Get API Key:**
1. Go to `https://linear.app/YOUR-TEAM/settings/api`
2. Create personal API key

---

## Part 3: Integrated Workflow Patterns

### Workflow 1: Idea → Task Capture

**Scenario:** You're researching in Obsidian, have an insight for SlideTheory.

**Prompt to AI:**
```
I just wrote this in my Obsidian vault:
"Need to implement layout taxonomy for slide generation - 
consulting slides need structural variety not just color changes"

Please:
1. Read my current SlideTheory project notes in Obsidian
2. Create a Linear issue titled "Implement Layout Taxonomy System"
3. Add this as the description with proper context
4. Tag it as "Feature" and assign to me
5. Set priority to High
```

**What happens:**
- AI reads related notes from Obsidian for context
- Creates well-formed Linear issue with full background
- Links the thinking (Obsidian) to the doing (Linear)

---

### Workflow 2: Daily Standup Prep

**Scenario:** Morning sync, need to report progress.

**Prompt to AI:**
```
Prepare my daily standup update:
1. Check my assigned Linear issues and their status
2. Look at my daily note in Obsidian for yesterday's accomplishments
3. Generate a concise update with:
   - What I completed yesterday
   - What I'm working on today
   - Any blockers
```

**What happens:**
- AI pulls current tasks from Linear
- Cross-references with Obsidian daily notes
- Generates formatted standup text

---

### Workflow 3: Meeting Notes → Action Items

**Scenario:** Just finished a client call, took notes in Obsidian.

**Prompt to AI:**
```
I just saved meeting notes in Obsidian at "Meetings/Client-Call-2026-02-07.md"

Please:
1. Read the meeting notes
2. Extract all action items and decisions
3. Create Linear issues for each action item:
   - Use clear titles
   - Include context from the notes
   - Set appropriate priorities
   - Tag with "Client-Work"
4. Update the meeting note with links to the Linear issues
```

**What happens:**
- AI parses meeting notes
- Creates structured Linear issues
- Updates Obsidian note with bidirectional links

---

### Workflow 4: Project Context Sync

**Scenario:** Starting work on a feature, need full context.

**Prompt to AI:**
```
I'm about to work on the "Layout Taxonomy" feature (Linear issue LIN-123).

Please gather context:
1. Read the Linear issue details and comments
2. Search my Obsidian vault for related notes on:
   - slide layouts
   - CSS grid
   - consulting frameworks
3. Summarize the key insights I should keep in mind
4. Suggest any additional notes I should review
```

**What happens:**
- AI pulls Linear issue context
- Searches Obsidian for related knowledge
- Provides synthesized briefing

---

### Workflow 5: Weekly Review Automation

**Scenario:** Friday afternoon, reviewing the week.

**Prompt to AI:**
```
Help me with my weekly review:

1. Pull all Linear issues I worked on this week
2. Read my daily notes from this week in Obsidian
3. Identify:
   - Key accomplishments
   - Blockers that came up
   - Insights or learnings
4. Create a summary note in Obsidian at "Reviews/Week-of-2026-02-07.md"
5. Update any Linear issues that need status changes
```

**What happens:**
- Aggregates work from both systems
- Creates structured weekly review
- Keeps Linear status up to date

---

## Part 4: Setup Instructions

### Step 1: Install Prerequisites

```bash
# Install Node.js 18+ if not already installed
# Check with:
node --version

# Should show v18.0.0 or higher
```

### Step 2: Configure Obsidian MCP

**For mcp-obsidian (Recommended):**

```json
// ~/.claude.json or claude_desktop_config.json
{
  "mcpServers": {
    "obsidian": {
      "command": "npx",
      "args": [
        "@mauricio.wolff/mcp-obsidian@latest",
        "/Users/blake/Documents/ObsidianVault"
      ],
      "env": {}
    }
  }
}
```

**For obsidian-mcp-server (via API):**

1. Open Obsidian → Settings → Community Plugins
2. Browse → Search "Local REST API" → Install → Enable
3. Go to Local REST API settings
4. Copy the API Key
5. Configure MCP:

```json
{
  "mcpServers": {
    "obsidian-api": {
      "command": "npx",
      "args": ["obsidian-mcp-server"],
      "env": {
        "OBSIDIAN_API_KEY": "your-api-key-here",
        "OBSIDIAN_BASE_URL": "http://127.0.0.1:27123",
        "OBSIDIAN_VERIFY_SSL": "false"
      }
    }
  }
}
```

### Step 3: Configure Linear MCP

```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "linear-mcp-server"],
      "env": {
        "LINEAR_API_KEY": "lin_api_your_key_here"
      }
    }
  }
}
```

**Get Linear API Key:**
1. Go to `linear.app/YOUR-WORKSPACE/settings/api`
2. Click "Create key"
3. Name it "MCP Integration"
4. Copy the key

### Step 4: Test the Connection

**Test Obsidian:**
```
"List all files in my Obsidian vault"
```

**Test Linear:**
```
"Show me all my high-priority Linear issues"
```

**Test Integration:**
```
"Create a Linear issue from my latest Obsidian daily note"
```

---

## Part 5: Advanced Workflow Templates

### Template 1: Feature Spec → Linear Epic

**Obsidian Note Structure:**
```markdown
---
type: feature-spec
status: draft
---

# Feature: Layout Taxonomy System

## Problem
All slides look the same - need structural variety

## Solution
Implement 12 layout primitives

## Acceptance Criteria
- [ ] Executive Summary layout
- [ ] Comparison layout
- [ ] Timeline layout

## Technical Notes
See [[CSS Grid Research]]
```

**Prompt:**
```
Read the feature spec at "Specs/Layout-Taxonomy.md"
Create a Linear Epic with:
- Title from the H1
- Description from Problem + Solution
- Sub-issues for each acceptance criterion
- Link to the Obsidian note in the description
```

---

### Template 2: Bug Report → Both Systems

**Prompt:**
```
I found a bug: "Slide generation fails when input has special characters"

Please:
1. Create a detailed note in Obsidian at "Bugs/2026-02-07-special-chars.md" with:
   - Description
   - Steps to reproduce
   - Expected vs actual behavior
   
2. Create a Linear issue with:
   - Title: "[BUG] Slide generation fails with special characters"
   - Link to the Obsidian note
   - Priority: High
   - Label: "bug"
   
3. Update the Obsidian note with the Linear issue URL
```

---

### Template 3: Research Synthesis

**Prompt:**
```
I've been researching slide layouts. Please:

1. Search my Obsidian vault for notes tagged #slide-layout or #consulting
2. Read the most relevant 5 notes
3. Create a Linear issue titled "Synthesize Layout Research into Implementation Plan"
4. Include in the description:
   - Key findings summary
   - List of source notes
   - Recommended next steps
5. Set due date to 3 days from now
```

---

## Part 6: Best Practices

### 1. Naming Conventions

**Obsidian:**
- Use consistent frontmatter: `type:`, `status:`, `project:`
- Tag liberally: `#slide-theory`, `#research`, `#meeting`

**Linear:**
- Prefix bug issues: `[BUG]`
- Prefix feature issues: `[FEAT]`
- Link to Obsidian: Include `Obsidian: [[Note Name]]` in description

### 2. Bidirectional Linking

**In Obsidian notes, add:**
```markdown
---
linear-issue: https://linear.app/slidetheory/issue/LIN-123
---

# Layout Taxonomy
...
```

**In Linear issues, add:**
```
Spec: [[Layout Taxonomy System]]
Research: [[CSS Grid Patterns]]
```

### 3. Automated Daily Notes

**Prompt for daily note creation:**
```
Create today's daily note in Obsidian at "Daily/2026-02-07.md" with:
- Date header
- List of open Linear issues assigned to me
- Section for today's accomplishments
- Section for blockers/questions
```

### 4. Weekly Planning

**Prompt for Monday planning:**
```
Help me plan this week:

1. Pull all Linear issues with status "Todo" or "In Progress"
2. Check my Obsidian "Goals" note for quarterly objectives
3. Suggest which issues to prioritize this week
4. Create a weekly plan note in Obsidian
```

---

## Part 7: Troubleshooting

### Issue: "Command not found: npx"
**Fix:** Install Node.js from nodejs.org

### Issue: "Cannot read vault files"
**Fix:** Check vault path is absolute, not relative

### Issue: "Linear API key invalid"
**Fix:** 
1. Verify key in Linear settings
2. Check no extra spaces in config
3. Regenerate key if needed

### Issue: "Local REST API connection refused"
**Fix:**
1. Ensure Obsidian is running
2. Check plugin is enabled
3. Try HTTP URL (port 27123) instead of HTTPS
4. Disable SSL verification in config

### Issue: "AI can't see my MCP tools"
**Fix:**
1. Restart Claude Desktop after config changes
2. Check JSON syntax is valid
3. Look for errors in Claude logs

---

## Part 8: Security Considerations

⚠️ **Important Warnings:**

1. **Backup your vault** before enabling write access
2. **Use read-only mode** initially to test
3. **Review AI actions** before confirming (don't auto-approve)
4. **Store API keys securely** — use environment variables, not hardcoded
5. **Be careful with delete operations** — both servers have safeguards, but double-check

### Recommended Security Setup:

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "npx",
      "args": ["@mauricio.wolff/mcp-obsidian@latest", "/path/to/vault"],
      "autoApprove": []  // Don't auto-approve anything
    },
    "linear": {
      "command": "npx",
      "args": ["-y", "linear-mcp-server"],
      "env": {
        "LINEAR_API_KEY": "${LINEAR_API_KEY}"  // Use env var
      },
      "autoApprove": []
    }
  }
}
```

---

## Summary: Your New Workflow

**Before MCP:**
- Write notes in Obsidian
- Manually copy insights to Linear
- Lose context between thinking and doing
- Forget to update statuses

**After MCP:**
- Ask AI to sync Obsidian → Linear
- Automatic bidirectional linking
- Context preserved across systems
- AI suggests what to work on next

**Key Prompts to Save:**
1. "Create Linear issue from this Obsidian note"
2. "Summarize my week's work from Linear + Obsidian"
3. "Prepare standup update from my tasks and daily notes"
4. "Extract action items from meeting notes and create Linear issues"

---

## Next Steps

1. **Choose your Obsidian MCP approach:**
   - Simple: `mcp-obsidian` (filesystem)
   - Full integration: `obsidian-mcp-server` (REST API)

2. **Get Linear API key**

3. **Configure both in Claude Desktop**

4. **Test with simple prompts**

5. **Build your workflow templates**

6. **Iterate based on what works**

---

*Ready to implement? Start with the Obsidian MCP — it's the foundation. Then add Linear once that's working.*

*Questions or need help debugging? Just ask.*
