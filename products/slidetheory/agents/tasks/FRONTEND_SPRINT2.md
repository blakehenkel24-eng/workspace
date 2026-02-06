# Frontend Agent - Sprint 2 Tasks

## Your Mission
Implement the slide input form, preview panel, and HTML templates following the exact layout specifications from PROMPT_INSTRUCTIONS.md.

## Context
- **Product:** SlideTheory - AI-powered slide generator for strategy consultants
- **Tech Stack:** Next.js 14+, React, Tailwind CSS, TypeScript, shadcn/ui
- **Repo:** blakehenkel24-eng/workspace

**CRITICAL REFERENCE:** `/products/slidetheory/PROMPT_INSTRUCTIONS.md` - Contains the slide archetype layouts (Executive Summary, Horizontal Flow, Vertical Flow, Graph/Chart).

---

## Sprint 2 Stories Assigned to You

### Story 2.1: Slide Input Form (Left Panel) (8 points)
**Priority: HIGH**

Build the comprehensive slide input form with all required fields.

**Acceptance Criteria:**
- [ ] Slide type dropdown with options:
  - **General** - Standard slide layout
  - **Executive Summary** - Pyramid principle, so-what first
  - **Horizontal Flow** - Process/timeline, left-to-right
  - **Vertical Flow** - Issue tree, top-down hierarchy, MECE
  - **Graph/Chart** - Data viz with insight callouts
- [ ] Audience dropdown with options:
  - C-Suite/Board
  - External Client
  - Internal/Working Team
  - PE/Investors
- [ ] Context textbox (rich text, min 10 chars)
- [ ] Presentation mode toggle (Presentation vs Read)
- [ ] Data input box (text area for data entry)
- [ ] File upload for Excel/CSV files (optional)
- [ ] Key Takeaway textbox
- [ ] Generate button with loading state
- [ ] Form validation with inline errors
- [ ] Auto-save draft functionality

**UI Requirements:**
- Clean left panel design
- Proper field labels and help text
- **Slide type descriptions explaining each archetype:**
  - Executive Summary: "Single headline with 3-4 supporting bullets. Pyramid principle."
  - Horizontal Flow: "Process steps or timeline. Left-to-right visual flow."
  - Vertical Flow: "Issue tree or breakdown structure. Top-down hierarchy, MECE."
  - Graph/Chart: "Data visualization focus with insight callouts."
- Audience-specific guidance hints
- Character count for text fields

**Files to Create:**
- `/products/slidetheory/mvp/build/app/dashboard/new-slide/page.tsx`
- `/products/slidetheory/mvp/build/components/slides/slide-form.tsx`
- `/products/slidetheory/mvp/build/components/slides/slide-type-selector.tsx`
- `/products/slidetheory/mvp/build/components/slides/audience-selector.tsx`

---

### Story 2.2: Slide Preview Panel (Right Panel) (8 points)
**Priority: HIGH**

Build the slide preview panel with proper 16:9 ratio and responsive design.

**CRITICAL REQUIREMENT:** Preview must maintain exact 16:9 aspect ratio for all slide archetypes.

**Acceptance Criteria:**
- [ ] **16:9 ratio preview container (maintains aspect ratio at all screen sizes)**
- [ ] **Base resolution reference: 1920x1080 (scaled down for display)**
- [ ] Placeholder state before generation
- [ ] Loading state with progress indicator
- [ ] Error state with retry option
- [ ] Generated slide display (HTML rendered)
- [ ] Zoom controls (fit, 100%, 150%)
- [ ] Fullscreen preview mode
- [ ] Responsive design (stacks on mobile)

**Preview States:**
1. **Empty State:** "Your slide preview will appear here"
2. **Loading State:** Progress bar + "Generating your slide..."
3. **Error State:** Error message + "Try Again" button
4. **Success State:** Rendered slide with download options

**Files to Create:**
- `/products/slidetheory/mvp/build/components/slides/slide-preview.tsx`
- `/products/slidetheory/mvp/build/components/slides/preview-controls.tsx`

---

### Story 2.4: HTML Slide Templates (5 points)
**Priority: HIGH - Follow Archetype Layouts Exactly**

Create HTML templates for each slide type with McKinsey-style design.

**CRITICAL: Reference slide archetypes from PROMPT_INSTRUCTIONS.md**

**Acceptance Criteria:**
- [ ] General slide template
- [ ] **Executive Summary template:** 
  - Pyramid principle layout
  - Large headline at top (action-oriented)
  - 3-4 supporting bullets below
  - So-what first, then supporting points
