import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// ============================================
// SKILL GENERATION LOGIC
// ============================================

type Archetype = 'power' | 'speed' | 'utility' | 'mobility'

const ARCHETYPES: Archetype[] = ['power', 'speed', 'utility', 'mobility']

// Word pools for name generation
const POWER_WORDS = ['Devastating', 'Crushing', 'Brutal', 'Savage', 'Mighty', 'Thunderous', 'Obliterating', 'Annihilating', 'Destructive', 'Cataclysmic', 'Ruinous', 'Shattering', 'Pulverizing', 'Decimating', 'Ravaging']
const SPEED_WORDS = ['Swift', 'Rapid', 'Flash', 'Lightning', 'Quick', 'Blitz', 'Instant', 'Hasty', 'Nimble', 'Fleeting', 'Blistering', 'Whirlwind', 'Tempest', 'Hurricane', 'Cyclone']
const UTILITY_WORDS = ['Cunning', 'Tactical', 'Strategic', 'Precise', 'Calculated', 'Methodical', 'Insidious', 'Venomous', 'Toxic', 'Corrupting', 'Withering', 'Draining', 'Sapping', 'Enfeebling', 'Crippling']
const MOBILITY_WORDS = ['Phantom', 'Shadow', 'Ghost', 'Ethereal', 'Spectral', 'Shifting', 'Flickering', 'Vanishing', 'Teleporting', 'Blinking', 'Warping', 'Phasing', 'Gliding', 'Soaring', 'Dashing']

const CORE_ACTIONS = ['Slash', 'Strike', 'Cut', 'Blade', 'Edge', 'Sweep', 'Thrust', 'Pierce', 'Rend', 'Arc', 'Cleave', 'Carve', 'Slice', 'Gash', 'Lacerate', 'Impale', 'Skewer', 'Jab', 'Lunge', 'Assault']

const POWER_SUFFIXES = ['Breaker', 'Crusher', 'Destroyer', 'Annihilator', 'Devastator', 'Ravager', 'Eradicator', 'Obliterator', 'Decimator', 'Smiter']
const SPEED_SUFFIXES = ['Flurry', 'Barrage', 'Storm', 'Tempest', 'Blitz', 'Rush', 'Surge', 'Cascade', 'Torrent', 'Volley']
const UTILITY_SUFFIXES = ['Blight', 'Plague', 'Curse', 'Hex', 'Affliction', 'Corruption', 'Decay', 'Wither', 'Entropy', 'Ruin']
const MOBILITY_SUFFIXES = ['Dash', 'Flash', 'Blink', 'Warp', 'Phase', 'Shift', 'Glide', 'Leap', 'Vault', 'Dive']

// Effect templates by archetype
const POWER_EFFECTS = [
  'Deals massive damage; staggers target for {0.5-1.5}s',
  'Ignores {30-50}% armor; knocks target back {3-6}m',
  'Guaranteed crit on stunned enemies; +{50-100}% damage',
  'Bonus {50-80}% damage to guarding or blocking enemies',
  'Shatters enemy defense, reducing it by {30-50}% for {3-5}s',
  'Deals bonus damage equal to {10-20}% of target\'s missing HP',
  'Executes enemies below {15-25}% HP instantly',
  'Damage increases by {10-20}% per consecutive hit',
]

const SPEED_EFFECTS = [
  'Hits {2-4} times rapidly; each hit can crit independently',
  'Attack speed increased by {20-40}% for {3-5}s after use',
  'Chains into next attack automatically with {15-25}% bonus damage',
  'Cooldown reduced by {0.3-0.6}s per enemy hit',
  'Generates {2-4} combo points on hit',
  'Can be used while moving; no animation lock',
  'Blistering speed grants {20-40}% evasion during attack',
  'Each hit has {10-20}% chance to trigger an extra attack',
]

const UTILITY_EFFECTS = [
  'Applies Bleed dealing {25-45}% weapon damage over {3-5}s',
  'Reduces target damage output by {15-30}% for {3-5}s',
  'Marks target; takes {15-30}% more damage from all sources',
  'Slows target movement by {25-40}% for {3-5}s',
  'Drains {5-10}% of damage dealt as HP',
  'Disarms target for {1.5-3}s',
  'Reduces target accuracy by {15-30}% for {4-6}s',
  'Applies Weakness; next {2-4} hits against target are crits',
]

const MOBILITY_EFFECTS = [
  'Dash {3-6}m forward then strike; cannot be interrupted',
  'Teleport behind target after hit; gain {1-2}s stealth',
  'Become untargetable during {0.5-1}s animation',
  'Phase through enemies while attacking; ignore collision',
  'Gain {40-70}% increased movement speed for {2-4}s',
  'Can be used to cancel other animations instantly',
  'Repositions you to optimal range ({3-5}m) from target',
  'Grants {0.3-0.8}s of invincibility frames',
]

// ============================================
// HELPER FUNCTIONS
// ============================================

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomInRange(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10
}

function parseAndRandomizeEffect(template: string): string {
  return template.replace(/\{([\d.]+)-([\d.]+)\}/g, (_, min, max) => {
    return String(getRandomInRange(parseFloat(min), parseFloat(max)))
  })
}

