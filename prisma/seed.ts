import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import { WEAPON_STATS } from '../src/data/weapon-config'
import { SKILL_TYPE_CATEGORIES } from '../src/data/universal-skills-data'

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
// Derived from WEAPON_STATS in weapon-config.ts
const weaponCategories = Object.values(WEAPON_STATS).map(stat => {
  const isTwoHanded = stat.hands === '2H'
  const isMagic = ['Staff', 'Wand', 'Tome'].includes(stat.name)
  const isRanged = ['Bow', 'Crossbow', 'Gun'].includes(stat.name)
  
  // Secondary stats based on versatile/specifics
  let secondaryStat: string | null = null
  if (stat.stat.includes('/')) {
    const parts = stat.stat.split('/')
    secondaryStat = parts[1]
  } else if (stat.name === 'Gun') {
    secondaryStat = 'INT'
  } else if (stat.name === 'Fist') {
    secondaryStat = 'AGI'
  }

  return {
    name: stat.name,
    description: `${stat.hands} ${isMagic ? 'Magic' : isRanged ? 'Ranged' : 'Melee'} weapon. Passive: ${stat.passiveDescription}`,
    primaryStat: stat.stat.split('/')[0],
    secondaryStat,
    isRanged,
    isTwoHanded,
    isMagic
  }
})

// ============================================
// BASIC WEAPONS DATA
// ============================================
const BASE_DAMAGE_UNIT = 8 // Standard base damage for level 1 weapons

function calcDamage(categoryName: string): number {
  const key = Object.keys(WEAPON_STATS).find(k => WEAPON_STATS[k].name === categoryName)
  if (!key) return 5
  return Math.round(BASE_DAMAGE_UNIT * WEAPON_STATS[key].baseDamage)
}

