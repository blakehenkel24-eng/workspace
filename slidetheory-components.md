# SlideTheory Component Library

> Production-ready React components for Next.js 14 + Tailwind CSS + shadcn/ui

---

## 1. HeroSection

**Purpose:** Primary landing hero with multiple layout variations (centered, split, gradient background).

```typescript
interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  variant?: 'centered' | 'split' | 'gradient' | 'minimal';
  showGradientBg?: boolean;
  children?: React.ReactNode; // For custom content
}
```

**Key Tailwind Classes:**
```
/* Container */
relative min-h-[80vh] flex items-center justify-center overflow-hidden

/* Variants */
// centered: text-center max-w-4xl mx-auto px-6
// split: grid lg:grid-cols-2 gap-12 items-center px-6 lg:px-16
// gradient: bg-gradient-to-br from-primary/10 via-background to-background

/* Typography */
text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight
text-lg md:text-xl text-muted-foreground max-w-2xl

/* CTAs */
inline-flex items-center gap-2 px-6 py-3 rounded-full
```

**Code Structure:**
```tsx
export function HeroSection({
  variant = 'centered',
  showGradientBg = true,
  ...props
}: HeroSectionProps) {
  const variants = {
    centered: 'text-center flex-col',
    split: 'grid lg:grid-cols-2 gap-12',
    // ...
  };
  
  return (
    <section className={cn("relative", variants[variant])}>
      {showGradientBg && <div className="absolute inset-0 -z-10 bg-gradient-to-br ..." />}
      {/* Content based on variant */}
    </section>
  );
}
```

---

## 2. FeatureBento

**Purpose:** Bento grid layout for feature showcases with varying card sizes.

```typescript
interface FeatureBentoProps {
  features: Array<{
    id: string;
    title: string;
    description: string;
    icon?: React.ComponentType;
    size?: 'small' | 'medium' | 'large' | 'wide';
    image?: string;
    color?: 'default' | 'primary' | 'muted';
  }>;
  columns?: 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}
```

**Key Tailwind Classes:**
```
/* Grid */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6
auto-rows-[minmax(180px,auto)]

/* Card Sizes */
small: col-span-1 row-span-1
medium: col-span-1 row-span-2
large: col-span-2 row-span-2
wide: col-span-2 row-span-1

/* Card Styling */
rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1
relative overflow-hidden group

/* Color Variants */
default: bg-card border-border
primary: bg-primary/5 border-primary/20
muted: bg-muted border-transparent
```

---

## 3. FeatureList

**Purpose:** Vertical list of features with icons, alternating layout option.

```typescript
interface FeatureListProps {
  features: Array<{
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }>;
  layout?: 'stacked' | 'alternating' | 'cards';
  iconPosition?: 'left' | 'top' | 'centered';
  showDividers?: boolean;
}
```

**Key Tailwind Classes:**
```
/* Container */
space-y-12 lg:space-y-16

/* Alternating Layout */
flex flex-col lg:flex-row even:lg:flex-row-reverse gap-8 lg:gap-16 items-center

/* Icon Container */
flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center

/* Stacked Variant */
space-y-4 max-w-xl
```

---

## 4. TestimonialCarousel

**Purpose:** Horizontal scrolling testimonials with auto-play and manual controls.

```typescript
interface TestimonialCarouselProps {
  testimonials: Array<{
    id: string;
    quote: string;
    author: { name: string; role: string; company: string; avatar?: string };
    rating?: number;
  }>;
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  cardsPerView?: 1 | 2 | 3;
}
```

**Key Tailwind Classes:**
```
/* Container */
relative overflow-hidden

/* Track */
flex transition-transform duration-500 ease-out

/* Card */
flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-3
rounded-2xl border bg-card p-8

/* Navigation */
absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background shadow-lg
flex items-center justify-center hover:bg-muted transition-colors
```

---

## 5. PricingCard

**Purpose:** Individual pricing tier card with feature list and CTA.

```typescript
interface PricingCardProps {
  tier: {
    name: string;
    description?: string;
    price: { monthly: number; yearly: number } | 'custom';
    features: Array<{ text: string; included: boolean }>;
    cta: { label: string; href: string; variant?: 'default' | 'outline' };
    badge?: string;
    highlighted?: boolean;
  };
  billingPeriod: 'monthly' | 'yearly';
  currency?: string;
}
```

**Key Tailwind Classes:**
```
/* Container */
relative rounded-2xl border p-6 lg:p-8 flex flex-col

/* Highlighted State */
border-primary shadow-lg shadow-primary/10 scale-105 z-10

/* Badge */
absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full
bg-primary text-primary-foreground text-xs font-medium

/* Price */
text-4xl font-bold tracking-tight
text-muted-foreground text-base font-normal

/* Feature List */
space-y-3 flex-1
flex items-center gap-3 text-sm
icon: w-5 h-5 text-primary (included) / text-muted-foreground (excluded)
```

---

## 6. PricingGrid

**Purpose:** Container for multiple pricing tiers with toggle and comparison.

```typescript
interface PricingGridProps {
  tiers: PricingCardProps['tier'][];
  defaultPeriod?: 'monthly' | 'yearly';
  showToggle?: boolean;
  showComparison?: boolean;
  columns?: 2 | 3 | 4;
}
```

