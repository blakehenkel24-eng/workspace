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

interface AIProvider {
  name: string;
  generate: (prompt: string) => Promise<string>;
}

function getAIProvider(): AIProvider | null {
  // Try Kimi first
  const kimiKey = process.env.KIMI_API_KEY;
  if (kimiKey) {
    return {
      name: 'kimi',
      generate: async (userPrompt: string) => {
        const openai = new OpenAI({
          apiKey: kimiKey,
          baseURL: process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1',
        });
        const completion = await openai.chat.completions.create({
          model: 'moonshot-v1-128k',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        });
        return completion.choices[0].message.content || '';
      }
    };
  }

  // Try OpenAI
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    return {
      name: 'openai',
      generate: async (userPrompt: string) => {
        const openai = new OpenAI({
          apiKey: openaiKey,
        });
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        });
        return completion.choices[0].message.content || '';
      }
    };
  }

  return null;
}

function generatePlaceholderImage(content: unknown): string {
  const headline = (content as Record<string, unknown>).headline || 'Slide';
  const subheadline = (content as Record<string, unknown>).subheadline || '';
  const encodedHeadline = String(headline).slice(0, 40).replace(/"/g, '&quot;');
  const encodedSub = String(subheadline).slice(0, 30).replace(/"/g, '&quot;');
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#f8fafc"/>
        <stop offset="100%" style="stop-color:#e2e8f0"/>
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#3b82f6"/>
        <stop offset="100%" style="stop-color:#60a5fa"/>
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#bg)"/>
    <rect x="60" y="40" width="680" height="6" fill="#0f172a"/>
    <text x="60" y="100" font-family="Segoe UI, system-ui, sans-serif" font-size="28" font-weight="700" fill="#0f172a">${encodedHeadline}</text>
    ${encodedSub ? `<text x="60" y="135" font-family="Segoe UI, system-ui, sans-serif" font-size="14" fill="#64748b">${encodedSub}</text>` : ''}
    <rect x="60" y="170" width="8" height="80" fill="url(#accent)" rx="2"/>
    <text x="80" y="195" font-family="Segoe UI, system-ui, sans-serif" font-size="14" font-weight="600" fill="#0f172a">Key Insight</text>
    <text x="80" y="220" font-family="Segoe UI, system-ui, sans-serif" font-size="12" fill="#475569">Strategic analysis and recommendations based on</text>
    <text x="80" y="238" font-family="Segoe UI, system-ui, sans-serif" font-size="12" fill="#475569">market research and competitive intelligence.</text>
    <circle cx="76" cy="290" r="4" fill="#3b82f6"/>
    <text x="90" y="295" font-family="Segoe UI, system-ui, sans-serif" font-size="12" fill="#334155">Data-driven insights for executive decision making</text>
    <circle cx="76" cy="315" r="4" fill="#3b82f6"/>
    <text x="90" y="320" font-family="Segoe UI, system-ui, sans-serif" font-size="12" fill="#334155">Structured analysis following MECE principles</text>
    <rect x="60" y="360" width="200" height="60" fill="#f1f5f9" stroke="#e2e8f0" rx="6"/>
    <text x="80" y="385" font-family="Segoe UI, system-ui, sans-serif" font-size="10" fill="#64748b" text-transform="uppercase">GROWTH</text>
    <text x="80" y="408" font-family="Segoe UI, system-ui, sans-serif" font-size="20" font-weight="700" fill="#0f172a">25%</text>
    <rect x="280" y="360" width="200" height="60" fill="#f1f5f9" stroke="#e2e8f0" rx="6"/>
    <text x="300" y="385" font-family="Segoe UI, system-ui, sans-serif" font-size="10" fill="#64748b" text-transform="uppercase">MARKET</text>
    <text x="300" y="408" font-family="Segoe UI, system-ui, sans-serif" font-size="20" font-weight="700" fill="#0f172a">$2.4B</text>
    <rect x="500" y="360" width="200" height="60" fill="#f1f5f9" stroke="#e2e8f0" rx="6"/>
    <text x="520" y="385" font-family="Segoe UI, system-ui, sans-serif" font-size="10" fill="#64748b" text-transform="uppercase">TIMELINE</text>
    <text x="520" y="408" font-family="Segoe UI, system-ui, sans-serif" font-size="20" font-weight="700" fill="#0f172a">Q3 2026</text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function generateMockContent(slideType: string, keyTakeaway: string, _context: string) {
  return {
    headline: keyTakeaway,
    subheadline: slideType === 'auto' ? 'Strategic Analysis' : slideType,
    content: {
      primary_message: keyTakeaway,
      bullet_points: [
        'Market analysis reveals significant growth opportunities in target segments',
        'Competitive landscape shows room for differentiation and value creation',
        'Strategic initiatives align with organizational capabilities and resources',
        'Implementation roadmap provides clear path to achieve objectives'
      ]
    },
    supporting_elements: [
      { label: 'Growth Potential', value: '25%' },
      { label: 'Market Size', value: '$2.4B' },
      { label: 'Timeline', value: 'Q3 2026' }
    ]
  };
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

function generateSlideHTML(content: unknown) {
  const headline = (content as Record<string, unknown>).headline || (content as Record<string, unknown>).title || 'Strategic Insights';
  const subheadline = (content as Record<string, unknown>).subheadline || '';
  const contentObj = (content as Record<string, unknown>).content as Record<string, unknown> || {};
  const primaryMessage = contentObj.primary_message || '';
  const bullets = (contentObj.bullet_points || []) as string[];
  const supporting = ((content as Record<string, unknown>).supporting_elements || []) as Array<{label?: string; value?: string}>;
  
  return `<!DOCTYPE html>
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
      <h1 class="slide-title">${escapeHtml(String(headline))}</h1>
      ${subheadline ? `<p class="slide-subtitle">${escapeHtml(String(subheadline))}</p>` : ''}
    </div>
    <div class="slide-content">
      ${primaryMessage ? `<div class="primary-message">${escapeHtml(String(primaryMessage))}</div>` : ''}
      ${bullets.length > 0 ? `
      <div class="bullet-points">
        ${bullets.map((b: string) => `<div class="bullet-point">${escapeHtml(b.replace(/^[\s\-\•]+/, '').trim())}</div>`).join('')}
      </div>` : ''}
      ${supporting.length > 0 ? `
      <div class="supporting-elements">
        ${supporting.map((s) => `
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slideType, context, audience, keyTakeaway, presentationMode, dataInput } = body;
    
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

    const provider = getAIProvider();
    let parsedContent;
    
    if (provider) {
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

      try {
        const aiContent = await provider.generate(userPrompt);
        
        try {
          const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)```/) || 
                            aiContent.match(/```\s*([\s\S]*?)```/) ||
                            [null, aiContent];
          const jsonStr = jsonMatch[1]?.trim() || aiContent.trim();
          
          const jsonStart = jsonStr.indexOf('{');
          const jsonEnd = jsonStr.lastIndexOf('}') + 1;
          if (jsonStart >= 0 && jsonEnd > jsonStart) {
            parsedContent = JSON.parse(jsonStr.slice(jsonStart, jsonEnd));
          } else {
            throw new Error('No JSON object found');
          }
        } catch {
          parsedContent = {
            headline: keyTakeaway,
            subheadline: slideType === 'auto' ? 'Strategic Analysis' : slideType,
            content: {
              primary_message: keyTakeaway,
              bullet_points: aiContent.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•')).slice(0, 4)
            }
          };
        }
      } catch (aiError) {
        console.error('AI generation error:', aiError);
        parsedContent = generateMockContent(slideType, keyTakeaway, context);
      }
    } else {
      console.log('No AI provider configured, using mock content');
      parsedContent = generateMockContent(slideType, keyTakeaway, context);
    }

    const htmlContent = generateSlideHTML(parsedContent);
    const imageUrl = generatePlaceholderImage(parsedContent);

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
      imageUrl: imageUrl,
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
