/**
 * AI Advanced Service
 * Advanced AI capabilities for power users
 * 
 * Features:
 * 1. Smart template suggestions based on content
 * 2. Auto-generate slide decks from documents (PDF, Word)
 * 3. AI-powered data visualization recommendations
 * 4. Content rewriting (shorten, expand, simplify)
 * 5. Multi-slide story flow (narrative arc across slides)
 * 6. Speaker notes generation
 * 7. Q&A anticipation (suggested questions based on content)
 * 8. Translation to other languages
 */

const config = require('../config');
const { getAIConfig } = require('../config/ai-providers');
const { retry, sleep } = require('../utils/helpers');
const { generateFallbackContent } = require('./fallback-service');
const { SLIDE_TYPES } = require('../config/constants');

// ============================================================================
// AI PROVIDER CALLS
// ============================================================================

/**
 * Call Kimi API with retry logic for advanced features
 */
async function callAI(messages, options = {}) {
  const aiConfig = getAIConfig();
  
  if (!aiConfig.enabled) {
    throw new Error('AI provider not available');
  }
  
  const kimiConfig = config.ai.kimi;
  const maxRetries = options.maxRetries ?? kimiConfig.maxRetries;
  const timeout = options.timeout ?? kimiConfig.timeout;
  
  return retry(
    async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch(`${kimiConfig.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${kimiConfig.apiKey}`
          },
          body: JSON.stringify({
            model: options.model || kimiConfig.model,
            messages,
            temperature: options.temperature ?? kimiConfig.temperature,
            max_tokens: options.max_tokens || 3000,
            response_format: options.jsonMode ? { type: 'json_object' } : undefined
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          const errorMessage = error.error?.message || `API error: ${response.status}`;
          
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

// ============================================================================
// 1. SMART TEMPLATE SUGGESTIONS
// ============================================================================

/**
 * Analyze content and suggest optimal slide templates
 * @param {Object} params - Analysis parameters
 * @param {string} params.content - The content to analyze
 * @param {string} params.purpose - Presentation purpose (pitch, report, training, etc.)
 * @param {string} params.targetAudience - Target audience
 * @returns {Promise<Object>} Template suggestions with confidence scores
 */
async function suggestTemplates({ content, purpose, targetAudience }) {
  const systemPrompt = `You are a consulting presentation expert. Analyze the provided content and suggest the best slide templates.

OUTPUT JSON:
{
  "suggestions": [
    {
      "templateType": "Executive Summary|Market Analysis|Financial Model|Competitive Analysis|Growth Strategy|Risk Assessment",
      "confidence": 0.85,
      "reasoning": "Why this template fits (1-2 sentences)",
      "recommendedPosition": "opening|middle|closing",
      "estimatedSlideCount": 3
    }
  ],
  "recommendedFlow": ["template1", "template2", "template3"],
  "contentGaps": ["What's missing from the content"],
  "audienceFit": "How well the content matches the target audience"
}`;

  const userPrompt = `Analyze this presentation content and suggest optimal templates:

PURPOSE: ${purpose || 'Not specified'}
TARGET AUDIENCE: ${targetAudience || 'Not specified'}

CONTENT:
${content.slice(0, 4000)}

Suggest 2-4 templates that would best present this content.`;

  try {
    const response = await callAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { jsonMode: true });
    
    return parseAIResponse(response);
  } catch (error) {
    console.error('[AI Advanced] Template suggestion error:', error.message);
    return getFallbackTemplateSuggestions(content);
  }
}

/**
 * Get fallback template suggestions based on content analysis
 */
function getFallbackTemplateSuggestions(content) {
  const lowerContent = content.toLowerCase();
  const suggestions = [];
  
  // Content keyword matching
  if (lowerContent.includes('revenue') || lowerContent.includes('profit') || 
      lowerContent.includes('financial') || lowerContent.includes('margin')) {
    suggestions.push({
      templateType: 'Financial Model',
      confidence: 0.9,
      reasoning: 'Content contains financial metrics and data',
      recommendedPosition: 'middle',
      estimatedSlideCount: 2
    });
  }
  
  if (lowerContent.includes('market') || lowerContent.includes('growth') || 
      lowerContent.includes('industry') || lowerContent.includes('trend')) {
    suggestions.push({
      templateType: 'Market Analysis',
      confidence: 0.85,
      reasoning: 'Content discusses market dynamics and trends',
      recommendedPosition: 'opening',
      estimatedSlideCount: 2
    });
  }
  
  if (lowerContent.includes('competitor') || lowerContent.includes('competition') || 
      lowerContent.includes('market share') || lowerContent.includes('positioning')) {
    suggestions.push({
      templateType: 'Competitive Analysis',
      confidence: 0.88,
      reasoning: 'Content involves competitive landscape',
      recommendedPosition: 'middle',
      estimatedSlideCount: 1
    });
  }
  
  if (lowerContent.includes('recommendation') || lowerContent.includes('strategy') || 
      lowerContent.includes('next step') || lowerContent.includes('action')) {
    suggestions.push({
      templateType: 'Executive Summary',
      confidence: 0.82,
      reasoning: 'Content includes strategic recommendations',
      recommendedPosition: 'closing',
      estimatedSlideCount: 1
    });
  }
  
  // Default suggestion if none matched
  if (suggestions.length === 0) {
    suggestions.push({
      templateType: 'Executive Summary',
      confidence: 0.7,
      reasoning: 'General content suitable for executive overview',
      recommendedPosition: 'opening',
      estimatedSlideCount: 1
    });
  }
  
  return {
    suggestions,
    recommendedFlow: suggestions.map(s => s.templateType),
    contentGaps: ['Consider adding specific data points for stronger visuals'],
    audienceFit: 'General business audience'
  };
}

// ============================================================================
// 2. AUTO-GENERATE SLIDE DECKS FROM DOCUMENTS
// ============================================================================

/**
 * Generate a complete slide deck from document content
 * @param {Object} params - Document parameters
 * @param {string} params.documentContent - Extracted text from PDF/Word
 * @param {string} params.documentType - 'pdf' | 'word' | 'text'
 * @param {string} params.title - Document title
 * @param {string} params.targetAudience - Target audience
 * @param {number} params.maxSlides - Maximum slides to generate (default: 10)
 * @returns {Promise<Object>} Generated slide deck
 */
async function generateDeckFromDocument({ 
  documentContent, 
  documentType, 
  title, 
  targetAudience,
  maxSlides = 10 
}) {
  const systemPrompt = `You are an expert consulting presentation designer. Convert the provided document into a compelling slide deck.

RULES:
- Create ${maxSlides} slides maximum
- Each slide should have a clear, action-oriented headline (5-8 words)
- Use consulting format: $XM, +X%, Xpp, "20XX"
- Include data visualizations where appropriate
- Maintain narrative flow: Problem → Analysis → Solution → Recommendation

OUTPUT JSON:
{
  "deckTitle": "Presentation title",
  "subtitle": "Subtitle (optional)",
  "totalSlides": 5,
  "slides": [
    {
      "slideNumber": 1,
      "type": "Executive Summary|Market Analysis|Financial Model|Competitive Analysis|Growth Strategy|Risk Assessment|Title|Closing",
      "title": "Slide headline (action-oriented)",
      "content": {
        "keyPoints": ["Bullet 1", "Bullet 2"],
        "chartType": "bar|line|pie|matrix|none",
        "chartData": { "labels": [], "values": [] },
        "recommendation": "For summary slides"
      },
      "speakerNotes": "Key points to emphasize",
      "designNotes": "Visual recommendations"
    }
  ],
  "keyInsights": ["Top 3-5 insights from the document"],
  "callToAction": "Recommended next steps"
}`;

  const userPrompt = `Convert this ${documentType.toUpperCase()} document into a slide deck:

TITLE: ${title || 'Untitled Document'}
TARGET AUDIENCE: ${targetAudience || 'Executive audience'}

DOCUMENT CONTENT:
${documentContent.slice(0, 8000)}

Generate a complete slide deck with narrative flow and visual recommendations.`;

  try {
    const response = await callAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { jsonMode: true, max_tokens: 4000 });
    
    const deck = parseAIResponse(response);
    
    // Add metadata
    deck.sourceDocument = {
      type: documentType,
      title: title || 'Untitled',
      processedAt: new Date().toISOString()
    };
    
    return deck;
  } catch (error) {
    console.error('[AI Advanced] Document deck generation error:', error.message);
    return getFallbackDeckFromDocument(documentContent, title, maxSlides);
  }
}

/**
 * Get fallback deck generation for documents
 */
function getFallbackDeckFromDocument(content, title, maxSlides) {
  // Extract potential sections from document
  const sections = content.split(/\n\n|\r\n\r\n/).filter(s => s.trim().length > 20);
  
  const slides = [];
  const slideCount = Math.min(Math.min(sections.length, maxSlides), 8);
  
  // Title slide
  slides.push({
    slideNumber: 1,
    type: 'Title',
    title: title || 'Presentation',
    content: { subtitle: 'Strategic Overview' },
    speakerNotes: 'Welcome the audience and set expectations',
    designNotes: 'Use company branding'
  });
  
  // Content slides
  for (let i = 0; i < slideCount; i++) {
    const section = sections[i] || '';
    const lines = section.split('\n').filter(l => l.trim());
    const heading = lines[0] || `Section ${i + 1}`;
    
    slides.push({
      slideNumber: i + 2,
      type: i === slideCount - 1 ? 'Closing' : 'Executive Summary',
      title: heading.slice(0, 60),
      content: {
        keyPoints: lines.slice(1, 4).map(l => l.slice(0, 100))
      },
      speakerNotes: 'Discuss key points from this section',
      designNotes: 'Keep text minimal, emphasize key data'
    });
  }
  
  return {
    deckTitle: title || 'Generated Presentation',
    subtitle: 'From document analysis',
    totalSlides: slides.length,
    slides,
    keyInsights: ['Document converted to slides', 'Review for accuracy'],
    callToAction: 'Review and customize the generated slides',
    sourceDocument: {
      type: 'fallback',
      title: title || 'Untitled',
      processedAt: new Date().toISOString()
    }
  };
}

// ============================================================================
// 3. AI-POWERED DATA VISUALIZATION RECOMMENDATIONS
// ============================================================================

/**
 * Recommend optimal data visualizations for given data
 * @param {Object} params - Data parameters
 * @param {Array} params.data - Array of data objects
 * @param {string} params.dataDescription - Description of what the data represents
 * @param {string} params.insightGoal - What insight to highlight (comparison, trend, distribution, etc.)
 * @returns {Promise<Object>} Visualization recommendations
 */
async function recommendVisualizations({ data, dataDescription, insightGoal }) {
  const systemPrompt = `You are a data visualization expert specializing in executive presentations.

RULES:
- Recommend charts that tell a clear story
- Consider consulting best practices (McKinsey/BCG style)
- Match chart type to insight type
- Avoid chart junk, maximize data-ink ratio

OUTPUT JSON:
{
  "primaryRecommendation": {
    "chartType": "bar|line|pie|scatter|area|heatmap|waterfall|funnel|matrix",
    "rationale": "Why this chart type works best (1-2 sentences)",
    "effectiveness": 0.92
  },
  "alternatives": [
    {
      "chartType": "alternative type",
      "rationale": "When to use this instead",
      "effectiveness": 0.75
    }
  ],
  "designGuidelines": {
    "colors": ["#1f4e79", "#4472c4", "#ed7d31"],
    "annotations": ["Key points to highlight"],
    "axisStrategy": "How to structure axes",
    "dataLabels": true|false
  },
  "storytellingTips": ["How to present this data effectively"]
}`;

  const dataSample = JSON.stringify(data.slice(0, 5), null, 2);
  
  const userPrompt = `Recommend visualizations for this data:

DATA DESCRIPTION: ${dataDescription}
INSIGHT GOAL: ${insightGoal || 'Show key insights clearly'}

DATA SAMPLE (first 5 rows):
${dataSample}

Total records: ${data.length}

What visualization would work best?`;

  try {
    const response = await callAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { jsonMode: true });
    
    return parseAIResponse(response);
  } catch (error) {
    console.error('[AI Advanced] Visualization recommendation error:', error.message);
    return getFallbackVisualizationRecommendation(data, insightGoal);
  }
}

/**
 * Get fallback visualization recommendation based on data analysis
 */
function getFallbackVisualizationRecommendation(data, insightGoal) {
  if (!data || data.length === 0) {
    return {
      primaryRecommendation: {
        chartType: 'bar',
        rationale: 'Default to bar chart for general data',
        effectiveness: 0.6
      },
      alternatives: [],
      designGuidelines: {
        colors: ['#1f4e79', '#4472c4', '#ed7d31'],
        annotations: ['Add context'],
        axisStrategy: 'Start at zero',
        dataLabels: true
      },
      storytellingTips: ['Focus on the key takeaway']
    };
  }
  
  // Analyze data structure
  const keys = Object.keys(data[0]);
  const numericKeys = keys.filter(k => typeof data[0][k] === 'number');
  const hasTimeData = keys.some(k => 
    k.toLowerCase().includes('date') || 
    k.toLowerCase().includes('year') ||
    k.toLowerCase().includes('month')
  );
  
  let primaryChart = 'bar';
  let rationale = 'Standard comparison chart';
  
  if (hasTimeData && insightGoal?.includes('trend')) {
    primaryChart = 'line';
    rationale = 'Best for showing trends over time';
  } else if (insightGoal?.includes('distribution') || insightGoal?.includes('share')) {
    primaryChart = 'pie';
    rationale = 'Shows part-to-whole relationships';
  } else if (numericKeys.length >= 2) {
    primaryChart = 'scatter';
    rationale = 'Shows correlation between variables';
  }
  
  return {
    primaryRecommendation: {
      chartType: primaryChart,
      rationale,
      effectiveness: 0.75
    },
    alternatives: [
      {
        chartType: primaryChart === 'bar' ? 'column' : 'bar',
        rationale: 'Alternative orientation for variety',
        effectiveness: 0.7
      }
    ],
    designGuidelines: {
      colors: ['#1f4e79', '#4472c4', '#ed7d31', '#a5a5a5'],
      annotations: ['Highlight key data points'],
      axisStrategy: 'Clear labels, appropriate scale',
      dataLabels: data.length <= 10
    },
    storytellingTips: [
      'Lead with the insight, not the data',
      'Use annotations to guide attention',
      'Keep axis labels readable'
    ]
  };
}

// ============================================================================
// 4. CONTENT REWRITING (SHORTEN, EXPAND, SIMPLIFY)
// ============================================================================

/**
 * Rewrite content according to specified style
 * @param {Object} params - Rewrite parameters
 * @param {string} params.content - Content to rewrite
 * @param {string} params.style - 'shorten' | 'expand' | 'simplify' | 'executive' | 'technical'
 * @param {number} params.targetLength - Target word/character count (optional)
 * @returns {Promise<Object>} Rewritten content
 */
async function rewriteContent({ content, style, targetLength }) {
  const stylePrompts = {
    shorten: `Make this content more concise. Remove filler words, use active voice, aim for brevity while preserving key points.`,
    expand: `Expand this content with more detail, examples, and supporting arguments. Add depth while maintaining clarity.`,
    simplify: `Simplify this content for a general audience. Remove jargon, explain concepts clearly, use plain language.`,
    executive: `Rewrite for executive audience. Focus on business impact, ROI, and strategic implications. Use consulting language.`,
    technical: `Rewrite for technical audience. Include precise terminology, methodology details, and technical specifications.`
  };
  
  const systemPrompt = `You are an expert business writer specializing in consulting presentations.

${stylePrompts[style] || stylePrompts.simplify}

OUTPUT JSON:
{
  "rewrittenContent": "The rewritten text",
  "originalLength": 150,
  "newLength": 120,
  "reductionPercent": 20,
  "keyChanges": ["What was modified"],
  "suggestions": ["Additional improvements to consider"]
}`;

  const lengthHint = targetLength ? `Target approximately ${targetLength} words.` : '';
  
  const userPrompt = `Rewrite the following content (${style}):

${lengthHint}

ORIGINAL CONTENT:
${content}

Provide the rewritten version with explanation of changes.`;

  try {
    const response = await callAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { jsonMode: true });
    
    return parseAIResponse(response);
  } catch (error) {
    console.error('[AI Advanced] Content rewrite error:', error.message);
    return getFallbackRewrite(content, style);
  }
}

