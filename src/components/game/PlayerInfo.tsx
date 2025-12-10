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
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center text-xs py-0.5">
        <div className="flex-1 h-4 bg-[#1a1a1a] rounded-sm overflow-hidden relative cursor-help">
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
      
      {/* Tooltip - positioned below */}
      {showTooltip && (
        <div className="absolute left-0 top-full mt-1 z-[100] bg-[#111] border border-[#555] rounded px-2 py-1 text-xs text-gray-200 whitespace-nowrap shadow-xl">
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
  onOpenModal: () => void
}

export default function PlayerInfo({
  username,
  level,
  col,
  life,
  ap,
  onOpenModal,
}: PlayerInfoProps) {
  return (
    <div>
      {/* Header */}
      <div className="bg-[#2a2a2a] px-3 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wide border-y border-[#333] flex items-center gap-2">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>Information</span>
      </div>

      {/* Content */}
      <div className="px-3 py-2 space-y-1">
        {/* Basic Info */}
        <div className="space-y-0.5 text-sm">
          <div className="flex">
            <span className="text-gray-500 w-14">Name:</span>
            <button 
              onClick={onOpenModal}
              className="text-[#6eb5ff] hover:text-[#8ec5ff] hover:underline cursor-pointer transition-colors"
            >
              {username}
            </button>
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

        {/* Resource Bars */}
        <div className="space-y-1 pt-2">
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
