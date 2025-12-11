'use client'

import { useState } from 'react'

interface SkillBarProps {
  maxSlots?: number
}

export default function SkillBar({ maxSlots = 10 }: SkillBarProps) {
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null)

  // Empty slots for now - will be populated with equipped skills later
  const slots = Array.from({ length: maxSlots }, (_, i) => ({
    position: i + 1,
    skill: null as null | { name: string; icon: string; cooldown: number },
  }))

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#333] py-2 px-4 z-[100]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-1">
          {slots.map((slot) => (
            <div
              key={slot.position}
              className="relative"
              onMouseEnter={() => setHoveredSlot(slot.position)}
              onMouseLeave={() => setHoveredSlot(null)}
            >
              {/* Skill Slot */}
              <div
                className={`w-12 h-12 rounded border-2 flex items-center justify-center transition-all ${
                  slot.skill
                    ? 'bg-[#2a2a2a] border-[#444] hover:border-[#6eb5ff] cursor-pointer'
                    : 'bg-[#1e1e1e] border-[#333] border-dashed'
                }`}
              >
                {slot.skill ? (
                  <span className="text-2xl">{slot.skill.icon}</span>
                ) : (
                  <span className="text-gray-600 text-xs">{slot.position}</span>
                )}
              </div>

              {/* Hotkey indicator */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#333] rounded text-[10px] flex items-center justify-center text-gray-400 font-bold">
                {slot.position === 10 ? '0' : slot.position}
              </div>

              {/* Tooltip */}
              {hoveredSlot === slot.position && slot.skill && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1e1e1e] border border-[#444] rounded px-3 py-2 text-sm whitespace-nowrap z-50 shadow-xl">
                  <div className="font-semibold text-white">{slot.skill.name}</div>
                  <div className="text-gray-400 text-xs">Cooldown: {slot.skill.cooldown}s</div>
                </div>
              )}

              {/* Empty slot tooltip */}
              {hoveredSlot === slot.position && !slot.skill && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1e1e1e] border border-[#444] rounded px-3 py-2 text-sm whitespace-nowrap z-50 shadow-xl">
                  <div className="text-gray-400">Empty Slot</div>
                  <div className="text-gray-500 text-xs">Equip skills in safe zone</div>
                </div>
              )}
            </div>
          ))}

          {/* Separator */}
          <div className="w-px h-10 bg-[#333] mx-2" />

          {/* Quick info */}
          <div className="text-xs text-gray-500 ml-2">
            <div>Press 1-0 to use skills</div>
            <div className="text-gray-600">Change in safe zone</div>
          </div>
        </div>
      </div>
    </div>
  )
}