/**
 * Get fallback content rewrite
 */
function getFallbackRewrite(content, style) {
  const originalLength = content.split(/\s+/).length;
  let rewritten = content;
  
  switch (style) {
    case 'shorten':
      // Simple shortening: take first sentence of each paragraph
      rewritten = content
        .split('\n')
        .map(p => p.split('.')[0] + '.')
        .filter(p => p.length > 5)
        .join(' ');
      break;
      
    case 'expand':
      rewritten = content + '\n\nThis approach offers significant advantages including improved efficiency, reduced costs, and enhanced outcomes. Implementation requires careful planning and stakeholder alignment.';
      break;
      
    case 'simplify':
      rewritten = content
        .replace(/utilize/g, 'use')
        .replace(/leverage/g, 'use')
        .replace(/optimize/g, 'improve')
        .replace(/strategic/g, 'planned')
        .replace(/paradigm/g, 'approach');
      break;
      
    case 'executive':
      rewritten = 'EXECUTIVE SUMMARY: ' + content.slice(0, 200) + '... Key implications include revenue impact, strategic positioning, and competitive advantage.';
      break;
      
    default:
      rewritten = content;
  }
  
  const newLength = rewritten.split(/\s+/).length;
  
  return {
    rewrittenContent: rewritten,
    originalLength,
    newLength,
    reductionPercent: Math.round(((originalLength - newLength) / originalLength) * 100),
    keyChanges: [`Applied ${style} transformation`],
    suggestions: ['Review for accuracy', 'Customize for specific audience']
  };
}

