# Agent Studio v2 — Design Specification

## Visual Direction: Linear-Inspired Dark Mode

### Color System (Atomic Tokens)

```
/* Backgrounds */
--bg-base: #0D0D0D;           /* Deepest black */
--bg-elevated: #141414;       /* Card/surface bg */
--bg-hover: #1A1A1A;          /* Hover states */
--bg-active: #1F1F1F;         /* Active/selected */
--bg-overlay: rgba(0,0,0,0.8); /* Modals/backdrops */

/* Borders & Dividers */
--border-subtle: rgba(255,255,255,0.06);
--border-default: rgba(255,255,255,0.1);
--border-strong: rgba(255,255,255,0.15);
--border-focus: rgba(255,255,255,0.3);

/* Text */
--text-primary: #FFFFFF;
--text-secondary: rgba(255,255,255,0.65);
--text-tertiary: rgba(255,255,255,0.4);
--text-disabled: rgba(255,255,255,0.25);

/* Accents (Silver/Gradient family) */
--accent-primary: #E8E8E8;    /* Bright silver */
--accent-secondary: #A0A0A0;  /* Medium gray */
--accent-muted: #666666;      /* Dark gray */

/* Gradient Accents */
--gradient-silver: linear-gradient(135deg, #F5F5F5 0%, #C0C0C0 50%, #808080 100%);
--gradient-subtle: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%);
--gradient-card: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%);

/* Status Colors (Muted) */
--status-running: #10B981;    /* Emerald - muted */
--status-idle: #6B7280;       /* Gray */
--status-error: #EF4444;      /* Red - muted */
--status-warning: #F59E0B;    /* Amber */
```

### Typography Scale (Inter + Mono)

```
Font Family:
- Primary: 'Inter', system-ui, sans-serif
- Mono: 'JetBrains Mono', 'Fira Code', monospace

Type Scale:
--text-2xs: 11px / 16px / 0.01em;   /* Timestamps */
--text-xs: 12px / 18px / 0;         /* Labels, tags */
--text-sm: 13px / 20px / -0.01em;   /* Body small */
--text-base: 14px / 22px / -0.01em; /* Body */
--text-lg: 16px / 24px / -0.02em;   /* Subheadings */
--text-xl: 20px / 28px / -0.02em;   /* Section titles */
--text-2xl: 24px / 32px / -0.03em;  /* Page titles */

Weights: 400 (regular), 500 (medium), 600 (semibold)
```

### Spacing Scale (4px base)

```
--space-0: 0;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### Component Primitives

**Buttons:**
- Primary: bg-elevated, border-default, text-primary, hover:bg-hover
- Secondary: transparent bg, border-subtle, text-secondary
- Ghost: no border, text-secondary, hover:bg-hover
- Icon buttons: 32x32px, rounded-lg, hover:bg-hover

**Cards:**
- Background: bg-elevated
- Border: 1px solid border-default
- Border-radius: 8px
- Shadow: none (flat design)
- Hover: border-strong transition

**Inputs:**
- Background: bg-base
- Border: 1px solid border-default
- Focus: border-focus, subtle ring
- Placeholder: text-tertiary

---

## Layout Architecture

### Navigation (Left Sidebar)

```
Width: 240px
Background: bg-base
Border-right: 1px solid border-subtle

Sections:
1. Logo/Brand (48px height)
2. Primary Nav (collapsible groups)
3. Agent Roster (scrollable)
4. Create Button (sticky bottom)

Nav Items:
- Icon (20x20px) + Label + Badge/Count
- Active state: bg-elevated, border-l-2 border-white
- Hover: bg-hover
```

### Main Content Area

```
Background: bg-base
Padding: space-6 (24px)

