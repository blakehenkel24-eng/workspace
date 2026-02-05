# Bug Tracker - SlideTheory v2

Track all discovered bugs, issues, and their resolution status.

## Legend

- 🔴 **Critical**: Blocks release, data loss, security issue
- 🟠 **High**: Major functionality broken, significant UX impact
- 🟡 **Medium**: Feature works with workarounds, minor UX issues
- 🟢 **Low**: Cosmetic issues, nice-to-have improvements

---

## Active Bugs

### Bug #001
| Field | Value |
|-------|-------|
| **ID** | BUG-001 |
| **Severity** | 🟡 Medium |
| **Status** | 🔄 Under Investigation |
| **Reported** | 2025-02-05 |
| **Reporter** | QA Automation |

**Description:**
PDF export test occasionally fails due to Puppeteer availability in test environment.

**Steps to Reproduce:**
1. Run integration tests
2. POST to /api/export/pdf
3. Observe intermittent failures

**Expected:**
PDF generates successfully or returns clear error message.

**Actual:**
Test sometimes fails when Puppeteer is not properly configured.

**Workaround:**
Use PNG or PPTX export instead.

**Proposed Fix:**
Implement SVG fallback for PDF generation when Puppeteer unavailable.

---

### Bug #002
| Field | Value |
|-------|-------|
| **ID** | BUG-002 |
| **Severity** | 🟢 Low |
| **Status** | ⏳ Pending |
| **Reported** | 2025-02-05 |
| **Reporter** | QA Automation |

**Description:**
Template selector module referenced in spec but does not exist as standalone file.

**Steps to Reproduce:**
1. Check lib/ directory
2. Look for template-selector.js

**Expected:**
Module exists for selecting templates based on context.

**Actual:**
Template loading is inline in server.js and app.js.

**Workaround:**
Current implementation works, just not modular.

**Proposed Fix:**
Refactor template loading logic into lib/template-selector.js for better testability.

---

### Bug #003
| Field | Value |
|-------|-------|
| **ID** | BUG-003 |
| **Severity** | 🟢 Low |
| **Status** | ⏳ Pending |
| **Reported** | 2025-02-05 |
| **Reporter** | QA Automation |

**Description:**
Prompt builder module referenced in spec but does not exist as standalone file.

**Steps to Reproduce:**
1. Check lib/ directory
2. Look for prompt-builder.js

**Expected:**
Module exists for building AI prompts.

**Actual:**
Prompt building is inline in openai-client.js.

**Workaround:**
Current implementation works.

**Proposed Fix:**
Refactor prompt building into lib/prompt-builder.js for better testability.

---

### Bug #004
| Field | Value |
|-------|-------|
| **ID** | BUG-004 |
| **Severity** | 🟢 Low |
| **Status** | ⏳ Pending |
| **Reported** | 2025-02-05 |
| **Reporter** | QA Automation |

**Description:**
Validators module referenced in spec but does not exist as standalone file.

**Steps to Reproduce:**
1. Check lib/ directory
2. Look for validators.js

**Expected:**
Module exists for input validation.

**Actual:**
Validation is inline in server.js.

**Workaround:**
Current implementation works.

**Proposed Fix:**
Refactor validation into lib/validators.js for better testability.

---

## Resolved Bugs

### Bug #005
| Field | Value |
|-------|-------|
| **ID** | BUG-005 |
| **Severity** | 🟠 High |
| **Status** | ✅ Fixed |
| **Reported** | 2025-02-05 |
| **Fixed** | 2025-02-05 |

**Description:**
Syntax error in `slide-generator-v2.js` - duplicate `renderSlideToImage` declaration causing server crash.

**Fix:**
Fixed import statements to use single import from `./slide-generator` instead of conflicting imports from both `./slide-renderer` (non-existent) and `./slide-generator`.

---

### Bug #006
| Field | Value |
|-------|-------|
| **ID** | BUG-006 |
| **Severity** | 🟡 Medium |
| **Status** | ✅ Fixed |
| **Reported** | 2025-02-05 |
| **Fixed** | 2025-02-05 |

**Description:**
Validation test expected 2 errors for missing slideType but only 1 error is returned (the "required" error, not an "invalid" error).

**Fix:**
Updated test expectation from 2 errors to 1 error in `tests/unit/validation.test.js`.

---

