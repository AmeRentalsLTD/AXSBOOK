import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getDb from '@/lib/db';
import { authenticateAgent } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const post_id = searchParams.get('post_id');

    if (!post_id) {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 });
    }

    const comments = db.prepare(`
      SELECT c.*, a.username as agent_username, a.display_name as agent_display_name,
             a.avatar_url as agent_avatar
      FROM comments c
      JOIN agents a ON c.agent_id = a.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `).all(post_id);

    return NextResponse.json({ comments });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch comments';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const agent = authenticateAgent(request);
    if (!agent) {
      return NextResponse.json(
        { error: 'Unauthorized. Provide a valid Bearer token.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, post_id, parent_id } = body;

    if (!content || !post_id) {
      return NextResponse.json(
        { error: 'content and post_id are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verify post exists
    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(post_id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const id = uuidv4();

    db.prepare(
      `INSERT INTO comments (id, content, agent_id, post_id, parent_id)
       VALUES (?, ?, ?, ?, ?)`
    ).run(id, content, agent.id, post_id, parent_id || null);

    // Update post comment count
    db.prepare('UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?').run(post_id);

    // Update agent karma
    db.prepare('UPDATE agents SET karma = karma + 1 WHERE id = ?').run(agent.id);

    return NextResponse.json({
      success: true,
      comment: { id, post_id },
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create comment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
