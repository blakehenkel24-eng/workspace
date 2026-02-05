# SlideTheory Changelog

All notable changes to SlideTheory are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Team workspaces (coming in v2.1.0)
- Real-time collaboration features
- Presentation mode with speaker notes

### Planned
- AI image generation for backgrounds
- Native mobile apps (iOS/Android)
- Custom template marketplace

---

## [2.0.0] - 2026-02-05

### Added
- **AI Image Generation Engine** — Transitioned from HTML rendering to true AI image generation
- **Enhanced Template System** — Dynamic template marketplace with 6 core templates
- **User Accounts** — Persistent user identity with slide history
- **Multi-Format Export** — PNG, PPTX, PDF, and HTML export options
- **Keyboard Shortcuts** — Full keyboard navigation support (Ctrl+Enter, Ctrl+R, Ctrl+D, ?)
- **Mobile Responsive Design** — Optimized for tablets and mobile devices
- **Accessibility Improvements** — WCAG 2.1 AA compliance, screen reader support
- **API v2** — RESTful API with JWT authentication
- **Rate Limiting** — Tiered rate limits (free: 5/hr, pro: 100/hr)
- **Progressive Loading States** — Visual feedback during generation
- **Dark Mode Support** — Automatic and manual dark mode toggle
- **File Upload** — CSV/Excel data import support

### Changed
- Complete UI redesign with modern aesthetic
- Improved generation speed (avg 3.5s vs 5s in v1.x)
- Enhanced text legibility in generated slides
- Updated color scheme options (navy, dark, light)

### Deprecated
- v1.x HTML-only rendering (deprecated, will be removed in v3.0)
- Anonymous unlimited generation (now rate-limited)

### Removed
- Legacy v1.x template system (replaced with dynamic templates)

### Fixed
- Text overflow issues on complex slides
- Export quality inconsistencies
- Mobile touch gesture conflicts
- Keyboard navigation gaps

### Security
- Implemented JWT-based authentication
- Added API key management
- Enhanced data encryption at rest (AES-256)
- CSRF protection for all state-changing requests

---

## [1.1.0] - 2026-01-15

### Added
- **6 Slide Types** — Executive Summary, Market Analysis, Financial Model, Competitive Analysis, Growth Strategy, Risk Assessment
- **6 Pre-built Templates** — Tech Startup Series B, European Market Entry, PE Due Diligence, DTC Growth Strategy, SaaS Competitive Analysis, Q3 Board Financials
- **4 Export Formats** — PNG, PPTX, PDF, HTML
- **Split-Panel UI** — Input on left, preview on right
- **Loading States** — Progress bar during generation
- **Keyboard Shortcuts** — Basic shortcuts (Ctrl+Enter generate, Ctrl+D download)
- **Mobile Responsive** — Basic mobile support
- **Express.js Backend** — Node.js/Express server setup
- **Kimi K2.5 Integration** — AI content generation
- **HTML Rendering** — Puppeteer-based slide rendering

### Changed
- Improved prompt engineering for better output quality
- Updated McKinsey-style visual design

### Fixed
- Memory leaks in Puppeteer rendering
- CORS issues with API requests

---

## [1.0.0] - 2025-12-01

### Added
- Initial MVP release
- Basic slide generation from text input
- 3 core slide types (Executive Summary, Market Analysis, Financial)
- PNG export only
- Single-page web application
- Client-side HTML rendering

---

## Feature History by Category

### AI & Generation

| Version | Feature | Description |
|---------|---------|-------------|
| 1.0.0 | Basic AI generation | Text-based content generation |
| 1.1.0 | Enhanced prompting | Improved prompt engineering |
| 2.0.0 | AI image generation | Native AI image output |
| 2.0.0 | Multimodal models | Kimi K2.5 integration |

### Templates

| Version | Feature | Description |
|---------|---------|-------------|
| 1.1.0 | Static templates | 6 pre-built templates |
| 2.0.0 | Dynamic templates | Template marketplace system |
| 2.0.0 | Template API | Programmatic template access |

### Export

| Version | Feature | Description |
|---------|---------|-------------|
| 1.0.0 | PNG export | Image download only |
| 1.1.0 | PPTX export | PowerPoint format |
| 1.1.0 | PDF export | Document format |
| 1.1.0 | HTML export | Web embed format |
| 2.0.0 | Enhanced PPTX | Editable text elements |
| 2.0.0 | Quality options | Resolution selection |

