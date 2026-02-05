# SlideTheory MVP - Testing Guide v2.0

## What's New in v2.0

- **3 New Slide Types**: Competitive Analysis, Growth Strategy, Risk Assessment
- **Input Templates**: Tech Startup Pitch, Market Entry, Due Diligence
- **Export Formats**: PowerPoint (.pptx), PDF, and Copy HTML
- **Keyboard Shortcuts**: Ctrl+Enter to generate, and more
- **Enhanced Visual Design**: McKinsey-level professional styling

---

## Prerequisites

- Node.js 18+ installed (`node --version`)
- npm installed (`npm --version`)
- Git access for deployment

## Test Plan

### 1. Environment Setup

```bash
cd products/slidetheory/mvp/build

# Check dependencies
npm ls

# Verify critical dependencies
npm ls express
npm ls node-html-to-image
```

**Expected:** All dependencies installed without errors

### 2. Environment Variables

```bash
# Create .env file
cat > .env << 'EOF'
PORT=3000
KIMI_API_KEY=your_key_here_or_skip_for_fallback
ANALYTICS_FILE=./tmp/analytics.json
EOF

# Verify file exists
cat .env
```

**Expected:** .env file created with PORT and API key placeholder

### 3. Start Server

```bash
# Install if needed
npm install

# Start server
npm start
```

**Expected Output:**
```
╔════════════════════════════════════════════════╗
║                                                ║
║     SlideTheory MVP Server v2.0                ║
║                                                ║
║     Running on http://localhost:3000           ║
║                                                ║
║     New Features:                              ║
║     • 6 Slide Types (3 new)                    ║
║     • Input Templates                          ║
║     • Export Formats (PPTX, PDF, HTML)         ║
║     • Keyboard Shortcuts                       ║
║                                                ║
╚════════════════════════════════════════════════╝
```

### 4. Health Check

```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "version": "2.0.0",
  "timestamp": "2025-02-04T...",
  "features": ["new-slide-types", "templates", "export-formats", "keyboard-shortcuts"]
}
```

### 5. Stats Endpoint

```bash
curl http://localhost:3000/api/stats
```

**Expected Response:**
```json
{
  "totalSlides": 0,
  "byType": {
    "Executive Summary": 0,
    "Market Analysis": 0,
    "Financial Model": 0,
    "Competitive Analysis": 0,
    "Growth Strategy": 0,
    "Risk Assessment": 0
  },
  "byDay": {},
  "lastGenerated": null
}
```

### 6. Frontend Load Test

1. Open browser to `http://localhost:3000`
2. **Expected:** Clean UI with:
   - "SlideTheory" header with navy/blue accent
   - **Templates section** with 3 template cards (🚀 Tech Startup Pitch, 🌍 Market Entry, 🔍 Due Diligence)
   - Slide type selector with **6 options** (3 core + 3 strategic)
   - Context textarea with character counter
   - Data points input
   - Target audience dropdown
   - Framework dropdown
   - **"Generate Slide" button with Ctrl+Enter shortcut**

### 7. Test Input Templates

**Test Template: Tech Startup Pitch**
1. Click the "🚀 Tech Startup Pitch" template card
2. **Expected:** Form auto-populates with:
   - Slide Type: "Executive Summary"
   - Context: Series A fundraising content
   - Data Points: ARR, Customer metrics
   - Audience: "Investors"
   - Framework: "Pyramid Principle"

**Test Template: Market Entry**
1. Click the "🌍 Market Entry" template card
2. **Expected:** Form auto-populates with Market Analysis content

**Test Template: Due Diligence**
1. Click the "🔍 Due Diligence" template card
2. **Expected:** Form auto-populates with Risk Assessment content

### 8. Test New Slide Types

**Test Competitive Analysis:**
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "slideType": "Competitive Analysis",
    "context": "Analyze our position vs Competitor A and B in the SaaS market. We have superior technology but lower brand recognition.",
    "dataPoints": ["Our market share: 15%", "Competitor A: 35%", "Competitor B: 25%"],
    "targetAudience": "C-Suite"
  }'
```

**Expected:** Response with competitive analysis content and 2x2 matrix structure

**Test Growth Strategy:**
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "slideType": "Growth Strategy",
    "context": "Outline our growth strategy focusing on product expansion and geographic growth for next 3 years.",
    "targetAudience": "Board"
  }'
```

**Expected:** Response with flywheel and strategic initiatives

**Test Risk Assessment:**
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "slideType": "Risk Assessment",
    "context": "Assess risks for our $50M acquisition including integration, talent retention, and market risks.",
    "targetAudience": "Board"
  }'
```

**Expected:** Response with risk matrix and mitigation table

### 9. Test Keyboard Shortcuts

1. Fill out the form with valid data
2. **Press Ctrl+Enter**
   - **Expected:** Slide generation starts
3. After generation, **press Ctrl+R**
   - **Expected:** Slide regenerates
4. **Press Ctrl+D**
   - **Expected:** PNG download starts
5. **Press ?**
   - **Expected:** Keyboard shortcuts modal opens
6. **Press Escape**
   - **Expected:** Modal closes

### 10. Test Export Formats

First, generate a slide:
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "slideType": "Executive Summary",
    "context": "Q3 earnings showing 23% revenue growth driven by enterprise expansion",
    "targetAudience": "C-Suite"
  }'
```

Save the `slideId` from the response.

**Test PNG Export (existing):**
```bash
curl -I http://localhost:3000/slides/{slideId}.png
```

**Expected:** HTTP 200, Content-Type: image/png

**Test HTML Export:**
```bash
curl http://localhost:3000/api/export/{slideId}/html
```

