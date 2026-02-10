# Agent Studio - Technical Architecture Specification

## Executive Summary

Agent Studio is an agent management platform that enables Blake to spawn, manage, and collaborate with AI agents through a unified interface. The platform integrates with the existing OpenClaw gateway to leverage its session management and agent spawning capabilities.

---

## 1. Recommended Tech Stack

### Core Application
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 14+ (App Router) | React-based, SSR/SSG, API routes, perfect for dashboard UIs |
| Styling | Tailwind CSS + shadcn/ui | Rapid UI development, accessible components |
| State Management | Zustand + React Query | Lightweight global state, server state caching |
| Real-time | Supabase Realtime | Built-in WebSocket for live updates |

### Backend & Data
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Database | PostgreSQL (via Supabase) | ACID compliance, JSON support, row-level security |
| Auth | Supabase Auth | Built-in auth, integrates seamlessly |
| Storage | Supabase Storage | File attachments for tasks/agents |
| Edge Functions | Supabase Edge Functions | Serverless functions for OpenClaw integration |

### External Integration
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| OpenClaw Gateway | HTTP API + WebSocket | Direct integration to spawn/monitor agents |
| Task Queue | Inngest or Temporal | For background job processing (optional V1) |

### Development & Deployment
| Layer | Technology |
|-------|-----------|
| Language | TypeScript |
| Package Manager | pnpm |
| Linting | ESLint + Prettier |
| Deployment | Vercel (frontend) + Supabase (backend) |

---

## 2. Data Models

### Entity Relationship Overview
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   users     │────<│   agents    │>────│   tasks     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                   │
                           v                   v
                    ┌─────────────┐     ┌─────────────┐
                    │ chat_rooms  │<───>│chat_messages│
                    └─────────────┘     └─────────────┘
                           │
                           v
                    ┌─────────────┐
                    │ activities  │
                    └─────────────┘
```

### 2.1 Users (Supabase Auth Extended)
```typescript
// profiles table (extends auth.users)
interface Profile {
  id: string;                    // FK to auth.users
  display_name: string;
  avatar_url: string;
  role: 'admin' | 'user';        // Blake is admin
  preferences: {
    default_agent_model: string;
    notification_settings: object;
  };
  created_at: timestamp;
  updated_at: timestamp;
}
```

### 2.2 Agents
```typescript
interface Agent {
  id: string;                    // UUID
  owner_id: string;              // FK to profiles
  name: string;
  slug: string;                  // URL-friendly identifier
  description: string;
  
  // OpenClaw Integration
  openclaw_session_id: string;   // Links to gateway session
  openclaw_node_id: string;      // Target node for execution
  status: 'idle' | 'working' | 'error' | 'offline';
  
  // Configuration
  system_prompt: string;
  model_config: {
    provider: string;
    model: string;
    temperature: number;
    max_tokens: number;
  };
  capabilities: string[];        // e.g., ['code', 'research', 'write']
  
  // Metadata
  avatar_url: string;
  color: string;                 // For UI theming
  tags: string[];
  
  // Stats
  tasks_completed: number;
  tasks_failed: number;
  last_active_at: timestamp;
  
  created_at: timestamp;
  updated_at: timestamp;
}
```

### 2.3 Tasks
```typescript
interface Task {
  id: string;                    // UUID
  
  // Ownership
  owner_id: string;              // FK to profiles (Blake)
  agent_id: string;              // FK to agents (assigned agent)
  
  // Core Fields
  title: string;
  description: string;           // Markdown supported
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Kanban State
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  position: number;              // For ordering within column
  
  // Task Details
  category: string;              // e.g., 'coding', 'research', 'content'
  labels: string[];
  due_date: timestamp;
  estimated_hours: number;
  
  // Work Tracking
  started_at: timestamp;
  completed_at: timestamp;
  
  // OpenClaw Integration
  session_context: object;       // Snapshot of session state
  deliverables: {
    type: 'file' | 'text' | 'url' | 'code';
    content: string;
    attachments: string[];       // Storage bucket paths
  }[];
  
  // Error handling
  error_log: string;
  retry_count: number;
  
