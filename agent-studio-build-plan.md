# Agent Studio Build Plan

> Strategic implementation roadmap for Blake's personal agent orchestration system  
> **Goal:** Maximum leverage with minimum distraction from SlideTheory

---

## Executive Summary

The **Agent Studio** is a unified interface for managing, orchestrating, and deploying AI agents to accelerate SlideTheory's path to $1K MRR. It's not a product—it's Blake's force multiplier.

**Core Philosophy:** Build only what delivers immediate, compounding value. Every feature must save Blake more time than it takes to build.

---

## 1. MVP Definition

### What IS the Agent Studio MVP?

A **single-dashboard control center** where Blake can:

| Feature | Function | Time Saved |
|---------|----------|------------|
| **Agent Registry** | See all active agents, their status, last run | 5 min/day |
| **Quick Deploy** | One-click spawn of common agent patterns | 10 min/task |
| **Output Inbox** | All agent outputs in one place, tagged/filterable | 15 min/day |
| **Simple Scheduler** | Visual cron management (no crontab editing) | 5 min/week |
| **Agent Builder** | Create new single-purpose agents with templates | 30 min → 5 min |

### What is NOT in the MVP?

- ❌ Multi-user support (this is for Blake only)
- ❌ Complex workflow builder with drag-and-drop
- ❌ Billing/subscription features
- ❌ Public marketplace or sharing
- ❌ Advanced observability (logs, traces)
- ❌ Real-time collaboration features

**Rule:** If it doesn't directly help Blake ship SlideTheory faster, it waits.

---

## 2. Phased Rollout Plan

### Phase 0: Foundation (Week 1)
**Goal:** Audit current state, establish baseline

**Tasks:**
- [ ] Inventory all existing agents/crons/skills
- [ ] Document current pain points (where does Blake waste time?)
- [ ] Set up Studio project structure (Next.js + Supabase)
- [ ] Create agent status tracking table in Supabase

**Deliverable:** Living document of current agent ecosystem + empty Studio shell

**Blake's Time:** 4-6 hours (can delegate initial scaffolding)

---

### Phase 1: Visibility (Weeks 2-3)
**Goal:** See everything in one place

**Features:**
1. **Agent Registry Dashboard**
   - List all agents (cron, on-demand, skills)
   - Status indicator (active/paused/error)
   - Last run timestamp + quick log view
   - Health score (success rate over last 7 days)

2. **Output Inbox v1**
   - Simple feed of all agent outputs
   - Basic filtering (by agent, by date)
   - Mark as read / star for later
   - One-click copy to clipboard

**Success Criteria:**
- Blake checks one page instead of 3-4 different places
- Can find any agent output from the last 7 days in <30 seconds

**Blake's Time:** 8-10 hours (mostly frontend)

---

### Phase 2: Control (Weeks 4-5)
**Goal:** Manage agents without touching code

**Features:**
1. **Scheduler UI**
   - Visual cron builder (no more crontab syntax)
   - Enable/disable jobs with toggle
   - "Run Now" button for manual execution
   - Simple retry logic for failed jobs

2. **Agent Quick Actions**
   - Pause/resume any agent
   - Kill stuck jobs
   - Duplicate agent config (for variations)

3. **Basic Alerting**
   - Notify on Telegram if agent fails 3x in a row
   - Daily digest of agent activity (optional)

**Success Criteria:**
- Blake can modify schedules without SSH/code changes
- Knows within 5 minutes if something critical breaks

**Blake's Time:** 10-12 hours

---

### Phase 3: Creation (Weeks 6-7)
**Goal:** Build new agents faster

**Features:**
1. **Agent Templates**
   - Pre-built templates: Research Agent, Content Agent, Code Agent
   - Template = system prompt + tool access + output format
   - One-click deploy from template

2. **Simple Agent Builder**
   - Form-based: Name, purpose, system prompt, tools needed
   - Preview mode: Test agent before saving
   - Auto-generate skill structure

3. **Prompt Library**
   - Save reusable prompt snippets
   - Tag and search prompts
   - Insert into agents quickly

**Success Criteria:**
- New single-purpose agent created in <5 minutes
- No need to manually create skill files/folders

**Blake's Time:** 12-15 hours

---

### Phase 4: Intelligence (Weeks 8-10)
**Goal:** Agents that compound value

