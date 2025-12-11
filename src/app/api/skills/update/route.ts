import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const updatedSkill = await request.json()
    
    const skill = await prisma.skill.update({
      where: { id: updatedSkill.id },
      data: {
        name: updatedSkill.name,
        skillType: updatedSkill.skillType,
        damage: updatedSkill.damage,
        apCost: updatedSkill.apCost,
        cooldown: updatedSkill.cooldown,
        description: updatedSkill.description,
        passive: updatedSkill.passive,
      }
    })
    
    return NextResponse.json({ success: true, skill })
  } catch (error) {
    console.error('Error updating skill:', error)
    return NextResponse.json({ error: 'Failed to update skill' }, { status: 500 })
  }
}
