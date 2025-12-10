'use client'

import { useState } from 'react'

interface StatBarProps {
  label: string
  current: number
  max: number
  color: string
  tooltip: string
}

function StatBar({ label, current, max, color, tooltip }: StatBarProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const percentage = (current / max) * 100
  const isFull = current >= max

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center text-xs py-0.5">
        <div className="flex-1 h-4 bg-[#1a1a1a] rounded-sm overflow-hidden relative">
          <div
            className={`h-full transition-all ${color}`}
            style={{ width: `${percentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <span className="text-white text-xs font-medium drop-shadow-md">{label}:</span>
            <span className={`text-xs font-medium drop-shadow-md ${isFull ? 'text-green-300' : 'text-white'}`}>
              {current}/{max}
            </span>
          </div>
        </div>
        <span className={`w-10 text-right text-xs ml-1 ${isFull ? 'text-green-400' : 'text-gray-500'}`}>
          {isFull ? 'FULL' : ''}
        </span>
      </div>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute left-full ml-2 top-0 z-50 bg-[#1a1a1a] border border-[#444] rounded px-2 py-1 text-xs text-gray-300 whitespace-nowrap shadow-lg">
          {tooltip}
        </div>
      )}
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
      <div className="bg-[#2a2a2a] px-3 py-1.5 border-b border-[#333] flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="text-gray-400 text-sm">Information</span>
      </div>

      {/* Content */}
      <div className="p-3 space-y-1">
        {/* Basic Info */}
        <div className="space-y-0.5 text-sm">
          <div className="flex">
            <span className="text-gray-500 w-14">Name:</span>
            <span className="text-[#6eb5ff]">{username}</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-14">Col:</span>
            <span className="text-green-400">{col.toLocaleString()}</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-14">Level:</span>
            <span className="text-white">{level}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#333] my-2" />

        {/* Resource Bars */}
        <div className="space-y-1">
          <StatBar 
            label="Life" 
            current={life.current} 
            max={life.max} 
            color="bg-gradient-to-r from-red-600 to-red-500" 
            tooltip={`Regenerates 1 HP every 5 minutes`}
          />
          <StatBar 
            label="AP" 
            current={ap.current} 
            max={ap.max} 
            color="bg-gradient-to-r from-blue-600 to-blue-500" 
            tooltip={`Regenerates 1 AP every 10 minutes`}
          />
        </div>
      </div>
    </div>
  )
}
