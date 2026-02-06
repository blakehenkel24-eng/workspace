// /api/generate-v2.js - Serverless function for Vercel with RAG integration
const { OpenAI } = require('openai');
const crypto = require('crypto');

// Initialize OpenAI client for Kimi API
const openai = new OpenAI({
  apiKey: process.env.KIMI_API_KEY,
  baseURL: process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1',
});

// Supabase configuration for RAG
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const SYSTEM_PROMPT = `You are an expert strategy consultant who creates McKinsey/BCG-quality slide content.

Generate professional slide content following these principles:
- MECE: Mutually Exclusive, Collectively Exhaustive organization
- Pyramid Principle: Lead with the "so-what", support with evidence
- Executive-level tone: Clear, concise, action-oriented
- Visual clarity: Every element serves a purpose

Respond with a JSON object containing:
- headline: Action-oriented headline (5-8 words, front-loads the insight)
- subheadline: Optional supporting context (max 10 words)
- content: Object with primary_message and bullet_points array
- supporting_elements: Array of metrics or key data points

Keep bullets under 12 words each, use parallel structure, and front-load insights.`;

/**
 * Search for similar slides in Supabase (RAG)
 */
async function searchSimilarSlides(query, slideType, limit = 3) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Supabase not configured, skipping RAG');
      return [];
    }

    // Call the search-slides edge function or RPC
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/search_internal_slides`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({
        query_embedding: null, // We'll skip embedding generation for now and use text search
        match_threshold: 0.5,
        match_count: limit,
        filter_industry: null,
        filter_slide_type: slideType || null,
      }),
    });

    if (!response.ok) {
      console.log('RAG search failed:', await response.text());
      return [];
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('RAG search error:', error);
    return [];
  }
}

/**
 * Format style examples for the prompt
 */
function formatStyleExamples(slides) {
  if (!slides || slides.length === 0) {
    return '';
  }

  const examples = slides.map((slide, index) => {
    const sg = slide.style_guidance || {};
    return `
Example ${index + 1}:
- Title: "${slide.title || 'Untitled'}"
- Type: ${slide.slide_type || 'General'}${slide.industry ? ` | Industry: ${slide.industry}` : ''}
- Layout: ${sg.layout_description || 'Standard consulting layout'}
- Colors: ${sg.primary_colors?.join(', ') || 'Professional blue palette'}
- Style: ${sg.visual_approach || 'Clean, minimal'}
`;
  }).join('\n');

  return `

