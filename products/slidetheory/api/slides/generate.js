// API Route: POST /api/slides/generate
// Proxies to Supabase Edge Function for slide generation

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

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

    // Validate request body
    const { slide_type, audience, context, key_takeaway } = req.body;

    if (!slide_type || !audience || !context || !key_takeaway) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: slide_type, audience, context, key_takeaway'
      });
    }

    // Call Supabase Edge Function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-slide`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    return res.status(response.status).json(data);

  } catch (error) {
    console.error('Generate slide error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
