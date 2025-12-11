'use client'

import { useState } from 'react'
import TopNav from './TopNav'
import Sidebar from './Sidebar'
import PlayerInfo from './PlayerInfo'
import PlayerModal from './PlayerModal'
import SkillBar from './SkillBar'

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

interface GameLayoutProps {
  children: React.ReactNode
  playerData: PlayerData
}

export default function GameLayout({ children, playerData }: GameLayoutProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Top Navigation */}
      <TopNav username={playerData.username} />

      {/* Main Layout */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-56 flex-shrink-0 bg-[#1e1e1e] border-r border-[#333]">
          <div className="sticky top-12 h-[calc(100vh-48px)] overflow-y-auto">
            {/* Player Info */}
            <PlayerInfo {...playerData} onOpenModal={() => setIsModalOpen(true)} />

            {/* Navigation */}
            <Sidebar />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 min-h-[calc(100vh-48px)] pb-20">
          {children}
        </main>
      </div>

      {/* Skill Bar */}
      <SkillBar />

      {/* Player Modal */}
      <PlayerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        playerData={playerData}
      />
    </div>
  )
}
