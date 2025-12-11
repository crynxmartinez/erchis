'use client'

import { useState } from 'react'

interface Skill {
  id: string
  name: string
  icon: string
  cooldown: number
  type: string
  weaponCategory: string | null
  level: number
}

interface SkillBarProps {
  maxSlots?: number
  isInSafeZone?: boolean
}

export default function SkillBar({ maxSlots = 10, isInSafeZone = true }: SkillBarProps) {
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [showSkillPicker, setShowSkillPicker] = useState(false)

  // Placeholder equipped skills - will be fetched from DB later
  const [equippedSkills, setEquippedSkills] = useState<(Skill | null)[]>(
    Array.from({ length: maxSlots }, () => null)
  )

  // Placeholder learned skills - will be fetched from DB later
  const learnedSkills: Skill[] = []

  const handleSlotClick = (position: number) => {
    if (!isInSafeZone) return
    setSelectedSlot(position)
    setShowSkillPicker(true)
  }

  const handleEquipSkill = (skill: Skill) => {
    if (selectedSlot === null) return
    const newEquipped = [...equippedSkills]
    newEquipped[selectedSlot - 1] = skill
    setEquippedSkills(newEquipped)
    setShowSkillPicker(false)
    setSelectedSlot(null)
  }

  const handleUnequipSkill = () => {
    if (selectedSlot === null) return
    const newEquipped = [...equippedSkills]
    newEquipped[selectedSlot - 1] = null
    setEquippedSkills(newEquipped)
    setShowSkillPicker(false)
    setSelectedSlot(null)
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#333] py-2 px-4 z-[100]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-1">
            {equippedSkills.map((skill, index) => {
              const position = index + 1
              return (
                <div
                  key={position}
                  className="relative"
                  onMouseEnter={() => setHoveredSlot(position)}
                  onMouseLeave={() => setHoveredSlot(null)}
                >
                  {/* Skill Slot */}
                  <button
                    onClick={() => handleSlotClick(position)}
                    className={`w-12 h-12 rounded border-2 flex items-center justify-center transition-all ${
                      skill
                        ? 'bg-[#2a2a2a] border-[#444] hover:border-[#6eb5ff] cursor-pointer'
                        : isInSafeZone
                          ? 'bg-[#1e1e1e] border-[#333] border-dashed hover:border-[#6eb5ff] cursor-pointer'
                          : 'bg-[#1e1e1e] border-[#333] border-dashed cursor-not-allowed'
                    } ${selectedSlot === position ? 'border-[#6eb5ff] ring-2 ring-[#6eb5ff]/50' : ''}`}
                  >
                    {skill ? (
                      <span className="text-2xl">{skill.icon}</span>
                    ) : (
                      <span className="text-gray-600 text-xs">{position}</span>
                    )}
                  </button>

                  {/* Hotkey indicator */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#333] rounded text-[10px] flex items-center justify-center text-gray-400 font-bold">
                    {position === 10 ? '0' : position}
                  </div>

                  {/* Tooltip */}
                  {hoveredSlot === position && skill && !showSkillPicker && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1e1e1e] border border-[#444] rounded px-3 py-2 text-sm whitespace-nowrap z-50 shadow-xl">
                      <div className="font-semibold text-white">{skill.name}</div>
                      <div className="text-xs text-gray-400">Level {skill.level}</div>
                      <div className="text-gray-400 text-xs">Cooldown: {skill.cooldown}s</div>
                    </div>
                  )}

                  {/* Empty slot tooltip */}
                  {hoveredSlot === position && !skill && !showSkillPicker && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1e1e1e] border border-[#444] rounded px-3 py-2 text-sm whitespace-nowrap z-50 shadow-xl">
                      <div className="text-gray-400">Empty Slot</div>
                      <div className="text-gray-500 text-xs">
                        {isInSafeZone ? 'Click to equip skill' : 'Equip in safe zone'}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Separator */}
            <div className="w-px h-10 bg-[#333] mx-2" />

            {/* Quick info */}
            <div className="text-xs text-gray-500 ml-2">
              <div>Press 1-0 to use skills</div>
              <div className={isInSafeZone ? 'text-green-500' : 'text-gray-600'}>
                {isInSafeZone ? '✓ Safe Zone' : 'Change in safe zone'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Picker Modal */}
      {showSkillPicker && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowSkillPicker(false)
              setSelectedSlot(null)
            }}
          />
          <div className="relative bg-[#1e1e1e] border border-[#444] rounded-lg shadow-2xl w-full max-w-md max-h-[60vh] overflow-hidden flex flex-col">
            <div className="bg-[#2a2a2a] px-4 py-3 border-b border-[#444] flex items-center justify-between">
              <h3 className="text-white font-medium">Select Skill for Slot {selectedSlot}</h3>
              <button 
                onClick={() => {
                  setShowSkillPicker(false)
                  setSelectedSlot(null)
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {/* Unequip option if slot has skill */}
              {selectedSlot && equippedSkills[selectedSlot - 1] && (
                <button
                  onClick={handleUnequipSkill}
                  className="w-full mb-3 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 hover:bg-red-900/50 transition-colors text-sm"
                >
                  Remove Skill from Slot
                </button>
              )}

              {learnedSkills.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <span className="text-3xl block mb-2">⚔️</span>
                  <p>No skills learned yet</p>
                  <p className="text-xs text-gray-500 mt-1">Visit the Skill Trainer to learn skills</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {learnedSkills.map((skill) => {
                    const isEquipped = equippedSkills.some(s => s?.id === skill.id)
                    return (
                      <button
                        key={skill.id}
                        onClick={() => !isEquipped && handleEquipSkill(skill)}
                        disabled={isEquipped}
                        className={`w-full p-3 rounded-lg border flex items-center gap-3 transition-colors ${
                          isEquipped
                            ? 'bg-[#252525] border-[#333] opacity-50 cursor-not-allowed'
                            : 'bg-[#252525] border-[#333] hover:border-[#6eb5ff] cursor-pointer'
                        }`}
                      >
                        <div className="w-10 h-10 bg-[#1e1e1e] rounded flex items-center justify-center text-xl">
                          {skill.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-white font-medium">{skill.name}</div>
                          <div className="text-xs text-gray-500">
                            {skill.weaponCategory || 'Universal'} • Level {skill.level} • {skill.cooldown}s CD
                          </div>
                        </div>
                        {isEquipped && (
                          <span className="text-xs text-gray-500">Equipped</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
