# Agent Task: Legal Documents Review

**Source:** Todoist Task #9988534276
**Original Task:** "🟡 Review legal docs (ToS, Privacy Policy)"

## Objective
Review existing legal documents for SlideTheory and provide recommendations.

## Files to Review
Check `products/slidetheory/legal/` for:
- terms-of-service.md
- privacy-policy.md
- data-processing-agreement.md

## Deliverables
1. Create `/home/node/.openclaw/workspace/memory/legal-review-summary.md`
2. Include:
   - Summary of each document's coverage
   - Gaps or missing clauses identified
   - Compliance check (GDPR, CCPA, etc.)
   - Risk assessment (low/medium/high)
   - Specific recommendations for improvement

## Review Criteria
- **Terms of Service:** User rights, limitations, termination, liability
- **Privacy Policy:** Data collection, use, storage, user rights, cookies
- **DPA:** Processor obligations, subprocessor list, security measures

## Questions to Answer
- Are these ready for launch?
- What jurisdictions are covered?
- Is the $2/mo billing mentioned appropriately?
- Any clauses that need legal counsel review?

## Recommendations Format
- Critical (must fix before launch)
- Important (should fix soon)
- Nice to have (can iterate)

Report back with findings and prioritized action items.
