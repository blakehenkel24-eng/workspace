# Agent Studio — Technical Architecture Spec

> A real-time control center for Blake's OpenClaw infrastructure. Integrates with existing systems, doesn't replace them.

---

## 1. Recommended Tech Stack

### Core Philosophy
**Lean on existing infrastructure.** Blake already runs Next.js + Supabase + OpenClaw. The studio should extend these, not add new backends.

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                        NEXT.JS 14 APP                           │
│  ┌─────────────┬─────────────┬─────────────┬─────────────────┐  │
│  │  Dashboard  │  Cron View  │  GTM Viz    │  Agent Fleet    │  │
│  └─────────────┴─────────────┴─────────────┴─────────────────┘  │
│                         (Server Components)                     │
├─────────────────────────────────────────────────────────────────┤
│                    WEBSOCKET REAL-TIME LAYER                    │
│              (Socket.io or PartyKit for events)                 │
├─────────────────────────────────────────────────────────────────┤
│                    SUPABASE (existing)                          │
│  ┌─────────────┬─────────────┬─────────────┬─────────────────┐  │
│  │  cron_jobs  │ gtm_outputs │agent_sessions│  metrics      │  │
│  └─────────────┴─────────────┴─────────────┴─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    OPENCLAW GATEWAY                             │
│  ┌─────────────┬─────────────┬─────────────┬─────────────────┐  │
│  │   Cron.d    │   Skills    │  Sessions   │  Gateway API    │  │
│  └─────────────┴─────────────┴─────────────┴─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14 (App Router) | Blake's existing stack, server components for data fetching |
| **Styling** | Tailwind + shadcn/ui | Already used in SlideTheory, consistent design system |
| **Real-time** | PartyKit (Cloudflare) | Purpose-built for WebSockets, cheaper than Pusher, serverless |
| **Database** | Supabase PostgreSQL | Existing infrastructure, real-time subscriptions |
| **Auth** | Supabase Auth | Already configured, RLS policies |
| **File Storage** | Local filesystem + GCS/S3 | GTM outputs from `/gtm/`, synced to DB |
| **API Layer** | Next.js API Routes + Edge Functions | Reuse SlidePatterns, minimal cold start |
| **Gateway Bridge** | Node.js agent (local daemon) | Polls OpenClaw, pushes events via WebSocket |

### Alternative: Zero-Infrastructure Path

If Blake wants to ship in a weekend without new services:

```
Next.js ←── Supabase Realtime ──→ Postgres (triggers + changes)
              ↑
         Local Node.js watcher (pm2)
              ↑
         OpenClaw gateway (file + cron monitoring)
```

This uses Supabase's built-in Realtime instead of WebSocket servers.

---

## 2. Data Models

### Core Entities

#### `cron_jobs` — Job Definitions & Status
```sql
create table cron_jobs (
  id uuid primary key default gen_random_uuid(),
  name text not null,                    -- "Morning Market Intel"
  schedule text not null,                -- "0 8 * * *" (cron expression)
  timezone text default 'America/Chicago',
  command text not null,                 -- Script/command to run
  enabled boolean default true,
  
  -- Metadata
  category text,                         -- "gtm", "health", "content"
  description text,
  
  -- Status (updated by gateway bridge)
  last_run_at timestamptz,
  last_status text,                      -- "success", "failed", "running"
  last_duration_ms integer,
  last_error text,
  
  -- Run history (last 10 runs embedded for quick access)
  recent_runs jsonb default '[]',
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable realtime
alter publication supabase_realtime add table cron_jobs;
```

