import { useState, useMemo } from 'react'
import { SKILL_TYPE_CATEGORIES, SkillTypeCategory, StarterSkill } from '@/data/universal-skills-data'

interface SkillSidebarProps {
  onSelectStarter: (category: SkillTypeCategory, starter: StarterSkill) => void
  selectedStarterName?: string
}

export function SkillSidebar({ onSelectStarter, selectedStarterName }: SkillSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([SKILL_TYPE_CATEGORIES[0]?.id || ''])
  const [searchTerm, setSearchTerm] = useState('')

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => 
      prev.includes(id) ? [] : [id]
    )
  }

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return SKILL_TYPE_CATEGORIES

    return SKILL_TYPE_CATEGORIES.map(cat => ({
      ...cat,
      skills: cat.skills.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.subtype.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(cat => cat.skills.length > 0)
  }, [searchTerm])

  return (
    <div className="w-80 bg-[#151515] border-r border-[#333] flex flex-col h-full">
      {/* Search Header */}
      <div className="p-4 border-b border-[#333] bg-[#1a1a1a]">
        <h2 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Skill Database</h2>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-500 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 pl-8 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#6eb5ff] transition-colors"
          />
        </div>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredCategories.map(category => (
          <div key={category.id} className="rounded overflow-hidden">
            <button
              onClick={() => toggleCategory(category.id)}
              className={`w-full flex items-center justify-between p-2 text-left hover:bg-[#222] transition-colors rounded ${
                expandedCategories.includes(category.id) ? 'bg-[#1a1a1a]' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{category.icon}</span>
                <span className="font-medium text-sm text-gray-300">{category.name}</span>
              </div>
              <span className="text-xs text-gray-600">
                {expandedCategories.includes(category.id) ? '▼' : '▶'}
              </span>
            </button>

            {expandedCategories.includes(category.id) && (
              <div className="mt-1 ml-2 space-y-0.5 border-l border-[#333] pl-2">
                {category.skills.map(skill => {
                  const isSelected = selectedStarterName === skill.name
                  return (
                    <button
                      key={skill.name}
                      onClick={() => onSelectStarter(category, skill)}
                      className={`w-full text-left px-3 py-2 text-xs rounded transition-all flex items-center justify-between group ${
                        isSelected 
                          ? 'bg-[#6eb5ff]/10 text-[#6eb5ff] border border-[#6eb5ff]/30' 
                          : 'text-gray-400 hover:bg-[#222] hover:text-gray-200 border border-transparent'
                      }`}
                    >
                      <span>{skill.name}</span>
                      {isSelected && <span className="text-[10px]">●</span>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-8 text-gray-600 text-xs">
            No skills found
          </div>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="p-3 border-t border-[#333] bg-[#111] text-[10px] text-gray-600 flex justify-between">
        <span>v1.0.0</span>
        <span>{SKILL_TYPE_CATEGORIES.reduce((acc, cat) => acc + cat.skills.length, 0)} Starters</span>
      </div>
    </div>
  )
}
