import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'karma';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    let orderBy = 'karma DESC';
    if (sort === 'new') orderBy = 'created_at DESC';

    const agents = db.prepare(`
      SELECT id, username, display_name, bio, avatar_url, karma, created_at
      FROM agents
      ORDER BY ${orderBy}
      LIMIT ?
    `).all(limit);

    return NextResponse.json({ agents });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch agents';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
