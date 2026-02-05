# Manual Testing Checklist - SlideTheory v2

Use this checklist to verify all functionality before release.

## Pre-Test Setup

- [ ] Server is running (`npm start` or `node server.js`)
- [ ] Open browser to `http://localhost:3000`
- [ ] Browser DevTools console is open (F12)
- [ ] Network tab is visible for monitoring requests

---

## UI/UX Tests

### Landing Page
- [ ] Page loads without console errors
- [ ] Logo/title is visible and correctly styled
- [ ] Form is visible and accessible
- [ ] Template gallery is visible
- [ ] Footer/information is present

### Form Elements
- [ ] **Slide Type Dropdown**
  - [ ] Opens and shows all 6 options
  - [ ] Each option is selectable
  - [ ] Hint text updates based on selection
  
- [ ] **Context Textarea**
  - [ ] Accepts text input
  - [ ] Character counter works (0/500)
  - [ ] Warning at >450 chars
  - [ ] Error at >=500 chars
  - [ ] Can paste large text
  
- [ ] **Data Points Textarea**
  - [ ] Accepts text input
  - [ ] Character counter works (0/1000)
  - [ ] Warning at >900 chars
  
- [ ] **Target Audience Dropdown**
  - [ ] Opens and shows all options
  - [ ] Each option is selectable
  
- [ ] **Framework Dropdown (Optional)**
  - [ ] Opens and shows all options
  - [ ] Can be left empty
  - [ ] Selection works

### Template Gallery
- [ ] All 6 templates are displayed
- [ ] Template cards show icon, name, category, description
- [ ] Clicking template populates form
- [ ] Template loads correctly from server
- [ ] Error message shown if template fails to load

### Buttons
- [ ] **Generate Button**
  - [ ] Disabled when form invalid
  - [ ] Enabled when form valid
  - [ ] Shows loading state when clicked
  - [ ] Text changes to "Generating..."
  - [ ] Spinner icon appears
  
- [ ] **Regenerate Button**
  - [ ] Appears after successful generation
  - [ ] Triggers new generation
  
- [ ] **Download Dropdown**
  - [ ] Opens when clicked
  - [ ] Shows 4 options: PNG, PowerPoint, PDF, HTML
  - [ ] Closes when clicking outside
  - [ ] Each option triggers correct download

---

## Slide Generation Tests

### All Slide Types

Generate each slide type and verify:

- [ ] **Executive Summary**
  - [ ] Generates successfully (< 5 seconds)
  - [ ] Title is action-oriented (5-8 words)
  - [ ] 3 key points with headings and text
  - [ ] Recommendation box at bottom
  - [ ] Footer with source and date
  - [ ] Image renders correctly
  
- [ ] **Market Analysis**
  - [ ] Generates successfully
  - [ ] Market size displayed prominently
  - [ ] 3 insights listed
  - [ ] Bar chart visible
  - [ ] Chart labels match data
  
- [ ] **Financial Model**
  - [ ] Generates successfully
  - [ ] 3 metric cards visible
  - [ ] Table with headers and rows
  - [ ] Growth percentages shown
  - [ ] Proper number formatting ($X.XM, X%)
  
- [ ] **Competitive Analysis**
  - [ ] Generates successfully
  - [ ] 2x2 matrix visible
  - [ ] Competitor bubbles positioned
  - [ ] Feature comparison table
  - [ ] Checkmarks/X marks correct
  
- [ ] **Growth Strategy**
  - [ ] Generates successfully
  - [ ] Flywheel diagram visible
  - [ ] 4 flywheel sections
  - [ ] Strategic initiatives cards
  - [ ] Arrows between flywheel items
  
- [ ] **Risk Assessment**
  - [ ] Generates successfully
  - [ ] Risk matrix grid visible
  - [ ] Risks positioned correctly
  - [ ] Mitigation table present
  - [ ] Risk badges (High/Medium/Low)

### Audience-Specific Tests

For each audience, verify tone matches:

- [ ] **C-Suite**
  - [ ] High-level strategic language
  - [ ] Focus on business outcomes
  
- [ ] **Board of Directors**
  - [ ] Governance-focused content
  - [ ] Risk considerations
  
- [ ] **Investors**
  - [ ] Financial metrics emphasized
  - [ ] Growth trajectory highlighted
  
- [ ] **Management Team**
  - [ ] Actionable recommendations
  - [ ] Implementation details

### Key Takeaway Prominence

