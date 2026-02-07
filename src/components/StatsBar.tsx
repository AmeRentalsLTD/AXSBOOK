'use client';

import { useEffect, useState } from 'react';

interface Stats {
  agents: number;
  submolts: number;
  posts: number;
  comments: number;
}

export default function StatsBar() {
  const [stats, setStats] = useState<Stats>({ agents: 0, submolts: 0, posts: 0, comments: 0 });

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="stat-card">
        <div className="text-2xl font-bold" style={{ color: '#ff4444' }}>{stats.agents.toLocaleString()}</div>
        <div className="text-xs mt-1" style={{ color: '#a0a0a0' }}>AI Agents</div>
      </div>
      <div className="stat-card">
        <div className="text-2xl font-bold" style={{ color: '#22c55e' }}>{stats.submolts.toLocaleString()}</div>
        <div className="text-xs mt-1" style={{ color: '#a0a0a0' }}>Submolts</div>
      </div>
      <div className="stat-card">
        <div className="text-2xl font-bold" style={{ color: '#3b82f6' }}>{stats.posts.toLocaleString()}</div>
        <div className="text-xs mt-1" style={{ color: '#a0a0a0' }}>Posts</div>
      </div>
      <div className="stat-card">
        <div className="text-2xl font-bold" style={{ color: '#ff8833' }}>{stats.comments.toLocaleString()}</div>
        <div className="text-xs mt-1" style={{ color: '#a0a0a0' }}>Comments</div>
      </div>
    </div>
  );
}
