// API Route: POST /api/slides/upload
// Handle PPTX/PDF uploads, extract metadata, generate embeddings

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Allowed MIME types
const ALLOWED_TYPES = [
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
  'application/vnd.ms-powerpoint', // PPT
  'application/pdf', // PDF
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Extract color palette from slide content
 * @param {string} content - Slide content text
 * @returns {Object} Color palette object
 */
function extractColorPalette(content) {
  // This is a simplified extraction
  // In production, you'd analyze the actual slide image/file
  const commonPalettes = {
    'blue': { primary: ['#1e3a8a', '#3b82f6'], secondary: ['#dbeafe', '#93c5fd'] },
    'green': { primary: ['#064e3b', '#10b981'], secondary: ['#d1fae5', '#6ee7b7'] },
    'purple': { primary: ['#581c87', '#8b5cf6'], secondary: ['#f3e8ff', '#c4b5fd'] },
    'red': { primary: ['#7f1d1d', '#ef4444'], secondary: ['#fee2e2', '#fca5a5'] },
    'orange': { primary: ['#7c2d12', '#f97316'], secondary: ['#ffedd5', '#fdba74'] },
    'teal': { primary: ['#134e4a', '#14b8a6'], secondary: ['#ccfbf1', '#5eead4'] },
    'gray': { primary: ['#1f2937', '#6b7280'], secondary: ['#f3f4f6', '#d1d5db'] }
  };
  
  // Default professional palette
  return {
    primary: ['#1e40af', '#3b82f6', '#60a5fa'],
    secondary: ['#dbeafe', '#bfdbfe', '#93c5fd'],
    accent: ['#f59e0b', '#10b981'],
    background: ['#ffffff', '#f8fafc'],
    text: ['#0f172a', '#334155', '#64748b']
  };
}

/**
 * Extract layout pattern from content
 * @param {string} content - Slide content text
 * @param {string} filename - Original filename
 * @returns {Object} Layout pattern object
 */
function extractLayoutPattern(content, filename) {
  // Infer layout from content structure
  const hasTitle = content.includes('Executive Summary') || 
                   content.includes('Overview') || 
                   content.match(/^\s*[A-Z][^.!?]{5,50}[.!?]\s*$/m);
  
  const bulletCount = (content.match(/^[\s]*[•\-\*\d][.\)]?\s+/gm) || []).length;
  const hasChart = content.includes('chart') || content.includes('graph') || 
                   content.includes('%') || content.includes('$');
  const hasTable = content.includes('|') || content.includes('\t');
  
  let layoutType = 'General';
  if (bulletCount >= 3 && hasTitle) layoutType = 'Executive Summary';
  else if (hasChart) layoutType = 'Graph / Chart';
  else if (content.includes('process') || content.includes('step')) layoutType = 'Horizontal Flow';
  else if (content.includes('breakdown') || content.includes('hierarchy')) layoutType = 'Vertical Flow';
  
  return {
    type: layoutType,
    has_title_slide: hasTitle,
    bullet_count: bulletCount,
    has_chart: hasChart,
    has_table: hasTable,
    content_density: content.length > 500 ? 'high' : content.length > 200 ? 'medium' : 'low',
    typography: 'clean, professional',
    description: `${layoutType} layout with ${bulletCount} key points${hasChart ? ' and data visualization' : ''}`
  };
}

/**
 * Extract tags from content
 * @param {string} content - Slide content
 * @param {string} industry - Industry hint
 * @returns {string[]} Array of tags
 */
function extractTags(content, industry) {
  const tags = new Set();
  
  // Add industry tag
  if (industry) tags.add(industry.toLowerCase());
  
  // Detect content themes
  const themes = {
    'strategy': ['strategy', 'strategic', 'plan', 'roadmap', 'vision'],
    'financial': ['revenue', 'profit', 'cost', 'budget', 'roi', 'financial', 'investment'],
    'marketing': ['marketing', 'brand', 'customer', 'audience', 'campaign'],
    'operations': ['operations', 'process', 'efficiency', 'workflow', 'logistics'],
    'technology': ['technology', 'digital', 'software', 'ai', 'automation', 'data'],
    'analysis': ['analysis', 'research', 'study', 'survey', 'findings'],
    'growth': ['growth', 'expansion', 'scale', 'increase', 'accelerate']
  };
  
  const contentLower = content.toLowerCase();
  for (const [theme, keywords] of Object.entries(themes)) {
    if (keywords.some(kw => contentLower.includes(kw))) {
      tags.add(theme);
    }
  }
  
  // Detect slide type
  if (contentLower.includes('chart') || contentLower.includes('graph')) tags.add('data-visualization');
  if (contentLower.includes('timeline') || contentLower.includes('roadmap')) tags.add('timeline');
  if (contentLower.includes('comparison')) tags.add('comparison');
  
  return Array.from(tags);
}

