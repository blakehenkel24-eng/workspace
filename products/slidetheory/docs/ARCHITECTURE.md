# SlideTheory Website Navigation Architecture

## Overview
This document defines the navigation architecture for the SlideTheory 4-page website.

---

## Site Structure

```
/products/slidetheory/mvp/build/public/
├── index.html          (Home - Landing Page)
├── how-it-works.html   (How it Works - Process/Features)
├── resources.html      (Resources - Frameworks & Templates)
└── blog.html          (Blog - Articles & Insights)
```

---

## Navigation Requirements

### Core Navigation Links

| Label        | Target              | Active State Pattern |
|--------------|---------------------|----------------------|
| Home         | `index.html`        | `page === 'home'`    |
| How it Works | `how-it-works.html` | `page === 'how-it-works'` |
| Resources    | `resources.html`    | `page === 'resources'` |
| Blog         | `blog.html`         | `page === 'blog'`    |

### Global CTA Button
- **Label:** "Get Started"
- **Target:** `index.html` (redirects to app)
- **Position:** Right side of navigation bar

---

## Component Specification

### 1. Header Structure

```html
<header class="nav-header" role="banner">
  <!-- Left: Logo + Navigation -->
  <div class="nav-left">
    <a href="index.html" class="nav-logo" aria-label="SlideTheory Home">
      Slide<span class="nav-logo-accent">Theory</span>
    </a>
    <nav aria-label="Main navigation">
      <ul class="nav-links" id="navLinks">
        <li><a href="index.html" class="nav-link" data-page="home">Home</a></li>
        <li><a href="how-it-works.html" class="nav-link" data-page="how-it-works">How it Works</a></li>
        <li><a href="resources.html" class="nav-link" data-page="resources">Resources</a></li>
        <li><a href="blog.html" class="nav-link" data-page="blog">Blog</a></li>
        <!-- Mobile-only CTA -->
        <li class="nav-cta-mobile"><a href="index.html" class="btn-cta">Get Started</a></li>
      </ul>
    </nav>
  </div>
  
  <!-- Right: CTA + Mobile Toggle -->
  <div class="nav-cta">
    <a href="index.html" class="btn-cta">Get Started</a>
    <button class="mobile-menu-toggle" id="mobileMenuToggle" 
            aria-label="Toggle navigation menu" 
            aria-expanded="false"
            aria-controls="navLinks">
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </button>
  </div>
</header>
```

### 2. CSS Requirements (Add to styles.css)

```css
/* ========================================
   NAVIGATION COMPONENT
   ======================================== */

/* Skip Link for Accessibility */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #2563eb;
  color: #fff;
  padding: 8px 16px;
  z-index: 1000;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 0;
}

/* Navigation Header */
.nav-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #0f172a;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

/* Logo */
.nav-logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.nav-logo:hover {
  opacity: 0.9;
}

.nav-logo-accent {
  color: #3b82f6;
  font-weight: 700;
}

/* Navigation Links */
.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #94a3b8;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link:hover {
  color: #fff;
  background: rgba(255,255,255,0.05);
}

/* Active State - Underline indicator */
.nav-link.active {
  color: #fff;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 16px;
  right: 16px;
  height: 2px;
  background: #3b82f6;
  border-radius: 2px;
}

/* CTA Button */
.btn-cta {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.btn-cta:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
}

.mobile-menu-toggle span {
  display: block;
  width: 24px;
  height: 2px;
  background: #fff;
  transition: all 0.3s ease;
}

.mobile-menu-toggle[aria-expanded="true"] span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.mobile-menu-toggle[aria-expanded="true"] span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-toggle[aria-expanded="true"] span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

/* Mobile Navigation */
@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    flex-direction: column;
    background: #0f172a;
    padding: 24px;
    gap: 8px;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    align-items: stretch;
  }

  .nav-links.open {
    transform: translateX(0);
  }

  .nav-link {
    padding: 16px;
    font-size: 16px;
    justify-content: center;
  }

  .nav-link.active::after {
    display: none;
  }

  .nav-link.active {
    background: rgba(59, 130, 246, 0.15);
  }

  .nav-cta .btn-cta {
    display: none;
  }

  .nav-cta-mobile {
    display: block;
    margin-top: 16px;
    text-align: center;
  }

  .nav-cta-mobile .btn-cta {
    display: flex;
    justify-content: center;
    width: 100%;
  }
}

@media (min-width: 769px) {
  .nav-cta-mobile {
    display: none;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .nav-link,
  .btn-cta,
  .mobile-menu-toggle span,
  .nav-links {
    transition: none;
  }
}
```

### 3. JavaScript Requirements

```javascript
/**
 * Navigation Component JavaScript
 * Include this in all 4 pages
 */
(function() {
  'use strict';
  
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const navLinks = document.getElementById('navLinks');
  
  if (mobileMenuToggle && navLinks) {
    // Toggle mobile menu
    mobileMenuToggle.addEventListener('click', () => {
      const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
      mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
      navLinks.classList.toggle('open');
    });
    
    // Close mobile menu when clicking a link
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
      });
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
        mobileMenuToggle.focus();
      }
    });
  }
  
  // Set active nav link based on current page
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
```

---

## Page-Specific Implementation Notes

### index.html (Home)
- **Active State:** Add `active` class to Home link
- **Special Notes:** Landing page may have hero section above fold

### how-it-works.html
- **Active State:** Add `active` class to "How it Works" link
- **Current Status:** Has most complete navigation implementation

### resources.html
- **Active State:** Add `active` class to Resources link
- **Special Notes:** Uses `.nav-header` class correctly

### blog.html
- **Active State:** Add `active` class to Blog link
- **Current Issue:** Uses different header structure - needs alignment

---

## Accessibility Checklist

- [ ] Skip-to-content link present
- [ ] ARIA labels on navigation elements
- [ ] Keyboard navigation support
- [ ] Focus indicators visible
- [ ] Mobile menu has aria-expanded toggle
- [ ] aria-current="page" on active link
- [ ] Reduced motion support
- [ ] Color contrast meets WCAG 2.1 AA

---

## Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| ≥769px | Horizontal nav, desktop CTA visible |
| ≤768px | Hamburger menu, mobile CTA in menu |

---

## File Locations

- **CSS:** `/products/slidetheory/mvp/build/public/styles.css`
- **Pages:** `/products/slidetheory/mvp/build/public/*.html`
- **This Doc:** `/products/slidetheory/docs/ARCHITECTURE.md`

---

## Agent Coordination

| Agent | Responsibility | Status File |
|-------|----------------|-------------|
| ARCHITECT (You) | Design & Coordination | `ARCHITECTURE.md` |
| FRONTEND | Implementation | `TASK-FRONTEND.md` |
| SENIOR | Code Review | `TASK-SENIOR.md` |
| QA | Testing | `TASK-QA.md` |

See coordination files for detailed task assignments.
