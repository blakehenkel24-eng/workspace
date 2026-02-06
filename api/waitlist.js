// /api/waitlist.js - Email signup endpoint
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, source } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    // TODO: Store in Supabase when connected
    console.log('New signup:', email, 'from:', source);

    res.status(200).json({
      success: true,
      message: 'Thanks for signing up! We\'ll be in touch soon.',
    });

  } catch (error) {
    res.status(500).json({ error: 'Signup failed' });
  }
};
