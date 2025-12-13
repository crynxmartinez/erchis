// ============================================
// COMBAT SYSTEM - TYPE DEFINITIONS
// ============================================

// ============================================
// BUFF TYPES
// ============================================

export enum BuffType {
  // Offensive Buffs
  EMPOWER = 'empower',           // +X% damage dealt
  FOCUS = 'focus',               // +X% crit chance
  PRECISION = 'precision',       // +X% accuracy
  BERSERK = 'berserk',           // +X% damage, -X% defense
  
  // Defensive Buffs
  FORTIFY = 'fortify',           // +X% defense
  BARRIER = 'barrier',           // Absorb X damage
  EVASION = 'evasion',           // +X% dodge chance
  REFLECT = 'reflect',           // Reflect X% damage back
  
  // Utility Buffs
  HASTE = 'haste',               // +X AP regen per turn
  REGEN = 'regen',               // +X HP per turn
  STEALTH = 'stealth',           // Cannot be targeted (breaks on attack)
  IMMUNITY = 'immunity',         // Immune to debuffs
}

export interface BuffEffect {
  type: BuffType
  value: number                  // Percentage or flat value
  duration: number               // Turns remaining
  sourceSkillId?: string         // Which skill applied this
}

// Buff configuration - defines what each buff does
export const BUFF_CONFIG: Record<BuffType, {
  name: string
  description: string
  icon: string
  stackable: boolean
  maxStacks: number
}> = {
  [BuffType.EMPOWER]: {
    name: 'Empower',
    description: '+{value}% damage dealt',
    icon: '⚔️',
    stackable: true,
    maxStacks: 3,
  },
  [BuffType.FOCUS]: {
    name: 'Focus',
    description: '+{value}% critical hit chance',
    icon: '🎯',
    stackable: true,
    maxStacks: 3,
  },
  [BuffType.PRECISION]: {
    name: 'Precision',
    description: '+{value}% accuracy',
    icon: '👁️',
    stackable: true,
    maxStacks: 3,
  },
  [BuffType.BERSERK]: {
    name: 'Berserk',
    description: '+{value}% damage, -{value}% defense',
    icon: '🔥',
    stackable: false,
    maxStacks: 1,
  },
  [BuffType.FORTIFY]: {
    name: 'Fortify',
    description: '+{value}% defense',
    icon: '🛡️',
    stackable: true,
    maxStacks: 3,
  },
  [BuffType.BARRIER]: {
    name: 'Barrier',
    description: 'Absorbs {value} damage',
    icon: '🔮',
    stackable: false,
    maxStacks: 1,
  },
  [BuffType.EVASION]: {
    name: 'Evasion',
    description: '+{value}% dodge chance',
    icon: '💨',
    stackable: true,
    maxStacks: 3,
  },
  [BuffType.REFLECT]: {
    name: 'Reflect',
    description: 'Reflects {value}% damage back to attacker',
    icon: '🪞',
    stackable: false,
    maxStacks: 1,
  },
  [BuffType.HASTE]: {
    name: 'Haste',
    description: '+{value} AP regeneration per turn',
    icon: '⚡',
    stackable: false,
    maxStacks: 1,
  },
  [BuffType.REGEN]: {
    name: 'Regeneration',
    description: '+{value} HP per turn',
    icon: '💚',
    stackable: true,
    maxStacks: 3,
  },
  [BuffType.STEALTH]: {
    name: 'Stealth',
    description: 'Cannot be targeted by enemies',
    icon: '👤',
    stackable: false,
    maxStacks: 1,
  },
  [BuffType.IMMUNITY]: {
    name: 'Immunity',
    description: 'Immune to all debuffs',
    icon: '✨',
    stackable: false,
    maxStacks: 1,
  },
}

// ============================================
// DEBUFF TYPES
// ============================================

export enum DebuffType {
  // Damage Over Time
  BLEED = 'bleed',               // X damage per turn (physical)
  BURN = 'burn',                 // X damage per turn (magic)
  POISON = 'poison',             // X% max HP damage per turn
  
  // Stat Reduction
  WEAKEN = 'weaken',             // -X% damage dealt
  ARMOR_BREAK = 'armor_break',   // -X% defense
  SLOW = 'slow',                 // -X AP regen per turn
  BLIND = 'blind',               // -X% accuracy
  
  // Control Effects
  STUN = 'stun',                 // Cannot act
  ROOT = 'root',                 // Cannot move (can still attack)
  SILENCE = 'silence',           // Cannot use skills (basic attack only)
  TAUNT = 'taunt',               // Must attack the taunter
  
  // Special
  MARKED = 'marked',             // +X% damage taken from all sources
  CURSE = 'curse',               // -X% healing received
}

export interface DebuffEffect {
  type: DebuffType
  value: number                  // Percentage or flat value
  duration: number               // Turns remaining
  sourceSkillId?: string         // Which skill applied this
  sourceEntityId?: string        // Who applied this (for bleed/burn damage attribution)
}

