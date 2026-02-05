const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

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

// Routes
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
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
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      // Broadcast to all connected clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (e) {
      console.error('Invalid message:', e);
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Mission Control Dashboard running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});