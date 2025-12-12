import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const starterSkill = searchParams.get('starter') || 'Quick Slash'
    const onlySaved = searchParams.get('onlySaved') === 'true'
    
    const whereClause: any = { starterSkillName: starterSkill }
    if (onlySaved) {
      whereClause.isSaved = true
    }

    const skills = await prisma.skill.findMany({
      where: whereClause,
      include: {
        parent: {
          select: { id: true, name: true }
        },
        children: {
          select: { id: true, name: true, stage: true, variantType: true }
        }
      },
      orderBy: [
        { stage: 'asc' },
        { name: 'asc' }
      ]
    })
    
    return NextResponse.json(skills)
  } catch (error) {
    console.error('Error loading skills:', error)
    return NextResponse.json({ error: 'Failed to load skills' }, { status: 500 })
  }
}