#### `cron_runs` — Detailed Execution Log
```sql
create table cron_runs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references cron_jobs(id),
  
  -- Execution details
  started_at timestamptz not null,
  finished_at timestamptz,
  status text not null,                  -- "running", "completed", "failed", "timeout"
  exit_code integer,
  
  -- Outputs
  stdout text,
  stderr text,
  output_files text[],                   -- Paths to GTM output files
  
  -- Performance
  duration_ms integer,
  memory_peak_mb integer,
  
  -- Linking
  trigger_type text default 'scheduled', -- "scheduled", "manual", "retry"
  triggered_by uuid references auth.users(id),
  
  created_at timestamptz default now()
);

-- Indexes for performance
create index idx_cron_runs_job_time on cron_runs(job_id, started_at desc);
create index idx_cron_runs_status on cron_runs(status) where status = 'running';
```

#### `gtm_outputs` — Marketing Content Queue
```sql
create table gtm_outputs (
  id uuid primary key default gen_random_uuid(),
  
  -- Content metadata
  title text not null,
  content_type text not null,            -- "blog_post", "social_thread", "newsletter", "competitor_brief"
  status text default 'draft',           -- "draft", "pending_review", "approved", "published", "archived"
  
  -- Content body (markdown)
  content_md text,
  content_html text,                     -- Rendered version
  
  -- Source tracking
  source_job_id uuid references cron_jobs(id),
  source_run_id uuid references cron_runs(id),
  source_file_path text,                 -- Original file path in /gtm/
  
  -- Review workflow
  priority integer default 5,            -- 1-10, higher = more urgent
  created_by uuid references auth.users(id),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  
  -- Scheduling
  scheduled_for timestamptz,
  published_at timestamptz,
  published_url text,
  
  -- Metrics (populated post-publish)
  metrics jsonb default '{}',            -- {views: 0, engagement: 0, clicks: 0}
  
  -- Tags and search
  tags text[],
  search_vector tsvector,                -- For full-text search
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Full-text search index
create index idx_gtm_outputs_search on gtm_outputs using gin(search_vector);

-- Trigger to auto-update search vector
create or replace function gtm_search_vector()
returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.content_md, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.tags, ' '), '')), 'C');
  return new;
end;
$$ language plpgsql;

create trigger gtm_search_trigger
  before insert or update on gtm_outputs
  for each row execute function gtm_search_vector();

alter publication supabase_realtime add table gtm_outputs;
```

#### `agent_sessions` — Live Agent Activity
```sql
create table agent_sessions (
  id uuid primary key default gen_random_uuid(),
  
  -- Session identification
  agent_name text not null,              -- "market-research-agent"
  agent_type text not null,              -- "swarm", "singleton", "subagent"
  session_key text unique,               -- OpenClaw session identifier
  
  -- Status
  status text default 'idle',            -- "idle", "running", "paused", "error", "completed"
  
  -- Task details
  task_description text,
  task_context jsonb default '{}',       -- Arbitrary context passed to agent
  
  -- Relationships
  parent_session_id uuid references agent_sessions(id), -- For subagents
  swarm_id uuid,                         -- Groups swarm members
  
  -- Progress tracking
  progress_percent integer default 0,
  progress_message text,
  
  -- Timestamps
  started_at timestamptz default now(),
  last_activity_at timestamptz default now(),
  completed_at timestamptz,
  
  -- Outputs
  outputs jsonb default '[]',            -- Array of {type, content, timestamp}
  final_output text,
  
  -- Performance
  token_usage jsonb default '{}',        -- {input: 0, output: 0, cost: 0}
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_agent_sessions_status on agent_sessions(status) where status in ('running', 'idle');
create index idx_agent_sessions_swarm on agent_sessions(swarm_id);

alter publication supabase_realtime add table agent_sessions;
```

#### `agent_logs` — Stream of Agent Events
```sql
create table agent_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references agent_sessions(id),
  
  -- Log entry
  level text not null,                   -- "debug", "info", "warn", "error", "thought"
  message text not null,
  
  -- Structured data
  metadata jsonb default '{}',
  
  -- Tool usage (if applicable)
  tool_name text,
  tool_input jsonb,
  tool_output jsonb,
  tool_duration_ms integer,
  
  timestamp timestamptz default now()
);

create index idx_agent_logs_session on agent_logs(session_id, timestamp desc);

-- Auto-cleanup old logs (keep 30 days)
create or replace function cleanup_old_agent_logs()
returns void as $$
begin
  delete from agent_logs where timestamp < now() - interval '30 days';
end;
$$ language plpgsql;
```

