import { NextResponse } from 'next/server'
import { 
  buildEdgeGraph, 
  traceBoundaryPath, 
  simplifyPolygon, 
  calculateCentroid,
  ensureCounterClockwise 
} from '@/lib/polygon-utils'

// Process the JSON map data to extract actual regions
export async function GET() {
  try {
    // Read the JSON file
    const fs = require('fs')
    const path = require('path')
    const jsonPath = path.join(process.cwd(), 'json map', 'erchis full map floor 1.json')
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    
    const { cells, vertices, states } = jsonData.pack
    const mapWidth = jsonData.info.width
    const mapHeight = jsonData.info.height
    
    // Create vertex lookup map
    const vertexMap = new Map()
    vertices.forEach((v: any) => {
      vertexMap.set(v.i, v.p)
    })
    
    // Group cells by state
    const cellsByState = new Map()
    cells.forEach((cell: any) => {
      if (cell.state > 0) { // Skip neutral/ocean cells
        if (!cellsByState.has(cell.state)) {
          cellsByState.set(cell.state, [])
        }
        cellsByState.get(cell.state).push(cell)
      }
    })
    
    // Convert cells to polygons for each state
    const regions: any[] = []
    
    // Map states to game regions
    const stateToGameRegion: Record<number, any> = {
      1: { // Hoangaia - Starting area
        id: 'havens-rest',
        name: "Haven's Rest",
        type: 'town',
        level: 'Safe',
        description: 'A peaceful sanctuary where adventurers gather to rest, trade, and prepare for their journeys.',
        discovered: true,
        href: '/floor/1/town',
        color: '#66c2a5',
        fillColor: 'rgba(102, 194, 165, 0.3)',
        strokeColor: '#66c2a5',
        dangerLevel: 'Safe',
        terrainType: 'town',
        safeZoneNearby: true,
        skillTrainers: [
          {
            name: 'Master Swordsman Kael',
            skills: ['Sword Skills (Basic)', 'Guard', 'Riposte'],
            cost: 'Free (Starter Skills)',
            icon: '⚔️'
          },
          {
            name: 'Archmage Lyra',
            skills: ['Staff Skills (Basic)', 'Wand Skills (Basic)'],
            cost: 'Free (Starter Skills)',
            icon: '🔮'
          },
          {
            name: 'Ranger Thorne',
            skills: ['Bow Skills (Basic)', 'Dagger Skills (Basic)'],
            cost: 'Free (Starter Skills)',
            icon: '🏹'
          }
        ],
        trainingDummies: true,
        practiceArea: 'Training Grounds (North District)',
        repairShop: {
          available: true,
          npcName: 'Blacksmith Grom',
          repairCost: 'Standard rates (1 Col per durability)',
          icon: '🔨'
        }
      },
      2: { // Hohaumun
        id: 'verdant-plains',
        name: 'Verdant Plains',
        type: 'field',
        level: '1-10',
        description: 'Lush green plains perfect for beginners. Gentle hills and scattered forests provide ideal hunting grounds.',
        discovered: true,
        href: '/floor/1/area/verdant-plains',
        color: '#fc8d62',
        fillColor: 'rgba(252, 141, 98, 0.3)',
        strokeColor: '#fc8d62',
        monsters: [
          { name: 'Wild Rabbit', level: 1, count: '8-12', icon: '🐰' },
          { name: 'Young Boar', level: 3, count: '5-8', icon: '🐗' },
          { name: 'Plains Wolf', level: 5, count: '3-5', icon: '🐺' },
          { name: 'Giant Bee', level: 7, count: '4-6', icon: '🐝' }
        ],
        recommendedLevel: '1-10',
        recommendedPartySize: '1 (Solo Friendly)',
        dangerLevel: 'Low',
        avgCombatDuration: '1-2 minutes',
        lootTable: {
          common: ['Rabbit Pelt', 'Raw Meat', 'Boar Tusk'],
          uncommon: ['Wolf Fang', 'Honey', 'Plains Herb'],
          rare: ['Alpha Wolf Pelt', 'Royal Jelly'],
          dropRates: { common: 70, uncommon: 25, rare: 5 }
        },
        expGain: '30-80 per kill',
        colGain: '5-15 per kill',
        terrainType: 'plains',
        weaponEffectiveness: {
          spear: 1.2,
          bow: 1.1,
          sword: 1.0,
          greatsword: 0.9
        },
        bestForSkills: [
          { skill: 'Quick Slash', reason: 'Fast, weak enemies', efficiency: '★★★★★' },
          { skill: 'Dodge', reason: 'Predictable attack patterns', efficiency: '★★★★☆' },
          { skill: 'Aimed Shot', reason: 'Open terrain for ranged', efficiency: '★★★★★' }
        ],
        enemyRespawnTime: '5 minutes',
        safeZoneNearby: true,
        avgDurabilityLoss: '8-12 per hour',
        recommendedDurability: '50+'
      },
      3: { // Hublia
        id: 'whispering-woods',
        name: 'Whispering Woods',
        type: 'field',
        level: '5-15',
        description: 'Ancient forest where the trees seem to whisper secrets. Home to mystical creatures and hidden treasures.',
        discovered: false,
        href: '/floor/1/area/whispering-woods',
        color: '#8da0cb',
        fillColor: 'rgba(141, 160, 203, 0.3)',
        strokeColor: '#8da0cb',
        monsters: [
          { name: 'Forest Wolf', level: 6, count: '5-8', icon: '🐺' },
          { name: 'Treant Sapling', level: 8, count: '3-5', icon: '🌳' },
          { name: 'Shadow Panther', level: 10, count: '2-4', icon: '🐆' },
          { name: 'Woodland Sprite', level: 12, count: '4-6', icon: '🧚' },
          { name: 'Elder Treant', level: 15, count: '1-2', icon: '🌲' }
        ],
        recommendedLevel: '5-15',
        recommendedPartySize: '1-2',
        dangerLevel: 'Medium',
        avgCombatDuration: '2-4 minutes',
        lootTable: {
          common: ['Wolf Pelt', 'Treant Bark', 'Forest Herb'],
          uncommon: ['Shadow Essence', 'Sprite Dust', 'Ancient Wood'],
          rare: ['Elder Heart', 'Moonlit Fang', 'Enchanted Leaf'],
          dropRates: { common: 65, uncommon: 30, rare: 5 }
        },
        expGain: '60-150 per kill',
        colGain: '12-30 per kill',
        terrainType: 'forest',
        weaponEffectiveness: {
          dagger: 1.3,
          bow: 1.2,
          spear: 1.1,
          greatsword: 0.7,
          hammer: 0.8
        },
        bestForSkills: [
          { skill: 'Backstab', reason: 'Dense cover for stealth', efficiency: '★★★★★' },
          { skill: 'Quick Shot', reason: 'Close-quarters combat', efficiency: '★★★★☆' },
          { skill: 'Dodge', reason: 'Agile enemies', efficiency: '★★★★★' },
          { skill: 'Counter', reason: 'Predictable melee attacks', efficiency: '★★★★☆' }
        ],
        enemyRespawnTime: '7 minutes',
        safeZoneNearby: false,
        avgDurabilityLoss: '15-20 per hour',
        recommendedDurability: '80+'
      },
      4: { // Tseunfia
        id: 'crystal-mountains',
        name: 'Crystal Mountains',
        type: 'field',
        level: '15-30',
        description: 'Mountains shimmering with magical crystals. Dangerous terrain but valuable resources for brave adventurers.',
        discovered: false,
        href: '/floor/1/area/crystal-mountains',
        color: '#e78ac3',
        fillColor: 'rgba(231, 138, 195, 0.3)',
        strokeColor: '#e78ac3',
        monsters: [
          { name: 'Crystal Golem', level: 16, count: '3-5', icon: '💎' },
          { name: 'Mountain Drake', level: 20, count: '2-3', icon: '🐉' },
          { name: 'Ice Elemental', level: 23, count: '2-4', icon: '❄️' },
          { name: 'Stone Wyvern', level: 26, count: '1-2', icon: '🦅' },
          { name: 'Crystal Guardian', level: 30, count: '1', icon: '👹' }
        ],
        recommendedLevel: '15-30',
        recommendedPartySize: '2-3',
        dangerLevel: 'High',
        avgCombatDuration: '4-8 minutes',
        lootTable: {
          common: ['Crystal Shard', 'Drake Scale', 'Ice Core'],
          uncommon: ['Golem Heart', 'Wyvern Talon', 'Frozen Essence'],
          rare: ['Ancient Crystal', 'Drake Fang', 'Guardian Core', 'Legendary Ore'],
          dropRates: { common: 60, uncommon: 32, rare: 8 }
        },
        expGain: '150-400 per kill',
        colGain: '30-80 per kill',
        terrainType: 'mountains',
        weaponEffectiveness: {
          hammer: 1.3,
          greataxe: 1.2,
          mace: 1.2,
          staff: 1.1,
          dagger: 0.7,
          bow: 0.8
        },
        bestForSkills: [
          { skill: 'Heavy Slam', reason: 'Armored enemies', efficiency: '★★★★★' },
          { skill: 'Guard', reason: 'Heavy-hitting enemies', efficiency: '★★★★★' },
          { skill: 'Fireball', reason: 'Ice-weak enemies', efficiency: '★★★★☆' },
          { skill: 'Shield Block', reason: 'Dangerous attacks', efficiency: '★★★★★' }
        ],
        enemyRespawnTime: '10 minutes',
        safeZoneNearby: false,
        avgDurabilityLoss: '25-35 per hour',
        recommendedDurability: '100+'
      },
      5: { // Gomimaki - BOSS AREA
        id: 'corrupted-sanctum',
        name: 'The Corrupted Sanctum',
        type: 'boss',
        level: '30',
        description: '👹 BOSS ARENA: A twisted realm where reality bleeds into the void. Malachar, the Void Corruptor awaits challengers in this corrupted sanctum.',
        discovered: false,
        href: '/floor/1/boss/corrupted-sanctum',
        color: '#a6d854',
        fillColor: 'rgba(166, 216, 84, 0.3)',
        strokeColor: '#a6d854',
        dangerLevel: 'Extreme',
        terrainType: 'boss'
      },
      6: { // Jeomcheonguk - Naval Region
        id: 'azure-harbor',
        name: 'Azure Harbor',
        type: 'field',
        level: '20-35',
        description: 'A bustling naval fortress with towering warships and fierce sea raiders. The salty breeze carries the clash of steel and roar of cannons.',
        discovered: false,
        href: '/floor/1/area/azure-harbor',
        color: '#ffd92f',
        fillColor: 'rgba(255, 217, 47, 0.3)',
        strokeColor: '#ffd92f',
        dangerLevel: 'High',
        terrainType: 'water'
      },
      7: { // Nanu - Massive Ancient Ruins
        id: 'forgotten-ruins',
        name: 'Forgotten Ruins',
        type: 'field',
        level: '25-40',
        description: 'Colossal ruins of an ancient civilization, stretching endlessly across the horizon. Cursed guardians and ancient magic protect long-lost treasures.',
        discovered: false,
        href: '/floor/1/area/forgotten-ruins',
        color: '#70bfbe',
        fillColor: 'rgba(112, 191, 190, 0.3)',
        strokeColor: '#70bfbe',
        dangerLevel: 'High',
        terrainType: 'ruins'
      },
      8: { // Abnakia - Scorched Badlands
        id: 'scorched-wastes',
        name: 'Scorched Wastes',
        type: 'field',
        level: '30-45',
        description: 'Endless desert where the sun scorches the earth and fire elementals roam. Only the strongest survive the blazing heat and deadly creatures.',
        discovered: false,
        href: '/floor/1/area/scorched-wastes',
        color: '#eaa089',
        fillColor: 'rgba(234, 160, 137, 0.3)',
        strokeColor: '#eaa089',
        dangerLevel: 'High',
        terrainType: 'desert'
      },
      9: { // Bunavandia - Mystic Vale
        id: 'mystic-vale',
        name: 'Mystic Vale',
        type: 'field',
        level: '18-28',
        description: 'A valley where magic flows freely through the air, creating beautiful yet dangerous anomalies. Arcane creatures dance between reality and dreams.',
        discovered: false,
        href: '/floor/1/area/mystic-vale',
        color: '#b7a8c5',
        fillColor: 'rgba(183, 168, 197, 0.3)',
        strokeColor: '#b7a8c5',
        dangerLevel: 'Medium',
        terrainType: 'magical'
      },
      10: { // Dagal - Massive Nomadic Plains
        id: 'endless-steppe',
        name: 'Endless Steppe',
        type: 'field',
        level: '35-50',
        description: 'Vast grasslands where nomadic warriors ride thunder beasts. The horizon stretches infinitely, and mounted combat is the way of life.',
        discovered: false,
        href: '/floor/1/area/endless-steppe',
        color: '#9bf36e',
        fillColor: 'rgba(155, 243, 110, 0.3)',
        strokeColor: '#9bf36e',
        dangerLevel: 'High',
        terrainType: 'plains'
      },
      11: { // Cheonguk - Harbor Town
        id: 'port-meridian',
        name: 'Port Meridian',
        type: 'town',
        level: 'Safe',
        description: 'A thriving port city filled with merchants, sailors, and adventurers. Ships from distant lands dock here, bringing exotic goods and tales of adventure.',
        discovered: false,
        href: '/floor/1/town/port-meridian',
        color: '#c7cf6d',
        fillColor: 'rgba(199, 207, 109, 0.3)',
        strokeColor: '#c7cf6d',
        dangerLevel: 'Safe',
        terrainType: 'town'
      },
      12: { // Nimia - MINI-BOSS (Level 15)
        id: 'hunters-trial',
        name: "Hunter's Trial",
        type: 'boss',
        level: '15',
        description: '🐺 MINI-BOSS: The Alpha Wolf King guards this sacred hunting ground. Defeat it to prove your worth as a true hunter.',
        discovered: false,
        href: '/floor/1/boss/hunters-trial',
        color: '#f2f743',
        fillColor: 'rgba(242, 247, 67, 0.3)',
        strokeColor: '#f2f743',
        dangerLevel: 'High',
        terrainType: 'forest'
      },
      13: { // Mashiho - Massive Desert
        id: 'infernal-dunes',
        name: 'Infernal Dunes',
        type: 'field',
        level: '40-55',
        description: 'A hellish desert where sandstorms rage eternally and fire demons emerge from molten sand. The heat alone can kill unprepared adventurers.',
        discovered: false,
        href: '/floor/1/area/infernal-dunes',
        color: '#efb470',
        fillColor: 'rgba(239, 180, 112, 0.3)',
        strokeColor: '#efb470',
        dangerLevel: 'Extreme',
        terrainType: 'desert'
      },
      14: { // Savayeh - Shadow Marshes
        id: 'shadow-marshes',
        name: 'Shadow Marshes',
        type: 'field',
        level: '28-38',
        description: 'Cursed swamplands where the dead refuse to rest. Fog obscures vision, and every shadow hides a nightmare waiting to strike.',
        discovered: false,
        href: '/floor/1/area/shadow-marshes',
        color: '#ffa0b8',
        fillColor: 'rgba(255, 160, 184, 0.3)',
        strokeColor: '#ffa0b8',
        dangerLevel: 'High',
        terrainType: 'swamp'
      },
      15: { // Kokyurt - MINI-BOSS (Level 45)
        id: 'frozen-throne',
        name: 'The Frozen Throne',
        type: 'boss',
        level: '45',
        description: '❄️ MINI-BOSS: The Frost Titan sits upon a throne of eternal ice. Challenge this ancient guardian to claim legendary ice artifacts.',
        discovered: false,
        href: '/floor/1/boss/frozen-throne',
        color: '#a09cdc',
        fillColor: 'rgba(160, 156, 220, 0.3)',
        strokeColor: '#a09cdc',
        dangerLevel: 'Extreme',
        terrainType: 'ice'
      },
      16: { // Teyundasia - Largest Nomadic Region
        id: 'khan-dominion',
        name: "Khan's Dominion",
        type: 'field',
        level: '45-60',
        description: 'The largest nomadic empire, ruled by the legendary Khan. Massive armies patrol these lands, and only the mightiest warriors dare challenge them.',
        discovered: false,
        href: '/floor/1/area/khan-dominion',
        color: '#d99ce0',
        fillColor: 'rgba(217, 156, 224, 0.3)',
        strokeColor: '#d99ce0',
        dangerLevel: 'Extreme',
        terrainType: 'plains'
      },
      17: { // Komita - FINAL BOSS (Level 70)
        id: 'volcanic-apex',
        name: 'Volcanic Apex',
        type: 'boss',
        level: '70',
        description: '🔥 FINAL BOSS: The summit of an active volcano where the Ancient Fire God awaits. This is the ultimate challenge of Floor 1.',
        discovered: false,
        href: '/floor/1/boss/volcanic-apex',
        color: '#ffcf4f',
        fillColor: 'rgba(255, 207, 79, 0.3)',
        strokeColor: '#ffcf4f',
        dangerLevel: 'Extreme',
        terrainType: 'volcano'
      }
    }
    
    // Process each state to create clean, single region boundaries
    cellsByState.forEach((stateCells: any[], stateId: number) => {
      const gameRegion = stateToGameRegion[stateId]
      if (!gameRegion) return
      
      console.log(`\n=== Processing State ${stateId}: ${gameRegion.name} ===`)
      console.log(`Total cells: ${stateCells.length}`)
      
      // Step 1: Find all boundary edges for this state
      const boundaryEdges = new Set<string>()
      const cellEdgeCount = new Map<string, number>()
      
      // Count how many cells of THIS state use each edge
      stateCells.forEach((cell: any) => {
        const cellVertices = cell.v
        
        for (let i = 0; i < cellVertices.length; i++) {
          const v1 = cellVertices[i]
          const v2 = cellVertices[(i + 1) % cellVertices.length]
          const edgeKey = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`
          
          cellEdgeCount.set(edgeKey, (cellEdgeCount.get(edgeKey) || 0) + 1)
        }
      })
      
      // Boundary edges are those used by exactly 1 cell of this state
      cellEdgeCount.forEach((count, edgeKey) => {
        if (count === 1) {
          boundaryEdges.add(edgeKey)
        }
      })
      
      console.log(`Boundary edges found: ${boundaryEdges.size}`)
      
      if (boundaryEdges.size === 0) {
        console.warn(`No boundary edges found for state ${stateId}`)
        return
      }
      
      // Step 2: Build edge graph (vertex -> connected vertices)
      const edgeGraph = buildEdgeGraph(boundaryEdges)
      console.log(`Edge graph vertices: ${edgeGraph.size}`)
      
      // Step 3: Trace boundary path(s)
      const visitedEdges = new Set<string>()
      const polygons: number[][][] = []
      
      // Start from any boundary vertex
      const startVertex = Array.from(edgeGraph.keys())[0]
      
      if (startVertex !== undefined) {
        const path = traceBoundaryPath(startVertex, edgeGraph, visitedEdges)
        console.log(`Traced path with ${path.length} vertices`)
        
        // Convert vertex IDs to coordinates
        const pathPoints = path
          .map(vid => vertexMap.get(vid))
          .filter((p): p is number[] => p !== undefined)
        
        if (pathPoints.length > 2) {
          polygons.push(pathPoints)
        }
      }
      
      // Check for additional disconnected polygons (islands)
      let attempts = 0
      while (visitedEdges.size < boundaryEdges.size && attempts < 10) {
        attempts++
        
        // Find an unvisited edge
        let unvisitedVertex: number | undefined
        for (const [vertex, neighbors] of edgeGraph.entries()) {
          const hasUnvisitedEdge = neighbors.some(neighbor => {
            const edgeKey = vertex < neighbor ? `${vertex}-${neighbor}` : `${neighbor}-${vertex}`
            return !visitedEdges.has(edgeKey)
          })
          
          if (hasUnvisitedEdge) {
            unvisitedVertex = vertex
            break
          }
        }
        
        if (unvisitedVertex === undefined) break
        
        const path = traceBoundaryPath(unvisitedVertex, edgeGraph, visitedEdges)
        console.log(`Traced additional path with ${path.length} vertices`)
        
        const pathPoints = path
          .map(vid => vertexMap.get(vid))
          .filter((p): p is number[] => p !== undefined)
        
        if (pathPoints.length > 2) {
          polygons.push(pathPoints)
        }
      }
      
      console.log(`Total polygons found: ${polygons.length}`)
      
      // Step 4: Process the largest polygon (main boundary)
      if (polygons.length > 0) {
        // Sort by size, take the largest
        polygons.sort((a, b) => b.length - a.length)
        let mainPolygon = polygons[0]
        
        console.log(`Main polygon points before simplification: ${mainPolygon.length}`)
        
        // Step 5: Simplify polygon to reduce point count
        mainPolygon = simplifyPolygon(mainPolygon, 3)
        console.log(`Main polygon points after simplification: ${mainPolygon.length}`)
        
        // Step 6: Ensure counter-clockwise winding
        mainPolygon = ensureCounterClockwise(mainPolygon)
        
        // Step 7: Calculate proper centroid
        const centroid = calculateCentroid(mainPolygon)
        console.log(`Centroid: (${Math.round(centroid.x)}, ${Math.round(centroid.y)})`)
        
        // Step 8: Create polygon points string
        const polygonPoints = mainPolygon
          .map(p => `${Math.round(p[0])},${Math.round(p[1])}`)
          .join(' ')
        
        regions.push({
          ...gameRegion,
          polygonPoints,
          centerX: Math.round(centroid.x),
          centerY: Math.round(centroid.y)
        })
        
        console.log(`✓ Successfully processed ${gameRegion.name}`)
      } else {
        console.warn(`Failed to create polygon for state ${stateId}`)
      }
    })
    
    return NextResponse.json({ regions })
  } catch (error) {
    console.error('Error processing map data:', error)
    return NextResponse.json({ error: 'Failed to process map data' }, { status: 500 })
  }
}
