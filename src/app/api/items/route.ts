import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - List all items
export async function GET() {
  try {
    const items = await prisma.item.findMany({
      orderBy: [
        { itemType: 'asc' },
        { rarity: 'asc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json({ success: true, items })
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch items' },
      { status: 500 }
    )
  }
}

// POST - Create a new item
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const item = await prisma.item.create({
      data: {
        name: body.name,
        description: body.description || null,
        icon: body.icon || '📦',
        itemType: body.itemType || 'material',
        useEffect: body.useEffect || null,
        effectValue: body.effectValue || 0,
        equipSlot: body.equipSlot || null,
        statBonuses: body.statBonuses || {},
        buyPrice: body.buyPrice || 0,
        sellPrice: body.sellPrice || 0,
        maxStack: body.maxStack || 99,
        isUnique: body.isUnique || false,
        rarity: body.rarity || 'common',
      },
    })

    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error('Error creating item:', error)
    const message = error instanceof Error ? error.message : 'Failed to create item'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

// PUT - Update an item
export async function PUT(request: Request) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      )
    }

    const item = await prisma.item.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        icon: body.icon,
        itemType: body.itemType,
        useEffect: body.useEffect,
        effectValue: body.effectValue,
        equipSlot: body.equipSlot,
        statBonuses: body.statBonuses,
        buyPrice: body.buyPrice,
        sellPrice: body.sellPrice,
        maxStack: body.maxStack,
        isUnique: body.isUnique,
        rarity: body.rarity,
      },
    })

    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error('Error updating item:', error)
    const message = error instanceof Error ? error.message : 'Failed to update item'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

// DELETE - Delete an item
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      )
    }

    await prisma.item.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting item:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete item'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
