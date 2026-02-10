# Slide Generation Backend Architecture: Competitive Analysis

> Research on how Gamma, Tome, Beautiful.ai, and others generate slides on the backend  
> Compiled: February 9, 2026

---

## Executive Summary

Competitors use a **multi-layer architecture** with three core stages:
1. **AI Planning Layer** — LLM generates structured JSON outline from prompt
2. **Content Generation Layer** — Per-slide content population (optional enrichment)
3. **Rendering Layer** — JSON → Visual output (HTML/CSS canvas, PPTX libraries, or PDF)

The key differentiator is **not** the AI model—it's the **rendering strategy** and **template system**.

---

## Gamma Architecture (Inferred from GitHub + Public Info)

### Tech Stack
| Component | Technology |
|-----------|------------|
| Editor Framework | **TipTap** (headless editor) — ProseMirror-based rich text editor |
| UI Components | **Chakra UI** — React component library |
| Drag & Drop | **dnd-kit** — Modern React drag-and-drop toolkit |
| Frontend | React-based web app |
| Output Format | **Web-native cards** (HTML/CSS), NOT traditional slides |
| Export | PDF only (PPTX export reportedly "not available yet") |

### Key Insight: Gamma is "Anti-PowerPoint"
Gamma doesn't generate traditional slides—it creates **scrollable, web-native documents** using a "card" layout system. Each "slide" is actually a responsive content block.

### Content Flow
```
User Prompt
    ↓
AI Model (likely GPT-4) generates outline
    ↓
Template system applies "smart layouts" (responsive CSS)
    ↓
TipTap editor renders rich text + embeds
    ↓
Export: PDF (browser print-to-PDF) or live web link
```

### What Gamma Does NOT Do
- ❌ Generate actual .pptx files (PDF only)
- ❌ Use PPTX libraries like python-pptx or PptxGenJS
- ❌ Render to canvas/SVG for export
- ✅ Everything stays in HTML/DOM until export

---

## Tome Architecture (Pre-Acquisition)

### What We Know
Tome raised $80M+ for AI storytelling, then **pivoted**—the presentation tool was acquired/repurposed by AngelList for legal document summarization.

### Inferred Architecture (from Reddit/discussions)
```
User Prompt
    ↓
LLM (GPT-4) → Deck outline JSON
    ↓
Template binding ("Title Slide", "Big Number", etc.)
    ↓
Per-slide LLM calls for content details
    ↓
Concurrent image generation (DALL-E/Midjourney)
    ↓
Render: Likely canvas-based or HTML-to-image
```

### Key Difference: Visual Storytelling
Tome emphasized **visual narratives** with generated images, not just text slides. Each "page" was more like a storybook layout than a consulting slide.

---

## How Slide Generation Actually Works (Technical Deep Dive)

### The Universal Pattern

Based on open-source implementations and technical write-ups, here's the standard architecture:

```
┌─────────────────────────────────────────────────────────────┐
│  STAGE 1: AI PLANNING (Single LLM Call)                     │
├─────────────────────────────────────────────────────────────┤
│  Input: User prompt + context                               │
│  Output: JSON array of slides                               │
│                                                             │
│  Example Output:                                            │
│  [                                                          │
│    {                                                        │
│      "slide_type": "title",                                 │
│      "title_text": "Q3 Revenue Growth",                     │
│      "subtitle_text": "Up 23% YoY",                         │
│      "layout": "title_subtitle"                             │
│    },                                                       │
│    {                                                        │
│      "slide_type": "content",                               │
│      "title_text": "Key Drivers",                           │
│      "bullets": [                                           │
│        "Enterprise segment +34%",                           │
│        "New product lines contributed $2M",                 │
│        "International expansion"                            │
│      ],                                                     │
│      "image_desc": "optional: chart showing growth"         │
│    }                                                        │
│  ]                                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  STAGE 2: CONTENT POPULATION (Optional)                     │
├─────────────────────────────────────────────────────────────┤
│  - Per-slide LLM calls for deeper content                   │
│  - Web search for facts/stats                               │
│  - Image generation (DALL-E, Midjourney, Unsplash)          │
│  - Data visualization (chart generation)                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  STAGE 3: RENDERING (The Differentiator)                    │
├─────────────────────────────────────────────────────────────┤
│  Option A: HTML/CSS → PPTX (via PptxGenJS)                  │
│  Option B: HTML/CSS → PDF (via Puppeteer/Playwright)        │
│  Option C: Canvas/SVG → Image → PPTX                        │
│  Option D: Native PPTX generation (python-pptx)             │
└─────────────────────────────────────────────────────────────┘
```

