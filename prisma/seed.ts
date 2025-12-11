import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ============================================
// RACE DATA
// ============================================
const races = [
  {
    name: 'Human',
    description: 'Balanced and adaptable, humans excel at learning and cooking.',
    passive1Name: 'Quick Learner',
    passive1Type: 'expGain',
    passive1Value: 5,
    passive2Name: 'Culinary Talent',
    passive2Type: 'cookingSuccess',
    passive2Value: 5,
  },
  {
    name: 'Elf',
    description: 'Ancient magical beings with natural affinity for arcane arts.',
    passive1Name: 'Arcane Affinity',
    passive1Type: 'magicAmp',
    passive1Value: 5,
    passive2Name: 'Keen Eye',
    passive2Type: 'accuracy',
    passive2Value: 3,
  },
  {
    name: 'Half-Elf',
    description: 'Human-Elf hybrids known for their charm and alchemical skills.',
    passive1Name: 'Silver Tongue',
    passive1Type: 'npcDiscount',
    passive1Value: 5,
    passive2Name: 'Potion Mastery',
    passive2Type: 'alchemySuccess',
    passive2Value: 5,
  },
  {
    name: 'Dwarf',
    description: 'Master craftsmen with incredible strength and endurance.',
    passive1Name: 'Master Craftsman',
    passive1Type: 'craftingSuccess',
    passive1Value: 5,
    passive2Name: 'Sturdy Build',
    passive2Type: 'weightCapacity',
    passive2Value: 5,
  },
  {
    name: 'Orc',
    description: 'Powerful warriors with unmatched physical prowess.',
    passive1Name: 'Brutal Strength',
    passive1Type: 'physicalDamage',
    passive1Value: 5,
    passive2Name: 'Thick Skin',
    passive2Type: 'maxHp',
    passive2Value: 3,
  },
  {
    name: 'Wildblood',
    description: 'Beast-like mammals (wolf, cat, fox) with heightened reflexes.',
    passive1Name: 'Animal Instinct',
    passive1Type: 'evasion',
    passive1Value: 5,
    passive2Name: 'Predator Focus',
    passive2Type: 'critChance',
    passive2Value: 3,
  },
  {
    name: 'Hyliondrian',
    description: 'Aquatic beastkin (fish, shark) blessed with fortune.',
    passive1Name: 'Ocean\'s Blessing',
    passive1Type: 'dropRate',
    passive1Value: 5,
    passive2Name: 'Tidal Resilience',
    passive2Type: 'debuffResist',
    passive2Value: 3,
  },
  {
    name: 'Sylvan',
    description: 'Fairy-like nature spirits with deadly precision.',
    passive1Name: 'Nature\'s Wrath',
    passive1Type: 'critDamage',
    passive1Value: 5,
    passive2Name: 'Fey Swiftness',
    passive2Type: 'cdr',
    passive2Value: 3,
  },
]

// ============================================
// WEAPON CATEGORY DATA
// ============================================
const weaponCategories = [
  { name: 'Sword', description: 'Balanced melee weapon, versatile in combat.', primaryStat: 'STR', secondaryStat: null, isRanged: false, isTwoHanded: false, isMagic: false },
  { name: 'Greatsword', description: 'Heavy two-handed sword with devastating power.', primaryStat: 'STR', secondaryStat: null, isRanged: false, isTwoHanded: true, isMagic: false },
  { name: 'Katana', description: 'Fast slashing weapon requiring precision.', primaryStat: 'STR', secondaryStat: 'DEX', isRanged: false, isTwoHanded: false, isMagic: false },
  { name: 'Dagger', description: 'Quick weapon focused on critical strikes.', primaryStat: 'DEX', secondaryStat: null, isRanged: false, isTwoHanded: false, isMagic: false },
  { name: 'Axe', description: 'High damage weapon that can break armor.', primaryStat: 'STR', secondaryStat: null, isRanged: false, isTwoHanded: false, isMagic: false },
  { name: 'Greataxe', description: 'Massive two-handed axe for crushing blows.', primaryStat: 'STR', secondaryStat: null, isRanged: false, isTwoHanded: true, isMagic: false },
  { name: 'Mace', description: 'Blunt weapon with chance to stun enemies.', primaryStat: 'STR', secondaryStat: null, isRanged: false, isTwoHanded: false, isMagic: false },
  { name: 'Hammer', description: 'Heavy two-handed blunt weapon.', primaryStat: 'STR', secondaryStat: null, isRanged: false, isTwoHanded: true, isMagic: false },
  { name: 'Spear', description: 'Long reach weapon for thrust attacks.', primaryStat: 'STR', secondaryStat: 'DEX', isRanged: false, isTwoHanded: false, isMagic: false },
  { name: 'Fist', description: 'Unarmed combat and knuckle weapons.', primaryStat: 'STR', secondaryStat: 'AGI', isRanged: false, isTwoHanded: false, isMagic: false },
  { name: 'Bow', description: 'Standard ranged weapon with charged shots.', primaryStat: 'DEX', secondaryStat: null, isRanged: true, isTwoHanded: true, isMagic: false },
  { name: 'Crossbow', description: 'High damage ranged weapon, slower reload.', primaryStat: 'DEX', secondaryStat: null, isRanged: true, isTwoHanded: true, isMagic: false },
  { name: 'Gun', description: 'Tech ranged weapon using ammunition.', primaryStat: 'DEX', secondaryStat: 'INT', isRanged: true, isTwoHanded: false, isMagic: false },
  { name: 'Staff', description: 'Two-handed magic weapon with high amplification.', primaryStat: 'INT', secondaryStat: null, isRanged: false, isTwoHanded: true, isMagic: true },
  { name: 'Wand', description: 'One-handed magic weapon for faster casting.', primaryStat: 'INT', secondaryStat: null, isRanged: false, isTwoHanded: false, isMagic: true },
  { name: 'Tome', description: 'Off-hand magic item that boosts spells.', primaryStat: 'INT', secondaryStat: null, isRanged: false, isTwoHanded: false, isMagic: true },
  { name: 'Shield', description: 'Defensive off-hand equipment for blocking.', primaryStat: 'VIT', secondaryStat: null, isRanged: false, isTwoHanded: false, isMagic: false },
]

