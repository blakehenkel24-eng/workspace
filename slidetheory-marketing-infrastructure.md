# SlideTheory Marketing Infrastructure Setup
## SEO, Content, Social, Distribution — Tactical Checklist

---

## SEO FOUNDATION

### 1. Google Search Console
**URL:** https://search.google.com/search-console
**Steps:**
1. Sign in with Google account
2. Click "Add Property" → "Domain"
3. Enter: `slidetheory.io`
4. Verify via DNS (copy TXT record)
5. Add to your domain DNS (Namecheap/Cloudflare)
6. Wait for verification (5 min - few hours)
7. Submit sitemap: `https://slidetheory.io/sitemap.xml`
8. Check "Performance" tab weekly for keyword data

**Time:** 15 minutes

---

### 2. Bing Webmaster Tools
**URL:** https://www.bing.com/webmasters
**Steps:**
1. Sign in with Microsoft or Google account
2. Add site: `slidetheory.io`
3. Verify (import from Google Search Console if possible)
4. Submit sitemap

**Time:** 5 minutes

---

### 3. SEO Technical Setup

**In your Next.js app:**

```tsx
// app/layout.tsx or pages/_app.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SlideTheory - AI-Powered Slide Generation for Consultants',
  description: 'Transform your strategy briefs into McKinsey-quality presentations in minutes. Built for consultants who need to move fast.',
  keywords: ['consulting presentations', 'strategy decks', 'AI slides', 'McKinsey presentations', 'consulting tools'],
  openGraph: {
    title: 'SlideTheory - Generate Consultant-Grade Slides in Minutes',
    description: 'AI-powered slide generation for strategy consultants',
    url: 'https://slidetheory.io',
    siteName: 'SlideTheory',
    images: [
      {
        url: 'https://slidetheory.io/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SlideTheory - AI-Powered Slide Generation',
    description: 'Transform strategy briefs into McKinsey-quality presentations',
    images: ['https://slidetheory.io/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}
```

**Create `robots.txt` in `/public`:**
```
User-agent: *
Allow: /
Sitemap: https://slidetheory.io/sitemap.xml
```

**Create `sitemap.xml` (or generate dynamically):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://slidetheory.io</loc>
    <lastmod>2026-02-08</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://slidetheory.io/blog</loc>
    <lastmod>2026-02-08</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://slidetheory.io/pricing</loc>
    <lastmod>2026-02-08</lastmod>
    <priority>0.8</priority>
  </url>
</urlset>
```

**Time:** 30 minutes

---

### 4. Keyword Research (Free Method)

**Use Google Autocomplete:**
1. Go to Google, type: "consulting presentations"
2. Note all autocomplete suggestions
3. Try: "how to create", "best tools for", "McKinsey style"
4. Save list of 20-30 keywords

**Target Keywords (Priority Order):**
| Keyword | Volume | Competition | Content Type |
|---------|--------|-------------|--------------|
| consulting presentation templates | High | Medium | Blog post |
| McKinsey slide format | Medium | Low | Guide/Template |
| strategy deck examples | Medium | Low | Blog post |
| AI presentation tools | High | High | Comparison post |
| consulting slide design | Low | Low | Tutorial |
| pyramid principle presentation | Low | Low | Educational |
| action titles consulting | Low | Low | Blog post |

**Time:** 1 hour

---

## CONTENT INFRASTRUCTURE

### 5. Blog Setup

**If using Next.js App Router:**
```
app/
├── blog/
│   ├── page.tsx (blog listing)
│   └── [slug]/
│       └── page.tsx (individual post)
├── content/
│   └── posts/
│       ├── mckinsey-slide-format.mdx
│       ├── consulting-presentation-templates.mdx
│       └── strategy-deck-examples.mdx
```

**Use MDX for blog posts:**
```mdx
---
title: "The McKinsey Slide Format: A Complete Guide"
date: "2026-02-08"
author: "Blake Henkel"
excerpt: "Learn the exact slide format used by McKinsey consultants to create compelling presentations."
keywords: ["McKinsey", "consulting presentations", "slide format"]
---

# The McKinsey Slide Format

