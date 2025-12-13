'use client'

import { useState, useEffect } from 'react'

interface MonsterSkill {
  id: string
  name: string
  icon: string
  baseDamage: number
  accuracy: number
  speed: number
}

interface SkillAssignment {
  id: string
  monsterSkillId: string
  monsterSkill: MonsterSkill
  damageOverride: number | null
  accuracyOverride: number | null
  speedOverride: number | null
  priority: number
}

interface Item {
  id: string
  name: string
  icon: string
  rarity: string
}

interface LootDrop {
  id: string
  itemId: string
  item: Item
  dropChance: number
  minQuantity: number
  maxQuantity: number
}

interface Monster {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  maxHp: number
  attack: number
  magicAttack: number
  defense: number
  magicDefense: number
  accuracy: number
  evasion: number
  xpReward: number
  colReward: number
  skills: SkillAssignment[]
  lootDrops: LootDrop[]
}

const emptyMonster: Omit<Monster, 'id' | 'skills' | 'lootDrops'> = {
  name: '',
  description: '',
  imageUrl: '',
  maxHp: 100,
  attack: 10,
  magicAttack: 0,
  defense: 5,
  magicDefense: 0,
  accuracy: 70,
  evasion: 10,
  xpReward: 10,
  colReward: 5,
}

export default function MonsterDatabase() {
  const [monsters, setMonsters] = useState<Monster[]>([])
  const [allSkills, setAllSkills] = useState<MonsterSkill[]>([])
  const [allItems, setAllItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null)
  const [editForm, setEditForm] = useState<Omit<Monster, 'id' | 'skills' | 'lootDrops'> & { id?: string }>(emptyMonster)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'stats' | 'skills' | 'loot'>('stats')

  // Skill assignment form
  const [selectedSkillId, setSelectedSkillId] = useState('')
  // Loot assignment form
  const [selectedItemId, setSelectedItemId] = useState('')
  const [dropChance, setDropChance] = useState(0.1)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [monstersRes, skillsRes, itemsRes] = await Promise.all([
        fetch('/api/monsters'),
        fetch('/api/monster-skills'),
        fetch('/api/items'),
      ])
      const [monstersData, skillsData, itemsData] = await Promise.all([
        monstersRes.json(),
        skillsRes.json(),
        itemsRes.json(),
      ])
      if (monstersData.success) setMonsters(monstersData.monsters)
      if (skillsData.success) setAllSkills(skillsData.skills)
      if (itemsData.success) setAllItems(itemsData.items)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectMonster = (monster: Monster) => {
    setSelectedMonster(monster)
    setEditForm({
      id: monster.id,
      name: monster.name,
      description: monster.description,
      imageUrl: monster.imageUrl,
      maxHp: monster.maxHp,
      attack: monster.attack,
      magicAttack: monster.magicAttack,
      defense: monster.defense,
      magicDefense: monster.magicDefense,
      accuracy: monster.accuracy,
      evasion: monster.evasion,
      xpReward: monster.xpReward,
      colReward: monster.colReward,
    })
    setActiveTab('stats')
  }

  const handleNewMonster = () => {
    setSelectedMonster(null)
    setEditForm(emptyMonster)
    setActiveTab('stats')
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const method = editForm.id ? 'PUT' : 'POST'
      const response = await fetch('/api/monsters', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await response.json()
      if (data.success) {
        setMessage(editForm.id ? 'Monster updated!' : 'Monster created!')
        fetchAll()
        if (data.monster) {
          setSelectedMonster(data.monster)
          setEditForm({ ...editForm, id: data.monster.id })
        }
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Failed to save monster')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedMonster || !confirm(`Delete "${selectedMonster.name}"?`)) return
    try {
      const response = await fetch(`/api/monsters?id=${selectedMonster.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        setMessage('Monster deleted!')
        setSelectedMonster(null)
        setEditForm(emptyMonster)
        fetchAll()
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Failed to delete monster')
    }
  }

  const handleAddSkill = async () => {
    if (!selectedMonster || !selectedSkillId) return
    try {
      const response = await fetch('/api/monsters/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monsterId: selectedMonster.id,
          monsterSkillId: selectedSkillId,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setMessage('Skill added!')
        setSelectedSkillId('')
        fetchAll()
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Failed to add skill')
    }
  }

  const handleRemoveSkill = async (assignmentId: string) => {
    try {
      const response = await fetch(`/api/monsters/skills?id=${assignmentId}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        setMessage('Skill removed!')
        fetchAll()
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Failed to remove skill')
    }
  }

  const handleAddLoot = async () => {
    if (!selectedMonster || !selectedItemId) return
    try {
      const response = await fetch('/api/monsters/loot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monsterId: selectedMonster.id,
          itemId: selectedItemId,
          dropChance: dropChance,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setMessage('Loot added!')
        setSelectedItemId('')
        setDropChance(0.1)
        fetchAll()
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Failed to add loot')
    }
  }

  const handleRemoveLoot = async (lootId: string) => {
    try {
      const response = await fetch(`/api/monsters/loot?id=${lootId}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        setMessage('Loot removed!')
        fetchAll()
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Failed to remove loot')
    }
  }

  // Update selectedMonster when monsters list changes
  useEffect(() => {
    if (selectedMonster) {
      const updated = monsters.find(m => m.id === selectedMonster.id)
      if (updated) setSelectedMonster(updated)
    }
  }, [monsters, selectedMonster])

  const filteredMonsters = monsters.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#6eb5ff]">Monster Database</h1>
            <p className="text-gray-400 text-sm">{monsters.length} monsters • {allSkills.length} skills • {allItems.length} items</p>
          </div>
          <button onClick={handleNewMonster}
            className="px-4 py-2 bg-[#6eb5ff] hover:bg-[#8ec5ff] text-black rounded-lg text-sm font-medium">
            + New Monster
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Monster List */}
          <div className="col-span-3 bg-[#1a1a1a] rounded-lg border border-[#333] p-4">
            <input type="text" placeholder="Search monsters..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-sm mb-4" />

            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {filteredMonsters.map(monster => (
                <button key={monster.id} onClick={() => handleSelectMonster(monster)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedMonster?.id === monster.id ? 'bg-[#6eb5ff]/20 border border-[#6eb5ff]' : 'bg-[#2a2a2a] hover:bg-[#333] border border-transparent'
                  }`}>
                  <div className="font-medium">{monster.name}</div>
                  <div className="text-xs text-gray-500">
                    HP: {monster.maxHp} • ATK: {monster.attack} • {monster.skills.length} skills
                  </div>
                </button>
              ))}
              {filteredMonsters.length === 0 && (
                <div className="text-center text-gray-500 py-8">No monsters found.</div>
              )}
            </div>
          </div>

          {/* Monster Editor */}
          <div className="col-span-9 bg-[#1a1a1a] rounded-lg border border-[#333] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editForm.id ? `Edit: ${editForm.name}` : 'New Monster'}</h2>
              {editForm.id && (
                <button onClick={handleDelete} className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded text-sm">Delete</button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-[#333] pb-2">
              <button onClick={() => setActiveTab('stats')}
                className={`px-4 py-2 rounded-t text-sm font-medium ${activeTab === 'stats' ? 'bg-[#6eb5ff] text-black' : 'text-gray-400 hover:text-white'}`}>
                Stats
              </button>
              <button onClick={() => setActiveTab('skills')} disabled={!editForm.id}
                className={`px-4 py-2 rounded-t text-sm font-medium ${activeTab === 'skills' ? 'bg-[#6eb5ff] text-black' : 'text-gray-400 hover:text-white'} disabled:opacity-50`}>
                Skills ({selectedMonster?.skills.length || 0})
              </button>
              <button onClick={() => setActiveTab('loot')} disabled={!editForm.id}
                className={`px-4 py-2 rounded-t text-sm font-medium ${activeTab === 'loot' ? 'bg-[#6eb5ff] text-black' : 'text-gray-400 hover:text-white'} disabled:opacity-50`}>
                Loot ({selectedMonster?.lootDrops.length || 0})
              </button>
            </div>

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-[#6eb5ff] border-b border-[#333] pb-1">Basic Info</h3>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Name</label>
                    <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Description</label>
                    <textarea value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded h-20 resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Image URL</label>
                    <input type="text" value={editForm.imageUrl || ''} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-red-400 border-b border-[#333] pb-1">Combat Stats</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Max HP</label>
                      <input type="number" value={editForm.maxHp} onChange={(e) => setEditForm({ ...editForm, maxHp: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Attack</label>
                      <input type="number" value={editForm.attack} onChange={(e) => setEditForm({ ...editForm, attack: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Magic Attack</label>
                      <input type="number" value={editForm.magicAttack} onChange={(e) => setEditForm({ ...editForm, magicAttack: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Defense</label>
                      <input type="number" value={editForm.defense} onChange={(e) => setEditForm({ ...editForm, defense: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Magic Defense</label>
                      <input type="number" value={editForm.magicDefense} onChange={(e) => setEditForm({ ...editForm, magicDefense: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Accuracy</label>
                      <input type="number" value={editForm.accuracy} onChange={(e) => setEditForm({ ...editForm, accuracy: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Evasion</label>
                      <input type="number" value={editForm.evasion} onChange={(e) => setEditForm({ ...editForm, evasion: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-yellow-400 border-b border-[#333] pb-1 mt-4">Rewards</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">XP Reward</label>
                      <input type="number" value={editForm.xpReward} onChange={(e) => setEditForm({ ...editForm, xpReward: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Col Reward</label>
                      <input type="number" value={editForm.colReward} onChange={(e) => setEditForm({ ...editForm, colReward: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                    </div>
                  </div>
                </div>

                <div className="col-span-2 flex justify-end">
                  <button onClick={handleSave} disabled={saving || !editForm.name}
                    className="px-6 py-2 bg-[#6eb5ff] hover:bg-[#8ec5ff] text-black rounded-lg font-medium disabled:opacity-50">
                    {saving ? 'Saving...' : (editForm.id ? 'Update Monster' : 'Create Monster')}
                  </button>
                </div>
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && selectedMonster && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <select value={selectedSkillId} onChange={(e) => setSelectedSkillId(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded">
                    <option value="">Select a skill to add...</option>
                    {allSkills
                      .filter(s => !selectedMonster.skills.some(sa => sa.monsterSkillId === s.id))
                      .map(skill => (
                        <option key={skill.id} value={skill.id}>{skill.icon} {skill.name} (DMG: {skill.baseDamage})</option>
                      ))}
                  </select>
                  <button onClick={handleAddSkill} disabled={!selectedSkillId}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium disabled:opacity-50">
                    Add Skill
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedMonster.skills.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No skills assigned. Add skills above.</div>
                  ) : (
                    selectedMonster.skills.map(sa => (
                      <div key={sa.id} className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{sa.monsterSkill.icon}</span>
                          <div>
                            <div className="font-medium">{sa.monsterSkill.name}</div>
                            <div className="text-xs text-gray-500">
                              DMG: {sa.damageOverride ?? sa.monsterSkill.baseDamage} • 
                              ACC: {sa.accuracyOverride ?? sa.monsterSkill.accuracy}% • 
                              SPD: {sa.speedOverride ?? sa.monsterSkill.speed}
                            </div>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveSkill(sa.id)}
                          className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded text-sm">
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Loot Tab */}
            {activeTab === 'loot' && selectedMonster && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <select value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded">
                    <option value="">Select an item to add...</option>
                    {allItems
                      .filter(i => !selectedMonster.lootDrops.some(ld => ld.itemId === i.id))
                      .map(item => (
                        <option key={item.id} value={item.id}>{item.icon} {item.name}</option>
                      ))}
                  </select>
                  <input type="number" value={dropChance} onChange={(e) => setDropChance(parseFloat(e.target.value) || 0)}
                    step="0.01" min="0" max="1" placeholder="Drop %"
                    className="w-24 px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded" />
                  <button onClick={handleAddLoot} disabled={!selectedItemId}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium disabled:opacity-50">
                    Add Loot
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedMonster.lootDrops.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No loot assigned. Add items above.</div>
                  ) : (
                    selectedMonster.lootDrops.map(ld => (
                      <div key={ld.id} className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{ld.item.icon}</span>
                          <div>
                            <div className="font-medium">{ld.item.name}</div>
                            <div className="text-xs text-gray-500">
                              Drop: {(ld.dropChance * 100).toFixed(1)}% • Qty: {ld.minQuantity}-{ld.maxQuantity}
                            </div>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveLoot(ld.id)}
                          className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded text-sm">
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
