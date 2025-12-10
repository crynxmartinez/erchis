'use client'

import { useState } from 'react'

interface PlayerModalProps {
  isOpen: boolean
  onClose: () => void
  username: string
}

type TabType = 'inventory' | 'stats'

export default function PlayerModal({ isOpen, onClose, username }: PlayerModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('inventory')

  if (!isOpen) return null

  const tabs: { id: TabType; icon: string; label: string }[] = [
    { id: 'inventory', icon: '📦', label: 'Inventory' },
    { id: 'stats', icon: '📊', label: 'Stats' },
  ]

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
          <h2 className="text-[#6eb5ff] font-medium text-lg">{username}</h2>
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
            </div>
          </div>

          {/* Right Side - Character Image */}
          <div className="w-72 bg-[#1a1a1a] flex flex-col items-center justify-center p-4">
            {/* Character Image Placeholder */}
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-48 h-80 bg-[#252525] border border-[#333] rounded-lg flex items-center justify-center mb-4">
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-xs">Character</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">{username}</p>
              <p className="text-gray-500 text-xs">Level 1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
