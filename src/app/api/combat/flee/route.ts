import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Get player
    const player = await prisma.player.findFirst({
      where: { userId },
    })

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Get combat session
    const session = await prisma.combatSession.findFirst({
      where: {
        id: sessionId,
        playerId: player.id,
        status: 'active',
      },
      include: {
        monster: true,
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Combat session not found' }, { status: 404 })
    }

    // Calculate flee chance based on player AGI vs monster evasion
    const agiDiff = player.agi - session.monster.evasion
    const fleeChance = Math.max(10, Math.min(90, 50 + agiDiff))
    const roll = Math.random() * 100
    const success = roll < fleeChance

    let narrative: string

    if (success) {
      // Flee successful
      await prisma.combatSession.update({
        where: { id: session.id },
        data: {
          status: 'fled',
          endedAt: new Date(),
        },
      })

      narrative = `You turn and sprint away from the ${session.monster.name}, escaping to safety!`
    } else {
      // Flee failed - monster gets a free attack
      const monsterDamage = Math.max(1, session.monster.attack - Math.floor(player.vit * 0.5))
      const newPlayerHp = Math.max(0, session.playerHp - monsterDamage)

      await prisma.combatSession.update({
        where: { id: session.id },
        data: {
          playerHp: newPlayerHp,
          turn: session.turn + 1,
          status: newPlayerHp <= 0 ? 'lost' : 'active',
          endedAt: newPlayerHp <= 0 ? new Date() : undefined,
        },
      })

      // Update player HP
      await prisma.player.update({
        where: { id: player.id },
        data: { currentHp: newPlayerHp },
      })

      if (newPlayerHp <= 0) {
        narrative = `You try to flee, but the ${session.monster.name} catches you! You take ${monsterDamage} damage and fall...`
      } else {
        narrative = `You try to flee, but the ${session.monster.name} blocks your escape and strikes you for ${monsterDamage} damage!`
      }
    }

    return NextResponse.json({
      success,
      narrative,
      status: success ? 'fled' : (session.playerHp <= 0 ? 'lost' : 'active'),
      playerHp: success ? session.playerHp : Math.max(0, session.playerHp - (success ? 0 : session.monster.attack)),
    })
  } catch (error) {
    console.error('Combat flee error:', error)
    return NextResponse.json(
      { error: 'Failed to flee from combat' },
      { status: 500 }
    )
  }
}
