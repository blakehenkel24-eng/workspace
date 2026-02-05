const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec, execSync } = require('child_process');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

// Todoist API Key (from environment or config)
const TODOIST_API_KEY = process.env.TODOIST_API_KEY || '4287ed2248e0e030fccf45f5e224219343301b80';

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Agent storage
const agents = new Map();
let agentIdCounter = 1;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(DATA_DIR, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// === TODOIST API ROUTES ===

// Get active tasks from Todoist
app.get('/api/todoist/tasks', async (req, res) => {
  try {
    const response = await fetch('https://api.todoist.com/rest/v2/tasks', {
      headers: {
        'Authorization': `Bearer ${TODOIST_API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Todoist API error: ${response.status}`);
    }
    
    const tasks = await response.json();
    
    // Fetch sections for filtering
    const sectionsResponse = await fetch('https://api.todoist.com/rest/v2/sections', {
      headers: {
        'Authorization': `Bearer ${TODOIST_API_KEY}`
      }
    });
    
    const sections = sectionsResponse.ok ? await sectionsResponse.json() : [];
    const sectionMap = new Map(sections.map(s => [s.id, s.name]));
    
    // Add section names to tasks
    const tasksWithSections = tasks.map(task => ({
      ...task,
      section: task.section_id ? { name: sectionMap.get(task.section_id) } : null
    }));
    
    res.json(tasksWithSections);
  } catch (err) {
    console.error('Todoist fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new task in Todoist
app.post('/api/todoist/tasks', async (req, res) => {
  try {
    const { content, section } = req.body;
    
    // Get or create section
    let sectionId = null;
    if (section) {
      const sectionsResponse = await fetch('https://api.todoist.com/rest/v2/sections', {
        headers: { 'Authorization': `Bearer ${TODOIST_API_KEY}` }
      });
      const sections = await sectionsResponse.json();
      const existingSection = sections.find(s => s.name === section);
      
      if (existingSection) {
        sectionId = existingSection.id;
      } else {
        // Create new section
        const createSectionResponse = await fetch('https://api.todoist.com/rest/v2/sections', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${TODOIST_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: section })
        });
        const newSection = await createSectionResponse.json();
        sectionId = newSection.id;
      }
    }
    
    const response = await fetch('https://api.todoist.com/rest/v2/tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TODOIST_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content,
        section_id: sectionId,
        labels: section ? [section] : []
      })
    });
    
    if (!response.ok) {
      throw new Error(`Todoist API error: ${response.status}`);
    }
    
    const task = await response.json();
    res.json(task);
  } catch (err) {
    console.error('Todoist create error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Complete a task
app.post('/api/todoist/tasks/:id/complete', async (req, res) => {
  try {
    const response = await fetch(`https://api.todoist.com/rest/v2/tasks/${req.params.id}/close`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TODOIST_API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Todoist API error: ${response.status}`);
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Todoist complete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// === AGENT CONTROL ROUTES ===

// Get all agents
app.get('/api/agents', (req, res) => {
  const agentsList = Array.from(agents.values()).sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json(agentsList);
});

// Spawn a new agent
app.post('/api/agents/spawn', async (req, res) => {
  try {
    const { type, task } = req.body;
    const agentId = `agent-${agentIdCounter++}`;
    
    const agent = {
      id: agentId,
      type,
      task,
      status: 'running',
      progress: 0,
      createdAt: new Date().toISOString(),
      completedAt: null,
      logs: []
    };
    
    agents.set(agentId, agent);
    
    // Simulate agent execution (in real implementation, this would spawn a process)
    simulateAgentExecution(agentId, type, task);
    
    res.json({ success: true, agentId, agent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get agent status
app.get('/api/agents/:id/status', (req, res) => {
  const agent = agents.get(req.params.id);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  res.json(agent);
});

// Simulate agent execution
function simulateAgentExecution(agentId, type, task) {
  const agent = agents.get(agentId);
  if (!agent) return;
  
  const steps = [
    { message: 'Initializing agent...', progress: 10 },
    { message: 'Analyzing task requirements...', progress: 25 },
    { message: 'Gathering resources...', progress: 40 },
    { message: type === 'research' ? 'Researching online...' : 'Writing code...', progress: 60 },
    { message: 'Processing results...', progress: 80 },
    { message: 'Finalizing output...', progress: 95 },
    { message: 'Task completed!', progress: 100 }
  ];
  
  let stepIndex = 0;
  
  const interval = setInterval(() => {
    if (stepIndex >= steps.length) {
      clearInterval(interval);
      agent.status = 'completed';
      agent.completedAt = new Date().toISOString();
      
      // Broadcast completion
      broadcast({ type: 'agent-complete', agentId });
      return;
    }
    
    const step = steps[stepIndex];
    agent.logs.push(step.message);
    agent.progress = step.progress;
    stepIndex++;
    
    // Broadcast update
    broadcast({ type: 'agent-update', agentId, agent });
  }, 2000);
}

// === COMMAND CENTER ROUTES ===

// Execute a command
app.post('/api/command', async (req, res) => {
  try {
    const { command } = req.body;
    
    // Parse intent
    const intent = parseIntent(command);
    const agentType = determineAgentType(intent, command);
    
    // Spawn agent
    const agentId = `agent-${agentIdCounter++}`;
    const agent = {
      id: agentId,
      type: agentType,
      task: command,
      intent,
      status: 'running',
      progress: 0,
      createdAt: new Date().toISOString(),
      completedAt: null,
      logs: []
    };
    
    agents.set(agentId, agent);
    
    // Start execution
    simulateAgentExecution(agentId, agentType, command);
    
    res.json({ 
      success: true, 
      agentId, 
      agentType,
      intent,
      message: `Spawning ${agentType} agent for: ${command}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function parseIntent(command) {
  const lower = command.toLowerCase();
  
  if (lower.includes('research') || lower.includes('find') || lower.includes('search')) {
    return 'research';
  }
  if (lower.includes('build') || lower.includes('create') || lower.includes('develop') || lower.includes('code')) {
    return 'development';
  }
  if (lower.includes('write') || lower.includes('document') || lower.includes('draft')) {
    return 'writing';
  }
  if (lower.includes('analyze') || lower.includes('review') || lower.includes('check')) {
    return 'analysis';
  }
  return 'general';
}

function determineAgentType(intent, command) {
  const lower = command.toLowerCase();
  
  if (intent === 'research' || lower.includes('research')) return 'research';
  if (intent === 'development' || lower.includes('build') || lower.includes('create')) return 'dev';
  if (intent === 'writing') return 'writer';
  if (intent === 'analysis') return 'analyzer';
  return 'general';
}

// === PROJECT CONTEXT ROUTES ===

// Get project context
app.get('/api/project', async (req, res) => {
  try {
    const workspaceRoot = process.env.WORKSPACE_ROOT || process.cwd();
    
    // Get project name from package.json or directory name
    let projectName = path.basename(workspaceRoot);
    let packageJson;
    try {
      packageJson = JSON.parse(fs.readFileSync(path.join(workspaceRoot, 'package.json'), 'utf8'));
      projectName = packageJson.name || projectName;
    } catch (e) {
      // No package.json
    }
    
    // Get git info
    let branch = 'main';
    let commits = [];
    let recentFiles = [];
    
    try {
      // Get current branch
      branch = execSync('git rev-parse --abbrev-ref HEAD', { 
        cwd: workspaceRoot, 
        encoding: 'utf8' 
      }).trim();
      
      // Get recent commits
      const gitLog = execSync(
        'git log --pretty=format:"%h|%s|%an|%ad" --date=short -10',
        { cwd: workspaceRoot, encoding: 'utf8' }
      );
      
      commits = gitLog.split('\n').filter(Boolean).map(line => {
        const [hash, message, author, date] = line.split('|');
        return { hash, message, author, date };
      });
      
      // Get recent file changes
      const statusOutput = execSync(
        'git diff --name-status HEAD~5..HEAD',
        { cwd: workspaceRoot, encoding: 'utf8' }
      );
      
      const fileChanges = statusOutput.split('\n').filter(Boolean);
      const fileChangeCounts = {};
      
      fileChanges.forEach(line => {
        const [status, file] = line.split('\t');
        if (file) {
          fileChangeCounts[file] = {
            changeType: status === 'A' ? 'added' : status === 'D' ? 'deleted' : 'modified',
            count: (fileChangeCounts[file]?.count || 0) + 1
          };
        }
      });
      
      recentFiles = Object.entries(fileChangeCounts)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
        
    } catch (e) {
      // Not a git repo or git not available
    }
    
    res.json({
      name: projectName,
      branch,
      path: workspaceRoot,
      commits,
      recentFiles,
      packageJson: packageJson ? { 
        name: packageJson.name, 
        version: packageJson.version,
        description: packageJson.description
      } : null
    });
  } catch (err) {
    console.error('Project context error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Open project in editor
app.post('/api/project/open', (req, res) => {
  try {
    const { editor } = req.body;
    const workspaceRoot = process.env.WORKSPACE_ROOT || process.cwd();
    
    if (editor === 'vscode') {
      exec(`code "${workspaceRoot}"`, (err) => {
        if (err) {
          console.error('Failed to open VS Code:', err);
        }
      });
    } else if (editor === 'folder') {
      // Platform-specific folder opening
      const cmd = process.platform === 'darwin' ? 'open' : 
                  process.platform === 'win32' ? 'explorer' : 'xdg-open';
      exec(`${cmd} "${workspaceRoot}"`);
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === EXISTING ROUTES ===

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.1.0'
  });
});

app.get('/api/tasks', (req, res) => {
  const tasksPath = path.join(DATA_DIR, 'tasks.json');
  if (fs.existsSync(tasksPath)) {
    res.json(JSON.parse(fs.readFileSync(tasksPath, 'utf8')));
  } else {
    res.json([]);
  }
});

app.post('/api/tasks', (req, res) => {
  const tasksPath = path.join(DATA_DIR, 'tasks.json');
  let tasks = [];
  if (fs.existsSync(tasksPath)) {
    tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
  }
  const newTask = {
    id: Date.now(),
    title: req.body.title,
    description: req.body.description,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  tasks.push(newTask);
  fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));
  res.json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const tasksPath = path.join(DATA_DIR, 'tasks.json');
  let tasks = [];
  if (fs.existsSync(tasksPath)) {
    tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
  }
  const taskIndex = tasks.findIndex(t => t.id == req.params.id);
  if (taskIndex > -1) {
    tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
    fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));
    res.json(tasks[taskIndex]);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  const tasksPath = path.join(DATA_DIR, 'tasks.json');
  let tasks = [];
  if (fs.existsSync(tasksPath)) {
    tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
  }
  tasks = tasks.filter(t => t.id != req.params.id);
  fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));
  res.json({ success: true });
});

app.get('/api/files', (req, res) => {
  const uploadDir = path.join(DATA_DIR, 'uploads');
  if (!fs.existsSync(uploadDir)) {
    return res.json([]);
  }
  const files = fs.readdirSync(uploadDir).map(filename => {
    const stats = fs.statSync(path.join(uploadDir, filename));
    return {
      name: filename,
      size: stats.size,
      modified: stats.mtime
    };
  });
  res.json(files);
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  res.json({ success: true, filename: req.file.filename });
});

app.get('/api/config', (req, res) => {
  const configPath = path.join(__dirname, 'config.json');
  if (fs.existsSync(configPath)) {
    res.json(JSON.parse(fs.readFileSync(configPath, 'utf8')));
  } else {
    res.json({});
  }
});

app.post('/api/config', (req, res) => {
  const configPath = path.join(__dirname, 'config.json');
  fs.writeFileSync(configPath, JSON.stringify(req.body, null, 2));
  res.json({ success: true });
});

// WebSocket handling
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      // Broadcast to all connected clients
      broadcast(data);
    } catch (e) {
      console.error('Invalid message:', e);
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Mission Control Dashboard v1.1.0 running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📋 Todoist integration: ${TODOIST_API_KEY ? 'enabled' : 'disabled'}`);
});