**Expected:** JSON response with HTML content

**Test PDF Export:**
```bash
curl -I http://localhost:3000/api/export/{slideId}/pdf
```

**Expected:** HTTP 200, Content-Disposition for .pdf file

**Test PPTX Export:**
```bash
curl -I http://localhost:3000/api/export/{slideId}/pptx
```

**Expected:** HTTP 200, Content-Disposition for .pptx file

### 11. Slide Generation Test (No API Key - Fallback Mode)

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "slideType": "Executive Summary",
    "context": "Q3 earnings showing 23% revenue growth driven by enterprise expansion",
    "dataPoints": ["Revenue: $5.2M", "Growth: +23%"],
    "targetAudience": "C-Suite"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "slideId": "uuid-here",
  "imageUrl": "/slides/uuid-here.png",
  "title": "Strategic Recommendations",
  "expiresAt": "2025-02-05T..."
}
```

### 12. Verify Analytics Updated

```bash
curl http://localhost:3000/api/stats
```

**Expected:** `totalSlides` incremented, `byType` updated for tested types

### 13. Test All Slide Types

Repeat generation for all 6 slide types and verify `/api/stats` shows all types incremented:
- Executive Summary
- Market Analysis
- Financial Model
- Competitive Analysis
- Growth Strategy
- Risk Assessment

### 14. Error Handling Tests

**Test missing fields:**
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"slideType": "Executive Summary"}'
```

**Expected:** 400 Bad Request, error code `INVALID_INPUT` with `fixes` array

**Test invalid slide type:**
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "slideType": "Invalid Type",
    "context": "Some context here that is long enough",
    "targetAudience": "C-Suite"
  }'
```

**Expected:** 400 Bad Request, error code `INVALID_SLIDE_TYPE`

**Test context too short:**
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "slideType": "Executive Summary",
    "context": "Short",
    "targetAudience": "C-Suite"
  }'
```

**Expected:** 400 Bad Request, error code `INVALID_CONTEXT` with helpful fixes

### 15. UI/UX Tests

**Loading State:**
1. Click Generate
2. **Expected:** 
   - Button shows "Generating..." with spinner
   - Loading overlay appears with progress bar
   - Steps cycle through: Analyzing context → Structuring content → Designing slide → Finalizing

**Error Display:**
1. Temporarily disconnect network
2. Try to generate
3. **Expected:** Error alert with:
   - Clear error title
   - Description of what went wrong
   - "How to fix:" section with actionable steps

**Mobile Responsiveness:**
1. Open in mobile view (or resize browser to < 768px)
2. **Expected:**
   - Layout stacks vertically
   - Templates grid becomes single column
   - Action buttons stack
   - Text remains readable

### 16. Deployment Script Test

```bash
bash -n deploy.sh
echo "Syntax OK"
```

**Expected:** "Syntax OK"

### 17. Backup Script Test

```bash
bash -n backup-slides.sh
echo "Syntax OK"
```

**Expected:** "Syntax OK"

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Port 3000 in use | Another app running | `PORT=3001 npm start` |
| node-html-to-image fails | Chromium not installed | Install Chromium or use fallback SVG |
| No API key error | Missing KIMI_API_KEY | App works in fallback mode without key |
| Cannot find module 'dotenv' | Missing dependency | `npm install` |
| Export endpoints fail | Slide expired | Generate a new slide and try again |
| Keyboard shortcuts don't work | Focus in input | Press Ctrl+Enter even when typing |

---

## Feature Verification Checklist

### New Slide Types (v2.0)
- [ ] Competitive Analysis generates with 2x2 matrix
- [ ] Growth Strategy generates with flywheel diagram
- [ ] Risk Assessment generates with risk matrix

### Input Templates (v2.0)
- [ ] Tech Startup Pitch template populates form correctly
- [ ] Market Entry template populates form correctly
- [ ] Due Diligence template populates form correctly

### Export Formats (v2.0)
- [ ] PNG download works
- [ ] PPTX export endpoint returns file
- [ ] PDF export endpoint returns file
- [ ] HTML copy endpoint returns JSON with HTML

### Keyboard Shortcuts (v2.0)
- [ ] Ctrl+Enter triggers generation
- [ ] Ctrl+R triggers regeneration
- [ ] Ctrl+D triggers download
- [ ] ? opens shortcuts modal
- [ ] Escape closes modals

### Visual Design (v2.0)
- [ ] Navy/white/gray color scheme applied
- [ ] Professional shadows and depth
- [ ] Improved typography hierarchy
- [ ] Subtle borders and rounded corners

### Error Handling (v2.0)
- [ ] Error messages include "How to fix" section
- [ ] Progress bar during loading
- [ ] Actionable error suggestions

---

## Production Deployment Checklist

- [ ] Environment variables set on VPS (KIMI_API_KEY optional)
- [ ] `deploy.sh` configured with correct SSH user/host
- [ ] `backup-slides.sh` added to crontab (daily)
- [ ] PM2 installed globally (`npm install -g pm2`)
- [ ] Nginx reverse proxy configured
- [ ] Firewall allows port 80/443
- [ ] SSL certificate configured
- [ ] Test all 6 slide types in production
- [ ] Test all 3 templates in production
- [ ] Test all export formats in production

---

## Sign-Off

**Tester:** _________________ **Date:** _________________

**Version Tested:** v2.0

**Status:** ☐ PASS ☐ FAIL

**New Features Verified:**
- [ ] 3 New Slide Types
- [ ] 3 Input Templates
- [ ] 4 Export Formats
- [ ] Keyboard Shortcuts
- [ ] Enhanced Visual Design

**Notes:**
