import { NextRequest, NextResponse } from 'next/server';
import { db, CronJob } from '../../lib/db';
import { v4 as uuidv4 } from 'uuid';
import { logActivity } from '../../lib/utils';

// GET /api/cron - List all cron jobs with agent info
export async function GET() {
  try {
    const stmt = db.prepare(`
      SELECT c.*, a.name as agentName
      FROM cronJobs c
      JOIN agents a ON c.agentId = a.id
      ORDER BY c.createdAt DESC
    `);
    const jobs = stmt.all();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Failed to fetch cron jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch cron jobs' }, { status: 500 });
  }
}

// POST /api/cron - Create a new cron job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, schedule, agentId, message, enabled = true } = body;

    if (!name || !schedule || !agentId || !message) {
      return NextResponse.json(
        { error: 'Name, schedule, agentId, and message are required' },
        { status: 400 }
      );
    }

    const agentStmt = db.prepare('SELECT id, name FROM agents WHERE id = ?');
    const agent = agentStmt.get(agentId) as { id: string; name: string } | undefined;
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const id = uuidv4();
    const job: CronJob = {
      id,
      name,
      schedule,
      agentId,
      message,
      enabled,
      createdAt: new Date().toISOString(),
    };

    const stmt = db.prepare(`
      INSERT INTO cronJobs (id, name, schedule, agentId, message, enabled, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(job.id, job.name, job.schedule, job.agentId, job.message, job.enabled ? 1 : 0, job.createdAt);

    logActivity('cron_created', `Cron job "${name}" was created`, 'success', { 
      cronId: id, 
      agentId,
      schedule 
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('Failed to create cron job:', error);
    return NextResponse.json({ error: 'Failed to create cron job' }, { status: 500 });
  }
}
