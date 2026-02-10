# SlideTheory Design System

> A premium, consulting-grade design system for strategy professionals.

---

## Philosophy

SlideTheory's design language draws from the precision of strategy consulting (McKinsey, BCG, Bain) combined with the modern aesthetics of Linear, Vercel, and Raycast. The result is a distinctive, memorable interface that communicates expertise, clarity, and premium quality.

**Core Principles:**
- **Precision**: Every pixel serves a purpose
- **Clarity**: Information hierarchy is immediately scannable
- **Confidence**: Bold but refined visual decisions
- **Motion**: Animations that feel physical and purposeful

---

## Color Palette

### Primary Colors (Teal/Coral System)

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--teal-50` | `#f0fdfa` | 240, 253, 250 | Lightest backgrounds |
| `--teal-100` | `#ccfbf1` | 204, 251, 241 | Subtle highlights |
| `--teal-200` | `#99f6e4` | 153, 246, 228 | Hover states |
| `--teal-300` | `#5eead4` | 94, 234, 212 | Accents |
| `--teal-400` | `#2dd4bf` | 45, 212, 191 | Primary accent |
| `--teal-500` | `#14b8a6` | 20, 184, 166 | Primary brand |
| `--teal-600` | `#0d9488` | 13, 148, 136 | Buttons, CTAs |
| `--teal-700` | `#0f766e` | 15, 118, 110 | Hover states |
| `--teal-800` | `#115e59` | 17, 94, 89 | Text emphasis |
| `--teal-900` | `#134e4a` | 19, 78, 74 | Headings |
| `--teal-950` | `#042f2e` | 4, 47, 46 | Deepest |

### Secondary Colors (Warm Coral)

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--coral-50` | `#fff1f2` | 255, 241, 242 | Light backgrounds |
| `--coral-100` | `#ffe4e6` | 255, 228, 230 | Subtle highlights |
| `--coral-200` | `#fecdd3` | 254, 205, 211 | Secondary accents |
| `--coral-300` | `#fda4af` | 253, 164, 175 | Highlights |
| `--coral-400` | `#fb7185` | 251, 113, 133 | Secondary brand |
| `--coral-500` | `#f43f5e` | 244, 63, 94 | CTAs, important actions |
| `--coral-600` | `#e11d48` | 225, 29, 72 | Hover states |
| `--coral-700` | `#be123c` | 190, 18, 60 | Text emphasis |
| `--coral-800` | `#9f1239` | 159, 18, 57 | Dark accents |
| `--coral-900` | `#881337` | 136, 19, 55 | Deep text |
| `--coral-950` | `#4c0519` | 76, 5, 25 | Deepest |

### Neutral Colors (Warm Gray)

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--neutral-0` | `#ffffff` | 255, 255, 255 | Pure white |
| `--neutral-50` | `#fafaf9` | 250, 250, 249 | Page backgrounds |
| `--neutral-100` | `#f5f5f4` | 245, 245, 244 | Card backgrounds |
| `--neutral-150` | `#e7e5e4` | 231, 229, 228 | Borders, dividers |
| `--neutral-200` | `#d6d3d1` | 214, 211, 209 | Disabled states |
| `--neutral-300` | `#a8a29e` | 168, 162, 158 | Placeholder text |
| `--neutral-400` | `#78716c` | 120, 113, 108 | Secondary text |
| `--neutral-500` | `#57534e` | 87, 83, 78 | Body text |
| `--neutral-600` | `#44403c` | 68, 64, 60 | Strong text |
| `--neutral-700` | `#292524` | 41, 37, 36 | Headings |
| `--neutral-800` | `#1c1917` | 28, 25, 23 | Deep text |
| `--neutral-900` | `#0c0a09` | 12, 10, 9 | Pure black |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--success-50` | `#f0fdf4` | Success backgrounds |
| `--success-500` | `#22c55e` | Success indicators |
| `--success-600` | `#16a34a` | Success actions |
| `--warning-50` | `#fffbeb` | Warning backgrounds |
| `--warning-500` | `#f59e0b` | Warning indicators |
| `--warning-600` | `#d97706` | Warning actions |
| `--error-50` | `#fef2f2` | Error backgrounds |
| `--error-500` | `#ef4444` | Error indicators |
| `--error-600` | `#dc2626` | Error actions |
| `--info-50` | `#f0f9ff` | Info backgrounds |
| `--info-500` | `#0ea5e9` | Info indicators |

