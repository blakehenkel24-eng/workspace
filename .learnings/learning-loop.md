# Learning Loop - SAKI Operating Procedures

> **Version:** 1.0  
> **Last Updated:** 2026-02-04  
> **Purpose:** Define when and how to log, analyze, and improve from experience

---

## Overview

This document defines the operating procedures for SAKI's continuous self-improvement system. It establishes when to log episodes, how to extract patterns, and when to update behavior based on learnings.

## The Learning Cycle

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   EXPERIENCE │───→│    LOG      │───→│   ANALYZE   │───→│   ADAPT     │
│  (Do things) │    │ (Record it) │    │(Find patterns)│   │(Change behavior)│
└─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
       ↑─────────────────────────────────────────────────────────┘
```

---

## 1. When to Log Episodes

### ALWAYS Log (Mandatory)

Log an episode when:

| Trigger | Why |
|---------|-----|
| Task completion (success/failure/partial) | Core metric for improvement |
| User expresses dissatisfaction | Critical learning moment |
| Tool errors or failures | Technical debt tracking |
| Multi-step task (>3 actions) | Pattern extraction opportunity |
| Novel or unusual request | Expand experience base |
| Recovery from error | Resilience analysis |
| Strategic decisions made | Decision quality tracking |

### Log Structure

```javascript
{
  "type": "coding|content|strategy|error|comm|research|automation|meta",
  "task": "Brief description",
  "context": {
    "userRequest": "What the user asked",
    "constraints": ["Time limits", "Tech constraints"]
  },
  "actions": [
    { "tool": "read", "description": "What was done", "success": true }
  ],
  "decisions": [
    { "point": "What was decided", "confidence": "high|medium|low" }
  ],
  "outcome": {
    "status": "success|partial|failure",
    "userSatisfied": true|false|null
  },
  "lessons": {
    "whatWorked": [],
    "whatFailed": [],
    "whatToImprove": []
  }
}
```

### Quick Log Helper

```javascript
const { quickLog } = require('./episode-logger');

// Minimal log
await quickLog('coding', 'Fixed API bug', {
  outcome: { status: 'success' }
});
```

---

## 2. How to Extract Patterns

### Daily Pattern Extraction (Automated)

Run at end of day:

```bash
node episode-logger.js stats 2026-02-04 2026-02-04
node failure-analyzer.js analyze 2026-02-04 2026-02-04
```

### Weekly Review (Manual)

Every 7 days:

1. **Read** the week's episode archive
2. **Identify** recurring themes:
   - Same error type appearing multiple times
   - Similar misunderstandings
   - Repeated successful patterns
3. **Document** in `weekly-patterns.md`:
   - Patterns found
   - Actions taken
   - Behaviors updated

### Monthly Analysis

Every 30 days:

1. **Run** full analysis:
   ```bash
   node failure-analyzer.js analyze 2026-01-01 2026-01-31 > monthly-analysis.json
   ```
2. **Review** top root causes
3. **Update** this document with new avoidance patterns
4. **Adjust** AGENTS.md if systemic issues found

---

## 3. When to Update Behavior

### Immediate Updates (Same Session)

Update behavior NOW when:

- User explicitly corrects you
- Realize an assumption was wrong
- Discover a better approach mid-task
- Tool behaves unexpectedly

**How:** Log the lesson immediately and apply to current task.

### Short-term Updates (Next Session)

Update behavior for next session when:

- Pattern identified in daily review
- New tool or capability learned
- User preference discovered
- Efficiency improvement found

**How:** Update AGENTS.md or relevant SKILL.md files.

### Long-term Updates (Monthly)

Update fundamental behavior when:

- Monthly analysis reveals systemic issue
- User feedback shows consistent pattern
- New best practices emerge
- Tooling changes significantly

**How:** 
1. Update SOUL.md if identity-level change
2. Update AGENTS.md for procedure changes
3. Create new SKILL.md files for new capabilities

---

## 4. Episode Archive Structure

```
.learnings/
├── episode-logger.js      # Logging module
├── failure-analyzer.js    # Analysis module
├── learning-loop.md       # This file
├── episode-archive/
│   ├── 2026-02-04.jsonl   # Today's episodes
│   ├── 2026-02-03.jsonl   # Yesterday's episodes
│   └── YYYY-MM-DD.jsonl   # One file per day
├── weekly-patterns.md     # Weekly insights
├── monthly-analysis/      # Monthly reports
│   ├── 2026-01.json
│   └── 2026-02.json
└── behavior-updates.md    # Log of behavior changes
```

---

## 5. Search & Retrieval

### Find Episodes by Type

```bash
node episode-logger.js search '{"type":"error"}'
```

### Find Recent Failures

```bash
node failure-analyzer.js analyze 2026-02-01 2026-02-04
```

### Search in Code

```javascript
const { searchEpisodes } = require('./episode-logger');

