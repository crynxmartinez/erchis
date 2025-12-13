// ============================================
// STATUS EFFECT SYSTEM
// Handles buff/debuff application, stacking, and tick processing
// ============================================

import {
  BuffType,
  DebuffType,
  BuffEffect,
  DebuffEffect,
  CombatEntity,
  BUFF_CONFIG,
  DEBUFF_CONFIG,
  TurnStartResult,
} from './types'

// ============================================
// BUFF MANAGEMENT
// ============================================

/**
 * Apply a buff to an entity
 * Handles stacking rules based on buff configuration
 */
export function applyBuff(
  entity: CombatEntity,
  buffType: BuffType,
  value: number,
  duration: number,
  sourceSkillId?: string
): { applied: boolean; message: string } {
  const config = BUFF_CONFIG[buffType]
  const existingBuffs = entity.buffs.filter(b => b.type === buffType)
  
  if (config.stackable) {
    // Stackable buff - add new stack if under max
    if (existingBuffs.length < config.maxStacks) {
      entity.buffs.push({
        type: buffType,
        value,
        duration,
        sourceSkillId,
      })
      return {
        applied: true,
        message: `${entity.name} gains ${config.name} (${existingBuffs.length + 1}/${config.maxStacks} stacks)`,
      }
    } else {
      // At max stacks - refresh duration of oldest stack
      const oldestBuff = existingBuffs.reduce((oldest, current) => 
        current.duration < oldest.duration ? current : oldest
      )
      oldestBuff.duration = Math.max(oldestBuff.duration, duration)
      oldestBuff.value = Math.max(oldestBuff.value, value)
      return {
        applied: true,
        message: `${entity.name}'s ${config.name} refreshed (max stacks)`,
      }
    }
  } else {
    // Non-stackable - replace if new is stronger or longer
    if (existingBuffs.length > 0) {
      const existing = existingBuffs[0]
      if (value > existing.value || duration > existing.duration) {
        existing.value = Math.max(existing.value, value)
        existing.duration = Math.max(existing.duration, duration)
        return {
          applied: true,
          message: `${entity.name}'s ${config.name} upgraded`,
        }
      }
      return {
        applied: false,
        message: `${entity.name} already has a stronger ${config.name}`,
      }
    } else {
      entity.buffs.push({
        type: buffType,
        value,
        duration,
        sourceSkillId,
      })
      return {
        applied: true,
        message: `${entity.name} gains ${config.name}`,
      }
    }
  }
}

/**
 * Remove a specific buff from an entity
 */
export function removeBuff(entity: CombatEntity, buffType: BuffType): boolean {
  const index = entity.buffs.findIndex(b => b.type === buffType)
  if (index !== -1) {
    entity.buffs.splice(index, 1)
    return true
  }
  return false
}

/**
 * Remove all buffs from an entity (dispel)
 */
export function removeAllBuffs(entity: CombatEntity): number {
  const count = entity.buffs.length
  entity.buffs = []
  return count
}

/**
 * Check if entity has a specific buff
 */
export function hasBuff(entity: CombatEntity, buffType: BuffType): boolean {
  return entity.buffs.some(b => b.type === buffType)
}

/**
 * Get total value of a buff (sum of all stacks)
 */
export function getBuffValue(entity: CombatEntity, buffType: BuffType): number {
  return entity.buffs
    .filter(b => b.type === buffType)
    .reduce((sum, b) => sum + b.value, 0)
}

/**
 * Get stack count of a buff
 */
export function getBuffStacks(entity: CombatEntity, buffType: BuffType): number {
  return entity.buffs.filter(b => b.type === buffType).length
}

// ============================================
// DEBUFF MANAGEMENT
// ============================================

/**
 * Apply a debuff to an entity
 * Respects immunity buff and stacking rules
 */
