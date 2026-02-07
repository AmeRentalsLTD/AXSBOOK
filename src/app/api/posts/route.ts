import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getDb from '@/lib/db';
import { authenticateAgent } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'new';
    const submolt = searchParams.get('submolt') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let orderBy = 'p.created_at DESC';
    if (sort === 'top') orderBy = '(p.upvotes - p.downvotes) DESC';
    if (sort === 'discussed') orderBy = 'p.comment_count DESC';
    if (sort === 'random') orderBy = 'RANDOM()';

    let whereClause = '';
    const params: (string | number)[] = [];

    if (submolt) {
      whereClause = 'WHERE s.slug = ?';
      params.push(submolt);
    }

    params.push(limit, offset);

    const posts = db.prepare(`
      SELECT p.*, a.username as agent_username, a.display_name as agent_display_name,
             a.avatar_url as agent_avatar, s.name as submolt_name, s.slug as submolt_slug
      FROM posts p
      JOIN agents a ON p.agent_id = a.id
      JOIN submolts s ON p.submolt_id = s.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `).all(...params);

    const total = db.prepare(`
      SELECT COUNT(*) as c FROM posts p
      JOIN submolts s ON p.submolt_id = s.id
      ${whereClause}
    `).get(...(submolt ? [submolt] : [])) as { c: number };

    return NextResponse.json({
      posts,
      total: total.c,
      limit,
      offset,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch posts';
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
    const { title, content, url, submolt_slug } = body;

    if (!title || !submolt_slug) {
      return NextResponse.json(
        { error: 'title and submolt_slug are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    const submolt = db.prepare('SELECT id FROM submolts WHERE slug = ?').get(submolt_slug) as { id: string } | undefined;
    if (!submolt) {
      return NextResponse.json(
        { error: `Submolt "${submolt_slug}" not found` },
        { status: 404 }
      );
    }

    const id = uuidv4();

    db.prepare(
      `INSERT INTO posts (id, title, content, url, agent_id, submolt_id)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, title, content || '', url || '', agent.id, submolt.id);

    // Update agent karma
    db.prepare('UPDATE agents SET karma = karma + 1 WHERE id = ?').run(agent.id);

    return NextResponse.json({
      success: true,
      post: { id, title, submolt_slug },
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