Header (per view):
- Left: Title + Breadcrumb + Context
- Right: Actions (buttons, search, filters)
- Height: 64px
```

### Views

**1. Dashboard (Home)**
```
Grid Layout:
┌─────────────────────────────────────────────────────────┐
│  Stats Row (4 cards)                                     │
├──────────────────┬──────────────────────────────────────┤
│  Active Agents   │  Recent Activity Feed                │
│  (List/Grid)     │  (Scrollable)                        │
├──────────────────┴──────────────────────────────────────┤
│  Quick Actions: Create Agent | New Task | View Logs     │
└─────────────────────────────────────────────────────────┘
```

**2. Agents Gallery (Primary View)**
```
Layout: Responsive Grid (auto-fill, minmax(280px, 1fr))
Gap: space-4

Agent Card:
┌─────────────────────────┐
│ [Status] Name        ⋮  │
│ Role/Type               │
│ ┌─────────────────┐     │
│ │  Activity Spark │     │
│ └─────────────────┘     │
│ 12 tasks | 3 active     │
│ [Chat] [Spawn] [Edit]   │
└─────────────────────────┘

Plus Card (Create New):
┌─────────────────────────┐
│         +               │
│   Create New Agent      │
└─────────────────────────┘
```

**3. Agent Detail / Chat View**
```
Layout: Split Pane
┌─────────────────────────────────────────────────────────┐
│ Agent Header (Avatar, Name, Status, Actions)            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Chat History                                          │
│  ┌──────────┐                                         │
│  │ User msg │                                         │
│  └──────────┘                                         │
│            ┌──────────────────┐                       │
│            │ Agent response   │                       │
│            └──────────────────┘                       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ [Attach] Message Input              [Send]             │
└─────────────────────────────────────────────────────────┘
```

**4. Kanban Board**
```
Layout: Horizontal scroll, 4 columns
Column Width: 320px
Gap: space-4

Column:
┌─────────────────┐
│ Header          │
│ ─────────────── │
│ ┌─────────────┐ │
│ │ Task Card   │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │ Task Card   │ │
│ └─────────────┘ │
│ + Add Task      │
└─────────────────┘

Drag & Drop: Reorder within column, move between columns
```

**5. Logs / Activity Stream**
```
Layout: Full-width table/list
Columns: Timestamp | Type | Agent | Message | Status

Filter Bar: Date Range | Agent | Type | Search
Real-time: New entries append with slide animation
```

**6. Cron Jobs / Automations**
```
Layout: List with expandable rows