export function applyDebuff(
  entity: CombatEntity,
  debuffType: DebuffType,
  value: number,
  duration: number,
  sourceSkillId?: string,
  sourceEntityId?: string
): { applied: boolean; message: string } {
  // Check for immunity
  if (hasBuff(entity, BuffType.IMMUNITY)) {
    return {
      applied: false,
      message: `${entity.name} is immune to ${DEBUFF_CONFIG[debuffType].name}`,
    }
  }
  
  const config = DEBUFF_CONFIG[debuffType]
  const existingDebuffs = entity.debuffs.filter(d => d.type === debuffType)
  
  if (config.stackable) {
    // Stackable debuff - add new stack if under max
    if (existingDebuffs.length < config.maxStacks) {
      entity.debuffs.push({
        type: debuffType,
        value,
        duration,
        sourceSkillId,
        sourceEntityId,
      })
      return {
        applied: true,
        message: `${entity.name} is afflicted with ${config.name} (${existingDebuffs.length + 1}/${config.maxStacks} stacks)`,
      }
    } else {
      // At max stacks - refresh duration of oldest stack
      const oldestDebuff = existingDebuffs.reduce((oldest, current) => 
        current.duration < oldest.duration ? current : oldest
      )
      oldestDebuff.duration = Math.max(oldestDebuff.duration, duration)
      oldestDebuff.value = Math.max(oldestDebuff.value, value)
      return {
        applied: true,
        message: `${entity.name}'s ${config.name} refreshed (max stacks)`,
      }
    }
  } else {
    // Non-stackable - replace if new is stronger or longer
    if (existingDebuffs.length > 0) {
      const existing = existingDebuffs[0]
      if (value > existing.value || duration > existing.duration) {
        existing.value = Math.max(existing.value, value)
        existing.duration = Math.max(existing.duration, duration)
        return {
          applied: true,
          message: `${entity.name}'s ${config.name} worsened`,
        }
      }
      return {
        applied: false,
        message: `${entity.name} already has a worse ${config.name}`,
      }
    } else {
      entity.debuffs.push({
        type: debuffType,
        value,
        duration,
        sourceSkillId,
        sourceEntityId,
      })
      return {
        applied: true,
        message: `${entity.name} is afflicted with ${config.name}`,
      }
    }
  }
}

/**
 * Remove a specific debuff from an entity
 */
export function removeDebuff(entity: CombatEntity, debuffType: DebuffType): boolean {
  const index = entity.debuffs.findIndex(d => d.type === debuffType)
  if (index !== -1) {
    entity.debuffs.splice(index, 1)
    return true
  }
  return false
}

/**
 * Remove all debuffs from an entity (cleanse)
 */
export function removeAllDebuffs(entity: CombatEntity): number {
  const count = entity.debuffs.length
  entity.debuffs = []
  return count
}

/**
 * Check if entity has a specific debuff
 */
export function hasDebuff(entity: CombatEntity, debuffType: DebuffType): boolean {
  return entity.debuffs.some(d => d.type === debuffType)
}

/**
 * Get total value of a debuff (sum of all stacks)
 */
export function getDebuffValue(entity: CombatEntity, debuffType: DebuffType): number {
  return entity.debuffs
    .filter(d => d.type === debuffType)
    .reduce((sum, d) => sum + d.value, 0)
}

/**
 * Get stack count of a debuff
 */
export function getDebuffStacks(entity: CombatEntity, debuffType: DebuffType): number {
  return entity.debuffs.filter(d => d.type === debuffType).length
}

// ============================================
// TURN PROCESSING
// ============================================

/**
 * Process start of turn for an entity
 * - Tick DoT effects
 * - Apply regen
 * - Reduce durations
 * - Remove expired effects
 * - Check for stun/silence/root
 */
