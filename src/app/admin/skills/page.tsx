'use client'

import { useState, useEffect } from 'react'
import { SKILL_TYPE_CATEGORIES, SkillTypeCategory, StarterSkill } from '@/data/universal-skills-data'

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
  damageType: string
  variantType: string
  // Weapon requirement
  weaponRequirement: string
  hasUtilityMode: boolean
  utilityEffect?: string | null
  utilityDuration?: number | null
  // Combat stats
  ampPercent: number
  apCost: number
  cooldown: number
  // Targeting
  targetType: string
  range: number
  hitCount: number
  // Effects
  buffType?: string | null
  buffDuration?: number | null
  debuffType?: string | null
  debuffDuration?: number | null
  debuffChance?: number | null
  lifestealPercent?: number | null
  armorPierce?: number | null
  bonusVsGuard?: number | null
  bonusVsDebuffed?: number | null
  // Counter
  isCounter: boolean
  triggerCondition?: string | null
  // Other
  passive: string | null
  starterSkillName: string
  isSaved: boolean
  children?: Skill[]
}

// Variant type configuration
const VARIANT_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  root:             { icon: '🌱', color: 'bg-green-900/50 border-green-500 text-green-300', label: 'Root' },
  upgrade:          { icon: '⬆️', color: 'bg-green-900/50 border-green-500 text-green-300', label: 'Upgrade' },
  original_variant: { icon: '🔄', color: 'bg-blue-900/50 border-blue-500 text-blue-300', label: 'Original Variant' },
  buff_variant:     { icon: '💪', color: 'bg-yellow-900/50 border-yellow-500 text-yellow-300', label: 'Buff Variant' },
  debuff_variant:   { icon: '💀', color: 'bg-purple-900/50 border-purple-500 text-purple-300', label: 'Debuff Variant' },
  unique:           { icon: '✨', color: 'bg-orange-900/50 border-orange-500 text-orange-300', label: 'Unique' },
  aoe_variant:      { icon: '💥', color: 'bg-red-900/50 border-red-500 text-red-300', label: 'AoE Variant' },
  combo_variant:    { icon: '⛓️', color: 'bg-cyan-900/50 border-cyan-500 text-cyan-300', label: 'Combo Variant' },
  counter_variant:  { icon: '🛡️', color: 'bg-gray-700/50 border-gray-400 text-gray-300', label: 'Counter Variant' },
  mobility_variant: { icon: '💨', color: 'bg-pink-900/50 border-pink-500 text-pink-300', label: 'Mobility Variant' },
  sustain_variant:  { icon: '❤️‍🩹', color: 'bg-slate-700/50 border-slate-400 text-slate-300', label: 'Sustain Variant' },
}