// ============================================================================
// 5. MULTI-SLIDE STORY FLOW (NARRATIVE ARC)
// ============================================================================

/**
 * Create a narrative arc across multiple slides
 * @param {Object} params - Story parameters
 * @param {string} params.topic - Main topic/story subject
 * @param {string} params.objective - What you want the audience to do/think
 * @param {number} params.slideCount - Number of slides (3-12)
 * @param {string} params.targetAudience - Target audience
 * @returns {Promise<Object>} Story flow with narrative arc
 */
async function createStoryFlow({ topic, objective, slideCount = 5, targetAudience }) {
  const systemPrompt = `You are a master storytelling consultant for executive presentations.

Create a narrative arc that flows across slides following this structure:
1. HOOK - Grab attention with a compelling insight
2. CONTEXT - Set the stage with relevant background
3. CHALLENGE - Present the problem or opportunity
4. ANALYSIS - Provide evidence and insights
5. SOLUTION - Present your recommendation
6. IMPACT - Show the business outcome
7. ACTION - Clear next steps

OUTPUT JSON:
{
  "storyTitle": "Compelling story title",
  "narrativeArc": "Setup → Conflict → Resolution",
  "slides": [
    {
      "position": 1,
      "phase": "HOOK",
      "title": "Attention-grabbing headline",
      "type": "Executive Summary|Market Analysis|etc",
      "contentFocus": "What to cover on this slide",
      "keyMessage": "Single takeaway for this slide",
      "transition": "How to transition to next slide"
    }
  ],
  "storytellingTips": ["Narrative techniques to use"],
  "audienceEngagement": ["Ways to keep audience engaged"]
}`;

  const userPrompt = `Create a ${slideCount}-slide story flow for:

TOPIC: ${topic}
OBJECTIVE: ${objective}
TARGET AUDIENCE: ${targetAudience || 'Executive audience'}

Design a compelling narrative arc that builds to a clear call to action.`;

  try {
    const response = await callAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { jsonMode: true });
    
    return parseAIResponse(response);
  } catch (error) {
    console.error('[AI Advanced] Story flow error:', error.message);
    return getFallbackStoryFlow(topic, objective, slideCount);
  }
}

