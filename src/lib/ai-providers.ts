/* ================================================================ */
/*  AI Provider Abstraction Layer                                     */
/*  Supports multiple providers with automatic fallback               */
/* ================================================================ */

interface AIProvider {
  name: string;
  generateText: (prompt: string, systemPrompt?: string) => Promise<string>;
  isAvailable: () => Promise<boolean>;
}

/* ── Pollinations.ai (Primary - Free, No Key) ── */
const pollinationsProvider: AIProvider = {
  name: 'pollinations',
  isAvailable: async () => true, // Always available (no auth needed)
  generateText: async (prompt: string, systemPrompt?: string) => {
    const messages: Array<{ role: string; content: string }> = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        model: 'openai',
        seed: Math.floor(Math.random() * 999999),
        jsonMode: false,
      }),
    });

    if (!res.ok) {
      throw new Error(`Pollinations API error: ${res.status}`);
    }

    const text = await res.text();
    return text.trim();
  },
};

/* ── Provider Manager ── */
const providers: AIProvider[] = [pollinationsProvider];

export async function generateText(
  prompt: string,
  systemPrompt?: string,
  retries: number = 2
): Promise<{ text: string; provider: string }> {
  let lastError: Error | null = null;

  for (const provider of providers) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const text = await provider.generateText(prompt, systemPrompt);
        return { text, provider: provider.name };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(
          `[AI] ${provider.name} attempt ${attempt + 1} failed:`,
          lastError.message
        );
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1))); // Exponential backoff
        }
      }
    }
  }

  throw new Error(
    `All AI providers failed after retries. Last error: ${lastError?.message}`
  );
}

export async function generateTextJSON<T>(
  prompt: string,
  systemPrompt?: string,
  retries: number = 2
): Promise<{ data: T; provider: string }> {
  const result = await generateText(prompt, systemPrompt, retries);
  try {
    // Try to extract JSON from the response (handle markdown code blocks)
    let jsonStr = result.text;
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    // Also try finding raw JSON object/array
    const braceMatch = jsonStr.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (braceMatch) {
      jsonStr = braceMatch[1].trim();
    }
    const data = JSON.parse(jsonStr) as T;
    return { data, provider: result.provider };
  } catch {
    throw new Error(`Failed to parse AI response as JSON. Raw: ${result.text.slice(0, 200)}`);
  }
}

export async function optimizeImagePrompt(postContent: string): Promise<string> {
  try {
    const result = await generateText(
      `Convert this social media post into a professional, minimalist image prompt for a graphic vector asset. The image should visually represent the key message. Avoid text distortion markers and keep it clean.

Original post:
"""
${postContent}
"""

Output ONLY the image prompt, nothing else. Keep it under 100 words.`,
      'You are a professional graphic design AI that creates clean, modern social media image prompts. Always output a single concise image prompt.'
    );
    return result.text;
  } catch {
    // Fallback to basic enhancement if optimization fails
    return `social media post image about ${postContent.slice(0, 100)}, vibrant colors, modern design, professional quality, clean composition`;
  }
}