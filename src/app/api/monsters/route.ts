import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - List all monsters with their skills and loot
export async function GET() {
  try {
    const monsters = await prisma.monster.findMany({
      include: {
        skills: {
          include: { monsterSkill: true }
        },
        lootDrops: {
          include: { item: true }
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, monsters })
  } catch (error) {
    console.error('Error fetching monsters:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch monsters' },
      { status: 500 }
    )
  }
}

// POST - Create a new monster
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const monster = await prisma.monster.create({
      data: {
        name: body.name,
        description: body.description || null,
        imageUrl: body.imageUrl || null,
        maxHp: body.maxHp || 100,
        attack: body.attack || 10,
        magicAttack: body.magicAttack || 0,
        defense: body.defense || 5,
        magicDefense: body.magicDefense || 0,
        accuracy: body.accuracy || 70,
        evasion: body.evasion || 10,
        xpReward: body.xpReward || 10,
        colReward: body.colReward || 5,
      },
      include: {
        skills: { include: { monsterSkill: true } },
        lootDrops: { include: { item: true } },
      },
    })

    return NextResponse.json({ success: true, monster })
  } catch (error) {
    console.error('Error creating monster:', error)
    const message = error instanceof Error ? error.message : 'Failed to create monster'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

// PUT - Update a monster
export async function PUT(request: Request) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Monster ID is required' },
        { status: 400 }
      )
    }

    const monster = await prisma.monster.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        imageUrl: body.imageUrl,
        maxHp: body.maxHp,
        attack: body.attack,
        magicAttack: body.magicAttack,
        defense: body.defense,
        magicDefense: body.magicDefense,
        accuracy: body.accuracy,
        evasion: body.evasion,
        xpReward: body.xpReward,
        colReward: body.colReward,
      },
      include: {
        skills: { include: { monsterSkill: true } },
        lootDrops: { include: { item: true } },
      },
    })

    return NextResponse.json({ success: true, monster })
  } catch (error) {
    console.error('Error updating monster:', error)
    const message = error instanceof Error ? error.message : 'Failed to update monster'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

// DELETE - Delete a monster
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Monster ID is required' },
        { status: 400 }
      )
    }

    await prisma.monster.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting monster:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete monster'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