/**
 * Generate embedding for text
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} Embedding vector
 */
async function generateEmbedding(text) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.substring(0, 8000), // Limit input size
      dimensions: 1536
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.data[0]?.embedding || [];
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header required'
      });
    }

    // Parse multipart form data (simplified - in production use formidable or similar)
    // For this implementation, we expect base64-encoded file data
    const { 
      file_data, 
      filename, 
      mime_type, 
      title, 
      industry,
      slide_type,
      extracted_text 
    } = req.body;

    if (!file_data || !filename) {
      return res.status(400).json({
        success: false,
        error: 'file_data and filename are required'
      });
    }

    // Validate file type
    const fileMimeType = mime_type || 'application/octet-stream';
    if (!ALLOWED_TYPES.includes(fileMimeType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid file type. Allowed: PPTX, PPT, PDF`
      });
    }

    // Decode base64 file
    const fileBuffer = Buffer.from(file_data, 'base64');
    
    if (fileBuffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        error: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      });
    }

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });

    if (!userResponse.ok) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication'
      });
    }

    const userData = await userResponse.json();
    const userId = userData.id;

    // Upload file to Supabase Storage
    const fileExt = filename.split('.').pop();
    const storagePath = `${userId}/${Date.now()}.${fileExt}`;
    
    const uploadResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/slide-uploads/${storagePath}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': fileMimeType,
        'x-upsert': 'true'
      },
      body: fileBuffer
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      throw new Error(`Storage upload failed: ${error}`);
    }

    // Get public URL
    const { data: { publicUrl } } = await fetch(
      `${SUPABASE_URL}/storage/v1/object/public/slide-uploads/${storagePath}`
    );

    // Use provided extracted text or generate from filename
    const textContent = extracted_text || `Slide: ${title || filename}`;
    
    // Extract metadata
    const layoutPattern = extractLayoutPattern(textContent, filename);
    const colorPalette = extractColorPalette(textContent);
    const tags = extractTags(textContent, industry);

    // Generate embedding
    const embeddingText = `${title || filename} ${textContent} ${tags.join(' ')} ${industry || ''} ${slide_type || layoutPattern.type}`;
    const embedding = await generateEmbedding(embeddingText);

    // Create upload record
    const uploadRecord = {
      user_id: userId,
      original_filename: filename,
      file_url: `${SUPABASE_URL}/storage/v1/object/public/slide-uploads/${storagePath}`,
      file_size: fileBuffer.length,
      mime_type: fileMimeType,
      processing_status: 'completed',
      extracted_metadata: {
        layout_pattern: layoutPattern,
        color_palette: colorPalette,
        tags
      }
    };

    // Insert upload record
    const uploadResponse2 = await fetch(`${SUPABASE_URL}/rest/v1/slide_uploads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(uploadRecord)
    });

    const uploadData = await uploadResponse2.json();
    const uploadId = uploadData[0]?.id;

    // Create library entry
    const libraryRecord = {
      user_id: userId,
      title: title || filename.replace(/\.[^/.]+$/, ''),
      industry: industry || null,
      slide_type: slide_type || layoutPattern.type,
      layout_pattern: layoutPattern,
      color_palette: colorPalette,
      tags,
      source: 'uploaded',
      file_url: uploadRecord.file_url,
      preview_url: null, // Could generate thumbnail
      content: {
        extracted_text: textContent,
        filename,
        upload_id: uploadId
      },
      extracted_text: textContent,
      embedding,
      metadata: {
        file_size: fileBuffer.length,
        mime_type: fileMimeType,
        uploaded_at: new Date().toISOString()
      }
    };

    // Insert library record
    const libraryResponse = await fetch(`${SUPABASE_URL}/rest/v1/slide_library`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(libraryRecord)
    });

    const libraryData = await libraryResponse.json();

    return res.status(201).json({
      success: true,
      data: {
        upload_id: uploadId,
        library_id: libraryData[0]?.id,
        title: libraryRecord.title,
        file_url: uploadRecord.file_url,
        extracted_metadata: {
          layout_pattern: layoutPattern,
          color_palette: colorPalette,
          tags
        }
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