/**
 * Get fallback story flow
 */
function getFallbackStoryFlow(topic, objective, slideCount) {
  const phases = ['HOOK', 'CONTEXT', 'CHALLENGE', 'ANALYSIS', 'SOLUTION', 'IMPACT', 'ACTION'];
  const slides = [];
  
  for (let i = 0; i < Math.min(slideCount, phases.length); i++) {
    slides.push({
      position: i + 1,
      phase: phases[i],
      title: `${phases[i]}: ${topic.slice(0, 30)}`,
      type: i === 0 ? 'Executive Summary' : i === 1 ? 'Market Analysis' : 'Growth Strategy',
      contentFocus: `Present ${phases[i].toLowerCase()} elements`,
      keyMessage: `${phases[i]} - key insight about ${topic.slice(0, 20)}`,
      transition: i < slideCount - 1 ? `Lead into ${phases[i + 1]}` : 'Call to action'
    });
  }
  
  return {
    storyTitle: topic,
    narrativeArc: 'Setup → Challenge → Resolution',
    slides,
    storytellingTips: [
      'Start with a compelling statistic',
      'Use the rule of three for key points',
      'End with a memorable takeaway'
    ],
    audienceEngagement: [
      'Ask rhetorical questions',
      'Use analogies to explain complex concepts',
      'Pause before key revelations'
    ]
  };
}

