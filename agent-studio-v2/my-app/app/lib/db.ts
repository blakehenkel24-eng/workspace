import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'agent-studio.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Create database connection
export const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize database with tables
export function initDatabase() {
  // Agents table
  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      systemPrompt TEXT NOT NULL,
      model TEXT NOT NULL DEFAULT 'claude-3-sonnet-20240229',
      status TEXT NOT NULL DEFAULT 'idle',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      agentId TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      context TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (agentId) REFERENCES agents(id) ON DELETE CASCADE
    )
  `);

  // Tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'todo',
      priority TEXT NOT NULL DEFAULT 'medium',
      dueDate DATETIME,
      assignedAgentId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignedAgentId) REFERENCES agents(id) ON DELETE SET NULL
    )
  `);

  // Cron jobs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cronJobs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      schedule TEXT NOT NULL,
      agentId TEXT NOT NULL,
      message TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      lastRunAt DATETIME,
      lastRunStatus TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (agentId) REFERENCES agents(id) ON DELETE CASCADE
    )
  `);

  // Activity logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT,
      metadata TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database initialized successfully');
}

// Initialize on module load
initDatabase();

// Types
export interface Agent {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  model: string;
  status: 'idle' | 'active' | 'busy';
  createdAt: string;
}

export interface Session {
  id: string;
  agentId: string;
  status: 'active' | 'paused' | 'closed';
  context?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedAgentId?: string;
  createdAt: string;
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  agentId: string;
  message: string;
  enabled: boolean;
  lastRunAt?: string;
  lastRunStatus?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  type: string;
  message: string;
  status?: string;
  metadata?: string;
  createdAt: string;
}
