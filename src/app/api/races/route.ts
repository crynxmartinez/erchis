import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const races = await prisma.race.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(races)
  } catch (error) {
    console.error('Failed to fetch races:', error)
    return NextResponse.json({ error: 'Failed to fetch races' }, { status: 500 })
  }
}
