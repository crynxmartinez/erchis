'use client'

import { useState } from 'react'
import Link from 'next/link'

interface MapRegion {
  id: string
  name: string
  type: 'town' | 'field' | 'dungeon' | 'boss'
  level: string
  polygon: string
  discovered: boolean
  href: string
}

interface FloorMapProps {
  floorId: number
  regions: MapRegion[]
}

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  town: { bg: 'rgba(34, 197, 94, 0.3)', border: '#22c55e', text: 'text-green-400' },
  field: { bg: 'rgba(59, 130, 246, 0.3)', border: '#3b82f6', text: 'text-blue-400' },
  dungeon: { bg: 'rgba(168, 85, 247, 0.3)', border: '#a855f7', text: 'text-purple-400' },
  boss: { bg: 'rgba(239, 68, 68, 0.3)', border: '#ef4444', text: 'text-red-400' },
}

const TYPE_LABELS: Record<string, string> = {
  town: '🏘️ Safe Zone',
  field: '🌿 Field',
  dungeon: '🏰 Dungeon',
  boss: '💀 Boss Area',
}

export default function FloorMap({ floorId, regions }: FloorMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<MapRegion | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Map Container */}
      <div 
        className="relative overflow-hidden rounded-lg border border-[#333] shadow-xl"
        onMouseMove={handleMouseMove}
      >
        {/* Map Image */}
        <img
          src={`/maps/floor-${floorId}.jpg`}
          alt={`Floor ${floorId} Map`}
          className="w-full h-auto block select-none"
          draggable={false}
        />

        {/* SVG Overlay for Regions */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 736 736"
          preserveAspectRatio="xMidYMid slice"
        >
          {regions.map((region) => {
            const colors = TYPE_COLORS[region.type]
            const isHovered = hoveredRegion?.id === region.id
            
            return (
              <Link key={region.id} href={region.href}>
                <polygon
                  points={region.polygon}
                  fill={region.discovered ? (isHovered ? colors.bg : 'transparent') : 'rgba(0,0,0,0.7)'}
                  stroke={isHovered ? colors.border : 'transparent'}
                  strokeWidth={isHovered ? 2 : 0}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredRegion(region)}
                  onMouseLeave={() => setHoveredRegion(null)}
                />
              </Link>
            )
          })}
        </svg>

        {/* Tooltip */}
        {hoveredRegion && (
          <div
            className="absolute pointer-events-none z-50 bg-[#1a1a1a]/95 border border-[#444] rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm"
            style={{
              left: mousePos.x + 15,
              top: mousePos.y + 15,
              transform: mousePos.x > 500 ? 'translateX(-110%)' : 'none',
            }}
          >
            <div className="font-semibold text-white">{hoveredRegion.name}</div>
            <div className={`text-xs ${TYPE_COLORS[hoveredRegion.type].text}`}>
              {TYPE_LABELS[hoveredRegion.type]}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {hoveredRegion.type === 'town' ? 'Safe Zone' : `Level: ${hoveredRegion.level}`}
            </div>
            {!hoveredRegion.discovered && (
              <div className="text-xs text-red-400 mt-1">🔒 Undiscovered</div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
        {Object.entries(TYPE_LABELS).map(([type, label]) => (
          <div key={type} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded border"
              style={{ 
                backgroundColor: TYPE_COLORS[type].bg,
                borderColor: TYPE_COLORS[type].border,
              }}
            />
            <span className={TYPE_COLORS[type].text}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
