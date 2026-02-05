/**
 * AI Service
 * Handles AI content generation with multiple provider support
 */

const config = require('../config');
const { getAIConfig, PROVIDERS } = require('../config/ai-providers');
const { retry, sleep } = require('../utils/helpers');
const { generateFallbackContent } = require('./fallback-service');

/**
 * Call Kimi API with retry logic
 */
async function callKimi(messages, options = {}) {
  const aiConfig = config.ai.kimi;
  
  if (!aiConfig.apiKey) {
    throw new Error('KIMI_API_KEY environment variable is not set');
  }
  
  const maxRetries = options.maxRetries ?? aiConfig.maxRetries;
  const timeout = options.timeout ?? aiConfig.timeout;
  
  return retry(
    async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aiConfig.apiKey}`
          },
          body: JSON.stringify({
            model: options.model || aiConfig.model,
            messages,
            temperature: options.temperature ?? aiConfig.temperature,
            max_tokens: options.max_tokens || 1500,
            response_format: options.jsonMode ? { type: 'json_object' } : undefined
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          const errorMessage = error.error?.message || `Kimi API error: ${response.status}`;
          
          // Retry on rate limit or server errors
          if (response.status === 429 || response.status >= 500) {
            throw new Error(`Retryable: ${errorMessage}`);
          }
          
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
        
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - AI generation took too long');
        }
        throw error;
      }
    },
    { maxRetries, baseDelay: 1000 }
  );
}

/**
 * Get system prompt for slide type
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
 * Parse AI response JSON
 */
function parseAIResponse(content) {
  try {
    return JSON.parse(content);
  } catch (parseError) {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                      content.match(/```([\s\S]*?)```/) ||
                      content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    }
    
    throw new Error('Invalid JSON response from AI');
  }
}

/**
 * Generate slide content using AI
 */
async function generateSlideContent({ slideType, context, dataPoints, targetAudience, framework }) {
  const aiConfig = getAIConfig();
  
  // Check if AI is available
  if (!aiConfig.enabled) {
    console.log('[AI Service] No API key found, using fallback content generation');
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
    console.log(`[AI Service] Generating ${slideType} for ${targetAudience}`);
    const startTime = Date.now();
    
    let content;
    
    // Route to appropriate provider
    switch (aiConfig.provider) {
      case PROVIDERS.KIMI:
        content = await callKimi([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ], { jsonMode: true });
        break;
        
      case PROVIDERS.OPENAI:
      case PROVIDERS.ANTHROPIC:
      default:
        console.log(`[AI Service] Provider ${aiConfig.provider} not yet implemented, using fallback`);
        return generateFallbackContent(slideType, context, dataPoints, targetAudience);
    }
    
    const duration = Date.now() - startTime;
    console.log(`[AI Service] Generated in ${duration}ms`);
    
    // Parse JSON response
    let parsedContent = parseAIResponse(content);
    
    // Add slide type to content for template selection
    parsedContent._slideType = slideType;
    
    // Ensure required fields exist
    if (!parsedContent.title) {
      parsedContent.title = 'Strategic Recommendations';
    }
    
    return parsedContent;
    
  } catch (error) {
    console.error('[AI Service] Generation error:', error.message);
    
    // Return fallback content if generation fails
    return generateFallbackContent(slideType, context, dataPoints, targetAudience);
  }
}

module.exports = {
  generateSlideContent,
  callKimi,
  getSystemPrompt,
  parseAIResponse
};
