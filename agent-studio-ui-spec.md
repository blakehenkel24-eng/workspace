# Agent Studio — UI/UX Specification

> High-signal interface for Blake's autonomous operations

---

## 1. Information Architecture

### Navigation Structure (Left Rail, Collapsible)

```
┌─────────────────────────────────────────────────────────┐
│ ⚡ Studio                                    [≡]        │
├─────────────────────────────────────────────────────────┤
│  📊  Overview        ← Default landing                  │
│  🎯  GTM Outputs     ← Daily 5-min review              │
│  🐝  Swarm Control   ← Launch/research                  │
│  ⏰  Cron Monitor    ← Autonomous systems               │
│  📓  Logs            ← Searchable history               │
├─────────────────────────────────────────────────────────┤
│  ⚙️  Settings                                           │
└─────────────────────────────────────────────────────────┘
```

**Principles:**
- Exactly 5 primary sections (cognitive limit)
- Order = frequency of use (Overview → GTM → Swarm → Cron → Logs)
- Icons are functional, not decorative
- Collapsible to maximize content space

---

## 2. Key Screen Concepts

### Screen 1: Overview (Dashboard)

**Purpose:** 10-second status check. No scrolling required.

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│ OVERVIEW                                          [New ↓]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 3        │  │ 12       │  │ 0        │  │ 2.4k     │   │
│  │ Active   │  │ GTM      │  │ Errors   │  │ Tokens   │   │
│  │ Agents   │  │ Pending  │  │ (24h)    │  │ Today    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                            │
│  ─── Need Attention ─────────────────────────────────     │
│  ┌──────────────────────────────────────────────────┐     │
│  │ 🔴 Cron: GTM Digest stuck (3h overdue)          │     │
│  │ 🟡 Swarm: Market research 67% complete          │     │
│  └──────────────────────────────────────────────────┘     │
│                                                            │
│  ─── Recent Activity ─────────────────────────────────    │
│  09:14  Swarm completed  →  PE market analysis             │
│  08:30  GTM output ready  →  LinkedIn leads (23)           │
│  07:00  Cron ran  →  Daily competitor scan                 │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Design Notes:**
- Single viewport, no scroll
- Colors = severity only (red/yellow/green), no decorative palette
- "New" dropdown for quick actions (spawn swarm, run cron now, etc.)
- Timestamps relative ("3h ago" not "2026-02-09 05:18 UTC")

---

### Screen 2: GTM Output Browser

**Purpose:** Blake's daily 5-minute review. Scan → decide → move on.

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│ GTM OUTPUTS                              [Filter ▼] [🔍]   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ← Feb 9                          [Today]           Feb →  │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │ 📧 Email Campaign Results                          │   │
│  │ Generated 09:14  •  23 leads  •  4.2% CTR         │   │
│  │                                                    │   │
│  │ "Subject line A outperformed by 23%..."            │   │
│  │                                                    │   │
│  │ [View Full]  [Export CSV]  [Dismiss]               │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │ 🔍 Competitor Intel — Deloitte                     │   │
│  │ Generated 08:30  •  3 new signals                  │   │
│  │                                                    │   │
│  │ • New pricing page (upmarket shift)               │   │
│  │ • Hiring 4 senior designers (product push)        │   │
│  │ • Blog: "AI slides are the future" (parrot us)    │   │
│  │                                                    │   │
│  │ [View Full]  [Add to Swarm]  [Dismiss]             │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│                    [Load 10 More]                          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Interactions:**
- **Dismiss:** Removes from view, archived (not deleted)
- **Add to Swarm:** Pre-populates swarm launcher with this context
- **Keyboard shortcuts:** J/K to navigate, Space to expand, D to dismiss
- **Default view:** Today only, sorted by relevance score (not time)

**Empty State:**
> "No outputs pending. GTM agents are running."
> [View Yesterday] [Check Cron Status]

---

### Screen 3: Swarm Control

