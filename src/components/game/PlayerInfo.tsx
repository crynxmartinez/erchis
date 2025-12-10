'use client'

interface StatBarProps {
  label: string
  current: number
  max: number
  color: string
}

function StatBar({ label, current, max, color }: StatBarProps) {
  const percentage = (current / max) * 100
  const isFull = current >= max

  return (
    <div className="flex items-center text-xs">
      <span className="w-14 text-gray-400">{label}:</span>
      <div className="flex-1 h-3 bg-[#1a1a1a] rounded overflow-hidden mx-2">
        <div
          className={`h-full transition-all ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`w-16 text-right ${isFull ? 'text-green-400' : 'text-gray-300'}`}>
        {isFull ? 'FULL' : `${current}/${max}`}
      </span>
    </div>
  )
}

interface PlayerInfoProps {
  username: string
  money: number
  level: number
  points: number
  energy: { current: number; max: number }
  nerve: { current: number; max: number }
  happy: { current: number; max: number }
  life: { current: number; max: number }
}

export default function PlayerInfo({
  username,
  money,
  level,
  points,
  energy,
  nerve,
  happy,
  life,
}: PlayerInfoProps) {
  return (
    <div className="bg-[#242424] rounded border border-[#333]">
      {/* Header */}
      <div className="bg-[#2a2a2a] px-3 py-2 border-b border-[#333] flex items-center justify-between">
        <span className="text-gray-400 text-sm font-medium">Information</span>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Basic Info */}
        <div className="space-y-1 text-sm">
          <div className="flex">
            <span className="text-gray-400 w-16">Name:</span>
            <span className="text-[#6eb5ff]">{username}</span>
          </div>
          <div className="flex">
            <span className="text-gray-400 w-16">Money:</span>
            <span className="text-green-400">${money.toLocaleString()}</span>
          </div>
          <div className="flex">
            <span className="text-gray-400 w-16">Level:</span>
            <span className="text-white">{level}</span>
          </div>
          <div className="flex">
            <span className="text-gray-400 w-16">Points:</span>
            <span className="text-white">{points}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#333] my-2" />

        {/* Stat Bars */}
        <div className="space-y-1">
          <StatBar label="Energy" current={energy.current} max={energy.max} color="bg-green-500" />
          <StatBar label="Nerve" current={nerve.current} max={nerve.max} color="bg-red-500" />
          <StatBar label="Happy" current={happy.current} max={happy.max} color="bg-yellow-500" />
          <StatBar label="Life" current={life.current} max={life.max} color="bg-red-600" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <button className="flex-1 bg-[#333] hover:bg-[#444] text-gray-300 py-1 rounded text-xs transition-colors">
            ✉️
          </button>
          <button className="flex-1 bg-[#333] hover:bg-[#444] text-gray-300 py-1 rounded text-xs transition-colors">
            ℹ️
          </button>
          <button className="flex-1 bg-[#333] hover:bg-[#444] text-gray-300 py-1 rounded text-xs transition-colors">
            👥
          </button>
        </div>
      </div>
    </div>
  )
}