#### `system_metrics` — Health & Performance
```sql
create table system_metrics (
  id uuid primary key default gen_random_uuid(),
  
  metric_type text not null,             -- "gateway_status", "disk_usage", "cron_success_rate"
  metric_name text not null,
  value numeric not null,
  unit text,                             -- "percent", "bytes", "ms", "count"
  
  -- Context
  metadata jsonb default '{}',
  
  timestamp timestamptz default now()
);

create index idx_system_metrics_time on system_metrics(metric_type, timestamp desc);
```

---

## 3. API Endpoints

### REST API (Next.js API Routes)

#### Cron Jobs
```typescript
// GET /api/cron/jobs
// List all cron jobs with last run status
interface Response {
  jobs: Array<{
    id: string;
    name: string;
    schedule: string;
    enabled: boolean;
    lastRun: {
      status: 'success' | 'failed' | 'running';
      at: string;
      duration: number;
    } | null;
    nextRun: string; // Computed from schedule
  }>;
}

// POST /api/cron/jobs/:id/trigger
// Manually trigger a cron job
interface Response {
  runId: string;
  status: 'started';
}

// GET /api/cron/jobs/:id/runs
// Get run history for a job
interface Response {
  runs: Array<{
    id: string;
    startedAt: string;
    status: string;
    duration: number;
    outputFiles: string[];
  }>;
}

// GET /api/cron/runs/:id/logs
// Stream logs for a specific run (SSE)
```

#### GTM Outputs
```typescript
// GET /api/gtm/outputs
// List content queue with filtering
interface QueryParams {
  status?: 'draft' | 'pending_review' | 'approved' | 'published';
  type?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// GET /api/gtm/outputs/:id
// Get full content with rendered HTML

// PATCH /api/gtm/outputs/:id
// Update status, schedule, or content
interface Body {
  status?: string;
  scheduledFor?: string;
  content_md?: string;
  priority?: number;
}

// POST /api/gtm/outputs/:id/publish
// Mark as published with URL
```

#### Agent Sessions
```typescript
// GET /api/agents/sessions
// List active and recent sessions
interface QueryParams {
  status?: 'running' | 'idle' | 'completed' | 'error';
  type?: string;
  swarmId?: string;
}

// GET /api/agents/sessions/:id
// Get session details with recent logs

// GET /api/agents/sessions/:id/logs
// Stream logs (SSE)

// POST /api/agents/swarm/spawn
// Spawn a new agent swarm
interface Body {
  task: string;
  agents: string[]; // Agent types to spawn
  context?: Record<string, any>;
}

// POST /api/agents/sessions/:id/cancel
// Cancel a running session
```

#### System Health
```typescript
// GET /api/health
// Overall system status
interface Response {
  gateway: 'connected' | 'disconnected';
  cronHealth: {
    last24hSuccessRate: number;
    failedJobs: string[];
  };
  diskUsage: {
    gtmDir: number; // percent
    workspaceDir: number;
  };
  activeAgents: number;
}

// GET /api/metrics
// Time-series metrics for dashboard charts
```

### Real-Time Events (WebSocket/SSE)

