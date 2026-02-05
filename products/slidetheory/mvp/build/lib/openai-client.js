/**
 * SlideTheory MVP - Kimi AI Client v2.1 (Polished)
 * Enhanced with retry logic, better error handling, and optimized prompts
 */

const KIMI_API_BASE = 'https://api.moonshot.cn/v1';
const DEFAULT_MODEL = process.env.KIMI_MODEL || 'kimi-coding/k2p5';

/**
 * Sleep utility for retries
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Call Kimi API with retry logic
 */
async function callKimi(messages, options = {}) {
  const apiKey = process.env.KIMI_API_KEY;
  
  if (!apiKey) {
    throw new Error('KIMI_API_KEY environment variable is not set');
  }
  
  const maxRetries = options.maxRetries || 2;
  const timeout = options.timeout || 30000; // 30 second timeout
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(`${KIMI_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: options.model || DEFAULT_MODEL,
          messages,
          temperature: options.temperature ?? 0.6, // Slightly lower for more consistent output
          max_tokens: options.max_tokens || 1500, // Reduced for faster generation
          response_format: options.jsonMode ? { type: 'json_object' } : undefined
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const errorMessage = error.error?.message || `Kimi API error: ${response.status}`;
        
        // Retry on rate limit or server errors
        if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`[Kimi] Retry ${attempt + 1}/${maxRetries} after ${delay}ms: ${errorMessage}`);
          await sleep(delay);
          continue;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
      
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - AI generation took too long');
      }
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff for network errors
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`[Kimi] Retry ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await sleep(delay);
    }
  }
  
  throw new Error('Max retries exceeded');
}

/**
 * Generate slide content based on user inputs
 */
async function generateSlideContent({ slideType, context, dataPoints, targetAudience, framework }) {
  const apiKey = process.env.KIMI_API_KEY;
  
  // If no API key, go straight to fallback mode
  if (!apiKey) {
    console.log('[Kimi] No API key found, using fallback content generation');
    return generateFallbackContent(slideType, context, dataPoints, targetAudience);
  }
  
  const dataPointsText = dataPoints?.length > 0 
    ? dataPoints.join('\n') 
    : 'No specific data points provided - generate appropriate content.';
  
  const frameworkText = framework 
    ? `Use the ${framework} framework for structuring the content.` 
    : 'Use appropriate consulting best practices for structure.';
  
  const systemPrompt = getSystemPrompt(slideType, targetAudience);

  const userPrompt = `Create a ${slideType} slide with the following context:

CONTEXT:
${context}

DATA POINTS PROVIDED:
${dataPointsText}

TARGET AUDIENCE: ${targetAudience}

FRAMEWORK:
${frameworkText}

Generate the slide content as JSON only. No markdown, no explanation.`;

  try {
    console.log(`[Kimi] Generating ${slideType} for ${targetAudience}`);
    const startTime = Date.now();
    
    const content = await callKimi([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { 
      jsonMode: true,
      temperature: 0.6,
      maxRetries: 2,
      timeout: 25000 // 25 second timeout
    });
    
    const duration = Date.now() - startTime;
    console.log(`[Kimi] Generated in ${duration}ms`);
    
    // Parse JSON response
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      console.warn('[Kimi] Invalid JSON response, attempting to extract JSON');
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                        content.match(/```([\s\S]*?)```/) ||
                        content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }
    
    // Add slide type to content for template selection
    parsedContent._slideType = slideType;
    
    // Ensure required fields exist
    if (!parsedContent.title) {
      parsedContent.title = 'Strategic Recommendations';
    }
    
    return parsedContent;
    
  } catch (error) {
    console.error('[Kimi] Generation error:', error.message);
    
    // Return fallback content if generation fails
    return generateFallbackContent(slideType, context, dataPoints, targetAudience);
  }
}

/**
 * Get optimized system prompt based on slide type
 */
