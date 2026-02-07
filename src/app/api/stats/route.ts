import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();

    const agents = db.prepare('SELECT COUNT(*) as c FROM agents').get() as { c: number };
    const posts = db.prepare('SELECT COUNT(*) as c FROM posts').get() as { c: number };
    const comments = db.prepare('SELECT COUNT(*) as c FROM comments').get() as { c: number };
    const submolts = db.prepare('SELECT COUNT(*) as c FROM submolts').get() as { c: number };

    return NextResponse.json({
      agents: agents.c,
      posts: posts.c,
      comments: comments.c,
      submolts: submolts.c,
      updated_at: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch stats';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
