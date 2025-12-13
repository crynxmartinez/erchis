import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { MONSTER_SKILLS } from '@/data/monster-skills-data'

// POST - Seed all monster skills from data file
export async function POST() {
  try {
    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[],
    }

    for (const skillData of MONSTER_SKILLS) {
      try {
        // Check if skill already exists
        const existing = await prisma.monsterSkill.findUnique({
          where: { name: skillData.name },
        })

        if (existing) {
          results.skipped++
          continue
        }

        // Create the skill
        await prisma.monsterSkill.create({
          data: {
            name: skillData.name,
            description: skillData.description,
            icon: skillData.icon,
            category: skillData.category,
            damageType: skillData.damageType,
            baseDamage: skillData.baseDamage,
            accuracy: skillData.accuracy,
            speed: skillData.speed,
            scalesWithAttack: skillData.scalesWithAttack,
            scalingPercent: skillData.scalingPercent,
            appliesDebuff: skillData.appliesDebuff || null,
            debuffChance: skillData.debuffChance || 100,
            debuffDuration: skillData.debuffDuration || 2,
            debuffValue: skillData.debuffValue || 0,
            appliesBuff: skillData.appliesBuff || null,
            buffDuration: skillData.buffDuration || 2,
            buffValue: skillData.buffValue || 0,
            selfHeal: skillData.selfHeal || 0,
            selfDamage: skillData.selfDamage || 0,
            narrativeUse: skillData.narrativeUse,
            narrativeHit: skillData.narrativeHit,
            narrativeMiss: skillData.narrativeMiss,
            narrativeCrit: skillData.narrativeCrit,
          },
        })

        results.created++
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        results.errors.push(`${skillData.name}: ${message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${results.created} skills, skipped ${results.skipped} existing`,
      results,
    })
  } catch (error) {
    console.error('Error seeding monster skills:', error)
    const message = error instanceof Error ? error.message : 'Failed to seed monster skills'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
