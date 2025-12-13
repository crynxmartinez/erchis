'use client'

import { useState, useEffect } from 'react'

// ============================================
// TYPES
// ============================================

interface MonsterSkill {
  id?: string
  tempId?: string
  name: string
  description: string | null
  icon: string
  category: string
  damageType: string
  baseDamage: number
  accuracy: number
  speed: number
  scalesWithAttack: boolean
  scalingPercent: number
  appliesDebuff: string | null
  debuffChance: number
  debuffDuration: number
  debuffValue: number
  appliesBuff: string | null
  buffDuration: number
  buffValue: number
  selfHeal: number
  selfDamage: number
  narrativeUse: string
  narrativeHit: string
  narrativeMiss: string
  narrativeCrit: string
  isDuplicate?: boolean
  isLocked?: boolean
  isSaved?: boolean
}

// ============================================
// CONSTANTS
// ============================================

const CATEGORIES = [
  { id: 'melee', icon: '👊', label: 'Melee', description: 'Close-range attacks' },
  { id: 'ranged', icon: '🎯', label: 'Ranged', description: 'Distance attacks' },
  { id: 'aoe', icon: '💥', label: 'AoE', description: 'Area spells' },
  { id: 'self', icon: '🛡️', label: 'Self', description: 'Self-targeting buffs/heals' },
  { id: 'reactive', icon: '⚡', label: 'Reactive', description: 'Triggered on conditions' },
  { id: 'signature', icon: '⭐', label: 'Signature', description: 'Unique boss skills' },
]

const DEBUFF_TYPES = ['bleed', 'poison', 'burn', 'freeze', 'stun', 'slow', 'blind', 'weaken', 'curse']
const BUFF_TYPES = ['enrage', 'shield', 'regen', 'haste', 'focus', 'fortify', 'sharpen', 'berserk']
const DAMAGE_TYPES = ['physical', 'magic', 'fire', 'ice', 'lightning', 'poison', 'dark', 'true', 'none']

