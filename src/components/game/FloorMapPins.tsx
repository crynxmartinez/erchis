'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapLocation, LOCATION_TYPE_CONFIG } from '@/data/floor1-locations'

interface FloorMapPinsProps {
  floorId: number
  locations: MapLocation[]
}

// Map Pin SVG Component
function MapPin({ color, isHovered }: { color: string; isHovered: boolean }) {
  return (
    <svg 
      width="32" 
      height="40" 
      viewBox="0 0 32 40" 
      className={`transition-transform duration-200 ${isHovered ? 'scale-125' : 'scale-100'}`}
      style={{ filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
    >
      {/* Pin body */}
      <path 
        d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 24 16 24s16-15.163 16-24C32 7.163 24.837 0 16 0z" 
        fill={color}
      />
      {/* Inner circle */}
      <circle 
        cx="16" 
        cy="14" 
        r="6" 
        fill="white"
        opacity="0.9"
      />
      {/* Highlight */}
      <ellipse 
        cx="12" 
        cy="10" 
        rx="3" 
        ry="2" 
        fill="white"
        opacity="0.4"
      />
    </svg>
  )
}

export default function FloorMapPins({ floorId, locations }: FloorMapPinsProps) {
  const [hoveredLocation, setHoveredLocation] = useState<MapLocation | null>(null)

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Map Container */}
      <div className="relative overflow-hidden rounded-lg border border-[#333] shadow-xl">
        {/* Map Image */}
        <img
          src={`/maps/floor-${floorId}.jpg`}
          alt={`Floor ${floorId} Map`}
          className="w-full h-auto block select-none"
          draggable={false}
        />

        {/* Map Pins Overlay */}
        <div className="absolute inset-0">
          {locations.map((location) => {
            const isHovered = hoveredLocation?.id === location.id
            const typeConfig = LOCATION_TYPE_CONFIG[location.type]
            
            return (
              <Link 
                key={location.id} 
                href={location.href}
                className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer"
                style={{ 
                  left: `${location.x}%`, 
                  top: `${location.y}%`,
                  zIndex: isHovered ? 50 : 10,
                }}
                onMouseEnter={() => setHoveredLocation(location)}
                onMouseLeave={() => setHoveredLocation(null)}
              >
                <MapPin color={location.pinColor} isHovered={isHovered} />
              </Link>
            )
          })}
        </div>

        {/* Tooltip */}
        {hoveredLocation && (
          <div
            className="absolute z-[100] pointer-events-none bg-[#1a1a1a]/95 border border-[#444] rounded-lg px-4 py-3 shadow-xl backdrop-blur-sm max-w-xs"
            style={{
              left: `${hoveredLocation.x}%`,
              top: `${hoveredLocation.y + 5}%`,
              transform: hoveredLocation.x > 70 ? 'translateX(-100%)' : hoveredLocation.x < 30 ? 'translateX(0)' : 'translateX(-50%)',
            }}
          >
            {/* Location Name */}
            <div className="font-bold text-white text-lg mb-1">{hoveredLocation.name}</div>
            
            {/* Location Type */}
            <div className={`text-xs font-medium mb-2 ${LOCATION_TYPE_CONFIG[hoveredLocation.type].textClass}`}>
              {LOCATION_TYPE_CONFIG[hoveredLocation.type].label}
            </div>
            
            {/* Description */}
            <p className="text-sm text-gray-300 leading-relaxed">
              {hoveredLocation.description}
            </p>
            
            {/* Click hint */}
            <div className="mt-2 text-xs text-gray-500 border-t border-[#333] pt-2">
              Click to travel here
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
        {Object.entries(LOCATION_TYPE_CONFIG).map(([type, config]) => (
          <div key={type} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full border-2"
              style={{ 
                backgroundColor: config.bgColor,
                borderColor: config.color,
              }}
            />
            <span className={config.textClass}>{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
