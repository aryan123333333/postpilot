import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface GenerateRequest {
  topic: string;
  platform: string;
  tone: string;
  count: number;
  mode?: 'generate' | 'repurpose' | 'enhance';
  brandVoice?: string;
  userId?: string;
}

/* ------------------------------------------------------------------ */
/*  Platform-specific deep instructions                                */
/* ------------------------------------------------------------------ */

interface PlatformProfile {
  maxChars: number;
  contentType: string;
  structureRules: string;
  hashtagRule: string;
  formatExample: string;
  forbiddenPatterns: string[];
}

const PLATFORM_PROFILES: Record<string, PlatformProfile> = {
  twitter: {
    maxChars: 280,
    contentType: "single standalone tweet",
    structureRules: `MUST be a single complete tweet under 280 characters.
- Open with a bold hook or hot take in the first line
- Use 1-3 short lines max (separated by single line breaks, NOT paragraphs)
- End with an engagement driver (a question, a bold claim, or "Thread 🧵" tease)
- NEVER write multiple tweets in one output — each output is ONE tweet only`,
    hashtagRule: "Include 1-3 hashtags woven naturally into the text or at the very end. Do NOT put hashtags on separate lines.",
    formatExample: `EXAMPLE of a perfect tweet:
"Most people think remote work means less productivity.
The data says the opposite.
Companies with remote teams see 22% higher output.
The secret? Async communication + clear ownership.
What's your experience with remote work? #RemoteWork"`,
    forbiddenPatterns: [
      "Multiple tweets or a thread in one output",
      "Numbered lists (1. 2. 3.) — tweets don't have room for lists",
      "Long paragraphs — keep it tight and punchy",
      "More than 280 characters total",
      "Starting with quotes or citations",
    ],
  },
  linkedin: {
    maxChars: 3000,
    contentType: "long-form LinkedIn post",
    structureRules: `MUST be a professional LinkedIn post with strong storytelling structure.
- Open with a contrarian hook, surprising stat, or personal anecdote (1-2 lines)
- Leave a blank line after the hook for the "see more" bait
- Write in short 1-2 sentence paragraphs with generous line breaks
- Use a numbered list or bullet points for key takeaways (3-5 items)
- Each point should have a bold insight + supporting detail
- Close with an actionable takeaway and an engagement question
- Total length: 100-250 words for optimal LinkedIn engagement`,
    hashtagRule: "Include 3-5 relevant hashtags at the very bottom, separated by spaces (LinkedIn style, not commas).",
    formatExample: `EXAMPLE of a perfect LinkedIn post:
"I spent 10 years in corporate before I realized something uncomfortable:

The hardest workers aren't the ones who get promoted.

It's the ones who make their work VISIBLE.

Here are 5 habits that changed my career trajectory:

1. I started documenting small wins weekly
Most people forget their achievements. I started a "brag folder" — screenshots of positive feedback, completed projects, metrics improved. Review it before every performance review.

2. I began framing problems before presenting solutions
Instead of saying "here's what I did," I say "here's the challenge we faced, why it mattered, and what I did about it." Context transforms effort into impact.

3. I built relationships UP, not just across
A mentor once told me: "Your boss's boss knows your name, or you're invisible." I started sharing brief monthly updates with skip-level leaders.

4. I learned to speak in outcomes, not activities
"I organized a team meeting" → weak
"I aligned 3 departments around a shared timeline, cutting launch delays by 40%" → strong

5. I made my expertise public
I started sharing industry insights here on LinkedIn. Within 6 months, 3 inbound opportunities came directly from my posts — zero cold applications needed.

The difference between working hard and working smart isn't about effort.

It's about visibility.

What's one habit that helped you get noticed at work?

#CareerGrowth #ProfessionalDevelopment #Leadership #CareerAdvice #WorkSmarter"`,
    forbiddenPatterns: [
      "More than 3000 characters",
      "Long dense paragraphs without line breaks",
      "Generic motivational fluff without data or stories",
      "Hashtags mixed into the body text",
    ],
  },
  instagram: {
    maxChars: 2200,
    contentType: "Instagram photo/video caption",
    structureRules: `MUST be an Instagram caption optimized for engagement and discoverability.
- First line: a scroll-stopping hook or question (this is what shows before "...more")
- After the hook, write 2-3 short paragraphs with line breaks
- Use a storytelling arc: hook → value/context → key insight → CTA
- Include a clear call-to-action: "Save this for later", "Share with someone who needs this", "Drop a comment below", or "Link in bio"
- End with a clean line break before hashtags
- Tone should feel personal and authentic — like talking to a friend
- Use line breaks liberally for readability on mobile`,
    hashtagRule: "Include 15-25 relevant hashtags at the very end on a new line, starting with #. Mix trending broad hashtags with niche-specific ones.",
    formatExample: `EXAMPLE of a perfect Instagram caption:
"You're not overthinking your career — you're underthinking your strategy.

Most people spend 80% of their energy DOING work and 20% THINKING about which work matters.

Flip that ratio and watch what happens.

When I started spending just 30 minutes every Monday planning my week strategically instead of reactively, everything changed:
✓ My income went up 40% in 6 months
✓ I dropped from 60-hour weeks to 35
✓ I finally had energy for things I actually enjoy

The secret wasn't working harder. It was asking myself one question every morning:

"If I can only accomplish ONE thing today that moves the needle, what is it?"

Then doing THAT first. Everything else is secondary.

Save this post and try it this Monday. Thank me later.

What's the ONE thing you're focusing on this week? Drop it below 👇

#CareerStrategy #MindsetShift #ProductivityTips #WorkSmarterNotHarder #CareerGrowth #GoalSetting #PersonalDevelopment #SuccessMindset #ProfessionalGrowth #MindsetMatters #EntrepreneurLife #BusinessMindset #HustleSmart #RemoteWorkLife #DigitalEntrepreneur"`,
    forbiddenPatterns: [
      "More than 2200 characters",
      "Starting directly with hashtags (hook must come first)",
      "Long unbroken paragraphs",
      "Generic captions that could apply to any topic",
      "Fewer than 10 hashtags for Instagram",
    ],
  },
  tiktok: {
    maxChars: 150,
    contentType: "TikTok video hook/caption",
    structureRules: `MUST be an ultra-short TikTok hook that goes in the on-screen text overlay OR caption.
- Maximum 150 characters — BRIEF is everything
- Must create instant curiosity, urgency, or relatability
- Use pattern interrupts: "Nobody talks about this but...", "POV:", "Stop scrolling if...", "The #1 mistake..."
- Each output is ONE short hook/caption only — NOT a script
- Could also be a bold statement, provocative question, or challenge hook
- Feel free to use emojis — they work great on TikTok`,
    hashtagRule: "Include 3-5 trending TikTok hashtags at the end. Use camelCase for readability: #SideHustleTok #LearnOnTikTok",
    formatExample: `EXAMPLES of perfect TikTok hooks:
"Nobody talks about this $5K/month side hustle 🤫 #SideHustleTok #MakeMoneyOnline"

"POV: you finally stopped trading time for money 💸 #EntrepreneurTok #FinancialFreedom"

"3 remote jobs that pay more than your office job 📱 #RemoteWork #CareerTok #JobSearch"`,
    forbiddenPatterns: [
      "More than 150 characters total (including hashtags)",
      "Long sentences or paragraphs",
      "Numbered lists or structured content",
      "Multiple hooks mashed together in one output",
      "Being generic — must feel native to TikTok's fast-paced culture",
    ],
  },
  'youtube-long': {
    maxChars: 5000,
    contentType: "YouTube long video description",
    structureRules: `MUST be a complete YouTube long video description optimized for SEO and click-through.
- First 1-2 lines: compelling summary with keywords (shows in search results and under the video)
- After the hook, write a detailed 200-400 word description with:
  - Overview of what the video covers
  - Key points or timestamps preview (e.g., "0:00 Introduction", "1:30 Point 1", etc.)
  - Value proposition — why watching this is worth their time
  - A personal note or credibility builder
- End with a strong CTA: subscribe, like, comment, check out linked resources
- Include 2-3 relevant links formatted as: "🔗 [Link Text](URL)"
- Professional tone, information-rich, SEO-optimized with natural keyword placement`,
    hashtagRule: "Include 3-5 hashtags at the very end. YouTube hashtags help with categorization: #HowToMakeMoneyOnline #RemoteWork",
    formatExample: `EXAMPLE of a perfect YouTube long video description:
"Discover the 7 proven remote income streams generating $5,000+ monthly from home — backed by real data and case studies.

In this video, I break down the exact strategies that everyday people are using to build sustainable income from their laptops. No get-rich-quick schemes — just proven methods with real numbers.

Timestamps:
0:00 — Why most "make money online" advice fails
1:45 — Income Stream #1: Digital Products
4:30 — Income Stream #2: E-commerce Automation
7:15 — Income Stream #3: High-Ticket Freelancing
10:00 — Income Stream #4: Affiliate Marketing
13:20 — Income Stream #5: Content Monetization
16:00 — Income Stream #6: Virtual Consulting
18:30 — Income Stream #7: Automation Services
21:00 — My recommended starting path for beginners

Resources mentioned in this video:
🔗 Free Digital Product Starter Guide — [link in description]

I've personally tested each of these methods over the past 3 years and compiled the data into actionable steps you can follow starting this week.

If you found this valuable, hit subscribe and turn on notifications — I post new income breakdowns every week.

Which income stream are you most interested in? Let me know in the comments!

#HowToMakeMoneyOnline #RemoteWork #SideHustle #FinancialFreedom #PassiveIncome"`,
    forbiddenPatterns: [
      "More than 5000 characters",
      "Thin descriptions with no real content",
      "Missing timestamps or structure",
      "Keyword stuffing — keywords should feel natural",
      "No call-to-action at the end",
    ],
  },
  'youtube-shorts': {
    maxChars: 150,
    contentType: "YouTube Shorts hook/caption",
    structureRules: `MUST be an ultra-short YouTube Shorts hook that appears as on-screen text or caption.
- Maximum 150 characters — punchy and fast, just like TikTok
- Open with a pattern interrupt: "Nobody talks about...", "POV:", "Stop scrolling if...", "The #1 reason..."
- Could be a bold claim, provocative question, or challenge
- Use emojis — they boost engagement on Shorts
- Each output is ONE short hook only — NOT a script, NOT a description`,
    hashtagRule: "Include 3-5 relevant hashtags at the end: #Shorts #SideHustle #MoneyTok",
    formatExample: `EXAMPLES of perfect YouTube Shorts hooks:
"Nobody talks about this $5K/month side hustle 🤫 #Shorts #MakeMoneyOnline"

"POV: you finally stopped trading time for money 💸 #Shorts #FinancialFreedom"

"3 remote jobs that pay more than your office job 📱 #Shorts #RemoteWork"`,
    forbiddenPatterns: [
      "More than 150 characters total (including hashtags)",
      "Long sentences or paragraphs",
      "Numbered lists or structured content",
      "Multiple hooks mashed together in one output",
    ],
  },
};

