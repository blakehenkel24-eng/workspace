# SlideTheory Landing Page - Animation & Interaction Design Spec

> **Goal:** Create a premium, polished feel through delightful micro-interactions that enhance without distracting.
> **Performance Target:** Consistent 60fps across all animations
> **Mobile Strategy:** Graceful fallbacks and reduced motion support

---

## 📦 Library Recommendations

### Primary Stack
| Library | Use Case | Size | Notes |
|---------|----------|------|-------|
| **Framer Motion** | Primary animation library | ~38kb gzipped | React-native, excellent for gestures & layout |
| **GSAP + ScrollTrigger** | Complex scroll sequences | ~25kb core + plugins | Best for timeline-based animations |

### CSS-Only Approach
For maximum performance, these animations can be implemented with CSS only:
- `@keyframes` for simple reveals
- `transform` and `opacity` for all transitions (GPU accelerated)
- `will-change` sparingly applied
- `prefers-reduced-motion` media query support

### Recommendation
**Start with Framer Motion** for React projects - it provides the best balance of:
- Declarative API
- Built-in gesture support
- Layout animations
- AnimatePresence for mount/unmount
- Reduced motion awareness

---

## 🎬 Animation Concepts (8 Total)

---

### 1. Staggered Fade-Up Reveal (Scroll-Triggered)
**Purpose:** Hero section and feature cards entrance

**Effect:**
- Elements fade in from `opacity: 0, y: 40px` to `opacity: 1, y: 0`
- Stagger delay: 100ms between siblings
- Duration: 600ms
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-expo)

**Trigger:**
- Intersection Observer at 20% visibility
- Once per session (no re-trigger on scroll up)

**Implementation (Framer Motion):**
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// Usage
<motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
  <motion.div variants={itemVariants}>Item 1</motion.div>
  <motion.div variants={itemVariants}>Item 2</motion.div>
</motion.div>
```

**Mobile Fallback:**
- Reduce distance to `y: 20px`
- Slightly faster duration (400ms)

---

### 2. Magnetic Button Effect (Cursor-Following)
**Purpose:** Primary CTA buttons that feel responsive and premium

**Effect:**
- Button subtly follows cursor within 20px radius
- Movement is elastic and dampened
- Returns to center when cursor leaves
- Scale: 1.02x on hover

**Implementation (Framer Motion + Custom Hook):**
```tsx
const MagneticButton = ({ children }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    
    setPosition({
      x: distanceX * 0.15, // 15% of distance, max ~20px
      y: distanceY * 0.15
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 350, damping: 15, mass: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      {children}
    </motion.button>
  );
};
```

**Mobile Fallback:**
- Disable magnetic effect on touch devices
- Keep scale animation on tap
- Use `@media (hover: hover)` to conditionally enable

---

### 3. Gradient Text Shimmer (Text Animation)
**Purpose:** Headlines that catch attention without being obnoxious

**Effect:**
- Gradient flows across text from left to right
- Duration: 3s loop
- Subtle: low contrast difference in gradient stops
- Pause on hover (optional)

**Implementation (CSS-only):**
```css
.shimmer-text {
  background: linear-gradient(
    90deg,
    #1a1a2e 0%,
    #1a1a2e 40%,
    #4a4a6e 50%,
    #1a1a2e 60%,
    #1a1a2e 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

/* Pause on hover */
.shimmer-text:hover {
  animation-play-state: paused;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .shimmer-text {
    background: #1a1a2e;
    -webkit-background-clip: initial;
    background-clip: initial;
    color: #1a1a2e;
    animation: none;
  }
}
```

**Usage:**
- Apply to main headline only
- Keep gradient colors within brand palette
- Alternative: Use on "SlideTheory" logo wordmark

---

### 4. Card 3D Tilt Hover (Hover Effect)
**Purpose:** Feature cards that feel tactile and interactive

**Effect:**
- Card tilts toward cursor position (max 10° rotation)
- Subtle shadow shift in opposite direction
- Inner content has parallax (moves slightly against tilt)
- Scale: 1.02x
- Glare/sheen effect across surface (optional)

**Implementation (Framer Motion):**
```tsx
const TiltCard = ({ children }) => {
  const ref = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    
    setRotateX((y - 0.5) * -10); // -5° to 5°
    setRotateY((x - 0.5) * 10);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
      animate={{
        rotateX,
        rotateY,
        scale: 1.02,
        boxShadow: `${-rotateY}px ${rotateX}px 30px rgba(0,0,0,0.1)`
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      whileHover={{ scale: 1.02 }}
    >
      {children}
    </motion.div>
  );
};
```

**Performance Notes:**
- Use `transform-style: preserve-3d` on parent
- Limit to 3-4 visible cards max
- Disable on mobile entirely

---

### 5. Sequential Page Load (Page Load Animation)
**Purpose:** Elegant entrance that builds anticipation

**Effect:**
1. **0ms:** Screen overlay fade (if any) OR blank state
2. **0-300ms:** Navbar slides down from `y: -100%` to `y: 0`
3. **200-800ms:** Hero headline words stagger in (50ms between)
4. **400-1000ms:** Hero subtext fades up
5. **600-1200ms:** CTA buttons scale in from 0.8 with bounce
6. **800-1400ms:** Hero image/illustration fades in with slight scale (0.95 → 1)

**Implementation (Framer Motion AnimatePresence):**
```tsx
const pageLoadVariants = {
  navbar: {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  },
  headline: {
    hidden: { y: 30, opacity: 0 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      transition: { delay: 0.2 + i * 0.05, duration: 0.5 }
    })
  },
  cta: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { delay: 0.6, type: "spring", stiffness: 200, damping: 15 }
    }
  }
};
```

**Mobile Optimization:**
- Reduce stagger delays by 50%
- Remove bounce from CTA (simple fade)

---

### 6. Scroll-Progress Feature Reveal (Scroll-Triggered)
**Purpose:** Storytelling through scroll for key features

**Effect:**
- Feature sections reveal based on scroll progress
- Left side: Text content with staggered line reveals
- Right side: Image that scales from 0.9 to 1 as it locks into place
- "Sticky" section behavior - image pins while text scrolls
- Progress indicator line on left edge

**Implementation (GSAP ScrollTrigger recommended):**
```tsx
// Using GSAP for precise scroll control
useEffect(() => {
  gsap.registerPlugin(ScrollTrigger);
  
  const sections = gsap.utils.toArray('.feature-section');
  
  sections.forEach((section) => {
    const text = section.querySelector('.feature-text');
    const image = section.querySelector('.feature-image');
    
    gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        end: "top 20%",
        scrub: 1,
      }
    })
    .from(text.children, {
      y: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 0.5
    })
    .from(image, {
      scale: 0.9,
      opacity: 0.5,
      duration: 0.5
    }, 0);
  });
  
  return () => ScrollTrigger.getAll().forEach(t => t.kill());
}, []);
```

**Mobile:**
- Convert to simple fade-up (no pinning)
- Stack layout: image on top, text below

---

### 7. Cursor Spotlight Effect (Cursor-Following)
**Purpose:** Subtle ambiance that responds to user movement

**Effect:**
- Large radial gradient (400px radius) follows cursor
- Very low opacity (0.03-0.05) - barely perceptible
- Creates "flashlight" effect on dark sections
- Blurred edges for smooth falloff

**Implementation (React + CSS):**
```tsx
const CursorSpotlight = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };
    
    const handleMouseLeave = () => setIsVisible(false);
    
    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
      style={{
        opacity: isVisible ? 1 : 0,
        background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.04), transparent 50%)`
      }}
    />
  );
};
```

