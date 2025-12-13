// ============================================
// SKILL EXECUTION MODULE
// Handles the full execution of a skill in combat
// ============================================

import {
  CombatEntity,
  CombatSkill,
  CombatActionResult,
  DamageInstance,
  BuffType,
  DebuffType,
  TriggerCondition,
} from './types'

import {
  applyBuff,
  applyDebuff,
  breakStealth,
  hasDebuff,
} from './status-effects'

import {
  calculateMultiHit,
  applyLifesteal,
  rollDebuffApplication,
  canUseSkill,
  consumeSkillResources,
  isInRange,
  getAoETargets,
} from './damage-calculator'

// ============================================
// MAIN SKILL EXECUTION
// ============================================

/**
 * Execute a skill from attacker to target(s)
 * This is the main entry point for skill usage in combat
 */
export function executeSkill(
  attacker: CombatEntity,
  primaryTarget: CombatEntity | null,
  skill: CombatSkill,
  allEntities: CombatEntity[],
  isGuarding: Map<string, boolean> = new Map()
): CombatActionResult {
  const result: CombatActionResult = {
    success: false,
    skillUsed: skill,
    attacker,
    targets: [],
    damageDealt: new Map(),
    totalDamage: 0,
    buffsApplied: [],
    debuffsApplied: [],
    healingDone: 0,
    combatLog: [],
  }
  
  // ============================================
  // PRE-EXECUTION CHECKS
  // ============================================
  
  // Check if skill can be used
  const { canUse, reason } = canUseSkill(attacker, skill)
  if (!canUse) {
    result.combatLog.push(`${attacker.name} cannot use ${skill.name}: ${reason}`)
    return result
  }
  
  // Check range for targeted skills
  if (primaryTarget && skill.targetType !== 'self' && skill.targetType !== 'all_enemies') {
    if (!isInRange(attacker, primaryTarget, skill)) {
      result.combatLog.push(`${attacker.name} cannot reach ${primaryTarget.name} with ${skill.name}`)
      return result
    }
  }
  
  // Break stealth when attacking
  if (skill.damageType !== 'none') {
    breakStealth(attacker)
  }
  
  // ============================================
  // CONSUME RESOURCES
  // ============================================
  
  consumeSkillResources(attacker, skill)
  result.combatLog.push(`${attacker.name} uses ${skill.name}!`)
  
  if (skill.executionDescription) {
    result.combatLog.push(`"${skill.executionDescription}"`)
  }
  
  result.success = true
  
  // ============================================
  // GET TARGETS
  // ============================================
  
  const targets = getAoETargets(attacker, allEntities, skill, primaryTarget || undefined)
  result.targets = targets
  
  if (targets.length === 0 && skill.targetType !== 'self') {
    result.combatLog.push('No valid targets!')
    return result
  }
  
  // ============================================
  // APPLY SELF BUFFS (if skill has buff and targets self)
  // ============================================
  
  if (skill.buffType && skill.targetType === 'self') {
    const buffResult = applyBuff(
      attacker,
      skill.buffType as BuffType,
      skill.buffValue || 10,
      skill.buffDuration || 3,
      skill.id
    )
    if (buffResult.applied) {
      result.buffsApplied.push({
        target: attacker,
        buff: {
          type: skill.buffType as BuffType,
          value: skill.buffValue || 10,
          duration: skill.buffDuration || 3,
          sourceSkillId: skill.id,
        },
      })
    }
    result.combatLog.push(buffResult.message)
  }
  
  // ============================================
  // DEAL DAMAGE TO EACH TARGET
  // ============================================
  
  let totalDamageDealt = 0
  
  for (const target of targets) {
    // Skip self for damage (unless it's a self-damage skill, which we don't have)
    if (target.id === attacker.id && skill.targetType !== 'self') {
      continue
    }
    
    const targetGuarding = isGuarding.get(target.id) || false
    
    // Calculate all hits
    const damageInstances = calculateMultiHit(attacker, target, skill, targetGuarding)
    result.damageDealt.set(target.id, damageInstances)
    
    // Sum up damage
    const targetDamage = damageInstances.reduce((sum, d) => sum + d.amount, 0)
    totalDamageDealt += targetDamage
    
    // Generate combat log for hits
    for (const instance of damageInstances) {
      if (instance.isDodged) {
        result.combatLog.push(`${target.name} dodges!`)
      } else if (instance.amount > 0) {
        let logEntry = `${target.name} takes ${instance.amount} damage`
        if (instance.isCrit) logEntry += ' (CRITICAL!)'
        if (instance.isBlocked) logEntry += ' (blocked)'
        result.combatLog.push(logEntry)
      }
    }
    
    // Check if target died
    if (target.currentHp <= 0) {
      result.combatLog.push(`${target.name} is defeated!`)
    }
    
    // ============================================
    // APPLY DEBUFFS
    // ============================================
    
    if (skill.debuffType && target.currentHp > 0) {
      // Only apply if at least one hit landed
      const hitLanded = damageInstances.some(d => !d.isDodged && d.amount > 0)
      
      if (hitLanded && rollDebuffApplication(skill)) {
        const debuffResult = applyDebuff(
          target,
          skill.debuffType as DebuffType,
          skill.debuffValue || 10,
          skill.debuffDuration || 2,
          skill.id,
          attacker.id
        )
        if (debuffResult.applied) {
          result.debuffsApplied.push({
            target,
            debuff: {
              type: skill.debuffType as DebuffType,
              value: skill.debuffValue || 10,
              duration: skill.debuffDuration || 2,
              sourceSkillId: skill.id,
              sourceEntityId: attacker.id,
            },
          })
        }
        result.combatLog.push(debuffResult.message)
      }
    }
    
    // ============================================
    // APPLY BUFFS TO ALLIES (for support skills)
    // ============================================
    
    if (skill.buffType && skill.targetType !== 'self' && target.isPlayer === attacker.isPlayer) {
      const buffResult = applyBuff(
        target,
        skill.buffType as BuffType,
        skill.buffValue || 10,
        skill.buffDuration || 3,
        skill.id
      )
      if (buffResult.applied) {
        result.buffsApplied.push({
          target,
          buff: {
            type: skill.buffType as BuffType,
            value: skill.buffValue || 10,
            duration: skill.buffDuration || 3,
            sourceSkillId: skill.id,
          },
        })
      }
      result.combatLog.push(buffResult.message)
    }
  }
  
  result.totalDamage = totalDamageDealt
  
  // ============================================
  // APPLY LIFESTEAL
  // ============================================
  
  if (skill.lifestealPercent && totalDamageDealt > 0) {
    const healing = applyLifesteal(attacker, totalDamageDealt, skill.lifestealPercent)
    result.healingDone = healing
    if (healing > 0) {
      result.combatLog.push(`${attacker.name} drains ${healing} HP!`)
    }
  }
  
  return result
}

