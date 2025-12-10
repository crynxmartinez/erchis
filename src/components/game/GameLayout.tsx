import TopNav from './TopNav'
import Sidebar from './Sidebar'
import PlayerInfo from './PlayerInfo'

interface GameLayoutProps {
  children: React.ReactNode
  username: string
  role: string
}

export default function GameLayout({ children, username }: GameLayoutProps) {
  // Placeholder player stats - will come from database later
  const playerStats = {
    username,
    money: 261915,
    level: 6,
    points: 0,
    energy: { current: 100, max: 100 },
    nerve: { current: 15, max: 15 },
    happy: { current: 150, max: 150 },
    life: { current: 225, max: 225 },
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Top Navigation */}
      <TopNav username={username} />

      {/* Main Layout */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-56 flex-shrink-0">
          <div className="sticky top-12 h-[calc(100vh-48px)] overflow-y-auto">
            {/* Player Info */}
            <div className="p-2">
              <PlayerInfo {...playerStats} />
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
