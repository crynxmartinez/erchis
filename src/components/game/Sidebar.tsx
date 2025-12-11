'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  maxUnlockedFloor?: number
}

export default function Sidebar({ maxUnlockedFloor = 1 }: SidebarProps) {
  const router = useRouter()
  const [selectedFloor, setSelectedFloor] = useState(1)
  const [isFloorDropdownOpen, setIsFloorDropdownOpen] = useState(false)

  // Generate array of unlocked floors
  const unlockedFloors = Array.from({ length: maxUnlockedFloor }, (_, i) => i + 1)

  const handleFloorChange = (floor: number) => {
    setSelectedFloor(floor)
    setIsFloorDropdownOpen(false)
    router.push(`/floor/${floor}`)
  }

  return (
    <aside>
      {/* Floor Section with Dropdown */}
      <div className="mb-2">
        <div className="bg-[#2a2a2a] px-3 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wide border-y border-[#333]">
          Floor
        </div>
        <div className="py-1 px-3">
          <div className="relative">
            <button
              onClick={() => setIsFloorDropdownOpen(!isFloorDropdownOpen)}
              className="w-full flex items-center justify-between bg-[#1e1e1e] border border-[#444] rounded px-3 py-2 text-sm text-gray-300 hover:border-[#6eb5ff] transition-colors"
            >
              <span className="flex items-center">
                <span className="mr-2">🏰</span>
                Floor {selectedFloor}
              </span>
              <svg 
                className={`w-4 h-4 transition-transform ${isFloorDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isFloorDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e1e1e] border border-[#444] rounded shadow-lg z-50 max-h-48 overflow-y-auto">
                {unlockedFloors.map((floor) => (
                  <button
                    key={floor}
                    onClick={() => handleFloorChange(floor)}
                    className={`w-full flex items-center px-3 py-2 text-sm transition-colors ${
                      selectedFloor === floor
                        ? 'bg-[#6eb5ff]/20 text-[#6eb5ff]'
                        : 'text-gray-300 hover:bg-[#2a2a2a]'
                    }`}
                  >
                    <span className="mr-2">🏰</span>
                    Floor {floor}
                    {selectedFloor === floor && (
                      <span className="ml-auto text-[#6eb5ff]">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main Town Link */}
          <Link
            href={`/floor/${selectedFloor}/town`}
            className="flex items-center mt-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] hover:text-white rounded transition-colors"
          >
            <span className="mr-2">🏘️</span>
            Main Town
          </Link>

          {/* Map Link */}
          <Link
            href={`/floor/${selectedFloor}/map`}
            className="flex items-center mt-1 px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] hover:text-white rounded transition-colors"
          >
            <span className="mr-2">🗺️</span>
            World Map
          </Link>
        </div>
      </div>
    </aside>
  )
}