const basicWeapons = [
  { name: 'Wooden Sword', description: 'A basic training sword made of wood.', category: 'Sword', baseDamage: calcDamage('Sword'), attackSpeed: 1.0, weight: 2, strRequired: 0, dexRequired: 0, intRequired: 0 },
  { name: 'Rusty Greatsword', description: 'An old greatsword covered in rust.', category: 'Greatsword', baseDamage: calcDamage('Greatsword'), attackSpeed: 0.7, weight: 6, strRequired: 5, dexRequired: 0, intRequired: 0 },
  { name: 'Bamboo Katana', description: 'A practice katana made of bamboo.', category: 'Katana', baseDamage: calcDamage('Katana'), attackSpeed: 1.2, weight: 2, strRequired: 0, dexRequired: 3, intRequired: 0 },
  { name: 'Rusty Dagger', description: 'A small rusty dagger.', category: 'Dagger', baseDamage: calcDamage('Dagger'), attackSpeed: 1.5, weight: 1, strRequired: 0, dexRequired: 0, intRequired: 0 },
  { name: 'Woodcutter\'s Axe', description: 'An axe meant for chopping wood.', category: 'Axe', baseDamage: calcDamage('Axe'), attackSpeed: 0.9, weight: 3, strRequired: 3, dexRequired: 0, intRequired: 0 },
  { name: 'Crude Greataxe', description: 'A roughly made large axe.', category: 'Greataxe', baseDamage: calcDamage('Greataxe'), attackSpeed: 0.6, weight: 8, strRequired: 8, dexRequired: 0, intRequired: 0 },
  { name: 'Wooden Club', description: 'A simple wooden club.', category: 'Mace', baseDamage: calcDamage('Mace'), attackSpeed: 0.9, weight: 3, strRequired: 2, dexRequired: 0, intRequired: 0 },
  { name: 'Stone Hammer', description: 'A heavy hammer with a stone head.', category: 'Greathammer', baseDamage: calcDamage('Greathammer'), attackSpeed: 0.5, weight: 10, strRequired: 10, dexRequired: 0, intRequired: 0 },
  { name: 'Wooden Spear', description: 'A basic spear with a wooden tip.', category: 'Spear', baseDamage: calcDamage('Spear'), attackSpeed: 1.0, weight: 3, strRequired: 0, dexRequired: 0, intRequired: 0 },
  { name: 'Cloth Wraps', description: 'Simple cloth wraps for hand protection.', category: 'Fist', baseDamage: calcDamage('Fist'), attackSpeed: 1.8, weight: 0, strRequired: 0, dexRequired: 0, intRequired: 0 },
  { name: 'Shortbow', description: 'A small bow for beginners.', category: 'Bow', baseDamage: calcDamage('Bow'), attackSpeed: 1.0, weight: 2, strRequired: 0, dexRequired: 2, intRequired: 0, range: 10 },
  { name: 'Light Crossbow', description: 'A lightweight crossbow.', category: 'Crossbow', baseDamage: calcDamage('Crossbow'), attackSpeed: 0.7, weight: 4, strRequired: 0, dexRequired: 4, intRequired: 0, range: 12 },
  { name: 'Flintlock Pistol', description: 'An old-fashioned pistol.', category: 'Gun', baseDamage: calcDamage('Gun'), attackSpeed: 0.5, weight: 3, strRequired: 0, dexRequired: 5, intRequired: 3, range: 8 },
  { name: 'Wooden Staff', description: 'A simple wooden staff for magic.', category: 'Staff', baseDamage: calcDamage('Staff'), attackSpeed: 0.8, weight: 3, strRequired: 0, dexRequired: 0, intRequired: 3 },
  { name: 'Apprentice Wand', description: 'A basic wand for apprentice mages.', category: 'Wand', baseDamage: calcDamage('Wand'), attackSpeed: 1.2, weight: 1, strRequired: 0, dexRequired: 0, intRequired: 2 },
  { name: 'Worn Spellbook', description: 'An old spellbook with faded pages.', category: 'Tome', baseDamage: calcDamage('Tome'), attackSpeed: 1.0, weight: 2, strRequired: 0, dexRequired: 0, intRequired: 5 },
  { name: 'Wooden Buckler', description: 'A small wooden shield.', category: 'Shield', baseDamage: calcDamage('Shield'), attackSpeed: 1.0, weight: 3, strRequired: 0, dexRequired: 0, intRequired: 0, vitRequired: 2 },
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
  // SEED SKILLS (FROM UNIVERSAL DATA V2)
  // ============================================
  console.log('📦 Seeding skills from Universal Data V2...')
  let skillCount = 0

  for (const category of SKILL_TYPE_CATEGORIES) {
    for (const starter of category.skills) {
      const skillId = `skill-${starter.name.toLowerCase().replace(/\s+/g, '-')}`

      await prisma.skill.upsert({
        where: { id: skillId },
        update: {
          name: starter.name,
          description: starter.description,
          skillType: category.name,
          damageType: starter.damageType,
          weaponRequirement: starter.weaponRequirement,
          ampPercent: starter.ampPercent,
          apCost: starter.apCost,
          cooldown: starter.cooldown,
          range: starter.range,
          hasUtilityMode: starter.hasUtilityMode || false,
          utilityEffect: starter.utilityEffect || null,
          utilityDuration: starter.utilityDuration || null,
          isCounter: starter.isCounter || false,
          triggerCondition: starter.triggerCondition || null,
          buffType: starter.buffType || null,
          buffDuration: starter.buffDuration || null,
          debuffType: starter.debuffType || null,
          debuffDuration: starter.debuffDuration || null,
          debuffChance: starter.debuffChance || null,
          hitCount: starter.hitCount || 1,
          lifestealPercent: starter.lifestealPercent || null,
          armorPierce: starter.armorPierce || null,
          bonusVsGuard: starter.bonusVsGuard || null,
          bonusVsDebuffed: starter.bonusVsDebuffed || null,
          executionDescription: starter.executionDescription || null,
          starterSkillName: starter.name,
          stage: 0,
          variantType: 'base',
          isSaved: true,
          // Reset legacy fields if they exist in DB but not in schema (handled by schema default)
        },
        create: {
          id: skillId,
          name: starter.name,
          description: starter.description,
          skillType: category.name,
          damageType: starter.damageType,
          weaponRequirement: starter.weaponRequirement,
          ampPercent: starter.ampPercent,
          apCost: starter.apCost,
          cooldown: starter.cooldown,
          range: starter.range,
          hasUtilityMode: starter.hasUtilityMode || false,
          utilityEffect: starter.utilityEffect || null,
          utilityDuration: starter.utilityDuration || null,
          isCounter: starter.isCounter || false,
          triggerCondition: starter.triggerCondition || null,
          buffType: starter.buffType || null,
          buffDuration: starter.buffDuration || null,
          debuffType: starter.debuffType || null,
          debuffDuration: starter.debuffDuration || null,
          debuffChance: starter.debuffChance || null,
          hitCount: starter.hitCount || 1,
          lifestealPercent: starter.lifestealPercent || null,
          armorPierce: starter.armorPierce || null,
          bonusVsGuard: starter.bonusVsGuard || null,
          bonusVsDebuffed: starter.bonusVsDebuffed || null,
          executionDescription: starter.executionDescription || null,
          starterSkillName: starter.name,
          stage: 0,
          variantType: 'base',
          isSaved: true,
        },
      })
      skillCount++
    }
  }
  console.log(`✅ Seeded ${skillCount} skills from Universal Data`)

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
  console.log(`   - ${universalSkills.length + 0} skills (${universalSkills.length} universal + ${0} weapon)`)
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