- [ ] **Horizontal Flow template:**
  - Process steps or timeline layout
  - Left-to-right visual flow
  - Clear sequence indicators (arrows, numbers)
  - Connected boxes/steps
- [ ] **Vertical Flow template:**
  - Issue tree or breakdown structure
  - Top-down hierarchy
  - MECE branch structure (clear indentation, grouping)
  - Parent-child relationships visible
- [ ] **Graph/Chart template:**
  - Data visualization focus
  - Chart area (placeholder for chart rendering)
  - Insight callout box
  - Clear axes label areas
- [ ] Consistent styling across all templates
- [ ] **Responsive scaling within 16:9 container (1920x1080 base)**
- [ ] Professional typography and spacing
- [ ] **MECE content structure display support**

**Design Standards:**
- **Aspect Ratio:** 16:9 (1920x1080 base, scaled responsively)
- Primary color: Navy #003366
- Background: White #FFFFFF
- Accent: Blue #4A90E2
- Fonts: Inter for body, system-serif for accents
- Proper whitespace (no content touching edges)
- Clear visual hierarchy

**Template Structure for Each Archetype:**

```
Executive Summary:
+------------------------------------------+
|  HEADLINE (Action-oriented, large)       |
+------------------------------------------+
|  • Key insight 1                          |
|  • Key insight 2                          |
|  • Key insight 3                          |
|  • Key insight 4                          |
+------------------------------------------+

Horizontal Flow:
+------------------------------------------+
|  HEADLINE                                |
+------------------------------------------+
|  [Step 1] → [Step 2] → [Step 3] → [...]  |
|                                           |
|  (Timeline/process visualization)         |
+------------------------------------------+

Vertical Flow:
+------------------------------------------+
|  HEADLINE                                |
+------------------------------------------+
|        [Parent Node]                      |
|       /      |      \                    |
|  [Child 1] [Child 2] [Child 3]           |
|  (MECE branches, tree structure)          |
+------------------------------------------+

Graph/Chart:
+------------------------------------------+
|  HEADLINE                                |
+------------------------------------------+
|  +------------------+  +-------------+  |
|  |                  |  |  Insight    |  |
|  |   [Chart Area]   |  |  Callout    |  |
|  |                  |  +-------------+  |
|  +------------------+                   |
+------------------------------------------+
```

**Files to Create:**
- `/products/slidetheory/mvp/build/components/slides/templates/general-template.tsx`
- `/products/slidetheory/mvp/build/components/slides/templates/executive-summary-template.tsx`
- `/products/slidetheory/mvp/build/components/slides/templates/horizontal-flow-template.tsx`
- `/products/slidetheory/mvp/build/components/slides/templates/vertical-flow-template.tsx`
- `/products/slidetheory/mvp/build/components/slides/templates/graph-chart-template.tsx`
- `/products/slidetheory/mvp/build/components/slides/templates/index.ts`

---

### Story 2.6: My Slides Gallery (3 points)
**Priority: MEDIUM**

Build the slide gallery page showing all user's generated slides.

**Acceptance Criteria:**
- [ ] Grid layout of slide thumbnails (16:9 aspect ratio previews)
- [ ] Slide metadata display (title, date, type)
- [ ] Pagination or infinite scroll
- [ ] Search/filter by slide type
- [ ] Sort by date (newest first)
- [ ] Click to view/edit slide
- [ ] Empty state for new users

**Files to Create:**
- `/products/slidetheory/mvp/build/app/dashboard/slides/page.tsx`
- `/products/slidetheory/mvp/build/components/slides/slide-gallery.tsx`
- `/products/slidetheory/mvp/build/components/slides/slide-card.tsx`

---

## Definition of Done
- All acceptance criteria met
- Code committed to GitHub
- UI matches design specifications
- **16:9 aspect ratio maintained in all templates**
- Mobile responsive verified
- Accessibility (ARIA labels, keyboard nav)
- **Slide archetypes match PROMPT_INSTRUCTIONS.md layouts**

## Dependencies
- Sprint 1 complete (Auth, UI Shell)
- Backend Agent completing Story 2.3 (API)

## Communication
- Report progress to main agent
- Ask for help if blocked > 2 hours
- Daily status updates
- Coordinate with Backend Agent on API contracts

## Output Location
All code should be written to: `/products/slidetheory/mvp/build/`

## References
- **PROMPT_INSTRUCTIONS.md:** `/products/slidetheory/PROMPT_INSTRUCTIONS.md` (CRITICAL)
- Sprint Plan: `/products/slidetheory/SPRINT_PLAN.md`
- Product Spec: `/products/slidetheory/PRODUCT-SPEC.md`
