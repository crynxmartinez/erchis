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
// EXECUTION DESCRIPTIONS (Narrative/Visual)
// ============================================

// TIER 1 (Stages 1-2): Simple execution descriptions
const SIMPLE_EXECUTIONS: Record<VariantType, string[]> = {
  power: [
    'You plant your feet and swing with all your might, putting your full weight behind the blow.',
    'Gripping your weapon tightly, you wind up and deliver a powerful overhead strike.',
    'You channel your strength into a single devastating swing aimed at your target.',
    'With a grunt of effort, you slam your weapon down with bone-crushing force.',
    'You rear back and unleash a mighty blow that sends shockwaves through your arms.'
  ],
  multihit: [
    'You strike twice in quick succession, your weapon a blur of motion.',
    'Your hands move rapidly as you deliver a quick one-two combination.',
    'You lash out with two swift strikes before your enemy can react.',
    'In a fluid motion, you slash once, then immediately follow through with a second cut.',
    'You step forward with a rapid double strike, each hit landing before the last registers.'
  ],
  aoe: [
    'You sweep your weapon in a wide arc, catching everything in front of you.',
    'Spinning on your heel, you slash in a circle around yourself.',
    'You swing broadly, your attack covering a wide area before you.',
    'With a sweeping motion, you strike at multiple targets simultaneously.',
    'You pivot and slash in an arc, your weapon cutting through the air in a fan pattern.'
  ],
  rapid: [
    'You dart forward with blinding speed, striking before your opponent can blink.',
    'In a flash, you close the distance and land a quick hit.',
    'Your weapon snaps out faster than the eye can follow.',
    'You move with surprising quickness, your attack landing in an instant.',
    'A blur of motion, and your strike connects before anyone realizes you moved.'
  ],
  efficiency: [
    'You execute a clean, economical strike with minimal wasted movement.',
    'Your attack flows naturally, requiring little effort but achieving much.',
    'With practiced ease, you deliver a precise strike using perfect form.',
    'You move smoothly, your attack an exercise in controlled efficiency.',
    'Every motion is deliberate and measured as you strike with calm precision.'
  ],
  dot: [
    'Your weapon leaves a festering wound that continues to burn.',
    'The strike lands, and you see poison seeping into the wound.',
    'Your attack leaves behind a lingering toxin that eats at flesh.',
    'The cut you inflict begins to fester immediately, spreading corruption.',
    'Venom drips from your weapon as it bites into your target.'
  ],
  control: [
    'Your strike lands on a nerve cluster, causing your target to seize up.',
    'The impact of your blow sends a stunning shock through your enemy.',
    'You hit a pressure point, momentarily freezing your opponent in place.',
    'Your attack disrupts your target\'s balance, leaving them staggered.',
    'The force of your strike locks up your enemy\'s muscles briefly.'
  ],
  sustain: [
    'As your weapon connects, you feel energy flowing back into you.',
    'The strike drains vitality from your target, restoring your own.',
    'Life force seeps from the wound you inflict, revitalizing you.',
    'You feel stronger as your attack siphons energy from your foe.',
    'Your weapon seems to drink in your enemy\'s essence with each hit.'
  ],
  defense: [
    'You strike while maintaining a defensive posture, ready to block.',
    'Your attack flows into a guard position, protecting you from counters.',
    'You lash out and immediately bring your weapon back to defend.',
    'The strike is cautious, allowing you to react to any retaliation.',
    'You attack with one hand while keeping your guard up with the other.'
  ],
  execute: [
    'Seeing your enemy weakened, you strike at a vital point.',
    'You aim for the kill, targeting your wounded opponent\'s weak spot.',
    'Your attack seeks out the vulnerable areas of your injured foe.',
    'You deliver a finishing blow aimed at ending the fight.',
    'With cold precision, you strike where it will hurt most.'
  ]
}