#### Event Types
```typescript
// Client subscribes to channels:
// - "cron:all" — All cron job updates
// - "cron:{jobId}" — Specific job updates  
// - "agents:all" — All agent activity
// - "agents:{sessionId}" — Specific session
// - "gtm:queue" — Content queue changes

interface ServerEvents {
  // Cron job started/finished
  'cron.run.started': {
    jobId: string;
    runId: string;
    startedAt: string;
  };
  'cron.run.completed': {
    jobId: string;
    runId: string;
    status: 'success' | 'failed';
    duration: number;
    outputFiles?: string[];
  };
  
  // Agent activity
  'agent.session.created': { sessionId: string; agentName: string };
  'agent.session.updated': { sessionId: string; status: string; progress: number };
  'agent.log': { sessionId: string; level: string; message: string; timestamp: string };
  
  // GTM updates
  'gtm.output.created': { outputId: string; title: string; type: string };
  'gtm.output.status_changed': { outputId: string; status: string };
}
```

---

## 4. Integration Points with OpenClaw Gateway

### Gateway Bridge Agent

A lightweight Node.js daemon that connects OpenClaw to the studio:

```typescript
// bridge/index.ts — Runs as pm2 process alongside OpenClaw

import { watch } from 'chokidar';
import { createClient } from '@supabase/supabase-js';
import { WebSocketClient } from './ws-client';

class GatewayBridge {
  private supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
  private ws = new WebSocketClient();
  
  async start() {
    // 1. Watch GTM directory for new outputs
    this.watchGtmDirectory();
    
    // 2. Poll OpenClaw cron status
    this.pollCronStatus();
    
    // 3. Monitor agent sessions via gateway API
    this.monitorAgentSessions();
    
    // 4. Listen for gateway events
    this.subscribeToGateway();
  }
  
  private watchGtmDirectory() {
    watch('/home/node/.openclaw/workspace/gtm/**/*', {
      ignoreInitial: true
    }).on('add', async (path) => {
      // Parse file, extract metadata, upsert to gtm_outputs
      const output = await this.parseGtmFile(path);
      await this.supabase.from('gtm_outputs').upsert(output);
      
      // Notify connected clients
      this.ws.broadcast('gtm.output.created', output);
    });
  }
  
  private async pollCronStatus() {
    setInterval(async () => {
      // Read OpenClaw cron.d files
      const jobs = await this.readCronDefinitions();
      // Check last run status from logs
      const statuses = await this.checkRunStatuses();
      
      // Update database
      await this.syncCronJobs(jobs, statuses);
    }, 30000); // Every 30 seconds
  }
  
  private async monitorAgentSessions() {
    // Connect to gateway's session stream
    // Update agent_sessions table on changes
  }
}
```

### Integration Points

| OpenClaw Component | Integration Method | Data Flow |
|-------------------|-------------------|-----------|
| **Cron.d files** | File watcher + polling | Detect job definitions, sync schedule changes |
| **Cron execution logs** | Parse stdout/stderr files | Create cron_runs records, update job status |
| **GTM output directory** | File watcher (chokidar) | Auto-import new content to review queue |
| **Gateway sessions** | Gateway API polling | Track agent_session lifecycle |
| **Gateway events** | WebSocket/API stream | Real-time agent logs, progress updates |
| **Skill execution** | Skill hooks | Track tool usage, token consumption |

### Security Model

