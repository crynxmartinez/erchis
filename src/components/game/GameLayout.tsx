import TopNav from './TopNav'
import Sidebar from './Sidebar'
import PlayerInfo from './PlayerInfo'

interface PlayerData {
  username: string
  level: number
  col: number
  life: { current: number; max: number }
  ap: { current: number; max: number }
}

interface GameLayoutProps {
  children: React.ReactNode
  playerData: PlayerData
}

export default function GameLayout({ children, playerData }: GameLayoutProps) {

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Top Navigation */}
      <TopNav username={playerData.username} />

      {/* Main Layout */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-56 flex-shrink-0">
          <div className="sticky top-12 h-[calc(100vh-48px)] overflow-y-auto">
            {/* Player Info */}
            <div className="p-2">
              <PlayerInfo {...playerData} />
            </div>

            {/* Navigation */}
            <Sidebar />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 min-h-[calc(100vh-48px)]">
          {children}
        </main>
      </div>
    </div>
  )
}
