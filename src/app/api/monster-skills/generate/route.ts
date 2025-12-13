import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// ============================================
// MONSTER SKILL CATEGORIES
// ============================================

type CategoryType = 'melee' | 'ranged' | 'aoe' | 'self' | 'reactive' | 'signature'

// ============================================
// CATEGORY CONFIGURATIONS
// ============================================

interface CategoryConfig {
  icon: string
  label: string
  damageTypes: string[]
  baseDamageRange: [number, number]
  accuracyRange: [number, number]
  speedRange: [number, number]
}

const CATEGORY_CONFIGS: Record<CategoryType, CategoryConfig> = {
  melee: {
    icon: '👊',
    label: 'Melee',
    damageTypes: ['physical', 'fire', 'ice', 'lightning', 'poison'],
    baseDamageRange: [15, 40],
    accuracyRange: [80, 95],
    speedRange: [40, 70],
  },
  ranged: {
    icon: '🎯',
    label: 'Ranged',
    damageTypes: ['physical', 'fire', 'ice', 'lightning', 'poison'],
    baseDamageRange: [12, 35],
    accuracyRange: [70, 90],
    speedRange: [50, 80],
  },
  aoe: {
    icon: '💥',
    label: 'AoE',
    damageTypes: ['magic', 'fire', 'ice', 'lightning', 'dark'],
    baseDamageRange: [20, 50],
    accuracyRange: [60, 85],
    speedRange: [30, 50],
  },
  self: {
    icon: '🛡️',
    label: 'Self',
    damageTypes: ['none'],
    baseDamageRange: [0, 0],
    accuracyRange: [100, 100],
    speedRange: [60, 90],
  },
  reactive: {
    icon: '⚡',
    label: 'Reactive',
    damageTypes: ['physical', 'magic'],
    baseDamageRange: [10, 30],
    accuracyRange: [75, 95],
    speedRange: [70, 100],
  },
  signature: {
    icon: '⭐',
    label: 'Signature',
    damageTypes: ['physical', 'magic', 'fire', 'ice', 'lightning', 'dark', 'true'],
    baseDamageRange: [30, 80],
    accuracyRange: [70, 90],
    speedRange: [40, 60],
  },
}

// ============================================
// NAME TEMPLATES BY CATEGORY
// ============================================

const MELEE_NAMES: string[] = [
  'Bite', 'Claw', 'Slash', 'Rend', 'Maul', 'Crush', 'Slam', 'Pummel', 'Tackle', 'Charge',
  'Fire Fang', 'Ice Claw', 'Thunder Strike', 'Poison Bite', 'Venomous Slash',
  'Burning Punch', 'Frost Slam', 'Spark Tackle', 'Toxic Maul', 'Acid Rend',
  'Savage Bite', 'Brutal Claw', 'Vicious Slash', 'Fierce Rend', 'Wild Maul',
  'Bone Crusher', 'Skull Bash', 'Spine Breaker', 'Rib Cracker', 'Jaw Snap',
  'Tail Whip', 'Horn Gore', 'Tusk Thrust', 'Wing Buffet', 'Talon Rake',
]

const RANGED_NAMES: string[] = [
  'Spit', 'Shoot', 'Hurl', 'Throw', 'Launch', 'Fire', 'Blast', 'Bolt', 'Ray', 'Beam',
  'Flamethrower', 'Ice Beam', 'Lightning Bolt', 'Poison Spray', 'Acid Spit',
  'Fire Breath', 'Frost Breath', 'Thunder Breath', 'Venom Shot', 'Web Shot',
  'Rock Throw', 'Spine Shot', 'Quill Launch', 'Needle Spray', 'Thorn Volley',
  'Energy Blast', 'Dark Bolt', 'Light Ray', 'Shadow Shot', 'Void Beam',
  'Sonic Screech', 'Wind Cutter', 'Sand Blast', 'Water Jet', 'Mud Shot',
]

const AOE_NAMES: string[] = [
  'Inferno', 'Blizzard', 'Thunderstorm', 'Earthquake', 'Tornado',
  'Fire Storm', 'Ice Storm', 'Lightning Storm', 'Sandstorm', 'Hailstorm',
  'Eruption', 'Avalanche', 'Tempest', 'Tremor', 'Cyclone',
  'Flame Wave', 'Frost Wave', 'Shock Wave', 'Poison Cloud', 'Acid Rain',
  'Meteor Shower', 'Ice Shards', 'Chain Lightning', 'Fissure', 'Whirlwind',
  'Dark Pulse', 'Light Burst', 'Shadow Explosion', 'Void Rift', 'Chaos Storm',
]

