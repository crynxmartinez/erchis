import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const name = searchParams.get('name')
    const categoryId = searchParams.get('categoryId')
    
    let skill = null
    
    if (id) {
      // Get by ID
      skill = await prisma.skill.findUnique({
        where: { id },
        include: {
          category: true,
          parent: { select: { id: true, name: true } },
          children: { select: { id: true, name: true, stage: true, archetype: true, description: true } },
        }
      })
    } else if (name && categoryId) {
      // Get by name and category (for starter skills)
      skill = await prisma.skill.findFirst({
        where: { 
          name,
          categoryId,
          stage: 0, // Starter skills are stage 0
        },
        include: {
          category: true,
          parent: { select: { id: true, name: true } },
          children: { select: { id: true, name: true, stage: true, archetype: true, description: true } },
        }
      })
    }
    
    return NextResponse.json({ skill })
  } catch (error) {
    console.error('Error getting skill:', error)
    return NextResponse.json({ error: 'Failed to get skill' }, { status: 500 })
  }
}