### Gradient Definitions

```css
/* Primary gradient - used for hero backgrounds, CTAs */
--gradient-primary: linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%);

/* Secondary gradient - accent moments */
--gradient-coral: linear-gradient(135deg, #be123c 0%, #f43f5e 50%, #fb7185 100%);

/* Mesh gradient - hero backgrounds */
--gradient-mesh: 
  radial-gradient(at 40% 20%, hsla(168, 76%, 42%, 0.15) 0px, transparent 50%),
  radial-gradient(at 80% 0%, hsla(348, 88%, 60%, 0.1) 0px, transparent 50%),
  radial-gradient(at 0% 50%, hsla(168, 76%, 42%, 0.1) 0px, transparent 50%),
  radial-gradient(at 80% 50%, hsla(348, 88%, 60%, 0.08) 0px, transparent 50%),
  radial-gradient(at 0% 100%, hsla(168, 76%, 42%, 0.12) 0px, transparent 50%);

/* Subtle glow - buttons, focus states */
--glow-teal: 0 0 20px rgba(20, 184, 166, 0.3);
--glow-coral: 0 0 20px rgba(244, 63, 94, 0.3);
```

---

## Typography

### Font Families

| Token | Font | Usage |
|-------|------|-------|
| `--font-sans` | Inter, system-ui, sans-serif | Body text, UI elements |
| `--font-display` | "Cal Sans", "Inter", sans-serif | Headings, display text |
| `--font-mono` | "JetBrains Mono", "Fira Code", monospace | Code, data |

**Font Loading (Google Fonts):**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Cal Sans** (for display headings) - self-hosted or use Inter as fallback with tighter tracking.

### Type Scale

| Style | Size | Line Height | Weight | Letter Spacing | Usage |
|-------|------|-------------|--------|----------------|-------|
| Display | 4.5rem (72px) | 1.1 | 700 | -0.02em | Hero headline |
| H1 | 3rem (48px) | 1.2 | 700 | -0.02em | Page titles |
| H2 | 2.25rem (36px) | 1.25 | 600 | -0.01em | Section titles |
| H3 | 1.5rem (24px) | 1.35 | 600 | -0.01em | Subsection titles |
| H4 | 1.25rem (20px) | 1.4 | 600 | 0 | Card titles |
| H5 | 1.125rem (18px) | 1.5 | 600 | 0 | Small headings |
| H6 | 1rem (16px) | 1.5 | 600 | 0 | Labels |
| Body Large | 1.125rem (18px) | 1.75 | 400 | 0 | Lead paragraphs |
| Body | 1rem (16px) | 1.75 | 400 | 0 | Primary body text |
| Body Small | 0.875rem (14px) | 1.6 | 400 | 0 | Secondary text |
| Caption | 0.75rem (12px) | 1.5 | 500 | 0.01em | Captions, meta |
| Overline | 0.75rem (12px) | 1.5 | 600 | 0.05em | Labels, tags |

### Font Weights

| Weight | Usage |
|--------|-------|
| 400 (Regular) | Body text |
| 500 (Medium) | UI elements, emphasis |
| 600 (Semibold) | Headings, buttons |
| 700 (Bold) | Display, strong emphasis |

---

## Spacing Scale

Based on 4px grid system (0.25rem base unit).

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `--space-0` | 0 | 0 | None |
| `--space-px` | 1px | 1px | Hairline borders |
| `--space-0-5` | 0.125rem | 2px | Tight spacing |
| `--space-1` | 0.25rem | 4px | Default unit |
| `--space-1-5` | 0.375rem | 6px | Small gaps |
| `--space-2` | 0.5rem | 8px | Tight padding |
| `--space-2-5` | 0.625rem | 10px | - |
| `--space-3` | 0.75rem | 12px | Small padding |
| `--space-3-5` | 0.875rem | 14px | - |
| `--space-4` | 1rem | 16px | Standard padding |
| `--space-5` | 1.25rem | 20px | Medium padding |
| `--space-6` | 1.5rem | 24px | Large padding |
| `--space-7` | 1.75rem | 28px | - |
| `--space-8` | 2rem | 32px | Section gaps |
| `--space-9` | 2.25rem | 36px | - |
| `--space-10` | 2.5rem | 40px | Large sections |
| `--space-11` | 2.75rem | 44px | - |
| `--space-12` | 3rem | 48px | Section padding |
| `--space-14` | 3.5rem | 56px | - |
| `--space-16` | 4rem | 64px | Hero padding |
| `--space-20` | 5rem | 80px | Large sections |
| `--space-24` | 6rem | 96px | Page sections |
| `--space-28` | 7rem | 112px | - |
| `--space-32` | 8rem | 128px | Major sections |
| `--space-36` | 9rem | 144px | - |
| `--space-40` | 10rem | 160px | Footer spacing |