export function processTurnStart(entity: CombatEntity): TurnStartResult {
  const result: TurnStartResult = {
    entity,
    dotDamage: [],
    totalDotDamage: 0,
    regenHealing: 0,
    apGained: 0,
    expiredBuffs: [],
    expiredDebuffs: [],
    isStunned: false,
    isSilenced: false,
    isRooted: false,
    combatLog: [],
  }
  
  // ============================================
  // Process Debuff Ticks (DoT damage)
  // ============================================
  
  for (const debuff of entity.debuffs) {
    const config = DEBUFF_CONFIG[debuff.type]
    
    if (config.ticksAtStartOfTurn) {
      let damage = 0
      
      switch (debuff.type) {
        case DebuffType.BLEED:
        case DebuffType.BURN:
          // Flat damage
          damage = debuff.value
          break
        case DebuffType.POISON:
          // Percentage of max HP
          damage = Math.floor(entity.maxHp * (debuff.value / 100))
          break
      }
      
      if (damage > 0) {
        result.dotDamage.push({ type: debuff.type, amount: damage })
        result.totalDotDamage += damage
        result.combatLog.push(`${entity.name} takes ${damage} ${config.name} damage`)
      }
    }
  }
  
  // Apply DoT damage
  if (result.totalDotDamage > 0) {
    entity.currentHp = Math.max(0, entity.currentHp - result.totalDotDamage)
  }
  
  // ============================================
  // Process Buff Ticks (Regen, AP)
  // ============================================
  
  // Regen buff
  const regenValue = getBuffValue(entity, BuffType.REGEN)
  if (regenValue > 0) {
    const healing = Math.min(regenValue, entity.maxHp - entity.currentHp)
    entity.currentHp += healing
    result.regenHealing = healing
    if (healing > 0) {
      result.combatLog.push(`${entity.name} regenerates ${healing} HP`)
    }
  }
  
  // Haste buff (bonus AP)
  const hasteValue = getBuffValue(entity, BuffType.HASTE)
  
  // Slow debuff (reduced AP)
  const slowValue = getDebuffValue(entity, DebuffType.SLOW)
  
  // Base AP regen is handled elsewhere, but we track modifiers here
  result.apGained = hasteValue - slowValue
  
  // ============================================
  // Check Control Effects
  // ============================================
  
  result.isStunned = hasDebuff(entity, DebuffType.STUN)
  result.isSilenced = hasDebuff(entity, DebuffType.SILENCE)
  result.isRooted = hasDebuff(entity, DebuffType.ROOT)
  
  if (result.isStunned) {
    result.combatLog.push(`${entity.name} is stunned and cannot act!`)
  }
  if (result.isSilenced) {
    result.combatLog.push(`${entity.name} is silenced and cannot use skills!`)
  }
  if (result.isRooted) {
    result.combatLog.push(`${entity.name} is rooted and cannot move!`)
  }
  
  // ============================================
  // Reduce Durations & Remove Expired
  // ============================================
  
  // Process buffs
  for (let i = entity.buffs.length - 1; i >= 0; i--) {
    entity.buffs[i].duration--
    if (entity.buffs[i].duration <= 0) {
      const expiredType = entity.buffs[i].type
      result.expiredBuffs.push(expiredType)
      result.combatLog.push(`${entity.name}'s ${BUFF_CONFIG[expiredType].name} fades`)
      entity.buffs.splice(i, 1)
    }
  }
  
  // Process debuffs
  for (let i = entity.debuffs.length - 1; i >= 0; i--) {
    entity.debuffs[i].duration--
    if (entity.debuffs[i].duration <= 0) {
      const expiredType = entity.debuffs[i].type
      result.expiredDebuffs.push(expiredType)
      result.combatLog.push(`${entity.name} is no longer ${DEBUFF_CONFIG[expiredType].name}`)
      entity.debuffs.splice(i, 1)
    }
  }
  
  // ============================================
  // Reduce Skill Cooldowns
  // ============================================
  
  for (const skillId of Object.keys(entity.skillCooldowns)) {
    entity.skillCooldowns[skillId]--
    if (entity.skillCooldowns[skillId] <= 0) {
      delete entity.skillCooldowns[skillId]
    }
  }
  
  return result
}

// ============================================
// STAT MODIFIERS FROM STATUS EFFECTS
// ============================================

/**
 * Calculate damage modifier from buffs/debuffs
 * Returns a multiplier (e.g., 1.2 = +20% damage)
 */
