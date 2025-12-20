'use client'

import { useState } from 'react'
import Link from 'next/link'
import { STARTER_ITEMS, ItemTemplate } from '@/data/items-data'

// Get only starter weapons
const STARTER_WEAPONS = STARTER_ITEMS.filter(item => 
  item.itemType === 'weapons' && item.name.startsWith('Starter')
)

// Weapon categories
const WEAPON_CATEGORIES = [
  { id: 'melee', name: 'Melee Weapons', icon: '⚔️', filter: (w: ItemTemplate) => !['Bow', 'Crossbow', 'Gun', 'Staff', 'Wand', 'Tome'].some(t => w.name.includes(t)) && w.equipSlot !== 'off_hand' },
  { id: 'ranged', name: 'Ranged Weapons', icon: '🏹', filter: (w: ItemTemplate) => ['Bow', 'Crossbow', 'Gun'].some(t => w.name.includes(t)) },
  { id: 'magic', name: 'Magic Weapons', icon: '✨', filter: (w: ItemTemplate) => ['Staff', 'Wand', 'Tome'].some(t => w.name.includes(t)) },
  { id: 'defense', name: 'Shields', icon: '🛡️', filter: (w: ItemTemplate) => w.equipSlot === 'off_hand' },
]

const RARITY_COLORS: Record<string, string> = {
  common: 'text-gray-400 border-gray-500/50',
  uncommon: 'text-green-400 border-green-500/50',
  rare: 'text-blue-400 border-blue-500/50',
  epic: 'text-purple-400 border-purple-500/50',
  legendary: 'text-yellow-400 border-yellow-500/50',
}

const SLOT_LABELS: Record<string, string> = {
  main_hand: 'Main Hand',
  off_hand: 'Off Hand',
  two_hand: 'Two-Handed',
}

interface ArmoryContentProps {
  floorId: string
}

