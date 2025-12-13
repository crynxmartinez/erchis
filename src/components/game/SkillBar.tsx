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

interface UsableItem {
  id: string
  name: string
  icon: string
  quantity: number
  type: string
}

interface QueuedAction {
  id: string
  slotIndex: number
  skill: Skill
}

interface SkillBarProps {
  maxSlots?: number
  maxItemSlots?: number
  isInSafeZone?: boolean
  inCombat?: boolean
  currentAp?: number
  onExecuteTurn?: (queue: QueuedAction[]) => void
}

export default function SkillBar({ 
  maxSlots = 10, 
  maxItemSlots = 10, 
  isInSafeZone = true,
  inCombat = false,
  currentAp = 100,
  onExecuteTurn,
}: SkillBarProps) {
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [showSkillPicker, setShowSkillPicker] = useState(false)

  const [hoveredItemSlot, setHoveredItemSlot] = useState<number | null>(null)
  const [selectedItemSlot, setSelectedItemSlot] = useState<number | null>(null)
  const [showItemPicker, setShowItemPicker] = useState(false)

  // Combat action queue (5 slots)
  const [actionQueue, setActionQueue] = useState<(QueuedAction | null)[]>(
    Array.from({ length: 5 }, () => null)
  )
  const [isExecuting, setIsExecuting] = useState(false)

  // Add skill to action queue
  const addToQueue = (skill: Skill, slotIndex: number) => {
    const emptySlot = actionQueue.findIndex(slot => slot === null)
    if (emptySlot === -1) return // Queue full
    
    const newQueue = [...actionQueue]
    newQueue[emptySlot] = { id: `${skill.id}-${Date.now()}`, slotIndex, skill }
    setActionQueue(newQueue)
  }

  // Remove from queue
  const removeFromQueue = (index: number) => {
    const newQueue = [...actionQueue]
    newQueue[index] = null
    // Shift remaining items left
    const filtered = newQueue.filter(Boolean)
    while (filtered.length < 5) filtered.push(null)
    setActionQueue(filtered as (QueuedAction | null)[])
  }

  // Clear queue
  const clearQueue = () => {
    setActionQueue(Array.from({ length: 5 }, () => null))
  }

  // Execute turn
  const handleExecute = async () => {
    if (!onExecuteTurn) return
    const validActions = actionQueue.filter(Boolean) as QueuedAction[]
    if (validActions.length === 0) return
    
    setIsExecuting(true)
    await onExecuteTurn(validActions)
    setIsExecuting(false)
    clearQueue()
  }

  // Calculate total AP cost
  const totalApCost = actionQueue
    .filter(Boolean)
    .reduce((sum, action) => sum + (action?.skill.cooldown || 0) * 5, 0) // Using cooldown as AP proxy for now

  // Placeholder equipped skills - will be fetched from DB later
  const [equippedSkills, setEquippedSkills] = useState<(Skill | null)[]>(
    Array.from({ length: maxSlots }, () => null)
  )

  // Placeholder equipped items - will be fetched from DB later
  const [itemSlots, setItemSlots] = useState<(UsableItem | null)[]>(
    Array.from({ length: maxItemSlots }, () => null)
  )

  // Placeholder learned skills - will be fetched from DB later
  const learnedSkills: Skill[] = []

  // Placeholder inventory items - will be fetched from DB later
  const inventoryItems: UsableItem[] = []

  const handleSlotClick = (position: number) => {
    const skill = equippedSkills[position - 1]
    
    // If skill exists, add to queue
    if (skill) {
      addToQueue(skill, position - 1)
      return
    }
    
    // Empty slot: open skill picker (only in safe zone)
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

  const handleItemSlotClick = (position: number) => {
    setSelectedItemSlot(position)
    setShowItemPicker(true)
  }

  const handleEquipItem = (item: UsableItem) => {
    if (selectedItemSlot === null) return
    const newItems = [...itemSlots]
    newItems[selectedItemSlot - 1] = item
    setItemSlots(newItems)
    setShowItemPicker(false)
    setSelectedItemSlot(null)
  }

  const handleUnequipItem = () => {
    if (selectedItemSlot === null) return
    const newItems = [...itemSlots]
    newItems[selectedItemSlot - 1] = null
    setItemSlots(newItems)
    setShowItemPicker(false)
    setSelectedItemSlot(null)
  }

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#1a1a1a]/95 border border-[#333] rounded-lg py-2 px-4 z-[100] backdrop-blur-sm shadow-xl">
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

            {/* Item Slots */}
            {itemSlots.map((item, index) => {
              const position = index + 1
              return (
                <div
                  key={`item-${position}`}
                  className="relative"
                  onMouseEnter={() => setHoveredItemSlot(position)}
                  onMouseLeave={() => setHoveredItemSlot(null)}
                >
                  <button
                    onClick={() => handleItemSlotClick(position)}
                    className={`w-10 h-10 rounded border-2 flex items-center justify-center transition-all ${
                      item
                        ? 'bg-[#2a2a2a] border-[#555] hover:border-[#6eb5ff] cursor-pointer'
                        : 'bg-[#1e1e1e] border-[#333] border-dashed hover:border-[#555] cursor-pointer'
                    } ${selectedItemSlot === position ? 'border-[#6eb5ff] ring-2 ring-[#6eb5ff]/50' : ''}`}
                  >
                    {item ? (
                      <div className="relative">
                        <span className="text-lg">{item.icon}</span>
                        {item.quantity > 1 && (
                          <span className="absolute -bottom-1 -right-2 text-[10px] text-white bg-[#333] px-1 rounded">
                            {item.quantity}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-600 text-[10px]">-</span>
                    )}
                  </button>

                  {/* Tooltip */}
                  {hoveredItemSlot === position && item && !showItemPicker && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1e1e1e] border border-[#444] rounded px-3 py-2 text-sm whitespace-nowrap z-50 shadow-xl">
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="text-xs text-gray-400">Qty: {item.quantity}</div>
                    </div>
                  )}

                  {/* Empty slot tooltip */}
                  {hoveredItemSlot === position && !item && !showItemPicker && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1e1e1e] border border-[#444] rounded px-3 py-2 text-sm whitespace-nowrap z-50 shadow-xl">
                      <div className="text-gray-400">Item Slot</div>
                      <div className="text-gray-500 text-xs">Click to equip item</div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Action Queue (5 slots) - Always visible */}
            <>
              {/* Separator */}
              <div className="w-px h-10 bg-[#6eb5ff] mx-2" />

                {/* Action Queue Label */}
                <div className="flex flex-col items-center mr-2">
                  <span className="text-[10px] text-[#6eb5ff] font-semibold">QUEUE</span>
                  <span className={`text-[10px] ${totalApCost > currentAp ? 'text-red-400' : 'text-gray-400'}`}>
                    {totalApCost}/{currentAp} AP
                  </span>
                </div>

                {/* 5 Action Queue Slots */}
                {actionQueue.map((action, index) => (
                  <div key={`queue-${index}`} className="relative">
                    <button
                      onClick={() => action && removeFromQueue(index)}
                      disabled={isExecuting}
                      className={`w-12 h-12 rounded border-2 flex items-center justify-center transition-all ${
                        action
                          ? 'bg-[#1a3a5c] border-[#6eb5ff] hover:bg-[#2a4a6c] cursor-pointer'
                          : 'bg-[#1e1e1e] border-[#444] border-dashed'
                      }`}
                    >
                      {action ? (
                        <div className="flex flex-col items-center">
                          <span className="text-lg">{action.skill.icon}</span>
                          <span className="text-[8px] text-gray-300 truncate max-w-[40px]">
                            {action.skill.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-600 text-xs">{index + 1}</span>
                      )}
                    </button>
                    {action && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500/80 rounded-full text-[10px] flex items-center justify-center text-white cursor-pointer hover:bg-red-600"
                        onClick={(e) => { e.stopPropagation(); removeFromQueue(index); }}
                      >
                        ✕
                      </div>
                    )}
                  </div>
                ))}

                {/* Execute Button */}
                <button
                  onClick={handleExecute}
                  disabled={isExecuting || actionQueue.every(a => a === null) || totalApCost > currentAp}
                  className={`ml-2 px-4 h-12 rounded font-semibold text-sm transition-all ${
                    !isExecuting && actionQueue.some(a => a !== null) && totalApCost <= currentAp
                      ? 'bg-[#6eb5ff] text-black hover:bg-[#8ec5ff]'
                      : 'bg-[#333] text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isExecuting ? '⏳' : '▶'}
                </button>

                {/* Clear Button */}
                {actionQueue.some(a => a !== null) && (
                  <button
                    onClick={clearQueue}
                    disabled={isExecuting}
                    className="ml-1 px-2 h-12 rounded bg-[#333] text-gray-400 hover:bg-[#444] hover:text-red-400 text-xs transition-all"
                  >
                    Clear
                  </button>
                )}
            </>
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

      {/* Item Picker Modal */}
      {showItemPicker && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowItemPicker(false)
              setSelectedItemSlot(null)
            }}
          />
          <div className="relative bg-[#1e1e1e] border border-[#444] rounded-lg shadow-2xl w-full max-w-md max-h-[60vh] overflow-hidden flex flex-col">
            <div className="bg-[#2a2a2a] px-4 py-3 border-b border-[#444] flex items-center justify-between">
              <h3 className="text-white font-medium">Select Item for Slot {selectedItemSlot}</h3>
              <button 
                onClick={() => {
                  setShowItemPicker(false)
                  setSelectedItemSlot(null)
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {/* Unequip option if slot has item */}
              {selectedItemSlot && itemSlots[selectedItemSlot - 1] && (
                <button
                  onClick={handleUnequipItem}
                  className="w-full mb-3 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 hover:bg-red-900/50 transition-colors text-sm"
                >
                  Remove Item from Slot
                </button>
              )}

              {inventoryItems.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <span className="text-3xl block mb-2">🎒</span>
                  <p>No usable items</p>
                  <p className="text-xs text-gray-500 mt-1">Buy items from shops or find them in dungeons</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {inventoryItems.map((item) => {
                    const isEquipped = itemSlots.some(s => s?.id === item.id)
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleEquipItem(item)}
                        className="w-full p-3 rounded-lg border flex items-center gap-3 transition-colors bg-[#252525] border-[#333] hover:border-[#6eb5ff] cursor-pointer"
                      >
                        <div className="w-10 h-10 bg-[#1e1e1e] rounded flex items-center justify-center text-xl">
                          {item.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-white font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500">
                            {item.type} • Qty: {item.quantity}
                          </div>
                        </div>
                        {isEquipped && (
                          <span className="text-xs text-green-500">In bar</span>
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
