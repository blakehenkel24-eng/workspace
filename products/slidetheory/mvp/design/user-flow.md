# SlideTheory MVP - User Flow

## Design Goal
**Enable strategy consultants to generate a professional slide in under 60 seconds.**

---

## Primary User Flow: Generate a Slide

### Step 1: Landing (0 seconds)
**Entry Point:** User opens SlideTheory MVP

**System State:**
- Form is empty, all fields at default
- Preview panel shows empty state
- Generate button disabled (form incomplete)

**Screen:**
```
┌──────────────────────────────────────────────────────────────┐
│  [Logo] SlideTheory                            [?] [⚙]        │
├────────────────────────────┬─────────────────────────────────┤
│                            │                                 │
│  Create Your Slide         │     ┌─────────────────────┐     │
│                            │     │                     │     │
│  1. Slide Type *           │     │    📄               │     │
│  ┌────────────────────┐    │     │                     │     │
│  │ Select type...     │    │     │   Your slide will   │     │
│  └────────────────────┘    │     │   appear here       │     │
│                            │     │                     │     │
│  2. Context *              │     │                     │     │
│  ┌────────────────────┐    │     └─────────────────────┘     │
│  │                    │    │                                 │
│  │                    │    │                                 │
│  └────────────────────┘    │                                 │
│                            │                                 │
│  [Continue form...]        │                                 │
│                            │                                 │
│  ┌────────────────────┐    │                                 │
│  │  [Generate]        │    │                                 │
│  │     Disabled       │    │                                 │
│  └────────────────────┘    │                                 │
│                            │                                 │
└────────────────────────────┴─────────────────────────────────┘
```

---

### Step 2: Select Slide Type (5-10 seconds)
**User Action:** Click "Slide Type" dropdown

**Interaction:**
1. Dropdown opens with slide type options
2. Each option shows icon + label + brief description on hover
3. User selects type

**Options:**
| Option | Icon | Description |
|--------|------|-------------|
| Title Slide | 🎯 | Opening slide with title and subtitle |
| Executive Summary | 📋 | Key findings and recommendations |
| Market Analysis | 📊 | Market size, trends, and competitive landscape |
| Growth Strategy | 🚀 | Strategic initiatives and roadmap |
| Financial Projection | 💰 | Revenue, costs, and financial metrics |
| Org Chart | 👥 | Team structure and reporting lines |
| Timeline | 📅 | Project milestones and deadlines |
| Comparison | ⚖️ | Side-by-side feature or option comparison |
| SWOT Analysis | ✓ | Strengths, Weaknesses, Opportunities, Threats |
| Custom | ✎ | Define your own slide structure |

**Validation:**
- Field marked complete (green check)
- If first field filled, focus auto-moves to Context

---

### Step 3: Enter Context (15-25 seconds)
**User Action:** Type context in textarea

**Interaction:**
1. Textarea auto-focuses
2. User types context (or pastes from clipboard)
3. Character counter updates (0/500)
4. Field expands as user types (max 6 rows)

**Placeholder:**
> "Describe the purpose of this slide, key message, and any background information your audience needs to know..."

**Example Contexts:**
- "Q3 earnings presentation for board. Need to show 23% revenue growth and expanded margins."
- "All-hands meeting slide introducing new product line launching next quarter."
- "Client proposal for digital transformation project, emphasizing ROI and timeline."

**Smart Features:**
- Auto-detects pasted bullet points and formats them
- Shows "Tip: Be specific about what action you want the audience to take"

**Validation:**
- Minimum 10 characters
- Maximum 500 characters
- Real-time validation (not just on submit)

---

### Step 4: Add Data Points (Optional, 10-20 seconds)
**User Action:** Enter or paste supporting data

**Interaction:**
1. Optional field - user can skip
2. Supports:
   - Plain text bullet points
   - CSV paste (auto-converts to bullets)
   - Number-heavy content

**Placeholder:**
> "Paste relevant data, metrics, or bullet points to include on the slide..."

