// Universal Starter Skills - Grouped by Skill Type
// Skills are universal and not tied to any weapon category

export interface StarterSkill {
  name: string
  subtype: string // e.g., "Power", "AoE", "Combo"
  description: string
  damageType: 'physical' | 'magic' | 'none'
}

export interface SkillTypeCategory {
  id: string
  name: string
  icon: string
  color: string
  description: string
  skills: StarterSkill[]
}

export const SKILL_TYPE_CATEGORIES: SkillTypeCategory[] = [
  {
    id: 'attack',
    name: 'Attack',
    icon: '⚔️',
    color: 'bg-red-900/50 border-red-500 text-red-300',
    description: 'Offensive skills that deal damage to enemies',
    skills: [
      // Basic Attacks
      { name: 'Quick Slash', subtype: 'Basic', description: 'Fast, light attack with high accuracy.', damageType: 'physical' },
      { name: 'Heavy Slash', subtype: 'Power', description: 'Slow but powerful overhead swing.', damageType: 'physical' },
      { name: 'Quick Stab', subtype: 'Basic', description: 'Fast piercing attack.', damageType: 'physical' },
      { name: 'Quick Cut', subtype: 'Basic', description: 'Rapid slashing attack.', damageType: 'physical' },
      { name: 'Chop', subtype: 'Basic', description: 'Standard axe swing.', damageType: 'physical' },
      { name: 'Bash', subtype: 'Basic', description: 'Standard mace strike.', damageType: 'physical' },
      { name: 'Jab', subtype: 'Basic', description: 'Quick straight punch.', damageType: 'physical' },
      { name: 'Cross', subtype: 'Basic', description: 'Powerful cross punch.', damageType: 'physical' },
      { name: 'Standard Shot', subtype: 'Basic', description: 'Basic arrow shot.', damageType: 'physical' },
      { name: 'Single Shot', subtype: 'Basic', description: 'Basic gun shot.', damageType: 'physical' },
      
      // Power Attacks
      { name: 'Crushing Blow', subtype: 'Power', description: 'Overhead slam with immense force.', damageType: 'physical' },
      { name: 'Heavy Slam', subtype: 'Power', description: 'Massive hammer slam.', damageType: 'physical' },
      { name: 'Skull Splitter', subtype: 'Power', description: 'Devastating overhead chop.', damageType: 'physical' },
      { name: 'Uppercut', subtype: 'Power', description: 'Rising punch with knockout potential.', damageType: 'physical' },
      { name: 'Power Draw', subtype: 'Power', description: 'Fully drawn powerful shot.', damageType: 'physical' },
      
      // Movement Attacks
      { name: 'Lunge', subtype: 'Movement', description: 'Forward thrust with extended reach.', damageType: 'physical' },
      { name: 'Step Slash', subtype: 'Movement', description: 'Sidestep into diagonal cut.', damageType: 'physical' },
      { name: 'Long Lunge', subtype: 'Movement', description: 'Extended spear thrust.', damageType: 'physical' },
      { name: 'Leaping Jab', subtype: 'Movement', description: 'Jump forward with spear thrust.', damageType: 'physical' },
      
      // AoE Attacks
      { name: 'Sweeping Slash', subtype: 'AoE', description: 'Wide horizontal arc hitting multiple enemies.', damageType: 'physical' },
      { name: 'Cleave', subtype: 'AoE', description: 'Massive horizontal swing.', damageType: 'physical' },
      { name: 'Wide Arc', subtype: 'AoE', description: 'Sweeping attack hitting wide area.', damageType: 'physical' },
      { name: 'Ground Splitter', subtype: 'AoE', description: 'Slam ground causing shockwave.', damageType: 'physical' },
      { name: 'Whirlwind', subtype: 'AoE', description: 'Spinning attack hitting all around.', damageType: 'physical' },
      { name: 'Shockwave Slam', subtype: 'AoE', description: 'Ground slam creating shockwave.', damageType: 'physical' },
      { name: 'Sweep Pole', subtype: 'AoE', description: 'Low sweep hitting multiple enemies.', damageType: 'physical' },
      { name: 'Volley', subtype: 'AoE', description: 'Rain of arrows on area.', damageType: 'physical' },
      
      // Combo Attacks
      { name: 'Cross Cut', subtype: 'Combo', description: 'Two diagonal slashes in quick succession.', damageType: 'physical' },
      { name: 'Twin Slice', subtype: 'Combo', description: 'Two quick cuts in succession.', damageType: 'physical' },
      { name: 'Flurry', subtype: 'Combo', description: 'Rapid series of stabs.', damageType: 'physical' },
      { name: 'Twin Fangs', subtype: 'Combo', description: 'Strike with both daggers.', damageType: 'physical' },
      { name: 'One-Two Combo', subtype: 'Combo', description: 'Jab followed by cross.', damageType: 'physical' },
      { name: 'Momentum Slash', subtype: 'Combo', description: 'Gains power with each swing.', damageType: 'physical' },
      { name: 'Burst Fire', subtype: 'Combo', description: 'Rapid fire burst.', damageType: 'physical' },
      
      // Execution Attacks
      { name: 'Executioner\'s Swing', subtype: 'Execution', description: 'Bonus damage to low HP targets.', damageType: 'physical' },
      { name: 'Finishing Stroke', subtype: 'Execution', description: 'Execute low HP enemies.', damageType: 'physical' },
      
      // Armor Piercing
      { name: 'Guard Breaker', subtype: 'Anti-Guard', description: 'Breaks through enemy guard stance.', damageType: 'physical' },
      { name: 'Armor Ripper', subtype: 'Armor-Piercing', description: 'Ignores portion of armor.', damageType: 'physical' },
      { name: 'Needle Thrust', subtype: 'Armor-Piercing', description: 'Straight stab ignoring armor.', damageType: 'physical' },
      { name: 'Puncture', subtype: 'Armor-Piercing', description: 'Find gaps in armor.', damageType: 'physical' },
      { name: 'Armor-Piercing Bolt', subtype: 'Armor-Piercing', description: 'Bolt that ignores armor.', damageType: 'physical' },
      { name: 'Piercing Round', subtype: 'Armor-Piercing', description: 'Bullet that pierces armor.', damageType: 'physical' },
      
      // Ranged Attacks
      { name: 'Throw Dagger', subtype: 'Ranged', description: 'Throw dagger at range.', damageType: 'physical' },
      { name: 'Wind Shear', subtype: 'Ranged', description: 'Projectile slash wave.', damageType: 'physical' },
      { name: 'Aimed Shot', subtype: 'Ranged', description: 'Carefully aimed shot.', damageType: 'physical' },
      { name: 'Quick Shot', subtype: 'Ranged', description: 'Fast but less accurate shot.', damageType: 'physical' },
      { name: 'Pinning Shot', subtype: 'Ranged', description: 'Pin enemy in place.', damageType: 'physical' },
      { name: 'Piercing Arrow', subtype: 'Ranged', description: 'Arrow that pierces through.', damageType: 'physical' },
      
      // Special Attacks
      { name: 'Iaijutsu Draw', subtype: 'Burst', description: 'Lightning-fast draw attack.', damageType: 'physical' },
      { name: 'Backstab', subtype: 'Positional', description: 'Bonus damage from behind.', damageType: 'physical' },
      { name: 'Pommel Strike', subtype: 'Stun', description: 'Bash with sword hilt to stun.', damageType: 'physical' },
      { name: 'Skull Bash', subtype: 'Stun', description: 'Aim for the head to stun.', damageType: 'physical' },
      { name: 'Stunning Blow', subtype: 'Stun', description: 'Hammer strike that stuns.', damageType: 'physical' },
      { name: 'Reckless Swing', subtype: 'Risk', description: 'Massive damage but leaves vulnerable.', damageType: 'physical' },
      { name: 'Overcommit', subtype: 'Risk', description: 'All-in attack with high risk.', damageType: 'physical' },
      
      // Magic Attacks
      { name: 'Staff Strike', subtype: 'Basic', description: 'Physical staff hit.', damageType: 'physical' },
      { name: 'Wand Tap', subtype: 'Basic', description: 'Light wand strike.', damageType: 'magic' },
      { name: 'Book Bash', subtype: 'Basic', description: 'Hit with heavy tome.', damageType: 'physical' },
    ]
  },
  {
    id: 'defensive',
    name: 'Defensive',
    icon: '🛡️',
    color: 'bg-blue-900/50 border-blue-500 text-blue-300',
    description: 'Skills that block, parry, or reduce incoming damage',
    skills: [
      { name: 'Sword Parry', subtype: 'Parry', description: 'Deflect incoming attack with blade.', damageType: 'none' },
      { name: 'Perfect Guard', subtype: 'Parry', description: 'Precise parry with counter window.', damageType: 'none' },
      { name: 'Great Parry', subtype: 'Parry', description: 'Parry with greatsword, stagger attacker.', damageType: 'none' },
      { name: 'Parry Staff', subtype: 'Parry', description: 'Deflect with staff.', damageType: 'none' },
      { name: 'Guarded Heft', subtype: 'Guard', description: 'Use blade as shield while preparing.', damageType: 'none' },
      { name: 'Guarded Bash', subtype: 'Guard', description: 'Attack while maintaining guard.', damageType: 'none' },
      { name: 'Guarded Chop', subtype: 'Guard', description: 'Defensive axe swing.', damageType: 'none' },
      { name: 'Heavy Guard', subtype: 'Guard', description: 'Solid defensive stance.', damageType: 'none' },
      { name: 'Iron Guard', subtype: 'Guard', description: 'Unbreakable fist guard.', damageType: 'none' },
      { name: 'Anchor Stance', subtype: 'Stance', description: 'Immovable defensive position.', damageType: 'none' },
      { name: 'Brace Spear', subtype: 'Brace', description: 'Set spear against charge.', damageType: 'none' },
      { name: 'Wall of Spears', subtype: 'Zone', description: 'Create defensive zone with spear.', damageType: 'none' },
      { name: 'Reach Guard', subtype: 'Zone', description: 'Extended defensive reach.', damageType: 'none' },
      { name: 'Spinning Guard', subtype: 'Active', description: 'Spinning staff defense.', damageType: 'none' },
      { name: 'Wand Guard', subtype: 'Magic', description: 'Magical wand barrier.', damageType: 'magic' },
      { name: 'Page Guard', subtype: 'Magic', description: 'Use tome pages as shield.', damageType: 'magic' },
      { name: 'Knowledge Shield', subtype: 'Magic', description: 'Barrier of magical knowledge.', damageType: 'magic' },
      { name: 'Shield Block', subtype: 'Block', description: 'Standard shield block.', damageType: 'none' },
      { name: 'Brace Wall', subtype: 'Block', description: 'Brace for heavy impact.', damageType: 'none' },
      { name: 'Deflect', subtype: 'Block', description: 'Redirect incoming attack.', damageType: 'none' },
      { name: 'Cover Ally', subtype: 'Protect', description: 'Shield an ally from harm.', damageType: 'none' },
      { name: 'Turtle Stance', subtype: 'Stance', description: 'Maximum defense, no offense.', damageType: 'none' },
      { name: 'Kneeling Brace', subtype: 'Stance', description: 'Stable shooting position.', damageType: 'none' },
      { name: 'Cover Shot', subtype: 'Tactical', description: 'Fire while in cover.', damageType: 'physical' },
    ]
  },
  {
    id: 'counter',
    name: 'Counter',
    icon: '⚡',
    color: 'bg-yellow-900/50 border-yellow-500 text-yellow-300',
    description: 'Reactive skills that trigger after enemy actions',
    skills: [
      { name: 'Riposte', subtype: 'After Parry', description: 'Counter-attack after successful parry.', damageType: 'physical' },
      { name: 'Counter Cut', subtype: 'After Dodge', description: 'Slash immediately after dodging.', damageType: 'physical' },
      { name: 'Sidestep Slash', subtype: 'After Dodge', description: 'Dodge and counter in one motion.', damageType: 'physical' },
      { name: 'Shield Counter', subtype: 'After Block', description: 'Counter after successful block.', damageType: 'physical' },
      { name: 'Close-Quarters Shot', subtype: 'Reactive', description: 'Quick shot when enemy closes in.', damageType: 'physical' },
      { name: 'Quick Draw', subtype: 'Reactive', description: 'Fast draw and fire.', damageType: 'physical' },
      { name: 'Hip Fire', subtype: 'Reactive', description: 'Snap shot from hip.', damageType: 'physical' },
    ]
  },
  {
    id: 'buff',
    name: 'Buff',
    icon: '💪',
    color: 'bg-green-900/50 border-green-500 text-green-300',
    description: 'Skills that enhance yourself or allies',
    skills: [
      { name: 'Defensive Stance', subtype: 'Defense', description: 'Raise guard, reduce damage taken.', damageType: 'none' },
      { name: 'Flowing Stance', subtype: 'Evasion', description: 'Increase evasion and crit chance.', damageType: 'none' },
      { name: 'Raging Heft', subtype: 'Power', description: 'Build rage for stronger attacks.', damageType: 'none' },
      { name: 'Steady Aim', subtype: 'Accuracy', description: 'Focus for increased accuracy.', damageType: 'none' },
      { name: 'Channel Focus', subtype: 'Magic', description: 'Concentrate magical energy.', damageType: 'magic' },
      { name: 'Focus Motion', subtype: 'Magic', description: 'Enhance next spell.', damageType: 'magic' },
      { name: 'Mana Conserve', subtype: 'Efficiency', description: 'Reduce mana costs temporarily.', damageType: 'magic' },
      { name: 'Guard Advance', subtype: 'Movement', description: 'Move forward while guarding.', damageType: 'none' },
      { name: 'Tactical Reload', subtype: 'Utility', description: 'Fast reload with bonus.', damageType: 'none' },
      { name: 'Quick Reload', subtype: 'Utility', description: 'Faster crossbow reload.', damageType: 'none' },
      { name: 'Bookmark', subtype: 'Utility', description: 'Mark page for quick reference.', damageType: 'none' },
      { name: 'Close & Focus', subtype: 'Utility', description: 'Close tome to concentrate.', damageType: 'none' },
    ]
  },
  {
    id: 'debuff',
    name: 'Debuff',
    icon: '💀',
    color: 'bg-purple-900/50 border-purple-500 text-purple-300',
    description: 'Skills that weaken or impair enemies',
    skills: [
      { name: 'Artery Strike', subtype: 'Bleed', description: 'Causes bleeding damage over time.', damageType: 'physical' },
      { name: 'Hamstring', subtype: 'Slow', description: 'Slow enemy movement.', damageType: 'physical' },
      { name: 'Rattle Bones', subtype: 'Weaken', description: 'Reduce enemy attack power.', damageType: 'physical' },
      { name: 'Joint Strike', subtype: 'Cripple', description: 'Target joints to reduce mobility.', damageType: 'physical' },
      { name: 'Crack Shield', subtype: 'Armor Break', description: 'Damage enemy shield/armor.', damageType: 'physical' },
      { name: 'Split Shield', subtype: 'Armor Break', description: 'Break through shield defense.', damageType: 'physical' },
      { name: 'Shatter Armor', subtype: 'Armor Break', description: 'Destroy enemy armor.', damageType: 'physical' },
      { name: 'Guard Crush', subtype: 'Armor Break', description: 'Break enemy guard stance.', damageType: 'physical' },
      { name: 'Hook Strike', subtype: 'Pull', description: 'Pull enemy closer with axe hook.', damageType: 'physical' },
      { name: 'Shield Push', subtype: 'Knockback', description: 'Push enemy away with shield.', damageType: 'physical' },
      { name: 'Knockback Thump', subtype: 'Knockback', description: 'Staff strike that pushes back.', damageType: 'physical' },
      { name: 'Suppressing Bolt', subtype: 'Suppress', description: 'Keep enemy pinned down.', damageType: 'physical' },
      { name: 'Warning Shot', subtype: 'Intimidate', description: 'Frighten enemy, reduce accuracy.', damageType: 'physical' },
      { name: 'Trap Shot', subtype: 'Trap', description: 'Bolt that creates trap.', damageType: 'physical' },
      { name: 'Mark with Wand', subtype: 'Mark', description: 'Mark target for bonus damage.', damageType: 'magic' },
      { name: 'Mark Target', subtype: 'Mark', description: 'Mark enemy for team focus.', damageType: 'none' },
      { name: 'Taunt', subtype: 'Aggro', description: 'Force enemy to attack you.', damageType: 'none' },
    ]
  },
  {
    id: 'utility',
    name: 'Utility',
    icon: '🔧',
    color: 'bg-cyan-900/50 border-cyan-500 text-cyan-300',
    description: 'Support skills for positioning, information, and tactics',
    skills: [
      { name: 'Feint', subtype: 'Deception', description: 'Fake attack to create opening.', damageType: 'none' },
      { name: 'Arrow Feint', subtype: 'Deception', description: 'Fake shot to bait reaction.', damageType: 'none' },
      { name: 'Vaulting Pole', subtype: 'Movement', description: 'Use staff to vault over obstacles.', damageType: 'none' },
      { name: 'Shield Charge', subtype: 'Movement', description: 'Rush forward with shield.', damageType: 'physical' },
      { name: 'Reload', subtype: 'Reload', description: 'Standard reload.', damageType: 'none' },
      { name: 'Crank & Fire', subtype: 'Reload', description: 'Reload and fire crossbow.', damageType: 'physical' },
      { name: 'Multi-Load', subtype: 'Reload', description: 'Load multiple bolts.', damageType: 'none' },
      { name: 'Study Target', subtype: 'Analysis', description: 'Learn enemy weaknesses.', damageType: 'none' },
      { name: 'Quick Reference', subtype: 'Analysis', description: 'Check tome for information.', damageType: 'none' },
      { name: 'Scoped Aim', subtype: 'Aim', description: 'Use scope for precision.', damageType: 'none' },
      { name: 'Pinpoint Shot', subtype: 'Aim', description: 'Extremely accurate shot.', damageType: 'physical' },
      { name: 'Signal Cast', subtype: 'Communication', description: 'Send magical signal.', damageType: 'magic' },
      { name: 'Share Insight', subtype: 'Support', description: 'Share knowledge with ally.', damageType: 'none' },
      { name: 'Tactical Note', subtype: 'Support', description: 'Provide tactical information.', damageType: 'none' },
      { name: 'Tracing Sigil', subtype: 'Magic', description: 'Draw magical symbol.', damageType: 'magic' },
      { name: 'Quick Draw Wand', subtype: 'Quick', description: 'Fast wand draw.', damageType: 'none' },
      { name: 'Shield Bash', subtype: 'Interrupt', description: 'Bash to interrupt enemy.', damageType: 'physical' },
      { name: 'End Jab', subtype: 'Quick', description: 'Quick staff end poke.', damageType: 'physical' },
      { name: 'Point-Blank Jab', subtype: 'Quick', description: 'Close range wand jab.', damageType: 'physical' },
      { name: 'Heavy Tome Slam', subtype: 'Quick', description: 'Slam with heavy book.', damageType: 'physical' },
      { name: 'Grab & Knee', subtype: 'Grapple', description: 'Grab enemy and knee strike.', damageType: 'physical' },
      { name: 'Body Blow', subtype: 'Stagger', description: 'Punch to stagger enemy.', damageType: 'physical' },
      { name: 'Elbow Strike', subtype: 'Quick', description: 'Fast elbow attack.', damageType: 'physical' },
      { name: 'Roundhouse Kick', subtype: 'Kick', description: 'Spinning kick attack.', damageType: 'physical' },
      { name: 'Hook Punch', subtype: 'Hook', description: 'Hooking punch to side.', damageType: 'physical' },
      { name: 'Spiral Thrust', subtype: 'Special', description: 'Spinning spear thrust.', damageType: 'physical' },
      { name: 'Line Pierce', subtype: 'Special', description: 'Pierce through multiple enemies.', damageType: 'physical' },
      { name: 'Feint Thrust', subtype: 'Deception', description: 'Fake thrust to create opening.', damageType: 'none' },
      { name: 'Sweep Staff', subtype: 'Trip', description: 'Sweep legs with staff.', damageType: 'physical' },
      { name: 'Two-Point Combo', subtype: 'Combo', description: 'Staff combo attack.', damageType: 'physical' },
      { name: 'Staff Brace', subtype: 'Brace', description: 'Brace staff for defense.', damageType: 'none' },
      { name: 'Channel Gesture', subtype: 'Channel', description: 'Prepare magical gesture.', damageType: 'magic' },
      { name: 'Bolts Shot', subtype: 'Basic', description: 'Standard crossbow shot.', damageType: 'physical' },
      { name: 'Aimed Fire', subtype: 'Aim', description: 'Carefully aimed gun shot.', damageType: 'physical' },
      { name: 'Whirling Chop', subtype: 'Spin', description: 'Spinning axe attack.', damageType: 'physical' },
      { name: 'Rend', subtype: 'Bleed', description: 'Tearing axe wound.', damageType: 'physical' },
      { name: 'Aimed Chop', subtype: 'Aim', description: 'Precise axe strike.', damageType: 'physical' },
      { name: 'Shoulder Heft', subtype: 'Ready', description: 'Ready axe on shoulder.', damageType: 'none' },
      { name: 'Bone Breaker', subtype: 'Cripple', description: 'Break enemy bones.', damageType: 'physical' },
      { name: 'Blunt Crush', subtype: 'Crush', description: 'Crushing mace blow.', damageType: 'physical' },
      { name: 'Overhand Smash', subtype: 'Power', description: 'Overhead mace smash.', damageType: 'physical' },
      { name: 'Weighted Swing', subtype: 'Momentum', description: 'Use mace weight for power.', damageType: 'physical' },
      { name: 'Holy Smite', subtype: 'Holy', description: 'Divine mace strike.', damageType: 'magic' },
      { name: 'Crater Blow', subtype: 'AoE', description: 'Hammer strike creating crater.', damageType: 'physical' },
      { name: 'Comet Swing', subtype: 'Power', description: 'Devastating hammer swing.', damageType: 'physical' },
      { name: 'Hammer Spin', subtype: 'Spin', description: 'Spinning hammer attack.', damageType: 'physical' },
      { name: 'Ground Rally', subtype: 'AoE', description: 'Ground pound rally.', damageType: 'physical' },
      { name: 'Piercing Thrust', subtype: 'Pierce', description: 'Spear thrust that pierces.', damageType: 'physical' },
      { name: 'Execution Arc', subtype: 'Execution', description: 'Finishing greataxe swing.', damageType: 'physical' },
      { name: 'Follow-Through', subtype: 'Combo', description: 'Continue attack momentum.', damageType: 'physical' },
      { name: 'Overhead Chop', subtype: 'Power', description: 'Overhead axe chop.', damageType: 'physical' },
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
