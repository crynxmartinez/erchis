// ============================================
// COMBAT SEQUENCE INTERLEAVING
// Handles merging player and enemy action queues by speed
// ============================================

import { CombatSkill } from './types'

// ============================================
// TYPES
// ============================================

export interface QueuedAction {
  id: string
  actor: 'player' | 'monster'
  actionType: 'skill' | 'item'
  actionId: string
  actionName: string
  speed: number
  skill?: CombatSkill
  itemData?: {
    name: string
    effect: string
    value: number
  }
}

export interface MonsterSkillData {
  id: string
  name: string
  speed: number
  baseDamage: number
  accuracy: number
  damageType: string
  appliesDebuff?: string
  debuffChance?: number
  debuffDuration?: number
  debuffValue?: number
  narrativeUse: string
  narrativeHit: string
  narrativeMiss: string
  narrativeCrit?: string
}

// ============================================
// SEQUENCE INTERLEAVING
// ============================================

/**
 * Merge player and monster action queues, sorted by speed (highest first)
 * This creates the unified turn order for narrative generation
 */
export function interleaveActionQueues(
  playerQueue: QueuedAction[],
  monsterQueue: QueuedAction[]
): QueuedAction[] {
  // Combine both queues
  const allActions = [...playerQueue, ...monsterQueue]
  
  // Sort by speed (highest first)
  // If speeds are equal, player goes first (advantage to player)
  allActions.sort((a, b) => {
    if (b.speed !== a.speed) {
      return b.speed - a.speed
    }
    // Tie-breaker: player goes first
    return a.actor === 'player' ? -1 : 1
  })
  
  return allActions
}

/**
 * Create a queued action from a player skill
 */
export function createPlayerSkillAction(
  skill: CombatSkill,
  queuePosition: number
): QueuedAction {
  return {
    id: `player-${queuePosition}-${skill.id}`,
    actor: 'player',
    actionType: 'skill',
    actionId: skill.id,
    actionName: skill.name,
    speed: skill.speed || 50,
    skill,
  }
}

/**
 * Create a queued action from a player item
 */
export function createPlayerItemAction(
  itemId: string,
  itemName: string,
  effect: string,
  value: number,
  queuePosition: number
): QueuedAction {
  return {
    id: `player-item-${queuePosition}-${itemId}`,
    actor: 'player',
    actionType: 'item',
    actionId: itemId,
    actionName: itemName,
    speed: 90, // Items are fast (instant use)
    itemData: {
      name: itemName,
      effect,
      value,
    },
  }
}

/**
 * Create a queued action from a monster skill
 */
export function createMonsterSkillAction(
  monsterSkill: MonsterSkillData,
  queuePosition: number
): QueuedAction {
  return {
    id: `monster-${queuePosition}-${monsterSkill.id}`,
    actor: 'monster',
    actionType: 'skill',
    actionId: monsterSkill.id,
    actionName: monsterSkill.name,
    speed: monsterSkill.speed || 50,
  }
}

// ============================================
// REACTION HANDLING
// ============================================

/**
 * Check if a reaction skill should trigger against an incoming attack
 * Reactions (Dodge, Guard, Counter) are checked when enemy attacks
 */
export function findReactionInQueue(
  playerQueue: QueuedAction[],
  attackingAction: QueuedAction
): QueuedAction | null {
  // Only check reactions against attacks
  if (attackingAction.actor !== 'monster') {
    return null
  }
  
  // Find reaction skills in player queue
  for (const action of playerQueue) {
    if (action.skill?.isReaction) {
      return action
    }
  }
  
  return null
}

/**
 * Remove a used reaction from the queue
 */
export function consumeReaction(
  queue: QueuedAction[],
  reactionId: string
): QueuedAction[] {
  return queue.filter(action => action.id !== reactionId)
}

// ============================================
// SPEED TIERS
// ============================================

export const SPEED_TIERS = {
  INSTANT: 100,    // Items, emergency skills
  VERY_FAST: 90,   // Quick buffs, potions
  FAST: 75,        // Light attacks, dodge
  NORMAL: 50,      // Standard attacks
  SLOW: 35,        // Heavy attacks
  VERY_SLOW: 20,   // Ultimate skills, charged attacks
}

/**
 * Get speed tier name for display
 */
export function getSpeedTierName(speed: number): string {
  if (speed >= 90) return 'Instant'
  if (speed >= 75) return 'Fast'
  if (speed >= 50) return 'Normal'
  if (speed >= 35) return 'Slow'
  return 'Very Slow'
}

// ============================================
// QUEUE VALIDATION
// ============================================

/**
 * Validate player queue (max 5 actions, check AP costs)
 */
export function validatePlayerQueue(
  queue: QueuedAction[],
  currentAp: number
): { valid: boolean; errors: string[]; totalApCost: number } {
  const errors: string[] = []
  let totalApCost = 0
  
  // Check max queue size
  if (queue.length > 5) {
    errors.push('Maximum 5 actions per turn')
  }
  
  // Calculate total AP cost
  for (const action of queue) {
    if (action.skill) {
      totalApCost += action.skill.apCost
    }
    // Items typically cost 0 AP
  }
  
  // Check if player has enough AP
  if (totalApCost > currentAp) {
    errors.push(`Not enough AP (need ${totalApCost}, have ${currentAp})`)
  }
  
  return {
    valid: errors.length === 0,
    errors,
    totalApCost,
  }
}

/**
 * Preview which actions will execute based on AP
 */
export function previewExecutableActions(
  queue: QueuedAction[],
  currentAp: number
): { executable: QueuedAction[]; skipped: QueuedAction[]; apRemaining: number } {
  const executable: QueuedAction[] = []
  const skipped: QueuedAction[] = []
  let apRemaining = currentAp
  
  for (const action of queue) {
    const apCost = action.skill?.apCost || 0
    
    if (apRemaining >= apCost) {
      executable.push(action)
      apRemaining -= apCost
    } else {
      skipped.push(action)
    }
  }
  
  return { executable, skipped, apRemaining }
}
