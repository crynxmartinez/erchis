'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { SKILL_TYPE_CATEGORIES, StarterSkill } from '@/data/universal-skills-data'

// Rarity/damage type colors
const DAMAGE_COLORS: Record<string, string> = {
  physical: 'text-red-400',
  magic: 'text-purple-400',
  none: 'text-gray-400',
}

const WEAPON_LABELS: Record<string, { label: string; color: string }> = {
  melee_only: { label: 'Melee', color: 'bg-red-900/50 text-red-300' },
  ranged_only: { label: 'Ranged', color: 'bg-green-900/50 text-green-300' },
  magic_only: { label: 'Magic', color: 'bg-purple-900/50 text-purple-300' },
  any: { label: 'Universal', color: 'bg-blue-900/50 text-blue-300' },
}

export default function ArcaneArchivesPage() {
  const params = useParams()
  const router = useRouter()
  const floorId = params.id as string
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<StarterSkill | null>(null)
  const [learning, setLearning] = useState(false)
  const [message, setMessage] = useState('')

  const currentCategory = SKILL_TYPE_CATEGORIES.find(c => c.id === selectedCategory)

  const handleLearnSkill = async (skill: StarterSkill) => {
    setLearning(true)
    setMessage('')
    try {
      const response = await fetch('/api/player/learn-skill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillName: skill.name }),
      })
      const data = await response.json()
      if (data.success) {
        setMessage(`✅ Learned ${skill.name}!`)
      } else {
        setMessage(`❌ ${data.error || 'Failed to learn skill'}`)
      }
    } catch {
      setMessage('❌ Failed to learn skill')
    }
    setLearning(false)
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1e1e2e] to-[#2a1a3a] border-b border-purple-500/30 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href={`/floor/${floorId}/town`}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Town
            </Link>
            <div className="h-6 w-px bg-gray-600" />
            <div className="flex items-center gap-3">
              <span className="text-3xl">📚</span>
              <div>
                <h1 className="text-xl font-bold text-purple-300">Arcane Archives</h1>
                <p className="text-sm text-gray-400">Learn new skills from Argo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* NPC Dialog */}
        <div className="bg-[#242424] rounded-lg border border-purple-500/30 p-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-purple-900/50 flex items-center justify-center text-3xl border-2 border-purple-500/50">
              🧙‍♀️
            </div>
            <div className="flex-1">
              <p className="text-purple-300 font-bold mb-1">Argo the Rat</p>
              <p className="text-gray-300 italic">
                {selectedSkill 
                  ? `"${selectedSkill.name}? A fine choice! This skill costs nothing to learn - consider it a gift for new adventurers."`
                  : selectedCategory 
                    ? `"Ah, interested in ${currentCategory?.name}? Browse through and pick what suits your style!"`
                    : `"Welcome to the Arcane Archives! Here you can learn the basic skills every adventurer needs. Choose a category to begin."`
                }
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg border ${message.includes('✅') ? 'bg-green-900/30 border-green-500/50 text-green-300' : 'bg-red-900/30 border-red-500/50 text-red-300'}`}>
            {message}
          </div>
        )}

        {/* Category Selection */}
        {!selectedCategory && (
          <div className="grid grid-cols-3 gap-4">
            {SKILL_TYPE_CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="bg-[#242424] rounded-lg border border-[#333] p-4 hover:border-purple-500/50 hover:bg-[#2a2a2a] transition-all text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{category.icon}</span>
                  <span className="font-bold text-white group-hover:text-purple-300 transition-colors">{category.name}</span>
                </div>
                <p className="text-sm text-gray-400 mb-3">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded ${WEAPON_LABELS[category.weaponRequirement].color}`}>
                    {WEAPON_LABELS[category.weaponRequirement].label}
                  </span>
                  <span className="text-xs text-gray-500">{category.skills.length} skills</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Skill List */}
        {selectedCategory && !selectedSkill && (
          <div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
            >
              ← Back to Categories
            </button>
            
            <h2 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
              <span>{currentCategory?.icon}</span>
              {currentCategory?.name} Skills
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {currentCategory?.skills.map(skill => (
                <button
                  key={skill.name}
                  onClick={() => setSelectedSkill(skill)}
                  className="bg-[#242424] rounded-lg border border-[#333] p-4 hover:border-purple-500/50 hover:bg-[#2a2a2a] transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">{skill.name}</span>
                    <span className={`text-xs ${DAMAGE_COLORS[skill.damageType]}`}>
                      {skill.damageType.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2 line-clamp-2">{skill.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>⚡ {skill.apCost} AP</span>
                    <span>🔄 {skill.cooldown} CD</span>
                    <span>📏 {skill.range} Range</span>
                    {skill.ampPercent > 0 && <span>💥 {skill.ampPercent}%</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Skill Detail */}
        {selectedSkill && (
          <div>
            <button
              onClick={() => setSelectedSkill(null)}
              className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
            >
              ← Back to {currentCategory?.name}
            </button>

            <div className="bg-[#242424] rounded-lg border border-purple-500/30 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedSkill.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${DAMAGE_COLORS[selectedSkill.damageType]}`}>
                      {selectedSkill.damageType.toUpperCase()}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-sm text-gray-400">{selectedSkill.subtype}</span>
                  </div>
                </div>
                <span className="text-3xl">{currentCategory?.icon}</span>
              </div>

              <p className="text-gray-300 mb-6">{selectedSkill.description}</p>

              {selectedSkill.narrativeUse && (
                <div className="bg-black/30 rounded-lg p-4 mb-6 border-l-4 border-purple-500">
                  <p className="text-purple-300 italic">"{selectedSkill.narrativeUse}"</p>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-black/30 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">AP Cost</div>
                  <div className="text-xl font-bold text-blue-400">{selectedSkill.apCost}</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">Cooldown</div>
                  <div className="text-xl font-bold text-yellow-400">{selectedSkill.cooldown}</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">Range</div>
                  <div className="text-xl font-bold text-green-400">{selectedSkill.range}</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">Power</div>
                  <div className="text-xl font-bold text-red-400">{selectedSkill.ampPercent}%</div>
                </div>
              </div>

              {/* Effects */}
              {(selectedSkill.buffType || selectedSkill.debuffType) && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-400 mb-2">EFFECTS</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkill.buffType && (
                      <span className="px-3 py-1 bg-green-900/30 border border-green-500/50 rounded-full text-green-300 text-sm">
                        +{selectedSkill.buffType.replace(/_/g, ' ')} ({selectedSkill.buffDuration} turns)
                      </span>
                    )}
                    {selectedSkill.debuffType && (
                      <span className="px-3 py-1 bg-red-900/30 border border-red-500/50 rounded-full text-red-300 text-sm">
                        {selectedSkill.debuffType.replace(/_/g, ' ')} ({selectedSkill.debuffChance}% chance, {selectedSkill.debuffDuration} turns)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Learn Button */}
              <div className="flex items-center justify-between pt-4 border-t border-[#333]">
                <div className="text-gray-400">
                  <span className="text-green-400 font-bold">FREE</span> - Starter skill
                </div>
                <button
                  onClick={() => handleLearnSkill(selectedSkill)}
                  disabled={learning}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-lg font-bold text-white transition-all disabled:opacity-50"
                >
                  {learning ? 'Learning...' : '📖 Learn Skill'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