function getSystemPrompt(slideType, targetAudience) {
  const basePrompt = `You are an expert McKinsey/BCG/Bain strategy consultant creating executive presentation slides.

RULES:
- Output ONLY valid JSON
- Be concise: 5-8 word titles, 2-3 sentence bullets
- Use consulting format: $XM, +X%, Xpp, "20XX"
- Action-oriented language (verbs, outcomes)
- No filler words, no hedging
- Tailor for ${targetAudience}`;

  const prompts = {
    'Executive Summary': `${basePrompt}

OUTPUT JSON:
{
  "title": "Action headline (5-8 words)",
  "subtitle": "Key insight (max 10 words, optional)",
  "keyPoints": [
    { "heading": "Point heading (3-5 words)", "text": "2-3 sentences with data" },
    { "heading": "Point heading", "text": "2-3 sentences" },
    { "heading": "Point heading", "text": "2-3 sentences" }
  ],
  "recommendation": "Clear action statement",
  "footer": { "source": "Source", "date": "Mon YYYY" }
}`,

    'Market Analysis': `${basePrompt}

OUTPUT JSON:
{
  "title": "Market headline (5-7 words)",
  "marketSize": "$X.XB growing X% annually",
  "insights": [
    "Key insight with data (1 sentence)",
    "Key insight with data",
    "Key insight with data"
  ],
  "chartData": {
    "type": "bar",
    "labels": ["2022", "2023", "2024E", "2025E"],
    "values": [25, 35, 48, 65]
  },
  "footer": { "source": "Industry reports", "date": "Mon YYYY" }
}`,

    'Financial Model': `${basePrompt}

OUTPUT JSON:
{
  "title": "Financial headline (5-7 words)",
  "metrics": [
    { "label": "Revenue", "value": "$X.XM", "change": "+XX%", "period": "YoY" },
    { "label": "Gross Margin", "value": "XX%", "change": "+Xpp", "period": "YoY" },
    { "label": "EBITDA", "value": "$X.XM", "change": "+XX%", "period": "YoY" }
  ],
  "tableData": {
    "headers": ["Metric", "2023", "2024", "2025E"],
    "rows": [
      ["Revenue ($M)", "$X.X", "$X.X", "$X.X"],
      ["Growth %", "X%", "X%", "X%"],
      ["Margin %", "X%", "X%", "X%"]
    ]
  },
  "footer": { "source": "Financial data", "date": "Mon YYYY" }
}`,

    'Competitive Analysis': `${basePrompt}

OUTPUT JSON:
{
  "title": "Competitive positioning headline",
  "matrixTitle": "2x2 Matrix: Innovation vs Scale",
  "xAxis": { "low": "Conservative", "high": "Innovative" },
  "yAxis": { "low": "Niche", "high": "Broad" },
  "competitors": [
    { "name": "Competitor A", "xPosition": 20, "yPosition": 70, "features": [true, false, true] },
    { "name": "Competitor B", "xPosition": 60, "yPosition": 60, "features": [true, true, false] },
    { "name": "Our Solution", "xPosition": 80, "yPosition": 20, "features": [true, true, true] }
  ],
  "features": ["Core Features", "Premium Service", "Integration"],
  "footer": { "source": "Competitive analysis", "date": "Mon YYYY" }
}`,

    'Growth Strategy': `${basePrompt}

OUTPUT JSON:
{
  "title": "Growth strategy headline",
  "flywheelTitle": "Growth Flywheel",
  "flywheel": [
    { "label": "Attract" },
    { "label": "Engage" },
    { "label": "Monetize" },
    { "label": "Retain" }
  ],
  "initiatives": [
    { "title": "Initiative 1 (5-7 words)", "description": "Brief description" },
    { "title": "Initiative 2", "description": "Brief description" },
    { "title": "Initiative 3", "description": "Brief description" }
  ],
  "footer": { "source": "Strategy team", "date": "Mon YYYY" }
}`,

    'Risk Assessment': `${basePrompt}

OUTPUT JSON:
{
  "title": "Risk assessment headline",
  "risks": [
    { "name": "Risk 1", "probability": "High", "impact": "High" },
    { "name": "Risk 2", "probability": "Medium", "impact": "High" },
    { "name": "Risk 3", "probability": "Low", "impact": "Medium" }
  ],
  "mitigations": [
    { "risk": "Risk name", "level": "high", "action": "Mitigation action" },
    { "risk": "Risk name", "level": "medium", "action": "Mitigation action" }
  ],
  "footer": { "source": "Risk assessment", "date": "Mon YYYY" }
}`
  };

  return prompts[slideType] || prompts['Executive Summary'];
}

/**
 * Generate fallback content if Kimi fails or no API key
 */
