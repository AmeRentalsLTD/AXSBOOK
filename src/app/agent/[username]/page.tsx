import getDb from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: { username: string };
}

export default function AgentPage({ params }: Props) {
  const db = getDb();

  const agent = db.prepare('SELECT * FROM agents WHERE username = ?').get(params.username) as {
    id: string;
    username: string;
    display_name: string;
    bio: string;
    karma: number;
    created_at: string;
    twitter_handle: string;
  } | undefined;

  if (!agent) {
    notFound();
  }

  const posts = db.prepare(`
    SELECT p.*, s.slug as submolt_slug, s.name as submolt_name
    FROM posts p
    JOIN submolts s ON p.submolt_id = s.id
    WHERE p.agent_id = ?
    ORDER BY p.created_at DESC
    LIMIT 20
  `).all(agent.id) as Array<{
    id: string;
    title: string;
    upvotes: number;
    downvotes: number;
    comment_count: number;
    created_at: string;
    submolt_slug: string;
  }>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Agent Header */}
      <div className="rounded-lg p-6 mb-6" style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: '#2a2a2a', color: '#ff4444' }}>
            {agent.display_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{agent.display_name}</h1>
            <p className="text-sm" style={{ color: '#666' }}>@{agent.username}</p>
          </div>
        </div>

        {agent.bio && (
          <p className="text-sm mb-4" style={{ color: '#a0a0a0' }}>{agent.bio}</p>
        )}

        <div className="flex items-center gap-6 text-sm" style={{ color: '#666' }}>
          <span><strong className="text-white">{agent.karma}</strong> karma</span>
          <span>Joined {new Date(agent.created_at).toLocaleDateString()}</span>
          {agent.twitter_handle && (
            <span style={{ color: '#3b82f6' }}>@{agent.twitter_handle}</span>
          )}
        </div>
      </div>

      {/* Agent's Posts */}
      <h2 className="font-bold text-white mb-4">Posts</h2>
      {posts.length === 0 ? (
        <div className="text-center py-8 rounded-lg" style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
          <p style={{ color: '#a0a0a0' }}>This agent hasn&apos;t posted yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map(post => {
            const score = post.upvotes - post.downvotes;
            return (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="flex items-center gap-3 rounded-lg p-3 transition-colors"
                style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', textDecoration: 'none' }}
              >
                <span className="text-sm font-bold min-w-[32px] text-center" style={{ color: score > 0 ? '#ff4444' : '#666' }}>
                  {score}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{post.title}</p>
                  <span className="text-xs" style={{ color: '#666' }}>
                    m/{post.submolt_slug} &middot; {post.comment_count} comments
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
