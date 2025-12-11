'use client'

import { useState, useEffect } from 'react'
import { WEAPON_CATEGORIES, WeaponCategory, StarterSkill } from '@/data/weapon-skills-data'

// ============================================
// TYPES
// ============================================

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
  children?: Skill[]
  category?: { id: string; name: string } | null
  starterSkillName?: string
  categoryId?: string
}

type ViewState = 
  | { type: 'categories' }
  | { type: 'starters'; category: WeaponCategory }
  | { type: 'skill'; skill: Skill; breadcrumb: Skill[] }

// ============================================
// MAIN COMPONENT
// ============================================

export default function SkillDatabaseBuilder() {
  // Navigation state
  const [view, setView] = useState<ViewState>({ type: 'categories' })
  
  // Data state
  const [currentSkill, setCurrentSkill] = useState<Skill | null>(null)
  const [childSkills, setChildSkills] = useState<Skill[]>([])
  const [breadcrumb, setBreadcrumb] = useState<Skill[]>([])
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [editedSkill, setEditedSkill] = useState<Skill | null>(null)
  
  // Progress tracking
  const [progress, setProgress] = useState({ total: 0, byStage: {} as Record<number, number> })

  // ============================================
  // HANDLERS
  // ============================================

  // Select a weapon category
  const handleSelectCategory = (category: WeaponCategory) => {
    setView({ type: 'starters', category })
    setMessage('')
  }

  // Select a starter skill
  const handleSelectStarterSkill = async (category: WeaponCategory, starter: StarterSkill) => {
    setLoading(true)
    setMessage('')
    
    try {
      // Check if this skill exists in database
      const response = await fetch(`/api/skills/get?name=${encodeURIComponent(starter.name)}&categoryId=${category.id}`)
      const data = await response.json()
      
      let skill: Skill
      
      if (data.skill) {
        // Skill exists in database
        skill = data.skill
      } else {
        // Create new starter skill in database
        const createResponse = await fetch('/api/skills/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: starter.name,
            description: starter.description,
            skillType: starter.type,
            categoryId: category.id,
            stage: 0,
            archetype: 'root',
            damage: '100% weapon damage',
            apCost: 5,
            cooldown: '0.5s',
            passive: null,
            starterSkillName: starter.name,
          })
        })
        const createData = await createResponse.json()
        skill = createData.skill
      }
      
      setCurrentSkill(skill)
      setBreadcrumb([skill])
      await loadChildSkills(skill.id)
      await loadProgress(starter.name)
      setView({ type: 'skill', skill, breadcrumb: [skill] })
    } catch (error) {
      setMessage(`❌ Error: ${error}`)
    }
    
    setLoading(false)
  }

  // Load child skills for a skill
  const loadChildSkills = async (parentId: string) => {
    try {
      const response = await fetch(`/api/skills/children?parentId=${parentId}`)
      const data = await response.json()
      setChildSkills(data.children || [])
    } catch (error) {
      console.error('Failed to load children:', error)
      setChildSkills([])
    }
  }

  // Load progress for a starter skill tree
  const loadProgress = async (starterSkillName: string) => {
    try {
      const response = await fetch(`/api/skills/progress?starter=${encodeURIComponent(starterSkillName)}`)
      const data = await response.json()
      setProgress(data)
    } catch (error) {
      console.error('Failed to load progress:', error)
    }
  }

  // Navigate to a child skill
  const handleNavigateToSkill = async (skill: Skill) => {
    setLoading(true)
    
    // Fetch full skill data
    const response = await fetch(`/api/skills/get?id=${skill.id}`)
    const data = await response.json()
    
    if (data.skill) {
      const fullSkill = data.skill
      const newBreadcrumb = [...breadcrumb, fullSkill]
      setCurrentSkill(fullSkill)
      setBreadcrumb(newBreadcrumb)
      await loadChildSkills(fullSkill.id)
      setView({ type: 'skill', skill: fullSkill, breadcrumb: newBreadcrumb })
    }
    
    setLoading(false)
  }

  // Navigate back via breadcrumb
  const handleBreadcrumbClick = async (index: number) => {
    if (index === -1) {
      // Go back to categories
      setView({ type: 'categories' })
      setCurrentSkill(null)
      setBreadcrumb([])
      setChildSkills([])
      return
    }
    
    const skill = breadcrumb[index]
    const newBreadcrumb = breadcrumb.slice(0, index + 1)
    setCurrentSkill(skill)
    setBreadcrumb(newBreadcrumb)
    await loadChildSkills(skill.id)
    setView({ type: 'skill', skill, breadcrumb: newBreadcrumb })
  }

  // Generate children for current skill
  const handleGenerateChildren = async () => {
    if (!currentSkill) return
    if (currentSkill.stage >= 5) {
      setMessage('⚠️ Maximum stage reached (Stage 5)')
      return
    }
    
    setGenerating(true)
    setMessage('🎲 Generating child skills...')
    
    try {
      const response = await fetch('/api/skills/generate-children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: currentSkill.id,
          parentName: currentSkill.name,
          parentStage: currentSkill.stage,
          categoryId: currentSkill.categoryId,
          starterSkillName: currentSkill.starterSkillName,
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage(`✅ Generated ${data.children.length} child skills!`)
        setChildSkills(data.children)
        await loadProgress(currentSkill.starterSkillName || currentSkill.name)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Failed to generate: ${error}`)
    }
    
    setGenerating(false)
  }

  // Save edited skill
  const handleSaveSkill = async () => {
    if (!editedSkill) return
    
    try {
      const response = await fetch('/api/skills/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedSkill)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setCurrentSkill(editedSkill)
        setMessage('✅ Skill saved!')
        setEditMode(false)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Failed to save: ${error}`)
    }
  }

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const getArchetypeColor = (archetype: string) => {
    switch (archetype) {
      case 'power': return 'bg-red-900/50 border-red-500 text-red-300'
      case 'speed': return 'bg-yellow-900/50 border-yellow-500 text-yellow-300'
      case 'utility': return 'bg-purple-900/50 border-purple-500 text-purple-300'
      case 'mobility': return 'bg-blue-900/50 border-blue-500 text-blue-300'
      case 'root': return 'bg-green-900/50 border-green-500 text-green-300'
      default: return 'bg-gray-900/50 border-gray-500 text-gray-300'
    }
  }

  const getArchetypeIcon = (archetype: string) => {
    switch (archetype) {
      case 'power': return '💥'
      case 'speed': return '⚡'
      case 'utility': return '🔮'
      case 'mobility': return '💨'
      case 'root': return '🌱'
      default: return '❓'
    }
  }

  const getStageColor = (stage: number) => {
    const colors = [
      'border-gray-500 text-gray-400',
      'border-green-500 text-green-400',
      'border-blue-500 text-blue-400',
      'border-purple-500 text-purple-400',
      'border-orange-500 text-orange-400',
      'border-red-500 text-red-400',
    ]
    return colors[stage] || colors[0]
  }

  const getCategoryTypeColor = (type: string) => {
    switch (type) {
      case 'Melee': return 'bg-red-900/30 text-red-400'
      case 'Ranged': return 'bg-green-900/30 text-green-400'
      case 'Magic': return 'bg-purple-900/30 text-purple-400'
      case 'Defense': return 'bg-blue-900/30 text-blue-400'
      default: return 'bg-gray-900/30 text-gray-400'
    }
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Left Navigation Menu - Fixed Bottom Left */}
      <nav className="fixed bottom-4 left-4 z-50">
        <div className="bg-[#242424] border border-[#444] rounded-lg shadow-lg overflow-hidden">
          <div className="px-3 py-2 bg-[#333] border-b border-[#444]">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Navigation</span>
          </div>
          <div className="p-2">
            <a
              href="/admin/skills"
              className="flex items-center gap-2 px-3 py-2 rounded bg-[#6eb5ff]/20 text-[#6eb5ff] border border-[#6eb5ff]/30"
            >
              <span>⚔️</span>
              <span className="text-sm font-medium">Skill Database</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-[#242424] border-b border-[#333] p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-[#6eb5ff]">⚔️ Skill Database Builder</h1>
          <p className="text-sm text-gray-400">Build skill trees one skill at a time</p>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 py-3 border-b border-[#333]">
        <div className="flex items-center gap-2 text-sm">
          <button 
            onClick={() => handleBreadcrumbClick(-1)}
            className="text-[#6eb5ff] hover:underline"
          >
            🏠 Categories
          </button>
          
          {view.type === 'starters' && (
            <>
              <span className="text-gray-500">›</span>
              <span className="text-white">{view.category.icon} {view.category.name}</span>
            </>
          )}
          
          {view.type === 'skill' && breadcrumb.map((skill, index) => (
            <span key={skill.id} className="flex items-center gap-2">
              <span className="text-gray-500">›</span>
              {index < breadcrumb.length - 1 ? (
                <button 
                  onClick={() => handleBreadcrumbClick(index)}
                  className="text-[#6eb5ff] hover:underline"
                >
                  {skill.name}
                </button>
              ) : (
                <span className="text-white font-medium">{skill.name}</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className={`p-3 rounded border ${message.includes('✅') ? 'bg-green-900/30 border-green-500 text-green-300' : message.includes('⚠️') ? 'bg-yellow-900/30 border-yellow-500 text-yellow-300' : 'bg-red-900/30 border-red-500 text-red-300'}`}>
            {message}
            <button onClick={() => setMessage('')} className="ml-4 text-xs opacity-70 hover:opacity-100">✕</button>
          </div>
        </div>
      )}

      {/* Progress Bar (only in skill view) */}
      {view.type === 'skill' && progress.total > 0 && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="bg-[#242424] rounded-lg border border-[#333] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#6eb5ff]">📊 Tree Progress: {currentSkill?.starterSkillName}</span>
              <span className="text-sm text-gray-400">{progress.total} skills generated</span>
            </div>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map(stage => (
                <div key={stage} className={`flex-1 text-center p-2 rounded border ${getStageColor(stage)}`}>
                  <div className="text-xs opacity-70">S{stage}</div>
                  <div className="font-bold">{progress.byStage[stage] || 0}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4">
        
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4 animate-pulse">⏳</div>
            <p className="text-gray-400">Loading...</p>
          </div>
        )}

        {/* VIEW: Categories */}
        {!loading && view.type === 'categories' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Choose Weapon Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {WEAPON_CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleSelectCategory(category)}
                  className="bg-[#242424] border border-[#444] rounded-lg p-6 text-center hover:border-[#6eb5ff] hover:bg-[#2a2a2a] transition-all group"
                >
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <div className="font-semibold text-lg mb-1">{category.name}</div>
                  <div className={`text-xs px-2 py-1 rounded inline-block ${getCategoryTypeColor(category.type)}`}>
                    {category.type} • {category.primaryStat}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {category.starterSkills.length} starter skills
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: Starter Skills */}
        {!loading && view.type === 'starters' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {view.category.icon} {view.category.name} - Choose Starter Skill
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {view.category.starterSkills.map(starter => (
                <button
                  key={starter.name}
                  onClick={() => handleSelectStarterSkill(view.category, starter)}
                  className="bg-[#242424] border border-[#444] rounded-lg p-4 text-left hover:border-[#6eb5ff] hover:bg-[#2a2a2a] transition-all"
                >
                  <div className="font-semibold mb-1">{starter.name}</div>
                  <div className="text-xs text-gray-400 mb-2">{starter.type}</div>
                  <div className="text-xs text-gray-500 line-clamp-2">{starter.description}</div>
                  <div className="mt-2 text-xs px-2 py-1 rounded bg-green-900/30 text-green-400 inline-block">
                    Stage 0
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: Skill Detail */}
        {!loading && view.type === 'skill' && currentSkill && (
          <div className="space-y-6">
            
            {/* Current Skill Card */}
            <div className={`bg-[#242424] border-2 rounded-xl p-6 ${getArchetypeColor(currentSkill.archetype)}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{getArchetypeIcon(currentSkill.archetype)}</span>
                    {editMode ? (
                      <input
                        type="text"
                        value={editedSkill?.name || ''}
                        onChange={(e) => setEditedSkill(prev => prev ? {...prev, name: e.target.value} : null)}
                        className="text-2xl font-bold bg-transparent border-b border-white/30 focus:outline-none focus:border-[#6eb5ff]"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold">{currentSkill.name}</h2>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className={`px-2 py-1 rounded border ${getStageColor(currentSkill.stage)}`}>
                      Stage {currentSkill.stage}
                    </span>
                    <span className="text-gray-400">{currentSkill.skillType}</span>
                    <span className="capitalize text-gray-400">• {currentSkill.archetype}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!editMode ? (
                    <button
                      onClick={() => {
                        setEditMode(true)
                        setEditedSkill(currentSkill)
                      }}
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
                          setEditedSkill(null)
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
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-black/20 rounded p-3">
                  <div className="text-xs text-gray-400 mb-1">Damage</div>
                  {editMode ? (
                    <input
                      type="text"
                      value={editedSkill?.damage || ''}
                      onChange={(e) => setEditedSkill(prev => prev ? {...prev, damage: e.target.value} : null)}
                      className="w-full bg-transparent border-b border-white/30 font-bold text-red-400 focus:outline-none"
                    />
                  ) : (
                    <div className="font-bold text-red-400">{currentSkill.damage}</div>
                  )}
                </div>
                <div className="bg-black/20 rounded p-3">
                  <div className="text-xs text-gray-400 mb-1">AP Cost</div>
                  {editMode ? (
                    <input
                      type="number"
                      value={editedSkill?.apCost || 0}
                      onChange={(e) => setEditedSkill(prev => prev ? {...prev, apCost: parseInt(e.target.value)} : null)}
                      className="w-full bg-transparent border-b border-white/30 font-bold text-blue-400 focus:outline-none"
                    />
                  ) : (
                    <div className="font-bold text-blue-400">{currentSkill.apCost}</div>
                  )}
                </div>
                <div className="bg-black/20 rounded p-3">
                  <div className="text-xs text-gray-400 mb-1">Cooldown</div>
                  {editMode ? (
                    <input
                      type="text"
                      value={editedSkill?.cooldown || ''}
                      onChange={(e) => setEditedSkill(prev => prev ? {...prev, cooldown: e.target.value} : null)}
                      className="w-full bg-transparent border-b border-white/30 font-bold text-yellow-400 focus:outline-none"
                    />
                  ) : (
                    <div className="font-bold text-yellow-400">{currentSkill.cooldown}</div>
                  )}
                </div>
              </div>

              {/* Effect */}
              <div className="mb-4">
                <div className="text-xs text-gray-400 mb-1">Effect</div>
                {editMode ? (
                  <textarea
                    value={editedSkill?.description || ''}
                    onChange={(e) => setEditedSkill(prev => prev ? {...prev, description: e.target.value} : null)}
                    className="w-full bg-black/20 rounded p-3 border border-white/10 focus:outline-none focus:border-[#6eb5ff] min-h-[80px]"
                  />
                ) : (
                  <div className="bg-black/20 rounded p-3">{currentSkill.description}</div>
                )}
              </div>

              {/* Passive */}
              {(currentSkill.passive || editMode) && (
                <div className="mb-4">
                  <div className="text-xs text-gray-400 mb-1">Passive (Stage {currentSkill.stage})</div>
                  {editMode ? (
                    <textarea
                      value={editedSkill?.passive || ''}
                      onChange={(e) => setEditedSkill(prev => prev ? {...prev, passive: e.target.value} : null)}
                      className="w-full bg-purple-900/20 rounded p-3 border border-purple-500/30 focus:outline-none focus:border-purple-500"
                    />
                  ) : (
                    <div className="bg-purple-900/20 rounded p-3 border border-purple-500/30 text-purple-300">
                      {currentSkill.passive}
                    </div>
                  )}
                </div>
              )}

              {/* Generate Button */}
              {currentSkill.stage < 5 && childSkills.length === 0 && (
                <button
                  onClick={handleGenerateChildren}
                  disabled={generating}
                  className="w-full py-4 bg-gradient-to-r from-[#6eb5ff] to-[#a855f7] text-white rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {generating ? '⏳ Generating...' : `🎲 Generate Stage ${currentSkill.stage + 1} Children (4 skills)`}
                </button>
              )}

              {currentSkill.stage >= 5 && (
                <div className="text-center py-4 text-gray-400 border border-dashed border-gray-600 rounded-lg">
                  🏆 Maximum Stage Reached (Stage 5)
                </div>
              )}
            </div>

            {/* Child Skills */}
            {childSkills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Child Skills ({childSkills.length})
                  <span className="text-sm font-normal text-gray-400 ml-2">Click to navigate</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {childSkills.map(child => (
                    <button
                      key={child.id}
                      onClick={() => handleNavigateToSkill(child)}
                      className={`border-2 rounded-lg p-4 text-left hover:scale-105 transition-transform ${getArchetypeColor(child.archetype)}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getArchetypeIcon(child.archetype)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded border ${getStageColor(child.stage)}`}>
                          S{child.stage}
                        </span>
                      </div>
                      <div className="font-semibold mb-1 line-clamp-1">{child.name}</div>
                      <div className="text-xs opacity-70 capitalize">{child.archetype}</div>
                      <div className="text-xs text-gray-400 mt-2 line-clamp-2">{child.description}</div>
                      <div className="mt-3 text-xs text-center opacity-70">
                        Click to view →
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  )
}
