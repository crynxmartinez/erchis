'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// ============================================
// TYPES
// ============================================

interface Item {
  id?: string
  tempId?: string
  name: string
  description: string | null
  icon: string
  itemType: string
  useEffect: string | null
  effectValue: number
  equipSlot: string | null
  statBonuses: Record<string, number>
  buyPrice: number
  sellPrice: number
  maxStack: number
  isUnique: boolean
  rarity: string
  isDuplicate?: boolean
  isLocked?: boolean
  isSaved?: boolean
}

interface CategoryConfig {
  id: string
  icon: string
  label: string
  description: string
  color: string
  borderColor: string
  bgColor: string
  tag: string
}

// ============================================
// CONSTANTS
// ============================================

const CATEGORIES: CategoryConfig[] = [
  { 
    id: 'potions', 
    icon: '🧪', 
    label: 'Potions', 
    description: 'HP, MP, and AP restoration items.',
    color: 'text-red-400',
    borderColor: 'border-red-500/50',
    bgColor: 'bg-red-900/10',
    tag: 'recovery'
  },
  { 
    id: 'food', 
    icon: '🍖', 
    label: 'Food', 
    description: 'Consumables with temporary stat buffs.',
    color: 'text-orange-400',
    borderColor: 'border-orange-500/50',
    bgColor: 'bg-orange-900/10',
    tag: 'buff'
  },
  { 
    id: 'scrolls', 
    icon: '📜', 
    label: 'Scrolls', 
    description: 'One-time magical spell effects.',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/50',
    bgColor: 'bg-purple-900/10',
    tag: 'magic'
  },
  { 
    id: 'materials', 
    icon: '🪨', 
    label: 'Materials', 
    description: 'Components for crafting and trading.',
    color: 'text-gray-400',
    borderColor: 'border-gray-500/50',
    bgColor: 'bg-gray-900/10',
    tag: 'crafting'
  },
  { 
    id: 'weapons', 
    icon: '⚔️', 
    label: 'Weapons', 
    description: 'Offensive equipment for combat.',
    color: 'text-red-400',
    borderColor: 'border-red-500/50',
    bgColor: 'bg-red-900/10',
    tag: 'equipment'
  },
  { 
    id: 'armor', 
    icon: '🛡️', 
    label: 'Armor', 
    description: 'Defensive equipment for protection.',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/50',
    bgColor: 'bg-blue-900/10',
    tag: 'equipment'
  },
  { 
    id: 'accessories', 
    icon: '💍', 
    label: 'Accessories', 
    description: 'Rings, necklaces, and trinkets.',
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500/50',
    bgColor: 'bg-yellow-900/10',
    tag: 'equipment'
  },
  { 
    id: 'misc', 
    icon: '📦', 
    label: 'Misc', 
    description: 'Quest items, keys, and special objects.',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/50',
    bgColor: 'bg-cyan-900/10',
    tag: 'special'
  },
]

const RARITY_LEVELS = [
  { id: 'common', name: 'Common', color: '#9ca3af' },
  { id: 'uncommon', name: 'Uncommon', color: '#22c55e' },
  { id: 'rare', name: 'Rare', color: '#3b82f6' },
  { id: 'epic', name: 'Epic', color: '#a855f7' },
  { id: 'legendary', name: 'Legendary', color: '#f59e0b' },
]

// ============================================
// LOADING SPINNER COMPONENT
// ============================================

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

// ============================================
// STAT CARD COMPONENT
// ============================================

function StatCard({ label, value, color, icon, unit = '' }: { 
  label: string
  value: number | string
  color: string
  icon?: string
  unit?: string
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-black/60 to-black/40 p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1">
          {icon && <span>{icon}</span>}
          {label}
        </div>
        <div className={`text-2xl font-bold ${color}`}>
          {value}{unit}
        </div>
      </div>
    </div>
  )
}

// ============================================
// SECTION PANEL COMPONENT
// ============================================

