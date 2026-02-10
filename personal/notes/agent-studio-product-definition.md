# Blake's Personal Agent Studio - Product Definition

> A personal "agent team" management interface for solo builders

---

## 1. Core User Stories (7)

### Story 1: On-Demand Agent Spawning
**As Blake**, when I have a new task that needs specialized work, I want to spawn a dedicated agent with a specific role/persona in one command, so I can delegate immediately without setup friction.

**Acceptance:**
- Spawn via CLI command or quick UI action
- Pre-built templates for common roles (Researcher, Writer, Coder, Analyst, etc.)
- Agent gets context about SlideTheory automatically

---

### Story 2: Task Assignment with Context
**As Blake**, I want to assign tasks to specific agents with full context (files, URLs, previous conversations), so the agent has everything needed to work autonomously.

**Acceptance:**
- Drag task to agent on Kanban board
- Attach files, links, and reference previous agent outputs
- Set priority, deadline, and expected deliverable format

---

### Story 3: Async Progress Check-ins
**As Blake**, I want to see what each agent is working on and their progress without interrupting them, so I can stay informed without micromanaging.

**Acceptance:**
- "Currently Working On" status for each active agent
- Progress % or status notes updated by agent
- Visual indicator of blocked/waiting agents

---

### Story 4: Direct Agent Conversation
**As Blake**, I want to jump into a chat with any agent to ask questions, clarify requirements, or review partial work, so I can guide work in real-time when needed.

**Acceptance:**
- Click agent → opens chat interface
- Agent remembers full task context during chat
- Can pivot/redirect task mid-conversation

---

### Story 5: Kanban Task Flow
**As Blake**, I want to see all tasks across all agents on a Kanban board (Backlog → In Progress → Review → Done), so I have a single view of my entire "team's" workload.

**Acceptance:**
- Columns: Backlog, Ready, In Progress, Review, Done
- Tasks show assigned agent avatar/name
- Drag-and-drop to reassign or change status
- Filter by agent, priority, or project

---

### Story 6: Agent Output Review & Handoff
**As Blake**, when an agent marks a task complete, I want to review the output and either approve it or send it back with feedback, so quality stays high.

**Acceptance:**
- "Review" column for completed work awaiting approval
- Side-by-side: task requirements vs. agent deliverable
- One-click approve → moves to Done
- One-click revise → back to In Progress with comments

---

### Story 7: Agent Performance Memory
**As Blake**, I want the system to remember which agents did well on what types of tasks, so future delegations get smarter over time.

**Acceptance:**
- Tag agents with strengths ("great at research", "fast writer")
- Suggest agents based on task type
- Track completion rate by agent

---

## 2. Must-Have Features

### Agent Management
| Feature | Why Critical |
|---------|--------------|
| **Agent Templates** | Blake shouldn't write system prompts every time. Pre-built roles: Researcher, Writer, Coder, Analyst, Editor, Outreach. |
| **One-Click Spawn** | `spawn researcher --name "Competitor-Analyst-1"` or UI button. Under 10 seconds to create. |
| **Agent Archive** | "Pause" agents without deleting. Keeps history but stops billing/consumption. |
| **Agent Context Inheritance** | New agents auto-know about SlideTheory (from Blake's USER.md or project context). |

### Task System
| Feature | Why Critical |
|---------|--------------|
| **Kanban Board** | Visual overview of all work. Non-negotiable for "team" feeling. |
| **Task Templates** | Common task types ("Research competitors", "Draft blog post") with pre-filled requirements. |
| **Rich Task Descriptions** | Markdown support, file attachments, URL references, linked previous tasks. |
| **Task-Agent Assignment** | Clear ownership. One agent per task (simplest). |
| **Due Dates & Priorities** | Urgency visualization (color-coded) on board. |
| **Review Queue** | Dedicated column for Blake to check completed work. |

### Communication
| Feature | Why Critical |
|---------|--------------|
| **Per-Agent Chat** | Threaded conversation history with each agent. |
| **Mention/Notify System** | Agent can "ping" Blake when blocked or when complete. |
| **Context Persistence** | Agent remembers entire conversation + task history. |

### Monitoring
| Feature | Why Critical |
|---------|--------------|
| **Activity Feed** | "Agent X started Task Y", "Agent Z completed...", "Agent A is blocked..." |
| **Agent Status Indicator** | 🟢 Working / 🟡 Waiting / 🔴 Blocked / ⚪ Idle |
| **Time Tracking** | How long has this agent been on this task? (Prevents runaway tasks.) |

---

## 3. Nice-to-Have Features

| Feature | Value | Complexity |
|---------|-------|------------|
| **Agent-to-Agent Handoff** | Agent A finishes research, auto-assigns to Agent B to write | Medium |
| **Scheduled Tasks** | "Every Monday, spawn competitor analysis agent" | Low |
| **Agent Workspaces** | Each agent gets its own folder for artifacts | Medium |
| **Slack/Discord Integration** | Get notified outside the studio | Low |
| **Agent Cost Tracking** | Track token spend per agent/task | Medium |
| **Voice Notes to Tasks** | Blake records audio → transcribed → task created | Low |
| **Agent Comparison Mode** | Assign same task to 2 agents, compare outputs | Medium |
| **Auto-Tagging** | AI suggests tags/categories for new tasks | Low |
| **Burn-down Chart** | Visual of tasks completed over time | Low |
| **Agent Personality Profiles** | Light/dark humor, formal/casual tone preferences | Low |

---

## 4. What to SKIP (Anti-Features)

| Skip | Why |
|------|-----|
| **Multi-user support** | Out of scope. This is Blake's personal tool. |
| **Agent marketplace/sharing** | Blake creates his own agents. No public sharing needed. |
| **Complex permissions/ACLs** | Only one user. No RBAC needed. |
| **Billing/credits system** | Personal tool - use existing API keys directly. |
| **Real-time collaborative editing** | Not needed for solo use. Async is fine. |
| **Mobile app** | Desktop-first web UI is sufficient. |
| **Agent versioning/GIT integration** | Overkill. Agents are lightweight and disposable. |
| **Advanced analytics dashboards** | Simple counts (tasks done, active agents) are enough. |
| **Third-party agent imports** | Blake creates what he needs. No import complexity. |
| **Workflow automation builder** | Start simple. If needed later, add basic chaining. |

---

## 5. Success Criteria

Blake should feel like he has:
1. **A team he can direct** - Clear ownership, assignable tasks
2. **Visibility without noise** - Kanban shows status at a glance
3. **Low friction delegation** - Spawn + assign in under 30 seconds
4. **Quality control** - Review step before work is "done"
5. **Growing efficiency** - System remembers what works

---

## 6. Suggested MVP Scope

**Week 1-2:** Agent spawning + per-agent chat
**Week 3-4:** Kanban board + task assignment
**Week 5-6:** Review workflow + activity feed
**Week 7-8:** Templates + context inheritance + polish

**Core Tech Stack Suggestion:**
- Frontend: Simple web UI (or even CLI-first with TUI)
- State: JSON files or lightweight DB
- Agents: OpenClaw subagent spawning
- Storage: Local filesystem for artifacts
