# MBB Slide Generator v0.1

Generate McKinsey, Bain, BCG-style consulting slides using AI.

## What it does

Takes your inputs (slide type, audience, context, data) and generates:
- **Slide Preview** - Visual representation of the slide
- **Copy-Paste Content** - Formatted text you can use directly

## Setup

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Kimi API key:
   ```
   KIMI_API_KEY=sk-kimi-your-key-here
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open http://localhost:3000 in your browser

## Usage

1. Select **Slide Type** (Executive Summary, Recommendation, etc.)
2. Select **Audience** (C-Suite, PE Investors, etc.)
3. Describe the **Context** - what the slide needs to communicate
4. Add any **Data** or **Key Takeaway** (optional)
5. Click **Generate Slide**

The AI will create:
- An action-oriented title
- Structured bullet points
- Copy-pasteable text

## Cost

Each generation uses Kimi API tokens. Typical cost: ~$0.01-0.05 per slide.

## Next Features (v0.2)

- [ ] Excel-style data input
- [ ] PowerPoint export
- [ ] Multiple slide templates
- [ ] Image generation integration

## Project Structure

```
mbb-slide-generator/
├── index.html          # Frontend UI
├── server.js           # Express backend
├── package.json        # Dependencies
├── .env.example        # Environment template
└── README.md           # This file
```