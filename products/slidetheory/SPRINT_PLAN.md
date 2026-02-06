# SlideTheory Sprint Plan

## Overview

**Product:** SlideTheory - AI-powered slide generator for strategy consultants  
**Sprint Duration:** 2 weeks per sprint  
**Total Duration:** 6 weeks (3 sprints)  
**Team:** 1 Backend Agent, 1 Frontend Agent  

**Tech Stack:**
- **Frontend:** Next.js 14+, React, Tailwind CSS, TypeScript
- **Backend:** Supabase (Auth, Database, Edge Functions)
- **AI Generation:** Kimi API
- **Image Generation:** Nano Banana (future), current hybrid approach
- **Hosting:** Vercel
- **MCP Servers:** GitHub, Supabase, Puppeteer

---

## Sprint 1: Foundation

**Duration:** Weeks 1-2  
**Goal:** Establish core infrastructure - authentication, database schema, and basic UI shell

### Story 1.1: Supabase Auth Integration
**Points:** 5  
**Assignee:** Backend Agent

**Description:**
Implement complete authentication system using Supabase Auth.

**Acceptance Criteria:**
- [ ] User signup with email/password
- [ ] User login with email/password
- [ ] Password reset flow
- [ ] Session management (JWT tokens)
- [ ] Protected routes middleware
- [ ] Auth state persistence across page reloads
- [ ] Logout functionality

**Technical Tasks:**
1. Set up Supabase project and auth configuration
2. Create auth middleware for API protection
3. Implement signup/login/password reset API endpoints
4. Store user profiles in `profiles` table

**Dependencies:** None  
**Definition of Done:** User can sign up, log in, reset password, and access protected routes.

---

### Story 1.2: Database Schema Design
**Points:** 5  
**Assignee:** Backend Agent

**Description:**
Design and implement the core database schema for slides, users, and metadata.

**Acceptance Criteria:**
- [ ] `profiles` table (extends auth.users)
- [ ] `slides` table with all input fields
- [ ] `slide_outputs` table for generated content
- [ ] `user_settings` table for preferences
- [ ] Row Level Security (RLS) policies implemented
- [ ] Database migrations created
- [ ] TypeScript types generated from schema

**Schema Details:**

