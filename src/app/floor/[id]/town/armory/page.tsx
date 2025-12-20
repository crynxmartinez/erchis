'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { STARTER_ITEMS, ItemTemplate } from '@/data/items-data'

// Get only starter weapons
const STARTER_WEAPONS = STARTER_ITEMS.filter(item => 
  item.itemType === 'weapons' && item.name.startsWith('Starter')
)

// Weapon categories
const WEAPON_CATEGORIES = [
  { id: 'melee', name: 'Melee Weapons', icon: '⚔️', slots: ['main_hand', 'two_hand'], filter: (w: ItemTemplate) => !['Bow', 'Crossbow', 'Gun', 'Staff', 'Wand', 'Tome'].some(t => w.name.includes(t)) && w.equipSlot !== 'off_hand' },
  { id: 'ranged', name: 'Ranged Weapons', icon: '🏹', slots: ['main_hand', 'two_hand'], filter: (w: ItemTemplate) => ['Bow', 'Crossbow', 'Gun'].some(t => w.name.includes(t)) },
  { id: 'magic', name: 'Magic Weapons', icon: '✨', slots: ['main_hand', 'two_hand'], filter: (w: ItemTemplate) => ['Staff', 'Wand', 'Tome'].some(t => w.name.includes(t)) },
  { id: 'defense', name: 'Shields', icon: '🛡️', slots: ['off_hand'], filter: (w: ItemTemplate) => w.equipSlot === 'off_hand' },
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

export default function ArmoryPage() {
  const params = useParams()
  const floorId = params.id as string
  
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
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1e1e2e] to-[#2a2a1a] border-b border-yellow-500/30 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href={`/floor/${floorId}/town`}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Town
            </Link>
            <div className="h-6 w-px bg-gray-600" />
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚔️</span>
              <div>
                <h1 className="text-xl font-bold text-yellow-300">Steel & Edge Armory</h1>
                <p className="text-sm text-gray-400">Get your starter weapons from Diavel</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* NPC Dialog */}
        <div className="bg-[#242424] rounded-lg border border-yellow-500/30 p-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-yellow-900/50 flex items-center justify-center text-3xl border-2 border-yellow-500/50">
              🗡️
            </div>
            <div className="flex-1">
              <p className="text-yellow-300 font-bold mb-1">Diavel</p>
              <p className="text-gray-300 italic">
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
          <div className={`mb-4 p-3 rounded-lg border ${message.includes('✅') ? 'bg-green-900/30 border-green-500/50 text-green-300' : 'bg-red-900/30 border-red-500/50 text-red-300'}`}>
            {message}
          </div>
        )}

        {/* Category Selection */}
        {!selectedCategory && (
          <div className="grid grid-cols-2 gap-4">
            {WEAPON_CATEGORIES.map(category => {
              const weapons = STARTER_WEAPONS.filter(category.filter)
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="bg-[#242424] rounded-lg border border-[#333] p-6 hover:border-yellow-500/50 hover:bg-[#2a2a2a] transition-all text-left group"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-4xl">{category.icon}</span>
                    <div>
                      <span className="font-bold text-xl text-white group-hover:text-yellow-300 transition-colors">{category.name}</span>
                      <p className="text-sm text-gray-500">{weapons.length} weapons available</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {weapons.slice(0, 3).map(w => (
                      <span key={w.name} className="text-xs bg-black/30 px-2 py-1 rounded text-gray-400">
                        {w.name.replace('Starter ', '')}
                      </span>
                    ))}
                    {weapons.length > 3 && (
                      <span className="text-xs text-gray-500">+{weapons.length - 3} more</span>
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
              className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
            >
              ← Back to Categories
            </button>
            
            <h2 className="text-xl font-bold text-yellow-300 mb-4 flex items-center gap-2">
              <span>{currentCategory?.icon}</span>
              {currentCategory?.name}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {filteredWeapons.map(weapon => (
                <button
                  key={weapon.name}
                  onClick={() => setSelectedWeapon(weapon)}
                  className={`bg-[#242424] rounded-lg border p-4 hover:bg-[#2a2a2a] transition-all text-left ${RARITY_COLORS[weapon.rarity]}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{weapon.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white">{weapon.name}</span>
                        <span className="text-xs bg-black/30 px-2 py-1 rounded">
                          {SLOT_LABELS[weapon.equipSlot || 'main_hand']}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">{weapon.description}</p>
                      {weapon.statBonuses && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(weapon.statBonuses).map(([stat, value]) => (
                            <span key={stat} className="text-xs text-green-400">
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
              className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
            >
              ← Back to {currentCategory?.name}
            </button>

            <div className={`bg-[#242424] rounded-lg border p-6 ${RARITY_COLORS[selectedWeapon.rarity]}`}>
              <div className="flex items-start gap-6 mb-6">
                <div className="w-24 h-24 bg-black/30 rounded-lg flex items-center justify-center text-5xl border border-white/10">
                  {selectedWeapon.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{selectedWeapon.name}</h2>
                    <span className={`text-sm px-2 py-1 rounded capitalize ${RARITY_COLORS[selectedWeapon.rarity].replace('text-', 'bg-').replace('-400', '-900/50')}`}>
                      {selectedWeapon.rarity}
                    </span>
                  </div>
                  <p className="text-gray-300">{selectedWeapon.description}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-black/30 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-bold text-gray-400 mb-3">WEAPON STATS</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Equip Slot</div>
                    <div className="text-white font-bold">{SLOT_LABELS[selectedWeapon.equipSlot || 'main_hand']}</div>
                  </div>
                  {selectedWeapon.statBonuses && Object.entries(selectedWeapon.statBonuses).map(([stat, value]) => (
                    <div key={stat}>
                      <div className="text-xs text-gray-500">{stat}</div>
                      <div className="text-green-400 font-bold">+{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Claim Button */}
              <div className="flex items-center justify-between pt-4 border-t border-[#333]">
                <div className="text-gray-400">
                  <span className="text-green-400 font-bold">FREE</span> - Starter weapon (one per category)
                </div>
                <button
                  onClick={() => handleClaimWeapon(selectedWeapon)}
                  disabled={claiming}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 rounded-lg font-bold text-white transition-all disabled:opacity-50"
                >
                  {claiming ? 'Claiming...' : '⚔️ Claim Weapon'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
