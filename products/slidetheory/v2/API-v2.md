# SlideTheory v2.0 API Specification

**Version:** 2.0.0  
**Base URL:** `https://api.slidetheory.io/v2`  
**Content-Type:** `application/json`  
**Authentication:** Bearer token (JWT)

---

## 1. Authentication

### 1.1 JWT Token Flow

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### 1.2 Authentication Endpoints

#### POST /auth/register
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123456",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2026-02-05T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:**
| Code | Description |
|------|-------------|
| 400 | Invalid email format or weak password |
| 409 | Email already registered |

---

#### POST /auth/login
Authenticate and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123456",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresAt": "2026-03-05T10:00:00Z"
  }
}
```

**Errors:**
| Code | Description |
|------|-------------|
| 401 | Invalid credentials |
| 403 | Account suspended |

---

#### POST /auth/oauth/google
OAuth login via Google.

**Request:**
```json
{
  "code": "google_auth_code",
  "redirectUri": "https://slidetheory.io/auth/callback"
}
```

**Response:** Same as POST /auth/login

---

## 2. Slide Generation

### 2.1 Core Generation Endpoint

#### POST /slides/generate
Generate a new slide from context.

**Authentication:** Optional (anonymous allowed with rate limits)

**Request:**
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
    "colorScheme": "navy"
  }
}
```

**Field Specifications:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| slideType | string | Yes | One of: Executive Summary, Market Analysis, Financial Model, Competitive Analysis, Growth Strategy, Risk Assessment |
| context | string | Yes | 10-2000 characters describing the slide purpose |
| dataPoints | string[] | No | Array of data point strings |
| targetAudience | string | Yes | C-Suite, Board, Investors, Internal Team, Clients, Analysts |
| framework | string | No | Pyramid Principle, MECE, 2x2 Matrix, Waterfall Chart, SWOT |
| options | object | No | Generation options (resolution, style, colorScheme) |

**Response (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "slideId": "sld_abc123",
    "status": "processing",
    "estimatedSeconds": 4,
    "pollUrl": "/slides/sld_abc123/status"
  }
}
```

**Async Completion (via poll or webhook):**
```json
{
  "success": true,
  "data": {
    "slideId": "sld_abc123",
    "status": "completed",
    "imageUrl": "https://cdn.slidetheory.io/slides/sld_abc123.png",
    "thumbnailUrl": "https://cdn.slidetheory.io/slides/sld_abc123_thumb.png",
    "content": {
      "title": "Strong Revenue Growth Requires Strategic Action",
      "keyPoints": [...],
      "recommendation": "..."
    },
    "metadata": {
      "generatedAt": "2026-02-05T10:30:00Z",
      "generationTimeMs": 4200,
      "model": "kimi-k2.5",
      "resolution": "3840x2160"
    }
  }
}
```

**Errors:**
| Code | Error | Description |
|------|-------|-------------|
| 400 | VALIDATION_ERROR | Invalid slide type or context too short |
| 429 | RATE_LIMITED | Too many requests (anonymous: 5/hr, free: 20/hr, pro: 100/hr) |
| 500 | GENERATION_FAILED | AI service error, retry suggested |

---

#### GET /slides/{slideId}/status
Check generation status for async operations.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "slideId": "sld_abc123",
    "status": "processing",
    "progress": 65,
    "stage": "rendering",
    "estimatedSecondsRemaining": 2
  }
}
```

**Status Values:**
- `queued` - Waiting to process
- `processing` - AI generation in progress
- `rendering` - Converting to final format
- `completed` - Ready for download
- `failed` - Error occurred

---

### 2.2 Regeneration

#### POST /slides/{slideId}/regenerate
Regenerate a slide with same inputs but new AI seed.

**Authentication:** Required (must be slide owner)

**Request:**
```json
{
  "variation": "alternative_layout",
  "options": {
    "creative": 0.8
  }
}
```

**Response:** Same as POST /slides/generate

