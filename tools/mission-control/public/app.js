class MissionControl {
  constructor() {
    this.ws = null;
    this.config = {
      theme: 'auto',
      notifications: true,
      refreshInterval: 30
    };
    this.memories = [];
    this.tasks = [];
    this.files = [];
    this.agents = [];
    this.runningAgents = new Map();
    this.currentCommand = null;
    this.init();
  }

  init() {
    this.setupTheme();
    this.setupWebSocket();
    this.setupEventListeners();
    this.loadData();
    this.startAutoRefresh();
    
    // Load initial data for new features
    this.loadTodoistTasks();
    this.loadProjectContext();
    this.loadAgents();
  }

  // Theme Management
  setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'auto';
    this.setTheme(savedTheme);
  }

  setTheme(theme) {
    this.config.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }

  toggleTheme() {
    const themes = ['auto', 'light', 'dark'];
    const currentIndex = themes.indexOf(this.config.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    this.setTheme(nextTheme);
  }

  // WebSocket
  setupWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      this.updateConnectionStatus(true);
    };
    
    this.ws.onclose = () => {
      this.updateConnectionStatus(false);
      setTimeout(() => this.setupWebSocket(), 3000);
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleWebSocketMessage(data);
    };
  }

  updateConnectionStatus(connected) {
    const statusEl = document.getElementById('connection-status');
    statusEl.textContent = connected ? 'Online' : 'Offline';
    statusEl.className = `status-badge ${connected ? 'online' : 'offline'}`;
  }

  handleWebSocketMessage(data) {
    if (data.type === 'chat') {
      this.addChatMessage(data.message, data.sender);
    } else if (data.type === 'agent-update') {
      this.handleAgentUpdate(data);
    } else if (data.type === 'agent-complete') {
      this.handleAgentComplete(data);
    }
  }

  sendWebSocketMessage(type, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    }
  }

  // === COMMAND CENTER ===
  setupCommandCenterListeners() {
    // Command input
    document.getElementById('command-submit').addEventListener('click', () => {
      this.executeCommand();
    });
    document.getElementById('command-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.executeCommand();
    });

    // Suggestion buttons
    document.querySelectorAll('.suggestion-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const intent = e.currentTarget.dataset.intent;
        const input = document.getElementById('command-input');
        const suggestions = {
          'research': 'Research about ',
          'dev': 'Build a ',
          'write': 'Write documentation for ',
          'analyze': 'Analyze the code for '
        };
        input.value = suggestions[intent] || '';
        input.focus();
      });
    });
  }

  async executeCommand() {
    const input = document.getElementById('command-input');
    const command = input.value.trim();
    if (!command) return;

    // Show progress panel
    this.showCommandProgress();
    this.addProgressLog('Parsing command...');

    try {
      const response = await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.currentCommand = result;
        document.getElementById('progress-agent-name').textContent = result.agentType;
        this.addProgressLog(`Spawning ${result.agentType} agent...`);
        this.updateProgressBar(20);
        
        // Start polling for progress
        this.startProgressPolling(result.agentId);
      } else {
        this.addProgressLog(`Error: ${result.error}`, 'error');
      }
    } catch (err) {
      this.addProgressLog(`Error: ${err.message}`, 'error');
    }

    input.value = '';
  }

  showCommandProgress() {
    const progressPanel = document.getElementById('command-progress');
    progressPanel.classList.remove('hidden');
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('progress-logs').innerHTML = '';
    document.querySelector('.progress-status').textContent = 'Running...';
  }

  hideCommandProgress() {
    const progressPanel = document.getElementById('command-progress');
    progressPanel.classList.add('hidden');
  }

  updateProgressBar(percent) {
    document.getElementById('progress-fill').style.width = `${percent}%`;
  }

  addProgressLog(message, type = 'info') {
    const logs = document.getElementById('progress-logs');
    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = 'progress-log-entry';
    entry.innerHTML = `<span class="progress-log-time">[${time}]</span> ${this.escapeHtml(message)}`;
    logs.appendChild(entry);
    logs.scrollTop = logs.scrollHeight;
  }

  startProgressPolling(agentId) {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/agents/${agentId}/status`);
        const status = await response.json();
        
        this.updateProgressBar(status.progress || 0);
        
        if (status.logs && status.logs.length > 0) {
          status.logs.forEach(log => this.addProgressLog(log));
        }
        
        if (status.status === 'completed') {
          clearInterval(pollInterval);
          document.querySelector('.progress-status').textContent = 'Completed!';
          this.addProgressLog('Agent completed successfully!', 'success');
          this.loadAgents();
          setTimeout(() => this.hideCommandProgress(), 3000);
        } else if (status.status === 'error') {
          clearInterval(pollInterval);
          document.querySelector('.progress-status').textContent = 'Error';
          this.addProgressLog('Agent failed: ' + status.error, 'error');
        }
      } catch (err) {
        console.error('Progress polling error:', err);
      }
    }, 1000);
  }

  // === AGENT CONTROL ===
  setupAgentListeners() {
    document.getElementById('spawn-research').addEventListener('click', () => {
      this.spawnAgent('research');
    });
    document.getElementById('spawn-dev').addEventListener('click', () => {
      this.spawnAgent('dev');
    });
  }

  async spawnAgent(type) {
    const task = prompt(`What should the ${type} agent do?`);
    if (!task) return;

    try {
      const response = await fetch('/api/agents/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, task })
      });
      
      const result = await response.json();
      if (result.success) {
        this.showNotification(`${type} agent spawned successfully`);
        this.loadAgents();
      } else {
        this.showNotification(`Failed to spawn agent: ${result.error}`);
      }
    } catch (err) {
      this.showNotification(`Error: ${err.message}`);
    }
  }

  async loadAgents() {
    try {
      const response = await fetch('/api/agents');
      const agents = await response.json();
      this.renderAgents(agents);
    } catch (err) {
      console.error('Failed to load agents:', err);
    }
  }

  renderAgents(agents) {
    const runningContainer = document.getElementById('running-agents');
    const completedContainer = document.getElementById('completed-agents');
    
    const running = agents.filter(a => a.status === 'running');
    const completed = agents.filter(a => a.status === 'completed' || a.status === 'error');
    
    if (running.length === 0) {
      runningContainer.innerHTML = '<p class="empty-state">No active agents</p>';
    } else {
      runningContainer.innerHTML = running.map(a => this.renderAgentCard(a)).join('');
    }
    
    if (completed.length === 0) {
      completedContainer.innerHTML = '<p class="empty-state">No recent completions</p>';
    } else {
      completedContainer.innerHTML = completed.slice(0, 5).map(a => this.renderAgentCard(a)).join('');
    }
  }

  renderAgentCard(agent) {
    const statusIcons = {
      'running': '⏳',
      'completed': '✅',
      'error': '❌',
      'pending': '⏸️'
    };
    
    const time = new Date(agent.createdAt).toLocaleTimeString();
    
    return `
      <div class="agent-card ${agent.status}">
        <span class="agent-status-icon">${statusIcons[agent.status] || '⏸️'}</span>
        <div class="agent-info">
          <span class="agent-name">${agent.type} Agent</span>
          <span class="agent-task" title="${this.escapeHtml(agent.task)}">${this.escapeHtml(agent.task)}</span>
        </div>
        <span class="agent-time">${time}</span>
      </div>
    `;
  }

  handleAgentUpdate(data) {
    this.loadAgents();
  }

  handleAgentComplete(data) {
    this.loadAgents();
    this.showNotification(`Agent ${data.agentId} completed!`);
  }

  // === TODOIST INTEGRATION ===
  setupTodoistListeners() {
    document.getElementById('todoist-refresh').addEventListener('click', () => {
      this.loadTodoistTasks();
    });
    
    document.getElementById('todoist-filter').addEventListener('change', () => {
      this.renderTodoistTasks();
    });
    
    document.getElementById('todoist-add').addEventListener('click', () => {
      this.addTodoistTask();
    });
    
    document.getElementById('todoist-new-task').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTodoistTask();
    });
  }

  async loadTodoistTasks() {
    try {
      const response = await fetch('/api/todoist/tasks');
      this.todoistTasks = await response.json();
      this.renderTodoistTasks();
    } catch (err) {
      console.error('Failed to load Todoist tasks:', err);
      document.getElementById('todoist-tasks').innerHTML = 
        '<p class="empty-state">Failed to load tasks</p>';
    }
  }

  renderTodoistTasks() {
    const container = document.getElementById('todoist-tasks');
    const filter = document.getElementById('todoist-filter').value;
    
    let tasks = this.todoistTasks || [];
    
    // Filter out completed tasks and apply section filter
    tasks = tasks.filter(t => !t.is_completed);
    
    if (filter !== 'all') {
      tasks = tasks.filter(t => {
        const section = t.section?.name || t.labels?.find(l => 
          ['Development', 'Research', 'Design'].includes(l)
        );
        return section === filter;
      });
    }
    
    if (tasks.length === 0) {
      container.innerHTML = '<p class="empty-state">No tasks found</p>';
      return;
    }
    
    container.innerHTML = tasks.map(t => this.renderTodoistTaskItem(t)).join('');
    
    // Add event listeners for checkboxes
    container.querySelectorAll('.todoist-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        this.completeTodoistTask(e.target.dataset.taskId);
      });
    });
  }

  renderTodoistTaskItem(task) {
    const section = task.section?.name || task.labels?.find(l => 
      ['Development', 'Research', 'Design'].includes(l)
    ) || '';
    
    const sectionClass = section.toLowerCase();
    
    return `
      <div class="todoist-task-item" data-task-id="${task.id}">
        <input type="checkbox" class="todoist-checkbox" data-task-id="${task.id}">
        <div class="task-content">
          <span class="task-title">${this.escapeHtml(task.content)}</span>
          ${section ? `<span class="task-section ${sectionClass}">${section}</span>` : ''}
        </div>
      </div>
    `;
  }

  async addTodoistTask() {
    const input = document.getElementById('todoist-new-task');
    const sectionSelect = document.getElementById('todoist-section');
    const content = input.value.trim();
    
    if (!content) return;
    
    try {
      const response = await fetch('/api/todoist/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          section: sectionSelect.value
        })
      });
      
      if (response.ok) {
        input.value = '';
        this.loadTodoistTasks();
        this.showNotification('Task added to Todoist');
      }
    } catch (err) {
      this.showNotification(`Error: ${err.message}`);
    }
  }

  async completeTodoistTask(taskId) {
    try {
      const response = await fetch(`/api/todoist/tasks/${taskId}/complete`, {
        method: 'POST'
      });
      
      if (response.ok) {
        this.loadTodoistTasks();
        this.showNotification('Task completed');
      }
    } catch (err) {
      this.showNotification(`Error: ${err.message}`);
    }
  }

  // === PROJECT CONTEXT ===
  setupProjectListeners() {
    document.getElementById('open-vscode').addEventListener('click', () => {
      this.openInVSCode();
    });
    document.getElementById('open-folder').addEventListener('click', () => {
      this.openFolder();
    });
  }

  async loadProjectContext() {
    try {
      const response = await fetch('/api/project');
      const project = await response.json();
      this.renderProjectContext(project);
    } catch (err) {
      console.error('Failed to load project context:', err);
    }
  }

  renderProjectContext(project) {
    document.getElementById('project-name').textContent = project.name || 'Unknown Project';
    document.getElementById('project-branch').textContent = project.branch || 'main';
    
    // Render recent commits
    const commitsContainer = document.getElementById('recent-commits');
    if (project.commits && project.commits.length > 0) {
      commitsContainer.innerHTML = project.commits.slice(0, 5).map(c => `
        <div class="commit-item">
          <div class="commit-message">${this.escapeHtml(c.message)}</div>
          <div class="commit-meta">${c.author} • ${this.timeAgo(c.date)}</div>
        </div>
      `).join('');
    } else {
      commitsContainer.innerHTML = '<p class="empty-state">No recent commits</p>';
    }
    
    // Render recent files
    const filesContainer = document.getElementById('recent-files');
    if (project.recentFiles && project.recentFiles.length > 0) {
      filesContainer.innerHTML = project.recentFiles.slice(0, 5).map(f => `
        <div class="recent-file-item">
          <span class="file-name">${this.escapeHtml(f.name)}</span>
          <span class="file-change ${f.changeType}">${f.changeType}</span>
        </div>
      `).join('');
    } else {
      filesContainer.innerHTML = '<p class="empty-state">No recent changes</p>';
    }
  }

  async openInVSCode() {
    try {
      await fetch('/api/project/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editor: 'vscode' })
      });
    } catch (err) {
      console.error('Failed to open VS Code:', err);
    }
  }

  async openFolder() {
    try {
      await fetch('/api/project/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editor: 'folder' })
      });
    } catch (err) {
      console.error('Failed to open folder:', err);
    }
  }

  // === Event Listeners ===
  setupEventListeners() {
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
      this.toggleTheme();
    });

    // Chat
    document.getElementById('chat-send').addEventListener('click', () => {
      this.sendChatMessage();
    });
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendChatMessage();
    });

    // Memory
    document.getElementById('memory-add').addEventListener('click', () => {
      this.addMemory();
    });
    document.getElementById('memory-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addMemory();
    });

    // Tasks
    document.getElementById('task-add').addEventListener('click', () => {
      this.addTask();
    });
    document.getElementById('task-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTask();
    });

    // Files
    document.getElementById('file-select').addEventListener('click', () => {
      document.getElementById('file-input').click();
    });
    document.getElementById('file-input').addEventListener('change', (e) => {
      const uploadBtn = document.getElementById('file-upload');
      uploadBtn.disabled = !e.target.files.length;
      if (e.target.files.length) {
        uploadBtn.textContent = `Upload ${e.target.files[0].name}`;
      }
    });
    document.getElementById('file-upload').addEventListener('click', () => {
      this.uploadFile();
    });

    // Config
    document.getElementById('config-save').addEventListener('click', () => {
      this.saveConfig();
    });

    // Tools
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tool = e.currentTarget.dataset.tool;
        this.handleToolClick(tool);
      });
    });

    // New feature listeners
    this.setupCommandCenterListeners();
    this.setupAgentListeners();
    this.setupTodoistListeners();
    this.setupProjectListeners();
  }

  // Chat Methods
  sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    this.addChatMessage(message, 'user');
    this.sendWebSocketMessage('chat', { message, sender: 'user' });
    input.value = '';

    // Simulate response
    setTimeout(() => {
      const response = `Received: ${message}`;
      this.addChatMessage(response, 'system');
    }, 500);
  }

  addChatMessage(message, sender) {
    const container = document.getElementById('chat-messages');
    const msgEl = document.createElement('div');
    msgEl.className = `chat-message ${sender}`;
    msgEl.textContent = message;
    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
  }

  // Memory Methods
  addMemory() {
    const input = document.getElementById('memory-input');
    const text = input.value.trim();
    if (!text) return;

    this.memories.push({
      id: Date.now(),
      text,
      timestamp: new Date().toISOString()
    });

    this.renderMemories();
    input.value = '';
    localStorage.setItem('memories', JSON.stringify(this.memories));
  }

  deleteMemory(id) {
    this.memories = this.memories.filter(m => m.id !== id);
    this.renderMemories();
    localStorage.setItem('memories', JSON.stringify(this.memories));
  }

  renderMemories() {
    const container = document.getElementById('memory-list');
    if (this.memories.length === 0) {
      container.innerHTML = '<p class="empty-state">No memories stored</p>';
      return;
    }

    container.innerHTML = this.memories.map(m => `
      <div class="memory-item">
        <span>${this.escapeHtml(m.text)}</span>
        <button onclick="missionControl.deleteMemory(${m.id})">✕</button>
      </div>
    `).join('');
  }

  // Task Methods
  async addTask() {
    const input = document.getElementById('task-input');
    const title = input.value.trim();
    if (!title) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: '' })
      });
      const task = await response.json();
      this.tasks.push(task);
      this.renderTasks();
      input.value = '';
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  }

  async toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;

    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: task.status === 'completed' ? 'pending' : 'completed' })
      });
      task.status = task.status === 'completed' ? 'pending' : 'completed';
      this.renderTasks();
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  }

  async deleteTask(id) {
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      this.tasks = this.tasks.filter(t => t.id !== id);
      this.renderTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  }

  renderTasks() {
    const container = document.getElementById('tasks-list');
    if (this.tasks.length === 0) {
      container.innerHTML = '<p class="empty-state">No tasks</p>';
      return;
    }

    container.innerHTML = this.tasks.map(t => `
      <div class="task-item ${t.status === 'completed' ? 'completed' : ''}">
        <input type="checkbox" ${t.status === 'completed' ? 'checked' : ''} 
               onchange="missionControl.toggleTask(${t.id})">
        <span class="task-title">${this.escapeHtml(t.title)}</span>
        <button class="task-delete" onclick="missionControl.deleteTask(${t.id})">✕</button>
      </div>
    `).join('');
  }

  // File Methods
  async uploadFile() {
    const input = document.getElementById('file-input');
    if (!input.files.length) return;

    const formData = new FormData();
    formData.append('file', input.files[0]);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (result.success) {
        this.loadFiles();
        input.value = '';
        document.getElementById('file-upload').disabled = true;
        document.getElementById('file-upload').textContent = 'Upload';
      }
    } catch (err) {
      console.error('Failed to upload file:', err);
    }
  }

  async loadFiles() {
    try {
      const response = await fetch('/api/files');
      this.files = await response.json();
      this.renderFiles();
    } catch (err) {
      console.error('Failed to load files:', err);
    }
  }

  renderFiles() {
    const container = document.getElementById('files-list');
    if (this.files.length === 0) {
      container.innerHTML = '<p class="empty-state">No files uploaded</p>';
      return;
    }

    container.innerHTML = this.files.map(f => `
      <div class="file-item">
        <div class="file-info">
          <span class="file-name">${this.escapeHtml(f.name)}</span>
          <span class="file-size">${this.formatBytes(f.size)}</span>
        </div>
      </div>
    `).join('');
  }

  // Status Methods
  async updateStatus() {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      
      document.getElementById('system-status').textContent = data.status;
      document.getElementById('system-uptime').textContent = this.formatDuration(data.uptime);
      document.getElementById('system-version').textContent = data.version;
      document.getElementById('system-timestamp').textContent = new Date(data.timestamp).toLocaleTimeString();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  }

  // Config Methods
  async loadConfig() {
    try {
      const response = await fetch('/api/config');
      const savedConfig = await response.json();
      this.config = { ...this.config, ...savedConfig };
      
      document.getElementById('config-theme').value = this.config.theme;
      document.getElementById('config-notifications').checked = this.config.notifications;
      document.getElementById('config-refresh').value = this.config.refreshInterval;
    } catch (err) {
      console.error('Failed to load config:', err);
    }
  }

  async saveConfig() {
    this.config.theme = document.getElementById('config-theme').value;
    this.config.notifications = document.getElementById('config-notifications').checked;
    this.config.refreshInterval = parseInt(document.getElementById('config-refresh').value);

    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.config)
      });
      
      this.setTheme(this.config.theme);
      this.showNotification('Configuration saved');
    } catch (err) {
      console.error('Failed to save config:', err);
    }
  }

  // Tool Methods
  handleToolClick(tool) {
    switch(tool) {
      case 'search':
        this.showNotification('Search tool - Coming soon');
        break;
      case 'browser':
        this.showNotification('Browser tool - Coming soon');
        break;
      case 'exec':
        this.showNotification('Execute tool - Coming soon');
        break;
      case 'image':
        this.showNotification('Image tool - Coming soon');
        break;
      case 'tts':
        this.showNotification('TTS tool - Coming soon');
        break;
      case 'canvas':
        this.showNotification('Canvas tool - Coming soon');
        break;
    }
  }

  // Data Loading
  async loadData() {
    // Load memories from localStorage
    const savedMemories = localStorage.getItem('memories');
    if (savedMemories) {
      this.memories = JSON.parse(savedMemories);
      this.renderMemories();
    }

    // Load tasks from server
    try {
      const response = await fetch('/api/tasks');
      this.tasks = await response.json();
      this.renderTasks();
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }

    // Load files
    this.loadFiles();

    // Load config
    this.loadConfig();

    // Update status
    this.updateStatus();
  }

  startAutoRefresh() {
    setInterval(() => {
      this.updateStatus();
      this.loadAgents();
    }, this.config.refreshInterval * 1000);
  }

  // Utilities
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  }

  timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  showNotification(message) {
    if (this.config.notifications && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Mission Control', { body: message });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Mission Control', { body: message });
          }
        });
      }
    }
    
    // Also show as a toast
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--accent-primary);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
    
    console.log(message);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.missionControl = new MissionControl();
});
