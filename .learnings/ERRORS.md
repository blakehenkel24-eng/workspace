# Errors Log

Track command failures, API errors, and integration issues.

---

## [ERR-20260204-001] Notion API Integration

**Logged**: 2026-02-04T04:03:00Z
**Priority**: medium
**Status**: pending
**Area**: infra

### Summary
OpenClaw lacks native Notion API tool. Token stored but cannot make authenticated requests.

### Error
Web fetch failed (401): API token is invalid for direct web fetch. No native notion tool available.

### Context
- Attempted to access Notion API via web_fetch
- Token stored in .notion-token
- No http/client tool with auth headers available

### Suggested Fix
Build custom Python script or wait for OpenClaw native Notion integration.

### Metadata
- Reproducible: yes
- Related Files: .notion-token
- See Also: None

---