function generateFallbackContent(slideType, context, dataPoints = [], targetAudience = 'C-Suite') {
  const today = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const contextLower = context?.toLowerCase() || '';
  
  // Extract keywords for smarter titles
  const hasRevenue = contextLower.includes('revenue') || contextLower.includes('growth') || contextLower.includes('million');
  const hasInvestment = contextLower.includes('invest') || contextLower.includes('funding') || contextLower.includes('series');
  const hasProduct = contextLower.includes('product') || contextLower.includes('launch') || contextLower.includes('feature');
  
  // Parse any data points for metrics
  const parsedMetrics = dataPoints?.slice(0, 3).map((dp, i) => {
    const numberMatch = dp?.toString().match(/[\$]?[\d,]+\.?\d*\s*[MBK%]?/i);
    const number = numberMatch ? numberMatch[0] : `${(i + 1) * 25}%`;
    return { 
      label: ['Revenue', 'Growth', 'Margin'][i] || `Metric ${i + 1}`, 
      value: number, 
      change: '+12%', 
      period: 'YoY' 
    };
  }) || [];

  const fallbacks = {
    'Executive Summary': () => ({
      _slideType: slideType,
      title: hasRevenue ? 'Strong Revenue Growth Requires Strategic Action' : 
             hasInvestment ? 'Investment Opportunity Overview' : 
             'Strategic Recommendations for Leadership',
      subtitle: hasRevenue ? 'Capitalizing on market momentum' : 'Based on comprehensive analysis',
      keyPoints: [
        { 
          heading: 'Market Opportunity', 
          text: context?.substring(0, 80) + (context?.length > 80 ? '...' : '') || 
                'Significant growth potential in target segments with favorable market conditions.' 
        },
        { 
          heading: 'Competitive Position', 
          text: 'Strong differentiation enables premium positioning and sustainable advantage.' 
        },
        { 
          heading: 'Strategic Priority', 
          text: 'Focus on core capabilities to capture value and accelerate growth trajectory.' 
        }
      ],
      recommendation: 'Pursue aggressive growth while optimizing operations to maximize value.',
      footer: { source: 'Internal analysis', date: today }
    }),

    'Market Analysis': () => ({
      _slideType: slideType,
      title: hasProduct ? 'Product Market Opportunity' : 'Market Landscape and Growth',
      marketSize: hasRevenue ? '$2.4B (growing 18% annually)' : '$X.XB growing rapidly',
      insights: [
        dataPoints?.[0] || 'Market shows strong growth with expanding opportunities',
        dataPoints?.[1] || 'Competitive landscape consolidating, creating entry opportunities',
        dataPoints?.[2] || 'Customer preferences shifting toward premium integrated solutions'
      ],
      chartData: {
        type: 'bar',
        labels: ['2022', '2023', '2024E', '2025E'],
        values: [25, 35, 48, 65]
      },
      footer: { source: 'Industry reports', date: today }
    }),

    'Financial Model': () => ({
      _slideType: slideType,
      title: hasRevenue ? 'Financial Performance & Trajectory' : 'Financial Summary',
      metrics: parsedMetrics.length > 0 ? parsedMetrics : [
        { label: 'Revenue', value: '$5.2M', change: '+23%', period: 'YoY' },
        { label: 'Gross Margin', value: '68%', change: '+4pp', period: 'YoY' },
        { label: 'EBITDA', value: '$1.2M', change: '+31%', period: 'YoY' }
      ],
      tableData: {
        headers: ['Metric', '2023', '2024', '2025E'],
        rows: [
          ['Revenue ($M)', '4.2', '5.2', '6.8'],
          ['Growth %', '15%', '23%', '31%'],
          ['Gross Margin %', '64%', '68%', '71%']
        ]
      },
      footer: { source: 'Financial data', date: today }
    }),

    'Competitive Analysis': () => ({
      _slideType: slideType,
      title: 'Competitive Positioning Analysis',
      matrixTitle: 'Competitive Matrix: Innovation vs Scale',
      xAxis: { low: 'Low Innovation', high: 'High Innovation' },
      yAxis: { low: 'Small Scale', high: 'Large Scale' },
      competitors: [
        { name: 'Competitor A', xPosition: 30, yPosition: 70, features: [true, true, false] },
        { name: 'Competitor B', xPosition: 70, yPosition: 60, features: [true, false, true] },
        { name: 'Our Solution', xPosition: 80, yPosition: 25, features: [true, true, true] }
      ],
      features: ['Core Features', 'Premium Service', 'Integration'],
      footer: { source: 'Competitive analysis', date: today }
    }),

    'Growth Strategy': () => ({
      _slideType: slideType,
      title: 'Growth Strategy: Accelerating Market Expansion',
      flywheelTitle: 'Our Growth Flywheel',
      flywheel: [
        { label: 'Attract Users' },
        { label: 'Engage Deeply' },
        { label: 'Monetize Effectively' },
        { label: 'Retain & Expand' }
      ],
      initiatives: [
        { title: 'Expand Product Portfolio', description: 'Launch 3 new product lines targeting adjacent segments' },
        { title: 'Geographic Expansion', description: 'Enter 2 new regional markets with localized offerings' },
        { title: 'Strategic Partnerships', description: 'Form alliances to accelerate distribution and reach' }
      ],
      footer: { source: 'Strategy team', date: today }
    }),

    'Risk Assessment': () => ({
      _slideType: slideType,
      title: 'Risk Assessment & Mitigation Strategy',
      risks: [
        { name: 'Market Saturation', probability: 'Medium', impact: 'High' },
        { name: 'Talent Retention', probability: 'High', impact: 'Medium' },
        { name: 'Regulatory Changes', probability: 'Low', impact: 'High' },
        { name: 'Supply Chain', probability: 'Medium', impact: 'Medium' }
      ],
      mitigations: [
        { risk: 'Market Saturation', level: 'high', action: 'Diversify into adjacent segments' },
        { risk: 'Talent Retention', level: 'medium', action: 'Implement equity incentives' },
        { risk: 'Regulatory Changes', level: 'high', action: 'Maintain compliance team' }
      ],
      footer: { source: 'Risk assessment', date: today }
    })
  };

  const generator = fallbacks[slideType] || fallbacks['Executive Summary'];
  return generator();
}

module.exports = { generateSlideContent, generateFallbackContent };
