'use client'

interface PlayerStatusProps {
  hp: number
  maxHp: number
  ap: number
  maxAp: number
  buffs?: string[]
  debuffs?: string[]
}

export default function PlayerStatus({
  hp,
  maxHp,
  ap,
  maxAp,
  buffs = [],
  debuffs = [],
}: PlayerStatusProps) {
  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100))
  const apPercent = Math.max(0, Math.min(100, (ap / maxAp) * 100))

  return (
    <div className="bg-[#1a1a1a]/95 border border-[#444] rounded-lg p-4 backdrop-blur-sm">
      <h3 className="text-sm font-semibold text-[#6eb5ff] mb-3">Your Status</h3>
      
      {/* HP Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-red-400">❤️ HP</span>
          <span className="text-gray-400">{hp} / {maxHp}</span>
        </div>
        <div className="h-2 bg-[#333] rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-500 transition-all duration-300"
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      {/* AP Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-blue-400">⚡ AP</span>
          <span className="text-gray-400">{ap} / {maxAp}</span>
        </div>
        <div className="h-2 bg-[#333] rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${apPercent}%` }}
          />
        </div>
      </div>

      {/* Status Effects */}
      {(buffs.length > 0 || debuffs.length > 0) && (
        <div className="pt-2 border-t border-[#333]">
          <span className="text-xs text-gray-500">Status Effects</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {buffs.map((buff, i) => (
              <span key={`buff-${i}`} className="px-2 py-0.5 bg-green-900/50 text-green-400 text-xs rounded">
                {buff}
              </span>
            ))}
            {debuffs.map((debuff, i) => (
              <span key={`debuff-${i}`} className="px-2 py-0.5 bg-red-900/50 text-red-400 text-xs rounded">
                {debuff}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
