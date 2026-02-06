# Mission Control — Product Specification

## Overview

A unified command dashboard for Blake + SAKI collaboration. Fast, visual, no clutter. This is the central nervous system for human-AI workflow management.

**Core Philosophy:**
- **Glanceable:** Information at a glance, no digging required
- **Actionable:** Every widget supports direct interaction
- **Contextual:** Smart defaults based on time of day and recent activity
- **Minimal:** No feature bloat, only what matters

---

## Current State

The existing dashboard (`tools/mission-control/`) provides:
- Basic task management (local JSON storage)
- Memory system (browser localStorage)
- File upload/management
- Simple chat interface
- Tool shortcuts (search, browser, exec, image, TTS, canvas)
- System status display

**What's Missing:**
- External integrations (Todoist, GitHub)
- Agent orchestration and monitoring
- Project context and navigation
- Global command interface
- Searchable work history

---

## Enhanced Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  🚀 MISSION CONTROL                              [👤 Blake]  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ ACTIVE TASKS │ │ AGENT STATUS │ │   PROJECT CONTEXT    │ │
│  │  (Todoist)   │ │  (Gateway)   │ │   (GitHub + Files)   │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              COMMAND CENTER (Global Input)             │ │
│  │     Type anything: spawn agents, run commands, search  │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────┐ ┌────────────────────────────────┐ │
│  │   MEMORY BROWSER   │ │      ACTIVITY TIMELINE         │ │
│  │  (Searchable Log)  │ │   (What happened today)        │ │
│  └────────────────────┘ └────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Widget Specifications

### 1. Active Tasks Panel

**Purpose:** Real-time view of what's pending across all work streams.

**Data Source:** Todoist API + local task store

**Features:**
- **Overdue banner** — Red alert strip if anything is overdue
- **Today view** — Tasks due today (sorted by priority)
- **Quick actions** — Complete, reschedule, or delegate with one click
- **Source indicator** — Visual badge showing task origin (Todoist vs local)

**Visual Design:**
```
┌─────────────────────────────┐
│  ⚡ ACTIVE TASKS        ⚙️  │
├─────────────────────────────┤
│  🔴 2 OVERDUE               │
├─────────────────────────────┤
│  ☐ Review PR #234    [P1]   │
│     ↳ From: Todoist · GitHub│
│  ☑ Deploy hotfix     [P2]   │
│     ↳ From: local           │
│  ☐ Update docs       [P3]   │
│                             │
│  ─── TODAY ───              │
│  ☐ Call with Sarah [4:00pm] │
│  ☑ Morning standup          │
│                             │
│  ─── UPCOMING ───           │
│  ☐ Quarterly review (Tomorrow)
└─────────────────────────────┘
```

**Interactions:**
- Click checkbox → Toggle complete (syncs to Todoist)
- Right-click → Context menu: Reschedule, Edit, Delete
- Drag to reorder priority
- "+" button → Quick add task (defaults to today)

**API Integration:**
```javascript
// Todoist REST API v2
GET https://api.todoist.com/rest/v2/tasks
Headers: Authorization: Bearer ${TODOIST_TOKEN}

// Sync complete status back
POST https://api.todoist.com/rest/v2/tasks/${id}/close
```

---

### 2. Agent Status Panel

**Purpose:** Real-time visibility into what agents are doing and what they've done.

**Data Source:** OpenClaw Gateway + local agent log

**Features:**
- **Running agents** — Live list with progress indicators
- **Recent completions** — What finished in the last 24h
- **Quick spawn** — One-click agent templates
- **Logs access** — Deep link to full agent output

**Visual Design:**
```
┌─────────────────────────────┐
│  🤖 AGENT STATUS        ⚡  │
├─────────────────────────────┤
│  🟢 RUNNING (2)             │
│  ┌─────────────────────────┐│
│  │ 🔄 code-reviewer        ││
│  │    Processing PR #234   ││
│  │    ████████░░ 80%       ││
│  │    [View] [Cancel]      ││
│  ├─────────────────────────┤│
│  │ 🔄 web-scraper          ││
│  │    Research: AI trends  ││
│  │    ████░░░░░ 40%        ││
│  └─────────────────────────┘│
│                             │
│  ✅ RECENT (Last 24h)       │
│  ✓ deploy-agent · 2h ago    │
│  ✓ doc-updater · 5h ago     │
│  ✓ test-runner · 8h ago     │
│                             │
│  ── QUICK SPAWN ──          │
│  [📝 Review] [🔍 Research]  │
│  [🧪 Test] [🚀 Deploy]      │
└─────────────────────────────┘
```

