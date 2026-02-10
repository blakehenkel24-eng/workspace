# SlideTheory Landing Page Components

A collection of production-ready React components for building modern SaaS landing pages.

## Stack
- **Next.js 14**
- **React + TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Framer Motion** (animations)
- **Lucide React** (icons)

## Color Scheme
- **Primary (Teal):** `#0D9488`
- **Accent (Orange):** `#F97316`

---

## Components

### 1. HeroSection
Eye-catching hero with gradient backgrounds, CTAs, and social proof.

```tsx
import { HeroSection } from "@/components";

<HeroSection
  title="Build Better"
  titleHighlight="Presentations"
  description="Create stunning slides in minutes with AI-powered design tools."
  primaryCta={{ label: "Get Started Free", href: "/signup" }}
  secondaryCta={{ label: "Watch Demo", href: "/demo" }}
  showVideoButton={true}
/>
```

### 2. FeaturesGrid
Responsive feature cards with icons and hover effects.

```tsx
import { FeaturesGrid } from "@/components";
import { Zap, Shield, BarChart, Users } from "lucide-react";

<FeaturesGrid
  eyebrow="Features"
  title="Everything You Need"
  description="Powerful features to help you create amazing presentations."
  columns={3}
  features={[
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate slides in seconds, not hours.",
      color: "teal",
    },
    {
      icon: Shield,
      title: "Secure by Default",
      description: "Enterprise-grade security for your data.",
      color: "orange",
    },
  ]}
/>
```

### 3. CTASection
Call-to-action section with multiple variants.

```tsx
import { CTASection } from "@/components";

<CTASection
  variant="gradient" // default | gradient | dark | split
  badge="Limited Time Offer"
  title="Ready to Transform Your Presentations?"
  description="Join thousands of professionals who trust SlideTheory."
  primaryCta={{ label: "Start Free Trial", href: "/trial" }}
  secondaryCta={{ label: "Contact Sales", href: "/sales" }}
/>
```

### 4. TestimonialsSection
Customer testimonials with ratings and avatars.

```tsx
import { TestimonialsSection } from "@/components";

<TestimonialsSection
  eyebrow="Testimonials"
  title="Loved by Teams Everywhere"
  variant="grid" // grid | featured
  testimonials={[
    {
      quote: "This tool transformed our presentation workflow completely.",
      author: "Sarah Chen",
      role: "Design Lead",
      company: "TechCorp",
      rating: 5,
    },
  ]}
/>
```

### 5. PricingSection
Pricing tiers with feature comparison.

```tsx
import { PricingSection } from "@/components";

<PricingSection
  eyebrow="Pricing"
  title="Simple, Transparent Pricing"
  tiers={[
    {
      name: "Starter",
      price: "$0",
      period: "/month",
      description: "For individuals getting started",
      features: [
        { text: "5 presentations", included: true },
        { text: "Export to PDF", included: false },
      ],
      cta: { label: "Get Started", href: "/signup" },
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "For growing teams",
      features: [
        { text: "Unlimited presentations", included: true },
      ],
      cta: { label: "Start Free Trial", href: "/trial" },
      popular: true,
      badge: "Most Popular",
    },
  ]}
/>
```

### 6. FAQSection
Accordion-style FAQ with smooth animations.

```tsx
import { FAQSection } from "@/components";

<FAQSection
  eyebrow="FAQ"
  title="Frequently Asked Questions"
  variant="default" // default | cards
  items={[
    {
      question: "How does the free trial work?",
      answer: "Start with a 14-day free trial with full access...",
    },
  ]}
/>
```

### 7. NewsletterSection
Email capture with multiple layout options.

```tsx
import { NewsletterSection } from "@/components";

// Default stacked layout
<NewsletterSection variant="default" />

// Inline banner layout
<NewsletterSection variant="inline" />

// Card centered layout
<NewsletterSection variant="card" />
```

### 8. LogoCloud
Trust indicators with partner/customer logos.