[Content here]
```

**Install dependencies:**
```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react
```

**Time:** 2 hours

---

### 6. Content Calendar (First 30 Days)

**Week 1:**
- Monday: "The McKinsey Slide Format Explained" (Blog)
- Tuesday: "3 consulting frameworks every strategy deck needs" (LinkedIn)
- Wednesday: "Why most strategy presentations fail" (Twitter thread)
- Thursday: "How to write action titles that win deals" (Blog)
- Friday: "Before/After: Transforming a messy brief into a polished deck" (Case study)

**Week 2:**
- Monday: "The MECE Principle in Practice" (Blog)
- Tuesday: "Consulting slide design mistakes (and how to fix them)" (LinkedIn)
- Wednesday: "The 5-slide story structure that closes deals" (Twitter thread)
- Thursday: "Pyramid Principle: Bottom line up front" (Blog)
- Friday: "How I cut deck creation time by 90%" (Personal story)

**Week 3:**
- Monday: "Consulting presentation templates [Free Download]" (Blog + Lead gen)
- Tuesday: "The difference between McKinsey, BCG, and Bain slides" (LinkedIn)
- Wednesday: "AI tools for consultants: What actually works" (Twitter thread)
- Thursday: "How to structure a board presentation" (Blog)
- Friday: "Client spotlight: [Anonymized] consultant's transformation" (Case study)

**Week 4:**
- Monday: "The ultimate consulting slide library" (Resource post)
- Tuesday: "Questions every strategy presentation should answer" (LinkedIn)
- Wednesday: "Why consultants are switching to AI slide tools" (Twitter thread)
- Thursday: "Presentation design for non-designers" (Blog)
- Friday: "Month in review: What we learned" (Newsletter)

**Time:** 4 hours to write all 20 pieces (or use GTM engine)

---

## SOCIAL MEDIA SETUP

### 7. LinkedIn Company Page Optimization

**Profile Checklist:**
- [ ] Cover image: 1128 x 191px (product screenshot or value prop)
- [ ] Logo: 300 x 300px
- [ ] Company description: Include keywords "AI presentations", "consulting", "strategy"
- [ ] Custom button: "Visit Website" (links to slidetheory.io)
- [ ] Hashtags: #Consulting #Strategy #AItools #Productivity
- [ ] Location: Chicago, IL

**First 5 Posts (Schedule these):**
1. "We're live! SlideTheory helps consultants create McKinsey-quality slides in minutes. Here's how..."
2. "The #1 mistake we see in strategy presentations (and the 5-minute fix)"
3. "Behind the scenes: How SlideTheory uses the Pyramid Principle to structure decks"
4. "Free resource: 10 consulting slide templates [link]"
5. "Client win: Independent consultant saved 6 hours on a board presentation"

**Time:** 1 hour

---

### 8. Twitter/X Setup

**Profile Optimization:**
- [ ] Header: 1500 x 500px (product screenshot or bold statement)
- [ ] Profile pic: Logo or personal photo
- [ ] Bio formula: What you do + Who it's for + CTA
  - Example: "AI-powered slide generation for strategy consultants | Cut deck creation time by 90% | Try free → slidetheory.io"
- [ ] Pinned tweet: Product announcement with screenshot/demo
- [ ] Location: Chicago, IL
- [ ] Website: slidetheory.io

**Content Pillars (rotate these):**
1. **Framework Fridays:** Share consulting frameworks (MECE, Pyramid, etc.)
2. **Before/After:** Show slide transformations
3. **Consulting Tips:** Quick actionable advice
4. **Product Updates:** New features, milestones
5. **Behind the Scenes:** Building in public

**Hashtags to use:**
- #ConsultingTwitter
- #Strategy
- #Productivity
- #AI
- #BuildingInPublic

**Time:** 45 minutes

---

### 9. YouTube (Optional but powerful)

**Channel Setup:**
- [ ] Create YouTube channel
- [ ] Channel art: 2560 x 1440px
- [ ] Profile pic: Logo
- [ ] About section: Include keywords, link to website
- [ ] Channel trailer: 30-60 second product demo

**First 3 Videos:**
1. "How to Create a McKinsey-Quality Presentation in 5 Minutes"
2. "The MECE Principle Explained (With Examples)"
3. "Before/After: Transforming a Messy Strategy Brief into a Polished Deck"

**Time:** 4 hours setup + recording

---

## EMAIL & CRM

### 10. Email Marketing Setup

**Option A: Resend (Recommended - pay as you go)**
- Already have account
- Good for transactional + marketing

**Option B: ConvertKit or Beehiiv (Newsletter-focused)**
- Better for content newsletters
- Free tiers available

**Email Sequences to Create:**

**Welcome Series (3 emails):**
1. **Immediate:** "Thanks for joining! Here's your free template..."
2. **Day 2:** "The #1 mistake consultants make with presentations"
3. **Day 5:** "Case study: How [anonymized] closed a $2M deal with better slides"

**Onboarding (for free users):**
1. **Day 1:** "Quick wins to get started with SlideTheory"
2. **Day 3:** "Unlock Pro features: [feature highlights]"
3. **Day 7:** "Last chance: Upgrade to Pro for [benefit]"

**Time:** 3 hours to write sequences

---

### 11. Lead Magnet Creation

**Create these free resources:**

1. **"The Consulting Slide Template Pack"**
   - 10 editable slide templates
   - Formats: PPTX, Google Slides
   - Landing page: `/templates`
   - Gate: Email required

2. **"McKinsey Slide Format Cheat Sheet"**
   - One-page PDF
   - Action title formulas
   - MECE checklist
   - Gate: Email required

3. **"The Strategy Deck Checklist"**
   - 20-point checklist
   - PDF format
   - Gate: Email required

**Time:** 4 hours to create all three

---

## DISTRIBUTION & PROMOTION

### 12. Community Participation (High ROI)

**Reddit Communities to Join:**
- r/consulting (700k+ members)
- r/MBA (200k+ members)
- r/Entrepreneur (1M+ members)
- r/Productivity (2M+ members)
- r/slides (small but targeted)

**Strategy:**
- Don't post links for first 2 weeks
- Answer questions, be helpful
- Build karma
- Then: "I built a tool that might help..."

**Time:** 30 min/day

---

### 13. Indie Hackers

**URL:** https://www.indiehackers.com/
**Steps:**
1. Create account
2. Complete profile
3. Start "Building SlideTheory" thread
4. Post weekly updates
5. Engage with other builders

**Time:** 1 hour/week

---

### 14. Product Hunt Prep

**Pre-Launch Checklist:**
- [ ] Gallery images (3-5 screenshots)
- [ ] Maker comment written
- [ ] First commenters lined up (friends who will upvote)
- [ ] Launch day plan (post at 12:01 AM PST for max exposure)
- [ ] Email list notified day before
- [ ] Social posts scheduled for launch day

**Time:** 2 hours

---

## ANALYTICS & TRACKING

### 15. Advanced Tracking Setup

**Google Analytics 4 Events to Track:**
```javascript
// Sign up
gtag('event', 'sign_up', {
  method: 'email'
})

