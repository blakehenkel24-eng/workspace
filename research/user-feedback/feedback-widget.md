# SlideTheory In-App Feedback Widget

## Overview
A lightweight, embeddable feedback widget that captures NPS and CSAT scores with optional qualitative feedback.

---

## Features

### NPS (Net Promoter Score)
- **Scale:** 0-10 rating
- **Question:** "How likely are you to recommend SlideTheory to a colleague or friend?"
- **Follow-up:** Open-text field for reasoning

### CSAT (Customer Satisfaction)
- **Scale:** 1-5 stars or emoji reactions (😠 😞 😐 🙂 😍)
- **Question:** "How satisfied are you with SlideTheory today?"
- **Contextual:** Triggered after specific actions (export, share, complete deck)

### Micro-Surveys
- Single-question pulse surveys
- Context-aware triggers
- < 30 seconds to complete

---

## Technical Implementation

### Widget Architecture
```
src/components/FeedbackWidget/
├── FeedbackWidget.tsx       # Main container
├── NPSQuestion.tsx          # NPS 0-10 scale
├── CSATQuestion.tsx         # 5-star rating
├── FollowUpInput.tsx        # Open-text feedback
├── ThankYouScreen.tsx       # Confirmation
├── hooks/
│   ├── useFeedback.ts       # State management
│   └── useTriggerRules.ts   # When to show widget
├── api/
│   └── feedbackApi.ts       # Backend integration
└── types/
    └── feedback.ts
```

### Core Types
```typescript
interface FeedbackSubmission {
  id: string;
  userId: string;
  sessionId: string;
  type: 'nps' | 'csat' | 'micro';
  score: number;
  context?: {
    page: string;
    action: string;
    feature: string;
  };
  comment?: string;
  metadata: {
    browser: string;
    os: string;
    viewport: string;
    timestamp: string;
  };
}

interface WidgetConfig {
  triggerRules: TriggerRule[];
  throttleMs: number;           // Minimum time between prompts
  maxDisplaysPerSession: number;
  dismissRemembers: boolean;    // Don't show again if dismissed
}
```

### Trigger Rules
| Trigger | Condition | Survey Type | Priority |
|---------|-----------|-------------|----------|
| Post-export | After successful PDF export | CSAT | High |
| Completion | Deck marked complete | NPS | High |
| Session length | 10+ min active use | CSAT | Medium |
| Feature use | 3+ uses of new feature | Micro | Medium |
| Return visit | 5th session | NPS | Low |
| Churn signal | No activity 7 days | CSAT | High |

### Display Logic
```typescript
const shouldShowWidget = (): boolean => {
  // Respect user preferences
  if (userDismissedForever) return false;
  
  // Throttle frequency
  if (lastShown && Date.now() - lastShown < THROTTLE_MS) return false;
  
  // Max per session
  if (sessionDisplayCount >= MAX_DISPLAYS) return false;
  
  // Check trigger rules
  return checkTriggerRules(currentContext);
};
```

---

## UI/UX Design

### NPS Widget
```
┌─────────────────────────────────────┐
│  How likely are you to recommend    │
│  SlideTheory to a colleague?        │
│                                     │
│  0 ─ 1 ─ 2 ─ 3 ─ 4 ─ 5 ─ 6 ─ 7 ─ 8 ─ 9 ─ 10  │
│  Not likely              Very likely│
│                                     │
│  [Skip]              [Continue →]   │
└─────────────────────────────────────┘
```

### CSAT Widget (Emoji Variant)
```
┌─────────────────────────────────────┐
│  How's your experience today?       │
│                                     │
│     😠    😞    😐    🙂    😍      │
│                                     │
│  [Tell us more...]                  │
│                                     │
│  [Submit]                           │
└─────────────────────────────────────┘
```

### Follow-up Flow
After score selection:
```
┌─────────────────────────────────────┐
│  Thanks! What's the main reason     │
│  for your score? (optional)         │
│                                     │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │  [Text input area...]         │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  [Skip]              [Submit]       │
└─────────────────────────────────────┘
```

---

## API Endpoints

```
POST /api/v1/feedback
{
  "type": "nps",
  "score": 9,
  "comment": "Love the AI suggestions!",
  "context": {
    "page": "/editor/123",
    "action": "export_pdf"
  }
}

Response: 201 Created
{
  "id": "fb_abc123",
  "received": true,
  "couponCode": null  // Optional reward
}
```

---

## Integration Guide

### React Component
```tsx
import { FeedbackWidget } from '@slidetheory/feedback';

function App() {
  return (
    <>
      <YourApp />
      <FeedbackWidget 
        config={{
          triggers: ['post-export', 'completion'],
          throttleMinutes: 60,
        }}
      />
    </>
  );
}
```

### Initialization
```javascript
SlideTheoryFeedback.init({
  apiKey: 'your-api-key',
  userId: currentUser.id,
  options: {
    theme: 'light',
    position: 'bottom-right',
    primaryColor: '#6366f1'
  }
});
```

---

## Analytics Dashboard Integration

Real-time events sent to dashboard:
- `feedback_shown` - Widget displayed
- `feedback_dismissed` - User closed without submitting
- `feedback_submitted` - Score submitted
- `feedback_commented` - Text feedback provided

---

## Mobile Considerations

- Full-screen modal on mobile (< 480px)
- Larger touch targets (min 44px)
- Swipe to dismiss
- Native keyboard handling

---

## A/B Testing Configurations

| Variant | Description | Hypothesis |
|---------|-------------|------------|
| A | Stars (1-5) for CSAT | Familiar, widely understood |
| B | Emojis for CSAT | More engaging, faster response |
| C | Numbers (0-10) for CSAT | Consistent with NPS |
| D | Slider for NPS | More interactive feel |

---

## Success Metrics

- **Response rate:** Target 15-25%
- **Completion rate:** Target 80%+
- **Qualitative capture:** Target 40% leave comment
- **User annoyance:** Track support tickets mentioning "annoying popup"
