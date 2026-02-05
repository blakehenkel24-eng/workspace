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
