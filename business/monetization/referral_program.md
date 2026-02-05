# SLIDETHEORY — Referral Program Design

## Overview

A well-designed referral program turns satisfied users into a scalable acquisition channel. For SLIDETHEORY, referrals align naturally with the product—users create presentations to share, making viral loops inherent.

---

## Program Goals

| Goal | Target | Timeline |
|------|--------|----------|
| % of new users from referrals | 30% | 12 months |
| Referral-to-signup conversion | 15% | 6 months |
| Referred user CAC | $0 (organic) | Ongoing |
| Referred user LTV | 1.2x organic | 12 months |
| Active referrers (% of user base) | 10% | 12 months |

---

## Referral Model Selection

### Model Comparison

| Model | Structure | Best For | Complexity |
|-------|-----------|----------|------------|
| **Single-sided** | Referrer gets reward | Simple execution | Low |
| **Double-sided** | Both get reward | Maximum motivation | Medium |
| **Tiered** | Rewards increase with volume | Power users | High |
| **Viral loop** | Referred users can refer | Network effects | Medium |

### Recommended: Double-Sided Tiered Program

```
SLIDETHEORY REFERRAL PROGRAM

When you refer a friend:
┌─────────────────┬─────────────────┐
│   YOU GET       │  THEY GET       │
├─────────────────┼─────────────────┤
│ 1 month free    │ 20% off first   │
│ per referral    │ year            │
│                 │                 │
│ (up to 12 free  │ (or 1 month     │
│  months/year)   │  free)          │
└─────────────────┴─────────────────┘

POWER REFERRER TIERS:
┌──────────────┬──────────────────────────┐
│ 5 referrals  │ SLIDETHEORY Pro for Life │
│ 10 referrals │ $500 cash bonus          │
│ 25 referrals │ Founding Member status   │
│              │ + Annual retreat invite  │
└──────────────┴──────────────────────────┘
```

---

## Program Mechanics

### 1. Referral Rewards

#### For Referrer (Existing User)
| Referral Count | Reward |
|----------------|--------|
| Per referral | 1 month free Pro |
| 3 referrals | + Exclusive template pack |
| 5 referrals | Lifetime Pro access |
| 10 referrals | $500 cash bonus |
| 25 referrals | Founding Member status + equity consideration |

#### For Referee (New User)
| Offer | Value | Conversion |
|-------|-------|------------|
| 20% off first year | $98 savings | High |
| 2 months free | $98 value | High |
| Free template pack | $49 value | Medium |

### 2. Referral Methods

#### In-Product Referrals
```
Share your unique link:
https://slidetheory.com/r/sarah-designs

[Copy Link]  [Share on Twitter]  [Share on LinkedIn]  [Email]

Your progress: 2 referrals (2 months free earned!)
Next milestone: 3 referrals → Exclusive templates
```

#### Natural Touchpoints
- **Post-export**: "Share this deck? Get a month free when someone signs up"
- **Milestone celebration**: "You've created 10 decks! Share the love?"
- **Collaboration invites**: Team invites count as referrals
- **Template sharing**: Shared templates include referral attribution

#### Embedded Virality
```
Every presentation you export includes:
┌─────────────────────────────────────┐
│                                     │
│  [Your Presentation Content]        │
│                                     │
│  ─────────────────────────────────  │
│  Made with ♥ using SLIDETHEORY      │
│  Get 20% off: slidetheory.com/r/xyz │
└─────────────────────────────────────┘
```

### 3. Attribution & Tracking

#### Tracking Mechanisms
| Method | Implementation | Duration |
|--------|---------------|----------|
| UTM parameters | `?ref=username&utm_source=referral` | Session |
| Cookies | Store referrer ID | 30 days |
| Signup attribution | `referred_by` field in user record | Permanent |
| Link tracking | Unique short links per user | Permanent |

#### Attribution Rules
1. **Last touch wins** — Most recent referral link gets credit
2. **30-day cookie** — Signup within 30 days of link click
3. **New users only** — Existing users don't count
4. **Paid conversion required** — Referee must complete trial/pay
5. **No self-referrals** — Email/IP/device fingerprint matching

### 4. Fraud Prevention

| Risk | Prevention |
|------|------------|
| Self-referrals | Email + IP + device fingerprint check |
| Fake accounts | Require valid payment method for reward |
| Account cycling | Minimum 3-month tenure before referring |
| Bot signups | CAPTCHA + behavioral analysis |
| Reward abuse | Maximum 12 free months per year |

---

## User Segmentation Strategy

### Segment 1: Power Users (High Engagement)
**Profile**: Daily active, 50+ slides, team invites
**Approach**: Personal outreach, VIP referral benefits
**Reward**: Lifetime Pro + cash bonuses + recognition

### Segment 2: Template Creators
**Profile**: Creates templates others use
**Approach**: Template marketplace integration
**Reward**: Revenue share + referral bonuses

### Segment 3: Team Admins
**Profile**: Manages team subscription
**Approach**: Team expansion referral program
**Reward**: Discount on team plan per referral

### Segment 4: Consultants/Agencies
**Profile**: Uses SLIDETHEORY for client work
**Approach**: Affiliate-style program
**Reward**: 20% recurring commission

---

## Communication Strategy

### Onboarding Referral Introduction
```
Day 3 Email: "Love SLIDETHEORY? Share the love 🎉"

Subject: Get free months when you share SLIDETHEORY

Hi [Name],

You're creating amazing presentations! 

Know someone who could use SLIDETHEORY?

Share your unique link and you'll both win:
→ You get 1 month free per friend (up to 12/year)
→ They get 20% off their first year

[Get My Referral Link]

Thanks for spreading the word!

The SLIDETHEORY Team
```

