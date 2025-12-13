import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST - Assign a skill to a monster
export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.monsterId || !body.monsterSkillId) {
      return NextResponse.json(
        { success: false, error: 'monsterId and monsterSkillId are required' },
        { status: 400 }
      )
    }

    const assignment = await prisma.monsterSkillAssignment.create({
      data: {
        monsterId: body.monsterId,
        monsterSkillId: body.monsterSkillId,
        damageOverride: body.damageOverride || null,
        accuracyOverride: body.accuracyOverride || null,
        speedOverride: body.speedOverride || null,
        priority: body.priority || 1,
      },
      include: { monsterSkill: true },
    })

    return NextResponse.json({ success: true, assignment })
  } catch (error) {
    console.error('Error assigning skill:', error)
    const message = error instanceof Error ? error.message : 'Failed to assign skill'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

// DELETE - Remove a skill from a monster
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Assignment ID is required' },
        { status: 400 }
      )
    }

    await prisma.monsterSkillAssignment.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing skill:', error)
    const message = error instanceof Error ? error.message : 'Failed to remove skill'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
