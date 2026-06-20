import { NextRequest, NextResponse } from "next/server";

interface GenerateRequest {
  topic: string;
  platform: string;
  tone: string;
  count: number;
}

const PLATFORM_CONFIG: Record<string, { maxChars: number; style: string; hashtags: boolean }> = {
  twitter: {
    maxChars: 280,
    style: "Twitter/X post",
    hashtags: true,
  },
  linkedin: {
    maxChars: 3000,
    style: "LinkedIn post",
    hashtags: false,
  },
  instagram: {
    maxChars: 2200,
    style: "Instagram caption",
    hashtags: true,
  },
  tiktok: {
    maxChars: 150,
    style: "TikTok hook/caption",
    hashtags: true,
  },
  youtube: {
    maxChars: 5000,
    style: "YouTube description",
    hashtags: true,
  },
};

const TONE_INSTRUCTIONS: Record<string, string> = {
  professional: "Professional, authoritative, data-driven, industry-insightful. Use refined language.",
  casual: "Casual, conversational, relatable, fun. Use everyday language and expressions.",
  humorous: "Witty, funny, clever, entertaining. Use humor and wordplay naturally.",
  inspirational: "Inspirational, motivational, empowering. Use uplifting language and emotional hooks.",
  provocative: "Bold, contrarian, thought-provoking. Challenge common assumptions.",
  educational: "Educational, informative, clear, actionable. Break down complex topics simply.",
};

async function generateWithAI(prompt: string): Promise<string> {
  const ZAI = (await import("z-ai-web-dev-sdk")).default;
  const zai = await ZAI.create();

  const completion = await zai.chat.completions.create({
    messages: [
      {
        role: "assistant",
        content: `You are PostPilot, an elite social media content strategist who has helped brands grow from 0 to 1M+ followers. You create content that stops scrollers, drives engagement, and converts followers into customers. Your content feels native to each platform — never generic, always fresh and authentic.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    thinking: { type: "disabled" },
  });

  return completion.choices[0]?.message?.content || "Unable to generate content. Please try again.";
}

function buildPrompt(req: GenerateRequest): string {
  const config = PLATFORM_CONFIG[req.platform] || PLATFORM_CONFIG.twitter;
  const toneGuide = TONE_INSTRUCTIONS[req.tone] || TONE_INSTRUCTIONS.casual;

  return `Create ${req.count} unique, high-engagement ${config.style}s about: "${req.topic}"

TONE: ${toneGuide}
MAX LENGTH: ${config.maxChars} characters each
HASHTAGS: ${config.hashtags ? "Yes — include 3-5 relevant trending hashtags at the end" : "No hashtags — keep it clean"}

CRITICAL RULES:
1. Each post MUST be fundamentally different in angle, hook, and structure
2. Start with a powerful hook that makes people STOP scrolling
3. Use line breaks for readability on the platform
4. Make it feel human, not AI-generated — use natural language patterns
5. Include actionable value or emotional resonance in every post
6. Use platform-native formatting (e.g., thread-friendly for Twitter, carousel-text for LinkedIn)

OUTPUT FORMAT:
Separate each post with exactly "---POST---" on its own line.
Do NOT number the posts. Do NOT include any intro/outro text. Just the raw posts.`;
}

function parsePosts(raw: string): string[] {
  let posts: string[] = [];

  // Try primary delimiter first
  if (raw.includes("---POST---")) {
    posts = raw.split("---POST---").map((p) => p.trim()).filter((p) => p.length > 20);
  }

  // Fallback: try numbered list pattern (e.g., "1.", "1)", "Post 1:")
  if (posts.length <= 1) {
    const numbered = raw
      .split(/(?:^|\n)\s*(?:\d+[\.\)]\s*|(?:Post|POST)\s+\d+\s*[:\-]?\s*)/)
      .map((p) => p.trim())
      .filter((p) => p.length > 30);
    if (numbered.length > posts.length) posts = numbered;
  }

  // Fallback: split by double newlines (paragraphs)
  if (posts.length <= 1) {
    const paragraphs = raw
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 40);
    if (paragraphs.length > posts.length) posts = paragraphs;
  }

  // If still only one result but very long, try splitting at hashtag clusters
  if (posts.length === 1 && posts[0].length > 500) {
    const hashtagSplit = posts[0]
      .split(/\n(?=#[A-Za-z])/)
      .map((p) => p.trim())
      .filter((p) => p.length > 30);
    if (hashtagSplit.length > 1) posts = hashtagSplit;
  }

  return posts;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, platform, tone, count } = body as GenerateRequest;

    if (!topic || topic.trim().length < 3) {
      return NextResponse.json({ error: "Please provide a topic (at least 3 characters)" }, { status: 400 });
    }

    const validPlatforms = Object.keys(PLATFORM_CONFIG);
    if (!platform || !validPlatforms.includes(platform)) {
      return NextResponse.json({ error: `Invalid platform. Choose from: ${validPlatforms.join(", ")}` }, { status: 400 });
    }

    const validTones = Object.keys(TONE_INSTRUCTIONS);
    if (!tone || !validTones.includes(tone)) {
      return NextResponse.json({ error: `Invalid tone. Choose from: ${validTones.join(", ")}` }, { status: 400 });
    }

    const postCount = Math.min(Math.max(count || 3, 1), 10);
    const prompt = buildPrompt({ topic, platform, tone, count: postCount });

    const rawContent = await generateWithAI(prompt);
    const posts = parsePosts(rawContent);

    if (posts.length === 0) {
      return NextResponse.json({ error: "Failed to parse generated content. Please try again." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      posts,
      platform,
      topic,
      tone,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json({ error: "Internal server error. Please try again later." }, { status: 500 });
  }
}
