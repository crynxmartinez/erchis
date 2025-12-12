import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const starter = searchParams.get('starter')
    const onlySaved = searchParams.get('onlySaved') === 'true'
    
    if (!starter) {
      return NextResponse.json({ error: 'starter is required' }, { status: 400 })
    }
    
    const whereClause: any = { starterSkillName: starter }
    if (onlySaved) {
      whereClause.isSaved = true
    }

    // Get all skills for this starter skill tree
    const skills = await prisma.skill.findMany({
      where: whereClause,
      select: { stage: true }
    })
    
    // Count by stage
    const byStage: Record<number, number> = {}
    for (const skill of skills) {
      byStage[skill.stage] = (byStage[skill.stage] || 0) + 1
    }
    
    return NextResponse.json({ 
      total: skills.length,
      byStage
    })
  } catch (error) {
    console.error('Error getting progress:', error)
    return NextResponse.json({ error: 'Failed to get progress' }, { status: 500 })
  }
}
