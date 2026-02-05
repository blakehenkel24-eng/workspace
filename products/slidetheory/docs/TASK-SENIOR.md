# TASK-SENIOR.md
## Senior Engineer - Code Review Assignment

**Assigned by:** ARCHITECT  
**Task:** Review navigation implementation for code quality and standards  
**Wait for:** Frontend Engineer to mark TASK-FRONTEND.md complete  
**Status:** ⏳ WAITING FOR FRONTEND

---

## Your Mission

Review the navigation implementation created by Frontend Engineer. Ensure code quality, accessibility compliance, and adherence to web standards.

---

## Review Checklist

### Code Quality

#### HTML Structure
- [ ] Semantic HTML used (`<header>`, `<nav>`, `<ul>`, `<li>`)
- [ ] No unnecessary div wrappers
- [ ] Proper heading hierarchy maintained
- [ ] IDs are unique and descriptive

#### CSS Quality
- [ ] BEM or consistent naming convention used
- [ ] No inline styles (except dynamic values)
- [ ] CSS variables used for repeated values (colors, spacing)
- [ ] No `!important` without justification
- [ ] Mobile-first or desktop-first approach consistent

#### JavaScript Quality
- [ ] IIFE or module pattern used to avoid global scope
- [ ] Event listeners properly attached
- [ ] No memory leaks (event listeners removed if needed)
- [ ] Feature detection for browser compatibility
- [ ] `'use strict';` mode enabled

### Accessibility (WCAG 2.1 AA)

- [ ] Skip-to-content link functional and visible on focus
- [ ] `aria-label` on navigation elements
- [ ] `aria-expanded` toggles correctly on mobile menu
- [ ] `aria-current="page"` on active navigation link
- [ ] `aria-controls` connects toggle to menu
- [ ] Focus indicators visible (not relying on browser default)
- [ ] Color contrast ≥ 4.5:1 for normal text
- [ ] Color contrast ≥ 3:1 for large text/UI components
- [ ] Keyboard navigation logical and complete
- [ ] No keyboard traps in mobile menu

### Performance

- [ ] CSS is in external stylesheet (not duplicated in each HTML file)
- [ ] JavaScript is efficient (no unnecessary DOM queries)
- [ ] Event delegation used where appropriate
- [ ] No layout thrashing in animations

### Responsive Design

- [ ] Breakpoint at 768px as specified
- [ ] Touch targets ≥ 44×44px on mobile
- [ ] No horizontal scroll on any screen size
- [ ] Text remains readable at all sizes

### Cross-Browser

- [ ] Works in modern Chrome, Firefox, Safari, Edge
- [ ] Graceful degradation for older browsers
- [ ] Vendor prefixes not needed (using standard properties)

---

## Security Review

- [ ] No user input reflected without sanitization
- [ ] No eval() or similar dangerous functions
- [ ] Links use proper URL validation

---

## Standards Compliance

- [ ] Valid HTML5 (test with validator.w3.org)
- [ ] Valid CSS (test with jigsaw.w3.org/css-validator)
- [ ] ES5/ES6+ used consistently

---

## Review Process

1. **Read** TASK-FRONTEND.md to understand what was implemented
2. **Examine** each of the 4 HTML files
3. **Check** the CSS in styles.css
4. **Test** JavaScript functionality
5. **Run** accessibility audit (Lighthouse or axe)
6. **Document** findings in "Review Notes" section below

---

## Review Notes

### Critical Issues (Block Merge)
<!-- List any issues that must be fixed -->

### Minor Issues (Should Fix)
<!-- List recommendations -->

### Praise (Good Work)
<!-- Highlight what was done well -->

---

## Decision

**Status:** ⏳ PENDING REVIEW

When review complete, update status:
- 🟢 **APPROVED** - Ready for QA
- 🟡 **APPROVED WITH NOTES** - Minor issues, can proceed
- 🔴 **CHANGES REQUESTED** - Must fix before QA

If changes requested, clearly list what needs to be fixed.

---

## Deliverables

1. Complete this review checklist
2. Add detailed notes above
3. Update status
4. Notify QA Engineer to begin testing
