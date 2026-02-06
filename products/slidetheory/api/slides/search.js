// API Route: POST /api/slides/search
// Search slide library using semantic similarity

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

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

    // Parse request body
    const { query, filters, limit, threshold } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    // Validate limit (max 20)
    const searchLimit = Math.min(Math.max(parseInt(limit) || 5, 1), 20);
    
    // Validate threshold (0.0 to 1.0)
    const searchThreshold = Math.min(Math.max(parseFloat(threshold) || 0.7, 0.0), 1.0);

    // Call Supabase Edge Function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/search-slides`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        query: query.trim(),
        filters: filters || {},
        limit: searchLimit,
        threshold: searchThreshold
      })
    });

    const data = await response.json();

    return res.status(response.status).json(data);

  } catch (error) {
    console.error('Search slides error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
