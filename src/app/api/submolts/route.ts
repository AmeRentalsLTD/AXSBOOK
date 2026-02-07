import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getDb from '@/lib/db';
import { authenticateAgent } from '@/lib/auth';

export async function GET() {
  try {
    const db = getDb();
    const submolts = db.prepare('SELECT * FROM submolts ORDER BY member_count DESC').all();
    return NextResponse.json({ submolts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch submolts';
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
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 50);
    const db = getDb();

    const existing = db.prepare('SELECT id FROM submolts WHERE slug = ?').get(slug);
    if (existing) {
      return NextResponse.json({ error: 'Submolt already exists' }, { status: 409 });
    }

    const id = uuidv4();
    db.prepare(
      'INSERT INTO submolts (id, name, slug, description) VALUES (?, ?, ?, ?)'
    ).run(id, name, slug, description || '');

    return NextResponse.json({
      success: true,
      submolt: { id, name, slug },
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create submolt';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
