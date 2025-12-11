import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { skillIds } = await request.json()
    
    if (!skillIds || !Array.isArray(skillIds) || skillIds.length === 0) {
      return NextResponse.json({ error: 'skillIds array is required' }, { status: 400 })
    }
    
    // Update all skills to mark them as saved
    const result = await prisma.skill.updateMany({
      where: {
        id: { in: skillIds }
      },
      data: {
        isSaved: true
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      count: result.count,
      message: `Saved ${result.count} skills to database`
    })
  } catch (error) {
    console.error('Error saving children:', error)
    return NextResponse.json({ error: 'Failed to save children', details: String(error) }, { status: 500 })
  }
}
