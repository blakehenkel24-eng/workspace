# SlideTheory Survey Templates

## Overview
A collection of ready-to-use survey templates for different stages of the user journey.

---

## 1. Onboarding Survey

### Purpose
Understand expectations, initial impressions, and setup friction for new users.

### Timing
- **Primary:** Day 1 (after account creation)
- **Follow-up:** Day 7 (if activated) or Day 3 (if not activated)

### Survey

#### Welcome Screen
```
Welcome to SlideTheory! 🎉

Help us understand your presentation needs so we can make your 
experience better. This will take about 2 minutes.

[Start Survey]
```

#### Q1: Role & Context
**What best describes your primary use case?**
- [ ] Startup fundraising (pitch decks)
- [ ] Sales presentations
- [ ] Internal company updates
- [ ] Client deliverables
- [ ] Teaching/training materials
- [ ] Conference/keynote talks
- [ ] Personal projects
- [ ] Other: _______

#### Q2: Current Tools
**What presentation tools have you used in the past 6 months?**
- [ ] Microsoft PowerPoint
- [ ] Google Slides
- [ ] Canva
- [ ] Apple Keynote
- [ ] Figma/Sketch
- [ ] Pitch
- [ ] Beautiful.ai
- [ ] Gamma
- [ ] None of these
- [ ] Other: _______

#### Q3: Primary Frustration
**What's your biggest frustration with your current presentation workflow?**
- [ ] Takes too long to create
- [ ] Hard to make it look professional
- [ ] Collaboration is messy
- [ ] Keeping brand consistency
- [ ] Starting from blank slides
- [ ] Version control chaos
- [ ] Export/formatting issues
- [ ] Something else: _______

#### Q4: Success Definition
**In 3 months, what would make you feel SlideTheory was worth it?**
(Open text, 280 characters)

#### Q5: Discovery
**How did you hear about SlideTheory?**
- [ ] Search engine
- [ ] Social media (Twitter/X, LinkedIn, etc.)
- [ ] Friend/colleague recommendation
- [ ] Online article/blog
- [ ] Podcast
- [ ] App store/marketplace
- [ ] Advertisement
- [ ] Other: _______

#### Q6: First Impression (Day 7 follow-up)
**How would you describe your first week with SlideTheory?**
- [ ] Love it! Already creating presentations
- [ ] Good potential, still learning
- [ ] Some confusing parts
- [ ] Not what I expected
- [ ] Haven't really used it yet

#### Thank You
```
Thanks for your feedback! 🙏

Your input helps us build a better SlideTheory.

[Continue to Dashboard]  [Join Our Community]
```

### Metrics
- **Target completion:** 70%+
- **Key insight:** Primary use case distribution
- **Action trigger:** Low activation + negative response → outreach

---

## 2. Feature Request Survey

### Purpose
Systematically collect and prioritize feature requests with context.

### Timing
- Triggered from in-app "Request Feature" button
- Always available in help menu

### Survey

#### Q1: Feature Description
**What feature would you like to see?**
(Open text, required)

*Placeholder:* "Describe what you'd like to be able to do..."

#### Q2: Use Case
**When would you use this?**
(Open text)

*Placeholder:* "Describe the situation or workflow where this would help..."

#### Q3: Current Workaround
**How are you handling this today?**
(Open text, optional)

*Placeholder:* "What do you do instead?"

