# Agent Studio v2

A multi-agent orchestration platform built with Next.js 14 and SQLite.

## Features

### Agents
- Create and manage AI agents with custom system prompts
- Support for multiple models (Claude, GPT, Gemini)
- Spawn sessions for agents
- Agent status tracking (idle, active, busy)

### Tasks (Kanban Board)
- Create tasks with title, description, priority
- Assign agents to tasks
- Set due dates/times for agent completion
- Drag-and-drop style Kanban board (To Do, In Progress, Done)
- Visual indicators for overdue and due-soon tasks

### Cron Jobs
- Schedule automated tasks for agents
- User-friendly time picker (minutes, hours, daily)
- Assign specific agents to run cron jobs
- Human-readable schedule display
- Enable/disable cron jobs
- Track last run status

### Activity Logs
- Track all system events
- View agent creation, updates, deletions
- Task status changes
- Cron job executions

### Heartbeat API
- `/api/heartbeat` - Returns tasks and crons needing attention
- Used by OpenClaw's heartbeat system
- Checks for overdue tasks and crons ready to run

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with Linear-inspired dark theme
- **Database**: SQLite with better-sqlite3
- **Language**: TypeScript

## Database Schema

### agents
- id, name, description, systemPrompt, model, status, createdAt

### sessions
- id, agentId, status, context, createdAt

### tasks
- id, title, description, status, priority, dueDate, assignedAgentId, createdAt

### cronJobs
- id, name, schedule, agentId, message, enabled, lastRunAt, lastRunStatus, createdAt

### activity_logs
- id, type, message, status, metadata, createdAt

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Open http://localhost:3000

## Build

```bash
npm run build
npm start
```

## API Endpoints

- `GET/POST /api/agents` - List/Create agents
- `GET/PUT/DELETE /api/agents/[id]` - Get/Update/Delete agent
- `GET/POST /api/sessions` - List/Create sessions
- `GET/PUT/DELETE /api/sessions/[id]` - Get/Update/Delete session
- `GET/POST /api/tasks` - List/Create tasks
- `GET/PUT/DELETE /api/tasks/[id]` - Get/Update/Delete task
- `GET/POST /api/cron` - List/Create cron jobs
- `GET/PUT/DELETE /api/cron/[id]` - Get/Update/Delete cron job
- `POST /api/cron/[id]` - Trigger cron job
- `GET /api/heartbeat` - Get tasks/crons needing attention
- `GET /api/logs` - Get activity logs
- `GET /api/stats` - Get dashboard statistics

## Theme

Linear-inspired dark theme:
- Background: #0D0D0D
- Elevated: #141414
- Border: #27272A
- Primary: #6E56CF
- Text: #FAFAFA
- Muted: #A1A1AA
