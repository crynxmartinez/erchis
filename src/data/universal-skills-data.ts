// Universal Starter Skills - Grouped by Skill Type
// 100 total starter skills in 9 categories

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
  // MELEE ATTACKS (15) - melee_only
  // Physical: 50-100% amp, can crit
  // ============================================
  {
    id: 'melee_attack',
    name: 'Melee Attacks',
    icon: '⚔️',
    color: 'bg-red-900/50 border-red-500 text-red-300',
    description: 'Physical close-range attacks requiring melee weapons',
    weaponRequirement: 'melee_only',
    skills: [
      { name: 'Slash', subtype: 'Basic', description: 'A basic horizontal cut.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 60, apCost: 3, cooldown: 1, range: 1 },
      { name: 'Thrust', subtype: 'Basic', description: 'A forward piercing stab.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 60, apCost: 3, cooldown: 1, range: 1 },
      { name: 'Smash', subtype: 'Power', description: 'A heavy overhead strike.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 80, apCost: 5, cooldown: 2, range: 1 },
      { name: 'Cleave', subtype: 'AoE', description: 'A wide sweeping attack.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 70, apCost: 5, cooldown: 2, range: 1 },
      { name: 'Chop', subtype: 'Basic', description: 'A downward chopping motion.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 60, apCost: 3, cooldown: 1, range: 1 },
      { name: 'Bash', subtype: 'Stun', description: 'A blunt strike that can stagger.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 60, apCost: 4, cooldown: 2, range: 1 },
      { name: 'Uppercut', subtype: 'Power', description: 'A rising strike from below.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 75, apCost: 5, cooldown: 2, range: 1 },
      { name: 'Sweep', subtype: 'AoE', description: 'A low sweeping attack.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 65, apCost: 5, cooldown: 2, range: 1 },
      { name: 'Pommel Strike', subtype: 'Stun', description: 'Strike with weapon hilt to stun.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 55, apCost: 4, cooldown: 2, range: 1 },
      { name: 'Lunge', subtype: 'Movement', description: 'A forward thrust with extended reach.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 65, apCost: 4, cooldown: 1, range: 2 },
      { name: 'Heavy Strike', subtype: 'Power', description: 'A slow but powerful attack.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 85, apCost: 6, cooldown: 2, range: 1 },
      { name: 'Quick Stab', subtype: 'Fast', description: 'A rapid piercing attack.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 50, apCost: 2, cooldown: 1, range: 1 },
      { name: 'Cross Cut', subtype: 'Combo', description: 'Two diagonal slashes in succession.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 50, apCost: 4, cooldown: 1, range: 1 },
      { name: 'Rend', subtype: 'Bleed', description: 'A tearing attack that causes bleeding.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 55, apCost: 4, cooldown: 2, range: 1 },
      { name: 'Execute', subtype: 'Finisher', description: 'A powerful finishing blow.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 90, apCost: 6, cooldown: 3, range: 1 },
    ]
  },

  // ============================================
  // RANGED ATTACKS (15) - ranged_only
  // ============================================
  {
    id: 'ranged_attack',
    name: 'Ranged Attacks',
    icon: '🏹',
    color: 'bg-green-900/50 border-green-500 text-green-300',
    description: 'Physical ranged attacks requiring ranged weapons',
    weaponRequirement: 'ranged_only',
    skills: [
      { name: 'Shot', subtype: 'Basic', description: 'A standard ranged attack.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 60, apCost: 3, cooldown: 1, range: 4 },
      { name: 'Aimed Shot', subtype: 'Precision', description: 'A carefully aimed shot with bonus accuracy.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 70, apCost: 4, cooldown: 2, range: 5 },
      { name: 'Quick Shot', subtype: 'Fast', description: 'A rapid but less accurate shot.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 50, apCost: 2, cooldown: 1, range: 3 },
      { name: 'Power Shot', subtype: 'Power', description: 'A fully drawn powerful shot.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 80, apCost: 5, cooldown: 2, range: 4 },
      { name: 'Volley', subtype: 'AoE', description: 'Rain of projectiles on an area.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 65, apCost: 5, cooldown: 2, range: 4 },
      { name: 'Snipe', subtype: 'Precision', description: 'Long-range precision shot.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 75, apCost: 5, cooldown: 2, range: 6 },
      { name: 'Burst Fire', subtype: 'Combo', description: 'Rapid fire burst of shots.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 50, apCost: 4, cooldown: 1, range: 4 },
      { name: 'Piercing Shot', subtype: 'Armor-Pierce', description: 'A shot that ignores armor.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 65, apCost: 4, cooldown: 2, range: 4 },
      { name: 'Scatter Shot', subtype: 'AoE', description: 'Spread shot hitting multiple targets.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 60, apCost: 5, cooldown: 2, range: 3 },
      { name: 'Pinning Shot', subtype: 'Debuff', description: 'Pin enemy in place.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 55, apCost: 4, cooldown: 2, range: 4 },
      { name: 'Throw', subtype: 'Basic', description: 'Throw a projectile at the target.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 55, apCost: 3, cooldown: 1, range: 3 },
      { name: 'Ricochet', subtype: 'Combo', description: 'Shot that bounces to another target.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 55, apCost: 4, cooldown: 2, range: 4 },
      { name: 'Suppressing Fire', subtype: 'Debuff', description: 'Keep enemy pinned down.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 50, apCost: 4, cooldown: 2, range: 4 },
      { name: 'Charged Shot', subtype: 'Power', description: 'Charge up for a powerful shot.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 85, apCost: 6, cooldown: 3, range: 5 },
      { name: 'Double Shot', subtype: 'Combo', description: 'Fire two shots in quick succession.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 50, apCost: 4, cooldown: 1, range: 4 },
    ]
  },

  // ============================================
  // MAGIC ATTACKS (15) - magic_only (with utility mode for non-magic weapons)
  // ============================================
  {
    id: 'magic_attack',
    name: 'Magic Attacks',
    icon: '✨',
    color: 'bg-purple-900/50 border-purple-500 text-purple-300',
    description: 'Magical damage spells. Can enchant weapons when used with non-magic weapons.',
    weaponRequirement: 'magic_only',
    skills: [
      { name: 'Fireball', subtype: 'Fire', description: 'Launch a ball of fire at the enemy.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 110, apCost: 4, cooldown: 2, range: 3, hasUtilityMode: true, utilityEffect: 'fire_enchant', utilityDuration: 3 },
      { name: 'Ice Spike', subtype: 'Ice', description: 'Hurl a shard of ice at the enemy.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 110, apCost: 4, cooldown: 2, range: 3, hasUtilityMode: true, utilityEffect: 'ice_enchant', utilityDuration: 3 },
      { name: 'Lightning Bolt', subtype: 'Lightning', description: 'Strike the enemy with lightning.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 115, apCost: 4, cooldown: 2, range: 4, hasUtilityMode: true, utilityEffect: 'lightning_enchant', utilityDuration: 3 },
      { name: 'Arcane Blast', subtype: 'Arcane', description: 'A burst of pure arcane energy.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 100, apCost: 3, cooldown: 1, range: 3 },
      { name: 'Shadow Strike', subtype: 'Dark', description: 'Attack with dark energy.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 110, apCost: 4, cooldown: 2, range: 3, hasUtilityMode: true, utilityEffect: 'shadow_enchant', utilityDuration: 3 },
      { name: 'Holy Smite', subtype: 'Holy', description: 'Divine light damages the enemy.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 110, apCost: 4, cooldown: 2, range: 3, hasUtilityMode: true, utilityEffect: 'holy_enchant', utilityDuration: 3 },
      { name: 'Wind Slash', subtype: 'Wind', description: 'A cutting blade of wind.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 105, apCost: 3, cooldown: 1, range: 3, hasUtilityMode: true, utilityEffect: 'wind_enchant', utilityDuration: 3 },
      { name: 'Earth Spike', subtype: 'Earth', description: 'Summon a spike from the ground.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 115, apCost: 4, cooldown: 2, range: 2 },
      { name: 'Water Jet', subtype: 'Water', description: 'A high-pressure stream of water.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 105, apCost: 3, cooldown: 1, range: 3 },
      { name: 'Flame Burst', subtype: 'Fire', description: 'Explosion of flames around target.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 120, apCost: 5, cooldown: 3, range: 2, hasUtilityMode: true, utilityEffect: 'fire_enchant', utilityDuration: 2 },
      { name: 'Frost Nova', subtype: 'Ice', description: 'Burst of cold around caster.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 120, apCost: 5, cooldown: 3, range: 2, hasUtilityMode: true, utilityEffect: 'ice_enchant', utilityDuration: 2 },
      { name: 'Thunder Clap', subtype: 'Lightning', description: 'Shockwave of thunder.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 125, apCost: 5, cooldown: 3, range: 2, hasUtilityMode: true, utilityEffect: 'lightning_enchant', utilityDuration: 2 },
      { name: 'Dark Pulse', subtype: 'Dark', description: 'Wave of dark energy.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 120, apCost: 5, cooldown: 3, range: 2, hasUtilityMode: true, utilityEffect: 'shadow_enchant', utilityDuration: 2 },
      { name: 'Light Ray', subtype: 'Holy', description: 'Beam of holy light.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 115, apCost: 4, cooldown: 2, range: 4, hasUtilityMode: true, utilityEffect: 'holy_enchant', utilityDuration: 2 },
      { name: 'Energy Bolt', subtype: 'Arcane', description: 'Basic bolt of magical energy.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 100, apCost: 3, cooldown: 1, range: 3 },
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
    description: 'Skills that block, parry, or reduce incoming damage',
    weaponRequirement: 'any',
    skills: [
      { name: 'Guard', subtype: 'Block', description: 'Raise defense to reduce damage.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 0 },
      { name: 'Parry', subtype: 'Deflect', description: 'Deflect an incoming attack.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 0 },
      { name: 'Block', subtype: 'Block', description: 'Block with weapon or shield.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 0 },
      { name: 'Brace', subtype: 'Stance', description: 'Brace for heavy impact.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 2, range: 0 },
      { name: 'Deflect', subtype: 'Deflect', description: 'Redirect incoming attack.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 0 },
      { name: 'Shield Wall', subtype: 'Block', description: 'Maximum defensive stance.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 2, range: 0 },
      { name: 'Counter Stance', subtype: 'Counter', description: 'Prepare to counter next attack.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 2, range: 0 },
      { name: 'Iron Skin', subtype: 'Buff', description: 'Harden body to resist damage.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Evasive Stance', subtype: 'Stance', description: 'Increase evasion chance.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 2, range: 0 },
      { name: 'Cover', subtype: 'Protect', description: 'Take cover to reduce damage.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 0 },
    ]
  },

  // ============================================
  // BUFFS (8) - any
  // ============================================
  {
    id: 'buff',
    name: 'Buffs',
    icon: '💪',
    color: 'bg-yellow-900/50 border-yellow-500 text-yellow-300',
    description: 'Skills that enhance yourself or allies',
    weaponRequirement: 'any',
    skills: [
      { name: 'Empower', subtype: 'Damage', description: 'Increase damage output.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Haste', subtype: 'Speed', description: 'Reduce cooldowns temporarily.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Fortify', subtype: 'Defense', description: 'Increase defense.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Focus', subtype: 'Crit', description: 'Increase critical hit chance.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Sharpen', subtype: 'Damage', description: 'Increase weapon sharpness.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Barrier', subtype: 'Shield', description: 'Create a protective barrier.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 4, range: 0 },
      { name: 'Regenerate', subtype: 'Heal', description: 'Heal over time.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Battle Cry', subtype: 'Team', description: 'Boost nearby allies.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 4, range: 2 },
    ]
  },

  // ============================================
  // DEBUFFS (8) - any
  // ============================================
  {
    id: 'debuff',
    name: 'Debuffs',
    icon: '💀',
    color: 'bg-gray-700/50 border-gray-400 text-gray-300',
    description: 'Skills that weaken or impair enemies',
    weaponRequirement: 'any',
    skills: [
      { name: 'Slow', subtype: 'Speed', description: 'Reduce enemy speed.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 2, range: 2 },
      { name: 'Weaken', subtype: 'Damage', description: 'Reduce enemy damage.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 2, range: 2 },
      { name: 'Blind', subtype: 'Accuracy', description: 'Reduce enemy accuracy.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 2, range: 2 },
      { name: 'Armor Break', subtype: 'Defense', description: 'Reduce enemy defense.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 2, range: 2 },
      { name: 'Poison', subtype: 'DoT', description: 'Apply poison damage over time.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 2, range: 2 },
      { name: 'Silence', subtype: 'Disable', description: 'Prevent enemy from using skills.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 3, range: 2 },
      { name: 'Taunt', subtype: 'Aggro', description: 'Force enemy to attack you.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 2, range: 3 },
      { name: 'Mark Target', subtype: 'Mark', description: 'Mark enemy for bonus damage.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 2, range: 4 },
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
    description: 'Movement and positioning skills',
    weaponRequirement: 'any',
    skills: [
      { name: 'Dash', subtype: 'Quick', description: 'Quick burst of movement.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 2 },
      { name: 'Sprint', subtype: 'Speed', description: 'Run at increased speed.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 2, range: 3 },
      { name: 'Jump', subtype: 'Vertical', description: 'Leap into the air.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 2 },
      { name: 'Roll', subtype: 'Evasion', description: 'Dodge roll to evade.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 1 },
      { name: 'Slide', subtype: 'Low', description: 'Slide under obstacles.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 2 },
      { name: 'Vault', subtype: 'Vertical', description: 'Vault over obstacles.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 1 },
      { name: 'Crouch', subtype: 'Stealth', description: 'Lower profile for stealth.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 1, cooldown: 1, range: 0 },
      { name: 'Disengage', subtype: 'Retreat', description: 'Safely retreat from combat.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 2, range: 2 },
      { name: 'Charge', subtype: 'Aggressive', description: 'Rush toward the enemy.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 2, range: 3 },
      { name: 'Sidestep', subtype: 'Evasion', description: 'Quick step to the side.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 1, cooldown: 1, range: 1 },
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
    description: 'Utility skills for information and tactics',
    weaponRequirement: 'any',
    skills: [
      { name: 'Detect', subtype: 'Awareness', description: 'Detect hidden enemies.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 1, cooldown: 1, range: 3 },
      { name: 'Inspect', subtype: 'Analysis', description: 'Analyze enemy weaknesses.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 3 },
      { name: 'Focus Sight', subtype: 'Awareness', description: 'Enhance vision temporarily.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 1, cooldown: 2, range: 0 },
      { name: 'Change Stance', subtype: 'Stance', description: 'Switch combat stance.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 1, cooldown: 1, range: 0 },
      { name: 'Quick Swap', subtype: 'Equipment', description: 'Quickly swap weapons.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 1, cooldown: 1, range: 0 },
      { name: 'Feint', subtype: 'Deception', description: 'Fake attack to create opening.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 1 },
      { name: 'Assess', subtype: 'Analysis', description: 'Assess the battlefield.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 1, cooldown: 1, range: 4 },
      { name: 'Track', subtype: 'Awareness', description: 'Track enemy movements.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 1, cooldown: 2, range: 5 },
      { name: 'Scan', subtype: 'Awareness', description: 'Scan area for threats.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 1, cooldown: 1, range: 4 },
      { name: 'Observe', subtype: 'Analysis', description: 'Carefully observe target.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 3 },
    ]
  },

  // ============================================
  // SUPPORT (9) - any
  // ============================================
  {
    id: 'support',
    name: 'Support',
    icon: '❤️',
    color: 'bg-pink-900/50 border-pink-500 text-pink-300',
    description: 'Healing and support skills',
    weaponRequirement: 'any',
    skills: [
      { name: 'Meditate', subtype: 'Recovery', description: 'Recover HP and MP over time.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Heal', subtype: 'Restore', description: 'Restore HP to target.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 2, range: 2 },
      { name: 'Stabilize', subtype: 'Emergency', description: 'Prevent ally from dying.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 1 },
      { name: 'Help Up', subtype: 'Revive', description: 'Help downed ally stand.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 2, range: 1 },
      { name: 'Cure', subtype: 'Cleanse', description: 'Remove negative effects.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 2, range: 2 },
      { name: 'Revive', subtype: 'Revive', description: 'Revive fallen ally.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 5, cooldown: 4, range: 1 },
      { name: 'Transfer Vitality', subtype: 'Share', description: 'Share HP with ally.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 2, range: 1 },
      { name: 'Protect Ally', subtype: 'Shield', description: 'Shield an ally from harm.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 2, range: 2 },
      { name: 'Rally', subtype: 'Team', description: 'Rally allies to boost morale.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 4, range: 3 },
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
