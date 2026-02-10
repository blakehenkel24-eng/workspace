import { db } from './db';
import { v4 as uuidv4 } from 'uuid';

export function logActivity(
  type: string,
  message: string,
  status?: string,
  metadata?: Record<string, unknown>
) {
  const stmt = db.prepare(`
    INSERT INTO activity_logs (id, type, message, status, metadata)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    uuidv4(),
    type,
    message,
    status || null,
    metadata ? JSON.stringify(metadata) : null
  );
}

// Cron schedule parser - converts various formats to cron expression
export function parseSchedule(
  interval: number,
  unit: 'minutes' | 'hours' | 'days',
  timeOfDay?: string // HH:MM format for daily schedules
): string {
  switch (unit) {
    case 'minutes':
      return `*/${interval} * * * *`;
    case 'hours':
      return `0 */${interval} * * *`;
    case 'days':
      if (timeOfDay) {
        const [hours, minutes] = timeOfDay.split(':').map(Number);
        return `${minutes} ${hours} */${interval} * *`;
      }
      return `0 0 */${interval} * *`;
    default:
      return `0 */6 * * *`;
  }
}

// Human readable cron description
export function getHumanReadableSchedule(
  interval: number,
  unit: 'minutes' | 'hours' | 'days',
  timeOfDay?: string
): string {
  switch (unit) {
    case 'minutes':
      return interval === 1 ? 'Every minute' : `Every ${interval} minutes`;
    case 'hours':
      return interval === 1 ? 'Every hour' : `Every ${interval} hours`;
    case 'days':
      const time = timeOfDay || '00:00';
      return interval === 1 
        ? `Daily at ${time}` 
        : `Every ${interval} days at ${time}`;
    default:
      return 'Custom schedule';
  }
}

// Parse stored cron expression to human readable
export function parseCronToHumanReadable(schedule: string): string {
  // Handle standard patterns
  const patterns: Record<string, string> = {
    '* * * * *': 'Every minute',
    '*/5 * * * *': 'Every 5 minutes',
    '*/10 * * * *': 'Every 10 minutes',
    '*/15 * * * *': 'Every 15 minutes',
    '*/30 * * * *': 'Every 30 minutes',
    '0 * * * *': 'Every hour',
    '0 */2 * * *': 'Every 2 hours',
    '0 */3 * * *': 'Every 3 hours',
    '0 */4 * * *': 'Every 4 hours',
    '0 */6 * * *': 'Every 6 hours',
    '0 */8 * * *': 'Every 8 hours',
    '0 */12 * * *': 'Every 12 hours',
    '0 0 * * *': 'Daily at midnight',
    '0 9 * * *': 'Daily at 9:00 AM',
    '0 12 * * *': 'Daily at noon',
    '0 17 * * *': 'Daily at 5:00 PM',
    '0 0 * * 0': 'Weekly on Sunday',
    '0 0 * * 1': 'Weekly on Monday',
    '0 0 1 * *': 'Monthly on the 1st',
  };
  
  return patterns[schedule] || schedule;
}

// Check if a cron should run based on last run time
export function shouldCronRun(
  schedule: string,
  lastRunAt?: string
): boolean {
  const now = new Date();
  
  if (!lastRunAt) return true;
  
  const lastRun = new Date(lastRunAt);
  const minutesSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60);
  
  // Parse the cron expression (simplified)
  const parts = schedule.split(' ');
  const minute = parts[0];
  const hour = parts[1];
  
  // Handle */X patterns for minutes
  if (minute.startsWith('*/')) {
    const interval = parseInt(minute.slice(2));
    return minutesSinceLastRun >= interval;
  }
  
  // Handle */X patterns for hours
  if (hour.startsWith('*/')) {
    const interval = parseInt(hour.slice(2));
    return minutesSinceLastRun >= interval * 60;
  }
  
  // Default: check if more than 1 hour has passed
  return minutesSinceLastRun >= 60;
}

// Get upcoming tasks (due within next 24 hours)
export function getUpcomingTasks(hours = 24) {
  const stmt = db.prepare(`
    SELECT t.*, a.name as agentName, a.status as agentStatus
    FROM tasks t
    LEFT JOIN agents a ON t.assignedAgentId = a.id
    WHERE t.dueDate IS NOT NULL 
      AND t.status != 'done'
      AND datetime(t.dueDate) <= datetime('now', '+${hours} hours')
    ORDER BY t.dueDate ASC
  `);
  
  return stmt.all();
}

// Get crons that need to run
export function getCronsToRun() {
  const stmt = db.prepare(`
    SELECT c.*, a.name as agentName
    FROM cronJobs c
    JOIN agents a ON c.agentId = a.id
    WHERE c.enabled = 1
  `);
  
  const crons = stmt.all();
  return crons.filter((cron: { schedule: string; lastRunAt?: string }) => 
    shouldCronRun(cron.schedule, cron.lastRunAt)
  );
}