STYLE REFERENCE - Use these as inspiration for visual design:
${examples}
`;
}

/**
 * Generate slide using AI with RAG enhancement
 */
async function generateWithAI(userPrompt, styleExamples) {
  const fullPrompt = styleExamples 
    ? `${userPrompt}\n${styleExamples}`
    : userPrompt;

  const completion = await openai.chat.completions.create({
    model: 'moonshot-v1-128k',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: fullPrompt }
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  return completion.choices[0].message.content;
}

/**
 * Generate slide using templates (fallback when AI is unavailable)
 */
function generateWithTemplate(slideType, context, keyTakeaway, audience) {
  const templates = {
    'Executive Summary': {
      headline: keyTakeaway,
      subheadline: `Strategic analysis for ${audience || 'executives'}`,
      content: {
        primary_message: keyTakeaway,
        bullet_points: [
          'Market analysis reveals significant growth opportunities in target segments',
          'Competitive positioning strengthened through differentiated value proposition',
          'Implementation roadmap outlines clear milestones for next 12 months',
          'Financial projections indicate strong ROI with manageable risk profile'
        ]
      },
      supporting_elements: [
        { label: 'Market Size', value: '$2.4B', trend: '+15%' },
        { label: 'Growth Rate', value: '23%', trend: 'CAGR' }
      ]
    },
    'Market Analysis': {
      headline: keyTakeaway,
      subheadline: 'Comprehensive market assessment and competitive landscape',
      content: {
        primary_message: keyTakeaway,
        bullet_points: [
          'Total addressable market estimated at $5.2B with 18% annual growth',
          'Key competitors hold 65% combined market share, fragmentation opportunity exists',
          'Customer segmentation reveals three high-value target personas',
          'Pricing analysis suggests room for 10-15% premium positioning'
        ]
      },
      supporting_elements: [
        { label: 'TAM', value: '$5.2B', trend: '+18%' },
        { label: 'Top 3 Share', value: '65%', trend: 'Consolidated' }
      ]
    },
    'Strategy': {
      headline: keyTakeaway,
      subheadline: 'Recommended strategic initiatives and implementation approach',
      content: {
        primary_message: keyTakeaway,
        bullet_points: [
          'Phase 1: Establish market presence through strategic partnerships',
          'Phase 2: Scale operations with optimized go-to-market strategy',
          'Phase 3: Capture market leadership via innovation and M&A',
          'Risk mitigation plan addresses key market and operational uncertainties'
        ]
      },
      supporting_elements: [
        { label: 'Investment Required', value: '$12M', trend: 'Series A' },
        { label: 'Payback Period', value: '18 mo', trend: 'Conservative' }
      ]
    }
  };

  const template = templates[slideType] || templates['Executive Summary'];
  
  // Customize based on context
  if (context.toLowerCase().includes('europe') || context.toLowerCase().includes('expansion')) {
    template.content.bullet_points[0] = 'European market entry strategy targets 5 key countries with $1.8B combined TAM';
    template.content.bullet_points[1] = 'Regulatory compliance framework addresses GDPR and local market requirements';
  }

  return template;
}

/**
 * Parse AI response to extract structured content
 */
function parseAIResponse(aiContent, fallbackData) {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)```/) || 
                      aiContent.match(/```\s*([\s\S]*?)```/) ||
                      [null, aiContent];
    const jsonStr = jsonMatch[1]?.trim() || aiContent.trim();
    
    // Find JSON object boundaries
    const jsonStart = jsonStr.indexOf('{');
    const jsonEnd = jsonStr.lastIndexOf('}') + 1;
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      return JSON.parse(jsonStr.slice(jsonStart, jsonEnd));
    }
    throw new Error('No JSON object found');
  } catch (e) {
    // Fallback: create structured content from text
    return {
      headline: fallbackData.keyTakeaway,
      subheadline: fallbackData.slideType === 'auto' ? 'Strategic Analysis' : fallbackData.slideType,
      content: {
        primary_message: fallbackData.keyTakeaway,
        bullet_points: aiContent.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•')).slice(0, 4)
      }
    };
  }
}

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
    const { slideType, context, audience, keyTakeaway, presentationMode, dataInput, useRAG = true } = req.body;
    
    // Validate required fields
    if (!slideType || !context || context.length < 10) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid input: slideType and context (min 10 chars) required'
      });
    }

    if (!keyTakeaway || keyTakeaway.length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input: keyTakeaway (min 5 chars) required'
      });
    }

    // Step 1: RAG - Search for similar slides if enabled
    let styleExamples = '';
    let retrievedSlides = [];
    if (useRAG) {
      const searchQuery = `${context} ${keyTakeaway} ${slideType}`;
      retrievedSlides = await searchSimilarSlides(searchQuery, slideType, 3);
      styleExamples = formatStyleExamples(retrievedSlides);
    }

    // Step 2: Generate content (AI or fallback)
    let parsedContent;
    let usedAI = false;
    let aiError = null;

    if (process.env.KIMI_API_KEY) {
      try {
        const userPrompt = `Create a ${slideType === 'auto' ? 'consulting' : slideType} slide for ${audience === 'auto' ? 'executives' : audience}.

Context: ${context}

Key Takeaway: ${keyTakeaway}

Presentation Mode: ${presentationMode || 'presentation'}

${dataInput ? `Data Provided:\n${dataInput}\n\n` : ''}

Generate the slide content as a JSON object with:
- headline: Compelling action-oriented headline
- subheadline: Supporting context
- content.primary_message: The main insight
- content.bullet_points: Array of 3-4 concise bullet points
- supporting_elements: Array of key metrics/data points`;

        const aiContent = await generateWithAI(userPrompt, styleExamples);
        parsedContent = parseAIResponse(aiContent, { keyTakeaway, slideType });
        usedAI = true;
      } catch (error) {
        console.error('AI generation failed, using fallback:', error);
        aiError = error.message;
        parsedContent = generateWithTemplate(slideType, context, keyTakeaway, audience);
      }
    } else {
      console.log('No API key, using template fallback');
      parsedContent = generateWithTemplate(slideType, context, keyTakeaway, audience);
    }

    // Step 3: Generate HTML content for the slide preview
    const htmlContent = generateSlideHTML(parsedContent, slideType, audience);

    // Create the slide data object
    const now = new Date().toISOString();
    const slide = {
      id: crypto.randomUUID(),
      slideType: slideType || 'General',
      audience: audience || 'auto',
      context: context,
      keyTakeaway: keyTakeaway,
      presentationMode: presentationMode || 'presentation',
      dataInput: dataInput,
      htmlContent: htmlContent,
      createdAt: now,
      updatedAt: now,
      // Metadata for debugging
      generation: {
        usedAI,
        usedRAG: retrievedSlides.length > 0,
        ragReferences: retrievedSlides.map(s => ({ id: s.id, title: s.title, similarity: s.similarity })),
        aiError: aiError,
      }
    };

    res.status(200).json({
      success: true,
      slide: slide,
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Generation failed',
    });
  }
};

