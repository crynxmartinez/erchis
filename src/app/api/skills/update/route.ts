import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Build update object with only provided fields
    const updateData: any = {}
    
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.skillType !== undefined) updateData.skillType = data.skillType
    if (data.damage !== undefined) updateData.damage = data.damage
    if (data.apCost !== undefined) updateData.apCost = data.apCost
    if (data.cooldown !== undefined) updateData.cooldown = data.cooldown
    if (data.passive !== undefined) updateData.passive = data.passive
    if (data.archetype !== undefined) updateData.archetype = data.archetype
    
    const skill = await prisma.skill.update({
      where: { id: data.id },
      data: updateData,
      include: {
        category: true,
        children: { select: { id: true, name: true, stage: true, archetype: true } },
      }
    })
    
    return NextResponse.json({ success: true, skill })
  } catch (error) {
    console.error('Error updating skill:', error)
    return NextResponse.json({ error: 'Failed to update skill', details: String(error) }, { status: 500 })
  }
}
