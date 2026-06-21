import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "rnd_kZofcF7qhAcFdc4sMklqbHiOauTx";

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

    // Use Gemini's image generation (Imagen 3 Free)
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate a vibrant, modern, professional social media post image about: ${prompt.trim()}. Use bold colors, clean design, engaging visual composition.`,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => "Unknown error");
      // Fallback: try with standard image model
      return generateImageFallback(prompt.trim());
    }

    const result = await res.json();
    
    // Check for image in response parts
    const parts = result.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(
      (p: any) => p.inlineData && p.inlineData.mimeType && p.inlineData.mimeType.startsWith("image/")
    );

    if (imagePart) {
      const imageData = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      return NextResponse.json({
        success: true,
        image: imageData,
        prompt: prompt.trim(),
        generatedAt: new Date().toISOString(),
      });
    }

    // No image in response — try fallback
    return generateImageFallback(prompt.trim());
  } catch (error) {
    console.error("Image generation error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Image generation error: ${msg}` },
      { status: 500 }
    );
  }
}

async function generateImageFallback(prompt: string) {
  // Use pollinations.ai as free fallback — no API key needed!
  const encodedPrompt = encodeURIComponent(
    `social media post image about ${prompt}, vibrant colors, modern design, professional quality`
  );
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

  return NextResponse.json({
    success: true,
    image: imageUrl,
    isUrl: true,
    prompt,
    generatedAt: new Date().toISOString(),
  });
}