```sql
-- profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- slides table
CREATE TABLE slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Input fields
  slide_type TEXT NOT NULL CHECK (slide_type IN ('general', 'executive_summary', 'horizontal_flow', 'vertical_flow', 'graph_chart')),
  audience TEXT NOT NULL CHECK (audience IN ('c_suite_board', 'external_client', 'internal_team', 'pe_investors')),
  context TEXT,
  presentation_mode BOOLEAN DEFAULT TRUE,
  data_input TEXT,
  data_file_url TEXT,
  key_takeaway TEXT,
  
  -- Metadata
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- slide_outputs table
CREATE TABLE slide_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_id UUID REFERENCES slides(id) ON DELETE CASCADE NOT NULL,
  
  -- Generated content
  generated_title TEXT,
  generated_content JSONB,
  generated_html TEXT,
  image_url TEXT,
  
  -- Export formats
  png_url TEXT,
  pptx_url TEXT,
  pdf_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_settings table
CREATE TABLE user_settings (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  default_slide_type TEXT DEFAULT 'general',
  default_audience TEXT DEFAULT 'internal_team',
  default_presentation_mode BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Dependencies:** Story 1.1  
**Definition of Done:** All tables created with proper RLS, migrations documented, TypeScript types generated.

---

### Story 1.3: Project Setup & UI Shell
**Points:** 5  
**Assignee:** Frontend Agent

**Description:**
Initialize Next.js project with proper structure, install dependencies, and create the basic UI shell.

**Acceptance Criteria:**
- [ ] Next.js 14+ project initialized with TypeScript
- [ ] Tailwind CSS configured with custom design tokens
- [ ] shadcn/ui components installed and configured
- [ ] Project folder structure established
- [ ] Environment variables configured
- [ ] Supabase client initialized
- [ ] Basic layout component created

**Project Structure:**
```
slidetheory/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── reset-password/page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   └── api/
├── components/
│   ├── ui/              # shadcn components
│   ├── auth/            # Auth-related components
│   ├── layout/          # Layout components
│   └── shared/          # Shared components
├── lib/
│   ├── supabase/        # Supabase client & helpers
│   ├── utils.ts
│   └── constants.ts
├── types/
│   └── database.ts      # Generated from Supabase
└── public/
```

**Dependencies:** None  
**Definition of Done:** Project runs locally, can navigate between pages, Tailwind styles apply correctly.

---

### Story 1.4: Auth Pages UI
**Points:** 3  
**Assignee:** Frontend Agent

**Description:**
Build the authentication UI pages - login, signup, and password reset.

**Acceptance Criteria:**
- [ ] Login page with email/password form
- [ ] Signup page with email/password form
- [ ] Password reset request page
- [ ] Password reset confirmation page
- [ ] Form validation with error messages
- [ ] Loading states on submit
- [ ] Redirect to dashboard after successful auth
- [ ] Link to switch between login/signup

**Design Requirements:**
- Clean, modern design matching SlideTheory brand
- Navy (#003366) primary color
- Proper spacing and typography
- Mobile responsive

**Dependencies:** Story 1.3  
**Definition of Done:** User can visually complete auth flows end-to-end.

---

### Story 1.5: Dashboard Shell & Navigation
**Points:** 3  
**Assignee:** Frontend Agent

**Description:**
Create the main dashboard layout with navigation sidebar and user menu.

**Acceptance Criteria:**
- [ ] Sidebar navigation with links
- [ ] User avatar dropdown menu
- [ ] Logout button in user menu
- [ ] Protected route - redirects to login if not authenticated
- [ ] Responsive layout (sidebar collapses on mobile)
- [ ] Breadcrumb or page title area

**Navigation Items:**
- New Slide (main CTA)
- My Slides
- Settings
- Help

**Dependencies:** Story 1.4  
**Definition of Done:** Authenticated user sees dashboard with working navigation.

---

### Sprint 1 Summary

| Story | Points | Assignee | Status |
|-------|--------|----------|--------|
| 1.1 Supabase Auth | 5 | Backend | 🔴 Not Started |
| 1.2 Database Schema | 5 | Backend | 🔴 Not Started |
| 1.3 Project Setup | 5 | Frontend | 🔴 Not Started |
| 1.4 Auth Pages UI | 3 | Frontend | 🔴 Not Started |
| 1.5 Dashboard Shell | 3 | Frontend | 🔴 Not Started |
| **Total** | **21** | | |

**Sprint Goal:** User can sign up, log in, and view the dashboard shell.

---

## Sprint 2: Core Features

**Duration:** Weeks 3-4  
**Goal:** Implement slide generation form, preview panel, and AI integration

### Story 2.1: Slide Input Form (Left Panel)
**Points:** 8  
**Assignee:** Frontend Agent

**Description:**
Build the comprehensive slide input form with all required fields.

**Acceptance Criteria:**
- [ ] Slide type dropdown with options:
  - General
  - Executive Summary
  - Horizontal Flow
  - Vertical Flow
  - Graph/Chart
- [ ] Audience dropdown with options:
  - C-Suite/Board
  - External Client
  - Internal/Working Team
  - PE/Investors
- [ ] Context textbox (rich text, min 10 chars)
- [ ] Presentation mode toggle (Presentation vs Read)
- [ ] Data input box (text area for data entry)
- [ ] File upload for Excel/CSV files (optional)
- [ ] Key Takeaway textbox
- [ ] Generate button with loading state
- [ ] Form validation with inline errors
- [ ] Auto-save draft functionality

**UI Requirements:**
- Clean left panel design
- Proper field labels and help text
- Slide type icons/descriptions
- Audience-specific guidance hints
- Character count for text fields

**Dependencies:** Sprint 1 complete  
**Definition of Done:** User can fill out all form fields and submit for generation.

---

### Story 2.2: Slide Preview Panel (Right Panel)
**Points:** 8  
**Assignee:** Frontend Agent

**Description:**
Build the slide preview panel with proper 16:9 ratio and responsive design.

**Acceptance Criteria:**
- [ ] 16:9 ratio preview container (maintains aspect ratio)
- [ ] Placeholder state before generation
- [ ] Loading state with progress indicator
- [ ] Error state with retry option
- [ ] Generated slide display (HTML rendered)
- [ ] Zoom controls (fit, 100%, 150%)
- [ ] Fullscreen preview mode
- [ ] Responsive design (stacks on mobile)

**Preview States:**
1. **Empty State:** "Your slide preview will appear here"
2. **Loading State:** Progress bar + "Generating your slide..."
3. **Error State:** Error message + "Try Again" button
4. **Success State:** Rendered slide with download options

**Dependencies:** Story 2.1  
**Definition of Done:** Preview panel displays correctly in all states and maintains 16:9 ratio.

---

### Story 2.3: Kimi API Integration
**Points:** 8  
**Assignee:** Backend Agent

**Description:**
Implement the slide generation API using Kimi API for content creation.

**Acceptance Criteria:**
- [ ] Supabase Edge Function for slide generation
- [ ] Kimi API integration with proper error handling
- [ ] Prompt engineering for each slide type
- [ ] Audience-aware content tailoring
- [ ] Response parsing and formatting
- [ ] Rate limiting implementation
- [ ] Generation status updates (polling or SSE)
- [ ] Fallback/error handling for API failures

**API Contract:**
```typescript
// Request
POST /functions/v1/generate-slide
{
  slideId: string,
  slideType: 'general' | 'executive_summary' | 'horizontal_flow' | 'vertical_flow' | 'graph_chart',
  audience: 'c_suite_board' | 'external_client' | 'internal_team' | 'pe_investors',
  context: string,
  presentationMode: boolean,
  dataInput?: string,
  keyTakeaway: string
}