// Debuff configuration - defines what each debuff does
export const DEBUFF_CONFIG: Record<DebuffType, {
  name: string
  description: string
  icon: string
  stackable: boolean
  maxStacks: number
  ticksAtStartOfTurn: boolean    // Does damage/effect happen at turn start?
}> = {
  [DebuffType.BLEED]: {
    name: 'Bleeding',
    description: 'Takes {value} physical damage per turn',
    icon: '🩸',
    stackable: true,
    maxStacks: 5,
    ticksAtStartOfTurn: true,
  },
  [DebuffType.BURN]: {
    name: 'Burning',
    description: 'Takes {value} magic damage per turn',
    icon: '🔥',
    stackable: true,
    maxStacks: 5,
    ticksAtStartOfTurn: true,
  },
  [DebuffType.POISON]: {
    name: 'Poisoned',
    description: 'Takes {value}% max HP as damage per turn',
    icon: '☠️',
    stackable: true,
    maxStacks: 3,
    ticksAtStartOfTurn: true,
  },
  [DebuffType.WEAKEN]: {
    name: 'Weakened',
    description: '-{value}% damage dealt',
    icon: '💔',
    stackable: true,
    maxStacks: 3,
    ticksAtStartOfTurn: false,
  },
  [DebuffType.ARMOR_BREAK]: {
    name: 'Armor Broken',
    description: '-{value}% defense',
    icon: '🔨',
    stackable: true,
    maxStacks: 3,
    ticksAtStartOfTurn: false,
  },
  [DebuffType.SLOW]: {
    name: 'Slowed',
    description: '-{value} AP regeneration per turn',
    icon: '🐌',
    stackable: false,
    maxStacks: 1,
    ticksAtStartOfTurn: false,
  },
  [DebuffType.BLIND]: {
    name: 'Blinded',
    description: '-{value}% accuracy',
    icon: '😵',
    stackable: false,
    maxStacks: 1,
    ticksAtStartOfTurn: false,
  },
  [DebuffType.STUN]: {
    name: 'Stunned',
    description: 'Cannot take any action',
    icon: '💫',
    stackable: false,
    maxStacks: 1,
    ticksAtStartOfTurn: false,
  },
  [DebuffType.ROOT]: {
    name: 'Rooted',
    description: 'Cannot move',
    icon: '🌿',
    stackable: false,
    maxStacks: 1,
    ticksAtStartOfTurn: false,
  },
  [DebuffType.SILENCE]: {
    name: 'Silenced',
    description: 'Cannot use skills',
    icon: '🤐',
    stackable: false,
    maxStacks: 1,
    ticksAtStartOfTurn: false,
  },
  [DebuffType.TAUNT]: {
    name: 'Taunted',
    description: 'Must attack the taunter',
    icon: '😤',
    stackable: false,
    maxStacks: 1,
    ticksAtStartOfTurn: false,
  },
  [DebuffType.MARKED]: {
    name: 'Marked',
    description: '+{value}% damage taken from all sources',
    icon: '🎯',
    stackable: true,
    maxStacks: 3,
    ticksAtStartOfTurn: false,
  },
  [DebuffType.CURSE]: {
    name: 'Cursed',
    description: '-{value}% healing received',
    icon: '💀',
    stackable: false,
    maxStacks: 1,
    ticksAtStartOfTurn: false,
  },
}

// ============================================
// TARGET TYPES
// ============================================

export enum TargetType {
  SINGLE = 'single',             // One enemy
  SELF = 'self',                 // Caster only
  ALLY = 'ally',                 // One ally
  ALL_ALLIES = 'all_allies',     // All allies including self
  AOE_CONE = 'aoe_cone',         // Cone in front (3 targets max)
  AOE_CIRCLE = 'aoe_circle',     // Circle around point (radius-based)
  AOE_LINE = 'aoe_line',         // Line from caster (piercing)
  ALL_ENEMIES = 'all_enemies',   // Every enemy
}

// ============================================
// DAMAGE TYPES
// ============================================

export enum DamageType {
  PHYSICAL = 'physical',         // Can crit, reduced by armor
  MAGIC = 'magic',               // Cannot crit, reduced by magic resist
  TRUE = 'true',                 // Cannot crit, ignores all defenses
  NONE = 'none',                 // No damage (utility skills)
}

// ============================================
// TRIGGER CONDITIONS (for counter skills)
// ============================================

export enum TriggerCondition {
  AFTER_DODGE = 'after_dodge',           // After successfully dodging
  AFTER_PARRY = 'after_parry',           // After successfully parrying
  ON_HIT_TAKEN = 'on_hit_taken',         // When taking damage
  ON_CRIT_TAKEN = 'on_crit_taken',       // When taking a critical hit
  ON_ALLY_HIT = 'on_ally_hit',           // When an ally takes damage
  ON_KILL = 'on_kill',                   // After killing an enemy
  ON_LOW_HP = 'on_low_hp',               // When HP drops below 25%
  ON_DEBUFF_RECEIVED = 'on_debuff_received', // When receiving a debuff
}

