'use client'

import { useState } from 'react'
import FloorMapPins from './FloorMapPins'
import SkillBar from './SkillBar'
import { MapLocation } from '@/data/floor1-locations'

interface MapWithCombatProps {
  floorId: number
  locations: MapLocation[]
  currentAp: number
}

export default function MapWithCombat({ floorId, locations, currentAp }: MapWithCombatProps) {
  const [inCombat, setInCombat] = useState(false)

  const handleExecuteTurn = async (queue: { id: string; slotIndex: number; skill: { id: string; name: string } }[]) => {
    console.log('Executing turn with queue:', queue)
    // TODO: Call /api/combat/execute
    alert(`Executing ${queue.length} actions!`)
  }

  return (
    <>
      <div className="bg-[#242424] rounded border border-[#333] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗺️</span>
            <div>
              <h1 className="text-xl font-bold text-[#6eb5ff]">Floor {floorId} Map</h1>
              <p className="text-sm text-gray-400">
                {inCombat ? '⚔️ In Combat!' : 'Exploring...'}
              </p>
            </div>
          </div>
          
          {/* Test Combat Toggle */}
          <button
            onClick={() => setInCombat(!inCombat)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              inCombat
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-[#6eb5ff] text-black hover:bg-[#8ec5ff]'
            }`}
          >
            {inCombat ? '🏃 End Combat' : '⚔️ Start Combat'}
          </button>
        </div>

        {locations.length > 0 ? (
          <FloorMapPins floorId={floorId} locations={locations} />
        ) : (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-4">🗺️</span>
            <p>Map not available for this floor yet</p>
          </div>
        )}

        <div className="mt-6 p-3 bg-[#1a1a1a] rounded border border-[#333]">
          <div className="text-xs text-gray-500">
            {inCombat ? (
              <>
                <p className="mb-1 text-yellow-400">⚔️ Combat Mode Active!</p>
                <p className="mb-1">• Click skills in the skill bar to add them to the action queue</p>
                <p className="mb-1">• Queue up to 5 actions per turn</p>
                <p>• Click ▶ to execute your turn</p>
              </>
            ) : (
              <>
                <p className="mb-1">• Hover over map pins to see location details</p>
                <p className="mb-1">• Click on a pin to travel to that location</p>
                <p>• Explore the world to discover new areas</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Skill Bar with Combat Queue */}
      <SkillBar 
        inCombat={inCombat} 
        currentAp={currentAp}
        onExecuteTurn={handleExecuteTurn}
      />
    </>
  )
}
