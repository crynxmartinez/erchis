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
    title: 'Areas',
    items: [
      { icon: '🏠', label: 'Home', href: '/dashboard' },
      { icon: '📦', label: 'Items', href: '/items' },
      { icon: '🏙️', label: 'City', href: '/city' },
      { icon: '💼', label: 'Job', href: '/job' },
      { icon: '💪', label: 'Gym', href: '/gym', highlight: true },
      { icon: '🏢', label: 'Properties', href: '/properties' },
      { icon: '📚', label: 'Education', href: '/education' },
      { icon: '🔫', label: 'Crimes', href: '/crimes', highlight: true },
      { icon: '📋', label: 'Missions', href: '/missions' },
      { icon: '📰', label: 'Newspaper', href: '/newspaper' },
      { icon: '⛓️', label: 'Jail', href: '/jail' },
      { icon: '🏥', label: 'Hospital', href: '/hospital' },
      { icon: '🎰', label: 'Casino', href: '/casino' },
      { icon: '💬', label: 'Forums', href: '/forums' },
      { icon: '🏆', label: 'Hall of Fame', href: '/hof' },
      { icon: '⚔️', label: 'Faction', href: '/faction' },
      { icon: '👥', label: 'Recruit Citizens', href: '/recruit' },
      { icon: '📅', label: 'Calendar', href: '/calendar' },
      { icon: '🎮', label: 'Elimination', href: '/elimination', highlight: true },
      { icon: '🎉', label: 'Community Events', href: '/events', highlight: true },
      { icon: '📜', label: 'Rules', href: '/rules', highlight: true },
    ],
  },
  {
    title: 'Lists',
    items: [
      { icon: '👫', label: 'Friends', href: '/friends', badge: 0 },
      { icon: '😠', label: 'Enemies', href: '/enemies', badge: 0 },
      { icon: '🎯', label: 'Targets', href: '/targets', badge: 0 },
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

      {/* Server Info */}
      <div className="px-3 py-2 text-xs text-gray-500 border-t border-[#333]">
        <div>Server: Erchis-1</div>
        <div>Wed 12:34:56 - 11/12/25</div>
      </div>
    </aside>
  )
}
