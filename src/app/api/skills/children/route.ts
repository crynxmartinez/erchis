import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')
    const onlySaved = searchParams.get('onlySaved') === 'true'
    
    if (!parentId) {
      return NextResponse.json({ error: 'parentId is required' }, { status: 400 })
    }
    
    const whereClause: any = { parentId }
    if (onlySaved) {
      whereClause.isSaved = true
    }

    const children = await prisma.skill.findMany({
      where: whereClause,
      orderBy: { variantType: 'asc' },
    })
    
    return NextResponse.json({ children })
  } catch (error) {
    console.error('Error getting children:', error)
    return NextResponse.json({ error: 'Failed to get children' }, { status: 500 })
  }
}
