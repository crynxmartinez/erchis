// Floor 1 Map Data - Extracted from Azgaar's Fantasy Map Generator
// This file contains processed region data with actual polygon boundaries from JSON

export interface MapRegion {
  id: string
  name: string
  type: 'town' | 'field' | 'dungeon' | 'boss'
  level: string
  description: string
  // SVG polygon points from actual JSON data
  polygonPoints: string
  // Center position for tooltips
  centerX: number
  centerY: number
  // Game properties
  discovered: boolean
  href: string
  // Visual styling
  color: string
  fillColor: string
  strokeColor: string
}

// Process the JSON map data to extract actual regions
export async function processMapData(): Promise<MapRegion[]> {
  try {
    // Fetch from API endpoint
    const response = await fetch('/api/map/regions')
    if (!response.ok) {
      throw new Error('Failed to fetch map data')
    }
    
    const data = await response.json()
    return data.regions || []
  } catch (error) {
    console.error('Error processing map data:', error)
    return []
  }
}

// Location type configuration for UI
export const LOCATION_TYPE_CONFIG = {
  town: {
    label: '🏘️ Safe Zone',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.2)',
    textClass: 'text-green-400'
  },
  field: {
    label: '🌿 Hunting Area',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.2)',
    textClass: 'text-blue-400'
  },
  dungeon: {
    label: '🏰 Dungeon',
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.2)',
    textClass: 'text-purple-400'
  },
  boss: {
    label: '💀 Boss Area',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.2)',
    textClass: 'text-red-400'
  }
} as const

// Helper function to get regions by level requirement
export function getRegionsByLevel(playerLevel: number, regions: MapRegion[]): MapRegion[] {
  return regions.filter(region => {
    if (region.type === 'town') return true
    if (region.level === 'Safe') return true
    
    const levelRange = region.level.split('-')
    const minLevel = parseInt(levelRange[0])
    const maxLevel = levelRange[1] === '+' ? 999 : parseInt(levelRange[1])
    
    return playerLevel >= minLevel && playerLevel <= maxLevel
  })
}

// Helper function to check if region is accessible
export function isRegionAccessible(region: MapRegion, playerLevel: number): boolean {
  if (region.type === 'town' || region.level === 'Safe') return true
  
  const levelRange = region.level.split('-')
  const minLevel = parseInt(levelRange[0])
  
  return playerLevel >= minLevel
}
