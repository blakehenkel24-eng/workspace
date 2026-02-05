# SlideTheory Feature Voting Board Specs

## Overview
A public feature voting board that enables transparent product development and prioritization based on user demand.

---

## Objectives

1. **Transparency:** Show users what we're building and why
2. **Prioritization:** Use voting to guide roadmap decisions
3. **Engagement:** Build community around product evolution
4. **Feedback:** Collect detailed context on feature requests
5. **Retention:** Reduce churn by showing we listen

---

## Board Architecture

### URL Structure
```
slidetheory.com/roadmap
├── /roadmap              # Main board view
├── /roadmap/[feature-id] # Individual feature page
├── /roadmap/submit       # Submit new idea
└── /roadmap/my-votes     # User's voted features
```

### Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]    Product Roadmap                      [Submit Idea]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Filter: [All Categories ▼] [Status ▼] [Sort ▼]  [Search...]   │
│                                                                 │
│  Categories: [All] [AI] [Editor] [Templates] [Collaboration]   │
│              [Export] [Integrations] [Mobile]                  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📊 STATUS OVERVIEW                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │   Shipped   │ │  In Progress│ │ Under Review│               │
│  │    1,247    │ │     23      │ │    156      │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🚀 TOP REQUESTED THIS MONTH                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🔥 Dark Mode Support                                   │   │
│  │     👁 2,847 votes  │  💬 89 comments  │  🏷️ UI        │   │
│  │     "Planned for Q2 2024"                               │   │
│  │     [Vote ▲]                                            │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  Team Workspaces                                        │   │
│  │     👁 1,923 votes  │  💬 45 comments  │  🏷️ Collaboration│  │
│  │     "Under Review"                                      │   │
│  │     [Vote ▲] [Voted ✓]                                  │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  Custom Fonts                                           │   │
│  │     👁 1,567 votes  │  💬 32 comments  │  🏷️ Design     │   │
│  │     "In Progress"                                       │   │
│  │     [Vote ▲]                                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Load More...]                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Feature Card Component

```
┌─────────────────────────────────────────────────────────────────┐
│  [Icon] Feature Title                              [Category]   │
│  Brief description of the feature...                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🖼 Preview image or mockup                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  👤 1,247 votes    💬 34 comments    👁 5,234 views            │
│                                                                 │
│  [Status Badge: In Progress]                                    │
│                                                                 │
│  ┌──────────┐  ┌────────────┐                                   │
│  │  ▲ Vote  │  │ 💬 Comment │                                   │
│  │  or      │  └────────────┘                                   │
│  │  ✓ Voted │                                                   │
│  └──────────┘                                                   │
│                                                                 │
│  Last updated: 2 days ago by @sarah                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Feature Detail Page

```
┌─────────────────────────────────────────────────────────────────┐
│  [Back to Roadmap]                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Dark Mode Support                                    [🏷️ UI]  │
│  #247    Posted by @mike on Jan 15, 2024                        │
│                                                                 │
│  [Status: Planned for Q2 2024]                                  │
│                                                                 │
│  ## Description                                                 │
│  A dark mode option for the editor that reduces eye strain      │
│  during late-night work sessions. Should include:               │
│  - Dark editor theme                                            │
│  - Dark preview mode                                            │
│  - System preference detection                                  │
│  - Manual toggle in settings                                    │
│                                                                 │
│  ## Why This Matters                                            │
│  Many users work evenings and prefer dark interfaces.           │
│  Also helps with accessibility for light-sensitive users.       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    [Mockup Image]                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────┐  👤 2,847 votes  💬 89 comments                  │
│  │  ▲ Vote  │                                                   │
│  │  or      │  You and 2,846 others want this feature          │
│  │  ✓ Voted │  Priority: #3 this month                         │
│  └──────────┘                                                   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Official Updates                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ @alex (Product Team) - 3 days ago                      │   │
│  │                                                         │   │
│  │ We're excited to share that Dark Mode is now in        │   │
│  │ development! Targeting Q2 2024 release.                │   │
│  │                                                         │   │
│  │ Here's a sneak peek of the design...                   │   │
│  │ [Image]                                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  User Comments (89)                                             │
│  Sort by: [Top ▼] [Newest]                                      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ @sarah - 2 days ago                                     │   │
│  │                                                         │   │
│  │ This would be huge for my team! We often work late     │   │
│  │ preparing pitch decks. Please make sure the export     │   │
│  │ PDFs also respect the theme.                           │   │
│  │                                                         │   │
│  │ 👍 24  👎 0  [Reply]                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ @designer_dana - 1 week ago                             │   │
│  │                                                         │   │
│  │ Would love to see this support custom dark themes,     │   │
│  │ not just a single dark mode. Our brand has specific    │   │
│  │ dark mode colors.                                      │   │
│  │                                                         │   │
│  │ @alex (Product Team) - 1 week ago                      │   │
│  │ Great point! We're building it to support custom       │   │
│  │ color palettes. More details coming soon.              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Load more comments...]                                        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Add a comment...                                        │   │
│  │                                                         │   │
│  │ [Text area]                                             │   │
│  │                                                         │   │
│  │ [Post Comment]                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Subscribe to updates]                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Model