type ViewState = 
  | { type: 'categories' }
  | { type: 'starters'; category: SkillTypeCategory }
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

  // Select a skill type category
  const handleSelectCategory = (category: SkillTypeCategory) => {
    setView({ type: 'starters', category })
    setMessage('')
  }

  // Select a starter skill
  const handleSelectStarterSkill = async (category: SkillTypeCategory, starter: StarterSkill) => {
    setLoading(true)
    setMessage('')
    
    try {
      // Check if this skill exists in database
      const response = await fetch(`/api/skills/get?name=${encodeURIComponent(starter.name)}`)
      const data = await response.json()
      
      let skill: Skill
      
      if (data.skill) {
        // Skill exists in database - update it with correct values from StarterSkill
        const updateResponse = await fetch('/api/skills/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.skill.id,
            ampPercent: starter.ampPercent,
            apCost: starter.apCost,
            cooldown: starter.cooldown,
            range: starter.range,
            damageType: starter.damageType,
            weaponRequirement: starter.weaponRequirement,
            hasUtilityMode: starter.hasUtilityMode || false,
            utilityEffect: starter.utilityEffect || null,
            utilityDuration: starter.utilityDuration || null,
          })
        })
        const updateData = await updateResponse.json()
        if (updateData.success && updateData.skill) {
          skill = updateData.skill
        } else {
          // If update fails, still use existing skill
          skill = data.skill
        }
      } else {
        // Create new starter skill in database
        const createResponse = await fetch('/api/skills/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: starter.name,
            description: starter.description,
            skillType: category.name,
            damageType: starter.damageType,
            weaponRequirement: starter.weaponRequirement,
            hasUtilityMode: starter.hasUtilityMode || false,
            utilityEffect: starter.utilityEffect || null,
            utilityDuration: starter.utilityDuration || null,
            stage: 0,
            variantType: 'root',
            ampPercent: starter.ampPercent,
            apCost: starter.apCost,
            cooldown: starter.cooldown,
            targetType: 'single',
            range: starter.range,
            hitCount: 1,
            passive: null,
            starterSkillName: starter.name,
          })
        })
        const createData = await createResponse.json()
        if (!createData.success || !createData.skill) {
          throw new Error(createData.error || createData.details || 'Failed to create skill')
        }
        skill = createData.skill
      }
      
      if (!skill || !skill.id) {
        throw new Error('Skill data is invalid')
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
          starterSkillName: currentSkill.starterSkillName,
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage(`✅ Generated ${data.children.length} child skills!`)
        setChildSkills(data.children)
        await loadProgress(currentSkill.starterSkillName)
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

  // Save all generated children to database
  const handleSaveAllChildren = async () => {
    if (childSkills.length === 0) return
    
    setMessage('💾 Saving all children...')
    
    try {
      const response = await fetch('/api/skills/save-children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillIds: childSkills.map(s => s.id) })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage(`✅ Saved ${data.count} skills to database!`)
        // Reload children to update isSaved status
        if (currentSkill) {
          await loadChildSkills(currentSkill.id)
        }
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Failed to save: ${error}`)
    }
  }

  // Regenerate children (delete existing unsaved and generate new)
  const handleRegenerateChildren = async () => {
    if (!currentSkill) return
    
    setGenerating(true)
    setMessage('🔄 Regenerating children...')
    
    try {
      // Delete existing unsaved children
      const deleteResponse = await fetch('/api/skills/delete-unsaved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: currentSkill.id })
      })
      
      if (!deleteResponse.ok) {
        throw new Error('Failed to delete existing children')
      }
      
      // Generate new children
      const response = await fetch('/api/skills/generate-children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: currentSkill.id,
          parentName: currentSkill.name,
          parentStage: currentSkill.stage,
          starterSkillName: currentSkill.starterSkillName,
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage(`✅ Regenerated ${data.children.length} child skills!`)
        setChildSkills(data.children)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Failed to regenerate: ${error}`)
    }
    
    setGenerating(false)
  }

  // Reset entire skill tree (delete all children of starter skill)
  const handleResetTree = async () => {
    if (!currentSkill) return
    
    const starterName = currentSkill.starterSkillName || currentSkill.name
    
    // Use deleteAll=true to delete ALL skills with stage > 0 (nuclear option for old data)
    if (!confirm(`Are you sure you want to delete ALL generated skills? This will reset ALL skill trees. This cannot be undone.`)) {
      return
    }
    
    setMessage('🗑️ Deleting all generated skills...')
    
    try {
      const response = await fetch('/api/skills/delete-all-children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteAll: true })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage(`✅ Deleted ${data.count} skills. All trees reset to starter skills only.`)
        setChildSkills([])
        await loadProgress(starterName)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Failed to reset: ${error}`)
    }
  }

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const getVariantColor = (variantType: string) => {
    const config = VARIANT_CONFIG[variantType]
    return config?.color || 'bg-gray-900/50 border-gray-500 text-gray-300'
  }

  const getVariantIcon = (variantType: string) => {
    const config = VARIANT_CONFIG[variantType]
    return config?.icon || '❓'
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

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Header */}
      <header className="bg-[#242424] border-b border-[#333] p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#6eb5ff]">⚔️ Skill Database Builder</h1>
            <p className="text-sm text-gray-400">Build skill trees one skill at a time (Admin Tool)</p>
          </div>
          <a
            href="/floor/1/town"
            className="flex items-center gap-2 px-4 py-2 bg-[#333] hover:bg-[#444] rounded-lg text-gray-300 hover:text-white transition-colors"
          >
            <span>🏠</span>
            <span className="text-sm font-medium">Home</span>
          </a>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 py-3 border-b border-[#333]">
        <div className="flex items-center gap-2 text-sm">
          <button 
            onClick={() => handleBreadcrumbClick(-1)}
            className="text-[#6eb5ff] hover:underline"
          >
            🏠 Skill Types
          </button>
          
          {view.type === 'starters' && (
            <>
              <span className="text-gray-500">›</span>
              <span className="text-white">{view.category.icon} {view.category.name} Skills</span>
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

        {/* VIEW: Skill Type Categories */}
        {!loading && view.type === 'categories' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Choose Skill Type</h2>
              <span className="text-sm text-gray-400">100 Starter Skills Total</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {SKILL_TYPE_CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleSelectCategory(category)}
                  className={`border-2 rounded-lg p-4 text-left hover:scale-[1.02] transition-all ${category.color}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <div className="font-semibold text-lg">{category.name}</div>
                      <div className="text-xs opacity-70">{category.skills.length} skills</div>
                    </div>
                  </div>
                  <div className="text-xs opacity-80 mb-3">{category.description}</div>
                  <div className={`text-xs px-2 py-1 rounded inline-block ${
                    category.weaponRequirement === 'melee_only' ? 'bg-red-900/50 text-red-300' :
                    category.weaponRequirement === 'ranged_only' ? 'bg-green-900/50 text-green-300' :
                    category.weaponRequirement === 'magic_only' ? 'bg-purple-900/50 text-purple-300' :
                    'bg-gray-900/50 text-gray-300'
                  }`}>
                    {category.weaponRequirement === 'melee_only' ? '⚔️ Melee Only' :
                     category.weaponRequirement === 'ranged_only' ? '🏹 Ranged Only' :
                     category.weaponRequirement === 'magic_only' ? '✨ Magic Only' :
                     '🔄 Any Weapon'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: Starter Skills */}
        {!loading && view.type === 'starters' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {view.category.icon} {view.category.name} Skills
              </h2>
              <div className={`text-xs px-2 py-1 rounded ${
                view.category.weaponRequirement === 'melee_only' ? 'bg-red-900/50 text-red-300' :
                view.category.weaponRequirement === 'ranged_only' ? 'bg-green-900/50 text-green-300' :
                view.category.weaponRequirement === 'magic_only' ? 'bg-purple-900/50 text-purple-300' :
                'bg-gray-900/50 text-gray-300'
              }`}>
                {view.category.weaponRequirement === 'melee_only' ? '⚔️ Melee Only' :
                 view.category.weaponRequirement === 'ranged_only' ? '🏹 Ranged Only' :
                 view.category.weaponRequirement === 'magic_only' ? '✨ Magic Only' :
                 '🔄 Any Weapon'}
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">{view.category.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {view.category.skills.map((starter: StarterSkill) => (
                <button
                  key={starter.name}
                  onClick={() => handleSelectStarterSkill(view.category, starter)}
                  className="bg-[#242424] border border-[#444] rounded-lg p-4 text-left hover:border-[#6eb5ff] hover:bg-[#2a2a2a] transition-all"
                >
                  <div className="font-semibold mb-1">{starter.name}</div>
                  <div className="text-xs text-gray-400 mb-2">{starter.subtype}</div>
                  <div className="text-xs text-gray-500 line-clamp-2 mb-2">{starter.description}</div>
                  {starter.hasUtilityMode && (
                    <div className="text-xs text-cyan-400 mb-2">🔮 Can enchant weapons</div>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-green-900/30 text-green-400">Stage 0</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      starter.damageType === 'magic' ? 'bg-purple-900/30 text-purple-400' : 
                      starter.damageType === 'physical' ? 'bg-red-900/30 text-red-400' : 
                      'bg-gray-900/30 text-gray-400'
                    }`}>
                      {starter.damageType}
                    </span>
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
            <div className={`bg-[#242424] border-2 rounded-xl p-6 ${getVariantColor(currentSkill.variantType)}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{getVariantIcon(currentSkill.variantType)}</span>
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
                    <span className="capitalize text-gray-400">• {currentSkill.variantType.replace('_', ' ')}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!editMode ? (
                    <>
                      <button
                        onClick={() => {
                          setEditMode(true)
                          setEditedSkill(currentSkill)
                        }}
                        className="px-4 py-2 bg-[#6eb5ff] text-black rounded font-medium hover:bg-[#5a9ee6] transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      {currentSkill.stage === 0 && (
                        <button
                          onClick={handleResetTree}
                          className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors"
                        >
                          🗑️ Reset Tree
                        </button>
                      )}
                    </>
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

              {/* Stats Grid - Row 1 */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-black/20 rounded p-3">
                  <div className="text-xs text-gray-400 mb-1">Amp %</div>
                  {editMode ? (
                    <input
                      type="number"
                      value={editedSkill?.ampPercent || 100}
                      onChange={(e) => setEditedSkill(prev => prev ? {...prev, ampPercent: parseInt(e.target.value)} : null)}
                      className="w-full bg-transparent border-b border-white/30 font-bold text-red-400 focus:outline-none"
                    />
                  ) : (
                    <div className="font-bold text-red-400">{currentSkill.ampPercent}%</div>
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
                      type="number"
                      value={editedSkill?.cooldown || 1}
                      onChange={(e) => setEditedSkill(prev => prev ? {...prev, cooldown: parseInt(e.target.value)} : null)}
                      className="w-full bg-transparent border-b border-white/30 font-bold text-yellow-400 focus:outline-none"
                    />
                  ) : (
                    <div className="font-bold text-yellow-400">
                      {currentSkill.cooldown} turn{currentSkill.cooldown !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div className="bg-black/20 rounded p-3">
                  <div className="text-xs text-gray-400 mb-1">Target</div>
                  <div className="font-bold text-purple-400">{currentSkill.targetType}</div>
                </div>
              </div>

              {/* Stats Grid - Row 2: Weapon & Utility */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-black/20 rounded p-3">
                  <div className="text-xs text-gray-400 mb-1">Weapon Req</div>
                  <div className={`font-bold text-sm ${
                    currentSkill.weaponRequirement === 'melee_only' ? 'text-red-400' :
                    currentSkill.weaponRequirement === 'ranged_only' ? 'text-green-400' :
                    currentSkill.weaponRequirement === 'magic_only' ? 'text-purple-400' :
                    'text-gray-400'
                  }`}>
                    {currentSkill.weaponRequirement === 'melee_only' ? '⚔️ Melee' :
                     currentSkill.weaponRequirement === 'ranged_only' ? '🏹 Ranged' :
                     currentSkill.weaponRequirement === 'magic_only' ? '✨ Magic' :
                     '🔄 Any'}
                  </div>
                </div>
                <div className="bg-black/20 rounded p-3">
                  <div className="text-xs text-gray-400 mb-1">Damage Type</div>
                  <div className={`font-bold ${
                    currentSkill.damageType === 'magic' ? 'text-purple-400' :
                    currentSkill.damageType === 'physical' ? 'text-red-400' :
                    'text-gray-400'
                  }`}>
                    {currentSkill.damageType}
                  </div>
                </div>
                <div className="bg-black/20 rounded p-3">
                  <div className="text-xs text-gray-400 mb-1">Utility Mode</div>
                  <div className={`font-bold ${currentSkill.hasUtilityMode ? 'text-cyan-400' : 'text-gray-500'}`}>
                    {currentSkill.hasUtilityMode ? '🔮 Yes' : 'No'}
                  </div>
                </div>
                <div className="bg-black/20 rounded p-3">
                  <div className="text-xs text-gray-400 mb-1">Range</div>
                  <div className="font-bold text-orange-400">{currentSkill.range} tile{currentSkill.range !== 1 ? 's' : ''}</div>
                </div>
              </div>

              {/* Utility Effect (if has utility mode) */}
              {currentSkill.hasUtilityMode && currentSkill.utilityEffect && (
                <div className="bg-cyan-900/20 border border-cyan-500/30 rounded p-3 mb-4">
                  <div className="text-xs text-cyan-400 mb-1">🔮 Utility Effect (when used with non-magic weapons)</div>
                  <div className="text-cyan-300">
                    {currentSkill.utilityEffect.replace('_', ' ')} for {currentSkill.utilityDuration || 3} turns
                  </div>
                </div>
              )}

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
                  {generating ? '⏳ Generating...' : `🎲 Generate Stage ${currentSkill.stage + 1} Children (1 Upgrade + 4 Random Variants)`}
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
                  Generated Children ({childSkills.length})
                  <span className="text-sm font-normal text-gray-400 ml-2">Click to navigate • Not saved yet</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {childSkills.map(child => {
                    const variantConfig = VARIANT_CONFIG[child.variantType || 'root'] || VARIANT_CONFIG.root
                    return (
                      <button
                        key={child.id}
                        onClick={() => handleNavigateToSkill(child)}
                        className={`border-2 rounded-lg p-4 text-left hover:scale-105 transition-transform ${variantConfig.color}`}
                      >
                        {/* Variant Badge */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{variantConfig.icon}</span>
                          <span className={`text-xs px-2 py-0.5 rounded border ${getStageColor(child.stage)}`}>
                            S{child.stage}
                          </span>
                        </div>
                        
                        {/* Variant Type Label */}
                        <div className="text-xs font-medium opacity-80 mb-1">{variantConfig.label}</div>
                        
                        {/* Skill Name */}
                        <div className="font-semibold mb-2 line-clamp-1">{child.name}</div>
                        
                        {/* Stats Row */}
                        <div className="flex gap-2 text-xs mb-2">
                          <span className="text-red-400">{child.ampPercent}%</span>
                          <span className="text-blue-400">{child.apCost} AP</span>
                          <span className="text-yellow-400">{child.cooldown}T</span>
                        </div>
                        
                        {/* Effect Preview */}
                        <div className="text-xs text-gray-400 line-clamp-2">{child.description}</div>
                        
                        {/* Extra Info for special variants */}
                        {child.buffType && (
                          <div className="mt-2 text-xs text-yellow-400">💪 {child.buffType} ({child.buffDuration} turns)</div>
                        )}
                        {child.debuffType && (
                          <div className="mt-2 text-xs text-purple-400">💀 {child.debuffType} ({child.debuffDuration} turns)</div>
                        )}
                        {child.hitCount && (
                          <div className="mt-2 text-xs text-cyan-400">⛓️ {child.hitCount} hits</div>
                        )}
                        {child.lifestealPercent && (
                          <div className="mt-2 text-xs text-slate-400">❤️‍🩹 {child.lifestealPercent}% lifesteal</div>
                        )}
                        
                        <div className="mt-3 text-xs text-center opacity-70">
                          Click to view →
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Save/Regenerate Buttons */}
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleSaveAllChildren}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
                  >
                    💾 Save All to Database
                  </button>
                  <button
                    onClick={handleRegenerateChildren}
                    disabled={generating}
                    className="flex-1 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    {generating ? '⏳ Regenerating...' : '🔄 Regenerate All'}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  )
}
