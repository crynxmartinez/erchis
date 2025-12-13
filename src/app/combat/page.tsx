'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CombatScreen } from '@/components/combat'

interface CombatState {
  sessionId: string
  turn: number
  status: 'active' | 'won' | 'lost' | 'fled'
  player: {
    hp: number
    maxHp: number
    ap: number
    maxAp: number
    buffs: string[]
    debuffs: string[]
  }
  monster: {
    id: string
    name: string
    level: number
    hp: number
    maxHp: number
    imageUrl?: string
    intent?: string
    buffs: string[]
    debuffs: string[]
  }
  narrative: string
}

interface Skill {
  id: string
  name: string
  apCost: number
  icon?: string
}

function CombatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [combatState, setCombatState] = useState<CombatState | null>(null)
  const [playerSkills, setPlayerSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initCombat = async () => {
      try {
        // Check if we have an existing session
        const sessionRes = await fetch('/api/combat/session')
        const sessionData = await sessionRes.json()

        if (sessionData.inCombat && sessionData.session) {
          // Resume existing combat
          setCombatState({
            sessionId: sessionData.session.id,
            turn: sessionData.session.turn,
            status: sessionData.session.status,
            player: {
              hp: sessionData.session.player.hp,
              maxHp: 100, // TODO: Get from player data
              ap: sessionData.session.player.ap,
              maxAp: 100,
              buffs: [],
              debuffs: [],
            },
            monster: {
              id: sessionData.session.monster.id,
              name: sessionData.session.monster.name,
              level: sessionData.session.monster.level,
              hp: sessionData.session.monster.hp,
              maxHp: sessionData.session.monster.maxHp,
              imageUrl: sessionData.session.monster.imageUrl,
              intent: 'Attack',
              buffs: [],
              debuffs: [],
            },
            narrative: sessionData.session.logs?.map((l: { narration: string }) => l.narration).join('\n\n') || '',
          })
        } else {
          // Start new combat
          const monsterId = searchParams.get('monster')
          const areaId = searchParams.get('area')

          if (!monsterId && !areaId) {
            setError('No monster or area specified')
            setLoading(false)
            return
          }

          const startRes = await fetch('/api/combat/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ monsterId, areaId }),
          })

          const startData = await startRes.json()

          if (!startData.success) {
            setError(startData.error || 'Failed to start combat')
            setLoading(false)
            return
          }

          setCombatState({
            sessionId: startData.sessionId,
            turn: startData.turn,
            status: 'active',
            player: {
              hp: startData.player.hp,
              maxHp: startData.player.maxHp,
              ap: startData.player.ap,
              maxAp: startData.player.maxAp,
              buffs: [],
              debuffs: [],
            },
            monster: {
              id: startData.monster.id,
              name: startData.monster.name,
              level: startData.monster.level,
              hp: startData.monster.hp,
              maxHp: startData.monster.maxHp,
              imageUrl: startData.monster.imageUrl,
              intent: startData.monster.intent,
              buffs: [],
              debuffs: [],
            },
            narrative: `You encounter a ${startData.monster.name}! Prepare for battle!`,
          })
        }

        // Fetch player skills
        const skillsRes = await fetch('/api/skills/get')
        const skillsData = await skillsRes.json()

        if (skillsData.skills) {
          setPlayerSkills(skillsData.skills.map((s: { id: string; name: string; apCost: number }) => ({
            id: s.id,
            name: s.name,
            apCost: s.apCost || 5,
            icon: '⚔️',
          })))
        }

        setLoading(false)
      } catch (err) {
        console.error('Combat init error:', err)
        setError('Failed to initialize combat')
        setLoading(false)
      }
    }

    initCombat()
  }, [searchParams])

  const handleCombatEnd = (result: 'won' | 'lost' | 'fled', rewards?: { xp: number; col: number }) => {
    // Navigate back to map after combat ends
    setTimeout(() => {
      router.push('/floor/1/map')
    }, 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚔️</div>
          <p className="text-gray-400">Entering combat...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/floor/1/map')}
            className="px-4 py-2 bg-[#333] text-white rounded-lg hover:bg-[#444]"
          >
            Return to Map
          </button>
        </div>
      </div>
    )
  }

  if (!combatState) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-400">No combat session found</p>
      </div>
    )
  }

  return (
    <CombatScreen
      initialState={combatState}
      playerSkills={playerSkills}
      onCombatEnd={handleCombatEnd}
    />
  )
}

export default function CombatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚔️</div>
          <p className="text-gray-400">Loading combat...</p>
        </div>
      </div>
    }>
      <CombatContent />
    </Suspense>
  )
}
