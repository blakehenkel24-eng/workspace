import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { logActivity } from '../../../lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stmt = db.prepare('SELECT * FROM agents WHERE id = ?');
    const agent = stmt.get(id);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch agent' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, systemPrompt, model, status } = body;

    const stmt = db.prepare(`
      UPDATE agents 
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          systemPrompt = COALESCE(?, systemPrompt),
          model = COALESCE(?, model),
          status = COALESCE(?, status)
      WHERE id = ?
    `);

    stmt.run(name, description, systemPrompt, model, status, id);

    const updatedStmt = db.prepare('SELECT * FROM agents WHERE id = ?');
    const updated = updatedStmt.get(id);

    logActivity('agent_updated', `Agent "${updated.name}" was updated`, 'success', { agentId: id });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const nameStmt = db.prepare('SELECT name FROM agents WHERE id = ?');
    const agent = nameStmt.get(id) as { name: string } | undefined;

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const stmt = db.prepare('DELETE FROM agents WHERE id = ?');
    stmt.run(id);

    logActivity('agent_deleted', `Agent "${agent.name}" was deleted`, 'success', { agentId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 });
  }
}
