import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// ============================================
// VARIANT TYPES (10 total)
// ============================================

type VariantType = 
  | 'upgrade'           // Always included - direct stat boost
  | 'original_variant'  // Similar but different execution
  | 'buff_variant'      // Adds self-buff
  | 'debuff_variant'    // Adds enemy debuff
  | 'unique'            // Completely different
  | 'aoe_variant'       // Area effect
  | 'combo_variant'     // Multi-hit chain
  | 'counter_variant'   // Reactive/defensive
  | 'mobility_variant'  // Adds movement
  | 'sustain_variant'   // Lifesteal/heal

// 9 variants to randomly pick 4 from (upgrade is always included)
const RANDOM_VARIANTS: VariantType[] = [
  'original_variant',
  'buff_variant', 
  'debuff_variant',
  'unique',
  'aoe_variant',
  'combo_variant',
  'counter_variant',
  'mobility_variant',
  'sustain_variant',
]

// ============================================
// VARIANT CONFIGURATION
// ============================================

interface VariantConfig {
  icon: string
  color: string
  damageModifier: number  // percentage modifier
  apModifier: number      // flat AP modifier
  skillTypePrefix: string
}

const VARIANT_CONFIGS: Record<VariantType, VariantConfig> = {
  upgrade:          { icon: '⬆️', color: 'green',  damageModifier: 5,   apModifier: 0,  skillTypePrefix: 'Attack' },
  original_variant: { icon: '🔄', color: 'blue',   damageModifier: 0,   apModifier: 0,  skillTypePrefix: 'Attack' },
  buff_variant:     { icon: '💪', color: 'yellow', damageModifier: -5,  apModifier: 1,  skillTypePrefix: 'Attack / Buff' },
  debuff_variant:   { icon: '💀', color: 'purple', damageModifier: -5,  apModifier: 1,  skillTypePrefix: 'Attack / Debuff' },
  unique:           { icon: '✨', color: 'orange', damageModifier: 0,   apModifier: 0,  skillTypePrefix: 'Attack' },
  aoe_variant:      { icon: '💥', color: 'red',    damageModifier: -10, apModifier: 2,  skillTypePrefix: 'Attack / AoE' },
  combo_variant:    { icon: '⛓️', color: 'cyan',   damageModifier: -15, apModifier: 0,  skillTypePrefix: 'Attack / Combo' },
  counter_variant:  { icon: '🛡️', color: 'white',  damageModifier: 10,  apModifier: 0,  skillTypePrefix: 'Counter' },
  mobility_variant: { icon: '💨', color: 'pink',   damageModifier: -5,  apModifier: 1,  skillTypePrefix: 'Attack / Movement' },
  sustain_variant:  { icon: '❤️‍🩹', color: 'gray',   damageModifier: -10, apModifier: 1,  skillTypePrefix: 'Attack / Drain' },
}

// ============================================
// BUFF/DEBUFF TYPES
// ============================================

const BUFF_TYPES = ['haste', 'empower', 'fortify', 'focus', 'regen']
const DEBUFF_TYPES = ['slow', 'bleed', 'armor_break', 'weaken', 'blind']

const BUFF_DESCRIPTIONS: Record<string, string> = {
  haste: '+20% CDR for {turns} turns',
  empower: '+15% damage for {turns} turns',
  fortify: '+15% defense for {turns} turns',
  focus: '+10% crit chance for {turns} turns',
  regen: '+3% HP per turn for {turns} turns',
}

const DEBUFF_DESCRIPTIONS: Record<string, string> = {
  slow: 'Slows target by 20% for {turns} turns',
  bleed: 'Target bleeds for 5% max HP per turn for {turns} turns',
  armor_break: 'Reduces target defense by 15% for {turns} turns',
  weaken: 'Reduces target damage by 10% for {turns} turns',
  blind: 'Reduces target accuracy by 20% for {turns} turns',
}

// ============================================
// NAME GENERATION
// ============================================

const UPGRADE_PREFIXES = ['Greater', 'Superior', 'Enhanced', 'Improved', 'Advanced', 'Perfected', 'Masterful', 'Elite', 'Refined', 'Empowered']
const ORIGINAL_PREFIXES = ['Twin', 'Double', 'Dual', 'Split', 'Mirrored', 'Echoing', 'Repeated', 'Chained', 'Linked', 'Paired']
const BUFF_PREFIXES = ['Empowering', 'Invigorating', 'Strengthening', 'Bolstering', 'Energizing', 'Fortifying', 'Hastening', 'Focusing', 'Regenerating', 'Vitalizing']
const DEBUFF_PREFIXES = ['Crippling', 'Weakening', 'Draining', 'Sapping', 'Enfeebling', 'Corroding', 'Withering', 'Poisoning', 'Cursing', 'Blighting']
const UNIQUE_PREFIXES = ['Arcane', 'Mystic', 'Primal', 'Elemental', 'Chaos', 'Void', 'Storm', 'Infernal', 'Divine', 'Spectral']
const AOE_PREFIXES = ['Sweeping', 'Whirling', 'Spinning', 'Circular', 'Wide', 'Explosive', 'Radiating', 'Bursting', 'Spreading', 'Encompassing']
const COMBO_PREFIXES = ['Flurry', 'Barrage', 'Chain', 'Rapid', 'Sequential', 'Cascading', 'Relentless', 'Unending', 'Continuous', 'Perpetual']
const COUNTER_PREFIXES = ['Reactive', 'Retaliating', 'Countering', 'Riposting', 'Deflecting', 'Parrying', 'Reflecting', 'Answering', 'Vengeful', 'Punishing']
const MOBILITY_PREFIXES = ['Dashing', 'Leaping', 'Blinking', 'Warping', 'Phasing', 'Shifting', 'Gliding', 'Vaulting', 'Teleporting', 'Flickering']
const SUSTAIN_PREFIXES = ['Draining', 'Leeching', 'Siphoning', 'Vampiric', 'Life-stealing', 'Absorbing', 'Consuming', 'Devouring', 'Feeding', 'Harvesting']

