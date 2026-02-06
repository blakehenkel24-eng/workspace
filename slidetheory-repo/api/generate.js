// /api/generate.js - Serverless function for Vercel
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.KIMI_API_KEY,
  baseURL: process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1',
});

const SYSTEM_PROMPT = `You are an expert strategy consultant who creates McKinsey/BCG-quality slide content.

Generate professional slide content in this format:

# Slide Title

## Header 1
- Bullet point with insight
- Another key finding

## Header 2
- Supporting data point
- Strategic recommendation

Keep it concise, data-driven, and executive-ready.`;

module.exports = async (req, res) => {
  // Enable CORS
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
    const { slideType, context, targetAudience, audience } = req.body;
    
    // Normalize field names
    const audienceValue = targetAudience || audience;
    
    if (!slideType || !context || context.length < 10) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'slideType and context (min 10 chars) required'
      });
    }

    const userPrompt = `Create a ${slideType} slide for ${audienceValue || 'executives'}.

Context: ${context}

Generate the slide content now.`;

    const completion = await openai.chat.completions.create({
      model: 'kimi-k2-5',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0].message.content;

    res.status(200).json({
      success: true,
      slide: {
        type: slideType,
        content: content,
        title: content.split('\n')[0].replace('# ', ''),
      },
      tokens: completion.usage,
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({
      error: 'Generation failed',
      message: error.message,
    });
  }
};
