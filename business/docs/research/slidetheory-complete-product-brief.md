# SlideTheory: Complete Product Brief
**Compiled for Blake Henkel — All Research & Insights**

---

## 1. THE PRODUCT

### What It Is
**SlideTheory** is an AI-powered slide generation tool specifically built for strategy consultants. It takes messy notes, raw data, and half-formed thoughts and transforms them into McKinsey/BCG/Bain-quality slides in 30 seconds.

### Core Value Proposition
- **Input:** Raw notes, data exports, meeting transcripts, research docs
- **Output:** Professionally structured slides with proper frameworks (executive summaries, 2×2s, issue trees, comparison tables)
- **Differentiator:** It's trained on MBB (McKinsey, Bain, BCG) best practices — not generic templates

### Key Technical Decisions
| Decision | Rationale |
|----------|-----------|
| HTML/CSS for text | AI image generators cannot render coherent text (tested Gemini, DALL-E, GPT Image 1.5 — all fail) |
| AI images DISABLED | Text hallucination is unsolvable with current diffusion models |
| Reference decks INTERNAL | McKinsey PDFs used for AI training only, not user-facing |
| Context-dump first input | Matches actual consultant workflow (dump everything, then structure) |
| Auto-select defaults | Reduce friction — AI infers when possible |
| Teal + Orange design system | Consulting-grade, distinctive visual identity |

### Current Status
- **MVP:** Live and deployed
- **URL:** https://slidetheory.io
- **Target:** $1,000 MRR
- **Stack:** Next.js 14, Supabase, Kimi API, Vercel + Hostinger VPS

---

## 2. THE MARKET

### Primary Market
**Strategy consultants at top-tier firms (MBB + Big 4 + boutiques)**

### Firm Tiers
| Tier | Firms | Characteristics |
|------|-------|-----------------|
| **MBB** | McKinsey, Bain, BCG | Highest standards, most slide-obsessed, premium pricing acceptable |
| **Big 4 Advisory** | Deloitte, PwC, EY, KPMG | Large teams, high volume of decks, cost-conscious |
| **Tier 2** | Kearney, Accenture Strategy, Oliver Wyman | Aspiring to MBB quality, often overworked |
| **Boutiques** | Smaller specialized firms | Need to punch above weight, limited resources |

### Market Size Indicators
- r/consulting: 400k+ members
- Consulting Humor (Instagram): 423k followers
- Fishbowl consulting bowls: 40k+ active users
- Universal pain point: Every consultant complains about slides

---

## 3. USER PERSONAS

### Persona 1: The Burnt-Out Associate (Bain/BCG)
**Demographics:** 24-26 years old, 1-2 years out of undergrad

**Daily Reality:**
- Working 70-80 hour weeks
- Making slides until 2am regularly
- Imposter syndrome: "I don't have actual skills besides slides and emails"
- Constant context switching between tasks

**Pain Points:**
- Analysis takes an hour, but structure takes all night
- Three half-finished layouts, zero completed slides
- Googling "consulting slide templates" at 11pm
- Partner redlines every formatting choice

**What They Want:**
- Get evenings back
- Stop being a "budget graphic designer"
- Focus on actual strategy work
- Proof that their work is "MBB quality"

**Quote:** *"I know what I want to say. I have all the data. But I don't know if this should be a 2×2, an issue tree, or just... bullets? The indecision paralyzes me for an hour."*

---

### Persona 2: The Time-Starved Engagement Manager
**Demographics:** 28-32 years old, managing multiple workstreams

**Daily Reality:**
- Reviewing 5+ decks per day
- Client calls every 2 hours
- Delegating slide work but constantly fixing it
- "Version control is a mess — everyone has their own private single source of truth"

**Pain Points:**
- Junior staff can't structure a story
- Spending more time fixing than delegating
- Client asks for dashboard → team builds it → client hates it
- "Exactly what was requested but not what was needed"

**What They Want:**
- First drafts that are actually usable
- Consistent quality without micromanaging
- Faster iteration cycles
- Confidence that deliverables will land

**Quote:** *"The worst is googling 'consulting slide templates' at 11pm. You find some PDF from 2014, try to reverse-engineer it, give up, and just make another bullet slide. Partner hates it. You knew they would."*

---

### Persona 3: The Solo Strategy Consultant
**Demographics:** 30-40 years old, independent or boutique firm

**Daily Reality:**
- Doing everything — sales, delivery, ops
- No junior staff to leverage
- Competing with MBB quality on limited time
- Can't bill for slide formatting time

**Pain Points:**
- "Formatting takes longer than the analysis"
- No time to build slide library
- Clients expect McKinsey-level output
- Can't justify $100+/hour for PowerPoint work

**What They Want:**
- MBB-quality output without MBB overhead
- Templates that actually work
- Ability to compete with big firms
- Time back for actual strategy work

---

## 4. PAIN POINTS (Ranked by Severity)

### 🔴 Critical Pain: Decision Paralysis
**The Problem:** Knowing what you want to say but not how to structure it.

**Symptoms:**
- 45 minutes picking between a 2×2 and a waterfall
- Three restarts because "the structure doesn't flow"
- "The analysis took an hour. Getting the structure right took all night."

**Root Cause:** Consultants are trained to find THE right answer. When there are multiple valid slide structures, they freeze.

---

### 🔴 Critical Pain: Iteration Hell
**The Problem:** Multiple rounds of revision that don't improve the slide.

**Symptoms:**
- "Final_Final_v2_ACTUAL.pptx"
- 5th revision because "it doesn't flow"
- Diminishing returns on effort spent

**Root Cause:** Lack of clear structure from the start. Each restart is a new guess at the right format.

---