// ============================================================================
// 6. SPEAKER NOTES GENERATION
// ============================================================================

/**
 * Generate speaker notes for a slide
 * @param {Object} params - Speaker notes parameters
 * @param {Object} params.slideContent - The slide content
 * @param {string} params.slideType - Type of slide
 * @param {number} params.duration - Speaking duration in minutes (default: 2)
 * @param {string} params.audienceLevel - 'novice' | 'intermediate' | 'expert'
 * @returns {Promise<Object>} Generated speaker notes
 */
async function generateSpeakerNotes({ slideContent, slideType, duration = 2, audienceLevel = 'intermediate' }) {
  const systemPrompt = `You are an executive communication coach. Generate detailed speaker notes that help deliver a compelling presentation.

OUTPUT JSON:
{
  "openingHook": "How to start (1-2 sentences)",
  "keyTalkingPoints": [
    {
      "point": "Main point to make",
      "elaboration": "How to expand on it",
      "timing": "~30 seconds"
    }
  ],
  "transitions": {
    "toThisSlide": "How to introduce this slide",
    "toNextSlide": "How to transition out"
  },
  "audienceEngagement": ["Questions to ask", "Moments for interaction"],
  "deliveryTips": ["Tone", "Pacing", "Body language tips"],
  "anticipatedQuestions": ["Q&A preparation"],
  "backupContent": "Additional detail if asked",
  "totalDuration": "2 minutes"
}`;

  const contentStr = typeof slideContent === 'string' 
    ? slideContent 
    : JSON.stringify(slideContent, null, 2);

  const userPrompt = `Generate speaker notes for this ${slideType} slide:

SLIDE CONTENT:
${contentStr.slice(0, 2000)}

PRESENTATION DETAILS:
- Duration: ${duration} minutes
- Audience level: ${audienceLevel}

Provide comprehensive speaker notes for confident delivery.`;

  try {
    const response = await callAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { jsonMode: true });
    
    return parseAIResponse(response);
  } catch (error) {
    console.error('[AI Advanced] Speaker notes error:', error.message);
    return getFallbackSpeakerNotes(slideContent, slideType, duration);
  }
}