// Upgrade to Pro
gtag('event', 'purchase', {
  value: 29,
  currency: 'USD'
})

// Generate slide
gtag('event', 'generate_slide', {
  slide_count: 10
})

// Export deck
gtag('event', 'export_deck', {
  format: 'pptx'
})
```

**Create GA4 Custom Reports:**
1. Conversion funnel: Landing → Sign up → Upgrade
2. Traffic sources: Which channels convert best
3. Content performance: Blog posts driving signups

**Time:** 2 hours

---

### 16. Heatmaps & Session Recording

**Options:**
- **Microsoft Clarity** (Free) - Recommended
- **Hotjar** (Free tier)
- **FullStory** (Paid)

**Setup:**
1. Create account
2. Add tracking code to site
3. Set up heatmaps for:
   - Homepage
   - Pricing page
   - Sign up flow

**What to look for:**
- Where do people click?
- Where do they drop off?
- What do they ignore?

**Time:** 30 minutes

---

## WEEK 1 ACTION PLAN

### Day 1 (2 hours)
- [ ] Google Search Console setup
- [ ] Install GA4 events
- [ ] Add OpenGraph meta tags

### Day 2 (3 hours)
- [ ] Write first 5 blog posts
- [ ] Set up blog in Next.js
- [ ] Publish first post

### Day 3 (2 hours)
- [ ] Optimize LinkedIn company page
- [ ] Optimize Twitter profile
- [ ] Schedule first week of posts

### Day 4 (3 hours)
- [ ] Create lead magnet (template pack)
- [ ] Set up landing page for lead magnet
- [ ] Write welcome email sequence

### Day 5 (2 hours)
- [ ] Join 5 Reddit communities
- [ ] Create Indie Hackers thread
- [ ] Set up Microsoft Clarity

### Day 6-7 (Ongoing)
- [ ] Engage in communities (30 min/day)
- [ ] Respond to GTM engine content queue
- [ ] Check analytics

---

## SUCCESS METRICS (Week 1 Goals)

| Metric | Target |
|--------|--------|
| Blog posts published | 3 |
| Social posts published | 10 |
| Email subscribers | 10 |
| Website visitors | 50 |
| Communities joined | 5 |
| Backlinks earned | 1-2 |

---

## TOOLS SUMMARY

| Tool | Purpose | Cost |
|------|---------|------|
| Google Search Console | SEO monitoring | Free |
| Google Analytics 4 | Web analytics | Free |
| Microsoft Clarity | Heatmaps | Free |
| Resend | Email marketing | Pay as you go |
| LinkedIn | B2B social | Free |
| Twitter/X | Distribution | Free |
| Reddit | Community | Free |
| Indie Hackers | Builder community | Free |
| Product Hunt | Launch platform | Free |

**Total marketing stack cost: ~$0-20/month**

---

## NEXT STEPS

1. **Pick 3 things from this list to do TODAY**
2. **Block 2 hours on your calendar for tomorrow**
3. **Set up the GTM engine to produce content while you build**

Want me to spawn agents to help with any of these tasks?
