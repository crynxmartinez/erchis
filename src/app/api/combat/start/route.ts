import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { calculateMaxHp } from '@/lib/player'
import { CombatEntity } from '@/lib/combat/types'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { monsterId } = await request.json()

    if (!monsterId) {
      return NextResponse.json(
        { error: 'monsterId is required' },
        { status: 400 }
      )
    }

    // Get player with race and user
    const player = await prisma.player.findFirst({
      where: { userId },
      include: { race: true, user: true },
    })

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Check if player already has an active combat session
    const existingSession = await prisma.combatSession.findFirst({
      where: {
        playerId: player.id,
        status: 'active',
      },
    })

    if (existingSession) {
      return NextResponse.json(
        { error: 'Already in combat', sessionId: existingSession.id },
        { status: 400 }
      )
    }

    // Get monster by ID with skills
    const monster = await prisma.monster.findUnique({
      where: { id: monsterId },
      include: { 
        skills: {
          include: { monsterSkill: true }
        } 
      },
    })

    if (!monster) {
      return NextResponse.json({ error: 'Monster not found' }, { status: 404 })
    }

    // Calculate player's max HP
    const maxHp = calculateMaxHp(player.vit)

    // Create combat session
    const session = await prisma.combatSession.create({
      data: {
        playerId: player.id,
        monsterId: monster.id,
        playerHp: Math.min(player.currentHp, maxHp),
        playerAp: player.currentAp,
        monsterHp: monster.maxHp,
        turn: 1,
        status: 'active',
        playerQueue: [],
        enemyQueue: [],
        playerBuffs: [],
        playerDebuffs: [],
        monsterBuffs: [],
        monsterDebuffs: [],
        skillCooldowns: {},
      },
    })

    // Build player combat entity
    const playerEntity: CombatEntity = {
      id: player.id,
      name: player.user?.username || 'Player',
      isPlayer: true,
      currentHp: Math.min(player.currentHp, maxHp),
      maxHp,
      currentAp: player.currentAp,
      maxAp: player.maxAp,
      str: player.str,
      agi: player.agi,
      vit: player.vit,
      int: player.int,
      dex: player.dex,
      luk: player.luk,
      baseDamage: 10, // TODO: Get from equipped weapon
      defense: player.vit * 2,
      magicResist: player.int,
      accuracy: 70 + player.agi * 0.3,
      dodgeChance: 5 + player.agi * 0.5,
      critChance: 5 + player.dex * 0.3,
      critMultiplier: 1.5 + player.str * 0.01,
      speed: 50 + player.agi * 0.5,
      buffs: [],
      debuffs: [],
      position: { x: 0, y: 0 },
      equippedSkillIds: [],
      skillCooldowns: {},
    }

    // Build monster combat entity
    const monsterEntity: CombatEntity = {
      id: monster.id,
      name: monster.name,
      isPlayer: false,
      currentHp: monster.maxHp,
      maxHp: monster.maxHp,
      currentAp: 100,
      maxAp: 100,
      str: monster.attack,
      agi: monster.evasion,
      vit: monster.defense,
      int: monster.magicAttack,
      dex: 10,
      luk: 5,
      baseDamage: monster.attack,
      defense: monster.defense,
      magicResist: monster.magicDefense,
      accuracy: monster.accuracy,
      dodgeChance: monster.evasion,
      critChance: 5,
      critMultiplier: 1.5,
      speed: 50, // Default speed, actual speed comes from skills
      buffs: [],
      debuffs: [],
      position: { x: 5, y: 0 },
      equippedSkillIds: monster.skills.map((sa: { monsterSkillId: string }) => sa.monsterSkillId),
      skillCooldowns: {},
    }

    // Generate monster's first action queue
    let monsterQueue: { skillId: string; skillName: string }[] = []
    
    if (monster.skills.length > 0) {
      // Use first assigned skill
      const firstSkillAssignment = monster.skills[0]
      if (firstSkillAssignment.monsterSkill) {
        monsterQueue.push({
          skillId: firstSkillAssignment.monsterSkillId,
          skillName: firstSkillAssignment.monsterSkill.name,
        })
      }
    }

    // Update session with monster queue
    await prisma.combatSession.update({
      where: { id: session.id },
      data: { enemyQueue: monsterQueue },
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      turn: 1,
      player: {
        id: player.id,
        hp: playerEntity.currentHp,
        maxHp: playerEntity.maxHp,
        ap: playerEntity.currentAp,
        maxAp: playerEntity.maxAp,
      },
      monster: {
        id: monster.id,
        name: monster.name,
        hp: monster.maxHp,
        maxHp: monster.maxHp,
        imageUrl: monster.imageUrl,
        intent: monsterQueue.length > 0 ? monsterQueue[0].skillName : 'Attack',
      },
      monsterSkills: monster.skills.map((sa: { monsterSkillId: string; monsterSkill: { name: string; baseDamage: number } }) => ({
        id: sa.monsterSkillId,
        name: sa.monsterSkill.name,
        damage: sa.monsterSkill.baseDamage,
      })),
    })
  } catch (error) {
    console.error('Combat start error:', error)
    return NextResponse.json(
      { error: 'Failed to start combat' },
      { status: 500 }
    )
  }
}
