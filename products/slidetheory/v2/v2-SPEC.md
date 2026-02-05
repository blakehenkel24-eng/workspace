# SlideTheory v2.0 Product Specification

**Version:** 2.0.0  
**Status:** In Development  
**Last Updated:** 2026-02-05  
**Owner:** Product Manager

---

## 1. Executive Summary

SlideTheory v2.0 is a major upgrade to the AI-powered consulting slide generator. This release transitions from HTML-based rendering to true AI image generation while maintaining McKinsey-level professional quality.

### Key Changes from v1.x (MVP)
| Aspect | v1.x (MVP) | v2.0 |
|--------|------------|------|
| Rendering | HTML → Puppeteer screenshot | AI image generation (Kimi/Flux) |
| Output | PNG/SVG fallback | High-res PNG, editable PPTX |
| Templates | 6 static templates | Dynamic template marketplace |
| User System | Anonymous | Accounts + history |
| AI Model | Kimi K2.5 text only | Multimodal (text + image) |

---

## 2. Feature Requirements

### 2.1 Core Features (MVP Parity + Enhancements)

#### FR-001: AI Slide Generation
**Priority:** P0  
**Description:** Generate consulting-grade slides from text context

**Requirements:**
- Accept user context (topic, audience, key message, data points)
- Support 6 slide types: Executive Summary, Market Analysis, Financial Model, Competitive Analysis, Growth Strategy, Risk Assessment
- Generate high-resolution PNG (1920×1080, 2x for retina)
- Generation time target: < 5 seconds
- Support for custom frameworks (Pyramid Principle, MECE, 2x2 Matrix, etc.)

**Acceptance Criteria:**
- [ ] User can generate all 6 slide types
- [ ] Output is professional quality (readable text, proper spacing)
- [ ] Average generation time < 5 seconds at 95th percentile

---

#### FR-002: Multi-Format Export
**Priority:** P0  
**Description:** Export generated slides in multiple formats

**Requirements:**
- PNG export (high-res, 3840×2160)
- PPTX export with editable elements
- PDF export (single slide or multi-slide deck)
- HTML copy for embedding

**Acceptance Criteria:**
- [ ] All 4 export formats functional
- [ ] PPTX export creates editable text boxes
- [ ] PDF maintains vector quality for printing

---

#### FR-003: Template System
**Priority:** P0  
**Description:** Pre-built templates for common consulting scenarios

**Requirements:**
- 6 v1.x templates ported: Tech Startup Series B, European Market Entry, PE Due Diligence, DTC Growth Strategy, SaaS Competitive Analysis, Q3 Board Financials
- Template JSON schema with context, data points, audience, framework
- Quick-load from UI with single click

**Acceptance Criteria:**
- [ ] All 6 templates load correctly
- [ ] Template data populates form fields accurately
- [ ] Templates generate consistent output

---

### 2.2 New v2.0 Features

#### FR-004: AI Image Generation Engine
**Priority:** P0  
**Description:** Replace HTML rendering with AI-native image generation

**Requirements:**
- Primary: Kimi K2.5 image generation API
- Fallback: Flux Pro or similar high-quality model
- Prompt engineering for consulting slide aesthetics
- Text legibility optimization (critical for consulting slides)
- SVG path generation for charts/diagrams overlay

**Technical Considerations:**
- Text rendering in AI images remains challenging
- Solution: Hybrid approach - AI generates background/visuals, SVG overlay for text/charts
- Or: Structured generation with controlled text placement

**Acceptance Criteria:**
- [ ] Generated slides have legible text (>12pt equivalent)
- [ ] McKinsey-style visual aesthetic (navy headers, clean whitespace)
- [ ] Charts and data visualizations render correctly
- [ ] 95%+ text accuracy rate

---

#### FR-005: Enhanced Template Marketplace
**Priority:** P1  
**Description:** Expand template library with community submissions

**Requirements:**
- Template browser with categories (Finance, Strategy, Operations, etc.)
- Template preview before selection
- User favorites/bookmarks
- Template rating system
- Template submission workflow (Phase 3)

**Acceptance Criteria:**
- [ ] Browse templates by category
- [ ] Preview template before loading
- [ ] Mark templates as favorites

---

#### FR-006: User Accounts & History
**Priority:** P1  
**Description:** Persistent user identity and slide history

**Requirements:**
- Email/password or OAuth (Google, LinkedIn) signup
- Slide generation history (last 50 slides)
- Save/favorite generated slides
- Re-generate from history

**Acceptance Criteria:**
- [ ] User can create account
- [ ] Generated slides saved to history
- [ ] Can re-generate from history with one click
- [ ] History persists across sessions

---

#### FR-007: Team Collaboration (Phase 4)
**Priority:** P2  
**Description:** Share slides and collaborate with team members

**Requirements:**
- Team workspaces
- Share slides via link
- Comment on slides
- Version history

---

#### FR-008: Brand Customization
**Priority:** P2  
**Description:** Custom colors, fonts, and logos

**Requirements:**
- Upload logo
- Primary/secondary color selection
- Font family selection (from approved list)
- Save brand profile

---

## 3. User Flows

### 3.1 Primary Flow: Generate a Slide

```
[Homepage] 
    ↓
[Select Template] → Optional: Skip for blank start
    ↓
[Fill Form] → Slide Type, Context, Data Points, Audience
    ↓
[Click Generate] → Loading state with progress
    ↓
[Preview Generated Slide]
    ↓
[Choose Action] → Download (PNG/PPTX/PDF) / Regenerate / Edit
```

