# Deep Research Report: Enhancing Slide Visual Diversity

**Prepared for:** Blake Henkel / SlideTheory  
**Date:** February 7, 2026  
**Topic:** HTML/CSS-Based Static Slide Generation with Visual Variety

---

## Executive Summary

You're generating static slide images via Puppeteer + HTML/CSS, but the output looks templated because the AI defaults to similar structural patterns (flexbox containers, basic text blocks). The solution isn't abandoning your stack—it's **building a layout taxonomy** and giving the AI explicit structural choices.

This report analyzes available tools, frameworks, and architectural patterns to achieve McKinsey-quality visual variety without hiring a graphic designer for every slide.

---

## Problem Statement

**Current State:**
- AI generates HTML/CSS rendered to static PNG via Puppeteer
- All slides follow similar patterns: flexbox containers, basic text blocks
- Result: Templated, generic appearance

**Goal:**
- Structurally different slide designs based on content type
- Visual variety matching top-tier consulting firms (McKinsey, BCG, Bain)
- Maintain static image output (PNG/PDF)
- Keep current Next.js/Node.js stack

---

## Tool Analysis & Recommendations

### 1. Satori (Vercel) — Most Promising Alternative

**Overview:** JSX-to-SVG-to-PNG renderer built by Vercel for OG images and social cards.

**How It Works:**
```javascript
import satori from 'satori'

const svg = await satori(
  <div style={{ color: 'black', fontSize: 32 }}>
    Executive Summary Slide
  </div>,
  {
    width: 1200,
    height: 675,
    fonts: [{
      name: 'Inter',
      data: interFontBuffer,
      weight: 600,
    }],
  }
)
```

**Pros:**
- Extremely crisp text rendering (converts text to SVG paths)
- Purpose-built for static image generation
- Uses Yoga layout engine (same as React Native) — predictable flexbox
- Edge Function compatible (fast)
- Sharp output without headless browser overhead

**Cons:**
- **Limited CSS subset** — no `calc()`, no complex selectors, no external resources
- No native grid support (flexbox only)
- Requires font files as ArrayBuffers
- Learning curve if you're not using JSX

**Verdict:** Strong alternative to Puppeteer if you want faster rendering and don't need complex CSS. Better for "social card" style slides than dense consulting layouts.

**Best For:** OG cards, social posts, simpler layouts

---

### 2. Reveal.js + Puppeteer Export

**Overview:** Mature HTML presentation framework with 11 built-in themes.

**Pros:**
- Extensive theme ecosystem
- Built-in slide types: cover, section, two-column, image layouts
- PDF export support
- Battle-tested for presentations

**Cons:**
- Designed for interactive decks, not static image generation
- Themes are mostly color/transition variations, not structural diversity
- Heavyweight for your use case

**Verdict:** Skip it. Too much overhead for static image generation. The layout diversity isn't better than what you can build yourself.

---

### 3. Slidev — Notable Layout System

**Overview:** Markdown-based slides with Vue, but has a **layout plugin architecture**.

**Built-in Layouts (12+):**
| Layout | Description |
|--------|-------------|
| `center` | Content centered on screen |
| `cover` | Title page with metadata |
| `fact` | Prominent data/stat display |
| `full` | Use all screen space |
| `image-left` | Image left, content right |
| `image-right` | Image right, content left |
| `intro` | Presentation intro |
| `quote` | Quotation with attribution |
| `section` | Section divider slide |
| `statement` | Bold affirmation |
| `two-cols` | Two-column layout |
| `two-cols-header` | Header + two columns |

**Key Insight:** Well-designed layout taxonomy for presentations. Clean separation of layout vs content.

**Verdict:** Study their layout taxonomy as a model. Don't use Slidev directly (Vue-based), but copy their layout categorization approach.

---

### 4. PptxGenJS — The PowerPoint Path

**Overview:** Generates actual .pptx files client-side via JavaScript.

**Example:**
```javascript
import PptxGenJS from 'pptxgenjs'

let pres = new PptxGenJS()
let slide = pres.addSlide()

slide.addText('Executive Summary', {
  x: 0.5, y: 0.5, w: 9, h: 1,
  fontSize: 24, bold: true
})

slide.addChart(pres.ChartType.bar, chartData, {
  x: 0.5, y: 2, w: 9, h: 4
})

pres.writeFile({ fileName: 'presentation.pptx' })
```

**Pros:**
- Native PowerPoint compatibility
- Built-in master slide layouts
- Direct shape/text/chart APIs
- No rendering pipeline needed

**Cons:**
- Locked into PowerPoint's rendering
- Limited visual sophistication vs HTML/CSS
- Requires users to have PowerPoint (or compatible viewer)

