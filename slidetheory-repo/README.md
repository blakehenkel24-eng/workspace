# SlideTheory

AI-powered slide generation for strategy consultants.

## 🚀 Deployed on Vercel

Auto-deploys from GitHub pushes.

## 📁 Structure

```
├── api/           # Serverless API functions
│   ├── generate.js    # Slide generation
│   ├── health.js      # Health check
│   └── waitlist.js    # Email signup
├── public/        # Static files
│   ├── index.html     # Landing page
│   └── app/           # Slide generator
├── vercel.json    # Vercel config
└── package.json   # Dependencies
```

## 🔑 Environment Variables

- `KIMI_API_KEY` - Kimi AI API key

## 🌐 URLs

- `/` - Landing page with email signup
- `/app` - Slide generator
- `/api/generate` - AI slide generation API
