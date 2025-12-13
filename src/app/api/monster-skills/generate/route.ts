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
// SKILL-SPECIFIC NARRATIVE GENERATOR
// ============================================

// Damage type flavor words
const DAMAGE_FLAVOR: Record<string, { verb: string; adjective: string; noun: string; effect: string }> = {
  physical: { verb: 'crushes', adjective: 'brutal', noun: 'force', effect: 'bones crack and flesh tears' },
  fire: { verb: 'scorches', adjective: 'blazing', noun: 'flames', effect: 'skin blisters and armor glows red-hot' },
  ice: { verb: 'freezes', adjective: 'frigid', noun: 'frost', effect: 'ice crystals spread across the wound' },
  lightning: { verb: 'electrifies', adjective: 'crackling', noun: 'thunder', effect: 'electricity arcs through the body' },
  poison: { verb: 'corrodes', adjective: 'venomous', noun: 'toxin', effect: 'the wound festers with corruption' },
  magic: { verb: 'warps', adjective: 'arcane', noun: 'energy', effect: 'reality itself seems to bend' },
  dark: { verb: 'consumes', adjective: 'shadowy', noun: 'darkness', effect: 'the soul itself feels drained' },
  true: { verb: 'annihilates', adjective: 'absolute', noun: 'destruction', effect: 'nothing can withstand the impact' },
  none: { verb: 'empowers', adjective: 'surging', noun: 'power', effect: 'strength flows through every fiber' },
}