// Response
{
  success: boolean,
  data?: {
    title: string,
    content: {
      sections: Array<{
        type: 'header' | 'text' | 'bullet' | 'chart' | 'matrix',
        content: string,
        items?: string[]
      }>
    },
    html: string
  },
  error?: string
}
```

**Prompt Engineering Requirements:**
- System prompt instructs AI to create consulting-grade slides
- Include slide type-specific structure guidance
- Audience-aware tone (formal for C-Suite, collaborative for internal)
- Mode-aware detail level (Presentation = concise, Read = comprehensive)

**Dependencies:** Story 1.2  
**Definition of Done:** API successfully generates structured slide content via Kimi.

---

### Story 2.4: HTML Slide Templates
**Points:** 5  
**Assignee:** Frontend Agent

**Description:**
Create HTML templates for each slide type with McKinsey-style design.

**Acceptance Criteria:**
- [ ] General slide template
- [ ] Executive Summary template
- [ ] Horizontal Flow template
- [ ] Vertical Flow template
- [ ] Graph/Chart template (with placeholder charts)
- [ ] Consistent styling across all templates
- [ ] Responsive scaling within 16:9 container
- [ ] Professional typography and spacing

**Design Standards:**
- Primary color: Navy #003366
- Background: White #FFFFFF
- Accent: Blue #4A90E2
- Fonts: Inter for body, system-serif for accents
- Proper whitespace (no content touching edges)
- Clear visual hierarchy

**Dependencies:** Story 2.3  
**Definition of Done:** Each slide type renders correctly with professional styling.

---

### Story 2.5: Slide Rendering Engine
**Points:** 5  
**Assignee:** Backend Agent (with Frontend support)

**Description:**
Implement the slide rendering pipeline using Puppeteer for PNG generation.

**Acceptance Criteria:**
- [ ] Puppeteer MCP integration
- [ ] HTML to PNG conversion endpoint
- [ ] 1920x1080 (16:9) output resolution
- [ ] High-quality rendering (2x scale for retina)
- [ ] Storage of generated images in Supabase Storage
- [ ] Public URL generation for downloads
- [ ] Background processing with status tracking

**Technical Approach:**
1. Receive HTML content from Kimi generation
2. Inject into template with styling
3. Puppeteer captures screenshot at 1920x1080
4. Upload PNG to Supabase Storage
5. Update slide record with image_url

**Dependencies:** Story 2.3, Story 2.4  
**Definition of Done:** Slide generation produces downloadable PNG images.

---

### Story 2.6: My Slides Gallery
**Points:** 3  
**Assignee:** Frontend Agent

**Description:**
Build the slide gallery page showing all user's generated slides.

**Acceptance Criteria:**
- [ ] Grid layout of slide thumbnails
- [ ] Slide metadata display (title, date, type)
- [ ] Pagination or infinite scroll
- [ ] Search/filter by slide type
- [ ] Sort by date (newest first)
- [ ] Click to view/edit slide
- [ ] Empty state for new users

**Dependencies:** Story 2.5  
**Definition of Done:** User can view and navigate their slide history.

---

### Sprint 2 Summary

| Story | Points | Assignee | Status |
|-------|--------|----------|--------|
| 2.1 Slide Input Form | 8 | Frontend | 🔴 Not Started |
| 2.2 Preview Panel | 8 | Frontend | 🔴 Not Started |
| 2.3 Kimi API Integration | 8 | Backend | 🔴 Not Started |
| 2.4 HTML Templates | 5 | Frontend | 🔴 Not Started |
| 2.5 Rendering Engine | 5 | Backend | 🔴 Not Started |
| 2.6 Slides Gallery | 3 | Frontend | 🔴 Not Started |
| **Total** | **37** | | |

**Sprint Goal:** User can input slide details, generate AI content, and view rendered slide.

---

## Sprint 3: Polish & Launch

**Duration:** Weeks 5-6  
**Goal:** File uploads, exports, QA, and production readiness

### Story 3.1: Excel/CSV File Upload
**Points:** 5  
**Assignee:** Backend Agent

**Description:**
Implement file upload and parsing for Excel and CSV data files.

**Acceptance Criteria:**
- [ ] File upload endpoint with validation
- [ ] Support for .xlsx, .xls, .csv formats
- [ ] File size limit (5MB)
- [ ] Secure storage in Supabase Storage
- [ ] Excel parsing with SheetJS or similar
- [ ] CSV parsing with PapaParse
- [ ] Data extraction and storage as JSON
- [ ] Error handling for malformed files

**File Processing Flow:**
1. User uploads file
2. Validate file type and size
3. Store in Supabase Storage
4. Parse file contents
5. Extract tabular data as JSON
6. Store reference in slides.data_file_url

**Dependencies:** Sprint 2 complete  
**Definition of Done:** User can upload Excel/CSV and data is parsed correctly.

---

### Story 3.2: Data Visualization in Slides
**Points:** 5  
**Assignee:** Frontend Agent

**Description:**
Integrate chart rendering for data-driven slides.

**Acceptance Criteria:**
- [ ] Chart.js or Recharts integration
- [ ] Bar chart support
- [ ] Line chart support
- [ ] Pie/donut chart support
- [ ] Waterfall chart for financial data
- [ ] Automatic chart type selection based on data
- [ ] Chart styling matching SlideTheory brand
- [ ] Charts render in preview and exports

**Chart Types by Slide Type:**
- Graph/Chart: Auto-detect best chart type
- Financial: Waterfall charts
- Market Analysis: Bar/line charts
- Executive Summary: Donut/pie charts for summary data

**Dependencies:** Story 3.1  
**Definition of Done:** Uploaded data renders as appropriate charts in slides.

---

### Story 3.3: Export Functionality
**Points:** 5  
**Assignee:** Backend Agent

**Description:**
Implement PPTX and PDF export options.

**Acceptance Criteria:**
- [ ] PPTX export endpoint
- [ ] PDF export endpoint
- [ ] PPTX generation using pptxgenjs
- [ ] PDF generation using Puppeteer
- [ ] Proper formatting in exported files
- [ ] Download links for exports
- [ ] Export status tracking

**Export Requirements:**
- PPTX: Editable slides, proper text boxes, vector graphics
- PDF: High-quality, print-ready, embedded fonts
- Both maintain 16:9 aspect ratio

**Dependencies:** Story 2.5  
**Definition of Done:** User can download slides as PPTX and PDF.

---

### Story 3.4: Slide Regeneration & Iteration
**Points:** 3  
**Assignee:** Frontend Agent

**Description:**
Allow users to iterate on generated slides with feedback.

**Acceptance Criteria:**
- [ ] "Regenerate" button on completed slides
- [ ] Edit inputs before regenerating
- [ ] "Make it more formal/casual" quick options
- [ ] Compare previous versions
- [ ] Version history display
- [ ] Revert to previous version

**Dependencies:** Story 2.6  
**Definition of Done:** User can iterate on slides and compare versions.

---

### Story 3.5: User Settings
**Points:** 3  
**Assignee:** Frontend Agent

**Description:**
Build the user settings page for preferences.

**Acceptance Criteria:**
- [ ] Profile information editing
- [ ] Default slide type selection
- [ ] Default audience selection
- [ ] Default presentation mode
- [ ] Password change
- [ ] Account deletion option
- [ ] Form validation and success states

**Dependencies:** Sprint 2 complete  
**Definition of Done:** User can customize default preferences.

---

### Story 3.6: QA & Bug Fixes
**Points:** 5  
**Assignee:** Both Agents

**Description:**
Comprehensive testing and bug fixing across the application.

**Acceptance Criteria:**
- [ ] All user flows tested end-to-end
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile responsiveness verified
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance optimization (Lighthouse 90+)
- [ ] Security review of auth and API endpoints
- [ ] Error handling verified for all edge cases
- [ ] Load testing for generation API

**Test Scenarios:**
1. Complete user journey from signup to export
2. Edge cases: empty inputs, very long text, special characters
3. Concurrent slide generations
4. Network failure recovery
5. File upload edge cases

**Dependencies:** All previous stories  
**Definition of Done:** Zero critical bugs, all acceptance criteria met.

---

### Story 3.7: Production Deployment
**Points:** 3  
**Assignee:** Both Agents

**Description:**
Deploy the application to production and configure monitoring.

**Acceptance Criteria:**
- [ ] Environment variables configured for production
- [ ] Supabase production project set up
- [ ] Vercel deployment configured
- [ ] Custom domain connected (slidetheory.vercel.app)
- [ ] SSL certificates configured
- [ ] Error tracking (Sentry) integrated
- [ ] Analytics (Plausible or similar) added
- [ ] Database backups scheduled
- [ ] README with deployment instructions

**Dependencies:** Story 3.6  
**Definition of Done:** Application live on production URL, fully functional.

---

### Sprint 3 Summary

| Story | Points | Assignee | Status |
|-------|--------|----------|--------|
| 3.1 File Upload | 5 | Backend | 🔴 Not Started |
| 3.2 Data Visualization | 5 | Frontend | 🔴 Not Started |
| 3.3 Export Functionality | 5 | Backend | 🔴 Not Started |
| 3.4 Regeneration | 3 | Frontend | 🔴 Not Started |
| 3.5 User Settings | 3 | Frontend | 🔴 Not Started |
| 3.6 QA & Bug Fixes | 5 | Both | 🔴 Not Started |
| 3.7 Production Deploy | 3 | Both | 🔴 Not Started |
| **Total** | **29** | | |

**Sprint Goal:** Production-ready application with exports, file uploads, and QA complete.

---

## Summary

### Sprint Timeline

| Sprint | Duration | Focus | Total Points |
|--------|----------|-------|--------------|
| Sprint 1 | Weeks 1-2 | Foundation (Auth, DB, UI Shell) | 21 |
| Sprint 2 | Weeks 3-4 | Core Features (Generation, Preview) | 37 |
| Sprint 3 | Weeks 5-6 | Polish & Launch (Exports, QA) | 29 |
| **Total** | **6 Weeks** | | **87** |

### Team Allocation

**Backend Agent:**
- Sprint 1: Stories 1.1, 1.2 (10 points)
- Sprint 2: Stories 2.3, 2.5 (13 points)
- Sprint 3: Stories 3.1, 3.3, 3.6, 3.7 (18 points)
- **Total: 41 points**

**Frontend Agent:**
- Sprint 1: Stories 1.3, 1.4, 1.5 (11 points)
- Sprint 2: Stories 2.1, 2.2, 2.4, 2.6 (24 points)
- Sprint 3: Stories 3.2, 3.4, 3.5, 3.6, 3.7 (19 points)
- **Total: 54 points**

### Key Milestones

1. **End of Sprint 1:** User can sign up, log in, and see dashboard
2. **End of Sprint 2:** User can generate slides with AI and view previews
3. **End of Sprint 3:** Production launch with full feature set

### Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Kimi API rate limits | High | Implement caching, queue system |
| Puppeteer memory issues | Medium | Use serverless functions, optimize |
| File upload security | High | Strict validation, virus scanning |
| Complex data parsing | Medium | Start with CSV, add Excel later |

### Definition of Done (Global)

- [ ] Code reviewed and merged
- [ ] Tests passing (unit + integration)
- [ ] Documentation updated
- [ ] Acceptance criteria met
- [ ] No critical or high-priority bugs
- [ ] Design review completed (for UI stories)

---

## Next Steps

1. **Start Sprint 1:** Backend Agent begins with Story 1.1, Frontend Agent with Story 1.3
2. **Daily Standups:** Review progress, unblock issues
3. **Sprint Reviews:** Demo completed features at end of each sprint
4. **Retrospectives:** Process improvements for next sprint

---

*Document Version: 1.0*  
*Last Updated: 2026-02-06*  
*Product Manager: SlideTheory PM Agent*
