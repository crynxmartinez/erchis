// ============================================
// DAMAGE CALCULATION MODULE
// Handles all damage calculations for combat
// ============================================

import {
  CombatEntity,
  CombatSkill,
  DamageType,
  DamageInstance,
  DebuffType,
} from './types'

import {
  getDamageModifier,
  getDefenseModifier,
  getCritModifier,
  getAccuracyModifier,
  getDodgeModifier,
  getDamageTakenModifier,
  consumeBarrier,
  getReflectValue,
  hasDebuff,
} from './status-effects'

// ============================================
// CONSTANTS
// ============================================

const BASE_HIT_CHANCE = 90          // Base accuracy %
const BASE_CRIT_CHANCE = 5          // Base crit chance %
const BASE_CRIT_MULTIPLIER = 1.5    // 150% damage on crit
const MIN_DAMAGE = 1                // Minimum damage dealt
const GUARD_DAMAGE_REDUCTION = 0.5  // 50% damage reduction when guarding

// ============================================
// RANDOM UTILITIES
// ============================================

/**
 * Roll a percentage chance (0-100)
 */
function rollChance(percent: number): boolean {
  return Math.random() * 100 < percent
}

/**
 * Get random variance for damage (±10%)
 */
function getDamageVariance(): number {
  return 0.9 + Math.random() * 0.2 // 0.9 to 1.1
}

// ============================================
// HIT CALCULATION
// ============================================

/**
 * Calculate if an attack hits
 */
export function calculateHitChance(
  attacker: CombatEntity,
  defender: CombatEntity,
  skill: CombatSkill
): { hits: boolean; isDodged: boolean } {
  // Self-targeting skills always hit
  if (skill.targetType === 'self') {
    return { hits: true, isDodged: false }
  }
  
  // Calculate accuracy
  let accuracy = BASE_HIT_CHANCE + attacker.accuracy + getAccuracyModifier(attacker)
  
  // Calculate dodge
  let dodge = defender.dodgeChance + getDodgeModifier(defender)
  
  // Final hit chance
  const hitChance = Math.max(5, Math.min(95, accuracy - dodge)) // 5-95% bounds
  
  const hits = rollChance(hitChance)
  
  return {
    hits,
    isDodged: !hits,
  }
}

// ============================================
// CRIT CALCULATION
// ============================================

/**
 * Calculate if an attack crits (physical only)
 */
export function calculateCrit(
  attacker: CombatEntity,
  skill: CombatSkill
): { isCrit: boolean; multiplier: number } {
  // Magic and True damage cannot crit
  if (skill.damageType !== DamageType.PHYSICAL) {
    return { isCrit: false, multiplier: 1.0 }
  }
  
  const critChance = BASE_CRIT_CHANCE + attacker.critChance + (getCritModifier(attacker) * 100)
  const isCrit = rollChance(critChance)
  
  return {
    isCrit,
    multiplier: isCrit ? (attacker.critMultiplier || BASE_CRIT_MULTIPLIER) : 1.0,
  }
}

// ============================================
// DAMAGE CALCULATION
// ============================================

/**
 * Calculate raw damage before defenses
 */
export function calculateRawDamage(
  attacker: CombatEntity,
  skill: CombatSkill,
  critMultiplier: number = 1.0
): number {
  // No damage skills
  if (skill.damageType === DamageType.NONE) {
    return 0
  }
  
  // Base damage from weapon
  const baseDamage = attacker.baseDamage
  
  // Skill amp multiplier
  const skillAmp = skill.ampPercent / 100
  
  // Buff/debuff damage modifier
  const damageModifier = getDamageModifier(attacker)
  
  // Calculate raw damage
  let damage = baseDamage * skillAmp * damageModifier * critMultiplier
  
  // Apply variance
  damage *= getDamageVariance()
  
  return Math.floor(damage)
}

/**
 * Calculate damage after defenses
 */
export function calculateDefendedDamage(
  rawDamage: number,
  defender: CombatEntity,
  skill: CombatSkill,
  isGuarding: boolean = false
): number {
  if (rawDamage <= 0) return 0
  
  // True damage ignores all defenses
  if (skill.damageType === DamageType.TRUE) {
    return Math.max(MIN_DAMAGE, rawDamage)
  }
  
  let damage = rawDamage
  
  // Get defense value based on damage type
  let defenseValue: number
  if (skill.damageType === DamageType.PHYSICAL) {
    defenseValue = defender.defense
  } else {
    defenseValue = defender.magicResist
  }
  
  // Apply defense modifier from buffs/debuffs
  defenseValue *= getDefenseModifier(defender)
  
  // Apply armor pierce
  if (skill.armorPierce) {
    defenseValue *= (1 - skill.armorPierce / 100)
  }
  
  // Calculate damage reduction (defense gives diminishing returns)
  // Formula: reduction = defense / (defense + 100)
  // At 100 defense = 50% reduction, at 200 = 66%, at 300 = 75%
  const damageReduction = defenseValue / (defenseValue + 100)
  damage *= (1 - damageReduction)
  
  // Guard reduction
  if (isGuarding) {
    damage *= GUARD_DAMAGE_REDUCTION
    
    // Bonus vs guard
    if (skill.bonusVsGuard) {
      damage *= (1 + skill.bonusVsGuard / 100)
    }
  }
  
  // Bonus vs debuffed
  if (skill.bonusVsDebuffed && defender.debuffs.length > 0) {
    damage *= (1 + skill.bonusVsDebuffed / 100)
  }
  
  // Damage taken modifier (marked debuff)
  damage *= getDamageTakenModifier(defender)
  
  return Math.max(MIN_DAMAGE, Math.floor(damage))
}