// Skill name to action mapping for more specific narratives
const SKILL_ACTIONS: Record<string, { use: string; hit: string; miss: string; crit: string }> = {
  // Melee
  'Bite': {
    use: 'The creature opens its maw wide, rows of jagged teeth gleaming with saliva as it lunges for your throat!',
    hit: 'Fangs sink deep into flesh, tearing through muscle as blood sprays!',
    miss: 'You twist away at the last second, feeling hot breath on your neck as jaws snap shut on empty air!',
    crit: 'The bite finds the jugular! Blood fountains as teeth rip through vital arteries!',
  },
  'Claw': {
    use: 'Razor-sharp talons flash through the air in a deadly arc, each claw capable of gutting a man!',
    hit: 'Claws rake across your body, leaving deep parallel gashes that weep crimson!',
    miss: 'You duck under the swipe, feeling the wind of those deadly claws pass inches above your head!',
    crit: 'The claws find purchase and RIP downward, tearing flesh from bone in a spray of gore!',
  },
  'Slash': {
    use: 'The beast swings with murderous intent, its natural weapons carving through the air!',
    hit: 'A vicious slash opens a deep wound, blood flowing freely!',
    miss: 'The slash cuts only air as you desperately throw yourself backward!',
    crit: 'The slash nearly bisects you, cutting so deep you can see bone!',
  },
  'Rend': {
    use: 'With both claws hooked, the creature prepares to tear you apart like wet paper!',
    hit: 'Claws dig in and PULL, rending flesh in opposite directions!',
    miss: 'You break free before those terrible claws can find purchase!',
    crit: 'The rending attack tears away a chunk of flesh, leaving a horrific wound!',
  },
  'Maul': {
    use: 'The beast rears up, preparing to bring its full weight down in a devastating maul!',
    hit: 'You\'re driven to the ground under the crushing assault, bones groaning under the pressure!',
    miss: 'You roll aside as the creature crashes down where you stood, cracking the earth!',
    crit: 'The maul pins you down and the beast savages you mercilessly!',
  },
  'Crush': {
    use: 'Massive limbs rise high, ready to pulverize everything beneath them!',
    hit: 'The crushing blow drives you into the ground, armor denting under the impact!',
    miss: 'You scramble clear as the ground explodes where you stood!',
    crit: 'Bones shatter audibly as the crushing force finds its mark!',
  },
  'Slam': {
    use: 'The creature hurls its bulk forward in a devastating body slam!',
    hit: 'The impact sends you flying, the world spinning as you crash to the ground!',
    miss: 'You sidestep the charging mass, feeling the rush of displaced air!',
    crit: 'The slam catches you dead center, driving every ounce of breath from your lungs!',
  },
  'Tackle': {
    use: 'With a thunderous roar, the beast charges forward to flatten you!',
    hit: 'You\'re bowled over by the charging mass, tumbling across the ground!',
    miss: 'You pivot at the last instant, the charging beast barreling past!',
    crit: 'The tackle drives you into the ground with bone-jarring force!',
  },
  'Charge': {
    use: 'The ground trembles as the creature lowers its head and CHARGES!',
    hit: 'The charging impact lifts you off your feet, sending you crashing backward!',
    miss: 'You throw yourself aside as the charging beast thunders past!',
    crit: 'The charge catches you full-on, the impact like being hit by a battering ram!',
  },
  // Ranged
  'Fire Breath': {
    use: 'The creature\'s chest swells, heat radiating from its maw as flames build within!',
    hit: 'A torrent of fire engulfs you, searing flesh and igniting everything it touches!',
    miss: 'You dive behind cover as the stream of fire roars past, scorching the air!',
    crit: 'The flames consume you completely, burning with supernatural intensity!',
  },
  'Ice Beam': {
    use: 'Frost crackles around the creature\'s maw as it draws in a deep, freezing breath!',
    hit: 'The beam of absolute cold strikes you, ice spreading across your body instantly!',
    miss: 'You dodge aside as the freezing beam passes, leaving a trail of frost in its wake!',
    crit: 'The ice beam flash-freezes flesh, the cold so intense it burns!',
  },
  'Lightning Bolt': {
    use: 'Electricity crackles and arcs around the creature as it gathers power!',
    hit: 'The bolt of lightning strikes you dead-on, electricity coursing through your body!',
    miss: 'The lightning bolt strikes the ground beside you, leaving a smoking crater!',
    crit: 'The lightning finds your heart, every nerve screaming as electricity overloads your system!',
  },
  'Poison Spray': {
    use: 'Venom drips from the creature\'s fangs as it prepares to unleash a toxic deluge!',
    hit: 'The spray of poison coats you, burning wherever it touches exposed skin!',
    miss: 'You hold your breath and dodge, the toxic cloud passing harmlessly!',
    crit: 'The concentrated venom seeps into every wound, spreading corruption through your veins!',
  },
  'Acid Spit': {
    use: 'The creature\'s throat bulges as it prepares to launch a glob of corrosive acid!',
    hit: 'The acid splashes across you, immediately beginning to dissolve armor and flesh!',
    miss: 'You duck as the acid sails overhead, sizzling as it eats into the ground behind you!',
    crit: 'The acid finds gaps in your armor, eating through to the flesh beneath!',
  },
  // AoE
  'Inferno': {
    use: 'The air itself ignites as the creature summons a raging inferno that spreads in all directions!',
    hit: 'Flames wash over you in a tidal wave of fire, consuming everything in their path!',
    miss: 'You find a pocket of safety as the inferno rages around you!',
    crit: 'The inferno reaches white-hot intensity, melting stone and incinerating all in its path!',
  },
  'Blizzard': {
    use: 'Temperature plummets as the creature calls forth a howling blizzard of ice and wind!',
    hit: 'The blizzard engulfs you, ice shards cutting like knives as the cold seeps into your bones!',
    miss: 'You find shelter from the worst of the blizzard, though frost still bites at exposed skin!',
    crit: 'The blizzard freezes you to the core, ice forming in your very blood!',
  },
  'Thunderstorm': {
    use: 'Dark clouds materialize overhead as the creature calls down the fury of the storm!',
    hit: 'Lightning strikes from every direction, thunder deafening as electricity courses through you!',
    miss: 'You weave between the lightning strikes, each bolt missing by inches!',
    crit: 'Multiple bolts converge on you simultaneously, the combined voltage overwhelming!',
  },
  'Earthquake': {
    use: 'The creature slams the ground with tremendous force, sending shockwaves rippling outward!',
    hit: 'The ground bucks and heaves beneath you, throwing you off balance as fissures open!',
    miss: 'You leap clear as the ground splits and churns where you stood!',
    crit: 'The earth swallows you momentarily before spitting you out, battered and broken!',
  },
  'Chain Lightning': {
    use: 'Electricity arcs between the creature\'s claws as it prepares to unleash chained destruction!',
    hit: 'Lightning leaps from target to target, each arc carrying deadly voltage!',
    miss: 'The lightning chain breaks before reaching you, grounding harmlessly!',
    crit: 'The chain lightning amplifies with each jump, the final arc devastating!',
  },
  // Self
  'Enrage': {
    use: 'The creature\'s eyes turn blood-red as primal fury overtakes its mind!',
    hit: 'Muscles bulge and veins pulse as rage-fueled strength floods through the beast!',
    miss: 'The rage flickers and fades, failing to take hold!',
    crit: 'The creature enters a berserk frenzy, its power multiplying exponentially!',
  },
  'Regenerate': {
    use: 'Wounds begin to knit closed as the creature\'s flesh writhes with unnatural healing!',
    hit: 'Torn flesh mends, broken bones reset, the creature\'s injuries fading before your eyes!',
    miss: 'The regeneration sputters and fails, wounds remaining open!',
    crit: 'The creature\'s body regenerates completely, emerging stronger than before!',
  },
  'Harden': {
    use: 'The creature\'s hide shifts and thickens, taking on an almost metallic sheen!',
    hit: 'Scales lock together, skin becomes stone-like, the creature\'s defense skyrockets!',
    miss: 'The hardening process fails, leaving the creature vulnerable!',
    crit: 'The creature\'s body becomes nearly impenetrable, like living armor!',
  },
  // Reactive
  'Counter': {
    use: 'The creature reads your attack and moves to intercept with deadly precision!',
    hit: 'Your own momentum is used against you as the counter-strike lands!',
    miss: 'You pull back just in time, avoiding the counter!',
    crit: 'The perfect counter turns your attack into your own undoing!',
  },
  'Retaliate': {
    use: 'Pain only makes the creature angrier as it lashes out in immediate retaliation!',
    hit: 'The retaliatory strike catches you before you can recover from your own attack!',
    miss: 'You manage to block the retaliatory strike!',
    crit: 'The retaliation is savage and immediate, punishing you for daring to attack!',
  },
  'Thorns': {
    use: 'Razor-sharp spines erupt from the creature\'s body, punishing any who dare strike it!',
    hit: 'Your attack lands, but the thorns tear into you in return!',
    miss: 'You strike carefully, avoiding the worst of the thorns!',
    crit: 'The thorns impale you deeply, the creature\'s defense becoming your doom!',
  },
  // Signature
  'Apocalypse': {
    use: 'Reality itself seems to crack as the creature channels power beyond mortal comprehension!',
    hit: 'The apocalyptic force tears through you, body and soul alike screaming in agony!',
    miss: 'By some miracle, you survive the apocalyptic onslaught!',
    crit: 'The full force of the apocalypse is unleashed, devastation beyond measure!',
  },
  'Hellfire': {
    use: 'Flames from the deepest pits of hell erupt around the creature, burning with unholy intensity!',
    hit: 'Hellfire consumes you, burning not just flesh but the very essence of your being!',
    miss: 'You escape the hellfire, though its heat still sears your skin!',
    crit: 'The hellfire burns eternal, leaving wounds that may never truly heal!',
  },
  'Judgment': {
    use: 'The creature rises up, becoming an avatar of divine wrath as it prepares to pass judgment!',
    hit: 'You are found wanting, and the judgment is swift and merciless!',
    miss: 'Somehow, you are spared from the creature\'s terrible judgment!',
    crit: 'The judgment is absolute, your very existence weighed and found unworthy!',
  },
}