/**
 * Get fallback speaker notes
 */
function getFallbackSpeakerNotes(slideContent, slideType, duration) {
  const title = typeof slideContent === 'object' ? slideContent.title || 'This slide' : 'This slide';
  
  return {
    openingHook: `Let's discuss ${title.toLowerCase()}.`,
    keyTalkingPoints: [
      {
        point: `Introduce ${title}`,
        elaboration: 'Provide context and background',
        timing: '~30 seconds'
      },
      {
        point: 'Highlight key insights',
        elaboration: 'Walk through the main data points',
        timing: '~45 seconds'
      },
      {
        point: 'Connect to business impact',
        elaboration: 'Explain why this matters',
        timing: '~30 seconds'
      }
    ],
    transitions: {
      toThisSlide: `Moving to ${title.toLowerCase()}...`,
      toNextSlide: 'This leads us to our next point...'
    },
    audienceEngagement: [
      'Ask: Does this align with your experience?',
      'Pause for questions before moving on'
    ],
    deliveryTips: [
      'Maintain eye contact',
      'Use gestures to emphasize key points',
      'Vary your pace for emphasis'
    ],
    anticipatedQuestions: [
      'Can you provide more detail on the methodology?',
      'How does this compare to industry benchmarks?'
    ],
    backupContent: 'Additional context available in appendix',
    totalDuration: `${duration} minutes`
  };
}

// ============================================================================
// 7. Q&A ANTICIPATION
// ============================================================================

