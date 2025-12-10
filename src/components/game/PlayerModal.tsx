'use client'

import { useState } from 'react'

interface PlayerModalProps {
  isOpen: boolean
  onClose: () => void
  username: string
}

type TabType = 'inventory' | 'stats' | 'guild'

export default function PlayerModal({ isOpen, onClose, username }: PlayerModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('inventory')

  if (!isOpen) return null

  const tabs: { id: TabType; icon: string; label: string }[] = [
    { id: 'inventory', icon: '📦', label: 'Inventory' },
    { id: 'stats', icon: '📊', label: 'Stats' },
    { id: 'guild', icon: '⚔️', label: 'Guild' },
  ]

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#1e1e1e] border border-[#444] rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#2a2a2a] px-4 py-3 border-b border-[#444] flex items-center justify-between">
          <h2 className="text-[#6eb5ff] font-medium">{username}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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

        {/* Content */}
        <div className="p-4 min-h-[300px] overflow-y-auto">
          {activeTab === 'inventory' && (
            <div className="text-gray-400 text-center py-8">
              <span className="text-4xl mb-4 block">📦</span>
              <p>Inventory is empty</p>
            </div>
          )}
          
          {activeTab === 'stats' && (
            <div className="text-gray-400 text-center py-8">
              <span className="text-4xl mb-4 block">📊</span>
              <p>Stats coming soon</p>
            </div>
          )}
          
          {activeTab === 'guild' && (
            <div className="text-gray-400 text-center py-8">
              <span className="text-4xl mb-4 block">⚔️</span>
              <p>Not in a guild</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