**Example Data:**
```
Revenue: $4.2M (+23% YoY)
Gross Margin: 68% (+4pp)
Customers: 1,240 (+156 new)
CAC: $120 (down from $145)
LTV: $2,400
```

**Smart Features:**
- Detects numbers and suggests chart type
- Auto-formats pasted Excel/Sheets data

**Validation:**
- Maximum 1000 characters
- Warns if data looks incomplete

---

### Step 5: Select Audience (5 seconds)
**User Action:** Choose target audience from dropdown

**Options:**
| Audience | Tone Impact |
|----------|-------------|
| C-Suite | Executive summary, strategic focus |
| Board Members | Governance, risk, compliance angle |
| Investors | Growth, metrics, ROI emphasis |
| Internal Team | Detailed, actionable, collaborative |
| Clients | Professional, benefit-focused |
| Analysts | Data-rich, technical depth |
| General | Accessible, broad appeal |

**Effect on Output:**
- Adjusts terminology ("synergies" vs "work together")
- Changes detail level
- Modifies call-to-action tone

---

### Step 6: Select Framework (Optional, 5-10 seconds)
**User Action:** Choose strategic framework (or leave as "None")

**Options:**
| Framework | Best For |
|-----------|----------|
| None | Free-form slide |
| McKinsey 7S | Organizational change, alignment |
| BCG Matrix | Portfolio analysis, resource allocation |
| Porter's 5 Forces | Industry/competitive analysis |
| SWOT | Strategic planning, decision-making |
| MECE | Problem structuring, issue trees |
| Pyramid Principle | Structured communication, top-down |
| AARRR | Growth metrics, funnel analysis |
| Custom | User-defined structure |

**Framework Preview:**
- Hover shows mini diagram of framework structure
- Helps user choose appropriate framework

---

### Step 7: Generate Slide (5 seconds processing)
**User Action:** Click "Generate Slide" button

**System Response:**

#### Loading Sequence:
```
┌──────────────────────────────────────────────────────────────┐
│                            │                                 │
│  [Form - disabled state]   │     ┌─────────────────────┐     │
│                            │     │                     │     │
│  ◐ Generating...           │     │    ⏳               │     │
│                            │     │                     │     │
│                            │     │  Creating your      │     │
│                            │     │  slide...           │     │
│                            │     │                     │     │
│                            │     │  Analyzing context  │     │
│                            │     │  ████████░░░░░░░░░  │     │
│                            │     │                     │     │
│                            │     └─────────────────────┘     │
│                            │                                 │
└────────────────────────────┴─────────────────────────────────┘
```

**Progress Steps (shown in sequence):**
1. "Analyzing context..." (1-2s)
2. "Structuring content..." (1s)
3. "Designing slide..." (2s)
4. "Finalizing..." (1s)

**System Actions:**
- Disable form inputs
- Show loading overlay on preview
- POST to `/api/generate` with form data
- Poll or receive WebSocket update
- Display result or error

---

### Step 8: Review Generated Slide (10-20 seconds)
**Success State:**

```
┌──────────────────────────────────────────────────────────────┐
│                            │                                 │
│  [Form - editable]         │     ┌─────────────────────┐     │
│                            │     │  ┌───────────────┐  │     │
│  ✓ Slide Type: Title       │     │  │   [SLIDE]     │  │     │
│                            │     │  │   IMAGE       │  │     │
│  ✓ Context provided        │     │  │   RENDERED    │  │     │
│                            │     │  │   HERE        │  │     │
│  [Other fields...]         │     │  └───────────────┘  │     │
│                            │     │                     │     │
│  ┌────────────────────┐    │     └─────────────────────┘     │
│  │  [Generate]        │    │                                 │
│  │  Update slide      │    │    [↻ Regenerate]  [⬇ Download]│
│  └────────────────────┘    │         PNG ▼                   │
│                            │                                 │
└────────────────────────────┴─────────────────────────────────┘
```

**Available Actions:**
1. **Regenerate** - Same inputs, new design variation
2. **Modify inputs** - Edit any field, then regenerate
3. **Download** - Save in chosen format (PNG/PDF/PPTX)
4. **Start over** - Clear form and begin new slide