// ============================================
// LOADING SPINNER COMPONENT
// ============================================

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function MonsterSkillDatabase() {
  // Saved skills from database
  const [savedSkills, setSavedSkills] = useState<MonsterSkill[]>([])
  // Generated skills (not yet saved)
  const [generatedSkills, setGeneratedSkills] = useState<MonsterSkill[]>([])
  
  // UI State
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('melee')
  const [selectedSkill, setSelectedSkill] = useState<MonsterSkill | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  // Load saved skills on mount
  useEffect(() => { fetchSavedSkills() }, [])

  const fetchSavedSkills = async () => {
    try {
      const response = await fetch('/api/monster-skills')
      const data = await response.json()
      if (data.success) {
        setSavedSkills(data.skills.map((s: MonsterSkill) => ({ ...s, isSaved: true })))
      }
    } catch (error) {
      console.error('Error fetching skills:', error)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // GENERATE SKILLS
  // ============================================

  const handleGenerate = async () => {
    setGenerating(true)
    setMessage('')
    try {
      const response = await fetch('/api/monster-skills/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: selectedCategory, count: 10 }),
      })
      const data = await response.json()
      if (data.success) {
        setGeneratedSkills(prev => [...prev, ...data.skills])
        setMessage(`Generated ${data.skills.length} ${selectedCategory} skills!`)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Failed to generate skills')
    } finally {
      setGenerating(false)
    }
  }

  // ============================================
  // LOCK/UNLOCK SKILLS
  // ============================================

  const handleToggleLock = (tempId: string) => {
    setGeneratedSkills(prev => prev.map(skill => 
      skill.tempId === tempId ? { ...skill, isLocked: !skill.isLocked } : skill
    ))
  }

  const handleLockAll = () => {
    const categorySkills = generatedSkills.filter(s => s.category === selectedCategory)
    const allLocked = categorySkills.every(s => s.isLocked)
    setGeneratedSkills(prev => prev.map(skill => 
      skill.category === selectedCategory ? { ...skill, isLocked: !allLocked } : skill
    ))
  }

  // ============================================
  // RESET SKILLS
  // ============================================

  const handleReset = () => {
    setResetting(true)
    // Remove all unsaved and unlocked skills for current category
    setGeneratedSkills(prev => prev.filter(skill => 
      skill.category !== selectedCategory || skill.isLocked
    ))
    setMessage('Reset unsaved skills!')
    setResetting(false)
  }

  const handleResetAll = () => {
    if (!confirm('Reset ALL unsaved and unlocked skills across all categories?')) return
    setResetting(true)
    setGeneratedSkills(prev => prev.filter(skill => skill.isLocked))
    setMessage('Reset all unsaved skills!')
    setResetting(false)
  }

  // ============================================
  // SAVE SKILLS
  // ============================================

  const handleOpenPreview = () => {
    const lockedSkills = generatedSkills.filter(s => s.isLocked && !s.isDuplicate)
    if (lockedSkills.length === 0) {
      setMessage('No locked skills to save. Lock skills first!')
      return
    }
    setShowPreviewModal(true)
  }

  const handleSaveAll = async () => {
    const skillsToSave = generatedSkills.filter(s => s.isLocked && !s.isDuplicate)
    if (skillsToSave.length === 0) return

    setSaving(true)
    setMessage('')
    let savedCount = 0
    let errorCount = 0

    for (const skill of skillsToSave) {
      try {
        const response = await fetch('/api/monster-skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(skill),
        })
        const data = await response.json()
        if (data.success) {
          savedCount++
          // Remove from generated, add to saved
          setGeneratedSkills(prev => prev.filter(s => s.tempId !== skill.tempId))
          setSavedSkills(prev => [...prev, { ...data.skill, isSaved: true }])
        } else {
          errorCount++
        }
      } catch {
        errorCount++
      }
    }

    setMessage(`Saved ${savedCount} skills${errorCount > 0 ? `, ${errorCount} failed` : ''}!`)
    setSaving(false)
    setShowPreviewModal(false)
  }

  // ============================================
  // DELETE SAVED SKILL
  // ============================================

  const handleDeleteSaved = async (id: string) => {
    if (!confirm('Delete this saved skill?')) return
    try {
      const response = await fetch(`/api/monster-skills?id=${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        setSavedSkills(prev => prev.filter(s => s.id !== id))
        setMessage('Skill deleted!')
        if (selectedSkill?.id === id) setSelectedSkill(null)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch {
      setMessage('Failed to delete skill')
    }
  }

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const categoryGeneratedSkills = generatedSkills.filter(s => s.category === selectedCategory)
  const categorySavedSkills = savedSkills.filter(s => s.category === selectedCategory)
  const lockedCount = generatedSkills.filter(s => s.isLocked).length
  const totalSaved = savedSkills.length

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <Spinner /> <span className="ml-2">Loading...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#6eb5ff]">Monster Skill Database</h1>
            <p className="text-gray-400 text-sm">
              {totalSaved} saved • {lockedCount} locked • {generatedSkills.length} generated
            </p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('Error') || message.includes('failed') ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Category Sidebar */}
          <div className="col-span-2 bg-[#1a1a1a] rounded-lg border border-[#333] p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Categories</h3>
            <div className="space-y-1">
              {CATEGORIES.map(cat => {
                const genCount = generatedSkills.filter(s => s.category === cat.id).length
                const savedCount = savedSkills.filter(s => s.category === cat.id).length
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-[#6eb5ff]/20 border border-[#6eb5ff]'
                        : 'bg-[#2a2a2a] hover:bg-[#333] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-sm font-medium">{cat.label}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {savedCount} saved {genCount > 0 && `• ${genCount} new`}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Stats */}
            <div className="mt-6 pt-4 border-t border-[#333]">
              <div className="text-xs text-gray-500 space-y-1">
                <div>✅ Saved: {totalSaved}</div>
                <div>🔒 Locked: {lockedCount}</div>
                <div>⚪ Unsaved: {generatedSkills.filter(s => !s.isLocked).length}</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-10 space-y-6">
            {/* Action Bar */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{CATEGORIES.find(c => c.id === selectedCategory)?.icon}</span>
                  <div>
                    <h2 className="text-lg font-semibold">{CATEGORIES.find(c => c.id === selectedCategory)?.label} Skills</h2>
                    <p className="text-xs text-gray-500">{CATEGORIES.find(c => c.id === selectedCategory)?.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {generating ? <Spinner /> : '🎲'} Generate 10
                  </button>
                  <button
                    onClick={handleLockAll}
                    disabled={categoryGeneratedSkills.length === 0}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {categoryGeneratedSkills.every(s => s.isLocked) ? '🔓 Unlock All' : '🔒 Lock All'}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={resetting || categoryGeneratedSkills.filter(s => !s.isLocked).length === 0}
                    className="px-4 py-2 bg-red-600/50 hover:bg-red-600 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {resetting ? <Spinner /> : '🔃'} Reset
                  </button>
                  <button
                    onClick={handleOpenPreview}
                    disabled={saving || lockedCount === 0}
                    className="px-4 py-2 bg-[#6eb5ff] hover:bg-[#8ec5ff] text-black rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? <Spinner /> : '💾'} Save ({lockedCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Skills */}
            {categoryGeneratedSkills.length > 0 && (
              <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-4">
                <h3 className="text-sm font-semibold text-yellow-400 mb-3">Generated Skills (Not Saved)</h3>
                <div className="grid grid-cols-2 gap-3">
                  {categoryGeneratedSkills.map(skill => (
                    <div
                      key={skill.tempId}
                      onClick={() => setSelectedSkill(skill)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        skill.isDuplicate
                          ? 'bg-red-900/20 border-red-500/50'
                          : skill.isLocked
                          ? 'bg-yellow-900/20 border-yellow-500/50'
                          : 'bg-[#2a2a2a] border-[#444] hover:border-[#666]'
                      } ${selectedSkill?.tempId === skill.tempId ? 'ring-2 ring-[#6eb5ff]' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{skill.icon}</span>
                          <div>
                            <div className="font-medium text-sm flex items-center gap-1">
                              {skill.name}
                              {skill.isDuplicate && <span className="text-red-400 text-xs">⚠️ Duplicate</span>}
                            </div>
                            <div className="text-xs text-gray-500">
                              {skill.baseDamage > 0 ? `${skill.baseDamage} dmg` : 'No damage'} • {skill.accuracy}% acc • {skill.speed} spd
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleLock(skill.tempId!) }}
                            className={`p-1 rounded ${skill.isLocked ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-300'}`}
                          >
                            {skill.isLocked ? '🔒' : '⚪'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Skills */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-4">
              <h3 className="text-sm font-semibold text-green-400 mb-3">Saved Skills ({categorySavedSkills.length})</h3>
              {categorySavedSkills.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No saved {selectedCategory} skills yet. Generate and save some!
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {categorySavedSkills.map(skill => (
                    <div
                      key={skill.id}
                      onClick={() => setSelectedSkill(skill)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors bg-[#2a2a2a] border-[#444] hover:border-[#666] ${
                        selectedSkill?.id === skill.id ? 'ring-2 ring-[#6eb5ff]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{skill.icon}</span>
                          <div>
                            <div className="font-medium text-sm flex items-center gap-1">
                              {skill.name}
                              <span className="text-green-400 text-xs">✅</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {skill.baseDamage > 0 ? `${skill.baseDamage} dmg` : 'No damage'} • {skill.accuracy}% acc • {skill.speed} spd
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteSaved(skill.id!) }}
                          className="p-1 rounded text-red-400 hover:text-red-300"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Skill Detail Panel */}
            {selectedSkill && (
              <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-4">
                <h3 className="text-sm font-semibold text-[#6eb5ff] mb-3">Skill Details: {selectedSkill.name}</h3>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <span className="ml-2">{selectedSkill.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Damage Type:</span>
                    <span className="ml-2">{selectedSkill.damageType}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Base Damage:</span>
                    <span className="ml-2">{selectedSkill.baseDamage}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Accuracy:</span>
                    <span className="ml-2">{selectedSkill.accuracy}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Speed:</span>
                    <span className="ml-2">{selectedSkill.speed}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Scaling:</span>
                    <span className="ml-2">{selectedSkill.scalesWithAttack ? `${selectedSkill.scalingPercent}%` : 'None'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Debuff:</span>
                    <span className="ml-2">{selectedSkill.appliesDebuff || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Buff:</span>
                    <span className="ml-2">{selectedSkill.appliesBuff || 'None'}</span>
                  </div>
                </div>
                {selectedSkill.description && (
                  <div className="mt-3 text-sm text-gray-400">
                    {selectedSkill.description}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Save Preview</h2>
            <p className="text-sm text-gray-400 mb-4">
              The following {generatedSkills.filter(s => s.isLocked && !s.isDuplicate).length} skills will be saved:
            </p>
            <div className="space-y-2 mb-6">
              {generatedSkills.filter(s => s.isLocked && !s.isDuplicate).map(skill => (
                <div key={skill.tempId} className="flex items-center gap-2 p-2 bg-[#2a2a2a] rounded">
                  <span>{skill.icon}</span>
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-xs text-gray-500">({skill.category})</span>
                </div>
              ))}
            </div>
            {generatedSkills.filter(s => s.isLocked && s.isDuplicate).length > 0 && (
              <div className="mb-4 p-3 bg-red-900/30 rounded-lg">
                <p className="text-sm text-red-300">
                  ⚠️ {generatedSkills.filter(s => s.isLocked && s.isDuplicate).length} duplicate skills will be skipped.
                </p>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-[#333] hover:bg-[#444] rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="px-4 py-2 bg-[#6eb5ff] hover:bg-[#8ec5ff] text-black rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Spinner /> : null} Confirm Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
