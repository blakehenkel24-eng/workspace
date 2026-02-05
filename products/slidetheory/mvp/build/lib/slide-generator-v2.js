/**
 * SlideTheory MVP - Slide Generator v2.0 (AI Pipeline)
 * Main orchestrator for the v2 generation pipeline
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const { validateSlideInputs } = require('./validators');
const { selectTemplate, loadTemplateExamples } = require('./template-selector');
const { buildPrompt, getPromptStats } = require('./prompt-builder');
const { renderSlideToImage } = require('./slide-renderer'); // Will use existing renderer

// Kimi API configuration
const KIMI_API_BASE = 'https://api.moonshot.cn/v1';
const DEFAULT_MODEL = process.env.KIMI_MODEL || 'kimi-coding/k2p5';

// Directories
const SLIDES_DIR = path.join(__dirname, '..', 'tmp', 'slides');
const EXPORTS_DIR = path.join(__dirname, '..', 'tmp', 'exports');

/**
 * Main generation pipeline - v2 API
 * @param {Object} inputs - User inputs
 * @returns {Promise<Object>} - Generation result
 */
async function generateSlideV2(inputs) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID().slice(0, 8);

  try {
    // Step 1: Validate inputs
    console.log(`[GenerateV2:${requestId}] Validating inputs...`);
    const validation = validateSlideInputs(inputs);
    if (!validation.isValid) {
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        requestId,
        errors: validation.errors
      };
    }

    const params = validation.parsedData;

    // Step 2: Select template structure
    console.log(`[GenerateV2:${requestId}] Selecting template...`);
    const template = selectTemplate({
      slideType: params.slideType,
      audience: params.audience,
      presentationMode: params.presentationMode,
      context: params.context
    });

    // Step 3: Build optimized prompt
    console.log(`[GenerateV2:${requestId}] Building prompt...`);
    const promptConfig = buildPrompt({
      slideType: params.slideType,
      audience: params.audience,
      context: params.context,
      presentationMode: params.presentationMode,
      data: params.data,
      dataPoints: params.dataPoints,
      keyTakeaway: params.keyTakeaway,
      framework: params.framework
    });

    const promptStats = getPromptStats(promptConfig);
    console.log(`[GenerateV2:${requestId}] Prompt stats:`, promptStats);

    // Step 4: Call Kimi API
    console.log(`[GenerateV2:${requestId}] Calling Kimi API...`);
    const aiContent = await callKimiAPI(promptConfig);

    // Step 5: Parse and validate AI response
    console.log(`[GenerateV2:${requestId}] Parsing AI response...`);
    const parsedContent = parseAIResponse(aiContent, params.slideType);

    // Step 6: Generate HTML slide
    console.log(`[GenerateV2:${requestId}] Rendering slide...`);
    const slideId = crypto.randomUUID();
    const imagePath = path.join(SLIDES_DIR, `${slideId}.png`);

    const renderedPath = await renderSlideToImage({
      slideType: params.slideType,
      content: parsedContent,
      outputPath: imagePath
    });

    const isSVG = renderedPath.endsWith('.svg');
    const fileExtension = isSVG ? '.svg' : '.png';

    // Step 7: Build export URLs
    const exportUrls = await generateExportUrls(slideId, params.slideType, parsedContent);

    const duration = Date.now() - startTime;
    console.log(`[GenerateV2:${requestId}] Generation complete in ${duration}ms`);

    // Step 8: Schedule cleanup
    scheduleCleanup(renderedPath, 24 * 60 * 60 * 1000); // 24 hours

    return {
      success: true,
      requestId,
      slideId,
      durationMs: duration,
      slide: {
        slideType: params.slideType,
        title: parsedContent.title,
        html: buildSlideHTML(params.slideType, parsedContent),
        content: parsedContent
      },
      image: {
        url: `/slides/${slideId}${fileExtension}`,
        format: isSVG ? 'svg' : 'png',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      exports: exportUrls,
      metadata: {
        template: template.structure,
        framework: promptConfig.metadata.framework,
        audience: params.audience,
        presentationMode: params.presentationMode,
        promptTokens: promptStats.totalTokens
      }
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[GenerateV2:${requestId}] Error:`, error.message);

    // Return structured error
    return {
      success: false,
      error: 'GENERATION_FAILED',
      requestId,
      durationMs: duration,
      message: getUserFriendlyError(error),
      suggestion: getErrorSuggestion(error)
    };
  }
}

/**
 * Call Kimi API with retry logic
 * @param {Object} promptConfig - Prompt configuration
 * @returns {Promise<string>} - AI response
 */
async function callKimiAPI(promptConfig) {
  const apiKey = process.env.KIMI_API_KEY;

  if (!apiKey) {
    throw new Error('KIMI_API_KEY not configured');
  }

  const maxRetries = 2;
  const timeout = promptConfig.options.timeout || 30000;

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
          model: DEFAULT_MODEL,
          messages: [
            { role: 'system', content: promptConfig.systemPrompt },
            { role: 'user', content: promptConfig.userPrompt }
          ],
          temperature: promptConfig.options.temperature,
          max_tokens: promptConfig.options.max_tokens,
          response_format: promptConfig.options.jsonMode ? { type: 'json_object' } : undefined
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const errorMessage = error.error?.message || `Kimi API error: ${response.status}`;

        if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`[Kimi] Retry ${attempt + 1}/${maxRetries} after ${delay}ms`);
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

      const delay = Math.pow(2, attempt) * 1000;
      console.log(`[Kimi] Retry ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await sleep(delay);
    }
  }

  throw new Error('Max retries exceeded');
}