const VARIANT_PREFIXES: Record<VariantType, string[]> = {
  upgrade: UPGRADE_PREFIXES,
  original_variant: ORIGINAL_PREFIXES,
  buff_variant: BUFF_PREFIXES,
  debuff_variant: DEBUFF_PREFIXES,
  unique: UNIQUE_PREFIXES,
  aoe_variant: AOE_PREFIXES,
  combo_variant: COMBO_PREFIXES,
  counter_variant: COUNTER_PREFIXES,
  mobility_variant: MOBILITY_PREFIXES,
  sustain_variant: SUSTAIN_PREFIXES,
}

// ============================================
// EFFECT TEMPLATES BY VARIANT
// ============================================

const UPGRADE_EFFECTS = [
  'Enhanced version dealing {damage}% weapon damage',
  'Stronger strike dealing {damage}% weapon damage with improved accuracy',
  'Perfected technique dealing {damage}% weapon damage',
]

const ORIGINAL_EFFECTS = [
  'Strikes twice in quick succession for {damage}% weapon damage each',
  'A different angle of attack dealing {damage}% weapon damage',
  'Modified execution dealing {damage}% weapon damage with altered timing',
]

const BUFF_EFFECTS = [
  'Deals {damage}% weapon damage and grants {buff} buff',
  'Strike dealing {damage}% weapon damage; empowers self with {buff}',
  'Attack for {damage}% weapon damage while gaining {buff}',
]

const DEBUFF_EFFECTS = [
  'Deals {damage}% weapon damage and applies {debuff}',
  'Strike dealing {damage}% weapon damage; afflicts target with {debuff}',
  'Attack for {damage}% weapon damage while inflicting {debuff}',
]

const UNIQUE_EFFECTS = [
  'Unleashes a completely different technique dealing {damage}% weapon damage',
  'An unexpected maneuver dealing {damage}% weapon damage',
  'Unconventional strike dealing {damage}% weapon damage with unique properties',
]

const AOE_EFFECTS = [
  'Sweeps in a wide arc hitting all nearby enemies for {damage}% weapon damage',
  'Explosive attack dealing {damage}% weapon damage to all enemies in range',
  'Radiating strike dealing {damage}% weapon damage in an area',
]

const COMBO_EFFECTS = [
  'Hits {hits} times rapidly for {damage}% weapon damage per hit',
  'Chain of {hits} attacks dealing {damage}% weapon damage each',
  'Flurry of {hits} strikes for {damage}% weapon damage per strike',
]

const COUNTER_EFFECTS = [
  'Reactive strike triggered on enemy attack, dealing {damage}% weapon damage',
  'Counter-attack dealing {damage}% weapon damage after successful block',
  'Retaliating blow dealing {damage}% weapon damage when hit',
]

const MOBILITY_EFFECTS = [
  'Dash forward and strike for {damage}% weapon damage',
  'Leap to target dealing {damage}% weapon damage on landing',
  'Blink behind enemy and attack for {damage}% weapon damage',
]

const SUSTAIN_EFFECTS = [
  'Deals {damage}% weapon damage and heals for 10% of damage dealt',
  'Life-draining strike dealing {damage}% weapon damage; restores HP',
  'Vampiric attack for {damage}% weapon damage with 10% lifesteal',
]

