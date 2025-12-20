'use client'

import { useState } from 'react'
import Link from 'next/link'
import { STARTER_ITEMS, ItemTemplate } from '@/data/items-data'

// Get only buyable items (not materials with buyPrice 0, not starter weapons)
const SHOP_ITEMS = STARTER_ITEMS.filter(item => 
  item.buyPrice > 0 && 
  !item.name.startsWith('Starter') &&
  item.itemType !== 'weapons'
)

// Item categories for the shop
const SHOP_CATEGORIES = [
  { id: 'potions', name: 'Potions & Consumables', icon: '🧪', filter: (i: ItemTemplate) => i.itemType === 'potions' },
  { id: 'misc', name: 'Miscellaneous', icon: '📦', filter: (i: ItemTemplate) => i.itemType === 'misc' },
]

const RARITY_COLORS: Record<string, string> = {
  common: 'text-gray-400 border-gray-500/30',
  uncommon: 'text-green-400 border-green-500/30',
  rare: 'text-blue-400 border-blue-500/30',
  epic: 'text-purple-400 border-purple-500/30',
  legendary: 'text-yellow-400 border-yellow-500/30',
}

const EFFECT_ICONS: Record<string, string> = {
  heal: '❤️',
  restore_ap: '💧',
  buff_str: '💪',
  buff_agi: '🏃',
  buff_vit: '🛡️',
  buff_int: '🧠',
  buff_dex: '🎯',
  buff_luk: '🍀',
  cure_poison: '💊',
  cure_all: '✨',
  teleport_town: '💠',
}

interface ShopContentProps {
  floorId: string
  playerCol: number
}

