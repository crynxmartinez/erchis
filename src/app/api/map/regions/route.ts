import { NextResponse } from 'next/server'

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
        strokeColor: '#66c2a5'
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
        strokeColor: '#fc8d62'
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
        strokeColor: '#8da0cb'
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
        strokeColor: '#e78ac3'
      }
    }
    
    // Process each state's cells into polygons
    cellsByState.forEach((stateCells: any[], stateId: number) => {
      const gameRegion = stateToGameRegion[stateId]
      if (!gameRegion) return
      
      // Collect all boundary points for this state
      const allPoints: number[][] = []
      
      stateCells.forEach((cell: any) => {
        const cellPoints: number[][] = []
        
        // Convert vertex IDs to coordinates
        cell.v.forEach((vertexId: number) => {
          const vertex = vertexMap.get(vertexId)
          if (vertex) {
            cellPoints.push([vertex[0], vertex[1]])
          }
        })
        
        // Add cell polygon points
        if (cellPoints.length >= 3) {
          allPoints.push(...cellPoints)
        }
      })
      
      // Create a simplified polygon from all points
      if (allPoints.length > 0) {
        // Calculate center
        const centerX = allPoints.reduce((sum, p) => sum + p[0], 0) / allPoints.length
        const centerY = allPoints.reduce((sum, p) => sum + p[1], 0) / allPoints.length
        
        // Create polygon points string
        const polygonPoints = allPoints.map(p => `${p[0]},${p[1]}`).join(' ')
        
        regions.push({
          ...gameRegion,
          polygonPoints,
          centerX,
          centerY
        })
      }
    })
    
    return NextResponse.json({ regions })
  } catch (error) {
    console.error('Error processing map data:', error)
    return NextResponse.json({ error: 'Failed to process map data' }, { status: 500 })
  }
}