### Milestone Celebrations
```
In-app notification:

🎉 Milestone Unlocked: 5 Referrals!

You've earned: Lifetime Pro Access
Next up at 10: $500 cash bonus

[View Referral Dashboard]
```

### Referee Experience
```
Landing page when clicking referral link:

┌─────────────────────────────────────────────────────┐
│                                                     │
│  Sarah invited you to try SLIDETHEORY 🎁           │
│                                                     │
│  "SLIDETHEORY cut my deck creation time in half.   │
│   Game changer for my pitches!"                    │
│                          — Sarah, Product Designer │
│                                                     │
│  Get 20% off your first year (save $98)            │
│                                                     │
│  [Start Free Trial]                                 │
│                                                     │
│  ✓ 14-day free trial                                │
│  ✓ No credit card required                          │
│  ✓ Cancel anytime                                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Channel-Specific Strategies

### LinkedIn (Primary Channel)
- **Why**: Professional audience, presentation-heavy
- **Tactic**: "Share your latest deck" with referral link
- **Incentive**: Templates for LinkedIn-optimized presentations

### Twitter/X
- **Why**: Designer/developer community
- **Tactic**: Before/after deck transformation images
- **Incentive**: Shoutouts from SLIDETHEORY account

### Email Signature
- **Why**: Passive, ongoing exposure
- **Tactic**: Referral link in email signature generator
- **Incentive**: Signature templates that look professional

### Community Forums
- **Why**: Targeted professional communities
- **Tactic**: Case study sharing with referral links
- **Incentive**: Community recognition badges

---

## Referral Program Dashboard

### For Users
```
┌────────────────────────────────────────────────────────┐
│  YOUR REFERRALS                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Total Referrals: 7                                    │
│  Successful Signups: 5                                 │
│  Converted to Paid: 3                                  │
│                                                        │
│  REWARDS EARNED:                                       │
│  ✓ 3 months free Pro                                   │
│  ✓ Exclusive template pack                             │
│  ⏳ 2 more to Lifetime Pro                             │
│                                                        │
│  YOUR REFERRAL LINK:                                   │
│  slidetheory.com/r/johnsmith                    [Copy] │
│                                                        │
│  [Share on LinkedIn]  [Share on Twitter]  [Email]      │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### For Admin
```
┌────────────────────────────────────────────────────────┐
│  REFERRAL PROGRAM ANALYTICS                            │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Monthly Active Referrers: 234 (+12%)                  │
│  Referral Signups: 156 (+28%)                          │
│  Referral Conversion Rate: 18.2%                       │
│  Cost per Referral Acquisition: $32                    │
│  Referral LTV vs Organic: 1.3x                         │
│                                                        │
│  TOP REFERRERS:                                        │
│  1. @designguru — 23 referrals                         │
│  2. @pitchmaster — 19 referrals                        │
│  3. @slidequeen — 15 referrals                         │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## Launch Plan

### Phase 1: Beta (Weeks 1-2)
- Invite 50 power users
- Manual reward fulfillment
- Gather feedback
- Refine messaging

### Phase 2: Soft Launch (Weeks 3-4)
- Open to all paid users
- Automated rewards
- Basic dashboard
- Track key metrics

### Phase 3: Full Launch (Week 5+)
- Public announcement
- Influencer outreach
- Contest/giveaway
- PR push

### Phase 4: Optimization (Ongoing)
- A/B test reward structures
- Add gamification elements
- Expand to new channels
- International expansion

---

## Success Metrics & Targets

| Metric | Month 1 | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|---------|----------|
| Referral signups/month | 50 | 200 | 500 | 1,000 |
| Referral share rate | 5% | 8% | 12% | 15% |
| Referral conversion | 10% | 12% | 15% | 18% |
| % new users from referrals | 10% | 15% | 25% | 30% |
| Referred user 90-day retention | 60% | 65% | 70% | 75% |

---

## Budget & Costs

### Reward Costs (per 100 referrals)
```
Free months given:           100 months × $49 = $4,900
Cash bonuses (10 @ $500):    $5,000
Template packs:              $500
Lifetime Pro (5):            $2,940 (annual value)
────────────────────────────────────────
Total cost:                  $13,340

Acquired customers:          18 (18% conversion)
Effective CAC:               $741

Compared to paid CAC ($150): 5x more expensive BUT
- Higher quality users
- Brand advocates created
- Viral coefficient > 1 = organic growth
```

### Recommended: Cap Monthly Free Months
- Maximum 12 free months per user per year
- Rewards beyond 12 convert to:
  - Cash equivalent (at 50% rate)
  - Team plan credits
  - Donation to charity option

---

## Legal & Compliance

### Terms of Service Requirements
- Clear program rules
- Right to modify/cancel
- Fraud provisions
- Tax implications (1099 for cash rewards >$600)
- GDPR compliance for EU users

### Disclosures
- FTC disclosure for influencers
- "Not endorsed by employer" for corporate users
- Clear expiration dates on rewards

---

## Competitive Benchmarks

| Company | Structure | Reward |
|---------|-----------|--------|
| Dropbox | Double-sided | Free storage |
| Notion | Single-sided | Account credit |
| Figma | Double-sided | Free months |
| Canva | Tiered | Premium access |
| Slack | Per-seat | Account credit |

**SLIDETHEORY Differentiation**: Industry-specific rewards (templates, training), public recognition for top referrers, potential equity for superfans.
