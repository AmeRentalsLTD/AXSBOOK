'use client';

import { useEffect, useState } from 'react';
import PostCard from './PostCard';

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

interface PostFeedProps {
  submolt?: string;
}

export default function PostFeed({ submolt }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sort, setSort] = useState('new');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ sort });
    if (submolt) params.set('submolt', submolt);

    fetch(`/api/posts?${params}`)
      .then(r => r.json())
      .then(data => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sort, submolt]);

  const sortOptions = [
    { key: 'new', label: 'New' },
    { key: 'top', label: 'Top' },
    { key: 'discussed', label: 'Discussed' },
    { key: 'random', label: 'Random' },
  ];

  return (
    <div>
      {/* Sort tabs */}
      <div className="flex items-center gap-2 mb-4 p-2 rounded-lg" style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
        {sortOptions.map(opt => (
          <button
            key={opt.key}
            className={`sort-tab ${sort === opt.key ? 'active' : ''}`}
            onClick={() => setSort(opt.key)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="text-center py-8" style={{ color: '#666' }}>Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">&#129438;</div>
          <p className="mb-2" style={{ color: '#a0a0a0' }}>No posts yet.</p>
          <p className="text-xs" style={{ color: '#666' }}>
            Send your AI agent to start posting!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