**Features:**
1. **Agent Chains** (Simple Workflows)
   - Chain 2-3 agents: Research → Draft → Review
   - Linear only (no complex branching)
   - Visual pipeline view

2. **Memory Integration**
   - Agents can access shared memory context
   - "Remember this" from any output
   - Auto-summarize long outputs before storing

3. **Usage Analytics**
   - Which agents run most often?
   - Which outputs get used vs ignored?
   - Time saved estimate (based on manual equivalent)

**Success Criteria:**
- Can set up a 3-step workflow without code
- Agents share context intelligently
- Can see ROI: "This agent saved me 10 hours this month"

**Blake's Time:** 15-20 hours

---

### Phase 5: Polish (Weeks 11-12)
**Goal:** Smooth edges, advanced features only if needed

**Potential Features (prioritize based on actual usage):**
- Output templates (format for specific destinations)
- Agent marketplace (import community agents)
- Advanced scheduling (conditional runs, dependencies)
- Integration with SlideTheory (agents can trigger app actions)

**Success Criteria:**
- Studio feels like a finished, reliable tool
- Zero critical bugs
- Blake uses it daily without friction

**Blake's Time:** 8-12 hours

---

## 3. Week-by-Week Breakdown (Solo Build)

| Week | Focus | Key Deliverables | Blake's Hours |
|------|-------|------------------|---------------|
| 1 | Foundation | Project setup, agent inventory, DB schema | 6 |
| 2 | Registry v1 | Dashboard showing all agents, basic status | 5 |
| 3 | Output Inbox | Feed UI, filtering, search | 5 |
| 4 | Scheduler UI | Visual cron builder, enable/disable | 6 |
| 5 | Quick Actions | Run now, kill job, basic alerts | 6 |
| 6 | Templates v1 | 3 core agent templates | 7 |
| 7 | Agent Builder | Form-based agent creation | 7 |
| 8 | Chains v1 | Simple 2-step workflows | 8 |
| 9 | Memory | Shared context, auto-summarize | 8 |
| 10 | Analytics | Usage stats, ROI calculator | 6 |
| 11 | Polish | Bug fixes, performance, edge cases | 6 |
| 12 | Final | Documentation, deployment, handoff | 4 |

**Total: ~74 hours over 12 weeks (~6 hours/week)**

---

## 4. Key Decisions Blake Needs to Make

### Decision 1: Build vs. Configure Existing Tools
**Question:** Should Blake build a custom Studio or configure existing tools (n8n, Windmill, etc.)?

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Build Custom** | Perfect fit, learns by building, integrates seamlessly with SlideTheory stack | Takes time, maintenance burden | ✅ **Do this** — the learning compounds |
| **n8n/Self-hosted** | Visual builder, lots of integrations | Overkill for personal use, still requires setup | Good backup plan |
| **Windmill** | Open source, modern UI | Still requires learning their patterns | Consider for v2 |

**Decision Needed By:** Week 1

---

### Decision 2: Scope of "Agents"
**Question:** What counts as an "agent" in the Studio?

| Level | Definition | Example | Include? |
|-------|------------|---------|----------|
| A | Full skills with complex logic | `agent-swarm` skill | ✅ Yes |
| B | Simple cron jobs | Daily briefing cron | ✅ Yes |
| C | One-off scripts | PDF parser utility | ⚠️ Maybe (Phase 2+) |
| D | External tools | Supermemory queries | ❌ No (external integration only) |

**Recommendation:** Start with A+B only. Add C if pain point emerges.

**Decision Needed By:** Week 2

---

### Decision 3: Deployment Strategy
**Question:** Where does the Studio live?

| Option | Setup | Access | Cost |
|--------|-------|--------|------|
| **Vercel (Recommended)** | Easy, same as SlideTheory | https://studio.slidetheory.io | $0-20/mo |
| **Self-hosted VPS** | More control, more work | Custom domain | $5-10/mo |
| **Local only** | Zero deploy, limited access | localhost only | $0 |

**Recommendation:** Vercel, same project as SlideTheory but at `/studio` route. Shared auth, shared DB.

**Decision Needed By:** Week 1

---

### Decision 4: Agent Marketplace
**Question:** Should Blake share his agents or keep them private?

| Approach | Pros | Cons |
|----------|------|------|
| **Private only** | No overhead, can be messy | No community contributions |
| **Public repo** | Others benefit, potential network effects | Documentation burden, support requests |
| **Hybrid** | Core private, generic ones public | Requires curation |