  created_at: timestamp;
  updated_at: timestamp;
}
```

### 2.4 Chat System
```typescript
interface ChatRoom {
  id: string;
  type: 'direct' | 'task' | 'agent';  // direct=1:1, task=task context, agent=agent group
  title: string;
  
  // Participants
  owner_id: string;              // Blake
  agent_ids: string[];           // participating agents
  
  // Context
  task_id: string;               // Optional: linked task
  context: {
    system_prompt_override: string;
    allowed_tools: string[];
    max_turns: number;
  };
  
  // State
  is_active: boolean;
  last_message_at: timestamp;
  message_count: number;
  
  created_at: timestamp;
}

interface ChatMessage {
  id: string;
  room_id: string;               // FK to chat_rooms
  
  // Sender
  sender_type: 'user' | 'agent' | 'system';
  sender_id: string;             // profile.id or agent.id
  
  // Content
  content: string;               // Markdown
  content_type: 'text' | 'code' | 'image' | 'file' | 'tool_call' | 'tool_result';
  
  // Tool Integration
  tool_calls: {
    tool: string;
    parameters: object;
    result: object;
  }[];
  
  // Metadata
  tokens_used: number;
  latency_ms: number;
  
  // Threading
  parent_id: string;             // For replies/threads
  
  created_at: timestamp;
}
```

### 2.5 Activity Log
```typescript
interface Activity {
  id: string;
  
  // Actor
  actor_type: 'user' | 'agent' | 'system';
  actor_id: string;
  actor_name: string;
  
  // Action
  action: 
    | 'agent_created' | 'agent_updated' | 'agent_deleted' | 'agent_status_changed'
    | 'task_created' | 'task_updated' | 'task_deleted' | 'task_assigned' 
    | 'task_status_changed' | 'task_completed'
    | 'chat_started' | 'message_sent'
    | 'session_spawned' | 'session_ended' | 'session_error';
  
  // Target
  target_type: 'agent' | 'task' | 'chat' | 'session';
  target_id: string;
  
  // Details
  metadata: {
    before: object;              // Previous state (for updates)
    after: object;               // New state
    summary: string;
  };
  
  created_at: timestamp;
}
```

---

## 3. API Design

### 3.1 REST API (Next.js Route Handlers)

#### Agents
```
GET    /api/agents              # List agents (with filtering)
POST   /api/agents              # Create new agent
GET    /api/agents/:id          # Get agent details
PATCH  /api/agents/:id          # Update agent
DELETE /api/agents/:id          # Delete agent
POST   /api/agents/:id/spawn    # Spawn OpenClaw session
POST   /api/agents/:id/kill     # Terminate session
GET    /api/agents/:id/logs     # Get agent activity logs
```

#### Tasks
```
GET    /api/tasks               # List tasks (with filters, pagination)
POST   /api/tasks               # Create task
GET    /api/tasks/:id           # Get task
PATCH  /api/tasks/:id           # Update task
DELETE /api/tasks/:id           # Delete task
POST   /api/tasks/:id/assign    # Assign to agent
POST   /api/tasks/:id/start     # Start work (spawns agent if needed)
POST   /api/tasks/:id/complete  # Mark complete
POST   /api/tasks/:id/cancel    # Cancel task
POST   /api/tasks/bulk-update   # Batch status/position updates (drag-drop)
```

#### Chat
```
GET    /api/chats               # List chat rooms
POST   /api/chats               # Create chat room
GET    /api/chats/:id           # Get room with recent messages
DELETE /api/chats/:id           # Close room
GET    /api/chats/:id/messages  # Paginated messages
POST   /api/chats/:id/messages  # Send message
```

#### Activities
```
GET    /api/activities          # Feed with pagination
GET    /api/activities/stats    # Dashboard stats
```

### 3.2 Real-time Subscriptions (Supabase Realtime)

```typescript
// Client-side subscription examples

// Live task board updates
supabase
  .channel('tasks')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, callback)
  .subscribe();

// Agent status changes
supabase
  .channel('agents')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'agents' }, callback)
  .subscribe();

