import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { parentId } = await request.json()
    
    if (!parentId) {
      return NextResponse.json({ error: 'parentId is required' }, { status: 400 })
    }
    
    // Delete all unsaved children of this parent
    const result = await prisma.skill.deleteMany({
      where: {
        parentId,
        isSaved: false
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      count: result.count,
      message: `Deleted ${result.count} unsaved skills`
    })
  } catch (error) {
    console.error('Error deleting unsaved children:', error)
    return NextResponse.json({ error: 'Failed to delete unsaved children', details: String(error) }, { status: 500 })
  }
}
