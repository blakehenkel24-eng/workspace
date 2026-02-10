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
      SELECT t.*, a.name as assignedAgentName
      FROM tasks t
      LEFT JOIN agents a ON t.assignedAgentId = a.id
      WHERE t.id = ?
    `);
    const task = stmt.get(id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, status, priority, dueDate, assignedAgentId } = body;

    const stmt = db.prepare(`
      UPDATE tasks 
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          status = COALESCE(?, status),
          priority = COALESCE(?, priority),
          dueDate = COALESCE(?, dueDate),
          assignedAgentId = COALESCE(?, assignedAgentId)
      WHERE id = ?
    `);

    stmt.run(title, description, status, priority, dueDate, assignedAgentId, id);

    const updatedStmt = db.prepare(`
      SELECT t.*, a.name as assignedAgentName
      FROM tasks t
      LEFT JOIN agents a ON t.assignedAgentId = a.id
      WHERE t.id = ?
    `);
    const updated = updatedStmt.get(id);

    if (status) {
      logActivity('task_updated', `Task "${updated.title}" status changed to ${status}`, 'success', { 
        taskId: id,
        newStatus: status 
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const nameStmt = db.prepare('SELECT title FROM tasks WHERE id = ?');
    const task = nameStmt.get(id) as { title: string } | undefined;

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    stmt.run(id);

    logActivity('task_deleted', `Task "${task.title}" was deleted`, 'success', { taskId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
