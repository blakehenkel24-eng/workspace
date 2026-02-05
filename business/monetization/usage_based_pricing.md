# SLIDETHEORY — Usage-Based Pricing Exploration

## Overview

Usage-based pricing (UBP) charges customers based on their actual consumption rather than a flat fee. This model aligns costs with value, reduces barriers to entry, and can significantly expand the total addressable market.

---

## When Usage-Based Pricing Works

### Ideal Conditions
| Factor | SLIDETHEORY Fit | Notes |
|--------|-----------------|-------|
| Variable usage patterns | ✅ Strong | Some users create weekly, others monthly |
| Clear value metrics | ✅ Strong | Slides created, exports, AI generations |
| Infrastructure costs scale | ✅ Strong | Storage, AI compute, bandwidth |
| Enterprise adoption | ✅ Strong | Large teams have unpredictable needs |
| Price sensitivity varies | ✅ Strong | Freelancers vs enterprises differ |

### UBP vs Seat-Based Comparison

| Dimension | Seat-Based (Current) | Usage-Based |
|-----------|---------------------|-------------|
| Predictability | High (fixed monthly) | Variable |
| Barrier to entry | Medium ($49/mo) | Low (pay as you go) |
| Expansion revenue | Manual upgrades | Automatic scaling |
| Enterprise appeal | Requires estimation | Scales naturally |
| Small user appeal | May overpay | Pay for actual use |
| Revenue forecasting | Easy | Requires modeling |

---

## Usage Metrics to Price

### Primary Metrics (Direct Value)

| Metric | Unit | Cost Basis | Target Price |
|--------|------|------------|--------------|
| **AI slide generations** | Per generation | Compute (OpenAI API) | $0.50-1.00 |
| **Exports (PDF/PPTX)** | Per export | Storage + processing | $0.25-0.50 |
| **Storage** | Per GB/month | Cloud storage (S3) | $0.10-0.20 |
| **Team members** | Per seat | Platform overhead | $10-20 |

### Secondary Metrics (Supporting)

| Metric | Use Case | Potential Pricing |
|--------|----------|-------------------|
| **Presentations created** | Core activity | Included in base |
| **Views/analytics events** | Engagement tracking | $0.01 per 100 views |
| **API calls** | Integrations | $0.001 per call |
| **Brand assets** | Logo/fonts upload | $5 per brand kit |

---

## Usage-Based Pricing Models

### Model 1: Pure Pay-As-You-Go

```
No monthly fee. Pay only for what you use.

AI Generations:    $0.75 each
Exports:           $0.50 each  
Storage:           $0.15/GB/month
Team seats:        $15/seat/month

Example: Create 20 AI slides, export 5 times
         = $15 (AI) + $2.50 (exports) = $17.50/month
```

**Pros**: Lowest barrier, attracts occasional users
**Cons**: Revenue unpredictable, heavy users may exceed seat-based cost

### Model 2: Base + Usage (Recommended Hybrid)

```
┌────────────────────────────────────────────────────────┐
│  STARTER                                               │
│  $9/month base                                         │
│  • 10 AI generations included                          │
│  • 10 exports included                                 │
│  • 5GB storage included                                │
│  • $0.75 per additional AI generation                  │
│  • $0.50 per additional export                         │
└────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────┐
│  PRO                                                   │
│  $29/month base                                        │
│  • 50 AI generations included                          │
│  • Unlimited exports                                   │
│  • 50GB storage included                               │
│  • $0.50 per additional AI generation                  │
└────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────┐
│  ENTERPRISE                                            │
│  Custom pricing                                        │
│  • Volume discounts                                    │
│  • Predictable monthly billing                         │
│  • Committed use discounts                             │
└────────────────────────────────────────────────────────┘
```

**Pros**: Predictable base + fair scaling
**Cons**: More complex to communicate

### Model 3: Credits System