### Layout Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--page-padding-x` | 1.5rem (mobile), 2rem (tablet), 3rem (desktop) | Horizontal page padding |
| `--section-padding-y` | 5rem (mobile), 6rem (desktop) | Vertical section padding |
| `--container-max` | 1280px | Max container width |
| `--container-narrow` | 768px | Narrow content width |

---

## Shadows & Elevation

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-xs` | 0 1px 2px 0 rgb(0 0 0 / 0.05) | Subtle elevation |
| `--shadow-sm` | 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) | Cards, buttons |
| `--shadow-md` | 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) | Elevated cards |
| `--shadow-lg` | 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) | Modals, dropdowns |
| `--shadow-xl` | 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) | Popovers |
| `--shadow-2xl` | 0 25px 50px -12px rgb(0 0 0 / 0.25) | Overlays |
| `--shadow-inner` | inset 0 2px 4px 0 rgb(0 0 0 / 0.05) | Inset shadows |
| `--shadow-glow-teal` | 0 0 20px rgba(20, 184, 166, 0.3) | Teal glow |
| `--shadow-glow-coral` | 0 0 20px rgba(244, 63, 94, 0.3) | Coral glow |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | 0 | Sharp corners |
| `--radius-sm` | 0.25rem (4px) | Small elements |
| `--radius-md` | 0.375rem (6px) | Buttons, inputs |
| `--radius-lg` | 0.5rem (8px) | Cards |
| `--radius-xl` | 0.75rem (12px) | Large cards |
| `--radius-2xl` | 1rem (16px) | Modals, panels |
| `--radius-3xl` | 1.5rem (24px) | Hero cards |
| `--radius-full` | 9999px | Pills, avatars |

---

## Animation Specifications

### Timing Functions

| Token | Value | Usage |
|-------|-------|-------|
| `--ease-linear` | linear | Continuous animations |
| `--ease-in` | cubic-bezier(0.4, 0, 1, 1) | Exit animations |
| `--ease-out` | cubic-bezier(0, 0, 0.2, 1) | Enter animations |
| `--ease-in-out` | cubic-bezier(0.4, 0, 0.2, 1) | Standard transitions |
| `--ease-spring` | cubic-bezier(0.34, 1.56, 0.64, 1) | Bouncy effects |
| `--ease-smooth` | cubic-bezier(0.16, 1, 0.3, 1) | Premium feel |

### Duration Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-75` | 75ms | Micro-interactions |
| `--duration-100` | 100ms | Quick feedback |
| `--duration-150` | 150ms | Button states |
| `--duration-200` | 200ms | Hover transitions |
| `--duration-300` | 300ms | Standard transitions |
| `--duration-500` | 500ms | Complex animations |
| `--duration-700` | 700ms | Page transitions |
| `--duration-1000` | 1000ms | Hero animations |

### Animation Presets

```css
/* Standard transition */
--transition-base: all var(--duration-200) var(--ease-in-out);

/* Button hover */
--transition-button: all var(--duration-150) var(--ease-out);

/* Modal/dialog */
--transition-modal: all var(--duration-300) var(--ease-smooth);

/* Page transition */
--transition-page: all var(--duration-500) var(--ease-smooth);

/* Stagger children */
--transition-stagger: calc(var(--index) * 50ms);
```

### Keyframe Animations

