# SlideTheory MVP - Product Specification

**Version:** 1.0  
**Date:** 2025-02-04  
**Status:** Draft  
**Build Time Target:** 1 night (4-6 hours)

---

## 1. Executive Summary

SlideTheory MVP is a single-page web application that generates professional consulting-style slides (McKinsey/BCG/Bain format) from user inputs. Users fill out a form with slide details, and the system returns a high-quality PNG slide image.

### Key Decisions
- **No AI image generation** for MVP — uses HTML-to-image rendering for precise control
- **No auth/database** — stateless, single-session experience
- **3 slide types** for v1: Executive Summary, Market Analysis, Financial Model
- **Single-file deployment** — one HTML file with embedded CSS/JS, lightweight Node.js API

---

## 2. User Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Landing Page  │────▶│    Input Form    │────▶│  Loading State  │
│  (hero + CTA)   │     │ (5 input fields) │     │  (3-5 seconds)  │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                              ┌───────────────────────────┘
                              ▼
                    ┌──────────────────┐     ┌─────────────────┐
                    │  Generated Slide │────▶│  Download/Share │
                    │   (PNG preview)  │     │   (CTA buttons) │
                    └──────────────────┘     └─────────────────┘
```

### Detailed Flow

1. **Landing (/)**
   - Hero headline: "Generate McKinsey-Quality Slides in Seconds"
   - Subheadline explaining value prop
   - Primary CTA: "Create Your Slide"
   - Visual: Example slide thumbnail

2. **Input Form (/create)**
   - Slide Type dropdown (required)
   - Context/Industry text input (required)
   - Key Data Points textarea (required)
   - Target Audience dropdown (required)
   - Framework dropdown (optional)
   - Submit button with loading state

3. **Loading State**
   - Full-screen overlay or inline loader
   - Progress steps: "Analyzing data..." → "Structuring content..." → "Rendering slide..."
   - Estimated time: 3-5 seconds

4. **Result Page (/result?id=uuid)**
   - Large slide preview (PNG)
   - Download button (primary)
   - Create Another Slide button (secondary)
   - Share link (copy to clipboard)

---

## 3. Technical Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │
│  │  React SPA  │  │  Tailwind   │  │  html2canvas (for preview)  │  │
│  │  (optional) │  │    CSS      │  │                             │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ POST /api/generate
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SERVER (Node.js)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │
│  │   Express   │  │   OpenAI    │  │   Puppeteer / node-html-    │  │
│  │    API      │  │   (GPT-4)   │  │        to-image             │  │
│  │             │  │  Structured │  │                             │  │
│  │             │  │   Content   │  │  Renders HTML template to   │  │
│  │             │  │  Generation │  │           PNG               │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Vanilla HTML + Tailwind CDN | Zero build step, fastest deployment |
| Backend | Node.js + Express | Lightweight, familiar, VPS-ready |
| AI Layer | OpenAI GPT-4 (JSON mode) | Structured content generation |
| Rendering | node-html-to-image + Puppeteer | Precise consulting-style layouts |
| Storage | In-memory / tmp files | No database for MVP |

---

## 4. API Endpoints

### POST /api/generate
Generate a new slide.

**Request:**
```json
{
  "slideType": "Executive Summary",
  "context": "SaaS startup seeking Series B funding",
  "dataPoints": [
    "ARR: $5M (growing 150% YoY)",
    "CAC: $2,500",
    "LTV: $25,000",
    "Payback period: 6 months",
    "Raising $15M"
  ],
  "targetAudience": "C-Suite",
  "framework": "Pyramid Principle"
}
```

**Response:**
```json
{
  "success": true,
  "slideId": "uuid-123",
  "imageUrl": "/slides/uuid-123.png",
  "title": "Series B Investment Opportunity",
  "expiresAt": "2025-02-05T04:21:00Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "INVALID_INPUT",
  "message": "dataPoints must contain at least 2 items"
}
```

### GET /slides/:id.png
Retrieve generated slide image.

**Response:** PNG image file

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

---

## 5. Data Models

### SlideInput
```typescript
interface SlideInput {
  slideType: 'Executive Summary' | 'Market Analysis' | 'Financial Model';
  context: string;                    // max 500 chars
  dataPoints: string[];               // min 2, max 8 items
  targetAudience: 'C-Suite' | 'Board' | 'Working Team' | 'External';
  framework?: 'MECE' | 'Pyramid Principle' | '2x2 Matrix' | 'Waterfall Chart';
}
```

### SlideContent (AI-Generated)
```typescript
interface SlideContent {
  title: string;                      // Slide headline
  subtitle?: string;                  // Supporting subtitle
  sections: SlideSection[];           // Main content sections
  visualization?: {
    type: 'chart' | 'matrix' | 'waterfall' | 'none';
    data?: any;                       // Chart data structure
  };
  callout?: string;                   // Key insight/callout box
  footer?: {
    source?: string;
    date?: string;
    confidential?: boolean;
  };
}

