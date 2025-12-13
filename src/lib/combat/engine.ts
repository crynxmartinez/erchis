// ============================================
// MAIN COMBAT ENGINE
// Orchestrates the full combat turn execution
// ============================================

import { CombatEntity, CombatSkill, BuffType, DebuffType } from './types'
import { 
  QueuedAction, 
  MonsterSkillData,
  interleaveActionQueues,
  createPlayerSkillAction,
  createMonsterSkillAction,
  findReactionInQueue,
  consumeReaction,
  previewExecutableActions,
} from './sequence'
import { 
  ActionOutcome, 
  TurnNarrative,
  generateTurnNarrative,
  narrateVictory,
  narrateDefeat,
  narrateFlee,
} from './narrator'
import { 
  detectCombos, 
  getComboMultiplier,
  getComboApRefund,
  DetectedCombo,
} from './combos'
import {
  calculateSingleHit,
  canUseSkill,
  consumeSkillResources,
  rollDebuffApplication,
} from './damage-calculator'
import {
  applyBuff,
  applyDebuff,
  processTurnStart,
  hasDebuff,
} from './status-effects'

// ============================================
// TYPES
// ============================================

export interface CombatState {
  sessionId: string
  turn: number
  status: 'active' | 'won' | 'lost' | 'fled'
  
  player: CombatEntity
  monster: CombatEntity
  monsterData: {
    id: string
    name: string
    xpReward: number
    colReward: number
  }
  
  playerQueue: QueuedAction[]
  monsterQueue: QueuedAction[]
  
  skillCooldowns: Record<string, number>
  
  turnHistory: TurnNarrative[]
}

export interface TurnResult {
  state: CombatState
  narrative: TurnNarrative
  combosTriggered: DetectedCombo[]
  playerDamageDealt: number
  playerDamageTaken: number
  playerHealing: number
  monsterDefeated: boolean
  playerDefeated: boolean
  xpGained?: number
  colGained?: number
  skillUseCounts: Record<string, number>
}

export interface MonsterAI {
  monsterId: string
  skills: MonsterSkillData[]
  attackPatterns: string[][] // Array of skill ID sequences
  currentPatternIndex: number
  currentStepIndex: number
}

// ============================================
// MONSTER AI
// ============================================

/**
 * Generate monster's action queue for this turn based on AI patterns
 */
export function generateMonsterQueue(
  ai: MonsterAI,
  monsterAp: number
): QueuedAction[] {
  const queue: QueuedAction[] = []
  
  // Get current pattern
  const pattern = ai.attackPatterns[ai.currentPatternIndex] || ai.attackPatterns[0]
  if (!pattern || pattern.length === 0) {
    // Fallback: use first skill
    if (ai.skills.length > 0) {
      queue.push(createMonsterSkillAction(ai.skills[0], 0))
    }
    return queue
  }
  
  // Add skills from pattern (up to 3 actions per turn for monsters)
  const maxActions = Math.min(3, pattern.length - ai.currentStepIndex)
  
  for (let i = 0; i < maxActions; i++) {
    const skillId = pattern[ai.currentStepIndex + i]
    const skill = ai.skills.find(s => s.id === skillId)
    
    if (skill) {
      queue.push(createMonsterSkillAction(skill, i))
    }
  }
  
  return queue
}

/**
 * Advance monster AI to next step in pattern
 */
export function advanceMonsterAI(ai: MonsterAI, actionsUsed: number): void {
  ai.currentStepIndex += actionsUsed
  
  // If pattern complete, move to next pattern
  const pattern = ai.attackPatterns[ai.currentPatternIndex]
  if (ai.currentStepIndex >= pattern.length) {
    ai.currentPatternIndex = (ai.currentPatternIndex + 1) % ai.attackPatterns.length
    ai.currentStepIndex = 0
  }
}

// ============================================
// TURN EXECUTION
// ============================================

/**
 * Execute a full combat turn
 */