### 🟡 Major Pain: The PowerPoint Paradox
**The Problem:** Knowing slides are absurd but being trapped in the culture.

**Symptoms:**
- "I feel like I don't have any actual skills besides slides and writing emails"
- Mocking the work while excelling at it
- "Consulting is just PowerPoint + confidence"

**Root Cause:** The job IS making slides. But nobody wants to admit that's the job.

---

### 🟡 Major Pain: Context Switching
**The Problem:** Losing flow due to constant interruptions.

**Symptoms:**
- 20 minutes into a slide → jump on a call → come back → "what was I even doing here?"
- Lost thread completely
- Constant re-orientation

**Root Cause:** Consulting workflow is inherently fragmented. Slides are complex creative work done in 20-minute chunks.

---

### 🟢 Minor Pain: AI Anxiety
**The Problem:** Fear of being automated.

**Symptoms:**
- "Enjoy the ride while it lasts"
- "The pyramid is becoming an obelisk"
- Entry-level salaries frozen for 3 years

**Root Cause:** AI is actually threatening junior consulting roles. The pyramid model (many juniors, few partners) is at risk.

**Opportunity:** Position SlideTheory as adaptation, not replacement.

---

## 5. THE TRUE PROBLEM IT SOLVES

### Surface-Level Problem
"Consultants spend too much time making slides."

### Actual Problem
**Consultants are trapped in a decision-making bottleneck that drains their cognitive capacity and time.**

### The Mechanism:
1. **Input Overload:** Consultants collect massive amounts of data, notes, and insights
2. **Structure Uncertainty:** They know what they want to say but not how to frame it
3. **Iteration Trap:** Each attempt to structure creates new problems (layout doesn't fit, story doesn't flow)
4. **Time Bleed:** Hours spent on structure decisions that should take minutes
5. **Energy Drain:** The cognitive load of formatting crowds out actual thinking

### The Emotional Cost:
- Imposter syndrome ("am I really adding value?")
- Career dissatisfaction ("I'm a budget graphic designer")
- Burnout (working until 2am on formatting)
- Cognitive fatigue (can't think about actual strategy)

### What SlideTheory Actually Delivers:
**Cognitive offload + Structure confidence**

Not just:
- ✅ Faster slides
- ✅ Better formatting

But:
- ✅ Eliminates the blank-page paralysis
- ✅ Provides MBB-validated structure options
- ✅ Reduces decision fatigue
- ✅ Lets consultants focus on insights, not margins
- ✅ Restores time for actual strategy work

---

## 6. COMPETITIVE LANDSCAPE

### Current Solutions Consultants Use:
1. **Slide Libraries:** Internal firm templates (outdated, generic)
2. **Ghost Decks:** Skeletons from past projects (time-consuming to adapt)
3. **Excel + PowerPoint:** Manual creation (current painful reality)
4. **Beautiful.ai / Tome:** Consumer tools (not consulting-grade)
5. **ChatGPT:** Can write content, can't structure slides

### Why They Fail:
- Templates are rigid — don't adapt to content
- Manual work is slow and error-prone
- Consumer tools don't understand consulting frameworks
- AI chat tools can't generate visual structures

### SlideTheory's Edge:
- **Content-aware structure:** Adapts to what they're saying
- **MBB-grade output:** Actually meets firm standards
- **Consulting workflow:** Built for how they actually work
- **Speed:** 30 seconds vs 2 hours

---

## 7. KEY MESSAGING PILLARS

### What Resonates:
1. **Pain acknowledgment** — "We know this part of the job sucks"
2. **Insider credibility** — Use real terminology (deck, so what, staffed)
3. **Structure over formatting** — The problem is framing, not fonts
4. **Time back** — "Get your evenings back" not "increase efficiency"
5. **Quality guarantee** — MBB-grade, client-ready, Partner-proof

### What Falls Flat:
1. ❌ "AI-powered" — they hear buzzword
2. ❌ "Consultant-quality slides" — they hate making slides
3. ❌ "Save time" — too generic
4. ❌ Feature lists without benefits
5. ❌ Ignoring the AI threat — it's top of mind

---

## 8. PRICING STRATEGY IMPLICATIONS

### What the Market Expects:
- **MBB consultants:** Will pay $20-50/month without thinking (billable rate $200-400/hr)
- **Big 4:** Cost-conscious but high volume (team licenses)
- **Boutiques:** Price-sensitive but value quality (can compete with MBB)

### Current Pricing:
- Free: 3 slides/day
- Unlimited: $11.99/month

### Positioning Notes:
- "For consultants who value their time" — good
- Could test higher price point for MBB ($29-49) with "Teams" feature
- ROI argument: 2 hours saved × $150/hr = $300 value for $12 cost

---

## 9. OPEN THREADS / NEXT STEPS

### Product:
- [ ] Test slide generation end-to-end
- [ ] RAG knowledge base with reference PDFs
- [ ] Stripe integration for $1K MRR goal
- [ ] User onboarding flow for early access

### Marketing:
- [ ] Finalize website copy with authentic consulting voice
- [ ] Create demo GIF (10-second paste → slide)
- [ ] Build case studies with metrics ("Saved 5 hours/week")
- [ ] Launch on consulting subreddits and Fishbowl

### Positioning:
- [ ] Clarify: Structure tool, not formatting tool
- [ ] Address AI anxiety: "Adapt to the obelisk" messaging
- [ ] Build founder story: "Built by a consultant, for consultants"

---

## 10. ONE-SENTENCE SUMMARY

**SlideTheory eliminates the decision paralysis that traps consultants in endless slide iterations, giving them back time to focus on actual strategy work.**

---

*Compiled by Saki for Blake Henkel*  
*Date: February 7, 2026*
