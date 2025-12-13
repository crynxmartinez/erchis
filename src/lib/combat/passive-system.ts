// ============================================
// PASSIVE SYSTEM
// Handles passive skill effects that are always active
// ============================================

import {
  CombatEntity,
  CombatSkill,
  BuffType,
  DebuffType,
} from './types'

// ============================================
// PASSIVE EFFECT TYPES
// ============================================

export enum PassiveEffectType {
  // Stat Bonuses
  DAMAGE_BONUS = 'damage_bonus',           // +X% damage
  CRIT_BONUS = 'crit_bonus',               // +X% crit chance
  DEFENSE_BONUS = 'defense_bonus',         // +X% defense
  DODGE_BONUS = 'dodge_bonus',             // +X% dodge
  ACCURACY_BONUS = 'accuracy_bonus',       // +X% accuracy
  HP_BONUS = 'hp_bonus',                   // +X% max HP
  AP_BONUS = 'ap_bonus',                   // +X max AP
  AP_REGEN_BONUS = 'ap_regen_bonus',       // +X AP per turn
  
  // Conditional Bonuses
  LOW_HP_DAMAGE = 'low_hp_damage',         // +X% damage when below 25% HP
  FULL_HP_DEFENSE = 'full_hp_defense',     // +X% defense when at full HP
  FIRST_STRIKE = 'first_strike',           // +X% damage on first attack
  FINISHER = 'finisher',                   // +X% damage vs low HP enemies
  
  // Proc Effects
  LIFESTEAL_CHANCE = 'lifesteal_chance',   // X% chance to lifesteal Y%
  BLEED_CHANCE = 'bleed_chance',           // X% chance to apply bleed
  STUN_CHANCE = 'stun_chance',             // X% chance to stun
  
  // Special
  COUNTER_DAMAGE = 'counter_damage',       // +X% counter attack damage
  AOE_DAMAGE = 'aoe_damage',               // +X% AoE damage
  DOT_DAMAGE = 'dot_damage',               // +X% DoT damage
  BUFF_DURATION = 'buff_duration',         // +X turns to buff durations
  DEBUFF_DURATION = 'debuff_duration',     // +X turns to debuff durations
}

// ============================================
// PASSIVE EFFECT STRUCTURE
// ============================================

export interface PassiveEffect {
  type: PassiveEffectType
  value: number
  condition?: PassiveCondition
}

export interface PassiveCondition {
  type: 'hp_below' | 'hp_above' | 'hp_full' | 'has_buff' | 'has_debuff' | 'first_turn' | 'target_low_hp'
  threshold?: number
  buffType?: BuffType
  debuffType?: DebuffType
}

// ============================================
// PASSIVE PARSING
// ============================================

/**
 * Parse a passive string into structured effects
 * Examples:
 * - "+5% damage" -> { type: DAMAGE_BONUS, value: 5 }
 * - "+10% crit chance" -> { type: CRIT_BONUS, value: 10 }
 * - "+15% damage when below 25% HP" -> { type: LOW_HP_DAMAGE, value: 15 }
 */
