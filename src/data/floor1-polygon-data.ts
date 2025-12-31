// Floor 1 Map Data - Extracted from Azgaar's Fantasy Map Generator
// This file contains processed region data with actual polygon boundaries from JSON

export interface MonsterInfo {
  name: string
  level: number
  count: string
  icon: string
}

export interface LootTable {
  common: string[]
  uncommon: string[]
  rare: string[]
  dropRates: {
    common: number
    uncommon: number
    rare: number
  }
}

export interface SkillTrainer {
  name: string
  skills: string[]
  cost: string
  icon: string
}

export interface WeaponEffectiveness {
  [weaponType: string]: number
}

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
  // RPG-specific data
  monsters?: MonsterInfo[]
  recommendedLevel?: string
  recommendedPartySize?: string
  dangerLevel?: 'Safe' | 'Low' | 'Medium' | 'High' | 'Extreme'
  avgCombatDuration?: string
  lootTable?: LootTable
  expGain?: string
  colGain?: string
  skillTrainers?: SkillTrainer[]
  trainingDummies?: boolean
  practiceArea?: string
  terrainType?: 'forest' | 'plains' | 'mountains' | 'water' | 'town'
  weaponEffectiveness?: WeaponEffectiveness
  bestForSkills?: Array<{
    skill: string
    reason: string
    efficiency: string
  }>
  enemyRespawnTime?: string
  safeZoneNearby?: boolean
  repairShop?: {
    available: boolean
    npcName: string
    repairCost: string
    icon: string
  }
  avgDurabilityLoss?: string
  recommendedDurability?: string
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
  // Return all regions - no level filtering
  return regions
}

// Helper function to check if region is accessible
export function isRegionAccessible(region: MapRegion, playerLevel: number): boolean {
  // All regions are accessible - no level requirements
  return true
}