- [ ] **Executive Summary**: Recommendation box is prominent
- [ ] **Market Analysis**: Market size is large and visible
- [ ] **Financial Model**: Key metrics are in top cards
- [ ] **Competitive Analysis**: "Our Solution" is highlighted
- [ ] **Growth Strategy**: Flywheel is central visual
- [ ] **Risk Assessment**: High risks are visually prominent

---

## Data Input Tests

### Direct Paste
- [ ] Can paste text into context field
- [ ] Line breaks preserved in data points
- [ ] Special characters handled correctly
- [ ] Emoji handled (if applicable)

### Large Input
- [ ] Context at 500 char limit works
- [ ] Data points at 1000 char limit works
- [ ] No performance degradation

### Edge Cases
- [ ] Empty data points field works
- [ ] Single character lines in data points
- [ ] Only whitespace in fields (should fail validation)

---

## Export Tests

### PNG Export
- [ ] Downloads PNG file
- [ ] File has .png extension
- [ ] Image is 1920x1080 or similar
- [ ] Image quality is good
- [ ] All content visible

### PowerPoint Export
- [ ] Downloads .pptx file
- [ ] File opens in PowerPoint/Google Slides
- [ ] Slide layout is correct
- [ ] Content is editable
- [ ] Formatting preserved

### PDF Export
- [ ] Downloads .pdf file
- [ ] File opens in PDF viewer
- [ ] Single slide per page
- [ ] Text is selectable (if applicable)

### HTML Export
- [ ] Option visible in menu
- [ ] Appropriate message shown (if not implemented)

---

## Error Handling Tests

### Validation Errors
- [ ] Missing slide type shows error
- [ ] Invalid slide type shows error
- [ ] Short context (<10 chars) shows error
- [ ] Long context (>2000 chars) shows error
- [ ] Missing audience shows error
- [ ] Multiple errors shown at once

### Server Errors
- [ ] Server down shows appropriate message
- [ ] Timeout shows retry suggestion
- [ ] Rate limit shows wait message

### Recovery
- [ ] Can retry after error
- [ ] Form data preserved after error
- [ ] Loading state clears properly

---

## Responsive Design Tests

### Desktop (1920x1080)
- [ ] Layout is correct
- [ ] No horizontal scroll
- [ ] All elements visible

### Laptop (1366x768)
- [ ] Layout adapts
- [ ] All elements accessible

### Tablet (768x1024)
- [ ] Form stacks correctly
- [ ] Template grid adjusts
- [ ] Touch targets appropriate size

### Mobile (375x667)
- [ ] Single column layout
- [ ] Form fields full width
- [ ] Buttons full width
- [ ] Preview image scales
- [ ] Template gallery scrollable
- [ ] No horizontal scroll

---

## Keyboard Navigation

- [ ] Tab navigates through form fields
- [ ] Enter submits form
- [ ] Escape closes modals/dropdowns
- [ ] Space toggles checkboxes (if any)
- [ ] Arrow keys work in dropdowns

### Keyboard Shortcuts
- [ ] Ctrl+Enter generates slide
- [ ] Ctrl+R regenerates (when available)
- [ ] Ctrl+D downloads PNG (when available)
- [ ] ? opens help modal

---

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

For each:
- [ ] No console errors
- [ ] Layout correct
- [ ] Animations work
- [ ] Downloads work

---

## Performance Tests

### Load Time
- [ ] Initial page load < 3 seconds
- [ ] First contentful paint < 1.5 seconds

### Generation Time
- [ ] Simple slide < 3 seconds
- [ ] Complex slide < 5 seconds
- [ ] Large context < 5 seconds

### Memory
- [ ] No memory leaks during repeated generation
- [ ] Tab memory usage reasonable (< 200MB)

---

## Accessibility Tests

- [ ] All images have alt text
- [ ] Color contrast meets WCAG AA
- [ ] Form labels associated with inputs
- [ ] Focus indicators visible
- [ ] Screen reader announces errors
- [ ] Can complete task with keyboard only

---

## Security Tests

- [ ] XSS attempt in context is sanitized
- [ ] Path traversal blocked in template API
- [ ] File upload (if applicable) validates type
- [ ] No sensitive data in client-side code

---

## Post-Test Cleanup

- [ ] All temporary files cleaned up
- [ ] No sensitive data left in exports
- [ ] Console shows no errors

---

## Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| QA Lead | | | ☐ Pass / ☐ Fail |
| Product Manager | | | ☐ Pass / ☐ Fail |
| Dev Lead | | | ☐ Pass / ☐ Fail |

**Overall Status:** ☐ Ready for Release / ☐ Needs Fixes

**Notes:**
```
(Add any additional notes here)
```