// New messages in active chat
supabase
  .channel(`chat:${roomId}`)
  .on('postgres_changes', { 
    event: 'INSERT', 
    schema: 'public', 
    table: 'chat_messages',
    filter: `room_id=eq.${roomId}`
  }, callback)
  .subscribe();

// Activity feed
supabase
  .channel('activities')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activities' }, callback)
  .subscribe();
```

### 3.3 WebSocket for Agent Streaming

For real-time agent responses during chat:

```typescript
// Socket.io or native WebSocket for streaming agent responses
interface AgentStreamEvent {
  type: 'token' | 'tool_call' | 'tool_result' | 'error' | 'done';
  payload: {
    token?: string;              // Streaming text
    tool?: string;               // Tool being called
    result?: object;             // Tool result
    error?: string;              // Error message
  };
  timestamp: number;
}
```

---

## 4. OpenClaw Integration Approach

### 4.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Agent Studio UI                         │
│                   (Next.js + Supabase)                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
         ▼                    ▼
┌─────────────────┐   ┌─────────────────┐
│  Supabase Edge  │   │  OpenClaw       │
│  Functions      │   │  Gateway        │
│                 │   │                 │
│  • spawn-agent  │   │  • sessions     │
│  • kill-agent   │   │  • nodes        │
│  • exec-command │   │  • process      │
└─────────────────┘   └─────────────────┘
         │                    │
         └──────────┬─────────┘
                    │
         ┌──────────▼──────────┐
         │   Agent Nodes       │
         │   (Docker/Remote)   │
         └─────────────────────┘
```

### 4.2 Integration Methods

#### Method 1: Direct Gateway API (Primary)

Use OpenClaw's REST API endpoints directly from Supabase Edge Functions:

```typescript
// Edge Function: spawn-agent
import { createClient } from '@supabase/supabase-js';

const OPENCLAW_GATEWAY = Deno.env.get('OPENCLAW_GATEWAY_URL');
const GATEWAY_TOKEN = Deno.env.get('OPENCLAW_GATEWAY_TOKEN');

Deno.serve(async (req) => {
  const { agent_id, task_context } = await req.json();
  
  // 1. Get agent config from DB
  const agent = await supabase.from('agents').select('*').eq('id', agent_id).single();
  
  // 2. Spawn session via OpenClaw gateway
  const response = await fetch(`${OPENCLAW_GATEWAY}/v1/sessions`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${GATEWAY_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      agent_type: 'subagent',
      config: {
        model: agent.model_config.model,
        system_prompt: buildSystemPrompt(agent, task_context),
        tools: agent.capabilities,
      },
      metadata: {
        agent_studio_id: agent_id,
        task_context,
        owner: agent.owner_id,
      }
    })
  });
  
  const session = await response.json();
  
  // 3. Update agent record with session ID
  await supabase.from('agents').update({
    openclaw_session_id: session.id,
    status: 'idle',
    last_active_at: new Date().toISOString(),
  }).eq('id', agent_id);
  
  // 4. Log activity
  await supabase.from('activities').insert({
    action: 'session_spawned',
    actor_type: 'system',
    target_type: 'agent',
    target_id: agent_id,
    metadata: { session_id: session.id }
  });
  
  return new Response(JSON.stringify({ session_id: session.id }));
});
```

#### Method 2: Gateway Event Webhook

OpenClaw gateway pushes events to Agent Studio:

```typescript
// Edge Function: gateway-webhook
Deno.serve(async (req) => {
  const event = await req.json();
  
  switch (event.type) {
    case 'session.started':
      await handleSessionStarted(event.data);
      break;
    case 'session.ended':
      await handleSessionEnded(event.data);
      break;
    case 'session.error':
      await handleSessionError(event.data);
      break;
    case 'agent.output':
      await handleAgentOutput(event.data);  // Stream to chat
      break;
    case 'agent.status':
      await updateAgentStatus(event.data);
      break;
  }
  
  return new Response('OK');
});
```

#### Method 3: CLI Integration (Alternative)

If direct API isn't available, wrap the CLI:

```typescript
// Using Deno command execution
const process = new Deno.Command('openclaw', {
  args: ['sessions', 'spawn', '--config', JSON.stringify(config)],
  stdout: 'piped',
  stderr: 'piped',
});

const { code, stdout, stderr } = await process.output();
```

### 4.3 Session Lifecycle Management

```
┌──────────┐    spawn     ┌──────────┐    assign task   ┌──────────┐
│  Agent   │─────────────>│  Session │─────────────────>│ Working  │
│  Config  │              │  Idle    │                  │          │
└──────────┘              └──────────┘                  └────┬─────┘
                                                             │
    ┌────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────┐    complete    ┌──────────┐    new task    ┌──────────┐
│  Output  │<───────────────│  Done    │<───────────────│ Working  │
│          │                │          │                │          │
└──────────┘                └──────────┘                └──────────┘
                                   │
                                   │ timeout/error
                                   ▼
                            ┌──────────┐
                            │  Kill    │
                            │ Session  │
                            └──────────┘
```

### 4.4 Environment Configuration

```bash
# .env.local
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenClaw Gateway
OPENCLAW_GATEWAY_URL=http://localhost:8080  # or hosted URL
OPENCLAW_GATEWAY_TOKEN=                       # API auth token
OPENCLAW_WEBHOOK_SECRET=                      # For verifying webhooks

# App Config
AGENT_DEFAULT_TIMEOUT=3600                    # Session timeout in seconds
AGENT_MAX_CONCURRENT=5                        # Max active agents per user
```

---

## 5. Build Phases

### Phase 1: Foundation (Week 1-2)
**Goal**: Core infrastructure and agent management

**Deliverables**:
- [ ] Supabase project setup with schema
- [ ] Next.js app shell with auth (Supabase Auth)
- [ ] Basic dashboard layout
- [ ] Agent CRUD UI
- [ ] OpenClaw gateway connection (spawn/kill)
- [ ] Agent status monitoring

**Key Tables**: `profiles`, `agents`

### Phase 2: Task Management (Week 3-4)
**Goal**: Kanban board and task workflows

**Deliverables**:
- [ ] Task data model and API
- [ ] Kanban board UI (drag-drop)
- [ ] Task creation/editing forms
- [ ] Task assignment to agents
- [ ] Basic task status workflows
- [ ] Real-time updates for board

**Key Tables**: `tasks`

### Phase 3: Chat System (Week 5-6)
**Goal**: Real-time communication with agents

**Deliverables**:
- [ ] Chat room model
- [ ] Message threading UI
- [ ] Agent message streaming
- [ ] Chat context (task-aware conversations)
- [ ] Message history persistence
- [ ] File attachments in chat

**Key Tables**: `chat_rooms`, `chat_messages`

### Phase 4: Activity & Polish (Week 7-8)
**Goal**: Observability and production readiness

**Deliverables**:
- [ ] Activity logging system
- [ ] Activity feed UI
- [ ] Dashboard with stats
- [ ] Agent performance metrics
- [ ] Error handling and retries
- [ ] Deployment to Vercel
- [ ] Documentation

**Key Tables**: `activities`

### Phase 5: Advanced Features (Future)
- Multi-agent conversations
- Agent templates/marketplace
- Advanced task dependencies
- Scheduled/recurring tasks
- Integration with external tools (GitHub, Notion, etc.)

---

## 6. Database Schema (SQL)

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agents
CREATE TABLE agents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- OpenClaw Integration
  openclaw_session_id TEXT,
  openclaw_node_id TEXT,
  status TEXT DEFAULT 'offline' CHECK (status IN ('idle', 'working', 'error', 'offline')),
  
  -- Configuration
  system_prompt TEXT,
  model_config JSONB DEFAULT '{"provider": "openai", "model": "gpt-4", "temperature": 0.7}',
  capabilities TEXT[] DEFAULT '{}',
  
  -- Metadata
  avatar_url TEXT,
  color TEXT DEFAULT '#3b82f6',
  tags TEXT[] DEFAULT '{}',
  
  -- Stats
  tasks_completed INTEGER DEFAULT 0,
  tasks_failed INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'todo', 'in_progress', 'review', 'done', 'cancelled')),
  position INTEGER DEFAULT 0,
  
  category TEXT,
  labels TEXT[] DEFAULT '{}',
  due_date TIMESTAMPTZ,
  estimated_hours NUMERIC,
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  session_context JSONB,
  deliverables JSONB[] DEFAULT '{}',
  error_log TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Rooms