export function parsePassive(passiveString: string | null): PassiveEffect[] {
  if (!passiveString) return []
  
  const effects: PassiveEffect[] = []
  const normalized = passiveString.toLowerCase()
  
  // Pattern matching for common passive formats
  const patterns: { regex: RegExp; type: PassiveEffectType; condition?: PassiveCondition }[] = [
    // Basic stat bonuses
    { regex: /\+(\d+)%?\s*damage/i, type: PassiveEffectType.DAMAGE_BONUS },
    { regex: /\+(\d+)%?\s*crit(ical)?\s*(chance)?/i, type: PassiveEffectType.CRIT_BONUS },
    { regex: /\+(\d+)%?\s*defense/i, type: PassiveEffectType.DEFENSE_BONUS },
    { regex: /\+(\d+)%?\s*dodge/i, type: PassiveEffectType.DODGE_BONUS },
    { regex: /\+(\d+)%?\s*accuracy/i, type: PassiveEffectType.ACCURACY_BONUS },
    { regex: /\+(\d+)%?\s*(max\s*)?hp/i, type: PassiveEffectType.HP_BONUS },
    { regex: /\+(\d+)\s*(max\s*)?ap(?!\s*regen)/i, type: PassiveEffectType.AP_BONUS },
    { regex: /\+(\d+)\s*ap\s*regen/i, type: PassiveEffectType.AP_REGEN_BONUS },
    
    // Conditional bonuses
    { 
      regex: /\+(\d+)%?\s*damage\s*(when|while|if)\s*(below|under)\s*(\d+)%\s*hp/i, 
      type: PassiveEffectType.LOW_HP_DAMAGE,
      condition: { type: 'hp_below', threshold: 25 }
    },
    { 
      regex: /\+(\d+)%?\s*defense\s*(when|while|if)\s*(at\s*)?full\s*hp/i, 
      type: PassiveEffectType.FULL_HP_DEFENSE,
      condition: { type: 'hp_full' }
    },
    { 
      regex: /\+(\d+)%?\s*damage\s*(on\s*)?(first|opening)\s*(attack|strike)/i, 
      type: PassiveEffectType.FIRST_STRIKE,
      condition: { type: 'first_turn' }
    },
    { 
      regex: /\+(\d+)%?\s*damage\s*(vs|against)\s*(low\s*hp|wounded)/i, 
      type: PassiveEffectType.FINISHER,
      condition: { type: 'target_low_hp', threshold: 25 }
    },
    
    // Proc effects
    { regex: /(\d+)%?\s*chance\s*to\s*lifesteal\s*(\d+)%?/i, type: PassiveEffectType.LIFESTEAL_CHANCE },
    { regex: /(\d+)%?\s*chance\s*to\s*(apply\s*)?bleed/i, type: PassiveEffectType.BLEED_CHANCE },
    { regex: /(\d+)%?\s*chance\s*to\s*stun/i, type: PassiveEffectType.STUN_CHANCE },
    
    // Special
    { regex: /\+(\d+)%?\s*counter\s*(attack\s*)?damage/i, type: PassiveEffectType.COUNTER_DAMAGE },
    { regex: /\+(\d+)%?\s*aoe\s*damage/i, type: PassiveEffectType.AOE_DAMAGE },
    { regex: /\+(\d+)%?\s*(dot|damage\s*over\s*time)\s*damage/i, type: PassiveEffectType.DOT_DAMAGE },
    { regex: /\+(\d+)\s*(turn|round)s?\s*(to\s*)?buff\s*duration/i, type: PassiveEffectType.BUFF_DURATION },
    { regex: /\+(\d+)\s*(turn|round)s?\s*(to\s*)?debuff\s*duration/i, type: PassiveEffectType.DEBUFF_DURATION },
  ]
  
  for (const pattern of patterns) {
    const match = normalized.match(pattern.regex)
    if (match) {
      effects.push({
        type: pattern.type,
        value: parseInt(match[1], 10),
        condition: pattern.condition,
      })
    }
  }
  
  return effects
}

// ============================================
// PASSIVE APPLICATION
// ============================================

/**
 * Calculate total passive bonus for a specific effect type
 */
export function getPassiveBonus(
  entity: CombatEntity,
  effectType: PassiveEffectType,
  skills: CombatSkill[],
  context?: PassiveContext
): number {
  let totalBonus = 0
  
  // Get all equipped skills
  const equippedSkills = skills.filter(s => entity.equippedSkillIds.includes(s.id))
  
  for (const skill of equippedSkills) {
    const passives = parsePassive(skill.description) // Or use a dedicated passive field
    
    for (const passive of passives) {
      if (passive.type !== effectType) continue
      
      // Check condition
      if (passive.condition && !checkPassiveCondition(entity, passive.condition, context)) {
        continue
      }
      
      totalBonus += passive.value
    }
  }
  
  return totalBonus
}

export interface PassiveContext {
  isFirstTurn?: boolean
  targetHpPercent?: number
}

/**
 * Check if a passive condition is met
 */
