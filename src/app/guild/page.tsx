import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import GameLayout from '@/components/game/GameLayout'
import prisma from '@/lib/prisma'
import { calculateMaxHp, calculateHpRegen, calculateApRegen } from '@/lib/player'

interface SessionData {
  userId: string
  username: string
  role: string
}

export default async function GuildPage() {
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

  const player = await prisma.player.findUnique({
    where: { userId: session.userId },
    include: { race: true },
  })

  if (!player) {
    redirect('/login')
  }

  if (!player.raceId) {
    redirect('/create-character')
  }

  const maxHp = calculateMaxHp(player.vit)
  const { newHp } = calculateHpRegen(player.lastHpRegen, player.currentHp, maxHp)
  const { newAp } = calculateApRegen(player.lastApRegen, player.currentAp, player.maxAp)

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
      <div className="bg-[#242424] rounded border border-[#333] p-6">
        <h1 className="text-xl font-bold text-[#6eb5ff] mb-4">Guild</h1>
        <div className="text-gray-400 text-center py-8">
          <span className="text-4xl mb-4 block">⚔️</span>
          <p>You are not in a guild</p>
          <p className="text-sm text-gray-500 mt-2">Guild system coming soon</p>
        </div>
      </div>
    </GameLayout>
  )
}
