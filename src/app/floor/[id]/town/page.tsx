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

  // Town data based on floor
  const townData: Record<number, { name: string; buildings: { icon: string; name: string; npc: string; desc: string; href: string }[] }> = {
    1: {
      name: 'Town of Beginnings',
      buildings: [
        { icon: '🏪', name: "Romolo's Provisions", npc: 'Romolo', desc: 'Buy & sell items', href: `/floor/1/town/shop` },
        { icon: '⚔️', name: 'Steel & Edge Armory', npc: 'Diavel', desc: 'Get basic weapons', href: `/floor/1/town/armory` },
        { icon: '📚', name: 'Arcane Archives', npc: 'Argo', desc: 'Learn new skills', href: `/floor/1/town/skills` },
        { icon: '🔨', name: 'The Iron Forge', npc: 'Lisbeth', desc: 'Repair & upgrade', href: `/floor/1/town/forge` },
        { icon: '🧪', name: 'Mystic Brews', npc: 'Agatha', desc: 'Potions & crafting', href: `/floor/1/town/alchemy` },
        { icon: '📜', name: "Adventurer's Hall", npc: 'Klein', desc: 'Quests & requests', href: `/floor/1/town/quests` },
        { icon: '🚪', name: 'The Eastern Gate', npc: 'Heathcliff', desc: 'Exit to fields', href: `/floor/1/town/gate` },
      ],
    },
    2: {
      name: 'Urbus',
      buildings: [
        { icon: '🏪', name: "Merchant's Row", npc: 'Tomas', desc: 'Buy & sell items', href: `/floor/2/town/shop` },
        { icon: '⚔️', name: 'Blade & Shield', npc: 'Godfree', desc: 'Get basic weapons', href: `/floor/2/town/armory` },
        { icon: '📚', name: 'Hall of Arts', npc: 'Silica', desc: 'Learn new skills', href: `/floor/2/town/skills` },
        { icon: '🔨', name: 'Anvil Works', npc: 'Grimlock', desc: 'Repair & upgrade', href: `/floor/2/town/forge` },
        { icon: '🧪', name: 'Herb & Remedy', npc: 'Sasha', desc: 'Potions & crafting', href: `/floor/2/town/alchemy` },
        { icon: '📜', name: 'Guild Hall', npc: 'Thinker', desc: 'Quests & requests', href: `/floor/2/town/quests` },
        { icon: '🚪', name: 'Northern Gate', npc: 'Corvatz', desc: 'Exit to fields', href: `/floor/2/town/gate` },
      ],
    },
  }

  const currentTown = townData[floorNumber] || {
    name: `Floor ${floorNumber} Town`,
    buildings: [
      { icon: '🏪', name: 'General Store', npc: 'Merchant', desc: 'Buy & sell items', href: `/floor/${floorNumber}/town/shop` },
      { icon: '⚔️', name: 'Armory', npc: 'Armorer', desc: 'Get basic weapons', href: `/floor/${floorNumber}/town/armory` },
      { icon: '📚', name: 'Skill Hall', npc: 'Trainer', desc: 'Learn new skills', href: `/floor/${floorNumber}/town/skills` },
      { icon: '🔨', name: 'Blacksmith', npc: 'Smith', desc: 'Repair & upgrade', href: `/floor/${floorNumber}/town/forge` },
      { icon: '🧪', name: 'Apothecary', npc: 'Alchemist', desc: 'Potions & crafting', href: `/floor/${floorNumber}/town/alchemy` },
      { icon: '📜', name: 'Quest Hall', npc: 'Receptionist', desc: 'Quests & requests', href: `/floor/${floorNumber}/town/quests` },
      { icon: '🚪', name: 'Town Gate', npc: 'Guard', desc: 'Exit to fields', href: `/floor/${floorNumber}/town/gate` },
    ],
  }

  return (
    <GameLayout playerData={playerData}>
      <div className="bg-[#242424] rounded border border-[#333] p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🏘️</span>
          <div>
            <h1 className="text-xl font-bold text-[#6eb5ff]">{currentTown.name}</h1>
            <p className="text-sm text-gray-400">Floor {floorNumber} - Safe Zone</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-6">
          {currentTown.buildings.map((building) => (
            <a
              key={building.name}
              href={building.href}
              className="bg-[#1e1e1e] border border-[#333] rounded-lg p-4 hover:border-[#6eb5ff] transition-colors cursor-pointer block"
            >
              <div className="text-center">
                <span className="text-2xl block mb-2">{building.icon}</span>
                <span className="text-sm text-gray-300 font-medium block">{building.name}</span>
                <p className="text-xs text-[#6eb5ff] mt-1">NPC: {building.npc}</p>
                <p className="text-xs text-gray-500 mt-1">{building.desc}</p>
              </div>
            </a>
          ))}
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