const SELF_NAMES: string[] = [
  'Enrage', 'Harden', 'Regenerate', 'Focus', 'Brace',
  'Power Up', 'Speed Up', 'Defense Up', 'Sharpen', 'Fortify',
  'Battle Cry', 'War Howl', 'Intimidate', 'Roar', 'Screech',
  'Heal', 'Recover', 'Rest', 'Meditate', 'Absorb',
  'Shell', 'Barrier', 'Shield', 'Protect', 'Guard',
  'Berserk', 'Frenzy', 'Rage', 'Fury', 'Wrath',
]

const REACTIVE_NAMES: string[] = [
  'Counter', 'Retaliate', 'Reflect', 'Parry', 'Riposte',
  'Thorns', 'Spikes', 'Barbs', 'Needles', 'Quills',
  'Vengeance', 'Payback', 'Retribution', 'Revenge', 'Reprisal',
  'Auto-Guard', 'Auto-Heal', 'Auto-Dodge', 'Auto-Counter', 'Auto-Reflect',
  'Last Stand', 'Desperation', 'Survival Instinct', 'Second Wind', 'Final Effort',
  'Berserk Trigger', 'Rage Trigger', 'Panic Attack', 'Fear Response', 'Fight or Flight',
]

const SIGNATURE_NAMES: string[] = [
  'Apocalypse', 'Armageddon', 'Cataclysm', 'Oblivion', 'Annihilation',
  'Divine Wrath', 'Hellfire', 'Judgment', 'Execution', 'Decimation',
  'Ultimate Slam', 'Final Strike', 'Death Blow', 'Killing Move', 'Finishing Touch',
  'Summon Minions', 'Call Reinforcements', 'Spawn Eggs', 'Create Clone', 'Split',
  'Transform', 'Evolve', 'Mutate', 'Phase Shift', 'Ascend',
  'Self-Destruct', 'Sacrifice', 'Kamikaze', 'Last Resort', 'Desperate Measure',
]

const NAME_POOLS: Record<CategoryType, string[]> = {
  melee: MELEE_NAMES,
  ranged: RANGED_NAMES,
  aoe: AOE_NAMES,
  self: SELF_NAMES,
  reactive: REACTIVE_NAMES,
  signature: SIGNATURE_NAMES,
}

// ============================================
// DEBUFF/BUFF OPTIONS
// ============================================

const DEBUFFS = ['bleed', 'poison', 'burn', 'freeze', 'stun', 'slow', 'blind', 'weaken', 'curse']
const BUFFS = ['enrage', 'shield', 'regen', 'haste', 'focus', 'fortify', 'sharpen', 'berserk']

// ============================================
// NARRATIVE TEMPLATES
// ============================================

const MELEE_NARRATIVES = {
  use: [
    'The monster lunges forward with a vicious attack!',
    'The creature strikes with brutal force!',
    'A savage blow comes crashing down!',
    'The beast attacks with primal fury!',
    'Claws and fangs flash in a deadly assault!',
  ],
  hit: [
    'The attack connects with devastating impact!',
    'A solid hit tears through defenses!',
    'The blow lands with bone-crushing force!',
    'The strike finds its mark!',
    'A direct hit sends shockwaves of pain!',
  ],
  miss: [
    'The attack swings wide, missing its target!',
    'A narrow dodge avoids the deadly blow!',
    'The strike whistles past harmlessly!',
    'Quick reflexes evade the attack!',
    'The blow fails to connect!',
  ],
  crit: [
    'A devastating critical strike!',
    'The attack hits a vital point!',
    'A perfectly placed blow deals massive damage!',
    'Critical hit! The attack is devastating!',
    'A brutal strike finds a weak spot!',
  ],
}

