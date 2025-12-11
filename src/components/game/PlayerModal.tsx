'use client'

import { useState } from 'react'

interface PlayerStats {
  str: number
  agi: number
  vit: number
  int: number
  dex: number
  luk: number
}

interface Race {
  id: string
  name: string
  description: string
  passive1Name: string
  passive1Type: string
  passive1Value: number
  passive2Name: string
  passive2Type: string
  passive2Value: number
}

interface PlayerData {
  username: string
  level: number
  col: number
  life: { current: number; max: number }
  ap: { current: number; max: number }
  stats: PlayerStats
  race: Race | null
  characterImage: string | null
}

interface PlayerModalProps {
  isOpen: boolean
  onClose: () => void
  playerData: PlayerData
}

type TabType = 'inventory' | 'stats'

const STAT_INFO: Record<keyof PlayerStats, { name: string; color: string; effects: string[] }> = {
  str: { name: 'Strength', color: 'text-red-400', effects: ['+2 Physical Damage', '+1% Crit Damage'] },
  agi: { name: 'Agility', color: 'text-green-400', effects: ['+0.5% Evasion', '+0.3% Accuracy'] },
  vit: { name: 'Vitality', color: 'text-orange-400', effects: ['+10 Max HP', '+1% Heal Bonus'] },
  int: { name: 'Intelligence', color: 'text-blue-400', effects: ['+0.3% Magic Amp', '+0.5% Debuff Resist'] },
  dex: { name: 'Dexterity', color: 'text-yellow-400', effects: ['+0.3% Crit Chance', '+0.5% CDR'] },
  luk: { name: 'Luck', color: 'text-purple-400', effects: ['+0.5% Drop Rate', 'Rare Encounters'] },
}

const PASSIVE_DESCRIPTIONS: Record<string, string> = {
  expGain: 'Bonus experience points from all sources',
  cookingSuccess: 'Increased success rate when cooking food',
  magicAmp: 'Amplifies magic damage dealt',
  accuracy: 'Increases chance to hit enemies',
  npcDiscount: 'Reduced prices when buying from NPCs',
  alchemySuccess: 'Increased success rate when crafting potions',
  craftingSuccess: 'Increased success rate when crafting weapons/armor',
  weightCapacity: 'Increases maximum carry weight',
  physicalDamage: 'Bonus physical damage dealt',
  maxHp: 'Increases maximum health points',
  evasion: 'Increases chance to dodge attacks',
  critChance: 'Increases chance to land critical hits',
  dropRate: 'Increases item drop rate from enemies',
  debuffResist: 'Reduces duration of negative effects',
  critDamage: 'Increases damage dealt by critical hits',
  cdr: 'Reduces skill cooldown times',
}

