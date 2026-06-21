import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/calendar?userId=xxx - Get all calendar posts for a user (or all for guest)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const posts = await db.calendarPost.findMany({
      where: userId ? { userId } : {},
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error('Calendar fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch calendar posts' }, { status: 500 });
  }
}

// POST /api/calendar - Create a calendar post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, date, content, platform } = body;

    if (!date || !content || !platform) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const post = await db.calendarPost.create({
      data: { userId: userId || null, date, content, platform },
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Calendar create error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create calendar post' }, { status: 500 });
  }
}

// DELETE /api/calendar?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    await db.calendarPost.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Calendar delete error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}