import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Build update object with only provided fields
    const updateData: any = {}
    
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.executionDescription !== undefined) updateData.executionDescription = data.executionDescription
    if (data.stage !== undefined) updateData.stage = data.stage
    if (data.skillType !== undefined) updateData.skillType = data.skillType
    if (data.damageType !== undefined) updateData.damageType = data.damageType
    if (data.weaponRequirement !== undefined) updateData.weaponRequirement = data.weaponRequirement
    if (data.hasUtilityMode !== undefined) updateData.hasUtilityMode = data.hasUtilityMode
    if (data.utilityEffect !== undefined) updateData.utilityEffect = data.utilityEffect
    if (data.utilityDuration !== undefined) updateData.utilityDuration = data.utilityDuration
    if (data.ampPercent !== undefined) updateData.ampPercent = data.ampPercent
    if (data.apCost !== undefined) updateData.apCost = data.apCost
    if (data.cooldown !== undefined) updateData.cooldown = data.cooldown
    if (data.targetType !== undefined) updateData.targetType = data.targetType
    if (data.range !== undefined) updateData.range = data.range
    if (data.hitCount !== undefined) updateData.hitCount = data.hitCount
    if (data.passive !== undefined) updateData.passive = data.passive
    if (data.variantType !== undefined) updateData.variantType = data.variantType
    if (data.buffType !== undefined) updateData.buffType = data.buffType
    if (data.buffDuration !== undefined) updateData.buffDuration = data.buffDuration
    if (data.debuffType !== undefined) updateData.debuffType = data.debuffType
    if (data.debuffDuration !== undefined) updateData.debuffDuration = data.debuffDuration
    if (data.debuffChance !== undefined) updateData.debuffChance = data.debuffChance
    if (data.lifestealPercent !== undefined) updateData.lifestealPercent = data.lifestealPercent
    if (data.armorPierce !== undefined) updateData.armorPierce = data.armorPierce
    if (data.bonusVsGuard !== undefined) updateData.bonusVsGuard = data.bonusVsGuard
    if (data.bonusVsDebuffed !== undefined) updateData.bonusVsDebuffed = data.bonusVsDebuffed
    if (data.isCounter !== undefined) updateData.isCounter = data.isCounter
    if (data.triggerCondition !== undefined) updateData.triggerCondition = data.triggerCondition
    if (data.isLocked !== undefined) updateData.isLocked = data.isLocked
    if (data.isSaved !== undefined) updateData.isSaved = data.isSaved
    
    const skill = await prisma.skill.update({
      where: { id: data.id },
      data: updateData,
      include: {
        children: true,
      }
    })
    
    return NextResponse.json({ success: true, skill })
  } catch (error) {
    console.error('Error updating skill:', error)
    return NextResponse.json({ error: 'Failed to update skill', details: String(error) }, { status: 500 })
  }
}