**Interactions:**
- Click running agent → Expand/collapse details
- "View" → Opens agent output log
- "Cancel" → Sends kill signal via gateway
- Quick spawn buttons → Opens command center with pre-filled template

**Gateway Integration:**
```javascript
// OpenClaw Gateway API
GET /gateway/agents/status
Response: {
  running: [
    { id: "uuid", name: "code-reviewer", started: "ISO8601", progress: 80 }
  ],
  completed: [
    { id: "uuid", name: "deploy-agent", completed: "ISO8601", status: "success" }
  ]
}

// Spawn new agent
POST /gateway/agents/spawn
Body: { type: "research", prompt: "...", config: {} }
```

---

### 3. Project Context Panel

**Purpose:** Quick access to current project, recent commits, and file navigation.

**Data Source:** GitHub API + File system

**Features:**
- **Active project switcher** — Dropdown of recent projects
- **Recent commits** — Last 5 commits with author and message
- **Open PRs** — Pending pull requests needing attention
- **File tree** — Quick navigation to project files
- **Deep links** — Direct links to GitHub, VS Code, terminal

**Visual Design:**
```
┌─────────────────────────────┐
│  📁 PROJECT CONTEXT     🔗  │
├─────────────────────────────┤
│  ▼ openclaw/mission-control │
│                             │
│  📝 RECENT COMMITS          │
│  ┌─────────────────────────┐│
│  │ • a3f2d1 Update spec   ││
│  │   Blake · 10m ago      ││
│  │ • 9e8c2b Fix auth      ││
│  │   SAKI · 2h ago        ││
│  │ • 7b4a9c Add widgets   ││
│  │   Blake · 5h ago       ││
│  └─────────────────────────┘│
│                             │
│  🔀 OPEN PRs (2)            │
│  • #234 Feature/widget-design  👤
│  • #228 Bugfix/auth-error      ✓
│                             │
│  📂 FILES                   │
│  ▼ mission-control/         │
│    ├─ public/               │
│    ├─ server.js             │
│    └─ package.json          │
│                             │
│  [🐙 GitHub] [📝 VS Code]   │
└─────────────────────────────┘
```

**Interactions:**
- Project dropdown → Switch context (updates all panels)
- Commit → Click to view diff on GitHub
- PR → Click to open PR page
- File → Click to open in editor
- Deep links → Open external tools

**API Integration:**
```javascript
// GitHub API
GET https://api.github.com/repos/{owner}/{repo}/commits
Headers: Authorization: token ${GITHUB_TOKEN}

GET https://api.github.com/repos/{owner}/{repo}/pulls?state=open
```

---

### 4. Command Center

**Purpose:** Universal input for spawning agents, running commands, and searching.

**Data Source:** OpenClaw Gateway + Command parser

**Features:**
- **Smart input** — Natural language or slash commands
- **Autocomplete** — Suggests agents, commands, projects
- **History** — Recent commands with up-arrow recall
- **Shortcuts** — `/review`, `/deploy`, `/research`, `/find`

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────┐
│  ⚡ COMMAND CENTER                                           │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │  >  _                                                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  SUGGESTIONS:                                               │
│  /review [file|pr]  — Code review agent                     │
│  /research [topic]  — Web research agent                    │
│  /deploy [env]      — Deploy to staging/prod                │
│  /find [query]      — Search memory and files               │
│                                                             │
│  RECENT:                                                    │
│  > review PR #234                                           │
│  > research "AI coding agents"                              │
│  > deploy staging                                           │
└─────────────────────────────────────────────────────────────┘
```

**Commands:**
| Command | Action | Example |
|---------|--------|---------|
| `/review [target]` | Spawn code review agent | `/review PR #234` |
| `/research [query]` | Spawn research agent | `/research "React 19 features"` |
| `/deploy [env]` | Deploy to environment | `/deploy staging` |
| `/find [query]` | Search memory + files | `/find "auth middleware"` |
| `/agent [type]` | Spawn specific agent | `/agent code-writer` |
| `>` prefix | Run shell command | `> npm test` |

**Interactions:**
- Type → Shows autocomplete suggestions
- Enter → Execute command
- Up/Down → Navigate history
- Tab → Accept autocomplete
- Escape → Clear input

**Gateway Integration:**
```javascript
// Parse command and route appropriately
// Agents → POST /gateway/agents/spawn
// Commands → POST /gateway/exec (via websocket)
// Search → Local memory index + file system
```

---

### 5. Memory Browser

**Purpose:** Searchable archive of all work, decisions, and context.