// ============================================
// UTILITY EFFECTS (weapon enchants)
// ============================================

export enum UtilityEffect {
  FIRE_ENCHANT = 'fire_enchant',         // Adds burn chance
  ICE_ENCHANT = 'ice_enchant',           // Adds slow chance
  LIGHTNING_ENCHANT = 'lightning_enchant', // Adds stun chance
  SHADOW_ENCHANT = 'shadow_enchant',     // Adds blind chance
  HOLY_ENCHANT = 'holy_enchant',         // Adds bonus vs undead
  POISON_ENCHANT = 'poison_enchant',     // Adds poison chance
}

// ============================================
// COMBAT ENTITY (Player or Enemy in combat)
// ============================================

export interface CombatEntity {
  id: string
  name: string
  isPlayer: boolean
  
  // Current Stats
  currentHp: number
  maxHp: number
  currentAp: number
  maxAp: number
  
  // Base Stats
  str: number
  agi: number
  vit: number
  int: number
  dex: number
  luk: number
  
  // Derived Combat Stats
  baseDamage: number             // From weapon
  defense: number                // Damage reduction %
  magicResist: number            // Magic damage reduction %
  accuracy: number               // Hit chance %
  dodgeChance: number            // Evade chance %
  critChance: number             // Critical hit chance %
  critMultiplier: number         // Critical damage multiplier (e.g., 1.5 = 150%)
  
  // Status Effects
  buffs: BuffEffect[]
  debuffs: DebuffEffect[]
  
  // Position (for AoE calculations)
  position: { x: number; y: number }
  
  // Skills
  equippedSkillIds: string[]
  skillCooldowns: Record<string, number>  // skillId -> turns remaining
}

// ============================================
// SKILL (Combat-ready version)
// ============================================

export interface CombatSkill {
  id: string
  name: string
  description: string
  executionDescription?: string
  
  // Type
  skillType: string              // Attack, Defensive, Buff, Debuff, etc.
  damageType: DamageType
  
  // Combat Stats
  ampPercent: number             // 50-200% multiplier
  apCost: number                 // 3-10 AP
  cooldown: number               // 1-5 turns
  
  // Targeting
  targetType: TargetType
  range: number                  // 1 = melee, 2+ = ranged
  hitCount: number               // 1-4 hits
  
  // Effects
  buffType?: BuffType
  buffValue?: number             // Strength of buff
  buffDuration?: number
  
  debuffType?: DebuffType
  debuffValue?: number           // Strength of debuff
  debuffDuration?: number
  debuffChance?: number          // 0-100%
  
  // Special Modifiers
  lifestealPercent?: number      // 0-100%
  armorPierce?: number           // 0-100%
  bonusVsGuard?: number          // Extra damage % vs guarding
  bonusVsDebuffed?: number       // Extra damage % vs debuffed
  
  // Counter/Reactive
  isCounter: boolean
  triggerCondition?: TriggerCondition
  
  // Utility
  hasUtilityMode: boolean
  utilityEffect?: UtilityEffect
  utilityDuration?: number
}

// ============================================
// COMBAT ACTION RESULT
// ============================================

export interface DamageInstance {
  amount: number
  type: DamageType
  isCrit: boolean
  isBlocked: boolean
  isDodged: boolean
  hitNumber: number              // Which hit in a multi-hit (1, 2, 3...)
}

export interface CombatActionResult {
  success: boolean
  skillUsed: CombatSkill
  attacker: CombatEntity
  targets: CombatEntity[]
  
  // Damage dealt to each target
  damageDealt: Map<string, DamageInstance[]>  // targetId -> damage instances
  
  // Total damage for convenience
  totalDamage: number
  
  // Effects applied
  buffsApplied: { target: CombatEntity; buff: BuffEffect }[]
  debuffsApplied: { target: CombatEntity; debuff: DebuffEffect }[]
  
  // Healing done (lifesteal)
  healingDone: number
  
  // Narrative
  combatLog: string[]
}

// ============================================
// TURN RESULT (for DoT ticks, regen, etc.)
// ============================================

export interface TurnStartResult {
  entity: CombatEntity
  
  // DoT damage taken
  dotDamage: { type: DebuffType; amount: number }[]
  totalDotDamage: number
  
  // Regen healing
  regenHealing: number
  
  // AP regeneration
  apGained: number
  
  // Effects that expired
  expiredBuffs: BuffType[]
  expiredDebuffs: DebuffType[]
  
  // Is entity stunned this turn?
  isStunned: boolean
  isSilenced: boolean
  isRooted: boolean
  
  // Combat log
  combatLog: string[]
}
