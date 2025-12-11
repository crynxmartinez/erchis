import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { raceId, stats } = await request.json()

    // Validate race exists
    const race = await prisma.race.findUnique({
      where: { id: raceId },
    })
    if (!race) {
      return NextResponse.json({ error: 'Invalid race' }, { status: 400 })
    }

    // Validate stats
    const { str, agi, vit, int, dex, luk } = stats
    const totalStats = str + agi + vit + int + dex + luk
    if (totalStats !== 25) {
      return NextResponse.json({ error: 'Stats must total 25 points' }, { status: 400 })
    }
    if (str < 0 || agi < 0 || vit < 0 || int < 0 || dex < 0 || luk < 0) {
      return NextResponse.json({ error: 'Stats cannot be negative' }, { status: 400 })
    }

    // Get starting location
    const startingLocation = await prisma.location.findFirst({
      where: { isSafeZone: true, floor: 1 },
    })

    // Calculate max HP based on VIT
    const maxHp = 100 + (vit * 10)

    // Update player with race and stats
    const player = await prisma.player.update({
      where: { userId: session.userId },
      data: {
        raceId,
        str,
        agi,
        vit,
        int,
        dex,
        luk,
        statPoints: 0,
        currentHp: maxHp,
        currentLocationId: startingLocation?.id,
        isInSafeZone: true,
      },
    })

    return NextResponse.json({ success: true, player })
  } catch (error) {
    console.error('Failed to create character:', error)
    return NextResponse.json({ error: 'Failed to create character' }, { status: 500 })
  }
}
