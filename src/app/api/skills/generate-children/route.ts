import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// ============================================
// VARIANT TYPES (10 Evolution Paths)
// ============================================

type VariantType = 
  | 'power'       // Nuke (Meteor path)
  | 'multihit'    // Chain (Omnislash path)
  | 'aoe'         // Clear (Firestorm path)
  | 'rapid'       // Speed (Flash Step path)
  | 'efficiency'  // Sustain (Endless path)
  | 'dot'         // Affliction (Venom path)
  | 'control'     // CC (Earthshatter path)
  | 'sustain'     // Drain (Blood Feast path)
  | 'defense'     // Counter (Tank path)
  | 'execute'     // Finisher (Guillotine path)

// All available variants
const ALL_VARIANTS: VariantType[] = [
  'power',
  'multihit',
  'aoe',
  'rapid',
  'efficiency',
  'dot',
  'control',
  'sustain',
  'defense',
  'execute',
]

// ============================================
// VARIANT CONFIGURATION
// ============================================

interface VariantConfig {
  icon: string
  color: string
  label: string
  ampModifier: number     // percentage modifier to amp
  apModifier: number      // flat AP modifier
  cdModifier: number      // flat CD modifier
  descriptionTemplate: string
}

const VARIANT_CONFIGS: Record<VariantType, VariantConfig> = {
  power: { 
    icon: '💥', 
    color: 'text-red-500 border-red-500 bg-red-900/20', 
    label: 'Power Evolution',
    ampModifier: 25,  
    apModifier: 2,  
    cdModifier: 1,
    descriptionTemplate: 'Massive strike dealing {amp}% damage.'
  },
  multihit: { 
    icon: '⚔️', 
    color: 'text-cyan-500 border-cyan-500 bg-cyan-900/20', 
    label: 'Multi-Hit Evolution',
    ampModifier: -30, // Per hit reduction
    apModifier: 1,  
    cdModifier: 0,
    descriptionTemplate: 'Unleashes {hits} rapid strikes, each dealing {amp}% damage.'
  },
  aoe: { 
    icon: '🌊', 
    color: 'text-blue-500 border-blue-500 bg-blue-900/20', 
    label: 'AoE Evolution',
    ampModifier: -15, 
    apModifier: 2,  
    cdModifier: 1,
    descriptionTemplate: 'Strikes all enemies in an area for {amp}% damage.'
  },
  rapid: { 
    icon: '⚡', 
    color: 'text-yellow-500 border-yellow-500 bg-yellow-900/20', 
    label: 'Rapid Evolution',
    ampModifier: -15, 
    apModifier: 0,  
    cdModifier: -1, // Reduces CD
    descriptionTemplate: 'Quick attack dealing {amp}% damage with reduced cooldown.'
  },
  efficiency: { 
    icon: '💧', 
    color: 'text-emerald-500 border-emerald-500 bg-emerald-900/20', 
    label: 'Efficiency Evolution',
    ampModifier: -10, 
    apModifier: -2, // Reduces AP
    cdModifier: 0,
    descriptionTemplate: 'Efficient strike dealing {amp}% damage for low AP cost.'
  },
  dot: { 
    icon: '☠️', 
    color: 'text-purple-500 border-purple-500 bg-purple-900/20', 
    label: 'Affliction Evolution',
    ampModifier: -10, 
    apModifier: 1,  
    cdModifier: 0,
    descriptionTemplate: 'Deals {amp}% damage and inflicts {status} for {duration} turns.'
  },
  control: { 
    icon: '🛑', 
    color: 'text-orange-500 border-orange-500 bg-orange-900/20', 
    label: 'Control Evolution',
    ampModifier: -10, 
    apModifier: 1,  
    cdModifier: 1,
    descriptionTemplate: 'Deals {amp}% damage and {control} the target.'
  },
  sustain: { 
    icon: '🩸', 
    color: 'text-rose-500 border-rose-500 bg-rose-900/20', 
    label: 'Vampiric Evolution',
    ampModifier: -15, 
    apModifier: 1,  
    cdModifier: 0,
    descriptionTemplate: 'Deals {amp}% damage and heals user for {heal}% of damage dealt.'
  },
  defense: { 
    icon: '🛡️', 
    color: 'text-slate-400 border-slate-500 bg-slate-900/20', 
    label: 'Defensive Evolution',
    ampModifier: -10, 
    apModifier: 0,  
    cdModifier: 0,
    descriptionTemplate: 'Deals {amp}% damage and grants {buff} for {duration} turns.'
  },
  execute: { 
    icon: '💀', 
    color: 'text-gray-200 border-gray-500 bg-gray-900/20', 
    label: 'Execute Evolution',
    ampModifier: 10,  
    apModifier: 1,  
    cdModifier: 1,
    descriptionTemplate: 'Deals {amp}% damage. Deals +50% bonus damage to targets below 30% HP.'
  }
}

