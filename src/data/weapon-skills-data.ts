import { WEAPON_STATS } from './weapon-config'

export interface StarterSkill {
  name: string
  type: string
  description: string
}

export interface WeaponCategory {
  id: string
  name: string
  icon: string
  type: 'Melee' | 'Ranged' | 'Magic' | 'Defense'
  primaryStat: string
  starterSkills: StarterSkill[]
  baseDamage?: string // Display string like '140%'
  passiveDescription?: string
}

export const WEAPON_CATEGORIES: WeaponCategory[] = [
  {
    id: 'sword',
    name: WEAPON_STATS.sword.name,
    icon: '⚔️',
    type: 'Melee',
    primaryStat: WEAPON_STATS.sword.stat,
    baseDamage: `${WEAPON_STATS.sword.baseDamage * 100}%`,
    passiveDescription: WEAPON_STATS.sword.passiveDescription,
    starterSkills: [
      { name: 'Quick Slash', type: 'Attack', description: 'Fast, light attack with high accuracy.' },
      { name: 'Heavy Slash', type: 'Attack / Power', description: 'Slow but powerful overhead swing.' },
      { name: 'Guard Breaker', type: 'Attack / Anti-Guard', description: 'Breaks through enemy guard stance.' },
      { name: 'Lunge', type: 'Attack / Movement', description: 'Forward thrust with extended reach.' },
      { name: 'Riposte', type: 'Counter', description: 'Counter-attack after successful parry.' },
      { name: 'Cross Cut', type: 'Attack / Combo', description: 'Two diagonal slashes in quick succession.' },
      { name: 'Pommel Strike', type: 'Attack / Stun', description: 'Bash with sword hilt to stun.' },
      { name: 'Sword Parry', type: 'Defensive', description: 'Deflect incoming attack with blade.' },
      { name: 'Defensive Stance', type: 'Buff / Defensive', description: 'Raise guard, reduce damage taken.' },
      { name: 'Sweeping Slash', type: 'Attack / AoE', description: 'Wide horizontal arc hitting multiple enemies.' },
    ]
  },
  {
    id: 'greatsword',
    name: WEAPON_STATS.greatsword.name,
    icon: '🗡️',
    type: 'Melee',
    primaryStat: WEAPON_STATS.greatsword.stat,
    baseDamage: `${WEAPON_STATS.greatsword.baseDamage * 100}%`,
    passiveDescription: WEAPON_STATS.greatsword.passiveDescription,
    starterSkills: [
      { name: 'Cleave', type: 'Attack / AoE', description: 'Massive horizontal swing.' },
      { name: 'Crushing Blow', type: 'Attack / Power', description: 'Overhead slam with immense force.' },
      { name: 'Wide Arc', type: 'Attack / AoE', description: 'Sweeping attack hitting wide area.' },
      { name: 'Executioner\'s Swing', type: 'Attack / Execution', description: 'Bonus damage to low HP targets.' },
      { name: 'Ground Splitter', type: 'Attack / AoE', description: 'Slam ground causing shockwave.' },
      { name: 'Guarded Heft', type: 'Defensive', description: 'Use blade as shield while preparing.' },
      { name: 'Momentum Slash', type: 'Attack / Combo', description: 'Gains power with each swing.' },
      { name: 'Armor Ripper', type: 'Attack / Armor-Piercing', description: 'Ignores portion of armor.' },
      { name: 'Overcommit', type: 'Attack / Risk', description: 'Massive damage but leaves vulnerable.' },
      { name: 'Great Parry', type: 'Defensive / Counter', description: 'Parry with greatsword, stagger attacker.' },
    ]
  },
  {
    id: 'katana',
    name: WEAPON_STATS.katana.name,
    icon: '🔪',
    type: 'Melee',
    primaryStat: WEAPON_STATS.katana.stat,
    baseDamage: `${WEAPON_STATS.katana.baseDamage * 100}% / 95%`, // Hardcoded dual value for versatile display
    passiveDescription: WEAPON_STATS.katana.passiveDescription,
    starterSkills: [
      { name: 'Iaijutsu Draw', type: 'Attack / Burst', description: 'Lightning-fast draw attack.' },
      { name: 'Quick Cut', type: 'Attack', description: 'Rapid slashing attack.' },
      { name: 'Twin Slice', type: 'Attack / Combo', description: 'Two quick cuts in succession.' },
      { name: 'Step Slash', type: 'Attack / Movement', description: 'Sidestep into diagonal cut.' },
      { name: 'Counter Cut', type: 'Counter', description: 'Slash immediately after dodging.' },
      { name: 'Flowing Stance', type: 'Buff', description: 'Increase evasion and crit chance.' },
      { name: 'Needle Thrust', type: 'Attack / Armor-Piercing', description: 'Straight stab ignoring armor.' },
      { name: 'Wind Shear', type: 'Attack / Ranged', description: 'Projectile slash wave.' },
      { name: 'Finishing Stroke', type: 'Attack / Execution', description: 'Execute low HP enemies.' },
      { name: 'Perfect Guard', type: 'Defensive', description: 'Precise parry with counter window.' },
    ]
  },
  {
    id: 'dagger',
    name: WEAPON_STATS.dagger.name,
    icon: '🗡️',
    type: 'Melee',
    primaryStat: WEAPON_STATS.dagger.stat,
    baseDamage: `${WEAPON_STATS.dagger.baseDamage * 100}%`,
    passiveDescription: WEAPON_STATS.dagger.passiveDescription,
    starterSkills: [
      { name: 'Quick Stab', type: 'Attack', description: 'Fast piercing attack.' },
      { name: 'Flurry', type: 'Attack / Combo', description: 'Rapid series of stabs.' },
      { name: 'Backstab', type: 'Attack / Positional', description: 'Bonus damage from behind.' },
      { name: 'Artery Strike', type: 'Attack / Bleed', description: 'Causes bleeding damage.' },
      { name: 'Feint', type: 'Utility', description: 'Fake attack to create opening.' },
      { name: 'Sidestep Slash', type: 'Attack / Evasion', description: 'Dodge and counter in one motion.' },
      { name: 'Throw Dagger', type: 'Attack / Ranged', description: 'Throw dagger at range.' },
      { name: 'Twin Fangs', type: 'Attack / Dual', description: 'Strike with both daggers.' },
      { name: 'Puncture', type: 'Attack / Armor-Piercing', description: 'Find gaps in armor.' },
      { name: 'Hamstring', type: 'Attack / Debuff', description: 'Slow enemy movement.' },
    ]
  },
  {
    id: 'axe',
    name: WEAPON_STATS.axe.name,
    icon: '🪓',
    type: 'Melee',
    primaryStat: WEAPON_STATS.axe.stat,
    baseDamage: `${WEAPON_STATS.axe.baseDamage * 100}%`,
    passiveDescription: WEAPON_STATS.axe.passiveDescription,
    starterSkills: [
      { name: 'Chop', type: 'Attack', description: 'Basic chopping attack.' },
      { name: 'Split Shield', type: 'Attack / Anti-Guard', description: 'Break through shields.' },
      { name: 'Hook Strike', type: 'Attack / Control', description: 'Hook and pull enemy.' },
      { name: 'Overhead Chop', type: 'Attack / Power', description: 'Powerful downward strike.' },
      { name: 'Whirling Chop', type: 'Attack / AoE', description: 'Spin attack hitting all around.' },
      { name: 'Rend', type: 'Attack / Bleed', description: 'Tear wound causing bleed.' },
      { name: 'Aimed Chop', type: 'Attack / Precision', description: 'Precise strike to weak point.' },
      { name: 'Shoulder Heft', type: 'Buff', description: 'Ready stance for power.' },
      { name: 'Guarded Chop', type: 'Attack / Defensive', description: 'Attack while maintaining guard.' },
      { name: 'Bone Breaker', type: 'Attack / Debuff', description: 'Reduce enemy attack power.' },
    ]
  },
  {
    id: 'greataxe',
    name: WEAPON_STATS.greataxe.name,
    icon: '🪓',
    type: 'Melee',
    primaryStat: WEAPON_STATS.greataxe.stat,
    baseDamage: `${WEAPON_STATS.greataxe.baseDamage * 100}%`,
    passiveDescription: WEAPON_STATS.greataxe.passiveDescription,
    starterSkills: [
      { name: 'Massive Cleave', type: 'Attack / AoE', description: 'Enormous sweeping attack.' },
      { name: 'Skull Splitter', type: 'Attack / Power', description: 'Devastating overhead strike.' },
      { name: 'Reckless Swing', type: 'Attack / Risk', description: 'Wild swing, high damage, low accuracy.' },
      { name: 'Whirlwind', type: 'Attack / AoE', description: 'Spinning attack all around.' },
      { name: 'Earth Shatter', type: 'Attack / AoE', description: 'Ground slam causing tremor.' },
      { name: 'Execution Arc', type: 'Attack / Execution', description: 'Execute low HP targets.' },
      { name: 'Raging Heft', type: 'Buff', description: 'Build rage for more damage.' },
      { name: 'Armor Sundering', type: 'Attack / Armor-Piercing', description: 'Destroy enemy armor.' },
      { name: 'Heavy Guard', type: 'Defensive', description: 'Block with axe shaft.' },
      { name: 'Follow-Through', type: 'Attack / Combo', description: 'Chain into next attack.' },
    ]
  },
  {
    id: 'mace',
    name: WEAPON_STATS.mace.name,
    icon: '🔨',
    type: 'Melee',
    primaryStat: WEAPON_STATS.mace.stat,
    baseDamage: `${WEAPON_STATS.mace.baseDamage * 100}%`,
    passiveDescription: WEAPON_STATS.mace.passiveDescription,
    starterSkills: [
      { name: 'Bash', type: 'Attack', description: 'Basic bashing attack.' },
      { name: 'Skull Bash', type: 'Attack / Stun', description: 'Strike to head, chance to stun.' },
      { name: 'Crack Shield', type: 'Attack / Anti-Guard', description: 'Damage through shields.' },
      { name: 'Blunt Crush', type: 'Attack / Power', description: 'Crushing blow ignoring armor.' },
      { name: 'Rattle Bones', type: 'Attack / Debuff', description: 'Reduce enemy defense.' },
      { name: 'Guarded Bash', type: 'Attack / Defensive', description: 'Attack while blocking.' },
      { name: 'Overhand Smash', type: 'Attack / Power', description: 'Overhead crushing blow.' },
      { name: 'Joint Strike', type: 'Attack / Debuff', description: 'Target joints, slow enemy.' },
      { name: 'Weighted Swing', type: 'Attack / Knockback', description: 'Heavy swing pushing enemy.' },
      { name: 'Holy Smite', type: 'Attack / Magic', description: 'Blessed strike with bonus damage.' },
    ]
  },
  {
    id: 'hammer',
    name: WEAPON_STATS.greathammer.name, // Mapping hammer to greathammer config for now or should create separate config? Assuming "Hammer" in list meant 2H Greathammer based on skills
    icon: '🔨',
    type: 'Melee',
    primaryStat: WEAPON_STATS.greathammer.stat,
    baseDamage: `${WEAPON_STATS.greathammer.baseDamage * 100}%`,
    passiveDescription: WEAPON_STATS.greathammer.passiveDescription,
    starterSkills: [
      { name: 'Heavy Slam', type: 'Attack / Power', description: 'Massive downward slam.' },
      { name: 'Shockwave Slam', type: 'Attack / AoE', description: 'Ground pound creating shockwave.' },
      { name: 'Crater Blow', type: 'Attack / Power', description: 'Create crater on impact.' },
      { name: 'Guard Crush', type: 'Attack / Anti-Guard', description: 'Shatter enemy guard.' },
      { name: 'Comet Swing', type: 'Attack / Power', description: 'Overhead swing like meteor.' },
      { name: 'Shatter Armor', type: 'Attack / Armor-Piercing', description: 'Destroy armor completely.' },
      { name: 'Anchor Stance', type: 'Defensive', description: 'Immovable defensive stance.' },
      { name: 'Hammer Spin', type: 'Attack / AoE', description: 'Spinning hammer attack.' },
      { name: 'Ground Rally', type: 'Attack / Stun', description: 'Slam ground to stun nearby.' },
      { name: 'Stunning Blow', type: 'Attack / Stun', description: 'Guaranteed stun on hit.' },
    ]
  },
  {
    id: 'spear',
    name: WEAPON_STATS.spear.name,
    icon: '🔱',
    type: 'Melee',
    primaryStat: WEAPON_STATS.spear.stat,
    baseDamage: `${WEAPON_STATS.spear.baseDamage * 100}% / 90%`,
    passiveDescription: WEAPON_STATS.spear.passiveDescription,
    starterSkills: [
      { name: 'Piercing Thrust', type: 'Attack', description: 'Long-range piercing attack.' },
      { name: 'Long Lunge', type: 'Attack / Movement', description: 'Extended reach thrust.' },
      { name: 'Sweep Pole', type: 'Attack / AoE', description: 'Sweep legs with pole.' },
      { name: 'Wall of Spears', type: 'Defensive', description: 'Create defensive barrier.' },
      { name: 'Feint Thrust', type: 'Attack / Utility', description: 'Fake then real thrust.' },
      { name: 'Brace Spear', type: 'Defensive / Counter', description: 'Brace against charges.' },
      { name: 'Spiral Thrust', type: 'Attack / Armor-Piercing', description: 'Spinning thrust through armor.' },
      { name: 'Line Pierce', type: 'Attack / AoE', description: 'Pierce multiple enemies in line.' },
      { name: 'Reach Guard', type: 'Defensive', description: 'Keep enemies at distance.' },
      { name: 'Leaping Jab', type: 'Attack / Movement', description: 'Jump forward with thrust.' },
    ]
  },
  {
    id: 'fist',
    name: WEAPON_STATS.fist.name,
    icon: '👊',
    type: 'Melee',
    primaryStat: WEAPON_STATS.fist.stat,
    baseDamage: `${WEAPON_STATS.fist.baseDamage * 100}%`,
    passiveDescription: WEAPON_STATS.fist.passiveDescription,
    starterSkills: [
      { name: 'Jab', type: 'Attack', description: 'Quick straight punch.' },
      { name: 'Cross', type: 'Attack / Power', description: 'Powerful cross punch.' },
      { name: 'Uppercut', type: 'Attack / Launcher', description: 'Upward punch launching enemy.' },
      { name: 'Hook Punch', type: 'Attack / Stun', description: 'Side hook to stun.' },
      { name: 'One-Two Combo', type: 'Attack / Combo', description: 'Jab followed by cross.' },
      { name: 'Body Blow', type: 'Attack / Debuff', description: 'Strike body, reduce stamina.' },
      { name: 'Elbow Strike', type: 'Attack / Close', description: 'Close-range elbow.' },
      { name: 'Roundhouse Kick', type: 'Attack / AoE', description: 'Spinning kick attack.' },
      { name: 'Grab & Knee', type: 'Attack / Control', description: 'Grab and knee strike.' },
      { name: 'Iron Guard', type: 'Defensive', description: 'Block with forearms.' },
    ]
  },
  {
    id: 'bow',
    name: WEAPON_STATS.bow.name,
    icon: '🏹',
    type: 'Ranged',
    primaryStat: WEAPON_STATS.bow.stat,
    baseDamage: `${WEAPON_STATS.bow.baseDamage * 100}%`,
    passiveDescription: WEAPON_STATS.bow.passiveDescription,
    starterSkills: [
      { name: 'Standard Shot', type: 'Attack', description: 'Basic arrow shot.' },
      { name: 'Aimed Shot', type: 'Attack / Precision', description: 'Careful aimed shot, high damage.' },
      { name: 'Quick Shot', type: 'Attack', description: 'Rapid fire arrow.' },
      { name: 'Power Draw', type: 'Attack / Power', description: 'Fully drawn powerful shot.' },
      { name: 'Volley', type: 'Attack / AoE', description: 'Rain arrows on area.' },
      { name: 'Pinning Shot', type: 'Attack / Control', description: 'Pin enemy in place.' },
      { name: 'Piercing Arrow', type: 'Attack / Armor-Piercing', description: 'Arrow pierces armor.' },
      { name: 'Close-Quarters Shot', type: 'Attack / Close', description: 'Point-blank shot.' },
      { name: 'Steady Aim', type: 'Buff', description: 'Increase accuracy.' },
      { name: 'Arrow Feint', type: 'Utility', description: 'Fake shot to bait dodge.' },
    ]
  },
  {
    id: 'crossbow',
    name: WEAPON_STATS.crossbow.name,
    icon: '🎯',
    type: 'Ranged',
    primaryStat: WEAPON_STATS.crossbow.stat,
    baseDamage: `${WEAPON_STATS.crossbow.baseDamage * 100}%`,
    passiveDescription: WEAPON_STATS.crossbow.passiveDescription,
    starterSkills: [
      { name: 'Bolt Shot', type: 'Attack', description: 'Fire crossbow bolt.' },
      { name: 'Crank & Fire', type: 'Attack / Power', description: 'Fully cranked powerful shot.' },
      { name: 'Armor-Piercing Bolt', type: 'Attack / Armor-Piercing', description: 'Bolt ignores armor.' },
      { name: 'Quick Reload', type: 'Utility', description: 'Faster reload speed.' },
      { name: 'Scoped Aim', type: 'Attack / Precision', description: 'Zoomed precise shot.' },
      { name: 'Multi-Load', type: 'Attack / Combo', description: 'Load multiple bolts.' },
      { name: 'Pinpoint Shot', type: 'Attack / Critical', description: 'Guaranteed critical hit.' },
      { name: 'Kneeling Brace', type: 'Buff', description: 'Stable stance for accuracy.' },
      { name: 'Trap Shot', type: 'Attack / Control', description: 'Bolt creates trap.' },
      { name: 'Suppressing Bolt', type: 'Attack / Debuff', description: 'Force enemy to cover.' },
    ]
  },
  {
    id: 'gun',
    name: WEAPON_STATS.gun.name,
    icon: '🔫',
    type: 'Ranged',
    primaryStat: WEAPON_STATS.gun.stat,
    baseDamage: `${WEAPON_STATS.gun.baseDamage * 100}%`,
    passiveDescription: WEAPON_STATS.gun.passiveDescription,
    starterSkills: [
      { name: 'Single Shot', type: 'Attack', description: 'Fire single bullet.' },
      { name: 'Aimed Fire', type: 'Attack / Precision', description: 'Careful aimed shot.' },
      { name: 'Quick Draw', type: 'Attack', description: 'Fast draw and fire.' },
      { name: 'Burst Fire', type: 'Attack / Combo', description: 'Three-round burst.' },
      { name: 'Hip Fire', type: 'Attack', description: 'Quick inaccurate shot.' },
      { name: 'Reload', type: 'Utility', description: 'Reload weapon.' },
      { name: 'Tactical Reload', type: 'Utility', description: 'Fast reload while moving.' },
      { name: 'Warning Shot', type: 'Utility / Control', description: 'Intimidate enemy.' },
      { name: 'Piercing Round', type: 'Attack / Armor-Piercing', description: 'Bullet pierces armor.' },
      { name: 'Cover Shot', type: 'Attack / Defensive', description: 'Fire from cover.' },
    ]
  },
  {
    id: 'staff',
    name: WEAPON_STATS.staff.name,
    icon: '🪄',
    type: 'Magic',
    primaryStat: WEAPON_STATS.staff.stat,
    baseDamage: `${WEAPON_STATS.staff.baseDamage * 100}%`,
    passiveDescription: WEAPON_STATS.staff.passiveDescription,
    starterSkills: [
      { name: 'Staff Strike', type: 'Attack', description: 'Basic staff swing.' },
      { name: 'Sweep Staff', type: 'Attack / AoE', description: 'Sweeping staff attack.' },
      { name: 'Vaulting Pole', type: 'Movement', description: 'Vault over obstacles.' },
      { name: 'End Jab', type: 'Attack', description: 'Thrust with staff end.' },
      { name: 'Parry Staff', type: 'Defensive', description: 'Block with staff.' },
      { name: 'Spinning Guard', type: 'Defensive / AoE', description: 'Spin staff to block all.' },
      { name: 'Channel Focus', type: 'Buff', description: 'Increase magic power.' },
      { name: 'Knockback Thump', type: 'Attack / Knockback', description: 'Push enemy away.' },
      { name: 'Two-Point Combo', type: 'Attack / Combo', description: 'Strike with both ends.' },
      { name: 'Staff Brace', type: 'Defensive', description: 'Brace for impact.' },
    ]
  },
  {
    id: 'wand',
    name: WEAPON_STATS.wand.name,
    icon: '✨',
    type: 'Magic',
    primaryStat: WEAPON_STATS.wand.stat,
    baseDamage: `${WEAPON_STATS.wand.baseDamage * 100}%`,
    passiveDescription: WEAPON_STATS.wand.passiveDescription,
    starterSkills: [
      { name: 'Wand Tap', type: 'Attack', description: 'Basic magic tap.' },
      { name: 'Channel Gesture', type: 'Buff', description: 'Prepare for spell.' },
      { name: 'Mark with Wand', type: 'Utility', description: 'Mark target for bonus damage.' },
      { name: 'Point-Blank Jab', type: 'Attack / Close', description: 'Close-range wand strike.' },
      { name: 'Focus Motion', type: 'Buff', description: 'Increase spell power.' },
      { name: 'Wand Guard', type: 'Defensive', description: 'Magic barrier.' },
      { name: 'Signal Cast', type: 'Utility', description: 'Signal allies with light.' },
      { name: 'Mana Conserve', type: 'Buff', description: 'Reduce mana cost.' },
      { name: 'Quick Draw Wand', type: 'Attack', description: 'Fast wand attack.' },
      { name: 'Tracing Sigil', type: 'Utility', description: 'Draw magic symbol.' },
    ]
  },
  {
    id: 'tome',
    name: WEAPON_STATS.tome.name,
    icon: '📖',
    type: 'Magic',
    primaryStat: WEAPON_STATS.tome.stat,
    baseDamage: `${WEAPON_STATS.tome.baseDamage * 100}%`,
    passiveDescription: WEAPON_STATS.tome.passiveDescription,
    starterSkills: [
      { name: 'Book Bash', type: 'Attack', description: 'Hit with heavy tome.' },
      { name: 'Page Guard', type: 'Defensive', description: 'Block with book.' },
      { name: 'Study Target', type: 'Utility', description: 'Analyze enemy weakness.' },
      { name: 'Quick Reference', type: 'Buff', description: 'Quick spell lookup.' },
      { name: 'Bookmark', type: 'Utility', description: 'Save current spell.' },
      { name: 'Knowledge Shield', type: 'Defensive', description: 'Magic knowledge barrier.' },
      { name: 'Heavy Tome Slam', type: 'Attack / Power', description: 'Slam with heavy book.' },
      { name: 'Tactical Note', type: 'Buff', description: 'Note enemy pattern.' },
      { name: 'Share Insight', type: 'Buff / Support', description: 'Share knowledge with ally.' },
      { name: 'Close & Focus', type: 'Buff', description: 'Close book to concentrate.' },
    ]
  },
  {
    id: 'shield',
    name: WEAPON_STATS.shield.name,
    icon: '🛡️',
    type: 'Defense',
    primaryStat: WEAPON_STATS.shield.stat,
    baseDamage: `${WEAPON_STATS.shield.baseDamage * 100}%`,
    passiveDescription: WEAPON_STATS.shield.passiveDescription,
    starterSkills: [
      { name: 'Shield Block', type: 'Defensive', description: 'Block incoming attack.' },
      { name: 'Shield Bash', type: 'Attack / Stun', description: 'Bash with shield to stun.' },
      { name: 'Shield Charge', type: 'Attack / Movement', description: 'Charge forward with shield.' },
      { name: 'Brace Wall', type: 'Defensive', description: 'Immovable shield stance.' },
      { name: 'Deflect', type: 'Defensive / Counter', description: 'Deflect attack back.' },
      { name: 'Cover Ally', type: 'Defensive / Support', description: 'Block attack for ally.' },
      { name: 'Shield Push', type: 'Attack / Knockback', description: 'Push enemy with shield.' },
      { name: 'Guard Advance', type: 'Movement / Defensive', description: 'Move while blocking.' },
      { name: 'Turtle Stance', type: 'Defensive', description: 'Maximum defense stance.' },
      { name: 'Shield Counter', type: 'Counter', description: 'Counter after block.' },
    ]
  },
]

// Helper to get category by ID
export function getCategoryById(id: string): WeaponCategory | undefined {
  return WEAPON_CATEGORIES.find(c => c.id === id)
}

// Helper to get starter skill
export function getStarterSkill(categoryId: string, skillName: string): StarterSkill | undefined {
  const category = getCategoryById(categoryId)
  return category?.starterSkills.find(s => s.name === skillName)
}
