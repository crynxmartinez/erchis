import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { starterSkillName, deleteAll } = await request.json()
    
    if (deleteAll) {
      // Nuclear option: delete ALL skills with stage > 0 that are NOT locked or saved
      // User requested "reset all generated skills", usually implying a clean slate, but we should probably still respect locks if we add them.
      // However, the user specifically asked for "reset children on that current skill" in the prompt.
      // The "Reset Tree" button on stage 0 usually implies "clear everything I generated for this starter".
      
      const result = await prisma.skill.deleteMany({
        where: {
          stage: { gt: 0 },
          isSaved: false,
          isLocked: false
        }
      })
      
      return NextResponse.json({ 
        success: true, 
        count: result.count,
        message: `Deleted ${result.count} generated skills (respected locks/saves)`
      })
    }
    
    if (!starterSkillName) {
      return NextResponse.json({ error: 'starterSkillName is required' }, { status: 400 })
    }
    
    // Delete all skills that belong to this starter skill tree EXCEPT the root (stage 0)
    // AND respect isSaved / isLocked
    const result = await prisma.skill.deleteMany({
      where: {
        starterSkillName,
        stage: { gt: 0 },
        isSaved: false,
        isLocked: false
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
