'use client'

import Link from 'next/link'

interface TopNavProps {
  username: string
}

export default function TopNav({ username }: TopNavProps) {
  return (
    <header className="bg-[#1a1a1a] border-b border-[#333] h-12 flex items-center px-4 sticky top-0 z-50">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center mr-6">
        <span className="text-2xl font-bold text-[#6eb5ff] tracking-wider">ERCHIS</span>
      </Link>

      {/* Nav Links */}
      <nav className="flex items-center gap-1 text-sm">
        {['Wiki', 'Rules', 'Forums', 'Discord', 'Staff', 'Credits'].map((item) => (
          <Link
            key={item}
            href="#"
            className="px-2 py-1 text-gray-300 hover:text-white hover:bg-[#333] rounded transition-colors"
          >
            {item}
          </Link>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="flex items-center mr-4">
        <input
          type="text"
          placeholder="Search..."
          className="bg-[#2a2a2a] border border-[#444] rounded px-3 py-1 text-sm text-white placeholder-gray-500 w-40 focus:outline-none focus:border-[#6eb5ff]"
        />
      </div>

      {/* User Menu */}
      <div className="flex items-center gap-3">
        <span className="text-gray-300 text-sm">{username}</span>
        <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </header>
  )
}
