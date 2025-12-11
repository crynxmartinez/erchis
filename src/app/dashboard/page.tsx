import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import GameLayout from '@/components/game/GameLayout'
import Announcements from '@/components/game/Announcements'
import prisma from '@/lib/prisma'
import { calculateMaxHp, calculateHpRegen, calculateApRegen } from '@/lib/player'

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

  // Fetch player data with race
  const player = await prisma.player.findUnique({
    where: { userId: session.userId },
    include: { race: true },
  })

  if (!player) {
    redirect('/login')
  }

  // Redirect to character creation if no race selected
  if (!player.raceId) {
    redirect('/create-character')
  }

  // Calculate regen
  const maxHp = calculateMaxHp(player.vit)
  const { newHp, newLastRegen: newHpRegen } = calculateHpRegen(player.lastHpRegen, player.currentHp, maxHp)
  const { newAp, newLastRegen: newApRegen } = calculateApRegen(player.lastApRegen, player.currentAp, player.maxAp)

  // Update player if regen occurred
  if (newHp !== player.currentHp || newAp !== player.currentAp) {
    await prisma.player.update({
      where: { id: player.id },
      data: {
        currentHp: newHp,
        currentAp: newAp,
        lastHpRegen: newHpRegen,
        lastApRegen: newApRegen,
      },
    })
  }

  const playerData = {
    username: session.username,
    level: player.level,
    col: player.col,
    life: { current: newHp, max: maxHp },
    ap: { current: newAp, max: player.maxAp },
    stats: {
      str: player.str,
      agi: player.agi,
      vit: player.vit,
      int: player.int,
      dex: player.dex,
      luk: player.luk,
    },
    race: player.race,
    characterImage: player.characterImage,
  }

  return (
    <GameLayout playerData={playerData}>
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