// ============================================
// BASIC WEAPONS DATA
// ============================================
const basicWeapons = [
  { name: 'Wooden Sword', description: 'A basic training sword made of wood.', category: 'Sword', baseDamage: 5, attackSpeed: 1.0, weight: 2, strRequired: 0, dexRequired: 0, intRequired: 0 },
  { name: 'Rusty Greatsword', description: 'An old greatsword covered in rust.', category: 'Greatsword', baseDamage: 10, attackSpeed: 0.7, weight: 6, strRequired: 5, dexRequired: 0, intRequired: 0 },
  { name: 'Bamboo Katana', description: 'A practice katana made of bamboo.', category: 'Katana', baseDamage: 6, attackSpeed: 1.2, weight: 2, strRequired: 0, dexRequired: 3, intRequired: 0 },
  { name: 'Rusty Dagger', description: 'A small rusty dagger.', category: 'Dagger', baseDamage: 3, attackSpeed: 1.5, weight: 1, strRequired: 0, dexRequired: 0, intRequired: 0 },
  { name: 'Woodcutter\'s Axe', description: 'An axe meant for chopping wood.', category: 'Axe', baseDamage: 7, attackSpeed: 0.9, weight: 3, strRequired: 3, dexRequired: 0, intRequired: 0 },
  { name: 'Crude Greataxe', description: 'A roughly made large axe.', category: 'Greataxe', baseDamage: 12, attackSpeed: 0.6, weight: 8, strRequired: 8, dexRequired: 0, intRequired: 0 },
  { name: 'Wooden Club', description: 'A simple wooden club.', category: 'Mace', baseDamage: 6, attackSpeed: 0.9, weight: 3, strRequired: 2, dexRequired: 0, intRequired: 0 },
  { name: 'Stone Hammer', description: 'A heavy hammer with a stone head.', category: 'Hammer', baseDamage: 14, attackSpeed: 0.5, weight: 10, strRequired: 10, dexRequired: 0, intRequired: 0 },
  { name: 'Wooden Spear', description: 'A basic spear with a wooden tip.', category: 'Spear', baseDamage: 5, attackSpeed: 1.0, weight: 3, strRequired: 0, dexRequired: 0, intRequired: 0 },
  { name: 'Cloth Wraps', description: 'Simple cloth wraps for hand protection.', category: 'Fist', baseDamage: 2, attackSpeed: 1.8, weight: 0, strRequired: 0, dexRequired: 0, intRequired: 0 },
  { name: 'Shortbow', description: 'A small bow for beginners.', category: 'Bow', baseDamage: 4, attackSpeed: 1.0, weight: 2, strRequired: 0, dexRequired: 2, intRequired: 0, range: 10 },
  { name: 'Light Crossbow', description: 'A lightweight crossbow.', category: 'Crossbow', baseDamage: 6, attackSpeed: 0.7, weight: 4, strRequired: 0, dexRequired: 4, intRequired: 0, range: 12 },
  { name: 'Flintlock Pistol', description: 'An old-fashioned pistol.', category: 'Gun', baseDamage: 8, attackSpeed: 0.5, weight: 3, strRequired: 0, dexRequired: 5, intRequired: 3, range: 8 },
  { name: 'Wooden Staff', description: 'A simple wooden staff for magic.', category: 'Staff', baseDamage: 4, attackSpeed: 0.8, weight: 3, strRequired: 0, dexRequired: 0, intRequired: 3 },
  { name: 'Apprentice Wand', description: 'A basic wand for apprentice mages.', category: 'Wand', baseDamage: 3, attackSpeed: 1.2, weight: 1, strRequired: 0, dexRequired: 0, intRequired: 2 },
  { name: 'Worn Spellbook', description: 'An old spellbook with faded pages.', category: 'Tome', baseDamage: 2, attackSpeed: 1.0, weight: 2, strRequired: 0, dexRequired: 0, intRequired: 5 },
  { name: 'Wooden Buckler', description: 'A small wooden shield.', category: 'Shield', baseDamage: 0, attackSpeed: 1.0, weight: 3, strRequired: 0, dexRequired: 0, intRequired: 0, vitRequired: 2 },
]

