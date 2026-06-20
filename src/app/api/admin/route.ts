import { NextRequest, NextResponse } from "next/server";

// In-memory stats store — persists across requests in the same process
interface GenerationRecord {
  id: string;
  topic: string;
  platform: string;
  tone: string;
  count: number;
  postsGenerated: number;
  mode: string;
  timestamp: string;
  ip: string;
}

interface Stats {
  totalGenerations: number;
  totalPostsGenerated: number;
  generationsByPlatform: Record<string, number>;
  generationsByTone: Record<string, number>;
  generationsByMode: Record<string, number>;
  rateLimitedRequests: number;
  recentGenerations: GenerationRecord[];
  uptime: number;
}

// Simple in-memory store (for production, use a database)
const generationHistory: GenerationRecord[] = [];
let rateLimitedCount = 0;
const startTime = Date.now();

// This endpoint is called from the generate route to log stats
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, platform, tone, count, postsGenerated, mode, ip } = body;

    const record: GenerationRecord = {
      id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      topic: topic || "",
      platform: platform || "unknown",
      tone: tone || "unknown",
      count: count || 1,
      postsGenerated: postsGenerated || 0,
      mode: mode || "generate",
      timestamp: new Date().toISOString(),
      ip: ip || "unknown",
    };

    generationHistory.push(record);
    // Keep last 500 records only
    if (generationHistory.length > 500) {
      generationHistory.splice(0, generationHistory.length - 500);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to log generation" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, value } = body;
    if (type === "rate_limited") {
      rateLimitedCount += value || 1;
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update stat" }, { status: 500 });
  }
}

export async function GET() {
  const totalGenerations = generationHistory.length;
  const totalPostsGenerated = generationHistory.reduce((sum, g) => sum + g.postsGenerated, 0);

  const generationsByPlatform: Record<string, number> = {};
  const generationsByTone: Record<string, number> = {};
  const generationsByMode: Record<string, number> = {};

  for (const gen of generationHistory) {
    generationsByPlatform[gen.platform] = (generationsByPlatform[gen.platform] || 0) + 1;
    generationsByTone[gen.tone] = (generationsByTone[gen.tone] || 0) + 1;
    generationsByMode[gen.mode] = (generationsByMode[gen.mode] || 0) + 1;
  }

  // Last 20 generations (newest first)
  const recentGenerations = [...generationHistory].reverse().slice(0, 20);

  const stats: Stats = {
    totalGenerations,
    totalPostsGenerated,
    generationsByPlatform,
    generationsByTone,
    generationsByMode,
    rateLimitedRequests: rateLimitedCount,
    recentGenerations,
    uptime: Math.floor((Date.now() - startTime) / 1000),
  };

  return NextResponse.json(stats);
}
