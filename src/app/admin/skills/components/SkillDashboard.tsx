import { SKILL_TYPE_CATEGORIES } from '@/data/universal-skills-data'

export function SkillDashboard() {
  const totalStarters = SKILL_TYPE_CATEGORIES.reduce((acc, cat) => acc + cat.skills.length, 0)
  
  return (
    <div className="p-8 w-full h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Skill Database Dashboard</h1>
        <p className="text-gray-400">Select a starter skill from the sidebar to view its tree or generate evolutions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#242424] p-6 rounded-xl border border-[#333]">
          <div className="text-4xl font-bold text-[#6eb5ff] mb-1">{totalStarters}</div>
          <div className="text-sm text-gray-400">Starter Skills</div>
        </div>
        <div className="bg-[#242424] p-6 rounded-xl border border-[#333]">
          <div className="text-4xl font-bold text-purple-400 mb-1">{SKILL_TYPE_CATEGORIES.length}</div>
          <div className="text-sm text-gray-400">Skill Categories</div>
        </div>
        <div className="bg-[#242424] p-6 rounded-xl border border-[#333]">
          <div className="text-4xl font-bold text-green-400 mb-1">Active</div>
          <div className="text-sm text-gray-400">System Status</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
        {SKILL_TYPE_CATEGORIES.map(cat => (
          <div key={cat.id} className={`p-4 rounded-lg border border-[#333] bg-gradient-to-br ${cat.color.replace('text-', 'from-black/40 to-black/40 text-')}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{cat.icon}</span>
              <h3 className="font-bold text-lg text-gray-200">{cat.name}</h3>
            </div>
            <p className="text-xs text-gray-400 mb-3">{cat.description}</p>
            <div className="flex justify-between items-center text-xs">
              <span className="bg-black/30 px-2 py-1 rounded text-gray-300">
                {cat.skills.length} Skills
              </span>
              <span className={`px-2 py-1 rounded ${
                cat.weaponRequirement === 'melee_only' ? 'text-red-400 bg-red-900/20' :
                cat.weaponRequirement === 'ranged_only' ? 'text-green-400 bg-green-900/20' :
                cat.weaponRequirement === 'magic_only' ? 'text-purple-400 bg-purple-900/20' :
                'text-gray-400 bg-gray-900/20'
              }`}>
                {cat.weaponRequirement.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
