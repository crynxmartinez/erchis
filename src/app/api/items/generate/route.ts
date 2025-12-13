import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// ============================================
// ITEM TYPES (8 Categories)
// ============================================

type ItemType = 'potions' | 'food' | 'scrolls' | 'materials' | 'weapons' | 'armor' | 'accessories' | 'misc'

// ============================================
// ITEM CONFIGURATION
// ============================================

interface ItemTypeConfig {
  icon: string
  label: string
  rarityWeights: Record<string, number>
}

const ITEM_TYPE_CONFIGS: Record<ItemType, ItemTypeConfig> = {
  potions: {
    icon: '🧪',
    label: 'Potions',
    rarityWeights: { common: 40, uncommon: 30, rare: 20, epic: 8, legendary: 2 },
  },
  food: {
    icon: '🍖',
    label: 'Food',
    rarityWeights: { common: 50, uncommon: 30, rare: 15, epic: 4, legendary: 1 },
  },
  scrolls: {
    icon: '📜',
    label: 'Scrolls',
    rarityWeights: { common: 30, uncommon: 35, rare: 25, epic: 8, legendary: 2 },
  },
  materials: {
    icon: '🪨',
    label: 'Materials',
    rarityWeights: { common: 50, uncommon: 30, rare: 15, epic: 4, legendary: 1 },
  },
  weapons: {
    icon: '⚔️',
    label: 'Weapons',
    rarityWeights: { common: 30, uncommon: 30, rare: 25, epic: 12, legendary: 3 },
  },
  armor: {
    icon: '🛡️',
    label: 'Armor',
    rarityWeights: { common: 30, uncommon: 30, rare: 25, epic: 12, legendary: 3 },
  },
  accessories: {
    icon: '💍',
    label: 'Accessories',
    rarityWeights: { common: 25, uncommon: 30, rare: 28, epic: 14, legendary: 3 },
  },
  misc: {
    icon: '📦',
    label: 'Misc',
    rarityWeights: { common: 20, uncommon: 30, rare: 30, epic: 15, legendary: 5 },
  },
}

// ============================================
// NAME TEMPLATES BY CATEGORY
// ============================================

const POTION_NAMES: string[] = [
  'Health Potion', 'Mana Potion', 'Stamina Elixir', 'Antidote', 'Burn Salve',
  'Frost Ward Potion', 'Strength Tonic', 'Speed Brew', 'Defense Draught', 'Focus Serum',
  'Healing Draught', 'Vitality Elixir', 'Regeneration Potion', 'Life Essence', 'Phoenix Tears',
  'Mana Crystal Potion', 'Arcane Elixir', 'Spirit Water', 'Mind Tonic', 'Clarity Serum',
  'Energy Potion', 'Endurance Elixir', 'Vigor Tonic', 'Restoration Brew', 'Revival Potion',
]

const FOOD_NAMES: string[] = [
  'Grilled Meat', 'Herb Soup', 'Power Bread', 'Energy Bar', 'Trail Mix',
  'Roasted Boar', 'Dragon Steak', 'Elven Waybread', 'Dwarven Ale', 'Honey Cake',
  'Spiced Wine', 'Warrior\'s Feast', 'Hunter\'s Ration', 'Mage\'s Biscuit', 'Royal Banquet',
  'Smoked Fish', 'Cheese Wheel', 'Apple Pie', 'Mushroom Stew', 'Berry Tart',
  'Meat Skewer', 'Vegetable Curry', 'Rice Ball', 'Noodle Bowl', 'Fruit Salad',
]

const SCROLL_NAMES: string[] = [
  'Teleport Scroll', 'Identify Scroll', 'Fireball Scroll', 'Ice Storm Scroll', 'Lightning Scroll',
  'Heal Scroll', 'Buff Scroll', 'Debuff Scroll', 'Summon Scroll', 'Banish Scroll',
  'Town Portal Scroll', 'Escape Scroll', 'Map Scroll', 'Reveal Scroll', 'Dispel Scroll',
  'Enchant Scroll', 'Blessing Scroll', 'Curse Scroll', 'Protection Scroll', 'Haste Scroll',
  'Strength Scroll', 'Wisdom Scroll', 'Fortune Scroll', 'Barrier Scroll', 'Resurrection Scroll',
]