CREATE TABLE chat_rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT DEFAULT 'direct' CHECK (type IN ('direct', 'task', 'agent')),
  title TEXT NOT NULL,
  
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  agent_ids UUID[] DEFAULT '{}',
  
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  context JSONB DEFAULT '{}',
  
  is_active BOOLEAN DEFAULT true,
  last_message_at TIMESTAMPTZ,
  message_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'agent', 'system')),
  sender_id TEXT NOT NULL,  -- profile.id or agent.id
  
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'code', 'image', 'file', 'tool_call', 'tool_result')),
  
  tool_calls JSONB[] DEFAULT '{}',
  tokens_used INTEGER,
  latency_ms INTEGER,
  
  parent_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities
CREATE TABLE activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'agent', 'system')),
  actor_id TEXT NOT NULL,
  actor_name TEXT,
  
  action TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('agent', 'task', 'chat', 'session')),
  target_id TEXT NOT NULL,
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_agents_owner ON agents(owner_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_tasks_owner ON tasks(owner_id);
CREATE INDEX idx_tasks_agent ON tasks(agent_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_position ON tasks(position);
CREATE INDEX idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX idx_activities_target ON activities(target_type, target_id);
CREATE INDEX idx_activities_created ON activities(created_at DESC);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own agents" ON agents
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can manage own agents" ON agents
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can view own chats" ON chat_rooms
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can manage own chats" ON chat_rooms
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can view chat messages" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE chat_rooms.id = chat_messages.room_id 
      AND chat_rooms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert chat messages" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE chat_rooms.id = chat_messages.room_id 
      AND chat_rooms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own activities" ON activities
  FOR SELECT USING (
    actor_id = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM agents WHERE agents.id::text = target_id AND agents.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id::text = target_id AND tasks.owner_id = auth.uid()
    )
  );

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 7. Security Considerations

1. **Gateway Authentication**: All OpenClaw API calls must use authenticated tokens
2. **Session Isolation**: Each agent session runs isolated; no cross-session data leakage
3. **RLS Policies**: Row-level security ensures users only access their own data
4. **Input Validation**: Zod schemas for all API inputs
5. **Rate Limiting**: Implement on API routes to prevent abuse
6. **Audit Logging**: All actions logged to activities table for accountability

---

## 8. Deployment Architecture

```
Production Setup:

┌─────────────────────────────────────────────────────────┐
│                      Vercel                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Next.js App                                    │   │
│  │  • Static pages (marketing, docs)              │   │
│  │  • SSR Dashboard                                │   │
│  │  • API Routes                                   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                    Supabase Cloud                       │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │ PostgreSQL  │  │ Realtime    │  │ Edge Functions │  │
│  │             │  │             │  │ • spawn-agent  │  │
│  │ • agents    │  │ • tasks     │  │ • kill-agent   │  │
│  │ • tasks     │  │ • messages  │  │ • webhook      │  │
│  │ • chats     │  │ • activities│  │                │  │
│  └─────────────┘  └─────────────┘  └────────────────┘  │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│              OpenClaw Gateway (Self-hosted)             │
│                    or Remote Node                       │
└─────────────────────────────────────────────────────────┘
```

---

## Appendix: Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 14 | Full-stack React, excellent DX, Vercel hosting |
| Database | Supabase Postgres | Managed, Realtime, Auth, Edge Functions in one |
| State Management | Zustand + React Query | Simple, effective, great async handling |
| Drag-Drop | @dnd-kit | Modern, accessible, works with React 18 |
| UI Components | shadcn/ui | Copy-paste components, fully customizable |
| Agent Comms | WebSocket streaming | Real-time feedback during long agent tasks |

---

*Document Version: 1.0*
*Author: Technical Architect Agent*
*Date: 2026-02-09*
