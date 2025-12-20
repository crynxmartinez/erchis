import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { STARTER_ITEMS } from '@/data/items-data'

interface SessionData {
  userId: string
  username: string
  role: string
}

// Get only starter weapons
const STARTER_WEAPONS = STARTER_ITEMS.filter(item => 
  item.itemType === 'weapons' && item.name.startsWith('Starter')
)

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    let session: SessionData
    try {
      session = JSON.parse(sessionCookie.value)
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { weaponName } = await request.json()

    if (!weaponName) {
      return NextResponse.json({ error: 'Weapon name is required' }, { status: 400 })
    }

    // Find the player
    const player = await prisma.player.findUnique({
      where: { userId: session.userId },
      include: { inventory: { include: { item: true } } },
    })

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Check if it's a valid starter weapon
    const starterWeapon = STARTER_WEAPONS.find(w => w.name === weaponName)
    if (!starterWeapon) {
      return NextResponse.json({ error: 'Invalid starter weapon' }, { status: 400 })
    }

    // Check if player already has this weapon
    const alreadyHas = player.inventory.some(inv => inv.item.name === weaponName)
    if (alreadyHas) {
      return NextResponse.json({ error: 'You already have this weapon' }, { status: 400 })
    }

    // Find or create the item in the database
    let item = await prisma.item.findFirst({
      where: { name: weaponName },
    })

    if (!item) {
      // Create the item from starter data
      item = await prisma.item.create({
        data: {
          name: starterWeapon.name,
          description: starterWeapon.description,
          itemType: starterWeapon.itemType,
          rarity: starterWeapon.rarity,
          icon: starterWeapon.icon,
          weight: starterWeapon.weight,
          maxStack: starterWeapon.maxStack,
          buyPrice: starterWeapon.buyPrice,
          sellPrice: starterWeapon.sellPrice,
          equipSlot: starterWeapon.equipSlot,
          statBonuses: starterWeapon.statBonuses || {},
          isSaved: true,
        },
      })
    }

    // Add to player inventory
    await prisma.playerInventory.create({
      data: {
        playerId: player.id,
        itemId: item.id,
        quantity: 1,
        durability: 100,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Claimed ${weaponName}!`,
      item: {
        id: item.id,
        name: item.name,
      },
    })
  } catch (error) {
    console.error('Error claiming weapon:', error)
    return NextResponse.json({ error: 'Failed to claim weapon', details: String(error) }, { status: 500 })
  }
}
