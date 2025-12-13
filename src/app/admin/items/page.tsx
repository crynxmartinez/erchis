'use client'

import { useState, useEffect } from 'react'

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

// ============================================
// CONSTANTS
// ============================================

const ITEM_TYPES = [
  { id: 'consumable', icon: '🧪', label: 'Consumable', description: 'Potions, food, scrolls' },
  { id: 'material', icon: '🪨', label: 'Material', description: 'Crafting materials' },
  { id: 'equipment', icon: '⚔️', label: 'Equipment', description: 'Weapons, armor, accessories' },
  { id: 'key_item', icon: '🔑', label: 'Key Item', description: 'Quest items, keys' },
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
// MAIN COMPONENT
// ============================================

export default function ItemDatabase() {
  // Saved items from database
  const [savedItems, setSavedItems] = useState<Item[]>([])
  // Generated items (not yet saved)
  const [generatedItems, setGeneratedItems] = useState<Item[]>([])
  
  // UI State
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedType, setSelectedType] = useState<string>('consumable')
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
        body: JSON.stringify({ itemType: selectedType, count: 10 }),
      })
      const data = await response.json()
      if (data.success) {
        setGeneratedItems(prev => [...prev, ...data.items])
        setMessage(`Generated ${data.items.length} ${selectedType} items!`)
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
    const typeItems = generatedItems.filter(i => i.itemType === selectedType)
    const allLocked = typeItems.every(i => i.isLocked)
    setGeneratedItems(prev => prev.map(item => 
      item.itemType === selectedType ? { ...item, isLocked: !allLocked } : item
    ))
  }

  // ============================================
  // RESET ITEMS
  // ============================================

  const handleReset = () => {
    setResetting(true)
    setGeneratedItems(prev => prev.filter(item => 
      item.itemType !== selectedType || item.isLocked
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

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const typeGeneratedItems = generatedItems.filter(i => i.itemType === selectedType)
  const typeSavedItems = savedItems.filter(i => i.itemType === selectedType)
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
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#6eb5ff]">Item Database</h1>
            <p className="text-gray-400 text-sm">
              {totalSaved} saved • {lockedCount} locked • {generatedItems.length} generated
            </p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('Error') || message.includes('failed') ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Type Sidebar */}
          <div className="col-span-2 bg-[#1a1a1a] rounded-lg border border-[#333] p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Item Types</h3>
            <div className="space-y-1">
              {ITEM_TYPES.map(type => {
                const genCount = generatedItems.filter(i => i.itemType === type.id).length
                const savedCount = savedItems.filter(i => i.itemType === type.id).length
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      selectedType === type.id
                        ? 'bg-[#6eb5ff]/20 border border-[#6eb5ff]'
                        : 'bg-[#2a2a2a] hover:bg-[#333] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{type.icon}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {savedCount} saved {genCount > 0 && `• ${genCount} new`}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Stats */}
            <div className="mt-6 pt-4 border-t border-[#333]">
              <div className="text-xs text-gray-500 space-y-1">
                <div>✅ Saved: {totalSaved}</div>
                <div>🔒 Locked: {lockedCount}</div>
                <div>⚪ Unsaved: {generatedItems.filter(i => !i.isLocked).length}</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-10 space-y-6">
            {/* Action Bar */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{ITEM_TYPES.find(t => t.id === selectedType)?.icon}</span>
                  <div>
                    <h2 className="text-lg font-semibold">{ITEM_TYPES.find(t => t.id === selectedType)?.label} Items</h2>
                    <p className="text-xs text-gray-500">{ITEM_TYPES.find(t => t.id === selectedType)?.description}</p>
                  </div>
                </div>
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
                    disabled={typeGeneratedItems.length === 0}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {typeGeneratedItems.every(i => i.isLocked) ? '🔓 Unlock All' : '🔒 Lock All'}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={resetting || typeGeneratedItems.filter(i => !i.isLocked).length === 0}
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
            </div>

            {/* Generated Items */}
            {typeGeneratedItems.length > 0 && (
              <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-4">
                <h3 className="text-sm font-semibold text-yellow-400 mb-3">Generated Items (Not Saved)</h3>
                <div className="grid grid-cols-2 gap-3">
                  {typeGeneratedItems.map(item => (
                    <div
                      key={item.tempId}
                      onClick={() => setSelectedItem(item)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        item.isDuplicate
                          ? 'bg-red-900/20 border-red-500/50'
                          : item.isLocked
                          ? 'bg-yellow-900/20 border-yellow-500/50'
                          : 'bg-[#2a2a2a] border-[#444] hover:border-[#666]'
                      } ${selectedItem?.tempId === item.tempId ? 'ring-2 ring-[#6eb5ff]' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{item.icon}</span>
                          <div>
                            <div className="font-medium text-sm flex items-center gap-1" style={{ color: getRarityColor(item.rarity) }}>
                              {item.name}
                              {item.isDuplicate && <span className="text-red-400 text-xs">⚠️ Duplicate</span>}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.rarity} • {item.sellPrice} Col
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleLock(item.tempId!) }}
                            className={`p-1 rounded ${item.isLocked ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-300'}`}
                          >
                            {item.isLocked ? '🔒' : '⚪'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Items */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-4">
              <h3 className="text-sm font-semibold text-green-400 mb-3">Saved Items ({typeSavedItems.length})</h3>
              {typeSavedItems.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No saved {selectedType} items yet. Generate and save some!
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {typeSavedItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors bg-[#2a2a2a] border-[#444] hover:border-[#666] ${
                        selectedItem?.id === item.id ? 'ring-2 ring-[#6eb5ff]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{item.icon}</span>
                          <div>
                            <div className="font-medium text-sm flex items-center gap-1" style={{ color: getRarityColor(item.rarity) }}>
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
                          className="p-1 rounded text-red-400 hover:text-red-300"
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
              <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-4">
                <h3 className="text-sm font-semibold text-[#6eb5ff] mb-3">Item Details: {selectedItem.name}</h3>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2">{selectedItem.itemType}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Rarity:</span>
                    <span className="ml-2" style={{ color: getRarityColor(selectedItem.rarity) }}>{selectedItem.rarity}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Buy Price:</span>
                    <span className="ml-2">{selectedItem.buyPrice} Col</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Sell Price:</span>
                    <span className="ml-2">{selectedItem.sellPrice} Col</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Max Stack:</span>
                    <span className="ml-2">{selectedItem.maxStack}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Unique:</span>
                    <span className="ml-2">{selectedItem.isUnique ? 'Yes' : 'No'}</span>
                  </div>
                  {selectedItem.useEffect && (
                    <>
                      <div>
                        <span className="text-gray-500">Effect:</span>
                        <span className="ml-2">{selectedItem.useEffect}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Effect Value:</span>
                        <span className="ml-2">{selectedItem.effectValue}</span>
                      </div>
                    </>
                  )}
                </div>
                {selectedItem.description && (
                  <div className="mt-3 text-sm text-gray-400">
                    {selectedItem.description}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Save Preview</h2>
            <p className="text-sm text-gray-400 mb-4">
              The following {generatedItems.filter(i => i.isLocked && !i.isDuplicate).length} items will be saved:
            </p>
            <div className="space-y-2 mb-6">
              {generatedItems.filter(i => i.isLocked && !i.isDuplicate).map(item => (
                <div key={item.tempId} className="flex items-center gap-2 p-2 bg-[#2a2a2a] rounded">
                  <span>{item.icon}</span>
                  <span className="font-medium" style={{ color: getRarityColor(item.rarity) }}>{item.name}</span>
                  <span className="text-xs text-gray-500">({item.itemType})</span>
                </div>
              ))}
            </div>
            {generatedItems.filter(i => i.isLocked && i.isDuplicate).length > 0 && (
              <div className="mb-4 p-3 bg-red-900/30 rounded-lg">
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