const MATERIAL_NAMES: string[] = [
  'Iron Ore', 'Copper Ore', 'Silver Ore', 'Gold Ore', 'Mythril Ore',
  'Oak Wood', 'Pine Wood', 'Maple Wood', 'Ebony Wood', 'Spirit Wood',
  'Wolf Pelt', 'Bear Hide', 'Dragon Scale', 'Phoenix Feather', 'Unicorn Hair',
  'Slime Gel', 'Goblin Ear', 'Orc Tusk', 'Demon Horn', 'Angel Wing',
  'Fire Crystal', 'Ice Crystal', 'Thunder Crystal', 'Dark Crystal', 'Light Crystal',
  'Monster Bone', 'Monster Claw', 'Monster Fang', 'Monster Eye', 'Monster Heart',
]

const WEAPON_NAMES: string[] = [
  'Iron Sword', 'Steel Blade', 'Silver Saber', 'Mythril Edge', 'Dragon Slayer',
  'Oak Staff', 'Crystal Wand', 'Arcane Rod', 'Elder Staff', 'Void Scepter',
  'Hunter\'s Bow', 'Longbow', 'Crossbow', 'Elven Bow', 'Phoenix Bow',
  'Iron Axe', 'Battle Axe', 'Greataxe', 'Berserker Axe', 'Titan Cleaver',
  'Dagger', 'Stiletto', 'Assassin Blade', 'Shadow Knife', 'Venom Fang',
  'War Hammer', 'Mace', 'Flail', 'Morning Star', 'Skull Crusher',
]

const ARMOR_NAMES: string[] = [
  'Leather Armor', 'Chain Mail', 'Plate Armor', 'Dragon Armor', 'Holy Armor',
  'Cloth Hood', 'Leather Cap', 'Iron Helm', 'Steel Helmet', 'Crown of Kings',
  'Cloth Gloves', 'Leather Gauntlets', 'Iron Bracers', 'Steel Vambraces', 'Titan Grip',
  'Sandals', 'Leather Boots', 'Iron Greaves', 'Steel Sabatons', 'Wind Walkers',
  'Cloth Robe', 'Mage Robe', 'Battle Robe', 'Arcane Vestments', 'Divine Raiment',
  'Wooden Shield', 'Iron Buckler', 'Steel Guard', 'Tower Shield', 'Aegis',
]

const ACCESSORY_NAMES: string[] = [
  'Copper Ring', 'Silver Ring', 'Gold Ring', 'Platinum Ring', 'Diamond Ring',
  'Bone Necklace', 'Silver Pendant', 'Gold Amulet', 'Ruby Choker', 'Star Locket',
  'Leather Belt', 'Chain Belt', 'Hero\'s Belt', 'Champion\'s Sash', 'Divine Girdle',
  'Simple Earring', 'Pearl Earring', 'Ruby Earring', 'Sapphire Earring', 'Dragon Earring',
  'Cloth Cape', 'Traveler\'s Cloak', 'Knight\'s Mantle', 'Mage\'s Shroud', 'Phoenix Cloak',
]

const MISC_NAMES: string[] = [
  'Rusty Key', 'Bronze Key', 'Silver Key', 'Gold Key', 'Master Key',
  'Old Map', 'Treasure Map', 'Dungeon Map', 'World Map', 'Star Chart',
  'Guild Badge', 'Royal Seal', 'Ancient Coin', 'Mysterious Orb', 'Crystal Ball',
  'Compass', 'Spyglass', 'Lantern', 'Rope', 'Grappling Hook',
  'Flute', 'Ocarina', 'Music Box', 'Bell', 'Whistle',
  'Monster Manual', 'Herb Encyclopedia', 'Weapon Catalog', 'Armor Guide', 'Recipe Book',
]

const NAME_POOLS: Record<ItemType, string[]> = {
  potions: POTION_NAMES,
  food: FOOD_NAMES,
  scrolls: SCROLL_NAMES,
  materials: MATERIAL_NAMES,
  weapons: WEAPON_NAMES,
  armor: ARMOR_NAMES,
  accessories: ACCESSORY_NAMES,
  misc: MISC_NAMES,
}

// ============================================
// ICONS BY TYPE
// ============================================