**Key Tailwind Classes:**
```
/* Grid */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start

/* Toggle */
inline-flex items-center gap-3 p-1 rounded-full bg-muted
w-12 h-6 rounded-full bg-primary transition-colors relative
```

---

## 7. SiteHeader

**Purpose:** Sticky navigation header with mobile menu and scroll behavior.

```typescript
interface SiteHeaderProps {
  logo?: React.ReactNode;
  navItems: Array<{ label: string; href: string; external?: boolean }>;
  cta?: { label: string; href: string };
  showSearch?: boolean;
  variant?: 'default' | 'transparent' | 'floating';
  sticky?: boolean;
}
```

**Key Tailwind Classes:**
```
/* Container */
fixed top-0 left-0 right-0 z-50 transition-all duration-300
h-16 lg:h-20

/* Scroll State (handled via hook) */
scroll: bg-background/80 backdrop-blur-xl border-b

/* Floating Variant */
mx-4 mt-4 rounded-2xl border bg-background/95 backdrop-blur-xl

/* Mobile Menu */
fixed inset-0 top-16 bg-background z-40 p-6 flex flex-col gap-4
lg:hidden transform transition-transform
```

---

## 8. SectionHeader

**Purpose:** Reusable section title + subtitle component with alignment options.

```typescript
interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  size?: 'sm' | 'md' | 'lg';
  maxWidth?: 'sm' | 'md' | 'lg' | 'full';
  children?: React.ReactNode;
}
```

**Key Tailwind Classes:**
```
/* Container */
text-center / text-left / text-right
max-w-2xl / max-w-3xl mx-auto

/* Eyebrow */
text-sm font-medium text-primary uppercase tracking-wider

/* Title Sizes */
sm: text-2xl font-semibold
md: text-3xl md:text-4xl font-bold
lg: text-4xl md:text-5xl font-bold tracking-tight

/* Subtitle */
text-lg text-muted-foreground mt-4
```

---

## 9. Footer

**Purpose:** Multi-column footer with links, social icons, and newsletter.

```typescript
interface FooterProps {
  columns: Array<{
    title: string;
    links: Array<{ label: string; href: string; external?: boolean }>;
  }>;
  socialLinks?: Array<{ icon: React.ComponentType; href: string; label: string }>;
  newsletter?: { title: string; placeholder: string; buttonLabel: string };
  logo?: React.ReactNode;
  copyright: string;
  variant?: 'simple' | 'multi-column' | 'with-newsletter';
}
```

**Key Tailwind Classes:**
```
/* Container */
border-t bg-muted/30 mt-auto

/* Grid */
grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 py-12 lg:py-16

/* Newsletter */
md:col-span-2 lg:col-span-2
flex gap-2 max-w-sm

/* Bottom Bar */
flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t
```

---

## 10. LogoCloud

**Purpose:** Trusted by/logos section with grayscale hover effect.

```typescript
interface LogoCloudProps {
  title?: string;
  logos: Array<{ name: string; src: string; href?: string }>;
  columns?: 4 | 5 | 6;
  grayscale?: boolean;
  animate?: 'static' | 'scroll' | 'fade';
}
```

**Key Tailwind Classes:**
```
/* Container */
py-12 lg:py-16 border-y

/* Grid */
grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center

/* Logo Styling */
opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0
max-h-8 w-auto object-contain

/* Scroll Animation */
flex animate-scroll gap-16 hover:[animation-play-state:paused]
```

---

## Utility Hooks

### useScrollPosition
```typescript
export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return { scrollY, isScrolled };
}
```

### useMediaQuery
```typescript
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  
  return matches;
}
```

---

## Tailwind Configuration Additions

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'scroll': 'scroll 30s linear infinite',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
}
```

---

## File Structure Recommendation

```
app/
├── components/
│   ├── layout/
│   │   ├── SiteHeader.tsx
│   │   └── Footer.tsx
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── FeatureBento.tsx
│   │   ├── FeatureList.tsx
│   │   ├── TestimonialCarousel.tsx
│   │   ├── PricingCard.tsx
│   │   ├── PricingGrid.tsx
│   │   └── LogoCloud.tsx
│   └── ui/
│       └── (shadcn components)
├── hooks/
│   ├── useScrollPosition.ts
│   └── useMediaQuery.ts
└── lib/
    └── utils.ts (cn helper)
```

---

## Usage Examples

### Hero + Features Combo
```tsx
<HeroSection
  title="Build stunning presentations"
  subtitle="AI-powered slides that convert"
  variant="split"
  ctaPrimary={{ label: "Get Started", href: "/signup" }}
/>

<SectionHeader
  eyebrow="Features"
  title="Everything you need"
  subtitle="Powerful tools designed for modern teams"
  align="center"
/>

<FeatureBento features={features} columns={3} />
```

### Pricing Page
```tsx
<SectionHeader
  title="Simple, transparent pricing"
  subtitle="Choose the plan that's right for you"
  align="center"
/>

<PricingGrid
  tiers={pricingTiers}
  showToggle
  defaultPeriod="yearly"
  columns={3}
/>
```

---

*All components use `cn()` utility for class merging and support `className` prop for overrides.*