/**
 * Anticipate questions based on slide content
 * @param {Object} params - Q&A parameters
 * @param {Object|Array} params.content - Slide content or array of slides
 * @param {string} params.targetAudience - Target audience
 * @param {string} params.purpose - Presentation purpose
 * @returns {Promise<Object>} Anticipated questions with answers
 */
async function anticipateQuestions({ content, targetAudience, purpose }) {
  const systemPrompt = `You are a consulting partner preparing for a client Q&A session.

Anticipate challenging questions that executives might ask. Consider:
- Data credibility and methodology
- Competitive implications
- Implementation challenges
- Financial impact and ROI
- Risk factors

OUTPUT JSON:
{
  "highProbability": [
    {
      "question": "Likely question",
      "probability": 0.85,
      "category": "Methodology|Financial|Strategic|Implementation|Risk",
      "suggestedAnswer": "Concise, confident response",
      "supportingData": ["Data points to reference"],
      "followUpQuestions": ["Secondary questions that might follow"]
    }
  ],
  "mediumProbability": [
    {
      "question": "Possible question",
      "probability": 0.5,
      "category": "category",
      "suggestedAnswer": "Response outline"
    }
  ],
  "challengingQuestions": [
    {
      "question": "Difficult question",
      "whyDifficult": "Why this is hard to answer",
      "strategy": "How to handle it",
      "safeResponse": "Professional deflection if needed"
    }
  ],
  "preparationTips": ["How to prepare for Q&A"],
  "confidenceBoosters": ["Key facts to remember"]
}`;

  const contentStr = typeof content === 'object' 
    ? JSON.stringify(content, null, 2).slice(0, 3000)
    : content.slice(0, 3000);

  const userPrompt = `Anticipate questions for this presentation content:

TARGET AUDIENCE: ${targetAudience || 'Executive audience'}
PURPOSE: ${purpose || 'Strategic recommendation'}

CONTENT:
${contentStr}

What questions should the presenter prepare for?`;

  try {
    const response = await callAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { jsonMode: true });
    
    return parseAIResponse(response);
  } catch (error) {
    console.error('[AI Advanced] Q&A anticipation error:', error.message);
    return getFallbackQuestions(content, targetAudience);
  }
}

/**
 * Get fallback anticipated questions
 */
function getFallbackQuestions(content, targetAudience) {
  return {
    highProbability: [
      {
        question: 'What is the timeline for implementation?',
        probability: 0.9,
        category: 'Implementation',
        suggestedAnswer: 'We recommend a phased approach over 6-12 months...',
        supportingData: ['Phase milestones', 'Resource requirements'],
        followUpQuestions: ['What are the quick wins?', 'What resources are needed?']
      },
      {
        question: 'How did you arrive at these numbers?',
        probability: 0.85,
        category: 'Methodology',
        suggestedAnswer: 'Our analysis was based on [methodology] with data from [sources]...',
        supportingData: ['Data sources', 'Analysis period'],
        followUpQuestions: ['What are the assumptions?', 'Have you validated this?']
      },
      {
        question: 'What is the expected ROI?',
        probability: 0.8,
        category: 'Financial',
        suggestedAnswer: 'We project a [X]% ROI within [ timeframe] based on...',
        supportingData: ['Cost breakdown', 'Revenue projections'],
        followUpQuestions: ['What are the risks?', 'How does this compare to alternatives?']
      }
    ],
    mediumProbability: [
      {
        question: 'How does this compare to what competitors are doing?',
        probability: 0.6,
        category: 'Strategic',
        suggestedAnswer: 'Our analysis shows we would be [ahead/aligned] with industry...'
      }
    ],
    challengingQuestions: [
      {
        question: 'What if this approach fails?',
        whyDifficult: 'Implies lack of confidence',
        strategy: 'Acknowledge risks, highlight mitigation',
        safeResponse: 'We have identified key risks and developed contingency plans...'
      }
    ],
    preparationTips: [
      'Review all assumptions thoroughly',
      'Have backup slides with detailed data',
      'Practice responses to difficult questions'
    ],
    confidenceBoosters: [
      'Data has been validated by [source]',
      'This approach has worked for [examples]'
    ]
  };
}

// ============================================================================
// 8. TRANSLATION
// ============================================================================