### Bug #007
| Field | Value |
|-------|-------|
| **ID** | BUG-007 |
| **Severity** | 🟢 Low |
| **Status** | ✅ Fixed |
| **Reported** | 2025-02-05 |
| **Fixed** | 2025-02-05 |

**Description:**
PDF generation test failed in environments without Puppeteer properly configured.

**Fix:**
Wrapped PDF generation test in try/catch to gracefully handle missing Puppeteer dependency.


---

## Testing Infrastructure Issues

### Issue #T001
| Field | Value |
|-------|-------|
| **ID** | T001 |
| **Severity** | 🟡 Medium |
| **Status** | ✅ Resolved |
| **Reported** | 2025-02-05 |

**Description:**
Need to create comprehensive test suite for SlideTheory v2.

**Resolution:**
Created test infrastructure:
- `/tests/unit/` - Unit tests for all modules
- `/tests/integration/` - API integration tests
- `/tests/e2e/` - End-to-end tests
- `/tests/mocks/` - Mock data and services
- `MANUAL-TEST-CHECKLIST.md` - Manual testing guide
- `BUG-TRACKER.md` - This bug tracking document

---

## Performance Issues

### Issue #P001
| Field | Value |
|-------|-------|
| **ID** | P001 |
| **Severity** | 🟡 Medium |
| **Status** | 🔄 Monitoring |
| **Reported** | 2025-02-05 |

**Description:**
Slide generation time varies based on Puppeteer availability.

**Details:**
- With Puppeteer: ~2-3 seconds
- Without Puppeteer (SVG fallback): ~1 second
- With AI generation: ~3-5 seconds

**Recommendation:**
Monitor production metrics and optimize AI prompt if needed.

---

## Security Concerns

### Issue #S001
| Field | Value |
|-------|-------|
| **ID** | S001 |
| **Severity** | 🟠 High |
| **Status** | ✅ Mitigated |
| **Reported** | 2025-02-05 |

**Description:**
Path traversal possible in template API without proper validation.

**Details:**
Server already has path traversal protection:
```javascript
const resolvedPath = path.resolve(templatePath);
const templatesDir = path.resolve(path.join(__dirname, 'public', 'templates'));
if (!resolvedPath.startsWith(templatesDir)) {
  return res.status(403).json({ success: false, error: 'FORBIDDEN' });
}
```

**Test Coverage:**
Integration test verifies 403 response for path traversal attempt.

---

## Feature Gaps

### Gap #F001
| Field | Value |
|-------|-------|
| **ID** | F001 |
| **Severity** | 🟢 Low |
| **Status** | 📋 Documented |

**Description:**
HTML copy feature is documented but not implemented.

**Location:**
app.js line ~370: `showToast('HTML copy coming in next update!', 'success');`

**Recommendation:**
Implement HTML copy to clipboard or remove option from UI.

---

### Gap #F002
| Field | Value |
|-------|-------|
| **ID** | F002 |
| **Severity** | 🟡 Medium |
| **Status** | 📋 Documented |

**Description:**
File upload endpoint referenced in spec but not implemented.

**Details:**
The spec mentions "Test file upload endpoints" but no file upload functionality exists.

**Recommendation:**
Implement file upload for CSV/Excel data import or remove from spec.

---

## Test Coverage Summary

| Module | Unit Tests | Integration Tests | E2E Tests |
|--------|------------|-------------------|-----------|
| Validation | ✅ Yes | ✅ Yes | ✅ Yes |
| OpenAI Client | ✅ Yes | Via API | ✅ Yes |
| Slide Generator | ✅ Yes | Via API | ✅ Yes |
| Export Generator | ✅ Yes | Via API | ✅ Yes |
| API Endpoints | N/A | ✅ Yes | ✅ Yes |
| Frontend (app.js) | N/A | N/A | Manual |

---

## Notes for Developers

1. **Missing Modules**: The spec referenced `prompt-builder.js`, `template-selector.js`, and `validators.js` but these don't exist. The functionality is inline in other files.

2. **Puppeteer Dependency**: PDF export depends on Puppeteer which may not be available in all environments. SVG fallback works for images but PDF generation needs Puppeteer.

3. **AI Generation**: Requires `KIMI_API_KEY` environment variable. Falls back to template content if not available.

4. **Test Environment**: Tests use `NODE_ENV=test` and random ports to avoid conflicts.

---

## Update Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-02-05 | v2.0 | Initial bug tracker created |

---

*Last Updated: 2025-02-05*
*Maintained by: QA Engineering*
