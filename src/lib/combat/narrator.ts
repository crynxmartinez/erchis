// ============================================
// COMBAT NARRATIVE GENERATOR
// Creates unified story text from combat actions
// ============================================

import { CombatSkill, DamageInstance, BuffType, DebuffType, BUFF_CONFIG, DEBUFF_CONFIG } from './types'
import { QueuedAction, MonsterSkillData } from './sequence'

// ============================================
// TYPES
// ============================================

export interface ActionOutcome {
  action: QueuedAction
  success: boolean
  hits: boolean[]
  damages: number[]
  totalDamage: number
  isCrit: boolean
  isDodged: boolean
  isBlocked: boolean
  buffApplied?: BuffType
  debuffApplied?: DebuffType
  healingDone?: number
  apExhausted?: boolean
  reactionTriggered?: {
    type: 'dodge' | 'guard' | 'counter'
    success: boolean
  }
}

export interface TurnNarrative {
  turn: number
  fullNarrative: string
  actionNarratives: string[]
  outcomes: ActionOutcome[]
}

// ============================================
// NARRATIVE TEMPLATES
// ============================================

const PLAYER_ATTACK_TEMPLATES = {
  hit: [
    "Your {skill} connects with {enemy}, dealing {damage} damage!",
    "The {skill} lands true, striking {enemy} for {damage} damage!",
    "You execute {skill} with precision, {enemy} takes {damage} damage!",
  ],
  crit: [
    "Critical hit! Your {skill} devastates {enemy} for {damage} damage!",
    "A perfect strike! {enemy} reels from {damage} critical damage!",
    "Your {skill} finds a weak point—{damage} critical damage!",
  ],
  miss: [
    "Your {skill} whiffs past {enemy}, hitting nothing but air.",
    "{enemy} narrowly avoids your {skill}.",
    "You swing with {skill}, but {enemy} is no longer there.",
  ],
  blocked: [
    "{enemy} raises their guard, reducing the impact of your {skill}.",
    "Your {skill} connects, but {enemy}'s defense absorbs much of the blow.",
  ],
}

const PLAYER_BUFF_TEMPLATES = {
  self: [
    "You channel your energy, activating {skill}. {buffEffect}",
    "Power surges through you as {skill} takes effect. {buffEffect}",
    "You focus your mind and body. {buffEffect}",
  ],
}

const PLAYER_ITEM_TEMPLATES = {
  potion: [
    "You uncork a {item} and down its contents. {effect}",
    "You quickly drink a {item}. {effect}",
  ],
  food: [
    "You consume a {item}. {effect}",
  ],
}

const PLAYER_REACTION_TEMPLATES = {
  dodge_success: [
    "You twist away from {enemy}'s attack, avoiding damage entirely!",
    "Your quick reflexes save you as you dodge the incoming blow!",
    "Anticipating the strike, you sidestep gracefully—the attack misses!",
  ],
  dodge_fail: [
    "You attempt to dodge, but {enemy}'s attack is too fast!",
    "Your evasion fails—the blow catches you!",
  ],
  guard_success: [
    "You raise your guard, absorbing much of the impact!",
    "Your defensive stance reduces the incoming damage!",
  ],
  counter_success: [
    "You parry the attack and strike back with {skill}!",
    "Deflecting the blow, you immediately counter with {skill}!",
  ],
}

const MONSTER_ATTACK_TEMPLATES = {
  hit: [
    "{enemy} strikes with {skill}, dealing {damage} damage to you!",
    "The {enemy}'s {skill} connects—you take {damage} damage!",
  ],
  crit: [
    "{enemy} lands a devastating {skill}! You take {damage} critical damage!",
  ],
  miss: [
    "{enemy} attacks with {skill}, but you evade the blow!",
    "The {enemy}'s {skill} misses its mark!",
  ],
}

const TRANSITION_TEMPLATES = {
  player_to_monster: [
    "Seizing an opening, {enemy} retaliates!",
    "{enemy} presses the attack!",
    "The {enemy} strikes back!",
  ],
  monster_to_player: [
    "You see your chance and act!",
    "Finding an opening, you move!",
    "You press your advantage!",
  ],
}

const AP_EXHAUSTED_TEMPLATES = [
  "You raise your weapon to continue, but exhaustion weighs heavy on your limbs. You lack the energy to continue.",
  "Your muscles burn with fatigue—you cannot execute the remaining actions.",
]

// ============================================
// HELPER FUNCTIONS
// ============================================

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function replaceTemplateVars(
  template: string,
  vars: Record<string, string | number>
): string {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
  }
  return result
}

function getBuffEffectDescription(buffType: BuffType, value: number): string {
  const config = BUFF_CONFIG[buffType]
  return config.description.replace('{value}', String(value))
}

function getDebuffEffectDescription(debuffType: DebuffType, value: number): string {
  const config = DEBUFF_CONFIG[debuffType]
  return config.description.replace('{value}', String(value))
}