Job Row:
┌───────────────────────────────────────────────────────┐
│ ● Job Name                    [Edit] [Run Now] [⋮]   │
│   Every 6 hours • Last run: 2m ago • Next: 4h         │
│   ┌───────────────────────────────────────────────┐   │
│   │ Recent Runs: ✓ ✓ ✓ ✗ ✓ (sparkline)            │   │
│   └───────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────┘
```

---

## Interactions & Animations

**Micro-interactions:**
- Hover transitions: 150ms ease-out
- Focus rings: 0 0 0 2px rgba(255,255,255,0.1)
- Button press: scale(0.98)
- Card lift: translateY(-2px) on hover

**Page Transitions:**
- Fade + slight slide: 200ms ease-out
- Stagger list items: 30ms delay each

**Real-time Updates:**
- New activity: slide in from top
- Status changes: color fade transition
- Progress bars: smooth width animation

---

## OpenClaw API Integration Plan

### Backend Architecture

```
┌─────────────────────────────────────────┐
│  Agent Studio Frontend (Next.js)       │
│  - React Server Components             │
│  - Real-time WebSocket                 │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  API Routes (/app/api/*)               │
│  - /agents/* (CRUD + spawn)            │
│  - /sessions/* (chat + logs)           │
│  - /cron/* (jobs + schedules)          │
│  - /tasks/* (kanban board)             │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  OpenClaw Gateway                      │
│  - sessions_spawn                      │
│  - sessions_list                       │
│  - sessions_send                       │
│  - sessions_history                    │
│  - cron (list/add/update/remove/run)   │
└─────────────────────────────────────────┘
```

### Data Models

```typescript
// Agent Definition
interface Agent {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  systemPrompt: string;
  model: 'kimi-k2.5' | 'claude-opus' | 'claude-sonnet';
  capabilities: string[];
  status: 'idle' | 'running' | 'error';
  createdAt: Date;
  updatedAt: Date;
  stats: {
    totalTasks: number;
    completedTasks: number;
    avgResponseTime: number;
  };
}

// Active Session (Spawned Agent)
interface AgentSession {
  id: string;
  agentId: string;
  sessionKey: string;
  label: string;
  status: 'active' | 'completed' | 'error';
  startedAt: Date;
  lastActivity: Date;
  messages: Message[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    toolCalls?: ToolCall[];
    latency?: number;
  };
}

// Task (Kanban)
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'backlog' | 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string; // agentId
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  tags: string[];
}

// Cron Job
interface CronJob {
  id: string;
  name: string;
  description?: string;
  schedule: {
    type: 'cron' | 'interval' | 'once';
    expression: string; // cron expr or interval
    timezone: string;
  };
  payload: {
    agentId: string;
    message: string;
    model?: string;
  };
  enabled: boolean;
  lastRun?: {
    timestamp: Date;
    status: 'success' | 'error';
    output?: string;
  };
  nextRun?: Date;
  runHistory: JobRun[];
}
```

### API Endpoints

```typescript
// Agents
GET    /api/agents              // List all agents
POST   /api/agents              // Create agent
GET    /api/agents/:id          // Get agent details
PATCH  /api/agents/:id          // Update agent
DELETE /api/agents/:id          // Delete agent
POST   /api/agents/:id/spawn    // Spawn new session

// Sessions (Chat)
GET    /api/sessions            // List active sessions
GET    /api/sessions/:id        // Get session with messages
POST   /api/sessions/:id/send   // Send message
POST   /api/sessions/:id/close  // End session

// Tasks (Kanban)
GET    /api/tasks               // All tasks (with filters)
POST   /api/tasks               // Create task
PATCH  /api/tasks/:id           // Update task (incl. status)
DELETE /api/tasks/:id           // Delete task
POST   /api/tasks/reorder       // Reorder kanban

// Cron Jobs
GET    /api/cron                // List jobs
POST   /api/cron                // Create job
GET    /api/cron/:id            // Job details
PATCH  /api/cron/:id            // Update job
DELETE /api/cron/:id            // Remove job
POST   /api/cron/:id/run        // Trigger now
POST   /api/cron/:id/toggle     // Enable/disable

// Logs / Activity
GET    /api/logs                // Activity stream
GET    /api/logs/sessions/:id   // Session-specific logs
```

---

## Implementation Phases

### Phase 1: Design System (2 hours)
- [ ] Set up Tailwind config with custom tokens
- [ ] Create base components (Button, Card, Input, Badge)
- [ ] Build layout shell (Sidebar, Header, Main)

### Phase 2: UI Views (4 hours)
- [ ] Dashboard view
- [ ] Agents gallery + cards
- [ ] Agent detail / chat interface
- [ ] Kanban board
- [ ] Logs / activity stream
- [ ] Cron jobs list

### Phase 3: Backend API (4 hours)
- [ ] Database schema (SQLite/PostgreSQL)
- [ ] API route handlers
- [ ] OpenClaw gateway integration
- [ ] WebSocket for real-time updates

### Phase 4: Real-time & Polish (2 hours)
- [ ] WebSocket connection
- [ ] Live activity feed
- [ ] Session persistence
- [ ] Error handling & empty states

---

## Key Design Decisions

1. **No fake data ever** — Everything must connect to real OpenClaw APIs
2. **Real-time first** — WebSocket for live updates, not polling
3. **Linear aesthetic** — Sharp, minimal, purposeful animations
4. **Keyboard shortcuts** — `cmd+k` command palette, `j/k` navigation
5. **Mobile responsive** — Sidebar collapses, cards reflow

---

## Deliverables

1. **Figma-style spec** (this document)
2. **Working Next.js app** with:
   - Complete design system
   - All 6 views implemented
   - Real OpenClaw API integration
   - SQLite database for persistence
   - Real-time WebSocket updates

Ready to build?
