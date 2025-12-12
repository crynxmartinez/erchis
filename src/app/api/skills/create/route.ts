import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const skill = await prisma.skill.create({
      data: {
        name: data.name,
        description: data.description,
        executionDescription: data.executionDescription || null,
        skillType: data.skillType,
        damageType: data.damageType || 'physical',
        weaponRequirement: data.weaponRequirement || 'any',
        hasUtilityMode: data.hasUtilityMode || false,
        utilityEffect: data.utilityEffect || null,
        utilityDuration: data.utilityDuration || null,
        stage: data.stage || 0,
        variantType: data.variantType || 'root',
        ampPercent: data.ampPercent ?? 50,
        apCost: data.apCost || 5,
        cooldown: data.cooldown || 1,
        targetType: data.targetType || 'single',
        range: data.range || 1,
        hitCount: data.hitCount || 1,
        buffType: data.buffType || null,
        buffDuration: data.buffDuration || null,
        debuffType: data.debuffType || null,
        debuffDuration: data.debuffDuration || null,
        lifestealPercent: data.lifestealPercent || null,
        isCounter: data.isCounter || false,
        triggerCondition: data.triggerCondition || null,
        passive: data.passive || null,
        starterSkillName: data.starterSkillName,
        parentId: data.parentId || null,
        isSaved: data.isSaved || false,
      },
      include: {
        children: true,
      }
    })
    
    return NextResponse.json({ success: true, skill })
  } catch (error) {
    console.error('Error creating skill:', error)
    return NextResponse.json({ error: 'Failed to create skill', details: String(error) }, { status: 500 })
  }
}
