import { NextRequest, NextResponse } from 'next/server';
import { optimizeImagePrompt } from '@/lib/ai-providers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, postContent } = body as { prompt: string; postContent?: string };

    if (!prompt || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: 'Please provide a prompt (at least 3 characters)' },
        { status: 400 }
      );
    }

    // Two-stage pipeline: optimize prompt if post content is provided
    let finalPrompt = prompt.trim();
    if (postContent && postContent.length > 10) {
      try {
        finalPrompt = await optimizeImagePrompt(postContent);
      } catch {
        // Fall back to basic enhancement
        finalPrompt = `social media post image about ${prompt.trim()}, vibrant colors, modern design, professional quality, clean composition`;
      }
    } else {
      // Basic enhancement for standalone prompts
      finalPrompt = `social media post image about ${prompt.trim()}, vibrant colors, modern design, professional quality, clean composition, minimalist, high quality vector style`;
    }

    const enhancedPrompt = encodeURIComponent(finalPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${enhancedPrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 999999)}`;

    return NextResponse.json({
      success: true,
      image: imageUrl,
      isUrl: true,
      prompt: finalPrompt,
      optimizedFrom: postContent ? prompt.trim() : undefined,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Image generation error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Image generation error: ${msg}` },
      { status: 500 }
    );
  }
}