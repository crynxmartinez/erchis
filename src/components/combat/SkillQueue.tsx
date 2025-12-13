'use client'

import { useState } from 'react'

interface QueuedAction {
  id: string
  type: 'skill' | 'item'
  name: string
  apCost: number
  icon?: string
}

interface SkillQueueProps {
  queue: QueuedAction[]
  maxSlots?: number
  currentAp: number
  onRemove: (index: number) => void
  onClear: () => void
  onExecute: () => void
  isExecuting?: boolean
}

export default function SkillQueue({
  queue,
  maxSlots = 5,
  currentAp,
  onRemove,
  onClear,
  onExecute,
  isExecuting = false,
}: SkillQueueProps) {
  const totalApCost = queue.reduce((sum, action) => sum + action.apCost, 0)
  const canExecute = queue.length > 0 && totalApCost <= currentAp && !isExecuting

  return (
    <div className="bg-[#1a1a1a]/95 border border-[#444] rounded-lg p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#6eb5ff] flex items-center gap-2">
          ⚔️ Action Queue
        </h3>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${totalApCost > currentAp ? 'text-red-400' : 'text-gray-400'}`}>
            AP: {totalApCost}/{currentAp}
          </span>
          {queue.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors"
              disabled={isExecuting}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        {Array.from({ length: maxSlots }).map((_, index) => {
          const action = queue[index]
          return (
            <div
              key={index}
              className={`
                w-14 h-14 rounded-lg border-2 border-dashed flex items-center justify-center
                transition-all duration-200
                ${action 
                  ? 'border-[#6eb5ff] bg-[#252525]' 
                  : 'border-[#333] bg-[#1e1e1e]'
                }
              `}
            >
              {action ? (
                <div 
                  className="relative w-full h-full flex flex-col items-center justify-center cursor-pointer group"
                  onClick={() => !isExecuting && onRemove(index)}
                >
                  <span className="text-lg">{action.icon || '⚔️'}</span>
                  <span className="text-[10px] text-gray-400 truncate max-w-[50px]">
                    {action.name}
                  </span>
                  <div className="absolute inset-0 bg-red-500/20 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                    <span className="text-red-400 text-xs">✕</span>
                  </div>
                </div>
              ) : (
                <span className="text-[10px] text-gray-600">{index + 1}</span>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={onExecute}
        disabled={!canExecute}
        className={`
          w-full py-2 rounded-lg font-semibold text-sm transition-all
          ${canExecute
            ? 'bg-[#6eb5ff] text-black hover:bg-[#8ec5ff]'
            : 'bg-[#333] text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {isExecuting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span> Executing...
          </span>
        ) : (
          `Execute Turn (${totalApCost} AP)`
        )}
      </button>

      {totalApCost > currentAp && queue.length > 0 && (
        <p className="text-xs text-red-400 mt-2 text-center">
          Not enough AP! Remove some actions.
        </p>
      )}
    </div>
  )
}
