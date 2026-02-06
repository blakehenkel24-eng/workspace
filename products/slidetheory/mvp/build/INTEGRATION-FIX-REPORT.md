# SlideTheory 400 Error Fix - Integration Report

**Date:** 2026-02-06  
**Issue:** Frontend requests to `/api/generate` return 400 "Invalid input"  
**Status:** ✅ FIXED

---

## Root Cause Analysis

The 400 error was caused by a **validation mismatch** between the frontend V2 form and the backend API:

### 1. Missing Slide Types (Primary Issue)
The V2 form uses layout-focused slide types that weren't recognized by the backend:

| Frontend (V2) | Backend Allowed | Result |
|---------------|-----------------|--------|
| Executive Summary | ✅ Executive Summary | Works |
| Horizontal Flow | ❌ NOT IN LIST | **400 Error** |
| Vertical Flow | ❌ NOT IN LIST | **400 Error** |
| Graph/Chart | ❌ NOT IN LIST | **400 Error** |
| General | ❌ NOT IN LIST | **400 Error** |

### 2. Field Name Mismatch (Secondary Issue)
The V2 form uses `audience` while the backend expected `targetAudience`:

```javascript
// Frontend V2 sends:
{ slideType: "Horizontal Flow", audience: "C-Suite/Board", ... }

// Backend expected:
{ slideType: "Executive Summary", targetAudience: "C-Suite", ... }
```

---

## Changes Made

### 1. Updated `config/constants.js`
Added V2 slide types to `SLIDE_TYPES` array:

```javascript
SLIDE_TYPES: [
  // V1 Legacy Types
  'Executive Summary',
  'Market Analysis',
  'Financial Model',
  'Competitive Analysis',
  'Growth Strategy',
  'Risk Assessment',
  // V2 Layout Types
  'Horizontal Flow',
  'Vertical Flow',
  'Graph/Chart',
  'General'
]
```

### 2. Updated `models/slide-model.js`
- Added support for `audience` field as alias for `targetAudience`
- Added support for `dataInput` field (V2 form sends this instead of `dataPoints`)
- Added new fields: `keyTakeaway`, `presentationMode`

```javascript
constructor(data = {}) {
  this.slideType = data.slideType;
  this.context = data.context;
  // Support both V1 (targetAudience) and V2 (audience) field names
  this.targetAudience = data.targetAudience || data.audience;
  this.dataPoints = data.dataPoints || data.dataInput || [];
  // ...
}
```

### 3. Updated `controllers/slide-controller.js`
Modified the generateSlide function to handle both field names:

```javascript
// Support both V1 (targetAudience) and V2 (audience) field names
const requestData = request.toJSON();
const targetAudience = requestData.targetAudience || requestData.audience;
```

### 4. Updated Test Files
- `tests/mocks/mock-data.js` - Added V2 slide types
- `tests/unit/validation.test.js` - Updated tests to check for V1 + V2 types separately

---

## Backward Compatibility

✅ **V1 Classic Form** - Still works exactly as before  
✅ **V2 MBB Templates Form** - Now works correctly  
✅ **Both `/api/generate` and `/api/generate-slide-v2`** - Both endpoints work

---

## Test Results

```
Validation Functions
  ✓ validateGenerateRequest (17 tests)
  ✓ VALID_SLIDE_TYPES (3 tests)
    ✓ should contain V1 legacy slide types
    ✓ should contain V2 layout slide types
    ✓ should have unique slide types

20 tests passing
```

---

## Files Modified

| File | Changes |
|------|---------|
| `config/constants.js` | Added 4 new slide types to SLIDE_TYPES |
| `models/slide-model.js` | Added audience/dataInput aliases, new fields |
| `controllers/slide-controller.js` | Handle audience/targetAudience mapping |
| `tests/mocks/mock-data.js` | Added V2 types to VALID_SLIDE_TYPES |
| `tests/unit/validation.test.js` | Updated tests for new slide types |

---

## Verification

To verify the fix works:

1. **V1 Form Test:** Select "Executive Summary", fill required fields → Should generate successfully
2. **V2 Form Test:** Select "Horizontal Flow" (or any V2 type), fill required fields → Should generate successfully
3. **Field Mapping Test:** V2 form's "audience" dropdown should correctly map to backend "targetAudience"

---

## Summary

The 400 error was caused by the backend rejecting valid V2 slide types. The fix adds backward-compatible support for:
- V2 slide types (Horizontal Flow, Vertical Flow, Graph/Chart, General)
- V2 field names (audience → targetAudience, dataInput → dataPoints)

Both V1 and V2 forms now work correctly with the same `/api/generate` endpoint.
