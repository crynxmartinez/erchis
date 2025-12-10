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
      <span className="w-10 text-gray-400">{label}:</span>
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
  level: number
  col: number
  life: { current: number; max: number }
  ap: { current: number; max: number }
}

export default function PlayerInfo({
  username,
  level,
  col,
  life,
  ap,
}: PlayerInfoProps) {
  return (
    <div className="bg-[#242424] rounded border border-[#333]">
      {/* Header */}
      <div className="bg-[#2a2a2a] px-3 py-2 border-b border-[#333] flex items-center justify-between">
        <span className="text-gray-400 text-sm font-medium">Player Info</span>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Basic Info */}
        <div className="space-y-1 text-sm">
          <div className="flex">
            <span className="text-gray-400 w-14">Name:</span>
            <span className="text-[#6eb5ff]">{username}</span>
          </div>
          <div className="flex">
            <span className="text-gray-400 w-14">Level:</span>
            <span className="text-white">{level}</span>
          </div>
          <div className="flex">
            <span className="text-gray-400 w-14">Col:</span>
            <span className="text-yellow-400">{col.toLocaleString()}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#333] my-2" />

        {/* Resource Bars */}
        <div className="space-y-1">
          <StatBar label="Life" current={life.current} max={life.max} color="bg-red-500" />
          <StatBar label="AP" current={ap.current} max={ap.max} color="bg-blue-500" />
        </div>
      </div>
    </div>
  )
}
