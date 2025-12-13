import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST - Check if skill names already exist in database
export async function POST(request: Request) {
  try {
    const { names } = await request.json()

    if (!names || !Array.isArray(names)) {
      return NextResponse.json(
        { success: false, error: 'names array is required' },
        { status: 400 }
      )
    }

    // Get existing skill names from database
    const existingSkills = await prisma.monsterSkill.findMany({
      where: {
        name: {
          in: names,
          mode: 'insensitive',
        },
      },
      select: { name: true },
    })

    const duplicateNames = existingSkills.map((s: { name: string }) => s.name.toLowerCase())

    return NextResponse.json({
      success: true,
      duplicates: duplicateNames,
    })
  } catch (error) {
    console.error('Error checking duplicates:', error)
    const message = error instanceof Error ? error.message : 'Failed to check duplicates'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
