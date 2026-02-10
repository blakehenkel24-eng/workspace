# SlideTheory: Zero to $1K MRR Roadmap
## Complete Foundation + Growth Plan

---

## PHASE 1: FOUNDATION (Week 1-2)

### 1.1 Product Core — MUST HAVE BEFORE ANYTHING ELSE

**Landing Page** (Your Storefront)
- [ ] Deploy the landing page we designed to Vercel
- [ ] Connect custom domain (slidetheory.io)
- [ ] Add Google Analytics
- [ ] Add Meta Pixel (for retargeting)
- [ ] Set up Hotjar or similar (heatmaps)

**Authentication & Database**
- [ ] Supabase project set up
- [ ] Auth flow working (sign up, log in, reset password)
- [ ] User profiles table
- [ ] Decks/projects table

**Core Product Flow** (The Magic)
- [ ] Input: Text box for "dump your context"
- [ ] AI Processing: Sends to Kimi API with consulting framework prompt
- [ ] Output: Generated slide deck (PPTX or Google Slides export)
- [ ] Save: Deck saved to user's account

**Stripe Integration**
- [ ] Stripe account created
- [ ] Pricing: Free ($0) + Pro ($29/mo) tiers
- [ ] Checkout flow working
- [ ] Webhook handling (subscription events)
- [ ] Upgrade/downgrade working

### 1.2 Essential Legal/Pages

- [ ] Privacy Policy (copy from template)
- [ ] Terms of Service (copy from template)
- [ ] Cookie consent banner
- [ ] 404 page

### 1.3 Analytics & Tracking

- [ ] Google Analytics 4 property
- [ ] Google Search Console (for SEO)
- [ ] Stripe analytics dashboard
- [ ] Simple conversion tracking (signups → paid)

---

## PHASE 2: PRE-LAUNCH (Week 3)

### 2.1 Beta Testing

- [ ] Identify 10 beta users (consultants you know or from outreach)
- [ ] Onboard them personally (Zoom call or Loom video)
- [ ] Collect feedback via Typeform or simple Google Form
- [ ] Fix critical bugs
- [ ] Document testimonials/case studies

### 2.2 Content Foundation

- [ ] Write 3 blog posts (SEO keywords: "consulting presentations", "strategy deck templates", "McKinsey slide format")
- [ ] Create LinkedIn company page
- [ ] Create Twitter account
- [ ] Write "About" story (why you built SlideTheory)

### 2.3 Launch Assets

- [ ] Product Hunt listing (draft)
- [ ] Waitlist landing page (if doing pre-launch)
- [ ] Launch email sequence (3 emails)
- [ ] Demo video or Loom walkthrough

---

## PHASE 3: LAUNCH (Week 4)

### 3.1 Soft Launch

- [ ] Post to personal LinkedIn/Twitter
- [ ] Email beta users with "we're live" message
- [ ] Post in 3-5 relevant communities (consulting subreddits, Indie Hackers, etc.)
- [ ] Ask for referrals: "Know a consultant who hates making slides?"

### 3.2 Monitor & Respond

- [ ] Daily check of signups (set up daily email summary)
- [ ] Respond to all support requests within 2 hours
- [ ] Track conversion rate (free → paid)
- [ ] Note common feature requests

---

## PHASE 4: SCALE (Ongoing — GTM Engine Takes Over)

### 4.1 The GTM Engine (NOW ACTIVE)

✅ **Morning Intel** — Know what competitors are doing
✅ **Daily Content** — Build audience consistently
✅ **Prospect Research** — Find leads automatically
✅ **Analytics** — Track what's working
✅ **Weekly Strategy** — Adjust based on data

### 4.2 Your Weekly Ritual

**Monday (30 min):**
- Review weekend's content queue
- Post approved content
- Check competitor moves from daily briefs

**Wednesday (15 min):**
- Review outreach queue
- Send 2-3 personalized connection requests

