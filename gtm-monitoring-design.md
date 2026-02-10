# GTM Cron Monitoring System — Design Document

> Status dashboard + output browser for Blake's autonomous GTM engine  
> Philosophy: **Silent success, noisy failure**

---

## 1. Cron Job Status Visualization

### Dashboard View: "GTM Control Center"

**Layout: Single-Screen Status Board**

```
┌─────────────────────────────────────────────────────────────────┐
│  🚀 GTM Control Center                              CST 06:45   │
│  SlideTheory Autonomous Engine                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TODAY'S RUNS                                              [🔴] │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │ ☀️ Market   │ │ ✍️ Content  │ │ 🎯 Prospect │ │ 📊 Analytics││
│  │    Intel    │ │             │ │  Research   │ │             ││
│  │             │ │             │ │             │ │             ││
│  │   ✅ Done   │ │  ⏳ 10:00   │ │  ⏳ 14:00   │ │  ⏳ 18:00   ││
│  │  08:02 CST  │ │             │ │             │ │             ││
│  │  4 outputs  │ │             │ │             │ │             ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
│  ┌─────────────┐ ┌─────────────┐                                  │
│  │ 🏥 Health   │ │ 📅 Weekly   │                                  │
│  │   Check     │ │   Strategy  │                                  │
│  │             │ │             │                                  │
│  │  ⏳ 21:00   │ │  ⏳ Fri 09:00│                                  │
│  │             │ │             │                                  │
│  └─────────────┘ └─────────────┘                                  │
│                                                                 │
│  RECENT OUTPUTS                                          [View] │
│  📄 /gtm/2026-02-09/market-intel/linkedin-trends.md    2h ago   │
│  📄 /gtm/2026-02-09/market-intel/competitor-watch.md   2h ago   │
│                                                                 │
│  [Run Now] [View Logs] [Pause Schedule] [Settings]              │
└─────────────────────────────────────────────────────────────────┘
```

### Card States

| State | Icon | Color | Meaning |
|-------|------|-------|---------|
| Completed | ✅ | Green | Ran successfully, outputs ready |
| Running | 🔄 | Blue | Currently executing |
| Scheduled | ⏳ | Gray | Waiting for trigger time |
| Failed | ❌ | Red | Error occurred, needs attention |
| Skipped | ⏭️ | Yellow | Missed window or dependency failed |
| Paused | ⏸️ | Orange | Manually disabled |

### Key Design Decisions

1. **Traffic Light at a Glance**: Card border color = status. No reading required.
2. **Progressive Disclosure**: Click card → see logs, outputs, runtime details.
3. **Contextual Actions**: Hover reveals [Run Now] [View Logs] [Edit].
4. **Time-Aware**: Shows "next run in X hours" or "ran X minutes ago".

---

## 2. GTM Output Browser/Organization System

### Directory Structure

```
/gtm/
├── 2026-02-09/
│   ├── market-intel/
│   │   ├── linkedin-trends.md
│   │   ├── competitor-watch.md
│   │   └── industry-news.md
│   ├── content/
│   │   ├── blog-draft.md
│   │   ├── social-posts.json
│   │   └── email-newsletter.md
│   ├── prospect-research/
│   │   ├── leads-qualified.json
│   │   └── outreach-prep.md
│   ├── analytics/
│   │   ├── metrics-report.md
│   │   └── funnel-analysis.json
│   └── health-check/
│       └── system-status.md
├── 2026-02-08/
│   └── ...
└── weekly/
    └── 2026-W06/
        └── strategy-review.md
```

### Browser Interface: "GTM Archive"

**Layout: File Explorer + Preview**

```
┌─────────────────────────────────────────────────────────────────┐
│  📁 GTM Archive                                       [Search]  │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                  │
│  📅 DATES    │  📄 /gtm/2026-02-09/market-intel/               │
│  ──────────  │     linkedin-trends.md                          │
│  ▼ 2026-02-09│                                                  │
│    ├─ ☀️ mar │  Generated: 08:02 CST by market-intel job       │
│    ├─ ✍️ con │  Size: 2.4 KB                                    │
│    ├─ 🎯 pro │                                                  │
│    ├─ 📊 ana │  ─────────────────────────────────────────────  │
│    └─ 🏥 hel │  # LinkedIn Strategy Trends - Feb 9, 2026       │
│  2026-02-08  │                                                  │
│  2026-02-07  │  ## Key Insights                                 │
│  2026-02-06  │  - AI presentation tools trending +15%          │
│  📅 Weekly   │  - Consultant content fatigue signal            │
│    └─ 📅 W06 │  - Video carousels performing 2x better         │
│              │                                                  │
│              │  ## Recommended Actions                          │
│              │  - [ ] Create carousel template for case study  │
│              │  - [ ] Draft LinkedIn post on AI in consulting  │
│              │                                                  │
│              │  [Open] [Download] [Copy] [Delete]              │
│              │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

### Smart Features

1. **Auto-Tagging**: Each job type has emoji/icon for visual scanning.
2. **Preview Pane**: Syntax-highlighted markdown, collapsible JSON.
3. **Search**: Full-text across all outputs (content search, not just filename).
4. **Compare Mode**: Diff between days to see trend evolution.
5. **Bookmark**: Pin important outputs (e.g., "use this strategy").

### Output Lifecycle

```
Generated → Ready for Review → Actioned → Archived → Purged (30d)
     │              │              │           │
     └──────────────┴──────────────┘           │
              (5 days default retention)       │
                                               │
                    (Manual archive or auto)   │
