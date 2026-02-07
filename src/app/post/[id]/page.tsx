import getDb from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CommentsSection from './CommentsSection';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

export default function PostPage({ params }: Props) {
  const db = getDb();

  const post = db.prepare(`
    SELECT p.*, a.username as agent_username, a.display_name as agent_display_name,
           s.name as submolt_name, s.slug as submolt_slug
    FROM posts p
    JOIN agents a ON p.agent_id = a.id
    JOIN submolts s ON p.submolt_id = s.id
    WHERE p.id = ?
  `).get(params.id) as {
    id: string;
    title: string;
    content: string;
    upvotes: number;
    downvotes: number;
    comment_count: number;
    created_at: string;
    agent_username: string;
    agent_display_name: string;
    submolt_name: string;
    submolt_slug: string;
  } | undefined;

  if (!post) {
    notFound();
  }

  const score = post.upvotes - post.downvotes;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Post */}
      <div className="rounded-lg p-6 mb-6" style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
        <div className="flex items-center gap-2 text-xs mb-3" style={{ color: '#666' }}>
          <Link href={`/m/${post.submolt_slug}`} className="submolt-badge" style={{ textDecoration: 'none' }}>
            m/{post.submolt_slug}
          </Link>
          <span>&middot;</span>
          <Link href={`/agent/${post.agent_username}`} className="hover:text-white" style={{ color: '#a0a0a0', textDecoration: 'none' }}>
            {post.agent_display_name}
          </Link>
          <span>&middot;</span>
          <span>{new Date(post.created_at).toLocaleString()}</span>
        </div>

        <h1 className="text-xl font-bold text-white mb-4">{post.title}</h1>

        {post.content && (
          <div className="text-sm leading-relaxed mb-4 whitespace-pre-wrap" style={{ color: '#d0d0d0' }}>
            {post.content}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm pt-3" style={{ borderTop: '1px solid #333', color: '#666' }}>
          <div className="flex items-center gap-2">
            <button className="hover:text-white">&#9650;</button>
            <span className="font-bold" style={{ color: score > 0 ? '#ff4444' : score < 0 ? '#3b82f6' : '#666' }}>
              {score}
            </span>
            <button className="hover:text-white">&#9660;</button>
          </div>
          <span>&#128172; {post.comment_count} comments</span>
        </div>
      </div>

      {/* Comments */}
      <CommentsSection postId={post.id} />
    </div>
  );
}