// ============================================
// NARRATIVE GENERATION
// ============================================

/**
 * Generate narrative for a player attack action
 */
export function narratePlayerAttack(
  skillName: string,
  enemyName: string,
  outcome: ActionOutcome,
  customNarrative?: string
): string {
  // Use custom narrative from skill if available
  if (customNarrative && outcome.hits[0]) {
    return replaceTemplateVars(customNarrative, {
      enemy: enemyName,
      damage: outcome.totalDamage,
      skill: skillName,
    })
  }
  
  if (outcome.isDodged) {
    return replaceTemplateVars(pickRandom(PLAYER_ATTACK_TEMPLATES.miss), {
      skill: skillName,
      enemy: enemyName,
    })
  }
  
  if (outcome.isBlocked) {
    return replaceTemplateVars(pickRandom(PLAYER_ATTACK_TEMPLATES.blocked), {
      skill: skillName,
      enemy: enemyName,
      damage: outcome.totalDamage,
    })
  }
  
  if (outcome.isCrit) {
    return replaceTemplateVars(pickRandom(PLAYER_ATTACK_TEMPLATES.crit), {
      skill: skillName,
      enemy: enemyName,
      damage: outcome.totalDamage,
    })
  }
  
  return replaceTemplateVars(pickRandom(PLAYER_ATTACK_TEMPLATES.hit), {
    skill: skillName,
    enemy: enemyName,
    damage: outcome.totalDamage,
  })
}

/**
 * Generate narrative for a player buff action
 */
export function narratePlayerBuff(
  skillName: string,
  buffType: BuffType,
  buffValue: number
): string {
  const buffEffect = getBuffEffectDescription(buffType, buffValue)
  return replaceTemplateVars(pickRandom(PLAYER_BUFF_TEMPLATES.self), {
    skill: skillName,
    buffEffect: `(${buffEffect})`,
  })
}

/**
 * Generate narrative for a player item use
 */
export function narratePlayerItem(
  itemName: string,
  effect: string,
  value: number
): string {
  const effectText = effect === 'heal' 
    ? `You recover ${value} HP.`
    : `${effect} +${value}`
  
  return replaceTemplateVars(pickRandom(PLAYER_ITEM_TEMPLATES.potion), {
    item: itemName,
    effect: effectText,
  })
}

/**
 * Generate narrative for a monster attack
 */
export function narrateMonsterAttack(
  monsterName: string,
  skillName: string,
  outcome: ActionOutcome,
  monsterSkill?: MonsterSkillData
): string {
  // Use custom narrative from monster skill if available
  if (monsterSkill) {
    if (outcome.isDodged) {
      return replaceTemplateVars(monsterSkill.narrativeMiss, {
        enemy: monsterName,
        skill: skillName,
      })
    }
    if (outcome.isCrit && monsterSkill.narrativeCrit) {
      return replaceTemplateVars(monsterSkill.narrativeCrit, {
        enemy: monsterName,
        skill: skillName,
        damage: outcome.totalDamage,
      })
    }
    return replaceTemplateVars(monsterSkill.narrativeHit, {
      enemy: monsterName,
      skill: skillName,
      damage: outcome.totalDamage,
    })
  }
  
  // Fallback to generic templates
  if (outcome.isDodged) {
    return replaceTemplateVars(pickRandom(MONSTER_ATTACK_TEMPLATES.miss), {
      enemy: monsterName,
      skill: skillName,
    })
  }
  
  if (outcome.isCrit) {
    return replaceTemplateVars(pickRandom(MONSTER_ATTACK_TEMPLATES.crit), {
      enemy: monsterName,
      skill: skillName,
      damage: outcome.totalDamage,
    })
  }
  
  return replaceTemplateVars(pickRandom(MONSTER_ATTACK_TEMPLATES.hit), {
    enemy: monsterName,
    skill: skillName,
    damage: outcome.totalDamage,
  })
}

/**
 * Generate narrative for a reaction (dodge/guard/counter)
 */
export function narrateReaction(
  reactionType: 'dodge' | 'guard' | 'counter',
  success: boolean,
  enemyName: string,
  counterSkillName?: string
): string {
  switch (reactionType) {
    case 'dodge':
      return pickRandom(success 
        ? PLAYER_REACTION_TEMPLATES.dodge_success 
        : PLAYER_REACTION_TEMPLATES.dodge_fail
      ).replace('{enemy}', enemyName)
    
    case 'guard':
      return pickRandom(PLAYER_REACTION_TEMPLATES.guard_success)
    
    case 'counter':
      return replaceTemplateVars(pickRandom(PLAYER_REACTION_TEMPLATES.counter_success), {
        skill: counterSkillName || 'a counter attack',
      })
    
    default:
      return ''
  }
}

/**
 * Generate transition text between actors
 */