```typescript
interface FeatureRequest {
  id: string;
  slug: string;
  title: string;
  description: string;
  author: User;
  
  // Categorization
  category: Category;
  tags: string[];
  
  // Status
  status: 'submitted' | 'under_review' | 'planned' | 'in_progress' | 'shipped' | 'declined';
  statusChangedAt: Date;
  statusChangedBy: User;
  
  // Target release
  targetQuarter?: string;
  
  // Engagement
  votes: number;
  voters: User[];
  views: number;
  comments: Comment[];
  
  // Official updates
  updates: OfficialUpdate[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  mergedInto?: FeatureRequest; // For duplicates
}

interface Vote {
  id: string;
  userId: string;
  featureId: string;
  createdAt: Date;
}

interface Comment {
  id: string;
  author: User;
  content: string;
  parentId?: string; // For threaded replies
  votes: number;
  isOfficial: boolean;
  createdAt: Date;
}

interface OfficialUpdate {
  id: string;
  author: User;
  content: string;
  images?: string[];
  createdAt: Date;
}
```

---

## Status Definitions

| Status | Color | Description | Visibility |
|--------|-------|-------------|------------|
| **Submitted** | Gray | New request, pending review | Public |
| **Under Review** | Blue | Being evaluated by product team | Public |
| **Planned** | Purple | Committed to roadmap, not started | Public |
| **In Progress** | Yellow | Currently being built | Public |
| **Beta** | Orange | Available in beta for testing | Public |
| **Shipped** | Green | Released to all users | Public |
| **Declined** | Red | Won't be built (with reason) | Public |
| **Duplicate** | Gray | Merged with existing request | Public |

---

## Categories

| Category | Icon | Description |
|----------|------|-------------|
| AI & Generation | 🤖 | AI-powered features |
| Editor | ✏️ | Core editing experience |
| Templates | 📑 | Template system |
| Design | 🎨 | Visual design tools |
| Collaboration | 👥 | Team features |
| Export | 📤 | Export and sharing |
| Integrations | 🔌 | Third-party connections |
| Mobile | 📱 | Mobile apps |
| Performance | ⚡ | Speed and reliability |
| Admin | ⚙️ | Account and settings |

---

## Voting System

### Rules
- 1 vote per user per feature
- Users have unlimited votes
- Can change/unvote anytime
- Voting requires account
- Anonymous browsing allowed

### Vote Weighting (Optional)
```
Basic user: 1×
Pro user: 2×
Team/Enterprise: 3×
Beta tester: 1.5×
```

### Vote Notifications
- Email when voted feature changes status
- Weekly digest of top voted features
- Optional: notify when comment added

---

## Submission Flow

### Step 1: Search for Duplicates
```
Before submitting, check if this already exists:
[Search existing ideas...]

Similar ideas found:
• Dark Mode Support (2,847 votes)
• Night Theme Option (234 votes)
• Custom Color Themes (567 votes)

[None of these - Continue Submitting]
```

### Step 2: Submit Form
```
┌─────────────────────────────────────────────────────────────────┐
│  Submit a Feature Idea                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Title *                                                        │
│  [Brief, clear title...]                                        │
│                                                                 │
│  Category *                                                     │
│  [Dropdown]                                                     │
│                                                                 │
│  Description *                                                  │
│  [Detailed description of the feature...]                       │
│  [Markdown supported]                                           │
│                                                                 │
│  Why is this important?                                         │
│  [Help us understand the use case...]                           │
│                                                                 │
│  How would you use this?                                        │
│  [Describe your workflow...]                                    │
│                                                                 │
│  Attachments                                                    │
│  [📎 Upload images or mockups]                                  │
│                                                                 │
│  [Submit Idea]                                                  │
│                                                                 │
│  By submitting, you agree to our Community Guidelines.          │
└─────────────────────────────────────────────────────────────────┘
```