export function executeTurn(
  state: CombatState,
  playerQueue: QueuedAction[],
  monsterSkills: Map<string, MonsterSkillData>
): TurnResult {
  const outcomes: ActionOutcome[] = []
  const skillUseCounts: Record<string, number> = {}
  let playerDamageDealt = 0
  let playerDamageTaken = 0
  let playerHealing = 0
  
  // ============================================
  // TURN START PROCESSING
  // ============================================
  
  // Process DoT, regen, cooldowns for both entities
  const playerTurnStart = processTurnStart(state.player)
  const monsterTurnStart = processTurnStart(state.monster)
  
  // Check if player is stunned
  if (playerTurnStart.isStunned) {
    playerQueue = [] // Cannot act
  }
  
  // ============================================
  // DETECT COMBOS
  // ============================================
  
  const enemyHpPercent = (state.monster.currentHp / state.monster.maxHp) * 100
  const combos = detectCombos(playerQueue, enemyHpPercent)
  
  // ============================================
  // INTERLEAVE ACTIONS BY SPEED
  // ============================================
  
  const allActions = interleaveActionQueues(playerQueue, state.monsterQueue)
  
  // Track remaining AP
  let playerApRemaining = state.player.currentAp
  let remainingPlayerQueue = [...playerQueue]
  
  // ============================================
  // EXECUTE EACH ACTION
  // ============================================
  
  for (let i = 0; i < allActions.length; i++) {
    const action = allActions[i]
    
    // Check if combat is over
    if (state.player.currentHp <= 0 || state.monster.currentHp <= 0) {
      break
    }
    
    const outcome: ActionOutcome = {
      action,
      success: false,
      hits: [],
      damages: [],
      totalDamage: 0,
      isCrit: false,
      isDodged: false,
      isBlocked: false,
    }
    
    if (action.actor === 'player') {
      // ============================================
      // PLAYER ACTION
      // ============================================
      
      if (action.actionType === 'item') {
        // Item use (always succeeds, no AP cost)
        outcome.success = true
        if (action.itemData?.effect === 'heal') {
          const healing = Math.min(
            action.itemData.value,
            state.player.maxHp - state.player.currentHp
          )
          state.player.currentHp += healing
          outcome.healingDone = healing
          playerHealing += healing
        }
      } else if (action.skill) {
        const skill = action.skill
        
        // Check AP
        if (playerApRemaining < skill.apCost) {
          outcome.apExhausted = true
          outcomes.push(outcome)
          continue
        }
        
        // Consume AP
        playerApRemaining -= skill.apCost
        state.player.currentAp = playerApRemaining
        
        // Track skill use
        skillUseCounts[skill.id] = (skillUseCounts[skill.id] || 0) + 1
        
        // Set cooldown
        if (skill.cooldown > 0) {
          state.skillCooldowns[skill.id] = skill.cooldown
        }
        
        // Get combo multiplier
        const actionIndex = playerQueue.findIndex(a => a.id === action.id)
        const comboMultiplier = getComboMultiplier(actionIndex, combos)
        
        if (skill.buffType && skill.targetType === 'self') {
          // Self buff
          outcome.success = true
          applyBuff(
            state.player,
            skill.buffType as BuffType,
            skill.buffValue || 10,
            skill.buffDuration || 3,
            skill.id
          )
          outcome.buffApplied = skill.buffType as BuffType
        } else if (skill.skillType === 'Attack') {
          // Attack skill
          const hitResult = calculateSingleHit(
            state.player,
            state.monster,
            skill,
            false
          )
          
          outcome.success = true
          outcome.hits.push(hitResult.hits)
          outcome.isCrit = hitResult.isCrit
          outcome.isDodged = hitResult.isDodged
          
          // Apply combo multiplier
          let damage = hitResult.finalDamage
          if (comboMultiplier > 1) {
            damage = Math.floor(damage * comboMultiplier)
          }
          
          outcome.damages.push(damage)
          outcome.totalDamage = damage
          playerDamageDealt += damage
          
          // Apply damage to monster
          state.monster.currentHp = Math.max(0, state.monster.currentHp - damage)
          
          // Apply debuff if skill has one
          if (skill.debuffType && hitResult.hits && rollDebuffApplication(skill)) {
            applyDebuff(
              state.monster,
              skill.debuffType as DebuffType,
              skill.debuffValue || 10,
              skill.debuffDuration || 2,
              skill.id,
              state.player.id
            )
            outcome.debuffApplied = skill.debuffType as DebuffType
          }
        }
      }
    } else {
      // ============================================
      // MONSTER ACTION
      // ============================================
      
      const monsterSkill = monsterSkills.get(action.actionId)
      
      if (monsterSkill) {
        // Check for player reaction
        const reaction = findReactionInQueue(remainingPlayerQueue, action)
        
        if (reaction && reaction.skill?.isReaction) {
          // Player has a reaction skill queued
          const reactionSkill = reaction.skill
          
          if (reactionSkill.skillType === 'Defensive') {
            // Dodge attempt
            const dodgeChance = state.player.dodgeChance + 20 // Bonus for active dodge
            const dodgeRoll = Math.random() * 100
            const dodgeSuccess = dodgeRoll < dodgeChance
            
            outcome.reactionTriggered = {
              type: 'dodge',
              success: dodgeSuccess,
            }
            
            if (dodgeSuccess) {
              outcome.isDodged = true
              outcome.success = true
              outcome.totalDamage = 0
            }
          }
          
          // Remove used reaction from queue
          remainingPlayerQueue = consumeReaction(remainingPlayerQueue, reaction.id)
        }
        
        if (!outcome.isDodged) {
          // Monster attack hits
          const hitRoll = Math.random() * 100
          const hitChance = monsterSkill.accuracy - state.player.dodgeChance
          const hits = hitRoll < hitChance
          
          outcome.success = true
          outcome.hits.push(hits)
          
          if (hits) {
            // Calculate damage
            let damage = monsterSkill.baseDamage
            
            // Apply player defense
            const defenseReduction = state.player.defense / (state.player.defense + 100)
            damage = Math.floor(damage * (1 - defenseReduction))
            damage = Math.max(1, damage)
            
            outcome.damages.push(damage)
            outcome.totalDamage = damage
            playerDamageTaken += damage
            
            // Apply damage to player
            state.player.currentHp = Math.max(0, state.player.currentHp - damage)
            
            // Apply debuff if monster skill has one
            if (monsterSkill.appliesDebuff && monsterSkill.debuffChance) {
              const debuffRoll = Math.random() * 100
              if (debuffRoll < monsterSkill.debuffChance) {
                applyDebuff(
                  state.player,
                  monsterSkill.appliesDebuff as DebuffType,
                  monsterSkill.debuffValue || 10,
                  monsterSkill.debuffDuration || 2
                )
                outcome.debuffApplied = monsterSkill.appliesDebuff as DebuffType
              }
            }
          } else {
            outcome.isDodged = true
          }
        }
      }
    }
    
    outcomes.push(outcome)
  }
  
  // ============================================
  // APPLY COMBO AP REFUND
  // ============================================
  
  const apRefund = getComboApRefund(combos)
  if (apRefund > 0) {
    state.player.currentAp = Math.min(
      state.player.maxAp,
      state.player.currentAp + apRefund
    )
  }
  
  // ============================================
  // CHECK WIN/LOSE CONDITIONS
  // ============================================
  
  const monsterDefeated = state.monster.currentHp <= 0
  const playerDefeated = state.player.currentHp <= 0
  
  let xpGained: number | undefined
  let colGained: number | undefined
  
  if (monsterDefeated) {
    state.status = 'won'
    xpGained = state.monsterData.xpReward
    colGained = state.monsterData.colReward
  } else if (playerDefeated) {
    state.status = 'lost'
  }
  
  // ============================================
  // GENERATE NARRATIVE
  // ============================================
  
  const narrative = generateTurnNarrative(
    state.turn,
    outcomes,
    state.player.name,
    state.monsterData.name,
    monsterSkills
  )
  
  // Add victory/defeat narrative
  if (monsterDefeated) {
    narrative.fullNarrative += '\n\n' + narrateVictory(
      state.player.name,
      state.monsterData.name,
      xpGained!,
      colGained!
    )
  } else if (playerDefeated) {
    narrative.fullNarrative += '\n\n' + narrateDefeat(
      state.player.name,
      state.monsterData.name
    )
  }
  
  // ============================================
  // ADVANCE TURN
  // ============================================
  
  state.turn++
  state.turnHistory.push(narrative)
  
  // Tick down cooldowns
  for (const skillId of Object.keys(state.skillCooldowns)) {
    state.skillCooldowns[skillId]--
    if (state.skillCooldowns[skillId] <= 0) {
      delete state.skillCooldowns[skillId]
    }
  }
  
  return {
    state,
    narrative,
    combosTriggered: combos,
    playerDamageDealt,
    playerDamageTaken,
    playerHealing,
    monsterDefeated,
    playerDefeated,
    xpGained,
    colGained,
    skillUseCounts,
  }
}