**Data Source:** Memory files (`memory/YYYY-MM-DD.md`, `MEMORY.md`) + Agent logs

**Features:**
- **Full-text search** — Across all memory files and agent logs
- **Date filtering** — Today, yesterday, this week, custom range
- **Tag cloud** — Quick filter by common topics
- **Source filtering** — Agent outputs, manual notes, system events

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────┐
│  🧠 MEMORY BROWSER                                    🔍    │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │  🔍 Search memories...  [Today ▼] [#auth #deploy]     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  TODAY · 5 results                                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 📄 2025-02-05.md · 2:34 PM                         │    │
│  │ > Decided to use **Todoist API v2** for task sync  │    │
│  │   Tags: #decision #api                             │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ 🤖 agent:code-reviewer · 10:30 AM                  │    │
│  │ > Reviewed PR #234: 3 issues found, 2 suggestions  │    │
│  │   [View Full Log]                                  │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ 📝 MEMORY.md · Updated weekly                      │    │
│  │ > Blake prefers dark themes, minimal dashboards    │    │
│  │   Tags: #preferences #ui                           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Load more...                                               │
└─────────────────────────────────────────────────────────────┘
```

**Interactions:**
- Search → Real-time filtered results
- Click result → Expand full content inline
- Tags → Click to filter by tag
- Date filter → Dropdown: Today, Yesterday, Week, Month, Custom

**Search Index:**
```javascript
// Build search index from:
// - memory/*.md files
// - MEMORY.md
// - agent logs (recent)
// - System events

// Simple in-memory index with fuse.js or similar
const index = {
  entries: [
    { source: "memory", date: "2025-02-05", content: "...", tags: ["#decision"] },
    { source: "agent", agent: "code-reviewer", content: "...", tags: [] }
  ]
};
```

---

### 6. Activity Timeline (Bonus Widget)

**Purpose:** Visual summary of what happened today for quick review.

**Data Source:** Aggregated from all other widgets

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────┐
│  📊 ACTIVITY TODAY                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───┐                                                      │
│  │ 9 │ ──☕ Morning coffee & standup                        │
│  └───┘     ✓ 3 tasks completed                             │
│            ✓ Agent: daily-summary ran                      │
│  ┌────┐                                                     │
│  │ 12 │ ──🍕 Lunch break                                   │
│  └────┘                                                     │
│  ┌────┐                                                     │
│  │ 14 │ ──💻 Deep work                                     │
│  └────┘    ✓ PR #234 reviewed by agent                     │
│            ✓ 2 commits pushed                              │
│  ┌────┐                                                     │
│  │ 17 │ ──🎯 Wrap up                                       │
│  └────┘    ☐ 2 tasks remaining                             │
│                                                             │
│  ─────────────────────────────────────────                  │
│  8 tasks · 3 commits · 2 agents · 4 hours focused          │
└─────────────────────────────────────────────────────────────┘
```

---

## User Flows

### Morning Routine

```
1. Open Mission Control
2. See: Overdue tasks highlighted in red
3. See: "Agent: daily-summary" completed at 6:00 AM
4. Review completed agent outputs in Memory Browser
5. Prioritize today's tasks in Active Tasks
6. Use Command Center: "> /research today's priorities"
```

### Deep Work Session

```
1. Switch Project Context to current focus
2. Command Center: "/review current branch"
3. Agent runs, see progress in Agent Status
4. Review results in Memory Browser
5. Iterate: edit code, commit, agent reviews
```

### Delegation Flow

```
1. Command Center: type task naturally
   "Research the latest React Server Components"
2. System suggests: "/research React Server Components"
3. Confirm → Agent spawns
4. Watch progress in Agent Status
5. Notification when complete
6. Review output in Memory Browser
```

### Evening Review

```
1. Activity Timeline shows day's summary
2. Memory Browser: filter "Today"
3. See: decisions made, agents run, commits pushed
4. Active Tasks: reschedule incomplete items
5. Command Center: "> /daily-summary tomorrow's focus"
```

---

## Technical Architecture

### Backend Extensions

```
tools/mission-control/
├── server.js                 # Existing Express server
├── lib/
│   ├── todoist.js           # Todoist API client
│   ├── github.js            # GitHub API client
│   ├── gateway.js           # OpenClaw Gateway client
│   ├── memory-index.js      # Memory search indexer
│   └── agents.js            # Agent management
├── routes/
│   ├── api.js               # Existing API routes
│   ├── tasks.js             # Enhanced task routes
│   ├── agents.js            # Agent management routes
│   ├── projects.js          # Project context routes
│   └── memory.js            # Memory search routes
└── public/
    ├── index.html           # Enhanced dashboard
    ├── app.js               # Enhanced client app
    └── styles.css           # Enhanced styles
```

### API Endpoints

```javascript
// Tasks (Todoist Integration)
GET    /api/tasks?source=todoist|local|all
POST   /api/tasks/sync      // Sync with Todoist
PUT    /api/tasks/:id/complete

// Agents
GET    /api/agents/status   // Running + recent
POST   /api/agents/spawn    // Spawn new agent
POST   /api/agents/:id/cancel

// Projects
GET    /api/projects        // List recent projects
GET    /api/projects/:id/context  // Commits, PRs, files

// Memory
GET    /api/memory/search?q=query&from=date&to=date
GET    /api/memory/tags     // All tags for cloud

// Command
POST   /api/command/parse   // Parse and route command
```

### Configuration

```json
// config.json
{
  "todoist": {
    "token": "${TODOIST_API_TOKEN}",
    "projectId": "project_for_work"
  },
  "github": {
    "token": "${GITHUB_TOKEN}",
    "defaultOrg": "openclaw"
  },
  "gateway": {
    "url": "http://localhost:8080",
    "websocket": "ws://localhost:8080/ws"
  },
  "ui": {
    "theme": "auto",
    "defaultProject": "mission-control",
    "refreshInterval": 30
  }
}
```

---

## Implementation Priority

### Phase 1: Foundation (Week 1)
1. **Command Center** — Universal input, slash commands
2. **Enhanced Task Panel** — Todoist integration
3. **Basic Agent Status** — Gateway connection, list running

### Phase 2: Context (Week 2)
4. **Project Context Panel** — GitHub integration, file browser
5. **Memory Browser** — Search indexer, basic search
6. **Activity Timeline** — Aggregate from other sources

### Phase 3: Polish (Week 3)
7. **Smart defaults** — Time-based widget ordering
8. **Keyboard shortcuts** — Power user features
9. **Mobile responsive** — Tablet/phone support
10. **Notifications** — Desktop notifications for agents

---

## Wireframe Summary

### Desktop Layout (≥1200px)
```
┌──────────────────────────────────────────────────────────────┐
│ Header: Mission Control · Status · Theme · Profile          │
├───────────────────┬───────────────────┬──────────────────────┤
│                   │                   │                      │
│  ACTIVE TASKS     │  AGENT STATUS     │  PROJECT CONTEXT     │
│  (Fixed height)   │  (Fixed height)   │  (Fixed height)      │
│                   │                   │                      │
├───────────────────┴───────────────────┴──────────────────────┤
│                     COMMAND CENTER                            │
│                    (Full width bar)                          │
├───────────────────────────────┬──────────────────────────────┤
│                               │                              │
│  MEMORY BROWSER               │  ACTIVITY TIMELINE           │
│  (Scrollable)                 │  (Scrollable)                │
│                               │                              │
└───────────────────────────────┴──────────────────────────────┘
```

### Tablet Layout (768px - 1199px)
```
┌─────────────────────────────────┐
│ Header                          │
├────────────────┬────────────────┤
│ ACTIVE TASKS   │ AGENT STATUS   │
├────────────────┴────────────────┤
│ PROJECT CONTEXT                 │
├─────────────────────────────────┤
│ COMMAND CENTER                  │
├─────────────────────────────────┤
│ MEMORY BROWSER                  │
└─────────────────────────────────┘
```

### Mobile Layout (<768px)
```
┌─────────────────┐
│ Header          │
├─────────────────┤
│ ▼ Active Tasks  │ ← Collapsible panels
│ ▶ Agent Status  │
│ ▶ Project       │
├─────────────────┤
│ Command Center  │
├─────────────────┤
│ ▼ Memory        │
└─────────────────┘
```

---

## Success Metrics

- **Task visibility:** All Todoist tasks visible within 2 seconds of page load
- **Agent spawn time:** New agent spawned within 3 seconds of command
- **Search speed:** Memory search results in <500ms
- **Daily usage:** Blake opens dashboard at least twice daily
- **Agent delegation:** 50%+ of repetitive tasks delegated to agents

---

## Future Enhancements

1. **Voice commands** — "Hey SAKI, review my code"
2. **Calendar integration** — See meetings alongside tasks
3. **Smart suggestions** — "You have 30 min free, want to review PRs?"
4. **Team view** — See what other team members are working on
5. **Analytics** — Weekly productivity reports

---

*Document Version: 1.0*
*Created: 2025-02-05*
*For: Blake + SAKI Collaboration*
