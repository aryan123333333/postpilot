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
    const zaiConfig = {
      baseUrl: "https://internal-api.z.ai/v1",
      apiKey: "Z.ai",
      chatId: process.env.ZAI_CHAT_ID || "chat-d815a1cf-53ae-43a9-9873-125a2006601a",
      userId: process.env.ZAI_USER_ID || "bf40d1c8-8c6e-4bd7-ab7d-2b76cb46ba81",
      token: process.env.ZAI_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYmY0MGQxYzgtOGM2ZS00YmQ3LWFiN2QtMmI3NmNiNDZiYTgxIiwiY2hhdF9pZCI6ImNoYXQtZDgxNWExY2YtNTNhZS00M2E5LTk4NzMtMTI1YTIwMDY2MDFhIiwicGxhdGZvcm0iOiJ6YWkifQ.etx87Pxbxl1gB5aXbYrb0Y6W_6hhdIhN7eO0Xg0MFX0",
    };
    const zai = new ZAI(zaiConfig);

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
