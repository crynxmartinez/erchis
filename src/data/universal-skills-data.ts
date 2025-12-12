
// Universal Starter Skills - Grouped by Skill Type
// 90 total starter skills (10 per category x 9 categories)

export interface StarterSkill {
  name: string
  subtype: string
  description: string
  damageType: 'physical' | 'magic' | 'none'
  weaponRequirement: 'melee_only' | 'ranged_only' | 'magic_only' | 'any'
  // Skill stats
  ampPercent: number      // Physical: 50-100%, Magic: 100-150%, None: 0%
  apCost: number          // AP cost to use skill
  cooldown: number        // Turns before can use again
  range: number           // Tile range (0 = self, 1 = melee, 2+ = ranged)
  // Magic utility mode (for magic skills used with non-magic weapons)
  hasUtilityMode?: boolean
  utilityEffect?: string // fire_enchant, ice_enchant, etc.
  utilityDuration?: number
  // Counter logic
  isCounter?: boolean
  triggerCondition?: string // after_dodge, after_parry, on_hit_taken
}

export interface SkillTypeCategory {
  id: string
  name: string
  icon: string
  color: string
  description: string
  weaponRequirement: 'melee_only' | 'ranged_only' | 'magic_only' | 'any'
  skills: StarterSkill[]
}

