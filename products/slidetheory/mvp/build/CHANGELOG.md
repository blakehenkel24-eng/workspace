# SlideTheory Changelog

All notable changes to the SlideTheory MVP project.

## [1.1.0] - 2025-02-04

### Phase 2: Production-Grade Features

#### Added
- **Export Formats**
  - PowerPoint (.pptx) export using pptxgenjs
  - PDF export using Puppeteer
  - Multi-format download dropdown in UI
  - API endpoints `/api/export/pptx` and `/api/export/pdf`

- **Template Gallery**
  - 6 pre-built professional templates:
    - Tech Startup Series B (Pitch Deck)
    - European Market Entry (Strategy)
    - PE Due Diligence Summary (Due Diligence)
    - DTC Brand Growth (Strategy)
    - SaaS Competitive Analysis (Strategy)
    - Q3 Board Financials (Financial)
  - One-click template loading
  - Template categories: Pitch Deck, Strategy, Financial, Due Diligence
  - API endpoints `/api/templates` and `/api/templates/:id`

- **Visual Upgrade**
  - McKinsey-inspired color palette:
    - Navy primary (#003366)
    - Light gray backgrounds (#F5F5F5)
    - Blue accents (#4A90E2)
  - Professional typography with Inter font
  - Subtle shadows and borders for depth
  - Improved chart styling

- **Real Content Examples**
  - Tech startup Series B fundraising scenario (AI SaaS)
  - European market expansion strategy
  - Private equity due diligence template
  - DTC brand growth strategy
  - SaaS competitive positioning
  - Board financial review template

- **Documentation**
  - API.md - Complete API documentation
  - DEPLOYMENT.md - Production deployment guide
  - TROUBLESHOOTING.md - FAQ and common issues
  - Updated TESTING.md with Phase 2 test cases

#### Changed
- Updated server.js with new export and template endpoints
- Enhanced frontend app.js with template loading and multi-format exports
- Improved HTML template gallery with all 6 templates
- Extended dropdown menu for download options
- Version bump from 1.0.0 to 1.1.0

#### Dependencies Added
- `pptxgenjs` - PowerPoint generation library
- `puppeteer` - PDF generation via headless Chrome

---

## [1.0.0] - 2025-02-04

### Phase 1: MVP Foundation

#### Added
- **Core Slide Generation**
  - AI-powered content generation via Kimi API
  - Three slide types: Executive Summary, Market Analysis, Financial Model
  - Automatic image rendering to PNG
  - Fallback content generation when API unavailable

- **Frontend UI**
  - Split-panel design (input / preview)
  - Form validation with character counters
  - Real-time validation feedback
  - Loading states and progress indicators
  - Toast notifications

- **Slide Types**
  - Executive Summary with key points and recommendations
  - Market Analysis with market size and chart visualization
  - Financial Model with metrics cards and data tables

- **Professional Styling**
  - McKinsey-inspired design system
  - CSS custom properties for theming
  - Responsive layout for mobile/tablet
  - Accessible form controls

- **API Endpoints**
  - `GET /api/health` - Health check
  - `POST /api/generate` - Generate slide
  - `GET /api/stats` - Usage analytics
  - `GET /slides/:id.png` - Download slide image

- **Analytics**
  - Slide generation tracking
  - Usage by type and date
  - JSON file-based storage

- **Scripts**
  - `npm start` - Production server
  - `npm run dev` - Development with watch
  - PM2 scripts for process management

- **Documentation**
  - README.md with setup instructions
  - TESTING.md with test plan
  - DEPLOYMENT.md with basic deployment info

#### Dependencies
- `express` - Web framework
- `node-html-to-image` - HTML to PNG conversion
- `dotenv` - Environment configuration

---

## Roadmap

### Upcoming Features

#### Phase 3 (Planned)
- [ ] Multi-slide deck generation
- [ ] Custom template builder
- [ ] User accounts and saved slides
- [ ] Real-time collaboration
- [ ] AI model selection (GPT-4, Claude, etc.)
- [ ] Advanced chart types (pie, line, waterfall)
- [ ] Slide transitions and animations
- [ ] PowerPoint template import

#### Phase 4 (Future)
- [ ] Brand kit integration (colors, fonts, logos)
- [ ] Team workspaces
- [ ] Presentation mode
- [ ] Analytics dashboard
- [ ] API rate limiting and keys
- [ ] Webhook integrations

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.1.0 | 2025-02-04 | Phase 2: Export formats, templates, docs |
| 1.0.0 | 2025-02-04 | Phase 1: MVP foundation |

---

## Breaking Changes

None in 1.1.0 - fully backward compatible with 1.0.0

## Migration Guide

### From 1.0.0 to 1.1.0

1. Install new dependencies:
   ```bash
   npm install
   ```

2. No code changes required - existing API calls work unchanged

3. New features are additive only

4. Update any custom templates to new format if desired