const RANGED_NARRATIVES = {
  use: [
    'The monster launches a projectile attack!',
    'A ranged assault streaks through the air!',
    'The creature fires from a distance!',
    'An attack comes flying toward its target!',
    'The beast unleashes a ranged strike!',
  ],
  hit: [
    'The projectile strikes true!',
    'A direct hit from the ranged attack!',
    'The shot connects with precision!',
    'The attack finds its mark from afar!',
    'A solid impact from the ranged strike!',
  ],
  miss: [
    'The projectile sails past its target!',
    'A quick sidestep avoids the attack!',
    'The shot goes wide!',
    'The ranged attack misses!',
    'The projectile fails to connect!',
  ],
  crit: [
    'A perfectly aimed critical shot!',
    'The projectile hits a vital area!',
    'Critical hit from range!',
    'A devastating ranged strike!',
    'The attack pierces through for massive damage!',
  ],
}

const AOE_NARRATIVES = {
  use: [
    'The monster unleashes a devastating area attack!',
    'A massive spell engulfs the battlefield!',
    'The creature summons a catastrophic force!',
    'An overwhelming attack covers the area!',
    'The beast channels destructive energy!',
  ],
  hit: [
    'The area attack engulfs its targets!',
    'The devastating spell connects!',
    'The massive attack hits everything in range!',
    'The area effect deals widespread damage!',
    'The catastrophic force finds its marks!',
  ],
  miss: [
    'The area attack dissipates harmlessly!',
    'Quick movement avoids the worst of it!',
    'The spell fails to fully connect!',
    'The attack loses power before impact!',
    'The area effect misses its primary target!',
  ],
  crit: [
    'A catastrophic critical area attack!',
    'The spell reaches maximum devastation!',
    'Critical hit! The area attack is amplified!',
    'A perfectly executed area devastation!',
    'The attack reaches apocalyptic proportions!',
  ],
}

const SELF_NARRATIVES = {
  use: [
    'The monster focuses its energy inward!',
    'The creature begins to power up!',
    'A surge of energy flows through the beast!',
    'The monster prepares itself for battle!',
    'The creature enters a heightened state!',
  ],
  hit: [
    'The effect takes hold successfully!',
    'The power-up activates!',
    'The enhancement is complete!',
    'The buff is applied!',
    'The effect strengthens the monster!',
  ],
  miss: [
    'The effect fizzles out!',
    'The power-up fails to activate!',
    'The enhancement is disrupted!',
    'The buff fails to take hold!',
    'The effect dissipates before completion!',
  ],
  crit: [
    'A powerful enhancement takes effect!',
    'The power-up is exceptionally strong!',
    'Critical success! Maximum enhancement!',
    'The buff is amplified!',
    'An overwhelming surge of power!',
  ],
}

const REACTIVE_NARRATIVES = {
  use: [
    'The monster reacts with lightning speed!',
    'A counter-attack is triggered!',
    'The creature responds to the threat!',
    'An automatic defense activates!',
    'The beast retaliates instantly!',
  ],
  hit: [
    'The counter-attack connects!',
    'The reactive strike lands!',
    'The retaliation hits its mark!',
    'The defensive response succeeds!',
    'The triggered attack finds its target!',
  ],
  miss: [
    'The counter-attack misses!',
    'The reactive strike fails to connect!',
    'The retaliation goes wide!',
    'The defensive response is evaded!',
    'The triggered attack misses!',
  ],
  crit: [
    'A devastating counter-attack!',
    'Critical reactive strike!',
    'The retaliation is devastating!',
    'A perfectly timed counter!',
    'The triggered attack deals massive damage!',
  ],
}

const SIGNATURE_NARRATIVES = {
  use: [
    'The monster unleashes its ultimate attack!',
    'A signature move is activated!',
    'The creature reveals its true power!',
    'An overwhelming assault begins!',
    'The beast uses its most devastating technique!',
  ],
  hit: [
    'The signature attack devastates its target!',
    'The ultimate move connects with full force!',
    'The true power is unleashed!',
    'The overwhelming attack succeeds!',
    'The devastating technique finds its mark!',
  ],
  miss: [
    'The signature attack is evaded!',
    'The ultimate move misses!',
    'The true power fails to connect!',
    'The overwhelming attack is dodged!',
    'The devastating technique misses!',
  ],
  crit: [
    'A catastrophic signature strike!',
    'The ultimate move reaches maximum power!',
    'Critical hit! True devastation unleashed!',
    'The overwhelming attack is amplified!',
    'A perfect execution of the signature technique!',
  ],
}