// ============================================
// UNIVERSAL SKILLS DATA (No weapon required)
// ============================================
const universalSkills = [
  { name: 'Dash', description: 'Quick burst of speed forward.', skillType: 'Movement', baseDamage: 0, cooldown: 5, apCost: 5 },
  { name: 'Dodge', description: 'Evade incoming attack with brief invincibility.', skillType: 'Defensive', baseDamage: 0, cooldown: 8, apCost: 8 },
  { name: 'Guard', description: 'Reduce incoming damage without a shield.', skillType: 'Defensive', baseDamage: 0, cooldown: 3, apCost: 5 },
  { name: 'Kick', description: 'Basic melee attack that can interrupt enemies.', skillType: 'Attack', baseDamage: 5, cooldown: 2, apCost: 3, effectType: 'stun', effectChance: 10, effectDuration: 1 },
  { name: 'Taunt', description: 'Force enemy to target you.', skillType: 'Utility', baseDamage: 0, cooldown: 15, apCost: 10 },
  { name: 'Detect', description: 'Reveal hidden enemies and traps nearby.', skillType: 'Utility', baseDamage: 0, cooldown: 20, apCost: 10 },
  { name: 'Sprint', description: 'Increased movement speed for duration.', skillType: 'Movement', baseDamage: 0, cooldown: 30, apCost: 15 },
  { name: 'Rest', description: 'Sit to recover HP faster (out of combat).', skillType: 'Recovery', baseDamage: 0, cooldown: 60, apCost: 0 },
  { name: 'Jump', description: 'Leap into air, avoid ground attacks.', skillType: 'Movement', baseDamage: 0, cooldown: 3, apCost: 3 },
  { name: 'Counter', description: 'Parry and strike back on perfect timing.', skillType: 'Defensive', baseDamage: 15, cooldown: 10, apCost: 10, damageScaling: 0.5, scalingStat: 'STR' },
]

