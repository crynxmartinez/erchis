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
// STAT CARD COMPONENT
// ============================================

function StatCard({ label, value, color, icon, unit = '' }: { 
  label: string
  value: number | string
  color: string
  icon?: string
  unit?: string
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-black/60 to-black/40 p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1">
          {icon && <span>{icon}</span>}
          {label}
        </div>
        <div className={`text-2xl font-bold ${color}`}>
          {value}{unit}
        </div>
      </div>
    </div>
  )
}

// ============================================
// SECTION PANEL COMPONENT
// ============================================

function SectionPanel({ title, icon, children, color = 'border-white/10' }: {
  title: string
  icon: string
  children: React.ReactNode
  color?: string
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl border ${color} bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d]`}>
      <div className="absolute inset-0 opacity-30 pointer-events-none" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} 
      />
      <div className="relative">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-black/30">
          <span className="text-lg">{icon}</span>
          <span className="font-bold text-sm uppercase tracking-wider text-gray-300">{title}</span>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}

// ============================================
// SKILL DETAIL PANEL COMPONENT
// ============================================

function SkillDetailPanel({ skill, onClose }: { skill: MonsterSkill; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'combat' | 'effects' | 'flavor'>('overview')
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'combat', label: 'Combat', icon: '⚔️' },
    { id: 'effects', label: 'Effects', icon: '✨' },
    { id: 'flavor', label: 'Flavor', icon: '📜' },
  ]

  const categoryConfig = CATEGORIES.find(c => c.id === skill.category)
  const getDamageTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      physical: 'text-orange-300',
      magic: 'text-purple-300',
      fire: 'text-red-400',
      ice: 'text-cyan-300',
      lightning: 'text-yellow-300',
      poison: 'text-green-400',
      dark: 'text-purple-400',
      true: 'text-white',
      none: 'text-gray-400',
    }
    return colors[type] || 'text-gray-400'
  }

  return (
    <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#1a1a2e] rounded-xl border border-[#333] overflow-hidden">
      {/* Header */}
      <div className="relative p-6 border-b border-[#333]">
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" fill="%23ffffff" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E")' }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6eb5ff]/50 to-transparent" />
        
        <div className="relative flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-black/80 to-black/40 border-2 border-white/20 flex items-center justify-center text-3xl shadow-xl">
              {skill.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{skill.name}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-bold border border-[#6eb5ff]/50 bg-[#6eb5ff]/20 text-[#6eb5ff]">
                  {categoryConfig?.icon} {categoryConfig?.label}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border border-white/20 bg-black/40 capitalize ${getDamageTypeColor(skill.damageType)}`}>
                  {skill.damageType}
                </span>
                {skill.isSaved && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium border border-green-500/50 bg-green-500/20 text-green-300">
                    ✅ Saved
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#333] bg-[#111]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all border-r border-[#222] flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'bg-[#1a1a1a] text-[#6eb5ff] border-b-2 border-b-[#6eb5ff]' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 bg-gradient-to-b from-[#0a0a0a] to-[#111]">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Base Damage" value={skill.baseDamage} color="text-red-400" icon="💥" />
              <StatCard label="Accuracy" value={skill.accuracy} unit="%" color="text-blue-400" icon="🎯" />
              <StatCard label="Speed" value={skill.speed} color="text-yellow-400" icon="⚡" />
              <StatCard label="Scaling" value={skill.scalesWithAttack ? skill.scalingPercent : 0} unit="%" color="text-purple-400" icon="📈" />
            </div>

            {/* Info Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SectionPanel title="Core Information" icon="📋">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-gray-500 text-sm">Category</span>
                    <span className="text-white font-medium capitalize">{skill.category}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-gray-500 text-sm">Damage Type</span>
                    <span className={`font-medium capitalize ${getDamageTypeColor(skill.damageType)}`}>{skill.damageType}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-gray-500 text-sm">Scales with Attack</span>
                    <span className="text-white font-medium">{skill.scalesWithAttack ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500 text-sm">Self Heal</span>
                    <span className="text-green-400 font-medium">{skill.selfHeal > 0 ? `+${skill.selfHeal} HP` : 'None'}</span>
                  </div>
                </div>
              </SectionPanel>

              <SectionPanel title="Description" icon="📝">
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Effect</div>
                    <p className="text-gray-300 text-sm leading-relaxed">{skill.description || 'No description available.'}</p>
                  </div>
                </div>
              </SectionPanel>
            </div>
          </div>
        )}

        {/* COMBAT TAB */}
        {activeTab === 'combat' && (
          <div className="space-y-6">
            {/* Main Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Base Damage" value={skill.baseDamage} color="text-red-400" icon="💥" />
              <StatCard label="Accuracy" value={skill.accuracy} unit="%" color="text-blue-400" icon="🎯" />
              <StatCard label="Speed" value={skill.speed} color="text-yellow-400" icon="⚡" />
              <StatCard label="Category" value={skill.category} color="text-cyan-300" icon="📂" />
            </div>

            {/* Scaling Info */}
            <SectionPanel title="Damage Scaling" icon="📊">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-white/5">
                  <span className="text-xl">📈</span>
                  <div>
                    <div className="text-xs text-gray-500">Scales with Attack</div>
                    <div className={`font-bold ${skill.scalesWithAttack ? 'text-green-400' : 'text-gray-500'}`}>
                      {skill.scalesWithAttack ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
                {skill.scalesWithAttack && (
                  <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-white/5">
                    <span className="text-xl">💯</span>
                    <div>
                      <div className="text-xs text-gray-500">Scaling Percent</div>
                      <div className="text-purple-400 font-bold">{skill.scalingPercent}%</div>
                    </div>
                  </div>
                )}
                {skill.selfDamage > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                    <span className="text-xl">💔</span>
                    <div>
                      <div className="text-xs text-gray-500">Self Damage</div>
                      <div className="text-red-400 font-bold">{skill.selfDamage}</div>
                    </div>
                  </div>
                )}
              </div>
            </SectionPanel>
          </div>
        )}

        {/* EFFECTS TAB */}
        {activeTab === 'effects' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Buff Effects */}
              <SectionPanel title="Buff Effects (Self)" icon="💪" color="border-yellow-500/30">
                {skill.appliesBuff ? (
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-2xl">
                      💪
                    </div>
                    <div>
                      <div className="text-yellow-300 font-bold text-lg capitalize">{skill.appliesBuff.replace(/_/g, ' ')}</div>
                      <div className="text-gray-400 text-sm">
                        {skill.buffValue > 0 && <span className="text-yellow-400">+{skill.buffValue}</span>}
                        {skill.buffDuration > 0 && <span> for {skill.buffDuration} turns</span>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm py-4 text-center">No buff effects configured</div>
                )}
              </SectionPanel>

              {/* Debuff Effects */}
              <SectionPanel title="Debuff Effects (Enemy)" icon="💀" color="border-purple-500/30">
                {skill.appliesDebuff ? (
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-2xl">
                      💀
                    </div>
                    <div>
                      <div className="text-purple-300 font-bold text-lg capitalize">{skill.appliesDebuff.replace(/_/g, ' ')}</div>
                      <div className="text-gray-400 text-sm">
                        {skill.debuffValue > 0 && <span className="text-purple-400">{skill.debuffValue}</span>}
                        {skill.debuffDuration > 0 && <span> for {skill.debuffDuration} turns</span>}
                        {skill.debuffChance < 100 && <span> ({skill.debuffChance}% chance)</span>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm py-4 text-center">No debuff effects configured</div>
                )}
              </SectionPanel>
            </div>

            {/* Self Heal */}
            {skill.selfHeal > 0 && (
              <SectionPanel title="Self Heal" icon="💚" color="border-green-500/30">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center text-2xl">
                    💚
                  </div>
                  <div>
                    <div className="text-green-300 font-bold text-lg">Heals Self</div>
                    <div className="text-gray-400 text-sm">
                      <span className="text-green-400">+{skill.selfHeal} HP</span> on use
                    </div>
                  </div>
                </div>
              </SectionPanel>
            )}
          </div>
        )}

        {/* FLAVOR TAB */}
        {activeTab === 'flavor' && (
          <div className="space-y-6">
            <SectionPanel title="Effect Description" icon="📝">
              <p className="text-gray-300 leading-relaxed">{skill.description || 'No description available.'}</p>
            </SectionPanel>

            {skill.narrativeUse && (
              <SectionPanel title="Execution Narrative" icon="📜">
                <p className="text-gray-400 italic leading-relaxed">"{skill.narrativeUse}"</p>
              </SectionPanel>
            )}

            {skill.narrativeHit && (
              <SectionPanel title="On Hit" icon="✅" color="border-green-500/30">
                <p className="text-green-300 italic leading-relaxed">"{skill.narrativeHit}"</p>
              </SectionPanel>
            )}

            {skill.narrativeMiss && (
              <SectionPanel title="On Miss" icon="❌" color="border-red-500/30">
                <p className="text-red-300 italic leading-relaxed">"{skill.narrativeMiss}"</p>
              </SectionPanel>
            )}

            {skill.narrativeCrit && (
              <SectionPanel title="On Critical Hit" icon="💥" color="border-yellow-500/30">
                <p className="text-yellow-300 italic leading-relaxed">"{skill.narrativeCrit}"</p>
              </SectionPanel>
            )}
          </div>
        )}
      </div>
    </div>
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

            {/* Skill Detail Panel - Tabbed Interface */}
            {selectedSkill && (
              <SkillDetailPanel 
                skill={selectedSkill} 
                onClose={() => setSelectedSkill(null)} 
              />
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
