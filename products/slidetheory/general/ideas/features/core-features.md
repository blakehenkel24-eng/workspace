# Feature Requests

Product features and improvements for SlideTheory.

## Core Features

### Feature: PowerPoint Export

**Priority:** high  
**Status:** planned  
**Tags:** #export #integration #core

**Description:**
Allow users to download generated slides as .pptx files for editing in PowerPoint.

**User need:**
Consultants need to customize AI-generated content before client delivery.

**Technical approach:**
- Option A: Use pptxgenjs library (client-side generation)
- Option B: Server-side conversion with LibreOffice
- Option C: Partner with SlideHub API

**Questions:**
- Preserve animations? (No for MVP)
- Font embedding? (System fonts only v1)

---

### Feature: Multiple Slide Templates

**Priority:** high  
**Status:** in-progress  
**Tags:** #templates #core #ux

**Description:**
Support multiple consulting firm styles: McKinsey, Bain, BCG, plus generic options.

**Template Roadmap:**
1. ✅ McKinsey (blue, structured)
2. 🔄 Bain (red, bold)
3. ⏳ BCG (green, minimalist)
4. ⏳ Deloitte (black/white, modern)
5. ⏳ Custom (user-defined colors)

---

### Feature: Data Import from Excel/CSV

**Priority:** medium  
**Status:** new  
**Tags:** #integration #data #ux

**Description:**
Upload Excel files to auto-populate charts and tables in slides.

**Use case:**
Financial models, survey results, market data.

---

### Feature: Collaboration / Sharing

**Priority:** medium  
**Status:** new  
**Tags:** #ux #collaboration #enterprise

**Description:**
Share slide decks with team members for editing and comments.

**MVP scope:**
- View-only sharing links
- Comments on slides
- Version history

---

## AI Enhancements

### Feature: Smarter Content Generation

**Priority:** high  
**Status:** in-progress  
**Tags:** #ai #core

**Description:**
Improve prompt engineering for better slide content quality.

**Improvements:**
- Industry-specific language
- Slide type detection (exec summary vs. detail)
- "So what?" generation (key insights)
- Source citation suggestions

---

### Feature: Voice-to-Slide

**Priority:** low  
**Status:** new  
**Tags:** #ai #ux #experimental

**Description:**
Dictate slide content and have AI structure it into a presentation.

**Use case:**
Executive thinks out loud, AI builds the deck.

---

## Integrations

### Integration: Notion

**Priority:** medium  
**Status:** new  
**Tags:** #integration #workflow

**Description:**
Embed SlideTheory in Notion pages. Export slides directly to Notion databases.

---

### Integration: Google Slides

**Priority:** medium  
**Status:** new  
**Tags:** #integration #export

**Description:**
Direct export to Google Slides format.

---

### Integration: Slack

**Priority:** low  
**Status:** new  
**Tags:** #integration #collaboration

**Description:**
Slack bot for quick slide generation requests.

---

## Enterprise Features

### Feature: Brand Kit / Custom Themes

**Priority:** medium  
**Status:** new  
**Tags:** #enterprise #branding #templates

**Description:**
Upload brand colors, logos, fonts for on-brand slide generation.

**Target:** Agencies, in-house consulting teams

---

### Feature: Admin Dashboard

**Priority:** low  
**Status:** new  
**Tags:** #enterprise #admin

**Description:**
Manage team members, usage, billing from central dashboard.

---

### Feature: SSO / SAML

**Priority:** low  
**Status:** new  
**Tags:** #enterprise #security

**Description:**
Single sign-on for corporate customers.

---

## Quick Wins (Low Effort, High Impact)

1. ✅ **Keyboard shortcuts** - Ctrl+Enter to generate
2. 🔄 **Dark mode** - Toggle for UI
3. ⏳ **Undo/Redo** - History stack
4. ⏳ **Duplicate slide** - One-click copy
5. ⏳ **Slide search** - Find in deck

---

## Feature Voting

*Consider adding a public feature voting board (Canny, Featurebase) for user input.*

---

*See also: [Template Ideas](./templates.md)*