**Mobile:**
- Disable entirely (no cursor on touch)
- Consider replacing with subtle ambient gradient animation

---

### 8. Typewriter with Deletion (Text Animation)
**Purpose:** Dynamic headlines that cycle through value propositions

**Effect:**
- Type out first phrase: "Create presentations"
- Pause 2s
- Delete phrase character by character
- Type next phrase: "that convert"
- Cycle through 3-4 phrases
- Cursor blinks at end

**Implementation (Framer Motion + useState):**
```tsx
const TypewriterText = ({ phrases, typingSpeed = 80, deleteSpeed = 40, pauseTime = 2000 }) => {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[currentPhrase];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < phrase.length) {
          setDisplayText(phrase.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentPhrase((prev) => (prev + 1) % phrases.length);
        }
      }
    }, isDeleting ? deleteSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentPhrase, phrases]);

  return (
    <span className="inline-flex items-center">
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="ml-1 inline-block w-[3px] h-[1em] bg-current"
      />
    </span>
  );
};

// Usage
<TypewriterText 
  phrases={["Create presentations", "that convert", "in minutes", "with AI"]} 
/>
```

**Accessibility:**
- Wrap in `aria-live="polite"` region
- Consider static fallback for screen readers
- Respect `prefers-reduced-motion`

---

## 📱 Mobile Strategy

### Conditional Animation Application
```css
/* Only apply hover effects on devices that support hover */
@media (hover: hover) {
  .magnetic-button { /* magnetic styles */ }
  .tilt-card { /* tilt styles */ }
}

/* Touch device optimizations */
@media (hover: none) {
  .feature-card:active {
    transform: scale(0.98);
    transition: transform 0.1s;
  }
}
```

### Reduced Motion Support
```tsx
const prefersReducedMotion = 
  typeof window !== 'undefined' && 
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// In Framer Motion
<motion.div
  initial={prefersReducedMotion ? false : "hidden"}
  animate="visible"
  variants={variants}
/>
```

---

## ⚡ Performance Checklist

- [ ] All animations use `transform` and `opacity` only
- [ ] `will-change` applied before animation, removed after
- [ ] Intersection Observer used for scroll triggers (not scroll events)
- [ ] Animations throttle to 60fps (16ms)
- [ ] No layout thrashing (avoid animating width/height/top/left)
- [ ] GPU acceleration via `translateZ(0)` or `translate3d`
- [ ] Lazy load animation libraries if below fold
- [ ] Test on low-end devices (budget Android phones)

---

## 🎯 Implementation Priority

| Priority | Animation | Impact | Effort |
|----------|-----------|--------|--------|
| P0 | Staggered Fade-Up | High | Low |
| P0 | Magnetic Button | High | Medium |
| P1 | Page Load Sequence | High | Medium |
| P1 | 3D Card Tilt | Medium | Medium |
| P2 | Gradient Shimmer | Low | Low |
| P2 | Typewriter | Medium | Medium |
| P2 | Scroll-Progress Features | High | High |
| P3 | Cursor Spotlight | Low | Low |

**Recommended MVP:** P0 + P1 items (5 animations) → Ship → Add P2/P3

---

## 🔧 CSS Easing Reference

```css
:root {
  --ease-out-expo: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-in-out-circ: cubic-bezier(0.85, 0, 0.15, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

*Document created for SlideTheory landing page - Animation & Interaction Design*
