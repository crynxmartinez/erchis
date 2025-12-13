import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import GameLayout from '@/components/game/GameLayout'
import FloorMapPins from '@/components/game/FloorMapPins'
import { FLOOR_1_LOCATIONS } from '@/data/floor1-locations'
import { calculateMaxHp, calculateHpRegen, calculateApRegen } from '@/lib/player'

interface SessionData {
  userId: string
  username: string
  role: string
}

interface MapPageProps {
  params: Promise<{ id: string }>
}

export default async function MapPage({ params }: MapPageProps) {
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

  // Get locations based on floor
  const getLocations = (floor: number) => {
    switch (floor) {
      case 1:
        return FLOOR_1_LOCATIONS
      default:
        return []
    }
  }

  const locations = getLocations(floorNumber)

  // Floor names
  const floorNames: Record<number, string> = {
    1: "Haven's Rest",
    2: 'Urbus',
    3: 'Zumfut',
    4: 'Rovia',
    5: 'Karluin',
  }

  return (
    <GameLayout playerData={playerData}>
      <div className="bg-[#242424] rounded border border-[#333] p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🗺️</span>
          <div>
            <h1 className="text-xl font-bold text-[#6eb5ff]">Floor {floorNumber} Map</h1>
            <p className="text-sm text-gray-400">{floorNames[floorNumber] || `Floor ${floorNumber}`}</p>
          </div>
        </div>

        {locations.length > 0 ? (
          <FloorMapPins floorId={floorNumber} locations={locations} />
        ) : (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-4">🗺️</span>
            <p>Map not available for this floor yet</p>
          </div>
        )}

        <div className="mt-6 p-3 bg-[#1a1a1a] rounded border border-[#333]">
          <div className="text-xs text-gray-500">
            <p className="mb-1">• Hover over map pins to see location details</p>
            <p className="mb-1">• Click on a pin to travel to that location</p>
            <p>• Explore the world to discover new areas</p>
          </div>
        </div>
      </div>
    </GameLayout>
  )
}
