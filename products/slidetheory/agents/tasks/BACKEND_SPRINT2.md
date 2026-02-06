# Backend Agent - Sprint 2 Tasks

## Your Mission
Implement the Kimi API integration for slide generation using the EXACT prompt template from PROMPT_INSTRUCTIONS.md.

## Context
- **Product:** SlideTheory - AI-powered slide generator for strategy consultants
- **Tech Stack:** Supabase Edge Functions, Kimi API
- **Repo:** blakehenkel24-eng/workspace
- **MCP Servers:** Supabase, GitHub connected

**CRITICAL REFERENCE:** `/products/slidetheory/PROMPT_INSTRUCTIONS.md` - Contains the exact prompt template and quality standards you MUST use.

---

## Sprint 2 Stories Assigned to You

### Story 2.3: Kimi API Integration (8 points)
**Priority: CRITICAL - Follow Prompt Instructions Exactly**

Implement the slide generation API using Kimi API with the exact prompt template provided.

**CRITICAL REQUIREMENTS from PROMPT_INSTRUCTIONS.md:**

### Prompt Template (MUST USE EXACTLY):
```
You are an elite consulting slide creation expert specializing in transforming complex business information into high-impact, executive-ready presentations. Your expertise draws from the communication principles of top-tier management consulting firms (McKinsey, BCG, Bain), emphasizing clarity, logical structure, and compelling visual storytelling.

## Target Audience & Context
- **Primary audience:** C-Suite Executives and Private Equity Deal Teams
- **Audience knowledge level:** Varies and may be unknown
- **Decision impact:** Varies greatly depending on specific use case

## Core Responsibilities
For each slide request, provide:
1. **Precise slide title** - Clear, action-oriented headline
2. **Sharp executive summary** - One key message or insight
3. **Structured content** - MECE-organized bullets, frameworks, groupings
4. **Visual layout recommendation** - Charts, tables, diagrams with specific guidance

## Slide Creation Methodology
- **Identify the correct archetype:** Waterfall, issue tree, matrix, market sizing, process flow, etc.
- **Apply MECE principle:** Ensure all content is Mutually Exclusive and Collectively Exhaustive
- **Structure for impact:** Lead with insights, support with data
- **Optimize for executive attention:** Front-load key messages, minimize cognitive load

## Content Processing Approach
When users provide:
- **Raw data/information:** Transform into structured insights
- **Uploaded files:** Extract key themes and build slide frameworks
- **Unclear context:** Ask precise, minimal clarifying questions

## Output Requirements
**Always deliver:**
- Clean bullet-point structure (never large text blocks)
- Executive-level language and tone
- PNG Format optimization (for Nano Banana image generation)

**Never include:**
- Raw prose or unstructured text
- Overly technical jargon without context

## Quality Standards
- **Clarity:** Every element serves a clear purpose
- **Conciseness:** Distill to essential insights only
- **Logic:** Follow clear narrative flow
- **Impact:** Structure content to drive decision-making

Create a slide with the following specifications:

SLIDE TYPE: {slide_type}
TARGET AUDIENCE: {audience}
PRESENTATION MODE: {presentation_mode ? 'Presentation (less detail)' : 'Read Mode (more detail)'}

CONTEXT:
{context}

{data ? 'DATA PROVIDED:\n' + data : ''}

{key_takeaway ? 'KEY TAKEAWAY TO EMPHASIZE: ' + key_takeaway : ''}

Generate a complete slide with:
1. Compelling headline (action-oriented)
2. Structured content (MECE-organized bullets, never prose)
3. Layout description (visual recommendations)
4. Full text content for all elements

Output format: JSON
```

### Slide Type Archetypes (MUST Follow These Structures):

**1. Executive Summary:**
- Single headline with supporting 3-4 bullets
- Pyramid principle structure
- So-what first, then supporting points

**2. Horizontal Flow:**
- Process steps or timeline
- Left-to-right visual flow
- Clear sequence indicators

**3. Vertical Flow:**
- Issue tree or breakdown structure
- Top-down hierarchy
- MECE branches

**4. Graph / Chart:**
- Data visualization focus
- Clear axes and labels
- Insight callouts

### Quality Standards (MUST Enforce):
- **MECE Principle:** Mutually Exclusive, Collectively Exhaustive
- **Front-load key messages:** So-what first, then supporting points
- **Executive tone:** Clear, concise, action-oriented language
- **Structured bullets:** Never large text blocks
- **Action-oriented headlines:** "Increase revenue by 20%" not "Revenue Analysis"

### Output JSON Schema:
```typescript
{
  headline: string;           // Action-oriented slide title
  summary: string;            // One key insight
  content: {
    sections: Array<{
      type: 'header' | 'bullet' | 'sub-bullet' | 'chart' | 'matrix';
      content: string;
      items?: string[];       // For nested bullets
    }>;
  };
  layout: {
    type: 'executive_summary' | 'horizontal_flow' | 'vertical_flow' | 'graph_chart' | 'general';
    recommendations: string;  // Visual guidance for frontend
  };
}
```

---

### Story 2.5: Slide Rendering Engine (5 points)
**Priority: HIGH**

Implement the slide rendering pipeline using Puppeteer for PNG generation.

**Acceptance Criteria:**
- [ ] Puppeteer MCP integration
- [ ] HTML to PNG conversion endpoint
- [ ] **1920x1080 (16:9) output resolution EXACTLY**
- [ ] High-quality rendering (2x scale for retina)
- [ ] Storage of generated images in Supabase Storage
- [ ] Public URL generation for downloads
- [ ] Background processing with status tracking

**Technical Approach:**
1. Receive HTML content from Kimi generation
2. Inject into template with styling
3. Puppeteer captures screenshot at 1920x1080
4. Upload PNG to Supabase Storage
5. Update slide record with image_url

**Files to Create/Modify:**
- `/products/slidetheory/mvp/build/supabase/functions/generate-slide/index.ts`
- `/products/slidetheory/mvp/build/supabase/functions/render-slide/index.ts`

---

## Definition of Done
- All acceptance criteria met
- Prompt template matches PROMPT_INSTRUCTIONS.md exactly
- Code committed to GitHub
- API returns properly structured JSON
- MECE quality standards enforced in prompts

## Dependencies
- Sprint 1 complete (Auth, Database)
- Kimi API key configured
- Supabase Storage bucket created

## Communication
- Report progress to main agent
- Ask for help if blocked > 2 hours
- Daily status updates

## Output Location
All code should be written to: `/products/slidetheory/mvp/build/`

## References
- **PROMPT_INSTRUCTIONS.md:** `/products/slidetheory/PROMPT_INSTRUCTIONS.md` (CRITICAL)
- Sprint Plan: `/products/slidetheory/SPRINT_PLAN.md`
- Product Spec: `/products/slidetheory/PRODUCT-SPEC.md`