/**
 * Apply damage to an entity, handling barriers
 * Returns actual damage dealt after barrier absorption
 */
export function applyDamage(
  defender: CombatEntity,
  damage: number
): { damageDealt: number; barrierAbsorbed: number } {
  // Check barrier first
  const damageAfterBarrier = consumeBarrier(defender, damage)
  const barrierAbsorbed = damage - damageAfterBarrier
  
  // Apply remaining damage
  defender.currentHp = Math.max(0, defender.currentHp - damageAfterBarrier)
  
  return {
    damageDealt: damageAfterBarrier,
    barrierAbsorbed,
  }
}

/**
 * Calculate reflect damage
 */
export function calculateReflectDamage(
  defender: CombatEntity,
  damageDealt: number
): number {
  const reflectPercent = getReflectValue(defender)
  if (reflectPercent <= 0) return 0
  
  return Math.floor(damageDealt * (reflectPercent / 100))
}

// ============================================
// FULL DAMAGE CALCULATION (Single Hit)
// ============================================

export interface SingleHitResult {
  hits: boolean
  isDodged: boolean
  isCrit: boolean
  rawDamage: number
  finalDamage: number
  barrierAbsorbed: number
  reflectDamage: number
}

/**
 * Calculate a single hit of damage
 */
export function calculateSingleHit(
  attacker: CombatEntity,
  defender: CombatEntity,
  skill: CombatSkill,
  isGuarding: boolean = false
): SingleHitResult {
  // Check hit
  const { hits, isDodged } = calculateHitChance(attacker, defender, skill)
  
  if (!hits) {
    return {
      hits: false,
      isDodged,
      isCrit: false,
      rawDamage: 0,
      finalDamage: 0,
      barrierAbsorbed: 0,
      reflectDamage: 0,
    }
  }
  
  // Check crit
  const { isCrit, multiplier } = calculateCrit(attacker, skill)
  
  // Calculate raw damage
  const rawDamage = calculateRawDamage(attacker, skill, multiplier)
  
  // Calculate defended damage
  const defendedDamage = calculateDefendedDamage(rawDamage, defender, skill, isGuarding)
  
  // Apply damage (handles barrier)
  const { damageDealt, barrierAbsorbed } = applyDamage(defender, defendedDamage)
  
  // Calculate reflect
  const reflectDamage = calculateReflectDamage(defender, damageDealt)
  
  return {
    hits: true,
    isDodged: false,
    isCrit,
    rawDamage,
    finalDamage: damageDealt,
    barrierAbsorbed,
    reflectDamage,
  }
}

// ============================================
// MULTI-HIT CALCULATION
// ============================================

/**
 * Calculate all hits of a multi-hit skill
 */
export function calculateMultiHit(
  attacker: CombatEntity,
  defender: CombatEntity,
  skill: CombatSkill,
  isGuarding: boolean = false
): DamageInstance[] {
  const results: DamageInstance[] = []
  
  for (let i = 0; i < skill.hitCount; i++) {
    const hitResult = calculateSingleHit(attacker, defender, skill, isGuarding)
    
    results.push({
      amount: hitResult.finalDamage,
      type: skill.damageType,
      isCrit: hitResult.isCrit,
      isBlocked: isGuarding && hitResult.hits,
      isDodged: hitResult.isDodged,
      hitNumber: i + 1,
    })
    
    // Apply reflect damage to attacker
    if (hitResult.reflectDamage > 0) {
      attacker.currentHp = Math.max(0, attacker.currentHp - hitResult.reflectDamage)
    }
    
    // Stop if defender is dead
    if (defender.currentHp <= 0) {
      break
    }
  }
  
  return results
}

// ============================================
// LIFESTEAL CALCULATION
// ============================================

/**
 * Calculate and apply lifesteal healing
 */
export function applyLifesteal(
  attacker: CombatEntity,
  totalDamage: number,
  lifestealPercent: number
): number {
  if (lifestealPercent <= 0 || totalDamage <= 0) return 0
  
  const healing = Math.floor(totalDamage * (lifestealPercent / 100))
  const actualHealing = Math.min(healing, attacker.maxHp - attacker.currentHp)
  
  attacker.currentHp += actualHealing
  
  return actualHealing
}

