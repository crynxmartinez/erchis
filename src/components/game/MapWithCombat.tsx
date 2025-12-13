'use client'

import FloorMapPins from './FloorMapPins'
import { MapLocation } from '@/data/floor1-locations'

interface MapWithCombatProps {
  floorId: number
  locations: MapLocation[]
  floorName?: string
}

export default function MapWithCombat({ floorId, locations, floorName }: MapWithCombatProps) {
  return (
    <div className="bg-[#242424] rounded border border-[#333] p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🗺️</span>
        <div>
          <h1 className="text-xl font-bold text-[#6eb5ff]">Floor {floorId} Map</h1>
          <p className="text-sm text-gray-400">{floorName || `Floor ${floorId}`}</p>
        </div>
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
          <p className="mb-1">• Hover over map pins to see location details</p>
          <p className="mb-1">• Click on a pin to travel to that location</p>
          <p className="mb-1">• Click skills to add them to your action queue</p>
          <p>• Queue up to 5 actions, then click ▶ to execute</p>
        </div>
      </div>
    </div>
  )
}
