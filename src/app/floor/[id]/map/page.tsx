import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import GameLayout from '@/components/game/GameLayout'
import MapWithCombat from '@/components/game/MapWithCombat'
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
      <MapWithCombat 
        floorId={floorNumber} 
        locations={locations} 
        currentAp={newAp}
      />
    </GameLayout>
  )
}