interface SlideSection {
  heading?: string;
  bullets: string[];                  // max 3 bullets per section
}
```

### SlideOutput
```typescript
interface SlideOutput {
  slideId: string;
  imageUrl: string;
  content: SlideContent;              // For potential future editing
  createdAt: Date;
  expiresAt: Date;                    // 24h TTL for MVP
}
```

---

## 6. Image Generation Approach

### Decision: HTML-to-Image Rendering (NOT AI Image Gen)

After researching multiple options, **we will NOT use AI image generation** (DALL-E, Midjourney, Nano Banana, FLUX) for the MVP.

### Why HTML-to-Image Wins for Consulting Slides:

| Criteria | AI Image Gen | HTML-to-Image |
|----------|-------------|---------------|
| **Text Accuracy** | Poor — hallucinates text, spacing issues | Perfect — renders real fonts |
| **Layout Control** | Low — unpredictable positioning | Complete — CSS/grid precise |
| **Consulting Aesthetic** | Unreliable — may miss style cues | Guaranteed — hardcoded templates |
| **Speed** | 5-15s generation | 1-3s rendering |
| **Cost** | $0.03-0.06 per image | ~$0.001 compute |
| **Iteration Speed** | Slow — regenerate entire image | Fast — tweak CSS, re-render |

### How It Works

1. **Content Generation** (AI)
   - GPT-4 analyzes user inputs
   - Generates structured content: title, bullets, chart data
   - Returns JSON with slide content

2. **Template Rendering** (Static)
   - Select template based on `slideType` + `framework`
   - Inject content into HTML template
   - Apply consulting-style CSS (McKinsey/BCG/Bain aesthetics)

3. **Image Conversion** (Puppeteer)
   - Render HTML in headless Chrome
   - Screenshot at 1920x1080 (16:9) or 1920x1440 (4:3)
   - Output PNG with compression

### Implementation: node-html-to-image

```javascript
const nodeHtmlToImage = require('node-html-to-image');

const image = await nodeHtmlToImage({
  html: slideTemplateHTML,
  content: { title, sections, chartData },
  puppeteerArgs: {
    defaultViewport: { width: 1920, height: 1080 }
  },
  quality: 100,
  type: 'png'
});
```

### Future Enhancement Path

After MVP validation, consider adding:
- **Nano Banana Pro** for complex visual elements (charts, diagrams)
- Hybrid approach: HTML base + AI-generated chart elements
- User-uploaded image integration

---

## 7. File Structure

```
slidetheory-mvp/
├── public/                          # Static files (served directly)
│   ├── index.html                   # Single-page app
│   ├── css/
│   │   └── styles.css               # Custom styles
│   └── assets/
│       └── logo.svg                 # Brand assets
│
├── src/
│   ├── server.js                    # Express entry point
│   ├── routes/
│   │   └── api.js                   # API endpoints
│   ├── services/
│   │   ├── contentGenerator.js      # OpenAI integration
│   │   └── slideRenderer.js         # HTML-to-image conversion
│   ├── templates/
│   │   ├── executive-summary.html   # Slide templates
│   │   ├── market-analysis.html
│   │   ├── financial-model.html
│   │   └── partials/
│   │       ├── header.html
│   │       ├── footer.html
│   │       └── styles.css           # Consulting CSS framework
│   └── utils/
│       └── validators.js            # Input validation
│
├── tmp/                             # Generated slides (gitignored)
│   └── slides/
│
├── .env.example                     # Environment template
├── package.json
└── README.md
```

### Key Files

| File | Purpose | Lines (est) |
|------|---------|-------------|
| `server.js` | Express setup, middleware | ~50 |
| `contentGenerator.js` | OpenAI GPT-4 integration | ~80 |
| `slideRenderer.js` | Puppeteer rendering | ~60 |
| `executive-summary.html` | Template with Handlebars syntax | ~100 |
| `index.html` | Frontend form UI | ~150 |
| `styles.css` | Consulting design system | ~200 |

**Total MVP codebase: ~650 lines**

---

## 8. Deployment Plan

### Target Environment: Blake's VPS

**Prerequisites:**
- Ubuntu 22.04 LTS
- Node.js 18+ installed
- PM2 for process management
- Nginx reverse proxy
- (Optional) Domain with SSL

### Deployment Steps

```bash
# 1. Clone and setup
ssh user@vps-ip
git clone <repo> /var/www/slidetheory
cd /var/www/slidetheory
npm install --production