function checkPassiveCondition(
  entity: CombatEntity,
  condition: PassiveCondition,
  context?: PassiveContext
): boolean {
  const hpPercent = (entity.currentHp / entity.maxHp) * 100
  
  switch (condition.type) {
    case 'hp_below':
      return hpPercent < (condition.threshold || 25)
    case 'hp_above':
      return hpPercent > (condition.threshold || 75)
    case 'hp_full':
      return entity.currentHp >= entity.maxHp
    case 'first_turn':
      return context?.isFirstTurn || false
    case 'target_low_hp':
      return (context?.targetHpPercent || 100) < (condition.threshold || 25)
    case 'has_buff':
      return condition.buffType ? entity.buffs.some(b => b.type === condition.buffType) : false
    case 'has_debuff':
      return condition.debuffType ? entity.debuffs.some(d => d.type === condition.debuffType) : false
    default:
      return true
  }
}

// ============================================
// PASSIVE STAT MODIFIERS
// ============================================

/**
 * Get all passive stat modifiers for an entity
 */
export function getPassiveStatModifiers(
  entity: CombatEntity,
  skills: CombatSkill[],
  context?: PassiveContext
): PassiveStatModifiers {
  return {
    damageBonus: getPassiveBonus(entity, PassiveEffectType.DAMAGE_BONUS, skills, context),
    critBonus: getPassiveBonus(entity, PassiveEffectType.CRIT_BONUS, skills, context),
    defenseBonus: getPassiveBonus(entity, PassiveEffectType.DEFENSE_BONUS, skills, context),
    dodgeBonus: getPassiveBonus(entity, PassiveEffectType.DODGE_BONUS, skills, context),
    accuracyBonus: getPassiveBonus(entity, PassiveEffectType.ACCURACY_BONUS, skills, context),
    hpBonus: getPassiveBonus(entity, PassiveEffectType.HP_BONUS, skills, context),
    apBonus: getPassiveBonus(entity, PassiveEffectType.AP_BONUS, skills, context),
    apRegenBonus: getPassiveBonus(entity, PassiveEffectType.AP_REGEN_BONUS, skills, context),
    lowHpDamage: getPassiveBonus(entity, PassiveEffectType.LOW_HP_DAMAGE, skills, context),
    fullHpDefense: getPassiveBonus(entity, PassiveEffectType.FULL_HP_DEFENSE, skills, context),
    firstStrike: getPassiveBonus(entity, PassiveEffectType.FIRST_STRIKE, skills, context),
    finisher: getPassiveBonus(entity, PassiveEffectType.FINISHER, skills, context),
    counterDamage: getPassiveBonus(entity, PassiveEffectType.COUNTER_DAMAGE, skills, context),
    aoeDamage: getPassiveBonus(entity, PassiveEffectType.AOE_DAMAGE, skills, context),
    dotDamage: getPassiveBonus(entity, PassiveEffectType.DOT_DAMAGE, skills, context),
    buffDuration: getPassiveBonus(entity, PassiveEffectType.BUFF_DURATION, skills, context),
    debuffDuration: getPassiveBonus(entity, PassiveEffectType.DEBUFF_DURATION, skills, context),
  }
}

export interface PassiveStatModifiers {
  damageBonus: number
  critBonus: number
  defenseBonus: number
  dodgeBonus: number
  accuracyBonus: number
  hpBonus: number
  apBonus: number
  apRegenBonus: number
  lowHpDamage: number
  fullHpDefense: number
  firstStrike: number
  finisher: number
  counterDamage: number
  aoeDamage: number
  dotDamage: number
  buffDuration: number
  debuffDuration: number
}

// ============================================
// APPLY PASSIVES TO ENTITY
// ============================================

/**
 * Apply passive HP and AP bonuses to entity max values
 * Should be called when combat starts or skills change
 */
export function applyPassiveMaxStats(
  entity: CombatEntity,
  skills: CombatSkill[]
): void {
  const modifiers = getPassiveStatModifiers(entity, skills)
  
  // Apply HP bonus
  if (modifiers.hpBonus > 0) {
    const bonusHp = Math.floor(entity.maxHp * (modifiers.hpBonus / 100))
    entity.maxHp += bonusHp
    entity.currentHp += bonusHp // Also heal for the bonus amount
  }
  
  // Apply AP bonus
  if (modifiers.apBonus > 0) {
    entity.maxAp += modifiers.apBonus
    entity.currentAp += modifiers.apBonus
  }
}