**Key Interactions:**
- Ctrl+Enter shortcut to generate
- Live preview updates on form changes
- Toast notifications for actions

### 3.2 Template Selection Flow

```
[Click Templates Button]
    ↓
[Template Grid Opens] → Categories filterable
    ↓
[Hover Template] → Preview thumbnail
    ↓
[Click Template] → Form auto-populates
    ↓
[Adjust as Needed] → Generate
```

### 3.3 History Flow

```
[Login] → Authenticated users only
    ↓
[History Panel] → List of past generations
    ↓
[Click History Item] → Load into form
    ↓
[Re-generate] → Creates new version
```

### 3.4 Export Flow

```
[Generated Slide Preview]
    ↓
[Click Download] → Dropdown opens
    ↓
[Select Format] → PNG / PPTX / PDF / HTML
    ↓
[Processing] → Format-specific generation
    ↓
[Download Starts] → File saved locally
```

---

## 4. Acceptance Criteria

### 4.1 Functional Requirements

| ID | Requirement | Criteria | Priority |
|----|-------------|----------|----------|
| AC-001 | Slide Generation | All 6 slide types generate without errors | P0 |
| AC-002 | Text Legibility | 100% of text readable at 100% zoom | P0 |
| AC-003 | Export Quality | PPTX exports open in PowerPoint without errors | P0 |
| AC-004 | Performance | 95th percentile generation < 5 seconds | P0 |
| AC-005 | Mobile UX | Core functionality works on mobile devices | P1 |
| AC-006 | Accessibility | WCAG 2.1 AA compliance for UI | P1 |

### 4.2 Quality Metrics

**Visual Quality:**
- Text contrast ratio ≥ 4.5:1
- Professional typography (consistent sizing, spacing)
- McKinsey-style visual hierarchy
- No visual artifacts or rendering errors

**Performance:**
- Time to First Byte (TTFB) < 500ms
- Generation API response < 5s (95th percentile)
- Export generation < 3s

**Reliability:**
- 99.5% uptime for generation API
- < 0.1% error rate for valid requests
- Graceful degradation on AI service failure

---

## 5. Success Metrics

### 5.1 User Engagement

| Metric | Target | Measurement |
|--------|--------|-------------|
| Monthly Active Users (MAU) | 500 | Post-launch Month 3 |
| Slides Generated / User | 5 | Average per active user |
| Template Usage Rate | 60% | % of slides from templates |
| Export Rate | 80% | % of generated slides exported |

### 5.2 Business Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| Free Signups | 1,000 | Month 3 |
| Pro Conversions | 50 | Month 3 |
| Revenue | $600 MRR | Month 3 |
| Churn Rate | < 10% | Monthly |

### 5.3 Technical Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| Generation Success Rate | > 98% | Valid requests |
| Average Generation Time | < 4s | Including network |
| Text Legibility Score | > 95% | Manual review |
| API Error Rate | < 0.5% | 5xx errors |

---

## 6. Technical Constraints

### 6.1 AI Image Generation

**Challenge:** AI image models struggle with precise text rendering

**Solutions Under Evaluation:**
1. **Hybrid Approach:** AI generates background/layout, SVG overlay for text
2. **Controlled Generation:** Structured prompts with text positioning
3. **Post-Processing:** OCR + re-render if text fails quality check
4. **Fallback:** Return to HTML rendering for text-heavy slides

### 6.2 Browser Compatibility

**Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Mobile:**
- iOS Safari 14+
- Chrome Android 90+

### 6.3 API Rate Limits

**Kimi API:**
- 60 requests/minute for image generation
- Implement queue + retry logic
- Fallback to text generation if rate limited

---

## 7. Open Questions

1. **Text Rendering:** Which approach yields best results for legible text?
2. **Pricing Model:** Freemium vs credit-based vs subscription?
3. **Model Choice:** Kimi K2.5 vs Flux vs custom fine-tune?
4. **Data Privacy:** How long to retain generated slide data?

---

## 8. Appendix

### A. Slide Type Specifications

#### Executive Summary
- **Structure:** Title + 3 Key Points + Recommendation
- **Visual Elements:** Numbered markers, recommendation box
- **Framework:** Pyramid Principle

#### Market Analysis
- **Structure:** Market Size + 3 Insights + Chart
- **Visual Elements:** Bar chart, metric callout box
- **Framework:** Market sizing TAM/SAM/SOM

#### Financial Model
- **Structure:** 3 Key Metrics + Data Table
- **Visual Elements:** Metric cards, formatted table
- **Framework:** Financial waterfall

#### Competitive Analysis
- **Structure:** 2x2 Matrix + Feature Comparison Table
- **Visual Elements:** Positioning bubbles, checkmarks
- **Framework:** 2x2 Matrix

#### Growth Strategy
- **Structure:** Flywheel Diagram + 3 Initiatives
- **Visual Elements:** Circular flywheel, initiative cards
- **Framework:** Growth flywheel

#### Risk Assessment
- **Structure:** Risk Matrix + Mitigation Table
- **Visual Elements:** Heat map grid, risk badges
- **Framework:** Risk probability/impact matrix

### B. Design System Reference

**Colors:**
- Primary Navy: #0d2137
- Accent Blue: #2563eb
- Success Green: #16a34a
- Warning Yellow: #f59e0b
- Error Red: #dc2626
- Gray Scale: #fafafa → #18181b

**Typography:**
- Font Family: Inter
- Title: 52px, Bold
- Subtitle: 28px, Light
- Body: 18-20px, Regular
- Caption: 14px, Medium

**Spacing:**
- Slide Padding: 60px 80px
- Section Gap: 40px
- Element Gap: 24px
