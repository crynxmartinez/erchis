import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// ============================================
// ITEM TYPES (Categories)
// ============================================

type ItemType = 'consumable' | 'material' | 'equipment' | 'key_item'

// ============================================
// ITEM CONFIGURATION
// ============================================

interface ItemTypeConfig {
  icon: string
  label: string
  rarityWeights: Record<string, number>
}

const ITEM_TYPE_CONFIGS: Record<ItemType, ItemTypeConfig> = {
  consumable: {
    icon: '🧪',
    label: 'Consumable',
    rarityWeights: { common: 40, uncommon: 30, rare: 20, epic: 8, legendary: 2 },
  },
  material: {
    icon: '🪨',
    label: 'Material',
    rarityWeights: { common: 50, uncommon: 30, rare: 15, epic: 4, legendary: 1 },
  },
  equipment: {
    icon: '⚔️',
    label: 'Equipment',
    rarityWeights: { common: 30, uncommon: 30, rare: 25, epic: 12, legendary: 3 },
  },
  key_item: {
    icon: '🔑',
    label: 'Key Item',
    rarityWeights: { common: 20, uncommon: 30, rare: 30, epic: 15, legendary: 5 },
  },
}

// ============================================
// NAME TEMPLATES
// ============================================

const CONSUMABLE_NAMES: string[] = [
  'Health Potion', 'Mana Potion', 'Stamina Elixir', 'Antidote', 'Burn Salve',
  'Frost Ward Potion', 'Strength Tonic', 'Speed Brew', 'Defense Draught', 'Focus Serum',
  'Healing Herb', 'Energy Root', 'Revive Leaf', 'Cleansing Water', 'Holy Water',
  'Fire Bomb', 'Ice Bomb', 'Thunder Bomb', 'Smoke Bomb', 'Flash Bomb',
  'Bandage', 'First Aid Kit', 'Emergency Ration', 'Trail Mix', 'Dried Meat',
  'Herbal Tea', 'Monster Bait', 'Escape Rope', 'Warp Crystal', 'Return Scroll',
  'Attack Boost', 'Defense Boost', 'Speed Boost', 'Luck Charm', 'Experience Scroll',
  'Rage Potion', 'Calm Elixir', 'Night Vision Drops', 'Breath Mint', 'Voice Amplifier',
]

const MATERIAL_NAMES: string[] = [
  'Iron Ore', 'Copper Ore', 'Silver Ore', 'Gold Ore', 'Mythril Ore',
  'Oak Wood', 'Pine Wood', 'Maple Wood', 'Ebony Wood', 'Spirit Wood',
  'Wolf Pelt', 'Bear Hide', 'Dragon Scale', 'Phoenix Feather', 'Unicorn Hair',
  'Slime Gel', 'Goblin Ear', 'Orc Tusk', 'Demon Horn', 'Angel Wing',
  'Fire Crystal', 'Ice Crystal', 'Thunder Crystal', 'Dark Crystal', 'Light Crystal',
  'Monster Bone', 'Monster Claw', 'Monster Fang', 'Monster Eye', 'Monster Heart',
  'Herb Bundle', 'Flower Petal', 'Mushroom Cap', 'Tree Sap', 'Honey',
  'Spider Silk', 'Bat Wing', 'Snake Venom', 'Scorpion Tail', 'Beetle Shell',
]

const EQUIPMENT_NAMES: string[] = [
  'Iron Sword', 'Steel Blade', 'Silver Saber', 'Gold Edge', 'Mythril Cutter',
  'Wooden Shield', 'Iron Buckler', 'Steel Guard', 'Tower Shield', 'Aegis',
  'Leather Armor', 'Chain Mail', 'Plate Armor', 'Dragon Armor', 'Holy Armor',
  'Cloth Hood', 'Leather Cap', 'Iron Helm', 'Steel Helmet', 'Crown',
  'Cloth Gloves', 'Leather Gauntlets', 'Iron Bracers', 'Steel Vambraces', 'Titan Grip',
  'Sandals', 'Leather Boots', 'Iron Greaves', 'Steel Sabatons', 'Wind Walkers',
  'Copper Ring', 'Silver Ring', 'Gold Ring', 'Platinum Ring', 'Diamond Ring',
  'Bone Necklace', 'Silver Pendant', 'Gold Amulet', 'Ruby Choker', 'Star Locket',
]

const KEY_ITEM_NAMES: string[] = [
  'Rusty Key', 'Bronze Key', 'Silver Key', 'Gold Key', 'Master Key',
  'Old Map', 'Treasure Map', 'Dungeon Map', 'World Map', 'Star Chart',
  'Guild Badge', 'Royal Seal', 'Ancient Coin', 'Mysterious Orb', 'Crystal Ball',
  'Letter of Introduction', 'Wanted Poster', 'Quest Scroll', 'Contract', 'Deed',
  'Family Photo', 'Love Letter', 'Diary Page', 'Ancient Tome', 'Forbidden Book',
  'Monster Manual', 'Herb Encyclopedia', 'Weapon Catalog', 'Armor Guide', 'Recipe Book',
  'Compass', 'Spyglass', 'Lantern', 'Rope', 'Grappling Hook',
  'Flute', 'Ocarina', 'Music Box', 'Bell', 'Whistle',
]

const NAME_POOLS: Record<ItemType, string[]> = {
  consumable: CONSUMABLE_NAMES,
  material: MATERIAL_NAMES,
  equipment: EQUIPMENT_NAMES,
  key_item: KEY_ITEM_NAMES,
}

// ============================================
// ICONS BY TYPE
// ============================================

