import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body as { prompt: string };

    if (!prompt || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: "Please provide a prompt (at least 3 characters)" },
        { status: 400 }
      );
    }

    // Use Pollinations.ai — free, no API key needed
    const enhancedPrompt = encodeURIComponent(
      `social media post image about ${prompt.trim()}, vibrant colors, modern design, professional quality, clean composition`
    );
    const imageUrl = `https://image.pollinations.ai/prompt/${enhancedPrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 999999)}`;

    return NextResponse.json({
      success: true,
      image: imageUrl,
      isUrl: true,
      prompt: prompt.trim(),
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Image generation error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Image generation error: ${msg}` },
      { status: 500 }
    );
  }
}
