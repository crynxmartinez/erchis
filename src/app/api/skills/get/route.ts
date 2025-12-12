import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const name = searchParams.get('name')
    const onlySaved = searchParams.get('onlySaved') === 'true'
    
    let skill = null
    const childrenWhere = onlySaved ? { isSaved: true } : {}
    
    if (id) {
      // Get by ID
      skill = await prisma.skill.findUnique({
        where: { id },
        include: {
          parent: { select: { id: true, name: true } },
          children: { where: childrenWhere },
        }
      })
    } else if (name) {
      // Get by name (for starter skills)
      skill = await prisma.skill.findFirst({
        where: { 
          name,
          stage: 0, // Starter skills are stage 0
        },
        include: {
          parent: { select: { id: true, name: true } },
          children: { where: childrenWhere },
        }
      })
    }
    
    return NextResponse.json({ skill })
  } catch (error) {
    console.error('Error getting skill:', error)
    return NextResponse.json({ error: 'Failed to get skill' }, { status: 500 })
  }
}
