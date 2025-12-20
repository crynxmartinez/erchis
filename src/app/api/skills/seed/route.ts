import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { SKILL_TYPE_CATEGORIES } from '@/data/universal-skills-data'

// POST - Seed all 90 starter skills from data file
export async function POST() {
  try {
    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[],
    }

    for (const category of SKILL_TYPE_CATEGORIES) {
      for (const skillData of category.skills) {
        try {
          // Check if skill already exists
          const existing = await prisma.skill.findFirst({
            where: { name: skillData.name, stage: 0 },
          })

          if (existing) {
            // Update to ensure it's saved
            if (!existing.isSaved) {
              await prisma.skill.update({
                where: { id: existing.id },
                data: { isSaved: true }
              })
            }
            results.skipped++
            continue
          }

          // Create the skill
          await prisma.skill.create({
            data: {
              name: skillData.name,
              description: skillData.description,
              narrativeUse: skillData.narrativeUse || null,
              skillType: category.name,
              damageType: skillData.damageType,
              weaponRequirement: skillData.weaponRequirement,
              hasUtilityMode: skillData.hasUtilityMode || false,
              utilityEffect: skillData.utilityEffect || null,
              utilityDuration: skillData.utilityDuration || null,
              stage: 0,
              variantType: 'base',
              ampPercent: skillData.ampPercent,
              apCost: skillData.apCost,
              cooldown: skillData.cooldown,
              targetType: 'single',
              range: skillData.range,
              hitCount: skillData.hitCount || 1,
              buffType: skillData.buffType || null,
              buffDuration: skillData.buffDuration || null,
              debuffType: skillData.debuffType || null,
              debuffDuration: skillData.debuffDuration || null,
              debuffChance: skillData.debuffChance || null,
              lifestealPercent: skillData.lifestealPercent || null,
              armorPierce: skillData.armorPierce || null,
              bonusVsGuard: skillData.bonusVsGuard || null,
              bonusVsDebuffed: skillData.bonusVsDebuffed || null,
              isCounter: skillData.isCounter || false,
              triggerCondition: skillData.triggerCondition || null,
              starterSkillName: skillData.name,
              isSaved: true,  // Mark as saved
              isLocked: false, // Not locked so they can still be edited
            },
          })

          results.created++
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          results.errors.push(`${skillData.name}: ${message}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${results.created} skills, skipped ${results.skipped} existing`,
      results,
    })
  } catch (error) {
    console.error('Error seeding skills:', error)
    return NextResponse.json({ error: 'Failed to seed skills', details: String(error) }, { status: 500 })
  }
}

// GET - Check seed status
export async function GET() {
  try {
    const totalInData = SKILL_TYPE_CATEGORIES.reduce((sum, cat) => sum + cat.skills.length, 0)
    const savedCount = await prisma.skill.count({ where: { stage: 0, isSaved: true } })
    const totalCount = await prisma.skill.count({ where: { stage: 0 } })
    
    return NextResponse.json({
      totalInDataFile: totalInData,
      totalInDatabase: totalCount,
      savedInDatabase: savedCount,
      needsSeeding: savedCount < totalInData,
    })
  } catch (error) {
    console.error('Error checking seed status:', error)
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}
