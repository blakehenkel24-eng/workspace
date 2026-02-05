# Workspace Audit Report
**Date:** 2026-02-04  
**Auditor:** SAKI  
**Status:** ✅ Complete

---

## Executive Summary

**Issues Found:** 8 major redundancies, 3 orphaned projects  
**Risk Level:** Medium (confusion, wasted storage)  
**Recommended Action:** Consolidate duplicate structures, archive old versions

---

## 🚨 Critical Issues

### 1. Duplicate SlideTheory Structures
**Problem:** Two nearly identical folder hierarchies
```
/products/slidetheory/
/projects/slidetheory/products/slidetheory/  ← NESTED DUPLICATE
```

**Impact:** Files out of sync, confusion about which is "source of truth"

**Files duplicated:**
- `mvp/build/` (full Express app in both locations)
- `research/` (competitor analysis in both)
- `website/index-v4.html` (exists in both)

**Recommendation:** Keep `/products/slidetheory/` (cleaner), archive nested duplicate

---

### 2. Orphaned Early Projects
**Problem:** Old/experimental projects cluttering workspace

| Project | Location | Status | Action |
|---------|----------|--------|--------|
| mbb-slide-generator | `/projects/` | Early prototype | Archive |
| slide-science-ai | `/projects/` | Experimental | Archive |
| notion-export (nested) | `/projects/slidetheory/` | Duplicate of root | Delete |

---

### 3. Redundant Nested Folders
**Problem:** Excessive nesting creating confusion

```
/projects/slidetheory/slidetheory/  ← Empty/redundant
/projects/slidetheory/notion-export/  ← Duplicates root notion-export
```

---

## ⚠️ Medium Issues

### 4. Multiple index.html Files
**11 index files** across workspace — hard to know which is current:
- `projects/slidetheory/index.html` (dashboard?)
- `projects/slidetheory/index-v2.html` (old version)
- `projects/slidetheory/index-v3.html` (old version)
- `products/slidetheory/mvp/build/public/index.html` (MVP UI)
- etc.

**Recommendation:** Use versioning in filenames or archive old versions

---

### 5. Scattered Research
Research files exist in 3+ locations:
- `/research/` (root level — empty?)
- `/products/slidetheory/research/` (current)
- `/projects/slidetheory/research/` (older)

---

### 6. Duplicate Notion Exports
- `/notion-export/` (root — **keep this**)
- `/projects/slidetheory/notion-export/` (nested — **delete**)

---

## 📊 Storage Analysis

| Category | Size | Note |
|----------|------|------|
| node_modules (MVP) | ~200MB | Normal, but 2 copies exist |
| node_modules (old projects) | ~100MB | Can be archived |
| notion-export duplicates | ~5MB | Safe to delete |
| **Total waste** | **~150MB+** | Plus cognitive overhead |

---

## ✅ Recommended Cleanup Plan

### Phase 1: Consolidate (Safe)
1. **Archive** `/projects/mbb-slide-generator/` → `archive/2026-02/mbb-slide-generator/`
2. **Archive** `/projects/slide-science-ai/` → `archive/2026-02/slide-science-ai/`
3. **Delete** `/projects/slidetheory/notion-export/` (duplicates root)
4. **Delete** `/projects/slidetheory/slidetheory/` (empty/redundant)

### Phase 2: Merge Duplicates (Requires Care)
1. Compare `/products/slidetheory/mvp/` vs `/projects/slidetheory/products/slidetheory/mvp/`
2. Keep newer files, delete older duplicates
3. Consolidate all SlideTheory files to `/products/slidetheory/`

### Phase 3: Organize (Optional)
1. Rename old index files: `index-v2.html` → `archive/index-v2-2026-02-02.html`
2. Create `/archive/` folder for old versions
3. Standardize folder naming (kebab-case everywhere)

---

## 📁 Proposed Clean Structure

```
/home/node/.openclaw/workspace/
├── AGENTS.md, SOUL.md, MEMORY.md, etc.  (system files)
├── HEARTBEAT.md, USER.md                (config)
├── memory/                              (session logs)
├── skills/                              (custom skills)
├── .learnings/                          (guide summaries)
│
├── products/                            (★ ACTIVE PROJECTS)
│   └── slidetheory/
│       ├── PRODUCT-SPEC.md
│       ├── mvp/                         (current build)
│       ├── website/                     (marketing site)
│       ├── research/                    (competitor analysis)
│       └── content/                     (articles, guides)
│
├── projects/                            (other experiments)
│   └── [future projects]
│
├── notion-export/                       (single source)
├── archive/                             (old versions)
│   └── 2026-02/
│       ├── mbb-slide-generator/
│       └── slide-science-ai/
│
└── research/                            (general research)
```

---

## 🔒 Files Requiring Your Decision

| File | Current Location | Question |
|------|-----------------|----------|
| `kanban-board.html` | `/projects/slidetheory/` | Keep? Move to `/products/`? |
| `index-dashboard.html` | `/projects/slidetheory/` | Is this the GitHub Pages dashboard? |
| `backlog.html` | `/projects/slidetheory/` | Still needed? |

---

## Next Steps

**Option A: Conservative** (Recommended)
- I archive obvious old projects (mbb-slide-generator, slide-science-ai)
- You review duplicates when home, decide which to keep

**Option B: Aggressive**
- I consolidate everything now, move to clean structure
- Risk: might delete something you wanted

**Your call?** Or wait until 6 PM when you can review?