**Purpose:** Launch agent swarms for research. Fast input → clear status.

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│ SWARM CONTROL                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ─── Launch New ────────────────────────────────────────  │
│                                                            │
│  Objective                                                │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Research PE firms using AI for due diligence       │   │
│  │                                                    │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  Depth:  [Quick ●────○────○ Deep]                         │
│  Agents: [3]  (Recommended for this query)                │
│                                                            │
│  [Launch Swarm]                                           │
│                                                            │
│  ─── Active ────────────────────────────────────────────  │
│                                                            │
│  🐝  PE AI Research        ████████░░  67%  ~4m left      │
│      3 agents  •  14 sources found  •  [View Live]        │
│                                                            │
│  ─── Recent ────────────────────────────────────────────  │
│                                                            │
│  ✅  Competitor pricing    Complete  →  12 insights       │
│  ✅  LinkedIn outreach     Complete  →  45 prospects      │
│  ❌  Market sizing         Failed    →  Retry / Debug     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Interactions:**
- **Objective field:** Expands to textarea on focus (for complex queries)
- **Depth slider:** Quick (5min) / Standard (15min) / Deep (45min)
- **View Live:** Real-time stream of what agents are finding
- **Failed swarms:** One-click retry with same params

**Smart Defaults:**
- Auto-suggest swarm templates based on recent GTM outputs
- "Looks like you got competitor intel. Research their pricing? [Yes] [No]"

---

### Screen 4: Cron Monitor

**Purpose:** Eyes on autonomous systems. Health check at a glance.

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│ CRON MONITOR                                             │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ 24/24   │ │  7 days │ │   0     │ │  1.2s   │          │
│  │ Healthy │ │ Streak  │ │ Failed  │ │ Avg Run │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                                                            │
│  ─── Scheduled Jobs ────────────────────────────────────  │
│                                                            │
│  ● Daily GTM Digest          07:00  →  Next: 6h 12m      │
│    Last: Today 07:02 (2m late)  •  [Run Now] [Edit]       │
│                                                            │
│  ● Competitor Scan           07:00  →  Next: 6h 12m      │
│    Last: Today 07:14 (14m late) ⚠️  •  [Run Now] [Edit]   │
│                                                            │
│  ● Weekly Report             Mon 09:00                   │
│    Last: Feb 3  •  Next: Tomorrow                         │
│                                                            │
│  ─── Event Log (Last 24h) ──────────────────────────────  │
│                                                            │
│  07:14  ✓  Competitor scan completed (14m)                │
│  07:02  ✓  GTM digest generated (2m)                      │
│  07:00  →  Daily jobs triggered                           │
│  06:45  ⚠️  System maintenance delayed start               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Interactions:**
- **Health indicators:** Green = <5min variance, Yellow = 5-15min, Red = >15min or failed
- **Run Now:** Immediate execution with confirmation toast
- **Edit:** Inline schedule editor (no page transition)
- **Streak:** Gamified reliability metric (resets on failure)

---

## 3. Key Interactions & User Flows

### Flow A: Daily GTM Review (5-min workflow)

```
1. Open Studio → Lands on Overview
2. See "12 GTM Pending" → Click or press 'G'
3. GTM Browser loads (today's outputs, prioritized)
4. Scan cards top-to-bottom:
   - [View Full] if interesting
   - [Dismiss] if noise
   - [Add to Swarm] if needs deeper research
5. Zero inbox → Back to Overview
```

**Target:** < 30 seconds per output, keyboard navigable

---

### Flow B: Research Trigger (swarm spawn)

```
1. From GTM output: Click [Add to Swarm]
   → Context pre-populated
2. Or from nav: Click Swarm Control → Type objective
3. Adjust depth/agents if needed (defaults are smart)
4. [Launch Swarm] → Immediate feedback
5. Optional: [View Live] to watch progress
6. Notification when complete (badge + push if enabled)
```

---

### Flow C: Troubleshooting (something broke)

```
1. Overview shows red alert: "Cron: GTM Digest stuck"
2. Click alert → Auto-navigates to Cron Monitor
3. See job status + last run details
4. [Run Now] to retry, or [View Logs] for details
5. Logs open in right panel (not new page)
6. One-click [Edit] to adjust schedule/params
```

