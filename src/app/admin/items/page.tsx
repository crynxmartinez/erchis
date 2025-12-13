'use client'

import { useState, useEffect } from 'react'
import { ITEM_TYPES, RARITY_LEVELS, USE_EFFECTS } from '@/data/items-data'

interface Item {
  id: string
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
}

const emptyItem: Omit<Item, 'id'> = {
  name: '',
  description: '',
  icon: '📦',
  itemType: 'material',
  useEffect: null,
  effectValue: 0,
  equipSlot: null,
  statBonuses: {},
  buyPrice: 0,
  sellPrice: 0,
  maxStack: 99,
  isUnique: false,
  rarity: 'common',
}

export default function ItemDatabase() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [editForm, setEditForm] = useState<Omit<Item, 'id'> & { id?: string }>(emptyItem)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterRarity, setFilterRarity] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items')
      const data = await response.json()
      if (data.success) setItems(data.items)
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSeedItems = async () => {
    setSeeding(true)
    setMessage('')
    try {
      const response = await fetch('/api/items/seed', { method: 'POST' })
      const data = await response.json()
      setMessage(data.success ? data.message : `Error: ${data.error}`)
      if (data.success) fetchItems()
    } catch (error) {
      setMessage('Failed to seed items')
    } finally {
      setSeeding(false)
    }
  }

  const handleSelectItem = (item: Item) => {
    setSelectedItem(item)
    setEditForm(item)
  }

  const handleNewItem = () => {
    setSelectedItem(null)
    setEditForm(emptyItem)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const method = editForm.id ? 'PUT' : 'POST'
      const response = await fetch('/api/items', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await response.json()
      if (data.success) {
        setMessage(editForm.id ? 'Item updated!' : 'Item created!')
        fetchItems()
        if (data.item) {
          setSelectedItem(data.item)
          setEditForm(data.item)
        }
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Failed to save item')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem || !confirm(`Delete "${selectedItem.name}"?`)) return
    try {
      const response = await fetch(`/api/items?id=${selectedItem.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        setMessage('Item deleted!')
        setSelectedItem(null)
        setEditForm(emptyItem)
        fetchItems()
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Failed to delete item')
    }
  }

  const getRarityColor = (rarity: string) => {
    return RARITY_LEVELS.find(r => r.id === rarity)?.color || '#9ca3af'
  }

  const filteredItems = items.filter(item => {
    const matchesType = filterType === 'all' || item.itemType === filterType
    const matchesRarity = filterRarity === 'all' || item.rarity === filterRarity
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesRarity && matchesSearch
  })

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.itemType]) acc[item.itemType] = []
    acc[item.itemType].push(item)
    return acc
  }, {} as Record<string, Item[]>)

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#6eb5ff]">Item Database</h1>
            <p className="text-gray-400 text-sm">{items.length} items in database</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSeedItems} disabled={seeding}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium disabled:opacity-50">
              {seeding ? 'Seeding...' : '🌱 Seed Items'}
            </button>
            <button onClick={handleNewItem}
              className="px-4 py-2 bg-[#6eb5ff] hover:bg-[#8ec5ff] text-black rounded-lg text-sm font-medium">
              + New Item
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Item List */}
          <div className="col-span-4 bg-[#1a1a1a] rounded-lg border border-[#333] p-4">
            <div className="mb-4 space-y-3">
              <input type="text" placeholder="Search items..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-sm" />
              
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded text-xs font-medium ${filterType === 'all' ? 'bg-[#6eb5ff] text-black' : 'bg-[#333] text-gray-300'}`}>
                  All Types
                </button>
                {ITEM_TYPES.map(type => (
                  <button key={type.id} onClick={() => setFilterType(type.id)}
                    className={`px-3 py-1 rounded text-xs font-medium ${filterType === type.id ? 'bg-[#6eb5ff] text-black' : 'bg-[#333] text-gray-300'}`}>
                    {type.icon} {type.name}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilterRarity('all')}
                  className={`px-3 py-1 rounded text-xs font-medium ${filterRarity === 'all' ? 'bg-[#6eb5ff] text-black' : 'bg-[#333] text-gray-300'}`}>
                  All Rarities
                </button>
                {RARITY_LEVELS.map(rarity => (
                  <button key={rarity.id} onClick={() => setFilterRarity(rarity.id)}
                    style={{ borderColor: rarity.color }}
                    className={`px-3 py-1 rounded text-xs font-medium border ${filterRarity === rarity.id ? 'bg-[#6eb5ff] text-black' : 'bg-[#333] text-gray-300'}`}>
                    {rarity.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {Object.entries(groupedItems).map(([type, typeItems]) => (
                <div key={type}>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1 mt-3">
                    {ITEM_TYPES.find(t => t.id === type)?.name || type}
                  </div>
                  {typeItems.map(item => (
                    <button key={item.id} onClick={() => handleSelectItem(item)}
                      className={`w-full text-left p-2 rounded-lg flex items-center gap-2 transition-colors ${
                        selectedItem?.id === item.id ? 'bg-[#6eb5ff]/20 border border-[#6eb5ff]' : 'bg-[#2a2a2a] hover:bg-[#333] border border-transparent'
                      }`}>
                      <span className="text-xl">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate" style={{ color: getRarityColor(item.rarity) }}>{item.name}</div>
                        <div className="text-xs text-gray-500">
                          {item.sellPrice > 0 ? `${item.sellPrice} Col` : 'No sell value'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div className="text-center text-gray-500 py-8">No items found. Click "Seed Items" to add starter items.</div>
              )}
            </div>
          </div>

          {/* Item Editor */}
          <div className="col-span-8 bg-[#1a1a1a] rounded-lg border border-[#333] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">{editForm.id ? `Edit: ${editForm.name}` : 'New Item'}</h2>
              {editForm.id && (
                <button onClick={handleDelete} className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded text-sm">Delete</button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#6eb5ff] border-b border-[#333] pb-1">Basic Info</h3>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Icon</label>
                    <input type="text" value={editForm.icon} onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded text-center text-2xl" />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs text-gray-400 mb-1">Name</label>
                    <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Description</label>
                  <textarea value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded h-16 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Item Type</label>
                    <select value={editForm.itemType} onChange={(e) => setEditForm({ ...editForm, itemType: e.target.value })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded">
                      {ITEM_TYPES.map(type => <option key={type.id} value={type.id}>{type.icon} {type.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Rarity</label>
                    <select value={editForm.rarity} onChange={(e) => setEditForm({ ...editForm, rarity: e.target.value })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded">
                      {RARITY_LEVELS.map(rarity => <option key={rarity.id} value={rarity.id}>{rarity.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Economy & Stacking */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-yellow-400 border-b border-[#333] pb-1">Economy & Stacking</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Buy Price</label>
                    <input type="number" value={editForm.buyPrice} onChange={(e) => setEditForm({ ...editForm, buyPrice: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Sell Price</label>
                    <input type="number" value={editForm.sellPrice} onChange={(e) => setEditForm({ ...editForm, sellPrice: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Max Stack</label>
                    <input type="number" value={editForm.maxStack} onChange={(e) => setEditForm({ ...editForm, maxStack: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 text-sm text-gray-400">
                      <input type="checkbox" checked={editForm.isUnique} onChange={(e) => setEditForm({ ...editForm, isUnique: e.target.checked })} />
                      Unique Item
                    </label>
                  </div>
                </div>
              </div>

              {/* Consumable Effect */}
              {editForm.itemType === 'consumable' && (
                <div className="col-span-2 space-y-4">
                  <h3 className="text-sm font-semibold text-green-400 border-b border-[#333] pb-1">Consumable Effect</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Use Effect</label>
                      <select value={editForm.useEffect || ''} onChange={(e) => setEditForm({ ...editForm, useEffect: e.target.value || null })}
                        className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded">
                        <option value="">None</option>
                        {USE_EFFECTS.map(effect => <option key={effect.id} value={effect.id}>{effect.icon} {effect.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Effect Value</label>
                      <input type="number" value={editForm.effectValue} onChange={(e) => setEditForm({ ...editForm, effectValue: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button onClick={handleSave} disabled={saving || !editForm.name}
                className="px-6 py-2 bg-[#6eb5ff] hover:bg-[#8ec5ff] text-black rounded-lg font-medium disabled:opacity-50">
                {saving ? 'Saving...' : (editForm.id ? 'Update Item' : 'Create Item')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