// TIER 2 (Stages 3-4): Medium complexity execution descriptions
const MEDIUM_EXECUTIONS: Record<VariantType, string[]> = {
  power: [
    'You gather tremendous force, your muscles coiling like springs before unleashing a devastating blow that cracks the air itself.',
    'With a primal roar, you bring your weapon crashing down with enough force to shatter stone.',
    'Energy surges through your limbs as you deliver a catastrophic strike that sends tremors through the ground.',
    'You channel raw fury into your weapon, the impact creating a shockwave that ripples outward.',
    'The air screams as your weapon descends with mountain-crushing force.'
  ],
  multihit: [
    'Your weapon becomes a storm of steel, striking from multiple angles in a dizzying display of martial prowess.',
    'You unleash a furious combination, each strike flowing seamlessly into the next like a deadly dance.',
    'Afterimages trail behind your blade as you deliver a barrage of lightning-fast attacks.',
    'Your assault is relentless, a cascade of blows that overwhelms your target\'s defenses.',
    'You move like the wind, your weapon singing through the air as it strikes again and again.'
  ],
  aoe: [
    'You release a devastating wave of force that expands outward, engulfing everything nearby.',
    'The ground trembles as your attack sends a shockwave rippling across the battlefield.',
    'Energy erupts from your strike, blossoming into a sphere of destruction.',
    'Your weapon carves through reality itself, the attack expanding into a dome of devastation.',
    'A pulse of power explodes from your strike, catching all nearby enemies in its wake.'
  ],
  rapid: [
    'You move faster than thought, appearing beside your target in the blink of an eye to deliver your strike.',
    'Lightning crackles in your wake as you dash forward with supernatural speed.',
    'The world seems to slow as you accelerate, your attack landing before time catches up.',
    'You become a blur of motion, crossing the distance in an instant to strike.',
    'Wind howls around you as you move with the speed of a thunderbolt.'
  ],
  efficiency: [
    'Your movements achieve a state of perfect harmony, each action flowing into the next with supernatural grace.',
    'You enter a meditative state, your attack becoming an expression of pure, refined technique.',
    'Every fiber of your being aligns as you execute a flawless strike born of countless hours of practice.',
    'Your weapon moves as an extension of your will, requiring no conscious thought.',
    'You achieve momentary enlightenment, your attack transcending mere physical motion.'
  ],
  dot: [
    'Dark energy coils around your weapon as it strikes, leaving behind a curse that eats at body and soul.',
    'The wound you inflict weeps with corruption, spreading decay through your enemy\'s veins.',
    'Plague-touched power infuses your attack, condemning your target to lingering agony.',
    'Your strike plants seeds of rot that blossom into festering corruption.',
    'Miasmic energy clings to your weapon, infecting everything it touches with wasting sickness.'
  ],
  control: [
    'Chains of ethereal energy burst from your strike, binding your target in place.',
    'Your attack sends paralyzing force through your enemy\'s body, locking their muscles rigid.',
    'Reality warps around your strike, trapping your foe in a prison of frozen time.',
    'The impact resonates through your target\'s nervous system, shutting down their ability to move.',
    'Arcane shackles manifest from your blow, anchoring your enemy to the spot.'
  ],
  sustain: [
    'Crimson energy flows from your target as your weapon drinks deep of their life force.',
    'Your attack tears away your enemy\'s vitality, channeling it directly into your own body.',
    'Spectral fangs seem to accompany your strike, draining essence with vampiric hunger.',
    'The wound you inflict becomes a conduit, siphoning strength from victim to victor.',
    'Your weapon pulses with stolen life as it feeds on your enemy\'s energy.'
  ],
  defense: [
    'You strike from behind an impenetrable guard, your defense and offense becoming one.',
    'Your attack creates a barrier of force that deflects incoming strikes.',
    'As you swing, protective energy wraps around you like armor made of light.',
    'Your weapon traces defensive patterns even as it attacks, warding off retaliation.',
    'You become an unassailable fortress, striking out while remaining perfectly protected.'
  ],
  execute: [
    'You read your wounded enemy\'s movements perfectly, striking the exact moment their guard falters.',
    'Death\'s shadow guides your weapon to the killing blow with unerring precision.',
    'You see the thread of your enemy\'s life and cut it with surgical accuracy.',
    'Your attack finds the weakness in your foe\'s failing defenses, ending them swiftly.',
    'With executioner\'s certainty, you deliver the final judgment upon your wounded prey.'
  ]
}

