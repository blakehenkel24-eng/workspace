# SlideTheory API Documentation

**Version:** 2.0.0  
**Base URL:** `https://api.slidetheory.io/v2`  
**Content-Type:** `application/json`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Slide Generation](#slide-generation)
3. [Export](#export)
4. [Templates](#templates)
5. [User Management](#user-management)
6. [System Endpoints](#system-endpoints)
7. [Error Handling](#error-handling)
8. [Rate Limits](#rate-limits)
9. [SDKs and Examples](#sdks-and-examples)

---

## Authentication

SlideTheory uses JWT (JSON Web Tokens) for authentication.

### Getting an API Key

1. Create an account at [slidetheory.io](https://slidetheory.io)
2. Navigate to **Settings > API Keys**
3. Generate a new API key

### Using Your API Key

Include your token in the Authorization header:

```http
Authorization: Bearer YOUR_API_KEY
```

### Example Request

```bash
curl -X POST https://api.slidetheory.io/v2/slides/generate \
  -H "Authorization: Bearer sk_live_abc123xyz" \
  -H "Content-Type: application/json" \
  -d '{
    "slideType": "Executive Summary",
    "context": "Q3 earnings...",
    "targetAudience": "Board"
  }'
```

---

## Slide Generation

### POST /slides/generate

Generate a new slide from context.

**Authentication:** Optional (rate limits differ)  
**Rate Limit:** 5/hour (anonymous), 100/hour (authenticated)

#### Request Body

```json
{
  "slideType": "Executive Summary",
  "context": "Q3 earnings presentation for board. Revenue grew 23% YoY to $4.2M...",
  "dataPoints": [
    "Revenue: $4.2M (+23% YoY)",
    "Gross Margin: 68% (+4pp)",
    "Customers: 1,240 (+35%)"
  ],
  "targetAudience": "Board",
  "framework": "Pyramid Principle",
  "options": {
    "resolution": "2x",
    "style": "mckinsey",
    "colorScheme": "navy",
    "presentationMode": true
  }
}
```

#### Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slideType` | string | Yes | One of: `Executive Summary`, `Horizontal Flow`, `Vertical Flow`, `Graph/Chart`, `General` |
| `context` | string | Yes | 10-2000 characters describing the slide purpose |
| `dataPoints` | string[] | No | Array of data point strings (max 10) |
| `targetAudience` | string | Yes | `C-Suite/Board`, `External Client`, `Internal/Working Team`, `PE/Investors` |
| `framework` | string | No | `Pyramid Principle`, `MECE`, `2x2 Matrix`, `Waterfall Chart`, `SWOT` |
| `options` | object | No | Generation options (see below) |

#### Options Object

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `resolution` | string | `"2x"` | `"1x"`, `"2x"`, or `"4x"` |
| `style` | string | `"mckinsey"` | Visual style preset |
| `colorScheme` | string | `"navy"` | `"navy"`, `"dark"`, `"light"` |
| `presentationMode` | boolean | `true` | `true` for less detail, `false` for read mode |

#### Response (202 Accepted)

```json
{
  "success": true,
  "data": {
    "slideId": "sld_abc123xyz",
    "status": "processing",
    "estimatedSeconds": 4,
    "pollUrl": "/slides/sld_abc123xyz/status",
    "expiresAt": "2026-02-05T11:30:00Z"
  }
}
```

### GET /slides/{slideId}/status

Check generation status.

**Response:**

```json
{
  "success": true,
  "data": {
    "slideId": "sld_abc123xyz",
    "status": "completed",
    "progress": 100,
    "stage": "finished",
    "result": {
      "imageUrl": "https://cdn.slidetheory.io/slides/sld_abc123xyz.png",
      "thumbnailUrl": "https://cdn.slidetheory.io/slides/sld_abc123xyz_thumb.png",
      "content": {
        "title": "Strong Revenue Growth Requires Strategic Action",
        "keyPoints": ["Point 1", "Point 2", "Point 3"],
        "recommendation": "Invest in customer success"
      },
      "metadata": {
        "generatedAt": "2026-02-05T10:30:00Z",
        "generationTimeMs": 4200,
        "model": "kimi-k2.5",
        "resolution": "3840x2160"
      }
    }
  }
}
```

**Status Values:**
- `queued` — Waiting to process
- `processing` — AI generation in progress
- `rendering` — Converting to final format
- `completed` — Ready for download
- `failed` — Error occurred

### POST /slides/{slideId}/regenerate

Regenerate a slide with the same inputs but new AI seed.

**Authentication:** Required  
**Request:**

```json
{
  "variation": "alternative_layout",
  "options": {
    "creative": 0.8
  }
}
```

---

## Export

### POST /slides/{slideId}/export

Export a generated slide to various formats.

**Authentication:** Required  
**Rate Limit:** 50/hour

#### Request Body

```json
{
  "format": "pptx",
  "options": {
    "editable": true,
    "includeAnimations": false,
    "quality": "high"
  }
}
```

#### Format Options

| Format | Options | Description |
|--------|---------|-------------|
| `png` | `resolution: 1x/2x/4x` | Raster image export |
| `pptx` | `editable: boolean` | PowerPoint with editable text |
| `pdf` | `vector: boolean` | PDF document |
| `html` | `embeddable: boolean` | HTML/CSS code |

#### Response (202 Accepted)

```json
{
  "success": true,
  "data": {
    "exportId": "exp_xyz789",
    "status": "processing",
    "format": "pptx",
    "estimatedSeconds": 2,
    "pollUrl": "/exports/exp_xyz789/status"
  }
}
```

### GET /exports/{exportId}/status

Check export status.

**Response:**

```json
{
  "success": true,
  "data": {
    "exportId": "exp_xyz789",
    "status": "completed",
    "downloadUrl": "https://cdn.slidetheory.io/exports/exp_xyz789.pptx",
    "expiresAt": "2026-02-05T11:30:00Z",
    "fileSize": 245760
  }
}
```

### GET /exports/{exportId}/download

Download the exported file (temporary URL, valid for 1 hour).

**Response:** Binary file with appropriate Content-Type header.

---

## Templates

### GET /templates

List available templates.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Filter by category |
| `sort` | string | `popular`, `newest`, `name` |
| `page` | number | Pagination page (default: 1) |
| `limit` | number | Items per page (max: 50, default: 20) |

**Response:**

```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "tpl_tech_startup_series_b",
        "name": "Tech Startup Series B",
        "category": "Pitch Deck",
        "description": "AI SaaS platform fundraising deck",
        "icon": "🚀",
        "tags": ["startup", "funding", "saas"],
        "usageCount": 15420,
        "rating": 4.8,
        "previewUrl": "https://cdn.slidetheory.io/templates/tpl_tech_startup_series_b_preview.png"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

### GET /templates/{templateId}

Get detailed template information.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "tpl_tech_startup_series_b",
    "name": "Tech Startup Series B",
    "category": "Pitch Deck",
    "description": "AI SaaS platform fundraising deck for Series B round",
    "icon": "🚀",
    "tags": ["startup", "funding", "saas"],
    "content": {
      "slideType": "Executive Summary",
      "context": "Series B fundraising for AI-powered SaaS platform...",
      "dataPoints": [...],
      "targetAudience": "Investors",
      "framework": "Pyramid Principle"
    },
    "createdBy": "SlideTheory Team",
    "createdAt": "2026-01-15T00:00:00Z"
  }
}
```

### POST /templates/{templateId}/load

Load template data for use in generation.

**Response:**

```json
{
  "success": true,
  "data": {
    "slideType": "Executive Summary",
    "context": "Series B fundraising for AI-powered SaaS platform...",
    "dataPoints": [...],
    "targetAudience": "Investors",
    "framework": "Pyramid Principle"
  }
}
```

---

## User Management

### GET /user/profile

Get current user profile.

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "usr_123456",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://...",
    "plan": "pro",
    "usage": {
      "slidesThisMonth": 45,
      "slidesLimit": 100,
      "exportsThisMonth": 38,
      "exportsLimit": 100
    },
    "preferences": {
      "defaultStyle": "mckinsey",
      "emailNotifications": true
    },
    "createdAt": "2026-01-01T00:00:00Z"
  }
}
```

### PATCH /user/profile

Update user profile.

**Request:**

```json
{
  "name": "Jane Doe",
  "preferences": {
    "defaultStyle": "bain",
    "emailNotifications": false
  }
}
```

### GET /user/history

Get slide generation history.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Pagination |
| `limit` | number | Items per page (max: 50) |
| `sort` | string | `newest`, `oldest` |

**Response:**

```json
{
  "success": true,
  "data": {
    "history": [
      {
        "slideId": "sld_abc123",
        "title": "Q3 Financial Summary",
        "slideType": "Financial Model",
        "thumbnailUrl": "https://cdn.slidetheory.io/slides/sld_abc123_thumb.png",
        "createdAt": "2026-02-05T10:30:00Z",
        "exportedFormats": ["png", "pptx"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 47
    }
  }
}
```

---

## System Endpoints

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "healthy",
  "version": "2.0.0",
  "timestamp": "2026-02-05T10:00:00Z",
  "services": {
    "api": "up",
    "ai": "up",
    "storage": "up",
    "queue": "up"
  }
}
```

### GET /stats

Public usage statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "totalSlidesGenerated": 154320,
    "slidesToday": 1234,
    "topSlideType": "Executive Summary",
    "averageGenerationTimeMs": 3800
  }
}
```

---

## Error Handling

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description",
    "details": {},
    "requestId": "req_abc123"
  }
}
```

### Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `INVALID_REQUEST` | 400 | Malformed request body |
| `VALIDATION_ERROR` | 400 | Field validation failed |
| `MISSING_FIELD` | 400 | Required field missing |
| `INVALID_SLIDE_TYPE` | 400 | Unknown slide type |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `GENERATION_FAILED` | 500 | AI generation error |
| `EXPORT_FAILED` | 500 | Export processing error |
| `SERVICE_UNAVAILABLE` | 503 | Temporary service outage |

---

## Rate Limits

Rate limits are enforced per API key. Headers are included in all responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1707139200
```

### Limits by Tier

| Tier | Generate | Export | Status Checks |
|------|----------|--------|---------------|
| Free (no auth) | 5/hour | N/A | 60/hour |
| Free (auth) | 20/hour | 10/hour | 120/hour |
| Pro | 100/hour | 50/hour | 600/hour |
| Enterprise | Custom | Custom | Custom |

---

## SDKs and Examples

### Python

```python
import requests

API_KEY = "your_api_key"
BASE_URL = "https://api.slidetheory.io/v2"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Generate a slide
response = requests.post(
    f"{BASE_URL}/slides/generate",
    headers=headers,
    json={
        "slideType": "Executive Summary",
        "context": "Q3 results: Revenue $4.2M (+23%), expanding team",
        "targetAudience": "Board",
        "dataPoints": ["Revenue: $4.2M", "Growth: +23%"]
    }
)

result = response.json()
slide_id = result["data"]["slideId"]

# Poll for completion
import time
while True:
    status = requests.get(
        f"{BASE_URL}/slides/{slide_id}/status",
        headers=headers
    ).json()
    
    if status["data"]["status"] == "completed":
        image_url = status["data"]["result"]["imageUrl"]
        print(f"Slide ready: {image_url}")
        break
    
    time.sleep(1)
```

### JavaScript/Node.js

```javascript
const axios = require('axios');

const API_KEY = 'your_api_key';
const BASE_URL = 'https://api.slidetheory.io/v2';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Generate slide
async function generateSlide() {
  const { data } = await client.post('/slides/generate', {
    slideType: 'Executive Summary',
    context: 'Q3 results presentation for board meeting...',
    targetAudience: 'Board',
    dataPoints: ['Revenue: $4.2M (+23%)', 'Customers: 1,240']
  });
  
  const slideId = data.data.slideId;
  
  // Poll for completion
  const poll = setInterval(async () => {
    const status = await client.get(`/slides/${slideId}/status`);
    
    if (status.data.data.status === 'completed') {
      clearInterval(poll);
      console.log('Slide ready:', status.data.data.result.imageUrl);
    }
  }, 1000);
}

generateSlide();
```

### cURL

```bash
# Generate slide
curl -X POST https://api.slidetheory.io/v2/slides/generate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "slideType": "Executive Summary",
    "context": "Q3 board presentation...",
    "targetAudience": "Board"
  }'

# Check status
curl https://api.slidetheory.io/v2/slides/sld_abc123/status \
  -H "Authorization: Bearer YOUR_API_KEY"

# Export to PPTX
curl -X POST https://api.slidetheory.io/v2/slides/sld_abc123/export \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"format": "pptx"}'
```

---

## Webhooks (Coming Soon)

Subscribe to events for real-time updates:

**Event Types:**
- `slide.completed` — Generation finished
- `slide.failed` — Generation failed
- `export.completed` — Export ready

Configure webhooks in your dashboard under **Settings > Webhooks**.

---

*Last updated: February 2026*  
*API Version: 2.0.0*
