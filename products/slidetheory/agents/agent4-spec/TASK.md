# Agent 4: Clean Up Spec Drift

## Task
Remove ghost features and align spec with reality.

## Audit Checklist

### UI Elements to Check
- [ ] File upload button (data file)
- [ ] HTML copy button
- [ ] Download format options (PNG, PPTX, PDF)
- [ ] Version toggle (v1/v2)
- [ ] Template buttons
- [ ] Help modal
- [ ] Keyboard shortcuts

### Backend Features to Check
- [ ] File upload processing
- [ ] PPTX export
- [ ] PDF export
- [ ] HTML copy generation
- [ ] AI generation (Kimi integration)
- [ ] Image rendering (Puppeteer)

### Current Findings (To Verify)
1. **File Upload**: UI exists but may not be wired
2. **HTML Copy**: Referenced in spec, may not exist
3. **PPTX/PDF Export**: May be stubs

## Decision Framework

For each feature found:

```
IF feature is fully working:
  → Keep, document in test checklist
  
ELSE IF feature is partially working:
  → Decision: FIX (< 2 hours) or MARK as "Coming Soon"
  
ELSE IF feature is not implemented but has UI:
  → Remove UI, document in spec
  
ELSE IF feature is just commented code:
  → Clean up
```

## Deliverables

### 1. FEATURE_AUDIT.md
```markdown
| Feature | Location | Status | Action |
|---------|----------|--------|--------|
| File Upload | index.html:234 | UI_ONLY | Remove UI |
| PPTX Export | export-service.js | STUB | Mark Coming Soon |
| PNG Export | export-service.js | WORKING | Keep |
```

### 2. MANUAL_TEST_CHECKLIST.md
Only working features:
```markdown
## Form Input
- [ ] Slide type selection works
- [ ] Context textarea accepts input
- [ ] Generate button submits

## Generation
- [ ] AI generates content
- [ ] Image renders
- [ ] Preview displays

## Export
- [ ] PNG download works
```

### 3. Code Cleanup
- Remove unused imports
- Remove stub functions
- Add comments explaining removed features

## Status
- [ ] Audit all UI elements
- [ ] Audit all backend features
- [ ] Create FEATURE_AUDIT.md
- [ ] Clean up ghost features
- [ ] Update PRODUCT-SPEC.md
- [ ] Create test checklist

## Blockers
None - should complete FIRST as it defines scope for others.
