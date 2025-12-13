// ============================================
// COMBAT SYSTEM - MAIN EXPORT
// ============================================

// Types
export * from './types'

// Status Effects
export * from './status-effects'

// Damage Calculation
export * from './damage-calculator'

// Skill Execution
export * from './skill-executor'

// Passive System
export * from './passive-system'

// Skill Converter
export * from './skill-converter'

// Sequence Interleaving
export * from './sequence'

// Narrative Generator
export * from './narrator'

// Combo System
export * from './combos'

// Main Combat Engine
export * from './engine'

// ============================================
// CONVENIENCE RE-EXPORTS
// ============================================

export {
  // Main execution function
  executeSkill,
  executeCounterSkill,
  executeGuard,
  createBasicAttack,
} from './skill-executor'

export {
  // Turn processing
  processTurnStart,
  
  // Buff/Debuff management
  applyBuff,
  applyDebuff,
  removeBuff,
  removeDebuff,
  removeAllBuffs,
  removeAllDebuffs,
  hasBuff,
  hasDebuff,
  getBuffValue,
  getDebuffValue,
} from './status-effects'

export {
  // Damage calculation
  calculateSingleHit,
  calculateMultiHit,
  canUseSkill,
  isInRange,
  getAoETargets,
} from './damage-calculator'

export {
  // Passive system
  parsePassive,
  getPassiveBonus,
  getPassiveStatModifiers,
  applyPassiveMaxStats,
} from './passive-system'