function generateSkillName(archetype: Archetype, parentName: string, stage: number): string {
  const wordPool = {
    power: POWER_WORDS,
    speed: SPEED_WORDS,
    utility: UTILITY_WORDS,
    mobility: MOBILITY_WORDS,
  }[archetype]
  
  const suffixPool = {
    power: POWER_SUFFIXES,
    speed: SPEED_SUFFIXES,
    utility: UTILITY_SUFFIXES,
    mobility: MOBILITY_SUFFIXES,
  }[archetype]
  
  const patterns = [
    () => `${getRandomElement(wordPool)} ${getRandomElement(CORE_ACTIONS)}`,
    () => `${getRandomElement(CORE_ACTIONS)} ${getRandomElement(suffixPool)}`,
    () => `${getRandomElement(wordPool)} ${getRandomElement(suffixPool)}`,
    () => `${getRandomElement(wordPool)} ${getRandomElement(CORE_ACTIONS)} ${getRandomElement(suffixPool)}`,
  ]
  
  return getRandomElement(patterns)()
}

function generateEffect(archetype: Archetype, stage: number): string {
  const effectPool = {
    power: POWER_EFFECTS,
    speed: SPEED_EFFECTS,
    utility: UTILITY_EFFECTS,
    mobility: MOBILITY_EFFECTS,
  }[archetype]
  
  const template = getRandomElement(effectPool)
  return parseAndRandomizeEffect(template)
}

function calculateDamage(stage: number, archetype: Archetype): string {
  const baseMultipliers = {
    power: 1.3,
    speed: 0.4,
    utility: 0.9,
    mobility: 1.1,
  }
  
  const stageMultiplier = 1 + (stage * 0.15)
  const base = Math.round(100 * baseMultipliers[archetype] * stageMultiplier)
  const variance = Math.round((Math.random() - 0.5) * 20)
  
  if (archetype === 'speed') {
    const hits = Math.min(2 + Math.floor(stage / 2), 4)
    return `${base + variance}% x${hits} hits`
  }
  
  return `${base + variance}% weapon damage`
}

function calculateApCost(stage: number, archetype: Archetype): number {
  const baseCosts = {
    power: 8,
    speed: 5,
    utility: 7,
    mobility: 6,
  }
  
  return baseCosts[archetype] + Math.floor(stage * 1.5) + Math.floor(Math.random() * 3)
}

function calculateCooldown(stage: number, archetype: Archetype): string {
  const baseCooldowns = {
    power: 1.5,
    speed: 0.5,
    utility: 1.2,
    mobility: 1.0,
  }
  
  const cd = baseCooldowns[archetype] + (stage * 0.3) + (Math.random() * 0.5)
  return `${cd.toFixed(1)}s`
}

function generatePassive(stage: number, skillName: string): string | null {
  if (stage === 0) return null
  
  const passives = [
    `${skillName} attacks deal ${5 + stage * 2}% more damage`,
    `${skillName} cooldown reduced by ${stage * 5}%`,
    `${skillName} AP cost reduced by ${stage}`,
    `${skillName} has ${5 + stage * 3}% chance to not trigger cooldown`,
    `${skillName} grants ${stage * 2}% lifesteal`,
    `${skillName} attacks have ${5 + stage * 2}% increased crit chance`,
  ]
  
  return getRandomElement(passives)
}

function getSkillType(archetype: Archetype): string {
  const types = {
    power: ['Attack / Execution', 'Attack / Power', 'Attack / Anti-Guard', 'Attack'],
    speed: ['Attack / Combo', 'Attack / Precision', 'Attack', 'Attack / Chain'],
    utility: ['Attack / Debuff', 'Attack / DoT', 'Attack / Control', 'Attack / Drain'],
    mobility: ['Attack / Movement', 'Attack / Evasion', 'Attack / Counter', 'Attack / Reposition'],
  }
  
  return getRandomElement(types[archetype])
}

// ============================================
// MAIN API HANDLER
// ============================================

export async function POST(request: Request) {
  try {
    const { parentId, parentName, parentStage, categoryId, starterSkillName } = await request.json()
    
    if (!parentId || parentStage === undefined) {
      return NextResponse.json({ error: 'parentId and parentStage are required' }, { status: 400 })
    }
    
    const newStage = parentStage + 1
    
    if (newStage > 5) {
      return NextResponse.json({ error: 'Maximum stage (5) reached' }, { status: 400 })
    }
    
    // Check if children already exist
    const existingChildren = await prisma.skill.findMany({
      where: { parentId }
    })
    
    if (existingChildren.length > 0) {
      return NextResponse.json({ 
        success: true, 
        children: existingChildren,
        message: 'Children already exist'
      })
    }
    
    // Generate 4 children (one for each archetype)
    const children = []
    const usedNames = new Set<string>()
    
    for (const archetype of ARCHETYPES) {
      // Generate unique name
      let name = generateSkillName(archetype, parentName, newStage)
      let attempts = 0
      while (usedNames.has(name) && attempts < 10) {
        name = generateSkillName(archetype, parentName, newStage)
        attempts++
      }
      usedNames.add(name)
      
      const child = await prisma.skill.create({
        data: {
          name,
          description: generateEffect(archetype, newStage),
          skillType: getSkillType(archetype),
          categoryId,
          stage: newStage,
          archetype,
          damage: calculateDamage(newStage, archetype),
          apCost: calculateApCost(newStage, archetype),
          cooldown: calculateCooldown(newStage, archetype),
          passive: generatePassive(newStage, name),
          starterSkillName,
          parentId,
        }
      })
      
      children.push(child)
    }
    
    return NextResponse.json({ 
      success: true, 
      children,
      message: `Generated ${children.length} child skills`
    })
  } catch (error) {
    console.error('Error generating children:', error)
    return NextResponse.json({ error: 'Failed to generate children', details: String(error) }, { status: 500 })
  }
}