// ============================================
// FLEE ATTEMPT
// ============================================

/**
 * Attempt to flee from combat
 * Success based on player AGI vs monster speed
 */
export function attemptFlee(state: CombatState): {
  success: boolean
  narrative: string
} {
  // Base 50% chance, modified by speed difference
  const speedDiff = state.player.agi - state.monster.speed
  const fleeChance = Math.max(10, Math.min(90, 50 + speedDiff))
  
  const roll = Math.random() * 100
  const success = roll < fleeChance
  
  if (success) {
    state.status = 'fled'
  }
  
  return {
    success,
    narrative: narrateFlee(state.player.name, state.monsterData.name, success),
  }
}

// ============================================
// COMBAT INITIALIZATION
// ============================================

/**
 * Initialize a new combat state
 */
export function initializeCombat(
  sessionId: string,
  player: CombatEntity,
  monster: CombatEntity,
  monsterData: { id: string; name: string; xpReward: number; colReward: number }
): CombatState {
  return {
    sessionId,
    turn: 1,
    status: 'active',
    player,
    monster,
    monsterData,
    playerQueue: [],
    monsterQueue: [],
    skillCooldowns: {},
    turnHistory: [],
  }
}

// ============================================
// XP CALCULATION
// ============================================

/**
 * Calculate XP needed for next level
 * Formula: 100 * level^1.5
 */
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5))
}

/**
 * Check if player should level up and return new level
 */
export function checkLevelUp(
  currentLevel: number,
  currentXp: number
): { newLevel: number; xpRemaining: number; levelsGained: number } {
  let level = currentLevel
  let xp = currentXp
  let levelsGained = 0
  
  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level)
    level++
    levelsGained++
  }
  
  return {
    newLevel: level,
    xpRemaining: xp,
    levelsGained,
  }
}