export function getDamageModifier(entity: CombatEntity): number {
  let modifier = 1.0
  
  // Empower buff (+damage)
  modifier += getBuffValue(entity, BuffType.EMPOWER) / 100
  
  // Berserk buff (+damage)
  modifier += getBuffValue(entity, BuffType.BERSERK) / 100
  
  // Weaken debuff (-damage)
  modifier -= getDebuffValue(entity, DebuffType.WEAKEN) / 100
  
  return Math.max(0.1, modifier) // Minimum 10% damage
}

/**
 * Calculate defense modifier from buffs/debuffs
 * Returns a multiplier for damage reduction
 */
export function getDefenseModifier(entity: CombatEntity): number {
  let modifier = 1.0
  
  // Fortify buff (+defense)
  modifier += getBuffValue(entity, BuffType.FORTIFY) / 100
  
  // Berserk buff (-defense)
  modifier -= getBuffValue(entity, BuffType.BERSERK) / 100
  
  // Armor Break debuff (-defense)
  modifier -= getDebuffValue(entity, DebuffType.ARMOR_BREAK) / 100
  
  return Math.max(0, modifier) // Can go to 0 (no defense)
}

/**
 * Calculate crit chance modifier from buffs
 */
export function getCritModifier(entity: CombatEntity): number {
  return getBuffValue(entity, BuffType.FOCUS) / 100
}

/**
 * Calculate accuracy modifier from buffs/debuffs
 */
export function getAccuracyModifier(entity: CombatEntity): number {
  let modifier = 0
  
  // Precision buff (+accuracy)
  modifier += getBuffValue(entity, BuffType.PRECISION)
  
  // Blind debuff (-accuracy)
  modifier -= getDebuffValue(entity, DebuffType.BLIND)
  
  return modifier
}

/**
 * Calculate dodge modifier from buffs
 */
export function getDodgeModifier(entity: CombatEntity): number {
  return getBuffValue(entity, BuffType.EVASION)
}

/**
 * Calculate damage taken modifier from debuffs
 * Returns a multiplier (e.g., 1.3 = +30% damage taken)
 */
export function getDamageTakenModifier(entity: CombatEntity): number {
  let modifier = 1.0
  
  // Marked debuff (+damage taken)
  modifier += getDebuffValue(entity, DebuffType.MARKED) / 100
  
  return modifier
}

/**
 * Calculate healing modifier from debuffs
 * Returns a multiplier (e.g., 0.5 = 50% healing)
 */
export function getHealingModifier(entity: CombatEntity): number {
  let modifier = 1.0
  
  // Curse debuff (-healing)
  modifier -= getDebuffValue(entity, DebuffType.CURSE) / 100
  
  return Math.max(0, modifier)
}

/**
 * Get barrier value (damage absorption)
 */
export function getBarrierValue(entity: CombatEntity): number {
  return getBuffValue(entity, BuffType.BARRIER)
}

/**
 * Consume barrier when taking damage
 * Returns remaining damage after barrier absorption
 */
export function consumeBarrier(entity: CombatEntity, damage: number): number {
  const barrierBuffs = entity.buffs.filter(b => b.type === BuffType.BARRIER)
  
  if (barrierBuffs.length === 0) {
    return damage
  }
  
  let remainingDamage = damage
  
  for (let i = barrierBuffs.length - 1; i >= 0 && remainingDamage > 0; i--) {
    const barrier = barrierBuffs[i]
    
    if (barrier.value >= remainingDamage) {
      // Barrier absorbs all damage
      barrier.value -= remainingDamage
      remainingDamage = 0
    } else {
      // Barrier breaks
      remainingDamage -= barrier.value
      const index = entity.buffs.indexOf(barrier)
      if (index !== -1) {
        entity.buffs.splice(index, 1)
      }
    }
  }
  
  return remainingDamage
}

/**
 * Check if entity can be targeted (stealth check)
 */
export function canBeTargeted(entity: CombatEntity): boolean {
  return !hasBuff(entity, BuffType.STEALTH)
}

/**
 * Break stealth when attacking
 */
export function breakStealth(entity: CombatEntity): boolean {
  return removeBuff(entity, BuffType.STEALTH)
}

/**
 * Get reflect damage value
 */
export function getReflectValue(entity: CombatEntity): number {
  return getBuffValue(entity, BuffType.REFLECT)
}
