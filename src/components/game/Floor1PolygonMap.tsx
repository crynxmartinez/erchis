'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapRegion, LOCATION_TYPE_CONFIG, getRegionsByLevel, isRegionAccessible, processMapData } from '@/data/floor1-polygon-data'

interface Floor1PolygonMapProps {
  playerLevel?: number
}

export default function Floor1PolygonMap({ playerLevel = 1 }: Floor1PolygonMapProps) {
  const [regions, setRegions] = useState<MapRegion[]>([])
  const [hoveredRegion, setHoveredRegion] = useState<MapRegion | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [loading, setLoading] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const regionData = await processMapData()
        setRegions(regionData)
      } catch (error) {
        console.error('Failed to load map regions:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadRegions()
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5))
  }

  const handleResetZoom = () => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }

  // Get regions that are accessible at player's level
  const accessibleRegions = getRegionsByLevel(playerLevel, regions)

  if (loading) {
    return (
      <div className="relative w-full max-w-6xl mx-auto">
        <div className="bg-[#242424] rounded border border-[#333] p-12 text-center">
          <div className="text-gray-400">
            <span className="text-4xl block mb-4">🗺️</span>
            <p>Loading map data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Map Container */}
      <div 
        className="relative overflow-hidden rounded-lg border border-[#333] shadow-xl bg-[#1a1a1a]"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredRegion(null)}
        style={{ height: '600px' }}
      >
        {/* Map Image with Zoom */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'center',
            transition: 'transform 0.3s ease'
          }}
        >
          <img
            src="/maps/floor 1 map.png"
            alt="Floor 1 Map - Erchis"
            className="block select-none"
            draggable={false}
            style={{ 
              maxHeight: '600px', 
              objectFit: 'contain',
              width: 'auto',
              height: 'auto'
            }}
          />
        </div>

        {/* SVG Polygon Overlay with Zoom */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ 
            maxHeight: '600px',
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'center',
            transition: 'transform 0.3s ease'
          }}
          viewBox="0 0 1875 925"
          preserveAspectRatio="xMidYMid meet"
        >
          {accessibleRegions.map((region) => {
            const isHovered = hoveredRegion?.id === region.id
            const isAccessible = isRegionAccessible(region, playerLevel)
            
            return (
              <g key={region.id}>
                {/* Region Polygon */}
                <polygon
                  points={region.polygonPoints}
                  fill={isAccessible ? region.fillColor : 'rgba(100, 100, 100, 0.2)'}
                  stroke={isAccessible ? region.strokeColor : '#666'}
                  strokeWidth={isHovered ? 3 : 2}
                  opacity={isAccessible ? (isHovered ? 0.8 : 0.5) : 0.3}
                  className="pointer-events-auto cursor-pointer transition-all duration-200"
                  style={{
                    filter: isHovered ? 'brightness(1.2)' : 'brightness(1)',
                  }}
                  onMouseEnter={() => setHoveredRegion(region)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => {
                    if (isAccessible) {
                      window.location.href = region.href
                    }
                  }}
                />
                
                {/* Region Label */}
                <text
                  x={region.centerX}
                  y={region.centerY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isAccessible ? '#fff' : '#999'}
                  fontSize={14 / zoomLevel}
                  fontWeight="bold"
                  className="pointer-events-none select-none"
                  opacity={isAccessible ? 0.9 : 0.5}
                >
                  {region.name}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Tooltip */}
        {hoveredRegion && (
          <div
            className="absolute z-[100] pointer-events-none bg-[#1a1a1a]/95 border border-[#444] rounded-lg px-4 py-3 shadow-xl backdrop-blur-sm"
            style={{
              width: '280px',
              left: `${(hoveredRegion.centerX / 1875) * 100}%`,
              top: `${(hoveredRegion.centerY / 925) * 100}%`,
              transform: hoveredRegion.centerX > 1400 ? 'translateX(-100%)' : hoveredRegion.centerX < 475 ? 'translateX(0)' : 'translateX(-50%)',
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

        {/* Zoom Controls */}
        <div className="absolute right-4 top-4 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 bg-[#2a2a2a] hover:bg-[#333] border border-[#444] rounded-lg flex items-center justify-center text-white transition-colors shadow-lg"
            title="Zoom In"
            disabled={zoomLevel >= 3}
          >
            <span className="text-lg font-bold">+</span>
          </button>
          
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 bg-[#2a2a2a] hover:bg-[#333] border border-[#444] rounded-lg flex items-center justify-center text-white transition-colors shadow-lg"
            title="Zoom Out"
            disabled={zoomLevel <= 0.5}
          >
            <span className="text-lg font-bold">−</span>
          </button>
          
          <button
            onClick={handleResetZoom}
            className="w-10 h-10 bg-[#2a2a2a] hover:bg-[#333] border border-[#444] rounded-lg flex items-center justify-center text-white transition-colors shadow-lg"
            title="Reset Zoom"
          >
            <span className="text-xs font-bold">⟲</span>
          </button>
        </div>

        {/* Zoom Level Indicator */}
        <div className="absolute left-4 top-4 bg-[#2a2a2a]/90 border border-[#444] rounded px-3 py-1 text-xs text-gray-300">
          Zoom: {Math.round(zoomLevel * 100)}%
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-[#242424] rounded border border-[#333] p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Interactive Regions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(LOCATION_TYPE_CONFIG).map(([type, config]) => (
            <div key={type} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded border-2"
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
          <p>🗺️ <span className="text-gray-300">Accessible Regions: {accessibleRegions.length} / {regions.length}</span></p>
          <p className="mt-1 text-gray-500">• Use +/− buttons to zoom in/out</p>
          <p className="text-gray-500">• Hover over regions to see details</p>
          <p className="text-gray-500">• Click on accessible regions to travel</p>
          <p className="text-gray-500">• Regions unlock as you level up</p>
        </div>
      </div>
    </div>
  )
}