---

## 4. Design Principles (Blake-Specific)

### 1. Zero Decorative Chrome
- No gradients, shadows, or "delight" animations
- Borders are 1px, neutral, structural only
- Color = information, not branding

### 2. Density Over Breathing Room
- 16px margins (not 24px+)
- Compact lists, not card gardens
- Information visible without scroll

### 3. Every Element Justifies Its Existence
- Ask: "Does Blake need this to make a decision?"
- If no → remove
- If maybe → hide behind interaction

### 4. Speed of Recognition > Speed of First Use
- Use standard patterns (no novel UI)
- Icons are conventional (📊 📧 🐝 ⏰)
- No onboarding tours — tooltips on hover only

### 5. Action-First, Browse-Second
- Primary actions visible, secondary in menus
- No "explore" or "discover" — only do
- Empty states have clear next steps

---

## 5. Visual Hierarchy Recommendations

### Typography

```
Hierarchy          Font              Size       Weight      Usage
────────────────────────────────────────────────────────────────────────
Screen Title       System UI         20px       600         "GTM OUTPUTS"
Section Header     System UI         12px       500         "─── Need Attention ───"
                   (uppercase,       (0.75rem)              (letter-spacing: 0.05em)
                    letter-spaced)
Card Title         System UI         14px       500         "Email Campaign Results"
Body               System UI         13px       400         Descriptions, metadata
Mono               JetBrains Mono    12px       400         Timestamps, metrics
```

**Principle:** No size >20px. If it needs to be bigger, the content is wrong.

---

### Color System (Minimal)

```
Role               Value                    Usage
────────────────────────────────────────────────────────────────
Background         #0A0A0A (near black)     Main canvas
Surface            #141414                  Cards, panels
Border             #262626                  Dividers, outlines
Text Primary       #E5E5E5                  Headlines, body
Text Secondary     #737373                  Metadata, timestamps

Accent (Info)      #3B82F6                  Links, active states
Accent (Success)   #22C55E                  Completed, healthy
Accent (Warning)   #EAB308                  Slow, attention
Accent (Error)     #EF4444                  Failed, stuck
```

**No brand colors** — functional palette only.

---

### Spacing Scale

```
4px   - Tight inline (badges, tags)
8px   - Related elements
16px  - Standard padding
24px  - Section separation
32px  - Major breaks (rare)
```

---

### Component Patterns

**Cards:**
- Background: Surface color
- Border: 1px solid Border color
- No border-radius (or 2px max)
- No shadow
- Hover: Border brightens to Text Secondary

**Buttons:**
- Primary: Solid Accent (bg) + white text
- Secondary: Transparent + Border
- Danger: Red text only (no bg)
- Height: 32px (compact)

**Inputs:**
- Background: transparent
- Border-bottom only (1px)
- Focus: Accent underline (2px)
- No floating labels — placeholder only

---

## 6. Responsive Considerations

**Desktop (Primary):** Full left rail, all columns visible
**Tablet (<1024px):** Collapsed rail (icons only), 2-column grids → 1-column
**Mobile (<640px):** Bottom nav (not left rail), single column, actions in overflow menu

**Note:** Blake likely uses desktop primarily. Mobile is "check status, don't operate."

---

## 7. Open Questions

1. **Notifications:** Push, email, or in-app only? (Assume in-app badge + optional push)
2. **Multi-user:** Is this solo or will team access exist? (Assume solo for now)
3. **Integrations:** Slack, Telegram, or email alerts? (Telegram given current setup)
4. **Data retention:** How long keep logs/outputs? (Suggest 30 days auto-archive)

---

## Appendix: Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `G` | Go to GTM Outputs |
| `S` | Go to Swarm Control |
| `C` | Go to Cron Monitor |
| `O` | Go to Overview |
| `N` | New (contextual) |
| `J` / `K` | Next / Previous item |
| `Space` | Expand / Collapse |
| `D` | Dismiss |
| `?` | Show shortcuts |

---

*Spec v1.0 — February 9, 2026*