const ICON_POOLS: Record<ItemType, string[]> = {
  potions: ['🧪', '💊', '🍶', '🫗', '🧴', '💉', '🩹', '🍵', '🥤', '🍷'],
  food: ['🍖', '🥩', '🍗', '🥘', '🍲', '🥧', '🍞', '🧀', '🍎', '🍇'],
  scrolls: ['📜', '📃', '📄', '🗞️', '📋', '✉️', '📝', '🔖', '🏷️', '📑'],
  materials: ['🪨', '🪵', '💎', '🦴', '🪶', '🧬', '🌿', '🍄', '🕸️', '🐚'],
  weapons: ['⚔️', '🗡️', '🏹', '🪓', '🔨', '🔱', '⛏️', '🪃', '🎯', '💀'],
  armor: ['🛡️', '🪖', '👑', '🧤', '👢', '🥾', '🎭', '⛑️', '🦺', '👘'],
  accessories: ['💍', '📿', '🎀', '👓', '🧣', '🎩', '👒', '🧢', '💎', '✨'],
  misc: ['🔑', '🗝️', '📖', '🗺️', '🧭', '🔮', '🏆', '🎭', '🎪', '📦'],
}

// ============================================
// USE EFFECTS BY TYPE
// ============================================

const POTION_EFFECTS = ['heal', 'restore_mp', 'restore_ap', 'cure_poison', 'cure_burn', 'cure_all', 'buff_attack', 'buff_defense']
const FOOD_EFFECTS = ['heal', 'buff_attack', 'buff_defense', 'buff_speed', 'buff_luck', 'regen', 'stamina_regen', 'exp_boost']
const SCROLL_EFFECTS = ['teleport', 'identify', 'damage_fire', 'damage_ice', 'damage_lightning', 'buff_all', 'dispel', 'summon']

// ============================================
// EQUIP SLOTS
// ============================================

const WEAPON_SLOTS = ['weapon']
const ARMOR_SLOTS = ['head', 'body', 'hands', 'feet', 'shield']
const ACCESSORY_SLOTS = ['ring', 'necklace', 'belt', 'earring', 'cape']

// ============================================
// DESCRIPTION TEMPLATES
// ============================================

