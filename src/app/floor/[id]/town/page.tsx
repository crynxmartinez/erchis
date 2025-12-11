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

interface TownPageProps {
  params: Promise<{ id: string }>
}

export default async function TownPage({ params }: TownPageProps) {
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

  // Town name based on floor
  const townNames: Record<number, string> = {
    1: 'Town of Beginnings',
    2: 'Urbus',
    3: 'Zumfut',
    4: 'Rovia',
    5: 'Karluin',
  }

  const townName = townNames[floorNumber] || `Floor ${floorNumber} Town`

  return (
    <GameLayout playerData={playerData}>
      <div className="bg-[#242424] rounded border border-[#333] p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🏘️</span>
          <div>
            <h1 className="text-xl font-bold text-[#6eb5ff]">{townName}</h1>
            <p className="text-sm text-gray-400">Floor {floorNumber} - Safe Zone</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
          <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-4 text-center hover:border-[#6eb5ff] transition-colors cursor-pointer">
            <span className="text-2xl block mb-2">🏪</span>
            <span className="text-sm text-gray-300">General Store</span>
            <p className="text-xs text-gray-500 mt-1">Buy & sell items</p>
          </div>
          <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-4 text-center hover:border-[#6eb5ff] transition-colors cursor-pointer">
            <span className="text-2xl block mb-2">⚔️</span>
            <span className="text-sm text-gray-300">Weapon Master</span>
            <p className="text-xs text-gray-500 mt-1">Get basic weapons</p>
          </div>
          <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-4 text-center hover:border-[#6eb5ff] transition-colors cursor-pointer">
            <span className="text-2xl block mb-2">📚</span>
            <span className="text-sm text-gray-300">Skill Trainer</span>
            <p className="text-xs text-gray-500 mt-1">Learn new skills</p>
          </div>
          <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-4 text-center hover:border-[#6eb5ff] transition-colors cursor-pointer">
            <span className="text-2xl block mb-2">🔨</span>
            <span className="text-sm text-gray-300">Blacksmith</span>
            <p className="text-xs text-gray-500 mt-1">Repair & upgrade</p>
          </div>
          <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-4 text-center hover:border-[#6eb5ff] transition-colors cursor-pointer">
            <span className="text-2xl block mb-2">🧪</span>
            <span className="text-sm text-gray-300">Alchemist</span>
            <p className="text-xs text-gray-500 mt-1">Potions & crafting</p>
          </div>
          <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-4 text-center hover:border-[#6eb5ff] transition-colors cursor-pointer">
            <span className="text-2xl block mb-2">🚪</span>
            <span className="text-sm text-gray-300">Gate Keeper</span>
            <p className="text-xs text-gray-500 mt-1">Exit to fields</p>
          </div>
        </div>

        <div className="mt-6 p-3 bg-[#1a1a1a] rounded border border-[#333]">
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <span>✓</span>
            <span>Safe Zone - You can change skills and repair equipment here</span>
          </div>
        </div>
      </div>
    </GameLayout>
  )
}
