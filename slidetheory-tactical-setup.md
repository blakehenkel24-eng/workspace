# SlideTheory Tactical Setup Checklist
## Every Account, Every Click, Every Step

---

## ACCOUNTS TO CREATE (Do These First)

### 1. STRIPE (Payments)
**URL:** https://dashboard.stripe.com/register
**Steps:**
1. Sign up with your email
2. Complete identity verification (upload ID)
3. Go to "Developers" → "API keys"
4. Copy "Publishable key" and "Secret key"
5. Save to: `.env.local` file in your project
```
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
6. Go to "Products" → "Add product"
   - Name: "SlideTheory Pro"
   - Price: $29/month
   - Recurring: Monthly
7. Copy price ID: `price_...`
8. Save to `.env.local`: `STRIPE_PRICE_ID=price_...`

**Time:** 20 minutes

---

### 2. SUPABASE (Database + Auth)
**URL:** https://supabase.com/
**Steps:**
1. Sign up with GitHub (fastest)
2. Click "New Project"
   - Name: "slidetheory"
   - Database password: (generate strong password, save it)
3. Wait for database to provision (~2 min)
4. Go to "Project Settings" → "API"
5. Copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key
6. Save to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```
7. Go to "Authentication" → "Settings" → "Providers"
   - Enable: Email (enabled by default)
   - Optional: Enable Google, LinkedIn OAuth
8. Go to "Database" → "Tables" → "New Table"
   - Table name: `decks`
   - Columns:
     - `id` (uuid, primary key)
     - `user_id` (uuid, foreign key to auth.users)
     - `title` (text)
     - `content` (text)
     - `created_at` (timestamp)
     - `updated_at` (timestamp)

**Time:** 30 minutes

---

### 3. KIMI API (AI Generation)
**URL:** https://platform.moonshot.cn/
**Steps:**
1. Sign up with email
2. Complete verification (phone number required)
3. Go to "API Keys"
4. Generate new key
5. Copy the key (starts with `sk-`)
6. Save to `.env.local`:
```
KIMI_API_KEY=sk-...
```
7. Note the model name: `moonshot-v1-128k`

**Time:** 15 minutes

---

### 4. VERCEL (Hosting)
**URL:** https://vercel.com/
**Steps:**
1. Sign up with GitHub
2. Click "Add New Project"
3. Import your GitHub repo: `blakehenkel24-eng/slidetheory`
4. Framework: Next.js
5. Root directory: `./` (if your app is in root)
6. Environment Variables: Add all from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_ID`
   - `KIMI_API_KEY`
7. Click "Deploy"
8. Wait for build (~2 min)
9. Go to "Settings" → "Domains"
10. Add custom domain: `slidetheory.io` (if you own it)
    - Or use Vercel subdomain for now

**Time:** 15 minutes

---

### 5. GOOGLE ANALYTICS (Tracking)
**URL:** https://analytics.google.com/
**Steps:**
1. Sign in with Google account
2. Click "Start measuring"
3. Account name: "SlideTheory"
4. Property name: "SlideTheory Website"
5. Time zone: America/Chicago
6. Currency: USD
7. Click "Create"
8. Data stream: "Web"
9. Website URL: `https://slidetheory.io` (or Vercel URL)
10. Stream name: "Website"
11. Copy "Measurement ID" (looks like `G-XXXXXXXXXX`)
12. Save to `.env.local`:
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```
13. Install in your Next.js app (or ask me to code it)

**Time:** 15 minutes

---

### 6. DOMAIN (Optional but recommended)
**URL:** https://www.namecheap.com/ or https://porkbun.com/
**Steps:**
1. Search for: `slidetheory.io` or `slidetheory.com`
2. If available, add to cart
3. Checkout (~$10-15/year)
4. After purchase, go to "Manage Domain"
5. Go to "Advanced DNS" or "DNS Settings"
6. Add records:
   - Type: A, Host: @, Value: 76.76.21.21 (Vercel's IP)
   - Type: CNAME, Host: www, Value: cname.vercel-dns.com
7. In Vercel: Go to project → Settings → Domains → Add Domain
8. Enter your domain
9. Vercel will verify DNS (may take 5 min - 24 hours)

**Time:** 20 minutes

---

### 7. RESEND (Email Service)
**URL:** https://resend.com/
**Steps:**
1. Sign up with email
2. Go to "API Keys"
3. Generate new key
4. Copy key
5. Save to `.env.local`:
```
RESEND_API_KEY=re_...
```
6. Go to "Domains"
7. Add domain: `slidetheory.io` (or `mail.slidetheory.io`)
8. Follow DNS verification steps
9. Verify domain

**Time:** 15 minutes

---

### 8. LINKEDIN (Company Page)
**URL:** https://www.linkedin.com/company/new
**Steps:**
1. Click "Create a Company Page"
2. Select: "Small business" or "Showcase page"
3. Page name: "SlideTheory"
4. LinkedIn public URL: `linkedin.com/company/slidetheory`
5. Website: `https://slidetheory.io`
6. Industry: "Software Development"
7. Company size: "1-10 employees"
8. Company type: "Self-employed"
9. Logo: Upload logo (or text logo for now)
10. Tagline: "AI-powered slide generation for strategy consultants"
11. Description: (copy from landing page)
12. Click "Create page"