// ============================================
// DEBUFF APPLICATION CHANCE
// ============================================

/**
 * Roll for debuff application based on skill's debuff chance
 */
export function rollDebuffApplication(skill: CombatSkill): boolean {
  if (!skill.debuffType || !skill.debuffChance) return false
  return rollChance(skill.debuffChance)
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if a skill can be used (AP cost, cooldown, silence)
 */
export function canUseSkill(
  entity: CombatEntity,
  skill: CombatSkill
): { canUse: boolean; reason?: string } {
  // Check AP
  if (entity.currentAp < skill.apCost) {
    return { canUse: false, reason: `Not enough AP (need ${skill.apCost}, have ${entity.currentAp})` }
  }
  
  // Check cooldown
  const cooldownRemaining = entity.skillCooldowns[skill.id] || 0
  if (cooldownRemaining > 0) {
    return { canUse: false, reason: `Skill on cooldown (${cooldownRemaining} turns)` }
  }
  
  // Check silence (can only use basic attacks)
  if (hasDebuff(entity, DebuffType.SILENCE) && skill.apCost > 0) {
    return { canUse: false, reason: 'Silenced - cannot use skills' }
  }
  
  // Check stun
  if (hasDebuff(entity, DebuffType.STUN)) {
    return { canUse: false, reason: 'Stunned - cannot act' }
  }
  
  return { canUse: true }
}

/**
 * Consume AP and set cooldown after using a skill
 */
export function consumeSkillResources(
  entity: CombatEntity,
  skill: CombatSkill
): void {
  entity.currentAp -= skill.apCost
  
  if (skill.cooldown > 0) {
    entity.skillCooldowns[skill.id] = skill.cooldown
  }
}

/**
 * Check if target is in range
 */
export function isInRange(
  attacker: CombatEntity,
  target: CombatEntity,
  skill: CombatSkill
): boolean {
  const distance = Math.abs(attacker.position.x - target.position.x) + 
                   Math.abs(attacker.position.y - target.position.y)
  return distance <= skill.range
}

/**
 * Get all valid targets for an AoE skill
 */
export function getAoETargets(
  attacker: CombatEntity,
  allEntities: CombatEntity[],
  skill: CombatSkill,
  primaryTarget?: CombatEntity
): CombatEntity[] {
  const targets: CombatEntity[] = []
  
  switch (skill.targetType) {
    case 'single':
      if (primaryTarget) targets.push(primaryTarget)
      break
      
    case 'self':
      targets.push(attacker)
      break
      
    case 'all_enemies':
      targets.push(...allEntities.filter(e => e.isPlayer !== attacker.isPlayer && e.currentHp > 0))
      break
      
    case 'all_allies':
      targets.push(...allEntities.filter(e => e.isPlayer === attacker.isPlayer && e.currentHp > 0))
      break
      
    case 'aoe_cone':
      // Cone: 3 targets in front
      if (primaryTarget) {
        targets.push(primaryTarget)
        // Add up to 2 adjacent enemies
        const adjacent = allEntities.filter(e => 
          e.isPlayer !== attacker.isPlayer && 
          e.currentHp > 0 && 
          e.id !== primaryTarget.id &&
          Math.abs(e.position.x - primaryTarget.position.x) <= 1 &&
          Math.abs(e.position.y - primaryTarget.position.y) <= 1
        ).slice(0, 2)
        targets.push(...adjacent)
      }
      break
      
    case 'aoe_circle':
      // Circle: all enemies within 2 tiles of primary target
      if (primaryTarget) {
        targets.push(...allEntities.filter(e => {
          if (e.isPlayer === attacker.isPlayer || e.currentHp <= 0) return false
          const dist = Math.abs(e.position.x - primaryTarget.position.x) + 
                       Math.abs(e.position.y - primaryTarget.position.y)
          return dist <= 2
        }))
      }
      break
      
    case 'aoe_line':
      // Line: all enemies in a line from attacker
      if (primaryTarget) {
        const dx = Math.sign(primaryTarget.position.x - attacker.position.x)
        const dy = Math.sign(primaryTarget.position.y - attacker.position.y)
        
        targets.push(...allEntities.filter(e => {
          if (e.isPlayer === attacker.isPlayer || e.currentHp <= 0) return false
          // Check if enemy is on the line
          const ex = e.position.x - attacker.position.x
          const ey = e.position.y - attacker.position.y
          if (dx !== 0 && dy !== 0) {
            return ex * dy === ey * dx && ex * dx > 0 && ey * dy > 0
          } else if (dx !== 0) {
            return ey === 0 && ex * dx > 0
          } else {
            return ex === 0 && ey * dy > 0
          }
        }))
      }
      break
  }
  
  return targets
}
