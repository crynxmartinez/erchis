import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { starterSkillName } = await request.json()
    
    if (!starterSkillName) {
      return NextResponse.json({ error: 'starterSkillName is required' }, { status: 400 })
    }
    
    // Delete all skills that belong to this starter skill tree EXCEPT the root (stage 0)
    const result = await prisma.skill.deleteMany({
      where: {
        starterSkillName,
        stage: { gt: 0 }
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      count: result.count,
      message: `Deleted ${result.count} child skills from ${starterSkillName} tree`
    })
  } catch (error) {
    console.error('Error deleting children:', error)
    return NextResponse.json({ error: 'Failed to delete children', details: String(error) }, { status: 500 })
  }
}