function SectionPanel({ title, icon, children, color = 'border-white/10' }: {
  title: string
  icon: string
  children: React.ReactNode
  color?: string
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl border ${color} bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d]`}>
      <div className="absolute inset-0 opacity-30 pointer-events-none" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} 
      />
      <div className="relative">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-black/30">
          <span className="text-lg">{icon}</span>
          <span className="font-bold text-sm uppercase tracking-wider text-gray-300">{title}</span>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}

// ============================================
// ITEM DETAIL PANEL COMPONENT (TABBED)
// ============================================

function ItemDetailPanel({ item, onClose, getRarityColor }: { 
  item: Item
  onClose: () => void
  getRarityColor: (rarity: string) => string
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'effects' | 'equipment' | 'flavor'>('overview')
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'effects', label: 'Effects', icon: '✨' },
    { id: 'equipment', label: 'Equipment', icon: '⚔️' },
    { id: 'flavor', label: 'Flavor', icon: '📜' },
  ]

  const isEquipment = item.equipSlot !== null
  const isConsumable = item.useEffect !== null

  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-[#333] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#333] bg-gradient-to-r from-[#1a1a1a] to-[#252525]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-4xl">
              {item.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: getRarityColor(item.rarity) }}>
                {item.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded bg-black/40 border border-white/10 text-gray-400">
                  {item.itemType}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-black/40 border border-white/10" style={{ color: getRarityColor(item.rarity) }}>
                  {item.rarity}
                </span>
                {item.isUnique && (
                  <span className="text-xs px-2 py-0.5 rounded bg-yellow-900/30 border border-yellow-500/30 text-yellow-400">
                    Unique
                  </span>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#333] bg-black/20">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? 'text-[#6eb5ff] border-b-2 border-[#6eb5ff] bg-[#6eb5ff]/5'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <StatCard label="Buy Price" value={item.buyPrice} color="text-yellow-400" icon="💰" unit=" Col" />
              <StatCard label="Sell Price" value={item.sellPrice} color="text-green-400" icon="💵" unit=" Col" />
              <StatCard label="Max Stack" value={item.maxStack} color="text-blue-400" icon="📦" />
              <StatCard label="Weight" value={item.statBonuses?.weight || 1} color="text-gray-400" icon="⚖️" />
            </div>
            
            <SectionPanel title="Basic Info" icon="📋">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-500">Item Type</span>
                  <span className="text-white">{item.itemType}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-500">Rarity</span>
                  <span style={{ color: getRarityColor(item.rarity) }}>{item.rarity}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-500">Unique</span>
                  <span className="text-white">{item.isUnique ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-gray-500">Stackable</span>
                  <span className="text-white">{item.maxStack > 1 ? `Yes (${item.maxStack})` : 'No'}</span>
                </div>
              </div>
            </SectionPanel>
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="space-y-6">
            {isConsumable ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <StatCard label="Effect Type" value={item.useEffect || 'None'} color="text-purple-400" icon="✨" />
                  <StatCard label="Effect Value" value={item.effectValue} color="text-green-400" icon="💪" />
                  <StatCard label="Cooldown" value="0" color="text-blue-400" icon="⏱️" unit="s" />
                </div>
                
                <SectionPanel title="Use Effect" icon="✨" color="border-purple-500/30">
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-gray-500">Effect</span>
                      <span className="text-purple-400">{item.useEffect}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-gray-500">Value</span>
                      <span className="text-green-400">+{item.effectValue}</span>
                    </div>
                    <div className="mt-4 p-3 bg-black/30 rounded-lg text-sm text-gray-400 italic">
                      "Use this item to {item.useEffect?.replace('_', ' ')} by {item.effectValue} points."
                    </div>
                  </div>
                </SectionPanel>
              </>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <span className="text-4xl mb-4 block">🚫</span>
                This item has no use effects.
              </div>
            )}
          </div>
        )}

        {activeTab === 'equipment' && (
          <div className="space-y-6">
            {isEquipment ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <StatCard label="Equip Slot" value={item.equipSlot || 'None'} color="text-blue-400" icon="🎯" />
                  <StatCard label="Durability" value={100} color="text-green-400" icon="🛡️" />
                  <StatCard label="Weight" value={item.statBonuses?.weight || 5} color="text-gray-400" icon="⚖️" />
                </div>
                
                <SectionPanel title="Stat Bonuses" icon="📊" color="border-blue-500/30">
                  {Object.keys(item.statBonuses || {}).length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(item.statBonuses || {}).map(([stat, value]) => (
                        <div key={stat} className="bg-black/30 rounded-lg p-3 text-center">
                          <div className="text-xs text-gray-500 uppercase mb-1">{stat}</div>
                          <div className="text-lg font-bold text-green-400">+{value}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">No stat bonuses</div>
                  )}
                </SectionPanel>

                <SectionPanel title="Requirements" icon="📋" color="border-yellow-500/30">
                  <div className="text-center text-gray-500 py-4">
                    No special requirements
                  </div>
                </SectionPanel>
              </>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <span className="text-4xl mb-4 block">👕</span>
                This item is not equippable.
              </div>
            )}
          </div>
        )}

        {activeTab === 'flavor' && (
          <div className="space-y-6">
            <SectionPanel title="Description" icon="📝">
              <p className="text-gray-300 leading-relaxed">
                {item.description || `A ${item.rarity} ${item.itemType}.`}
              </p>
            </SectionPanel>

            <SectionPanel title="Lore" icon="📜" color="border-purple-500/30">
              <p className="text-gray-400 italic leading-relaxed">
                "This item awaits its story to be written..."
              </p>
            </SectionPanel>

            <SectionPanel title="Acquisition" icon="🗺️" color="border-green-500/30">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <span>🏪</span> Available at general stores
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <span>👹</span> Drops from various monsters
                </div>
              </div>
            </SectionPanel>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// DASHBOARD COMPONENTS
// ============================================

function DashboardStats({ totalItems, totalCategories }: { totalItems: number, totalCategories: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#333] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">
          <div className="text-4xl font-bold text-blue-400 mb-1">{totalItems}</div>
          <div className="text-gray-400 text-sm font-medium">Total Items</div>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-6xl opacity-5">📦</div>
      </div>
      
      <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#333] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">
          <div className="text-4xl font-bold text-purple-400 mb-1">{totalCategories}</div>
          <div className="text-gray-400 text-sm font-medium">Item Categories</div>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-6xl opacity-5">📂</div>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#333] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">
          <div className="text-4xl font-bold text-green-400 mb-1">Active</div>
          <div className="text-gray-400 text-sm font-medium">System Status</div>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-6xl opacity-5">✅</div>
      </div>
    </div>
  )
}

function CategoryGrid({ onSelectCategory, itemCounts }: { 
  onSelectCategory: (id: string) => void,
  itemCounts: Record<string, number>
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {CATEGORIES.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={`relative overflow-hidden rounded-xl border ${cat.borderColor} bg-[#1a1a1a] p-6 text-left transition-all hover:scale-[1.02] hover:shadow-lg group`}
        >
          {/* Background tint */}
          <div className={`absolute inset-0 ${cat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <span className={`text-lg font-bold ${cat.color}`}>{cat.label}</span>
              </div>
            </div>
            
            <p className="text-gray-400 text-xs mb-6 h-8 line-clamp-2">{cat.description}</p>
            
            <div className="flex justify-between items-end border-t border-white/5 pt-4">
              <div className="text-2xl font-bold text-white">
                {itemCounts[cat.id] || 0} <span className="text-xs font-normal text-gray-500">Items</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded bg-black/40 border border-white/10 ${cat.color}`}>
                {cat.tag}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

function Sidebar({ 
  activeCategory, 
  onSelectCategory, 
  onBackToDashboard 
}: { 
  activeCategory: string | null, 
  onSelectCategory: (id: string) => void,
  onBackToDashboard: () => void 
}) {
  return (
    <div className="w-64 bg-[#0a0a0a] border-r border-[#333] flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="p-4 border-b border-[#333]">
        <div className="flex items-center gap-2 text-white font-bold text-lg mb-6">
          <span>📦</span> ITEM DATABASE
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search items..." 
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg py-2 pl-9 pr-4 text-sm text-gray-300 focus:outline-none focus:border-[#6eb5ff]"
          />
          <span className="absolute left-3 top-2.5 text-gray-500 text-xs">🔍</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <button
          onClick={onBackToDashboard}
          className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors flex items-center justify-between group ${
            activeCategory === null ? 'text-[#6eb5ff] bg-[#6eb5ff]/10 border-l-2 border-[#6eb5ff]' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>Dashboard</span>
        </button>

        <div className="my-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Categories</div>

        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors flex items-center justify-between group ${
              activeCategory === cat.id 
                ? `${cat.color} bg-white/5 border-l-2 border-current` 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="opacity-70 group-hover:opacity-100 transition-opacity">{cat.icon}</span>
              <span>{cat.label}</span>
            </div>
            {activeCategory === cat.id && <span className="text-[10px]">▶</span>}
          </button>
        ))}
      </div>
      
      <div className="p-4 border-t border-[#333] text-xs text-gray-600">
        v1.0.0 • Item Database
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ItemDatabase() {
  // Saved items from database
  const [savedItems, setSavedItems] = useState<Item[]>([])
  // Generated items (not yet saved)
  const [generatedItems, setGeneratedItems] = useState<Item[]>([])
  
  // UI State
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'dashboard' | 'category'>('dashboard')
  const [selectedCategory, setSelectedCategory] = useState<string>('potions')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  // Load saved items on mount
  useEffect(() => { fetchSavedItems() }, [])

  const fetchSavedItems = async () => {
    try {
      const response = await fetch('/api/items')
      const data = await response.json()
      if (data.success) {
        setSavedItems(data.items.map((i: Item) => ({ ...i, isSaved: true })))
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  // Navigation Handlers
  const handleSelectCategory = (id: string) => {
    setSelectedCategory(id)
    setView('category')
  }

  const handleBackToDashboard = () => {
    setView('dashboard')
    setSelectedItem(null)
  }

  // Calculate counts for dashboard
  const itemCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = savedItems.filter(s => s.itemType === cat.id).length
    return acc
  }, {} as Record<string, number>)

  // ============================================
  // GENERATE ITEMS
  // ============================================

  const handleGenerate = async () => {
    setGenerating(true)
    setMessage('')
    try {
      const response = await fetch('/api/items/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemType: selectedCategory, count: 10 }),
      })
      const data = await response.json()
      if (data.success) {
        setGeneratedItems(prev => [...prev, ...data.items])
        setMessage(`Generated ${data.items.length} ${selectedCategory} items!`)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Failed to generate items')
    } finally {
      setGenerating(false)
    }
  }

  // ============================================
  // LOCK/UNLOCK ITEMS
  // ============================================

  const handleToggleLock = (tempId: string) => {
    setGeneratedItems(prev => prev.map(item => 
      item.tempId === tempId ? { ...item, isLocked: !item.isLocked } : item
    ))
  }

  const handleLockAll = () => {
    const typeItems = generatedItems.filter(i => i.itemType === selectedCategory)
    const allLocked = typeItems.every(i => i.isLocked)
    setGeneratedItems(prev => prev.map(item => 
      item.itemType === selectedCategory ? { ...item, isLocked: !allLocked } : item
    ))
  }

  // ============================================
  // RESET ITEMS
  // ============================================

  const handleReset = () => {
    setResetting(true)
    setGeneratedItems(prev => prev.filter(item => 
      item.itemType !== selectedCategory || item.isLocked
    ))
    setMessage('Reset unsaved items!')
    setResetting(false)
  }

  // ============================================
  // SAVE ITEMS
  // ============================================

  const handleOpenPreview = () => {
    const lockedItems = generatedItems.filter(i => i.isLocked && !i.isDuplicate)
    if (lockedItems.length === 0) {
      setMessage('No locked items to save. Lock items first!')
      return
    }
    setShowPreviewModal(true)
  }

  const handleSaveAll = async () => {
    const itemsToSave = generatedItems.filter(i => i.isLocked && !i.isDuplicate)
    if (itemsToSave.length === 0) return

    setSaving(true)
    setMessage('')
    let savedCount = 0
    let errorCount = 0

    for (const item of itemsToSave) {
      try {
        const response = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        })
        const data = await response.json()
        if (data.success) {
          savedCount++
          setGeneratedItems(prev => prev.filter(i => i.tempId !== item.tempId))
          setSavedItems(prev => [...prev, { ...data.item, isSaved: true }])
        } else {
          errorCount++
        }
      } catch {
        errorCount++
      }
    }

    setMessage(`Saved ${savedCount} items${errorCount > 0 ? `, ${errorCount} failed` : ''}!`)
    setSaving(false)
    setShowPreviewModal(false)
  }

  // ============================================
  // DELETE SAVED ITEM
  // ============================================

  const handleDeleteSaved = async (id: string) => {
    if (!confirm('Delete this saved item?')) return
    try {
      const response = await fetch(`/api/items?id=${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        setSavedItems(prev => prev.filter(i => i.id !== id))
        setMessage('Item deleted!')
        if (selectedItem?.id === id) setSelectedItem(null)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch {
      setMessage('Failed to delete item')
    }
  }

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const getRarityColor = (rarity: string) => {
    return RARITY_LEVELS.find(r => r.id === rarity)?.color || '#9ca3af'
  }

  const getCurrentCategory = () => CATEGORIES.find(c => c.id === selectedCategory)

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const categoryGeneratedItems = generatedItems.filter(i => i.itemType === selectedCategory)
  const categorySavedItems = savedItems.filter(i => i.itemType === selectedCategory)
  const lockedCount = generatedItems.filter(i => i.isLocked).length
  const totalSaved = savedItems.length

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <Spinner /> <span className="ml-2">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#111] text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        activeCategory={view === 'category' ? selectedCategory : null}
        onSelectCategory={handleSelectCategory}
        onBackToDashboard={handleBackToDashboard}
      />

      {/* Main Content */}
      <div className="flex-1 ml-64 overflow-y-auto p-8">
        {/* Message Toast */}
        {message && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in">
            <div className={`px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md flex items-center gap-3 ${
              message.includes('Error') || message.includes('failed') 
                ? 'bg-red-900/80 border-red-500/50 text-red-100' 
                : 'bg-green-900/80 border-green-500/50 text-green-100'
            }`}>
              <span>{message}</span>
              <button onClick={() => setMessage('')} className="opacity-70 hover:opacity-100 font-bold ml-2">✕</button>
            </div>
          </div>
        )}

        {view === 'dashboard' ? (
          <div className="max-w-7xl mx-auto">
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#333] text-gray-400 rounded-lg hover:text-white hover:border-gray-500 transition-all mb-8 text-sm font-medium"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-white mb-2">Item Database</h1>
            <p className="text-gray-400 mb-8">Select a category to view items or generate new ones.</p>
            
            <DashboardStats 
              totalItems={savedItems.length} 
              totalCategories={CATEGORIES.length} 
            />
            
            <CategoryGrid 
              onSelectCategory={handleSelectCategory} 
              itemCounts={itemCounts}
            />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Category Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackToDashboard}
                  className="p-2 rounded-lg bg-[#1a1a1a] border border-[#333] text-gray-400 hover:text-white hover:border-gray-500 transition-all"
                >
                  ←
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getCurrentCategory()?.icon}</span>
                  <div>
                    <h1 className={`text-2xl font-bold ${getCurrentCategory()?.color}`}>
                      {getCurrentCategory()?.label}
                    </h1>
                    <p className="text-gray-400 text-sm">{getCurrentCategory()?.description}</p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {generating ? <Spinner /> : '🎲'} Generate 10
                </button>
                <button
                  onClick={handleLockAll}
                  disabled={categoryGeneratedItems.length === 0}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {categoryGeneratedItems.every(i => i.isLocked) ? '🔓 Unlock All' : '🔒 Lock All'}
                </button>
                <button
                  onClick={handleReset}
                  disabled={resetting || categoryGeneratedItems.filter(i => !i.isLocked).length === 0}
                  className="px-4 py-2 bg-red-600/50 hover:bg-red-600 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {resetting ? <Spinner /> : '🔃'} Reset
                </button>
                <button
                  onClick={handleOpenPreview}
                  disabled={saving || lockedCount === 0}
                  className="px-4 py-2 bg-[#6eb5ff] hover:bg-[#8ec5ff] text-black rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Spinner /> : '💾'} Save ({lockedCount})
                </button>
              </div>
            </div>

            {/* Generated Items */}
            {categoryGeneratedItems.length > 0 && (
              <div className="bg-[#1a1a1a] rounded-xl border border-[#333] p-6 mb-6">
                <h3 className="text-sm font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                  <span>⚡</span> Generated Items (Not Saved)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {categoryGeneratedItems.map(item => (
                    <div
                      key={item.tempId}
                      onClick={() => setSelectedItem(item)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        item.isDuplicate
                          ? 'bg-red-900/20 border-red-500/50'
                          : item.isLocked
                          ? 'bg-yellow-900/20 border-yellow-500/50'
                          : 'bg-[#2a2a2a] border-[#444] hover:border-[#666]'
                      } ${selectedItem?.tempId === item.tempId ? 'ring-2 ring-[#6eb5ff]' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <div className="font-medium text-sm flex items-center gap-2" style={{ color: getRarityColor(item.rarity) }}>
                              {item.name}
                              {item.isDuplicate && <span className="text-red-400 text-xs">⚠️ Duplicate</span>}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.rarity} • {item.sellPrice} Col
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleLock(item.tempId!) }}
                          className={`p-2 rounded-lg transition-colors ${item.isLocked ? 'text-yellow-400 bg-yellow-900/30' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                        >
                          {item.isLocked ? '🔒' : '⚪'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Items */}
            <div className="bg-[#1a1a1a] rounded-xl border border-[#333] p-6 mb-6">
              <h3 className="text-sm font-semibold text-green-400 mb-4 flex items-center gap-2">
                <span>✅</span> Saved Items ({categorySavedItems.length})
              </h3>
              {categorySavedItems.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  No saved {getCurrentCategory()?.label.toLowerCase()} yet. Generate and save some!
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {categorySavedItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all bg-[#2a2a2a] border-[#444] hover:border-[#666] ${
                        selectedItem?.id === item.id ? 'ring-2 ring-[#6eb5ff]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <div className="font-medium text-sm flex items-center gap-2" style={{ color: getRarityColor(item.rarity) }}>
                              {item.name}
                              <span className="text-green-400 text-xs">✅</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.rarity} • {item.sellPrice} Col
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteSaved(item.id!) }}
                          className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Item Detail Panel */}
            {selectedItem && (
              <ItemDetailPanel 
                item={selectedItem} 
                onClose={() => setSelectedItem(null)}
                getRarityColor={getRarityColor}
              />
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-xl border border-[#333] p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Save Preview</h2>
            <p className="text-sm text-gray-400 mb-4">
              The following {generatedItems.filter(i => i.isLocked && !i.isDuplicate).length} items will be saved:
            </p>
            <div className="space-y-2 mb-6">
              {generatedItems.filter(i => i.isLocked && !i.isDuplicate).map(item => (
                <div key={item.tempId} className="flex items-center gap-3 p-3 bg-[#2a2a2a] rounded-lg">
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium" style={{ color: getRarityColor(item.rarity) }}>{item.name}</span>
                  <span className="text-xs text-gray-500">({item.itemType})</span>
                </div>
              ))}
            </div>
            {generatedItems.filter(i => i.isLocked && i.isDuplicate).length > 0 && (
              <div className="mb-4 p-3 bg-red-900/30 rounded-lg border border-red-500/30">
                <p className="text-sm text-red-300">
                  ⚠️ {generatedItems.filter(i => i.isLocked && i.isDuplicate).length} duplicate items will be skipped.
                </p>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-[#333] hover:bg-[#444] rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="px-4 py-2 bg-[#6eb5ff] hover:bg-[#8ec5ff] text-black rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Spinner /> : null} Confirm Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