const DESCRIPTION_TEMPLATES: Record<ItemType, Record<string, string[]>> = {
  potions: {
    common: [
      'A basic potion brewed from common herbs.',
      'A simple concoction that provides minor relief.',
      'An everyday remedy used by adventurers.',
    ],
    uncommon: [
      'A well-crafted potion with enhanced potency.',
      'Brewed with care using quality ingredients.',
      'A reliable elixir favored by experienced travelers.',
    ],
    rare: [
      'A potent brew infused with rare essences.',
      'Crafted by skilled alchemists using secret techniques.',
      'A powerful elixir that glows with inner light.',
    ],
    epic: [
      'A masterwork potion of extraordinary power.',
      'Infused with magical essences from ancient sources.',
      'A legendary brew that pulses with arcane energy.',
    ],
    legendary: [
      'A mythical elixir said to be blessed by the gods themselves.',
      'The pinnacle of alchemical achievement, radiating pure power.',
      'A divine concoction that transcends mortal understanding.',
    ],
  },
  food: {
    common: ['Simple fare that fills the belly.', 'Basic sustenance for the road.', 'A humble meal.'],
    uncommon: ['A hearty meal that restores vigor.', 'Well-prepared food with quality ingredients.', 'Satisfying cuisine.'],
    rare: ['A gourmet dish prepared by skilled chefs.', 'Exotic ingredients create an unforgettable taste.', 'Fine dining.'],
    epic: ['A feast fit for royalty.', 'Magical ingredients enhance both flavor and effect.', 'Legendary cuisine.'],
    legendary: ['A divine meal blessed by the gods.', 'Food of myth and legend.', 'Transcendent culinary perfection.'],
  },
  scrolls: {
    common: ['A basic scroll with simple enchantments.', 'Written by apprentice mages.', 'Common magical text.'],
    uncommon: ['A scroll inscribed with practiced skill.', 'Contains reliable magical formulas.', 'Quality spellwork.'],
    rare: ['Ancient runes pulse with power.', 'Inscribed by master wizards.', 'Potent magical scripture.'],
    epic: ['Arcane symbols of immense power.', 'Written in languages long forgotten.', 'Legendary spellcraft.'],
    legendary: ['Divine scripture that bends reality.', 'Words of creation itself.', 'Mythical magical text.'],
  },
  materials: {
    common: ['A common crafting material.', 'Basic resource for crafting.', 'Standard quality material.'],
    uncommon: ['Quality material sought by craftsmen.', 'Above-average crafting resource.', 'Refined material.'],
    rare: ['Rare material prized by master craftsmen.', 'Difficult to obtain, highly valued.', 'Premium resource.'],
    epic: ['Legendary material of extraordinary quality.', 'Used in masterwork creations.', 'Exceptional resource.'],
    legendary: ['Mythical material of divine origin.', 'The stuff of legends.', 'Transcendent crafting resource.'],
  },
  weapons: {
    common: ['A basic weapon for novice fighters.', 'Simple but functional armament.', 'Standard issue gear.'],
    uncommon: ['A well-crafted weapon with good balance.', 'Reliable armament for seasoned warriors.', 'Quality steel.'],
    rare: ['A finely forged weapon of superior make.', 'Crafted by master smiths.', 'Exceptional armament.'],
    epic: ['A legendary weapon imbued with power.', 'Forged with ancient techniques.', 'Masterwork armament.'],
    legendary: ['A mythical weapon of godlike power.', 'Forged in divine flames.', 'Weapon of legends.'],
  },
  armor: {
    common: ['Basic protection for novice adventurers.', 'Simple defensive gear.', 'Standard armor.'],
    uncommon: ['Well-crafted armor offering solid protection.', 'Reliable defensive equipment.', 'Quality protection.'],
    rare: ['Superior armor crafted by master armorers.', 'Exceptional defensive capabilities.', 'Premium protection.'],
    epic: ['Legendary armor imbued with protective magic.', 'Masterwork defensive equipment.', 'Epic protection.'],
    legendary: ['Divine armor blessed by the gods.', 'Impenetrable mythical protection.', 'Legendary defense.'],
  },
  accessories: {
    common: ['A simple trinket with minor effects.', 'Basic accessory.', 'Common adornment.'],
    uncommon: ['A well-crafted accessory with useful properties.', 'Quality trinket.', 'Refined accessory.'],
    rare: ['A rare accessory with powerful enchantments.', 'Exceptional trinket.', 'Premium adornment.'],
    epic: ['A legendary accessory of immense power.', 'Masterwork trinket.', 'Epic adornment.'],
    legendary: ['A divine accessory of godlike power.', 'Mythical trinket.', 'Legendary adornment.'],
  },
  misc: {
    common: ['A common item of little note.', 'Basic miscellaneous item.', 'Standard object.'],
    uncommon: ['An interesting item with some value.', 'Useful miscellaneous object.', 'Quality item.'],
    rare: ['A rare item sought by collectors.', 'Valuable miscellaneous object.', 'Premium item.'],
    epic: ['A legendary item of great significance.', 'Exceptional miscellaneous object.', 'Epic item.'],
    legendary: ['A mythical item of divine origin.', 'Priceless miscellaneous object.', 'Legendary item.'],
  },
}

// ============================================
// LORE TEMPLATES
// ============================================

const LORE_TEMPLATES: Record<ItemType, string[]> = {
  potions: [
    'Brewed in the ancient towers of the Alchemist Guild.',
    'The recipe was passed down through generations of healers.',
    'Said to contain essence harvested under a full moon.',
    'Created using techniques from the lost civilization of Erchis.',
    'The bubbling liquid seems to whisper ancient secrets.',
  ],
  food: [
    'A recipe treasured by the royal kitchens for centuries.',
    'Prepared using ingredients from the sacred groves.',
    'The aroma alone is said to restore weary spirits.',
    'A favorite among the legendary heroes of old.',
    'Blessed by the goddess of harvest and plenty.',
  ],
  scrolls: [
    'Inscribed by the archmages of the Crystal Tower.',
    'The ink used contains powdered starlight.',
    'Written in a language that predates recorded history.',
    'The parchment is made from the bark of the World Tree.',
    'Reading the words aloud causes reality to shimmer.',
  ],
  materials: [
    'Harvested from the deepest dungeons of the realm.',
    'Only found in places touched by ancient magic.',
    'Prized by master craftsmen across all lands.',
    'Said to contain the essence of fallen stars.',
    'Formed over millennia in the heart of the earth.',
  ],
  weapons: [
    'Forged in the legendary smithies of the Dwarven Kings.',
    'The blade has tasted the blood of countless foes.',
    'Wielded by heroes whose names echo through history.',
    'The metal was tempered in dragon fire.',
    'Ancient runes of power are etched into the steel.',
  ],
  armor: [
    'Worn by the legendary knights of the First Age.',
    'The metal was blessed by the gods of war.',
    'Each link was forged with prayers of protection.',
    'Said to have turned aside the blow of a demon lord.',
    'The craftsmanship is beyond mortal skill.',
  ],
  accessories: [
    'Once worn by royalty of a forgotten kingdom.',
    'The gem at its center holds captured starlight.',
    'Enchanted by the greatest wizards of the age.',
    'A family heirloom passed down through generations.',
    'The magic within has grown stronger with time.',
  ],
  misc: [
    'Its true purpose has been lost to time.',
    'Scholars debate its origin and significance.',
    'Found in the ruins of an ancient civilization.',
    'Radiates a faint magical aura of unknown nature.',
    'Many have sought this item throughout history.',
  ],
}

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

