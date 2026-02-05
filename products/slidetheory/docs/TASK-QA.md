# TASK-QA.md
## QA Engineer - Testing Assignment

**Assigned by:** ARCHITECT  
**Task:** Test navigation implementation across all pages and devices  
**Wait for:** Senior Engineer to approve code  
**Status:** ⏳ WAITING FOR CODE REVIEW

---

## Your Mission

Comprehensive testing of the navigation implementation. Verify functionality, accessibility, and user experience across all 4 pages.

---

## Test Environment

**Pages to Test:**
1. `/products/slidetheory/mvp/build/public/index.html`
2. `/products/slidetheory/mvp/build/public/how-it-works.html`
3. `/products/slidetheory/mvp/build/public/resources.html`
4. `/products/slidetheory/mvp/build/public/blog.html`

**Browsers:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest, if available)
- Edge (latest, if available)

**Devices:**
- Desktop (1920×1080, 1366×768)
- Tablet (768×1024)
- Mobile (375×667, 414×896)

---

## Test Cases

### TC-001: Navigation Presence
**Steps:**
1. Open each of the 4 pages
2. Verify navigation header is present
3. Verify all 4 links are visible (Home, How it Works, Resources, Blog)
4. Verify CTA button is present

**Expected:** Navigation identical on all pages

**Status:** ⬜ PASS / ⬜ FAIL

---

### TC-002: Active State - Desktop
**Steps:**
1. Visit index.html
2. Verify Home link has active indicator (underline)
3. Visit how-it-works.html
4. Verify "How it Works" link has active indicator
5. Repeat for resources.html and blog.html

**Expected:** Each page highlights its corresponding nav item

**Status:** ⬜ PASS / ⬜ FAIL

---

### TC-003: Active State - Mobile
**Steps:**
1. Open site at 375px width
2. Open mobile menu
3. Verify current page link is highlighted
4. Navigate to each page, repeat

**Expected:** Active page highlighted with background color

**Status:** ⬜ PASS / ⬜ FAIL

---

### TC-004: Navigation Links Functionality
**Steps:**
1. From index.html, click "How it Works"
2. Verify navigation to how-it-works.html
3. Click "Resources"
4. Verify navigation to resources.html
5. Click "Blog"
6. Verify navigation to blog.html
7. Click "Home"
8. Verify navigation to index.html

**Expected:** All links navigate to correct pages

**Status:** ⬜ PASS / ⬜ FAIL

---

### TC-005: Mobile Menu Toggle
**Steps:**
1. Open site at 375px width
2. Click hamburger menu icon
3. Verify menu opens (slides in from left)
4. Verify hamburger transforms to X
5. Click X
6. Verify menu closes
7. Verify X transforms back to hamburger

**Expected:** Smooth toggle animation, icon changes

**Status:** ⬜ PASS / ⬜ FAIL

---

### TC-006: Mobile Menu Close Behaviors
**Steps:**
1. Open mobile menu
2. Click a navigation link
3. Verify menu closes automatically
4. Reopen menu
5. Press Escape key
6. Verify menu closes
7. Reopen menu
8. Click outside menu area (backdrop)
9. Verify menu closes (if implemented)

**Expected:** Menu closes on link click, Escape key, and backdrop click

**Status:** ⬜ PASS / ⬜ FAIL

---

### TC-007: Keyboard Navigation
**Steps:**
1. Press Tab to reach skip-link
2. Verify skip-link appears
3. Press Enter on skip-link
4. Verify focus moves to main content
5. Tab through all navigation items
6. Verify logical tab order
7. On mobile menu open, verify tab stays within menu (focus trap)

**Expected:** Full keyboard accessibility

**Status:** ⬜ PASS / ⬜ FAIL

---

### TC-008: Screen Reader Compatibility
**Steps:**
1. Enable screen reader (NVDA, VoiceOver, or ChromeVox)
2. Navigate to page
3. Verify navigation landmark announced
4. Verify current page announced as "current"
5. Open mobile menu
6. Verify menu state announced
7. Navigate through links

