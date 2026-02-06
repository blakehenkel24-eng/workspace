# Frontend Agent - Sprint 1 Tasks

## Your Mission
Implement the frontend foundation for SlideTheory: project setup, auth UI, and dashboard shell.

## Context
- **Product:** SlideTheory - AI-powered slide generator for strategy consultants
- **Tech Stack:** Next.js 14+, React, Tailwind CSS, TypeScript, shadcn/ui
- **Repo:** blakehenkel24-eng/workspace
- **MCP Servers:** GitHub connected

## Sprint 1 Stories Assigned to You

### Story 1.3: Project Setup & UI Shell (5 points)
**Priority: HIGH - Start First**

Initialize Next.js project with proper structure and dependencies.

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

**Design Tokens:**
- Primary: Navy #003366
- Background: White #FFFFFF
- Accent: Blue #4A90E2
- Font: Inter

---

### Story 1.4: Auth Pages UI (3 points)
**Priority: HIGH - Start After Project Setup**

Build the authentication UI pages.

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

**Files to Create:**
- `/products/slidetheory/mvp/build/app/auth/login/page.tsx`
- `/products/slidetheory/mvp/build/app/auth/signup/page.tsx`
- `/products/slidetheory/mvp/build/app/auth/reset-password/page.tsx`
- `/products/slidetheory/mvp/build/components/auth/login-form.tsx`
- `/products/slidetheory/mvp/build/components/auth/signup-form.tsx`

---

### Story 1.5: Dashboard Shell & Navigation (3 points)
**Priority: MEDIUM - Start After Auth Pages**

Create the main dashboard layout with navigation.

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

**Files to Create:**
- `/products/slidetheory/mvp/build/app/dashboard/page.tsx`
- `/products/slidetheory/mvp/build/components/layout/sidebar.tsx`
- `/products/slidetheory/mvp/build/components/layout/header.tsx`
- `/products/slidetheory/mvp/build/components/layout/user-menu.tsx`

---

## Definition of Done
- All acceptance criteria met
- Code committed to GitHub
- UI matches design specifications
- Mobile responsive verified
- Accessibility (ARIA labels, keyboard nav)

## Dependencies
- Backend Agent completing Story 1.1 (Supabase Auth)
- GitHub repo access (use MCP GitHub server)

## Communication
- Report progress to main agent
- Ask for help if blocked > 2 hours
- Daily status updates
- Coordinate with Backend Agent on API contracts

## Output Location
All code should be written to: `/products/slidetheory/mvp/build/`

## References
- Sprint Plan: `/products/slidetheory/SPRINT_PLAN.md`
- Product Spec: `/products/slidetheory/PRODUCT-SPEC.md`
- **PROMPT_INSTRUCTIONS.md:** `/products/slidetheory/PROMPT_INSTRUCTIONS.md` (Review for Sprint 2 context - contains slide archetype layouts)
