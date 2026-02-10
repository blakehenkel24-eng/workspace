import { NextRequest, NextResponse } from 'next/server';
import { db, Task } from '../../lib/db';
import { v4 as uuidv4 } from 'uuid';
import { logActivity } from '../../lib/utils';

// GET /api/tasks - List all tasks with agent info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assignedAgentId = searchParams.get('assignedAgentId');

    let query = `
      SELECT t.*, a.name as assignedAgentName
      FROM tasks t
      LEFT JOIN agents a ON t.assignedAgentId = a.id
      WHERE 1=1
    `;
    const params: (string | null)[] = [];

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    if (assignedAgentId) {
      query += ' AND t.assignedAgentId = ?';
      params.push(assignedAgentId);
    }

    query += ' ORDER BY t.createdAt DESC';

    const stmt = db.prepare(query);
    const tasks = stmt.all(...params);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, priority = 'medium', dueDate, assignedAgentId } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (assignedAgentId) {
      const agentStmt = db.prepare('SELECT id, name FROM agents WHERE id = ?');
      const agent = agentStmt.get(assignedAgentId) as { id: string; name: string } | undefined;
      if (!agent) {
        return NextResponse.json({ error: 'Assigned agent not found' }, { status: 404 });
      }
    }

    const id = uuidv4();
    const task: Task = {
      id,
      title,
      description,
      status: 'todo',
      priority,
      dueDate,
      assignedAgentId,
      createdAt: new Date().toISOString(),
    };

    const stmt = db.prepare(`
      INSERT INTO tasks (id, title, description, status, priority, dueDate, assignedAgentId, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      task.id,
      task.title,
      task.description || null,
      task.status,
      task.priority,
      task.dueDate || null,
      task.assignedAgentId || null,
      task.createdAt
    );

    logActivity('task_created', `Task "${title}" was created`, 'success', { taskId: id, assignedAgentId });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
