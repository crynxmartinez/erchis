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

interface FloorPageProps {
  params: Promise<{ id: string }>
}

export default async function FloorPage({ params }: FloorPageProps) {
  const { id } = await params
  const floorNumber = parseInt(id, 10)

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
        <h1 className="text-xl font-bold text-[#6eb5ff] mb-4">Floor {floorNumber}</h1>
        
        <div className="text-gray-300">
          <p className="mb-2">You are on <span className="text-[#6eb5ff]">Floor {floorNumber}</span></p>
          {floorNumber === 1 && (
            <p className="text-sm text-gray-400">Haven's Rest - The starting floor where all adventurers begin their journey.</p>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>Use the Floor dropdown in the sidebar to navigate between unlocked floors.</p>
        </div>
      </div>
    </GameLayout>
  )
}
