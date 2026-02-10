import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../lib/db';
import { getUpcomingTasks, getCronsToRun } from '../../lib/utils';

// GET /api/heartbeat - Check for tasks and crons needing attention
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '24');

    const upcomingTasks = getUpcomingTasks(hours);
    const cronsToRun = getCronsToRun();

    const totalTasksStmt = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE status != ?');
    const totalTasks = (totalTasksStmt.get('done') as { count: number }).count;

    const overdueTasksStmt = db.prepare(`
      SELECT COUNT(*) as count 
      FROM tasks 
      WHERE dueDate < datetime('now') 
        AND status != 'done'
        AND assignedAgentId IS NOT NULL
    `);
    const overdueTasks = (overdueTasksStmt.get() as { count: number }).count;

    const activeCronsStmt = db.prepare('SELECT COUNT(*) as count FROM cronJobs WHERE enabled = 1');
    const activeCrons = (activeCronsStmt.get() as { count: number }).count;

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      summary: {
        totalTasks,
        overdueTasks,
        activeCrons,
        upcomingTasksCount: upcomingTasks.length,
        cronsToRunCount: cronsToRun.length,
      },
      notifications: {
        upcomingTasks,
        cronsToRun,
      },
    });
  } catch (error) {
    console.error('Heartbeat check failed:', error);
    return NextResponse.json({ error: 'Heartbeat check failed' }, { status: 500 });
  }
}

// POST /api/heartbeat - Update cron run status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cronId, status } = body;

    if (!cronId) {
      return NextResponse.json({ error: 'cronId is required' }, { status: 400 });
    }

    const stmt = db.prepare(`
      UPDATE cronJobs 
      SET lastRunAt = CURRENT_TIMESTAMP,
          lastRunStatus = ?
      WHERE id = ?
    `);

    stmt.run(status || 'success', cronId);

    return NextResponse.json({ 
      success: true, 
      message: 'Cron status updated',
      cronId,
      status
    });
  } catch (error) {
    console.error('Failed to update cron status:', error);
    return NextResponse.json({ error: 'Failed to update cron status' }, { status: 500 });
  }
}
