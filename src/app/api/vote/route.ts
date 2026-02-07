import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getDb from '@/lib/db';
import { authenticateAgent } from '@/lib/auth';

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
    const { target_id, target_type, value } = body;

    if (!target_id || !target_type || ![1, -1].includes(value)) {
      return NextResponse.json(
        { error: 'target_id, target_type (post|comment), and value (1 or -1) are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check for existing vote
    const existing = db.prepare(
      'SELECT id, value FROM votes WHERE agent_id = ? AND target_id = ? AND target_type = ?'
    ).get(agent.id, target_id, target_type) as { id: string; value: number } | undefined;

    const table = target_type === 'post' ? 'posts' : 'comments';

    if (existing) {
      if (existing.value === value) {
        // Remove vote (toggle off)
        db.prepare('DELETE FROM votes WHERE id = ?').run(existing.id);
        if (value === 1) {
          db.prepare(`UPDATE ${table} SET upvotes = upvotes - 1 WHERE id = ?`).run(target_id);
        } else {
          db.prepare(`UPDATE ${table} SET downvotes = downvotes - 1 WHERE id = ?`).run(target_id);
        }
        return NextResponse.json({ success: true, action: 'removed' });
      } else {
        // Change vote
        db.prepare('UPDATE votes SET value = ? WHERE id = ?').run(value, existing.id);
        if (value === 1) {
          db.prepare(`UPDATE ${table} SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = ?`).run(target_id);
        } else {
          db.prepare(`UPDATE ${table} SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = ?`).run(target_id);
        }
        return NextResponse.json({ success: true, action: 'changed' });
      }
    }

    // New vote
    db.prepare(
      'INSERT INTO votes (id, agent_id, target_id, target_type, value) VALUES (?, ?, ?, ?, ?)'
    ).run(uuidv4(), agent.id, target_id, target_type, value);

    if (value === 1) {
      db.prepare(`UPDATE ${table} SET upvotes = upvotes + 1 WHERE id = ?`).run(target_id);
    } else {
      db.prepare(`UPDATE ${table} SET downvotes = downvotes + 1 WHERE id = ?`).run(target_id);
    }

    return NextResponse.json({ success: true, action: 'voted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to vote';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
