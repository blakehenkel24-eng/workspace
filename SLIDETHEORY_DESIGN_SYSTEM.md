# SlideTheory Design System v4.0
## Comprehensive MBB-Quality Presentation Standards

> **Mission:** Transform SlideTheory from basic HTML output to McKinsey/BCG/Bain-quality presentation slides  
> **Target:** Consulting-grade visual excellence with every slide  
> **Version:** 4.0 - Complete Implementation Guide  
> **Last Updated:** 2026-02-07

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Visual Design System](#2-visual-design-system)
3. [Layout Patterns](#3-layout-patterns)
4. [Component Library](#4-component-library)
5. [Advanced CSS Techniques](#5-advanced-css-techniques)
6. [Icon System](#6-icon-system)
7. [Chart Styling](#7-chart-styling)
8. [Framework Recommendations](#8-framework-recommendations)
9. [Implementation Guide](#9-implementation-guide)
10. [Appendix: Design Tokens](#appendix-design-tokens-reference)

---

## 1. Executive Summary

### 1.1 Current State Analysis

SlideTheory currently generates slides with:
- **Flat white backgrounds** - No visual depth or sophistication
- **Generic blue accents** (#3B82F6) - Looks like default Bootstrap
- **Basic typography** - No hierarchy or premium feel
- **Simple charts** - Flat colors, no gradients or polish
- **Minimal components** - Light boxes with colored borders only

### 1.2 Target State: MBB Quality

McKinsey/BCG/Bain slides feature:
- **Rich gradient backgrounds** - Warm, sophisticated tones
- **Dark "Key Insights" panels** - Premium, high-contrast callouts
- **Glassmorphism effects** - Modern depth and layering
- **Gradient chart fills** - Visual interest and polish
- **Thoughtful typography** - Clear hierarchy with accent colors

### 1.3 The Transformation Matrix

| Aspect | Current | Target | Implementation |
|--------|---------|--------|----------------|
| Background | Flat white/gray | Warm gradient (orange→terracotta) | CSS gradient |
| Headlines | Generic black | Coral orange accent | Color token |
| Insight Boxes | Light w/ border | Dark panel (#2C3E50) | New component |
| Charts | Flat colors | Gradient fills, rounded | Chart.js config |
| Depth | None | Glassmorphism, shadows | backdrop-filter |
| Typography | Basic | Montserrat/Inter hierarchy | Font stack |

### 1.4 Success Metrics

- **Visual Quality:** 9/10 rating vs current 5/10
- **Brand Recognition:** Distinctive from generic SaaS templates
- **Client Impression:** Executive-ready presentation quality
- **Consistency:** 100% of slides follow design system

---

## 2. Visual Design System

### 2.1 Color Palette

#### 2.1.1 Primary Colors: Warm Orange System

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--orange-50` | `#fff7ed` | 255, 247, 237 | Light backgrounds |
| `--orange-100` | `#ffedd5` | 255, 237, 213 | Subtle highlights |
| `--orange-200` | `#fed7aa` | 254, 215, 170 | Hover states |
| `--orange-300` | `#fdba74` | 253, 186, 116 | Labels, accents |
| `--orange-400` | `#fb923c` | 251, 146, 60 | Secondary accent |
| `--orange-500` | `#f97316` | 249, 115, 22 | Chart highlights |
| `--orange-600` | `#ea580c` | 234, 88, 12 | **Headlines, CTAs** |
| `--orange-700` | `#c2410c` | 194, 65, 12 | Hover states |
| `--orange-800` | `#9a3412` | 154, 52, 18 | Dark accents |
| `--orange-900` | `#7c2d12` | 124, 45, 18 | Deep text |
| `--orange-950` | `#431407` | 67, 20, 7 | Deepest |

#### 2.1.2 Secondary Colors: Burnt/Terracotta Gradients

| Token | Hex | Usage |
|-------|-----|-------|
| `--burnt-orange` | `#D35400` | Gradient start, warmth |
| `--terracotta` | `#8B4513` | Gradient end, depth |
| `--coral-accent` | `#E85A2C` | **Primary accent** |
| `--coral-red` | `#E74C3C` | Chart bars (caution) |
| `--sienna` | `#A0522D` | Mid-gradient |

#### 2.1.3 Accent Colors: Dark Blue-Gray (Key Insights)

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--insight-50` | `#f8fafc` | Lightest variant |
| `--insight-100` | `#f1f5f9` | Light backgrounds |
| `--insight-200` | `#e2e8f0` | Borders |
| `--insight-300` | `#cbd5e1` | Disabled states |
| `--insight-400` | `#94a3b8` | Muted text |
| `--insight-500` | `#64748b` | Secondary text |
| `--insight-600` | `#475569` | Body text |
| `--insight-700` | `#334155` | Headings |
| `--insight-800` | `#1e293b` | Dark backgrounds |
| `--insight-900` | `#0f172a` | Deepest |
| `--insight-dark` | `#2C3E50` | **Key insights panel** |
| `--insight-darker` | `#1a252f` | Darker variant |

#### 2.1.4 Chart Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--chart-yellow` | `#FFD93D` | Positive bars, growth |
| `--chart-yellow-light` | `#FFE066` | Yellow highlight |
| `--chart-orange` | `#E74C3C` | Warning, caution bars |
| `--chart-coral` | `#E85A2C` | Primary highlight |
| `--chart-teal` | `#14b8a6` | Secondary metric |
| `--chart-blue` | `#3b82f6` | Neutral data |
| `--chart-gray` | `#9ca3af` | Inactive, baseline |

#### 2.1.5 Neutral Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--white` | `#ffffff` | Pure white |
| `--gray-50` | `#f9fafb` | Light backgrounds |
| `--gray-100` | `#f3f4f6` | Subtle backgrounds |
| `--gray-200` | `#e5e7eb` | Borders, dividers |
| `--gray-300` | `#d1d5db` | Disabled states |
| `--gray-400` | `#9ca3af` | Muted text |
| `--gray-500` | `#6b7280` | Secondary text |
| `--gray-600` | `#4b5563` | Body text |
| `--gray-700` | `#374151` | Strong text |
| `--gray-800` | `#1f2937` | Headings |
| `--gray-900` | `#111827` | Deepest text |
| `--black` | `#000000` | Pure black |

#### 2.1.6 Semantic Colors

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

### 2.2 Gradient Definitions

```css
/* ============================================
   GRADIENT DEFINITIONS
   ============================================ */

/* Primary: Warm background gradient */
--gradient-warm: linear-gradient(135deg, #D35400 0%, #A0522D 50%, #8B4513 100%);

/* Warm horizontal */
--gradient-warm-h: linear-gradient(90deg, #D35400 0%, #8B4513 100%);

/* Subtle warm for content areas */
--gradient-content: linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%);

/* Chart bar gradients */
--gradient-chart-yellow: linear-gradient(180deg, #FFD93D 0%, #F4D03F 100%);
--gradient-chart-yellow-soft: linear-gradient(180deg, #FFE066 0%, #FFD93D 100%);
--gradient-chart-orange: linear-gradient(180deg, #E74C3C 0%, #C0392B 100%);
--gradient-chart-coral: linear-gradient(180deg, #E85A2C 0%, #D35400 100%);
--gradient-chart-teal: linear-gradient(180deg, #14b8a6 0%, #0d9488 100%);

/* Insight panel gradient */
--gradient-insight: linear-gradient(135deg, #2C3E50 0%, #34495E 100%);

/* Glassmorphism overlays */
--glass-white: rgba(255, 255, 255, 0.85);
--glass-white-soft: rgba(255, 255, 255, 0.7);
--glass-border: rgba(255, 255, 255, 0.5);
--glass-border-subtle: rgba(255, 255, 255, 0.3);

/* Text gradients */
--gradient-text-warm: linear-gradient(135deg, #E85A2C 0%, #D35400 100%);
--gradient-text-cool: linear-gradient(135deg, #2C3E50 0%, #34495E 100%);

/* Glow effects */
--glow-orange: 0 4px 20px rgba(232, 90, 44, 0.3);
--glow-orange-lg: 0 8px 30px rgba(232, 90, 44, 0.4);
--glow-yellow: 0 4px 20px rgba(255, 217, 61, 0.3);
--glow-yellow-lg: 0 8px 30px rgba(255, 217, 61, 0.4);
--glow-teal: 0 4px 20px rgba(20, 184, 166, 0.3);
--glow-insight: 0 4px 20px rgba(44, 62, 80, 0.3);

/* Mesh gradient for hero backgrounds */
--gradient-mesh: 
  radial-gradient(at 40% 20%, rgba(211, 84, 0, 0.15) 0px, transparent 50%),
  radial-gradient(at 80% 0%, rgba(232, 90, 44, 0.1) 0px, transparent 50%),
  radial-gradient(at 0% 50%, rgba(211, 84, 0, 0.1) 0px, transparent 50%),
  radial-gradient(at 80% 50%, rgba(139, 69, 19, 0.08) 0px, transparent 50%),
  radial-gradient(at 0% 100%, rgba(211, 84, 0, 0.12) 0px, transparent 50%),
  #FAFAFA;
```

### 2.3 Typography System

#### 2.3.1 Font Families

```css
/* Primary font stack */
--font-display: 'Montserrat', 'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

**Font Loading:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet">
```

#### 2.3.2 Type Scale

| Style | Font | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|------|--------|-------------|----------------|-------|
| Display | Montserrat | 48px (3rem) | 800 | 1.1 | -0.02em | Hero titles |
| H1 | Montserrat | 32px (2rem) | 700 | 1.2 | -0.02em | **Slide titles** |
| H2 | Inter | 24px (1.5rem) | 600 | 1.3 | -0.01em | Section headers |
| H3 | Inter | 20px (1.25rem) | 600 | 1.35 | 0 | Subsection headers |
| H4 | Inter | 18px (1.125rem) | 600 | 1.4 | 0 | Card titles |
| Body Large | Inter | 18px (1.125rem) | 400 | 1.6 | 0 | Lead text |
| Body | Inter | 16px (1rem) | 400 | 1.6 | 0 | Standard text |
| Body Small | Inter | 14px (0.875rem) | 400 | 1.5 | 0 | Secondary text |
| Caption | Inter | 12px (0.75rem) | 500 | 1.4 | 0.01em | Labels, captions |
| Overline | Inter | 11px (0.6875rem) | 600 | 1.4 | 0.1em | Uppercase labels |
| Data | Inter | 14px (0.875rem) | 700 | 1.2 | -0.01em | Metrics, numbers |

#### 2.3.3 Slide-Specific Typography

```css
/* Slide title - Action title */
--slide-title-size: 32px;
--slide-title-weight: 700;
--slide-title-color: var(--coral-accent);
--slide-title-line-height: 1.2;

/* Subtitle */
--slide-subtitle-size: 14px;
--slide-subtitle-weight: 400;
--slide-subtitle-color: rgba(255, 255, 255, 0.8);

/* Key insights panel */
--insight-label-size: 12px;
--insight-label-weight: 600;
--insight-label-color: var(--orange-300);
--insight-text-size: 18px;
--insight-text-weight: 500;
--insight-text-color: white;

/* Chart labels */
--chart-label-size: 12px;
--chart-label-weight: 600;
--chart-label-color: white;

/* Source citation */
--source-size: 11px;
--source-weight: 400;
--source-color: rgba(255, 255, 255, 0.6);
```

### 2.4 Spacing System

```css
/* ============================================
   SPACING SYSTEM (4px base unit)
   ============================================ */

/* Base spacing scale */
--space-0: 0;
--space-px: 1px;
--space-0-5: 0.125rem;  /* 2px */
--space-1: 0.25rem;     /* 4px */
--space-1-5: 0.375rem;  /* 6px */
--space-2: 0.5rem;      /* 8px */
--space-2-5: 0.625rem;  /* 10px */
--space-3: 0.75rem;     /* 12px */
--space-3-5: 0.875rem;  /* 14px */
--space-4: 1rem;        /* 16px */
--space-5: 1.25rem;     /* 20px */
--space-6: 1.5rem;      /* 24px */
--space-7: 1.75rem;     /* 28px */
--space-8: 2rem;        /* 32px */
--space-9: 2.25rem;     /* 36px */
--space-10: 2.5rem;     /* 40px */
--space-12: 3rem;       /* 48px */
--space-14: 3.5rem;     /* 56px */
--space-16: 4rem;       /* 64px */
--space-20: 5rem;       /* 80px */
--space-24: 6rem;       /* 96px */

/* Slide-specific spacing */
--slide-padding-x: 40px;
--slide-padding-y: 32px;
--slide-gap: 24px;
--slide-gap-lg: 32px;

/* Component spacing */
--card-padding: 20px;
--card-padding-lg: 24px;
--panel-padding: 24px;
--chart-padding: 20px;
--list-gap: 12px;

/* Section spacing */
--section-gap: 24px;
--subsection-gap: 16px;
--element-gap: 12px;
```

### 2.5 Border Radius System

```css
/* ============================================
   BORDER RADIUS
   ============================================ */

--radius-none: 0;
--radius-sm: 4px;       /* Small elements */
--radius-md: 6px;       /* Buttons, inputs */
--radius-lg: 8px;       /* Cards, panels */
--radius-xl: 12px;      /* Large cards */
--radius-2xl: 16px;     /* Modals, chart containers */
--radius-3xl: 24px;     /* Hero elements */
--radius-full: 9999px;  /* Pills, badges */

/* Slide-specific */
--slide-radius: 12px;
--panel-radius: 12px;
--card-radius: 12px;
--chart-radius: 16px;
--bar-radius: 8px 8px 0 0;  /* Chart bars */
```

### 2.6 Shadow System

```css
/* ============================================
   SHADOW SYSTEM
   ============================================ */

/* Standard shadows */
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

/* Glassmorphism shadows */
--shadow-glass: 
  0 4px 6px -1px rgba(0, 0, 0, 0.1),
  0 2px 4px -1px rgba(0, 0, 0, 0.06),
  inset 0 1px 0 rgba(255, 255, 255, 0.6);

--shadow-glass-lg: 
  0 8px 24px rgba(0, 0, 0, 0.12),
  inset 0 1px 0 rgba(255, 255, 255, 0.6);

/* Component-specific shadows */
--shadow-insight: 0 4px 20px rgba(44, 62, 80, 0.3);
--shadow-card: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-card-hover: 0 8px 24px rgba(0, 0, 0, 0.12);
--shadow-chart: 0 8px 24px rgba(0, 0, 0, 0.12);

/* Glow shadows */
--glow-orange-sm: 0 0 10px rgba(232, 90, 44, 0.2);
--glow-orange: 0 0 20px rgba(232, 90, 44, 0.3);
--glow-orange-lg: 0 0 30px rgba(232, 90, 44, 0.4);
```

### 2.7 Border System

```css
/* ============================================
   BORDER SYSTEM
   ============================================ */

--border-width-0: 0;
--border-width-1: 1px;
--border-width-2: 2px;
--border-width-4: 4px;

--border-color-default: var(--gray-200);
--border-color-subtle: var(--gray-100);
--border-color-strong: var(--gray-300);
--border-color-accent: var(--coral-accent);
--border-color-glass: rgba(255, 255, 255, 0.5);

--border-default: 1px solid var(--border-color-default);
--border-glass: 1px solid var(--border-color-glass);
--border-accent: 2px solid var(--border-color-accent);
```

---

## 3. Layout Patterns

### 3.1 The "Key Insights" Layout (Primary)

**Purpose:** Hero slide with prominent insight panel, supporting content, and chart

**Structure:**
```
┌───────────────────────────────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓ WARM GRADIENT BACKGROUND ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓ (Orange → Terracotta) ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │ Title (Coral accent color)                     │  │
│  │ Subtitle (White/translucent)                   │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │ KEY INSIGHTS (Dark panel #2C3E50)              │  │
│  │ Main insight text (White, prominent)           │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ┌───────────────┐  ┌──────────────────────────────┐ │
│  │ Supporting    │  │                              │ │
│  │ content       │  │     [GLASS CHART AREA]       │ │
│  │ • Bullet 1    │  │                              │ │
│  │ • Bullet 2    │  │     Gradient bars, rounded   │ │
│  │ • Bullet 3    │  │     Data callouts            │ │
│  └───────────────┘  └──────────────────────────────┘ │
│                                                       │
│  Source: Citation                            Page X  │
└───────────────────────────────────────────────────────┘
```

**CSS Implementation:**
```css
.layout-key-insights {
  width: 100%;
  height: 100%;
  min-height: 600px;
  background: var(--gradient-warm);
  padding: var(--slide-padding-y) var(--slide-padding-x);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  font-family: var(--font-body);
}

.layout-key-insights__header {
  margin-bottom: var(--space-6);
}

.layout-key-insights__title {
  font-family: var(--font-display);
  font-size: var(--slide-title-size);
  font-weight: var(--slide-title-weight);
  color: var(--slide-title-color);
  margin: 0 0 var(--space-2) 0;
  line-height: var(--slide-title-line-height);
}

.layout-key-insights__subtitle {
  font-size: var(--slide-subtitle-size);
  color: var(--slide-subtitle-color);
  margin: 0;
}

.layout-key-insights__panel {
  margin-bottom: var(--space-6);
}

.layout-key-insights__content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--slide-gap);
  flex: 1;
  min-height: 0;
}

.layout-key-insights__left {
  display: flex;
  flex-direction: column;
}

.layout-key-insights__right {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.layout-key-insights__footer {
  margin-top: auto;
  padding-top: var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

**React Component:**
```tsx
interface KeyInsightsLayoutProps {
  title: string;
  subtitle?: string;
  keyInsight: string;
  insightLabel?: string;
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  source?: string;
  pageNumber?: number;
}

const KeyInsightsLayout: React.FC<KeyInsightsLayoutProps> = ({
  title,
  subtitle,
  keyInsight,
  insightLabel = 'Key Insights',
  leftContent,
  rightContent,
  source,
  pageNumber,
}) => {
  return (
    <div className="layout-key-insights">
      <header className="layout-key-insights__header">
        <h1 className="layout-key-insights__title">{title}</h1>
        {subtitle && (
          <p className="layout-key-insights__subtitle">{subtitle}</p>
        )}
      </header>
      
      <div className="layout-key-insights__panel">
        <KeyInsightsPanel label={insightLabel}>
          {keyInsight}
        </KeyInsightsPanel>
      </div>
      
      <div className="layout-key-insights__content">
        <div className="layout-key-insights__left">{leftContent}</div>
        <div className="layout-key-insights__right">{rightContent}</div>
      </div>
      
      <footer className="layout-key-insights__footer">
        {source && (
          <span className="text-xs text-white/60">
            <strong>Source:</strong> {source}
          </span>
        )}
        {pageNumber && (
          <span className="text-xs text-white/60">{pageNumber}</span>
        )}
      </footer>
    </div>
  );
};
```

### 3.2 Two-Column Layout

**Purpose:** Side-by-side comparison, chart + insights, options analysis

**Structure:**
```
┌───────────────────────────────────────────────────────┐
│ Title (Action title with insight)                     │
├──────────────────────────┬────────────────────────────┤
│                          │                            │
│  [Left Column]           │  [Right Column]            │
│                          │                            │
│  • Bullet point 1        │  • Bullet point A          │
│  • Bullet point 2        │  • Bullet point B          │
│  • Bullet point 3        │  • Bullet point C          │
│                          │                            │
│  ┌──────────────────┐   │  ┌──────────────────┐      │
│  │ Metric Card      │   │  │ Metric Card      │      │
│  │ $127M            │   │  │ 23%              │      │
│  └──────────────────┘   │  └──────────────────┘      │
│                          │                            │
├──────────────────────────┴────────────────────────────┤
│ Source: Citation                                      │
└───────────────────────────────────────────────────────┘
```

**CSS Implementation:**
```css
.layout-two-column {
  width: 100%;
  height: 100%;
  padding: var(--slide-padding-y) var(--slide-padding-x);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.layout-two-column__header {
  margin-bottom: var(--space-6);
}

.layout-two-column__title {
  font-family: var(--font-display);
  font-size: var(--slide-title-size);
  font-weight: var(--slide-title-weight);
  color: var(--coral-accent);
  margin: 0 0 var(--space-2) 0;
}

.layout-two-column__content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--slide-gap-lg);
  flex: 1;
}

.layout-two-column__divider {
  width: 1px;
  background: var(--gray-200);
  margin: 0 var(--space-4);
}

.layout-two-column__footer {
  margin-top: auto;
  padding-top: var(--space-4);
}
```

### 3.3 Three-Column Layout (Comparison)

**Purpose:** Option comparison, before/after/impact, scenario analysis

**Structure:**
```
┌───────────────────────────────────────────────────────┐
│ Title: Recommendation clearly stated                  │
├──────────────┬──────────────┬─────────────────────────┤
│  Option A    │  Option B    │  Option C (Recommended) │
│  ─────────   │  ─────────   │  ─────────────────────  │
│  • Cost: $X  │  • Cost: $Y  │  • Cost: $Z             │
│  • Time: T   │  • Time: T   │  • Time: T              │
│  • Risk: Low │  • Risk: Med │  • Risk: Low            │
│              │              │                         │
│  [Neutral]   │  [Neutral]   │  [Highlighted]          │
│              │              │                         │
├──────────────┴──────────────┴─────────────────────────┤
│ Recommendation: Option C delivers best ROI            │
└───────────────────────────────────────────────────────┘
```

**CSS Implementation:**
```css
.layout-three-column {
  width: 100%;
  height: 100%;
  padding: var(--slide-padding-y) var(--slide-padding-x);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.layout-three-column__content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
  flex: 1;
}

.layout-three-column__column {
  border-left: 2px solid var(--gray-200);
  padding-left: var(--space-4);
}

.layout-three-column__column:first-child {
  border-left: none;
  padding-left: 0;
}

.layout-three-column__column--recommended {
  border-left-color: var(--coral-accent);
  background: var(--orange-50);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-left: calc(var(--space-4) * -1);
}
```

### 3.4 Chart-Heavy Layout

**Purpose:** Data-driven slides, financial analysis, performance metrics

**Structure:**
```
┌───────────────────────────────────────────────────────┐
│ Title: Key metric improved X% driven by [driver]      │
├───────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │                                                 │ │
│  │         [Large Chart Area]                      │ │
│  │                                                 │ │
│  │    Full-width visualization                     │ │
│  │    with annotations and callouts                │ │
│  │                                                 │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
├──────────────────────────┬────────────────────────────┤
│  Finding 1               │  Finding 2                 │
│  ▲ +$50M impact          │  ▲ +20% efficiency         │
├──────────────────────────┴────────────────────────────┤
│ Source: Citation                                      │
└───────────────────────────────────────────────────────┘
```

**CSS Implementation:**
```css
.layout-chart-heavy {
  width: 100%;
  height: 100%;
  padding: var(--slide-padding-y) var(--slide-padding-x);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.layout-chart-heavy__chart-area {
  flex: 1;
  min-height: 0;
  margin-bottom: var(--space-6);
}

.layout-chart-heavy__findings {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
}
```

### 3.5 Title Slide Layout

**Purpose:** Section divider, title slide, agenda

**Structure:**
```
┌───────────────────────────────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│                                                       │
│              ━━━━━━━━━━━━━━━━━━                       │
│                                                       │
│              SECTION TITLE                            │
│              ─────────────────                        │
│              Subtitle or description                  │
│                                                       │
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
└───────────────────────────────────────────────────────┘
```

**CSS Implementation:**
```css
.layout-title {
  width: 100%;
  height: 100%;
  background: var(--gradient-warm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--slide-padding-y) var(--slide-padding-x);
  box-sizing: border-box;
}

.layout-title__accent {
  width: 80px;
  height: 4px;
  background: var(--coral-accent);
  border-radius: var(--radius-full);
  margin-bottom: var(--space-8);
}

.layout-title__heading {
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 800;
  color: white;
  margin: 0 0 var(--space-4) 0;
  letter-spacing: -0.02em;
}

.layout-title__subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}
```

### 3.6 Grid System

**12-Column Grid for Complex Layouts:**

```css
.slide-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-4);
}

/* Column spans */
.col-span-1 { grid-column: span 1; }
.col-span-2 { grid-column: span 2; }
.col-span-3 { grid-column: span 3; }
.col-span-4 { grid-column: span 4; }
.col-span-5 { grid-column: span 5; }
.col-span-6 { grid-column: span 6; }
.col-span-7 { grid-column: span 7; }
.col-span-8 { grid-column: span 8; }
.col-span-9 { grid-column: span 9; }
.col-span-10 { grid-column: span 10; }
.col-span-11 { grid-column: span 11; }
.col-span-12 { grid-column: span 12; }

/* Row spans */
.row-span-2 { grid-row: span 2; }
.row-span-3 { grid-row: span 3; }
```

---

## 4. Component Library

### 4.1 Key Insights Panel

**Description:** Dark, prominent panel for main takeaways

**Visual Design:**
- Background: #2C3E50 (dark blue-gray)
- Border radius: 12px
- Shadow: 0 4px 20px rgba(44, 62, 80, 0.3)
- Label: Uppercase, orange-300, letter-spacing 0.1em
- Text: White, 18px, medium weight

**React Component:**
```tsx
interface KeyInsightsPanelProps {
  label?: string;
  children: React.ReactNode;
  variant?: 'dark' | 'colored' | 'outlined';
  className?: string;
}

const KeyInsightsPanel: React.FC<KeyInsightsPanelProps> = ({
  label = 'Key Insights',
  children,
  variant = 'dark',
  className = '',
}) => {
  const variants = {
    dark: 'bg-[#2C3E50] shadow-[0_4px_20px_rgba(44,62,80,0.3)]',
    colored: 'bg-gradient-to-r from-orange-600 to-[#E85A2C]',
    outlined: 'bg-white/10 border border-white/20 backdrop-blur',
  };

  const labelColors = {
    dark: 'text-orange-300',
    colored: 'text-white/80',
    outlined: 'text-orange-300',
  };

  const textColors = {
    dark: 'text-white',
    colored: 'text-white',
    outlined: 'text-white',
  };

  return (
    <div className={`rounded-xl p-6 ${variants[variant]} ${className}`}>
      <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${labelColors[variant]}`}>
        {label}
      </div>
      <div className={`text-lg font-medium leading-relaxed ${textColors[variant]}`}>
        {children}
      </div>
    </div>
  );
};

export default KeyInsightsPanel;
```

**CSS Implementation:**
```css
.st-insight-panel {
  background: #2C3E50;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(44, 62, 80, 0.3);
}

.st-insight-panel__label {
  font-size: 12px;
  font-weight: 600;
  color: #fdba74;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
}

.st-insight-panel__content {
  font-size: 18px;
  font-weight: 500;
  color: white;
  line-height: 1.5;
}

/* Variants */
.st-insight-panel--colored {
  background: linear-gradient(135deg, #ea580c 0%, #E85A2C 100%);
}

.st-insight-panel--outlined {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
}
```

### 4.2 Glassmorphism Card

**Description:** Frosted glass effect card for content

**Visual Design:**
- Background: rgba(255, 255, 255, 0.85)
- Backdrop filter: blur(12px)
- Border: 1px solid rgba(255, 255, 255, 0.5)
- Border radius: 12px
- Shadow: Glass effect

**React Component:**
```tsx
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  blur?: number;
  opacity?: number;
  border?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  blur = 12,
  opacity = 0.85,
  border = true,
}) => {
  return (
    <div
      className={`
        rounded-xl p-5
        ${border ? 'border border-white/50' : ''}
        ${className}
      `}
      style={{
        background: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        boxShadow: `
          0 4px 6px -1px rgba(0, 0, 0, 0.1),
          0 2px 4px -1px rgba(0, 0, 0, 0.06),
          inset 0 1px 0 rgba(255, 255, 255, 0.6)
        `,
      }}
    >
      {children}
    </div>
  );
};

export default GlassCard;
```

**CSS Implementation:**
```css
.st-glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.st-glass-card--dark {
  background: rgba(12, 10, 9, 0.7);
  border-color: rgba(255, 255, 255, 0.1);
}
```

### 4.3 Metric Card

**Description:** Display key metrics with trend indicators

**Visual Design:**
- Background: White or glass
- Large number (24px+)
- Label below
- Optional trend (up/down/neutral)

**React Component:**
```tsx
interface MetricCardProps {
  value: string | number;
  label: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
    label?: string;
  };
  accent?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const MetricCard: React.FC<MetricCardProps> = ({
  value,
  label,
  trend,
  accent = false,
  size = 'md',
}) => {
  const sizes = {
    sm: { value: 'text-xl', label: 'text-xs' },
    md: { value: 'text-2xl', label: 'text-sm' },
    lg: { value: 'text-4xl', label: 'text-base' },
  };

  const trendColors = {
    up: 'text-emerald-600',
    down: 'text-red-600',
    neutral: 'text-gray-500',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  const s = sizes[size];

  return (
    <div 
      className={`
        rounded-xl p-5
        ${accent 
          ? 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200' 
          : 'bg-white/85 backdrop-blur border border-white/50'}
      `}
    >
      <div className={`${s.value} font-bold ${accent ? 'text-orange-700' : 'text-gray-900'}`}>
        {value}
      </div>
      
      <div className="w-full h-px bg-gray-200 my-2" />
      
      
      <div className={`${s.label} font-medium text-gray-600`}>
        {label}
      </div>
      
      {trend && (
        <div className={`text-xs mt-1 ${trendColors[trend.direction]}`}>
          {trendIcons[trend.direction]} {trend.value}
          {trend.label && <span className="text-gray-400 ml-1">{trend.label}</span>}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
```

### 4.4 Section Header

**Description:** Consistent section headers with underline accent

**React Component:**
```tsx
interface SectionHeaderProps {
  children: React.ReactNode;
  accent?: 'coral' | 'orange' | 'teal';
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  children,
  accent = 'coral',
}) => {
  const accentColors = {
    coral: 'after:bg-[#E85A2C]',
    orange: 'after:bg-orange-500',
    teal: 'after:bg-teal-500',
  };

  return (
    <h3 
      className={`
        text-sm font-semibold text-gray-700 
        relative pb-2 mb-4
        after:content-[''] after:absolute after:bottom-0 after:left-0 
        after:w-8 after:h-0.5 after:rounded-full
        ${accentColors[accent]}
      `}
    >
      {children}
    </h3>
  );
};

export default SectionHeader;
```

### 4.5 Bullet List

**Description:** Custom styled bullet points

**React Component:**
```tsx
interface BulletListProps {
  items: string[];
  variant?: 'default' | 'check' | 'arrow' | 'numbered';
  size?: 'sm' | 'md';
}

const BulletList: React.FC<BulletListProps> = ({
  items,
  variant = 'default',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xs gap-2',
    md: 'text-sm gap-3',
  };

  const renderBullet = (index: number) => {
    switch (variant) {
      case 'check':
        return <span className="text-emerald-500">✓</span>;
      case 'arrow':
        return <span className="text-orange-500">→</span>;
      case 'numbered':
        return (
          <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center flex-shrink-0">
            {index + 1}
          </span>
        );
      default:
        return <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />;
    }
  };

  return (
    <ul className={`flex flex-col ${sizeClasses[size]}`}>
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2 text-gray-600 leading-relaxed">
          {renderBullet(index)}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
};

export default BulletList;
```

**CSS Implementation:**
```css
.st-bullet-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.st-bullet-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
}

.st-bullet-list li::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f97316;
  margin-top: 6px;
  flex-shrink: 0;
}

/* Variants */
.st-bullet-list--check li::before {
  content: '✓';
  width: auto;
  height: auto;
  background: none;
  color: #22c55e;
  font-size: 12px;
  margin-top: 2px;
}

.st-bullet-list--arrow li::before {
  content: '→';
  width: auto;
  height: auto;
  background: none;
  color: #f97316;
  font-size: 12px;
  margin-top: 2px;
}

.st-bullet-list--numbered {
  counter-reset: bullet;
}

.st-bullet-list--numbered li {
  counter-increment: bullet;
}

.st-bullet-list--numbered li::before {
  content: counter(bullet);
  width: 20px;
  height: 20px;
  background: #f97316;
  color: white;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0;
}
```

### 4.6 Chart Container

**Description:** Wrapper for charts with title and source

**React Component:**
```tsx
interface ChartContainerProps {
  title?: string;
  children: React.ReactNode;
  source?: string;
  glass?: boolean;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  children,
  source,
  glass = true,
}) => {
  return (
    <div 
      className={`
        rounded-2xl p-5 h-full flex flex-col
        ${glass 
          ? 'bg-white/85 backdrop-blur border border-white/50' 
          : 'bg-white border border-gray-200'}
      `}
      style={glass ? {
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      } : {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    >
      {title && (
        <h4 className="text-sm font-semibold text-gray-700 mb-4">{title}</h4>
      )}
      
      <div className="flex-1 min-h-0">{children}</div>
      
      {source && (
        <div className="text-xs text-gray-400 mt-3 text-right">
          Source: {source}
        </div>
      )}
    </div>
  );
};

export default ChartContainer;
```

### 4.7 Data Callout Badge

**React Component:**
```tsx
interface DataCalloutProps {
  value: string;
  label?: string;
  trend?: 'up' | 'down' | 'neutral';
  size?: 'sm' | 'md';
}

const DataCallout: React.FC<DataCalloutProps> = ({
  value,
  label,
  trend = 'up',
  size = 'md',
}) => {
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
  };

  const trendColors = {
    up: 'bg-orange-100 text-orange-700',
    down: 'bg-red-100 text-red-700',
    neutral: 'bg-gray-100 text-gray-700',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <div className={`inline-flex flex-col items-center rounded-lg ${sizes[size]} ${trendColors[trend]}`}>
      <span className="font-bold">{trendIcons[trend]} {value}</span>
      {label && <span className="text-xs opacity-75">{label}</span>}
    </div>
  );
};

export default DataCallout;
```

### 4.8 Source Footer

**React Component:**
```tsx
interface SourceFooterProps {
  source: string;
  date?: string;
  pageNumber?: number;
  light?: boolean;
}

const SourceFooter: React.FC<SourceFooterProps> = ({
  source,
  date,
  pageNumber,
  light = true,
}) => {
  return (
    <div className={`flex justify-between items-center text-xs ${light ? 'text-white/60' : 'text-gray-500'}`}>
      <span>
        <span className="font-semibold">Source:</span> {source}
        {date && <span className="ml-1">({date})</span>}
      </span>
      {pageNumber && <span>{pageNumber}</span>}
    </div>
  );
};

export default SourceFooter;
```

### 4.9 Icon Container

**React Component:**
```tsx
interface IconContainerProps {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'coral' | 'orange' | 'teal' | 'dark';
  rounded?: 'md' | 'lg' | 'full';
}

const IconContainer: React.FC<IconContainerProps> = ({
  icon,
  size = 'md',
  variant = 'default',
  rounded = 'lg',
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const variants = {
    default: 'bg-orange-100 text-orange-600',
    coral: 'bg-[#E85A2C]/10 text-[#E85A2C]',
    orange: 'bg-orange-500 text-white',
    teal: 'bg-teal-100 text-teal-600',
    dark: 'bg-[#2C3E50] text-white',
  };

  const roundedStyles = {
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <div className={`${sizes[size]} ${variants[variant]} ${roundedStyles[rounded]} flex items-center justify-center`}>
      <span className={iconSizes[size]}>{icon}</span>
    </div>
  );
};

export default IconContainer;
```

---

## 5. Advanced CSS Techniques

### 5.1 Gradient Backgrounds

```css
/* Warm gradient background */
.bg-gradient-warm {
  background: linear-gradient(135deg, #D35400 0%, #A0522D 50%, #8B4513 100%);
}

/* Cool gradient background */
.bg-gradient-cool {
  background: linear-gradient(135deg, #2C3E50 0%, #34495E 50%, #1a252f 100%);
}

/* Mesh gradient for depth */
.bg-mesh-gradient {
  background:
    radial-gradient(at 40% 20%, rgba(211, 84, 0, 0.15) 0px, transparent 50%),
    radial-gradient(at 80% 0%, rgba(232, 90, 44, 0.1) 0px, transparent 50%),
    radial-gradient(at 0% 50%, rgba(211, 84, 0, 0.1) 0px, transparent 50%),
    radial-gradient(at 80% 50%, rgba(139, 69, 19, 0.08) 0px, transparent 50%),
    #FAFAFA;
}

/* Animated gradient */
@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.bg-gradient-animated {
  background: linear-gradient(
    135deg,
    #D35400,
    #E85A2C,
    #8B4513,
    #D35400
  );
  background-size: 300% 300%;
  animation: gradientShift 8s ease infinite;
}
```

### 5.2 Glassmorphism

```css
/* Standard glass effect */
.glass {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

/* Dark glass */
.glass-dark {
  background: rgba(12, 10, 9, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Glass card with gradient border */
.glass-card-premium {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0.7) 100%
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  position: relative;
}

.glass-card-premium::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.2));
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

### 5.3 Animated Transitions

```css
/* Fade in up */
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

.animate-fade-in-up {
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Fade in scale */
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

.animate-fade-in-scale {
  animation: fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Slide in right */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in-right {
  animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Stagger children */
.stagger-children > * {
  opacity: 0;
  animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 50ms; }
.stagger-children > *:nth-child(3) { animation-delay: 100ms; }
.stagger-children > *:nth-child(4) { animation-delay: 150ms; }
.stagger-children > *:nth-child(5) { animation-delay: 200ms; }

/* Hover lift effect */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* Pulse glow */
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(232, 90, 44, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(232, 90, 44, 0);
  }
}

.animate-pulse-glow {
  animation: pulseGlow 2s ease-in-out infinite;
}

/* Shimmer loading effect */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
}
```

### 5.4 CSS Grid Patterns

```css
/* Dashboard grid */
.grid-dashboard {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto 1fr auto;
  gap: 16px;
}

/* Bento box layout */
.grid-bento {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(120px, auto);
  gap: 16px;
}

.grid-bento > :first-child {
  grid-column: span 2;
  grid-row: span 2;
}

/* Asymmetric layout */
.grid-asymmetric {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto 1fr;
  gap: 24px;
}

.grid-asymmetric > :first-child {
  grid-row: span 2;
}

/* Masonry-like for insights */
.grid-insights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

/* Holy grail layout variant */
.grid-holy-grail {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 24px;
}

.grid-holy-grail__header {
  grid-column: 1 / -1;
}

.grid-holy-grail__footer {
  grid-column: 1 / -1;
}
```

### 5.5 Text Effects

```css
/* Gradient text */
.text-gradient-warm {
  background: linear-gradient(135deg, #E85A2C 0%, #D35400 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-gradient-cool {
  background: linear-gradient(135deg, #2C3E50 0%, #34495E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Text with underline accent */
.text-underline-accent {
  position: relative;
  display: inline;
}

.text-underline-accent::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 3px;
  background: #E85A2C;
  border-radius: 2px;
}

/* Highlight text */
.text-highlight {
  background: linear-gradient(180deg, transparent 60%, rgba(253, 186, 116, 0.4) 60%);
  padding: 0 2px;
}

/* Text shadow for readability on images */
.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Outlined text */
.text-outlined {
  -webkit-text-stroke: 1px currentColor;
  color: transparent;
}
```

### 5.6 Chart Bar Animations

```css
/* Animated bar growth */
@keyframes barGrow {
  from {
    transform: scaleY(0);
    transform-origin: bottom;
  }
  to {
    transform: scaleY(1);
    transform-origin: bottom;
  }
}

.chart-bar-animate {
  animation: barGrow 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.chart-bar-animate:nth-child(1) { animation-delay: 0ms; }
.chart-bar-animate:nth-child(2) { animation-delay: 100ms; }
.chart-bar-animate:nth-child(3) { animation-delay: 200ms; }
.chart-bar-animate:nth-child(4) { animation-delay: 300ms; }

/* Hover effect on bars */
.chart-bar {
  transition: all 0.3s ease;
}

.chart-bar:hover {
  filter: brightness(1.1);
  transform: scaleY(1.02);
}
```

---

## 6. Icon System

### 6.1 Recommended Icon Library: Lucide React

**Why Lucide:**
- Clean, consistent stroke width (1.5px default)
- Modern, professional aesthetic
- Tree-shakeable (only import what you use)
- Active maintenance and growing set
- Perfect match for MBB presentation style

**Installation:**
```bash
npm install lucide-react
```

### 6.2 Icon Sizing Standards

| Size | Pixels | Usage |
|------|--------|-------|
| xs | 14px | Inline with small text |
| sm | 16px | Inline with text, small buttons |
| md | 20px | Form inputs, navigation items |
| lg | 24px | Feature icons, cards |
| xl | 32px | Hero features, empty states |
| 2xl | 48px | Large decorative icons |

### 6.3 Icon Usage Patterns

```tsx
// Icon before text (standard)
import { TrendingUp, Users, DollarSign, Sparkles } from 'lucide-react';

<Button>
  <Sparkles className="w-4 h-4 mr-2" />
  Generate Slide
</Button>

// Icon after text (for navigation/links)
<Link>
  Learn More
  <ArrowRight className="w-4 h-4 ml-1" />
</Link>

// Icon above text (for feature cards)
<div className="flex flex-col items-center">
  <Zap className="w-8 h-8 mb-3 text-orange-500" />
  <span className="text-sm font-medium">Fast Generation</span>
</div>

// Icon with background container
<div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
  <TrendingUp className="w-5 h-5 text-orange-600" />
</div>
```

### 6.4 Icon Color Guidelines

| Context | Color | Usage |
|---------|-------|-------|
| Default | `--gray-500` | Standard icons |
| Muted | `--gray-400` | Secondary icons |
| Primary | `--coral-accent` | Primary action icons |
| Secondary | `--orange-500` | Accent icons |
| Success | `--success-500` | Positive indicators |
| Warning | `--warning-500` | Caution indicators |
| Error | `--error-500` | Error states |
| Info | `--info-500` | Information |
| Inverse | `--white` | On dark backgrounds |

### 6.5 Common Icons for Presentations

```tsx
// Data/Analytics
import { 
  TrendingUp,     // Growth, improvement
  TrendingDown,   // Decline
  BarChart3,      // Charts
  PieChart,       // Distribution
  LineChart,      // Trends
  Activity,       // Metrics
  Target,         // Goals
} from 'lucide-react';

// Business
import {
  DollarSign,     // Revenue, cost
  Users,          // Customers, team
  Building2,      // Company
  Briefcase,      // Business
  Globe,          // Markets
  Landmark,       // Finance
} from 'lucide-react';

// Actions
import {
  Sparkles,       // AI, magic
  Zap,            // Fast, power
  CheckCircle2,   // Complete
  XCircle,        // Error
  AlertCircle,    // Warning
  Info,           // Information
  ArrowRight,     // Navigation
  ChevronRight,   // Navigation
  Download,       // Export
  Share2,         // Share
} from 'lucide-react';

// Content
import {
  Lightbulb,      // Insights
  FileText,       // Documents
  Layout,         // Slides
  Image,          // Visuals
  Type,           // Text
  List,           // Bullets
} from 'lucide-react';
```

---

## 7. Chart Styling

### 7.1 Chart Color Schemes

```javascript
// Primary data visualization palette
const chartColors = {
  primary: '#E85A2C',      // coral-accent
  secondary: '#FFD93D',    // chart-yellow
  tertiary: '#E74C3C',     // chart-orange
  quaternary: '#0d9488',   // teal-600
  neutral: '#64748b',      // insight-500
  muted: '#94a3b8',        // insight-400
  grid: '#e2e8f0',         // insight-200
};

// Sequential scale for gradients
const sequentialColors = [
  '#ffedd5',  // orange-100
  '#fed7aa',  // orange-200
  '#fdba74',  // orange-300
  '#fb923c',  // orange-400
  '#f97316',  // orange-500
  '#ea580c',  // orange-600
];

// Diverging scale (negative to positive)
const divergingColors = {
  negative: ['#991b1b', '#dc2626', '#ef4444', '#f87171'],
  neutral: '#94a3b8',
  positive: ['#22c55e', '#16a34a', '#15803d', '#166534'],
};
```

### 7.2 Chart.js Custom Configuration

```javascript
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      align: 'center',
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
        font: {
          family: 'Inter',
          size: 12,
          weight: 500,
        },
        color: '#64748b',
      },
    },
    title: {
      display: true,
      text: 'Chart Title with Insight',
      font: {
        family: 'Inter',
        size: 14,
        weight: 600,
      },
      color: '#334155',
      padding: { top: 0, bottom: 16 },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleFont: { 
        family: 'Inter', 
        size: 13,
        weight: 600,
      },
      bodyFont: { 
        family: 'Inter', 
        size: 12,
        weight: 400,
      },
      padding: 12,
      cornerRadius: 8,
      displayColors: true,
      usePointStyle: true,
    },
  },
  scales: {
    x: {
      grid: {
        color: 'transparent',
        drawBorder: false,
      },
      ticks: {
        font: { 
          family: 'Inter', 
          size: 11,
          weight: 500,
        },
        color: '#64748b',
      },
    },
    y: {
      grid: {
        color: '#f1f5f9',
        drawBorder: false,
      },
      ticks: {
        font: { 
          family: 'Inter', 
          size: 11,
          weight: 400,
        },
        color: '#94a3b8',
        callback: (value) => {
          // Format large numbers
          if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
          return value;
        },
      },
    },
  },
  animation: {
    duration: 800,
    easing: 'easeOutQuart',
  },
};

// Bar chart data with gradient fills
const barChartData = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [{
    label: 'Revenue',
    data: [10, 15, 18, 23],
    backgroundColor: [
      createGradient('#E74C3C', '#C0392B'),  // Orange for Q1
      createGradient('#FFD93D', '#F4D03F'),  // Yellow for Q2
      createGradient('#E74C3C', '#C0392B'),  // Orange for Q3
      createGradient('#E85A2C', '#D35400'),  // Coral for Q4
    ],
    borderRadius: 8,
    borderSkipped: false,
  }],
};

// Helper to create gradients
function createGradient(color1, color2) {
  const ctx = document.createElement('canvas').getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
}
```

### 7.3 Recharts Custom Styling

```tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Label,
} from 'recharts';

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-sm">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Styled bar chart
const StyledBarChart = ({ data }) => {
  const colors = {
    yellow: ['#FFD93D', '#F4D03F'],
    orange: ['#E74C3C', '#C0392B'],
    coral: ['#E85A2C', '#D35400'],
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart 
        data={data} 
        margin={{ top: 30, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          {Object.entries(colors).map(([key, [start, end]]) => (
            <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={start} />
              <stop offset="100%" stopColor={end} />
            </linearGradient>
          ))}
        </defs>
        
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="#f1f5f9" 
          vertical={false} 
        />
        
        <XAxis 
          dataKey="name" 
          axisLine={false}
          tickLine={false}
          tick={{ 
            fill: '#64748b', 
            fontSize: 11,
            fontWeight: 500,
          }}
        />
        
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ 
            fill: '#94a3b8', 
            fontSize: 11,
          }}
          tickFormatter={(value) => `$${value}M`}
        />
        
        <Tooltip content={<CustomTooltip />} />
        
        <Bar 
          dataKey="value" 
          radius={[8, 8, 0, 0]}
          barSize={48}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={`url(#gradient-${entry.color})`}
            />
          ))}
          <LabelList 
            dataKey="value" 
            position="top" 
            fill="#334155"
            fontSize={12}
            fontWeight={600}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
```

### 7.4 Chart Annotations and Callouts

```css
/* Chart annotation */
.chart-annotation {
  position: absolute;
  background: rgba(253, 186, 116, 0.9);
  border: 1px solid rgba(251, 146, 60, 0.5);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #7c2d12;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-annotation::before {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(251, 146, 60, 0.5);
}

/* Data callout on chart */
.chart-callout {
  position: absolute;
  background: #0f172a;
  color: white;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

/* Chart trend line */
.chart-trend-line {
  stroke: #E85A2C;
  stroke-width: 2;
  stroke-dasharray: 5, 5;
}

/* Chart target line */
.chart-target-line {
  stroke: #22c55e;
  stroke-width: 2;
}
```

### 7.5 Number Formatting Utilities

```javascript
// Number formatting utilities
const formatNumber = {
  // Currency: $1.2M
  currency: (value, decimals = 1) => {
    if (Math.abs(value) >= 1000000000) {
      return `$${(value / 1000000000).toFixed(decimals)}B`;
    }
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(decimals)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(decimals)}K`;
    }
    return `$${value.toFixed(decimals)}`;
  },
  
  // Percentage: 45.2%
  percent: (value, decimals = 1) => 
    `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`,
  
  // Compact: 1.2K, 1.2M, 1.2B
  compact: (value, decimals = 1) => {
    if (Math.abs(value) >= 1000000000) {
      return `${(value / 1000000000).toFixed(decimals)}B`;
    }
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(decimals)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(decimals)}K`;
    }
    return value.toString();
  },
  
  // Full number with commas: 1,234,567
  full: (value) => 
    value.toLocaleString(),
};
```

---

## 8. Framework Recommendations

### 8.1 Recommended Stack

| Layer | Technology | Alternative | Recommendation |
|-------|------------|-------------|----------------|
| **Framework** | Next.js 14+ | Remix | Next.js with App Router |
| **Styling** | Tailwind CSS | CSS Modules | Tailwind for rapid development |
| **Components** | shadcn/ui | Radix UI | shadcn/ui (copy-paste) |
| **Icons** | Lucide React | Phosphor | Lucide for consistency |
| **Charts** | Recharts | Chart.js | Recharts for React integration |
| **Animations** | Framer Motion | GSAP | Framer Motion for React |
| **Fonts** | Google Fonts | Self-hosted | Inter + Montserrat |

### 8.2 Tailwind CSS Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Orange scale
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // Insight colors
        insight: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          dark: '#2C3E50',
        },
        // Coral accent
        coral: {
          DEFAULT: '#E85A2C',
          50: '#fef3ef',
          100: '#fde4db',
          200: '#fac5b6',
          300: '#f69d86',
          400: '#f06a52',
          500: '#E85A2C',
          600: '#da4520',
          700: '#b6361c',
          800: '#922f1c',
          900: '#762b1b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'slide-title': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'slide-subtitle': ['14px', { lineHeight: '1.5' }],
        'insight-label': ['12px', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.1em' }],
        'insight-text': ['18px', { lineHeight: '1.5', fontWeight: '500' }],
      },
      spacing: {
        'slide-x': '40px',
        'slide-y': '32px',
        'slide-gap': '24px',
      },
      borderRadius: {
        'slide': '12px',
        'chart': '16px',
      },
      boxShadow: {
        'insight': '0 4px 20px rgba(44, 62, 80, 0.3)',
        'glass': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        'chart': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #D35400 0%, #A0522D 50%, #8B4513 100%)',
        'gradient-cool': 'linear-gradient(135deg, #2C3E50 0%, #34495E 50%, #1a252f 100%)',
        'gradient-chart-yellow': 'linear-gradient(180deg, #FFD93D 0%, #F4D03F 100%)',
        'gradient-chart-orange': 'linear-gradient(180deg, #E74C3C 0%, #C0392B 100%)',
        'gradient-chart-coral': 'linear-gradient(180deg, #E85A2C 0%, #D35400 100%)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-scale': 'fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInScale: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(232, 90, 44, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(232, 90, 44, 0)' },
        },
      },
    },
  },
  plugins: [],
};
```

### 8.3 shadcn/ui Setup

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Add components
npx shadcn-ui@latest add button card dialog badge separator

# Customize button for coral theme
# components/ui/button.tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-coral text-white hover:bg-coral-600',
        secondary: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
        ghost: 'hover:bg-orange-50',
        outline: 'border border-gray-200 hover:bg-gray-50',
      },
    },
  }
);
```

### 8.4 Package.json Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0",
    
    "lucide-react": "^0.300.0",
    "recharts": "^2.10.0",
    "framer-motion": "^10.16.0",
    
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "class-variance-authority": "^0.7.0",
    
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 9. Implementation Guide

### 9.1 Phase 1: Foundation (Day 1)

**Tasks:**
- [ ] Install Tailwind CSS with custom config
- [ ] Set up CSS variables in globals.css
- [ ] Import Inter and Montserrat fonts
- [ ] Install Lucide React icons
- [ ] Install Recharts
- [ ] Set up shadcn/ui

**Files to Create:**
```
app/
├── globals.css          # CSS variables + custom styles
├── layout.tsx           # Font imports
├── components/
│   ├── KeyInsightsPanel.tsx
│   ├── GlassCard.tsx
│   ├── MetricCard.tsx
│   └── BulletList.tsx
├── lib/
│   ├── utils.ts         # cn() helper
│   └── format.ts        # Number formatting
└── styles/
    └── slides.css       # Slide-specific styles
```

### 9.2 Phase 2: Core Components (Day 2)

**Tasks:**
- [ ] Build KeyInsightsPanel component
- [ ] Build GlassCard component
- [ ] Build MetricCard component
- [ ] Build SectionHeader component
- [ ] Build BulletList component with variants
- [ ] Build ChartContainer component
- [ ] Create layout patterns (KeyInsights, TwoColumn, etc.)

**Testing:**
- [ ] Verify all components render correctly
- [ ] Check responsive behavior
- [ ] Verify color contrast (WCAG AA)

### 9.3 Phase 3: Chart Enhancement (Day 3)

**Tasks:**
- [ ] Configure Recharts with custom theme
- [ ] Create gradient bar fills
- [ ] Add data callouts and annotations
- [ ] Implement number formatting
- [ ] Add chart animations
- [ ] Build ChartWrapper component

**Testing:**
- [ ] Test with various data sets
- [ ] Verify tooltip styling
- [ ] Check animation performance

### 9.4 Phase 4: Slide Templates (Day 4)

**Tasks:**
- [ ] Build KeyInsightsLayout template
- [ ] Build TwoColumnLayout template
- [ ] Build ThreeColumnLayout template
- [ ] Build ChartHeavyLayout template
- [ ] Build TitleSlideLayout template
- [ ] Create slide preview component

**Testing:**
- [ ] Test all layout variations
- [ ] Verify content flow
- [ ] Check spacing consistency

### 9.5 Phase 5: Integration (Day 5)

**Tasks:**
- [ ] Integrate with SlideTheory backend
- [ ] Update HTML output generation
- [ ] Add export functionality (PDF, PPTX)
- [ ] Implement slide preview
- [ ] Add animation on slide load

**Testing:**
- [ ] End-to-end testing
- [ ] Cross-browser testing
- [ ] Mobile responsiveness check
- [ ] Performance optimization

### 9.6 Migration Strategy

**From Current to New Design:**

```typescript
// Before (Current)
const generateSlideHTML = (content) => {
  return `
    <div style="padding: 20px; font-family: Arial;">
      <h1 style="color: #333;">${content.title}</h1>
      <div style="border-left: 4px solid #3B82F6; padding-left: 12px;">
        ${content.insight}
      </div>
    </div>
  `;
};

// After (New Design)
const generateSlideHTML = (content) => {
  return `
    <div class="layout-key-insights">
      <h1 class="layout-key-insights__title">${content.title}</h1>
      <div class="st-insight-panel">
        <div class="st-insight-panel__label">Key Insights</div>
        <div class="st-insight-panel__content">${content.insight}</div>
      </div>
      ...
    </div>
  `;
};
```

### 9.7 Quality Checklist

**Visual Quality:**
- [ ] Colors match design tokens exactly
- [ ] Typography follows the scale
- [ ] Spacing uses 4px grid consistently
- [ ] Shadows and depth are applied appropriately
- [ ] Glassmorphism effects render correctly

**Content Quality:**
- [ ] Action titles are complete sentences with insights
- [ ] MECE structure is followed
- [ ] All charts have source citations
- [ ] Number formatting is consistent
- [ ] Icons are appropriate and sized correctly

**Technical Quality:**
- [ ] All components are TypeScript-typed
- [ ] Responsive behavior works
- [ ] Animations are smooth (60fps)
- [ ] Reduced motion preferences respected
- [ ] Color contrast meets WCAG AA

**Performance:**
- [ ] First load under 2 seconds
- [ ] Slide generation under 500ms
- [ ] No layout shift on load
- [ ] Images optimized
- [ ] Fonts preloaded

---

## Appendix: Design Tokens Reference

### Complete CSS Variables

```css
:root {
  /* ============================================
     COLORS
     ============================================ */
  
  /* Orange */
  --orange-50: #fff7ed;
  --orange-100: #ffedd5;
  --orange-200: #fed7aa;
  --orange-300: #fdba74;
  --orange-400: #fb923c;
  --orange-500: #f97316;
  --orange-600: #ea580c;
  --orange-700: #c2410c;
  --orange-800: #9a3412;
  --orange-900: #7c2d12;
  --orange-950: #431407;
  
  /* Coral accent */
  --coral: #E85A2C;
  --coral-light: #f69d86;
  --coral-dark: #da4520;
  
  /* Insight */
  --insight-50: #f8fafc;
  --insight-100: #f1f5f9;
  --insight-200: #e2e8f0;
  --insight-300: #cbd5e1;
  --insight-400: #94a3b8;
  --insight-500: #64748b;
  --insight-600: #475569;
  --insight-700: #334155;
  --insight-800: #1e293b;
  --insight-900: #0f172a;
  --insight-dark: #2C3E50;
  
  /* Chart */
  --chart-yellow: #FFD93D;
  --chart-orange: #E74C3C;
  --chart-coral: #E85A2C;
  --chart-teal: #14b8a6;
  
  /* Gray */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  
  /* Semantic */
  --success-50: #f0fdf4;
  --success-500: #22c55e;
  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --error-50: #fef2f2;
  --error-500: #ef4444;
  --info-50: #f0f9ff;
  --info-500: #0ea5e9;
  
  /* ============================================
     TYPOGRAPHY
     ============================================ */
  
  --font-display: 'Montserrat', 'Inter', sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  --text-display: 48px;
  --text-h1: 32px;
  --text-h2: 24px;
  --text-h3: 20px;
  --text-h4: 18px;
  --text-body-lg: 18px;
  --text-body: 16px;
  --text-body-sm: 14px;
  --text-caption: 12px;
  --text-overline: 11px;
  
  /* ============================================
     SPACING
     ============================================ */
  
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  
  --slide-padding-x: 40px;
  --slide-padding-y: 32px;
  --slide-gap: 24px;
  
  /* ============================================
     BORDERS
     ============================================ */
  
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-full: 9999px;
  
  /* ============================================
     SHADOWS
     ============================================ */
  
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
  
  --shadow-insight: 0 4px 20px rgba(44, 62, 80, 0.3);
  --shadow-glass: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6);
  --shadow-chart: 0 8px 24px rgba(0, 0, 0, 0.12);
  
  --glow-orange: 0 0 20px rgba(232, 90, 44, 0.3);
  --glow-yellow: 0 0 20px rgba(255, 217, 61, 0.3);
  
  /* ============================================
     GRADIENTS
     ============================================ */
  
  --gradient-warm: linear-gradient(135deg, #D35400 0%, #A0522D 50%, #8B4513 100%);
  --gradient-cool: linear-gradient(135deg, #2C3E50 0%, #34495E 100%);
  --gradient-chart-yellow: linear-gradient(180deg, #FFD93D 0%, #F4D03F 100%);
  --gradient-chart-orange: linear-gradient(180deg, #E74C3C 0%, #C0392B 100%);
  --gradient-chart-coral: linear-gradient(180deg, #E85A2C 0%, #D35400 100%);
  
  /* Glassmorphism */
  --glass-white: rgba(255, 255, 255, 0.85);
  --glass-border: rgba(255, 255, 255, 0.5);
}
```

---

*This document is a living specification. Update as the design system evolves.*

**Version:** 4.0 - Complete Implementation Guide  
**Last Updated:** 2026-02-07  
**Maintained by:** SlideTheory Design Team  
**Next Review:** 2026-03-07
