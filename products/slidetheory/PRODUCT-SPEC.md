# SlideTheory Product Spec

## One-Line Pitch
AI image generator that creates McKinsey/BCG/Bain-quality slides from context + MBB slide knowledge base.

---

## Problem
- Strategy consultants spend 4+ hours per deck on visual formatting
- Current AI tools (ChatGPT, Claude) output text, not visual slides
- Generic AI image generators don't understand consulting slide structures
- No tool trained specifically on MBB slide patterns

## Solution
**Input → AI (Kimi K2.5) → Image Generation (Kimi/Nano Banana) → PNG/PPTX**

**Flow:**
1. User describes context (topic, audience, key message, data points)
2. AI references MBB knowledge base (slide structures, frameworks, layouts)
3. AI generates image prompt optimized for consulting slide output
4. Image model (Kimi or Nano Banana) generates slide as PNG
5. User downloads PNG or converts to PowerPoint format

---

## MBB Knowledge Base
**Training Source:** Scan/analyze MBB slide decks for:
- **Slide structures:** Executive summary, market sizing, 2x2 matrix, waterfall charts
- **Layout patterns:** Title placement, text hierarchy, visual balance
- **Frameworks:** MECE, issue trees, pyramid principle, BCG matrix
- **Typography:** Font choices, sizing, spacing conventions
- **Color palettes:** McKinsey navy, BCG green, Bain red

**Implementation:** Vector database of slide embeddings + retrieval-augmented generation

---

## Core Features

### v1.0 (MVP)
- Text input for context, audience, key message, data
- AI structures content using MBB frameworks
- Image generation via Kimi or Nano Banana
- PNG download
- Basic PowerPoint export (slide per image)

### v1.1 (Next)
- MBB knowledge base integration (RAG)
- Template selection (Executive Summary, Market Analysis, etc.)
- Edit/regenerate cycle
- Higher-res image output

### v1.2 (Later)
- Multi-slide deck generation
- Custom branding (colors, fonts)
- Team collaboration

---

## Technical Approach

### Image Generation Options
| Model | Pros | Cons |
|-------|------|------|
| **Kimi K2.5** | Good text rendering, fast, cost-effective | Newer for images |
| **Nano Banana** | Purpose-built for slides, MBB-trained? | Availability, cost |

**Decision:** Start with Kimi (proven, available), evaluate Nano Banana for v1.1

### MBB Knowledge Integration
- Parse/analyze MBB slide PDFs
- Extract structure patterns, layouts, frameworks
- Store as embeddings in vector DB (Pinecone/Weaviate)
- RAG: Retrieve similar slides → inform generation prompt

---

## Target User
**Primary:** Strategy consultants needing quick, polished slides
**Secondary:** PE associates, startup founders, management consultants

**Use Cases:**
- "Need an executive summary slide for board meeting in 10 minutes"
- "Turn these bullet points into a McKinsey-style market analysis"
- "Generate 2x2 competitive landscape from this data"

---

## Pricing
- **Free:** 10 slides/month, standard quality
- **Pro ($12/mo):** 100 slides/month, high-res, all templates
- **Team ($39/mo):** Unlimited, custom branding, team library

---

## Success Metrics
- **Now:** First paying user
- **Q1:** $100 MRR
- **EOY:** $1,000 MRR

---

## Decisions Made
| Question | Decision |
|----------|----------|
| Slide library vs pure generation | **Pure generation** — AI creates from scratch, no pre-made templates |
| PowerPoint plugin vs web-only | **Web only** — no plugin, browser-based only |
| Freemium vs free trial | **TBD** — decide after first 10 users |

## Open Questions (Production v2.0)
1. **Nano Banana:** Verify if this model exists and is available for API access
2. **MBB Data:** Source MBB slide decks for knowledge base training
3. **Text Accuracy:** Research solutions for readable text in AI-generated slides

**Resolved:**
- ✅ **Image vs HTML:** MVP uses HTML, Production uses AI image gen

---

## Technical Roadmap

### MVP (v1.1.0) — HTML-to-Image
**Approach:** Structured data → HTML template → Puppeteer screenshot
- ✅ Fast (1-3s per slide)
- ✅ Perfect text rendering
- ✅ Consistent layouts
- ✅ Cheap (~$0.001 per slide)

### Production (v2.0) — AI Image Generation
**Approach:** Context → Kimi/Nano Banana → PNG slide
- 🎯 More visual variety
- 🎯 True "AI-native" feel
- ⚠️ Text accuracy challenges
- ⚠️ Higher cost (~$0.03-0.06 per slide)

**Decision:** HTML for MVP validation, AI gen for production scaling

---

**Status:** Spec updated, MVP approach needs alignment
**Next:** Confirm technical direction → Build/adjust MVP