function generateSlideHTML(content, slideType, audience) {
  const headline = content.headline || content.title || 'Strategic Insights';
  const subheadline = content.subheadline || '';
  const primaryMessage = content.content?.primary_message || content.primary_message || '';
  const bullets = content.content?.bullet_points || content.bullet_points || [];
  const supporting = content.supporting_elements || [];
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      background: white;
      color: #1a1a1a;
      line-height: 1.5;
    }
    .slide-container {
      width: 100%;
      height: 100%;
      padding: 48px 60px;
      display: flex;
      flex-direction: column;
    }
    .slide-header {
      border-bottom: 3px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .slide-title {
      font-size: 32px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .slide-subtitle {
      font-size: 16px;
      color: #64748b;
    }
    .slide-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .primary-message {
      background: #f1f5f9;
      border-left: 4px solid #3b82f6;
      padding: 16px 20px;
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
    }
    .bullet-points {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .bullet-point {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-size: 15px;
      color: #334155;
    }
    .bullet-point::before {
      content: "";
      width: 8px;
      height: 8px;
      background: #3b82f6;
      border-radius: 50%;
      margin-top: 7px;
      flex-shrink: 0;
    }
    .supporting-elements {
      display: flex;
      gap: 16px;
      margin-top: auto;
    }
    .metric-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px 20px;
      flex: 1;
    }
    .metric-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .metric-value {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
    }
  </style>
</head>
<body>
  <div class="slide-container">
    <div class="slide-header">
      <h1 class="slide-title">${escapeHtml(headline)}</h1>
      ${subheadline ? `<p class="slide-subtitle">${escapeHtml(subheadline)}</p>` : ''}
    </div>
    <div class="slide-content">
      ${primaryMessage ? `<div class="primary-message">${escapeHtml(primaryMessage)}</div>` : ''}
      ${bullets.length > 0 ? `
      <div class="bullet-points">
        ${bullets.map(b => `<div class="bullet-point">${escapeHtml(typeof b === 'string' ? b.replace(/^[\s\-\•]+/, '').trim() : String(b))}</div>`).join('')}
      </div>` : ''}
      ${supporting.length > 0 ? `
      <div class="supporting-elements">
        ${supporting.map(s => `
          <div class="metric-box">
            <div class="metric-label">${escapeHtml(s.label || 'Metric')}</div>
            <div class="metric-value">${escapeHtml(s.value || '')}</div>
          </div>
        `).join('')}
      </div>` : ''}
    </div>
  </div>
</body>
</html>
  `;
}

function escapeHtml(text) {
  if (!text) return '';
  const str = typeof text === 'string' ? text : String(text);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
