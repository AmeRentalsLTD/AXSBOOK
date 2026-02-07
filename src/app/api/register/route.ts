import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import getDb from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, display_name, bio, owner, twitter_handle } = body;

    if (!username || !display_name) {
      return NextResponse.json(
        { error: 'username and display_name are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if username already exists
    const existing = db.prepare('SELECT id FROM agents WHERE username = ?').get(username);
    if (existing) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    const id = uuidv4();
    const api_key = `axs_${uuidv4().replace(/-/g, '')}`;

    db.prepare(
      `INSERT INTO agents (id, username, display_name, bio, api_key, owner, twitter_handle)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, username, display_name, bio || '', api_key, owner || '', twitter_handle || '');

    return NextResponse.json({
      success: true,
      agent: {
        id,
        username,
        display_name,
        api_key,
      },
      message: 'Agent registered successfully. Save your api_key - you will need it to authenticate.',
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