const VARIANT_EFFECTS: Record<VariantType, string[]> = {
  upgrade: UPGRADE_EFFECTS,
  original_variant: ORIGINAL_EFFECTS,
  buff_variant: BUFF_EFFECTS,
  debuff_variant: DEBUFF_EFFECTS,
  unique: UNIQUE_EFFECTS,
  aoe_variant: AOE_EFFECTS,
  combo_variant: COMBO_EFFECTS,
  counter_variant: COUNTER_EFFECTS,
  mobility_variant: MOBILITY_EFFECTS,
  sustain_variant: SUSTAIN_EFFECTS,
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function calculateDamage(stage: number, variantType: VariantType): number {
  // Base: 25% + (2 × stage)%
  const baseDamage = 25 + (2 * stage)
  const modifier = VARIANT_CONFIGS[variantType].damageModifier
  return baseDamage + modifier
}

function calculateApCost(stage: number, variantType: VariantType): number {
  // Base: 5 + stage
  const baseAp = 5 + stage
  const modifier = VARIANT_CONFIGS[variantType].apModifier
  return baseAp + modifier
}

function calculateCooldown(stage: number): number {
  // Base: 1 + (stage × 0.5) turns, minimum 1, round up
  const cd = 1 + (stage * 0.5)
  return Math.max(1, Math.ceil(cd))
}

function calculateBuffDuration(stage: number): number {
  // 3 + (2 × stage) turns
  return 3 + (2 * stage)
}

function calculateDebuffDuration(stage: number): number {
  // 2 + stage turns
  return 2 + stage
}

function generateName(parentName: string, variantType: VariantType): string {
  const prefix = getRandomElement(VARIANT_PREFIXES[variantType])
  
  // Extract the core action from parent name (last word usually)
  const words = parentName.split(' ')
  const coreAction = words[words.length - 1]
  
  return `${prefix} ${coreAction}`
}

function generateEffect(
  variantType: VariantType, 
  damage: number, 
  buffType?: string, 
  debuffType?: string,
  buffDuration?: number,
  debuffDuration?: number,
  hitCount?: number
): string {
  let template = getRandomElement(VARIANT_EFFECTS[variantType])
  
  // Replace placeholders
  template = template.replace('{damage}', String(damage))
  
  if (buffType && buffDuration) {
    const buffDesc = BUFF_DESCRIPTIONS[buffType].replace('{turns}', String(buffDuration))
    template = template.replace('{buff}', buffDesc)
  }
  
  if (debuffType && debuffDuration) {
    const debuffDesc = DEBUFF_DESCRIPTIONS[debuffType].replace('{turns}', String(debuffDuration))
    template = template.replace('{debuff}', debuffDesc)
  }
  
  if (hitCount) {
    template = template.replace('{hits}', String(hitCount))
  }
  
  return template
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
    
    // Select variants: 1 upgrade (always) + 4 random from 9
    const shuffledVariants = shuffleArray(RANDOM_VARIANTS)
    const selectedVariants: VariantType[] = ['upgrade', ...shuffledVariants.slice(0, 4)]
    
    // Generate 5 children
    const children = []
    const usedNames = new Set<string>()
    
    for (const variantType of selectedVariants) {
      // Generate unique name
      let name = generateName(parentName, variantType)
      let attempts = 0
      while (usedNames.has(name) && attempts < 10) {
        name = generateName(parentName, variantType)
        attempts++
      }
      usedNames.add(name)
      
      // Calculate stats
      const damage = calculateDamage(newStage, variantType)
      const apCost = calculateApCost(newStage, variantType)
      const cooldown = calculateCooldown(newStage)
      
      // Variant-specific fields
      let buffType: string | null = null
      let buffDuration: number | null = null
      let debuffType: string | null = null
      let debuffDuration: number | null = null
      let lifestealPercent: number | null = null
      let hitCount: number | null = null
      
      if (variantType === 'buff_variant') {
        buffType = getRandomElement(BUFF_TYPES)
        buffDuration = calculateBuffDuration(newStage)
      }
      
      if (variantType === 'debuff_variant') {
        debuffType = getRandomElement(DEBUFF_TYPES)
        debuffDuration = calculateDebuffDuration(newStage)
      }
      
      if (variantType === 'sustain_variant') {
        lifestealPercent = 10
      }
      
      if (variantType === 'combo_variant') {
        hitCount = 2 + Math.floor(newStage / 2) // 2-4 hits based on stage
        if (hitCount > 4) hitCount = 4
      }
      
      // Generate effect description
      const description = generateEffect(
        variantType, 
        damage, 
        buffType || undefined, 
        debuffType || undefined,
        buffDuration || undefined,
        debuffDuration || undefined,
        hitCount || undefined
      )
      
      const config = VARIANT_CONFIGS[variantType]
      
      const child = await prisma.skill.create({
        data: {
          name,
          description,
          skillType: config.skillTypePrefix,
          categoryId,
          stage: newStage,
          archetype: variantType === 'upgrade' ? 'power' : variantType.replace('_variant', ''),
          variantType,
          damage: `${damage}%`,
          apCost,
          cooldown,
          passive: null,
          starterSkillName,
          parentId,
          buffType,
          buffDuration,
          debuffType,
          debuffDuration,
          lifestealPercent,
          hitCount,
          isSaved: false,
        }
      })
      
      children.push(child)
    }
    
    return NextResponse.json({ 
      success: true, 
      children,
      message: `Generated ${children.length} child skills (1 upgrade + 4 random variants)`
    })
  } catch (error) {
    console.error('Error generating children:', error)
    return NextResponse.json({ error: 'Failed to generate children', details: String(error) }, { status: 500 })
  }
}
