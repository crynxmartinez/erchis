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
// NAME GENERATION (Tiered naming - simple early, epic late)
// ============================================

// TIER 1 (Stages 1-2): Simple, short names
const SIMPLE_NAMES: Record<VariantType, string[]> = {
  power:      ['Heavy Strike', 'Strong Blow', 'Hard Hit', 'Big Slam', 'Power Smash', 'Brute Force', 'Mighty Swing', 'Crushing Blow', 'Solid Impact', 'Raw Power'],
  multihit:   ['Double Hit', 'Twin Strike', 'Quick Combo', 'Rapid Jabs', 'Fast Flurry', 'Swift Cuts', 'Dual Slash', 'Two-Step', 'Quick One-Two', 'Burst Attack'],
  aoe:        ['Wide Swing', 'Broad Strike', 'Sweep Attack', 'Arc Slash', 'Circle Cut', 'Spin Attack', 'Round Swing', 'Area Hit', 'Spread Strike', 'Fan Slash'],
  rapid:      ['Quick Jab', 'Fast Strike', 'Swift Cut', 'Speed Hit', 'Hasty Blow', 'Snap Attack', 'Flash Jab', 'Nimble Strike', 'Agile Cut', 'Light Touch'],
  efficiency: ['Smooth Cut', 'Clean Strike', 'Easy Flow', 'Light Swing', 'Soft Touch', 'Gentle Arc', 'Simple Form', 'Basic Flow', 'Calm Strike', 'Steady Hand'],
  dot:        ['Poison Jab', 'Venom Cut', 'Toxic Strike', 'Acid Touch', 'Blight Hit', 'Tainted Blow', 'Sick Strike', 'Foul Cut', 'Bad Touch', 'Rot Jab'],
  control:    ['Stun Hit', 'Lock Strike', 'Hold Blow', 'Freeze Jab', 'Stop Cut', 'Bind Strike', 'Trap Hit', 'Snare Blow', 'Root Jab', 'Pin Strike'],
  sustain:    ['Drain Hit', 'Life Tap', 'Sap Strike', 'Leech Jab', 'Steal Cut', 'Feed Blow', 'Siphon Hit', 'Draw Strike', 'Take Jab', 'Pull Life'],
  defense:    ['Guard Strike', 'Block Hit', 'Shield Bash', 'Parry Blow', 'Counter Jab', 'Deflect Cut', 'Ward Strike', 'Armor Hit', 'Brace Blow', 'Stand Firm'],
  execute:    ['Finish Hit', 'End Strike', 'Kill Blow', 'Final Jab', 'Last Cut', 'Death Strike', 'Doom Hit', 'Fate Blow', 'Reap Jab', 'Cull Strike']
}

// TIER 2 (Stages 3-4): Medium complexity names
const MEDIUM_NAMES: Record<VariantType, string[]> = {
  power:      ['Titan Crusher', 'Grand Smasher', 'Brutal Impact', 'Savage Blow', 'Fierce Destroyer', 'Raging Force', 'Violent Wrecker', 'Furious Slam', 'Primal Smash', 'Wild Devastation'],
  multihit:   ['Shadow Barrage', 'Phantom Flurry', 'Storm Rush', 'Thunder Volley', 'Blade Dance', 'Steel Tempest', 'Whirlwind Combo', 'Cyclone Assault', 'Raging Torrent', 'Fury Chain'],
  aoe:        ['Nova Burst', 'Shockwave Blast', 'Eruption Wave', 'Quake Strike', 'Tremor Field', 'Pulse Detonation', 'Ripple Force', 'Surge Explosion', 'Radiant Burst', 'Expanding Ring'],
  rapid:      ['Lightning Dash', 'Sonic Bolt', 'Thunder Step', 'Storm Rush', 'Wind Cutter', 'Gale Strike', 'Tempest Edge', 'Hurricane Slash', 'Cyclone Pierce', 'Tornado Fang'],
  efficiency: ['Flowing Stream', 'Graceful Current', 'Serene Tide', 'Tranquil Wave', 'Balanced Flow', 'Harmonic Motion', 'Pure Technique', 'Crystal Form', 'Clear Path', 'Zen Strike'],
  dot:        ['Plague Touch', 'Blight Curse', 'Decay Mark', 'Wither Brand', 'Corrupt Seal', 'Festering Wound', 'Rotting Hex', 'Vile Infection', 'Toxic Miasma', 'Poison Cloud'],
  control:    ['Binding Shackle', 'Freezing Chain', 'Petrifying Lock', 'Anchoring Seal', 'Rooting Trap', 'Gripping Snare', 'Paralyzing Web', 'Stunning Cage', 'Locking Vice', 'Sealing Prison'],
  sustain:    ['Vampiric Drain', 'Soul Siphon', 'Life Leech', 'Essence Absorb', 'Spirit Devour', 'Vitality Consume', 'Energy Harvest', 'Force Reap', 'Power Claim', 'Strength Steal'],
  defense:    ['Iron Fortress', 'Steel Bastion', 'Adamant Bulwark', 'Diamond Guard', 'Granite Wall', 'Obsidian Shield', 'Titanium Barrier', 'Bronze Aegis', 'Silver Ward', 'Gold Armor'],
  execute:    ['Fatal Judgment', 'Lethal Verdict', 'Mortal Sentence', 'Deadly Doom', 'Killing Fate', 'Slaying End', 'Murder Finale', 'Deathly Climax', 'Grim Conclusion', 'Dark Execution']
}