```css
/* Fade in up - for content reveal */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fade in scale - for modals, cards */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Slide in right - for side panels */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Pulse glow - for focus states */
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(20, 184, 166, 0);
  }
}

/* Gradient shift - for hero backgrounds */
@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Float - for subtle floating elements */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Shimmer - for loading states */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Spin slow - for decorative elements */
@keyframes spinSlow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

---

## Iconography

### Style Guidelines

- **Library**: Lucide React (`lucide-react`)
- **Stroke Width**: 1.5px (default), 2px (emphasis)
- **Size Scale**: 16px (sm), 20px (md), 24px (lg), 32px (xl)
- **Corner Style**: Rounded (matches UI)

### Icon Usage

| Size | Usage |
|------|-------|
| 16px | Inline with text, buttons |
| 20px | Form inputs, navigation |
| 24px | Feature icons, cards |
| 32px | Hero features, empty states |

### Icon Colors

| Context | Color |
|---------|-------|
| Default | `--neutral-500` |
| Muted | `--neutral-400` |
| Primary | `--teal-600` |
| Secondary | `--coral-500` |
| Inverse | `--neutral-0` (on dark) |

---

## Glassmorphism

### Standard Glass

```css
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

### Dark Glass

```css
.glass-dark {
  background: rgba(12, 10, 9, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Glass Card

```css
.glass-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0.7) 100%
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}
```

---

## Component Patterns

### Buttons

**Primary Button**
```
Background: --teal-600
Text: white
Padding: 0.625rem 1.25rem
Border Radius: --radius-md
Font Weight: 600
Shadow: --shadow-sm
Hover: --teal-700, --shadow-md
Active: --teal-800
Focus: --glow-teal
```

**Secondary Button**
```
Background: white
Border: 1px solid --neutral-200
Text: --neutral-700
Padding: 0.625rem 1.25rem
Border Radius: --radius-md
Font Weight: 600
Hover: --neutral-50, border --neutral-300
```

**Ghost Button**
```
Background: transparent
Text: --neutral-600
Padding: 0.625rem 1rem
Border Radius: --radius-md
Font Weight: 500
Hover: --neutral-100
```

### Cards

**Standard Card**
```
Background: white
Border: 1px solid --neutral-150
Border Radius: --radius-lg
Padding: --space-6
Shadow: --shadow-sm
Hover: --shadow-md, translateY(-2px)
```

**Glass Card**
```
Background: glass-card
Border Radius: --radius-xl
Padding: --space-6
Shadow: --shadow-lg
```

### Inputs

**Text Input**
```
Background: white
Border: 1px solid --neutral-200
Border Radius: --radius-md
Padding: 0.625rem 0.875rem
Font Size: --text-body
Focus: border --teal-500, --glow-teal
Placeholder: --neutral-400
```

### Badges

**Status Badge**
```
Padding: 0.25rem 0.625rem
Border Radius: --radius-full
Font Size: --text-caption
Font Weight: 600
Text Transform: uppercase
Letter Spacing: 0.05em
```

---

## Responsive Breakpoints

| Token | Value | Usage |
|-------|-------|-------|
| `--bp-sm` | 640px | Large phones |
| `--bp-md` | 768px | Tablets |
| `--bp-lg` | 1024px | Small laptops |
| `--bp-xl` | 1280px | Desktops |
| `--bp-2xl` | 1536px | Large screens |

---

## Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | 0 | Default |
| `--z-dropdown` | 50 | Dropdowns |
| `--z-sticky` | 100 | Sticky headers |
| `--z-modal-backdrop` | 200 | Modal overlays |
| `--z-modal` | 300 | Modals |
| `--z-popover` | 400 | Popovers, tooltips |
| `--z-toast` | 500 | Toast notifications |
| `--z-devtools` | 9999 | Dev tools |

---

## Accessibility

### Focus Indicators

```css
/* Visible focus ring */
:focus-visible {
  outline: 2px solid var(--teal-500);
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Color Contrast

- All text meets WCAG AA (4.5:1 for normal, 3:1 for large)
- Interactive elements have visible focus states
- Color is not the sole means of conveying information

---

## Usage Examples

### CSS Variables Import

```css
@import 'design-system.css';

.my-component {
  background: var(--teal-600);
  color: white;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  font-weight: 600;
  transition: var(--transition-button);
}

.my-component:hover {
  background: var(--teal-700);
  box-shadow: var(--shadow-md);
}
```

### Tailwind Config Extension

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          // ... full scale
          600: '#0d9488',
          950: '#042f2e',
        },
        coral: {
          50: '#fff1f2',
          // ... full scale
          500: '#f43f5e',
          950: '#4c0519',
        },
        neutral: {
          0: '#ffffff',
          50: '#fafaf9',
          // ... full scale
          900: '#0c0a09',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'fade-in-scale': 'fadeInScale 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'gradient': 'gradientShift 8s ease infinite',
      },
    },
  },
}
```
