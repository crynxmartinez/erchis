// ============================================
// COMBO DETECTION SYSTEM
// Detects and rewards smart skill sequencing
// ============================================

import { QueuedAction } from './sequence'
import { BuffType, DebuffType } from './types'

// ============================================
// TYPES
// ============================================

export enum ComboType {
  EMPOWERED_STRIKE = 'empowered_strike',   // Buff → Attack
  DOUBLE_TAP = 'double_tap',               // Same skill 2x
  EXPLOIT_WEAKNESS = 'exploit_weakness',   // Debuff → Attack
  DEFENSIVE_COUNTER = 'defensive_counter', // Guard/Dodge → Counter
  FINISHING_BLOW = 'finishing_blow',       // Any → Execute (enemy <20% HP)
  CHAIN_ATTACK = 'chain_attack',           // 3+ attacks in a row
  ELEMENTAL_BURST = 'elemental_burst',     // Magic buff → Magic attack
}

export interface ComboBonus {
  type: ComboType
  name: string
  description: string
  damageMultiplier: number      // 1.0 = no bonus, 1.1 = +10%
  apRefund?: number             // AP refunded
  extraEffect?: string          // Additional effect description
}

export interface DetectedCombo {
  combo: ComboBonus
  triggerActionIndex: number    // Which action in queue triggers this
  affectedActionIndices: number[] // Which actions are affected
}

// ============================================
// COMBO DEFINITIONS
// ============================================

export const COMBO_BONUSES: Record<ComboType, ComboBonus> = {
  [ComboType.EMPOWERED_STRIKE]: {
    type: ComboType.EMPOWERED_STRIKE,
    name: 'Empowered Strike',
    description: 'Buff applied before attack - buff enhances the attack!',
    damageMultiplier: 1.15,
  },
  [ComboType.DOUBLE_TAP]: {
    type: ComboType.DOUBLE_TAP,
    name: 'Double Tap',
    description: 'Same skill used twice in a row!',
    damageMultiplier: 1.10,
  },
  [ComboType.EXPLOIT_WEAKNESS]: {
    type: ComboType.EXPLOIT_WEAKNESS,
    name: 'Exploit Weakness',
    description: 'Attack after applying debuff - extra damage!',
    damageMultiplier: 1.15,
  },
  [ComboType.DEFENSIVE_COUNTER]: {
    type: ComboType.DEFENSIVE_COUNTER,
    name: 'Defensive Counter',
    description: 'Counter after defensive action - empowered counter!',
    damageMultiplier: 1.20,
  },
  [ComboType.FINISHING_BLOW]: {
    type: ComboType.FINISHING_BLOW,
    name: 'Finishing Blow',
    description: 'Attack on low HP enemy - massive damage!',
    damageMultiplier: 1.50,
  },
  [ComboType.CHAIN_ATTACK]: {
    type: ComboType.CHAIN_ATTACK,
    name: 'Chain Attack',
    description: '3+ attacks in a row - momentum bonus!',
    damageMultiplier: 1.10,
    apRefund: 1,
  },
  [ComboType.ELEMENTAL_BURST]: {
    type: ComboType.ELEMENTAL_BURST,
    name: 'Elemental Burst',
    description: 'Magic buff followed by magic attack!',
    damageMultiplier: 1.20,
  },
}

// ============================================
// COMBO DETECTION
// ============================================

/**
 * Detect all combos in a player's action queue
 */
