# SlideTheory MVP v1.1.0

AI-powered consulting slide generator. Create professional McKinsey/BCG-style slides in seconds.

## Features

### Core Features
- **3 Slide Types**: Executive Summary, Market Analysis, Financial Model
- **AI-Powered Content**: Kimi AI generates structured, professional content
- **Consulting Aesthetic**: Clean, professional templates inspired by top consulting firms
- **Mobile Responsive**: Works on desktop and mobile devices
- **Built-in Analytics**: Track slide generation statistics

### Phase 2 - Export Formats (NEW)
- **PNG Export**: High-resolution slide images
- **PowerPoint (.pptx)**: Editable PowerPoint files
- **PDF Export**: Print-ready PDF documents
- **Multi-format Download**: Choose format from dropdown

### Phase 2 - Template Gallery (NEW)
- **6 Pre-built Templates**: Real consulting scenarios
  - Tech Startup Series B (Pitch Deck)
  - European Market Entry (Strategy)
  - PE Due Diligence Summary (Due Diligence)
  - DTC Brand Growth (Strategy)
  - SaaS Competitive Analysis (Strategy)
  - Q3 Board Financials (Financial)
- **One-click Loading**: Populate form instantly
- **Categories**: Pitch Deck, Strategy, Financial, Due Diligence

### Phase 2 - Documentation (NEW)
- [API.md](API.md) - Complete API documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment guide
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - FAQ and common issues
- [CHANGELOG.md](CHANGELOG.md) - Version history

## Quick Start

### Prerequisites

