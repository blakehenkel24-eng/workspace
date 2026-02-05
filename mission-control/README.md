# 🚀 Mission Control Dashboard

A modern web dashboard for managing OpenClaw agents, tasks, files, and configuration.

## Features

- **💬 Chat** - Real-time messaging interface
- **🧠 Memory** - Store and manage memories locally
- **📁 Files** - Upload and manage files with multer
- **🛠️ Tools** - Quick access to common tools
- **📊 Status** - System monitoring and health checks
- **✅ Tasks** - Task management with CRUD operations
- **⚙️ Config** - Dashboard configuration and settings

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd mission-control

# Install dependencies
npm install

# Start the server
npm start
```

The dashboard will be available at `http://localhost:3000`

## Configuration

Configuration is stored in `config.json` and can be edited through the Config panel in the UI.

## API Endpoints

- `GET /api/status` - System status
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create a task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `GET /api/files` - List uploaded files
- `POST /api/upload` - Upload a file
- `GET /api/config` - Get configuration
- `POST /api/config` - Save configuration

## WebSocket

Real-time updates are provided via WebSocket connection for chat and live status updates.

## Development

```bash
# Run in development mode
npm run dev
```

## License

MIT