// ============================================
// WEAPON SKILLS DATA (5 per category)
// ============================================
const weaponSkills = {
  'Sword': [
    { name: 'Slash', description: 'Basic horizontal cut.', skillType: 'Attack', baseDamage: 10, cooldown: 1, apCost: 3, damageScaling: 1.0, scalingStat: 'STR' },
    { name: 'Thrust', description: 'Forward stab with higher crit chance.', skillType: 'Attack', baseDamage: 12, cooldown: 2, apCost: 5, damageScaling: 1.1, scalingStat: 'STR', critBonus: 10 },
    { name: 'Parry', description: 'Deflect incoming melee attack.', skillType: 'Defensive', baseDamage: 0, cooldown: 5, apCost: 5 },
    { name: 'Whirlwind', description: 'Spin attack hitting all nearby enemies.', skillType: 'Attack', baseDamage: 15, cooldown: 8, apCost: 12, damageScaling: 0.8, scalingStat: 'STR', isAoE: true, aoeRadius: 2 },
    { name: 'Blade Rush', description: 'Dash forward with slashing combo.', skillType: 'Attack', baseDamage: 20, cooldown: 10, apCost: 15, damageScaling: 1.2, scalingStat: 'STR' },
  ],
  'Greatsword': [
    { name: 'Heavy Slash', description: 'Slow but powerful overhead swing.', skillType: 'Attack', baseDamage: 20, cooldown: 3, apCost: 8, damageScaling: 1.5, scalingStat: 'STR' },
    { name: 'Cleave', description: 'Wide arc hitting multiple enemies.', skillType: 'Attack', baseDamage: 18, cooldown: 4, apCost: 10, damageScaling: 1.2, scalingStat: 'STR', isAoE: true, aoeRadius: 2.5 },
    { name: 'Ground Slam', description: 'Slam blade into ground for AoE damage.', skillType: 'Attack', baseDamage: 25, cooldown: 10, apCost: 15, damageScaling: 1.3, scalingStat: 'STR', isAoE: true, aoeRadius: 3, effectType: 'stun', effectChance: 20, effectDuration: 1.5 },
    { name: 'Charge Slash', description: 'Charged attack with higher damage.', skillType: 'Attack', baseDamage: 30, cooldown: 8, apCost: 12, damageScaling: 1.8, scalingStat: 'STR' },
    { name: 'Iron Will', description: 'Reduce stagger and increase poise.', skillType: 'Buff', baseDamage: 0, cooldown: 30, apCost: 20 },
  ],
  'Katana': [
    { name: 'Quick Draw', description: 'Fast slash from sheath.', skillType: 'Attack', baseDamage: 12, cooldown: 2, apCost: 5, damageScaling: 1.1, scalingStat: 'DEX' },
    { name: 'Rising Slash', description: 'Upward cut that can launch enemies.', skillType: 'Attack', baseDamage: 14, cooldown: 4, apCost: 8, damageScaling: 1.0, scalingStat: 'STR', effectType: 'knockback', effectChance: 30 },
    { name: 'Shadow Step', description: 'Dash behind enemy.', skillType: 'Movement', baseDamage: 0, cooldown: 8, apCost: 10 },
    { name: 'Crescent Moon', description: 'Wide arc slash.', skillType: 'Attack', baseDamage: 16, cooldown: 5, apCost: 10, damageScaling: 1.2, scalingStat: 'STR', isAoE: true, aoeRadius: 2 },
    { name: 'Blade Flurry', description: 'Rapid multi-hit combo.', skillType: 'Attack', baseDamage: 25, cooldown: 12, apCost: 18, damageScaling: 1.5, scalingStat: 'DEX' },
  ],
  'Dagger': [
    { name: 'Stab', description: 'Quick thrust with high crit.', skillType: 'Attack', baseDamage: 6, cooldown: 1, apCost: 2, damageScaling: 0.8, scalingStat: 'DEX', critBonus: 15 },
    { name: 'Backstab', description: 'Bonus damage from behind.', skillType: 'Attack', baseDamage: 20, cooldown: 5, apCost: 8, damageScaling: 1.5, scalingStat: 'DEX' },
    { name: 'Poison Coat', description: 'Add poison to weapon temporarily.', skillType: 'Buff', baseDamage: 0, cooldown: 30, apCost: 15, effectType: 'poison', effectDuration: 10, effectValue: 3 },
    { name: 'Fan of Knives', description: 'Throw multiple daggers in arc.', skillType: 'Attack', baseDamage: 12, cooldown: 8, apCost: 12, damageScaling: 0.6, scalingStat: 'DEX', isAoE: true, aoeRadius: 3, range: 5 },
    { name: 'Vanish', description: 'Brief invisibility.', skillType: 'Utility', baseDamage: 0, cooldown: 45, apCost: 20 },
  ],
  'Axe': [
    { name: 'Chop', description: 'Downward strike.', skillType: 'Attack', baseDamage: 12, cooldown: 2, apCost: 5, damageScaling: 1.1, scalingStat: 'STR' },
    { name: 'Rend', description: 'Cause bleeding damage over time.', skillType: 'Attack', baseDamage: 10, cooldown: 6, apCost: 8, damageScaling: 0.9, scalingStat: 'STR', effectType: 'bleed', effectChance: 50, effectDuration: 5, effectValue: 4 },
    { name: 'Axe Throw', description: 'Throw axe at range.', skillType: 'Attack', baseDamage: 15, cooldown: 8, apCost: 10, damageScaling: 1.0, scalingStat: 'STR', range: 6 },
    { name: 'Savage Strike', description: 'Powerful hit that ignores some armor.', skillType: 'Attack', baseDamage: 18, cooldown: 6, apCost: 12, damageScaling: 1.3, scalingStat: 'STR' },
    { name: 'Frenzy', description: 'Increase attack speed, lower defense.', skillType: 'Buff', baseDamage: 0, cooldown: 45, apCost: 15 },
  ],
  'Greataxe': [
    { name: 'Executioner', description: 'Massive overhead chop.', skillType: 'Attack', baseDamage: 25, cooldown: 4, apCost: 10, damageScaling: 1.6, scalingStat: 'STR' },
    { name: 'Sweeping Blow', description: 'Wide horizontal swing.', skillType: 'Attack', baseDamage: 22, cooldown: 5, apCost: 12, damageScaling: 1.3, scalingStat: 'STR', isAoE: true, aoeRadius: 2.5 },
    { name: 'Earthquake', description: 'Ground slam with AoE stagger.', skillType: 'Attack', baseDamage: 28, cooldown: 12, apCost: 18, damageScaling: 1.4, scalingStat: 'STR', isAoE: true, aoeRadius: 4, effectType: 'stun', effectChance: 30, effectDuration: 2 },
    { name: 'Rampage', description: 'Each hit increases damage.', skillType: 'Buff', baseDamage: 0, cooldown: 60, apCost: 20 },
    { name: 'Decapitate', description: 'High damage to low HP enemies.', skillType: 'Attack', baseDamage: 35, cooldown: 15, apCost: 20, damageScaling: 2.0, scalingStat: 'STR' },
  ],
  'Mace': [
    { name: 'Bash', description: 'Blunt strike with chance to stun.', skillType: 'Attack', baseDamage: 10, cooldown: 2, apCost: 5, damageScaling: 1.0, scalingStat: 'STR', effectType: 'stun', effectChance: 15, effectDuration: 1 },
    { name: 'Skull Crack', description: 'Head hit that reduces enemy accuracy.', skillType: 'Attack', baseDamage: 12, cooldown: 5, apCost: 8, damageScaling: 1.1, scalingStat: 'STR' },
    { name: 'Holy Strike', description: 'Bonus damage to undead.', skillType: 'Attack', baseDamage: 15, cooldown: 4, apCost: 8, damageScaling: 1.2, scalingStat: 'STR' },
    { name: 'Shatter Armor', description: 'Reduce enemy defense.', skillType: 'Debuff', baseDamage: 8, cooldown: 10, apCost: 12, damageScaling: 0.8, scalingStat: 'STR' },
    { name: 'Concussion', description: 'Heavy hit with chance to daze.', skillType: 'Attack', baseDamage: 18, cooldown: 8, apCost: 12, damageScaling: 1.3, scalingStat: 'STR', effectType: 'stun', effectChance: 25, effectDuration: 2 },
  ],
  'Hammer': [
    { name: 'Smash', description: 'Powerful downward blow.', skillType: 'Attack', baseDamage: 18, cooldown: 3, apCost: 8, damageScaling: 1.4, scalingStat: 'STR' },
    { name: 'Shockwave', description: 'Ground pound with AoE damage.', skillType: 'Attack', baseDamage: 20, cooldown: 8, apCost: 12, damageScaling: 1.2, scalingStat: 'STR', isAoE: true, aoeRadius: 3 },
    { name: 'Crushing Blow', description: 'Ignore armor.', skillType: 'Attack', baseDamage: 22, cooldown: 6, apCost: 10, damageScaling: 1.5, scalingStat: 'STR' },
    { name: 'Stagger', description: 'Knockback enemy.', skillType: 'Attack', baseDamage: 15, cooldown: 5, apCost: 8, damageScaling: 1.1, scalingStat: 'STR', effectType: 'knockback', effectChance: 60 },
    { name: 'Meteor Strike', description: 'Jump and slam down.', skillType: 'Attack', baseDamage: 30, cooldown: 15, apCost: 20, damageScaling: 1.8, scalingStat: 'STR', isAoE: true, aoeRadius: 3.5 },
  ],
  'Spear': [
    { name: 'Pierce', description: 'Long range thrust.', skillType: 'Attack', baseDamage: 10, cooldown: 2, apCost: 4, damageScaling: 1.0, scalingStat: 'STR', range: 2 },
    { name: 'Sweep', description: 'Low sweep that can trip enemies.', skillType: 'Attack', baseDamage: 8, cooldown: 4, apCost: 6, damageScaling: 0.8, scalingStat: 'DEX', effectType: 'stun', effectChance: 20, effectDuration: 1 },
    { name: 'Impale', description: 'Deep thrust with bonus damage.', skillType: 'Attack', baseDamage: 16, cooldown: 5, apCost: 10, damageScaling: 1.3, scalingStat: 'STR' },
    { name: 'Javelin Throw', description: 'Throw spear at range.', skillType: 'Attack', baseDamage: 14, cooldown: 8, apCost: 10, damageScaling: 1.1, scalingStat: 'DEX', range: 8 },
    { name: 'Phalanx', description: 'Defensive stance reducing frontal damage.', skillType: 'Defensive', baseDamage: 0, cooldown: 20, apCost: 15 },
  ],
  'Fist': [
    { name: 'Jab', description: 'Quick punch.', skillType: 'Attack', baseDamage: 5, cooldown: 0.5, apCost: 2, damageScaling: 0.6, scalingStat: 'STR' },
    { name: 'Uppercut', description: 'Rising punch that can stun.', skillType: 'Attack', baseDamage: 12, cooldown: 4, apCost: 6, damageScaling: 1.0, scalingStat: 'STR', effectType: 'stun', effectChance: 20, effectDuration: 1 },
    { name: 'Combo Strike', description: 'Chain of rapid punches.', skillType: 'Attack', baseDamage: 18, cooldown: 6, apCost: 10, damageScaling: 1.2, scalingStat: 'AGI' },
    { name: 'Palm Strike', description: 'Push enemy back.', skillType: 'Attack', baseDamage: 10, cooldown: 3, apCost: 5, damageScaling: 0.8, scalingStat: 'STR', effectType: 'knockback', effectChance: 50 },
    { name: 'Iron Fist', description: 'Increase unarmed damage.', skillType: 'Buff', baseDamage: 0, cooldown: 45, apCost: 15 },
  ],
  'Bow': [
    { name: 'Aimed Shot', description: 'Charged shot with higher damage.', skillType: 'Attack', baseDamage: 15, cooldown: 3, apCost: 6, damageScaling: 1.3, scalingStat: 'DEX', range: 12 },
    { name: 'Quick Shot', description: 'Fast shot with lower damage.', skillType: 'Attack', baseDamage: 8, cooldown: 1, apCost: 3, damageScaling: 0.8, scalingStat: 'DEX', range: 10 },
    { name: 'Rain of Arrows', description: 'AoE arrow barrage.', skillType: 'Attack', baseDamage: 20, cooldown: 15, apCost: 18, damageScaling: 1.0, scalingStat: 'DEX', isAoE: true, aoeRadius: 4, range: 10 },
    { name: 'Piercing Arrow', description: 'Penetrates multiple enemies.', skillType: 'Attack', baseDamage: 12, cooldown: 6, apCost: 8, damageScaling: 1.1, scalingStat: 'DEX', range: 15 },
    { name: 'Hunter\'s Mark', description: 'Mark target for increased damage.', skillType: 'Debuff', baseDamage: 0, cooldown: 20, apCost: 10, range: 12 },
  ],
  'Crossbow': [
    { name: 'Bolt Shot', description: 'Standard crossbow attack.', skillType: 'Attack', baseDamage: 12, cooldown: 2, apCost: 5, damageScaling: 1.0, scalingStat: 'DEX', range: 12 },
    { name: 'Heavy Bolt', description: 'Slow, high damage shot.', skillType: 'Attack', baseDamage: 20, cooldown: 5, apCost: 10, damageScaling: 1.5, scalingStat: 'DEX', range: 14 },
    { name: 'Explosive Bolt', description: 'AoE explosion on impact.', skillType: 'Attack', baseDamage: 18, cooldown: 10, apCost: 15, damageScaling: 1.2, scalingStat: 'DEX', isAoE: true, aoeRadius: 2.5, range: 10 },
    { name: 'Rapid Fire', description: 'Multiple quick shots.', skillType: 'Attack', baseDamage: 24, cooldown: 8, apCost: 12, damageScaling: 1.0, scalingStat: 'DEX', range: 10 },
    { name: 'Snipe', description: 'Long range high crit shot.', skillType: 'Attack', baseDamage: 25, cooldown: 12, apCost: 15, damageScaling: 1.4, scalingStat: 'DEX', range: 20, critBonus: 25 },
  ],
  'Gun': [
    { name: 'Shoot', description: 'Basic gunshot.', skillType: 'Attack', baseDamage: 10, cooldown: 1.5, apCost: 4, damageScaling: 1.0, scalingStat: 'DEX', range: 10 },
    { name: 'Headshot', description: 'Aimed shot with high crit.', skillType: 'Attack', baseDamage: 18, cooldown: 5, apCost: 10, damageScaling: 1.3, scalingStat: 'DEX', range: 12, critBonus: 30 },
    { name: 'Scatter Shot', description: 'Shotgun blast, close range AoE.', skillType: 'Attack', baseDamage: 22, cooldown: 6, apCost: 12, damageScaling: 1.2, scalingStat: 'DEX', isAoE: true, aoeRadius: 2, range: 4 },
    { name: 'Burst Fire', description: '3-round burst.', skillType: 'Attack', baseDamage: 20, cooldown: 4, apCost: 10, damageScaling: 1.1, scalingStat: 'DEX', range: 8 },
    { name: 'Reload', description: 'Quick reload, next shot enhanced.', skillType: 'Buff', baseDamage: 0, cooldown: 10, apCost: 5 },
  ],
  'Staff': [
    { name: 'Magic Bolt', description: 'Basic magic projectile.', skillType: 'Attack', baseDamage: 10, cooldown: 1.5, apCost: 4, damageScaling: 1.0, scalingStat: 'INT', range: 8 },
    { name: 'Fireball', description: 'Fire damage with AoE.', skillType: 'Attack', baseDamage: 20, cooldown: 6, apCost: 12, damageScaling: 1.3, scalingStat: 'INT', isAoE: true, aoeRadius: 2.5, range: 10, effectType: 'burn', effectChance: 30, effectDuration: 3, effectValue: 5 },
    { name: 'Ice Spike', description: 'Ice damage with chance to slow.', skillType: 'Attack', baseDamage: 15, cooldown: 4, apCost: 8, damageScaling: 1.1, scalingStat: 'INT', range: 10, effectType: 'slow', effectChance: 40, effectDuration: 3, effectValue: 30 },
    { name: 'Lightning', description: 'Electric damage, chains to nearby.', skillType: 'Attack', baseDamage: 18, cooldown: 5, apCost: 10, damageScaling: 1.2, scalingStat: 'INT', range: 8 },
    { name: 'Arcane Shield', description: 'Magic barrier absorbs damage.', skillType: 'Defensive', baseDamage: 0, cooldown: 30, apCost: 20 },
  ],
  'Wand': [
    { name: 'Spark', description: 'Quick magic shot.', skillType: 'Attack', baseDamage: 6, cooldown: 1, apCost: 3, damageScaling: 0.8, scalingStat: 'INT', range: 8 },
    { name: 'Heal', description: 'Restore HP to self or ally.', skillType: 'Recovery', baseDamage: 0, cooldown: 8, apCost: 15, damageScaling: 1.0, scalingStat: 'INT', range: 6 },
    { name: 'Barrier', description: 'Shield that blocks damage.', skillType: 'Defensive', baseDamage: 0, cooldown: 20, apCost: 15, range: 6 },
    { name: 'Dispel', description: 'Remove buffs from enemy.', skillType: 'Debuff', baseDamage: 0, cooldown: 15, apCost: 10, range: 8 },
    { name: 'Enchant', description: 'Add magic damage to weapon.', skillType: 'Buff', baseDamage: 0, cooldown: 45, apCost: 20 },
  ],
  'Tome': [
    { name: 'Curse', description: 'Reduce enemy stats.', skillType: 'Debuff', baseDamage: 0, cooldown: 12, apCost: 12, range: 8 },
    { name: 'Summon Familiar', description: 'Call small creature to assist.', skillType: 'Utility', baseDamage: 0, cooldown: 60, apCost: 25 },
    { name: 'Life Drain', description: 'Damage enemy, heal self.', skillType: 'Attack', baseDamage: 12, cooldown: 8, apCost: 15, damageScaling: 1.0, scalingStat: 'INT', range: 6 },
    { name: 'Silence', description: 'Prevent enemy from using skills.', skillType: 'Debuff', baseDamage: 0, cooldown: 20, apCost: 15, range: 8, effectType: 'stun', effectChance: 100, effectDuration: 3 },
    { name: 'Resurrection', description: 'Revive fallen ally.', skillType: 'Recovery', baseDamage: 0, cooldown: 120, apCost: 50, range: 4 },
  ],
  'Shield': [
    { name: 'Block', description: 'Reduce incoming damage.', skillType: 'Defensive', baseDamage: 0, cooldown: 2, apCost: 3 },
    { name: 'Shield Bash', description: 'Hit with shield, stun chance.', skillType: 'Attack', baseDamage: 8, cooldown: 4, apCost: 6, damageScaling: 0.5, scalingStat: 'VIT', effectType: 'stun', effectChance: 25, effectDuration: 1.5 },
    { name: 'Reflect', description: 'Return portion of damage.', skillType: 'Defensive', baseDamage: 0, cooldown: 15, apCost: 12 },
    { name: 'Cover', description: 'Protect ally, take damage for them.', skillType: 'Utility', baseDamage: 0, cooldown: 20, apCost: 15, range: 3 },
    { name: 'Fortress', description: 'Greatly increase defense, cannot move.', skillType: 'Buff', baseDamage: 0, cooldown: 45, apCost: 20 },
  ],
}

