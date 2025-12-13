import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - List all monster skills
export async function GET() {
  try {
    const skills = await prisma.monsterSkill.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json({ success: true, skills })
  } catch (error) {
    console.error('Error fetching monster skills:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch monster skills' },
      { status: 500 }
    )
  }
}

// POST - Create a new monster skill
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const skill = await prisma.monsterSkill.create({
      data: {
        name: body.name,
        description: body.description || null,
        icon: body.icon || '👊',
        category: body.category || 'attack',
        damageType: body.damageType || 'physical',
        baseDamage: body.baseDamage || 0,
        accuracy: body.accuracy || 100,
        speed: body.speed || 50,
        scalesWithAttack: body.scalesWithAttack ?? true,
        scalingPercent: body.scalingPercent || 100,
        appliesDebuff: body.appliesDebuff || null,
        debuffChance: body.debuffChance || 100,
        debuffDuration: body.debuffDuration || 2,
        debuffValue: body.debuffValue || 0,
        appliesBuff: body.appliesBuff || null,
        buffDuration: body.buffDuration || 2,
        buffValue: body.buffValue || 0,
        selfHeal: body.selfHeal || 0,
        selfDamage: body.selfDamage || 0,
        narrativeUse: body.narrativeUse || 'The monster attacks!',
        narrativeHit: body.narrativeHit || 'The attack connects!',
        narrativeMiss: body.narrativeMiss || 'The attack misses!',
        narrativeCrit: body.narrativeCrit || 'Critical hit!',
      },
    })

    return NextResponse.json({ success: true, skill })
  } catch (error) {
    console.error('Error creating monster skill:', error)
    const message = error instanceof Error ? error.message : 'Failed to create monster skill'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

// PUT - Update a monster skill
export async function PUT(request: Request) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Skill ID is required' },
        { status: 400 }
      )
    }

    const skill = await prisma.monsterSkill.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        icon: body.icon,
        category: body.category,
        damageType: body.damageType,
        baseDamage: body.baseDamage,
        accuracy: body.accuracy,
        speed: body.speed,
        scalesWithAttack: body.scalesWithAttack,
        scalingPercent: body.scalingPercent,
        appliesDebuff: body.appliesDebuff,
        debuffChance: body.debuffChance,
        debuffDuration: body.debuffDuration,
        debuffValue: body.debuffValue,
        appliesBuff: body.appliesBuff,
        buffDuration: body.buffDuration,
        buffValue: body.buffValue,
        selfHeal: body.selfHeal,
        selfDamage: body.selfDamage,
        narrativeUse: body.narrativeUse,
        narrativeHit: body.narrativeHit,
        narrativeMiss: body.narrativeMiss,
        narrativeCrit: body.narrativeCrit,
      },
    })

    return NextResponse.json({ success: true, skill })
  } catch (error) {
    console.error('Error updating monster skill:', error)
    const message = error instanceof Error ? error.message : 'Failed to update monster skill'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

// DELETE - Delete a monster skill
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Skill ID is required' },
        { status: 400 }
      )
    }

    await prisma.monsterSkill.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting monster skill:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete monster skill'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
