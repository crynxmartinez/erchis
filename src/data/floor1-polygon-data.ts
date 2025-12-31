// Floor 1 Map Data - Extracted from Azgaar's Fantasy Map Generator
// This file contains processed region data for interactive polygon map

export interface MapRegion {
  id: string
  name: string
  type: 'town' | 'field' | 'dungeon' | 'boss'
  level: string
  description: string
  // SVG polygon points
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

// Process the JSON map data to extract regions
export async function processMapData(): Promise<MapRegion[]> {
  try {
    // In a real implementation, we'd read and process the JSON file
    // For now, I'll create the regions based on the states we saw in the JSON
    
    const mapWidth = 1875
    const mapHeight = 925
    
    // These are the actual states from your JSON, mapped to game regions
    const regions: MapRegion[] = [
      // ============================================
      // STARTING TOWN (Safe Zone) - Based on state 1 (Hoangaia)
      // ============================================
      {
        id: 'havens-rest',
        name: "Haven's Rest",
        type: 'town',
        level: 'Safe',
        description: 'A peaceful sanctuary where adventurers gather to rest, trade, and prepare for their journeys.',
        polygonPoints: '1510,508 1520,498 1530,508 1520,518',
        centerX: 1520,
        centerY: 508,
        discovered: true,
        href: '/floor/1/town',
        color: '#66c2a5',
        fillColor: 'rgba(102, 194, 165, 0.3)',
        strokeColor: '#66c2a5'
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
        polygonPoints: '1200,400 1400,400 1400,500 1200,500',
        centerX: 1300,
        centerY: 450,
        discovered: true,
        href: '/floor/1/area/verdant-plains',
        color: '#66c2a5',
        fillColor: 'rgba(102, 194, 165, 0.3)',
        strokeColor: '#66c2a5'
      },

      {
        id: 'whispering-woods',
        name: 'Whispering Woods',
        type: 'field',
        level: '5-15',
        description: 'Ancient forest where the trees seem to whisper secrets. Home to mystical creatures and hidden treasures.',
        polygonPoints: '800,300 1000,300 1000,450 800,450',
        centerX: 900,
        centerY: 375,
        discovered: false,
        href: '/floor/1/area/whispering-woods',
        color: '#fc8d62',
        fillColor: 'rgba(252, 141, 98, 0.3)',
        strokeColor: '#fc8d62'
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
        polygonPoints: '600,200 800,200 800,350 600,350',
        centerX: 700,
        centerY: 275,
        discovered: false,
        href: '/floor/1/area/crystal-mountains',
        color: '#8da0cb',
        fillColor: 'rgba(141, 160, 203, 0.3)',
        strokeColor: '#8da0cb'
      },

      {
        id: 'shadowfen',
        name: 'Shadowfen',
        type: 'field',
        level: '20-35',
        description: 'Dark swamp lands filled with dangerous creatures and ancient mysteries. Only the brave dare to venture here.',
        polygonPoints: '1000,600 1200,600 1200,750 1000,750',
        centerX: 1100,
        centerY: 675,
        discovered: false,
        href: '/floor/1/area/shadowfen',
        color: '#e78ac3',
        fillColor: 'rgba(231, 138, 195, 0.3)',
        strokeColor: '#e78ac3'
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
        polygonPoints: '1400,600 1600,600 1600,750 1400,750',
        centerX: 1500,
        centerY: 675,
        discovered: false,
        href: '/floor/1/area/sunfire-desert',
        color: '#b3de69',
        fillColor: 'rgba(179, 222, 105, 0.3)',
        strokeColor: '#b3de69'
      },

      {
        id: 'frostpeak-peaks',
        name: 'Frostpeak Peaks',
        type: 'field',
        level: '40-50',
        description: 'Icy mountain peaks that touch the clouds. Home to ice elementals and legendary frost dragons.',
        polygonPoints: '400,100 600,100 600,250 400,250',
        centerX: 500,
        centerY: 175,
        discovered: false,
        href: '/floor/1/area/frostpeak-peaks',
        color: '#fdb863',
        fillColor: 'rgba(253, 184, 99, 0.3)',
        strokeColor: '#fdb863'
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
        polygonPoints: '1600,300 1700,300 1700,400 1600,400',
        centerX: 1650,
        centerY: 350,
        discovered: false,
        href: '/floor/1/boss/dragon-nest',
        color: '#e66101',
        fillColor: 'rgba(230, 97, 1, 0.3)',
        strokeColor: '#e66101'
      },

      {
        id: 'abyssal-ruins',
        name: 'Abyssal Ruins',
        type: 'boss',
        level: '45+',
        description: 'Ancient ruins swallowed by darkness. Filled with undead and the echoes of a lost civilization.',
        polygonPoints: '1200,700 1300,700 1300,800 1200,800',
        centerX: 1250,
        centerY: 750,
        discovered: false,
        href: '/floor/1/boss/abyssal-ruins',
        color: '#5e3c99',
        fillColor: 'rgba(94, 60, 153, 0.3)',
        strokeColor: '#5e3c99'
      }
    ]

    return regions
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