// ============================================
// LOCATION DATA
// ============================================
const locations = [
  { name: 'Town of Beginnings', description: 'The starting town on Floor 1. A safe haven for adventurers.', floor: 1, isSafeZone: true },
]

async function main() {
  console.log('🌱 Starting seed...')

  // ============================================
  // SEED RACES
  // ============================================
  console.log('📦 Seeding races...')
  for (const race of races) {
    await prisma.race.upsert({
      where: { name: race.name },
      update: race,
      create: race,
    })
  }
  console.log(`✅ Seeded ${races.length} races`)

  // ============================================
  // SEED WEAPON CATEGORIES
  // ============================================
  console.log('📦 Seeding weapon categories...')
  const categoryMap: Record<string, string> = {}
  for (const category of weaponCategories) {
    const created = await prisma.weaponCategory.upsert({
      where: { name: category.name },
      update: category,
      create: category,
    })
    categoryMap[category.name] = created.id
  }
  console.log(`✅ Seeded ${weaponCategories.length} weapon categories`)

  // ============================================
  // SEED BASIC WEAPONS
  // ============================================
  console.log('📦 Seeding basic weapons...')
  for (const weapon of basicWeapons) {
    const categoryId = categoryMap[weapon.category]
    await prisma.weapon.upsert({
      where: { id: `${weapon.category.toLowerCase()}-${weapon.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {
        name: weapon.name,
        description: weapon.description,
        categoryId,
        baseDamage: weapon.baseDamage,
        attackSpeed: weapon.attackSpeed,
        weight: weapon.weight,
        strRequired: weapon.strRequired || 0,
        dexRequired: weapon.dexRequired || 0,
        intRequired: weapon.intRequired || 0,
        vitRequired: (weapon as any).vitRequired || 0,
        range: (weapon as any).range || 1,
        isBasic: true,
        buyPrice: 0,
        sellPrice: 0,
      },
      create: {
        id: `${weapon.category.toLowerCase()}-${weapon.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: weapon.name,
        description: weapon.description,
        categoryId,
        baseDamage: weapon.baseDamage,
        attackSpeed: weapon.attackSpeed,
        weight: weapon.weight,
        strRequired: weapon.strRequired || 0,
        dexRequired: weapon.dexRequired || 0,
        intRequired: weapon.intRequired || 0,
        vitRequired: (weapon as any).vitRequired || 0,
        range: (weapon as any).range || 1,
        isBasic: true,
        buyPrice: 0,
        sellPrice: 0,
      },
    })
  }
  console.log(`✅ Seeded ${basicWeapons.length} basic weapons`)

  // ============================================
  // SEED UNIVERSAL SKILLS
  // ============================================
  console.log('📦 Seeding universal skills...')
  for (const skill of universalSkills) {
    await prisma.skill.upsert({
      where: { id: `universal-${skill.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {
        name: skill.name,
        description: skill.description,
        categoryId: null,
        skillType: skill.skillType,
        baseDamage: skill.baseDamage,
        cooldown: skill.cooldown,
        apCost: skill.apCost,
        damageScaling: (skill as any).damageScaling || 0,
        scalingStat: (skill as any).scalingStat || null,
        effectType: (skill as any).effectType || null,
        effectChance: (skill as any).effectChance || 0,
        effectDuration: (skill as any).effectDuration || 0,
        effectValue: (skill as any).effectValue || 0,
        isBasic: true,
      },
      create: {
        id: `universal-${skill.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: skill.name,
        description: skill.description,
        categoryId: null,
        skillType: skill.skillType,
        baseDamage: skill.baseDamage,
        cooldown: skill.cooldown,
        apCost: skill.apCost,
        damageScaling: (skill as any).damageScaling || 0,
        scalingStat: (skill as any).scalingStat || null,
        effectType: (skill as any).effectType || null,
        effectChance: (skill as any).effectChance || 0,
        effectDuration: (skill as any).effectDuration || 0,
        effectValue: (skill as any).effectValue || 0,
        isBasic: true,
      },
    })
  }
  console.log(`✅ Seeded ${universalSkills.length} universal skills`)

  // ============================================
  // SEED WEAPON SKILLS
  // ============================================
  console.log('📦 Seeding weapon skills...')
  let weaponSkillCount = 0
  for (const [categoryName, skills] of Object.entries(weaponSkills)) {
    const categoryId = categoryMap[categoryName]
    for (const skill of skills) {
      await prisma.skill.upsert({
        where: { id: `${categoryName.toLowerCase()}-${skill.name.toLowerCase().replace(/\s+/g, '-')}` },
        update: {
          name: skill.name,
          description: skill.description,
          categoryId,
          skillType: skill.skillType,
          baseDamage: skill.baseDamage,
          cooldown: skill.cooldown,
          apCost: skill.apCost,
          damageScaling: (skill as any).damageScaling || 0,
          scalingStat: (skill as any).scalingStat || null,
          range: (skill as any).range || 1,
          isAoE: (skill as any).isAoE || false,
          aoeRadius: (skill as any).aoeRadius || 0,
          effectType: (skill as any).effectType || null,
          effectChance: (skill as any).effectChance || 0,
          effectDuration: (skill as any).effectDuration || 0,
          effectValue: (skill as any).effectValue || 0,
          isBasic: true,
        },
        create: {
          id: `${categoryName.toLowerCase()}-${skill.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: skill.name,
          description: skill.description,
          categoryId,
          skillType: skill.skillType,
          baseDamage: skill.baseDamage,
          cooldown: skill.cooldown,
          apCost: skill.apCost,
          damageScaling: (skill as any).damageScaling || 0,
          scalingStat: (skill as any).scalingStat || null,
          range: (skill as any).range || 1,
          isAoE: (skill as any).isAoE || false,
          aoeRadius: (skill as any).aoeRadius || 0,
          effectType: (skill as any).effectType || null,
          effectChance: (skill as any).effectChance || 0,
          effectDuration: (skill as any).effectDuration || 0,
          effectValue: (skill as any).effectValue || 0,
          isBasic: true,
        },
      })
      weaponSkillCount++
    }
  }
  console.log(`✅ Seeded ${weaponSkillCount} weapon skills`)

  // ============================================
  // SEED LOCATIONS
  // ============================================
  console.log('📦 Seeding locations...')
  let townId: string | null = null
  for (const location of locations) {
    const created = await prisma.location.upsert({
      where: { id: `floor${location.floor}-${location.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: location,
      create: {
        id: `floor${location.floor}-${location.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...location,
      },
    })
    if (location.name === 'Town of Beginnings') {
      townId = created.id
    }
  }
  console.log(`✅ Seeded ${locations.length} locations`)

  // ============================================
  // SEED ADMIN USER
  // ============================================
  console.log('📦 Seeding admin user...')
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
    },
  })
  
  // Create player if doesn't exist (without race - needs character creation)
  await prisma.player.upsert({
    where: { userId: admin.id },
    update: {
      currentLocationId: townId,
      isInSafeZone: true,
    },
    create: {
      userId: admin.id,
      level: 1,
      exp: 0,
      col: 0,
      str: 0,
      agi: 0,
      vit: 0,
      int: 0,
      dex: 0,
      luk: 0,
      statPoints: 25,
      currentHp: 100,
      currentAp: 100,
      maxAp: 100,
      currentLocationId: townId,
      isInSafeZone: true,
    },
  })
  console.log('✅ Admin user seeded')

  console.log('')
  console.log('🎉 Seed completed!')
  console.log(`   - ${races.length} races`)
  console.log(`   - ${weaponCategories.length} weapon categories`)
  console.log(`   - ${basicWeapons.length} basic weapons`)
  console.log(`   - ${universalSkills.length + weaponSkillCount} skills (${universalSkills.length} universal + ${weaponSkillCount} weapon)`)
  console.log(`   - ${locations.length} locations`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
