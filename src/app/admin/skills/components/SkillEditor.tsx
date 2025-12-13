import { useState, useEffect } from 'react'
import { Skill, ALL_VARIANTS, TARGET_TYPES, DAMAGE_TYPES, WEAPON_REQS, VARIANT_CONFIG } from '../types'
import { getVariantColor, getVariantIcon, getStageColor } from '../utils'
import { SectionHeader, InputField, SelectField, BooleanToggle } from './FormHelpers'

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
    // Reset internal state ONLY when the parent skill changes (navigation)
    setEditMode(false)
    setEditedSkill(null)
    setActiveTab('overview')
    setSelectedVariants([])
  }, [skill.id])

  const handleStartEdit = () => {
    setEditedSkill(JSON.parse(JSON.stringify(skill))) // Deep copy
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

  return (
    <div className="flex flex-col h-full bg-[#111]">
      {/* Header & Breadcrumbs */}
      <div className={`p-6 border-b border-[#333] ${getVariantColor(currentData.variantType)} bg-opacity-20`}>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          <button onClick={() => onBreadcrumbClick(-1)} className="hover:text-white">🏠 Skill Types</button>
          {breadcrumb.map((s, i) => (
            <span key={s.id} className="flex items-center gap-2">
              <span>›</span>
              <button 
                onClick={() => onBreadcrumbClick(i)}
                className={`hover:text-white ${i === breadcrumb.length - 1 ? 'text-white font-bold' : ''}`}
              >
                {s.name}
              </button>
            </span>
          ))}
        </div>

        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="text-4xl shadow-xl rounded-lg bg-black/30 p-2 border border-white/10">
              {getVariantIcon(currentData.variantType)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">{currentData.name}</h1>
              <div className="flex items-center gap-3 text-xs">
                <span className={`px-2 py-0.5 rounded border ${getStageColor(currentData.stage)} bg-black/40`}>
                  Stage {currentData.stage}
                </span>
                <span className="text-gray-300">{currentData.skillType}</span>
                <span className="capitalize text-gray-400">• {currentData.variantType}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!editMode ? (
              <>
                <button 
                  onClick={handleStartEdit}
                  className="px-4 py-2 bg-[#6eb5ff] text-black font-bold rounded hover:bg-[#5a9ee6] transition-colors"
                >
                  ✏️ Edit
                </button>
                {skill.stage === 0 && (
                  <button 
                    onClick={onResetTree}
                    className="px-4 py-2 bg-red-900/50 border border-red-600 text-red-200 font-bold rounded hover:bg-red-900 transition-colors"
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
                  className="px-4 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Saving...
                    </>
                  ) : (
                    '💾 Save'
                  )}
                </button>
                <button 
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 bg-gray-700 text-white font-bold rounded hover:bg-gray-600 transition-colors"
                >
                  ✕ Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#333] bg-[#1a1a1a]">
        {['overview', 'combat', 'effects', 'flavor', 'tree'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-r border-[#333] ${
              activeTab === tab 
                ? 'bg-[#222] text-[#6eb5ff] border-b-2 border-b-[#6eb5ff]' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-[#222]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {editMode ? (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <SectionHeader title="Identity" icon="🆔" />
                  <InputField label="Name" value={currentData.name} onChange={v => setEditedSkill({...editedSkill!, name: v})} />
                  <SelectField label="Variant" value={currentData.variantType} options={['root', ...ALL_VARIANTS]} onChange={v => setEditedSkill({...editedSkill!, variantType: v})} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Stage" type="number" value={currentData.stage} onChange={v => setEditedSkill({...editedSkill!, stage: parseInt(v) || 0})} />
                    <InputField label="Type" value={currentData.skillType} onChange={v => setEditedSkill({...editedSkill!, skillType: v})} />
                  </div>
                </div>
                <div className="space-y-4">
                  <SectionHeader title="Requirements" icon="🔒" />
                  <SelectField label="Weapon Req" value={currentData.weaponRequirement} options={WEAPON_REQS} onChange={v => setEditedSkill({...editedSkill!, weaponRequirement: v})} />
                  <SelectField label="Damage Type" value={currentData.damageType} options={DAMAGE_TYPES} onChange={v => setEditedSkill({...editedSkill!, damageType: v})} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#242424] p-6 rounded-xl border border-[#333]">
                  <h3 className="text-lg font-bold text-gray-200 mb-4">Core Info</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-500">Classification</span>
                      <span>{currentData.skillType}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-500">Weapon Req</span>
                      <span className="capitalize">{currentData.weaponRequirement.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-500">Damage Type</span>
                      <span className="capitalize">{currentData.damageType}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-[#242424] p-6 rounded-xl border border-[#333]">
                  <h3 className="text-lg font-bold text-gray-200 mb-4">Description</h3>
                  <p className="text-gray-300 italic mb-4">"{currentData.executionDescription}"</p>
                  <div className="bg-black/30 p-3 rounded border border-white/10 text-sm">
                    <span className="text-[#6eb5ff] font-bold">Effect:</span> {currentData.description}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* COMBAT TAB */}
        {activeTab === 'combat' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {editMode ? (
              <>
                <div className="bg-[#2a2a2a] p-6 rounded-xl border border-[#333]">
                  <SectionHeader title="Combat Mechanics" icon="⚔️" />
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <InputField label="Amp %" type="number" color="text-red-400" value={currentData.ampPercent} onChange={v => setEditedSkill({...editedSkill!, ampPercent: parseInt(v)})} />
                    <InputField label="AP Cost" type="number" color="text-blue-400" value={currentData.apCost} onChange={v => setEditedSkill({...editedSkill!, apCost: parseInt(v)})} />
                    <InputField label="Cooldown" type="number" color="text-yellow-400" value={currentData.cooldown} onChange={v => setEditedSkill({...editedSkill!, cooldown: parseInt(v)})} />
                    <InputField label="Range" type="number" color="text-orange-400" value={currentData.range} onChange={v => setEditedSkill({...editedSkill!, range: parseInt(v)})} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <SelectField label="Target Type" value={currentData.targetType} options={TARGET_TYPES} onChange={v => setEditedSkill({...editedSkill!, targetType: v})} />
                    <InputField label="Hit Count" type="number" value={currentData.hitCount} onChange={v => setEditedSkill({...editedSkill!, hitCount: parseInt(v)})} />
                    <BooleanToggle label="Is Counter?" value={currentData.isCounter} onChange={v => setEditedSkill({...editedSkill!, isCounter: v})} />
                  </div>
                </div>
                <div className="bg-[#2a2a2a] p-6 rounded-xl border border-[#333]">
                  <SectionHeader title="Advanced Stats" icon="📊" />
                  <div className="grid grid-cols-4 gap-4">
                    <InputField label="Armor Pierce %" type="number" value={currentData.armorPierce || 0} onChange={v => setEditedSkill({...editedSkill!, armorPierce: parseInt(v)})} />
                    <InputField label="Lifesteal %" type="number" value={currentData.lifestealPercent || 0} onChange={v => setEditedSkill({...editedSkill!, lifestealPercent: parseInt(v)})} />
                    <InputField label="Bonus vs Guard %" type="number" value={currentData.bonusVsGuard || 0} onChange={v => setEditedSkill({...editedSkill!, bonusVsGuard: parseInt(v)})} />
                    <InputField label="Bonus vs Debuff %" type="number" value={currentData.bonusVsDebuffed || 0} onChange={v => setEditedSkill({...editedSkill!, bonusVsDebuffed: parseInt(v)})} />
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#242424] p-4 rounded-lg text-center border border-[#333]">
                  <div className="text-gray-500 text-xs uppercase mb-1">Damage Amp</div>
                  <div className="text-2xl font-bold text-red-400">{currentData.ampPercent}%</div>
                </div>
                <div className="bg-[#242424] p-4 rounded-lg text-center border border-[#333]">
                  <div className="text-gray-500 text-xs uppercase mb-1">AP Cost</div>
                  <div className="text-2xl font-bold text-blue-400">{currentData.apCost}</div>
                </div>
                <div className="bg-[#242424] p-4 rounded-lg text-center border border-[#333]">
                  <div className="text-gray-500 text-xs uppercase mb-1">Cooldown</div>
                  <div className="text-2xl font-bold text-yellow-400">{currentData.cooldown}</div>
                </div>
                <div className="bg-[#242424] p-4 rounded-lg text-center border border-[#333]">
                  <div className="text-gray-500 text-xs uppercase mb-1">Range</div>
                  <div className="text-2xl font-bold text-orange-400">{currentData.range}</div>
                </div>
                {/* Advanced Stats Display */}
                <div className="col-span-4 grid grid-cols-4 gap-4 mt-4">
                   <div className="p-3 bg-black/20 rounded border border-white/5 text-sm flex justify-between">
                     <span className="text-gray-500">Target</span>
                     <span className="text-purple-300">{currentData.targetType}</span>
                   </div>
                   <div className="p-3 bg-black/20 rounded border border-white/5 text-sm flex justify-between">
                     <span className="text-gray-500">Hits</span>
                     <span className="text-cyan-300">{currentData.hitCount}x</span>
                   </div>
                   {currentData.armorPierce && (
                     <div className="p-3 bg-black/20 rounded border border-white/5 text-sm flex justify-between">
                       <span className="text-gray-500">Pierce</span>
                       <span className="text-white">{currentData.armorPierce}%</span>
                     </div>
                   )}
                   {currentData.lifestealPercent && (
                     <div className="p-3 bg-black/20 rounded border border-white/5 text-sm flex justify-between">
                       <span className="text-gray-500">Lifesteal</span>
                       <span className="text-pink-400">{currentData.lifestealPercent}%</span>
                     </div>
                   )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* EFFECTS TAB */}
        {activeTab === 'effects' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buffs */}
              <div className="bg-[#3f2c2c] bg-opacity-20 border border-yellow-900/50 p-6 rounded-xl">
                <SectionHeader title="Buffs (Self)" icon="💪" />
                {editMode ? (
                  <div className="space-y-4">
                    <InputField label="Type" value={currentData.buffType || ''} onChange={v => setEditedSkill({...editedSkill!, buffType: v || null})} />
                    <InputField label="Duration" type="number" value={currentData.buffDuration || 0} onChange={v => setEditedSkill({...editedSkill!, buffDuration: parseInt(v) || null})} />
                  </div>
                ) : (
                  currentData.buffType ? (
                    <div className="text-yellow-200">
                      <div className="font-bold text-lg capitalize">{currentData.buffType.replace('_', ' ')}</div>
                      <div className="text-sm opacity-70">{currentData.buffDuration} turns</div>
                    </div>
                  ) : <div className="text-gray-500 text-sm">No buffs configured</div>
                )}
              </div>

              {/* Debuffs */}
              <div className="bg-[#2c2035] bg-opacity-20 border border-purple-900/50 p-6 rounded-xl">
                <SectionHeader title="Debuffs (Enemy)" icon="💀" />
                {editMode ? (
                  <div className="space-y-4">
                    <InputField label="Type" value={currentData.debuffType || ''} onChange={v => setEditedSkill({...editedSkill!, debuffType: v || null})} />
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="Duration" type="number" value={currentData.debuffDuration || 0} onChange={v => setEditedSkill({...editedSkill!, debuffDuration: parseInt(v) || null})} />
                      <InputField label="Chance %" type="number" value={currentData.debuffChance || 100} onChange={v => setEditedSkill({...editedSkill!, debuffChance: parseInt(v) || null})} />
                    </div>
                  </div>
                ) : (
                  currentData.debuffType ? (
                    <div className="text-purple-200">
                      <div className="font-bold text-lg capitalize">{currentData.debuffType.replace('_', ' ')}</div>
                      <div className="text-sm opacity-70">{currentData.debuffDuration} turns • {currentData.debuffChance}% chance</div>
                    </div>
                  ) : <div className="text-gray-500 text-sm">No debuffs configured</div>
                )}
              </div>
            </div>

            {/* Utility Mode */}
            <div className="bg-[#1e293b] bg-opacity-20 border border-cyan-900/50 p-6 rounded-xl">
              <SectionHeader title="Magic Utility Mode" icon="🔮" />
              {editMode ? (
                <div className="space-y-4">
                  <BooleanToggle label="Has Utility Mode?" value={currentData.hasUtilityMode} onChange={v => setEditedSkill({...editedSkill!, hasUtilityMode: v})} />
                  {currentData.hasUtilityMode && (
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="Effect" value={currentData.utilityEffect || ''} onChange={v => setEditedSkill({...editedSkill!, utilityEffect: v})} />
                      <InputField label="Duration" type="number" value={currentData.utilityDuration || 0} onChange={v => setEditedSkill({...editedSkill!, utilityDuration: parseInt(v) || null})} />
                    </div>
                  )}
                </div>
              ) : (
                currentData.hasUtilityMode ? (
                  <div className="text-cyan-300">
                    <div className="font-bold">Enabled</div>
                    <div className="text-sm opacity-70">
                      {currentData.utilityEffect?.replace('_', ' ')} ({currentData.utilityDuration} turns)
                    </div>
                  </div>
                ) : <div className="text-gray-500 text-sm">Disabled</div>
              )}
            </div>
          </div>
        )}

        {/* FLAVOR TAB */}
        {activeTab === 'flavor' && (
          <div className="max-w-4xl mx-auto">
            {editMode ? (
              <div className="space-y-6">
                <div>
                  <div className="text-sm text-gray-400 mb-2">Description</div>
                  <textarea 
                    value={currentData.description} 
                    onChange={e => setEditedSkill({...editedSkill!, description: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded p-4 h-32 focus:border-[#6eb5ff] outline-none"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-2">Execution Narrative</div>
                  <textarea 
                    value={currentData.executionDescription || ''} 
                    onChange={e => setEditedSkill({...editedSkill!, executionDescription: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded p-4 h-32 focus:border-[#6eb5ff] outline-none font-serif italic text-gray-300"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-2">Passive Bonus</div>
                  <textarea 
                    value={currentData.passive || ''} 
                    onChange={e => setEditedSkill({...editedSkill!, passive: e.target.value})}
                    className="w-full bg-purple-900/10 border border-purple-500/20 rounded p-4 h-24 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-[#242424] p-6 rounded-xl border border-[#333]">
                  <h3 className="text-lg font-bold text-white mb-2">Effect</h3>
                  <p className="text-gray-300">{currentData.description}</p>
                </div>
                <div className="bg-[#242424] p-6 rounded-xl border border-[#333]">
                  <h3 className="text-lg font-bold text-white mb-2">Narrative</h3>
                  <p className="text-gray-300 italic font-serif">"{currentData.executionDescription}"</p>
                </div>
                {currentData.passive && (
                  <div className="bg-purple-900/20 p-6 rounded-xl border border-purple-500/30">
                    <h3 className="text-lg font-bold text-purple-200 mb-2">Passive Bonus</h3>
                    <p className="text-purple-300">{currentData.passive}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TREE TAB */}
        {activeTab === 'tree' && (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Child Skills</h2>
              <div className="flex gap-2">
                <button 
                  onClick={onSaveAllChildren}
                  disabled={childSkills.length === 0 || childSkills.every(c => c.isSaved) || saving}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Saving...
                    </>
                  ) : (
                    'Save All'
                  )}
                </button>
                <button 
                  onClick={onRegenerateChildren}
                  disabled={childSkills.length === 0 || generating}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Regenerating...
                    </>
                  ) : (
                    'Regenerate'
                  )}
                </button>
              </div>
            </div>

            {childSkills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {childSkills.map(child => {
                  const variantConfig = VARIANT_CONFIG[child.variantType] || VARIANT_CONFIG.root
                  return (
                    <div 
                      key={child.id}
                      className={`relative group p-4 rounded-lg border-2 transition-all ${
                        child.isLocked 
                          ? 'border-blue-500/50 bg-[#1a2230]' 
                          : `${variantConfig.color} bg-[#1a1a1a] hover:scale-105 cursor-pointer`
                      }`}
                      onClick={() => !child.isLocked && onNavigate(child)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className={`flex items-center gap-2 ${child.isLocked ? 'opacity-75' : ''}`}>
                          <span className="text-2xl">{variantConfig.icon}</span>
                          <div>
                            <div className="font-bold text-sm line-clamp-1">{child.name}</div>
                            <div className="text-[10px] opacity-70 uppercase tracking-wider">{variantConfig.label}</div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleLock(child)
                          }}
                          disabled={lockingSkillId === child.id}
                          className={`w-8 h-8 flex items-center justify-center rounded-md transition-all border-2 z-50 shadow-md ${
                            child.isLocked 
                              ? 'text-white bg-blue-600 border-blue-400 hover:bg-blue-500' 
                              : 'text-black bg-white border-gray-300 hover:bg-gray-100'
                          } ${lockingSkillId === child.id ? 'opacity-50' : ''}`}
                          title={child.isLocked ? "Unlock (Unsave & Allow Regeneration)" : "Lock & Save (Prevent Regeneration)"}
                        >
                          {lockingSkillId === child.id ? (
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <span className="text-lg leading-none">{child.isLocked ? '🔒' : '🔓'}</span>
                          )}
                        </button>
                      </div>
                      <div className={`flex gap-2 text-xs opacity-80 mb-2 ${child.isLocked ? 'opacity-60' : ''}`}>
                        <span className="text-red-400">{child.ampPercent}%</span>
                        <span className="text-blue-400">{child.apCost} AP</span>
                        <span className="text-yellow-400">{child.cooldown}T</span>
                      </div>
                      <p className={`text-xs text-gray-400 line-clamp-2 ${child.isLocked ? 'opacity-50' : ''}`}>{child.description}</p>
                      
                      {child.isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-black/60 px-3 py-1 rounded text-blue-300 text-xs font-bold border border-blue-500/30 backdrop-blur-sm">
                            LOCKED
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-[#333] rounded-xl bg-[#151515]">
                <div className="text-4xl mb-4">🧬</div>
                <h3 className="text-xl font-bold text-gray-300 mb-2">No Children Generated</h3>
                <p className="text-gray-500 mb-6">Generate evolutions for the next stage.</p>
                
                {skill.stage < 5 && (
                  <div className="max-w-md mx-auto">
                    <div className="mb-4 bg-black/40 p-4 rounded border border-[#333]">
                      <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">Force Variants (Optional)</div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {ALL_VARIANTS.map(v => (
                          <button
                            key={v}
                            onClick={() => toggleVariant(v)}
                            className={`px-2 py-1 text-xs rounded border ${
                              selectedVariants.includes(v) 
                                ? 'bg-[#6eb5ff] text-black border-[#6eb5ff]' 
                                : 'bg-transparent border-[#444] text-gray-500 hover:border-gray-300'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => onGenerateChildren(selectedVariants.length > 0 ? selectedVariants : undefined)}
                      disabled={generating}
                      className="w-full py-3 bg-gradient-to-r from-[#6eb5ff] to-[#a855f7] text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {generating ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Generating...
                        </>
                      ) : (
                        `Generate Stage ${skill.stage + 1} Skills`
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
