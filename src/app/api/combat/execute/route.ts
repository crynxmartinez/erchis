import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { calculateMaxHp } from '@/lib/player'

interface QueuedActionInput {
  type: 'skill' | 'item'
  id: string
  name: string
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { sessionId, playerQueue } = await request.json() as {
      sessionId: string
      playerQueue: QueuedActionInput[]
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Get player
    const player = await prisma.player.findFirst({
      where: { userId },
      include: { 
        user: true,
        skills: { include: { skill: true } },
      },
    })

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Get combat session
    const session = await prisma.combatSession.findFirst({
      where: {
        id: sessionId,
        playerId: player.id,
        status: 'active',
      },
      include: {
        monster: { 
          include: { 
            skills: {
              include: { monsterSkill: true }
            }
          } 
        },
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Combat session not found' }, { status: 404 })
    }

    // Validate player queue (max 5 actions)
    if (playerQueue.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 actions per turn' }, { status: 400 })
    }

    // Calculate total AP cost
    let totalApCost = 0
    for (const action of playerQueue) {
      if (action.type === 'skill') {
        const playerSkill = player.skills.find(ps => ps.skillId === action.id)
        if (playerSkill) {
          totalApCost += playerSkill.skill.apCost
        }
      }
    }

    // Execute turn logic
    const narrativeLines: string[] = []
    let playerHp = session.playerHp
    let playerAp = session.playerAp
    let monsterHp = session.monsterHp
    const skillUseCounts: Record<string, number> = {}

    // Process player actions
    for (const action of playerQueue) {
      if (action.type === 'skill') {
        const playerSkill = player.skills.find(ps => ps.skillId === action.id)
        if (!playerSkill) continue

        const skill = playerSkill.skill

        // Check AP
        if (playerAp < skill.apCost) {
          narrativeLines.push(`You lack the energy to use ${skill.name}.`)
          break
        }

        // Consume AP
        playerAp -= skill.apCost

        // Track skill use
        skillUseCounts[skill.id] = (skillUseCounts[skill.id] || 0) + 1

        // Calculate damage (simplified)
        const baseDamage = skill.ampPercent
        const variance = 0.9 + Math.random() * 0.2
        const damage = Math.floor(baseDamage * variance)

        // Apply damage
        monsterHp = Math.max(0, monsterHp - damage)

        // Add narrative
        if (skill.executionDescription) {
          narrativeLines.push(skill.executionDescription)
        }
        narrativeLines.push(`Your ${skill.name} deals ${damage} damage to ${session.monster.name}!`)

        // Check if monster defeated
        if (monsterHp <= 0) {
          narrativeLines.push(`${session.monster.name} is defeated!`)
          break
        }
      }
    }

    // Process monster actions if still alive
    const enemyQueue = session.enemyQueue as { skillId: string; skillName: string }[]
    if (monsterHp > 0 && enemyQueue.length > 0) {
      for (const enemyAction of enemyQueue) {
        // Find the skill assignment and get the actual skill
        const skillAssignment = session.monster.skills.find(
          (sa: { monsterSkillId: string }) => sa.monsterSkillId === enemyAction.skillId
        )
        if (!skillAssignment || !skillAssignment.monsterSkill) continue

        const monsterSkill = skillAssignment.monsterSkill

        // Calculate monster damage (use override if set)
        const accuracy = skillAssignment.accuracyOverride ?? monsterSkill.accuracy
        const baseDamage = skillAssignment.damageOverride ?? monsterSkill.baseDamage

        const hitRoll = Math.random() * 100
        const hitChance = accuracy - (player.agi * 0.5)

        if (hitRoll < hitChance) {
          // Hit
          const damage = Math.max(1, baseDamage - Math.floor(player.vit * 0.5))
          playerHp = Math.max(0, playerHp - damage)

          narrativeLines.push(monsterSkill.narrativeUse)
          narrativeLines.push(monsterSkill.narrativeHit.replace('{damage}', String(damage)))
        } else {
          // Miss
          narrativeLines.push(monsterSkill.narrativeMiss)
        }

        if (playerHp <= 0) {
          narrativeLines.push('You have been defeated...')
          break
        }
      }
    }

    // Determine combat status
    let newStatus: 'active' | 'won' | 'lost' = 'active'
    let xpGained = 0
    let colGained = 0

    if (monsterHp <= 0) {
      newStatus = 'won'
      xpGained = session.monster.xpReward
      colGained = session.monster.colReward
      narrativeLines.push(`\nVictory! You gained ${xpGained} XP and ${colGained} Col.`)
    } else if (playerHp <= 0) {
      newStatus = 'lost'
      narrativeLines.push('\nYou wake up back in town...')
    }

    // Update session
    await prisma.combatSession.update({
      where: { id: session.id },
      data: {
        playerHp,
        playerAp,
        monsterHp,
        turn: session.turn + 1,
        status: newStatus,
        endedAt: newStatus !== 'active' ? new Date() : undefined,
      },
    })

    // Create combat log entry
    await prisma.combatLog.create({
      data: {
        sessionId: session.id,
        turn: session.turn,
        sequenceOrder: 1,
        actor: 'player',
        actionType: 'skill',
        actionName: playerQueue.map(a => a.name).join(', ') || 'Attack',
        target: 'monster',
        didHit: true,
        narration: narrativeLines.join('\n\n'),
      },
    })

    // Update player skill use counts
    for (const [skillId, count] of Object.entries(skillUseCounts)) {
      await prisma.playerSkill.updateMany({
        where: {
          playerId: player.id,
          skillId,
        },
        data: {
          useCount: { increment: count },
        },
      })
    }

    // Update player if combat ended
    if (newStatus === 'won') {
      await prisma.player.update({
        where: { id: player.id },
        data: {
          currentHp: playerHp,
          currentAp: playerAp,
          currentXp: { increment: xpGained },
          totalXpEarned: { increment: xpGained },
          col: { increment: colGained },
        },
      })
    } else if (newStatus === 'lost') {
      // Respawn with reduced col
      const colLost = Math.floor(player.col * 0.1)
      await prisma.player.update({
        where: { id: player.id },
        data: {
          currentHp: calculateMaxHp(player.vit),
          currentAp: player.maxAp,
          col: { decrement: colLost },
        },
      })
    } else {
      // Update HP/AP
      await prisma.player.update({
        where: { id: player.id },
        data: {
          currentHp: playerHp,
          currentAp: playerAp,
        },
      })
    }

    return NextResponse.json({
      success: true,
      turn: session.turn + 1,
      status: newStatus,
      narrative: narrativeLines.join('\n\n'),
      player: {
        hp: playerHp,
        ap: playerAp,
      },
      monster: {
        hp: monsterHp,
        maxHp: session.monster.maxHp,
      },
      rewards: newStatus === 'won' ? { xp: xpGained, col: colGained } : undefined,
      skillUseCounts,
    })
  } catch (error) {
    console.error('Combat execute error:', error)
    return NextResponse.json(
      { error: 'Failed to execute combat turn' },
      { status: 500 }
    )
  }
}
