'use client'

import { useState } from 'react'
import { SkillTypeCategory, StarterSkill } from '@/data/universal-skills-data'
import { SkillSidebar } from './components/SkillSidebar'
import { SkillDashboard } from './components/SkillDashboard'
import { SkillEditor } from './components/SkillEditor'
import { Skill } from './types'

export default function SkillDatabaseBuilder() {
  // Navigation
  const [view, setView] = useState<'dashboard' | 'skill'>('dashboard')
  
  // Data
  const [currentSkill, setCurrentSkill] = useState<Skill | null>(null)
  const [childSkills, setChildSkills] = useState<Skill[]>([])
  const [breadcrumb, setBreadcrumb] = useState<Skill[]>([])
  
  // UI
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lockingSkillId, setLockingSkillId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  // ============================================
  // HANDLERS
  // ============================================

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
        // This ensures the database is in sync with the code definition
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
          // If update fails, still use existing skill but warn
          skill = data.skill
          console.warn('Failed to sync starter skill with code definition')
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
      setView('skill')
    } catch (error) {
      setMessage(`❌ Error: ${error}`)
    }
    
    setLoading(false)
  }

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
      setView('skill')
    }
    
    setLoading(false)
  }

  const handleBreadcrumbClick = async (index: number) => {
    if (index === -1) {
      setView('dashboard')
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
    setView('skill')
  }

  const handleGenerateChildren = async (variants?: string[]) => {
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
          selectedVariants: variants,
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage(`✅ Generated ${data.children.length} child skills!`)
        setChildSkills(data.children)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Failed to generate: ${error}`)
    }
    
    setGenerating(false)
  }

  const handleSaveSkill = async (skillToSave: Skill) => {
    setSaving(true)
    setMessage('💾 Saving skill...')
    
    try {
      const response = await fetch('/api/skills/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skillToSave)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setCurrentSkill(skillToSave)
        setMessage('✅ Skill saved!')
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Failed to save: ${error}`)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAllChildren = async () => {
    if (childSkills.length === 0) return
    
    setSaving(true)
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
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerateChildren = async () => {
    if (!currentSkill) return
    
    setGenerating(true)
    setMessage('🔄 Regenerating children...')
    
    try {
      // Delete existing unsaved children (API now respects locks)
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

  const handleToggleLock = async (skill: Skill) => {
    setLockingSkillId(skill.id)
    try {
      // Toggle both Locked and Saved state together
      // If it's locked, we unlock and unsave
      // If it's unlocked, we lock and save
      const newState = !skill.isLocked
      
      const response = await fetch('/api/skills/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: skill.id,
          isLocked: newState,
          isSaved: newState
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Update local state
        setChildSkills(prev => prev.map(s => s.id === skill.id ? { ...s, isLocked: newState, isSaved: newState } : s))
        setMessage(newState ? '🔒 Skill Locked & Saved' : '🔓 Skill Unlocked & Unsaved')
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Failed to toggle lock: ${error}`)
    } finally {
      setLockingSkillId(null)
    }
  }

  const handleResetTree = async () => {
    if (!currentSkill) return
    
    const starterName = currentSkill.starterSkillName || currentSkill.name
    
    if (!confirm(`Reset tree for "${starterName}"? \n\nThis will delete all generated skills for this weapon that are NOT Saved or Locked.\n\nSaved/Locked skills will be preserved.`)) {
      return
    }
    
    setMessage(`🗑️ Resetting tree for ${starterName}...`)
    
    try {
      const response = await fetch('/api/skills/delete-all-children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          starterSkillName: starterName,
          deleteAll: false 
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage(`✅ Deleted ${data.count} skills. Tree reset (Saved/Locked preserved).`)
        setChildSkills([])
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Failed to reset: ${error}`)
    }
  }

  return (
    <div className="flex h-screen bg-[#111] text-white overflow-hidden font-sans">
      <SkillSidebar 
        onSelectStarter={handleSelectStarterSkill} 
        selectedStarterName={currentSkill?.starterSkillName || (breadcrumb.length > 0 ? breadcrumb[0].name : undefined)}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Message Toast */}
        {message && (
          <div className="absolute top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in">
            <div className={`px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md flex items-center gap-3 ${
              message.includes('✅') ? 'bg-green-900/80 border-green-500/50 text-green-100' : 
              message.includes('⚠️') ? 'bg-yellow-900/80 border-yellow-500/50 text-yellow-100' :
              message.includes('🔒') ? 'bg-blue-900/80 border-blue-500/50 text-blue-100' :
              message.includes('🔓') ? 'bg-gray-800/80 border-gray-500/50 text-gray-100' :
              'bg-red-900/80 border-red-500/50 text-red-100'
            }`}>
              <span>{message}</span>
              <button onClick={() => setMessage('')} className="opacity-70 hover:opacity-100 font-bold ml-2">✕</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center bg-[#111]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#6eb5ff] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 animate-pulse">Loading skill data...</p>
            </div>
          </div>
        ) : (
          view === 'skill' && currentSkill ? (
            <SkillEditor 
              skill={currentSkill}
              childSkills={childSkills}
              breadcrumb={breadcrumb}
              onNavigate={handleNavigateToSkill}
              onBreadcrumbClick={handleBreadcrumbClick}
              onSave={handleSaveSkill}
              onGenerateChildren={handleGenerateChildren}
              onRegenerateChildren={handleRegenerateChildren}
              onSaveAllChildren={handleSaveAllChildren}
              onResetTree={handleResetTree}
              onToggleLock={handleToggleLock}
              generating={generating}
              saving={saving}
              lockingSkillId={lockingSkillId}
            />
          ) : (
            <SkillDashboard />
          )
        )}
      </div>
    </div>
  )
}