const CONSUMABLE_ICONS = ['🧪', '💊', '🍶', '🫗', '🧴', '💉', '🩹', '🍵', '🥤', '🍷']
const MATERIAL_ICONS = ['🪨', '🪵', '💎', '🦴', '🪶', '🧬', '🌿', '🍄', '🕸️', '🐚']
const EQUIPMENT_ICONS = ['⚔️', '🗡️', '🛡️', '🏹', '🪓', '🔨', '👑', '💍', '📿', '🧤']
const KEY_ITEM_ICONS = ['🔑', '🗝️', '📜', '📖', '🗺️', '🧭', '🔮', '💎', '🏆', '🎭']

const ICON_POOLS: Record<ItemType, string[]> = {
  consumable: CONSUMABLE_ICONS,
  material: MATERIAL_ICONS,
  equipment: EQUIPMENT_ICONS,
  key_item: KEY_ITEM_ICONS,
}

// ============================================
// USE EFFECTS FOR CONSUMABLES
// ============================================

const USE_EFFECTS = ['heal', 'restore_ap', 'buff_attack', 'buff_defense', 'buff_speed', 'cure_poison', 'cure_burn', 'cure_all', 'damage', 'teleport']

// ============================================
// EQUIP SLOTS FOR EQUIPMENT
// ============================================

const EQUIP_SLOTS = ['weapon', 'shield', 'head', 'body', 'hands', 'feet', 'ring', 'necklace']

// ============================================
// HELPER FUNCTIONS
// ============================================

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getWeightedRarity(weights: Record<string, number>): string {
  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  let random = Math.random() * total
  for (const [rarity, weight] of Object.entries(weights)) {
    random -= weight
    if (random <= 0) return rarity
  }
  return 'common'
}

function getRarityMultiplier(rarity: string): number {
  const multipliers: Record<string, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2.5,
    epic: 4,
    legendary: 8,
  }
  return multipliers[rarity] || 1
}

function generateItem(itemType: ItemType, existingNames: Set<string>) {
  const config = ITEM_TYPE_CONFIGS[itemType]
  const namePool = NAME_POOLS[itemType]
  const iconPool = ICON_POOLS[itemType]

  // Find a unique name
  let name = getRandomElement(namePool)
  let attempts = 0
  while (existingNames.has(name.toLowerCase()) && attempts < 50) {
    name = getRandomElement(namePool)
    attempts++
  }
  
  // If still duplicate, add a suffix
  if (existingNames.has(name.toLowerCase())) {
    const suffix = Math.floor(Math.random() * 100)
    name = `${name} ${suffix}`
  }

  const rarity = getWeightedRarity(config.rarityWeights)
  const rarityMult = getRarityMultiplier(rarity)
  const icon = getRandomElement(iconPool)

  // Base values scaled by rarity
  const basePrice = getRandomInRange(10, 100)
  const buyPrice = Math.floor(basePrice * rarityMult)
  const sellPrice = Math.floor(buyPrice * 0.4)

  // Type-specific properties
  let useEffect: string | null = null
  let effectValue = 0
  let equipSlot: string | null = null
  let statBonuses: Record<string, number> = {}
  let maxStack = 99
  let isUnique = false

  if (itemType === 'consumable') {
    useEffect = getRandomElement(USE_EFFECTS)
    effectValue = Math.floor(getRandomInRange(20, 100) * rarityMult)
    maxStack = 20
  } else if (itemType === 'material') {
    maxStack = 99
  } else if (itemType === 'equipment') {
    equipSlot = getRandomElement(EQUIP_SLOTS)
    maxStack = 1
    // Generate random stat bonuses
    const stats = ['str', 'agi', 'vit', 'int', 'dex', 'luk']
    const numStats = getRandomInRange(1, 3)
    for (let i = 0; i < numStats; i++) {
      const stat = stats[Math.floor(Math.random() * stats.length)]
      statBonuses[stat] = Math.floor(getRandomInRange(1, 10) * rarityMult)
    }
  } else if (itemType === 'key_item') {
    maxStack = 1
    isUnique = true
  }

  return {
    name,
    description: `A ${rarity} ${itemType.replace('_', ' ')}.`,
    icon,
    itemType,
    useEffect,
    effectValue,
    equipSlot,
    statBonuses,
    buyPrice,
    sellPrice,
    maxStack,
    isUnique,
    rarity,
  }
}

// ============================================
// MAIN API HANDLER
// ============================================

export async function POST(request: Request) {
  try {
    const { itemType, count = 10 } = await request.json()

    if (!itemType || !['consumable', 'material', 'equipment', 'key_item'].includes(itemType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid item type' },
        { status: 400 }
      )
    }

    // Get existing item names from database for duplicate detection
    const existingItems = await prisma.item.findMany({
      select: { name: true },
    })
    const existingNames: Set<string> = new Set(existingItems.map((i: { name: string }) => i.name.toLowerCase()))

    // Generate items
    const generatedItems = []
    const batchNames = new Set<string>()

    for (let i = 0; i < count; i++) {
      const combinedNames = new Set<string>([...existingNames, ...batchNames])
      const item = generateItem(itemType as ItemType, combinedNames)
      batchNames.add(item.name.toLowerCase())
      
      // Check if this name exists in DB
      const isDuplicate = existingNames.has(item.name.toLowerCase())
      
      generatedItems.push({
        ...item,
        tempId: `temp_${Date.now()}_${i}`,
        isDuplicate,
        isLocked: false,
        isSaved: false,
      })
    }

    return NextResponse.json({
      success: true,
      items: generatedItems,
      itemType,
    })
  } catch (error) {
    console.error('Error generating items:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate items'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