export default function ShopContent({ floorId, playerCol }: ShopContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<ItemTemplate | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [buying, setBuying] = useState(false)
  const [message, setMessage] = useState('')

  const currentCategory = SHOP_CATEGORIES.find(c => c.id === selectedCategory)
  const filteredItems = currentCategory 
    ? SHOP_ITEMS.filter(currentCategory.filter)
    : []

  const handleBuyItem = async (item: ItemTemplate, qty: number) => {
    setBuying(true)
    setMessage('')
    try {
      const response = await fetch('/api/player/buy-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemName: item.name, quantity: qty }),
      })
      const data = await response.json()
      if (data.success) {
        setMessage(`✅ Bought ${qty}x ${item.name} for ${item.buyPrice * qty} Col!`)
        setQuantity(1)
      } else {
        setMessage(`❌ ${data.error || 'Failed to buy item'}`)
      }
    } catch {
      setMessage('❌ Failed to buy item')
    }
    setBuying(false)
  }

  const totalPrice = selectedItem ? selectedItem.buyPrice * quantity : 0

  return (
    <div className="bg-[#242424] rounded border border-[#333] p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🏪</span>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-green-300">Romolo's Provisions</h1>
          <p className="text-sm text-gray-400">Buy supplies for your adventures</p>
        </div>
        <div className="text-right mr-4">
          <div className="text-xs text-gray-500">Your Col</div>
          <div className="text-yellow-400 font-bold">{playerCol.toLocaleString()} 💰</div>
        </div>
        <Link 
          href={`/floor/${floorId}/town`}
          className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1 border border-[#333] rounded hover:border-green-500/50"
        >
          ← Back to Town
        </Link>
      </div>

      {/* NPC Dialog */}
      <div className="bg-[#1a1a1a] rounded-lg border border-green-500/30 p-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-green-900/50 flex items-center justify-center text-2xl border-2 border-green-500/50">
            🧔
          </div>
          <div className="flex-1">
            <p className="text-green-300 font-bold text-sm mb-1">Romolo</p>
            <p className="text-gray-300 text-sm italic">
              {selectedItem 
                ? `"${selectedItem.name}? A wise purchase! That'll be ${selectedItem.buyPrice} Col each. How many do you need?"`
                : selectedCategory 
                  ? `"Ah, browsing the ${currentCategory?.name}? Take your time, friend!"`
                  : `"Welcome to my humble shop! I've got potions, supplies, and everything an adventurer might need. What can I get for you today?"`
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
          {SHOP_CATEGORIES.map(category => {
            const items = SHOP_ITEMS.filter(category.filter)
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="bg-[#1a1a1a] rounded-lg border border-[#333] p-4 hover:border-green-500/50 hover:bg-[#222] transition-all text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <span className="font-bold text-white group-hover:text-green-300 transition-colors">{category.name}</span>
                    <p className="text-xs text-gray-500">{items.length} items</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {items.slice(0, 3).map(item => (
                    <span key={item.name} className="text-[10px] bg-black/30 px-2 py-0.5 rounded text-gray-400">
                      {item.icon} {item.name}
                    </span>
                  ))}
                  {items.length > 3 && (
                    <span className="text-[10px] text-gray-500">+{items.length - 3}</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Item List */}
      {selectedCategory && !selectedItem && (
        <div>
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-gray-400 hover:text-white mb-3 flex items-center gap-1 text-sm"
          >
            ← Back to Categories
          </button>
          
          <h2 className="text-lg font-bold text-green-300 mb-3 flex items-center gap-2">
            <span>{currentCategory?.icon}</span>
            {currentCategory?.name}
          </h2>

          <div className="grid grid-cols-2 gap-2">
            {filteredItems.map(item => (
              <button
                key={item.name}
                onClick={() => { setSelectedItem(item); setQuantity(1); }}
                className={`bg-[#1a1a1a] rounded-lg border p-3 hover:bg-[#222] transition-all text-left ${RARITY_COLORS[item.rarity]}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white truncate">{item.name}</span>
                      <span className="text-yellow-400 font-bold text-sm ml-1">{item.buyPrice} 💰</span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1">{item.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.useEffect && (
                        <span className="text-[10px] text-green-400">
                          {EFFECT_ICONS[item.useEffect]} +{item.effectValue}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-500">Stack: {item.maxStack}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Item Detail */}
      {selectedItem && (
        <div>
          <button
            onClick={() => setSelectedItem(null)}
            className="text-gray-400 hover:text-white mb-3 flex items-center gap-1 text-sm"
          >
            ← Back to {currentCategory?.name}
          </button>

          <div className={`bg-[#1a1a1a] rounded-lg border p-4 ${RARITY_COLORS[selectedItem.rarity]}`}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-black/30 rounded-lg flex items-center justify-center text-3xl border border-white/10">
                {selectedItem.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-white">{selectedItem.name}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded capitalize ${RARITY_COLORS[selectedItem.rarity].replace('text-', 'bg-').replace('-400', '-900/50')}`}>
                    {selectedItem.rarity}
                  </span>
                </div>
                <p className="text-gray-300 text-sm">{selectedItem.description}</p>
              </div>
            </div>

            {/* Item Stats */}
            <div className="bg-black/30 rounded-lg p-3 mb-4">
              <h3 className="text-xs font-bold text-gray-400 mb-2">ITEM INFO</h3>
              <div className="grid grid-cols-4 gap-3">
                {selectedItem.useEffect && (
                  <div>
                    <div className="text-[10px] text-gray-500">Effect</div>
                    <div className="text-green-400 font-bold text-sm flex items-center gap-1">
                      {EFFECT_ICONS[selectedItem.useEffect]} +{selectedItem.effectValue}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-[10px] text-gray-500">Max Stack</div>
                  <div className="text-white font-bold text-sm">{selectedItem.maxStack}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500">Buy Price</div>
                  <div className="text-yellow-400 font-bold text-sm">{selectedItem.buyPrice} 💰</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500">Sell Price</div>
                  <div className="text-gray-400 font-bold text-sm">{selectedItem.sellPrice} 💰</div>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="bg-black/30 rounded-lg p-3 mb-4">
              <h3 className="text-xs font-bold text-gray-400 mb-2">QUANTITY</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 bg-[#333] hover:bg-[#444] rounded-lg font-bold text-lg transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(selectedItem.maxStack, parseInt(e.target.value) || 1)))}
                  className="w-16 h-8 bg-black/50 border border-[#333] rounded-lg text-center font-bold text-white text-sm"
                />
                <button
                  onClick={() => setQuantity(Math.min(selectedItem.maxStack, quantity + 1))}
                  className="w-8 h-8 bg-[#333] hover:bg-[#444] rounded-lg font-bold text-lg transition-colors"
                >
                  +
                </button>
                <button
                  onClick={() => setQuantity(selectedItem.maxStack)}
                  className="px-2 h-8 bg-[#333] hover:bg-[#444] rounded-lg text-xs text-gray-400 transition-colors"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Buy Button */}
            <div className="flex items-center justify-between pt-3 border-t border-[#333]">
              <div>
                <div className="text-xs text-gray-400">Total Price</div>
                <div className="text-xl font-bold text-yellow-400">{totalPrice.toLocaleString()} 💰</div>
              </div>
              <button
                onClick={() => handleBuyItem(selectedItem, quantity)}
                disabled={buying || totalPrice > playerCol}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-lg font-bold text-white text-sm transition-all disabled:opacity-50"
              >
                {buying ? 'Buying...' : totalPrice > playerCol ? '💰 Not enough Col' : `🛒 Buy ${quantity}x`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