---

## 3. Export Endpoints

### 3.1 Multi-Format Export

#### POST /slides/{slideId}/export
Export slide to various formats.

**Authentication:** Required (must be slide owner)

**Request:**
```json
{
  "format": "pptx",
  "options": {
    "editable": true,
    "includeAnimations": false
  }
}
```

**Format Options:**
| Format | Options | Description |
|--------|---------|-------------|
| png | `resolution: 1x/2x/4x` | Raster image export |
| pptx | `editable: boolean` | PowerPoint with editable text |
| pdf | `vector: boolean` | PDF document |
| html | `embeddable: boolean` | HTML/CSS code |

**Response (202):**
```json
{
  "success": true,
  "data": {
    "exportId": "exp_xyz789",
    "status": "processing",
    "format": "pptx",
    "estimatedSeconds": 2
  }
}
```

**Completion:**
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

---

#### GET /exports/{exportId}/download
Download exported file (temporary URL, valid for 1 hour).

**Response:** Binary file download with appropriate Content-Type

---

## 4. Templates

### 4.1 Template Management

#### GET /templates
List available templates.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| category | string | Filter by category |
| sort | string | popular, newest, name |
| page | number | Pagination page |
| limit | number | Items per page (max 50) |

**Response (200):**
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

---

#### GET /templates/{templateId}
Get detailed template information.

**Response (200):**
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

---

#### POST /templates/{templateId}/load
Load template data into generation form (returns pre-filled request).

**Authentication:** Optional

**Response (200):**
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

## 5. User Management

### 5.1 User Profile

#### GET /user/profile
Get current user profile.

**Authentication:** Required

**Response (200):**
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

---

#### PATCH /user/profile
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

---

### 5.2 Slide History

#### GET /user/history
Get user's slide generation history.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| page | number | Pagination |
| limit | number | Items per page |
| sort | string | newest, oldest |

**Response (200):**
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

#### POST /user/history/{slideId}/save
Save a slide to favorites.

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "saved": true,
    "savedAt": "2026-02-05T11:00:00Z"
  }
}
```

---

#### DELETE /user/history/{slideId}
Delete a slide from history.

**Authentication:** Required (must be owner)

**Response (204):** No content

---

## 6. System Endpoints

### 6.1 Health & Status

#### GET /health
Health check endpoint.

**Response (200):**
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

---

#### GET /stats
Public usage statistics.

**Response (200):**
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

## 7. Error Codes

### 7.1 Standard Error Format

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

### 7.2 Error Code Reference

| Code | HTTP | Description |
|------|------|-------------|
| INVALID_REQUEST | 400 | Malformed request body |
| VALIDATION_ERROR | 400 | Field validation failed |
| MISSING_FIELD | 400 | Required field missing |
| INVALID_SLIDE_TYPE | 400 | Unknown slide type |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| RATE_LIMITED | 429 | Too many requests |
| GENERATION_FAILED | 500 | AI generation error |
| EXPORT_FAILED | 500 | Export processing error |
| SERVICE_UNAVAILABLE | 503 | Temporary service outage |

### 7.3 Rate Limit Headers

All responses include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1707139200
```

---

## 8. Webhooks (Future)

### 8.1 Webhook Events

Subscribe to events via dashboard or API.

**Event Types:**
- `slide.completed` - Generation finished
- `slide.failed` - Generation failed
- `export.completed` - Export ready
- `user.created` - New user signup

**Webhook Payload:**
```json
{
  "event": "slide.completed",
  "timestamp": "2026-02-05T10:30:00Z",
  "data": {
    "slideId": "sld_abc123",
    "userId": "usr_123456",
    "imageUrl": "https://cdn.slidetheory.io/slides/sld_abc123.png"
  }
}
```

---

## 9. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-02-05 | Initial v2.0 spec with AI image generation, auth, history |
| 1.1.0 | 2026-01-15 | MVP HTML-based generation |
