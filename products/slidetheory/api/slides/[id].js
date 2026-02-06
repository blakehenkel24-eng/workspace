// API Route: GET/DELETE /api/slides/[id]
// Get or delete a specific slide

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Slide ID is required'
    });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Authorization header required'
    });
  }

  try {
    // Get the token from auth header
    const token = authHeader.replace('Bearer ', '');

    if (req.method === 'GET') {
      // Get single slide
      const response = await fetch(`${SUPABASE_URL}/rest/v1/slides?id=eq.${id}&select=*`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!data || data.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Slide not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: data[0]
      });
    }

    if (req.method === 'DELETE') {
      // Delete slide
      const response = await fetch(`${SUPABASE_URL}/rest/v1/slides?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': authHeader,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        return res.status(response.status).json({
          success: false,
          error: error || 'Failed to delete slide'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Slide deleted successfully'
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error) {
    console.error('Slide operation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
