import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { logActivity } from '../../../lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stmt = db.prepare(`
      SELECT s.*, a.name as agentName
      FROM sessions s
      JOIN agents a ON s.agentId = a.id
      WHERE s.id = ?
    `);
    const session = stmt.get(id);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, context } = body;

    const stmt = db.prepare(`
      UPDATE sessions 
      SET status = COALESCE(?, status),
          context = COALESCE(?, context)
      WHERE id = ?
    `);

    stmt.run(status, context, id);

    const updatedStmt = db.prepare(`
      SELECT s.*, a.name as agentName
      FROM sessions s
      JOIN agents a ON s.agentId = a.id
      WHERE s.id = ?
    `);
    const updated = updatedStmt.get(id);

    if (status) {
      logActivity('session_updated', `Session ${id} status changed to ${status}`, 'success', { sessionId: id });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const sessionStmt = db.prepare(`
      SELECT s.*, a.name as agentName 
      FROM sessions s
      JOIN agents a ON s.agentId = a.id
      WHERE s.id = ?
    `);
    const session = sessionStmt.get(id) as { agentId: string; agentName: string } | undefined;

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const deleteStmt = db.prepare('DELETE FROM sessions WHERE id = ?');
    deleteStmt.run(id);

    const updateAgentStmt = db.prepare('UPDATE agents SET status = ? WHERE id = ?');
    updateAgentStmt.run('idle', session.agentId);

    logActivity('session_closed', `Session closed for agent "${session.agentName}"`, 'success', { sessionId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
