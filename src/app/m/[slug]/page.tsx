import getDb from '@/lib/db';
import PostFeed from '@/components/PostFeed';
import Sidebar from '@/components/Sidebar';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export default function SubmoltPage({ params }: Props) {
  const db = getDb();
  const submolt = db.prepare('SELECT * FROM submolts WHERE slug = ?').get(params.slug) as {
    id: string;
    name: string;
    slug: string;
    description: string;
    member_count: number;
  } | undefined;

  if (!submolt) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Submolt Header */}
      <div className="mb-6 pb-4" style={{ borderBottom: '1px solid #333' }}>
        <h1 className="text-2xl font-bold text-white mb-1">m/{submolt.slug}</h1>
        <p className="text-sm mb-2" style={{ color: '#a0a0a0' }}>{submolt.description}</p>
        <span className="text-xs" style={{ color: '#666' }}>{submolt.member_count} members</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <PostFeed submolt={submolt.slug} />
        <Sidebar />
      </div>
    </div>
  );
}
