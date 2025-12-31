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
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [lastPanOffset, setLastPanOffset] = useState({ x: 0, y: 0 })

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
    setLastPanOffset({ x: 0, y: 0 })
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)))
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 0) { // Left click only
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
      setLastPanOffset(panOffset)
    }
  }

  const handleMouseMoveMap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      const deltaX = (e.clientX - panStart.x) / zoomLevel
      const deltaY = (e.clientY - panStart.y) / zoomLevel
      setPanOffset({
        x: lastPanOffset.x + deltaX,
        y: lastPanOffset.y + deltaY
      })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsPanning(false)
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

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
        onMouseMove={(e) => {
          handleMouseMove(e)
          handleMouseMoveMap(e)
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setHoveredRegion(null)
          setIsPanning(false)
        }}
        onWheel={handleWheel}
        style={{ 
          height: '600px',
          cursor: isPanning ? 'grabbing' : 'grab'
        }}
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
            const isOtherHovered = hoveredRegion && hoveredRegion.id !== region.id
            
            return (
              <g key={region.id}>
                {/* Glow Effect Layer (only for hovered region) */}
                {isHovered && (
                  <polygon
                    points={region.polygonPoints}
                    fill="none"
                    stroke={region.strokeColor}
                    strokeWidth={8}
                    opacity={0.4}
                    className="pointer-events-none animate-pulse"
                    style={{
                      filter: `blur(8px) drop-shadow(0 0 20px ${region.color})`,
                    }}
                  />
                )}
                
                {/* Region Polygon */}
                <polygon
                  points={region.polygonPoints}
                  fill={isAccessible ? region.fillColor : 'rgba(100, 100, 100, 0.2)'}
                  stroke={isAccessible ? region.strokeColor : '#666'}
                  strokeWidth={isHovered ? 4 : 2}
                  opacity={
                    isOtherHovered 
                      ? (isAccessible ? 0.2 : 0.1)  // Dim other regions when one is hovered
                      : (isAccessible ? (isHovered ? 0.9 : 0.5) : 0.3)
                  }
                  className="pointer-events-auto cursor-pointer transition-all duration-300 ease-in-out"
                  style={{
                    filter: isHovered 
                      ? `brightness(1.3) saturate(1.2) drop-shadow(0 0 15px ${region.color})` 
                      : isOtherHovered 
                        ? 'brightness(0.7) saturate(0.8)' 
                        : 'brightness(1)',
                    transform: isHovered ? 'scale(1.01)' : 'scale(1)',
                    transformOrigin: `${region.centerX}px ${region.centerY}px`,
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
                  className="pointer-events-none select-none transition-all duration-300"
                  opacity={
                    isOtherHovered 
                      ? 0.3 
                      : (isAccessible ? (isHovered ? 1 : 0.9) : 0.5)
                  }
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 8px ${region.color})` : 'none',
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                    transformOrigin: `${region.centerX}px ${region.centerY}px`,
                  }}
                >
                  {region.name}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Enhanced Tooltip */}
        {hoveredRegion && (
          <div
            className="absolute z-[100] pointer-events-none bg-gradient-to-br from-[#1a1a1a]/98 to-[#0a0a0a]/98 border-2 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden"
            style={{
              width: hoveredRegion.type === 'town' ? '380px' : '420px',
              maxHeight: '85vh',
              left: `${(hoveredRegion.centerX / 1875) * 100}%`,
              top: `${(hoveredRegion.centerY / 925) * 100}%`,
              transform: hoveredRegion.centerX > 1400 ? 'translateX(-100%)' : hoveredRegion.centerX < 475 ? 'translateX(0)' : 'translateX(-50%)',
              borderColor: hoveredRegion.color,
              boxShadow: `0 0 30px ${hoveredRegion.color}40`
            }}
          >
            {/* Header with gradient */}
            <div className="px-4 py-3 border-b-2" style={{ 
              borderColor: hoveredRegion.color,
              background: `linear-gradient(135deg, ${hoveredRegion.color}20, transparent)`
            }}>
              <div className="font-bold text-white text-xl mb-1">{hoveredRegion.name}</div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`text-xs font-semibold px-2 py-1 rounded ${LOCATION_TYPE_CONFIG[hoveredRegion.type].textClass}`}
                  style={{ backgroundColor: LOCATION_TYPE_CONFIG[hoveredRegion.type].bgColor }}>
                  {LOCATION_TYPE_CONFIG[hoveredRegion.type].label}
                </div>
                {hoveredRegion.dangerLevel && (
                  <div className={`text-xs font-semibold px-2 py-1 rounded ${
                    hoveredRegion.dangerLevel === 'Safe' ? 'bg-green-900/50 text-green-400' :
                    hoveredRegion.dangerLevel === 'Low' ? 'bg-blue-900/50 text-blue-400' :
                    hoveredRegion.dangerLevel === 'Medium' ? 'bg-yellow-900/50 text-yellow-400' :
                    hoveredRegion.dangerLevel === 'High' ? 'bg-orange-900/50 text-orange-400' :
                    'bg-red-900/50 text-red-400'
                  }`}>
                    {hoveredRegion.dangerLevel} Danger
                  </div>
                )}
                <div className="text-xs font-semibold px-2 py-1 rounded bg-purple-900/50 text-purple-400">
                  Level {hoveredRegion.level}
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="px-4 py-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Description */}
              <p className="text-sm text-gray-300 leading-relaxed mb-3">
                {hoveredRegion.description}
              </p>

              {/* Combat Info */}
              {hoveredRegion.recommendedLevel && (
                <div className="mb-3 p-2 bg-[#0a0a0a]/50 rounded border border-[#333]">
                  <div className="text-xs font-semibold text-[#6eb5ff] mb-1">⚔️ Combat Info</div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-300">
                    <div>Recommended: Lv.{hoveredRegion.recommendedLevel}</div>
                    <div>Party: {hoveredRegion.recommendedPartySize}</div>
                    {hoveredRegion.avgCombatDuration && <div className="col-span-2">Duration: {hoveredRegion.avgCombatDuration}</div>}
                  </div>
                </div>
              )}

              {/* Monsters */}
              {hoveredRegion.monsters && hoveredRegion.monsters.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs font-semibold text-[#ff6b6b] mb-2">👾 Monsters</div>
                  <div className="space-y-1">
                    {hoveredRegion.monsters.map((monster, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-[#0a0a0a]/50 p-2 rounded border border-[#333]">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{monster.icon}</span>
                          <span className="text-gray-200">{monster.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400">Lv.{monster.level}</span>
                          <span className="text-gray-400">×{monster.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rewards */}
              {(hoveredRegion.expGain || hoveredRegion.colGain) && (
                <div className="mb-3 p-2 bg-[#0a0a0a]/50 rounded border border-[#333]">
                  <div className="text-xs font-semibold text-[#ffd700] mb-1">💰 Rewards</div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {hoveredRegion.expGain && <div className="text-blue-400">EXP: {hoveredRegion.expGain}</div>}
                    {hoveredRegion.colGain && <div className="text-yellow-400">Col: {hoveredRegion.colGain}</div>}
                  </div>
                </div>
              )}

              {/* Loot Table */}
              {hoveredRegion.lootTable && (
                <div className="mb-3">
                  <div className="text-xs font-semibold text-[#a855f7] mb-2">🎁 Loot Drops</div>
                  <div className="space-y-1">
                    {hoveredRegion.lootTable.common.length > 0 && (
                      <div className="text-xs bg-[#0a0a0a]/50 p-2 rounded border border-[#333]">
                        <div className="text-gray-400 font-semibold mb-1">Common ({hoveredRegion.lootTable.dropRates.common}%)</div>
                        <div className="text-gray-300">{hoveredRegion.lootTable.common.join(', ')}</div>
                      </div>
                    )}
                    {hoveredRegion.lootTable.uncommon.length > 0 && (
                      <div className="text-xs bg-[#0a0a0a]/50 p-2 rounded border border-[#333]">
                        <div className="text-green-400 font-semibold mb-1">Uncommon ({hoveredRegion.lootTable.dropRates.uncommon}%)</div>
                        <div className="text-gray-300">{hoveredRegion.lootTable.uncommon.join(', ')}</div>
                      </div>
                    )}
                    {hoveredRegion.lootTable.rare.length > 0 && (
                      <div className="text-xs bg-[#0a0a0a]/50 p-2 rounded border border-[#333]">
                        <div className="text-purple-400 font-semibold mb-1">Rare ({hoveredRegion.lootTable.dropRates.rare}%)</div>
                        <div className="text-gray-300">{hoveredRegion.lootTable.rare.join(', ')}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Skill Training */}
              {hoveredRegion.bestForSkills && hoveredRegion.bestForSkills.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs font-semibold text-[#4ade80] mb-2">📚 Best for Training</div>
                  <div className="space-y-1">
                    {hoveredRegion.bestForSkills.map((skill, idx) => (
                      <div key={idx} className="text-xs bg-[#0a0a0a]/50 p-2 rounded border border-[#333]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-200 font-semibold">{skill.skill}</span>
                          <span className="text-yellow-400">{skill.efficiency}</span>
                        </div>
                        <div className="text-gray-400 text-[10px]">{skill.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skill Trainers (Town) */}
              {hoveredRegion.skillTrainers && hoveredRegion.skillTrainers.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs font-semibold text-[#60a5fa] mb-2">👨‍🏫 Skill Trainers</div>
                  <div className="space-y-2">
                    {hoveredRegion.skillTrainers.map((trainer, idx) => (
                      <div key={idx} className="text-xs bg-[#0a0a0a]/50 p-2 rounded border border-[#333]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{trainer.icon}</span>
                          <span className="text-gray-200 font-semibold">{trainer.name}</span>
                        </div>
                        <div className="text-gray-400 text-[10px] mb-1">{trainer.skills.join(', ')}</div>
                        <div className="text-green-400 text-[10px]">{trainer.cost}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weapon Effectiveness */}
              {hoveredRegion.weaponEffectiveness && (
                <div className="mb-3">
                  <div className="text-xs font-semibold text-[#fb923c] mb-2">⚔️ Weapon Effectiveness</div>
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(hoveredRegion.weaponEffectiveness).map(([weapon, effectiveness]) => (
                      <div key={weapon} className="text-xs bg-[#0a0a0a]/50 p-2 rounded border border-[#333] flex items-center justify-between">
                        <span className="text-gray-300 capitalize">{weapon}</span>
                        <span className={effectiveness > 1 ? 'text-green-400' : effectiveness < 1 ? 'text-red-400' : 'text-gray-400'}>
                          {effectiveness > 1 ? '+' : ''}{((effectiveness - 1) * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              {(hoveredRegion.enemyRespawnTime || hoveredRegion.avgDurabilityLoss || hoveredRegion.repairShop) && (
                <div className="mb-3 p-2 bg-[#0a0a0a]/50 rounded border border-[#333]">
                  <div className="text-xs font-semibold text-[#94a3b8] mb-1">ℹ️ Additional Info</div>
                  <div className="space-y-1 text-xs text-gray-300">
                    {hoveredRegion.enemyRespawnTime && <div>⏱️ Respawn: {hoveredRegion.enemyRespawnTime}</div>}
                    {hoveredRegion.avgDurabilityLoss && <div>🔧 Durability Loss: {hoveredRegion.avgDurabilityLoss}</div>}
                    {hoveredRegion.safeZoneNearby !== undefined && (
                      <div>{hoveredRegion.safeZoneNearby ? '🏘️ Safe Zone Nearby' : '⚠️ No Safe Zone Nearby'}</div>
                    )}
                    {hoveredRegion.repairShop?.available && (
                      <div>🔨 {hoveredRegion.repairShop.npcName} - {hoveredRegion.repairShop.repairCost}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Access Status */}
            <div className="px-4 py-3 border-t-2" style={{ borderColor: hoveredRegion.color }}>
              <div className={`text-xs p-2 rounded text-center font-semibold ${
                isRegionAccessible(hoveredRegion, playerLevel) 
                  ? 'bg-green-900/50 text-green-400 border border-green-700' 
                  : 'bg-red-900/50 text-red-400 border border-red-700'
              }`}>
                {isRegionAccessible(hoveredRegion, playerLevel) 
                  ? '✓ Click region to travel here' 
                  : `🔒 Requires level ${hoveredRegion.level.split('-')[0]}+`
                }
              </div>
            </div>
          </div>
        )}

        {/* Zoom Controls */}
        <div className="absolute right-4 top-4 flex flex-col gap-2 z-[200]">
          <button
            onClick={handleZoomIn}
            className="w-12 h-12 bg-[#1a1a1a] hover:bg-[#333] border-2 border-[#6eb5ff] rounded-lg flex items-center justify-center text-white transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-110"
            title="Zoom In"
            disabled={zoomLevel >= 3}
          >
            <span className="text-xl font-bold text-[#6eb5ff]">+</span>
          </button>
          
          <button
            onClick={handleZoomOut}
            className="w-12 h-12 bg-[#1a1a1a] hover:bg-[#333] border-2 border-[#6eb5ff] rounded-lg flex items-center justify-center text-white transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-110"
            title="Zoom Out"
            disabled={zoomLevel <= 0.5}
          >
            <span className="text-xl font-bold text-[#6eb5ff]">−</span>
          </button>
          
          <button
            onClick={handleResetZoom}
            className="w-12 h-12 bg-[#1a1a1a] hover:bg-[#333] border-2 border-[#6eb5ff] rounded-lg flex items-center justify-center text-white transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-110"
            title="Reset Zoom"
          >
            <span className="text-sm font-bold text-[#6eb5ff]">⟲</span>
          </button>
        </div>

        {/* Zoom Level Indicator */}
        <div className="absolute left-4 top-4 bg-[#1a1a1a]/95 border-2 border-[#6eb5ff] rounded-lg px-3 py-2 text-xs text-[#6eb5ff] font-semibold z-[200] shadow-lg">
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