/**
 * Parse and validate AI response
 * @param {string} content - Raw AI response
 * @param {string} slideType - Expected slide type
 * @returns {Object} - Parsed content
 */
function parseAIResponse(content, slideType) {
  try {
    // Try direct JSON parse
    let parsed = JSON.parse(content);
    return normalizeContent(parsed, slideType);
  } catch (parseError) {
    // Try to extract JSON from markdown
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                      content.match(/```([\s\S]*?)```/) ||
                      content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        let parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        return normalizeContent(parsed, slideType);
      } catch (e) {
        // Continue to fallback
      }
    }

    // Fallback: generate from content
    console.warn('[ParseAI] Failed to parse JSON, using fallback extraction');
    return generateFallbackContent(content, slideType);
  }
}

/**
 * Normalize parsed content to ensure required fields
 * @param {Object} content - Parsed content
 * @param {string} slideType - Slide type
 * @returns {Object} - Normalized content
 */
function normalizeContent(content, slideType) {
  // Ensure title exists
  if (!content.title || typeof content.title !== 'string') {
    content.title = 'Strategic Analysis';
  }

  // Ensure footer exists
  if (!content.footer) {
    content.footer = {
      source: 'Analysis',
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
  }

  // Add slide type marker for renderer
  content._slideType = slideType;

  return content;
}

/**
 * Generate fallback content from unstructured AI response
 * @param {string} content - Raw content
 * @param {string} slideType - Slide type
 * @returns {Object} - Structured content
 */
function generateFallbackContent(content, slideType) {
  const today = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  // Extract title from first line or generate
  const lines = content.split('\n').filter(l => l.trim());
  const title = lines[0]?.replace(/^#+\s*/, '').substring(0, 60) || 'Strategic Analysis';

  // Extract bullet points
  const bullets = lines
    .filter(l => l.match(/^[-•*]\s/))
    .slice(0, 4)
    .map(l => ({
      heading: 'Key Point',
      text: l.replace(/^[-•*]\s*/, '').trim()
    }));

  if (bullets.length === 0) {
    bullets.push(
      { heading: 'Analysis', text: 'Comprehensive strategic analysis completed.' },
      { heading: 'Findings', text: 'Key insights identified for consideration.' },
      { heading: 'Recommendation', text: 'Proceed with strategic initiatives.' }
    );
  }

  const fallbacks = {
    'Executive Summary': {
      title,
      subtitle: 'Key findings and recommendations',
      keyPoints: bullets,
      recommendation: 'Proceed with strategic initiatives as outlined.',
      footer: { source: 'Analysis', date: today },
      _slideType: slideType
    },
    'Market Analysis': {
      title,
      marketSize: 'Market analysis completed',
      insights: bullets.map(b => b.text),
      footer: { source: 'Market research', date: today },
      _slideType: slideType
    },
    'Financial Model': {
      title,
      metrics: [
        { label: 'Revenue', value: 'Analyzing', change: 'Review', period: 'YoY' },
        { label: 'Margin', value: 'Analyzing', change: 'Review', period: 'YoY' },
        { label: 'EBITDA', value: 'Analyzing', change: 'Review', period: 'YoY' }
      ],
      footer: { source: 'Financial data', date: today },
      _slideType: slideType
    },
    'Competitive Analysis': {
      title,
      matrixTitle: 'Competitive Positioning',
      competitors: [{ name: 'Analysis', xPosition: 50, yPosition: 50, features: [] }],
      features: ['Analysis Pending'],
      footer: { source: 'Competitive analysis', date: today },
      _slideType: slideType
    },
    'Growth Strategy': {
      title,
      flywheelTitle: 'Growth Strategy',
      flywheel: bullets.slice(0, 4).map((b, i) => ({ label: `Stage ${i + 1}` })),
      initiatives: bullets.slice(0, 3).map(b => ({
        title: b.heading,
        description: b.text
      })),
      footer: { source: 'Strategy team', date: today },
      _slideType: slideType
    },
    'Risk Assessment': {
      title,
      risks: bullets.slice(0, 4).map((b, i) => ({
        name: b.text.substring(0, 30),
        probability: i % 2 === 0 ? 'Medium' : 'Low',
        impact: i % 2 === 0 ? 'High' : 'Medium'
      })),
      footer: { source: 'Risk assessment', date: today },
      _slideType: slideType
    }
  };

  return fallbacks[slideType] || fallbacks['Executive Summary'];
}

/**
 * Generate export URLs for the slide
 * @param {string} slideId - Slide ID
 * @param {string} slideType - Slide type
 * @param {Object} content - Slide content
 * @returns {Promise<Object>} - Export URLs
 */
async function generateExportUrls(slideId, slideType, content) {
  // For now, return placeholder URLs that will be generated on demand
  // In production, these would trigger async export jobs
  return {
    pptx: {
      url: `/api/export/pptx?slideId=${slideId}`,
      format: 'pptx',
      status: 'available'
    },
    pdf: {
      url: `/api/export/pdf?slideId=${slideId}`,
      format: 'pdf',
      status: 'available'
    },
    html: {
      url: `/api/export/html?slideId=${slideId}`,
      format: 'html',
      status: 'available'
    }
  };
}

/**
 * Schedule cleanup of temporary files
 * @param {string} filePath - Path to clean up
 * @param {number} delayMs - Delay in milliseconds
 */
function scheduleCleanup(filePath, delayMs) {
  setTimeout(async () => {
    try {
      await fs.unlink(filePath);
      console.log(`[Cleanup] Removed: ${path.basename(filePath)}`);
    } catch (err) {
      // Ignore cleanup errors
    }
  }, delayMs);
}

/**
 * Get user-friendly error message
 * @param {Error} error - Error object
 * @returns {string}
 */
function getUserFriendlyError(error) {
  if (error.message?.includes('API key')) {
    return 'AI service not configured. Please check your KIMI_API_KEY.';
  }
  if (error.message?.includes('timeout')) {
    return 'Generation timed out. Please try with a shorter context.';
  }
  if (error.message?.includes('rate limit')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  if (error.message?.includes('JSON')) {
    return 'Failed to process AI response. Please try again.';
  }
  return 'Failed to generate slide. Please try again.';
}

/**
 * Get error suggestion
 * @param {Error} error - Error object
 * @returns {string}
 */
function getErrorSuggestion(error) {
  if (error.message?.includes('timeout')) {
    return 'Try simplifying your context or breaking into smaller requests.';
  }
  if (error.message?.includes('rate limit')) {
    return 'Wait a few seconds before retrying.';
  }
  return 'Try refreshing the page or using different inputs.';
}

/**
 * Sleep utility
 * @param {number} ms - Milliseconds
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Build slide HTML for API response
 * @param {string} slideType - Slide type
 * @param {Object} content - Slide content
 * @returns {string} - HTML string
 */
function buildSlideHTML(slideType, content) {
  // Use the existing renderer's buildSlideHTML function
  // This is a simplified version for the API response
  const { buildSlideHTML: rendererBuildHTML } = require('./slide-renderer');
  return rendererBuildHTML(slideType, content);
}

// Re-export renderSlideToImage from existing renderer
const { renderSlideToImage: legacyRenderSlide, buildSlideHTML: _buildSlideHTML } = require('./slide-generator');

// Create wrapper module exports
module.exports = {
  generateSlideV2,
  generateExportUrls,
  parseAIResponse,
  buildSlideHTML,
  renderSlideToImage: legacyRenderSlide
};
