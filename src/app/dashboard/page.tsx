import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import GameLayout from '@/components/game/GameLayout'
import Announcements from '@/components/game/Announcements'

interface SessionData {
  userId: string
  username: string
  role: string
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')

  if (!sessionCookie) {
    redirect('/login')
  }

  let session: SessionData
  try {
    session = JSON.parse(sessionCookie.value)
  } catch {
    redirect('/login')
  }

  return (
    <GameLayout username={session.username} role={session.role}>
      {/* Welcome Banner */}
      <div className="bg-[#242424] rounded border border-[#333] p-4 mb-4">
        <p className="text-gray-300">
          You have logged on <span className="text-[#6eb5ff] font-medium">{session.username}</span>!
        </p>
      </div>

      {/* Announcements */}
      <Announcements />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Social Panel */}
        <div className="bg-[#242424] rounded border border-[#333]">
          <div className="bg-[#2a2a2a] px-3 py-2 border-b border-[#333]">
            <span className="text-gray-400 text-sm font-medium">Social Feed</span>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded bg-[#333] flex items-center justify-center">
                <span className="text-xl">🎮</span>
              </div>
              <div>
                <p className="text-[#6eb5ff] font-medium">ERCHIS</p>
                <p className="text-gray-500 text-xs">Official</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Welcome to Erchis! Join a faction, commit crimes, and rise to the top. 
              The city awaits...
            </p>
            <div className="flex gap-2 mt-3">
              <button className="bg-[#333] hover:bg-[#444] text-gray-300 px-3 py-1 rounded text-xs transition-colors">
                👍 Follow
              </button>
              <button className="bg-[#333] hover:bg-[#444] text-gray-300 px-3 py-1 rounded text-xs transition-colors">
                📤 Share
              </button>
            </div>
          </div>
        </div>

        {/* Ad/Promo Panel */}
        <div className="bg-[#242424] rounded border border-[#333] overflow-hidden">
          <div className="bg-gradient-to-br from-[#2a3a4a] to-[#1a2a3a] p-6 h-full flex flex-col justify-center items-center text-center">
            <p className="text-gray-400 text-lg mb-2">&quot;YOU&apos;RE MORE LIKELY TO BE</p>
            <p className="text-gray-400 text-lg mb-2">STABBED IF YOU CARRY A KNIFE&quot;</p>
            <p className="text-2xl font-bold text-white mt-4">SO CARRY A GUN...</p>
            <div className="mt-6 bg-[#333] rounded px-4 py-2">
              <span className="text-[#6eb5ff] font-medium">🔫 BIG AL&apos;S GUN SHOP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {[
          { label: 'Attacks Won', value: '0', icon: '⚔️' },
          { label: 'Crimes Done', value: '0', icon: '🔫' },
          { label: 'Networth', value: '$0', icon: '💰' },
          { label: 'Rank', value: 'Absolute beginner', icon: '📊' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#242424] rounded border border-[#333] p-3">
            <div className="flex items-center gap-2 mb-1">
              <span>{stat.icon}</span>
              <span className="text-gray-400 text-xs">{stat.label}</span>
            </div>
            <p className="text-white font-medium">{stat.value}</p>
          </div>
        ))}
      </div>
    </GameLayout>
  )
}