**Time:** 10 minutes

---

### 9. TWITTER/X (Account)
**URL:** https://twitter.com/i/flow/signup
**Steps:**
1. Sign up with email
2. Choose username: `@slidetheory` (or available variant)
3. Skip "What are you interested in?" for now
4. Upload profile picture (logo)
5. Bio: "AI-powered slide generation for strategy consultants | Built by a former consultant who hated making decks"
6. Website: `slidetheory.io`
7. Location: Chicago, IL

**Time:** 10 minutes

---

### 10. PRODUCT HUNT (For Launch)
**URL:** https://www.producthunt.com/
**Steps:**
1. Sign up with Twitter or LinkedIn
2. Complete profile
3. Go to "Submit Product" (but don't submit yet)
4. Draft your listing:
   - Name: SlideTheory
   - Tagline: "Generate consultant-grade slides in minutes"
   - Description: (copy from landing page)
   - Maker: Your profile
   - Categories: Productivity, SaaS, AI
   - Thumbnail: Product screenshot
   - Gallery: 3-5 screenshots of the product

**Time:** 20 minutes (draft only, don't submit yet)

---

## ENVIRONMENT VARIABLES FILE

Create `.env.local` in your project root. Should look like this:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# Kimi API
KIMI_API_KEY=sk-...

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Resend Email
RESEND_API_KEY=re_...

# App URL
NEXT_PUBLIC_APP_URL=https://slidetheory.io
```

**NEVER commit this file to Git.** It's in `.gitignore` by default in Next.js.

---

## DAY-BY-DAY EXECUTION

### Day 1: Accounts
- [ ] Stripe account created
- [ ] Supabase project created
- [ ] Kimi API key obtained
- [ ] Vercel account created
- [ ] `.env.local` file created with all keys

### Day 2: Core Product
- [ ] Supabase auth working (sign up/log in)
- [ ] Kimi API integrated (can generate text)
- [ ] Basic UI: input box + generate button
- [ ] Output displays generated content

### Day 3: Payments
- [ ] Stripe checkout page created
- [ ] Webhook handler created
- [ ] Can upgrade from Free to Pro
- [ ] Subscription status saved to database

### Day 4: Polish
- [ ] Decks save to database
- [ ] Can view previous decks
- [ ] Export to PPTX (or PDF if easier)
- [ ] Landing page deployed

### Day 5: Launch Prep
- [ ] Google Analytics installed
- [ ] LinkedIn company page created
- [ ] Twitter account created
- [ ] Product Hunt draft created

### Day 6: Beta
- [ ] Send to 3 friends who are consultants
- [ ] Get feedback
- [ ] Fix critical bugs

### Day 7: Soft Launch
- [ ] Post on personal LinkedIn
- [ ] Post on personal Twitter
- [ ] Email beta users: "We're live!"

---

## COMMON SETUP ISSUES

**"Stripe webhook failing"**
→ Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

**"Supabase auth not working"**
→ Check redirect URLs in Supabase Auth settings. Must match your domain exactly.

**"Kimi API returning errors"**
→ Check your API key. Kimi requires Chinese phone verification. If stuck, use OpenAI as backup.

**"Vercel build failing"**
→ Check Environment Variables are set in Vercel dashboard, not just local.

**"Domain not connecting"**
→ DNS takes 5 min - 24 hours. Use Vercel subdomain until DNS propagates.

---

## TOTAL TIME ESTIMATE

| Task | Time |
|------|------|
| Create all accounts | 2.5 hours |
| Core product build | 8-12 hours |
| Landing page | 4-6 hours |
| Testing & polish | 4-6 hours |
| **Total** | **20-30 hours** |

**Working 4 hours/day = 5-7 days to launch**

---

## WHAT TO DO RIGHT NOW

**If you have 30 minutes:**
1. Create Stripe account
2. Create Supabase account
3. Get Kimi API key
4. Create `.env.local` with the keys

**If you have 2 hours:**
1. Do all account creation above
2. Deploy basic Next.js app to Vercel
3. Connect Supabase auth

**Want me to help?**
Tell me which account you're stuck on, or spawn an agent to walk you through it step by step.
