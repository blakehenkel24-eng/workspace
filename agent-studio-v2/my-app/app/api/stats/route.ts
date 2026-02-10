import { NextResponse } from 'next/server';
import { db } from '../../lib/db';

// GET /api/stats - Get dashboard statistics
export async function GET() {
  try {
    const agentStmt = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'idle' THEN 1 ELSE 0 END) as idle,
        SUM(CASE WHEN status = 'busy' THEN 1 ELSE 0 END) as busy
      FROM agents
    `);
    const agentStats = agentStmt.get();

    const taskStmt = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgress,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done
      FROM tasks
    `);
    const taskStats = taskStmt.get();

    const sessionStmt = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
      FROM sessions
    `);
    const sessionStats = sessionStmt.get();

    const cronStmt = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN enabled = 1 THEN 1 ELSE 0 END) as enabled
      FROM cronJobs
    `);
    const cronStats = cronStmt.get();

    const activityStmt = db.prepare(`
      SELECT * FROM activity_logs 
      ORDER BY createdAt DESC 
      LIMIT 10
    `);
    const recentActivity = activityStmt.all();

    const overdueStmt = db.prepare(`
      SELECT COUNT(*) as count 
      FROM tasks 
      WHERE dueDate < datetime('now') 
        AND status != 'done'
    `);
    const overdueTasks = (overdueStmt.get() as { count: number }).count;

    const dueTodayStmt = db.prepare(`
      SELECT COUNT(*) as count 
      FROM tasks 
      WHERE date(dueDate) = date('now')
        AND status != 'done'
    `);
    const dueToday = (dueTodayStmt.get() as { count: number }).count;

    return NextResponse.json({
      agents: agentStats,
      tasks: {
        ...taskStats,
        overdue: overdueTasks,
        dueToday,
      },
      sessions: sessionStats,
      crons: cronStats,
      recentActivity,
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