```

---

## 3. Alert/Notification Patterns

### Philosophy: Silent Success, Noisy Failure

| Scenario | Alert Level | Channel | When |
|----------|-------------|---------|------|
| Job completes successfully | 🟢 None | — | — |
| Job produces outputs | 🟢 None | — | — |
| Job running (start) | 🔵 Debug | Logs only | For audit trail |
| Job completes with warnings | 🟡 Digest | Daily summary @ 22:00 CST | Non-critical issues |
| Job fails | 🔴 Immediate | Telegram + Dashboard red | Any failure |
| 2+ jobs fail in 4h | 🔴🔴 Urgent | Telegram + Email | Pattern detected |
| Health check fails | 🔴 Immediate | Telegram + Dashboard | System issue |
| Weekly strategy ready | 🟢 Notify | Telegram @ 09:00 Fri | Ready for review |
| Storage > 80% | 🟡 Digest | Daily summary | Capacity warning |
| Storage > 90% | 🔴 Immediate | Telegram + Email | Action required |

### Notification Templates

**🔴 Job Failure (Immediate)**
```
❌ GTM Job Failed: content-generation

Job: Content Generation (10:00 CST)
Time: 10:03 CST
Error: Kimi API timeout after 60s
Duration: 3m 42s

Last successful: 2026-02-08 10:02 CST
Run count today: 1 failed

[View Logs] [Run Now] [Dismiss]
```

**🟡 Daily Digest (If warnings exist)**
```
📊 GTM Daily Summary — Feb 9, 2026

✅ Completed: 1/5 (so far)
⚠️ Warnings: 1

Jobs:
  ☀️ Market Intel      ✅ Done     08:02
  ✍️ Content Gen       ⏳ Pending  10:00
  🎯 Prospect Res.     ⏳ Pending  14:00
  📊 Analytics         ⏳ Pending  18:00
  🏥 Health Check      ⏳ Pending  21:00

Warnings:
  • Market Intel: Used fallback data source (Primary API limit)

[View Dashboard]
```

**🟢 Weekly Strategy Ready**
```
📅 Weekly Strategy Review Ready

Generated: Fri 09:03 CST
Outputs: 1 document, 3 insights, 2 action items

Key takeaway: Competitor X launched similar feature;
recommend differentiation focus on consulting-specific templates.

[Read Full Report] [Mark as Read]
```

### Alert Suppression Rules

1. **Quiet Hours**: No non-urgent alerts 23:00 - 07:00 CST
2. **Backoff**: Same job failing repeatedly → alert every 3rd failure
3. **Dependency Chain**: If job A fails, suppress "job B skipped" alerts
4. **Focus Mode**: Manual toggle to pause all non-critical alerts

---

## 4. Historical Data Access Patterns

### Time-Based Queries

```
/gtm/today              → Current date outputs
/gtm/yesterday          → Previous date outputs
/gtm/last-7-days        → Rolling week summary
/gtm/2026-02-09         → Specific date
/gtm/week/2026-W06      → Weekly strategy folder
/gtm/compare?d1=02-09&d2=02-08  → Diff view
```

### Quick Access Shortcuts

**Command Palette Style:**
```
Cmd+K → Type:
  "intel"      → Latest market intel
  "content"    → Latest content outputs
  "prospect"   → Latest prospect research
  "analytics"  → Latest analytics
  "health"     → Latest health check
  "weekly"     → Latest strategy review
  "trends"     → Market intel → trends files
  "failed"     → Recent failures
  "yesterday"  → Yesterday's outputs
```

### Trend Views

**Analytics Dashboard:**
```
┌─────────────────────────────────────────────────────────────────┐
│  📈 GTM Trends — Last 30 Days                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Job Success Rate    ████████████████████░░░░░  94% (45/48)    │
│  Avg Runtime         ██████████████░░░░░░░░░░░  4m 12s         │
│  Outputs Generated   █████████████████████░░░░  127 files      │
│  Storage Used        ██████░░░░░░░░░░░░░░░░░░░  12MB / 100MB   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Failures by Job:                                               │
│  content-gen    ████░░░░░░░░░░  2 (API timeouts)               │
│  prospect-res   ██░░░░░░░░░░░░  1 (rate limit)                 │
│  health-check   ░░░░░░░░░░░░░░  0                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Export Options

1. **Single Output**: Markdown, JSON, PDF
2. **Day Bundle**: Zip of all outputs for a date
3. **Job History**: All outputs from specific job type (e.g., all market intel)
4. **Full Archive**: Entire GTM directory (compressed)

---

## 5. Manual Intervention Points

