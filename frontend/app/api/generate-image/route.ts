import { NextRequest, NextResponse } from 'next/server';

// This API route generates images for slides
// Currently uses placeholder images when no Gemini API key is available
// To enable real image generation, set GEMINI_API_KEY in .env.local

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, slideId } = body;

    if (!prompt || !slideId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: prompt and slideId'
      }, { status: 400 });
    }

    // Check for Gemini API key
    const geminiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiKey) {
      // No API key - return a placeholder image URL
      console.log('No GEMINI_API_KEY configured, returning placeholder image');
      
      // Generate a data URL for a placeholder slide image
      const placeholderSvg = generatePlaceholderSVG(prompt);
      
      return NextResponse.json({
        success: true,
        imageUrl: placeholderSvg,
        note: 'Using placeholder image. Set GEMINI_API_KEY for real image generation.'
      });
    }

    // If we have a Gemini key, we would call the nano-banana-pro script here
    // For now, return a placeholder
    const placeholderSvg = generatePlaceholderSVG(prompt);
    
    return NextResponse.json({
      success: true,
      imageUrl: placeholderSvg,
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Image generation failed',
    }, { status: 500 });
  }
}

function generatePlaceholderSVG(prompt: string): string {
  // Create a simple SVG placeholder image
  const encodedPrompt = prompt.slice(0, 50).replace(/"/g, '&quot;');
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <rect width="800" height="450" fill="#f8fafc"/>
    <rect x="40" y="40" width="720" height="370" fill="white" stroke="#e2e8f0" stroke-width="2" rx="8"/>
    <text x="400" y="200" font-family="system-ui, sans-serif" font-size="24" fill="#64748b" text-anchor="middle">Slide Image</text>
    <text x="400" y="240" font-family="system-ui, sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">${encodedPrompt}...</text>
    <text x="400" y="280" font-family="system-ui, sans-serif" font-size="12" fill="#cbd5e1" text-anchor="middle">Set GEMINI_API_KEY to enable image generation</text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
