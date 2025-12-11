'use client'

import { useState, useEffect } from 'react'

interface Skill {
  id: string
  name: string
  description: string
  parentId: string | null
  parent?: { id: string; name: string } | null
  stage: number
  skillType: string
  archetype: string
  damage: string
  apCost: number
  cooldown: string
  passive: string | null
  children?: { id: string; name: string; stage: number; archetype: string }[]
  category?: { name: string } | null
  starterSkillName?: string
}

export default function SkillTreeViewer() {
  const [allSkills, setAllSkills] = useState<Skill[]>([])
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [filterStage, setFilterStage] = useState<number | 'all'>('all')
  const [filterArchetype, setFilterArchetype] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [editedSkill, setEditedSkill] = useState<Skill | null>(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/skills/tree?starter=Quick Slash')
      const data = await response.json()
      if (Array.isArray(data)) {
        setAllSkills(data)
      } else {
        setAllSkills([])
      }
    } catch (error) {
      console.error('Failed to load skills:', error)
      setAllSkills([])
    }
    setLoading(false)
  }

  const seedSkills = async () => {
    setSeeding(true)
    setMessage('Seeding skills to database...')
    try {
      const response = await fetch('/api/skills/seed', { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        setMessage(`✅ Seeded ${data.totalSkills} skills successfully!`)
        loadSkills()
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Failed to seed: ${error}`)
    }
    setSeeding(false)
  }

  const filteredSkills = allSkills.filter(skill => {
    const matchesStage = filterStage === 'all' || skill.stage === filterStage
    const matchesArchetype = filterArchetype === 'all' || skill.archetype === filterArchetype
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          skill.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStage && matchesArchetype && matchesSearch
  })

  const handleSaveSkill = async () => {
    if (!editedSkill) return
    
    try {
      await fetch('/api/skills/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedSkill)
      })
      
      // Update local state
      setAllSkills(prev => prev.map(s => s.id === editedSkill.id ? editedSkill : s))
      setSelectedSkill(editedSkill)
      setEditMode(false)
    } catch (error) {
      console.error('Failed to save skill:', error)
    }
  }

  const getArchetypeColor = (archetype: string) => {
    switch (archetype) {
      case 'power': return 'text-red-400 bg-red-900/30'
      case 'speed': return 'text-yellow-400 bg-yellow-900/30'
      case 'utility': return 'text-purple-400 bg-purple-900/30'
      case 'mobility': return 'text-blue-400 bg-blue-900/30'
      case 'root': return 'text-green-400 bg-green-900/30'
      default: return 'text-gray-400 bg-gray-900/30'
    }
  }

  const getStageColor = (stage: number) => {
    const colors = [
      'border-gray-500',
      'border-green-500',
      'border-blue-500',
      'border-purple-500',
      'border-orange-500',
      'border-red-500',
    ]
    return colors[stage] || colors[0]
  }

  const stageCounts = allSkills.reduce((acc, skill) => {
    acc[skill.stage] = (acc[skill.stage] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Header */}
      <header className="bg-[#242424] border-b border-[#333] p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#6eb5ff]">⚔️ Skill Tree Viewer</h1>
            <p className="text-sm text-gray-400">View and edit generated skill trees</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              Total Skills: <span className="text-white font-bold">{allSkills.length}</span>
            </span>
            <button
              onClick={seedSkills}
              disabled={seeding}
              className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {seeding ? '⏳ Seeding...' : '🌱 Seed Skills to DB'}
            </button>
            <button
              onClick={loadSkills}
              disabled={loading}
              className="px-4 py-2 bg-[#6eb5ff] text-black rounded font-medium hover:bg-[#5a9ee6] transition-colors disabled:opacity-50"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Message Banner */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className={`p-3 rounded border ${message.includes('✅') ? 'bg-green-900/30 border-green-500 text-green-300' : 'bg-red-900/30 border-red-500 text-red-300'}`}>
            {message}
            <button onClick={() => setMessage('')} className="ml-4 text-xs opacity-70 hover:opacity-100">✕ Close</button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && allSkills.length === 0 && (
        <div className="max-w-7xl mx-auto p-4 text-center text-gray-400">
          <div className="text-4xl mb-4">⏳</div>
          <p>Loading skills from database...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && allSkills.length === 0 && (
        <div className="max-w-7xl mx-auto p-4 text-center">
          <div className="bg-[#242424] rounded-lg border border-[#333] p-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold mb-2">No Skills in Database</h3>
            <p className="text-gray-400 mb-6">Click "Seed Skills to DB" to populate the database with generated skills</p>
            <button
              onClick={seedSkills}
              disabled={seeding}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {seeding ? '⏳ Seeding...' : '🌱 Seed Skills to Database'}
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 flex gap-4" style={{ display: allSkills.length === 0 ? 'none' : 'flex' }}>
        {/* Left Panel - Filters & List */}
        <div className="w-1/3 space-y-4">
          {/* Stats */}
          <div className="bg-[#242424] rounded-lg border border-[#333] p-4">
            <h3 className="font-semibold mb-3 text-[#6eb5ff]">📊 Statistics</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[0, 1, 2, 3, 4, 5].map(stage => (
                <div key={stage} className={`p-2 rounded border ${getStageColor(stage)}`}>
                  <div className="text-xs text-gray-400">Stage {stage}</div>
                  <div className="font-bold">{stageCounts[stage] || 0}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[#242424] rounded-lg border border-[#333] p-4">
            <h3 className="font-semibold mb-3 text-[#6eb5ff]">🔍 Filters</h3>
            
            {/* Search */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#444] rounded text-sm focus:border-[#6eb5ff] focus:outline-none"
              />
            </div>

            {/* Stage Filter */}
            <div className="mb-3">
              <label className="text-xs text-gray-400 block mb-1">Stage</label>
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#444] rounded text-sm focus:border-[#6eb5ff] focus:outline-none"
              >
                <option value="all">All Stages</option>
                {[0, 1, 2, 3, 4, 5].map(s => (
                  <option key={s} value={s}>Stage {s} ({stageCounts[s] || 0})</option>
                ))}
              </select>
            </div>

            {/* Archetype Filter */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Archetype</label>
              <select
                value={filterArchetype}
                onChange={(e) => setFilterArchetype(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#444] rounded text-sm focus:border-[#6eb5ff] focus:outline-none"
              >
                <option value="all">All Archetypes</option>
                <option value="root">Root</option>
                <option value="power">Power</option>
                <option value="speed">Speed</option>
                <option value="utility">Utility</option>
                <option value="mobility">Mobility</option>
              </select>
            </div>
          </div>

          {/* Skill List */}
          <div className="bg-[#242424] rounded-lg border border-[#333] p-4 max-h-[500px] overflow-y-auto">
            <h3 className="font-semibold mb-3 text-[#6eb5ff]">
              📜 Skills ({filteredSkills.length})
            </h3>
            <div className="space-y-1">
              {filteredSkills.map(skill => (
                <button
                  key={skill.id}
                  onClick={() => {
                    setSelectedSkill(skill)
                    setEditedSkill(skill)
                    setEditMode(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedSkill?.id === skill.id
                      ? 'bg-[#6eb5ff]/20 border border-[#6eb5ff]'
                      : 'hover:bg-[#333] border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{skill.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getArchetypeColor(skill.archetype)}`}>
                      S{skill.stage}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 truncate">{skill.skillType}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Skill Details */}
        <div className="w-2/3">
          {selectedSkill ? (
            <div className="bg-[#242424] rounded-lg border border-[#333] p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{selectedSkill.name}</h2>
                    <span className={`px-3 py-1 rounded text-sm ${getArchetypeColor(selectedSkill.archetype)}`}>
                      {selectedSkill.archetype}
                    </span>
                  </div>
                  <p className="text-gray-400">{selectedSkill.skillType}</p>
                </div>
                <div className="flex gap-2">
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-4 py-2 bg-[#6eb5ff] text-black rounded font-medium hover:bg-[#5a9ee6] transition-colors"
                    >
                      ✏️ Edit
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveSkill}
                        className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors"
                      >
                        💾 Save
                      </button>
                      <button
                        onClick={() => {
                          setEditMode(false)
                          setEditedSkill(selectedSkill)
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded font-medium hover:bg-gray-700 transition-colors"
                      >
                        ❌ Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className={`p-4 rounded border ${getStageColor(selectedSkill.stage)} bg-[#1a1a1a]`}>
                  <div className="text-xs text-gray-400">Stage</div>
                  <div className="text-2xl font-bold">{selectedSkill.stage}</div>
                </div>
                <div className="p-4 rounded border border-[#444] bg-[#1a1a1a]">
                  <div className="text-xs text-gray-400">Damage</div>
                  {editMode ? (
                    <input
                      type="text"
                      value={editedSkill?.damage || ''}
                      onChange={(e) => setEditedSkill(prev => prev ? {...prev, damage: e.target.value} : null)}
                      className="w-full bg-transparent border-b border-[#444] text-lg font-bold focus:outline-none focus:border-[#6eb5ff]"
                    />
                  ) : (
                    <div className="text-lg font-bold text-red-400">{selectedSkill.damage}</div>
                  )}
                </div>
                <div className="p-4 rounded border border-[#444] bg-[#1a1a1a]">
                  <div className="text-xs text-gray-400">AP Cost</div>
                  {editMode ? (
                    <input
                      type="number"
                      value={editedSkill?.apCost || 0}
                      onChange={(e) => setEditedSkill(prev => prev ? {...prev, apCost: parseInt(e.target.value)} : null)}
                      className="w-full bg-transparent border-b border-[#444] text-lg font-bold focus:outline-none focus:border-[#6eb5ff]"
                    />
                  ) : (
                    <div className="text-lg font-bold text-blue-400">{selectedSkill.apCost}</div>
                  )}
                </div>
                <div className="p-4 rounded border border-[#444] bg-[#1a1a1a]">
                  <div className="text-xs text-gray-400">Cooldown</div>
                  {editMode ? (
                    <input
                      type="text"
                      value={editedSkill?.cooldown || ''}
                      onChange={(e) => setEditedSkill(prev => prev ? {...prev, cooldown: e.target.value} : null)}
                      className="w-full bg-transparent border-b border-[#444] text-lg font-bold focus:outline-none focus:border-[#6eb5ff]"
                    />
                  ) : (
                    <div className="text-lg font-bold text-yellow-400">{selectedSkill.cooldown}</div>
                  )}
                </div>
              </div>

              {/* Effect */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Effect</h3>
                {editMode ? (
                  <textarea
                    value={editedSkill?.description || ''}
                    onChange={(e) => setEditedSkill(prev => prev ? {...prev, description: e.target.value} : null)}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#444] rounded text-white focus:outline-none focus:border-[#6eb5ff] min-h-[100px]"
                  />
                ) : (
                  <div className="px-4 py-3 bg-[#1a1a1a] border border-[#444] rounded">
                    {selectedSkill.description}
                  </div>
                )}
              </div>

              {/* Passive */}
              {(selectedSkill.passive || editMode) && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Passive</h3>
                  {editMode ? (
                    <textarea
                      value={editedSkill?.passive || ''}
                      onChange={(e) => setEditedSkill(prev => prev ? {...prev, passive: e.target.value} : null)}
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#444] rounded text-white focus:outline-none focus:border-[#6eb5ff]"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-purple-900/20 border border-purple-500/30 rounded text-purple-300">
                      {selectedSkill.passive}
                    </div>
                  )}
                </div>
              )}

              {/* Name Edit */}
              {editMode && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Skill Name</h3>
                  <input
                    type="text"
                    value={editedSkill?.name || ''}
                    onChange={(e) => setEditedSkill(prev => prev ? {...prev, name: e.target.value} : null)}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#444] rounded text-white focus:outline-none focus:border-[#6eb5ff]"
                  />
                </div>
              )}

              {/* Parent Info */}
              {selectedSkill.parent && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Parent Skill</h3>
                  <button
                    onClick={() => {
                      const parent = allSkills.find(s => s.id === selectedSkill.parentId)
                      if (parent) {
                        setSelectedSkill(parent)
                        setEditedSkill(parent)
                        setEditMode(false)
                      }
                    }}
                    className="px-4 py-2 bg-[#1a1a1a] border border-[#444] rounded hover:border-[#6eb5ff] transition-colors"
                  >
                    ⬆️ {selectedSkill.parent.name}
                  </button>
                </div>
              )}

              {/* Children */}
              {selectedSkill.children && selectedSkill.children.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">
                    Child Skills ({selectedSkill.children.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedSkill.children.map(child => (
                      <button
                        key={child.id}
                        onClick={() => {
                          const fullChild = allSkills.find(s => s.id === child.id)
                          if (fullChild) {
                            setSelectedSkill(fullChild)
                            setEditedSkill(fullChild)
                            setEditMode(false)
                          }
                        }}
                        className={`p-3 rounded border text-left hover:border-[#6eb5ff] transition-colors ${getArchetypeColor(child.archetype)} border-[#444]`}
                      >
                        <div className="font-medium text-sm">{child.name}</div>
                        <div className="text-xs opacity-70">{child.archetype}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="mt-6 pt-4 border-t border-[#333] text-xs text-gray-500">
                <span>ID: {selectedSkill.id}</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#242424] rounded-lg border border-[#333] p-12 text-center">
              <div className="text-6xl mb-4">⚔️</div>
              <h3 className="text-xl font-semibold mb-2">Select a Skill</h3>
              <p className="text-gray-400">Click on a skill from the list to view its details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