### Dashboard Actions

| Action | Trigger | Effect | Confirmation |
|--------|---------|--------|--------------|
| **Run Now** | Card hover / detail view | Execute job immediately | No (idempotent) |
| **Pause Job** | Settings menu | Skip all future runs until resumed | Yes (explains impact) |
| **Pause All** | Emergency button | Halt entire GTM engine | Yes + 5s delay |
| **Retry** | Failed job card | Re-run failed job | No |
| **Skip Next** | Job settings | Skip next scheduled run only | No |
| **Edit Schedule** | Settings | Modify cron expression | Yes |
| **Force Output** | Debug menu | Regenerate specific output | No |
| **Purge Old** | Storage settings | Delete outputs > N days | Yes |

### Run Now Modal

```
┌─────────────────────────────────────────────────┐
│  ▶️ Run Market Intel Job Now?                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  This will execute the job immediately.         │
│  Last run: 08:02 CST (completed)                │
│                                                 │
│  Options:                                       │
│  [ ] Force refresh (ignore cache)               │
│  [ ] Dry run (generate without saving)          │
│                                                 │
│         [Cancel]        [Run Now]               │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Pause Confirmation

```
⏸️ Pause Content Generation?

This job generates daily content for social/email.

Impact:
  • No content will be generated until resumed
  • Social media queue may run empty
  • Newsletter may be delayed

[Cancel] [Pause Until... ▼] [Pause Indefinitely]
```

### Emergency Controls

**Panic Button (always visible):**
```
┌─────────────────────────────────────────────────┐
│  🛑 Emergency Stop                              │
│                                                 │
│  All GTM jobs have been paused.                 │
│                                                 │
│  Active runs: 1 (Market Intel - 50% complete)  │
│                                                 │
│  [Resume Market Intel] [Resume All Jobs]        │
└─────────────────────────────────────────────────┘
```

### CLI Access

```bash
# View status
$ gtm status
☀️ market-intel      ✅ completed  08:02 CST  4 outputs
✍️ content           ⏳ scheduled  10:00 CST

# Run job
$ gtm run market-intel --force
Running market-intel...
Done. 3 outputs generated.

# View logs
$ gtm logs content --tail 50

# Pause/resume
$ gtm pause content
$ gtm resume content
$ gtm pause --all

# Browse outputs
$ gtm ls today
$ gtm cat market-intel/linkedin-trends.md
$ gtm diff 2026-02-09 2026-02-08 --job market-intel
```

---

## Implementation Notes

### Tech Stack Recommendation

| Component | Tool | Rationale |
|-----------|------|-----------|
| Dashboard | Next.js + shadcn/ui | Blake's existing stack |
| Job Runner | node-cron or systemd | Simple, reliable |
| State Storage | SQLite or JSON file | Lightweight, no external dep |
| Logs | Rotating file + UI view | Simple, inspectable |
| Notifications | Telegram Bot API | Already using |
| File Storage | Local filesystem | Outputs are text/markdown |

### Files to Create

```
/workspace/gtm/
├── dashboard/              # Next.js app
│   ├── app/
│   │   ├── page.tsx        # Main dashboard
│   │   ├── archive/        # Output browser
│   │   └── settings/       # Job configuration
│   ├── components/
│   │   ├── JobCard.tsx
│   │   ├── OutputPreview.tsx
│   │   └── AlertBanner.tsx
│   └── lib/
│       ├── jobs.ts         # Job definitions
│       └── storage.ts      # File operations
├── jobs/                   # Job scripts
│   ├── market-intel.ts
│   ├── content.ts
│   ├── prospect-research.ts
│   ├── analytics.ts
│   └── health-check.ts
├── outputs/                # Generated content
│   └── YYYY-MM-DD/
├── logs/                   # Execution logs
│   └── YYYY-MM-DD/
└── state.json              # Current job state
```

### Cron Schedule (CST)

```javascript
const jobs = [
  { name: 'market-intel',     cron: '0 8 * * *',   tz: 'America/Chicago' },
  { name: 'content',          cron: '0 10 * * *',  tz: 'America/Chicago' },
  { name: 'prospect-research',cron: '0 14 * * *',  tz: 'America/Chicago' },
  { name: 'analytics',        cron: '0 18 * * *',  tz: 'America/Chicago' },
  { name: 'health-check',     cron: '0 21 * * *',  tz: 'America/Chicago' },
  { name: 'weekly-strategy',  cron: '0 9 * * 5',   tz: 'America/Chicago' }, // Friday 9am
];
```

---

## Success Metrics

This system succeeds when:

1. ✅ Blake checks dashboard in < 10 seconds to know system status
2. ✅ Failed jobs alert within 5 minutes
3. ✅ Zero alert fatigue (only actionable notifications)
4. ✅ Historical outputs findable in < 30 seconds
5. ✅ Manual intervention possible in < 3 clicks
6. ✅ Cognitive load decreases over time (system fades into background)

---

*Document Version: 1.0*  
*Created: 2026-02-09*  
*For: Blake's GTM Automation Engine*
