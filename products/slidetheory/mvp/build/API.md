# SlideTheory API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently no authentication required for MVP. For production, implement API key or OAuth.

## Endpoints

### Health Check

Check server status and version.

```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "version": "1.1.0",
  "timestamp": "2025-02-04T14:30:00.000Z"
}
```

---

### Get Templates

Retrieve list of all available templates.

```http
GET /api/templates
```

**Response:**
```json
{
  "success": true,
  "templates": [
    {
      "id": "tech-startup-series-b",
      "name": "Tech Startup Series B",
      "category": "Pitch Deck",
      "icon": "🚀",
      "description": "AI SaaS platform fundraising deck for Series B round"
    }
  ]
}
```

---

### Get Template Details

Retrieve full details of a specific template.

```http
GET /api/templates/:id
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | string | Template ID |

**Response:**
```json
{
  "success": true,
  "template": {
    "id": "tech-startup-series-b",
    "name": "Tech Startup Series B",
    "category": "Pitch Deck",
    "icon": "🚀",
    "description": "AI SaaS platform fundraising deck for Series B round",
    "slideType": "Executive Summary",
    "context": "NexusAI is an enterprise AI platform...",
    "dataPoints": ["ARR: $8.2M", "..."],
    "targetAudience": "Investors",
    "framework": "Pyramid Principle"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Template not found"
}
```

---

### Generate Slide (v1 - Legacy)

Generate a slide with AI-powered content.

```http
POST /api/generate
```

**Request Body:**
```json
{
  "slideType": "Executive Summary",
  "context": "Q3 earnings showing 23% revenue growth...",
  "dataPoints": ["Revenue: $5.2M", "Growth: +23%"],
  "targetAudience": "C-Suite",
  "framework": "Pyramid Principle"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| slideType | string | Yes | `Executive Summary`, `Market Analysis`, or `Financial Model` |
| context | string | Yes | 10-500 characters describing the slide purpose |
| dataPoints | array | No | Array of data point strings |
| targetAudience | string | Yes | `C-Suite`, `Board`, `Investors`, `Internal Team`, `Clients`, `Analysts` |
| framework | string | No | `Pyramid Principle`, `MECE`, `2x2 Matrix`, `Waterfall Chart`, `SWOT` |

**Response:**
```json
{
  "success": true,
  "slideId": "550e8400-e29b-41d4-a716-446655440000",
  "imageUrl": "/slides/550e8400-e29b-41d4-a716-446655440000.png",
  "title": "Strategic Recommendations for Growth",
  "content": {
    "title": "Strategic Recommendations for Growth",
    "subtitle": "Capitalizing on market momentum",
    "keyPoints": [...],
    "recommendation": "...",
    "footer": { "source": "...", "date": "..." }
  },
  "expiresAt": "2025-02-05T14:30:00.000Z"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | INVALID_INPUT | Missing required fields |
| 400 | INVALID_SLIDE_TYPE | Slide type not in allowed list |
| 400 | INVALID_CONTEXT | Context too short (<10) or too long (>500) |
| 500 | GENERATION_FAILED | AI or rendering error |

---

### Generate Slide v2 (With Progress Tracking)

Generate a slide using the hybrid renderer with real-time progress tracking.

```http
POST /api/generate-slide-v2
```

**Request Body:**
```json
{
  "slideType": "Executive Summary",
  "context": "Q3 earnings showing 23% revenue growth...",
  "keyTakeaway": "Revenue growth of 25% positions us for Series B",
  "audience": "C-Suite/Board",
  "presentationMode": "presentation",
  "dataInput": "Revenue:\t$5.2M (+23%)\nCustomers:\t1,240 (+45%)"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| slideType | string | Yes | `Executive Summary`, `Horizontal Flow`, `Vertical Flow`, `Graph/Chart`, `General` |
| context | string | Yes | 10-2000 characters describing the slide purpose |
| keyTakeaway | string | Yes | 5-150 character key message |
| audience | string | Yes | `C-Suite/Board`, `External Client`, `Internal/Working Team`, `PE/Investors` |
| presentationMode | string | No | `presentation` (less detail) or `read` (more detail) |
| dataInput | string | No | Tabular data, CSV, or metrics |

**Response:**
```json
{
  "success": true,
  "jobId": "job_abc123",
  "slideId": "550e8400-e29b-41d4-a716-446655440000",
  "imageUrl": "/slides/550e8400-e29b-41d4-a716-446655440000.png",
  "title": "Revenue Growth Accelerates to 25%",
  "content": { ... },
  "expiresAt": "2025-02-05T14:30:00.000Z",
  "durationMs": 4200,
  "renderStats": {
    "durationMs": 850,
    "width": 1920,
    "height": 1080
  }
}
```

**Integration with Progress Tracking:**

After calling this endpoint, connect to the SSE endpoint for real-time progress:

```javascript
const evtSource = new EventSource(`/api/progress/${response.jobId}`);
evtSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Update progress UI
};
```

---

### Get Progress (SSE)

Connect to Server-Sent Events endpoint for real-time progress updates.

```http
GET /api/progress/:jobId
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| jobId | string | Job ID from generate-slide-v2 response |

**SSE Events:**

| Event Type | Data | Description |
|------------|------|-------------|
| `connected` | `{ jobId, percent, ... }` | Initial connection established |
| `progress` | `{ jobId, step, stepLabel, percent, estimateSeconds }` | Step progress update |
| `complete` | `{ jobId, result, durationMs }` | Generation completed |
| `error` | `{ jobId, error, durationMs }` | Generation failed |
| `cancelled` | `{ jobId }` | Job was cancelled |

**Progress Steps:**
1. `validate` - Validating input (5%)
2. `prompt_build` - Building prompt (10%)
3. `ai_generate` - AI content generation (50%)
4. `render` - Rendering slide (25%)
5. `export` - Finalizing (10%)

---

### Cancel Generation

Cancel a running slide generation job.

```http
POST /api/progress/:jobId/cancel
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| jobId | string | Job ID to cancel |

**Response:**
```json
{
  "success": true,
  "message": "Job cancelled"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Job not found or already completed"
}
```

---

### List Active Jobs

Get a list of currently active generation jobs (for monitoring).

```http
GET /api/progress
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "jobs": [
    {
      "jobId": "job_abc123",
      "currentStep": "ai_generate",
      "currentStepLabel": "Generating content...",
      "percent": 45,
      "estimateSeconds": 3,
      "isCancelled": false,
      "durationMs": 2300
    }
  ]
}
```

---

### Export to PowerPoint

Generate a .pptx file from slide content.

```http
POST /api/export/pptx
```

**Request Body:**
```json
{
  "slideType": "Executive Summary",
  "content": {
    "title": "Slide Title",
    "subtitle": "Subtitle",
    "keyPoints": [
      {"heading": "Point 1", "text": "Description"}
    ],
    "recommendation": "Recommendation text",
    "footer": {"source": "Source", "date": "Feb 2025"}
  }
}
```

**Response:**
```json
{
  "success": true,
  "exportId": "660e8400-e29b-41d4-a716-446655440000",
  "downloadUrl": "/exports/660e8400-e29b-41d4-a716-446655440000.pptx",
  "format": "pptx",
  "expiresAt": "2025-02-04T15:30:00.000Z"
}
```

---

### Export to PDF

Generate a PDF file from slide content.

```http
POST /api/export/pdf
```

**Request Body:** Same as PPTX export

**Response:**
```json
{
  "success": true,
  "exportId": "770e8400-e29b-41d4-a716-446655440000",
  "downloadUrl": "/exports/770e8400-e29b-41d4-a716-446655440000.pdf",
  "format": "pdf",
  "expiresAt": "2025-02-04T15:30:00.000Z"
}
```

---

### Get Analytics

Retrieve usage analytics.

```http
GET /api/stats
```

**Response:**
```json
{
  "success": true,
  "totalSlides": 42,
  "byType": {
    "Executive Summary": 18,
    "Market Analysis": 15,
    "Financial Model": 9
  },
  "byDay": {
    "2025-02-04": { "total": 5, "byType": { "Executive Summary": 2, ... } }
  },
  "lastGenerated": "2025-02-04T14:30:00.000Z",
  "createdAt": "2025-02-01T00:00:00.000Z"
}
```

---

### Download Generated Slide

Retrieve generated slide image.

```http
GET /slides/:id.png
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| id | string | Slide UUID from generation response |

**Response:** PNG image file

---

### Download Export

Retrieve exported PPTX or PDF file.

```http
GET /exports/:filename
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| filename | string | Export filename from export response |

**Response:** PPTX or PDF file

---

## Content Structures

### Executive Summary Content

```json
{
  "title": "Action-oriented headline",
  "subtitle": "Supporting insight",
  "keyPoints": [
    {"heading": "Point 1", "text": "Description"},
    {"heading": "Point 2", "text": "Description"},
    {"heading": "Point 3", "text": "Description"}
  ],
  "recommendation": "Clear recommendation",
  "footer": {"source": "Source", "date": "Feb 2025"}
}
```

### Market Analysis Content

```json
{
  "title": "Market headline",
  "marketSize": "$2.4B (growing 18% annually)",
  "insights": ["Insight 1", "Insight 2", "Insight 3"],
  "chartData": {
    "type": "bar",
    "labels": ["Segment A", "Segment B", "Segment C"],
    "values": [35, 40, 25]
  },
  "footer": {"source": "Source", "date": "Feb 2025"}
}
```

### Financial Model Content

```json
{
  "title": "Financial headline",
  "metrics": [
    {"label": "Revenue", "value": "$5.2M", "change": "+23%", "period": "YoY"},
    {"label": "Gross Margin", "value": "68%", "change": "+4pp", "period": "YoY"}
  ],
  "tableData": {
    "headers": ["Metric", "2023", "2024", "2025E"],
    "rows": [
      ["Revenue ($M)", "4.2", "5.2", "6.8"],
      ["Growth %", "15%", "23%", "31%"]
    ]
  },
  "footer": {"source": "Source", "date": "Feb 2025"}
}
```

---

## Rate Limits

Current MVP has no rate limiting. For production:
- 100 requests/minute per IP
- 1000 requests/hour per API key

## File Expiration

| File Type | Expiration |
|-----------|------------|
| Slide PNG | 24 hours |
| PPTX Export | 1 hour |
| PDF Export | 1 hour |

---

## Error Codes

| Code | Description |
|------|-------------|
| INVALID_INPUT | Missing or invalid required parameters |
| INVALID_SLIDE_TYPE | Slide type not in allowed list |
| INVALID_CONTEXT | Context length validation failed |
| GENERATION_FAILED | AI content or image rendering failed |
| EXPORT_FAILED | PPTX or PDF generation failed |
| NOT_FOUND | Resource (template, slide, export) not found |
| INTERNAL_ERROR | Unexpected server error |

---

# Advanced AI Features API

## List Available Features

Retrieve all available advanced AI features.

```http
GET /api/ai/advanced/features
```

**Response:**
```json
{
  "success": true,
  "features": [
    {
      "id": "suggest-templates",
      "name": "Smart Template Suggestions",
      "description": "AI analyzes your content and suggests optimal slide templates",
      "endpoint": "POST /api/ai/suggest-templates",
      "parameters": ["content", "purpose", "targetAudience"]
    }
  ],
  "totalFeatures": 8
}
```

---

## 1. Smart Template Suggestions

Analyze content and get AI-recommended slide templates.

```http
POST /api/ai/suggest-templates
```

**Request Body:**
```json
{
  "content": "Q3 revenue grew 23% to $5.2M, driven by enterprise customer acquisition. Market size is $2.4B growing at 18% annually. Key competitors include...",
  "purpose": "Investor pitch",
  "targetAudience": "Series B investors"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | string | Yes | Content to analyze (max 10000 chars) |
| purpose | string | No | Presentation purpose (pitch, report, training) |
| targetAudience | string | No | Target audience description |

**Response:**
```json
{
  "success": true,
  "suggestions": [
    {
      "templateType": "Financial Model",
      "confidence": 0.9,
      "reasoning": "Content contains financial metrics and growth data suitable for financial modeling",
      "recommendedPosition": "middle",
      "estimatedSlideCount": 2
    },
    {
      "templateType": "Market Analysis",
      "confidence": 0.85,
      "reasoning": "Market size and growth data present - ideal for market overview slide",
      "recommendedPosition": "opening",
      "estimatedSlideCount": 2
    }
  ],
  "recommendedFlow": ["Market Analysis", "Financial Model", "Executive Summary"],
  "contentGaps": ["Consider adding customer acquisition cost data", "Include competitive positioning details"],
  "audienceFit": "Well-suited for investor audience seeking growth metrics"
}
```

---

## 2. Auto-Generate Deck from Document

Convert PDF, Word, or text documents into complete slide decks.

```http
POST /api/ai/generate-deck
```

**Request Body:**
```json
{
  "documentContent": "Annual Report 2024... [extracted text from PDF/Word]",
  "documentType": "pdf",
  "title": "Q4 2024 Strategic Review",
  "targetAudience": "Board of Directors",
  "maxSlides": 10
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| documentContent | string | Yes | Extracted text from document |
| documentType | string | Yes | `pdf`, `word`, or `text` |
| title | string | No | Presentation title |
| targetAudience | string | No | Target audience |
| maxSlides | number | No | Maximum slides (default 10, max 20) |

**Response:**
```json
{
  "success": true,
  "deckTitle": "Q4 2024 Strategic Review",
  "subtitle": "Board Presentation",
  "totalSlides": 8,
  "slides": [
    {
      "slideNumber": 1,
      "type": "Title",
      "title": "Q4 2024 Strategic Review",
      "content": {
        "subtitle": "Board of Directors Presentation"
      },
      "speakerNotes": "Welcome and agenda overview",
      "designNotes": "Use company branding"
    },
    {
      "slideNumber": 2,
      "type": "Executive Summary",
      "title": "Record Revenue Growth of 23%",
      "content": {
        "keyPoints": ["Revenue: $5.2M (+23% YoY)", "New enterprise clients: 12"],
        "recommendation": "Accelerate investment in sales team"
      },
      "speakerNotes": "Highlight momentum and key wins",
      "designNotes": "Bold headline with supporting metrics"
    }
  ],
  "keyInsights": [
    "Revenue growth significantly outpaced industry average",
    "Enterprise segment showing strong traction",
    "Market expansion opportunity in APAC region"
  ],
  "callToAction": "Approve 2025 budget for sales expansion",
  "sourceDocument": {
    "type": "pdf",
    "title": "Q4 2024 Strategic Review",
    "processedAt": "2025-02-05T12:00:00.000Z"
  }
}
```

---

## 3. Data Visualization Recommendations

Get AI-powered chart recommendations for your data.

```http
POST /api/ai/recommend-visualizations
```

**Request Body:**
```json
{
  "data": [
    { "month": "Jan", "revenue": 420000, "customers": 850 },
    { "month": "Feb", "revenue": 480000, "customers": 920 },
    { "month": "Mar", "revenue": 520000, "customers": 1010 }
  ],
  "dataDescription": "Monthly revenue and customer count for Q1 2024",
  "insightGoal": "Show growth trend and correlation between customers and revenue"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| data | array | Yes | Array of data objects (max 1000 rows) |
| dataDescription | string | No | Description of what the data represents |
| insightGoal | string | No | What insight to highlight |

**Response:**
```json
{
  "success": true,
  "dataPoints": 3,
  "primaryRecommendation": {
    "chartType": "line",
    "rationale": "Line chart best shows trends over time and allows dual-axis for correlation visualization",
    "effectiveness": 0.92
  },
  "alternatives": [
    {
      "chartType": "combo",
      "rationale": "Bar for revenue + line for customers on dual axis",
      "effectiveness": 0.88
    }
  ],
  "designGuidelines": {
    "colors": ["#1f4e79", "#ed7d31"],
    "annotations": ["Highlight 23% growth peak", "Mark customer milestone"],
    "axisStrategy": "Dual y-axis: left for revenue ($), right for customers (count)",
    "dataLabels": true
  },
  "storytellingTips": [
    "Start with the trend: 'Revenue grew consistently across Q1'",
    "Point out correlation: 'Each new customer adds ~$500 in revenue'",
    "End with forward projection"
  ]
}
```

---

## 4. Content Rewriting

Rewrite content to shorten, expand, simplify, or adapt tone.

```http
POST /api/ai/rewrite
```

**Request Body:**
```json
{
  "content": "The company has been utilizing various strategies to optimize its market position and leverage existing assets for maximum returns.",
  "style": "simplify",
  "targetLength": 15
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | string | Yes | Content to rewrite (max 5000 chars) |
| style | string | Yes | `shorten`, `expand`, `simplify`, `executive`, `technical` |
| targetLength | number | No | Target word count |

**Styles:**
- `shorten` - Make concise, remove filler words
- `expand` - Add detail and supporting arguments
- `simplify` - Plain language for general audience
- `executive` - Focus on business impact and ROI
- `technical` - Include precise terminology

**Response:**
```json
{
  "success": true,
  "rewrittenContent": "We're improving market position to boost returns.",
  "originalLength": 18,
  "newLength": 9,
  "reductionPercent": 50,
  "keyChanges": [
    "Removed jargon: 'utilizing' → 'using'",
    "Simplified: 'optimize market position' → 'improving market position'",
    "Consolidated redundant phrases"
  ],
  "suggestions": [
    "Add specific metrics if available",
    "Consider audience familiarity with industry terms"
  ]
}
```

---

## 5. Story Flow Generator

Create a narrative arc across multiple slides.

```http
POST /api/ai/story-flow
```

**Request Body:**
```json
{
  "topic": "Cloud migration strategy",
  "objective": "Get board approval for $2M cloud investment",
  "slideCount": 7,
  "targetAudience": "Board of Directors"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| topic | string | Yes | Main topic/story subject |
| objective | string | Yes | What audience should do/think |
| slideCount | number | No | Number of slides (3-12, default 5) |
| targetAudience | string | No | Target audience |

**Response:**
```json
{
  "success": true,
  "storyTitle": "Cloud Migration: Unlocking 40% Cost Savings",
  "narrativeArc": "Problem → Analysis → Solution → Impact → Action",
  "slides": [
    {
      "position": 1,
      "phase": "HOOK",
      "title": "Infrastructure Costs Up 35% YoY",
      "type": "Executive Summary",
      "contentFocus": "Cost escalation trend and urgency",
      "keyMessage": "Current trajectory is unsustainable",
      "transition": "But this isn't just about cost..."
    },
    {
      "position": 2,
      "phase": "CONTEXT",
      "title": "Cloud Market Matures with Proven ROI",
      "type": "Market Analysis",
      "contentFocus": "Industry shift to cloud, benchmark data",
      "keyMessage": "Cloud is now table stakes",
      "transition": "Here's what our analysis reveals..."
    },
    {
      "position": 7,
      "phase": "ACTION",
      "title": "Approve $2M Investment for 40% Savings",
      "type": "Executive Summary",
      "contentFocus": "Clear ask with ROI justification",
      "keyMessage": "Board approval needed to proceed",
      "transition": "Ready for questions"
    }
  ],
  "storytellingTips": [
    "Start with the pain point to create urgency",
    "Use the 'rule of three' for key benefits",
    "End with specific ask and timeline"
  ],
  "audienceEngagement": [
    "Ask: 'What's your experience with cloud costs?'",
    "Pause before revealing the ROI number"
  ]
}
```

---

## 6. Speaker Notes Generator

Generate detailed speaker notes for confident presentation delivery.

```http
POST /api/ai/speaker-notes
```

**Request Body:**
```json
{
  "slideContent": {
    "title": "Revenue Growth Accelerates to 25%",
    "keyPoints": [
      { "heading": "Q3 Performance", "text": "Revenue reached $5.2M" },
      { "heading": "Growth Drivers", "text": "Enterprise segment leading" }
    ],
    "recommendation": "Invest in enterprise sales team"
  },
  "slideType": "Executive Summary",
  "duration": 3,
  "audienceLevel": "expert"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| slideContent | object/string | Yes | Slide content |
| slideType | string | No | Type of slide |
| duration | number | No | Speaking time in minutes (1-10, default 2) |
| audienceLevel | string | No | `novice`, `intermediate`, `expert` |

**Response:**
```json
{
  "success": true,
  "openingHook": "Our Q3 numbers tell a compelling story - revenue growth accelerated to 25%, our fastest pace this year.",
  "keyTalkingPoints": [
    {
      "point": "Set the context with Q3 performance",
      "elaboration": "Walk through the $5.2M revenue figure, contextualizing against Q2 and Q1 trends",
      "timing": "~45 seconds"
    },
    {
      "point": "Highlight enterprise segment strength",
      "elaboration": "Emphasize that enterprise is driving growth - this is our highest-margin segment",
      "timing": "~60 seconds"
    }
  ],
  "transitions": {
    "toThisSlide": "Turning to our Q3 performance...",
    "toNextSlide": "This performance positions us well for our next initiative..."
  },
  "audienceEngagement": [
    "Ask: 'Are you seeing similar trends in your portfolio companies?'",
    "Pause after announcing 25% growth for impact"
  ],
  "deliveryTips": [
    "Maintain confident, upbeat tone",
    "Use gestures when emphasizing growth percentage",
    "Make eye contact during recommendation"
  ],
  "anticipatedQuestions": [
    "What drove the acceleration vs Q2?",
    "Is this growth sustainable?",
    "How does this compare to your forecast?"
  ],
  "backupContent": "Detailed cohort analysis and churn data available in appendix",
  "totalDuration": "3 minutes"
}
```

### Generate Speaker Notes for Entire Deck

```http
POST /api/ai/speaker-notes/deck
```

**Request Body:**
```json
{
  "slides": [
    { "title": "Introduction", "type": "Title", "content": {...} },
    { "title": "Market Analysis", "type": "Market Analysis", "content": {...} }
  ],
  "durationPerSlide": 2,
  "audienceLevel": "intermediate"
}
```

---

## 7. Q&A Anticipation

Predict questions your audience might ask.

```http
POST /api/ai/anticipate-questions
```

**Request Body:**
```json
{
  "content": {
    "title": "Cloud Migration Strategy",
    "keyPoints": ["$2M investment", "40% cost savings", "18-month timeline"]
  },
  "targetAudience": "Board of Directors",
  "purpose": "Seeking approval for cloud migration investment"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | object/string | Yes | Slide or presentation content |
| targetAudience | string | No | Target audience |
| purpose | string | No | Presentation purpose |

**Response:**
```json
{
  "success": true,
  "highProbability": [
    {
      "question": "What is the timeline for realizing the 40% savings?",
      "probability": 0.92,
      "category": "Financial",
      "suggestedAnswer": "We expect to see initial 15% savings within 6 months, with full 40% realized by month 18 post-migration.",
      "supportingData": ["Phased migration schedule", "Cost breakdown by phase"],
      "followUpQuestions": ["What if we're delayed?", "Are there early wins?"]
    },
    {
      "question": "What are the main risks with this migration?",
      "probability": 0.88,
      "category": "Risk",
      "suggestedAnswer": "Primary risks are migration downtime and vendor lock-in. We've mitigated with phased rollout and multi-cloud architecture.",
      "supportingData": ["Risk matrix", "Mitigation strategies"],
      "followUpQuestions": ["What's our rollback plan?"]
    }
  ],
  "mediumProbability": [
    {
      "question": "How does this compare to what our competitors are doing?",
      "probability": 0.65,
      "category": "Strategic",
      "suggestedAnswer": "Industry benchmarks show 60% of peers have migrated. Those who did report 30-50% savings."
    }
  ],
  "challengingQuestions": [
    {
      "question": "What if the cloud provider increases prices?",
      "whyDifficult": "Implaws vulnerability in the plan",
      "strategy": "Acknowledge risk, highlight contract terms and portability",
      "safeResponse": "We've negotiated 3-year price locks and designed for portability across providers."
    }
  ],
  "preparationTips": [
    "Have detailed TCO analysis ready",
    "Prepare appendix slides with technical architecture"
  ],
  "confidenceBoosters": [
    "Similar migration completed successfully at previous company",
    "Pilot phase already showing 12% savings"
  ]
}
```

---

## 8. Content Translation

Translate slide content to other languages.

```http
POST /api/ai/translate
```

**Request Body:**
```json
{
  "content": {
    "title": "Revenue Growth Strategy",
    "keyPoints": ["Expand into new markets", "Increase customer retention"]
  },
  "targetLanguage": "Spanish",
  "sourceLanguage": "English",
  "preserveFormatting": true
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | object/string | Yes | Content to translate (max 5000 chars) |
| targetLanguage | string | Yes | Target language (e.g., Spanish, French, German, Chinese) |
| sourceLanguage | string | No | Source language (auto-detect if not provided) |
| preserveFormatting | boolean | No | Keep formatting/markup (default: true) |

**Response:**
```json
{
  "success": true,
  "translatedContent": {
    "title": "Estrategia de Crecimiento de Ingresos",
    "keyPoints": ["Expandirse a nuevos mercados", "Aumentar la retención de clientes"]
  },
  "targetLanguage": "Spanish",
  "sourceLanguage": "English",
  "confidence": 0.96,
  "notes": [
    "'Revenue' translated as 'Ingresos' (common in LATAM) vs 'Facturación' (Spain)",
    "Business tone maintained for executive audience"
  ],
  "keyTerms": [
    {
      "original": "customer retention",
      "translated": "retención de clientes",
      "context": "Standard business terminology"
    }
  ],
  "alternativeTranslations": {
    "title": ["Estrategia para Incrementar Ingresos", "Plan de Crecimiento de Ventas"]
  }
}
```

### Translate Entire Deck

```http
POST /api/ai/translate/deck
```

**Request Body:**
```json
{
  "slides": [
    { "title": "Slide 1", "content": {...} },
    { "title": "Slide 2", "content": {...} }
  ],
  "targetLanguage": "German",
  "sourceLanguage": "English",
  "preserveFormatting": true
}
```

**Response:**
```json
{
  "success": true,
  "targetLanguage": "German",
  "translatedSlides": [...],
  "totalSlides": 2
}
```
