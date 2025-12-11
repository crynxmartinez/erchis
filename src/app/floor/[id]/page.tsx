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
        
        {floorNumber === 1 ? (
          <div className="space-y-4">
            <div className="text-gray-300">
              <p className="mb-4">Welcome to <span className="text-[#6eb5ff]">Floor 1 - Town of Beginnings</span></p>
              <p className="text-sm text-gray-400">This is the starting floor where all adventurers begin their journey.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
              <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-4 text-center hover:border-[#6eb5ff] transition-colors cursor-pointer">
                <span className="text-2xl block mb-2">🏪</span>
                <span className="text-sm text-gray-300">General Store</span>
                <p className="text-xs text-gray-500 mt-1">Coming soon</p>
              </div>
              <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-4 text-center hover:border-[#6eb5ff] transition-colors cursor-pointer">
                <span className="text-2xl block mb-2">⚔️</span>
                <span className="text-sm text-gray-300">Weapon Master</span>
                <p className="text-xs text-gray-500 mt-1">Coming soon</p>
              </div>
              <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-4 text-center hover:border-[#6eb5ff] transition-colors cursor-pointer">
                <span className="text-2xl block mb-2">📚</span>
                <span className="text-sm text-gray-300">Skill Trainer</span>
                <p className="text-xs text-gray-500 mt-1">Coming soon</p>
              </div>
              <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-4 text-center hover:border-[#6eb5ff] transition-colors cursor-pointer">
                <span className="text-2xl block mb-2">🔨</span>
                <span className="text-sm text-gray-300">Blacksmith</span>
                <p className="text-xs text-gray-500 mt-1">Coming soon</p>
              </div>
              <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-4 text-center hover:border-[#6eb5ff] transition-colors cursor-pointer">
                <span className="text-2xl block mb-2">🧪</span>
                <span className="text-sm text-gray-300">Alchemist</span>
                <p className="text-xs text-gray-500 mt-1">Coming soon</p>
              </div>
              <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-4 text-center hover:border-[#6eb5ff] transition-colors cursor-pointer">
                <span className="text-2xl block mb-2">🚪</span>
                <span className="text-sm text-gray-300">Gate Keeper</span>
                <p className="text-xs text-gray-500 mt-1">Coming soon</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-center py-8">
            <span className="text-4xl mb-4 block">🔒</span>
            <p>Floor {floorNumber} is not yet available</p>
            <p className="text-sm text-gray-500 mt-2">Clear the boss on Floor {floorNumber - 1} to unlock</p>
          </div>
        )}
      </div>
    </GameLayout>
  )
}
