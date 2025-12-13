// ============================================
// SKILL CONVERTER
// Converts database Skill objects to combat-ready CombatSkill objects
// ============================================

import {
  CombatSkill,
  DamageType,
  TargetType,
  BuffType,
  DebuffType,
  TriggerCondition,
  UtilityEffect,
} from './types'

// ============================================
// DATABASE SKILL INTERFACE
// This matches the Prisma Skill model
// ============================================

export interface DatabaseSkill {
  id: string
  name: string
  description: string
  executionDescription?: string | null
  
  skillType: string
  damageType: string
  
  weaponRequirement: string
  
  hasUtilityMode: boolean
  utilityEffect?: string | null
  utilityDuration?: number | null
  
  starterSkillName: string
  parentId?: string | null
  stage: number
  variantType: string
  
  ampPercent: number
  apCost: number
  cooldown: number
  
  targetType: string
  range: number
  hitCount: number
  
  buffType?: string | null
  buffValue?: number | null
  buffDuration?: number | null
  
  debuffType?: string | null
  debuffValue?: number | null
  debuffDuration?: number | null
  debuffChance?: number | null
  
  lifestealPercent?: number | null
  armorPierce?: number | null
  bonusVsGuard?: number | null
  bonusVsDebuffed?: number | null
  
  isCounter: boolean
  isReaction: boolean
  triggerCondition?: string | null
  
  passive?: string | null
  
  speed: number
  
  narrativeSuccess?: string | null
  narrativeCrit?: string | null
  narrativeMiss?: string | null
  narrativeBlocked?: string | null
  
  isSaved: boolean
  isLocked: boolean
}

// ============================================
// STRING TO ENUM CONVERTERS
// ============================================

function toDamageType(str: string): DamageType {
  const mapping: Record<string, DamageType> = {
    'physical': DamageType.PHYSICAL,
    'magic': DamageType.MAGIC,
    'true': DamageType.TRUE,
    'none': DamageType.NONE,
  }
  return mapping[str.toLowerCase()] || DamageType.PHYSICAL
}

function toTargetType(str: string): TargetType {
  const mapping: Record<string, TargetType> = {
    'single': TargetType.SINGLE,
    'self': TargetType.SELF,
    'ally': TargetType.ALLY,
    'all_allies': TargetType.ALL_ALLIES,
    'aoe_cone': TargetType.AOE_CONE,
    'aoe_circle': TargetType.AOE_CIRCLE,
    'aoe_line': TargetType.AOE_LINE,
    'all_enemies': TargetType.ALL_ENEMIES,
  }
  return mapping[str.toLowerCase()] || TargetType.SINGLE
}

function toBuffType(str: string | null | undefined): BuffType | undefined {
  if (!str) return undefined
  
  const mapping: Record<string, BuffType> = {
    'empower': BuffType.EMPOWER,
    'focus': BuffType.FOCUS,
    'precision': BuffType.PRECISION,
    'berserk': BuffType.BERSERK,
    'fortify': BuffType.FORTIFY,
    'barrier': BuffType.BARRIER,
    'evasion': BuffType.EVASION,
    'reflect': BuffType.REFLECT,
    'haste': BuffType.HASTE,
    'regen': BuffType.REGEN,
    'stealth': BuffType.STEALTH,
    'immunity': BuffType.IMMUNITY,
  }
  return mapping[str.toLowerCase()]
}

function toDebuffType(str: string | null | undefined): DebuffType | undefined {
  if (!str) return undefined
  
  const mapping: Record<string, DebuffType> = {
    'bleed': DebuffType.BLEED,
    'burn': DebuffType.BURN,
    'poison': DebuffType.POISON,
    'weaken': DebuffType.WEAKEN,
    'armor_break': DebuffType.ARMOR_BREAK,
    'slow': DebuffType.SLOW,
    'blind': DebuffType.BLIND,
    'stun': DebuffType.STUN,
    'root': DebuffType.ROOT,
    'silence': DebuffType.SILENCE,
    'taunt': DebuffType.TAUNT,
    'marked': DebuffType.MARKED,
    'curse': DebuffType.CURSE,
  }
  return mapping[str.toLowerCase()]
}

function toTriggerCondition(str: string | null | undefined): TriggerCondition | undefined {
  if (!str) return undefined
  
  const mapping: Record<string, TriggerCondition> = {
    'after_dodge': TriggerCondition.AFTER_DODGE,
    'after_parry': TriggerCondition.AFTER_PARRY,
    'on_hit_taken': TriggerCondition.ON_HIT_TAKEN,
    'on_crit_taken': TriggerCondition.ON_CRIT_TAKEN,
    'on_ally_hit': TriggerCondition.ON_ALLY_HIT,
    'on_kill': TriggerCondition.ON_KILL,
    'on_low_hp': TriggerCondition.ON_LOW_HP,
    'on_debuff_received': TriggerCondition.ON_DEBUFF_RECEIVED,
  }
  return mapping[str.toLowerCase()]
}