/**
 * Translate slide content to target language
 * @param {Object} params - Translation parameters
 * @param {Object} params.content - Content to translate (can be string or object)
 * @param {string} params.targetLanguage - Target language code or name
 * @param {string} params.sourceLanguage - Source language (auto-detect if not provided)
 * @param {boolean} params.preserveFormatting - Keep formatting/markup (default: true)
 * @returns {Promise<Object>} Translated content
 */
async function translateContent({ content, targetLanguage, sourceLanguage, preserveFormatting = true }) {
  const systemPrompt = `You are a professional translator specializing in business and consulting presentations.

Translate the content accurately while:
- Maintaining professional tone
- Preserving consulting terminology
- Keeping data and numbers unchanged
- Adapting culturally appropriate expressions

OUTPUT JSON:
{
  "translatedContent": "The translated content",
  "targetLanguage": "Language name",
  "sourceLanguage": "Detected or provided source language",
  "confidence": 0.95,
  "notes": ["Translation notes", "Cultural adaptations made"],
  "keyTerms": [
    {
      "original": "original term",
      "translated": "translated term",
      "context": "How it's used"
    }
  ],
  "alternativeTranslations": {
    "fieldName": ["Option 1", "Option 2"]
  }
}`;

  const contentStr = typeof content === 'object' 
    ? JSON.stringify(content, null, 2)
    : content;

  const userPrompt = `Translate the following content to ${targetLanguage}:

${sourceLanguage ? `Source language: ${sourceLanguage}` : 'Auto-detect source language'}

CONTENT:
${contentStr.slice(0, 4000)}

Provide a professional translation suitable for executive presentations.`;

  try {
    const response = await callAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { jsonMode: true });
    
    const result = parseAIResponse(response);
    
    // If original content was an object, try to parse translated content back
    if (typeof content === 'object' && typeof result.translatedContent === 'string') {
      try {
        result.translatedContent = JSON.parse(result.translatedContent);
      } catch (e) {
        // Keep as string if parsing fails
      }
    }
    
    return result;
  } catch (error) {
    console.error('[AI Advanced] Translation error:', error.message);
    return getFallbackTranslation(content, targetLanguage);
  }
}

/**
 * Get fallback translation (basic identity/placeholder)
 */
function getFallbackTranslation(content, targetLanguage) {
  return {
    translatedContent: content,
    targetLanguage,
    sourceLanguage: 'unknown',
    confidence: 0.1,
    notes: ['Translation service unavailable - using original content'],
    keyTerms: [],
    alternativeTranslations: {}
  };
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Process multiple slides with speaker notes generation
 */
async function generateSpeakerNotesForDeck(slides, options = {}) {
  const results = [];
  
  for (let i = 0; i < slides.length; i++) {
    try {
      const notes = await generateSpeakerNotes({
        slideContent: slides[i].content,
        slideType: slides[i].type || 'Executive Summary',
        duration: options.durationPerSlide || 2,
        audienceLevel: options.audienceLevel || 'intermediate'
      });
      
      results.push({
        slideNumber: i + 1,
        slideTitle: slides[i].title || `Slide ${i + 1}`,
        notes
      });
    } catch (error) {
      results.push({
        slideNumber: i + 1,
        slideTitle: slides[i].title || `Slide ${i + 1}`,
        notes: null,
        error: error.message
      });
    }
  }
  
  return {
    totalSlides: slides.length,
    processedSlides: results.length,
    notes: results
  };
}

/**
 * Translate an entire slide deck
 */
async function translateDeck(slides, targetLanguage, options = {}) {
  const results = [];
  
  for (const slide of slides) {
    try {
      const translation = await translateContent({
        content: slide,
        targetLanguage,
        sourceLanguage: options.sourceLanguage,
        preserveFormatting: options.preserveFormatting !== false
      });
      
      results.push(translation.translatedContent);
    } catch (error) {
      results.push(slide); // Keep original on error
    }
  }
  
  return {
    targetLanguage,
    translatedSlides: results,
    totalSlides: slides.length
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Core AI functions
  suggestTemplates,
  generateDeckFromDocument,
  recommendVisualizations,
  rewriteContent,
  createStoryFlow,
  generateSpeakerNotes,
  anticipateQuestions,
  translateContent,
  
  // Bulk operations
  generateSpeakerNotesForDeck,
  translateDeck,
  
  // Utilities (for testing/advanced use)
  callAI,
  parseAIResponse
};
