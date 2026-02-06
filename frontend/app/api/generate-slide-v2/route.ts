import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

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

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    const apiKey = process.env.KIMI_API_KEY;
    if (!apiKey) {
      console.error('KIMI_API_KEY environment variable is not set');
      return NextResponse.json({
        success: false,
        error: 'Server configuration error: API key not configured'
      }, { status: 500 });
    }

    // Initialize OpenAI client inside handler (not at module level) to avoid build-time errors
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1',
    });

    const body = await request.json();
    const { slideType, context, audience, keyTakeaway, presentationMode, dataInput } = body;
    
    // Validate required fields
    if (!slideType || !context || context.length < 10) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid input: slideType and context (min 10 chars) required'
      }, { status: 400 });
    }

    if (!keyTakeaway || keyTakeaway.length < 5) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input: keyTakeaway (min 5 chars) required'
      }, { status: 400 });
    }

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

    const completion = await openai.chat.completions.create({
      model: 'moonshot-v1-128k',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const aiContent = completion.choices[0].message.content;
    
    // Parse AI response to extract JSON if embedded
    let parsedContent;
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
        parsedContent = JSON.parse(jsonStr.slice(jsonStart, jsonEnd));
      } else {
        throw new Error('No JSON object found');
      }
    } catch {
      // Fallback: create structured content from text
      parsedContent = {
        headline: keyTakeaway,
        subheadline: slideType === 'auto' ? 'Strategic Analysis' : slideType,
        content: {
          primary_message: keyTakeaway,
          bullet_points: aiContent.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•')).slice(0, 4)
        }
      };
    }

    // Generate HTML content for the slide preview
    const htmlContent = generateSlideHTML(parsedContent);

    // Create the slide data object matching SlideData type
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
    };

    return NextResponse.json({
      success: true,
      slide: slide,
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    }, { status: 500 });
  }
}

function generateSlideHTML(content: unknown) {
  const headline = content.headline || content.title || 'Strategic Insights';
  const subheadline = content.subheadline || '';
  const primaryMessage = content.content?.primary_message || '';
  const bullets = content.content?.bullet_points || [];
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
        ${bullets.map((b: string) => `<div class="bullet-point">${escapeHtml(b.replace(/^[\s\-\•]+/, '').trim())}</div>`).join('')}
      </div>` : ''}
      ${supporting.length > 0 ? `
      <div class="supporting-elements">
        ${supporting.map((s: {label?: string; value?: string}) => `
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

function escapeHtml(text: string): string {
  if (!text) return '';
  const str = typeof text === 'string' ? text : String(text);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