// ============================================
// COUNTER SKILL SYSTEM
// ============================================

/**
 * Check if any counter skills should trigger
 */
export function checkCounterTriggers(
  entity: CombatEntity,
  trigger: TriggerCondition,
  triggerSource: CombatEntity,
  allSkills: CombatSkill[]
): CombatSkill | null {
  // Find equipped counter skills that match the trigger
  for (const skillId of entity.equippedSkillIds) {
    const skill = allSkills.find(s => s.id === skillId)
    
    if (skill && skill.isCounter && skill.triggerCondition === trigger) {
      // Check if skill can be used (cooldown, AP)
      const { canUse } = canUseSkill(entity, skill)
      if (canUse) {
        return skill
      }
    }
  }
  
  return null
}

/**
 * Execute a counter skill
 */
export function executeCounterSkill(
  defender: CombatEntity,
  attacker: CombatEntity,
  counterSkill: CombatSkill,
  allEntities: CombatEntity[]
): CombatActionResult {
  const result = executeSkill(defender, attacker, counterSkill, allEntities)
  
  if (result.success) {
    result.combatLog.unshift(`${defender.name} counters with ${counterSkill.name}!`)
  }
  
  return result
}

// ============================================
// TRIGGER CONDITION HELPERS
// ============================================

/**
 * Determine which trigger condition applies based on combat event
 */
