import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // First ensure the weapon category exists
    let category = await prisma.weaponCategory.findUnique({
      where: { id: data.categoryId }
    })
    
    // If categoryId is a string name like 'sword', find or create by name
    if (!category) {
      category = await prisma.weaponCategory.findUnique({
        where: { name: data.categoryId.charAt(0).toUpperCase() + data.categoryId.slice(1) }
      })
      
      if (!category) {
        // Create the category
        category = await prisma.weaponCategory.create({
          data: {
            name: data.categoryId.charAt(0).toUpperCase() + data.categoryId.slice(1),
            description: `${data.categoryId} weapon category`,
            primaryStat: 'STR',
            isRanged: false,
            isTwoHanded: false,
            isMagic: false,
          }
        })
      }
    }
    
    const skill = await prisma.skill.create({
      data: {
        name: data.name,
        description: data.description,
        skillType: data.skillType,
        categoryId: category.id,
        stage: data.stage || 0,
        archetype: data.archetype || 'root',
        damage: data.damage || '100% weapon damage',
        apCost: data.apCost || 5,
        cooldown: data.cooldown || '0.5s',
        passive: data.passive || null,
        starterSkillName: data.starterSkillName,
        parentId: data.parentId || null,
      },
      include: {
        category: true,
        children: true,
      }
    })
    
    return NextResponse.json({ success: true, skill })
  } catch (error) {
    console.error('Error creating skill:', error)
    return NextResponse.json({ error: 'Failed to create skill', details: String(error) }, { status: 500 })
  }
}
