import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const starterSkill = searchParams.get('starter') || 'Quick Slash'
    const categoryId = searchParams.get('categoryId')
    
    // Build where clause
    const where: any = {}
    
    if (starterSkill) {
      where.starterSkillName = starterSkill
    }
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    const skills = await prisma.skill.findMany({
      where,
      include: {
        category: true,
        parent: {
          select: { id: true, name: true }
        },
        children: {
          select: { id: true, name: true, stage: true, archetype: true }
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
