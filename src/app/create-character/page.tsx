'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Race {
  id: string
  name: string
  description: string
  passive1Name: string
  passive1Type: string
  passive1Value: number
  passive2Name: string
  passive2Type: string
  passive2Value: number
}

const PASSIVE_DESCRIPTIONS: Record<string, string> = {
  expGain: 'Bonus experience points from all sources',
  cookingSuccess: 'Increased success rate when cooking food',
  magicAmp: 'Amplifies magic damage dealt',
  accuracy: 'Increases chance to hit enemies',
  npcDiscount: 'Reduced prices when buying from NPCs',
  alchemySuccess: 'Increased success rate when crafting potions',
  craftingSuccess: 'Increased success rate when crafting weapons/armor',
  weightCapacity: 'Increases maximum carry weight',
  physicalDamage: 'Bonus physical damage dealt',
  maxHp: 'Increases maximum health points',
  evasion: 'Increases chance to dodge attacks',
  critChance: 'Increases chance to land critical hits',
  dropRate: 'Increases item drop rate from enemies',
  debuffResist: 'Reduces duration of negative effects',
  critDamage: 'Increases damage dealt by critical hits',
  cdr: 'Reduces skill cooldown times',
}

const STAT_INFO = {
  str: { name: 'STR', description: 'Strength - Physical damage & crit damage' },
  agi: { name: 'AGI', description: 'Agility - Evasion & accuracy' },
  vit: { name: 'VIT', description: 'Vitality - Max HP & heal bonus' },
  int: { name: 'INT', description: 'Intelligence - Magic amp & debuff resist' },
  dex: { name: 'DEX', description: 'Dexterity - Crit chance & cooldown reduction' },
  luk: { name: 'LUK', description: 'Luck - Drop rate & rare encounters' },
}

type StatKey = keyof typeof STAT_INFO

export default function CreateCharacterPage() {
  const router = useRouter()
  const [races, setRaces] = useState<Race[]>([])
  const [selectedRace, setSelectedRace] = useState<Race | null>(null)
  const [stats, setStats] = useState({
    str: 0,
    agi: 0,
    vit: 0,
    int: 0,
    dex: 0,
    luk: 0,
  })
  const [remainingPoints, setRemainingPoints] = useState(25)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRaces()
  }, [])

  async function fetchRaces() {
    try {
      const res = await fetch('/api/races')
      if (res.ok) {
        const data = await res.json()
        setRaces(data)
      }
    } catch (err) {
      console.error('Failed to fetch races:', err)
    } finally {
      setIsLoading(false)
    }
  }

  function handleStatChange(stat: StatKey, delta: number) {
    const newValue = stats[stat] + delta
    if (newValue < 0) return
    if (delta > 0 && remainingPoints <= 0) return

    setStats(prev => ({ ...prev, [stat]: newValue }))
    setRemainingPoints(prev => prev - delta)
  }

  async function handleSubmit() {
    if (!selectedRace) {
      setError('Please select a race')
      return
    }
    if (remainingPoints > 0) {
      setError('Please distribute all stat points')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/create-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raceId: selectedRace.id,
          stats,
        }),
      })

      if (res.ok) {
        router.push('/dashboard')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create character')
      }
    } catch (err) {
      setError('Failed to create character')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Create Your Character</h1>
        <p className="text-gray-400 text-center mb-8">Choose your race and distribute your stats wisely</p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded mb-6 text-center">
            {error}
          </div>
        )}

        {/* Race Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[#6eb5ff]">Select Race</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {races.map(race => (
              <button
                key={race.id}
                onClick={() => setSelectedRace(race)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedRace?.id === race.id
                    ? 'border-[#6eb5ff] bg-[#6eb5ff]/10'
                    : 'border-[#333] bg-[#1e1e1e] hover:border-[#555]'
                }`}
              >
                <div className="font-semibold mb-1">{race.name}</div>
                <div className="text-xs text-gray-400 line-clamp-2">{race.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Race Info */}
        {selectedRace && (
          <div className="mb-8 bg-[#1e1e1e] border border-[#333] rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-[#6eb5ff]">{selectedRace.name}</h3>
            <p className="text-gray-300 text-sm mb-4">{selectedRace.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="group relative">
                <div className="text-green-400 text-sm">
                  +{selectedRace.passive1Value}% {selectedRace.passive1Name}
                </div>
                <div className="text-xs text-gray-500">
                  {PASSIVE_DESCRIPTIONS[selectedRace.passive1Type]}
                </div>
              </div>
              <div className="group relative">
                <div className="text-green-400 text-sm">
                  +{selectedRace.passive2Value}% {selectedRace.passive2Name}
                </div>
                <div className="text-xs text-gray-500">
                  {PASSIVE_DESCRIPTIONS[selectedRace.passive2Type]}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stat Distribution */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#6eb5ff]">Distribute Stats</h2>
            <div className={`text-lg font-bold ${remainingPoints > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
              Points: {remainingPoints}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(Object.keys(STAT_INFO) as StatKey[]).map(stat => (
              <div
                key={stat}
                className="bg-[#1e1e1e] border border-[#333] rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-bold text-lg">{STAT_INFO[stat].name}</span>
                  </div>
                  <span className="text-2xl font-bold text-[#6eb5ff]">{stats[stat]}</span>
                </div>
                <div className="text-xs text-gray-400 mb-3">{STAT_INFO[stat].description}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatChange(stat, -1)}
                    disabled={stats[stat] <= 0}
                    className="flex-1 py-1 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-30 disabled:cursor-not-allowed rounded text-red-400 font-bold"
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleStatChange(stat, 1)}
                    disabled={remainingPoints <= 0}
                    className="flex-1 py-1 bg-green-500/20 hover:bg-green-500/30 disabled:opacity-30 disabled:cursor-not-allowed rounded text-green-400 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedRace || remainingPoints > 0 || isSubmitting}
          className="w-full py-4 bg-[#6eb5ff] hover:bg-[#5aa5ef] disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold text-lg transition-colors"
        >
          {isSubmitting ? 'Creating Character...' : 'Create Character'}
        </button>
      </div>
    </div>
  )
}