export default function PlayerModal({ isOpen, onClose, playerData }: PlayerModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('stats')

  if (!isOpen) return null

  const tabs: { id: TabType; icon: string; label: string }[] = [
    { id: 'stats', icon: '📊', label: 'Stats' },
    { id: 'inventory', icon: '📦', label: 'Inventory' },
  ]

  // Calculate derived stats
  const derivedStats = {
    physicalDamage: playerData.stats.str * 2,
    critDamage: playerData.stats.str,
    evasion: (playerData.stats.agi * 0.5).toFixed(1),
    accuracy: (playerData.stats.agi * 0.3).toFixed(1),
    maxHp: 100 + playerData.stats.vit * 10,
    healBonus: playerData.stats.vit,
    magicAmp: (playerData.stats.int * 0.3).toFixed(1),
    debuffResist: (playerData.stats.int * 0.5).toFixed(1),
    critChance: (playerData.stats.dex * 0.3).toFixed(1),
    cdr: (playerData.stats.dex * 0.5).toFixed(1),
    dropRate: (playerData.stats.luk * 0.5).toFixed(1),
  }

  // Calculate weight capacity
  const weightCapacity = 50 + (playerData.stats.str * 2) + (playerData.stats.vit * 1) + (playerData.level * 2)

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#1e1e1e] border border-[#444] rounded-lg shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#2a2a2a] px-4 py-3 border-b border-[#444] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-[#6eb5ff] font-medium text-lg">{playerData.username}</h2>
            {playerData.race && (
              <span className="text-xs bg-[#333] px-2 py-0.5 rounded text-gray-300">{playerData.race.name}</span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Side - Tabs and Content */}
          <div className="flex-1 flex flex-col border-r border-[#444]">
            {/* Tabs */}
            <div className="flex border-b border-[#444]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#333] text-white border-b-2 border-[#6eb5ff]'
                      : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  {/* Base Stats */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Base Stats</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {(Object.keys(STAT_INFO) as (keyof PlayerStats)[]).map(stat => (
                        <div key={stat} className="bg-[#252525] rounded-lg p-3 border border-[#333]">
                          <div className="flex justify-between items-center mb-1">
                            <span className={`font-semibold ${STAT_INFO[stat].color}`}>
                              {STAT_INFO[stat].name}
                            </span>
                            <span className="text-xl font-bold text-white">{playerData.stats[stat]}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {STAT_INFO[stat].effects.map((effect, i) => (
                              <div key={i}>{effect} per point</div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Derived Stats */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Derived Stats</h3>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="bg-[#252525] rounded p-2 border border-[#333]">
                        <div className="text-gray-400 text-xs">Physical DMG</div>
                        <div className="text-white font-semibold">+{derivedStats.physicalDamage}</div>
                      </div>
                      <div className="bg-[#252525] rounded p-2 border border-[#333]">
                        <div className="text-gray-400 text-xs">Crit DMG</div>
                        <div className="text-white font-semibold">+{derivedStats.critDamage}%</div>
                      </div>
                      <div className="bg-[#252525] rounded p-2 border border-[#333]">
                        <div className="text-gray-400 text-xs">Crit Chance</div>
                        <div className="text-white font-semibold">+{derivedStats.critChance}%</div>
                      </div>
                      <div className="bg-[#252525] rounded p-2 border border-[#333]">
                        <div className="text-gray-400 text-xs">Evasion</div>
                        <div className="text-white font-semibold">+{derivedStats.evasion}%</div>
                      </div>
                      <div className="bg-[#252525] rounded p-2 border border-[#333]">
                        <div className="text-gray-400 text-xs">Accuracy</div>
                        <div className="text-white font-semibold">+{derivedStats.accuracy}%</div>
                      </div>
                      <div className="bg-[#252525] rounded p-2 border border-[#333]">
                        <div className="text-gray-400 text-xs">Magic Amp</div>
                        <div className="text-white font-semibold">+{derivedStats.magicAmp}%</div>
                      </div>
                      <div className="bg-[#252525] rounded p-2 border border-[#333]">
                        <div className="text-gray-400 text-xs">Heal Bonus</div>
                        <div className="text-white font-semibold">+{derivedStats.healBonus}%</div>
                      </div>
                      <div className="bg-[#252525] rounded p-2 border border-[#333]">
                        <div className="text-gray-400 text-xs">CDR</div>
                        <div className="text-white font-semibold">+{derivedStats.cdr}%</div>
                      </div>
                      <div className="bg-[#252525] rounded p-2 border border-[#333]">
                        <div className="text-gray-400 text-xs">Drop Rate</div>
                        <div className="text-white font-semibold">+{derivedStats.dropRate}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Resources */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Resources</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#252525] rounded-lg p-3 border border-[#333]">
                        <div className="text-gray-400 text-xs mb-1">Max HP</div>
                        <div className="text-red-400 font-bold text-lg">{derivedStats.maxHp}</div>
                      </div>
                      <div className="bg-[#252525] rounded-lg p-3 border border-[#333]">
                        <div className="text-gray-400 text-xs mb-1">Max AP</div>
                        <div className="text-blue-400 font-bold text-lg">{playerData.ap.max}</div>
                      </div>
                      <div className="bg-[#252525] rounded-lg p-3 border border-[#333]">
                        <div className="text-gray-400 text-xs mb-1">Weight Capacity</div>
                        <div className="text-yellow-400 font-bold text-lg">{weightCapacity}</div>
                      </div>
                      <div className="bg-[#252525] rounded-lg p-3 border border-[#333]">
                        <div className="text-gray-400 text-xs mb-1">Col</div>
                        <div className="text-green-400 font-bold text-lg">{playerData.col.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Racial Passives */}
                  {playerData.race && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Racial Passives ({playerData.race.name})</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#252525] rounded-lg p-3 border border-[#333]">
                          <div className="text-green-400 font-semibold text-sm">
                            +{playerData.race.passive1Value}% {playerData.race.passive1Name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {PASSIVE_DESCRIPTIONS[playerData.race.passive1Type]}
                          </div>
                        </div>
                        <div className="bg-[#252525] rounded-lg p-3 border border-[#333]">
                          <div className="text-green-400 font-semibold text-sm">
                            +{playerData.race.passive2Value}% {playerData.race.passive2Name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {PASSIVE_DESCRIPTIONS[playerData.race.passive2Type]}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="text-gray-400 text-center py-8">
                  <span className="text-4xl mb-4 block">📦</span>
                  <p>Inventory is empty</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Character Image */}
          <div className="w-72 bg-[#1a1a1a] flex flex-col items-center justify-center p-4">
            <div className="w-full h-full flex flex-col items-center justify-center">
              {playerData.characterImage ? (
                <img 
                  src={playerData.characterImage} 
                  alt={playerData.username}
                  className="w-48 h-80 object-cover rounded-lg border border-[#333] mb-4"
                />
              ) : (
                <div className="w-48 h-80 bg-[#252525] border border-[#333] rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-xs">No Image</p>
                  </div>
                </div>
              )}
              <p className="text-gray-300 font-medium">{playerData.username}</p>
              <p className="text-[#6eb5ff] text-sm">Level {playerData.level}</p>
              {playerData.race && (
                <p className="text-gray-500 text-xs">{playerData.race.name}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