#### Q4: Impact
**How much would this help your workflow?**
- [ ] Game-changer (can't work effectively without it)
- [ ] Major improvement (significant time savings)
- [ ] Nice to have (would use occasionally)
- [ ] Minor convenience

#### Q5: Alternatives Considered
**Have you looked at other tools for this?**
- [ ] Yes, I'm considering switching
- [ ] Yes, but staying with SlideTheory
- [ ] No, haven't looked elsewhere

#### Q6: Contact Permission
**Can we contact you if we build this?**
- [ ] Yes, email me updates
- [ ] No thanks

### Backend Processing

```
Feature Request Workflow:
1. Auto-tag with NLP (category, sentiment)
2. Deduplicate against existing requests
3. Merge with similar requests
4. Add to prioritization board
5. Notify PM if high-impact or churn-risk
```

### Response Template

```
Hi [Name],

Thanks for the feature request! We've added "[Feature Name]" to our 
feedback board where other users can vote on it.

In the meantime, you might find [workaround/alternative] helpful.

We'll keep you posted on any updates!

- The SlideTheory Team
```

---

## 3. Churn/Cancellation Survey

### Purpose
Understand why users leave and identify win-back opportunities.

### Timing
- Immediate (during cancellation flow)
- Optional follow-up email (7 days later)

### Survey

#### Opening
```
We're sorry to see you go! 😢

Your feedback helps us improve. This takes 30 seconds.
```

#### Q1: Primary Reason
**What's the main reason you're leaving?**
- [ ] Too expensive
- [ ] Missing features I need
- [ ] Found a better alternative
- [ ] Not using it enough
- [ ] Too complicated to learn
- [ ] Project/need ended
- [ ] Technical issues/bugs
- [ ] Other: _______

#### Q2: Specific Feedback
**What could we have done better?**
(Open text, optional)

#### Q3: Alternative Tool
**What are you switching to?**
- [ ] Back to PowerPoint/Google Slides
- [ ] Canva
- [ ] Pitch
- [ ] Beautiful.ai
- [ ] Gamma
- [ ] Custom/internal solution
- [ ] Nothing specific
- [ ] Other: _______

#### Q4: Return Potential
**Would you consider coming back?**
- [ ] Yes, if [conditional feature/pricing]
- [ ] Maybe in the future
- [ ] Probably not
- [ ] Definitely not

#### Q5: Win-back Offer (if eligible)
**Before you go...**

If price was a factor: "Would 50% off for 3 months change your mind?"
If features: "Can we hop on a quick call to understand what you need?"
If not using: "Would you like to pause instead of cancel?"

#### Q6: Final Words
**Anything else you'd like to share?**
(Open text)

### Win-back Email Sequence

**Email 1 (Day 7):** "We'd love to understand more..."
**Email 2 (Day 30):** "Here's what's new since you left..."
**Email 3 (Day 90):** "We built [requested feature] - come try it?"

---

## 4. Product-Market Fit Survey

### Purpose
Measure PMF using Sean Ellis' methodology (40% "very disappointed" = PMF)

### Timing
- Users who have experienced core value (created + shared/exported)
- Minimum 2 weeks since signup

### Survey

#### Q1: The PMF Question
**How would you feel if you could no longer use SlideTheory?**
- [ ] Very disappointed
- [ ] Somewhat disappointed
- [ ] Not disappointed (it isn't really that useful)
- [ ] N/A - I no longer use SlideTheory

#### Q2: Alternative (if "Very Disappointed")
**What would you use instead?**
(Open text)

#### Q3: Key Benefit (if "Very Disappointed")
**What is the primary benefit you receive from SlideTheory?**
(Open text)

#### Q4: Improvement Priority (if "Very Disappointed")
**How can we improve SlideTheory for you?**
(Open text)

#### Q5: User Type (if "Somewhat" or "Not Disappointed")
**What type of user do you think would benefit most?**
(Open text)

### Analysis

```
PMF Score Calculation:
- % "Very disappointed" = PMF score
- Target: 40%+ = Product-Market Fit achieved
- 25-40% = Close, iterate on feedback
- <25% = Significant pivot/rework needed
```

---

## 5. NPS Survey (Detailed)

### Purpose
Measure loyalty and collect qualitative feedback

### Timing
- Quarterly to all active users
- Trigger-based after key milestones

### Survey

#### Q1: NPS Score
**How likely are you to recommend SlideTheory to a friend or colleague?**

0 ----- 1 ----- 2 ----- 3 ----- 4 ----- 5 ----- 6 ----- 7 ----- 8 ----- 9 ----- 10
Not at all                                    Extremely likely

#### Q2: Primary Reason
**What's the primary reason for your score?**
(Open text)

#### Q3: Category (conditional)
**Which area most influenced your score?**
- [ ] AI content generation
- [ ] Design/look & feel
- [ ] Ease of use
- [ ] Collaboration features
- [ ] Export options
- [ ] Performance/speed
- [ ] Customer support
- [ ] Pricing/value
- [ ] Something else

#### Promoter Follow-up (9-10)
**Thanks! Would you be willing to...**
- [ ] Write a review on G2/Capterra
- [ ] Provide a testimonial
- [ ] Join our referral program
- [ ] Participate in a case study

#### Detractor Follow-up (0-6)
**We're sorry to hear that. Would you be open to...**
- [ ] A quick call to discuss your experience
- [ ] Sharing more details via email
- [ ] Nothing right now

### NPS Calculation
```
NPS = % Promoters (9-10) - % Detractors (0-6)

Benchmarks:
- Excellent: 50+
- Good: 30-49
- Average: 0-29
- Needs work: <0
```

---

## 6. Quarterly Business Review Survey (Enterprise)

### Purpose
Check health of enterprise relationships

### Timing
- Quarterly
- Sent to account admins/decision makers

### Survey

#### Q1: Overall Satisfaction
**How satisfied are you with SlideTheory overall?**
- [ ] Very satisfied
- [ ] Satisfied
- [ ] Neutral
- [ ] Dissatisfied
- [ ] Very dissatisfied

#### Q2: Feature Adoption
**Which features does your team use regularly?**
- [ ] AI slide generation
- [ ] Templates
- [ ] Brand kit
- [ ] Collaboration/sharing
- [ ] Analytics
- [ ] API/integrations
- [ ] Admin controls

#### Q3: Support Quality
**How would you rate our support?**
- [ ] Excellent
- [ ] Good
- [ ] Average
- [ ] Below average
- [ ] Poor

#### Q4: Expansion Potential
**Are you considering expanding usage?**
- [ ] Adding more seats
- [ ] Upgrading plan
- [ ] Same as current
- [ ] Reducing seats
- [ ] Not sure

#### Q5: Renewal Likelihood
**How likely are you to renew?**
- [ ] Definitely will renew
- [ ] Probably will renew
- [ ] Undecided
- [ ] Probably won't renew
- [ ] Definitely won't renew

#### Q6: Strategic Discussion
**What would you like to discuss on our next check-in call?**
(Open text)

---

## Survey Distribution Channels

| Survey | Channel | Frequency |
|--------|---------|-----------|
| Onboarding | In-app modal, Email | One-time |
| Feature Request | In-app button | Continuous |
| Churn | Cancellation flow | Per-event |
| PMF | Email, In-app | Per-segment |
| NPS | Email, In-app | Quarterly |
| QBR | Email | Quarterly |

## Survey Best Practices

1. **Keep it short** - Under 5 minutes max
2. **Progressive profiling** - Don't ask what you already know
3. **Conditional logic** - Skip irrelevant questions
4. **Mobile-optimized** - 60%+ will be on mobile
5. **Thank participants** - Always close with gratitude
6. **Close the loop** - Share what you learned
7. **Incentivize sparingly** - Only for long surveys

## Survey Tools

- **In-app:** Custom React component
- **Email:** Typeform, SurveyMonkey, or Customer.io
- **Analysis:** Mixpanel, Amplitude, or custom dashboard
