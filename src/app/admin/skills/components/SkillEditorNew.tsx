'use client'

import { useState, useEffect } from 'react'
import { 
  Skill, 
  ALL_VARIANTS, 
  TARGET_TYPES, 
  DAMAGE_TYPES, 
  WEAPON_REQS, 
  VARIANT_CONFIG,
  BUFF_TYPES,
  DEBUFF_TYPES,
  TRIGGER_CONDITIONS,
  UTILITY_EFFECTS
} from '../types'
import { getVariantColor, getVariantIcon, getStageColor } from '../utils'

// ============================================
// PROPS INTERFACE
// ============================================

interface SkillEditorProps {
  skill: Skill
  childSkills: Skill[]
  breadcrumb: Skill[]
  onNavigate: (skill: Skill) => void
  onBreadcrumbClick: (index: number) => void
  onSave: (skill: Skill) => Promise<void>
  onGenerateChildren: (variants?: string[]) => Promise<void>
  onRegenerateChildren: () => Promise<void>
  onSaveAllChildren: () => Promise<void>
  onResetTree: () => Promise<void>
  onToggleLock: (skill: Skill) => void
  generating: boolean
  saving: boolean
  lockingSkillId: string | null
}

// ============================================
// HELPER COMPONENTS
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

function InputField({ 
  label, 
  value, 
  onChange, 
  type = 'text',
  placeholder = '',
  color = 'text-white'
}: {
  label: string
  value: string | number
  onChange: (value: string) => void
  type?: 'text' | 'number'
  placeholder?: string
  color?: string
}) {
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

function SelectField({ 
  label, 
  value, 
  options, 
  onChange,
  allowEmpty = false,
  emptyLabel = '-- None --'
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  allowEmpty?: boolean
  emptyLabel?: string
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#6eb5ff] focus:outline-none transition-colors capitalize"
      >
        {allowEmpty && <option value="">{emptyLabel}</option>}
        {options.map(opt => (
          <option key={opt} value={opt} className="capitalize">{opt.replace(/_/g, ' ')}</option>
        ))}
      </select>
    </div>
  )
}

function ToggleField({ label, value, onChange }: {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}) {
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

// ============================================
// SKILL ICON COMPONENT
// ============================================

function SkillIcon({ iconUrl, variantType, size = 'lg' }: {
  iconUrl?: string | null
  variantType: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-24 h-24 text-5xl',
  }
  
  const variantConfig = VARIANT_CONFIG[variantType] || VARIANT_CONFIG.root
  
  return (
    <div className={`${sizeClasses[size]} relative rounded-lg overflow-hidden border-2 border-white/20 bg-gradient-to-br from-black/80 to-black/40 flex items-center justify-center shadow-xl`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      {iconUrl ? (
        <img src={iconUrl} alt="Skill Icon" className="w-full h-full object-cover" />
      ) : (
        <span className="relative z-10">{variantConfig.icon}</span>
      )}
      <div className="absolute inset-0 border border-white/10 rounded-lg pointer-events-none" />
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function SkillEditor({
  skill,
  childSkills,
  breadcrumb,
  onNavigate,
  onBreadcrumbClick,
  onSave,
  onGenerateChildren,
  onRegenerateChildren,
  onSaveAllChildren,
  onResetTree,
  onToggleLock,
  generating,
  saving,
  lockingSkillId
}: SkillEditorProps) {
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
    setSelectedVariants(prev => 
      prev.includes(variant) 
        ? prev.filter(v => v !== variant)
        : [...prev, variant]
    )
  }

  const currentData = editMode && editedSkill ? editedSkill : skill
  const variantConfig = VARIANT_CONFIG[currentData.variantType] || VARIANT_CONFIG.root

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'combat', label: 'Combat', icon: '⚔️' },
    { id: 'effects', label: 'Effects', icon: '✨' },
    { id: 'flavor', label: 'Flavor', icon: '📜' },
    { id: 'tree', label: 'Tree', icon: '🌳' },
  ]

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* ============================================ */}
      {/* HEADER - Textured with skill icon */}
      {/* ============================================ */}
      <div className="relative overflow-hidden border-b border-[#333]">
        {/* Background texture */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#1a1a2e]" />
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23ffffff" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E")' }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6eb5ff]/50 to-transparent" />
        
        <div className="relative p-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <button onClick={() => onBreadcrumbClick(-1)} className="hover:text-[#6eb5ff] transition-colors flex items-center gap-1">
              <span>🏠</span> Skills
            </button>
            {breadcrumb.map((s, i) => (
              <span key={s.id} className="flex items-center gap-2">
                <span className="text-gray-600">›</span>
                <button 
                  onClick={() => onBreadcrumbClick(i)}
                  className={`hover:text-[#6eb5ff] transition-colors ${i === breadcrumb.length - 1 ? 'text-white font-bold' : ''}`}
                >
                  {s.name}
                </button>
              </span>
            ))}
          </div>

          {/* Main header content */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-5">
              {/* Skill Icon */}
              <SkillIcon iconUrl={currentData.iconUrl} variantType={currentData.variantType} size="xl" />
              
              {/* Skill Info */}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">{currentData.name}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStageColor(currentData.stage)} bg-black/40`}>
                    Stage {currentData.stage}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${variantConfig.color}`}>
                    {variantConfig.icon} {variantConfig.label}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium border border-white/20 bg-black/40 text-gray-300">
                    {currentData.skillType}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border border-white/20 bg-black/40 capitalize ${
                    currentData.damageType === 'physical' ? 'text-orange-300' : 
                    currentData.damageType === 'magic' ? 'text-purple-300' : 'text-gray-400'
                  }`}>
                    {currentData.damageType}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {!editMode ? (
                <>
                  <button 
                    onClick={handleStartEdit}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#6eb5ff] to-[#4a9eff] text-black font-bold rounded-lg hover:opacity-90 transition-all shadow-lg shadow-[#6eb5ff]/20"
                  >
                    ✏️ Edit Skill
                  </button>
                  {skill.stage === 0 && (
                    <button 
                      onClick={onResetTree}
                      className="px-5 py-2.5 bg-gradient-to-r from-red-900/80 to-red-800/80 border border-red-500/50 text-red-200 font-bold rounded-lg hover:from-red-800 hover:to-red-700 transition-all"
                    >
                      🗑️ Reset Tree
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-green-500/20"
                  >
                    {saving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      '💾 Save Changes'
                    )}
                  </button>
                  <button 
                    onClick={() => setEditMode(false)}
                    className="px-5 py-2.5 bg-gray-800 border border-gray-600 text-gray-300 font-bold rounded-lg hover:bg-gray-700 transition-all"
                  >
                    ✕ Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* TABS */}
      {/* ============================================ */}
      <div className="flex border-b border-[#333] bg-[#111]">
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

      {/* ============================================ */}
      {/* CONTENT AREA */}
      {/* ============================================ */}
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-[#0a0a0a] to-[#111]">
        
        {/* ============================================ */}
        {/* OVERVIEW TAB */}
        {/* ============================================ */}
        {activeTab === 'overview' && (
          <div className="max-w-5xl mx-auto space-y-6">
            {editMode ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionPanel title="Identity" icon="🆔">
                  <div className="space-y-4">
                    <InputField label="Skill Name" value={currentData.name} onChange={v => setEditedSkill({...editedSkill!, name: v})} />
                    <InputField label="Icon URL" value={currentData.iconUrl || ''} onChange={v => setEditedSkill({...editedSkill!, iconUrl: v || null})} placeholder="https://..." />
                    <div className="grid grid-cols-2 gap-4">
                      <SelectField label="Variant" value={currentData.variantType} options={['root', ...ALL_VARIANTS]} onChange={v => setEditedSkill({...editedSkill!, variantType: v})} />
                      <InputField label="Stage" type="number" value={currentData.stage} onChange={v => setEditedSkill({...editedSkill!, stage: parseInt(v) || 0})} />
                    </div>
                    <InputField label="Skill Type" value={currentData.skillType} onChange={v => setEditedSkill({...editedSkill!, skillType: v})} />
                  </div>
                </SectionPanel>
                
                <SectionPanel title="Requirements" icon="🔒">
                  <div className="space-y-4">
                    <SelectField label="Weapon Requirement" value={currentData.weaponRequirement} options={WEAPON_REQS} onChange={v => setEditedSkill({...editedSkill!, weaponRequirement: v})} />
                    <SelectField label="Damage Type" value={currentData.damageType} options={DAMAGE_TYPES} onChange={v => setEditedSkill({...editedSkill!, damageType: v})} />
                  </div>
                </SectionPanel>
              </div>
            ) : (
              <>
                {/* Quick Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Damage Amp" value={currentData.ampPercent} unit="%" color="text-red-400" icon="💥" />
                  <StatCard label="AP Cost" value={currentData.apCost} color="text-blue-400" icon="⚡" />
                  <StatCard label="Cooldown" value={currentData.cooldown} unit="T" color="text-yellow-400" icon="⏱️" />
                  <StatCard label="Range" value={currentData.range} color="text-orange-400" icon="📏" />
                </div>

                {/* Info Panels */}
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
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-gray-500 text-sm">Target Type</span>
                        <span className="text-purple-300 font-medium capitalize">{currentData.targetType.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-500 text-sm">Hit Count</span>
                        <span className="text-cyan-300 font-medium">{currentData.hitCount}x</span>
                      </div>
                    </div>
                  </SectionPanel>

                  <SectionPanel title="Description" icon="📝">
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Effect</div>
                        <p className="text-gray-300 text-sm leading-relaxed">{currentData.description}</p>
                      </div>
                      {currentData.executionDescription && (
                        <div className="pt-3 border-t border-white/10">
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Narrative</div>
                          <p className="text-gray-400 text-sm italic leading-relaxed">"{currentData.executionDescription}"</p>
                        </div>
                      )}
                    </div>
                  </SectionPanel>
                </div>
              </>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* COMBAT TAB */}
        {/* ============================================ */}
        {activeTab === 'combat' && (
          <div className="max-w-5xl mx-auto space-y-6">
            {editMode ? (
              <>
                <SectionPanel title="Combat Mechanics" icon="⚔️">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <InputField label="Amp %" type="number" value={currentData.ampPercent} color="text-red-400" onChange={v => setEditedSkill({...editedSkill!, ampPercent: parseInt(v) || 0})} />
                    <InputField label="AP Cost" type="number" value={currentData.apCost} color="text-blue-400" onChange={v => setEditedSkill({...editedSkill!, apCost: parseInt(v) || 0})} />
                    <InputField label="Cooldown" type="number" value={currentData.cooldown} color="text-yellow-400" onChange={v => setEditedSkill({...editedSkill!, cooldown: parseInt(v) || 0})} />
                    <InputField label="Range" type="number" value={currentData.range} color="text-orange-400" onChange={v => setEditedSkill({...editedSkill!, range: parseInt(v) || 0})} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <SelectField label="Target Type" value={currentData.targetType} options={TARGET_TYPES} onChange={v => setEditedSkill({...editedSkill!, targetType: v})} />
                    <InputField label="Hit Count" type="number" value={currentData.hitCount} onChange={v => setEditedSkill({...editedSkill!, hitCount: parseInt(v) || 1})} />
                    <SelectField label="Damage Type" value={currentData.damageType} options={DAMAGE_TYPES} onChange={v => setEditedSkill({...editedSkill!, damageType: v})} />
                  </div>
                </SectionPanel>

                <SectionPanel title="Advanced Stats" icon="📊">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InputField label="Armor Pierce %" type="number" value={currentData.armorPierce || 0} onChange={v => setEditedSkill({...editedSkill!, armorPierce: parseInt(v) || null})} />
                    <InputField label="Lifesteal %" type="number" value={currentData.lifestealPercent || 0} onChange={v => setEditedSkill({...editedSkill!, lifestealPercent: parseInt(v) || null})} />
                    <InputField label="Bonus vs Guard %" type="number" value={currentData.bonusVsGuard || 0} onChange={v => setEditedSkill({...editedSkill!, bonusVsGuard: parseInt(v) || null})} />
                    <InputField label="Bonus vs Debuffed %" type="number" value={currentData.bonusVsDebuffed || 0} onChange={v => setEditedSkill({...editedSkill!, bonusVsDebuffed: parseInt(v) || null})} />
                  </div>
                </SectionPanel>

                <SectionPanel title="Counter / Reactive" icon="🛡️">
                  <div className="space-y-4">
                    <ToggleField label="Is Counter Skill?" value={currentData.isCounter} onChange={v => setEditedSkill({...editedSkill!, isCounter: v})} />
                    {currentData.isCounter && (
                      <SelectField 
                        label="Trigger Condition" 
                        value={currentData.triggerCondition || ''} 
                        options={TRIGGER_CONDITIONS} 
                        onChange={v => setEditedSkill({...editedSkill!, triggerCondition: v || null})}
                        allowEmpty
                        emptyLabel="-- Select Trigger --"
                      />
                    )}
                  </div>
                </SectionPanel>
              </>
            ) : (
              <>
                {/* Main Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Damage Amp" value={currentData.ampPercent} unit="%" color="text-red-400" icon="💥" />
                  <StatCard label="AP Cost" value={currentData.apCost} color="text-blue-400" icon="⚡" />
                  <StatCard label="Cooldown" value={currentData.cooldown} unit=" turns" color="text-yellow-400" icon="⏱️" />
                  <StatCard label="Range" value={currentData.range === 1 ? 'Melee' : currentData.range} color="text-orange-400" icon="📏" />
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Target" value={currentData.targetType.replace(/_/g, ' ')} color="text-purple-300" icon="🎯" />
                  <StatCard label="Hits" value={`${currentData.hitCount}x`} color="text-cyan-300" icon="⚔️" />
                  {currentData.armorPierce ? (
                    <StatCard label="Armor Pierce" value={currentData.armorPierce} unit="%" color="text-white" icon="🔪" />
                  ) : null}
                  {currentData.lifestealPercent ? (
                    <StatCard label="Lifesteal" value={currentData.lifestealPercent} unit="%" color="text-pink-400" icon="🩸" />
                  ) : null}
                </div>

                {/* Bonus Stats */}
                {(currentData.bonusVsGuard || currentData.bonusVsDebuffed || currentData.isCounter) && (
                  <SectionPanel title="Special Modifiers" icon="⭐">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {currentData.bonusVsGuard && (
                        <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-white/5">
                          <span className="text-xl">🛡️</span>
                          <div>
                            <div className="text-xs text-gray-500">Bonus vs Guard</div>
                            <div className="text-green-400 font-bold">+{currentData.bonusVsGuard}%</div>
                          </div>
                        </div>
                      )}
                      {currentData.bonusVsDebuffed && (
                        <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-white/5">
                          <span className="text-xl">💀</span>
                          <div>
                            <div className="text-xs text-gray-500">Bonus vs Debuffed</div>
                            <div className="text-green-400 font-bold">+{currentData.bonusVsDebuffed}%</div>
                          </div>
                        </div>
                      )}
                      {currentData.isCounter && (
                        <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-yellow-500/30">
                          <span className="text-xl">⚡</span>
                          <div>
                            <div className="text-xs text-gray-500">Counter Trigger</div>
                            <div className="text-yellow-400 font-bold capitalize">{currentData.triggerCondition?.replace(/_/g, ' ') || 'Active'}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </SectionPanel>
                )}
              </>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* EFFECTS TAB */}
        {/* ============================================ */}
        {activeTab === 'effects' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Buffs */}
              <SectionPanel title="Buff Effects (Self/Ally)" icon="💪" color="border-yellow-500/30">
                {editMode ? (
                  <div className="space-y-4">
                    <SelectField 
                      label="Buff Type" 
                      value={currentData.buffType || ''} 
                      options={BUFF_TYPES} 
                      onChange={v => setEditedSkill({...editedSkill!, buffType: v || null})}
                      allowEmpty
                      emptyLabel="-- No Buff --"
                    />
                    {currentData.buffType && (
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="Value" type="number" value={currentData.buffValue || 0} onChange={v => setEditedSkill({...editedSkill!, buffValue: parseInt(v) || null})} />
                        <InputField label="Duration (turns)" type="number" value={currentData.buffDuration || 0} onChange={v => setEditedSkill({...editedSkill!, buffDuration: parseInt(v) || null})} />
                      </div>
                    )}
                  </div>
                ) : (
                  currentData.buffType ? (
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-2xl">
                        💪
                      </div>
                      <div>
                        <div className="text-yellow-300 font-bold text-lg capitalize">{currentData.buffType.replace(/_/g, ' ')}</div>
                        <div className="text-gray-400 text-sm">
                          {currentData.buffValue && <span className="text-yellow-400">+{currentData.buffValue}%</span>}
                          {currentData.buffDuration && <span> for {currentData.buffDuration} turns</span>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm py-4 text-center">No buff effects configured</div>
                  )
                )}
              </SectionPanel>

              {/* Debuffs */}
              <SectionPanel title="Debuff Effects (Enemy)" icon="💀" color="border-purple-500/30">
                {editMode ? (
                  <div className="space-y-4">
                    <SelectField 
                      label="Debuff Type" 
                      value={currentData.debuffType || ''} 
                      options={DEBUFF_TYPES} 
                      onChange={v => setEditedSkill({...editedSkill!, debuffType: v || null})}
                      allowEmpty
                      emptyLabel="-- No Debuff --"
                    />
                    {currentData.debuffType && (
                      <div className="grid grid-cols-3 gap-4">
                        <InputField label="Value" type="number" value={currentData.debuffValue || 0} onChange={v => setEditedSkill({...editedSkill!, debuffValue: parseInt(v) || null})} />
                        <InputField label="Duration" type="number" value={currentData.debuffDuration || 0} onChange={v => setEditedSkill({...editedSkill!, debuffDuration: parseInt(v) || null})} />
                        <InputField label="Chance %" type="number" value={currentData.debuffChance || 100} onChange={v => setEditedSkill({...editedSkill!, debuffChance: parseInt(v) || null})} />
                      </div>
                    )}
                  </div>
                ) : (
                  currentData.debuffType ? (
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-2xl">
                        💀
                      </div>
                      <div>
                        <div className="text-purple-300 font-bold text-lg capitalize">{currentData.debuffType.replace(/_/g, ' ')}</div>
                        <div className="text-gray-400 text-sm">
                          {currentData.debuffValue && <span className="text-purple-400">{currentData.debuffValue}</span>}
                          {currentData.debuffDuration && <span> for {currentData.debuffDuration} turns</span>}
                          {currentData.debuffChance && currentData.debuffChance < 100 && <span> ({currentData.debuffChance}% chance)</span>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm py-4 text-center">No debuff effects configured</div>
                  )
                )}
              </SectionPanel>
            </div>

            {/* Utility Mode */}
            <SectionPanel title="Magic Utility Mode" icon="🔮" color="border-cyan-500/30">
              {editMode ? (
                <div className="space-y-4">
                  <ToggleField label="Has Utility Mode?" value={currentData.hasUtilityMode} onChange={v => setEditedSkill({...editedSkill!, hasUtilityMode: v})} />
                  {currentData.hasUtilityMode && (
                    <div className="grid grid-cols-2 gap-4">
                      <SelectField 
                        label="Enchant Effect" 
                        value={currentData.utilityEffect || ''} 
                        options={UTILITY_EFFECTS} 
                        onChange={v => setEditedSkill({...editedSkill!, utilityEffect: v || null})}
                        allowEmpty
                        emptyLabel="-- Select Effect --"
                      />
                      <InputField label="Duration (turns)" type="number" value={currentData.utilityDuration || 0} onChange={v => setEditedSkill({...editedSkill!, utilityDuration: parseInt(v) || null})} />
                    </div>
                  )}
                </div>
              ) : (
                currentData.hasUtilityMode ? (
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-2xl">
                      🔮
                    </div>
                    <div>
                      <div className="text-cyan-300 font-bold text-lg">Utility Mode Enabled</div>
                      <div className="text-gray-400 text-sm capitalize">
                        {currentData.utilityEffect?.replace(/_/g, ' ')} 
                        {currentData.utilityDuration && <span> ({currentData.utilityDuration} turns)</span>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm py-4 text-center">Utility mode disabled</div>
                )
              )}
            </SectionPanel>
          </div>
        )}

        {/* ============================================ */}
        {/* FLAVOR TAB */}
        {/* ============================================ */}
        {activeTab === 'flavor' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {editMode ? (
              <>
                <SectionPanel title="Effect Description" icon="📝">
                  <textarea 
                    value={currentData.description} 
                    onChange={e => setEditedSkill({...editedSkill!, description: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-4 h-32 text-sm text-white focus:border-[#6eb5ff] focus:outline-none resize-none"
                    placeholder="Describe what the skill does mechanically..."
                  />
                </SectionPanel>

                <SectionPanel title="Execution Narrative" icon="📜">
                  <textarea 
                    value={currentData.executionDescription || ''} 
                    onChange={e => setEditedSkill({...editedSkill!, executionDescription: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-4 h-32 text-sm text-gray-300 italic focus:border-[#6eb5ff] focus:outline-none resize-none"
                    placeholder="Describe how the skill looks when executed..."
                  />
                </SectionPanel>

                <SectionPanel title="Passive Bonus" icon="⭐" color="border-purple-500/30">
                  <textarea 
                    value={currentData.passive || ''} 
                    onChange={e => setEditedSkill({...editedSkill!, passive: e.target.value})}
                    className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 h-24 text-sm text-purple-200 focus:border-purple-500 focus:outline-none resize-none"
                    placeholder="e.g., +5% damage, +10% crit chance..."
                  />
                </SectionPanel>
              </>
            ) : (
              <>
                <SectionPanel title="Effect Description" icon="📝">
                  <p className="text-gray-300 leading-relaxed">{currentData.description}</p>
                </SectionPanel>

                {currentData.executionDescription && (
                  <SectionPanel title="Execution Narrative" icon="📜">
                    <p className="text-gray-400 italic leading-relaxed">"{currentData.executionDescription}"</p>
                  </SectionPanel>
                )}

                {currentData.passive && (
                  <SectionPanel title="Passive Bonus" icon="⭐" color="border-purple-500/30">
                    <p className="text-purple-300 font-medium">{currentData.passive}</p>
                  </SectionPanel>
                )}
              </>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* TREE TAB */}
        {/* ============================================ */}
        {activeTab === 'tree' && (
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Child Skills</h2>
                <p className="text-gray-500 text-sm">Stage {skill.stage + 1} evolutions</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={onSaveAllChildren}
                  disabled={childSkills.length === 0 || childSkills.every(c => c.isSaved) || saving}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:from-gray-700 disabled:to-gray-600 transition-all flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    '💾 Save All'
                  )}
                </button>
                <button 
                  onClick={onRegenerateChildren}
                  disabled={childSkills.length === 0 || generating}
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    '🔄 Regenerate'
                  )}
                </button>
              </div>
            </div>

            {childSkills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {childSkills.map(child => {
                  const childVariantConfig = VARIANT_CONFIG[child.variantType] || VARIANT_CONFIG.root
                  return (
                    <div 
                      key={child.id}
                      className={`relative group rounded-xl border-2 overflow-hidden transition-all ${
                        child.isLocked 
                          ? 'border-blue-500/50 bg-gradient-to-br from-blue-900/20 to-blue-950/20' 
                          : `${childVariantConfig.color} bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] hover:scale-[1.02] cursor-pointer`
                      }`}
                      onClick={() => !child.isLocked && onNavigate(child)}
                    >
                      {/* Card Header */}
                      <div className="p-4 border-b border-white/10">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <SkillIcon iconUrl={child.iconUrl} variantType={child.variantType} size="md" />
                            <div>
                              <div className="font-bold text-sm text-white line-clamp-1">{child.name}</div>
                              <div className="text-[10px] text-gray-400 uppercase tracking-wider">{childVariantConfig.label}</div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onToggleLock(child)
                            }}
                            disabled={lockingSkillId === child.id}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all border ${
                              child.isLocked 
                                ? 'bg-blue-600 border-blue-400 text-white hover:bg-blue-500' 
                                : 'bg-white/10 border-white/20 text-gray-400 hover:bg-white/20 hover:text-white'
                            } ${lockingSkillId === child.id ? 'opacity-50' : ''}`}
                            title={child.isLocked ? "Unlock" : "Lock & Save"}
                          >
                            {lockingSkillId === child.id ? (
                              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <span className="text-sm">{child.isLocked ? '🔒' : '🔓'}</span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4">
                        <div className="flex gap-3 text-xs mb-3">
                          <span className="px-2 py-1 rounded bg-red-500/20 text-red-300 font-medium">{child.ampPercent}%</span>
                          <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 font-medium">{child.apCost} AP</span>
                          <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-300 font-medium">{child.cooldown}T</span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">{child.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-[#333] rounded-2xl bg-gradient-to-br from-[#151515] to-[#0a0a0a]">
                <div className="text-6xl mb-4">🧬</div>
                <h3 className="text-xl font-bold text-gray-300 mb-2">No Children Generated</h3>
                <p className="text-gray-500 mb-8">Generate evolutions for Stage {skill.stage + 1}</p>
                
                {skill.stage < 5 && (
                  <div className="max-w-lg mx-auto">
                    <div className="mb-6 bg-black/40 p-4 rounded-xl border border-[#333]">
                      <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-bold">Force Variants (Optional)</div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {ALL_VARIANTS.map(v => {
                          const vConfig = VARIANT_CONFIG[v] || VARIANT_CONFIG.root
                          return (
                            <button
                              key={v}
                              onClick={() => toggleVariant(v)}
                              className={`px-3 py-1.5 text-xs rounded-lg border transition-all flex items-center gap-1 ${
                                selectedVariants.includes(v) 
                                  ? 'bg-[#6eb5ff] text-black border-[#6eb5ff] font-bold' 
                                  : 'bg-transparent border-[#444] text-gray-500 hover:border-gray-300 hover:text-gray-300'
                              }`}
                            >
                              <span>{vConfig.icon}</span>
                              {v}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <button
                      onClick={() => onGenerateChildren(selectedVariants.length > 0 ? selectedVariants : undefined)}
                      disabled={generating}
                      className="w-full py-4 bg-gradient-to-r from-[#6eb5ff] to-[#a855f7] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg shadow-lg shadow-[#6eb5ff]/20"
                    >
                      {generating ? (
                        <>
                          <span className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          🧬 Generate Stage {skill.stage + 1} Skills
                        </>
                      )}
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
