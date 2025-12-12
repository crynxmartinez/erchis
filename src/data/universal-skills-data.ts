
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
  // Flavor
  executionDescription?: string
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
      { name: 'Sever', subtype: 'Bleed', description: 'Surgical cut that inflicts bleeding.', executionDescription: 'You target a vital artery with a precise, clean cut.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 60, apCost: 3, cooldown: 2, range: 1 },
      { name: 'Impact', subtype: 'Stun', description: 'Heavy blunt strike that can stagger.', executionDescription: 'You gather your strength and slam your weapon down with crushing force.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 80, apCost: 5, cooldown: 3, range: 1 },
      { name: 'Flurry', subtype: 'Speed', description: '3 rapid strikes for low damage each.', executionDescription: 'You unleash a quick succession of slashes, overwhelming your foe.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 40, apCost: 4, cooldown: 2, range: 1 },
      { name: 'Sweep', subtype: 'AoE', description: 'Strikes adjacent enemies in an arc.', executionDescription: 'You swing your weapon in a wide arc to hit multiple targets.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 65, apCost: 5, cooldown: 2, range: 1 },
      { name: 'Pierce', subtype: 'Anti-Armor', description: 'Thrust that ignores 50% armor.', executionDescription: 'You thrust your weapon forward, aiming for a weak point in the armor.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 60, apCost: 4, cooldown: 2, range: 1 },
      { name: 'Rush', subtype: 'Mobility', description: 'Dash to target and strike immediately.', executionDescription: 'You burst forward and deliver a momentum-fueled strike.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 65, apCost: 4, cooldown: 2, range: 3 },
      { name: 'Riposte', subtype: 'Counter', description: 'Block and instantly counter-attack.', executionDescription: 'You deflect an incoming blow and immediately strike back.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 70, apCost: 3, cooldown: 2, range: 1, isCounter: true, triggerCondition: 'after_parry' },
      { name: 'Execute', subtype: 'Finisher', description: 'Double damage to low HP targets.', executionDescription: 'Seeing your enemy weakened, you deliver a merciless finishing blow.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 90, apCost: 6, cooldown: 4, range: 1 },
      { name: 'Sunder', subtype: 'Debuff', description: 'Damages and reduces enemy defense.', executionDescription: 'You strike with the intent to break armor and bone alike.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 55, apCost: 4, cooldown: 2, range: 1 },
      { name: 'Focus', subtype: 'Precision', description: 'Guaranteed critical hit strike.', executionDescription: 'You calm your mind and strike with absolute precision.', damageType: 'physical', weaponRequirement: 'melee_only', ampPercent: 75, apCost: 5, cooldown: 3, range: 1 },
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
      { name: 'Snipe', subtype: 'Long Range', description: 'High damage shot at extreme range.', executionDescription: 'You take steady aim and loose a powerful shot from a distance.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 90, apCost: 6, cooldown: 3, range: 8 },
      { name: 'Volley', subtype: 'Area Denial', description: 'Rain arrows on a target zone.', executionDescription: 'You fire multiple projectiles high into the air to rain down on an area.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 60, apCost: 5, cooldown: 2, range: 5 },
      { name: 'Scatter', subtype: 'Crowd Control', description: 'Short range cone that knocks back.', executionDescription: 'You fire a spread of shots to force enemies back.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 55, apCost: 4, cooldown: 2, range: 3 },
      { name: 'Ricochet', subtype: 'Chain', description: 'Bounces to a second nearby target.', executionDescription: 'You fire a shot calculated to bounce from one target to another.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 60, apCost: 4, cooldown: 2, range: 5 },
      { name: 'Kite', subtype: 'Evasion', description: 'Shoot and retreat 1 tile backward.', executionDescription: 'You fire a quick shot while leaping backward to safety.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 50, apCost: 3, cooldown: 1, range: 4 },
      { name: 'Pin', subtype: 'Control', description: 'Roots the target in place.', executionDescription: 'You aim for the legs to pin your target to the ground.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 40, apCost: 4, cooldown: 3, range: 5 },
      { name: 'Explosive', subtype: 'Splash', description: 'Deals damage to target and neighbors.', executionDescription: 'You fire a volatile projectile that explodes on impact.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 70, apCost: 6, cooldown: 3, range: 5 },
      { name: 'Toxin', subtype: 'DoT', description: 'Applies stacking poison damage.', executionDescription: 'You coat your projectile in venom before firing.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 45, apCost: 3, cooldown: 2, range: 5 },
      { name: 'Silencer', subtype: 'Disable', description: 'Prevents target from casting magic.', executionDescription: 'You aim for the throat to silence your target\'s incantations.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 50, apCost: 4, cooldown: 4, range: 6 },
      { name: 'Twin Shot', subtype: 'Burst', description: 'Fires two projectiles at once.', executionDescription: 'You notch two projectiles and fire them simultaneously.', damageType: 'physical', weaponRequirement: 'ranged_only', ampPercent: 50, apCost: 4, cooldown: 2, range: 5 },
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
      { name: 'Ignite', subtype: 'Fire', description: 'Launch a fireball. Infusion: Weapon burns enemies.', executionDescription: 'You conjure a ball of flame and hurl it at your foe.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 110, apCost: 4, cooldown: 2, range: 4, hasUtilityMode: true, utilityEffect: 'blaze_enchant', utilityDuration: 3 },
      { name: 'Freeze', subtype: 'Ice', description: 'Ice shard that slows. Infusion: Weapon slows target.', executionDescription: 'You form a shard of razor-sharp ice and launch it.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 105, apCost: 4, cooldown: 2, range: 4, hasUtilityMode: true, utilityEffect: 'frost_enchant', utilityDuration: 3 },
      { name: 'Shock', subtype: 'Lightning', description: 'Chain lightning. Infusion: Chance to stun.', executionDescription: 'You loose a bolt of lightning that arcs between targets.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 100, apCost: 4, cooldown: 2, range: 5, hasUtilityMode: true, utilityEffect: 'volt_enchant', utilityDuration: 3 },
      { name: 'Tremor', subtype: 'Earth', description: 'Earth spike line. Infusion: Heavy knockback.', executionDescription: 'You slam the ground, sending a line of spikes towards your enemy.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 115, apCost: 5, cooldown: 3, range: 3, hasUtilityMode: true, utilityEffect: 'weight_enchant', utilityDuration: 3 },
      { name: 'Gale', subtype: 'Wind', description: 'Wind blade. Infusion: Increased attack speed.', executionDescription: 'You slash the air, creating a blade of cutting wind.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 95, apCost: 3, cooldown: 1, range: 4, hasUtilityMode: true, utilityEffect: 'swift_enchant', utilityDuration: 3 },
      { name: 'Drain', subtype: 'Shadow', description: 'Drains life. Infusion: Lifesteal on hit.', executionDescription: 'You create a tether of darkness that siphons life force.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 90, apCost: 4, cooldown: 3, range: 3, hasUtilityMode: true, utilityEffect: 'vamp_enchant', utilityDuration: 3 },
      { name: 'Smite', subtype: 'Holy', description: 'Holy ray. Infusion: True damage vs Undead.', executionDescription: 'You call down a beam of searing holy light.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 110, apCost: 4, cooldown: 2, range: 4, hasUtilityMode: true, utilityEffect: 'divine_enchant', utilityDuration: 3 },
      { name: 'Force', subtype: 'Arcane', description: 'Magic missile. Infusion: Bypasses block.', executionDescription: 'You fire a bolt of pure arcane energy that seeks its target.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 100, apCost: 3, cooldown: 1, range: 5, hasUtilityMode: true, utilityEffect: 'ether_enchant', utilityDuration: 3 },
      { name: 'Bloom', subtype: 'Nature', description: 'Poison cloud. Infusion: Stacking poison.', executionDescription: 'You summon a cloud of toxic spores that envelops the area.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 90, apCost: 4, cooldown: 3, range: 3, hasUtilityMode: true, utilityEffect: 'venom_enchant', utilityDuration: 3 },
      { name: 'Gravity', subtype: 'Void', description: 'Gravity well. Infusion: Pulls enemies closer.', executionDescription: 'You manifest a singularity that crushes enemies with gravity.', damageType: 'magic', weaponRequirement: 'magic_only', ampPercent: 120, apCost: 6, cooldown: 4, range: 4, hasUtilityMode: true, utilityEffect: 'flux_enchant', utilityDuration: 3 },
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
      { name: 'Guard', subtype: 'Block', description: 'Reduces next physical damage by 50%.', executionDescription: 'You raise your guard, bracing yourself for an impact.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 0 },
      { name: 'Parry', subtype: 'Deflect', description: 'Chance to nullify melee attack.', executionDescription: 'You watch your opponent closely, ready to deflect their strike.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 0 },
      { name: 'Iron Skin', subtype: 'Mitigation', description: '+20% Defense for 3 turns.', executionDescription: 'You flex your muscles, your skin hardening like iron.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Dodge', subtype: 'Evasion', description: 'Guarantees evasion of next attack.', executionDescription: 'You shift your weight, ready to roll away from danger.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Brace', subtype: 'Anti-CC', description: 'Immunity to Stun/Knockback.', executionDescription: 'You plant your feet firmly, making yourself immovable.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 2, range: 0 },
      { name: 'Reflect', subtype: 'Magic', description: 'Reflect next spell back to sender.', executionDescription: 'You conjure a mirrored barrier to bounce magic back.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 4, range: 0 },
      { name: 'Absorb', subtype: 'Shield', description: 'Grants temporary damage absorption.', executionDescription: 'You create a barrier of energy that drinks in kinetic force.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 3, range: 0 },
      { name: 'Intercept', subtype: 'Tank', description: 'Take damage for adjacent ally.', executionDescription: 'You dive in front of an ally to take the blow meant for them.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 1 },
      { name: 'Unbreakable', subtype: 'Survival', description: 'HP cannot drop below 1 for 1 turn.', executionDescription: 'You roar with defiance, refusing to fall no matter the pain.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 6, cooldown: 6, range: 0 },
      { name: 'Fortify', subtype: 'Stationary', description: 'Immobile but massively increased defense.', executionDescription: 'You hunker down into a defensive shell, sacrificing movement for protection.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
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
      { name: 'Rage', subtype: 'Damage', description: '+Damage, -Defense.', executionDescription: 'You let out a primal scream, trading caution for raw power.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Haste', subtype: 'Speed', description: '+Move Speed, -Cooldowns.', executionDescription: 'You feel a surge of adrenaline, your movements becoming a blur.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Focus', subtype: 'Crit', description: 'Next attack guarantees Crit.', executionDescription: 'You narrow your eyes, focusing completely on your target\'s weak spot.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Stealth', subtype: 'Utility', description: 'Invisible until attack.', executionDescription: 'You melt into the shadows, disappearing from sight.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 4, range: 0 },
      { name: 'Vigor', subtype: 'HP', description: 'Temporarily increase Max HP.', executionDescription: 'You take a deep breath, revitalizing your body with inner strength.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Clarity', subtype: 'Mana', description: 'Regenerate AP faster.', executionDescription: 'You clear your mind of distractions, restoring your focus.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Thorns', subtype: 'Retaliate', description: 'Attackers take damage.', executionDescription: 'You sprout ethereal spikes that harm anyone who touches you.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
      { name: 'Accuracy', subtype: 'Hit', description: 'Greatly increase Hit Chance.', executionDescription: 'You steady your hand, ensuring your next strike finds its mark.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 2, range: 0 },
      { name: 'Momentum', subtype: 'Snowball', description: '+Damage per tile moved.', executionDescription: 'You build up speed, turning your movement into striking power.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 0 },
      { name: 'Bloodlust', subtype: 'Sustain', description: 'Gain Lifesteal on attacks.', executionDescription: 'Your eyes glow red as you hunger for the vitality of your foes.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 4, range: 0 },
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
      { name: 'Blind', subtype: 'Accuracy', description: 'Reduce enemy Hit Chance.', executionDescription: 'You throw dust in your opponent\'s eyes to obscure their vision.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 3 },
      { name: 'Cripple', subtype: 'Move', description: 'Reduce enemy Movement.', executionDescription: 'You strike at the legs, hampering your target\'s ability to move.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 3 },
      { name: 'Silence', subtype: 'Magic', description: 'Prevent spellcasting.', executionDescription: 'You weave a sigil that steals the voice from your enemy.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 4, range: 4 },
      { name: 'Disarm', subtype: 'Attack', description: 'Reduce physical damage dealt.', executionDescription: 'You strike your foe\'s weapon hand, weakening their grip.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 2 },
      { name: 'Shatter', subtype: 'Defense', description: 'Reduce enemy Armor/Defense.', executionDescription: 'You deliver a crushing blow designed to fracture armor.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 2 },
      { name: 'Taunt', subtype: 'Aggro', description: 'Force enemy to attack you.', executionDescription: 'You shout an insult that demands your enemy\'s attention.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 2, range: 4 },
      { name: 'Fear', subtype: 'Control', description: 'Chance to skip turn/flee.', executionDescription: 'You unleash a terrifying aura that makes your enemy tremble.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 4, range: 3 },
      { name: 'Vulnerable', subtype: 'Amp', description: 'Target takes increased damage.', executionDescription: 'You mark a weak point on your target for everyone to see.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 4 },
      { name: 'Nullify', subtype: 'Strip', description: 'Remove enemy buffs.', executionDescription: 'You dispel the magical enhancements protecting your foe.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 4 },
      { name: 'Exhaust', subtype: 'Resource', description: 'Increase enemy AP costs.', executionDescription: 'You perform a technique that saps the stamina from your target.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 3 },
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
      { name: 'Dash', subtype: 'Linear', description: 'Move 2 tiles in straight line.', executionDescription: 'You burst forward with incredible speed, crossing the distance in an instant.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 2 },
      { name: 'Blink', subtype: 'Teleport', description: 'Instant teleport ignoring obstacles.', executionDescription: 'You vanish in a flash of light and reappear at your destination.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 3, range: 3 },
      { name: 'Leap', subtype: 'Vertical', description: 'Jump to target tile.', executionDescription: 'You launch yourself high into the air, landing at your target location.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 2, range: 3 },
      { name: 'Vault', subtype: 'Parkour', description: 'Jump over obstacle/enemy.', executionDescription: 'You fluidly vault over the obstruction in your path.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 2 },
      { name: 'Slide', subtype: 'Evasive', description: 'Move 1 tile + increased evasion.', executionDescription: 'You drop low and slide across the ground to evade danger.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 1 },
      { name: 'Swap', subtype: 'Tactical', description: 'Switch places with target.', executionDescription: 'You use a trick of perception to instantly switch positions with your target.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 4 },
      { name: 'Hook', subtype: 'Pull', description: 'Pull self to wall/enemy.', executionDescription: 'You fire a grappling hook that pulls you rapidly towards your target.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 2, range: 4 },
      { name: 'Retreat', subtype: 'Safety', description: 'Jump backward from target.', executionDescription: 'You kick off your opponent and flip backward to safety.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 3 },
      { name: 'Charge', subtype: 'Aggro', description: 'Rush towards enemy.', executionDescription: 'You lower your shoulder and sprint headlong at your enemy.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 2, range: 4 },
      { name: 'Phase', subtype: 'Ghost', description: 'Move through units/walls.', executionDescription: 'You become intangible for a moment, passing through solid matter.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 4, range: 0 },
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
      { name: 'Scan', subtype: 'Info', description: 'Reveal HP/Weaknesses.', executionDescription: 'You analyze your target, identifying their vulnerabilities.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 1, cooldown: 1, range: 5 },
      { name: 'Detect', subtype: 'Anti-Stealth', description: 'Reveal hidden units.', executionDescription: 'You heighten your senses to spot hidden enemies nearby.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 2, range: 5 },
      { name: 'Distract', subtype: 'Aggro', description: 'Lure enemies to location.', executionDescription: 'You throw a rock or make a sound to draw attention away.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 2, range: 4 },
      { name: 'Loot', subtype: 'Greed', description: 'Steal item from enemy.', executionDescription: 'You snatch an item from your distracted foe with sleight of hand.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 1, range: 1 },
      { name: 'Salvage', subtype: 'Resource', description: 'Harvest extra materials.', executionDescription: 'You carefully extract useful materials from the defeated enemy.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 1, range: 1 },
      { name: 'Track', subtype: 'Hunt', description: 'See target even if hidden.', executionDescription: 'You mark your prey, ensuring they can no longer hide from you.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 3, range: 6 },
      { name: 'Bait', subtype: 'Trap', description: 'Place lure that attracts aggro.', executionDescription: 'You place a convincing decoy that draws enemy aggression.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 3 },
      { name: 'Night Vision', subtype: 'Vision', description: 'Ignore darkness penalties.', executionDescription: 'Your pupils dilate, allowing you to see clearly in the dark.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 4, range: 0 },
      { name: 'Identify', subtype: 'Lore', description: 'Identify item without scroll.', executionDescription: 'You examine the item closely, unlocking its magical secrets.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 5, cooldown: 1, range: 0 },
      { name: 'Camouflage', subtype: 'Stealth', description: 'Blend into terrain.', executionDescription: 'You cover yourself with local flora to blend into the environment.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 0 },
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
      { name: 'Heal', subtype: 'Restore', description: 'Restore HP to target.', executionDescription: 'You channel restorative magic to knit flesh and mend wounds.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 2, range: 3 },
      { name: 'Group Heal', subtype: 'AoE', description: 'Restore small HP to area.', executionDescription: 'You release a wave of healing energy that washes over your allies.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 6, cooldown: 4, range: 3 },
      { name: 'Cleanse', subtype: 'Cure', description: 'Remove debuffs.', executionDescription: 'You purify the target, washing away all negative effects.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 2, range: 4 },
      { name: 'Revive', subtype: 'Life', description: 'Revive fallen ally.', executionDescription: 'You breathe life back into a fallen comrade, pulling them back from the brink.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 8, cooldown: 6, range: 1 },
      { name: 'Shield', subtype: 'Protect', description: 'Grant HP barrier.', executionDescription: 'You project a barrier of force around your ally to absorb damage.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 3, range: 4 },
      { name: 'Empower', subtype: 'Buff', description: 'Increase ally damage.', executionDescription: 'You imbue your ally with raw power, enhancing their attacks.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 4 },
      { name: 'Sanctuary', subtype: 'Zone', description: 'Zone of HP regen.', executionDescription: 'You consecrate the ground, creating a safe haven that heals those within.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 5, cooldown: 5, range: 4 },
      { name: 'Sacrifice', subtype: 'Trade', description: 'Lose HP to heal ally double.', executionDescription: 'You transfer your own vitality to heal your ally\'s wounds.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 2, cooldown: 2, range: 3 },
      { name: 'Inspire', subtype: 'Resource', description: 'Restore AP to ally.', executionDescription: 'You shout words of encouragement, renewing your ally\'s stamina.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 4, cooldown: 4, range: 4 },
      { name: 'Guardian', subtype: 'Link', description: 'Take 50% of ally damage.', executionDescription: 'You forge a magical link, sharing the pain of your ally.', damageType: 'none', weaponRequirement: 'any', ampPercent: 0, apCost: 3, cooldown: 3, range: 3 },
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
