// /api/generate-image.js - Generate slide visuals using Nano Banana (Gemini 3 Pro Image)
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const execAsync = promisify(exec);

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Generate an image prompt based on slide content
 */
function generateImagePrompt(slideContent, style = 'professional') {
  const { headline, subheadline, content } = slideContent;
  const primaryMessage = content?.primary_message || '';
  
  const stylePrompts = {
    professional: 'clean corporate consulting style, dark blue header, white background, minimalist, McKinsey/BCG aesthetic',
    modern: 'modern tech startup style, gradient background, bold typography, vibrant accents',
    classic: 'classic business presentation, neutral colors, formal layout, executive-friendly',
    creative: 'creative agency style, dynamic layout, engaging visuals, memorable design'
  };

  const baseStyle = stylePrompts[style] || stylePrompts.professional;
  
  return `Professional consulting slide visual for: "${headline}". 
${subheadline ? `Context: ${subheadline}. ` : ''}
${primaryMessage ? `Key message: ${primaryMessage}. ` : ''}

Style requirements:
- ${baseStyle}
- 16:9 aspect ratio presentation slide
- Clean, readable layout with clear visual hierarchy
- Professional color palette (blues, grays, whites)
- No text in the image (text will be overlaid separately)
- Abstract visual representation of the business concept
- Suitable for executive presentation
- High quality, crisp graphics
- Subtle geometric patterns or business-themed imagery
- Professional photography or illustration style`;
}

/**
 * Call Gemini API directly for image generation
 */
async function generateImageWithGemini(prompt, resolution = '2K') {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  // Map resolution to Gemini parameters
  const resolutionMap = {
    '1K': { width: 1024, height: 1024 },
    '2K': { width: 1536, height: 1024 }, // 16:9 aspect ratio
    '4K': { width: 2048, height: 1152 }
  };
  
  const size = resolutionMap[resolution] || resolutionMap['2K'];
  
  // Call Gemini API
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GEMINI_API_KEY}`,
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.4,
        responseModalities: ["TEXT", "IMAGE"]
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  // Extract image data from response
  const imagePart = data.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
  if (!imagePart) {
    throw new Error('No image generated');
  }

  return imagePart.inlineData.data; // Base64 encoded image
}

/**
 * Generate image using Nano Banana skill (fallback)
 */
async function generateImageWithNanoBanana(prompt, filename, resolution = '2K') {
  const skillPath = path.join(process.cwd(), 'skills', 'nano-banana-pro', 'scripts', 'generate_image.py');
  
  if (!fs.existsSync(skillPath)) {
    throw new Error('Nano Banana skill not found');
  }

  const cmd = `uv run ${skillPath} --prompt "${prompt.replace(/"/g, '\\"')}" --filename "${filename}" --resolution ${resolution}`;
  
  const { stdout, stderr } = await execAsync(cmd, {
    env: { ...process.env, GEMINI_API_KEY }
  });

  if (stderr && !stderr.includes('warning')) {
    console.error('Nano Banana stderr:', stderr);
  }

  // Extract output path from stdout
  const match = stdout.match(/Saved to: (.+\.png)/);
  return match ? match[1] : null;
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
    const { 
      slideContent, 
      style = 'professional',
      resolution = '2K',
      generatePrompt = false 
    } = req.body;

    if (!slideContent && !req.body.prompt) {
      return res.status(400).json({
        success: false,
        error: 'slideContent or prompt is required'
      });
    }

    // Generate or use provided prompt
    const imagePrompt = generatePrompt 
      ? generateImagePrompt(slideContent, style)
      : (req.body.prompt || generateImagePrompt(slideContent, style));

    // Check if we have API key
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY not configured. Please set it in Vercel environment variables.',
        prompt: imagePrompt // Return the prompt so client can see what would be generated
      });
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const safeHeadline = (slideContent?.headline || 'slide').replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 30);
    const filename = `${timestamp}-${safeHeadline}.png`;

    let imageData;
    let generationMethod = 'gemini';

    try {
      // Try direct Gemini API first
      imageData = await generateImageWithGemini(imagePrompt, resolution);
    } catch (geminiError) {
      console.log('Direct Gemini API failed, trying Nano Banana:', geminiError.message);
      
      // Fallback to Nano Banana skill
      const outputPath = await generateImageWithNanoBanana(imagePrompt, filename, resolution);
      if (outputPath && fs.existsSync(outputPath)) {
        imageData = fs.readFileSync(outputPath).toString('base64');
        generationMethod = 'nano-banana';
      } else {
        throw geminiError;
      }
    }

    res.status(200).json({
      success: true,
      image: {
        data: imageData,
        format: 'png',
        filename: filename,
      },
      prompt: imagePrompt,
      generationMethod,
      resolution,
    });

  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Image generation failed',
      prompt: req.body.prompt || (req.body.slideContent ? generateImagePrompt(req.body.slideContent) : null)
    });
  }
};