function generateDescription(itemType: ItemType, rarity: string): string {
  const templates = DESCRIPTION_TEMPLATES[itemType]?.[rarity] || DESCRIPTION_TEMPLATES[itemType]?.common || ['A mysterious item.']
  return getRandomElement(templates)
}

function generateLore(itemType: ItemType): string {
  const templates = LORE_TEMPLATES[itemType] || ['Its origins are shrouded in mystery.']
  return getRandomElement(templates)
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

  // Generate based on item type
  if (itemType === 'potions') {
    useEffect = getRandomElement(POTION_EFFECTS)
    effectValue = Math.floor(getRandomInRange(20, 100) * rarityMult)
    maxStack = 20
  } else if (itemType === 'food') {
    useEffect = getRandomElement(FOOD_EFFECTS)
    effectValue = Math.floor(getRandomInRange(15, 80) * rarityMult)
    maxStack = 10
  } else if (itemType === 'scrolls') {
    useEffect = getRandomElement(SCROLL_EFFECTS)
    effectValue = Math.floor(getRandomInRange(30, 120) * rarityMult)
    maxStack = 5
  } else if (itemType === 'materials') {
    maxStack = 99
  } else if (itemType === 'weapons') {
    equipSlot = getRandomElement(WEAPON_SLOTS)
    maxStack = 1
    const stats = ['str', 'agi', 'dex']
    const numStats = getRandomInRange(1, 3)
    for (let i = 0; i < numStats; i++) {
      const stat = stats[Math.floor(Math.random() * stats.length)]
      statBonuses[stat] = Math.floor(getRandomInRange(1, 10) * rarityMult)
    }
    statBonuses['attack'] = Math.floor(getRandomInRange(5, 20) * rarityMult)
  } else if (itemType === 'armor') {
    equipSlot = getRandomElement(ARMOR_SLOTS)
    maxStack = 1
    const stats = ['vit', 'str', 'agi']
    const numStats = getRandomInRange(1, 2)
    for (let i = 0; i < numStats; i++) {
      const stat = stats[Math.floor(Math.random() * stats.length)]
      statBonuses[stat] = Math.floor(getRandomInRange(1, 8) * rarityMult)
    }
    statBonuses['defense'] = Math.floor(getRandomInRange(3, 15) * rarityMult)
  } else if (itemType === 'accessories') {
    equipSlot = getRandomElement(ACCESSORY_SLOTS)
    maxStack = 1
    const stats = ['str', 'agi', 'vit', 'int', 'dex', 'luk']
    const numStats = getRandomInRange(1, 3)
    for (let i = 0; i < numStats; i++) {
      const stat = stats[Math.floor(Math.random() * stats.length)]
      statBonuses[stat] = Math.floor(getRandomInRange(1, 6) * rarityMult)
    }
  } else if (itemType === 'misc') {
    maxStack = 1
    isUnique = Math.random() < 0.3
  }

  // Generate description and lore
  const description = generateDescription(itemType, rarity)
  const lore = generateLore(itemType)

  return {
    name,
    description: `${description} ${lore}`,
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

    const validTypes = ['potions', 'food', 'scrolls', 'materials', 'weapons', 'armor', 'accessories', 'misc']
    if (!itemType || !validTypes.includes(itemType)) {
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
