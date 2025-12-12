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
  ampModifier: number     // percentage modifier to amp
  apModifier: number      // flat AP modifier
  cdModifier: number      // flat CD modifier
  skillType: string
  targetType: string      // single, aoe_cone, aoe_circle, etc.
}

const VARIANT_CONFIGS: Record<VariantType, VariantConfig> = {
  upgrade:          { icon: '⬆️', color: 'green',  ampModifier: 10,  apModifier: 0,  cdModifier: 0, skillType: 'Attack', targetType: 'single' },
  original_variant: { icon: '🔄', color: 'blue',   ampModifier: 0,   apModifier: 0,  cdModifier: 0, skillType: 'Attack', targetType: 'single' },
  buff_variant:     { icon: '💪', color: 'yellow', ampModifier: -10, apModifier: 1,  cdModifier: 0, skillType: 'Attack', targetType: 'single' },
  debuff_variant:   { icon: '💀', color: 'purple', ampModifier: -10, apModifier: 1,  cdModifier: 0, skillType: 'Attack', targetType: 'single' },
  unique:           { icon: '✨', color: 'orange', ampModifier: 15,  apModifier: 2,  cdModifier: 1, skillType: 'Attack', targetType: 'single' },
  aoe_variant:      { icon: '💥', color: 'red',    ampModifier: -15, apModifier: 2,  cdModifier: 1, skillType: 'Attack', targetType: 'aoe_cone' },
  combo_variant:    { icon: '⛓️', color: 'cyan',   ampModifier: -20, apModifier: 1,  cdModifier: 0, skillType: 'Attack', targetType: 'single' },
  counter_variant:  { icon: '🛡️', color: 'white',  ampModifier: 15,  apModifier: 0,  cdModifier: 1, skillType: 'Defensive', targetType: 'single' },
  mobility_variant: { icon: '💨', color: 'pink',   ampModifier: -10, apModifier: 1,  cdModifier: 0, skillType: 'Attack', targetType: 'single' },
  sustain_variant:  { icon: '❤️‍🩹', color: 'gray',   ampModifier: -15, apModifier: 1,  cdModifier: 1, skillType: 'Attack', targetType: 'single' },
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
  'Enhanced version with {amp}% amp',
  'Stronger strike with {amp}% amp and improved accuracy',
  'Perfected technique with {amp}% amp',
]

const ORIGINAL_EFFECTS = [
  'Strikes with a different angle at {amp}% amp',
  'A modified execution with {amp}% amp',
  'Alternate technique dealing {amp}% amp',
]

const BUFF_EFFECTS = [
  'Deals {amp}% amp and grants {buff}',
  'Strike with {amp}% amp; empowers self with {buff}',
  'Attack at {amp}% amp while gaining {buff}',
]

const DEBUFF_EFFECTS = [
  'Deals {amp}% amp and applies {debuff}',
  'Strike with {amp}% amp; afflicts target with {debuff}',
  'Attack at {amp}% amp while inflicting {debuff}',
]

const UNIQUE_EFFECTS = [
  'Unleashes a completely different technique at {amp}% amp',
  'An unexpected maneuver with {amp}% amp',
  'Unconventional strike at {amp}% amp with unique properties',
]

const AOE_EFFECTS = [
  'Sweeps in a wide arc hitting nearby enemies at {amp}% amp',
  'Explosive attack at {amp}% amp to all enemies in range',
  'Radiating strike at {amp}% amp in an area',
]

const COMBO_EFFECTS = [
  'Hits {hits} times rapidly at {amp}% amp per hit',
  'Chain of {hits} attacks at {amp}% amp each',
  'Flurry of {hits} strikes at {amp}% amp per strike',
]

const COUNTER_EFFECTS = [
  'Reactive strike triggered on enemy attack at {amp}% amp',
  'Counter-attack at {amp}% amp after successful block',
  'Retaliating blow at {amp}% amp when hit',
]

const MOBILITY_EFFECTS = [
  'Dash forward and strike at {amp}% amp',
  'Leap to target at {amp}% amp on landing',
  'Blink behind enemy and attack at {amp}% amp',
]

