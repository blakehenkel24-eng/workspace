// API Route: GET /api/slides
// List user's slides

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
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

    // Forward query params
    const queryString = new URL(req.url, 'http://localhost').search;

    // Call Supabase Edge Function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/get-slides${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader
      }
    });

    const data = await response.json();

    return res.status(response.status).json(data);

  } catch (error) {
    console.error('Get slides error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