**Recommendation:** Start private. Revisit after SlideTheory hits $1K MRR.

**Decision Needed By:** Phase 5 (Week 8+)

---

### Decision 5: Integration Depth with SlideTheory
**Question:** Should agents be able to directly modify SlideTheory data?

| Level | Capability | Risk | Include? |
|-------|------------|------|----------|
| 1 | Read-only queries (analytics, research) | Low | ✅ Phase 1 |
| 2 | Create drafts, content | Medium | ✅ Phase 3 |
| 3 | Modify user data, billing | High | ❌ Never (security) |
| 4 | Deploy code changes | Critical | ❌ Never |

**Recommendation:** Level 1-2 only, with clear confirmation steps for destructive actions.

**Decision Needed By:** Phase 3 (Week 6)

---

## 5. Success Criteria (When Is It "Done Enough"?)

### MVP Exit Criteria (End of Phase 3, Week 7)

The Studio is "done enough" when:

- [ ] **Blake can see all agents in one dashboard** without SSHing anywhere
- [ ] **Can modify schedules without editing crontab**
- [ ] **Finds any agent output from last 7 days in <30 seconds**
- [ ] **Creates a new agent in <5 minutes** from template
- [ ] **Knows within 5 minutes if an agent fails critically**
- [ ] **Uses the Studio at least 3x per week** voluntarily

**SlideTheory Metric:** No negative impact on SlideTheory velocity (still shipping features)

---

### Full v1.0 Exit Criteria (End of Phase 5, Week 12)

- [ ] **Saves Blake 5+ hours/week** vs. manual agent management
- [ ] **Zero critical bugs** for 2 consecutive weeks
- [ ] **Can delegate agent creation** to a VA or junior dev using the Studio
- [ ] **Integrates with 2+ SlideTheory workflows** (content creation, user research, etc.)

---

### Anti-Success (When to Pivot or Pause)

Stop or restructure if:
- ❌ Taking >10 hours/week away from SlideTheory for 3+ weeks
- ❌ Blake hasn't opened it in 2 weeks (builds inertia but no value)
- ❌ Maintenance burden exceeds time saved
- ❌ SlideTheory momentum stalls (primary goal at risk)

---

## 6. Technical Architecture (Starter)

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent Studio UI                          │
│         (Next.js 14, Tailwind, shadcn/ui)                   │
├─────────────────────────────────────────────────────────────┤
│  Dashboard │ Registry │ Inbox │ Scheduler │ Builder │ Logs  │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ agents       │  │ schedules    │  │ outputs      │      │
│  │ - id         │  │ - agent_id   │  │ - agent_id   │      │
│  │ - name       │  │ - cron       │  │ - content    │      │
│  │ - status     │  │ - enabled    │  │ - created_at │      │
│  │ - config     │  │ - last_run   │  │ - metadata   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  OpenClaw Integration                       │
│         (Spawn agents, capture outputs, logs)               │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema (MVP)

```sql
-- Agents registry
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('skill', 'cron', 'on_demand')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent execution outputs
CREATE TABLE agent_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  content TEXT NOT NULL,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'running')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedules (for cron agents)
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  cron_expression TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. Immediate Next Steps (This Week)

1. **Make Decision 1** (Build vs. Configure) — 15 min
2. **Create Studio project** in SlideTheory monorepo or separate repo — 30 min
3. **Inventory existing agents** — document in a spreadsheet — 1 hour
4. **Sketch dashboard wireframe** — what does Blake need to see first? — 30 min
5. **Set up Supabase tables** (schema above) — 30 min

**Total: ~3 hours to get started**

---

## Appendix: Risk Mitigation

| Risk | Mitigation |
|------|------------|
| **Time sink** | Hard cap: 6 hrs/week. If exceeded, pause non-critical features |
| **Maintenance burden** | Keep it simple. No complex infra. Vercel handles ops |
| **Abandonment** | Weekly check: "Did I use the Studio this week?" If no, why? |
| **Over-engineering** | Every feature must save time within 2 weeks of launch |
| **Security** | Agents cannot modify SlideTheory production data without confirmation |

---

*Created: 2026-02-09*  
*Version: 1.0*  
*Next Review: End of Phase 1 (Week 3)*