```tsx
import { LogoCloud } from "@/components";

<LogoCloud
  eyebrow="Trusted by"
  title="Industry Leaders"
  variant="grayscale" // default | grayscale | dark
  columns={5}
  logos={[
    { name: "Acme Inc", src: "/logos/acme.svg" },
    { name: "TechCorp" }, // text fallback
  ]}
/>
```

### 9. StatsSection
Key metrics display with animated counters.

```tsx
import { StatsSection } from "@/components";

<StatsSection
  eyebrow="Our Impact"
  title="Trusted by Thousands"
  variant="cards" // default | cards | dark
  stats={[
    { value: "10K", label: "Active Users", suffix: "+" },
    { value: "500", label: "Presentations", suffix: "+" },
    { value: "99", label: "Satisfaction", suffix: "%" },
    { value: "24/7", label: "Support" },
  ]}
/>
```

### 10. Navbar
Responsive navigation with mobile menu.

```tsx
import { Navbar } from "@/components";

<Navbar
  logo="SlideTheory"
  links={[
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "About", href: "#about" },
  ]}
  cta={{ label: "Get Started", href: "/signup" }}
  variant="default" // default | transparent | dark
/>
```

### 11. Footer
Multi-column footer with social links.

```tsx
import { Footer } from "@/components";

<Footer
  logo="SlideTheory"
  description="Create stunning presentations with AI-powered design tools."
  columns={[
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
      ],
    },
  ]}
  socialLinks={{
    twitter: "https://twitter.com/slidetheory",
    github: "https://github.com/slidetheory",
    linkedin: "https://linkedin.com/company/slidetheory",
  }}
/>
```

### 12. SplitContent
Two-column layout for feature highlights.

```tsx
import { SplitContent } from "@/components";
import { Zap, Shield } from "lucide-react";

<SplitContent
  eyebrow="Features"
  title="Everything You Need to Create Amazing Presentations"
  description="Our AI-powered platform helps you create professional presentations."
  imageSrc="/images/feature.png"
  imagePosition="right" // left | right
  features={[
    { icon: Zap, title: "Lightning Fast", description: "Generate slides in seconds" },
    { icon: Shield, title: "Secure", description: "Enterprise-grade security" },
  ]}
  cta={{ label: "Learn more", href: "#" }}
/>
```

---

## Installation

1. Copy all component files to your `/components` folder
2. Import from the index: `import { HeroSection, FeaturesGrid } from "@/components"`
3. Ensure you have the required dependencies:

```bash
npm install framer-motion lucide-react
```

## Dependencies Required

```json
{
  "dependencies": {
    "framer-motion": "^11.x",
    "lucide-react": "^0.x"
  }
}
```

## Customization

All components use Tailwind CSS classes and accept props for customization:
- **Colors:** Change `bg-[#0D9488]` to your brand color
- **Spacing:** Modify `py-20 lg:py-32` for section padding
- **Typography:** Adjust `text-3xl sm:text-4xl` for heading sizes

---

## Full Page Example

```tsx
import {
  Navbar,
  HeroSection,
  LogoCloud,
  FeaturesGrid,
  SplitContent,
  TestimonialsSection,
  PricingSection,
  FAQSection,
  CTASection,
  Footer,
} from "@/components";

export default function LandingPage() {
  return (
    <>
      <Navbar
        links={[
          { label: "Features", href: "#features" },
          { label: "Pricing", href: "#pricing" },
        ]}
      />
      
      <HeroSection
        title="Build Better"
        titleHighlight="Presentations"
        description="Create stunning slides in minutes."
      />
      
      <LogoCloud
        eyebrow="Trusted by"
        logos={[{ name: "Company 1" }, { name: "Company 2" }]}
      />
      
      <FeaturesGrid
        id="features"
        title="Features"
        features={[...]}
      />
      
      <PricingSection
        id="pricing"
        title="Pricing"
        tiers={[...]}
      />
      
      <CTASection
        variant="gradient"
        title="Ready to get started?"
      />
      
      <Footer columns={[...]} />
    </>
  );
}
```
