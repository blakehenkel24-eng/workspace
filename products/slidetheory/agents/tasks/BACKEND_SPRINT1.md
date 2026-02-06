# Backend Agent - Sprint 1 Tasks

## Your Mission
Implement the backend foundation for SlideTheory: authentication and database schema.

## Context
- **Product:** SlideTheory - AI-powered slide generator for strategy consultants
- **Tech Stack:** Supabase (Auth, Database, Edge Functions)
- **Repo:** blakehenkel24-eng/workspace
- **MCP Servers:** Supabase, GitHub connected

## Sprint 1 Stories Assigned to You

### Story 1.1: Supabase Auth Integration (5 points)
**Priority: HIGH - Start First**

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

**Files to Create/Modify:**
- `/products/slidetheory/mvp/build/src/lib/supabase.ts` - Supabase client
- `/products/slidetheory/mvp/build/src/middleware/auth.ts` - Auth middleware
- `/products/slidetheory/mvp/build/src/routes/auth.ts` - Auth routes

---

### Story 1.2: Database Schema Design (5 points)
**Priority: HIGH - Start After Auth**

Design and implement the core database schema.

**Acceptance Criteria:**
- [ ] `profiles` table (extends auth.users)
- [ ] `slides` table with all input fields
- [ ] `slide_outputs` table for generated content
- [ ] `user_settings` table for preferences
- [ ] Row Level Security (RLS) policies implemented
- [ ] Database migrations created
- [ ] TypeScript types generated from schema

**Schema Details:**
See full schema in `/products/slidetheory/SPRINT_PLAN.md`

**Key Tables:**
1. `profiles` - User profile data
2. `slides` - Slide inputs and metadata
3. `slide_outputs` - Generated content and exports
4. `user_settings` - User preferences

**Files to Create:**
- `/products/slidetheory/mvp/build/supabase/migrations/001_initial_schema.sql`
- `/products/slidetheory/mvp/build/src/types/database.ts` - Generated types

---

## Definition of Done
- All acceptance criteria met
- Code committed to GitHub
- Tests passing
- Documentation updated

## Dependencies
- Supabase project access (use MCP Supabase server)
- GitHub repo access (use MCP GitHub server)

## Communication
- Report progress to main agent
- Ask for help if blocked > 2 hours
- Daily status updates

## Output Location
All code should be written to: `/products/slidetheory/mvp/build/`

## References
- Sprint Plan: `/products/slidetheory/SPRINT_PLAN.md`
- Product Spec: `/products/slidetheory/PRODUCT-SPEC.md`
