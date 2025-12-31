// Floor 1 Map Data - Extracted from Azgaar's Fantasy Map Generator
// This file contains simplified region and location data for game integration

export interface MapRegion {
  id: string
  name: string
  type: 'town' | 'field' | 'dungeon' | 'boss'
  level: string
  description: string
  // For polygon-based regions (SVG)
  polygon?: string
  // For pin-based locations (percentage coordinates)
  x?: number // 0-100
  y?: number // 0-100
  // Game properties
  discovered: boolean
  href: string
  // Visual styling
  color: string
  pinColor?: string
}

// Main Regions based on the JSON states data
export const FLOOR_1_REGIONS: MapRegion[] = [
  // ============================================
  // STARTING TOWN (Safe Zone)
  // ============================================
  {
    id: 'havens-rest',
    name: "Haven's Rest",
    type: 'town',
    level: 'Safe',
    description: 'A peaceful sanctuary where adventurers gather to rest, trade, and prepare for their journeys.',
    x: 15,
    y: 65,
    discovered: true,
    href: '/floor/1/town',
    color: '#22c55e',
    pinColor: '#22c55e'
  },

  // ============================================
  // BEGINNER REGIONS (Levels 1-10)
  // ============================================
  {
    id: 'verdant-plains',
    name: 'Verdant Plains',
    type: 'field',
    level: '1-10',
    description: 'Lush green plains perfect for beginners. Gentle hills and scattered forests provide ideal hunting grounds.',
    x: 25,
    y: 45,
    discovered: true,
    href: '/floor/1/area/verdant-plains',
    color: '#3b82f6',
    pinColor: '#3b82f6'
  },

  {
    id: 'whispering-woods',
    name: 'Whispering Woods',
    type: 'field',
    level: '5-15',
    description: 'Ancient forest where the trees seem to whisper secrets. Home to mystical creatures and hidden treasures.',
    x: 35,
    y: 55,
    discovered: false,
    href: '/floor/1/area/whispering-woods',
    color: '#10b981',
    pinColor: '#10b981'
  },

  // ============================================
  // MID-LEVEL REGIONS (Levels 10-25)
  // ============================================
  {
    id: 'crystal-mountains',
    name: 'Crystal Mountains',
    type: 'field',
    level: '15-30',
    description: 'Mountains shimmering with magical crystals. Dangerous terrain but valuable resources for brave adventurers.',
    x: 55,
    y: 25,
    discovered: false,
    href: '/floor/1/area/crystal-mountains',
    color: '#8b5cf6',
    pinColor: '#8b5cf6'
  },

  {
    id: 'shadowfen',
    name: 'Shadowfen',
    type: 'field',
    level: '20-35',
    description: 'Dark swamp lands filled with dangerous creatures and ancient mysteries. Only the brave dare to venture here.',
    x: 70,
    y: 60,
    discovered: false,
    href: '/floor/1/area/shadowfen',
    color: '#1e40af',
    pinColor: '#1e40af'
  },

  // ============================================
  // ADVANCED REGIONS (Levels 25-50)
  // ============================================
  {
    id: 'sunfire-desert',
    name: 'Sunfire Desert',
    type: 'field',
    level: '30-45',
    description: 'Scorching desert where the sun beats endlessly. Ancient ruins and powerful beasts await those who can survive the heat.',
    x: 45,
    y: 75,
    discovered: false,
    href: '/floor/1/area/sunfire-desert',
    color: '#f97316',
    pinColor: '#f97316'
  },

  {
    id: 'frostpeak-peaks',
    name: 'Frostpeak Peaks',
    type: 'field',
    level: '40-50',
    description: 'Icy mountain peaks that touch the clouds. Home to ice elementals and legendary frost dragons.',
    x: 80,
    y: 15,
    discovered: false,
    href: '/floor/1/area/frostpeak-peaks',
    color: '#06b6d4',
    pinColor: '#06b6d4'
  },

  // ============================================
  // BOSS AREAS
  // ============================================
  {
    id: 'dragon-nest',
    name: 'Dragon\'s Nest',
    type: 'boss',
    level: '50+',
    description: 'The legendary lair of the ancient dragon who guards the floor\'s greatest treasures.',
    x: 85,
    y: 35,
    discovered: false,
    href: '/floor/1/boss/dragon-nest',
    color: '#dc2626',
    pinColor: '#dc2626'
  },

  {
    id: 'abyssal-ruins',
    name: 'Abyssal Ruins',
    type: 'boss',
    level: '45+',
    description: 'Ancient ruins swallowed by darkness. Filled with undead and the echoes of a lost civilization.',
    x: 60,
    y: 85,
    discovered: false,
    href: '/floor/1/boss/abyssal-ruins',
    color: '#7c3aed',
    pinColor: '#7c3aed'
  }
]

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
export function getRegionsByLevel(playerLevel: number): MapRegion[] {
  return FLOOR_1_REGIONS.filter(region => {
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
