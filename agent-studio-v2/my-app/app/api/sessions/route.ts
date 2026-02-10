import { NextRequest, NextResponse } from 'next/server';
import { db, Session } from '../../lib/db';
import { v4 as uuidv4 } from 'uuid';
import { logActivity } from '../../lib/utils';

// GET /api/sessions - List all sessions with agent info
export async function GET() {
  try {
    const stmt = db.prepare(`
      SELECT s.*, a.name as agentName, a.status as agentStatus
      FROM sessions s
      JOIN agents a ON s.agentId = a.id
      ORDER BY s.createdAt DESC
    `);
    const sessions = stmt.all();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create a new session (spawn agent)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, context } = body;

    if (!agentId) {
      return NextResponse.json(
        { error: 'agentId is required' },
        { status: 400 }
      );
    }

    const agentStmt = db.prepare('SELECT id, name FROM agents WHERE id = ?');
    const agent = agentStmt.get(agentId) as { id: string; name: string } | undefined;

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    const id = uuidv4();
    const session: Session = {
      id,
      agentId,
      status: 'active',
      context,
      createdAt: new Date().toISOString(),
    };

    const stmt = db.prepare(`
      INSERT INTO sessions (id, agentId, status, context, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(session.id, session.agentId, session.status, session.context || null, session.createdAt);

    const updateAgentStmt = db.prepare('UPDATE agents SET status = ? WHERE id = ?');
    updateAgentStmt.run('active', agentId);

    logActivity('session_created', `Session spawned for agent "${agent.name}"`, 'success', { 
      sessionId: id, 
      agentId 
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
