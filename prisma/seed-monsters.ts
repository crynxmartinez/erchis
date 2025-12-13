import { prisma } from '../src/lib/prisma'

async function seedMonsters() {
  console.log('🐉 Seeding monsters...')

  // Floor 1 - Beginner Area Monsters
  const floor1Monsters = [
    {
      name: 'Wild Boar',
      description: 'A common boar found in the grasslands. Aggressive when provoked.',
      floorId: 1,
      areaId: 'verdant_plains',
      level: 1,
      maxHp: 50,
      attack: 8,
      magicAttack: 0,
      defense: 5,
      magicDefense: 2,
      accuracy: 70,
      evasion: 5,
      speed: 40,
      xpReward: 15,
      xpVariance: 3,
      colReward: 10,
      colVariance: 5,
      attackPatterns: [['skill1'], ['skill1', 'skill2']],
      skills: [
        {
          name: 'Charge',
          description: 'Rushes forward with tusks lowered',
          damageType: 'physical',
          baseDamage: 12,
          accuracy: 75,
          speed: 45,
          narrativeUse: 'The Wild Boar lowers its head and charges!',
          narrativeHit: 'Its tusks gore you for {damage} damage!',
          narrativeMiss: 'You sidestep the charging boar!',
          narrativeCrit: 'A devastating charge! Critical hit for {damage} damage!',
        },
        {
          name: 'Headbutt',
          description: 'A quick headbutt attack',
          damageType: 'physical',
          baseDamage: 8,
          accuracy: 85,
          speed: 55,
          narrativeUse: 'The Wild Boar swings its massive head!',
          narrativeHit: 'The headbutt connects for {damage} damage!',
          narrativeMiss: 'You duck under the headbutt!',
        },
      ],
    },
    {
      name: 'Forest Wolf',
      description: 'A cunning predator that hunts in packs.',
      floorId: 1,
      areaId: 'verdant_plains',
      level: 2,
      maxHp: 40,
      attack: 12,
      magicAttack: 0,
      defense: 3,
      magicDefense: 2,
      accuracy: 80,
      evasion: 15,
      speed: 60,
      xpReward: 20,
      xpVariance: 4,
      colReward: 12,
      colVariance: 4,
      attackPatterns: [['skill1', 'skill2'], ['skill2', 'skill1']],
      skills: [
        {
          name: 'Bite',
          description: 'A quick biting attack',
          damageType: 'physical',
          baseDamage: 10,
          accuracy: 85,
          speed: 65,
          narrativeUse: 'The Forest Wolf lunges with snapping jaws!',
          narrativeHit: 'Its fangs sink into your flesh for {damage} damage!',
          narrativeMiss: 'You pull back just in time!',
          narrativeCrit: 'A vicious bite tears into you for {damage} critical damage!',
        },
        {
          name: 'Claw Swipe',
          description: 'Slashes with sharp claws',
          damageType: 'physical',
          baseDamage: 8,
          accuracy: 80,
          speed: 70,
          appliesDebuff: 'bleed',
          debuffChance: 20,
          debuffDuration: 3,
          debuffValue: 3,
          narrativeUse: 'The wolf swipes with razor-sharp claws!',
          narrativeHit: 'Claws rake across you for {damage} damage!',
          narrativeMiss: 'The claws whistle past harmlessly!',
        },
      ],
    },
    {
      name: 'Goblin Scout',
      description: 'A small, cunning creature armed with a rusty dagger.',
      floorId: 1,
      areaId: 'goblin_camp',
      level: 3,
      maxHp: 35,
      attack: 10,
      magicAttack: 0,
      defense: 4,
      magicDefense: 3,
      accuracy: 75,
      evasion: 20,
      speed: 55,
      xpReward: 25,
      xpVariance: 5,
      colReward: 18,
      colVariance: 6,
      attackPatterns: [['skill1'], ['skill1', 'skill2'], ['skill2']],
      skills: [
        {
          name: 'Stab',
          description: 'A quick dagger thrust',
          damageType: 'physical',
          baseDamage: 9,
          accuracy: 80,
          speed: 60,
          narrativeUse: 'The Goblin Scout thrusts its rusty dagger!',
          narrativeHit: 'The blade pierces you for {damage} damage!',
          narrativeMiss: 'You parry the clumsy thrust!',
        },
        {
          name: 'Dirty Trick',
          description: 'Throws dirt in your eyes',
          damageType: 'physical',
          baseDamage: 3,
          accuracy: 90,
          speed: 75,
          appliesDebuff: 'blind',
          debuffChance: 40,
          debuffDuration: 2,
          debuffValue: 20,
          narrativeUse: 'The goblin scoops up dirt and flings it at your face!',
          narrativeHit: 'Grit stings your eyes! {damage} damage!',
          narrativeMiss: 'You shield your eyes in time!',
        },
      ],
    },
    {
      name: 'Giant Spider',
      description: 'A massive arachnid with venomous fangs.',
      floorId: 1,
      areaId: 'dark_hollow',
      level: 4,
      maxHp: 55,
      attack: 14,
      magicAttack: 0,
      defense: 6,
      magicDefense: 4,
      accuracy: 75,
      evasion: 10,
      speed: 50,
      xpReward: 35,
      xpVariance: 7,
      colReward: 25,
      colVariance: 8,
      attackPatterns: [['skill1', 'skill2'], ['skill2', 'skill1']],
      skills: [
        {
          name: 'Venomous Bite',
          description: 'Bites with poison-dripping fangs',
          damageType: 'physical',
          baseDamage: 12,
          accuracy: 75,
          speed: 45,
          appliesDebuff: 'poison',
          debuffChance: 35,
          debuffDuration: 4,
          debuffValue: 2,
          narrativeUse: 'The Giant Spider lunges with dripping fangs!',
          narrativeHit: 'Venomous fangs pierce you for {damage} damage!',
          narrativeMiss: 'You leap back from the snapping mandibles!',
          narrativeCrit: 'Fangs sink deep! {damage} critical damage and venom courses through you!',
        },
        {
          name: 'Web Shot',
          description: 'Shoots sticky webbing',
          damageType: 'physical',
          baseDamage: 5,
          accuracy: 85,
          speed: 60,
          appliesDebuff: 'slow',
          debuffChance: 50,
          debuffDuration: 2,
          debuffValue: 2,
          narrativeUse: 'The spider spits a glob of sticky webbing!',
          narrativeHit: 'Web entangles you! {damage} damage!',
          narrativeMiss: 'You dodge the sticky projectile!',
        },
      ],
    },
    {
      name: 'Kobold Warrior',
      description: 'A small but fierce reptilian warrior.',
      floorId: 1,
      areaId: 'kobold_caves',
      level: 5,
      maxHp: 65,
      attack: 16,
      magicAttack: 0,
      defense: 8,
      magicDefense: 5,
      accuracy: 78,
      evasion: 12,
      speed: 52,
      xpReward: 45,
      xpVariance: 9,
      colReward: 35,
      colVariance: 10,
      attackPatterns: [['skill1', 'skill2'], ['skill1'], ['skill2', 'skill1']],
      skills: [
        {
          name: 'Spear Thrust',
          description: 'A powerful spear attack',
          damageType: 'physical',
          baseDamage: 15,
          accuracy: 80,
          speed: 50,
          narrativeUse: 'The Kobold Warrior thrusts its crude spear!',
          narrativeHit: 'The spear pierces you for {damage} damage!',
          narrativeMiss: 'You deflect the spear thrust!',
          narrativeCrit: 'A devastating thrust! {damage} critical damage!',
        },
        {
          name: 'Shield Bash',
          description: 'Slams with a wooden shield',
          damageType: 'physical',
          baseDamage: 8,
          accuracy: 85,
          speed: 55,
          appliesDebuff: 'stun',
          debuffChance: 15,
          debuffDuration: 1,
          debuffValue: 0,
          narrativeUse: 'The kobold swings its shield!',
          narrativeHit: 'The shield slams into you for {damage} damage!',
          narrativeMiss: 'You sidestep the clumsy bash!',
        },
      ],
    },
  ]

  for (const monsterData of floor1Monsters) {
    const { skills, ...monster } = monsterData

    // Create monster
    const createdMonster = await prisma.monster.create({
      data: {
        ...monster,
        attackPatterns: monster.attackPatterns,
      },
    })

    // Create monster skills
    for (const skill of skills) {
      await prisma.monsterSkill.create({
        data: {
          monsterId: createdMonster.id,
          ...skill,
        },
      })
    }

    console.log(`  ✓ Created ${monster.name} with ${skills.length} skills`)
  }

  console.log('✅ Monster seeding complete!')
}

seedMonsters()
  .catch((e) => {
    console.error('Error seeding monsters:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