// Find all coding errors
const failures = await searchEpisodes({
  type: 'coding',
  outcome: 'failure'
});

// Find tasks with specific content
const relevant = await searchEpisodes({
  taskContains: 'API'
});
```

---

## 6. Confidence Calibration

### Track Decision Confidence

For every significant decision, log:

```javascript
decisions: [{
  point: "Used web_search instead of browser",
  confidence: "medium",
  reasoning: "User just wanted quick facts, not interactive browsing",
  alternatives: ["browser.snapshot", "web_fetch"]
}]
```

### Review Calibration

Monthly, check:
- High confidence decisions that failed → Overconfidence
- Low confidence decisions that succeeded → Underconfidence
- Medium confidence with poor outcomes → Need more info

**Goal:** Calibrate confidence to match actual success rates.

---

## 7. Recovery Protocol

### When Things Go Wrong

1. **LOG** the failure immediately
2. **ANALYZE** root cause using failure-analyzer
3. **RECOVER** using appropriate strategy:
   - Clarify → Ask user
   - Research → Learn first
   - Retry → Try again with fix
   - Simplify → Reduce scope
   - Alternative → Different approach
4. **DOCUMENT** the recovery in lessons

### Recovery Strategies

| Situation | Strategy | Example |
|-----------|----------|---------|
| Unclear requirements | CLARIFY | "Did you mean X or Y?" |
| Missing knowledge | RESEARCH | Search before answering |
| Transient tool error | RETRY | Retry with exponential backoff |
| Overly complex task | SIMPLIFY | Deliver MVP first |
| Tool unavailable | ALTERNATIVE | Use different tool |
| All else fails | ESCALATE | Ask user for guidance |

---

## 8. Behavioral Updates Log

Track all behavior changes:

```markdown
## 2026-02-04

### Added
- Always check file existence before read operations
- Log episodes for all multi-step tasks

### Changed
- Increased verbosity when explaining errors
- Prefer web_search over browser for simple queries

### Removed
- No longer assume user wants minimal output
```

---

## 9. Quality Metrics

Track these metrics over time:

| Metric | Target | Review Frequency |
|--------|--------|------------------|
| Success rate | >90% | Weekly |
| Avg. episode duration | <5 min | Weekly |
| User satisfaction | >4.5/5 | Monthly |
| Repeated error rate | <5% | Monthly |
| Recovery success rate | >80% | Monthly |

---

## 10. Continuous Improvement Checklist

### Daily
- [ ] Log all significant episodes
- [ ] Note any immediate lessons learned
- [ ] Update AGENTS.md if quick win identified

### Weekly
- [ ] Run stats analysis
- [ ] Review failure patterns
- [ ] Update weekly-patterns.md

### Monthly
- [ ] Full failure analysis
- [ ] Review and update this document
- [ ] Archive old episodes (compress)
- [ ] Celebrate improvements!

---

## Quick Reference

```bash
# Log stats
node episode-logger.js stats

# Analyze failures
node failure-analyzer.js analyze

# Generate prevention guide
node failure-analyzer.js guide

# Search episodes
node episode-logger.js search '{"type":"coding","outcome":"success"}'
```

---

**Remember:** The goal is not perfection, but continuous improvement. Every episode, success or failure, is data for growth.
