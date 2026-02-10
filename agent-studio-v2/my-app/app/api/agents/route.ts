import { NextRequest, NextResponse } from 'next/server';
import { db, Agent } from '../../lib/db';
import { v4 as uuidv4 } from 'uuid';
import { logActivity } from '../../lib/utils';

// GET /api/agents - List all agents
export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM agents ORDER BY createdAt DESC');
    const agents = stmt.all();
    return NextResponse.json(agents);
  } catch (error) {
    console.error('Failed to fetch agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

// POST /api/agents - Create a new agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, systemPrompt, model = 'claude-3-sonnet-20240229' } = body;

    if (!name || !systemPrompt) {
      return NextResponse.json(
        { error: 'Name and systemPrompt are required' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const agent: Agent = {
      id,
      name,
      description,
      systemPrompt,
      model,
      status: 'idle',
      createdAt: new Date().toISOString(),
    };

    const stmt = db.prepare(`
      INSERT INTO agents (id, name, description, systemPrompt, model, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      agent.id,
      agent.name,
      agent.description || null,
      agent.systemPrompt,
      agent.model,
      agent.status,
      agent.createdAt
    );

    logActivity('agent_created', `Agent "${name}" was created`, 'success', { agentId: id });

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error('Failed to create agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
