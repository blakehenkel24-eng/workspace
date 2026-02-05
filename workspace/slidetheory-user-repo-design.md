# SlideTheory User Repository Design

*Architecture design compiled for Blake - Todoist Task #9988877375*

---

## Overview

Design for a user slide repository feature allowing SlideTheory users to save, organize, and retrieve their previously generated presentations.

---

## 1. Data Model

### 1.1 Entity Relationship Diagram

```
User (1)
├── SlideDeck (*) 
│   ├── Slide (*)
│   ├── Tag (*)
│   └── Folder (optional)
├── Folder (*)
│   └── SlideDeck (*)
└── UserPreferences (1)
```

### 1.2 Database Schema (PostgreSQL)

```sql
-- Users table (extends existing auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id VARCHAR(255) UNIQUE NOT NULL, -- From auth provider
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    storage_quota_bytes BIGINT DEFAULT 1073741824, -- 1GB default
    storage_used_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Folders for organization
CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Slide decks (presentations)
CREATE TABLE slide_decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    
    -- Content
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT, -- S3/R2 URL
    
    -- Metadata
    slide_count INTEGER DEFAULT 0,
    file_size_bytes INTEGER DEFAULT 0,
    
    -- Settings
    is_favorite BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    visibility VARCHAR(20) DEFAULT 'private', -- private, shared, public
    
    -- Versioning
    version INTEGER DEFAULT 1,
    parent_deck_id UUID REFERENCES slide_decks(id), -- For forks/versions
    
    -- Export formats stored
    formats JSONB DEFAULT '{}', -- {pptx: "url", pdf: "url", json: "url"}
    
    -- AI/Generation metadata
    generation_params JSONB, -- Store the prompt/settings used
    ai_model VARCHAR(50), -- Which model generated it
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual slides within a deck
CREATE TABLE slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES slide_decks(id) ON DELETE CASCADE,
    
    order_index INTEGER NOT NULL,
    layout_type VARCHAR(50), -- title, content, two-column, etc.
    
    -- Content stored as JSON for flexibility
    content JSONB NOT NULL,
    -- Example: {
    --   "title": "Slide Title",
    --   "body": "Content...",
    --   "images": [{"url": "...", "alt": "..."}],
    --   "notes": "Speaker notes..."
    -- }
    
    ai_generated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags system
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#6B7280',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

CREATE TABLE slide_deck_tags (
    deck_id UUID REFERENCES slide_decks(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (deck_id, tag_id)
);

-- Sharing/permissions
CREATE TABLE deck_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES slide_decks(id) ON DELETE CASCADE,
    share_token VARCHAR(255) UNIQUE NOT NULL, -- Public share link token
    password_hash VARCHAR(255), -- Optional password protection
    expires_at TIMESTAMP WITH TIME ZONE,
    allow_download BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log
CREATE TABLE deck_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES slide_decks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- Null for public views
    action VARCHAR(50) NOT NULL, -- created, viewed, edited, downloaded, shared
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_slide_decks_user_id ON slide_decks(user_id);
CREATE INDEX idx_slide_decks_folder_id ON slide_decks(folder_id);
CREATE INDEX idx_slide_decks_created_at ON slide_decks(created_at DESC);
CREATE INDEX idx_slide_decks_favorite ON slide_decks(user_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX idx_slides_deck_id ON slides(deck_id);
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_activity_deck_id ON deck_activity(deck_id, created_at DESC);
```

---

## 2. Storage Architecture

### 2.1 Storage Options Analysis

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Database Only** | Simple, ACID, easy backup | Expensive at scale, slower for large decks | ❌ Not recommended |
| **Object Storage (S3/R2)** | Cheap, scalable, CDN-friendly | Slightly more complex | ✅ **Recommended** |
| **Hybrid** | Metadata in DB, content in S3 | Best of both worlds | ✅ **Best for production** |

### 2.2 Recommended Hybrid Approach

**Database stores:**
- All metadata (titles, settings, tags)
- Slide structure and text content
- Small JSON configs

**Object Storage (R2/S3) stores:**
- Exported files (PPTX, PDF)
- Thumbnail images
- Large binary assets

### 2.3 Storage Structure (R2/S3)

```
slidetheory-storage/
├── users/
│   └── {user_id}/
│       ├── thumbnails/
│       │   └── {deck_id}.jpg
│       ├── exports/
│       │   └── {deck_id}/
│       │       ├── presentation.pptx
│       │       ├── presentation.pdf
│       │       └── source.json
│       └── assets/
│           └── {asset_id}.{ext}
```

---

## 3. API Design

### 3.1 REST Endpoints

```yaml
# Deck Management
GET    /api/v1/decks                    # List user's decks
POST   /api/v1/decks                    # Create new deck
GET    /api/v1/decks/:id                 # Get deck details
PUT    /api/v1/decks/:id                 # Update deck metadata
DELETE /api/v1/decks/:id                 # Delete deck
POST   /api/v1/decks/:id/duplicate       # Fork/duplicate deck

# Slide Management
GET    /api/v1/decks/:id/slides          # Get all slides
POST   /api/v1/decks/:id/slides          # Add slide
PUT    /api/v1/decks/:id/slides/:slideId # Update slide
DELETE /api/v1/decks/:id/slides/:slideId # Delete slide
POST   /api/v1/decks/:id/slides/reorder  # Reorder slides

# Folders
GET    /api/v1/folders                  # List folders
POST   /api/v1/folders                  # Create folder
PUT    /api/v1/folders/:id              # Update folder
DELETE /api/v1/folders/:id              # Delete folder

# Tags
GET    /api/v1/tags                     # List user's tags
POST   /api/v1/tags                     # Create tag
PUT    /api/v1/tags/:id                 # Update tag
DELETE /api/v1/tags/:id                 # Delete tag

# Search & Filter
GET    /api/v1/decks/search?q=keyword   # Search decks
GET    /api/v1/decks?tag=marketing       # Filter by tag
GET    /api/v1/decks?folder=:id         # Filter by folder
GET    /api/v1/decks?favorite=true      # Filter favorites

# Sharing
POST   /api/v1/decks/:id/share          # Create share link
DELETE /api/v1/decks/:id/share          # Revoke share
GET    /s/:token                        # Public view (no auth)

# Exports
POST   /api/v1/decks/:id/export         # Trigger export
GET    /api/v1/decks/:id/export/status   # Check export status
```