// TIER 3 (Stage 5): Epic execution descriptions
const EPIC_EXECUTIONS: Record<VariantType, string[]> = {
  power: [
    'You transcend mortal limits, channeling the fury of colliding stars into a single apocalyptic strike that tears reality asunder. The very fabric of existence screams as your weapon descends with the force of a dying sun.',
    'Summoning the strength of ancient titans, you unleash a blow so devastating that the world itself seems to shatter around the impact point. Nothing can withstand this absolute force.',
    'You become an avatar of destruction, your strike carrying the weight of mountains. The impact generates a cataclysmic shockwave that obliterates matter and spirit alike.',
    'With godlike power, you execute a strike that defies physics, hitting with infinite mass. The devastation left in your wake is absolute and total.',
    'You channel the primordial energy of creation\'s end into one final, world-ending smash. The target is not merely hit, but unmade.'
  ],
  multihit: [
    'You fracture time itself, existing in multiple moments simultaneously to strike your foe a thousand times in a single heartbeat. The air turns to plasma from the sheer friction of your onslaught.',
    'Your blade becomes a river of infinite steel, flowing around defenses like water. You are everywhere at once, a localized storm of cutting edges that leaves nothing uncut.',
    'You unleash a combo that transcends human capability, a perfect sequence of destruction that continues eternally until the target is reduced to dust.',
    'Moving faster than causality, you deliver an infinite cascade of blows. To the observer, your enemy simply disintegrates under the weight of a million unseen strikes.',
    'You perform the dance of the death god, a mesmerizing display of violence where every movement is a lethal cut. The sky darkens as your flurry blots out the sun.'
  ],
  aoe: [
    'You unleash a wave of force that ruptures the dimensional barrier, flooding the battlefield with chaotic energy. Everything within the horizon is consumed by the expanding sphere of annihilation.',
    'Striking the ground, you trigger a tectonic upheaval that reshapes the geography of the battlefield. Magma erupts and the earth splits as your power encompasses the entire region.',
    'You detonate your spiritual pressure in a supernova of power, vaporizing all opposition in a radius measured in miles. You stand alone in the center of a crater of glass.',
    'Your attack creates a singularity, a black hole of force that drags all enemies into oblivion. The very light is bent by the gravity of your devastating area strike.',
    'You summon a celestial storm, raining down destruction upon the entire battlefield. There is no escape, no shelter, only the purifying light of your total devastation.'
  ],
  rapid: [
    'You move so fast that you arrive at your destination before you left, violating the laws of physics. Your strike lands in the past, present, and future simultaneously.',
    'You become a being of pure light, traversing the battlefield instantaneously. Your attack is delivered at light speed, turning your weapon into a lance of pure photons.',
    'Stepping through the gaps between moments, you strike your enemy in the frozen time between heartbeats. To them, you were simply there, and they were already dead.',
    'You accelerate beyond the event horizon, moving with infinite velocity. The friction of your passage ignites the atmosphere as you deliver a strike of impossible speed.',
    'You transcend speed, becoming omnipresent. Your strike comes from everywhere at once, a unified assault from every possible angle in the same instant.'
  ],
  efficiency: [
    'You achieve the perfect state of "Mushin", acting without thought or hesitation. Your strike is the platonic ideal of an attack, flawless, unstoppable, and infinitely efficient.',
    'Your movement is the stillness of the universe, your strike the turning of the wheel. It requires no energy, yet carries infinite momentum. It is the inevitable end.',
    'You align your strike with the flow of destiny itself. You do not hit the target; you simply actualize the reality where the target has already been struck.',
    'With absolute minimal effort, you achieve absolute maximum effect. A simple flick of the wrist unleashes power equivalent to a falling star, perfectly focused.',
    'You perceive the flaw in all things and strike it with divine precision. The universe parts before your blade, offering no resistance to your perfect technique.'
  ],
  dot: [
    'You inflict a curse so vile it stains the target\'s soul, rotting them from the spiritual plane outwards. The corruption spreads through their lineage, a blight that never ends.',
    'Your weapon carries the essence of entropy, accelerating the target\'s decay by a billion years in a second. They crumble to dust as time itself ravages their physical form.',
    'You unleash a plague of biblical proportions, a living darkness that devours flesh, bone, and magic. It creates a zone of absolute death that lingers for eternity.',
    'Your strike injects a fractal poison that multiplies infinitely. Every cell in the target\'s body becomes a factory for more toxin, resulting in instant, total biological collapse.',
    'You brand the target with the mark of the Void. Their very existence begins to unravel, fading from reality like a bad dream as the nothingness consumes them.'
  ],
  control: [
    'You invoke the laws of stasis, freezing the target in absolute zero time. They are locked in a moment forever, conscious but unable to act, trapped in a statue of their own flesh.',
    'Your strike chains the target\'s soul to the bedrock of the world. The weight of the planet itself holds them down, making movement physically impossible.',
    'You shatter the target\'s will, imposing your own reality upon them. They are a puppet in your hands, unable to twitch a muscle without your express permission.',
    'You weave a cage of dimensional barriers around the foe. Space itself curves back on them, creating a prison from which there is no escape, only endless confinement.',
    'Your blow severs the connection between the target\'s mind and body. They are a passenger in their own form, screaming silently as their limbs refuse to obey.'
  ],
  sustain: [
    'You become a vortex of life, drinking the vitality of the world. Your strike consumes the target entirely, adding their years, strength, and memories to your own eternal existence.',
    'Your weapon becomes a bridge to the plane of blood. One hit, and the target\'s entire essence is vacuumed out, leaving a dry husk while you glow with the power of a thousand souls.',
    'You feast upon the concept of life itself. The target does not just die; their vitality is retroactively erased and added to your own, healing wounds you haven\'t even suffered yet.',
    'You strike with the hunger of a black hole. Light, magic, and life are all pulled into your weapon, empowering you with the stolen essence of the universe.',
    'You execute the ultimate exchange: their total existence for your eternal renewal. As they fade into nothingness, you are reborn, stronger and more vibrant than ever before.'
  ],
  defense: [
    'You become the Immovable Object, the anchor of reality. Your defense is absolute; infinite force crashes against you and breaks like water on rock. You are invincible.',
    'You manifest a shield of conceptual rejection. You simply deny the reality where you are harmed. Attacks cease to exist before they can touch you.',
    'Your guard is a fortress of divine light, impenetrable to any force in the cosmos. You stand unharmed in the center of armageddon, a bastion of eternal safety.',
    'You weave a defense from the fabric of space-time. Attacks are shunted into pocket dimensions or deflected into the past. Nothing can cross the event horizon of your guard.',
    'You achieve defensive transcendence. You are not blocking; you are simply untouchesble. The universe bends to accommodate your safety, warping attacks around you automatically.'
  ],
  execute: [
    'You deliver the stroke that ends the kalpa. It is not an attack; it is a decree of termination. The target\'s time is up, their thread cut by the shears of fate.',
    'You channel the inevitability of death. Your strike cannot be dodged, blocked, or endured. It is the final period at the end of the target\'s sentence.',
    'You see the singular point of shattering in the target\'s existence and strike it. They unmake instantly, their form collapsing into its component atoms.',
    'Your weapon becomes the scythe of the reaper. One swing, and the soul is severed from the body with surgical perfection. The body drops, but the soul is already gone.',
    'You execute the ultimate technique: The End of All Things. The target is erased from the past, present, and future. History rewrites itself to accommodate their absence.'
  ]
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateExecutionDescription(variantType: VariantType, stage: number): string {
  // Tiered execution descriptions
  if (stage <= 2) {
    return getRandomElement(SIMPLE_EXECUTIONS[variantType])
  } else if (stage <= 4) {
    return getRandomElement(MEDIUM_EXECUTIONS[variantType])
  } else {
    return getRandomElement(EPIC_EXECUTIONS[variantType])
  }
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
      const executionDescription = generateExecutionDescription(variantType, newStage)
      
      // Inheritance
      // Mobility variant might allow 'any' weapon if parent was strict
      let weaponRequirement = parentSkill.weaponRequirement
      // if (variantType === 'rapid' && weaponRequirement !== 'any') weaponRequirement = 'any' // Optional idea
      
      const child = await prisma.skill.create({
        data: {
          name,
          description,
          executionDescription,
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
