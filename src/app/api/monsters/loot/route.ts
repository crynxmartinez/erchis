import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST - Add loot drop to a monster
export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.monsterId || !body.itemId) {
      return NextResponse.json(
        { success: false, error: 'monsterId and itemId are required' },
        { status: 400 }
      )
    }

    const lootDrop = await prisma.monsterLootDrop.create({
      data: {
        monsterId: body.monsterId,
        itemId: body.itemId,
        dropChance: body.dropChance || 0.1,
        minQuantity: body.minQuantity || 1,
        maxQuantity: body.maxQuantity || 1,
      },
      include: { item: true },
    })

    return NextResponse.json({ success: true, lootDrop })
  } catch (error) {
    console.error('Error adding loot:', error)
    const message = error instanceof Error ? error.message : 'Failed to add loot'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

// DELETE - Remove loot drop from a monster
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Loot drop ID is required' },
        { status: 400 }
      )
    }

    await prisma.monsterLootDrop.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing loot:', error)
    const message = error instanceof Error ? error.message : 'Failed to remove loot'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