function toUtilityEffect(str: string | null | undefined): UtilityEffect | undefined {
  if (!str) return undefined
  
  const mapping: Record<string, UtilityEffect> = {
    'fire_enchant': UtilityEffect.FIRE_ENCHANT,
    'ice_enchant': UtilityEffect.ICE_ENCHANT,
    'lightning_enchant': UtilityEffect.LIGHTNING_ENCHANT,
    'shadow_enchant': UtilityEffect.SHADOW_ENCHANT,
    'holy_enchant': UtilityEffect.HOLY_ENCHANT,
    'poison_enchant': UtilityEffect.POISON_ENCHANT,
  }
  return mapping[str.toLowerCase()]
}

// ============================================
// MAIN CONVERTER FUNCTION
// ============================================

/**
 * Convert a database Skill to a combat-ready CombatSkill
 */
export function convertToCombatSkill(dbSkill: DatabaseSkill): CombatSkill {
  return {
    id: dbSkill.id,
    name: dbSkill.name,
    description: dbSkill.description,
    executionDescription: dbSkill.executionDescription || undefined,
    
    skillType: dbSkill.skillType,
    damageType: toDamageType(dbSkill.damageType),
    
    ampPercent: dbSkill.ampPercent,
    apCost: dbSkill.apCost,
    cooldown: dbSkill.cooldown,
    
    targetType: toTargetType(dbSkill.targetType),
    range: dbSkill.range,
    hitCount: dbSkill.hitCount,
    
    buffType: toBuffType(dbSkill.buffType),
    buffValue: dbSkill.buffValue || getDefaultBuffValue(toBuffType(dbSkill.buffType)),
    buffDuration: dbSkill.buffDuration || undefined,
    
    debuffType: toDebuffType(dbSkill.debuffType),
    debuffValue: dbSkill.debuffValue || getDefaultDebuffValue(toDebuffType(dbSkill.debuffType)),
    debuffDuration: dbSkill.debuffDuration || undefined,
    debuffChance: dbSkill.debuffChance || undefined,
    
    lifestealPercent: dbSkill.lifestealPercent || undefined,
    armorPierce: dbSkill.armorPierce || undefined,
    bonusVsGuard: dbSkill.bonusVsGuard || undefined,
    bonusVsDebuffed: dbSkill.bonusVsDebuffed || undefined,
    
    isCounter: dbSkill.isCounter,
    isReaction: dbSkill.isReaction || false,
    triggerCondition: toTriggerCondition(dbSkill.triggerCondition),
    
    hasUtilityMode: dbSkill.hasUtilityMode,
    utilityEffect: toUtilityEffect(dbSkill.utilityEffect),
    utilityDuration: dbSkill.utilityDuration || undefined,
    
    speed: dbSkill.speed || 50,
    
    narrativeSuccess: dbSkill.narrativeSuccess || undefined,
    narrativeCrit: dbSkill.narrativeCrit || undefined,
    narrativeMiss: dbSkill.narrativeMiss || undefined,
    narrativeBlocked: dbSkill.narrativeBlocked || undefined,
  }
}

/**
 * Convert multiple database skills to combat skills
 */
export function convertToCombatSkills(dbSkills: DatabaseSkill[]): CombatSkill[] {
  return dbSkills.map(convertToCombatSkill)
}

// ============================================
// DEFAULT VALUE HELPERS
// ============================================

/**
 * Get default buff value based on buff type
 * These can be overridden by skill-specific values in the future
 */
function getDefaultBuffValue(buffType: BuffType | undefined): number | undefined {
  if (!buffType) return undefined
  
  const defaults: Record<BuffType, number> = {
    [BuffType.EMPOWER]: 20,      // +20% damage
    [BuffType.FOCUS]: 15,        // +15% crit
    [BuffType.PRECISION]: 20,    // +20% accuracy
    [BuffType.BERSERK]: 30,      // +30% damage, -30% defense
    [BuffType.FORTIFY]: 25,      // +25% defense
    [BuffType.BARRIER]: 50,      // Absorb 50 damage
    [BuffType.EVASION]: 20,      // +20% dodge
    [BuffType.REFLECT]: 25,      // Reflect 25% damage
    [BuffType.HASTE]: 2,         // +2 AP per turn
    [BuffType.REGEN]: 10,        // +10 HP per turn
    [BuffType.STEALTH]: 0,       // No value needed
    [BuffType.IMMUNITY]: 0,      // No value needed
  }
  
  return defaults[buffType]
}

/**
 * Get default debuff value based on debuff type
 */
