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
      SELECT c.*, a.name as agentName
      FROM cronJobs c
      JOIN agents a ON c.agentId = a.id
      WHERE c.id = ?
    `);
    const job = stmt.get(id);

    if (!job) {
      return NextResponse.json({ error: 'Cron job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cron job' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, schedule, agentId, message, enabled } = body;

    const stmt = db.prepare(`
      UPDATE cronJobs 
      SET name = COALESCE(?, name),
          schedule = COALESCE(?, schedule),
          agentId = COALESCE(?, agentId),
          message = COALESCE(?, message),
          enabled = COALESCE(?, enabled)
      WHERE id = ?
    `);

    stmt.run(name, schedule, agentId, message, enabled !== undefined ? (enabled ? 1 : 0) : undefined, id);

    const updatedStmt = db.prepare(`
      SELECT c.*, a.name as agentName
      FROM cronJobs c
      JOIN agents a ON c.agentId = a.id
      WHERE c.id = ?
    `);
    const updated = updatedStmt.get(id);

    logActivity('cron_updated', `Cron job "${updated.name}" was updated`, 'success', { cronId: id });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update cron job' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const nameStmt = db.prepare('SELECT name FROM cronJobs WHERE id = ?');
    const job = nameStmt.get(id) as { name: string } | undefined;

    if (!job) {
      return NextResponse.json({ error: 'Cron job not found' }, { status: 404 });
    }

    const stmt = db.prepare('DELETE FROM cronJobs WHERE id = ?');
    stmt.run(id);

    logActivity('cron_deleted', `Cron job "${job.name}" was deleted`, 'success', { cronId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete cron job' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const stmt = db.prepare(`
      SELECT c.*, a.name as agentName
      FROM cronJobs c
      JOIN agents a ON c.agentId = a.id
      WHERE c.id = ?
    `);
    const job = stmt.get(id) as { id: string; name: string; agentName: string; message: string } | undefined;

    if (!job) {
      return NextResponse.json({ error: 'Cron job not found' }, { status: 404 });
    }

    const updateStmt = db.prepare(`
      UPDATE cronJobs 
      SET lastRunAt = CURRENT_TIMESTAMP,
          lastRunStatus = ?
      WHERE id = ?
    `);
    updateStmt.run('success', id);

    logActivity('cron_executed', `Cron job "${job.name}" executed for agent "${job.agentName}"`, 'success', { 
      cronId: id,
      message: job.message 
    });

    return NextResponse.json({ success: true, message: 'Cron job triggered' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to run cron job' }, { status: 500 });
  }
}