```
┌─────────────────────────────────────────┐
│  Agent Studio (Next.js)                 │
│  ┌─────────────────────────────────┐    │
│  │  Only Blake can access          │    │
│  │  (Supabase Auth, single user)   │    │
│  └─────────────────────────────────┘    │
└─────────────────┬───────────────────────┘
                  │ (Supabase row-level security)
┌─────────────────▼───────────────────────┐
│  Gateway Bridge (localhost only)        │
│  ┌─────────────────────────────────┐    │
│  │  No inbound internet access     │    │
│  │  Writes to Supabase only        │    │
│  └─────────────────────────────────┘    │
└─────────────────┬───────────────────────┘
                  │ (local filesystem/IPC)
┌─────────────────▼───────────────────────┐
│  OpenClaw Gateway                      │
│  ┌─────────────────────────────────┐    │
│  │  Existing security model        │    │
│  │  No changes required            │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

## 5. Estimated Build Effort (Phases)

### Phase 1: Foundation (Week 1) — **Shippable**
**Goal:** Basic dashboard showing cron jobs and GTM outputs

| Task | Effort | Notes |
|------|--------|-------|
| Database schema | 4h | Create tables, indexes, RLS policies |
| Gateway bridge skeleton | 6h | File watcher, basic polling |
| Next.js project setup | 2h | Reuse SlideTheory components |
| Cron jobs dashboard | 6h | List view, status badges, run history |
| GTM outputs list | 4h | Content queue with status filters |
| **Total** | **~22h** | **MVP for personal use** |

**Deliverable:** `studio.blake.local` — view cron status, browse GTM outputs, mark content approved.

---

### Phase 2: Real-time (Week 2) — **Polished**
**Goal:** Live updates, agent visibility, mobile-friendly

| Task | Effort | Notes |
|------|--------|-------|
| Supabase Realtime setup | 3h | Enable on all tables |
| Live cron execution view | 4h | Progress bars, streaming logs |
| Agent sessions dashboard | 6h | Swarm visualization, session tree |
| Agent log viewer | 4h | Searchable, filterable, ANSI color support |
| Mobile responsiveness | 3h | Touch-friendly, collapsible panels |
| Dark mode | 2h | Toggle, system preference |
| **Total** | **~22h** | |

**Deliverable:** Real-time studio with live agent monitoring.

---

### Phase 3: Control (Week 3) — **Powerful**
**Goal:** Interact with system, not just observe

| Task | Effort | Notes |
|------|--------|-------|
| Manual job trigger | 2h | "Run now" button with confirmation |
| Content editor | 6h | Markdown editor with preview, auto-save |
| Publishing workflow | 4h | Schedule posts, mark published |
| Agent swarm launcher | 4h | Spawn custom swarms from UI |
| Kill/pause agents | 3h | Emergency controls |
| Notifications | 3h | Toast on job failures, new content ready |
| **Total** | **~22h** | |

**Deliverable:** Full control center. Blake can run entire GTM operation from studio.

---

### Phase 4: Intelligence (Week 4+) — **Advanced**
**Goal:** Insights, optimization, automation

| Task | Effort | Notes |
|------|--------|-------|
| Metrics dashboard | 6h | Charts: success rates, token usage, output velocity |
| Failure analysis | 4h | Auto-categorize failures, suggest fixes |
| Content performance | 4h | Track published content metrics |
| Schedule optimizer | 4h | Suggest better cron timing based on patterns |
| API tokens / webhooks | 4h | Allow external integrations |
| **Total** | **~22h** | |

**Deliverable:** Intelligent operations center with insights.

---

## Summary Timeline

| Phase | Duration | Key Outcome |
|-------|----------|-------------|
| 1 | Week 1 | Basic observability |
| 2 | Week 2 | Real-time visibility |
| 3 | Week 3 | Full control |
| 4 | Week 4+ | Intelligence layer |

**Total to MVP:** ~22 hours (part-time doable in 1 week)
**Total to full studio:** ~70 hours (1 month of evenings)

---

## Recommended Starting Point

**Ship Phase 1 this weekend.** The value of seeing all cron jobs and GTM outputs in one place is immediate. Everything else builds on that foundation.

### Tech Decisions to Make Now:

1. **Real-time layer:** Supabase Realtime (simpler) vs PartyKit (more powerful)
2. **Hosting:** Local only (ssh tunnel) vs Vercel with auth (access anywhere)
3. **Bridge location:** Same host as OpenClaw (simplest) vs separate container

### Files to Create First:

```
studio/
├── apps/
│   └── web/                    # Next.js 14 app
├── packages/
│   ├── database/               # Supabase schema + client
│   └── gateway-bridge/         # Node.js bridge agent
└── docker-compose.yml          # Optional: local dev stack
```

---

*Spec version: 1.0*
*Designed for: Blake Henkel's OpenClaw infrastructure*
*Constraint: Integrate, don't replace*