export function getTriggerFromEvent(
  event: 'dodge' | 'parry' | 'hit_taken' | 'crit_taken' | 'ally_hit' | 'kill' | 'low_hp' | 'debuff_received'
): TriggerCondition {
  const mapping: Record<string, TriggerCondition> = {
    'dodge': TriggerCondition.AFTER_DODGE,
    'parry': TriggerCondition.AFTER_PARRY,
    'hit_taken': TriggerCondition.ON_HIT_TAKEN,
    'crit_taken': TriggerCondition.ON_CRIT_TAKEN,
    'ally_hit': TriggerCondition.ON_ALLY_HIT,
    'kill': TriggerCondition.ON_KILL,
    'low_hp': TriggerCondition.ON_LOW_HP,
    'debuff_received': TriggerCondition.ON_DEBUFF_RECEIVED,
  }
  return mapping[event]
}

/**
 * Check if entity is at low HP (below 25%)
 */
export function isLowHp(entity: CombatEntity): boolean {
  return entity.currentHp / entity.maxHp < 0.25
}

// ============================================
// UTILITY MODE (Weapon Enchants)
// ============================================

/**
 * Apply utility mode effect (weapon enchant)
 * This adds a chance to apply a debuff based on the enchant type
 */
export function getUtilityModeDebuff(skill: CombatSkill): {
  debuffType: DebuffType
  debuffValue: number
  debuffDuration: number
  debuffChance: number
} | null {
  if (!skill.hasUtilityMode || !skill.utilityEffect) {
    return null
  }
  
  switch (skill.utilityEffect) {
    case 'fire_enchant':
      return {
        debuffType: DebuffType.BURN,
        debuffValue: 15,
        debuffDuration: 3,
        debuffChance: 30,
      }
    case 'ice_enchant':
      return {
        debuffType: DebuffType.SLOW,
        debuffValue: 2,
        debuffDuration: 2,
        debuffChance: 25,
      }
    case 'lightning_enchant':
      return {
        debuffType: DebuffType.STUN,
        debuffValue: 0,
        debuffDuration: 1,
        debuffChance: 15,
      }
    case 'shadow_enchant':
      return {
        debuffType: DebuffType.BLIND,
        debuffValue: 30,
        debuffDuration: 2,
        debuffChance: 25,
      }
    case 'poison_enchant':
      return {
        debuffType: DebuffType.POISON,
        debuffValue: 3,
        debuffDuration: 4,
        debuffChance: 35,
      }
    default:
      return null
  }
}

// ============================================
// BASIC ATTACK
// ============================================

/**
 * Create a basic attack skill (for when silenced or no AP)
 */
export function createBasicAttack(damageType: 'physical' | 'magic' = 'physical'): CombatSkill {
  return {
    id: 'basic_attack',
    name: 'Basic Attack',
    description: 'A simple attack with your weapon.',
    skillType: 'Attack',
    damageType: damageType === 'physical' ? 'physical' as any : 'magic' as any,
    ampPercent: 100,
    apCost: 0,
    cooldown: 0,
    targetType: 'single' as any,
    range: 1,
    hitCount: 1,
    isCounter: false,
    hasUtilityMode: false,
  }
}

// ============================================
// GUARD ACTION
// ============================================

/**
 * Execute guard action (reduces damage taken this turn)
 */
export function executeGuard(entity: CombatEntity): string[] {
  const log: string[] = []
  
  // Guard costs 0 AP but uses the turn
  log.push(`${entity.name} takes a defensive stance!`)
  
  // The actual damage reduction is handled in the damage calculator
  // by checking the isGuarding map
  
  return log
}
