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
    this.init();
  }

  init() {
    this.setupTheme();
    this.setupWebSocket();
    this.setupEventListeners();
    this.loadData();
    this.startAutoRefresh();
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
    }
  }

  sendWebSocketMessage(type, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    }
  }

  // Event Listeners
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
    console.log(message);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.missionControl = new MissionControl();
});