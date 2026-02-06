# RAG Slide Repository

Semantic search-powered slide library for SlideTheory. Enables AI-generated slides to reference existing styles, layouts, and visual patterns.

## Architecture

```
User Query → Embedding Generation → Vector Search → Style Examples → Kimi Prompt → Generated Slide
```

## Components

### Database Schema

**slide_library** - Stores slides with vector embeddings for semantic search:
- `embedding VECTOR(1536)` - OpenAI text-embedding-3-small
- `layout_pattern JSONB` - Structural metadata
- `color_palette JSONB` - Color scheme information
- `industry`, `slide_type`, `tags` - Filterable metadata
- `source` - uploaded | generated | template | reference

**slide_uploads** - Tracks file uploads and processing status:
- Links uploaded files to library entries
- Processing pipeline state management

### Edge Functions

**search-slides** (`/functions/v1/search-slides`)
- Generates query embeddings via OpenAI
- Calls `search_similar_slides()` RPC
- Returns slides with style guidance

**generate-slide** (enhanced)
- RAG retrieval step before generation
- Injects similar slides into Kimi prompt
- Tracks RAG usage in metadata

### API Routes

- `POST /api/slides/search` - Search slide library
- `POST /api/slides/upload` - Upload PPTX/PDF with metadata extraction
- `POST /api/slides/generate` - Generate with RAG (use_rag: true by default)

## Seeding Reference Data

### Option 1: SQL Seed (Recommended)

Run the SQL seed file to populate with McKinsey reference decks:

```bash
# Via Supabase CLI
supabase db reset
supabase db seed apply

# Or execute directly
psql $DATABASE_URL -f supabase/seed-reference-slides.sql
```

### Option 2: Node.js Script

For dynamic seeding with actual OpenAI embeddings:

```bash
cd supabase
export OPENAI_API_KEY=sk-...
export SUPABASE_URL=https://...
export SUPABASE_SERVICE_ROLE_KEY=...

node seed-slide-library.js
```

## Reference Data Sources

### McKinsey Reference Decks (PDF)
Located in `/mvp/build/knowledge-base/reference-decks/`:

1. **mckinsey-top-trends-exec-summary.pdf**
   - Executive Summary slides
   - Trend analysis with data visualizations
   - Industry: consulting
   - Source: reference

2. **mckinsey-tech-trends-2022.pdf**
   - Technology trends framework
   - Process flows (AI implementation)
   - Waterfall charts (investment data)
   - Industry: consulting
   - Source: reference

### Generated Exports (PPTX)
Located in `/mvp/build/tmp/exports/`:
- 5 generated slide decks
- Source: generated
- Industry: general

## Color Palettes

### McKinsey Palette
```json
{
  "primary": ["#051C2C", "#2251FF", "#0077B6"],
  "secondary": ["#E8F4F8", "#B8E0F0", "#88CCE8"],
  "accent": ["#FF6B35", "#00C853"],
  "background": ["#FFFFFF", "#F5F7FA"],
  "text": ["#051C2C", "#2D3748", "#718096"]
}
```

### Standard Consulting Palette
```json
{
  "primary": ["#1E3A5F", "#2E5C8A", "#4A90A4"],
  "secondary": ["#E8F1F8", "#D1E3F0", "#B8D4E8"],
  "accent": ["#D97706", "#059669"],
  "background": ["#FFFFFF", "#F8FAFC"],
  "text": ["#0F172A", "#334155", "#64748B"]
}
```

## Usage Examples

### Search Slides
```javascript
const response = await fetch('/api/slides/search', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    query: "executive summary with market trends",
    filters: { industry: "consulting", slide_type: "Executive Summary" },
    limit: 3,
    threshold: 0.7
  })
});
```

### Generate with RAG
```javascript
const response = await fetch('/api/slides/generate', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    slide_type: "Executive Summary",
    audience: "C-Suite",
    context: "Q3 financial performance",
    industry: "consulting",
    use_rag: true,  // Enabled by default
    rag_limit: 3
  })
});
```

### Upload Slides
```javascript
const formData = new FormData();
formData.append('file_data', base64File);
formData.append('filename', 'presentation.pptx');
formData.append('title', 'My Template');
formData.append('industry', 'technology');

const response = await fetch('/api/slides/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

## SQL Functions

### search_similar_slides
```sql
SELECT * FROM search_similar_slides(
  query_embedding := $1,
  match_threshold := 0.7,
  match_count := 5,
  filter_user_id := NULL,  -- NULL for public templates
  filter_industry := 'consulting',
  filter_slide_type := 'Executive Summary'
);
```

### get_slides_by_style
```sql
SELECT * FROM get_slides_by_style(
  p_layout_pattern := '{"type": "Executive Summary"}'::JSONB,
  p_color_palette := '{"primary": ["#051C2C"]}'::JSONB,
  p_match_count := 5
);
```

## Performance

- **IVFFlat Index**: 100 lists for 1536-dim vectors
- **Similarity Threshold**: Default 0.7 (adjustable)
- **Query Latency**: ~100-200ms (embedding + search)
- **Storage**: ~6KB per embedding

## Future Enhancements

- [ ] Fine-tuned embeddings on slide-specific corpus
- [ ] Multi-modal embeddings (image + text)
- [ ] User feedback loop (thumbs up/down on retrieved slides)
- [ ] Style transfer between slides
- [ ] Automatic template generation from uploads

## Testing

Run the seed script and verify:
```sql
-- Check seed data
SELECT 
  source,
  industry,
  slide_type,
  COUNT(*)
FROM slide_library
GROUP BY source, industry, slide_type;

-- Test similarity search
SELECT 
  title,
  industry,
  1 - (embedding <=> (SELECT embedding FROM slide_library LIMIT 1)) as similarity
FROM slide_library
ORDER BY embedding <=> (SELECT embedding FROM slide_library LIMIT 1)
LIMIT 5;
```