```
Buy credits, spend as needed. Credits never expire.

CREDIT PACKAGES:
┌──────────────┬───────────┬─────────────┐
│ Package      │ Credits   │ Price       │
├──────────────┼───────────┼─────────────┤
│ Starter      │ 100       │ $49         │
│ Professional │ 500       │ $199        │
│ Power        │ 1,000     │ $349        │
│ Enterprise   │ Custom    │ Custom      │
└──────────────┴───────────┴─────────────┘

CREDIT COSTS:
• 1 AI generation = 5 credits
• 1 export = 2 credits
• 1GB storage/month = 1 credit
• 1 team seat/month = 20 credits

Example: 100 credits = 20 AI generations OR 50 exports
```

**Pros**: Prepaid revenue, customer flexibility
**Cons**: Upfront payment barrier, credit management complexity

### Model 4: Tiered Usage Bundles

```
┌────────────────────────────────────────────────────────┐
│  LIGHT                    │  $19/month                │
│  ─────────────────────────┼────────────────────────── │
│  • Up to 25 AI slides     │  • Up to 50 exports       │
│  • Up to 10GB storage     │  • 1 team member          │
└────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────┐
│  STANDARD                 │  $49/month                │
│  ─────────────────────────┼────────────────────────── │
│  • Up to 100 AI slides    │  • Unlimited exports      │
│  • Up to 50GB storage     │  • Up to 5 team members   │
└────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────┐
│  HEAVY                    │  $99/month                │
│  ─────────────────────────┼────────────────────────── │
│  • Up to 300 AI slides    │  • Unlimited exports      │
│  • Up to 200GB storage    │  • Up to 20 team members  │
└────────────────────────────────────────────────────────┘

Overage: $0.50 per AI slide, $0.10/GB storage
```

**Pros**: Simple to understand, predictable bills
**Cons**: Users may overpay if they don't hit tier limits

---

## Recommended Implementation

### Hybrid Model: "Base + Flexible Usage"

Starting with Model 2 (Base + Usage) as the primary structure:

```
PRICING TIERS:

┌─────────────────────────────────────────────────────────┐
│  FREE                                                   │
│  $0                                                     │
│  ─────────────────────────────────────────────────────  │
│  • 3 presentations                                      │
│  • 5 AI generations total (lifetime)                    │
│  • Watermarked exports only                             │
│  • 100MB storage                                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  STARTER                                                │
│  $19/month                                              │
│  ─────────────────────────────────────────────────────  │
│  • Unlimited presentations                              │
│  • 50 AI generations/month                              │
│  • 25 exports/month                                     │
│  • 10GB storage                                         │
│  ─────────────────────────────────────────────────────  │
│  Overage:                                               │
│  • $0.50 per additional AI generation                   │
│  • $0.25 per additional export                          │
│  • $0.50 per additional GB storage                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  PRO                                                    │
│  $49/month                                              │
│  ─────────────────────────────────────────────────────  │
│  • Unlimited presentations                              │
│  • 200 AI generations/month                             │
│  • Unlimited exports                                    │
│  • 100GB storage                                        │
│  • Priority support                                     │
│  ─────────────────────────────────────────────────────  │
│  Overage:                                               │
│  • $0.40 per additional AI generation                   │
│  • $0.25 per additional GB storage                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  TEAM                                                   │
│  $99/month base + $15 per additional seat               │
│  ─────────────────────────────────────────────────────  │
│  • Everything in Pro                                    │
│  • 500 AI generations/month (shared pool)               │
│  • 500GB storage (shared)                               │
│  • Admin controls & permissions                         │
│  • Shared workspaces                                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ENTERPRISE                                             │
│  Custom pricing                                         │
│  ─────────────────────────────────────────────────────  │
│  • Volume-based committed use discounts                 │
│  • Predictable monthly billing                          │
│  • Custom AI model training                             │
│  • Dedicated account manager                            │
│  • SLA guarantees                                       │
└─────────────────────────────────────────────────────────┘
```

---

## Usage Tracking & Billing

### Real-Time Usage Dashboard

