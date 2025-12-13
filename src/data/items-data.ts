// Items Database - Starter Items for the Game
// These items can be attached to monsters as loot drops

export interface ItemTemplate {
  name: string
  description: string
  icon: string
  itemType: 'consumable' | 'material' | 'equipment' | 'key_item'
  useEffect?: string
  effectValue?: number
  equipSlot?: string
  statBonuses?: Record<string, number>
  buyPrice: number
  sellPrice: number
  maxStack: number
  isUnique: boolean
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

export const STARTER_ITEMS: ItemTemplate[] = [
  // ============================================
  // CONSUMABLES - Healing
  // ============================================
  {
    name: 'Minor Health Potion',
    description: 'A small vial of red liquid that restores 50 HP.',
    icon: '🧪',
    itemType: 'consumable',
    useEffect: 'heal',
    effectValue: 50,
    buyPrice: 50,
    sellPrice: 25,
    maxStack: 20,
    isUnique: false,
    rarity: 'common',
  },
  {
    name: 'Health Potion',
    description: 'A standard healing potion that restores 150 HP.',
    icon: '🧪',
    itemType: 'consumable',
    useEffect: 'heal',
    effectValue: 150,
    buyPrice: 150,
    sellPrice: 75,
    maxStack: 20,
    isUnique: false,
    rarity: 'uncommon',
  },
  {
    name: 'Greater Health Potion',
    description: 'A potent healing potion that restores 300 HP.',
    icon: '🧪',
    itemType: 'consumable',
    useEffect: 'heal',
    effectValue: 300,
    buyPrice: 400,
    sellPrice: 200,
    maxStack: 10,
    isUnique: false,
    rarity: 'rare',
  },
  {
    name: 'Healing Herb',
    description: 'A common herb that restores 25 HP when consumed.',
    icon: '🌿',
    itemType: 'consumable',
    useEffect: 'heal',
    effectValue: 25,
    buyPrice: 20,
    sellPrice: 10,
    maxStack: 50,
    isUnique: false,
    rarity: 'common',
  },
  {
    name: 'Cooked Meat',
    description: 'Grilled meat that restores 75 HP.',
    icon: '🍖',
    itemType: 'consumable',
    useEffect: 'heal',
    effectValue: 75,
    buyPrice: 40,
    sellPrice: 20,
    maxStack: 20,
    isUnique: false,
    rarity: 'common',
  },

  // ============================================
  // CONSUMABLES - AP Recovery
  // ============================================
  {
    name: 'Minor AP Potion',
    description: 'A blue elixir that restores 20 AP.',
    icon: '💧',
    itemType: 'consumable',
    useEffect: 'restore_ap',
    effectValue: 20,
    buyPrice: 75,
    sellPrice: 35,
    maxStack: 20,
    isUnique: false,
    rarity: 'common',
  },
  {
    name: 'AP Potion',
    description: 'A standard AP potion that restores 50 AP.',
    icon: '💧',
    itemType: 'consumable',
    useEffect: 'restore_ap',
    effectValue: 50,
    buyPrice: 200,
    sellPrice: 100,
    maxStack: 20,
    isUnique: false,
    rarity: 'uncommon',
  },
  {
    name: 'Energy Drink',
    description: 'A fizzy drink that restores 30 AP.',
    icon: '🥤',
    itemType: 'consumable',
    useEffect: 'restore_ap',
    effectValue: 30,
    buyPrice: 100,
    sellPrice: 50,
    maxStack: 20,
    isUnique: false,
    rarity: 'common',
  },

  // ============================================
  // CONSUMABLES - Buffs
  // ============================================
  {
    name: 'Strength Elixir',
    description: 'Temporarily increases STR by 5 for 3 turns.',
    icon: '💪',
    itemType: 'consumable',
    useEffect: 'buff_str',
    effectValue: 5,
    buyPrice: 200,
    sellPrice: 100,
    maxStack: 10,
    isUnique: false,
    rarity: 'uncommon',
  },
  {
    name: 'Agility Elixir',
    description: 'Temporarily increases AGI by 5 for 3 turns.',
    icon: '🏃',
    itemType: 'consumable',
    useEffect: 'buff_agi',
    effectValue: 5,
    buyPrice: 200,
    sellPrice: 100,
    maxStack: 10,
    isUnique: false,
    rarity: 'uncommon',
  },
  {
    name: 'Defense Elixir',
    description: 'Temporarily increases VIT by 5 for 3 turns.',
    icon: '🛡️',
    itemType: 'consumable',
    useEffect: 'buff_vit',
    effectValue: 5,
    buyPrice: 200,
    sellPrice: 100,
    maxStack: 10,
    isUnique: false,
    rarity: 'uncommon',
  },
  {
    name: 'Antidote',
    description: 'Cures poison status effect.',
    icon: '💊',
    itemType: 'consumable',
    useEffect: 'cure_poison',
    effectValue: 0,
    buyPrice: 50,
    sellPrice: 25,
    maxStack: 20,
    isUnique: false,
    rarity: 'common',
  },

  // ============================================
  // MATERIALS - Common
  // ============================================
  {
    name: 'Wolf Fang',
    description: 'A sharp fang from a wolf. Used in crafting.',
    icon: '🦷',
    itemType: 'material',
    buyPrice: 0,
    sellPrice: 15,
    maxStack: 99,
    isUnique: false,
    rarity: 'common',
  },
  {
    name: 'Wolf Pelt',
    description: 'Fur from a wolf. Can be sold or used for crafting.',
    icon: '🐺',
    itemType: 'material',
    buyPrice: 0,
    sellPrice: 25,
    maxStack: 99,
    isUnique: false,
    rarity: 'common',
  },
  {
    name: 'Boar Tusk',
    description: 'A curved tusk from a wild boar.',
    icon: '🐗',
    itemType: 'material',
    buyPrice: 0,
    sellPrice: 20,
    maxStack: 99,
    isUnique: false,
    rarity: 'common',
  },
  {
    name: 'Slime Gel',
    description: 'Gelatinous substance from a slime monster.',
    icon: '💧',
    itemType: 'material',
    buyPrice: 0,
    sellPrice: 10,
    maxStack: 99,
    isUnique: false,
    rarity: 'common',
  },
  {
    name: 'Goblin Ear',
    description: 'A pointed ear from a goblin. Proof of subjugation.',
    icon: '👂',
    itemType: 'material',
    buyPrice: 0,
    sellPrice: 30,
    maxStack: 99,
    isUnique: false,
    rarity: 'common',
  },
  {
    name: 'Bat Wing',
    description: 'A leathery wing from a cave bat.',
    icon: '🦇',
    itemType: 'material',
    buyPrice: 0,
    sellPrice: 12,
    maxStack: 99,
    isUnique: false,
    rarity: 'common',
  },
  {
    name: 'Spider Silk',
    description: 'Strong silk thread from a giant spider.',
    icon: '🕸️',
    itemType: 'material',
    buyPrice: 0,
    sellPrice: 35,
    maxStack: 99,
    isUnique: false,
    rarity: 'common',
  },
  {
    name: 'Bone Fragment',
    description: 'A piece of monster bone. Common crafting material.',
    icon: '🦴',
    itemType: 'material',
    buyPrice: 0,
    sellPrice: 8,
    maxStack: 99,
    isUnique: false,
    rarity: 'common',
  },

  // ============================================
  // MATERIALS - Uncommon
  // ============================================
  {
    name: 'Monster Core',
    description: 'A crystallized core from a monster. Valuable.',
    icon: '💎',
    itemType: 'material',
    buyPrice: 0,
    sellPrice: 100,
    maxStack: 50,
    isUnique: false,
    rarity: 'uncommon',
  },
  {
    name: 'Venom Sac',
    description: 'A sac containing potent venom. Handle with care.',
    icon: '🐍',
    itemType: 'material',
    buyPrice: 0,
    sellPrice: 75,
    maxStack: 50,
    isUnique: false,
    rarity: 'uncommon',
  },
  {
    name: 'Magic Crystal',
    description: 'A crystal infused with magical energy.',
    icon: '🔮',
    itemType: 'material',
    buyPrice: 0,
    sellPrice: 150,
    maxStack: 30,
    isUnique: false,
    rarity: 'uncommon',
  },
  {
    name: 'Iron Ore',
    description: 'Raw iron ore. Used in blacksmithing.',
    icon: '�ite',
    itemType: 'material',
    buyPrice: 50,
    sellPrice: 25,
    maxStack: 99,
    isUnique: false,
    rarity: 'common',
  },

  // ============================================
  // MATERIALS - Rare
  // ============================================
  {
    name: 'Dragon Scale',
    description: 'A scale from a dragon. Extremely rare and valuable.',
    icon: '🐉',
    itemType: 'material',
    buyPrice: 0,
    sellPrice: 500,
    maxStack: 10,
    isUnique: false,
    rarity: 'rare',
  },
  {
    name: 'Phoenix Feather',
    description: 'A feather from a phoenix. Burns with eternal flame.',
    icon: '🔥',
    itemType: 'material',
    buyPrice: 0,
    sellPrice: 750,
    maxStack: 5,
    isUnique: false,
    rarity: 'epic',
  },

  // ============================================
  // KEY ITEMS
  // ============================================
  {
    name: 'Teleport Crystal',
    description: 'A crystal that teleports you to the nearest town.',
    icon: '💠',
    itemType: 'key_item',
    useEffect: 'teleport_town',
    effectValue: 0,
    buyPrice: 500,
    sellPrice: 250,
    maxStack: 5,
    isUnique: false,
    rarity: 'rare',
  },
  {
    name: 'Dungeon Key',
    description: 'A key that opens a dungeon entrance.',
    icon: '🗝️',
    itemType: 'key_item',
    buyPrice: 0,
    sellPrice: 0,
    maxStack: 1,
    isUnique: true,
    rarity: 'rare',
  },
  {
    name: 'Boss Room Key',
    description: 'A key that unlocks the boss room on this floor.',
    icon: '🔑',
    itemType: 'key_item',
    buyPrice: 0,
    sellPrice: 0,
    maxStack: 1,
    isUnique: true,
    rarity: 'epic',
  },
]

// Item type categories for filtering
export const ITEM_TYPES = [
  { id: 'consumable', name: 'Consumable', icon: '🧪' },
  { id: 'material', name: 'Material', icon: '📦' },
  { id: 'equipment', name: 'Equipment', icon: '⚔️' },
  { id: 'key_item', name: 'Key Item', icon: '🔑' },
]

// Rarity levels
export const RARITY_LEVELS = [
  { id: 'common', name: 'Common', color: '#9ca3af' },
  { id: 'uncommon', name: 'Uncommon', color: '#22c55e' },
  { id: 'rare', name: 'Rare', color: '#3b82f6' },
  { id: 'epic', name: 'Epic', color: '#a855f7' },
  { id: 'legendary', name: 'Legendary', color: '#f59e0b' },
]

// Use effects for consumables
export const USE_EFFECTS = [
  { id: 'heal', name: 'Heal HP', icon: '❤️' },
  { id: 'restore_ap', name: 'Restore AP', icon: '💧' },
  { id: 'buff_str', name: 'Buff STR', icon: '💪' },
  { id: 'buff_agi', name: 'Buff AGI', icon: '🏃' },
  { id: 'buff_vit', name: 'Buff VIT', icon: '🛡️' },
  { id: 'buff_int', name: 'Buff INT', icon: '🧠' },
  { id: 'buff_dex', name: 'Buff DEX', icon: '🎯' },
  { id: 'buff_luk', name: 'Buff LUK', icon: '🍀' },
  { id: 'cure_poison', name: 'Cure Poison', icon: '💊' },
  { id: 'cure_all', name: 'Cure All', icon: '✨' },
  { id: 'teleport_town', name: 'Teleport to Town', icon: '💠' },
]
