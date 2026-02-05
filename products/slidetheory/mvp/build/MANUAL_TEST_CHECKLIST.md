# Manual Test Checklist - SlideTheory MVP
**Version:** Cycle 1 (Post-Cleanup)  
**Last Updated:** 2026-02-05

---

## Pre-Test Setup
- [ ] Server running on localhost:3000
- [ ] KIMI_API_KEY set (or test fallback mode)
- [ ] Browser dev tools open (for console errors)

---

## Form Input Tests

### V1 Form (Classic)
| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 1.1 | Basic generation | Select "Executive Summary", enter context, click Generate | Slide appears in preview | ⬜ |
| 1.2 | Slide types | Test all 6 slide types | Each generates appropriate layout | ⬜ |
| 1.3 | Validation | Submit empty form | Generate button disabled, error shown | ⬜ |
| 1.4 | Data points | Enter metrics in data field | Incorporated into slide | ⬜ |
| 1.5 | Framework | Select "2x2 Matrix" framework | Structure reflects framework | ⬜ |

### V2 Form (New)
| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 2.1 | Basic generation | Fill all required fields, click Generate | Slide appears in preview | ⬜ |
| 2.2 | Slide type hints | Select different slide types | Hint text updates | ⬜ |
| 2.3 | Audience targeting | Select "C-Suite" vs "Internal" | Different content density | ⬜ |
| 2.4 | Char counters | Type in takeaway/context | Counter updates, warning at 90% | ⬜ |
| 2.5 | File upload | Upload .txt file | File content appears in data field | ⬜ |
| 2.6 | Presentation mode | Toggle between modes | Content density changes | ⬜ |

---

## Generation Tests

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 3.1 | Loading state | Click Generate | Spinner appears, loading text shown | ⬜ |
| 3.2 | Success | Wait for generation | Preview displays, success toast | ⬜ |
| 3.3 | Regenerate | Click Regenerate button | New slide generated | ⬜ |
| 3.4 | Fallback mode | Remove API key, generate | Mock content used, slide renders | ⬜ |
| 3.5 | Error handling | Disconnect network, generate | Error message displayed | ⬜ |

---

## Export Tests

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 4.1 | PNG download | Generate, click Download → PNG | PNG file downloads | ⬜ |
| 4.2 | PPTX download (BETA) | Generate, click Download → PPTX | PPTX file downloads | ⬜ |
| 4.3 | PDF download (BETA) | Generate, click Download → PDF | PDF file downloads | ⬜ |

---

## Navigation Tests

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 5.1 | Version toggle | Click V1/V2 buttons | Forms switch | ⬜ |
| 5.2 | Ctrl+Enter | Press Ctrl+Enter in form | Generation starts | ⬜ |
| 5.3 | Help modal | Press ? key | Shortcuts modal opens | ⬜ |
| 5.4 | Close modal | Press Escape | Modal closes | ⬜ |
| 5.5 | Download dropdown | Click Download button | Dropdown opens | ⬜ |

---

## Edge Cases

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 6.1 | Long context | Paste 2000+ chars in context | Handled gracefully | ⬜ |
| 6.2 | Special chars | Use quotes, ampersands in input | Rendered correctly | ⬜ |
| 6.3 | Rapid generation | Click Generate multiple times | Only one request active | ⬜ |
| 6.4 | Browser refresh | Refresh after generation | Form state clears | ⬜ |

---

## Sign-Off

| Tester | Date | Result |
|--------|------|--------|
| | | ⬜ PASS / ⬜ FAIL |

**Notes:**
- BETA features (PPTX/PDF) may have issues
- SVG fallback expected if Puppeteer unavailable