const NARRATIVE_POOLS: Record<CategoryType, { use: string[]; hit: string[]; miss: string[]; crit: string[] }> = {
  melee: MELEE_NARRATIVES,
  ranged: RANGED_NARRATIVES,
  aoe: AOE_NARRATIVES,
  self: SELF_NARRATIVES,
  reactive: REACTIVE_NARRATIVES,
  signature: SIGNATURE_NARRATIVES,
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateSkill(category: CategoryType, existingNames: Set<string>) {
  const config = CATEGORY_CONFIGS[category]
  const namePool = NAME_POOLS[category]
  const narratives = NARRATIVE_POOLS[category]
  const isSelfCategory = category === 'self'

  // Find a unique name
  let name = getRandomElement(namePool)
  let attempts = 0
  while (existingNames.has(name.toLowerCase()) && attempts < 50) {
    name = getRandomElement(namePool)
    attempts++
  }
  
  // If still duplicate, add a suffix
  if (existingNames.has(name.toLowerCase())) {
    const suffix = Math.floor(Math.random() * 100)
    name = `${name} ${suffix}`
  }

  const damageType = getRandomElement(config.damageTypes)
  const baseDamage = getRandomInRange(config.baseDamageRange[0], config.baseDamageRange[1])
  const accuracy = getRandomInRange(config.accuracyRange[0], config.accuracyRange[1])
  const speed = getRandomInRange(config.speedRange[0], config.speedRange[1])

  // Determine if skill has debuff/buff
  const hasDebuff = !isSelfCategory && Math.random() < 0.3
  const hasBuff = isSelfCategory || (!isSelfCategory && Math.random() < 0.2)
  const hasSelfHeal = isSelfCategory && Math.random() < 0.4

  return {
    name,
    description: `A ${category} skill that deals ${damageType} damage.`,
    icon: config.icon,
    category,
    damageType: isSelfCategory ? 'none' : damageType,
    baseDamage: isSelfCategory ? 0 : baseDamage,
    accuracy,
    speed,
    scalesWithAttack: !isSelfCategory,
    scalingPercent: isSelfCategory ? 0 : getRandomInRange(80, 120),
    appliesDebuff: hasDebuff ? getRandomElement(DEBUFFS) : null,
    debuffChance: hasDebuff ? getRandomInRange(20, 80) : 100,
    debuffDuration: hasDebuff ? getRandomInRange(2, 4) : 2,
    debuffValue: hasDebuff ? getRandomInRange(5, 20) : 0,
    appliesBuff: hasBuff ? getRandomElement(BUFFS) : null,
    buffDuration: hasBuff ? getRandomInRange(2, 4) : 2,
    buffValue: hasBuff ? getRandomInRange(10, 30) : 0,
    selfHeal: hasSelfHeal ? getRandomInRange(20, 50) : 0,
    selfDamage: 0,
    narrativeUse: getRandomElement(narratives.use),
    narrativeHit: getRandomElement(narratives.hit),
    narrativeMiss: getRandomElement(narratives.miss),
    narrativeCrit: getRandomElement(narratives.crit),
  }
}

// ============================================
// MAIN API HANDLER
// ============================================

export async function POST(request: Request) {
  try {
    const { category, count = 10 } = await request.json()

    if (!category || !['melee', 'ranged', 'aoe', 'self', 'reactive', 'signature'].includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Get existing skill names from database for duplicate detection
    const existingSkills = await prisma.monsterSkill.findMany({
      select: { name: true },
    })
    const existingNames: Set<string> = new Set(existingSkills.map((s: { name: string }) => s.name.toLowerCase()))

    // Generate skills
    const generatedSkills = []
    const batchNames = new Set<string>()

    for (let i = 0; i < count; i++) {
      const combinedNames = new Set<string>([...existingNames, ...batchNames])
      const skill = generateSkill(category as CategoryType, combinedNames)
      batchNames.add(skill.name.toLowerCase())
      
      // Check if this name exists in DB
      const isDuplicate = existingNames.has(skill.name.toLowerCase())
      
      generatedSkills.push({
        ...skill,
        tempId: `temp_${Date.now()}_${i}`, // Temporary ID for client-side tracking
        isDuplicate,
        isLocked: false,
        isSaved: false,
      })
    }

    return NextResponse.json({
      success: true,
      skills: generatedSkills,
      category,
    })
  } catch (error) {
    console.error('Error generating monster skills:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate skills'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