// TIER 3 (Stage 5): Epic, legendary names
const EPIC_NAMES: Record<VariantType, string[]> = {
  power:      ['Omega Annihilator', 'Divine Obliterator', 'Godly Devastation', 'Eternal Destruction', 'Infinite Ruin', 'Transcendent Havoc', 'Ascended Cataclysm', 'Celestial Apocalypse', 'Supreme Armageddon', 'Ultimate Oblivion'],
  multihit:   ['Infinite Onslaught', 'Eternal Storm Dance', 'Godly Blade Symphony', 'Divine Thousand Cuts', 'Transcendent Fury Chain', 'Ascended Shadow Ballet', 'Celestial Star Barrage', 'Supreme Phantom Waltz', 'Ultimate Chaos Cascade', 'Omega Death Spiral'],
  aoe:        ['World Shatter', 'Reality Rupture', 'Dimension Collapse', 'Cosmic Detonation', 'Universal Quake', 'Existence Erasure', 'Creation Sundering', 'Primordial Cataclysm', 'Genesis Explosion', 'Apocalyptic Nova'],
  rapid:      ['Light Speed Execution', 'Time Skip Assault', 'Warp Strike Omega', 'Dimensional Slash', 'Quantum Blade Dance', 'Photon Edge Storm', 'Tachyon Fang Fury', 'Hyperspace Cutter', 'Void Step Annihilation', 'Infinity Rush'],
  efficiency: ['Enlightened Mastery', 'Transcendent Technique', 'Divine Flow State', 'Godly Perfection', 'Eternal Harmony', 'Infinite Grace', 'Celestial Balance', 'Supreme Finesse', 'Ultimate Zen', 'Ascended Form'],
  dot:        ['Eternal Plague', 'Godly Corruption', 'Divine Pestilence', 'Transcendent Decay', 'Infinite Blight', 'Celestial Rot', 'Supreme Contagion', 'Ultimate Curse', 'Omega Hex', 'Ascended Miasma'],
  control:    ['Eternal Prison', 'Godly Binding', 'Divine Petrification', 'Transcendent Seal', 'Infinite Lockdown', 'Celestial Cage', 'Supreme Restraint', 'Ultimate Paralysis', 'Omega Freeze', 'Ascended Shackle'],
  sustain:    ['Soul Devourer Omega', 'Eternal Life Drain', 'Godly Essence Theft', 'Divine Vitality Reap', 'Transcendent Absorption', 'Infinite Consumption', 'Celestial Harvest', 'Supreme Siphon', 'Ultimate Leech', 'Ascended Vampirism'],
  defense:    ['Eternal Aegis', 'Godly Fortress', 'Divine Bulwark', 'Transcendent Bastion', 'Infinite Guard', 'Celestial Shield', 'Supreme Barrier', 'Ultimate Ward', 'Omega Defense', 'Ascended Armor'],
  execute:    ['Final Judgment Omega', 'Eternal Execution', 'Godly Verdict', 'Divine Sentence', 'Transcendent Doom', 'Infinite Death', 'Celestial End', 'Supreme Finale', 'Ultimate Reaping', 'Ascended Annihilation']
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
  // Tiered naming based on stage
  // Tier 1 (Stages 1-2): Simple names
  // Tier 2 (Stages 3-4): Medium complexity
  // Tier 3 (Stage 5): Epic legendary names
  
  if (stage <= 2) {
    return getRandomElement(SIMPLE_NAMES[variantType])
  } else if (stage <= 4) {
    return getRandomElement(MEDIUM_NAMES[variantType])
  } else {
    return getRandomElement(EPIC_NAMES[variantType])
  }
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