# 2. Environment
cp .env.example .env
nano .env  # Add OPENAI_API_KEY

# 3. Install Puppeteer dependencies
sudo apt-get update
sudo apt-get install -y chromium-browser libgconf-2-4

# 4. PM2 startup
npm install -g pm2
pm2 start src/server.js --name slidetheory
pm2 startup
pm2 save

# 5. Nginx config
sudo nano /etc/nginx/sites-available/slidetheory
# (see nginx config below)
sudo ln -s /etc/nginx/sites-available/slidetheory /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Nginx Config

```nginx
server {
    listen 80;
    server_name slidetheory.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /slides/ {
        alias /var/www/slidetheory/tmp/slides/;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Environment Variables

```bash
# .env
PORT=3000
NODE_ENV=production
OPENAI_API_KEY=sk-xxx
SLIDE_TTL_HOURS=24
MAX_SLIDES_STORED=100
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Monitoring

```bash
# Check health
curl http://localhost:3000/api/health

# View logs
pm2 logs slidetheory

# Restart
pm2 restart slidetheory
```

---

## 9. Consulting Design System

### Visual Principles (McKinsey/BCG/Bain Style)

**Typography:**
- Headlines: Georgia or serif font, 32-40px
- Body: Arial/Helvetica, 16-20px
- Accent: Bold for key numbers

**Color Palette:**
- Background: #FFFFFF (white) or #F5F5F5 (light gray)
- Primary: #1A1A1A (near-black text)
- Accent: #0066CC (McKinsey blue) or #003366 (BCG navy)
- Charts: Sequential blues/grays

**Layout:**
- Title bar: 60px height, left-aligned title
- Main content: 2-column or grid layout
- Footer: Source, date, page number
- Whitespace: Generous padding (40-60px margins)

**Framework-Specific Templates:**

| Framework | Visual Pattern |
|-----------|---------------|
| Pyramid Principle | Top-down hierarchy, main insight at top |
| MECE | Mutually exclusive categories, no overlap |
| 2x2 Matrix | Quadrant chart with axis labels |
| Waterfall | Stacked bar showing progression |

---

## 10. Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Puppeteer memory leaks | Restart every N requests; PM2 clustering |
| OpenAI API failures | Fallback to cached templates; retry logic |
| VPS storage full | 24h TTL on slides; max storage limit |
| Input validation bypass | Server-side validation; sanitize HTML |
| Slow rendering | Optimize CSS; cache Chromium instance |

---

## 11. Success Metrics (Post-MVP)

- Time to first slide: < 5 seconds
- Error rate: < 5%
- User satisfaction: NPS > 40
- Cost per slide: < $0.01 (vs $0.05 with AI gen)

---

## Appendix: Research Summary

### Image Generation Options Evaluated

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Nano Banana Pro** | Designed for slides, good text | API availability, cost | Future enhancement |
| **DALL-E 3** | Good text, reliable API | Unpredictable layouts, expensive | Not for MVP |
| **Midjourney** | Best image quality | No API, poor text rendering | Not suitable |
| **FLUX (Replicate)** | Fast, cheap ($0.003) | Text rendering inconsistent | Not for MVP |
| **HTML-to-Image** | Perfect text, full control, cheap | Requires template design | **MVP Choice** |

### Recommended Path

**MVP:** HTML-to-Image with hardcoded templates  
**v2:** Hybrid — HTML base + Nano Banana Pro for complex charts  
**v3:** Full AI generation once models improve for text

---

*End of Specification*
