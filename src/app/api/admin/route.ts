import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  PUT — Log a generation to the database                              */
/* ------------------------------------------------------------------ */

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, topic, platform, tone, count, postsGenerated, mode, ip, posts } = body;

    await db.generation.create({
      data: {
        userId: userId || null,
        topic: topic || "",
        platform: platform || "unknown",
        tone: tone || "unknown",
        postCount: count || 1,
        postsGenerated: postsGenerated || 0,
        mode: mode || "generate",
        postsJson: posts ? JSON.stringify(posts) : null,
        ip: ip || "unknown",
      },
    });

    // Update user credits if userId provided
    if (userId) {
      await db.user.update({
        where: { id: userId },
        data: { creditsUsed: { increment: 1 } },
      }).catch(() => { /* user might not exist yet */ });
    }

    // Update total generations metric
    await db.systemMetric.upsert({
      where: { metric: "totalGenerations" },
      update: { value: (await getTotalGenerations() + 1).toString() },
      create: { metric: "totalGenerations", value: "1" },
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin PUT error:", error);
    return NextResponse.json({ error: "Failed to log generation" }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  POST — Log rate limited requests                                    */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, value, ip } = body;

    if (type === "rate_limited") {
      await db.rateLimitLog.create({
        data: { ip: ip || "unknown" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin POST error:", error);
    return NextResponse.json({ error: "Failed to update stat" }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  GET — Full admin stats dashboard                                    */
/* ------------------------------------------------------------------ */

export async function GET() {
  try {
    const [
      totalGenerations,
      platformBreakdown,
      toneBreakdown,
      modeBreakdown,
      recentGenerations,
      rateLimitedCount,
      userStats,
      uptimeStart,
    ] = await Promise.all([
      getTotalGenerations(),
      getPlatformBreakdown(),
      getToneBreakdown(),
      getModeBreakdown(),
      getRecentGenerations(20),
      getRateLimitedCount(),
      getUserStats(),
      getUptimeStart(),
    ]);

    return NextResponse.json({
      totalGenerations,
      totalPostsGenerated: await getTotalPostsGenerated(),
      generationsByPlatform: platformBreakdown,
      generationsByTone: toneBreakdown,
      generationsByMode: modeBreakdown,
      rateLimitedRequests: rateLimitedCount,
      recentGenerations,
      uptime: uptimeStart
        ? Math.floor((Date.now() - uptimeStart.getTime()) / 1000)
        : 0,
      users: userStats,
    });
  } catch (error) {
    console.error("Admin GET error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  Helper functions                                                    */
/* ------------------------------------------------------------------ */

async function getTotalGenerations(): Promise<number> {
  return db.generation.count();
}

async function getTotalPostsGenerated(): Promise<number> {
  const result = await db.generation.aggregate({ _sum: { postsGenerated: true } });
  return result._sum.postsGenerated || 0;
}

async function getPlatformBreakdown(): Promise<Record<string, number>> {
  const records = await db.generation.groupBy({
    by: ["platform"],
    _count: { id: true },
  });
  const breakdown: Record<string, number> = {};
  for (const r of records) {
    breakdown[r.platform] = r._count.id;
  }
  return breakdown;
}

async function getToneBreakdown(): Promise<Record<string, number>> {
  const records = await db.generation.groupBy({
    by: ["tone"],
    _count: { id: true },
  });
  const breakdown: Record<string, number> = {};
  for (const r of records) {
    breakdown[r.tone] = r._count.id;
  }
  return breakdown;
}

async function getModeBreakdown(): Promise<Record<string, number>> {
  const records = await db.generation.groupBy({
    by: ["mode"],
    _count: { id: true },
  });
  const breakdown: Record<string, number> = {};
  for (const r of records) {
    breakdown[r.mode] = r._count.id;
  }
  return breakdown;
}

async function getRecentGenerations(limit: number) {
  return db.generation.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      topic: true,
      platform: true,
      tone: true,
      postCount: true,
      postsGenerated: true,
      mode: true,
      createdAt: true,
      ip: true,
    },
  });
}

async function getRateLimitedCount(): Promise<number> {
  // Count rate limited requests in the last 24 hours
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return db.rateLimitLog.count({ where: { createdAt: { gte: since } } });
}

async function getUserStats() {
  const totalUsers = await db.user.count();
  const admins = await db.user.count({ where: { role: "admin" } });
  const recentUsers = await db.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, creditsUsed: true, creditsLimit: true, createdAt: true },
  });
  return { totalUsers, admins, recentUsers };
}

async function getUptimeStart(): Promise<Date | null> {
  const metric = await db.systemMetric.findUnique({
    where: { metric: "uptimeStart" },
  });
  return metric ? new Date(metric.value) : null;
}
