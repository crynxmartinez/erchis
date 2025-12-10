'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg border border-red-600/50 transition-colors text-sm font-medium"
    >
      Logout
    </button>
  )
}
