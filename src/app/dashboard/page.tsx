import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                ERCHIS
              </h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300">Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white font-medium">{session.username}</p>
                <p className="text-xs text-gray-400 capitalize">{session.role}</p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Welcome Back</h3>
            <p className="text-2xl font-bold text-white">{session.username}</p>
            <p className="text-green-400 text-sm mt-2">Online</p>
          </div>

          {/* Placeholder Cards */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Money</h3>
            <p className="text-2xl font-bold text-white">$0</p>
            <p className="text-gray-500 text-sm mt-2">Starting balance</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Level</h3>
            <p className="text-2xl font-bold text-white">1</p>
            <p className="text-gray-500 text-sm mt-2">0 / 100 XP</p>
          </div>
        </div>

        <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Game Menu</h2>
          <p className="text-gray-400">Game features coming soon...</p>
        </div>
      </main>
    </div>
  )
}