---

## Rendering Approaches Compared

### Approach 1: PptxGenJS (What Most Use)
**Library:** [PptxGenJS](https://github.com/gitbrent/PptxGenJS) — 3,500+ GitHub stars

**How it works:**
- Pure JavaScript library
- Generates OOXML (Open Office XML) files
- No PowerPoint installation required
- Works in browser, Node.js, React, etc.

**Code example:**
```javascript
import pptxgen from "pptxgenjs";

let pres = new pptxgen();
let slide = pres.addSlide();
slide.addText("Hello World", { x: 1, y: 1, color: "363636" });
pres.writeFile({ fileName: "demo.pptx" });
```

**Pros:**
- ✅ True .pptx files (editable in PowerPoint)
- ✅ Master slide templates for branding
- ✅ Charts, tables, images, shapes
- ✅ TypeScript support

**Cons:**
- ❌ Limited design flexibility (PowerPoint constraints)
- ❌ Fonts must be available on user's system
- ❌ Complex layouts difficult

**Who uses this:** Most "PowerPoint export" features in AI slide tools

---

### Approach 2: Puppeteer/Playwright + PDF
**How it works:**
- Render HTML/CSS slides in headless browser
- Print-to-PDF or screenshot
- Optional: Convert PDF to PPTX (lossy)

**Pros:**
- ✅ Perfect visual fidelity
- ✅ Any CSS/design possible
- ✅ Easy to implement

**Cons:**
- ❌ PDF is not editable
- ❌ PPTX conversion is problematic
- ❌ Large file sizes

**Who uses this:** Gamma (PDF export), web-first tools

---

### Approach 3: python-pptx (Python Backend)
**Library:** `python-pptx`

**How it works:**
- Python library for creating/modifying PPTX
- Server-side generation
- Template-based with placeholders

**Code example:**
```python
from pptx import Presentation

prs = Presentation("template.pptx")
slide = prs.slides.add_slide(prs.slide_layouts[1])
slide.shapes.title.text = "Q3 Results"
tf = slide.placeholders[1].text_frame
tf.text = "Revenue up 23%"
prs.save("output.pptx")
```

**Pros:**
- ✅ Native Python (easy backend integration)
- ✅ Template-based consistency
- ✅ Fast generation

**Cons:**
- ❌ Limited to PowerPoint's capabilities
- ❌ No "modern" web design

**Who uses this:** Enterprise tools, automated reporting systems

---

### Approach 4: HTML5 Canvas / SVG
**How it works:**
- Render slides to canvas or SVG
- Export as images
- Insert images into PPTX

**Pros:**
- ✅ Pixel-perfect rendering
- ✅ Complex graphics possible
- ✅ Cross-platform consistency

**Cons:**
- ❌ PPTX becomes "image slides" (not editable text)
- ❌ Large file sizes
- ❌ Accessibility issues

**Who uses this:** Design-heavy tools, pitch deck generators

---

## Beautiful.ai Approach (Reverse-Engineered)

### What Makes Beautiful.ai Different
Beautiful.ai pioneered **"smart templates"**—the AI doesn't just generate content, it enforces design rules.

### Architecture (Inferred)
```
User Input
    ↓
Template Selection (AI-assisted)
    ↓
Content → Smart Layout Engine
    ↓
Design Rules Applied (spacing, alignment, typography)
    ↓
WebGL/Canvas Rendering
    ↓
Export: PPTX (via conversion) or PDF
```

### Key Innovation: Constraint-Based Design
- Templates have **rules** (e.g., "this layout supports 3-5 bullets")
- AI fits content into rules, not freeform
- Results in consistent, "professional" output

---

## Competitive Matrix: Backend Approaches

| Tool | Rendering Engine | Export Formats | Template System | Key Differentiator |
|------|-----------------|----------------|-----------------|-------------------|
| **Gamma** | TipTap + React DOM | PDF, Web link | Smart cards | Web-native, scrollable |
| **Tome** | Likely Canvas/WebGL | PDF, Web link | Story layouts | Visual narratives |
| **Beautiful.ai** | Proprietary | PPTX, PDF | Rule-based templates | Design automation |
| **Plus AI** | PptxGenJS likely | PPTX, Google Slides | Traditional slides | Google Workspace integration |
| **Pitch** | Proprietary | PPTX, PDF | Brand templates | Real-time collaboration |
| **Canva** | Fabric.js/Canvas | Everything | Template marketplace | Design flexibility |

---

## Key Takeaways for SlideTheory

### 1. The "Consultant-Grade" Gap
**None of these tools optimize for McKinsey/BCG-style slides.** They're general-purpose. The opportunity is **vertical-specific** AI for consulting slides.

### 2. Rendering Trade-offs
| Goal | Best Approach |
|------|---------------|
| Editable PPTX | python-pptx or PptxGenJS |
| Visual fidelity | Puppeteer → PDF |
| Web sharing | HTML/CSS (like Gamma) |
| Speed | Template-based generation |

### 3. The Template Strategy
All successful tools use **templates**—not freeform AI generation. Templates provide:
- Consistency
- Predictable layouts
- Brand compliance
- Faster rendering

### 4. AI Model is Commoditized
Everyone uses GPT-4 or equivalent. The moat is in:
- **Prompt engineering** (output quality)
- **Template library** (design quality)
- **Vertical expertise** (content quality)

---

## Recommendations for SlideTheory Backend

### Option A: Hybrid Approach (Recommended)
```
AI Planning (GPT-4/Kimi) → JSON Outline
         ↓
Template Matching (consulting-specific layouts)
         ↓
Dual Rendering:
  ├─ PptxGenJS → Editable .pptx (primary)
  └─ Puppeteer → PDF preview (secondary)
```

### Option B: Web-First (Gamma-Style)
```
AI Planning → JSON
         ↓
React + TipTap editor
         ↓
PDF export + PPTX conversion service
```

### Option C: Enterprise-First
```
AI Planning → JSON
         ↓
python-pptx with consulting templates
         ↓
Direct PPTX output (fastest, most compatible)
```

### Critical Decision: PPTX vs. Web
- **PPTX-first** = Consultant workflow compatibility
- **Web-first** = Better UX, harder to export
- **Hybrid** = Best of both, more complex

---

## Technical Resources

### Libraries to Evaluate
1. **PptxGenJS** — [github.com/gitbrent/PptxGenJS](https://github.com/gitbrent/PptxGenJS)
2. **python-pptx** — [python-pptx.readthedocs.io](https://python-pptx.readthedocs.io)
3. **TipTap** — [tiptap.dev](https://tiptap.dev) (Gamma's editor)
4. **Puppeteer** — For PDF generation from HTML

### Open-Source Implementations
- [LLM Slide Deck Generator](https://medium.com/@gaddam.rahul.kumar/building-an-llm-powered-slide-deck-generator-with-langgraph-973aeaac0a06) — Full LangGraph + python-pptx implementation
- [Reveal.js](https://revealjs.com/) — HTML presentation framework
- [WebSlides](https://webslides.tv/) — Another HTML slide framework

---

## Next Steps

1. **Prototype Decision:** Choose rendering approach (recommend PptxGenJS + consulting templates)
2. **Template Library:** Design 10-20 consulting-specific slide layouts
3. **Prompt Engineering:** Develop consulting-grade content generation prompts
4. **Export Testing:** Validate PPTX output in PowerPoint, Keynote, Google Slides
5. **Competitive Audit:** Sign up for Gamma Pro, test their export quality

---

*Research compiled from public documentation, GitHub repos, technical write-ups, and reverse engineering. No proprietary information accessed.*