**Friday (30 min):**
- Review weekly strategy report
- Decide on 3 priorities for next week
- Adjust GTM engine if needed

**Daily (5 min):**
- Check for critical notifications
- Approve/reject content from queue

---

## THE COMPLETE CHECKLIST

### Technical Setup
- [ ] Next.js app deployed on Vercel
- [ ] Custom domain connected
- [ ] SSL certificate (auto on Vercel)
- [ ] Supabase backend
- [ ] Kimi API integration
- [ ] Stripe payments
- [ ] Email service (Resend or SendGrid)
- [ ] Error monitoring (Sentry - optional but recommended)

### Product Features
- [ ] Sign up / Log in
- [ ] Create new deck
- [ ] Input context (text box)
- [ ] AI generates slides
- [ ] Preview slides
- [ ] Export to PPTX
- [ ] Save/load previous decks
- [ ] Upgrade to Pro

### GTM Infrastructure
- [ ] Google Analytics
- [ ] Meta Pixel
- [ ] Stripe analytics
- [ ] GTM folder structure (✅ done)
- [ ] Cron jobs running (✅ done)

### Content Assets
- [ ] 3 blog posts
- [ ] 10 LinkedIn posts ready
- [ ] 5 Twitter threads ready
- [ ] 1 demo video
- [ ] Email sequence (3 emails)

### Legal
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Cookie banner

### Launch
- [ ] Beta list (10 people)
- [ ] Product Hunt listing
- [ ] Launch post (LinkedIn/Twitter)
- [ ] Community posts

---

## PRIORITY ORDER (If You're Overwhelmed)

### Week 1: Just Ship Something
1. Landing page (copy from our design)
2. Sign up works
3. Kimi API generates SOMETHING
4. Deploy to Vercel

### Week 2: Make It Real
1. Stripe integration
2. Export to PPTX
3. Save/load decks
4. Beta test with 3 people

### Week 3: Polish & Content
1. Fix bugs from beta
2. Write 3 blog posts
3. Set up LinkedIn/Twitter
4. Draft Product Hunt listing

### Week 4: Launch
1. Soft launch to network
2. Post in communities
3. Turn on GTM engine (✅ already done)
4. Monitor and iterate

---

## WHAT THE GTM ENGINE DOES FOR YOU

**Without it:** You'd spend 2-3 hours/day on marketing
**With it:** You spend 30 min/day reviewing what the AI created

The engine handles:
- ✅ Competitor monitoring
- ✅ Content creation
- ✅ Lead research
- ✅ Analytics tracking
- ✅ Strategy planning

You handle:
- ✅ Product development
- ✅ Approving content (5 min/day)
- ✅ Talking to customers
- ✅ Strategic decisions

---

## SUCCESS METRICS TO TRACK

**Week 1-2:**
- Landing page deployed: ✅
- First user sign up: ___
- First paying customer: ___

**Month 1:**
- Total signups: ___
- Paid conversions: ___
- Revenue: $___

**Month 3:**
- Monthly Recurring Revenue (MRR): $___
- Goal: $1,000 MRR

---

## BLOCKERS & SOLUTIONS

**"I don't know how to code X"**
→ Use Kimi/Claude. Paste errors, ask for help. You have an AI pair programmer.

**"I don't have time for content"**
→ That's what the GTM engine is for. Check the queue daily, approve what works.

**"I'm scared to launch"**
→ Launch to 5 friends first. Then 10. Then 50. Scale embarrassment gradually.

**"What if nobody pays?"**
→ Then you learn and pivot. But you won't know until you ask for money.

---

## NEXT ACTIONS (Pick One)

1. **Deploy landing page** → Copy code from design spec, push to Vercel
2. **Set up Stripe** → Create account, add checkout page
3. **Connect Kimi API** → Get API key, test first slide generation
4. **Find 3 beta users** → Post on LinkedIn: "Looking for consultants to test something"

**Which do you want to tackle first?**
