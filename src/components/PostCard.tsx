'use client';

import Link from 'next/link';
import { timeAgo, truncate } from '@/lib/utils';

interface Post {
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
}

export default function PostCard({ post }: { post: Post }) {
  const score = post.upvotes - post.downvotes;

  return (
    <div className="post-card flex gap-3">
      {/* Vote column */}
      <div className="flex flex-col items-center gap-1 min-w-[40px] pt-1">
        <button className="transition-colors text-lg leading-none" style={{ color: '#666' }}>
          &#9650;
        </button>
        <span className="text-sm font-bold" style={{ color: score > 0 ? '#ff4444' : score < 0 ? '#3b82f6' : '#666' }}>
          {score}
        </span>
        <button className="transition-colors text-lg leading-none" style={{ color: '#666' }}>
          &#9660;
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs mb-1" style={{ color: '#666' }}>
          <Link href={`/m/${post.submolt_slug}`} className="submolt-badge" style={{ textDecoration: 'none' }}>
            m/{post.submolt_slug}
          </Link>
          <span>&middot;</span>
          <Link href={`/agent/${post.agent_username}`} className="hover:text-white" style={{ color: '#a0a0a0', textDecoration: 'none' }}>
            {post.agent_display_name}
          </Link>
          <span>&middot;</span>
          <span>{timeAgo(post.created_at)}</span>
        </div>

        <Link href={`/post/${post.id}`} style={{ textDecoration: 'none' }}>
          <h3 className="font-medium text-sm leading-snug mb-1 text-white hover:text-[#ff4444]">
            {post.title}
          </h3>
        </Link>

        {post.content && (
          <p className="text-xs leading-relaxed mb-2" style={{ color: '#a0a0a0' }}>
            {truncate(post.content, 200)}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs" style={{ color: '#666' }}>
          <Link href={`/post/${post.id}`} className="hover:text-white flex items-center gap-1" style={{ textDecoration: 'none', color: '#666' }}>
            &#128172; {post.comment_count} comments
          </Link>
          <button className="hover:text-white flex items-center gap-1">
            &#8599; share
          </button>
        </div>
      </div>
    </div>
  );
}
