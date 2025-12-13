'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SKILL_TYPE_CATEGORIES, SkillTypeCategory, StarterSkill } from '@/data/universal-skills-data'
import { Skill, ALL_VARIANTS, TARGET_TYPES, DAMAGE_TYPES, WEAPON_REQS, VARIANT_CONFIG, BUFF_TYPES, DEBUFF_TYPES, TRIGGER_CONDITIONS, UTILITY_EFFECTS } from './types'
import { getStageColor } from './utils'

// ============================================
// UI CONFIG & TYPES
// ============================================

interface CategoryConfig {
  id: string
  icon: string
  label: string
  description: string
  color: string
  borderColor: string
  bgColor: string
  tag: string
}

const CATEGORIES: CategoryConfig[] = SKILL_TYPE_CATEGORIES.map(c => {
  // Extract color theme from the tailwind string (e.g. 'bg-red-900/50 border-red-500 text-red-300')
  const colorMatch = c.color.match(/text-([a-z]+)-300/)
  const baseColor = colorMatch ? colorMatch[1] : 'gray'
  
  return {
    id: c.id,
    icon: c.icon,
    label: c.name,
    description: c.description,
    color: `text-${baseColor}-400`,
    borderColor: `border-${baseColor}-500/50`,
    bgColor: `bg-${baseColor}-900/10`,
    tag: c.weaponRequirement.replace('_only', '')
  }
})

// ============================================
// SHARED COMPONENTS
// ============================================

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

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

