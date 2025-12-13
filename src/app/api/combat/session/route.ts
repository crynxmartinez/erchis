import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get player
    const player = await prisma.player.findFirst({
      where: { userId },
    })

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Get active combat session
    const session = await prisma.combatSession.findFirst({
      where: {
        playerId: player.id,
        status: 'active',
      },
      include: {
        monster: {
          include: {
            skills: true,
          },
        },
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!session) {
      return NextResponse.json({ 
        inCombat: false,
        session: null,
      })
    }

    return NextResponse.json({
      inCombat: true,
      session: {
        id: session.id,
        turn: session.turn,
        status: session.status,
        player: {
          hp: session.playerHp,
          ap: session.playerAp,
          buffs: session.playerBuffs,
          debuffs: session.playerDebuffs,
        },
        monster: {
          id: session.monster.id,
          name: session.monster.name,
          level: session.monster.level,
          hp: session.monsterHp,
          maxHp: session.monster.maxHp,
          imageUrl: session.monster.imageUrl,
          buffs: session.monsterBuffs,
          debuffs: session.monsterDebuffs,
        },
        playerQueue: session.playerQueue,
        enemyQueue: session.enemyQueue,
        skillCooldowns: session.skillCooldowns,
        logs: session.logs.map(log => ({
          turn: log.turn,
          actor: log.actor,
          actionName: log.actionName,
          narration: log.narration,
          damageDealt: log.damageDealt,
          healingDone: log.healingDone,
        })),
      },
    })
  } catch (error) {
    console.error('Get combat session error:', error)
    return NextResponse.json(
      { error: 'Failed to get combat session' },
      { status: 500 }
    )
  }
}