function getDefaultDebuffValue(debuffType: DebuffType | undefined): number | undefined {
  if (!debuffType) return undefined
  
  const defaults: Record<DebuffType, number> = {
    [DebuffType.BLEED]: 15,       // 15 damage per turn
    [DebuffType.BURN]: 20,        // 20 damage per turn
    [DebuffType.POISON]: 5,       // 5% max HP per turn
    [DebuffType.WEAKEN]: 20,      // -20% damage
    [DebuffType.ARMOR_BREAK]: 25, // -25% defense
    [DebuffType.SLOW]: 2,         // -2 AP per turn
    [DebuffType.BLIND]: 30,       // -30% accuracy
    [DebuffType.STUN]: 0,         // No value needed
    [DebuffType.ROOT]: 0,         // No value needed
    [DebuffType.SILENCE]: 0,      // No value needed
    [DebuffType.TAUNT]: 0,        // No value needed
    [DebuffType.MARKED]: 25,      // +25% damage taken
    [DebuffType.CURSE]: 50,       // -50% healing
  }
  
  return defaults[debuffType]
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate a database skill has all required fields for combat
 */
export function validateSkillForCombat(dbSkill: DatabaseSkill): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (!dbSkill.id) errors.push('Missing skill ID')
  if (!dbSkill.name) errors.push('Missing skill name')
  if (dbSkill.ampPercent < 0 || dbSkill.ampPercent > 500) {
    errors.push(`Invalid ampPercent: ${dbSkill.ampPercent} (should be 0-500)`)
  }
  if (dbSkill.apCost < 0 || dbSkill.apCost > 20) {
    errors.push(`Invalid apCost: ${dbSkill.apCost} (should be 0-20)`)
  }
  if (dbSkill.cooldown < 0 || dbSkill.cooldown > 10) {
    errors.push(`Invalid cooldown: ${dbSkill.cooldown} (should be 0-10)`)
  }
  if (dbSkill.hitCount < 1 || dbSkill.hitCount > 10) {
    errors.push(`Invalid hitCount: ${dbSkill.hitCount} (should be 1-10)`)
  }
  if (dbSkill.range < 0 || dbSkill.range > 10) {
    errors.push(`Invalid range: ${dbSkill.range} (should be 0-10)`)
  }
  
  // Validate debuff chance
  if (dbSkill.debuffChance !== null && dbSkill.debuffChance !== undefined) {
    if (dbSkill.debuffChance < 0 || dbSkill.debuffChance > 100) {
      errors.push(`Invalid debuffChance: ${dbSkill.debuffChance} (should be 0-100)`)
    }
  }
  
  // Validate lifesteal
  if (dbSkill.lifestealPercent !== null && dbSkill.lifestealPercent !== undefined) {
    if (dbSkill.lifestealPercent < 0 || dbSkill.lifestealPercent > 100) {
      errors.push(`Invalid lifestealPercent: ${dbSkill.lifestealPercent} (should be 0-100)`)
    }
  }
  
  // Validate armor pierce
  if (dbSkill.armorPierce !== null && dbSkill.armorPierce !== undefined) {
    if (dbSkill.armorPierce < 0 || dbSkill.armorPierce > 100) {
      errors.push(`Invalid armorPierce: ${dbSkill.armorPierce} (should be 0-100)`)
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

// ============================================
// SKILL SUMMARY (for UI display)
// ============================================

export interface SkillSummary {
  id: string
  name: string
  type: string
  damageType: string
  apCost: number
  cooldown: number
  ampPercent: number
  targetType: string
  hitCount: number
  range: number
  hasBuff: boolean
  hasDebuff: boolean
  hasLifesteal: boolean
  isCounter: boolean
  tags: string[]
}

/**
 * Generate a summary of a skill for UI display
 */
export function getSkillSummary(skill: DatabaseSkill | CombatSkill): SkillSummary {
  const tags: string[] = []
  
  // Get damage type as string
  const damageTypeStr = String(skill.damageType).toLowerCase()
  if (damageTypeStr === 'physical') tags.push('Physical')
  if (damageTypeStr === 'magic') tags.push('Magic')
  
  if (skill.hitCount > 1) tags.push(`${skill.hitCount}-Hit`)
  if (skill.range > 1) tags.push('Ranged')
  if (skill.buffType) tags.push('Buff')
  if (skill.debuffType) tags.push('Debuff')
  if (skill.lifestealPercent) tags.push('Lifesteal')
  if (skill.armorPierce) tags.push('Pierce')
  if (skill.isCounter) tags.push('Counter')
  
  // Get target type as string
  const targetTypeStr = String(skill.targetType).toLowerCase()
  if (targetTypeStr.includes('aoe') || targetTypeStr === 'all_enemies') tags.push('AoE')
  
  return {
    id: skill.id,
    name: skill.name,
    type: skill.skillType,
    damageType: damageTypeStr,
    apCost: skill.apCost,
    cooldown: skill.cooldown,
    ampPercent: skill.ampPercent,
    targetType: targetTypeStr,
    hitCount: skill.hitCount,
    range: skill.range,
    hasBuff: !!skill.buffType,
    hasDebuff: !!skill.debuffType,
    hasLifesteal: !!skill.lifestealPercent,
    isCounter: skill.isCounter,
    tags,
  }
}