export default function ArmoryContent({ floorId }: ArmoryContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedWeapon, setSelectedWeapon] = useState<ItemTemplate | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [message, setMessage] = useState('')

  const currentCategory = WEAPON_CATEGORIES.find(c => c.id === selectedCategory)
  const filteredWeapons = currentCategory 
    ? STARTER_WEAPONS.filter(currentCategory.filter)
    : []

  const handleClaimWeapon = async (weapon: ItemTemplate) => {
    setClaiming(true)
    setMessage('')
    try {
      const response = await fetch('/api/player/claim-starter-weapon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weaponName: weapon.name }),
      })
      const data = await response.json()
      if (data.success) {
        setMessage(`✅ Claimed ${weapon.name}!`)
      } else {
        setMessage(`❌ ${data.error || 'Failed to claim weapon'}`)
      }
    } catch {
      setMessage('❌ Failed to claim weapon')
    }
    setClaiming(false)
  }

  return (
    <div className="bg-[#242424] rounded border border-[#333] p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">⚔️</span>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-yellow-300">Steel & Edge Armory</h1>
          <p className="text-sm text-gray-400">Get your starter weapons from Diavel</p>
        </div>
        <Link 
          href={`/floor/${floorId}/town`}
          className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1 border border-[#333] rounded hover:border-yellow-500/50"
        >
          ← Back to Town
        </Link>
      </div>

      {/* NPC Dialog */}
      <div className="bg-[#1a1a1a] rounded-lg border border-yellow-500/30 p-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-900/50 flex items-center justify-center text-2xl border-2 border-yellow-500/50">
            🗡️
          </div>
          <div className="flex-1">
            <p className="text-yellow-300 font-bold text-sm mb-1">Diavel</p>
            <p className="text-gray-300 text-sm italic">
              {selectedWeapon 
                ? `"The ${selectedWeapon.name}? An excellent choice for a beginner! Take it - every adventurer deserves a proper weapon."`
                : selectedCategory 
                  ? `"Looking at ${currentCategory?.name}? Each weapon has its own strengths. Choose wisely!"`
                  : `"Welcome, adventurer! Every warrior needs a weapon. As a new player, you can claim one starter weapon for free. Choose your path!"`
              }
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg border text-sm ${message.includes('✅') ? 'bg-green-900/30 border-green-500/50 text-green-300' : 'bg-red-900/30 border-red-500/50 text-red-300'}`}>
          {message}
        </div>
      )}

      {/* Category Selection */}
      {!selectedCategory && (
        <div className="grid grid-cols-2 gap-3">
          {WEAPON_CATEGORIES.map(category => {
            const weapons = STARTER_WEAPONS.filter(category.filter)
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="bg-[#1a1a1a] rounded-lg border border-[#333] p-4 hover:border-yellow-500/50 hover:bg-[#222] transition-all text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <span className="font-bold text-white group-hover:text-yellow-300 transition-colors">{category.name}</span>
                    <p className="text-xs text-gray-500">{weapons.length} weapons</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {weapons.slice(0, 3).map(w => (
                    <span key={w.name} className="text-[10px] bg-black/30 px-2 py-0.5 rounded text-gray-400">
                      {w.name.replace('Starter ', '')}
                    </span>
                  ))}
                  {weapons.length > 3 && (
                    <span className="text-[10px] text-gray-500">+{weapons.length - 3}</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Weapon List */}
      {selectedCategory && !selectedWeapon && (
        <div>
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-gray-400 hover:text-white mb-3 flex items-center gap-1 text-sm"
          >
            ← Back to Categories
          </button>
          
          <h2 className="text-lg font-bold text-yellow-300 mb-3 flex items-center gap-2">
            <span>{currentCategory?.icon}</span>
            {currentCategory?.name}
          </h2>

          <div className="grid grid-cols-2 gap-2">
            {filteredWeapons.map(weapon => (
              <button
                key={weapon.name}
                onClick={() => setSelectedWeapon(weapon)}
                className={`bg-[#1a1a1a] rounded-lg border p-3 hover:bg-[#222] transition-all text-left ${RARITY_COLORS[weapon.rarity]}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{weapon.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white truncate">{weapon.name}</span>
                      <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded ml-1 shrink-0">
                        {SLOT_LABELS[weapon.equipSlot || 'main_hand']}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1">{weapon.description}</p>
                    {weapon.statBonuses && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(weapon.statBonuses).slice(0, 2).map(([stat, value]) => (
                          <span key={stat} className="text-[10px] text-green-400">
                            +{value} {stat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Weapon Detail */}
      {selectedWeapon && (
        <div>
          <button
            onClick={() => setSelectedWeapon(null)}
            className="text-gray-400 hover:text-white mb-3 flex items-center gap-1 text-sm"
          >
            ← Back to {currentCategory?.name}
          </button>

          <div className={`bg-[#1a1a1a] rounded-lg border p-4 ${RARITY_COLORS[selectedWeapon.rarity]}`}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-black/30 rounded-lg flex items-center justify-center text-3xl border border-white/10">
                {selectedWeapon.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-white">{selectedWeapon.name}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded capitalize ${RARITY_COLORS[selectedWeapon.rarity].replace('text-', 'bg-').replace('-400', '-900/50')}`}>
                    {selectedWeapon.rarity}
                  </span>
                </div>
                <p className="text-gray-300 text-sm">{selectedWeapon.description}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-black/30 rounded-lg p-3 mb-4">
              <h3 className="text-xs font-bold text-gray-400 mb-2">WEAPON STATS</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-[10px] text-gray-500">Equip Slot</div>
                  <div className="text-white font-bold text-sm">{SLOT_LABELS[selectedWeapon.equipSlot || 'main_hand']}</div>
                </div>
                {selectedWeapon.statBonuses && Object.entries(selectedWeapon.statBonuses).map(([stat, value]) => (
                  <div key={stat}>
                    <div className="text-[10px] text-gray-500">{stat}</div>
                    <div className="text-green-400 font-bold text-sm">+{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Claim Button */}
            <div className="flex items-center justify-between pt-3 border-t border-[#333]">
              <div className="text-gray-400 text-sm">
                <span className="text-green-400 font-bold">FREE</span> - Starter weapon
              </div>
              <button
                onClick={() => handleClaimWeapon(selectedWeapon)}
                disabled={claiming}
                className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 rounded-lg font-bold text-white text-sm transition-all disabled:opacity-50"
              >
                {claiming ? 'Claiming...' : '⚔️ Claim Weapon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