### 3.2 Request/Response Examples

**Create Deck:**
```http
POST /api/v1/decks
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Q1 Marketing Review",
  "description": "Quarterly performance summary",
  "folder_id": "uuid-here",
  "tags": ["marketing", "quarterly"],
  "slides": [
    {
      "layout_type": "title",
      "content": {
        "title": "Q1 2026 Marketing Results",
        "subtitle": "Performance Overview"
      }
    }
  ]
}
```

**Response:**
```json
{
  "id": "deck-uuid",
  "title": "Q1 Marketing Review",
  "slug": "q1-marketing-review",
  "thumbnail_url": "https://cdn.slidetheory.io/...",
  "slide_count": 1,
  "created_at": "2026-02-05T16:00:00Z",
  "updated_at": "2026-02-05T16:00:00Z"
}
```

**List Decks (with pagination):**
```http
GET /api/v1/decks?page=1&limit=20&sort=updated_at&order=desc
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "total_pages": 8
  }
}
```

---

## 4. UI/UX Design

### 4.1 Dashboard View

```
┌─────────────────────────────────────────────────────────────┐
│  SlideTheory                        [Search] [New Deck]     │
├──────────────┬──────────────────────────────────────────────┤
│              │  My Decks                              [▼]   │
│  📁 Folders  │  ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  ├── All     │  │ Deck 1  │ │ Deck 2  │ │ Deck 3  │         │
│  ├── Work    │  │ [thumb] │ │ [thumb] │ │ [thumb] │         │
│  ├── Personal│  │ Title   │ │ Title   │ │ Title   │         │
│  └── Archive │  │ 10 min ago           │ ♥        │         │
│              │  └─────────┘ └─────────┘ └─────────┘         │
│  🏷️ Tags     │                                               │
│  ├── Marketing                                            │
│  ├── Sales                                                │
│  └── Quarterly                                            │
│                                                           │
│  💾 Storage                                                │
│  [████░░░░░░] 400MB / 1GB                                 │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Key UI Components

**Deck Card:**
- Thumbnail preview
- Title + last modified
- Favorite toggle (⭐)
- Quick actions menu (⋮)
- Tags (colored pills)

**Folder Sidebar:**
- Tree navigation
- Drag-and-drop support
- Context menu (rename, delete, color)

**Search/Filter Bar:**
- Full-text search
- Tag filter chips
- Sort dropdown (date, name, size)
- View toggle (grid/list)

---

## 5. Technical Implementation

### 5.1 Backend Changes Needed

**New Dependencies:**
```json
{
  "@aws-sdk/client-s3": "^3.x",  // or Cloudflare R2 SDK
  "sharp": "^0.33.x",            // Image processing for thumbnails
  "puppeteer": "^21.x"           // PDF/PPTX generation
}
```

**Services to Create:**
1. `DeckService` - CRUD operations
2. `StorageService` - S3/R2 interactions
3. `ThumbnailService` - Generate deck previews
4. `ExportService` - PPTX/PDF generation
5. `SearchService` - Full-text search (PostgreSQL or Elasticsearch)

### 5.2 Database Migrations

```javascript
// migration/001_create_user_repo.js
exports.up = async (knex) => {
  await knex.schema.createTable('folders', ...);
  await knex.schema.createTable('slide_decks', ...);
  await knex.schema.createTable('slides', ...);
  await knex.schema.createTable('tags', ...);
  await knex.schema.createTable('slide_deck_tags', ...);
};
```

### 5.3 Caching Strategy

```javascript
// Redis cache keys
`deck:${deckId}` - Deck metadata (TTL: 1 hour)
`user:${userId}:decks:list` - Deck list (TTL: 5 minutes)
`user:${userId}:storage` - Storage usage (TTL: 15 minutes)
```

---

## 6. Implementation Phases

### Phase 1: MVP (2-3 weeks)
- [ ] Database schema
- [ ] Basic CRUD API for decks
- [ ] Simple folder structure
- [ ] Grid view UI

### Phase 2: Polish (2 weeks)
- [ ] Thumbnail generation
- [ ] Search functionality
- [ ] Favorites
- [ ] Tags

### Phase 3: Advanced (2-3 weeks)
- [ ] Sharing/public links
- [ ] Export formats (PPTX, PDF)
- [ ] Storage quotas
- [ ] Activity log

### Phase 4: Scale (ongoing)
- [ ] Real-time collaboration
- [ ] Version history
- [ ] Template marketplace integration
- [ ] AI-powered organization

---

## 7. Security Considerations

1. **Authorization** - Verify user owns deck before any operation
2. **Storage limits** - Enforce quotas at API and storage levels
3. **Share tokens** - Cryptographically random, time-limited
4. **Content scanning** - Optional virus scan on uploads
5. **Rate limiting** - Prevent abuse of export/generation endpoints

---

*This architecture balances flexibility, performance, and maintainability for the user repository feature.*
