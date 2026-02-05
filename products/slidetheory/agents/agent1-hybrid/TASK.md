# Agent 1: Hybrid Renderer Prototype

## Task
Build AI background + SVG text overlay system to solve text legibility problem.

## Approach
Instead of Kimi generating text (unreliable), have Kimi generate:
1. Background image (shapes, colors, layout structure)
2. Metadata about text zones

Then composite:
- Background image as base layer
- SVG text overlay for crisp, readable text
- Export as PNG/PDF

## Deliverables

### 1. hybrid-renderer.js
```javascript
// Core functions needed:
- generateBackgroundPrompt(slideType, content) → AI prompt
- generateBackgroundImage(prompt) → PNG buffer (via Kimi)
- createTextOverlay(content, template) → SVG string
- compositeLayers(backgroundBuffer, svgOverlay) → final PNG
- renderSlide(slideType, content) → { png, metadata }
```

### 2. Template Schema
```json
{
  "slideType": "Executive Summary",
  "backgroundPrompt": "Professional consulting slide background, McKinsey style, dark navy header bar at top, white content area, subtle gradient, NO TEXT, clean minimalist",
  "textZones": [
    { "id": "title", "x": 80, "y": 60, "width": 1040, "fontSize": 52, "fontWeight": 700, "color": "#0d2137" },
    { "id": "point1", "x": 120, "y": 200, "width": 900, "fontSize": 18, "lineHeight": 1.6 }
  ]
}
```

### 3. Test File
- 10 slides across all types
- Visual validation: text must be pixel-perfect readable
- Performance: < 5 sec per slide

## Technical Notes

### Background Generation
Use Kimi's image generation (if available) or fallback to:
- HTML/CSS rendered background via Puppeteer
- Pre-made background templates
- Gradient overlays

### Text Rendering
- Sharp or Canvas for compositing
- SVG for text (infinite scalability)
- Ensure 300 DPI for print quality

### API Surface
```javascript
const { renderHybridSlide } = require('./services/hybrid-renderer');

const result = await renderHybridSlide({
  slideType: 'Executive Summary',
  content: { title, keyPoints, ... },
  format: 'png' // or 'pdf'
});
// Returns: { buffer, width, height, metadata }
```

## Status
- [ ] Scaffolding created
- [ ] Background prompt templates
- [ ] Text overlay system
- [ ] Compositing engine
- [ ] Tests passing
- [ ] Documentation

## Blockers
None currently.

## Integration
- Called by slide-service.js when hybrid mode enabled
- Reports progress to progress system (Agent 3)
