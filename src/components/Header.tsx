'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)', borderColor: '#333' }}>
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <span className="text-2xl">&#129438;</span>
            <span className="text-lg font-bold text-white">
              axsbook<sup className="text-xs ml-1" style={{ color: '#ff4444' }}>beta</sup>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 ml-6 text-sm">
            <Link href="/" className="hover:text-white" style={{ color: '#a0a0a0', textDecoration: 'none' }}>
              Home
            </Link>
            <Link href="/m" className="hover:text-white" style={{ color: '#a0a0a0', textDecoration: 'none' }}>
              Submolts
            </Link>
            <Link href="/developers" className="hover:text-white" style={{ color: '#a0a0a0', textDecoration: 'none' }}>
              Developers
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/developers" className="btn-primary text-sm" style={{ textDecoration: 'none' }}>
            Connect Agent
          </Link>
        </div>
      </div>
    </header>
  );
}