function InputField({ label, value, onChange, type = 'text', placeholder = '', color = 'text-white' }: any) {
  return (
    <div>
      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm ${color} focus:border-[#6eb5ff] focus:outline-none transition-colors`}
      />
    </div>
  )
}

function SelectField({ label, value, options, onChange, allowEmpty = false, emptyLabel = '-- None --' }: any) {
  return (
    <div>
      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#6eb5ff] focus:outline-none transition-colors capitalize"
      >
        {allowEmpty && <option value="">{emptyLabel}</option>}
        {options.map((opt: string) => (
          <option key={opt} value={opt} className="capitalize">{opt.replace(/_/g, ' ')}</option>
        ))}
      </select>
    </div>
  )
}

function ToggleField({ label, value, onChange }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-[#6eb5ff]' : 'bg-gray-700'}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  )
}

function SkillIcon({ iconUrl, variantType, size = 'lg' }: { iconUrl?: string | null, variantType: string, size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClasses = { sm: 'w-8 h-8 text-lg', md: 'w-12 h-12 text-2xl', lg: 'w-16 h-16 text-3xl', xl: 'w-24 h-24 text-5xl' }
  const variantConfig = VARIANT_CONFIG[variantType] || VARIANT_CONFIG.base
  return (
    <div className={`${sizeClasses[size]} relative rounded-lg overflow-hidden border-2 border-white/20 bg-gradient-to-br from-black/80 to-black/40 flex items-center justify-center shadow-xl`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      {iconUrl ? <img src={iconUrl} alt="Icon" className="w-full h-full object-cover" /> : <span className="relative z-10">{variantConfig.icon}</span>}
    </div>
  )
}

// ============================================
// SKILL DETAIL PANEL
// ============================================

function SkillDetailPanel({ 
  skill, 
  childSkills, 
  breadcrumb, 
  onNavigate, 
  onBreadcrumbClick, 
  onClose,
  onSave, 
  onGenerateChildren, 
  onRegenerateChildren, 
  onSaveAllChildren, 
  onResetTree, 
  onToggleLock, 
  generating, 
  saving, 
  lockingSkillId 
}: any) {
  const [activeTab, setActiveTab] = useState<'overview' | 'combat' | 'effects' | 'flavor' | 'tree'>('overview')
  const [editMode, setEditMode] = useState(false)
  const [editedSkill, setEditedSkill] = useState<Skill | null>(null)
  const [selectedVariants, setSelectedVariants] = useState<string[]>([])

  useEffect(() => {
    setEditMode(false)
    setEditedSkill(null)
    setActiveTab('overview')
    setSelectedVariants([])
  }, [skill.id])

  const handleStartEdit = () => {
    setEditedSkill(JSON.parse(JSON.stringify(skill)))
    setEditMode(true)
  }

  const handleSave = async () => {
    if (editedSkill) {
      await onSave(editedSkill)
      setEditMode(false)
    }
  }

  const toggleVariant = (variant: string) => {
    setSelectedVariants(prev => prev.includes(variant) ? prev.filter(v => v !== variant) : [...prev, variant])
  }

  const currentData = editMode && editedSkill ? editedSkill : skill
  const variantConfig = VARIANT_CONFIG[currentData.variantType] || VARIANT_CONFIG.base

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'combat', label: 'Combat', icon: '⚔️' },
    { id: 'effects', label: 'Effects', icon: '✨' },
    { id: 'flavor', label: 'Flavor', icon: '📜' },
    { id: 'tree', label: 'Tree', icon: '🌳' },
  ]

  return (
    <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#1a1a2e] rounded-xl border border-[#333] overflow-hidden flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="relative p-6 border-b border-[#333] shrink-0">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" fill="%23ffffff" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E")' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6eb5ff]/50 to-transparent" />
        <div className="relative flex justify-between items-start">
          <div className="flex-1">
             {/* Breadcrumbs - Styled as requested */}
             <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 font-medium">
               <button onClick={() => onBreadcrumbClick(-1)} className="hover:text-[#6eb5ff] transition-colors flex items-center gap-2 group">
                 <span className="text-lg group-hover:scale-110 transition-transform">🏠</span> 
                 <span className="group-hover:text-white">Dashboard</span>
               </button>
               {breadcrumb.map((s: Skill, i: number) => (
                 <span key={s.id} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                   <span className="text-gray-600 text-xs">›</span>
                   <button 
                     onClick={() => onBreadcrumbClick(i)}
                     className={`transition-colors hover:text-[#6eb5ff] ${i === breadcrumb.length - 1 ? 'text-white font-bold' : 'text-gray-400'}`}
                   >
                     {s.name}
                   </button>
                 </span>
               ))}
             </div>

             <div className="flex items-center gap-5">
              <SkillIcon iconUrl={currentData.iconUrl} variantType={currentData.variantType} size="xl" />
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{currentData.name}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStageColor(currentData.stage)} bg-black/40`}>
                    Stage {currentData.stage}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${variantConfig.color}`}>
                    {variantConfig.icon} {variantConfig.label}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium border border-white/20 bg-black/40 text-gray-300">
                    {currentData.skillType}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
             <div className="flex gap-2">
                {!editMode ? (
                  <>
                    <button onClick={handleStartEdit} className="px-4 py-2 bg-gradient-to-r from-[#6eb5ff] to-[#4a9eff] text-black font-bold rounded-lg hover:opacity-90 transition-all text-sm">
                      ✏️ Edit
                    </button>
                    {skill.stage === 0 && (
                      <button onClick={onResetTree} className="px-4 py-2 bg-red-900/80 border border-red-500/50 text-red-200 font-bold rounded-lg hover:bg-red-800 transition-all text-sm">
                        🗑️ Reset Tree
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:opacity-90 transition-all text-sm">
                      {saving ? 'Saving...' : '💾 Save'}
                    </button>
                    <button onClick={() => setEditMode(false)} className="px-4 py-2 bg-gray-800 text-gray-300 font-bold rounded-lg hover:bg-gray-700 transition-all text-sm">
                      Cancel
                    </button>
                  </>
                )}
             </div>
             <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#333] bg-[#111] shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
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
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-[#0a0a0a] to-[#111]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {editMode ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionPanel title="Identity" icon="🆔">
                  <div className="space-y-4">
                    <InputField label="Skill Name" value={currentData.name} onChange={(v: string) => setEditedSkill({...editedSkill!, name: v})} />
                    <InputField label="Icon URL" value={currentData.iconUrl || ''} onChange={(v: string) => setEditedSkill({...editedSkill!, iconUrl: v || null})} placeholder="https://..." />
                    <div className="grid grid-cols-2 gap-4">
                      <SelectField label="Variant" value={currentData.variantType} options={['base', ...ALL_VARIANTS]} onChange={(v: string) => setEditedSkill({...editedSkill!, variantType: v})} />
                      <InputField label="Stage" type="number" value={currentData.stage} onChange={(v: string) => setEditedSkill({...editedSkill!, stage: parseInt(v) || 0})} />
                    </div>
                  </div>
                </SectionPanel>
                <SectionPanel title="Requirements" icon="🔒">
                  <div className="space-y-4">
                    <SelectField label="Weapon Requirement" value={currentData.weaponRequirement} options={WEAPON_REQS} onChange={(v: string) => setEditedSkill({...editedSkill!, weaponRequirement: v})} />
                    <SelectField label="Damage Type" value={currentData.damageType} options={DAMAGE_TYPES} onChange={(v: string) => setEditedSkill({...editedSkill!, damageType: v})} />
                  </div>
                </SectionPanel>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Damage Amp" value={currentData.ampPercent} unit="%" color="text-red-400" icon="💥" />
                  <StatCard label="AP Cost" value={currentData.apCost} color="text-blue-400" icon="⚡" />
                  <StatCard label="Cooldown" value={currentData.cooldown} unit="T" color="text-yellow-400" icon="⏱️" />
                  <StatCard label="Range" value={currentData.range} color="text-orange-400" icon="📏" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SectionPanel title="Core Information" icon="📋">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-gray-500 text-sm">Classification</span>
                        <span className="text-white font-medium">{currentData.skillType}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-gray-500 text-sm">Weapon Requirement</span>
                        <span className="text-white font-medium capitalize">{currentData.weaponRequirement.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-500 text-sm">Hit Count</span>
                        <span className="text-cyan-300 font-medium">{currentData.hitCount}x</span>
                      </div>
                    </div>
                  </SectionPanel>
                  <SectionPanel title="Description" icon="📝">
                    <p className="text-gray-300 text-sm leading-relaxed">{currentData.description}</p>
                  </SectionPanel>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'combat' && (
          <div className="space-y-6">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Target" value={currentData.targetType.replace(/_/g, ' ')} color="text-purple-300" icon="🎯" />
                <StatCard label="Hits" value={`${currentData.hitCount}x`} color="text-cyan-300" icon="⚔️" />
                {currentData.armorPierce && <StatCard label="Armor Pierce" value={currentData.armorPierce} unit="%" color="text-white" icon="🔪" />}
                {currentData.lifestealPercent && <StatCard label="Lifesteal" value={currentData.lifestealPercent} unit="%" color="text-pink-400" icon="🩸" />}
             </div>
             {(currentData.bonusVsGuard || currentData.isCounter) && (
               <SectionPanel title="Special Modifiers" icon="⭐">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {currentData.bonusVsGuard && <div className="text-green-400">Bonus vs Guard: +{currentData.bonusVsGuard}%</div>}
                   {currentData.isCounter && <div className="text-yellow-400">Counter Trigger: {currentData.triggerCondition}</div>}
                 </div>
               </SectionPanel>
             )}
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <SectionPanel title="Buffs" icon="💪" color="border-yellow-500/30">
                 {currentData.buffType ? (
                   <div className="text-yellow-300 font-bold capitalize">{currentData.buffType.replace(/_/g, ' ')} ({currentData.buffValue} val, {currentData.buffDuration} turns)</div>
                 ) : <div className="text-gray-500 text-center">No Buffs</div>}
               </SectionPanel>
               <SectionPanel title="Debuffs" icon="💀" color="border-purple-500/30">
                 {currentData.debuffType ? (
                   <div className="text-purple-300 font-bold capitalize">{currentData.debuffType.replace(/_/g, ' ')} ({currentData.debuffValue} val, {currentData.debuffDuration} turns)</div>
                 ) : <div className="text-gray-500 text-center">No Debuffs</div>}
               </SectionPanel>
            </div>
          </div>
        )}

        {activeTab === 'flavor' && (
           <div className="space-y-6">
             <SectionPanel title="Execution Narrative" icon="📜">
               <p className="text-gray-400 italic leading-relaxed">"{currentData.executionDescription || 'No narrative description.'}"</p>
             </SectionPanel>
           </div>
        )}

        {activeTab === 'tree' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Child Skills (Stage {skill.stage + 1})</h2>
              <div className="flex gap-2">
                 <button onClick={onSaveAllChildren} disabled={childSkills.length === 0 || saving} className="px-4 py-2 bg-green-600 rounded text-sm font-bold disabled:opacity-50">Save All</button>
                 <button onClick={onRegenerateChildren} disabled={childSkills.length === 0 || generating} className="px-4 py-2 bg-orange-600 rounded text-sm font-bold disabled:opacity-50">Regenerate</button>
              </div>
            </div>

            {childSkills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {childSkills.map((child: Skill) => {
                  const cConfig = VARIANT_CONFIG[child.variantType] || VARIANT_CONFIG.base
                  return (
                    <div key={child.id} onClick={() => !child.isLocked && onNavigate(child)} className={`relative group rounded-xl border-2 p-4 cursor-pointer hover:scale-[1.02] transition-all ${child.isLocked ? 'border-blue-500/50 bg-blue-900/10' : 'border-white/10 bg-[#1a1a1a]'}`}>
                      <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center gap-2">
                            <SkillIcon iconUrl={child.iconUrl} variantType={child.variantType} size="sm" />
                            <div className="font-bold text-sm text-white line-clamp-1">{child.name}</div>
                         </div>
                         <button onClick={(e) => { e.stopPropagation(); onToggleLock(child) }} className="text-xl">
                           {child.isLocked ? '🔒' : '🔓'}
                         </button>
                      </div>
                      <div className="text-xs text-gray-400 line-clamp-2">{child.description}</div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-[#333] rounded-xl">
                 <p className="text-gray-500 mb-4">No child skills generated.</p>
                 {skill.stage < 5 && (
                    <div className="max-w-md mx-auto">
                       <div className="flex flex-wrap gap-2 justify-center mb-4">
                         {ALL_VARIANTS.map(v => (
                           <button key={v} onClick={() => toggleVariant(v)} className={`px-2 py-1 text-xs border rounded ${selectedVariants.includes(v) ? 'bg-blue-600 border-blue-600' : 'border-gray-600'}`}>{v}</button>
                         ))}
                       </div>
                       <button onClick={() => onGenerateChildren(selectedVariants.length > 0 ? selectedVariants : undefined)} disabled={generating} className="w-full py-3 bg-blue-600 rounded-lg font-bold">
                         {generating ? 'Generating...' : `Generate Stage ${skill.stage + 1}`}
                       </button>
                    </div>
                 )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// DASHBOARD COMPONENTS
// ============================================

function DashboardStats({ totalSkills, totalCategories }: { totalSkills: number, totalCategories: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#333] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">
          <div className="text-4xl font-bold text-blue-400 mb-1">{totalSkills}</div>
          <div className="text-gray-400 text-sm font-medium">Total Skills</div>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-6xl opacity-5">📊</div>
      </div>
      
      <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#333] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">
          <div className="text-4xl font-bold text-purple-400 mb-1">{totalCategories}</div>
          <div className="text-gray-400 text-sm font-medium">Skill Categories</div>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-6xl opacity-5">📂</div>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#333] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">
          <div className="text-4xl font-bold text-green-400 mb-1">Active</div>
          <div className="text-gray-400 text-sm font-medium">System Status</div>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-6xl opacity-5">✅</div>
      </div>
    </div>
  )
}

function CategoryGrid({ onSelectCategory, skillCounts }: { 
  onSelectCategory: (id: string) => void,
  skillCounts: Record<string, number>
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {CATEGORIES.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={`relative overflow-hidden rounded-xl border ${cat.borderColor} bg-[#1a1a1a] p-6 text-left transition-all hover:scale-[1.02] hover:shadow-lg group`}
        >
          <div className={`absolute inset-0 ${cat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <span className={`text-lg font-bold ${cat.color}`}>{cat.label}</span>
              </div>
            </div>
            <p className="text-gray-400 text-xs mb-6 h-8 line-clamp-2">{cat.description}</p>
            <div className="flex justify-between items-end border-t border-white/5 pt-4">
              <div className="text-2xl font-bold text-white">
                {skillCounts[cat.id] || 0} <span className="text-xs font-normal text-gray-500">Skills</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded bg-black/40 border border-white/10 ${cat.color}`}>
                {cat.tag}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

function Sidebar({ activeCategory, onSelectCategory, onBackToDashboard }: { 
  activeCategory: string | null, 
  onSelectCategory: (id: string) => void,
  onBackToDashboard: () => void 
}) {
  return (
    <div className="w-64 bg-[#0a0a0a] border-r border-[#333] flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="p-4 border-b border-[#333]">
        <div className="flex items-center gap-2 text-white font-bold text-lg mb-6">
          <span>🎮</span> SKILL DATABASE
        </div>
        <div className="relative">
          <input type="text" placeholder="Search skills..." className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg py-2 pl-9 pr-4 text-sm text-gray-300 focus:outline-none focus:border-[#6eb5ff]" />
          <span className="absolute left-3 top-2.5 text-gray-500 text-xs">🔍</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <button
          onClick={onBackToDashboard}
          className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors flex items-center justify-between group ${
            activeCategory === null ? 'text-[#6eb5ff] bg-[#6eb5ff]/10 border-l-2 border-[#6eb5ff]' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>Dashboard</span>
        </button>
        <div className="my-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Categories</div>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors flex items-center justify-between group ${
              activeCategory === cat.id ? `${cat.color} bg-white/5 border-l-2 border-current` : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="opacity-70 group-hover:opacity-100 transition-opacity">{cat.icon}</span>
              <span>{cat.label}</span>
            </div>
            {activeCategory === cat.id && <span className="text-[10px]">▶</span>}
          </button>
        ))}
      </div>
      <div className="p-4 border-t border-[#333] text-xs text-gray-600">v2.0.0 • Skill DB</div>
    </div>
  )
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function SkillDatabaseBuilder() {
  const [view, setView] = useState<'dashboard' | 'category' | 'detail'>('dashboard')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  const [currentSkill, setCurrentSkill] = useState<Skill | null>(null)
  const [childSkills, setChildSkills] = useState<Skill[]>([])
  const [breadcrumb, setBreadcrumb] = useState<Skill[]>([])
  
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lockingSkillId, setLockingSkillId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  // Count skills for dashboard
  const [skillCounts, setSkillCounts] = useState<Record<string, number>>({})
  const [totalSkills, setTotalSkills] = useState(0)

  useEffect(() => {
    // Calculate counts from static data
    const counts: Record<string, number> = {}
    let total = 0
    
    SKILL_TYPE_CATEGORIES.forEach(cat => {
      counts[cat.id] = cat.skills.length
      total += cat.skills.length
    })
    
    setSkillCounts(counts)
    setTotalSkills(total)
  }, [])

  // Navigation
  const handleSelectCategory = (id: string) => {
    setSelectedCategory(id)
    setView('category')
  }

  const handleBackToDashboard = () => {
    setView('dashboard')
    setSelectedCategory(null)
    setCurrentSkill(null)
  }

  // Load starter skill
  const handleSelectStarterSkill = async (starter: StarterSkill) => {
    setLoading(true)
    setMessage('')
    try {
      // Fetch or Create Logic (same as before)
      const response = await fetch(`/api/skills/get?name=${encodeURIComponent(starter.name)}`)
      const data = await response.json()
      let skill: Skill
      if (data.skill) {
         skill = data.skill
      } else {
         // Create new starter logic
         const cat = SKILL_TYPE_CATEGORIES.find(c => c.skills.find(s => s.name === starter.name))
         const createResponse = await fetch('/api/skills/create', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             name: starter.name,
             description: starter.description,
             skillType: cat?.name || 'General',
             damageType: starter.damageType,
             weaponRequirement: starter.weaponRequirement,
             hasUtilityMode: starter.hasUtilityMode || false,
             utilityEffect: starter.utilityEffect || null,
             utilityDuration: starter.utilityDuration || null,
             stage: 0,
             variantType: 'base',
             ampPercent: starter.ampPercent,
             apCost: starter.apCost,
             cooldown: starter.cooldown,
             targetType: 'single',
             range: starter.range,
             hitCount: 1,
             starterSkillName: starter.name,
           })
         })
         const createData = await createResponse.json()
         if (!createData.success) throw new Error(createData.error)
         skill = createData.skill
      }
      setCurrentSkill(skill)
      setBreadcrumb([skill])
      await loadChildSkills(skill.id)
      setView('detail')
    } catch (error) {
      setMessage(`Error: ${error}`)
    }
    setLoading(false)
  }

  const loadChildSkills = async (parentId: string) => {
    try {
      const response = await fetch(`/api/skills/children?parentId=${parentId}`)
      const data = await response.json()
      setChildSkills(data.children || [])
    } catch {
      setChildSkills([])
    }
  }

  const handleNavigateToSkill = async (skill: Skill) => {
     setLoading(true)
     const response = await fetch(`/api/skills/get?id=${skill.id}`)
     const data = await response.json()
     if (data.skill) {
       const fullSkill = data.skill
       setBreadcrumb(prev => [...prev, fullSkill])
       setCurrentSkill(fullSkill)
       await loadChildSkills(fullSkill.id)
     }
     setLoading(false)
  }

  const handleBreadcrumbClick = async (index: number) => {
    if (index === -1) {
      setView('category')
      setCurrentSkill(null)
      return
    }
    const skill = breadcrumb[index]
    const newBreadcrumb = breadcrumb.slice(0, index + 1)
    setCurrentSkill(skill)
    setBreadcrumb(newBreadcrumb)
    await loadChildSkills(skill.id)
  }

  // --- Actions ---
  const handleGenerateChildren = async (variants?: string[]) => {
    if (!currentSkill) return
    setGenerating(true)
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
        setChildSkills(data.children)
        setMessage(`✅ Generated ${data.children.length} skills`)
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (e) { setMessage('Failed to generate') }
    setGenerating(false)
  }

  const handleSaveSkill = async (skillToSave: Skill) => {
     setSaving(true)
     try {
       const response = await fetch('/api/skills/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(skillToSave) })
       const data = await response.json()
       if(data.success) {
         setCurrentSkill(skillToSave)
         setMessage('✅ Saved')
       }
     } catch (e) { setMessage('Failed to save') }
     setSaving(false)
  }

  const handleSaveAllChildren = async () => {
    setSaving(true)
    try {
       await fetch('/api/skills/save-children', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ skillIds: childSkills.map(s => s.id) }) })
       setMessage('✅ Saved all children')
       if(currentSkill) await loadChildSkills(currentSkill.id)
    } catch { setMessage('Failed to save children') }
    setSaving(false)
  }

  const handleRegenerateChildren = async () => {
     if(!currentSkill) return
     setGenerating(true)
     try {
        await fetch('/api/skills/delete-unsaved', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ parentId: currentSkill.id }) })
        await handleGenerateChildren()
     } catch { setMessage('Failed to regenerate') }
     setGenerating(false)
  }

  const handleResetTree = async () => {
     if(!confirm('Reset entire tree?')) return
     try {
       await fetch('/api/skills/delete-all-children', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ starterSkillName: currentSkill?.starterSkillName }) })
       setMessage('Tree reset')
       if(currentSkill) await loadChildSkills(currentSkill.id)
     } catch { setMessage('Reset failed') }
  }

  const handleToggleLock = async (skill: Skill) => {
    setLockingSkillId(skill.id)
    try {
      const newState = !skill.isLocked
      const response = await fetch('/api/skills/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: skill.id, isLocked: newState, isSaved: newState }) })
      if ((await response.json()).success) {
        setChildSkills(prev => prev.map(s => s.id === skill.id ? { ...s, isLocked: newState } : s))
      }
    } catch {}
    setLockingSkillId(null)
  }

  const activeCategoryConfig = CATEGORIES.find(c => c.id === selectedCategory)
  const categoryStarterSkills = SKILL_TYPE_CATEGORIES.find(c => c.id === selectedCategory)?.skills || []

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white font-sans">
      <Sidebar activeCategory={selectedCategory} onSelectCategory={handleSelectCategory} onBackToDashboard={handleBackToDashboard} />
      
      <div className="flex-1 ml-64 p-8">
        {message && (
          <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-gray-800 border border-gray-600 rounded shadow-lg flex items-center gap-2">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="opacity-50 hover:opacity-100">✕</button>
          </div>
        )}

        {view === 'dashboard' && (
           <div className="max-w-7xl mx-auto">
             <h1 className="text-3xl font-bold text-white mb-2">Skill Database</h1>
             <p className="text-gray-400 mb-8">Select a category to view skill trees.</p>
             <DashboardStats totalSkills={totalSkills} totalCategories={CATEGORIES.length} />
             <CategoryGrid onSelectCategory={handleSelectCategory} skillCounts={skillCounts} />
           </div>
        )}

        {view === 'category' && activeCategoryConfig && (
           <div className="max-w-7xl mx-auto">
             <div className="flex items-center gap-4 mb-8">
                <button onClick={handleBackToDashboard} className="p-2 bg-[#1a1a1a] border border-[#333] rounded-lg hover:text-white text-gray-400">← Back</button>
                <div>
                   <h1 className={`text-2xl font-bold ${activeCategoryConfig.color}`}>{activeCategoryConfig.label}</h1>
                   <p className="text-gray-400 text-sm">{activeCategoryConfig.description}</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryStarterSkills.map(starter => (
                   <button 
                     key={starter.name} 
                     onClick={() => handleSelectStarterSkill(starter)}
                     className="bg-[#1a1a1a] border border-[#333] p-4 rounded-xl text-left hover:border-gray-500 transition-all flex items-center gap-4 group"
                   >
                      <div className="w-12 h-12 bg-black/40 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {activeCategoryConfig.icon}
                      </div>
                      <div>
                        <div className="font-bold text-white">{starter.name}</div>
                        <div className="text-xs text-gray-500">{starter.subtype} • {starter.damageType}</div>
                      </div>
                   </button>
                ))}
             </div>
           </div>
        )}

        {view === 'detail' && currentSkill && (
           <SkillDetailPanel 
             skill={currentSkill}
             childSkills={childSkills}
             breadcrumb={breadcrumb}
             onNavigate={handleNavigateToSkill}
             onBreadcrumbClick={handleBreadcrumbClick}
             onClose={() => setView('category')}
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
        )}
      </div>
    </div>
  )
}
