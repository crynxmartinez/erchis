import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')
    
    if (!parentId) {
      return NextResponse.json({ error: 'parentId is required' }, { status: 400 })
    }
    
    const children = await prisma.skill.findMany({
      where: { parentId },
      orderBy: { archetype: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        stage: true,
        archetype: true,
        skillType: true,
        damage: true,
        apCost: true,
        cooldown: true,
        passive: true,
        starterSkillName: true,
        categoryId: true,
        variantType: true,
        buffType: true,
        buffDuration: true,
        debuffType: true,
        debuffDuration: true,
        lifestealPercent: true,
        hitCount: true,
        isSaved: true,
      }
    })
    
    return NextResponse.json({ children })
  } catch (error) {
    console.error('Error getting children:', error)
    return NextResponse.json({ error: 'Failed to get children' }, { status: 500 })
  }
}
