import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { SKILL_TYPE_CATEGORIES } from '@/data/universal-skills-data'

interface SessionData {
  userId: string
  username: string
  role: string
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    let session: SessionData
    try {
      session = JSON.parse(sessionCookie.value)
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { skillName } = await request.json()

    if (!skillName) {
      return NextResponse.json({ error: 'Skill name is required' }, { status: 400 })
    }

    // Find the player
    const player = await prisma.player.findUnique({
      where: { userId: session.userId },
      include: { skills: true },
    })

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Check if player already has max skills (100)
    if (player.skills.length >= 100) {
      return NextResponse.json({ error: 'You have reached the maximum number of learned skills (100)' }, { status: 400 })
    }

    // Find the skill in the database
    const skill = await prisma.skill.findFirst({
      where: { name: skillName, isSaved: true },
    })

    if (!skill) {
      // Check if it's a valid starter skill from data
      let isValidStarterSkill = false
      for (const category of SKILL_TYPE_CATEGORIES) {
        if (category.skills.some(s => s.name === skillName)) {
          isValidStarterSkill = true
          break
        }
      }

      if (!isValidStarterSkill) {
        return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
      }

      return NextResponse.json({ error: 'Skill has not been saved to the database yet. Please seed skills first.' }, { status: 400 })
    }

    // Check if player already learned this skill
    const alreadyLearned = player.skills.some(ls => ls.skillId === skill.id)
    if (alreadyLearned) {
      return NextResponse.json({ error: 'You have already learned this skill' }, { status: 400 })
    }

    // Learn the skill
    await prisma.playerSkill.create({
      data: {
        playerId: player.id,
        skillId: skill.id,
        useCount: 0,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Learned ${skillName}!`,
      skill: {
        id: skill.id,
        name: skill.name,
      },
    })
  } catch (error) {
    console.error('Error learning skill:', error)
    return NextResponse.json({ error: 'Failed to learn skill', details: String(error) }, { status: 500 })
  }
}