- Node.js 18+ 
- Kimi API key (optional, from https://platform.moonshot.cn/)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys (optional)
   ```
   
   Or export directly:
   ```bash
   export KIMI_API_KEY="your-kimi-api-key"  # optional
   export PORT=3000
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open in browser**:
   Navigate to `http://localhost:3000`

### Puppeteer Dependencies (Ubuntu/Debian)

If you encounter Chromium issues for PDF export, install system dependencies:

```bash
sudo apt-get update
sudo apt-get install -y \
  chromium-browser \
  libgconf-2-4 \
  libatk-bridge2.0-0 \
  libxss1 \
  libgtk-3-0 \
  libgbm-dev
```

Then set the environment variable:
```bash
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

## Usage

1. **Choose a Template** (optional): Click any template card to auto-fill
2. **Select Slide Type**: Executive Summary, Market Analysis, or Financial Model
3. **Enter Context**: Describe the purpose and key message
4. **Add Data Points**: Include metrics or bullet points
5. **Choose Audience**: C-Suite, Board, Investors, etc.
6. **Pick Framework**: Pyramid Principle, MECE, 2x2 Matrix, etc.
7. **Generate**: Click "Generate Slide" (Ctrl+Enter)
8. **Download**: Choose PNG, PPTX, or PDF from dropdown

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | Generate slide |
| `Ctrl + R` | Regenerate slide |
| `Ctrl + D` | Download PNG |
| `?` | Show help |
| `Esc` | Close modal |

## API Endpoints

### POST /api/generate
Generate a new slide.

**Request Body:**
```json
{
  "slideType": "Executive Summary",
  "context": "Q3 earnings presentation showing 23% revenue growth",
  "dataPoints": ["Revenue: $5M", "Growth: +23% YoY"],
  "targetAudience": "C-Suite",
  "framework": "Pyramid Principle"
}
```

**Response:**
```json
{
  "success": true,
  "slideId": "uuid",
  "imageUrl": "/slides/uuid.png",
  "title": "Generated slide title",
  "content": { ... },
  "expiresAt": "2025-02-05T04:21:00Z"
}
```

### POST /api/export/pptx
Export slide to PowerPoint format.

**Request Body:**
```json
{
  "slideType": "Executive Summary",
  "content": { ... }
}
```

### POST /api/export/pdf
Export slide to PDF format.

**Request Body:** Same as PPTX

### GET /api/templates
List all available templates.

### GET /api/templates/:id
Get specific template details.

### GET /api/health
Health check endpoint.

### GET /api/stats
Get analytics on slide generation.

See [API.md](API.md) for complete documentation.

## File Structure

```
build/
├── server.js                 # Express server
├── package.json              # Dependencies
├── README.md                # This file
├── API.md                   # API documentation
├── DEPLOYMENT.md            # Deployment guide
├── TROUBLESHOOTING.md       # FAQ and issues
├── CHANGELOG.md             # Version history
├── TESTING.md               # Test plan
├── public/
│   ├── index.html           # Frontend UI
│   ├── styles.css           # Design system
│   ├── app.js               # Frontend logic
│   └── templates/           # Template gallery
│       ├── index.json       # Template list
│       ├── tech-startup-series-b.json
│       ├── market-entry-europe.json
│       ├── pe-due-diligence.json
│       ├── dtc-growth-strategy.json
│       ├── competitive-analysis-saas.json
│       └── board-financial-review.json
├── lib/
│   ├── openai-client.js     # Kimi AI integration
│   ├── slide-generator.js   # HTML to image rendering
│   └── export-generator.js  # PPTX/PDF generation
└── tmp/
    ├── slides/              # Generated slide storage
    └── exports/             # Export files (PPTX/PDF)
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `KIMI_API_KEY` | Kimi API key (optional) | - |
| `KIMI_MODEL` | Kimi model to use | `kimi-coding/k2p5` |
| `PORT` | Server port | 3000 |
| `ANALYTICS_FILE` | Path to analytics JSON | `./tmp/analytics.json` |
| `PUPPETEER_EXECUTABLE_PATH` | Chromium path | auto-detected |

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions including:
- PM2 process management
- Nginx reverse proxy configuration
- SSL certificate setup
- Backup automation
- Docker deployment

### Quick Deploy

```bash
# Using PM2
npm install -g pm2
npm run pm2:start
pm2 save
pm2 startup

# Or manual
npm start
```

## Architecture

```
┌──────────────┐     POST /api/generate      ┌──────────────┐
│   Browser    │────────────────────────────▶│   Express    │
│  (Frontend)  │                             │   Server     │
└──────────────┘                             └──────┬───────┘
     ▲                                              │
     │         ┌───────────────────────────────────┼─────────────┐
     │         │                                   │             │
     │         │                         ┌─────────▼────────┐   │
     │         │                         │  Kimi AI /       │   │
     │         │                         │  Fallback Mode   │   │
     │         │                         └─────────┬────────┘   │
     │         │                                   │            │
     │         │         ┌─────────────────────────┼────────┐   │
     │         │         │                         │        │   │
     │         │    ┌────▼────┐   ┌────────┐  ┌───▼───┐ ┌──▼───┐
     │         └───▶│  PNG    │   │  PPTX  │  │  PDF  │ │ Stats│
     │              │ Export  │   │ Export │  │ Export│ │      │
     │              └────┬────┘   └───┬────┘  └───┬───┘ └──────┘
     │                   │            │           │
     └───────────────────┴────────────┴───────────┘
              GET /slides/:id.png
              GET /exports/:filename
```

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla HTML/CSS/JS
- **AI**: Moonshot Kimi API (with fallback mode)
- **Image Generation**: node-html-to-image (Puppeteer)
- **PowerPoint**: pptxgenjs
- **PDF**: Puppeteer

## Documentation

| Document | Description |
|----------|-------------|
| [API.md](API.md) | Complete API reference |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment guide |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common issues and solutions |
| [CHANGELOG.md](CHANGELOG.md) | Version history and roadmap |
| [TESTING.md](TESTING.md) | Test plan and checklist |

## Limitations (MVP)

- No authentication or user accounts
- Single slide generation only
- 3 slide types supported
- Slides expire after 24 hours
- Export files expire after 1 hour
- No slide history or editing

## License

MIT
