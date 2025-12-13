// Floor 1 Locations - Map Pin Based System
// 9 Locations: 1 Main Town, 7 Hunting Areas, 1 Boss Area

export interface MapLocation {
  id: string
  name: string
  type: 'town' | 'hunting' | 'boss'
  description: string
  // Position on map (percentage based for responsive)
  x: number // 0-100
  y: number // 0-100
  // Pin color based on type
  pinColor: string
  // Navigation
  href: string
  // Is it discovered by player?
  discovered: boolean
}

export const FLOOR_1_LOCATIONS: MapLocation[] = [
  // ============================================
  // MAIN TOWN (Safe Zone)
  // ============================================
  {
    id: 'havens-rest',
    name: "Haven's Rest",
    type: 'town',
    description: 'A peaceful sanctuary where adventurers gather to rest, trade, and prepare for their journeys into the wilds.',
    x: 15,
    y: 65,
    pinColor: '#3b82f6', // Blue
    href: '/floor/1/town',
    discovered: true,
  },

  // ============================================
  // HUNTING AREAS (7 total)
  // ============================================
  {
    id: 'emerald-meadows',
    name: 'Emerald Meadows',
    type: 'hunting',
    description: 'Rolling green hills dotted with wildflowers. Gentle creatures roam freely, perfect for new adventurers.',
    x: 30,
    y: 75,
    pinColor: '#22c55e', // Green
    href: '/floor/1/area/emerald-meadows',
    discovered: true,
  },
  {
    id: 'whispering-woods',
    name: 'Whispering Woods',
    type: 'hunting',
    description: 'An ancient forest where the wind carries secrets through the leaves. Wolves and boars lurk in the shadows.',
    x: 45,
    y: 55,
    pinColor: '#22c55e', // Green
    href: '/floor/1/area/whispering-woods',
    discovered: true,
  },
  {
    id: 'sunken-hollow',
    name: 'Sunken Hollow',
    type: 'hunting',
    description: 'A network of damp caves carved by underground rivers. Bats swarm the ceilings while goblins scheme below.',
    x: 25,
    y: 40,
    pinColor: '#eab308', // Yellow
    href: '/floor/1/area/sunken-hollow',
    discovered: true,
  },
  {
    id: 'crimson-ridge',
    name: 'Crimson Ridge',
    type: 'hunting',
    description: 'Jagged red rocks rise from the earth like broken teeth. Bandits have made this treacherous terrain their hideout.',
    x: 60,
    y: 35,
    pinColor: '#eab308', // Yellow
    href: '/floor/1/area/crimson-ridge',
    discovered: true,
  },
  {
    id: 'thornveil-thicket',
    name: 'Thornveil Thicket',
    type: 'hunting',
    description: 'A dense tangle of thorny vines and twisted trees. Giant spiders weave their webs between the branches.',
    x: 75,
    y: 50,
    pinColor: '#f97316', // Orange
    href: '/floor/1/area/thornveil-thicket',
    discovered: true,
  },
  {
    id: 'ashen-wastes',
    name: 'Ashen Wastes',
    type: 'hunting',
    description: 'A desolate land scorched by ancient fires. The restless dead wander these cursed grounds seeking vengeance.',
    x: 55,
    y: 70,
    pinColor: '#f97316', // Orange
    href: '/floor/1/area/ashen-wastes',
    discovered: true,
  },
  {
    id: 'frostbite-caverns',
    name: 'Frostbite Caverns',
    type: 'hunting',
    description: 'Frozen caves where breath turns to ice. Yetis guard their territory with primal fury against all intruders.',
    x: 85,
    y: 25,
    pinColor: '#ef4444', // Red
    href: '/floor/1/area/frostbite-caverns',
    discovered: true,
  },

  // ============================================
  // BOSS AREA
  // ============================================
  {
    id: 'illfangs-lair',
    name: "Illfang's Lair",
    type: 'boss',
    description: 'The fortress of Illfang the Kobold Lord. Only the bravest dare challenge the master of Floor 1.',
    x: 50,
    y: 15,
    pinColor: '#a855f7', // Purple
    href: '/floor/1/boss',
    discovered: true,
  },
]

// Type colors for legend and styling
export const LOCATION_TYPE_CONFIG = {
  town: {
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.2)',
    label: '🏘️ Safe Zone',
    textClass: 'text-blue-400',
  },
  hunting: {
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.2)',
    label: '⚔️ Hunting Ground',
    textClass: 'text-green-400',
  },
  boss: {
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.2)',
    label: '💀 Boss Area',
    textClass: 'text-purple-400',
  },
}
