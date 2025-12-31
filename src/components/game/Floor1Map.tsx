'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapRegion, LOCATION_TYPE_CONFIG, getRegionsByLevel, isRegionAccessible } from '@/data/floor1-map-data'

interface Floor1MapProps {
  playerLevel?: number
}

export default function Floor1Map({ playerLevel = 1 }: Floor1MapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<MapRegion | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  // Get regions that are accessible at player's level
  const accessibleRegions = getRegionsByLevel(playerLevel)

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Map Container */}
      <div 
        className="relative overflow-hidden rounded-lg border border-[#333] shadow-xl bg-[#1a1a1a]"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredRegion(null)}
      >
        {/* Map Image */}
        <img
          src="/maps/floor 1 map.png"
          alt="Floor 1 Map - Erchis"
          className="w-full h-auto block select-none"
          draggable={false}
          style={{ maxHeight: '600px', objectFit: 'contain' }}
        />

        {/* Location Pins Overlay */}
        <div className="absolute inset-0">
          {accessibleRegions.map((region) => {
            const isHovered = hoveredRegion?.id === region.id
            const typeConfig = LOCATION_TYPE_CONFIG[region.type]
            const isAccessible = isRegionAccessible(region, playerLevel)
            
            return (
              <Link 
                key={region.id} 
                href={isAccessible ? region.href : '#'}
                className={`absolute transform -translate-x-1/2 -translate-y-full cursor-pointer transition-all duration-200 ${
                  !isAccessible ? 'cursor-not-allowed opacity-50' : ''
                }`}
                style={{ 
                  left: `${region.x}%`, 
                  top: `${region.y}%`,
                  zIndex: isHovered ? 50 : 10,
                }}
                onMouseEnter={() => setHoveredRegion(region)}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={(e) => {
                  if (!isAccessible) {
                    e.preventDefault()
                  }
                }}
              >
                {/* Map Pin */}
                <div className={`relative ${isHovered ? 'scale-125' : 'scale-100'} transition-transform duration-200`}>
                  <div 
                    className="w-8 h-10 rounded-full border-2 flex items-center justify-center text-white font-bold shadow-lg"
                    style={{ 
                      backgroundColor: region.pinColor || typeConfig.color,
                      borderColor: typeConfig.color,
                      filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                    }}
                  >
                    📍
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Tooltip */}
        {hoveredRegion && hoveredRegion.x !== undefined && hoveredRegion.y !== undefined && (
          <div
            className="absolute z-[100] pointer-events-none bg-[#1a1a1a]/95 border border-[#444] rounded-lg px-4 py-3 shadow-xl backdrop-blur-sm"
            style={{
              width: '280px',
              left: `${hoveredRegion.x}%`,
              top: `${hoveredRegion.y + 5}%`,
              transform: hoveredRegion.x > 70 ? 'translateX(-100%)' : hoveredRegion.x < 30 ? 'translateX(0)' : 'translateX(-50%)',
            }}
          >
            {/* Location Name */}
            <div className="font-bold text-white text-lg mb-1">{hoveredRegion.name}</div>
            
            {/* Location Type */}
            <div className={`text-xs font-medium mb-2 ${LOCATION_TYPE_CONFIG[hoveredRegion.type].textClass}`}>
              {LOCATION_TYPE_CONFIG[hoveredRegion.type].label}
            </div>
            
            {/* Level Requirement */}
            <div className="text-xs text-gray-300 mb-2">
              Level: {hoveredRegion.level}
            </div>
            
            {/* Description */}
            <p className="text-sm text-gray-300 leading-relaxed mb-2">
              {hoveredRegion.description}
            </p>
            
            {/* Access Status */}
            <div className={`text-xs p-2 rounded ${
              isRegionAccessible(hoveredRegion, playerLevel) 
                ? 'bg-green-900/50 text-green-400 border border-green-700' 
                : 'bg-red-900/50 text-red-400 border border-red-700'
            }`}>
              {isRegionAccessible(hoveredRegion, playerLevel) 
                ? '✓ Click to travel here' 
                : `🔒 Requires level ${hoveredRegion.level.split('-')[0]}+`
              }
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 bg-[#242424] rounded border border-[#333] p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(LOCATION_TYPE_CONFIG).map(([type, config]) => (
            <div key={type} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border-2"
                style={{ 
                  backgroundColor: config.bgColor,
                  borderColor: config.color,
                }}
              />
              <span className={`text-xs ${config.textClass}`}>{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Player Info */}
      <div className="mt-4 bg-[#242424] rounded border border-[#333] p-3">
        <div className="text-xs text-gray-400">
          <p>📍 <span className="text-gray-300">Current Level: {playerLevel}</span></p>
          <p>🗺️ <span className="text-gray-300">Accessible Regions: {accessibleRegions.length} / {getRegionsByLevel(999).length}</span></p>
          <p className="mt-1 text-gray-500">• Hover over map pins to see location details</p>
          <p className="text-gray-500">• Click on accessible locations to travel</p>
        </div>
      </div>
    </div>
  )
}
