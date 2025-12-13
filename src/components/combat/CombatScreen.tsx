'use client'

import { useState, useEffect } from 'react'
import EnemyDisplay from './EnemyDisplay'
import PlayerStatus from './PlayerStatus'
import SkillQueue from './SkillQueue'
import CombatNarrative from './CombatNarrative'

interface Skill {
  id: string
  name: string
  apCost: number
  icon?: string
}

interface QueuedAction {
  id: string
  type: 'skill' | 'item'
  name: string
  apCost: number
  icon?: string
}

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

interface CombatScreenProps {
  initialState: CombatState
  playerSkills: Skill[]
  onCombatEnd: (result: 'won' | 'lost' | 'fled', rewards?: { xp: number; col: number }) => void
}

export default function CombatScreen({
  initialState,
  playerSkills,
  onCombatEnd,
}: CombatScreenProps) {
  const [state, setState] = useState<CombatState>(initialState)
  const [queue, setQueue] = useState<QueuedAction[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [isFleeing, setIsFleeing] = useState(false)

  const addToQueue = (skill: Skill) => {
    if (queue.length >= 5) return
    
    setQueue(prev => [...prev, {
      id: skill.id,
      type: 'skill',
      name: skill.name,
      apCost: skill.apCost,
      icon: skill.icon,
    }])
  }

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index))
  }

  const clearQueue = () => {
    setQueue([])
  }

  const executeTurn = async () => {
    if (queue.length === 0 || isExecuting) return

    setIsExecuting(true)

    try {
      const response = await fetch('/api/combat/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.sessionId,
          playerQueue: queue.map(a => ({
            type: a.type,
            id: a.id,
            name: a.name,
          })),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setState(prev => ({
          ...prev,
          turn: data.turn,
          status: data.status,
          player: {
            ...prev.player,
            hp: data.player.hp,
            ap: data.player.ap,
          },
          monster: {
            ...prev.monster,
            hp: data.monster.hp,
          },
          narrative: prev.narrative + '\n\n---\n\n' + data.narrative,
        }))

        setQueue([])

        if (data.status === 'won' || data.status === 'lost') {
          setTimeout(() => {
            onCombatEnd(data.status, data.rewards)
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Execute turn error:', error)
    } finally {
      setIsExecuting(false)
    }
  }

  const attemptFlee = async () => {
    if (isFleeing) return

    setIsFleeing(true)

    try {
      const response = await fetch('/api/combat/flee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: state.sessionId }),
      })

      const data = await response.json()

      setState(prev => ({
        ...prev,
        status: data.status,
        player: {
          ...prev.player,
          hp: data.playerHp,
        },
        narrative: prev.narrative + '\n\n---\n\n' + data.narrative,
      }))

      if (data.success) {
        setTimeout(() => {
          onCombatEnd('fled')
        }, 1500)
      }
    } catch (error) {
      console.error('Flee error:', error)
    } finally {
      setIsFleeing(false)
    }
  }

  const isActive = state.status === 'active'

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">
            ⚔️ Combat - Turn {state.turn}
          </h1>
          {isActive && (
            <button
              onClick={attemptFlee}
              disabled={isFleeing || isExecuting}
              className="px-4 py-2 bg-[#333] text-gray-300 rounded-lg hover:bg-[#444] transition-colors disabled:opacity-50"
            >
              {isFleeing ? 'Fleeing...' : '🏃 Flee'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Enemy */}
          <div className="space-y-4">
            <EnemyDisplay
              name={state.monster.name}
              level={state.monster.level}
              hp={state.monster.hp}
              maxHp={state.monster.maxHp}
              imageUrl={state.monster.imageUrl}
              intent={state.monster.intent}
              buffs={state.monster.buffs}
              debuffs={state.monster.debuffs}
            />
            <PlayerStatus
              hp={state.player.hp}
              maxHp={state.player.maxHp}
              ap={state.player.ap}
              maxAp={state.player.maxAp}
              buffs={state.player.buffs}
              debuffs={state.player.debuffs}
            />
          </div>

          {/* Center Column - Narrative */}
          <div className="lg:col-span-2">
            <CombatNarrative
              narrative={state.narrative}
              isAnimating={isExecuting}
            />
          </div>
        </div>

        {/* Bottom Section - Queue and Skills */}
        {isActive && (
          <div className="mt-4 space-y-4">
            <SkillQueue
              queue={queue}
              maxSlots={5}
              currentAp={state.player.ap}
              onRemove={removeFromQueue}
              onClear={clearQueue}
              onExecute={executeTurn}
              isExecuting={isExecuting}
            />

            {/* Skill Bar */}
            <div className="bg-[#1a1a1a]/95 border border-[#444] rounded-lg p-4 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-[#6eb5ff] mb-3">
                🎯 Available Skills (Click to add to queue)
              </h3>
              <div className="flex flex-wrap gap-2">
                {playerSkills.map(skill => (
                  <button
                    key={skill.id}
                    onClick={() => addToQueue(skill)}
                    disabled={queue.length >= 5 || isExecuting}
                    className={`
                      px-3 py-2 rounded-lg border transition-all
                      ${queue.length >= 5 || isExecuting
                        ? 'bg-[#1e1e1e] border-[#333] text-gray-500 cursor-not-allowed'
                        : 'bg-[#252525] border-[#444] text-white hover:border-[#6eb5ff] hover:bg-[#2a2a2a]'
                      }
                    `}
                  >
                    <span className="mr-1">{skill.icon || '⚔️'}</span>
                    <span className="text-sm">{skill.name}</span>
                    <span className="ml-2 text-xs text-blue-400">{skill.apCost} AP</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Combat End Overlay */}
        {state.status !== 'active' && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-[#1a1a1a] border border-[#444] rounded-lg p-8 text-center max-w-md">
              {state.status === 'won' && (
                <>
                  <h2 className="text-3xl font-bold text-[#6eb5ff] mb-4">🎉 Victory!</h2>
                  <p className="text-gray-300 mb-4">You defeated {state.monster.name}!</p>
                </>
              )}
              {state.status === 'lost' && (
                <>
                  <h2 className="text-3xl font-bold text-red-400 mb-4">💀 Defeated</h2>
                  <p className="text-gray-300 mb-4">You were defeated by {state.monster.name}...</p>
                </>
              )}
              {state.status === 'fled' && (
                <>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">🏃 Escaped!</h2>
                  <p className="text-gray-300 mb-4">You fled from battle.</p>
                </>
              )}
              <p className="text-sm text-gray-500">Returning to map...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