export function narrateTransition(
  fromActor: 'player' | 'monster',
  toActor: 'player' | 'monster',
  enemyName: string
): string {
  if (fromActor === toActor) return ''
  
  const templates = fromActor === 'player' 
    ? TRANSITION_TEMPLATES.player_to_monster
    : TRANSITION_TEMPLATES.monster_to_player
  
  return replaceTemplateVars(pickRandom(templates), { enemy: enemyName })
}

/**
 * Generate AP exhaustion narrative
 */
export function narrateApExhaustion(): string {
  return pickRandom(AP_EXHAUSTED_TEMPLATES)
}

/**
 * Generate debuff application narrative
 */
export function narrateDebuffApplied(
  targetName: string,
  debuffType: DebuffType,
  value: number
): string {
  const config = DEBUFF_CONFIG[debuffType]
  return `${targetName} is afflicted with ${config.name}! (${getDebuffEffectDescription(debuffType, value)})`
}

/**
 * Generate buff application narrative
 */
export function narrateBuffApplied(
  targetName: string,
  buffType: BuffType,
  value: number
): string {
  const config = BUFF_CONFIG[buffType]
  return `${targetName} gains ${config.name}! (${getBuffEffectDescription(buffType, value)})`
}

// ============================================
// FULL TURN NARRATIVE GENERATION
// ============================================

/**
 * Generate a complete unified narrative for a turn
 */
export function generateTurnNarrative(
  turn: number,
  outcomes: ActionOutcome[],
  playerName: string,
  enemyName: string,
  monsterSkills?: Map<string, MonsterSkillData>
): TurnNarrative {
  const actionNarratives: string[] = []
  let previousActor: 'player' | 'monster' | null = null
  
  for (const outcome of outcomes) {
    const { action } = outcome
    
    // Add transition if switching actors
    if (previousActor && previousActor !== action.actor) {
      const transition = narrateTransition(previousActor, action.actor, enemyName)
      if (transition) {
        actionNarratives.push(transition)
      }
    }
    
    // Check for AP exhaustion
    if (outcome.apExhausted) {
      actionNarratives.push(narrateApExhaustion())
      continue
    }
    
    // Generate action narrative
    if (action.actor === 'player') {
      if (action.actionType === 'item') {
        actionNarratives.push(narratePlayerItem(
          action.actionName,
          action.itemData?.effect || 'heal',
          action.itemData?.value || 0
        ))
      } else if (action.skill) {
        if (action.skill.buffType && action.skill.targetType === 'self') {
          actionNarratives.push(narratePlayerBuff(
            action.actionName,
            action.skill.buffType,
            action.skill.buffValue || 10
          ))
        } else {
          actionNarratives.push(narratePlayerAttack(
            action.actionName,
            enemyName,
            outcome,
            action.skill.narrativeSuccess
          ))
        }
        
        // Add debuff narrative if applied
        if (outcome.debuffApplied) {
          actionNarratives.push(narrateDebuffApplied(
            enemyName,
            outcome.debuffApplied,
            action.skill.debuffValue || 10
          ))
        }
      }
    } else {
      // Monster action
      const monsterSkill = monsterSkills?.get(action.actionId)
      actionNarratives.push(narrateMonsterAttack(
        enemyName,
        action.actionName,
        outcome,
        monsterSkill
      ))
      
      // Add reaction narrative if triggered
      if (outcome.reactionTriggered) {
        actionNarratives.push(narrateReaction(
          outcome.reactionTriggered.type,
          outcome.reactionTriggered.success,
          enemyName
        ))
      }
      
      // Add debuff narrative if applied
      if (outcome.debuffApplied) {
        actionNarratives.push(narrateDebuffApplied(
          playerName,
          outcome.debuffApplied,
          10
        ))
      }
    }
    
    previousActor = action.actor
  }
  
  // Combine into full narrative
  const fullNarrative = actionNarratives.join('\n\n')
  
  return {
    turn,
    fullNarrative,
    actionNarratives,
    outcomes,
  }
}

// ============================================
// COMBAT END NARRATIVES
// ============================================

export function narrateVictory(
  playerName: string,
  enemyName: string,
  xpGained: number,
  colGained: number
): string {
  return `The ${enemyName} collapses, defeated! You stand victorious.\n\n` +
    `**Rewards:**\n` +
    `• ${xpGained} XP gained\n` +
    `• ${colGained} Col acquired`
}

export function narrateDefeat(playerName: string, enemyName: string): string {
  return `Your vision fades as you fall to the ground. The ${enemyName} has bested you.\n\n` +
    `You wake up back in town, having lost some Col...`
}

export function narrateFlee(playerName: string, enemyName: string, success: boolean): string {
  if (success) {
    return `You turn and sprint away from the ${enemyName}, escaping to safety!`
  }
  return `You try to flee, but the ${enemyName} blocks your escape!`
}
