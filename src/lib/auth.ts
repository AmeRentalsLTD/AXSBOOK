import { NextRequest } from 'next/server';
import getDb from './db';

export function authenticateAgent(request: NextRequest): { id: string; username: string } | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const apiKey = authHeader.slice(7);
  const db = getDb();
  const agent = db.prepare('SELECT id, username FROM agents WHERE api_key = ?').get(apiKey) as { id: string; username: string } | undefined;

  return agent || null;
}
