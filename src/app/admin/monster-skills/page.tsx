'use client'

import { useState, useEffect } from 'react'
import { MONSTER_SKILL_CATEGORIES, DAMAGE_TYPES, DEBUFF_TYPES, BUFF_TYPES } from '@/data/monster-skills-data'

interface MonsterSkill {
  id: string
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
}

const emptySkill: Omit<MonsterSkill, 'id'> = {
  name: '',
  description: '',
  icon: '👊',
  category: 'attack',
  damageType: 'physical',
  baseDamage: 10,
  accuracy: 100,
  speed: 50,
  scalesWithAttack: true,
  scalingPercent: 100,
  appliesDebuff: null,
  debuffChance: 100,
  debuffDuration: 2,
  debuffValue: 0,
  appliesBuff: null,
  buffDuration: 2,
  buffValue: 0,
  selfHeal: 0,
  selfDamage: 0,
  narrativeUse: 'The monster attacks!',
  narrativeHit: 'The attack connects!',
  narrativeMiss: 'The attack misses!',
  narrativeCrit: 'Critical hit!',
}

export default function MonsterSkillDatabase() {
  const [skills, setSkills] = useState<MonsterSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<MonsterSkill | null>(null)
  const [editForm, setEditForm] = useState<Omit<MonsterSkill, 'id'> & { id?: string }>(emptySkill)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => { fetchSkills() }, [])

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/monster-skills')
      const data = await response.json()
      if (data.success) setSkills(data.skills)
    } catch (error) {
      console.error('Error fetching skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSeedSkills = async () => {
    setSeeding(true)
    setMessage('')
    try {
      const response = await fetch('/api/monster-skills/seed', { method: 'POST' })
      const data = await response.json()
      setMessage(data.success ? data.message : `Error: ${data.error}`)
      if (data.success) fetchSkills()
    } catch (error) {
      setMessage('Failed to seed skills')
    } finally {
      setSeeding(false)
    }
  }

  const handleSelectSkill = (skill: MonsterSkill) => {
    setSelectedSkill(skill)
    setEditForm(skill)
  }

  const handleNewSkill = () => {
    setSelectedSkill(null)
    setEditForm(emptySkill)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const method = editForm.id ? 'PUT' : 'POST'
      const response = await fetch('/api/monster-skills', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await response.json()
      if (data.success) {
        setMessage(editForm.id ? 'Skill updated!' : 'Skill created!')
        fetchSkills()
        if (data.skill) {
          setSelectedSkill(data.skill)
          setEditForm(data.skill)
        }
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Failed to save skill')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedSkill || !confirm(`Delete "${selectedSkill.name}"?`)) return
    try {
      const response = await fetch(`/api/monster-skills?id=${selectedSkill.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        setMessage('Skill deleted!')
        setSelectedSkill(null)
        setEditForm(emptySkill)
        fetchSkills()
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Failed to delete skill')
    }
  }

  const filteredSkills = skills.filter(skill => {
    const matchesCategory = filterCategory === 'all' || skill.category === filterCategory
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const groupedSkills = filteredSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = []
    acc[skill.category].push(skill)
    return acc
  }, {} as Record<string, MonsterSkill[]>)

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#6eb5ff]">Monster Skill Database</h1>
            <p className="text-gray-400 text-sm">{skills.length} skills in database</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSeedSkills} disabled={seeding}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium disabled:opacity-50">
              {seeding ? 'Seeding...' : '🌱 Seed 30 Skills'}
            </button>
            <button onClick={handleNewSkill}
              className="px-4 py-2 bg-[#6eb5ff] hover:bg-[#8ec5ff] text-black rounded-lg text-sm font-medium">
              + New Skill
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Skill List */}
          <div className="col-span-4 bg-[#1a1a1a] rounded-lg border border-[#333] p-4">
            <div className="mb-4 space-y-3">
              <input type="text" placeholder="Search skills..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-sm" />
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilterCategory('all')}
                  className={`px-3 py-1 rounded text-xs font-medium ${filterCategory === 'all' ? 'bg-[#6eb5ff] text-black' : 'bg-[#333] text-gray-300'}`}>
                  All
                </button>
                {MONSTER_SKILL_CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setFilterCategory(cat.id)}
                    className={`px-3 py-1 rounded text-xs font-medium ${filterCategory === cat.id ? 'bg-[#6eb5ff] text-black' : 'bg-[#333] text-gray-300'}`}>
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                <div key={category}>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1 mt-3">
                    {MONSTER_SKILL_CATEGORIES.find(c => c.id === category)?.name || category}
                  </div>
                  {categorySkills.map(skill => (
                    <button key={skill.id} onClick={() => handleSelectSkill(skill)}
                      className={`w-full text-left p-2 rounded-lg flex items-center gap-2 transition-colors ${
                        selectedSkill?.id === skill.id ? 'bg-[#6eb5ff]/20 border border-[#6eb5ff]' : 'bg-[#2a2a2a] hover:bg-[#333] border border-transparent'
                      }`}>
                      <span className="text-xl">{skill.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{skill.name}</div>
                        <div className="text-xs text-gray-500">{skill.baseDamage > 0 ? `${skill.baseDamage} dmg` : 'No damage'} • {skill.speed} spd</div>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
              {filteredSkills.length === 0 && (
                <div className="text-center text-gray-500 py-8">No skills found. Click "Seed 30 Skills" to add starter skills.</div>
              )}
            </div>
          </div>

          {/* Skill Editor */}
          <div className="col-span-8 bg-[#1a1a1a] rounded-lg border border-[#333] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">{editForm.id ? `Edit: ${editForm.name}` : 'New Skill'}</h2>
              {editForm.id && (
                <button onClick={handleDelete} className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded text-sm">Delete</button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#6eb5ff] border-b border-[#333] pb-1">Basic Info</h3>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Icon</label>
                    <input type="text" value={editForm.icon} onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded text-center text-2xl" />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs text-gray-400 mb-1">Name</label>
                    <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Description</label>
                  <textarea value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded h-16 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Category</label>
                    <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded">
                      {MONSTER_SKILL_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Damage Type</label>
                    <select value={editForm.damageType} onChange={(e) => setEditForm({ ...editForm, damageType: e.target.value })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded">
                      {DAMAGE_TYPES.map(type => <option key={type.id} value={type.id}>{type.icon} {type.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Combat Stats */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#6eb5ff] border-b border-[#333] pb-1">Combat Stats</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Base Damage</label>
                    <input type="number" value={editForm.baseDamage} onChange={(e) => setEditForm({ ...editForm, baseDamage: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Accuracy %</label>
                    <input type="number" value={editForm.accuracy} onChange={(e) => setEditForm({ ...editForm, accuracy: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Speed</label>
                    <input type="number" value={editForm.speed} onChange={(e) => setEditForm({ ...editForm, speed: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 text-xs text-gray-400">
                    <input type="checkbox" checked={editForm.scalesWithAttack} onChange={(e) => setEditForm({ ...editForm, scalesWithAttack: e.target.checked })} />
                    Scales with Attack
                  </label>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Scaling %</label>
                    <input type="number" value={editForm.scalingPercent} onChange={(e) => setEditForm({ ...editForm, scalingPercent: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" disabled={!editForm.scalesWithAttack} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Self Heal</label>
                    <input type="number" value={editForm.selfHeal} onChange={(e) => setEditForm({ ...editForm, selfHeal: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Self Damage</label>
                    <input type="number" value={editForm.selfDamage} onChange={(e) => setEditForm({ ...editForm, selfDamage: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                  </div>
                </div>
              </div>

              {/* Debuff */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-purple-400 border-b border-[#333] pb-1">Debuff Effect</h3>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Applies Debuff</label>
                  <select value={editForm.appliesDebuff || ''} onChange={(e) => setEditForm({ ...editForm, appliesDebuff: e.target.value || null })}
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded">
                    <option value="">None</option>
                    {DEBUFF_TYPES.map(type => <option key={type.id} value={type.id}>{type.icon} {type.name}</option>)}
                  </select>
                </div>
                {editForm.appliesDebuff && (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Chance %</label>
                      <input type="number" value={editForm.debuffChance} onChange={(e) => setEditForm({ ...editForm, debuffChance: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Duration</label>
                      <input type="number" value={editForm.debuffDuration} onChange={(e) => setEditForm({ ...editForm, debuffDuration: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Value</label>
                      <input type="number" value={editForm.debuffValue} onChange={(e) => setEditForm({ ...editForm, debuffValue: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                    </div>
                  </div>
                )}
              </div>

              {/* Buff */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-green-400 border-b border-[#333] pb-1">Buff Effect (Self)</h3>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Applies Buff</label>
                  <select value={editForm.appliesBuff || ''} onChange={(e) => setEditForm({ ...editForm, appliesBuff: e.target.value || null })}
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded">
                    <option value="">None</option>
                    {BUFF_TYPES.map(type => <option key={type.id} value={type.id}>{type.icon} {type.name}</option>)}
                  </select>
                </div>
                {editForm.appliesBuff && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Duration</label>
                      <input type="number" value={editForm.buffDuration} onChange={(e) => setEditForm({ ...editForm, buffDuration: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Value</label>
                      <input type="number" value={editForm.buffValue} onChange={(e) => setEditForm({ ...editForm, buffValue: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                    </div>
                  </div>
                )}
              </div>

              {/* Narrative */}
              <div className="col-span-2 space-y-4">
                <h3 className="text-sm font-semibold text-yellow-400 border-b border-[#333] pb-1">Narrative Templates</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">On Use</label>
                    <input type="text" value={editForm.narrativeUse} onChange={(e) => setEditForm({ ...editForm, narrativeUse: e.target.value })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">On Hit</label>
                    <input type="text" value={editForm.narrativeHit} onChange={(e) => setEditForm({ ...editForm, narrativeHit: e.target.value })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">On Miss</label>
                    <input type="text" value={editForm.narrativeMiss} onChange={(e) => setEditForm({ ...editForm, narrativeMiss: e.target.value })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">On Crit</label>
                    <input type="text" value={editForm.narrativeCrit} onChange={(e) => setEditForm({ ...editForm, narrativeCrit: e.target.value })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded text-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button onClick={handleSave} disabled={saving || !editForm.name}
                className="px-6 py-2 bg-[#6eb5ff] hover:bg-[#8ec5ff] text-black rounded-lg font-medium disabled:opacity-50">
                {saving ? 'Saving...' : (editForm.id ? 'Update Skill' : 'Create Skill')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
