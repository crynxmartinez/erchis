'use client'

import { useState } from 'react'
import Link from 'next/link'

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
          <div className="flex">
            <span className="text-gray-500 w-14">Guild:</span>
            <Link href="/guild" className="text-gray-400 hover:text-[#6eb5ff] transition-colors">None</Link>
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

        {/* Quick Actions */}
        <div className="flex justify-center gap-1 pt-2 border-t border-[#333] mt-2">
          <button 
            className="flex-1 flex items-center justify-center p-2 bg-[#252525] hover:bg-[#333] rounded transition-colors group relative"
            title="Messages"
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-[#6eb5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
          <button 
            className="flex-1 flex items-center justify-center p-2 bg-[#252525] hover:bg-[#333] rounded transition-colors group relative"
            title="Alerts"
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-[#6eb5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </button>
          <button 
            className="flex-1 flex items-center justify-center p-2 bg-[#252525] hover:bg-[#333] rounded transition-colors group relative"
            title="Friends"
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-[#6eb5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
