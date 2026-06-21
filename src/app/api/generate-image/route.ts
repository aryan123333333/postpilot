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

    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();

    const result = await zai.images.generations.create({
      prompt: `social media post image about ${prompt.trim()}, vibrant colors, modern design, professional quality, engaging visual`,
      size: "1024x1024",
    });

    const imageBase64 = result?.data?.[0]?.base64;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Failed to generate image. Please try again." },
        { status: 500 }
      );
    }

    const imageData = `data:image/png;base64,${imageBase64}`;

    return NextResponse.json({
      success: true,
      image: imageData,
      prompt: prompt.trim(),
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