### Step 3: Post-Submission
```
✅ Idea Submitted!

Your idea "Dark Mode Support" has been submitted.

What's next:
• Our team will review within 48 hours
• You'll be notified of status changes
• Share with others to gather votes!

[View Your Idea]  [Share on Twitter]  [Submit Another]
```

---

## Admin Workflow

### Review Queue
```
┌─────────────────────────────────────────────────────────────────┐
│  Pending Review (12)                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Quick Filter: New today (3) | This week (8) | All (12)]      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Custom Animations                        New • 2h ago  │   │
│  │ Request by @startup_sarah                               │   │
│  │                                                         │   │
│  │ "I'd love to add custom animations between slides..."  │   │
│  │                                                         │   │
│  │ [Mark Duplicate] [Approve] [Decline] [Edit]            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Load more...]                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Actions

| Action | Result |
|--------|--------|
| **Approve** | Published to board, user notified |
| **Decline** | Not published (requires reason), user notified |
| **Merge** | Combined with existing feature, votes aggregated |
| **Edit** | Modify title/description for clarity |
| **Feature** | Pin to top of board |

---

## Prioritization Integration

### Automatic Prioritization Score
```
Priority Score = (Votes × Vote Weight) + 
                 (Comments × 2) + 
                 (User Segment Weight) +
                 (Recency Factor)

Where:
- User Segment Weight: Enterprise (+50), Team (+30), Pro (+10)
- Recency Factor: More recent = higher (decay over time)
```

### PM Review Dashboard
```
┌─────────────────────────────────────────────────────────────────┐
│  Prioritization Queue                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Top 10 by Votes:                        Top 10 by PM Score:   │
│  1. Dark Mode (2,847)                    1. Team Workspaces    │
│  2. Custom Fonts (1,567)                 2. API Access         │
│  3. Team Workspaces (1,923)              3. Dark Mode          │
│                                                                 │
│  [View Full Analysis]                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### Tech Stack
- **Frontend:** Next.js + Tailwind
- **Backend:** Node.js + PostgreSQL
- **Search:** Algolia or Elasticsearch
- **Auth:** Existing SlideTheory auth
- **Images:** Cloudinary or S3
- **Notifications:** Customer.io or SendGrid

### API Endpoints
```
GET    /api/features           # List features
GET    /api/features/:id       # Get feature details
POST   /api/features           # Submit new feature
POST   /api/features/:id/vote  # Vote on feature
DELETE /api/features/:id/vote  # Remove vote
POST   /api/features/:id/comment # Add comment
GET    /api/categories         # List categories
```

### Performance Targets
- Page load: < 2 seconds
- Vote action: < 100ms
- Search results: < 200ms
- Real-time updates: WebSocket

---

## Community Guidelines

### Rules
1. **Be constructive** - Focus on problems and solutions
2. **Search first** - Check for duplicates before posting
3. **One idea per post** - Keep requests focused
4. **No spam** - Don't create multiple accounts to vote
5. **Be respectful** - Treat others with respect

### Moderation
- Auto-flag: Profanity, spam patterns
- Report button on all content
- PM team reviews daily
- Ban repeat offenders

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Monthly active voters | 20% of user base |
| Submission rate | 5% of users submit ideas |
| Vote-to-view ratio | 10% |
| Comment rate | 3% of voters comment |
| Feature shipped from board | 30% of releases |
| User satisfaction with transparency | 4.5/5 |

---

## Launch Plan

### Phase 1: Internal (Week 1)
- [ ] Set up infrastructure
- [ ] Import existing feature requests
- [ ] Team training on moderation

### Phase 2: Beta Users (Week 2)
- [ ] Announce to beta community
- [ ] Seed with team submissions
- [ ] Gather initial feedback

### Phase 3: Public Launch (Week 3)
- [ ] Announce in-app and email
- [ ] Blog post about transparency
- [ ] Social media promotion

### Phase 4: Iteration (Ongoing)
- [ ] Weekly PM reviews
- [ ] Monthly roadmap updates
- [ ] Quarterly community reports
