# SlideTheory MVP - Wireframes

## Overview

The SlideTheory MVP uses a **split-panel layout** optimized for productivity:
- **Left Panel (40%)**: Input form - clean, focused, fast to complete
- **Right Panel (60%)**: Live preview - immediate visual feedback

This layout enables consultants to generate slides in under 60 seconds.

---

## Layout Structure

### Main Layout: Split View

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER (60px)                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  [Logo]  SlideTheory                        [Help] [Settings]  │ │
│  └────────────────────────────────────────────────────────────────┘ │
├────────────────────────────┬────────────────────────────────────────┤
│                            │                                        │
│  INPUT PANEL (400-480px)   │     PREVIEW PANEL (flex: 1)            │
│  ┌──────────────────────┐  │     ┌──────────────────────────────┐   │
│  │  1. Slide Type       │  │     │                              │   │
│  │  ┌────────────────┐  │  │     │    [GENERATED SLIDE]         │   │
│  │  │ ▼ Title Slide  │  │  │     │                              │   │
│  │  └────────────────┘  │  │     │    16:9 presentation ratio   │   │
│  │                      │  │     │                              │   │
│  │  2. Context          │  │     │    • Title text              │   │
│  │  ┌────────────────┐  │  │     │    • Body content            │   │
│  │  │                │  │  │     │    • Charts/visuals          │   │
│  │  │ Enter context  │  │  │     │                              │   │
│  │  │ for the slide  │  │  │     │                              │   │
│  │  │ ...            │  │  │     └──────────────────────────────┘   │
│  │  └────────────────┘  │  │                                        │
│  │                      │  │     ┌──────────────────────────────┐   │
│  │  3. Data Points      │  │     │  [↻ Regenerate]  [⬇ Download] │   │
│  │  ┌────────────────┐  │  │     └──────────────────────────────┘   │
│  │  │                │  │  │                                        │
│  │  │ Paste or type  │  │  │                                        │
│  │  │ data here...   │  │  │                                        │
│  │  └────────────────┘  │  │                                        │
│  │                      │  │                                        │
│  │  4. Audience         │  │                                        │
│  │  ┌────────────────┐  │  │                                        │
│  │  │ ▼ C-Suite      │  │  │                                        │
│  │  └────────────────┘  │  │                                        │
│  │                      │  │                                        │
│  │  5. Framework        │  │                                        │
│  │  ┌────────────────┐  │  │                                        │
│  │  │ ▼ McKinsey 7S  │  │  │                                        │
│  │  └────────────────┘  │  │                                        │
│  │                      │  │                                        │
│  │  ┌────────────────┐  │  │                                        │
│  │  │  [GENERATE]    │  │  │                                        │
│  │  │  Lightning icon│  │  │                                        │
│  │  └────────────────┘  │  │                                        │
│  │                      │  │                                        │
│  └──────────────────────┘  │                                        │
│                            │                                        │
└────────────────────────────┴────────────────────────────────────────┘
```

---

## Responsive Behavior

### Desktop (1024px+)
- Split view as shown above
- Input panel: 400px fixed (expands to 480px on large screens)
- Preview panel: Flexible, fills remaining space

### Tablet (768px - 1023px)
- Input panel: 320px fixed
- Preview panel: Flexible
- Font sizes slightly reduced

### Mobile (< 768px)
- Stacked layout: Input on top, preview below
- Full-width panels
- Preview collapsible/expandable
- Generate button sticky at bottom

```
Mobile Layout:
┌─────────────────────────────┐
│  HEADER                     │
├─────────────────────────────┤
│  INPUT FORM                 │
│  ┌───────────────────────┐  │
│  │ Slide Type            │  │
│  │ ...                   │  │
│  │ [GENERATE]            │  │
│  └───────────────────────┘  │
├─────────────────────────────┤
│  ▼ PREVIEW (expandable)     │
│  ┌───────────────────────┐  │
│  │  [Generated slide]    │  │
│  └───────────────────────┘  │
│  [⬇ Download]               │
└─────────────────────────────┘
```

---

## Panel Details

### Input Panel (Left)

**Header Section:**
- Logo: "SlideTheory" wordmark
- Subtitle: "AI-powered slides for strategy consultants"

**Form Sections (stacked vertically):**

1. **Slide Type** (required)
   - Dropdown select
   - Options: Title Slide, Executive Summary, Market Analysis, Growth Strategy, Financial Projection, Org Chart, Timeline, Comparison, SWOT, Custom
   - Visual icons for each type

2. **Context** (required)
   - Multi-line textarea
   - Placeholder: "Describe the purpose of this slide, key message, and any background information..."
   - Character counter: 0/500
   - Expandable (grows with content)

3. **Data Points** (optional)
   - Multi-line textarea
   - Placeholder: "Paste relevant data, metrics, or bullet points..."
   - Supports: Plain text, CSV paste, bullet points
   - Character counter: 0/1000

4. **Audience** (required)
   - Dropdown select
   - Options: C-Suite, Board Members, Investors, Internal Team, Clients, Analysts, General
   - Affects tone and terminology

5. **Framework** (optional)
   - Dropdown select
   - Options: None, McKinsey 7S, BCG Matrix, Porter's 5 Forces, SWOT, MECE, Pyramid Principle, AARRR, Custom
   - Shows framework preview on hover

6. **Generate Button**
   - Full width of panel
   - Primary accent color
   - Lightning bolt icon + "Generate Slide"
   - Loading state with spinner

### Preview Panel (Right)

**Slide Display Area:**
- 16:9 aspect ratio container (maintained)
- Centered within available space
- Gray background to show slide boundaries
- Slide rendered at high resolution

**Action Bar (below slide):**
- Regenerate button (secondary style, circular arrow icon)
- Download button (primary style, download icon)
- Format selector: PNG / PDF / PPTX

**Empty State:**
- Large placeholder icon (slide/document)
- Text: "Your generated slide will appear here"
- Subtext: "Fill out the form and click Generate"

---

## Loading States

### Generating State
```
Input Panel:
- Generate button disabled
- Spinner replaces lightning icon
- Text: "Generating..."
- Progress indicator (optional): Analyzing context → Structuring content → Designing slide → Finalizing

Preview Panel:
- Slide area dims (overlay at 50% opacity)
- Centered loading spinner
- Text: "Creating your slide..."
- Skeleton/shimmer effect on slide placeholder
```

### Success State
- Brief success toast (optional)
- Slide fades in smoothly
- Download button becomes prominent

### Error State
- Error message in inline alert (input panel)
- Red border on problematic field
- Retry button
- "Copy error details" for support

---

## State Diagram

```
┌─────────────┐     Fill form      ┌─────────────┐
│   Empty     │ ─────────────────▶ │   Ready     │
│             │                    │  (Valid)    │
└─────────────┘                    └──────┬──────┘
       ▲                                  │
       │                                  │ Click Generate
       │                                  ▼
       │                           ┌─────────────┐
       │                           │  Loading    │
       │                           │             │
       │                           └──────┬──────┘
       │                                  │
       │         ┌──────────────────────┐ │ Success
       │         │                      │ │
       └─────────┤      Error           │◀┘
                 │  (with retry)        │
                 └──────────────────────┘
```

---

## Accessibility Considerations

- All form fields have associated labels
- Focus states visible (blue outline)
- Error messages linked to fields via aria-describedby
- Loading states announced via aria-live
- Keyboard navigation: Tab through form, Enter to submit
- High contrast mode support via system preferences