// ============================================
// CONFIGS
// ============================================

const STATUS_EFFECTS = {
  physical: 'Bleed',
  magic: 'Burn',
  none: 'Weaken'
}

const CONTROL_EFFECTS = ['Stuns', 'Slows', 'Knocks Back']
const DEFENSIVE_BUFFS = ['Iron Skin', 'Evasion', 'Parry Chance']

// ============================================
// NAME GENERATION (Unique names, no parent reference)
// ============================================

// Skill name parts by variant type - combines [Prefix] + [Core] + [Suffix (optional)]
const VARIANT_NAME_PARTS: Record<VariantType, { prefixes: string[], cores: string[], suffixes: string[] }> = {
  power: {
    prefixes: ['Titan', 'Colossal', 'Mega', 'Ultra', 'Supreme', 'Grand', 'Apex', 'Prime', 'Omega', 'Divine'],
    cores: ['Crusher', 'Breaker', 'Devastator', 'Annihilator', 'Obliterator', 'Destroyer', 'Wrecker', 'Smasher', 'Pulverizer', 'Demolisher'],
    suffixes: ['Strike', 'Blow', 'Impact', 'Force', 'Might', 'Wrath', 'Fury', 'Ruin', 'Havoc', 'Doom']
  },
  multihit: {
    prefixes: ['Echo', 'Phantom', 'Mirror', 'Shadow', 'Spectral', 'Twin', 'Triple', 'Quad', 'Infinite', 'Eternal'],
    cores: ['Barrage', 'Flurry', 'Cascade', 'Torrent', 'Storm', 'Blitz', 'Rush', 'Volley', 'Salvo', 'Onslaught'],
    suffixes: ['Dance', 'Combo', 'Chain', 'Sequence', 'Series', 'Burst', 'Wave', 'Assault', 'Rampage', 'Frenzy']
  },
  aoe: {
    prefixes: ['Nova', 'Radiant', 'Expanding', 'Erupting', 'Surging', 'Pulsing', 'Rippling', 'Spreading', 'Bursting', 'Exploding'],
    cores: ['Shockwave', 'Maelstrom', 'Tempest', 'Cataclysm', 'Upheaval', 'Eruption', 'Detonation', 'Blast', 'Surge', 'Quake'],
    suffixes: ['Field', 'Zone', 'Domain', 'Radius', 'Sphere', 'Circle', 'Ring', 'Area', 'Expanse', 'Reach']
  },
  rapid: {
    prefixes: ['Flash', 'Sonic', 'Hyper', 'Turbo', 'Mach', 'Instant', 'Swift', 'Blur', 'Warp', 'Lightning'],
    cores: ['Dash', 'Sprint', 'Bolt', 'Streak', 'Zip', 'Zephyr', 'Gust', 'Breeze', 'Wind', 'Current'],
    suffixes: ['Strike', 'Cut', 'Slash', 'Jab', 'Thrust', 'Pierce', 'Edge', 'Blade', 'Fang', 'Claw']
  },
  efficiency: {
    prefixes: ['Zen', 'Flowing', 'Graceful', 'Serene', 'Tranquil', 'Balanced', 'Harmonic', 'Pure', 'Crystal', 'Clear'],
    cores: ['Stream', 'Flow', 'Current', 'Tide', 'Wave', 'Ripple', 'Glide', 'Drift', 'Float', 'Breeze'],
    suffixes: ['Art', 'Form', 'Style', 'Way', 'Path', 'Method', 'Technique', 'Motion', 'Grace', 'Finesse']
  },
  dot: {
    prefixes: ['Venom', 'Toxic', 'Plague', 'Blight', 'Decay', 'Rot', 'Wither', 'Corrupt', 'Tainted', 'Festering'],
    cores: ['Infection', 'Contagion', 'Pestilence', 'Miasma', 'Toxin', 'Poison', 'Venom', 'Bane', 'Curse', 'Hex'],
    suffixes: ['Touch', 'Mark', 'Brand', 'Seal', 'Sign', 'Wound', 'Scar', 'Taint', 'Stain', 'Blight']
  },
  control: {
    prefixes: ['Binding', 'Locking', 'Sealing', 'Freezing', 'Stunning', 'Paralyzing', 'Petrifying', 'Anchoring', 'Rooting', 'Gripping'],
    cores: ['Shackle', 'Chain', 'Lock', 'Bind', 'Seal', 'Trap', 'Snare', 'Net', 'Web', 'Cage'],
    suffixes: ['Hold', 'Grip', 'Grasp', 'Clutch', 'Vice', 'Prison', 'Restraint', 'Arrest', 'Halt', 'Stop']
  },
  sustain: {
    prefixes: ['Vampiric', 'Draining', 'Siphoning', 'Leeching', 'Absorbing', 'Hungering', 'Thirsting', 'Devouring', 'Consuming', 'Feeding'],
    cores: ['Drain', 'Siphon', 'Leech', 'Absorb', 'Devour', 'Consume', 'Feed', 'Harvest', 'Reap', 'Claim'],
    suffixes: ['Fang', 'Bite', 'Kiss', 'Touch', 'Embrace', 'Grasp', 'Pull', 'Draw', 'Take', 'Steal']
  },
  defense: {
    prefixes: ['Iron', 'Steel', 'Adamant', 'Diamond', 'Fortress', 'Bastion', 'Bulwark', 'Aegis', 'Guardian', 'Sentinel'],
    cores: ['Shield', 'Wall', 'Barrier', 'Guard', 'Ward', 'Armor', 'Plate', 'Shell', 'Carapace', 'Aegis'],
    suffixes: ['Stance', 'Form', 'Posture', 'Position', 'Defense', 'Block', 'Parry', 'Counter', 'Riposte', 'Return']
  },
  execute: {
    prefixes: ['Final', 'Last', 'Ending', 'Terminal', 'Ultimate', 'Supreme', 'Absolute', 'Perfect', 'True', 'Divine'],
    cores: ['Execution', 'Judgment', 'Verdict', 'Sentence', 'Doom', 'Fate', 'End', 'Finale', 'Climax', 'Conclusion'],
    suffixes: ['Strike', 'Blow', 'Cut', 'Slash', 'Thrust', 'Edge', 'Point', 'Blade', 'Fang', 'Claw']
  }
}

