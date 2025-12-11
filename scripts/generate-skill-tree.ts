/**
 * Skill Tree Generator
 * Generates the fractal skill tree for any starter skill
 * 
 * Usage: npx ts-node scripts/generate-skill-tree.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ============================================
// TYPES
// ============================================

type SkillType = 
  | 'Attack' 
  | 'Attack / Combo' 
  | 'Attack / Movement' 
  | 'Attack / Counter' 
  | 'Attack / AoE' 
  | 'Attack / DoT'
  | 'Attack / Debuff'
  | 'Attack / Buff'
  | 'Attack / Execution'
  | 'Attack / Ultimate'
  | 'Attack / Control'
  | 'Attack / Precision'
  | 'Attack / Anti-Guard'
  | 'Defensive'
  | 'Defensive / Counter'
  | 'Utility'
  | 'Buff'

type Archetype = 'power' | 'speed' | 'utility' | 'mobility'

interface Skill {
  id: string
  name: string
  parentId: string | null
  parentName: string | null
  stage: number
  type: SkillType
  archetype: Archetype | 'root'
  damage: string
  apCost: number
  cooldown: string
  effect: string
  passive: string | null
  children: Skill[]
}

// ============================================
// CONSTANTS
// ============================================

const STAGE_THRESHOLDS = [0, 100, 300, 500, 900, 1500]

const PREFIXES: Record<number, string[]> = {
  1: ['Quick', 'Swift', 'Light', 'Sharp', 'Keen'],
  2: ['Rapid', 'Flash', 'Precise', 'True', 'Deadly'],
  3: ['Phantom', 'Shadow', 'Blazing', 'Storm', 'Thunder'],
  4: ['Grand', 'Supreme', 'Ultimate', 'Legendary', 'Divine'],
  5: ['Infinite', 'Eternal', 'Transcendent', 'Godlike', 'Absolute'],
}

const POWER_WORDS = [
  'Crusher', 'Breaker', 'Devastator', 'Annihilator', 'Obliterator', 'Destroyer', 'Ravager', 'Ruiner',
  'Demolisher', 'Executioner', 'Vanquisher', 'Conqueror', 'Dominator', 'Pulverizer', 'Eradicator', 'Terminator',
  'Smiter', 'Wrecker', 'Slayer', 'Reaper', 'Havoc', 'Carnage', 'Rampage', 'Onslaught'
]
const SPEED_WORDS = [
  'Flurry', 'Rush', 'Barrage', 'Blitz', 'Surge', 'Torrent', 'Cascade', 'Volley',
  'Tempest', 'Whirlwind', 'Cyclone', 'Maelstrom', 'Frenzy', 'Fury', 'Rampage', 'Assault',
  'Salvo', 'Hailstorm', 'Quickstrike', 'Rapidfire', 'Swiftblade', 'Flashstorm', 'Blitzkrieg', 'Overdrive'
]
const UTILITY_WORDS = [
  'Binder', 'Weakener', 'Drainer', 'Crippler', 'Shatterer', 'Piercer', 'Render', 'Sapper',
  'Hexer', 'Curser', 'Affliction', 'Blight', 'Corruption', 'Decay', 'Entropy', 'Wither',
  'Leech', 'Siphon', 'Eroder', 'Corroder', 'Venomous', 'Toxic', 'Plague', 'Pestilence'
]
const MOBILITY_WORDS = [
  'Dasher', 'Phaser', 'Warper', 'Striker', 'Charger', 'Leaper', 'Flasher', 'Shifter',
  'Blinker', 'Teleporter', 'Jumper', 'Vaulter', 'Glider', 'Slider', 'Roller', 'Spinner',
  'Dodger', 'Weaver', 'Dancer', 'Acrobat', 'Phantom', 'Ghost', 'Shade', 'Specter'
]

const CORE_ACTIONS = [
  'Slash', 'Cut', 'Strike', 'Blade', 'Edge', 'Sweep', 'Thrust', 'Pierce', 'Rend', 'Arc',
  'Cleave', 'Slice', 'Carve', 'Gash', 'Lacerate', 'Sever', 'Bisect', 'Dissect',
  'Impale', 'Skewer', 'Stab', 'Jab', 'Lunge', 'Riposte', 'Parry', 'Counter',
  'Flourish', 'Twirl', 'Spin', 'Whirl', 'Spiral', 'Vortex', 'Cyclone', 'Tornado'
]

const DAMAGE_MULTIPLIERS: Record<number, number> = {
  0: 100,
  1: 110,
  2: 125,
  3: 145,
  4: 170,
  5: 200,
}

const ARCHETYPE_MODIFIERS: Record<Archetype, { damage: number; ap: number; cooldown: number }> = {
  power: { damage: 1.3, ap: 1.4, cooldown: 1.5 },
  speed: { damage: 0.7, ap: 0.8, cooldown: 0.6 },
  utility: { damage: 0.8, ap: 1.2, cooldown: 1.3 },
  mobility: { damage: 1.0, ap: 1.1, cooldown: 1.2 },
}

const POWER_EFFECTS = [
  'Deals massive damage; staggers target for 1.5s',
  'Ignores 30% armor; knocks target back 3m',
  'Guaranteed crit on stunned or rooted enemies',
  'Bonus 50% damage to guarding or blocking enemies',
  'Shatters enemy defense, reducing it by 25% for 4s',
  'Deals bonus damage equal to 30% of target missing HP',
  'Executes enemies below 20% HP; restores 10% AP on kill',
  'Damage increases by 8% per consecutive hit (max 5 stacks)',
  'Crushes armor, permanently reducing target defense by 5%',
  'Devastating blow that cannot be blocked or parried',
  'Deals 200% damage to targets with broken armor',
  'Massive strike that creates a shockwave hitting nearby enemies',
  'Brutal attack that causes Fear, reducing target damage by 20%',
  'Overwhelming force that breaks through any guard stance',
  'Colossal damage but roots self for 0.5s after use',
  'Titanic blow that sends target flying 5m backward',
  'Cataclysmic strike that deals splash damage to adjacent foes',
  'Annihilating attack that marks target for death (+15% damage taken)',
  'Ruinous blow that destroys equipped shield durability',
  'Apocalyptic damage that ignores all defensive buffs',
  'Seismic impact that stuns all enemies within 2m',
  'Earthshaking blow that creates difficult terrain',
  'Meteoric strike that deals fire damage over time',
  'World-ending damage to single target; 30s cooldown'
]

const SPEED_EFFECTS = [
  'Hits 3 times rapidly; each hit can crit independently',
  'Attack speed increased by 20% for 4s after use',
  'Chains into next attack automatically with no delay',
  'Cooldown reduced by 0.3s per enemy hit',
  'Generates 2 combo points on hit',
  'Can be used while moving without speed penalty',
  'No animation lock; instant recovery into any action',
  'Each hit has 12% chance to trigger an extra attack',
  'Strikes 5 times in rapid succession; final hit bonus damage',
  'Blistering speed grants 15% evasion during animation',
  'Lightning-fast attack that cannot be reacted to',
  'Rapid strikes that build Momentum (stacks to 10)',
  'Blinding speed; target accuracy reduced by 10% per hit',
  'Consecutive hits increase crit chance by 3% each',
  'Whirlwind of blades hitting all adjacent enemies once',
  'Furious assault that resets on killing blow',
  'Relentless barrage; each hit extends buff duration by 0.5s',
  'Frenzied strikes that heal 2% HP per hit',
  'Overwhelming flurry that prevents target from casting',
  'Supersonic slash that hits before target can react',
  'Hyper-speed combo that grants brief invulnerability',
  'Infinite chain potential while AP remains above 50%',
  'Time-dilated strikes; appears as single instant attack',
  'Reality-bending speed; hits past, present, and future'
]

const UTILITY_EFFECTS = [
  'Applies Bleed dealing 25% weapon damage over 4s',
  'Reduces target damage output by 15% for 5s',
  'Marks target to take 20% more damage from all sources',
  'Slows target movement and attack speed by 30% for 3s',
  'Drains 8% of damage dealt as HP restoration',
  'Disarms target for 2.5s; they cannot use weapon skills',
  'Reduces target accuracy by 25% for 4s',
  'Applies Weakness; next attack against target auto-crits',
  'Poisons target dealing 5% max HP over 6s',
  'Curses target reducing their healing received by 40%',
  'Hexes target causing them to take damage when attacking',
  'Corrupts target buffs, converting them to debuffs',
  'Applies Vulnerability; target takes 10% more crit damage',
  'Silences target for 2s; cannot use skills',
  'Blinds target reducing their hit chance by 50% for 2s',
  'Roots target in place for 1.5s',
  'Applies Decay; target loses 3% defense per second',
  'Siphons 15% of target current AP',
  'Transfers one debuff from self to target',
  'Exposes weakness; reveals target HP and buffs',
  'Applies Fragile; target takes 25% more damage when below 50% HP',
  'Haunts target; they take damage if they move',
  'Dooms target; they die in 10s unless healed to full',
  'Soul Rend; damage ignores all shields and barriers'
]

const MOBILITY_EFFECTS = [
  'Dash 3m forward then strike; cannot be interrupted',
  'Teleport directly behind target after landing hit',
  'Become untargetable for full animation duration',
  'Phase through all enemies while attacking',
  'Gain 40% increased movement speed for 3s',
  'Can cancel any animation to use this skill',
  'Automatically repositions to optimal attack range',
  'Grants 0.5s of invincibility frames',
  'Blink 5m in any direction while attacking',
  'Vault over target landing behind them',
  'Slide under attacks while dealing damage',
  'Spin around target maintaining melee range',
  'Leap 4m into the air, striking on descent',
  'Roll through target, avoiding all damage',
  'Dash through multiple enemies in a line',
  'Shadowstep to target from up to 8m away',
  'Mirror image appears; you teleport to its location',
  'Time skip; reappear 2s in the future at chosen location',
  'Dimensional shift; attack from alternate plane',
  'Gravity defying leap; float for 2s while attacking',
  'Quantum tunnel; pass through walls to reach target',
  'Warp strike from any distance to marked target',
  'Phase walk; become ethereal and move through terrain',
  'Omnipresent strike; hit all enemies within 10m simultaneously'
]

const PASSIVE_TEMPLATES: Record<number, string[]> = {
  1: [
    '{skill} attacks are 5% faster',
    '{skill} costs 5% less AP',
    '{skill} has +5% crit chance',
    '+5% damage after using {skill}',
  ],
  2: [
    '{skill} has 10% chance to not trigger cooldown',
    'After {skill}, next skill costs 10% less AP',
    '{skill} grants 10% evasion for 2s',
    '+10% damage to bleeding targets',
  ],
  3: [
    '{skill} has 15% chance to trigger twice',
    '{skill} restores 5 AP on crit',
    '+15% crit damage for {skill} tree',
    '{skill} ignores 15% armor',
  ],
  4: [
    'All {skill} tree skills deal 20% more damage',
    '{skill} tree skills cost 15% less AP',
    '+20% attack speed after using {skill}',
    '{skill} tree crits deal 25% more damage',
  ],
  5: [
    '{skill} tree skills have 25% chance to reset cooldown',
    'Mastery: {skill} tree damage +30%',
    '{skill} kills restore 20% HP',
    'Ultimate: {skill} tree skills can crit twice',
  ],
}

// ============================================
// HELPER FUNCTIONS
// ============================================

let skillCounter = 0
const usedNames = new Set<string>()
const usedEffects = new Set<string>()

function generateId(): string {
  return `skill_${++skillCounter}`
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateUniqueName(stage: number, archetype: Archetype, parentName: string): string {
  let attempts = 0
  let name = ''
  
  while (attempts < 100) {
    const prefix = getRandomElement(PREFIXES[stage] || PREFIXES[5])
    const action = getRandomElement(CORE_ACTIONS)
    
    let suffix = ''
    switch (archetype) {
      case 'power': suffix = getRandomElement(POWER_WORDS); break
      case 'speed': suffix = getRandomElement(SPEED_WORDS); break
      case 'utility': suffix = getRandomElement(UTILITY_WORDS); break
      case 'mobility': suffix = getRandomElement(MOBILITY_WORDS); break
    }
    
    // Various name patterns
    const patterns = [
      `${prefix} ${action}`,
      `${prefix} ${suffix}`,
      `${action} ${suffix}`,
      `${prefix} ${action} ${suffix}`,
      `${suffix} ${action}`,
    ]
    
    name = getRandomElement(patterns)
    
    if (!usedNames.has(name)) {
      usedNames.add(name)
      return name
    }
    attempts++
  }
  
  // Fallback: add number
  name = `${name} ${skillCounter}`
  usedNames.add(name)
  return name
}

function getSkillType(archetype: Archetype): SkillType {
  switch (archetype) {
    case 'power': return getRandomElement(['Attack', 'Attack / Execution', 'Attack / Anti-Guard'])
    case 'speed': return getRandomElement(['Attack / Combo', 'Attack', 'Attack / Precision'])
    case 'utility': return getRandomElement(['Attack / Debuff', 'Attack / DoT', 'Attack / Control'])
    case 'mobility': return getRandomElement(['Attack / Movement', 'Attack / Counter', 'Attack'])
  }
}

function calculateDamage(stage: number, archetype: Archetype): string {
  const base = DAMAGE_MULTIPLIERS[stage] || 200
  const mod = ARCHETYPE_MODIFIERS[archetype]
  const damage = Math.round(base * mod.damage)
  
  if (archetype === 'speed') {
    const hits = Math.floor(Math.random() * 3) + 2
    const perHit = Math.round(damage / hits)
    return `${perHit}% x${hits} hits`
  }
  
  return `${damage}% weapon damage`
}

function calculateApCost(stage: number, archetype: Archetype): number {
  const base = 5 + stage * 2
  const mod = ARCHETYPE_MODIFIERS[archetype]
  return Math.round(base * mod.ap)
}

function calculateCooldown(stage: number, archetype: Archetype): string {
  const base = 0.5 + stage * 0.3
  const mod = ARCHETYPE_MODIFIERS[archetype]
  const cd = (base * mod.cooldown).toFixed(1)
  return `${cd}s`
}

function getUniqueEffect(archetype: Archetype, stage: number): string {
  const effectPools: Record<Archetype, string[]> = {
    power: POWER_EFFECTS,
    speed: SPEED_EFFECTS,
    utility: UTILITY_EFFECTS,
    mobility: MOBILITY_EFFECTS,
  }
  
  const pool = effectPools[archetype]
  let attempts = 0
  
  while (attempts < 100) {
    const baseEffect = pool[attempts % pool.length]
    // Make effect unique by adding stage-specific modifiers
    const stageModifiers = [
      `[Stage ${stage}]`,
      `(Tier ${stage})`,
      `- Rank ${stage}`,
      `{Lv.${stage}}`,
      `[${stage}★]`,
    ]
    const modifier = stageModifiers[stage % stageModifiers.length]
    
    // Add variation to numbers in effect
    const variation = Math.floor(Math.random() * 10) + stage * 5
    let effect = baseEffect.replace(/(\d+)%/g, (match, num) => {
      const newNum = parseInt(num) + variation
      return `${newNum}%`
    }).replace(/(\d+)s/g, (match, num) => {
      const newNum = parseFloat(num) + (stage * 0.5)
      return `${newNum.toFixed(1)}s`
    }).replace(/(\d+)m/g, (match, num) => {
      const newNum = parseInt(num) + stage
      return `${newNum}m`
    })
    
    // Add unique identifier
    const uniqueEffect = `${effect}`
    
    if (!usedEffects.has(uniqueEffect)) {
      usedEffects.add(uniqueEffect)
      return uniqueEffect
    }
    attempts++
  }
  
  // Fallback: create completely unique effect
  const fallbackEffect = `${archetype.charAt(0).toUpperCase() + archetype.slice(1)} technique #${skillCounter} - Stage ${stage} special ability`
  usedEffects.add(fallbackEffect)
  return fallbackEffect
}

function getPassive(stage: number, skillName: string): string | null {
  if (stage === 0) return null
  const templates = PASSIVE_TEMPLATES[stage] || PASSIVE_TEMPLATES[5]
  const template = getRandomElement(templates)
  return template.replace('{skill}', skillName)
}

// ============================================
// SKILL GENERATION
// ============================================

function generateChildren(parent: Skill, maxStage: number): void {
  if (parent.stage >= maxStage) return
  
  const archetypes: Archetype[] = ['power', 'speed', 'utility', 'mobility']
  
  for (const archetype of archetypes) {
    const newStage = parent.stage + 1
    const name = generateUniqueName(newStage, archetype, parent.name)
    
    const child: Skill = {
      id: generateId(),
      name: name,
      parentId: parent.id,
      parentName: parent.name,
      stage: newStage,
      type: getSkillType(archetype),
      archetype: archetype,
      damage: calculateDamage(newStage, archetype),
      apCost: calculateApCost(newStage, archetype),
      cooldown: calculateCooldown(newStage, archetype),
      effect: getUniqueEffect(archetype, newStage),
      passive: getPassive(newStage, name),
      children: [],
    }
    
    parent.children.push(child)
    
    // Recursively generate children
    generateChildren(child, maxStage)
  }
}

function generateSkillTree(rootName: string, rootType: SkillType, maxStage: number = 5): Skill {
  usedNames.clear()
  skillCounter = 0
  usedNames.add(rootName)
  
  const root: Skill = {
    id: generateId(),
    name: rootName,
    parentId: null,
    parentName: null,
    stage: 0,
    type: rootType,
    archetype: 'root',
    damage: '100% weapon damage',
    apCost: 5,
    cooldown: '0.5s',
    effect: 'Fast, light attack with high accuracy. Good for starting combos.',
    passive: null,
    children: [],
  }
  
  generateChildren(root, maxStage)
  
  return root
}

function countSkills(skill: Skill): number {
  let count = 1
  for (const child of skill.children) {
    count += countSkills(child)
  }
  return count
}

function flattenSkills(skill: Skill, result: Skill[] = []): Skill[] {
  result.push(skill)
  for (const child of skill.children) {
    flattenSkills(child, result)
  }
  return result
}

// ============================================
// OUTPUT GENERATION
// ============================================

function generateMarkdown(skill: Skill, depth: number = 0): string {
  const indent = '  '.repeat(depth)
  let md = ''
  
  const heading = '#'.repeat(Math.min(depth + 2, 6))
  
  md += `${heading} ${skill.name}\n\n`
  md += `| Property | Value |\n`
  md += `|----------|-------|\n`
  md += `| ID | ${skill.id} |\n`
  md += `| Stage | ${skill.stage} |\n`
  md += `| Type | ${skill.type} |\n`
  md += `| Archetype | ${skill.archetype} |\n`
  md += `| Damage | ${skill.damage} |\n`
  md += `| AP Cost | ${skill.apCost} |\n`
  md += `| Cooldown | ${skill.cooldown} |\n`
  md += `| Effect | ${skill.effect} |\n`
  if (skill.passive) {
    md += `| Passive | ${skill.passive} |\n`
  }
  if (skill.parentName) {
    md += `| Parent | ${skill.parentName} |\n`
  }
  md += `\n`
  
  if (skill.children.length > 0) {
    md += `**Children (${skill.children.length}):** ${skill.children.map(c => c.name).join(', ')}\n\n`
    md += `---\n\n`
    
    for (const child of skill.children) {
      md += generateMarkdown(child, depth + 1)
    }
  }
  
  return md
}

function generateJSON(skill: Skill): string {
  return JSON.stringify(skill, null, 2)
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('Generating Quick Slash skill tree...')
  
  const tree = generateSkillTree('Quick Slash', 'Attack', 5)
  const totalSkills = countSkills(tree)
  
  console.log(`Total skills generated: ${totalSkills}`)
  
  // Save JSON
  const jsonPath = path.join(__dirname, '../src/data/skill-trees/quick-slash.json')
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true })
  fs.writeFileSync(jsonPath, generateJSON(tree))
  console.log(`JSON saved to: ${jsonPath}`)
  
  // Save Markdown (summary only for large trees)
  const mdPath = path.join(__dirname, '../docs/skill-trees/sword/quick-slash-full.md')
  
  // For very large trees, just save a summary
  if (totalSkills > 100) {
    const allSkills = flattenSkills(tree)
    let summary = `# Quick Slash - Complete Skill Tree\n\n`
    summary += `**Total Skills:** ${totalSkills}\n\n`
    summary += `## Skills by Stage\n\n`
    
    for (let stage = 0; stage <= 5; stage++) {
      const stageSkills = allSkills.filter(s => s.stage === stage)
      summary += `### Stage ${stage} (${stageSkills.length} skills)\n\n`
      summary += `| Name | Type | Damage | AP | CD | Effect |\n`
      summary += `|------|------|--------|----|----|--------|\n`
      for (const s of stageSkills.slice(0, 50)) { // Limit to 50 per stage in MD
        summary += `| ${s.name} | ${s.type} | ${s.damage} | ${s.apCost} | ${s.cooldown} | ${s.effect.substring(0, 40)}... |\n`
      }
      if (stageSkills.length > 50) {
        summary += `| ... and ${stageSkills.length - 50} more | | | | | |\n`
      }
      summary += `\n`
    }
    
    fs.writeFileSync(mdPath, summary)
  } else {
    fs.writeFileSync(mdPath, generateMarkdown(tree))
  }
  
  console.log(`Markdown saved to: ${mdPath}`)
  console.log('Done!')
}

main().catch(console.error)
