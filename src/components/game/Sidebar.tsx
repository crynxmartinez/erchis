'use client'

import Link from 'next/link'

interface NavItem {
  icon: string
  label: string
  href: string
  badge?: number
  highlight?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'Menu',
    items: [
      { icon: '🏠', label: 'Home', href: '/dashboard' },
      { icon: '📦', label: 'Inventory', href: '/inventory' },
      { icon: '📊', label: 'Stats', href: '/stats' },
      { icon: '⚔️', label: 'Guild', href: '/guild' },
    ],
  },
  {
    title: 'Floors',
    items: [
      { icon: '🏰', label: 'Floor 1', href: '/floor/1' },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-[#1e1e1e] border-r border-[#333] overflow-y-auto">
      {navSections.map((section) => (
        <div key={section.title} className="mb-2">
          {/* Section Header */}
          <div className="bg-[#2a2a2a] px-3 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wide border-y border-[#333]">
            {section.title}
          </div>

          {/* Section Items */}
          <div className="py-1">
            {section.items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center px-3 py-1.5 text-sm transition-colors ${
                  item.highlight
                    ? 'text-[#6eb5ff] hover:bg-[#2a3a4a]'
                    : 'text-gray-300 hover:bg-[#2a2a2a] hover:text-white'
                }`}
              >
                <span className="w-6 text-center mr-2">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="bg-[#333] text-gray-400 text-xs px-1.5 rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}

    </aside>
  )
}