const TONE_INSTRUCTIONS: Record<string, string> = {
  professional: "Serious and expert. Use real numbers, facts, and clear insights. Sound like someone who knows their stuff.",
  casual: "Chill and relaxed. Talk like you're explaining it to a friend over coffee. Use simple words, everyday language.",
  humorous: "Funny and entertaining. Make people laugh or smile while still delivering value. Light and playful.",
  inspirational: "Motivating and hype. Make people feel pumped up and ready to take action. Uplifting energy.",
  provocative: "Bold and controversial. Say what others won't. Challenge the norm, stir debate, take a strong stand.",
  educational: "Clear and helpful. Break things down step by step so anyone can understand. Teach, don't lecture.",
};

/* ------------------------------------------------------------------ */
/*  AI generation                                                      */
/* ------------------------------------------------------------------ */

async function generateWithAI(prompt: string): Promise<string> {
  const ZAI = (await import("z-ai-web-dev-sdk")).default;
  const zai = await ZAI.create();

  const completion = await zai.chat.completions.create({
    messages: [
      {
        role: "assistant",
        content: `You are PostPilot, the world's best social media content strategist. You have 15 years of experience helping brands go viral. You understand each platform's algorithm, culture, and content format at an expert level. Your content never feels AI-generated — it feels like it was written by a top-tier creator who genuinely lives and breathes that platform. You NEVER violate platform-specific format rules.`,
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

/* ------------------------------------------------------------------ */
/*  Prompt builder — now with platform-specific DNA                     */
/* ------------------------------------------------------------------ */

function buildPrompt(req: GenerateRequest): string {
  const profile = PLATFORM_PROFILES[req.platform] || PLATFORM_PROFILES.twitter;
  const toneGuide = TONE_INSTRUCTIONS[req.tone] || TONE_INSTRUCTIONS.casual;

  const brandVoiceSection = req.brandVoice
    ? `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nBRAND VOICE (MATCH THIS STYLE):\n${req.brandVoice}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nEvery post MUST sound like it was written by this brand/person. Match their vocabulary, sentence structure, humor style, and overall energy. Do NOT ignore this section.`
    : "";

  const repurposeSection = req.mode === 'repurpose'
    ? `\n\nCONTENT REPURPOSING MODE:\nThe user has provided an existing piece of content (article, transcript, etc.). Your job is to extract the KEY IDEAS, INSIGHTS, and VALUE from this source content and create entirely NEW social media posts from it. Do NOT simply copy or rephrase the original. Extract the core messages and create fresh, engaging posts that stand on their own.\n\nSOURCE CONTENT TO REPURPOSE:\n${req.topic}`
    : `\nGenerate exactly ${req.count} unique, high-engagement ${profile.contentType}s about: "${req.topic}"`;

  return `${repurposeSection}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PLATFORM: ${req.platform.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TONE: ${toneGuide}
${brandVoiceSection}
MAX LENGTH: ${profile.maxChars} characters per post (STRICT — every post MUST be under this limit)

CONTENT STRUCTURE RULES:
${profile.structureRules}

HASHTAG RULES:
${profile.hashtagRule}

PERFECT EXAMPLE:
${profile.formatExample}

FORBIDDEN (will result in bad output):
${profile.forbiddenPatterns.map((p, i) => `${i + 1}. ${p}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GENERATION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Generate exactly ${req.count} separate posts. Each is a COMPLETE, FINISHED piece of content.
2. Each post MUST have a fundamentally different angle, hook, and structure — no two should feel similar.
3. Follow the platform format rules ABOVE ALL ELSE. Platform-native or nothing.
4. Every post must feel human-written — varied sentence lengths, natural word choice, no robotic patterns.
5. Every post must deliver real value or trigger real emotion — no filler, no generic fluff.
6. Respect the character limit STRICTLY. Shorter is better than exceeding it.

OUTPUT FORMAT (CRITICAL):
Output ONLY the posts separated by exactly this delimiter on its own line:
---POST---
No numbers. No labels. No titles. No intro text. No outro text. Just the posts.
The VERY FIRST character of your response must be the start of Post #1.`;
}

/* ------------------------------------------------------------------ */
/*  Prompt enhancer — turns simple topics into detailed prompts        */
/* ------------------------------------------------------------------ */

function buildEnhancePrompt(topic: string): string {
  return `You are a prompt engineering expert. Take this simple topic or content and rewrite it into a detailed, specific, context-rich version that will produce much better AI-generated social media content.

ORIGINAL INPUT:
"${topic}"

Your enhanced version should:
1. Add specific angles, context, and target audience details
2. Include 2-3 specific sub-topics or talking points
3. Make it vivid and specific rather than generic
4. Keep it concise (2-4 sentences max)
5. DO NOT add quotes around the output
6. Output ONLY the enhanced text, nothing else

EXAMPLE:
Input: "marketing tips"
Output: "5 counterintuitive marketing strategies that helped small SaaS startups grow from 0 to 10K users in 6 months, including specific tactics for LinkedIn content marketing, Twitter engagement threads, and email funnel optimization for B2B"

Now enhance the user's input:`;
}

/* ------------------------------------------------------------------ */
/*  Post parser — multi-strategy with length validation                */
/* ------------------------------------------------------------------ */

function parsePosts(raw: string, platform: string): string[] {
  const profile = PLATFORM_PROFILES[platform] || PLATFORM_PROFILES.twitter;
  let posts: string[] = [];

  // Pre-clean: strip trailing incomplete delimiter artifacts at the very end
  if (raw.endsWith("POST---")) {
    raw = raw.slice(0, -8).trim();
  }

  // Strategy 1: Primary delimiter (most reliable)
  if (raw.includes("---POST---")) {
    posts = raw.split("---POST---").map((p) => p.trim()).filter((p) => p.length > 15);
  }

  // Strategy 2: Numbered list pattern (1. 2. 3. etc.)
  if (posts.length <= 1) {
    const numbered = raw
      .split(/(?:^|\n)\s*\d+[\.\)]\s+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 15);
    if (numbered.length > posts.length) posts = numbered;
  }

  // Strategy 3: Split by hashtag clusters (works for short AND long platforms)
  if (posts.length <= 1) {
    const hashSplit = raw
      .split(/\n\s*\n(?=#)/)
      .map((p) => p.trim())
      .filter((p) => p.length > 20);
    if (hashSplit.length > posts.length) posts = hashSplit;
  }

  // Strategy 4: For long platforms, split by repeated "Post #N" labels
  if (posts.length <= 1) {
    const labelSplit = raw
      .split(/(?:(?:^|\n)\s*(?:Post|POST)\s*#\d+[\s:\-]*)/i)
      .map((p) => p.trim())
      .filter((p) => p.length > 50);
    if (labelSplit.length > posts.length) posts = labelSplit;
  }

  // Smart split: for ANY platform, if a post is way over maxChars,
  // it likely contains multiple posts merged. Split at natural boundaries.
  {
    const expanded: string[] = [];
    for (const post of posts) {
      if (post.length > profile.maxChars * 1.1) {
        let chunks: string[] = [];

        // Strategy A: Split at double-newline + hashtag (good for IG, YT)
        chunks = post.split(/\n\n(?=#)/).map((c) => c.trim()).filter((c) => c.length > 15);

        // Strategy B: Split at double-newline + emoji/numbered header
        if (chunks.length <= 1) {
          chunks = post.split(/\n\s*\n(?=[\d#\-*])/).map((c) => c.trim()).filter((c) => c.length > 15);
        }

        // Strategy C: Split at "Post #N" labels within the merged block
        if (chunks.length <= 1) {
          chunks = post.split(/(?:^|\n)\s*Post\s*#\d+[\s:\-]*/i).map((c) => c.trim()).filter((c) => c.length > 50);
        }

        // Strategy D: For very long posts, try double newline boundaries
        if (chunks.length <= 1 && post.length > profile.maxChars * 1.5) {
          chunks = post.split(/\n\s*\n/).map((c) => c.trim()).filter((c) => c.length > 100);
        }

        if (chunks.length > 1) {
          expanded.push(...chunks);
        } else {
          expanded.push(post);
        }
      } else {
        expanded.push(post);
      }
    }
    posts = expanded;
  }

  // Clean each post
  posts = posts.map((p) =>
    p
      .replace(/^\s*Post\s*\d+[\s:\-]*/i, "")
      .replace(/^\s*[-—]{2,}\s*/gm, "")
      .replace(/^\s*#{1,}\s*Post\s*\d+/i, "")
      .trim()
  );

  // Filter out posts that are clearly too short or too long for the platform
  posts = posts.filter((p) => {
    if (p.length < 15) return false;
    if (p.length > profile.maxChars * 1.5) return false;
    return true;
  });

  return posts;
}

/* ------------------------------------------------------------------ */
/*  Rate limiter — database-backed for production                       */
/* ------------------------------------------------------------------ */

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60_000; // 1 minute

async function isRateLimited(ip: string): Promise<boolean> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW);
  const recentCount = await db.rateLimitLog.count({
    where: {
      ip,
      createdAt: { gte: since },
    },
  });
  return recentCount >= RATE_LIMIT_MAX;
}

async function logRateLimit(ip: string): Promise<void> {
  await db.rateLimitLog.create({ data: { ip } }).catch(() => {});
}

/* ------------------------------------------------------------------ */
/*  Credit check — deduct generation credit                            */
/* ------------------------------------------------------------------ */

async function checkCredits(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { allowed: true, remaining: 50 };

  const remaining = user.creditsLimit - user.creditsUsed;
  return { allowed: remaining > 0, remaining };
}

/* ------------------------------------------------------------------ */
/*  API Route                                                          */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    // Rate limiting by IP (database-backed)
    if (await isRateLimited(ip)) {
      await logRateLimit(ip);
      return NextResponse.json(
        { error: "Rate limit reached. Please wait a moment before generating more posts." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { topic, platform, tone, count, mode, brandVoice, userId } = body as GenerateRequest;

    if (!topic || topic.trim().length < 3) {
      return NextResponse.json({ error: "Please provide a topic (at least 3 characters)" }, { status: 400 });
    }

    // ENHANCE MODE — just return an enhanced prompt, don't generate posts
    if (mode === "enhance") {
      const enhancePrompt = buildEnhancePrompt(topic.trim());
      const enhanced = await generateWithAI(enhancePrompt);
      return NextResponse.json({
        success: true,
        enhanced: enhanced.trim().replace(/^["']|["']$/g, ""),
      });
    }

    // Credit check for authenticated users
    if (userId) {
      const creditCheck = await checkCredits(userId);
      if (!creditCheck.allowed) {
        return NextResponse.json(
          { error: "Generation limit reached. Upgrade your plan for more credits.", creditsRemaining: 0 },
          { status: 403 }
        );
      }
    }

    const validPlatforms = Object.keys(PLATFORM_PROFILES);
    if (!platform || !validPlatforms.includes(platform)) {
      return NextResponse.json({ error: `Invalid platform. Choose from: ${validPlatforms.join(", ")}` }, { status: 400 });
    }

    const validTones = Object.keys(TONE_INSTRUCTIONS);
    if (!tone || !validTones.includes(tone)) {
      return NextResponse.json({ error: `Invalid tone. Choose from: ${validTones.join(", ")}` }, { status: 400 });
    }

    const postCount = Math.min(Math.max(count || 3, 1), 10);
    const prompt = buildPrompt({ topic, platform, tone, count: postCount, mode: mode || "generate", brandVoice, userId });

    const rawContent = await generateWithAI(prompt);
    const posts = parsePosts(rawContent, platform);

    if (posts.length === 0) {
      return NextResponse.json({ error: "Failed to parse generated content. Please try again." }, { status: 500 });
    }

    // Log generation to database (fire-and-forget)
    db.generation.create({
      data: {
        userId: userId || null,
        topic: topic.trim(),
        platform,
        tone,
        postCount,
        postsGenerated: posts.length,
        mode: mode || "generate",
        postsJson: JSON.stringify(posts),
        ip,
      },
    }).then(() => {
      // Increment user credits
      if (userId) {
        db.user.update({
          where: { id: userId },
          data: { creditsUsed: { increment: 1 } },
        }).catch(() => {});
      }
    }).catch(() => {});

    // Get remaining credits for response
    let creditsRemaining: number | undefined;
    if (userId) {
      const creditCheck = await checkCredits(userId);
      creditsRemaining = creditCheck.remaining;
    }

    return NextResponse.json({
      success: true,
      posts,
      platform,
      topic,
      tone,
      generatedAt: new Date().toISOString(),
      creditsRemaining,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json({ error: "Internal server error. Please try again later." }, { status: 500 });
  }
}
