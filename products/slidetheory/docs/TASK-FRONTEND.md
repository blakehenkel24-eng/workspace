# TASK-FRONTEND.md
## Frontend Engineer Assignment

**Assigned by:** ARCHITECT  
**Task:** Implement consistent navigation across all 4 pages  
**Due:** Complete all items below  
**Status:** 🟡 READY TO START

---

## Your Mission

Implement the navigation component specified in `ARCHITECTURE.md` across all 4 SlideTheory pages. The navigation must be identical on every page with proper active states.

---

## Files to Modify

### 1. `/products/slidetheory/mvp/build/public/styles.css`
**Action:** Add the navigation CSS from ARCHITECTURE.md Section 2

**Checklist:**
- [ ] Add `.skip-link` styles
- [ ] Add `.nav-header` styles  
- [ ] Add `.nav-link` styles with active state
- [ ] Add `.nav-link.active::after` underline indicator
- [ ] Add `.mobile-menu-toggle` styles
- [ ] Add mobile breakpoint styles (max-width: 768px)
- [ ] Add `prefers-reduced-motion` support

### 2. `/products/slidetheory/mvp/build/public/index.html`
**Action:** Replace existing header with standardized navigation

**Current:** Basic card-based layout without proper nav  
**Target:** Full navigation header per ARCHITECTURE.md

**Checklist:**
- [ ] Add skip-link `<a href="#main-content">`
- [ ] Replace header with `.nav-header` structure
- [ ] Add `data-page="home"` to Home link
- [ ] Add `active` class to Home link
- [ ] Include navigation JavaScript
- [ ] Ensure main content has `id="main-content"`

### 3. `/products/slidetheory/mvp/build/public/how-it-works.html`
**Action:** Verify and standardize navigation

**Current:** Has good nav structure already  
**Target:** Align with ARCHITECTURE.md specification

**Checklist:**
- [ ] Add `data-page="how-it-works"` attributes to nav links
- [ ] Add `aria-current="page"` to active link
- [ ] Ensure mobile menu has proper aria-expanded toggle
- [ ] Verify JavaScript matches ARCHITECTURE.md spec
- [ ] Add skip-link if missing

### 4. `/products/slidetheory/mvp/build/public/resources.html`
**Action:** Verify and standardize navigation

**Checklist:**
- [ ] Add `data-page="resources"` attributes
- [ ] Add `data-page="home"`, `data-page="how-it-works"`, etc. to other links
- [ ] Add `aria-current="page"` to active link
- [ ] Add skip-link if missing
- [ ] Remove version badge from logo (or keep consistent across pages)

### 5. `/products/slidetheory/mvp/build/public/blog.html`
**Action:** Complete header overhaul - currently uses different structure

**Current:** Simple `.header` with logo and icon buttons  
**Target:** Full `.nav-header` with navigation links

**Checklist:**
- [ ] Replace entire `<header>` with `.nav-header` structure
- [ ] Add all 4 navigation links
- [ ] Add `data-page="blog"` to Blog link
- [ ] Add `active` class to Blog link
- [ ] Add CTA button
- [ ] Add mobile menu toggle
- [ ] Add skip-link
- [ ] Move icon buttons (Resources link) into nav or remove

### 6. Navigation JavaScript
**Action:** Add to all 4 pages (before closing `</body>` tag)

```javascript
<script>
(function() {
  'use strict';
  
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const navLinks = document.getElementById('navLinks');
  
  if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', () => {
      const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
      mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
      navLinks.classList.toggle('open');
    });
    
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
      });
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
        mobileMenuToggle.focus();
      }
    });
  }
  
  // Auto-set active state
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const pageMap = {
    'index.html': 'home',
    '': 'home',
    'how-it-works.html': 'how-it-works',
    'resources.html': 'resources',
    'blog.html': 'blog'
  };
  
  const activePage = pageMap[currentPage];
  if (activePage) {
    const activeLink = document.querySelector(`[data-page="${activePage}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
      activeLink.setAttribute('aria-current', 'page');
    }
  }
})();
</script>
```

---

## Visual Reference

### Desktop Navigation Layout
```
┌─────────────────────────────────────────────────────────┐
│ SlideTheory    Home  How it Works  Resources  Blog [CTA]│
│  Logo          ─────────────────────────────────────────│
│                ^ underline on active page               │
└─────────────────────────────────────────────────────────┘
```

### Mobile Navigation Layout (Closed)
```
┌─────────────────────────┐
│ SlideTheory         [≡] │
└─────────────────────────┘
```

### Mobile Navigation Layout (Open)
```
┌─────────────────────────┐
│ SlideTheory         [×] │
├─────────────────────────┤
│ Home                    │
│ How it Works            │
│ Resources               │
│ Blog                    │
│ [Get Started]           │
└─────────────────────────┘
```

---

## Acceptance Criteria

1. **Consistency:** All 4 pages have identical navigation HTML structure
2. **Active States:** Current page is highlighted with underline (desktop) or background (mobile)
3. **Mobile Menu:** Hamburger icon transforms to X when open
4. **Accessibility:** All ARIA attributes present, keyboard navigation works
5. **Skip Link:** First focusable element on each page
6. **CTA Button:** "Get Started" present and styled consistently

---

## Testing Checklist

Before marking complete, test on:
- [ ] Desktop Chrome
- [ ] Desktop Firefox  
- [ ] Mobile Chrome (responsive mode)
- [ ] Mobile Safari (responsive mode)
- [ ] Keyboard navigation only
- [ ] Screen reader (if available)

---

## Deliverables

When complete, update this file:
1. Mark all checkboxes above
2. Add any implementation notes
3. Change status to: 🟢 COMPLETE
4. Notify SENIOR engineer for code review

---

## Questions?

If you need clarification on any requirement:
1. Check ARCHITECTURE.md first
2. Add question to "Questions/Notes" section below
3. ARCHITECT will respond

### Questions/Notes
<!-- Add questions here -->
