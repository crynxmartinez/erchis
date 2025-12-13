'use client'

interface EnemyDisplayProps {
  name: string
  level: number
  hp: number
  maxHp: number
  imageUrl?: string | null
  intent?: string
  buffs?: string[]
  debuffs?: string[]
}

export default function EnemyDisplay({
  name,
  level,
  hp,
  maxHp,
  imageUrl,
  intent,
  buffs = [],
  debuffs = [],
}: EnemyDisplayProps) {
  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100))
  
  const getHpColor = () => {
    if (hpPercent > 50) return 'bg-green-500'
    if (hpPercent > 25) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="bg-[#1a1a1a]/95 border border-[#444] rounded-lg p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-white">{name}</h2>
          <span className="text-xs text-gray-400">Lv. {level}</span>
        </div>
        <div className="text-right">
          <span className="text-sm text-gray-300">{hp} / {maxHp}</span>
        </div>
      </div>

      {/* HP Bar */}
      <div className="h-3 bg-[#333] rounded-full overflow-hidden mb-4">
        <div 
          className={`h-full ${getHpColor()} transition-all duration-500`}
          style={{ width: `${hpPercent}%` }}
        />
      </div>

      {/* Enemy Image */}
      <div className="flex justify-center mb-4">
        <div className="w-32 h-32 bg-[#252525] rounded-lg border border-[#333] flex items-center justify-center">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name} 
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-5xl">👹</span>
          )}
        </div>
      </div>

      {/* Intent */}
      {intent && (
        <div className="bg-[#252525] rounded-lg p-2 border border-[#333]">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">⚠️</span>
            <span className="text-sm text-gray-300">
              Intent: <span className="text-yellow-300">{intent}</span>
            </span>
          </div>
        </div>
      )}

      {/* Status Effects */}
      {(buffs.length > 0 || debuffs.length > 0) && (
        <div className="flex flex-wrap gap-1 mt-3">
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
      )}
    </div>
  )
}
