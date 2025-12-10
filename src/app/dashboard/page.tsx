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
    <GameLayout username={session.username}>
      {/* Welcome Banner */}
      <div className="bg-[#242424] rounded border border-[#333] p-4 mb-4">
        <p className="text-gray-300">
          Welcome, <span className="text-[#6eb5ff] font-medium">{session.username}</span>!
        </p>
      </div>

      {/* Announcements */}
      <Announcements />
    </GameLayout>
  )
}
