import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const voices = await db.brandVoice.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, voices });
  } catch (error) {
    console.error('Voices fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch voices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, description, systemPrompt } = body;

    if (!name || !systemPrompt) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const voice = await db.brandVoice.create({
      data: { userId: userId || null, name, description: description || '', systemPrompt },
    });

    return NextResponse.json({ success: true, voice });
  } catch (error) {
    console.error('Voice create error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create voice' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    await db.brandVoice.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Voice delete error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}