// Generate narrative based on skill name and damage type
function generateNarratives(skillName: string, damageType: string, category: CategoryType): { use: string; hit: string; miss: string; crit: string } {
  // Check if we have specific narratives for this skill
  if (SKILL_ACTIONS[skillName]) {
    return SKILL_ACTIONS[skillName]
  }

  // Generate dynamic narratives based on skill name and damage type
  const flavor = DAMAGE_FLAVOR[damageType] || DAMAGE_FLAVOR.physical
  const skillLower = skillName.toLowerCase()

  // Category-specific narrative templates
  const templates: Record<CategoryType, { use: string[]; hit: string[]; miss: string[]; crit: string[] }> = {
    melee: {
      use: [
        `The creature coils its muscles and unleashes ${skillName} with ${flavor.adjective} fury!`,
        `With a guttural snarl, the beast executes ${skillName}, ${flavor.noun} radiating from the strike!`,
        `The monster's ${skillName} comes without warning, a blur of ${flavor.adjective} violence!`,
        `Primal instinct drives the creature's ${skillName}, each movement promising death!`,
      ],
      hit: [
        `${skillName} connects! The ${flavor.adjective} impact ${flavor.verb} through your defenses as ${flavor.effect}!`,
        `The ${skillName} lands true, and ${flavor.effect}!`,
        `You feel the full force of ${skillName} as ${flavor.noun} tears through you!`,
        `The devastating ${skillName} finds its mark, ${flavor.effect}!`,
      ],
      miss: [
        `You twist away from ${skillName}, the ${flavor.adjective} attack grazing past!`,
        `The ${skillName} whistles through empty air as you desperately evade!`,
        `Instinct saves you as ${skillName} misses by a hair's breadth!`,
        `You dodge ${skillName}, feeling the displaced air of the near-miss!`,
      ],
      crit: [
        `${skillName} strikes with perfect precision! ${flavor.effect.charAt(0).toUpperCase() + flavor.effect.slice(1)} as the critical blow lands!`,
        `A devastating ${skillName}! The ${flavor.adjective} strike finds a vital point!`,
        `Critical ${skillName}! The attack ${flavor.verb} through you with terrible efficiency!`,
        `The ${skillName} hits exactly where it hurts most, ${flavor.effect}!`,
      ],
    },
    ranged: {
      use: [
        `The creature takes aim and launches ${skillName}, ${flavor.adjective} energy streaking toward you!`,
        `${skillName} erupts from the beast, a projectile of pure ${flavor.noun}!`,
        `With deadly accuracy, the monster unleashes ${skillName}!`,
        `The air crackles as ${skillName} is fired, trailing ${flavor.adjective} energy!`,
      ],
      hit: [
        `${skillName} strikes home! The ${flavor.adjective} projectile ${flavor.verb} on impact as ${flavor.effect}!`,
        `The ${skillName} hits dead center, ${flavor.effect}!`,
        `You're struck by ${skillName}, the ${flavor.noun} searing through you!`,
        `${skillName} finds its mark from across the battlefield!`,
      ],
      miss: [
        `${skillName} screams past you, the ${flavor.adjective} projectile missing by inches!`,
        `You dive aside as ${skillName} impacts where you stood!`,
        `The ${skillName} goes wide, its ${flavor.noun} dissipating harmlessly!`,
        `Quick reflexes save you from ${skillName}!`,
      ],
      crit: [
        `${skillName} pierces straight through! The ${flavor.adjective} shot ${flavor.verb} everything in its path!`,
        `Critical hit! ${skillName} strikes a vital point, ${flavor.effect}!`,
        `The ${skillName} hits with devastating precision, ${flavor.effect}!`,
        `A perfect shot! ${skillName} deals catastrophic damage!`,
      ],
    },
    aoe: {
      use: [
        `The creature raises its power and ${skillName} erupts across the battlefield, ${flavor.adjective} ${flavor.noun} spreading in all directions!`,
        `Reality warps as ${skillName} manifests, a cataclysm of ${flavor.adjective} destruction!`,
        `The air itself screams as ${skillName} is unleashed, ${flavor.noun} consuming everything!`,
        `${skillName} explodes outward from the creature, an unstoppable wave of ${flavor.adjective} devastation!`,
      ],
      hit: [
        `${skillName} engulfs you! The ${flavor.adjective} ${flavor.noun} ${flavor.verb} through everything as ${flavor.effect}!`,
        `There's no escape from ${skillName}! ${flavor.effect.charAt(0).toUpperCase() + flavor.effect.slice(1)}!`,
        `The ${skillName} washes over you, ${flavor.effect}!`,
        `You're caught in the heart of ${skillName}, ${flavor.noun} tearing at you from all sides!`,
      ],
      miss: [
        `You find a gap in ${skillName}, the ${flavor.adjective} destruction passing around you!`,
        `By some miracle, ${skillName} fails to catch you in its radius!`,
        `You escape the worst of ${skillName}, though ${flavor.noun} still singes you!`,
        `The ${skillName} dissipates before reaching full power!`,
      ],
      crit: [
        `${skillName} reaches apocalyptic intensity! The ${flavor.adjective} ${flavor.noun} ${flavor.verb} everything, ${flavor.effect}!`,
        `Critical ${skillName}! The devastation is absolute, ${flavor.effect}!`,
        `The ${skillName} amplifies beyond control, ${flavor.effect} as destruction reigns!`,
        `Maximum power ${skillName}! Nothing survives the ${flavor.adjective} cataclysm!`,
      ],
    },
    self: {
      use: [
        `The creature focuses inward, ${skillName} causing its body to surge with ${flavor.adjective} ${flavor.noun}!`,
        `${skillName} activates! The beast's form shimmers with newfound power!`,
        `The monster channels ${skillName}, ${flavor.noun} flowing through its being!`,
        `With a primal roar, the creature triggers ${skillName}!`,
      ],
      hit: [
        `${skillName} takes hold! The creature's power swells as ${flavor.effect}!`,
        `The ${skillName} succeeds, ${flavor.adjective} energy coursing through the beast!`,
        `${skillName} empowers the creature, its presence becoming more terrifying!`,
        `The monster grows stronger as ${skillName} completes!`,
      ],
      miss: [
        `${skillName} fizzles, the ${flavor.noun} failing to take hold!`,
        `The ${skillName} sputters and dies, leaving the creature unchanged!`,
        `Something disrupts ${skillName}, the power dissipating uselessly!`,
        `${skillName} fails to activate properly!`,
      ],
      crit: [
        `${skillName} achieves maximum effect! The creature becomes a avatar of ${flavor.adjective} power!`,
        `Critical ${skillName}! The beast's strength multiplies exponentially!`,
        `The ${skillName} exceeds all limits, ${flavor.effect}!`,
        `Perfect ${skillName}! The creature transcends its former power!`,
      ],
    },
    reactive: {
      use: [
        `The creature's ${skillName} triggers instantly, responding to your aggression with ${flavor.adjective} precision!`,
        `${skillName} activates! The beast retaliates with supernatural speed!`,
        `Your attack triggers ${skillName}, the creature's response immediate and deadly!`,
        `The monster's ${skillName} catches you off-guard, punishment for your assault!`,
      ],
      hit: [
        `${skillName} connects! The ${flavor.adjective} retaliation ${flavor.verb} through you as ${flavor.effect}!`,
        `The ${skillName} lands before you can react, ${flavor.effect}!`,
        `Your own momentum works against you as ${skillName} strikes!`,
        `${skillName} punishes your aggression, ${flavor.effect}!`,
      ],
      miss: [
        `You manage to block ${skillName}, the ${flavor.adjective} counter failing to land!`,
        `The ${skillName} misses as you recover faster than expected!`,
        `You evade ${skillName}, denying the creature its retaliation!`,
        `${skillName} fails to connect, the counter-attack going wide!`,
      ],
      crit: [
        `${skillName} devastates you! The perfect counter ${flavor.verb} through your defenses, ${flavor.effect}!`,
        `Critical ${skillName}! The retaliation is absolute, ${flavor.effect}!`,
        `The ${skillName} finds a fatal opening, ${flavor.effect}!`,
        `Your attack becomes your undoing as ${skillName} critically strikes!`,
      ],
    },
    signature: {
      use: [
        `The creature's eyes blaze as it channels its ultimate technique: ${skillName}! The very air trembles with ${flavor.adjective} power!`,
        `${skillName} is unleashed! This is the creature's true power, ${flavor.noun} incarnate!`,
        `Reality bends as ${skillName} manifests, a technique of legendary devastation!`,
        `The beast reveals its trump card: ${skillName}! ${flavor.adjective.charAt(0).toUpperCase() + flavor.adjective.slice(1)} ${flavor.noun} erupts in all directions!`,
      ],
      hit: [
        `${skillName} strikes with the force of a god! ${flavor.effect.charAt(0).toUpperCase() + flavor.effect.slice(1)} as the ultimate attack ${flavor.verb} through everything!`,
        `The full might of ${skillName} crashes into you! ${flavor.effect.charAt(0).toUpperCase() + flavor.effect.slice(1)}!`,
        `There is no defense against ${skillName}! The ${flavor.adjective} devastation is absolute, ${flavor.effect}!`,
        `${skillName} finds its mark! The legendary technique ${flavor.verb} through you, ${flavor.effect}!`,
      ],
      miss: [
        `Against all odds, you survive ${skillName}! The ${flavor.adjective} attack barely misses!`,
        `${skillName} fails to connect! The creature roars in frustration!`,
        `You somehow evade ${skillName}, though the near-miss leaves you shaken!`,
        `The ultimate ${skillName} misses! Fortune smiles upon you this day!`,
      ],
      crit: [
        `${skillName} achieves PERFECT execution! The ${flavor.adjective} ${flavor.noun} ${flavor.verb} through reality itself, ${flavor.effect}!`,
        `CRITICAL ${skillName}! This is power beyond mortal comprehension, ${flavor.effect}!`,
        `The ultimate ${skillName} strikes with maximum force! ${flavor.effect.charAt(0).toUpperCase() + flavor.effect.slice(1)}, the devastation absolute!`,
        `${skillName} transcends its limits! The ${flavor.adjective} apocalypse ${flavor.verb} everything, ${flavor.effect}!`,
      ],
    },
  }

  const categoryTemplates = templates[category]
  return {
    use: categoryTemplates.use[Math.floor(Math.random() * categoryTemplates.use.length)],
    hit: categoryTemplates.hit[Math.floor(Math.random() * categoryTemplates.hit.length)],
    miss: categoryTemplates.miss[Math.floor(Math.random() * categoryTemplates.miss.length)],
    crit: categoryTemplates.crit[Math.floor(Math.random() * categoryTemplates.crit.length)],
  }
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

  // Generate skill-specific narratives based on name and damage type
  const narratives = generateNarratives(name, isSelfCategory ? 'none' : damageType, category)

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
    narrativeUse: narratives.use,
    narrativeHit: narratives.hit,
    narrativeMiss: narratives.miss,
    narrativeCrit: narratives.crit,
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
