# SlideTheory Backend

Supabase-powered backend for SlideTheory slide generation app.

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Run database migrations**
   - Apply SQL files in `supabase/migrations/` via Supabase Dashboard

4. **Deploy Edge Functions**
   ```bash
   supabase functions deploy generate-slide
   supabase functions deploy save-slide
   supabase functions deploy get-slides
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
products/slidetheory/
├── api/                    # API Routes (Vercel/Node.js)
│   ├── auth/
│   │   ├── signup.js
│   │   └── login.js
│   └── slides/
│       ├── generate.js
│       ├── index.js
│       ├── list.js
│       └── [id].js
├── supabase/
│   ├── migrations/         # Database migrations
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_slides.sql
│   │   └── 003_setup_rls.sql
│   └── functions/          # Edge Functions
│       ├── generate-slide/
│       ├── save-slide/
│       └── get-slides/
└── README.md
```

## API Documentation

See `supabase/README.md` for full API documentation.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `KIMI_API_KEY` | Kimi API key for slide generation |
| `APP_URL` | Application URL |
| `NODE_ENV` | Environment (development/production) |

## Development

### Running Locally

```bash
# Start the API server
npm run dev

# Server runs on http://localhost:3000
```

### Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration
```

## Deployment

### Vercel

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Self-hosted

1. Set up environment variables
2. Run `npm install --production`
3. Start with `npm start`

## License

MIT
