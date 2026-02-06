# SlideTheory API 400 Error Debug Report

## Executive Summary

**Root Cause:** The `/api/generate-slide-v2` endpoint has a **field name mismatch** between middleware validation and model validation.

- **Middleware validator** expects: `audience`
- **SlideGenerationRequest model** expects: `targetAudience`

This causes a 400 error when the frontend sends the correct v2 payload with only `audience`.

---

## Test Results

### ✅ V1 Endpoint (`/api/generate`) - Working Correctly

| Test | Payload | Result |
|------|---------|--------|
| Valid request | `{slideType, context, targetAudience}` | ✅ 200 Success |
| Missing targetAudience | `{slideType, context}` | ❌ 400 - targetAudience is required |
| Wrong field name | uses `audience` instead of `targetAudience` | ❌ 400 - targetAudience is required |
| Empty targetAudience | `"targetAudience": ""` | ❌ 400 - targetAudience is required |
| Invalid slideType | `"slideType": "Invalid"` | ❌ 400 - slideType must be one of: [...] |
| Short context | `"context": "Too short"` (7 chars) | ❌ 400 - context must be at least 10 characters |
| Wrong dataPoints type | `"dataPoints": "string"` | ❌ 400 - dataPoints must be an array |
| Null values | all fields null | ❌ 400 - multiple required errors |
| Empty body | `{}` | ❌ 400 - multiple required errors |

### ❌ V2 Endpoint (`/api/generate-slide-v2`) - BUG CONFIRMED

| Test | Payload | Result |
|------|---------|--------|
| Valid v2 request | `{slideType, context, audience, keyTakeaway}` | ❌ 400 - Target audience is required |
| Using targetAudience | `{slideType, context, targetAudience, keyTakeaway}` | ❌ 400 - audience is required |
| **WORKAROUND** | `{slideType, context, audience, targetAudience, keyTakeaway}` | ✅ 200 Success |
| Missing keyTakeaway | `{slideType, context, audience, targetAudience}` | ❌ 400 - keyTakeaway is required |

---

## Field Name Requirements by Endpoint

### `/api/generate` (V1) - Requires:
```json
{
  "slideType": "Executive Summary",  // Must be one of 6 valid types
  "context": "string (10-2000 chars)",
  "targetAudience": "string"         // ⚠️ Note: NOT "audience"
}
```

**Optional:**
```json
{
  "dataPoints": ["array", "of", "strings"],  // Max 10 items
  "framework": "string"
}
```

### `/api/generate-slide-v2` (V2) - CURRENTLY BROKEN - Requires:
```json
{
  "slideType": "Executive Summary",
  "context": "string (10-2000 chars)",
  "audience": "string",              // Required by middleware validator
  "targetAudience": "string",        // Required by model (BUG!)
  "keyTakeaway": "string (5-150 chars)"
}
```

**Optional:**
```json
{
  "presentationMode": "presentation" | "read",
  "dataInput": "string"
}
```

---

## Valid Slide Types

```javascript
[
  "Executive Summary",
  "Market Analysis", 
  "Financial Model",
  "Competitive Analysis",
  "Growth Strategy",
  "Risk Assessment"
]
```

---

## The Bug (Code Analysis)

### File: `controllers/slide-controller.js` (Line ~33-44)

The V2 endpoint calls `generateSlide()` which creates a `SlideGenerationRequest` model:

```javascript
// V2 controller calls the same function as V1
const generateSlideV2 = asyncHandler(async (req, res) => {
  return generateSlide(req, res);  // Uses same model!
});
```

### File: `models/slide-model.js` (Line ~21-25)

```javascript
class SlideGenerationRequest {
  constructor(data = {}) {
    this.slideType = data.slideType;
    this.context = data.context;
    this.targetAudience = data.targetAudience;  // ⚠️ Expects targetAudience!
    // ...
  }
}
```

### File: `middleware/validator.js` (Line ~35-49)

V2 validation rules expect `audience`:

```javascript
generateSlideV2: {
  // ...
  audience: {
    required: true,
    type: 'string',
    message: 'audience is required'  // ⚠️ Expects audience!
  },
  // ...
  keyTakeaway: {
    required: true,
    // ...
  }
}
```

---

## Reproduction Steps

### Reproduce the 400 Error:

```bash
curl -X POST http://localhost:3000/api/generate-slide-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "slideType": "Executive Summary",
    "context": "This is a test context that meets the minimum length requirement.",
    "audience": "C-Suite",
    "keyTakeaway": "This is the key takeaway"
  }'
```

**Expected:** 200 Success  
**Actual:** 400 "Target audience is required"

---

## Fix Options

### Option 1: Update Model to accept both field names (Recommended - Backward Compatible)

**File:** `models/slide-model.js`

```javascript
class SlideGenerationRequest {
  constructor(data = {}) {
    this.slideType = data.slideType;
    this.context = data.context;
    // Support both field names for backward compatibility
    this.targetAudience = data.targetAudience || data.audience;
    this.dataPoints = data.dataPoints || [];
    this.framework = data.framework;
  }
  // ...
}
```

### Option 2: Update Frontend to send both fields (Quick Workaround)

**File:** `public/app.js` (Line ~645)

```javascript
const requestData = {
  slideType: v2Elements.slideType.value,
  audience: v2Elements.audience.value,           // For middleware
  targetAudience: v2Elements.audience.value,     // For model (add this!)
  context: v2Elements.context.value,
  keyTakeaway: v2Elements.keyTakeaway.value,
  presentationMode: state.presentationMode,
  dataInput: v2Elements.dataInput.value
};
```

### Option 3: Create separate V2 model (Cleanest Long-term)

Create a new `SlideGenerationRequestV2` model that expects `audience` instead of `targetAudience`.

---

## Working cURL Examples

### V1 Working Request:
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "slideType": "Executive Summary",
    "context": "This is a comprehensive test context that meets all requirements for the slide generation endpoint.",
    "targetAudience": "C-Suite",
    "dataPoints": ["Point 1", "Point 2"],
    "framework": "MECE"
  }'
```

### V2 Working Request (Current Workaround):
```bash
curl -X POST http://localhost:3000/api/generate-slide-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "slideType": "Executive Summary",
    "context": "This is a comprehensive test context that meets all requirements for the slide generation endpoint.",
    "audience": "C-Suite",
    "targetAudience": "C-Suite",
    "keyTakeaway": "This is the main takeaway for the slide"
  }'
```

---

## Summary

| Issue | Location | Severity |
|-------|----------|----------|
| Field name mismatch | V2 endpoint | **HIGH** |
| V2 uses V1 model | `slide-controller.js` | **HIGH** |

**Simplest Fix:** Add `this.targetAudience = data.targetAudience || data.audience;` to the `SlideGenerationRequest` constructor.

**Impact:** The V2 frontend is broken because it only sends `audience`, but the model expects `targetAudience`.