---

### Step 9: Download Slide (5 seconds)
**User Action:** Select format and click Download

**Format Options:**
- **PNG** - Image for email/presentations (default)
- **PDF** - Print-ready, high quality
- **PPTX** - Editable PowerPoint file

**Download Flow:**
1. User clicks Download button
2. File generates (if not cached)
3. Browser initiates download
4. Brief toast: "Download started"
5. File saved to downloads folder

---

## Alternative Flows

### Flow A: Error During Generation

**Trigger:** API error, validation failure, or generation timeout

**System Response:**
```
┌──────────────────────────────────────────────────────────────┐
│                            │                                 │
│  ⚠ Unable to generate      │     ┌─────────────────────┐     │
│                            │     │                     │
│  We encountered an issue   │     │    ⚠️               │
│  creating your slide.      │     │                     │
│                            │     │  Something went     │
│  [Try Again] [Copy Error]  │     │  wrong              │
│                            │     │                     │
│                            │     └─────────────────────┘     │
└────────────────────────────┴─────────────────────────────────┘
```

**Error Types:**
| Error | Message | Action |
|-------|---------|--------|
| Network | "Connection lost. Please check your internet." | Retry |
| Validation | "[Field] is required" | Fix field |
| Generation | "Unable to generate. Try simplifying your context." | Edit + retry |
| Timeout | "Generation is taking longer than expected." | Retry or contact support |

---

### Flow B: Quick Regenerate

**Trigger:** User happy with content, wants different design

**Flow:**
1. User clicks "Regenerate" (no form edits)
2. System creates new visual variation
3. Same content, different layout/colors/typography
4. Previous versions accessible via history (MVP v2)

---

### Flow C: Edit and Regenerate

**Trigger:** User wants to modify inputs

**Flow:**
1. User edits any form field
2. Generate button becomes active
3. Button text changes to "Update Slide"
4. Click generates new version with changes

---

### Flow D: Mobile Flow

**Differences from desktop:**
1. Form and preview are stacked (not side-by-side)
2. Preview is collapsed by default
3. After generate, preview auto-expands
4. Download button floats/sticky at bottom
5. Swipe gestures for regenerate (optional)

---

## Edge Cases

### E1: Very Long Context
- **Behavior:** Hard limit at 500 characters
- **UI:** Character counter turns red at 450+, blocks at 500

### E2: Paste Large Data
- **Behavior:** Truncate with warning
- **UI:** "Data truncated to 1000 characters. Consider attaching a file (coming soon)."

### E3: Rapid Regenerate
- **Behavior:** Debounce clicks, queue requests
- **UI:** Button shows "Generating..." until complete

### E4: Browser Refresh Mid-Generation
- **Behavior:** On return, check for completed generation
- **UI:** "Your slide is ready!" toast if complete

### E5: Unsupported Browser
- **Behavior:** Detect and show warning
- **UI:** Banner: "For best experience, use Chrome, Safari, or Edge"

---

## Time Budget Analysis

| Step | Target Time | Range | Notes |
|------|-------------|-------|-------|
| Select Slide Type | 5s | 3-10s | Dropdown, quick decision |
| Enter Context | 20s | 15-30s | Most time spent here |
| Add Data Points | 15s | 0-30s | Optional, but valuable |
| Select Audience | 5s | 3-10s | Dropdown |
| Select Framework | 5s | 0-10s | Optional |
| Generation | 5s | 3-8s | System processing |
| Review/Download | 10s | 5-20s | Quick review |
| **Total** | **~65s** | **45-90s** | Target: <60s for simple slides |

**Optimization Opportunities:**
- Save user preferences (default audience, common frameworks)
- Template suggestions based on context
- Faster generation with caching

---

## Success Metrics

**Primary:**
- Time to first slide generation < 60 seconds
- Generation completion rate > 80%
- Download rate > 70%

**Secondary:**
- Regenerate rate (indicates iteration)
- Field completion rates
- Error rates by type
