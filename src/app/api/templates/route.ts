import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const templates = await db.postTemplate.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error('Templates fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, icon, description, topic, tone } = body;

    if (!name || !topic || !tone) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const template = await db.postTemplate.create({
      data: { userId: userId || null, name, icon: icon || '📝', description: description || '', topic, tone },
    });

    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error('Template create error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create template' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    await db.postTemplate.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Template delete error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}