export const SKILL_TYPE_CATEGORIES: SkillTypeCategory[] = [
  // ============================================
  // MELEE ATTACKS (10) - melee_only
  // ============================================
  {
    id: 'melee_attack',
    name: 'Melee Attacks',
    icon: '⚔️',
    color: 'bg-red-900/50 border-red-500 text-red-300',
    description: 'Physical close-range attacks requiring melee weapons.',
    weaponRequirement: 'melee_only',
    skills: [
      { name: 'Sever', subtype: 'Bleed', description: 'Surgical cut that inflicts bleeding.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 60, apCost: 3, cooldown: 2, range: 1 },
      { name: 'Impact', subtype: 'Stun', description: 'Heavy blunt strike that can stagger.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 80, apCost: 5, cooldown: 3, range: 1 },
      { name: 'Flurry', subtype: 'Speed', description: '3 rapid strikes for low damage each.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 40, apCost: 4, cooldown: 2, range: 1 },
      { name: 'Sweep', subtype: 'AoE', description: 'Strikes adjacent enemies in an arc.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 65, apCost: 5, cooldown: 2, range: 1 },
      { name: 'Pierce', subtype: 'Anti-Armor', description: 'Thrust that ignores 50% armor.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 60, apCost: 4, cooldown: 2, range: 1 },
      { name: 'Rush', subtype: 'Mobility', description: 'Dash to target and strike immediately.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 65, apCost: 4, cooldown: 2, range: 3 },
      { name: 'Riposte', subtype: 'Counter', description: 'Block and instantly counter-attack.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 70, apCost: 3, cooldown: 2, range: 1, isCounter: true, triggerCondition: 'after_parry' },
      { name: 'Execute', subtype: 'Finisher', description: 'Double damage to low HP targets.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 90, apCost: 6, cooldown: 4, range: 1 },
      { name: 'Sunder', subtype: 'Debuff', description: 'Damages and reduces enemy defense.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 55, apCost: 4, cooldown: 2, range: 1 },
      { name: 'Focus', subtype: 'Precision', description: 'Guaranteed critical hit strike.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 75, apCost: 5, cooldown: 3, range: 1 },
    ]
  },

  // ============================================
  // RANGED ATTACKS (10) - ranged_only
  // ============================================
  {
    id: 'ranged_attack',
    name: 'Ranged Attacks',
    icon: '🏹',
    color: 'bg-green-900/50 border-green-500 text-green-300',
    description: 'Physical ranged attacks requiring ranged weapons.',
    weaponRequirement: 'ranged_only',
    skills: [
      { name: 'Snipe', subtype: 'Long Range', description: 'High damage shot at extreme range.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 90, apCost: 6, cooldown: 3, range: 8 },
      { name: 'Volley', subtype: 'Area Denial', description: 'Rain arrows on a target zone.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 60, apCost: 5, cooldown: 2, range: 5 },
      { name: 'Scatter', subtype: 'Crowd Control', description: 'Short range cone that knocks back.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 55, apCost: 4, cooldown: 2, range: 3 },
      { name: 'Ricochet', subtype: 'Chain', description: 'Bounces to a second nearby target.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 60, apCost: 4, cooldown: 2, range: 5 },
      { name: 'Kite', subtype: 'Evasion', description: 'Shoot and retreat 1 tile backward.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 50, apCost: 3, cooldown: 1, range: 4 },
      { name: 'Pin', subtype: 'Control', description: 'Roots the target in place.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 40, apCost: 4, cooldown: 3, range: 5 },
      { name: 'Explosive', subtype: 'Splash', description: 'Deals damage to target and neighbors.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 70, apCost: 6, cooldown: 3, range: 5 },
      { name: 'Toxin', subtype: 'DoT', description: 'Applies stacking poison damage.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 45, apCost: 3, cooldown: 2, range: 5 },
      { name: 'Silencer', subtype: 'Disable', description: 'Prevents target from casting magic.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 50, apCost: 4, cooldown: 4, range: 6 },
      { name: 'Twin Shot', subtype: 'Burst', description: 'Fires two projectiles at once.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 50, apCost: 4, cooldown: 2, range: 5 },
    ]
  },

  // ============================================
  // MAGIC ATTACKS (10) - magic_only
  // ============================================
  {
    id: 'magic_attack',
    name: 'Magic Attacks',
    icon: '✨',
    color: 'bg-purple-900/50 border-purple-500 text-purple-300',
    description: 'Spells that damage enemies or infuse weapons.',
    weaponRequirement: 'magic_only',
    skills: [
      { name: 'Ignite', subtype: 'Fire', description: 'Launch a fireball. Infusion: Weapon burns enemies.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 110, apCost: 4, cooldown: 2, range: 4, hasUtilityMode: true, utilityEffect: 'blaze_enchant', utilityDuration: 3 },
      { name: 'Freeze', subtype: 'Ice', description: 'Ice shard that slows. Infusion: Weapon slows target.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 105, apCost: 4, cooldown: 2, range: 4, hasUtilityMode: true, utilityEffect: 'frost_enchant', utilityDuration: 3 },
      { name: 'Shock', subtype: 'Lightning', description: 'Chain lightning. Infusion: Chance to stun.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 100, apCost: 4, cooldown: 2, range: 5, hasUtilityMode: true, utilityEffect: 'volt_enchant', utilityDuration: 3 },
      { name: 'Tremor', subtype: 'Earth', description: 'Earth spike line. Infusion: Heavy knockback.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 115, apCost: 5, cooldown: 3, range: 3, hasUtilityMode: true, utilityEffect: 'weight_enchant', utilityDuration: 3 },
      { name: 'Gale', subtype: 'Wind', description: 'Wind blade. Infusion: Increased attack speed.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 95, apCost: 3, cooldown: 1, range: 4, hasUtilityMode: true, utilityEffect: 'swift_enchant', utilityDuration: 3 },
      { name: 'Drain', subtype: 'Shadow', description: 'Drains life. Infusion: Lifesteal on hit.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 90, apCost: 4, cooldown: 3, range: 3, hasUtilityMode: true, utilityEffect: 'vamp_enchant', utilityDuration: 3 },
      { name: 'Smite', subtype: 'Holy', description: 'Holy ray. Infusion: True damage vs Undead.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 110, apCost: 4, cooldown: 2, range: 4, hasUtilityMode: true, utilityEffect: 'divine_enchant', utilityDuration: 3 },
      { name: 'Force', subtype: 'Arcane', description: 'Magic missile. Infusion: Bypasses block.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 100, apCost: 3, cooldown: 1, range: 5, hasUtilityMode: true, utilityEffect: 'ether_enchant', utilityDuration: 3 },
      { name: 'Bloom', subtype: 'Nature', description: 'Poison cloud. Infusion: Stacking poison.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 90, apCost: 4, cooldown: 3, range: 3, hasUtilityMode: true, utilityEffect: 'venom_enchant', utilityDuration: 3 },
      { name: 'Gravity', subtype: 'Void', description: 'Gravity well. Infusion: Pulls enemies closer.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 120, apCost: 6, cooldown: 4, range: 4, hasUtilityMode: true, utilityEffect: 'flux_enchant', utilityDuration: 3 },
    ]
  },

  // ============================================
  // DEFENSIVE (10) - any
  // ============================================
  {
    id: 'defensive',
    name: 'Defensive',
    icon: '🛡️',
    color: 'bg-blue-900/50 border-blue-500 text-blue-300',
    description: 'Skills to mitigate or avoid damage.',
    weaponRequirement: 'any',
    skills: [
      { name: 'Guard', subtype: 'Block', description: 'Reduces next physical damage by 50%.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 0 },
      { name: 'Parry', subtype: 'Deflect', description: 'Chance to nullify melee attack.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 0 },
      { name: 'Iron Skin', subtype: 'Mitigation', description: '+20% Defense for 3 turns.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Dodge', subtype: 'Evasion', description: 'Guarantees evasion of next attack.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Brace', subtype: 'Anti-CC', description: 'Immunity to Stun/Knockback.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 2, range: 0 },
      { name: 'Reflect', subtype: 'Magic', description: 'Reflect next spell back to sender.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 4, range: 0 },
      { name: 'Absorb', subtype: 'Shield', description: 'Grants temporary damage absorption.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 3, range: 0 },
      { name: 'Intercept', subtype: 'Tank', description: 'Take damage for adjacent ally.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 1 },
      { name: 'Unbreakable', subtype: 'Survival', description: 'HP cannot drop below 1 for 1 turn.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 6, cooldown: 6, range: 0 },
      { name: 'Fortify', subtype: 'Stationary', description: 'Immobile but massively increased defense.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
    ]
  },

  // ============================================
  // BUFFS (10) - any
  // ============================================
  {
    id: 'buff',
    name: 'Buffs',
    icon: '💪',
    color: 'bg-yellow-900/50 border-yellow-500 text-yellow-300',
    description: 'Enhance self capabilities.',
    weaponRequirement: 'any',
    skills: [
      { name: 'Rage', subtype: 'Damage', description: '+Damage, -Defense.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Haste', subtype: 'Speed', description: '+Move Speed, -Cooldowns.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Focus', subtype: 'Crit', description: 'Next attack guarantees Crit.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Stealth', subtype: 'Utility', description: 'Invisible until attack.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 4, range: 0 },
      { name: 'Vigor', subtype: 'HP', description: 'Temporarily increase Max HP.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Clarity', subtype: 'Mana', description: 'Regenerate AP faster.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Thorns', subtype: 'Retaliate', description: 'Attackers take damage.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Accuracy', subtype: 'Hit', description: 'Greatly increase Hit Chance.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 2, range: 0 },
      { name: 'Momentum', subtype: 'Snowball', description: '+Damage per tile moved.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 0 },
      { name: 'Bloodlust', subtype: 'Sustain', description: 'Gain Lifesteal on attacks.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 4, range: 0 },
    ]
  },

  // ============================================
  // DEBUFFS (10) - any
  // ============================================
  {
    id: 'debuff',
    name: 'Debuffs',
    icon: '💀',
    color: 'bg-gray-700/50 border-gray-400 text-gray-300',
    description: 'Cripple or impair enemies.',
    weaponRequirement: 'any',
    skills: [
      { name: 'Blind', subtype: 'Accuracy', description: 'Reduce enemy Hit Chance.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 3 },
      { name: 'Cripple', subtype: 'Move', description: 'Reduce enemy Movement.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 3 },
      { name: 'Silence', subtype: 'Magic', description: 'Prevent spellcasting.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 4, range: 4 },
      { name: 'Disarm', subtype: 'Attack', description: 'Reduce physical damage dealt.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 2 },
      { name: 'Shatter', subtype: 'Defense', description: 'Reduce enemy Armor/Defense.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 2 },
      { name: 'Taunt', subtype: 'Aggro', description: 'Force enemy to attack you.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 2, range: 4 },
      { name: 'Fear', subtype: 'Control', description: 'Chance to skip turn/flee.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 4, range: 3 },
      { name: 'Vulnerable', subtype: 'Amp', description: 'Target takes increased damage.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 4 },
      { name: 'Nullify', subtype: 'Strip', description: 'Remove enemy buffs.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 4 },
      { name: 'Exhaust', subtype: 'Resource', description: 'Increase enemy AP costs.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 3 },
    ]
  },

  // ============================================
  // MOVEMENT (10) - any
  // ============================================
  {
    id: 'movement',
    name: 'Movement',
    icon: '💨',
    color: 'bg-cyan-900/50 border-cyan-500 text-cyan-300',
    description: 'Positioning and mobility.',
    weaponRequirement: 'any',
    skills: [
      { name: 'Dash', subtype: 'Linear', description: 'Move 2 tiles in straight line.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 2 },
      { name: 'Blink', subtype: 'Teleport', description: 'Instant teleport ignoring obstacles.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 3, range: 3 },
      { name: 'Leap', subtype: 'Vertical', description: 'Jump to target tile.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 2, range: 3 },
      { name: 'Vault', subtype: 'Parkour', description: 'Jump over obstacle/enemy.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 2 },
      { name: 'Slide', subtype: 'Evasive', description: 'Move 1 tile + increased evasion.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 1 },
      { name: 'Swap', subtype: 'Tactical', description: 'Switch places with target.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 4 },
      { name: 'Hook', subtype: 'Pull', description: 'Pull self to wall/enemy.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 2, range: 4 },
      { name: 'Retreat', subtype: 'Safety', description: 'Jump backward from target.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 3 },
      { name: 'Charge', subtype: 'Aggro', description: 'Rush towards enemy.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 2, range: 4 },
      { name: 'Phase', subtype: 'Ghost', description: 'Move through units/walls.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 4, range: 0 },
    ]
  },

  // ============================================
  // UTILITY/AWARENESS (10) - any
  // ============================================
  {
    id: 'utility',
    name: 'Utility/Awareness',
    icon: '🔍',
    color: 'bg-orange-900/50 border-orange-500 text-orange-300',
    description: 'Information and tactical interactions.',
    weaponRequirement: 'any',
    skills: [
      { name: 'Scan', subtype: 'Info', description: 'Reveal HP/Weaknesses.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 1, cooldown: 1, range: 5 },
      { name: 'Detect', subtype: 'Anti-Stealth', description: 'Reveal hidden units.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 2, range: 5 },
      { name: 'Distract', subtype: 'Aggro', description: 'Lure enemies to location.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 2, range: 4 },
      { name: 'Loot', subtype: 'Greed', description: 'Steal item from enemy.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 1, range: 1 },
      { name: 'Salvage', subtype: 'Resource', description: 'Harvest extra materials.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 1 },
      { name: 'Track', subtype: 'Hunt', description: 'See target even if hidden.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 3, range: 6 },
      { name: 'Bait', subtype: 'Trap', description: 'Place lure that attracts aggro.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 3 },
      { name: 'Night Vision', subtype: 'Vision', description: 'Ignore darkness penalties.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 4, range: 0 },
      { name: 'Identify', subtype: 'Lore', description: 'Identify item without scroll.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 5, cooldown: 1, range: 0 },
      { name: 'Camouflage', subtype: 'Stealth', description: 'Blend into terrain.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
    ]
  },

  // ============================================
  // SUPPORT (10) - any
  // ============================================
  {
    id: 'support',
    name: 'Support',
    icon: '❤️',
    color: 'bg-pink-900/50 border-pink-500 text-pink-300',
    description: 'Healing and team assistance.',
    weaponRequirement: 'any',
    skills: [
      { name: 'Heal', subtype: 'Restore', description: 'Restore HP to target.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 2, range: 3 },
      { name: 'Group Heal', subtype: 'AoE', description: 'Restore small HP to area.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 6, cooldown: 4, range: 3 },
      { name: 'Cleanse', subtype: 'Cure', description: 'Remove debuffs.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 2, range: 4 },
      { name: 'Revive', subtype: 'Life', description: 'Revive fallen ally.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 8, cooldown: 6, range: 1 },
      { name: 'Shield', subtype: 'Protect', description: 'Grant HP barrier.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 3, range: 4 },
      { name: 'Empower', subtype: 'Buff', description: 'Increase ally damage.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 4 },
      { name: 'Sanctuary', subtype: 'Zone', description: 'Zone of HP regen.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 5, cooldown: 5, range: 4 },
      { name: 'Sacrifice', subtype: 'Trade', description: 'Lose HP to heal ally double.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 2, range: 3 },
      { name: 'Inspire', subtype: 'Resource', description: 'Restore AP to ally.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 4, range: 4 },
      { name: 'Guardian', subtype: 'Link', description: 'Take 50% of ally damage.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 3 },
    ]
  },
]

// Helper to get all skills as flat array
export function getAllStarterSkills(): StarterSkill[] {
  return SKILL_TYPE_CATEGORIES.flatMap(cat => cat.skills)
}

// Helper to get skill count by category
export function getSkillCountByCategory(): Record<string, number> {
  return SKILL_TYPE_CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = cat.skills.length
    return acc
  }, {} as Record<string, number>)
}

// Helper to get total skill count
export function getTotalSkillCount(): number {
  return SKILL_TYPE_CATEGORIES.reduce((acc, cat) => acc + cat.skills.length, 0)
}