**Verdict:** Only if PowerPoint compatibility is a hard requirement. For AI-generated consulting slides, HTML/CSS gives you more control.

---

### 5. Custom CSS Grid Layout Library — Recommended Approach

**Concept:** Define 10-15 layout primitives that the AI selects from based on content type.

**Why This Wins:**
- Full CSS control
- Unlimited structural variety
- Fits existing stack (Puppeteer + HTML/CSS)
- AI can reason about "what layout fits this content"
- Maintainable and extensible

---

## Layout Taxonomy (Consulting-Optimized)

| Layout | Use Case | Visual Structure |
|--------|----------|------------------|
| **Executive Summary** | Key finding + supporting points | Hero number top, 3-column grid below |
| **Comparison** | Side-by-side analysis | 2-column with visual divider, mirrored structure |
| **Timeline** | Sequential events | Horizontal flow with connecting line, numbered nodes |
| **Issue Tree** | Hierarchical breakdown | Left-aligned branching, indents show hierarchy |
| **2x2 Matrix** | Framework visualization | Quadrant grid with labeled axes |
| **Data Heavy** | Multiple metrics | 3-4 column grid, uniform card sizing |
| **Process Flow** | Step-by-step | Horizontal/vertical numbered sequence with arrows |
| **Big Statement** | Bold claim | Full-screen centered text, minimal elements |
| **Quote/Insight** | External validation | Large quotation, attribution, source |
| **Image-Left/Right** | Visual + context | 40/60 or 60/40 split |
| **Chart-Focused** | Data visualization | Large chart area + 2-3 insight callouts |
| **Before/After** | Transformation story | Split screen with contrast styling |

---

## Implementation Guide

### Step 1: CSS Layout Primitives

```css
/* Base slide container */
.slide {
  width: 1920px;
  height: 1080px;
  padding: 60px;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

/* Layout: Executive Summary */
.slide-layout--executive {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 40px;
}

.slide-layout--executive .hero-metric {
  font-size: 120px;
  font-weight: 700;
  color: var(--primary-teal);
}

.slide-layout--executive .supporting-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

/* Layout: Comparison */
.slide-layout--comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  position: relative;
}

.slide-layout--comparison::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 10%;
  bottom: 10%;
  width: 2px;
  background: var(--divider-color);
}

/* Layout: Timeline */
.slide-layout--timeline {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.timeline-track {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.timeline-track::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--accent-line);
}

.timeline-node {
  text-align: center;
  width: 120px;
}

.timeline-node .number {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--primary-teal);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  position: relative;
  z-index: 1;
}

/* Layout: Issue Tree */
.slide-layout--issue-tree {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tree-level {
  display: flex;
  gap: 20px;
  padding-left: calc(var(--level, 0) * 40px);
}

.tree-node {
  background: var(--surface-color);
  border-left: 4px solid var(--primary-teal);
  padding: 20px;
  flex: 1;
}

/* Layout: 2x2 Matrix */
.slide-layout--matrix {
  display: grid;
  grid-template-columns: 60px 1fr 1fr;
  grid-template-rows: 60px 1fr 1fr;
  gap: 20px;
}

.matrix-axis-y {
  grid-column: 1;
  grid-row: 2 / 4;
  writing-mode: vertical-rl;
  text-align: center;
}

.matrix-axis-x {
  grid-column: 2 / 4;
  grid-row: 1;
  text-align: center;
}

.matrix-quadrant {
  padding: 30px;
  border: 1px solid var(--border-color);
}

/* Layout: Data Heavy */
.slide-layout--data-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.metric-card {
  background: var(--surface-color);
  border-radius: 8px;
  padding: 30px;
  text-align: center;
}

.metric-card .value {
  font-size: 48px;
  font-weight: 700;
  color: var(--primary-teal);
}

/* Layout: Process Flow */
.slide-layout--process {
  display: flex;
  align-items: center;
  gap: 20px;
}

.process-step {
  flex: 1;
  text-align: center;
  padding: 30px;
  background: var(--surface-color);
  border-radius: 8px;
  position: relative;
}

.process-step:not(:last-child)::after {
  content: '→';
  position: absolute;
  right: -28px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24px;
  color: var(--accent-color);
}
```

### Step 2: AI Layout Selection

```javascript
// layout-classifier.js
const LAYOUT_PROMPT = `
You are a presentation layout classifier. Given slide content, select the optimal layout.

Available layouts:
- executive: Key finding with 2-4 supporting metrics
- comparison: Side-by-side analysis of two options
- timeline: Sequential events or milestones
- issue-tree: Hierarchical problem breakdown
- matrix: 2x2 framework visualization
- data-grid: 3+ metrics displayed as cards
- process: Step-by-step flow
- statement: Bold single claim with minimal elements
- quote: External validation with attribution
- split-image: Visual + supporting text

