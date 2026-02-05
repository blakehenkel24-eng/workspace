# SlideTheory v2.0 Integration Checklist

**Version:** 1.0.0  
**Last Updated:** 2026-02-05  
**Status:** In Progress

---

## Overview

This document tracks the integration points between the 5 parallel development agents working on SlideTheory v2.0:

1. **Product Manager (You):** Specifications, coordination, integration planning
2. **UI/UX Designer:** Frontend interface, visual design, user interactions
3. **AI/Prompt Engineer:** LLM integration, prompt engineering, content generation
4. **Software Architect:** Backend structure, APIs, data models
5. **DevOps/Infra Engineer:** Deployment, CI/CD, infrastructure

---

## Agent Deliverables Matrix

### Current Status

| Agent | Deliverable | Status | Location |
|-------|-------------|--------|----------|
| Product Manager | v2-SPEC.md | ✅ Complete | `v2/v2-SPEC.md` |
| Product Manager | API-v2.md | ✅ Complete | `v2/API-v2.md` |
| Product Manager | ROADMAP.md | ✅ Complete | `v2/ROADMAP.md` |
| Product Manager | INTEGRATION.md | ✅ Complete | `v2/INTEGRATION.md` |
| UI/UX Designer | Design system updates | 🚧 Pending | TBD |
| UI/UX Designer | Component library | 🚧 Pending | TBD |
| AI Engineer | Prompt templates | 🚧 Pending | TBD |
| AI Engineer | Generation pipeline | 🚧 Pending | TBD |
| Architect | Backend structure | 🚧 Pending | TBD |
| Architect | Database schema | 🚧 Pending | TBD |
| DevOps | Infrastructure | 🚧 Pending | TBD |

---

## 1. UI/UX Designer Integration Points

### 1.1 Inputs FROM Designer

| Deliverable | Format | Location | Consumers |
|-------------|--------|----------|-----------|
| Updated Design System | Figma/JSON | `v2/design/tokens.json` | Frontend, AI Engineer |
| Component Library | React/JS | `v2/components/` | Frontend |
| Slide Preview Component | React/JS | `v2/components/SlidePreview/` | Frontend |
| Progress Indicator Designs | SVG/CSS | `v2/assets/progress/` | Frontend |
| Mobile Responsive Specs | Documentation | `v2/design/mobile-specs.md` | Frontend |

### 1.2 Integration Requirements

**From Designer → AI Engineer:**
- Slide layout templates (dimensions, safe zones for text)
- Color schemes for different slide types
- Typography specifications for AI to follow

**From Designer → Architect:**
- Asset delivery requirements (formats, sizes)
- CDN path structure for images
- Caching strategy for design assets

**From Designer → Frontend:**
- Component props/interfaces
- Animation specifications
- Responsive breakpoint definitions

### 1.3 Acceptance Criteria
- [ ] Design system includes AI-safe zones for text
- [ ] Components support dark/light modes
- [ ] All designs mobile-responsive
- [ ] Assets optimized for web delivery

---

## 2. AI/Prompt Engineer Integration Points

### 2.1 Inputs FROM AI Engineer

| Deliverable | Format | Location | Consumers |
|-------------|--------|----------|-----------|
| Prompt Templates | JSON/Markdown | `v2/ai/prompts/` | Backend |
| Generation Pipeline | JS/Python | `v2/ai/pipeline.js` | Backend |
| Text Legibility Module | JS | `v2/ai/text-overlay.js` | Backend |
| Model Configuration | JSON | `v2/ai/models.json` | Backend |
| Fallback Logic | JS | `v2/ai/fallback.js` | Backend |

### 2.2 Integration Requirements

**From AI Engineer → Designer:**
- Text rendering capabilities/limitations
- Recommended safe zones for generated content
- Color contrast requirements

**From AI Engineer → Architect:**
- API contract for generation requests
- Async job requirements
- Error handling specifications
- Rate limiting needs

**From AI Engineer → Frontend:**
- Progress stage definitions
- Error message mapping
- Supported slide type capabilities

### 2.3 API Contract (AI ↔ Backend)

```typescript
// Request to AI service
interface AIGenerationRequest {
  slideType: string;
  context: string;
  dataPoints: string[];
  framework?: string;
  style: 'mckinsey' | 'bain' | 'bcg';
  outputFormat: 'png' | 'svg-overlay';
}

// Response from AI service
interface AIGenerationResponse {
  success: boolean;
  imageUrl?: string;
  svgOverlay?: string;  // For hybrid approach
  content: SlideContent;
  metadata: {
    model: string;
    generationTimeMs: number;
    tokensUsed: number;
  };
  error?: {
    code: string;
    message: string;
  };
}
```