const SUSTAIN_EFFECTS = [
  'Deals {amp}% amp and heals for 10% of damage dealt',
  'Life-draining strike at {amp}% amp; restores HP',
  'Vampiric attack at {amp}% amp with 10% lifesteal',
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

function calculateAmpPercent(parentAmp: number, stage: number, variantType: VariantType, damageType: string): number {
  // Logic: Parent Amp + Stage Bonus + Variant Modifier
  // Physical/None: +5% per stage (reached ~125% at Stage 5)
  // Magic: +20% per stage (starts at 100%, reaches 200% at Stage 5 to compensate for no crit)
  
  const isMagic = damageType === 'magic'
  const stageBonus = isMagic ? 20 : 5
  const modifier = VARIANT_CONFIGS[variantType].ampModifier
  
  return parentAmp + stageBonus + modifier
}

function calculateApCost(parentAp: number, stage: number, variantType: VariantType): number {
  // Logic: Parent AP + Stage AP Increase + Variant Modifier
  // Stage 2, 3, 4, 5 add +1 AP (cumulative). 
  // But here we are just going from Parent -> Child (1 stage difference).
  // So we just add the increment for the *new* stage if applicable.
  
  // Stage AP increases at stages 2, 4, 5?
  // Docs say:
  // Stage 0: +0
  // Stage 1: +0
  // Stage 2: +1
  // Stage 3: +1
  // Stage 4: +2
  // Stage 5: +2
  // This seems to be "total increase from base".
  // Let's stick to a simpler incremental logic:
  // AP increases by 1 at Stage 2 and Stage 4.
  
  let stageIncrease = 0
  if (stage === 2 || stage === 4) stageIncrease = 1
  
  const modifier = VARIANT_CONFIGS[variantType].apModifier
  return parentAp + stageIncrease + modifier
}

function calculateCooldown(parentCd: number, stage: number, variantType: VariantType): number {
  // Logic: Parent CD + Stage CD Increase + Variant Modifier
  // CD increases by 1 at Stage 3 and Stage 5
  
  let stageIncrease = 0
  if (stage === 3 || stage === 5) stageIncrease = 1
  
  const modifier = VARIANT_CONFIGS[variantType].cdModifier
  return Math.max(1, parentCd + stageIncrease + modifier)
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
  ampPercent: number, 
  buffType?: string, 
  debuffType?: string,
  buffDuration?: number,
  debuffDuration?: number,
  hitCount?: number
): string {
  let template = getRandomElement(VARIANT_EFFECTS[variantType])
  
  // Replace placeholders
  template = template.replace('{amp}', String(ampPercent))
  
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
    const { parentId, parentName, parentStage, starterSkillName } = await request.json()
    
    if (!parentId || parentStage === undefined) {
      return NextResponse.json({ error: 'parentId and parentStage are required' }, { status: 400 })
    }
    
    // Get parent skill to inherit weapon requirement and utility mode
    const parentSkill = await prisma.skill.findUnique({
      where: { id: parentId }
    })
    
    if (!parentSkill) {
      return NextResponse.json({ error: 'Parent skill not found' }, { status: 404 })
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
      const ampPercent = calculateAmpPercent(parentSkill.ampPercent, newStage, variantType, parentSkill.damageType)
      const apCost = calculateApCost(parentSkill.apCost, newStage, variantType)
      const cooldown = calculateCooldown(parentSkill.cooldown, newStage, variantType)
      const config = VARIANT_CONFIGS[variantType]
      
      // Variant-specific fields
      let buffType: string | null = null
      let buffDuration: number | null = null
      let debuffType: string | null = null
      let debuffDuration: number | null = null
      let lifestealPercent: number | null = null
      let hitCount: number = 1
      let isCounter = false
      let triggerCondition: string | null = null
      
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
      
      if (variantType === 'counter_variant') {
        isCounter = true
        triggerCondition = getRandomElement(['after_dodge', 'after_parry', 'on_hit_taken'])
      }
      
      // Generate effect description
      const description = generateEffect(
        variantType, 
        ampPercent, 
        buffType || undefined, 
        debuffType || undefined,
        buffDuration || undefined,
        debuffDuration || undefined,
        hitCount > 1 ? hitCount : undefined
      )
      
      // Determine weapon requirement for child
      // Most variants inherit parent's requirement
      // Mobility variant can become 'any' (movement skills work with any weapon)
      let childWeaponRequirement = parentSkill.weaponRequirement
      if (variantType === 'mobility_variant') {
        childWeaponRequirement = 'any'
      }
      
      // Inherit utility mode from parent (magic skills keep their enchant ability)
      const childHasUtilityMode = parentSkill.hasUtilityMode
      const childUtilityEffect = parentSkill.utilityEffect
      const childUtilityDuration = parentSkill.utilityDuration
      
      // Inherit damage type from parent
      const childDamageType = parentSkill.damageType
      
      const child = await prisma.skill.create({
        data: {
          name,
          description,
          skillType: config.skillType,
          damageType: childDamageType,
          weaponRequirement: childWeaponRequirement,
          hasUtilityMode: childHasUtilityMode,
          utilityEffect: childUtilityEffect,
          utilityDuration: childUtilityDuration,
          stage: newStage,
          variantType,
          ampPercent,
          apCost,
          cooldown,
          targetType: config.targetType,
          range: parentSkill.range,
          hitCount,
          buffType,
          buffDuration,
          debuffType,
          debuffDuration,
          lifestealPercent,
          isCounter,
          triggerCondition,
          passive: null,
          starterSkillName,
          parentId,
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