```
┌────────────────────────────────────────────────────────┐
│  YOUR USAGE THIS MONTH                                 │
│  Plan: Pro ($49/month)                                 │
├────────────────────────────────────────────────────────┤
│                                                        │
│  AI Generations                    145 / 200          │
│  [██████████████░░░░░░░░]  73%    $0 overage          │
│                                                        │
│  Exports                            ∞ / Unlimited     │
│  [████████████████████████]  —                        │
│                                                        │
│  Storage                         67 GB / 100 GB       │
│  [████████████████░░░░░░░░]  67%    $0 overage        │
│                                                        │
│  ─────────────────────────────────────────────────    │
│  Current month cost: $49                              │
│  Projected cost: $49 (no overage expected)            │
│                                                        │
│  [Upgrade to Team]  [Set Usage Alerts]                │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Billing Features

| Feature | Purpose |
|---------|---------|
| Usage alerts (50%, 80%, 100%) | Prevent surprise bills |
| Hard limits | Cap spending (optional) |
| Prepaid credits | Budget control for teams |
| Usage forecasting | Predict next month's bill |
| Overage forgiveness | Waive small overages (<$5) |
| Annual pre-purchase | Discount for committed usage |

---

## Customer Communication

### Onboarding Messaging
```
Welcome to SLIDETHEORY! 

You're on the Starter plan with 50 AI generations included.
Pay only if you exceed your included usage—no surprises.

[Start Creating]
```

### Usage Alert Email
```
Subject: You've used 80% of your AI generations

Hi [Name],

You've created 40 AI-powered slides this month (80% of your 
Starter plan limit).

Your options:
• Continue at $0.50 per additional generation
• Upgrade to Pro (200 generations + more features)
• Wait until next month (resets in 5 days)

[View Usage]  [Upgrade to Pro]

No action needed—we'll notify you at 100%.
```

---

## Revenue Modeling

### Scenario Analysis

Assumptions:
- 1,000 active users
- 60% Starter, 30% Pro, 10% Team

#### Conservative (Low Usage)
```
Starter users:  600 × $19 = $11,400
Pro users:      300 × $49 = $14,700
Team users:     100 × $99 = $9,900
────────────────────────────────
Monthly:                    $36,000
Annual:                     $432,000
```

#### Moderate (With Overage)
```
Base subscriptions:              $36,000
Starter overage (30%):           $2,700
Pro overage (20%):               $2,400
────────────────────────────────
Monthly:                         $41,100
Annual:                          $493,200
(+13% vs conservative)
```

#### High Usage (Power Users)
```
Base subscriptions:              $36,000
Significant overage:             $8,000
Enterprise upgrades:             $5,000
────────────────────────────────
Monthly:                         $49,000
Annual:                          $588,000
(+36% vs conservative)
```

---

## Implementation Roadmap

### Phase 1: Infrastructure (Weeks 1-4)
- [ ] Build usage tracking system
- [ ] Implement real-time counters
- [ ] Create usage database schema
- [ ] Set up billing integration
- [ ] Build usage dashboard

### Phase 2: Testing (Weeks 5-8)
- [ ] Beta with 50 users
- [ ] Test overage billing
- [ ] Validate usage accuracy
- [ ] Gather pricing feedback
- [ ] Refine thresholds

### Phase 3: Soft Launch (Weeks 9-12)
- [ ] New users on usage-based only
- [ ] Existing users grandfathered
- [ ] Monitor churn and conversion
- [ ] A/B test vs seat-based

### Phase 4: Full Rollout (Month 4+)
- [ ] Migrate willing existing users
- [ ] Offer choice: seat vs usage
- [ ] Optimize thresholds based on data
- [ ] Launch Enterprise committed use

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Surprise bills | Alerts at 50%, 80%, 100%; hard limit option |
| Bill shock | First overage forgiveness; monthly caps |
| Complexity confusion | Simple dashboard; clear examples |
| Heavy users overpay | Auto-suggest upgrade when cheaper |
| Revenue unpredictability | Annual pre-purchase options; committed use |
| Gaming the system | Minimum billing; fair use policies |

---

## Comparison: Current vs Usage-Based

| Metric | Current (Seat) | Usage-Based (Projected) |
|--------|----------------|-------------------------|
| Entry price | $49/mo | $19/mo |
| Average user cost | $45/mo | $35/mo |
| Power user cost | $49/mo | $80-150/mo |
| Light user appeal | Poor | Excellent |
| Enterprise appeal | Good | Excellent |
| Revenue predictability | High | Medium |
| Expansion revenue | Manual | Automatic |
