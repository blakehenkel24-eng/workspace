# COORDINATION-INDEX.md
## SlideTheory Navigation Project - Agent Coordination

**Project:** SlideTheory Website Navigation  
**Architect:** ARCHITECT (You)  
**Last Updated:** 2026-02-05

---

## Quick Links

| Document | Purpose | Status |
|----------|---------|--------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical specification | ✅ Complete |
| [TASK-FRONTEND.md](./TASK-FRONTEND.md) | Frontend Engineer tasks | 🟡 Ready |
| [TASK-SENIOR.md](./TASK-SENIOR.md) | Senior Engineer review | ⏳ Waiting |
| [TASK-QA.md](./TASK-QA.md) | QA Engineer tests | ⏳ Waiting |
| [STATUS.md](./STATUS.md) | Live project status | 🟡 Active |

---

## Agent Workflow

```
ARCHITECT (You)
    │
    ├── Created ARCHITECTURE.md
    ├── Created TASK-FRONTEND.md
    ├── Created TASK-SENIOR.md
    └── Created TASK-QA.md
    │
    ▼
FRONTEND Engineer
    │
    ├── Reads ARCHITECTURE.md
    ├── Implements navigation on 4 pages
    ├── Updates TASK-FRONTEND.md (marks complete)
    └── Notifies SENIOR Engineer
    │
    ▼
SENIOR Engineer
    │
    ├── Reviews implementation
    ├── Checks code quality & accessibility
    ├── Updates TASK-SENIOR.md with review
    └── Notifies QA Engineer (if approved)
    │
    ▼
QA Engineer
    │
    ├── Runs test cases
    ├── Documents bugs
    ├── Updates TASK-QA.md
    └── Notifies ARCHITECT with results
    │
    ▼
ARCHITECT (You)
    │
    └── Final approval / deployment decision
```

---

## File Locations

### Pages to Modify
```
/products/slidetheory/mvp/build/public/
├── index.html          ← Add navigation
├── how-it-works.html   ← Verify/standardize
├── resources.html      ← Verify/standardize
└── blog.html          ← Complete overhaul
```

### Stylesheet
```
/products/slidetheory/mvp/build/public/styles.css
```

### Documentation
```
/products/slidetheory/docs/
├── ARCHITECTURE.md
├── COORDINATION-INDEX.md   (this file)
├── STATUS.md
├── TASK-FRONTEND.md
├── TASK-SENIOR.md
└── TASK-QA.md
```

---

## Communication Protocol

### File-Based Updates
All agents communicate via these files:
1. Update your assigned TASK-*.md file
2. Change status indicators (🟢🟡🔴⏳)
3. Add notes/questions in designated sections
4. Notify next agent when done

### Status Symbols
| Symbol | Meaning |
|--------|---------|
| ✅ | Complete |
| 🟡 | In Progress / Ready |
| 🔴 | Blocked / Issues |
| ⏳ | Waiting |
| ⬜ | Not Started |

---

## Current Status

| Agent | Task | Status |
|-------|------|--------|
| ARCHITECT | Create specifications | ✅ Complete |
| FRONTEND | Implement navigation | 🟡 Ready to start |
| SENIOR | Code review | ⏳ Waiting for Frontend |
| QA | Testing | ⏳ Waiting for Senior |

---

## Next Actions

1. **FRONTEND Engineer:** Start implementation
   - Read ARCHITECTURE.md Section 2 (CSS)
   - Read TASK-FRONTEND.md for detailed tasks
   - Modify 4 HTML files + styles.css

2. **ARCHITECT:** Monitor progress
   - Check for questions in task files
   - Provide clarifications as needed

---

## Questions?

If any agent has questions:
1. Check ARCHITECTURE.md first
2. Add question to your TASK file
3. ARCHITECT will respond