export function detectCombos(
  queue: QueuedAction[],
  enemyHpPercent: number
): DetectedCombo[] {
  const combos: DetectedCombo[] = []
  
  for (let i = 0; i < queue.length; i++) {
    const currentAction = queue[i]
    const previousAction = i > 0 ? queue[i - 1] : null
    const nextAction = i < queue.length - 1 ? queue[i + 1] : null
    
    // Skip non-skill actions for most combos
    if (currentAction.actionType !== 'skill' || !currentAction.skill) {
      continue
    }
    
    const skill = currentAction.skill
    
    // ============================================
    // EMPOWERED STRIKE: Buff → Attack
    // ============================================
    if (previousAction?.skill?.buffType && skill.skillType === 'Attack') {
      combos.push({
        combo: COMBO_BONUSES[ComboType.EMPOWERED_STRIKE],
        triggerActionIndex: i,
        affectedActionIndices: [i - 1, i],
      })
    }
    
    // ============================================
    // DOUBLE TAP: Same skill 2x
    // ============================================
    if (previousAction?.actionId === currentAction.actionId) {
      combos.push({
        combo: COMBO_BONUSES[ComboType.DOUBLE_TAP],
        triggerActionIndex: i,
        affectedActionIndices: [i - 1, i],
      })
    }
    
    // ============================================
    // EXPLOIT WEAKNESS: Debuff → Attack
    // ============================================
    if (previousAction?.skill?.debuffType && skill.skillType === 'Attack') {
      combos.push({
        combo: COMBO_BONUSES[ComboType.EXPLOIT_WEAKNESS],
        triggerActionIndex: i,
        affectedActionIndices: [i - 1, i],
      })
    }
    
    // ============================================
    // DEFENSIVE COUNTER: Guard/Dodge → Counter
    // ============================================
    if (previousAction?.skill?.isReaction && skill.isCounter) {
      combos.push({
        combo: COMBO_BONUSES[ComboType.DEFENSIVE_COUNTER],
        triggerActionIndex: i,
        affectedActionIndices: [i - 1, i],
      })
    }
    
    // ============================================
    // FINISHING BLOW: Attack when enemy <20% HP
    // ============================================
    if (skill.skillType === 'Attack' && enemyHpPercent < 20) {
      combos.push({
        combo: COMBO_BONUSES[ComboType.FINISHING_BLOW],
        triggerActionIndex: i,
        affectedActionIndices: [i],
      })
    }
    
    // ============================================
    // CHAIN ATTACK: 3+ attacks in a row
    // ============================================
    if (i >= 2) {
      const threeAttacks = [queue[i - 2], queue[i - 1], queue[i]]
      const allAttacks = threeAttacks.every(a => 
        a.skill?.skillType === 'Attack'
      )
      if (allAttacks) {
        // Only add if not already detected at this position
        const alreadyDetected = combos.some(c => 
          c.combo.type === ComboType.CHAIN_ATTACK && 
          c.triggerActionIndex === i
        )
        if (!alreadyDetected) {
          combos.push({
            combo: COMBO_BONUSES[ComboType.CHAIN_ATTACK],
            triggerActionIndex: i,
            affectedActionIndices: [i - 2, i - 1, i],
          })
        }
      }
    }
    
    // ============================================
    // ELEMENTAL BURST: Magic buff → Magic attack
    // ============================================
    if (
      previousAction?.skill?.buffType && 
      previousAction?.skill?.damageType === 'magic' &&
      skill.damageType === 'magic' &&
      skill.skillType === 'Attack'
    ) {
      combos.push({
        combo: COMBO_BONUSES[ComboType.ELEMENTAL_BURST],
        triggerActionIndex: i,
        affectedActionIndices: [i - 1, i],
      })
    }
  }
  
  return combos
}

/**
 * Get the total damage multiplier for an action based on active combos
 */
export function getComboMultiplier(
  actionIndex: number,
  combos: DetectedCombo[]
): number {
  let multiplier = 1.0
  
  for (const detected of combos) {
    if (detected.triggerActionIndex === actionIndex) {
      multiplier *= detected.combo.damageMultiplier
    }
  }
  
  return multiplier
}

/**
 * Get total AP refund from combos
 */
export function getComboApRefund(combos: DetectedCombo[]): number {
  let refund = 0
  
  for (const detected of combos) {
    if (detected.combo.apRefund) {
      refund += detected.combo.apRefund
    }
  }
  
  return refund
}

/**
 * Generate combo notification text
 */
export function getComboNotification(combo: ComboBonus): string {
  const bonusPercent = Math.round((combo.damageMultiplier - 1) * 100)
  let text = `🔥 ${combo.name}! +${bonusPercent}% damage`
  
  if (combo.apRefund) {
    text += `, +${combo.apRefund} AP refunded`
  }
  
  return text
}

/**
 * Check if a specific combo type is active for an action
 */
export function hasCombo(
  actionIndex: number,
  comboType: ComboType,
  combos: DetectedCombo[]
): boolean {
  return combos.some(c => 
    c.combo.type === comboType && 
    c.triggerActionIndex === actionIndex
  )
}