Content to classify:
"{{CONTENT}}"

Respond with ONLY the layout name, no explanation.
`;

async function classifyLayout(content) {
  const response = await kimi.chat.completions.create({
    model: 'moonshot-v1-128k',
    messages: [{
      role: 'user',
      content: LAYOUT_PROMPT.replace('{{CONTENT}}', content)
    }],
    temperature: 0.1
  });
  
  return response.choices[0].message.content.trim();
}

// Usage
const layout = await classifyLayout(slideContent);
// Returns: "comparison", "timeline", "data-grid", etc.
```

### Step 3: Content-to-Layout Mapping

```javascript
// layout-renderers.js
const layoutRenderers = {
  executive: (content) => `
    <div class="slide slide-layout--executive">
      <div class="hero-metric">${content.heroMetric}</div>
      <div class="supporting-grid">
        ${content.points.map(p => `
          <div class="point">
            <h3>${p.title}</h3>
            <p>${p.description}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `,
  
  comparison: (content) => `
    <div class="slide slide-layout--comparison">
      <div class="column">
        <h3>${content.left.title}</h3>
        ${content.left.points.map(p => `<p>${p}</p>`).join('')}
      </div>
      <div class="column">
        <h3>${content.right.title}</h3>
        ${content.right.points.map(p => `<p>${p}</p>`).join('')}
      </div>
    </div>
  `,
  
  timeline: (content) => `
    <div class="slide slide-layout--timeline">
      <h2>${content.title}</h2>
      <div class="timeline-track">
        ${content.events.map((e, i) => `
          <div class="timeline-node">
            <div class="number">${i + 1}</div>
            <div class="date">${e.date}</div>
            <div class="event">${e.description}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `,
  
  // ... additional renderers
};

async function renderSlide(content) {
  const layout = await classifyLayout(content.text);
  const renderer = layoutRenderers[layout] || layoutRenderers.executive;
  const html = renderer(content);
  
  // Render to PNG via Puppeteer
  return await renderToPNG(html);
}
```

---

## Research Findings: Academic & Industry Context

### SlideCoder Paper (arXiv 2025)

**"Layout-aware RAG-enhanced Hierarchical Slide Generation from Design"**

Key findings:
1. **Layout selection is a distinct problem** from content generation
2. Winning approaches use RAG to retrieve similar slide structures from example decks
3. Hierarchical constraints work best: title → sections → bullets
4. Layout classification accuracy directly correlates with perceived quality

**Implication for SlideTheory:** Consider storing your McKinsey reference decks in a vector DB. Retrieve similar slide structures based on content embedding, then apply that layout pattern.

### Industry Tools Analysis

**Beautiful.ai, Decktopus, Tome:**
- Succeed by **constraining layouts** rather than offering infinite flexibility
- Snap content into predetermined grids
- Trade-off: Less flexibility for faster creation

**SlideTheory's Advantage:** Offer consulting-grade flexibility while providing structure through intelligent layout selection.

---

## Recommendation Matrix

| Approach | Implementation Effort | Visual Diversity | Maintainability | Best For |
|----------|----------------------|------------------|-----------------|----------|
| **Custom Layout Library** | Medium | High | High | **Your use case** |
| Satori | Low-Medium | Medium | Medium | OG cards, social posts |
| PptxGenJS | Medium | Low | High | PowerPoint compatibility |
| Reveal.js | Medium | Medium | Low | Interactive presentations |

---

## Concrete Next Steps

### Immediate (This Week)
1. **Audit current outputs** — categorize the last 20 slides by structural pattern
2. **Select 5-6 high-impact layouts** to implement first
3. **Build CSS utilities** for selected layouts

### Short-term (Next 2 Weeks)
4. **Add layout selection to AI pipeline** — prompt the model to classify content type before generation
5. **A/B test** — compare old outputs vs layout-aware outputs

### Medium-term (Next Month)
6. **Expand layout library** to 10-12 patterns based on usage data
7. **Consider RAG approach** — retrieve similar slide layouts from McKinsey reference decks
8. **Iterate** — track which layouts get used most, add variations

---

## Key Insight

The problem isn't your rendering stack. It's that the AI doesn't know it has options. Give it a menu of 10 well-designed layouts, and you'll get visual variety that rivals top consulting firms — without abandoning your current architecture.

**Remember:** McKinsey slides look different not because they use different tools, but because they follow a taxonomy of layout patterns for different content types. Build that taxonomy into your system.

---

*Report prepared by Saki for SlideTheory*  
*Questions or need implementation support? Just ask.*