**Expected:** All ARIA attributes read correctly

**Status:** ⬜ PASS / ⬜ FAIL / ⬜ N/A (no screen reader)

---

### TC-009: Responsive Behavior
**Steps:**
1. Test at 320px width (smallest mobile)
2. Test at 768px width (tablet breakpoint)
3. Test at 769px width (just above breakpoint)
4. Test at 1920px width (large desktop)
5. Resize browser continuously
6. Verify no layout breaks

**Expected:** Navigation adapts smoothly at all sizes

**Status:** ⬜ PASS / ⬜ FAIL

---

### TC-010: Visual Consistency
**Steps:**
1. Compare navigation on all 4 pages
2. Verify identical:
   - Colors
   - Fonts
   - Spacing
   - Logo styling
   - Button styling
   - Hover states

**Expected:** Pixel-perfect consistency

**Status:** ⬜ PASS / ⬜ FAIL

---

### TC-011: CTA Button Functionality
**Steps:**
1. Click "Get Started" button on each page
2. Verify navigation to index.html
3. Verify hover state works
4. Verify focus state visible

**Expected:** Button works and looks consistent

**Status:** ⬜ PASS / ⬜ FAIL

---

### TC-012: Logo Link
**Steps:**
1. Click SlideTheory logo on each page
2. Verify navigation to index.html

**Expected:** Logo acts as home link

**Status:** ⬜ PASS / ⬜ FAIL

---

### TC-013: Performance
**Steps:**
1. Open DevTools Network tab
2. Hard refresh page
3. Check CSS file caching
4. Verify no layout shift during load

**Expected:** Fast load, no CLS issues

**Status:** ⬜ PASS / ⬜ FAIL

---

### TC-014: Reduced Motion
**Steps:**
1. Enable "Reduce motion" in OS settings
2. Open/close mobile menu
3. Verify animations disabled or reduced

**Expected:** respects `prefers-reduced-motion`

**Status:** ⬜ PASS / ⬜ FAIL

---

## Bug Report Template

If you find issues, document them:

```
**Bug ID:** BUG-001
**Page:** blog.html
**Severity:** High/Medium/Low
**Description:** [Clear description]
**Steps to Reproduce:**
1. Step one
2. Step two
**Expected:** [What should happen]
**Actual:** [What actually happens]
**Browser/Device:** Chrome 120, Desktop
**Screenshot:** [If applicable]
```

---

## Test Results Summary

| Test ID | Status | Notes |
|---------|--------|-------|
| TC-001  | ⬜     |       |
| TC-002  | ⬜     |       |
| TC-003  | ⬜     |       |
| TC-004  | ⬜     |       |
| TC-005  | ⬜     |       |
| TC-006  | ⬜     |       |
| TC-007  | ⬜     |       |
| TC-008  | ⬜     |       |
| TC-009  | ⬜     |       |
| TC-010  | ⬜     |       |
| TC-011  | ⬜     |       |
| TC-012  | ⬜     |       |
| TC-013  | ⬜     |       |
| TC-014  | ⬜     |       |

---

## Bugs Found

### Critical (Block Release)
<!-- List critical bugs -->

### High Priority
<!-- List high priority bugs -->

### Medium Priority  
<!-- List medium priority bugs -->

### Low Priority
<!-- List minor issues -->

---

## Final Assessment

**Status:** ⏳ NOT TESTED

When complete, update to:
- 🟢 **PASSED** - All critical tests pass, ready for deployment
- 🟡 **PASSED WITH RESERVATIONS** - Minor issues, can deploy
- 🔴 **FAILED** - Critical issues must be fixed

**Recommendation:**
<!-- Final recommendation to ARCHITECT -->

---

## Sign-off

**QA Engineer:** _________________  
**Date:** _________________  
**Approved for Deployment:** ⬜ Yes / ⬜ No