// Stage-based name modifiers (higher stages get more epic names)
const STAGE_MODIFIERS: Record<number, string[]> = {
  1: ['', 'Lesser', 'Minor', 'Basic', 'Simple'],
  2: ['', 'Greater', 'Enhanced', 'Improved', 'Advanced'],
  3: ['', 'Superior', 'Mighty', 'Potent', 'Fierce'],
  4: ['', 'Legendary', 'Mythic', 'Ancient', 'Primal'],
  5: ['', 'Transcendent', 'Ascended', 'Godly', 'Eternal', 'Infinite']
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function calculateAmpPercent(parentAmp: number, stage: number, variantType: VariantType, damageType: string): number {
  // Logic: Parent Amp + Stage Bonus + Variant Modifier
  // Physical/None: +5% per stage
  // Magic: +20% per stage
  
  const isMagic = damageType === 'magic'
  const stageBonus = isMagic ? 20 : 5
  const modifier = VARIANT_CONFIGS[variantType].ampModifier
  
  // Ensure minimum 10% amp
  return Math.max(10, parentAmp + stageBonus + modifier)
}

function calculateApCost(parentAp: number, stage: number, variantType: VariantType): number {
  // Logic: Parent AP + Stage Increment (at 2 & 4) + Modifier
  let stageIncrease = 0
  if (stage === 2 || stage === 4) stageIncrease = 1
  
  const modifier = VARIANT_CONFIGS[variantType].apModifier
  
  // Ensure minimum 1 AP
  return Math.max(1, parentAp + stageIncrease + modifier)
}

function calculateCooldown(parentCd: number, stage: number, variantType: VariantType): number {
  // Logic: Parent CD + Stage Increment (at 3 & 5) + Modifier
  let stageIncrease = 0
  if (stage === 3 || stage === 5) stageIncrease = 1
  
  const modifier = VARIANT_CONFIGS[variantType].cdModifier
  
  // Ensure minimum 1 Turn (unless we add 0 CD skills later, but turn based usually needs 1)
  return Math.max(1, parentCd + stageIncrease + modifier)
}

function generateName(variantType: VariantType, stage: number): string {
  const nameParts = VARIANT_NAME_PARTS[variantType]
  const stageModifiers = STAGE_MODIFIERS[stage] || STAGE_MODIFIERS[1]
  
  // Pick random parts
  const prefix = getRandomElement(nameParts.prefixes)
  const core = getRandomElement(nameParts.cores)
  const stageModifier = getRandomElement(stageModifiers)
  
  // 50% chance to include a suffix for variety
  const includeSuffix = Math.random() > 0.5
  const suffix = includeSuffix ? getRandomElement(nameParts.suffixes) : ''
  
  // Build the name based on what we have
  let name = ''
  
  if (stageModifier) {
    // Format: "Legendary Titan Crusher" or "Mythic Echo Barrage Dance"
    name = `${stageModifier} ${prefix} ${core}`
  } else {
    // Format: "Titan Crusher" or "Echo Barrage Dance"
    name = `${prefix} ${core}`
  }
  
  if (suffix) {
    name += ` ${suffix}`
  }
  
  return name
}

function generateEffect(
  variantType: VariantType, 
  ampPercent: number, 
  damageType: string,
  stage: number,
  hitCount: number = 1
): string {
  let template = VARIANT_CONFIGS[variantType].descriptionTemplate
  
  // Replace Amp
  template = template.replace('{amp}', String(ampPercent))
  
  // Replace Hits
  template = template.replace('{hits}', String(hitCount))
  
  // Replace Status (DoT)
  if (variantType === 'dot') {
    const status = damageType === 'magic' ? 'Burn' : damageType === 'physical' ? 'Bleed' : 'Weakness'
    const duration = 2 + Math.floor(stage / 2)
    template = template.replace('{status}', status).replace('{duration}', String(duration))
  }
  
  // Replace Control
  if (variantType === 'control') {
    const control = getRandomElement(CONTROL_EFFECTS)
    template = template.replace('{control}', control)
  }
  
  // Replace Sustain
  if (variantType === 'sustain') {
    template = template.replace('{heal}', '20')
  }
  
  // Replace Defense
  if (variantType === 'defense') {
    const buff = getRandomElement(DEFENSIVE_BUFFS)
    const duration = 2
    template = template.replace('{buff}', buff).replace('{duration}', String(duration))
  }
  
  return template
}

// ============================================
// MAIN API HANDLER
// ============================================

export async function POST(request: Request) {
  try {
    const { parentId, parentName, parentStage, starterSkillName, selectedVariants } = await request.json()
    
    if (!parentId || parentStage === undefined) {
      return NextResponse.json({ error: 'parentId and parentStage are required' }, { status: 400 })
    }
    
    // Get parent skill
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
    
    // Check existing
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
    
    // Determine variants to generate
    // If selectedVariants provided (array of strings), use those.
    // Otherwise, generate based on Tier Logic.
    
    let variantsToUse: VariantType[] = []
    
    if (selectedVariants && Array.isArray(selectedVariants) && selectedVariants.length > 0) {
      variantsToUse = selectedVariants as VariantType[]
    } else {
      // TIERED EVOLUTION LOGIC
      // Stage is the PARENT stage. Child will be parentStage + 1.
      // Child Stage 1 & 2: Tier 1 (Refinement)
      // Child Stage 3 & 4: Tier 2 (Mutation)
      // Child Stage 5: Tier 3 (Ascension)
      
      let tierPool: VariantType[] = []
      
      if (newStage <= 2) {
        // Tier 1: Refinement
        tierPool = ['power', 'rapid', 'efficiency', 'defense']
      } else if (newStage <= 4) {
        // Tier 2: Mutation
        tierPool = ['multihit', 'aoe', 'dot', 'sustain']
      } else {
        // Tier 3: Ascension (Stage 5)
        tierPool = ['execute', 'control', 'power']
      }
      
      // Select random variants from the tier pool
      // For Stage 5, we might just return all of them since pool is small (3)
      // For others, pick 4 randoms or all if length <= 4
      
      if (tierPool.length <= 4) {
        variantsToUse = tierPool
      } else {
        const shuffled = tierPool.sort(() => 0.5 - Math.random())
        variantsToUse = shuffled.slice(0, 4)
      }
      
      // Always ensure 'power' is included for Stage 1/2 if not picked? 
      // Tier 1 pool includes power, so it might be picked.
      // If we want to guarantee at least one "Upgrade" (Power), we can force it.
      // But for Tier 2, Power isn't in the pool (it's mutation time).
      // Let's stick to the pool logic for strict tiering.
    }
    
    const children = []
    
    for (const variantType of variantsToUse) {
      // Generate Stats
      const ampPercent = calculateAmpPercent(parentSkill.ampPercent, newStage, variantType, parentSkill.damageType)
      const apCost = calculateApCost(parentSkill.apCost, newStage, variantType)
      const cooldown = calculateCooldown(parentSkill.cooldown, newStage, variantType)
      
      // Special logic for specific variants
      let hitCount = 1
      let targetType = 'single'
      let isCounter = false
      
      if (variantType === 'multihit') {
        // Stage 1-2: 2 hits, Stage 3-4: 3 hits, Stage 5: 4 hits
        hitCount = 2 + Math.floor(newStage / 2)
      }
      
      if (variantType === 'aoe') {
        targetType = 'aoe_circle' // or cone, simplify to circle for now
      }
      
      if (variantType === 'defense') {
        isCounter = true // flag as counter for potential mechanics
      }
      
      // Name & Description
      const name = generateName(variantType, newStage)
      const description = generateEffect(variantType, ampPercent, parentSkill.damageType, newStage, hitCount)
      
      // Inheritance
      // Mobility variant might allow 'any' weapon if parent was strict
      let weaponRequirement = parentSkill.weaponRequirement
      // if (variantType === 'rapid' && weaponRequirement !== 'any') weaponRequirement = 'any' // Optional idea
      
      const child = await prisma.skill.create({
        data: {
          name,
          description,
          skillType: parentSkill.skillType, // Keep parent's category (Attack, etc.)
          damageType: parentSkill.damageType,
          weaponRequirement,
          hasUtilityMode: parentSkill.hasUtilityMode,
          utilityEffect: parentSkill.utilityEffect,
          utilityDuration: parentSkill.utilityDuration,
          stage: newStage,
          variantType,
          ampPercent,
          apCost,
          cooldown,
          targetType,
          range: parentSkill.range, // Inherit range (AoE might modify this later)
          hitCount,
          isCounter,
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
      message: `Generated ${children.length} child skills`
    })

  } catch (error) {
    console.error('Error generating children:', error)
    return NextResponse.json({ error: 'Failed to generate children', details: String(error) }, { status: 500 })
  }
}