### 2.4 Acceptance Criteria
- [ ] Prompts generate legible text 90%+ of time
- [ ] Fallback triggers within 5 seconds on failure
- [ ] All 6 slide types supported
- [ ] SVG overlay properly positioned

---

## 3. Software Architect Integration Points

### 3.1 Inputs FROM Architect

| Deliverable | Format | Location | Consumers |
|-------------|--------|----------|-----------|
| API Implementation | JS/Express | `v2/server/` | All agents |
| Database Schema | SQL/Migrations | `v2/db/schema.sql` | All agents |
| Job Queue System | JS | `v2/server/queue/` | AI Engineer |
| Auth Middleware | JS | `v2/server/auth/` | Frontend |
| Storage Layer | JS | `v2/server/storage/` | AI Engineer |

### 3.2 Integration Requirements

**From Architect → Designer:**
- API endpoint documentation
- Asset upload requirements
- Caching behavior for previews

**From Architect → AI Engineer:**
- Job queue interface
- Storage API for generated images
- Database schema for content storage

**From Architect → Frontend:**
- OpenAPI/Swagger documentation
- TypeScript types
- Auth flow specification

**From Architect → DevOps:**
- Infrastructure requirements
- Environment variable list
- Scaling parameters

### 3.3 Database Schema

```sql
-- Core tables for v2.0

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  plan VARCHAR(50) DEFAULT 'free',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  slide_type VARCHAR(100) NOT NULL,
  context TEXT NOT NULL,
  data_points JSONB DEFAULT '[]',
  framework VARCHAR(100),
  content JSONB NOT NULL,
  image_url TEXT,
  thumbnail_url TEXT,
  status VARCHAR(50) DEFAULT 'processing',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  content JSONB NOT NULL,
  tags TEXT[],
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(2,1),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_id UUID REFERENCES slides(id),
  status VARCHAR(50) DEFAULT 'queued',
  progress INTEGER DEFAULT 0,
  stage VARCHAR(100),
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.4 Acceptance Criteria
- [ ] All API endpoints match API-v2.md spec
- [ ] Auth middleware protects private routes
- [ ] Job queue handles 100+ concurrent requests
- [ ] Database queries < 100ms at 95th percentile

---

## 4. DevOps/Infrastructure Integration Points

### 4.1 Inputs FROM DevOps

| Deliverable | Format | Location | Consumers |
|-------------|--------|----------|-----------|
| Terraform Configs | HCL | `v2/infra/terraform/` | All agents |
| CI/CD Pipelines | YAML | `.github/workflows/` | All agents |
| Docker Configs | Dockerfile | `v2/Dockerfile` | All agents |
| Monitoring Setup | YAML | `v2/infra/monitoring/` | All agents |
| Environment Docs | Markdown | `v2/infra/ENVIRONMENT.md` | All agents |

### 4.2 Integration Requirements

**From DevOps → Architect:**
- Database connection strings
- Cache endpoints (Redis)
- Queue endpoints
- Storage bucket configurations

**From DevOps → AI Engineer:**
- AI API key management (secrets manager)
- GPU instance specifications (if needed)
- Model serving endpoints

**From DevOps → Frontend:**
- CDN URLs for assets
- Environment-specific API endpoints
- Sentry/error tracking config

### 4.3 Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         CDN (CloudFront)                    │
│         Static Assets / Generated Slides / Exports         │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Load Balancer (ALB)                    │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│   API Server   │  │   API Server    │  │   API Server    │
│   (Node.js)    │  │   (Node.js)     │  │   (Node.js)     │
└───────┬────────┘  └────────┬────────┘  └────────┬────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│  PostgreSQL    │  │    Redis        │  │   S3 Buckets    │
│  (Primary DB)  │  │ (Queue/Cache)   │  │ (File Storage)  │
└────────────────┘  └─────────────────┘  └─────────────────┘
```

### 4.4 Acceptance Criteria
- [ ] Zero-downtime deployments
- [ ] Auto-scaling configured (2-10 instances)
- [ ] Monitoring covers all critical paths
- [ ] Backup strategy documented and tested

---