### User Experience

| Version | Feature | Description |
|---------|---------|-------------|
| 1.0.0 | Basic UI | Simple form-based interface |
| 1.1.0 | Split panel | Side-by-side input/preview |
| 1.1.0 | Loading states | Progress indicators |
| 2.0.0 | Keyboard shortcuts | Full keyboard navigation |
| 2.0.0 | Mobile UX | Touch gestures, responsive design |
| 2.0.0 | Dark mode | Theme toggle |
| 2.0.0 | File upload | CSV/Excel data import |

### API & Integration

| Version | Feature | Description |
|---------|---------|-------------|
| 1.1.0 | Basic endpoints | Generate and export |
| 2.0.0 | API v2 | RESTful design, versioning |
| 2.0.0 | Authentication | JWT tokens, API keys |
| 2.0.0 | Rate limiting | Tier-based limits |
| 2.0.0 | Webhooks (beta) | Async notifications |

### Accessibility

| Version | Feature | Description |
|---------|---------|-------------|
| 2.0.0 | WCAG 2.1 AA | Full accessibility compliance |
| 2.0.0 | Screen readers | ARIA labels, live regions |
| 2.0.0 | Keyboard nav | Tab navigation, focus management |
| 2.0.0 | Skip links | Quick navigation |

### Security

| Version | Feature | Description |
|---------|---------|-------------|
| 1.1.0 | HTTPS | SSL/TLS encryption |
| 2.0.0 | JWT auth | Token-based authentication |
| 2.0.0 | API keys | Developer access management |
| 2.0.0 | AES-256 | Data encryption at rest |
| 2.0.0 | CSRF protection | Cross-site request forgery prevention |

---

## Migration Guides

### Migrating from v1.x to v2.0

#### API Changes

**Old endpoint:**
```
POST /api/generate
```

**New endpoint:**
```
POST /v2/slides/generate
```

**Authentication:**
- v1.x: No authentication required
- v2.0: JWT token required for most endpoints

**Response format:**
- v1.x: Synchronous response with slide data
- v2.0: Asynchronous (202 Accepted) with polling URL

#### UI Changes

| v1.x | v2.0 |
|------|------|
| Single form | Multi-step with validation |
| Basic loading spinner | Progress states with stages |
| Desktop-focused | Mobile-first responsive |
| Limited templates | Template marketplace |

---

## Known Issues

### Current (v2.0.0)

| Issue | Workaround | Planned Fix |
|-------|------------|-------------|
| Text rendering on complex charts | Use simpler data formats | v2.1.0 |
| Large PPTX file sizes | Re-compress in PowerPoint | v2.1.0 |
| Mobile export UI | Use desktop for complex exports | v2.1.0 |

### Resolved

| Issue | Version Fixed |
|-------|---------------|
| Memory leaks in rendering | v1.1.0 |
| CORS errors | v1.1.0 |
| Text overflow | v2.0.0 |
| Keyboard navigation gaps | v2.0.0 |

---

## Statistics

### By Version

| Version | Release Date | Slides Generated | Active Users |
|---------|--------------|------------------|--------------|
| 1.0.0 | 2025-12-01 | 12,450 | 890 |
| 1.1.0 | 2026-01-15 | 89,340 | 3,240 |
| 2.0.0 | 2026-02-05 | 154,320+ | 5,100+ |

### Top Features (v2.0)

| Feature | Usage % |
|---------|---------|
| Executive Summary slides | 42% |
| PPTX export | 68% |
| PNG export | 45% |
| Keyboard shortcuts | 23% |
| Template usage | 61% |

---

## Contributors

### Core Team
- Blake Henkel — Product & Engineering Lead
- SAKI — AI Integration & Documentation

### Community Contributors
See [CONTRIBUTORS.md](./CONTRIBUTORS.md) for full list.

---

## Resources

- [Full Documentation](https://docs.slidetheory.io)
- [API Reference](https://docs.slidetheory.io/api)
- [Migration Guide](https://docs.slidetheory.io/migration)
- [GitHub Releases](https://github.com/slidetheory/releases)

---

*This changelog is maintained by the SlideTheory team.*  
*Last updated: February 5, 2026*