## 5. Cross-Cutting Concerns

### 5.1 Error Handling

All agents must align on error handling:

| Error Type | Frontend | Backend | AI Service |
|------------|----------|---------|------------|
| Validation | Inline form errors | 400 + details | N/A |
| Auth | Redirect to login | 401/403 | N/A |
| Rate Limit | Retry after message | 429 + headers | Queue |
| AI Failure | Fallback notification | Queue retry | Error code |
| System | Error page | 500 + log | Alert |

### 5.2 Logging Standards

```json
{
  "timestamp": "2026-02-05T10:30:00Z",
  "level": "info",
  "service": "api|ai|frontend",
  "requestId": "req_abc123",
  "userId": "usr_456",
  "action": "slide.generate",
  "durationMs": 4200,
  "metadata": {}
}
```

### 5.3 Naming Conventions

| Resource | Convention | Example |
|----------|------------|---------|
| API endpoints | kebab-case | `/api/slide-generate` |
| Database tables | snake_case | `generation_jobs` |
| JavaScript files | camelCase | `slideGenerator.js` |
| React components | PascalCase | `SlidePreview.jsx` |
| CSS classes | kebab-case | `slide-preview__image` |
| Environment vars | UPPER_SNAKE | `KIMI_API_KEY` |

---

## 6. Integration Testing Checklist

### 6.1 End-to-End Flows

- [ ] User fills form → AI generates → Preview displays
- [ ] Template load → Form populate → Generate
- [ ] Generate → Export PPTX → Download
- [ ] Generate → Regenerate → New variation
- [ ] History → Re-generate → New slide

### 6.2 Failure Scenarios

- [ ] AI service down → Fallback HTML rendering
- [ ] Rate limit hit → Queue + notify user
- [ ] Export fails → Retry + error message
- [ ] Auth expires → Re-auth flow

### 6.3 Performance Tests

- [ ] 100 concurrent generation requests
- [ ] 1000 slides/day sustained load
- [ ] Export 50 slides simultaneously
- [ ] Page load < 2s on 3G

---

## 7. Communication Plan

### 7.1 Daily Standups
- Time: 10:00 AM UTC
- Format: Async in shared channel
- Each agent: Yesterday, Today, Blockers

### 7.2 Weekly Sync
- Time: Thursday 3:00 PM UTC
- Duration: 30 minutes
- Agenda: Progress, blockers, decisions

### 7.3 Documentation
- All specs in `v2/` directory
- API changes require API-v2.md update
- Architecture decisions in `v2/ADR-*.md`

### 7.4 Escalation
- Blockers > 24h → Escalate to Product Manager
- Cross-team conflicts → Architecture review
- Scope changes → Phase gate review

---

## 8. Current Blockers & Decisions

### 8.1 Open Decisions

| Decision | Options | Owner | Due Date |
|----------|---------|-------|----------|
| AI Model | Kimi K2.5 vs Flux | AI Engineer | 2026-02-10 |
| Database | PostgreSQL vs DynamoDB | Architect | 2026-02-08 |
| Queue | Bull vs SQS | Architect | 2026-02-08 |
| Frontend Framework | React vs Vue | Designer | 2026-02-07 |

### 8.2 Known Blockers

| Blocker | Impact | Owner | ETA |
|---------|--------|-------|-----|
| None currently | - | - | - |

---

## 9. Files to Monitor

### Critical Files (Check Every Sync)
```
products/slidetheory/v2/
├── v2-SPEC.md          # Product requirements
├── API-v2.md           # API contract
├── ROADMAP.md          # Timeline
├── INTEGRATION.md      # This file
└── components/         # UI components

mvp/build/
├── public/
│   ├── index.html      # Main UI
│   ├── app.js          # Frontend logic
│   └── styles.css      # Styling
├── lib/
│   ├── openai-client.js    # AI integration
│   ├── slide-generator.js  # Rendering
│   └── export-generator.js # Exports
└── server.js           # Backend
```

---

## 10. Success Definition

v2.0 is successfully integrated when:

1. ✅ All 6 slide types generate via AI with >90% text legibility
2. ✅ User can sign up, generate, and export without errors
3. ✅ System handles 100 concurrent users
4. ✅ All 5 agents' code integrates without conflicts
5. ✅ Zero critical bugs in production for 7 days

---

**Integration Lead:** Product Manager  
**Next Review:** Daily standup  
**Last Updated:** 2026-02-05
