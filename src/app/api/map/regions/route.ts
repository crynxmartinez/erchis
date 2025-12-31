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
    
    // Process each state's cells into proper region boundaries
    cellsByState.forEach((stateCells: any[], stateId: number) => {
      const gameRegion = stateToGameRegion[stateId]
      if (!gameRegion) return
      
      // Create a convex hull or simplified boundary for the entire state
      const allPoints: number[][] = []
      
      // Get all unique boundary points for this state
      stateCells.forEach((cell: any) => {
        cell.v.forEach((vertexId: number) => {
          const vertex = vertexMap.get(vertexId)
          if (vertex) {
            // Check if this vertex is on the boundary (shared with cells of different states)
            const isBoundary = vertices[vertexId].c.some((cellId: number) => {
              const neighborCell = cells.find((c: any) => c.i === cellId)
              return neighborCell && neighborCell.state !== stateId
            })
            
            if (isBoundary) {
              allPoints.push([vertex[0], vertex[1]])
            }
          }
        })
      })
      
      // Remove duplicate points
      const uniquePoints = Array.from(new Set(allPoints.map(p => `${p[0]},${p[1]}`)))
        .map(str => str.split(',').map(Number))
      
      // Create a simplified polygon from boundary points
      if (uniquePoints.length > 0) {
        // Calculate center
        const centerX = uniquePoints.reduce((sum, p) => sum + p[0], 0) / uniquePoints.length
        const centerY = uniquePoints.reduce((sum, p) => sum + p[1], 0) / uniquePoints.length
        
        // Sort points by angle from center to create a proper polygon
        const sortedPoints = uniquePoints
          .map(p => ({
            point: p,
            angle: Math.atan2(p[1] - centerY, p[0] - centerX)
          }))
          .sort((a, b) => a.angle - b.angle)
          .map(item => item.point)
        
        // Create polygon points string
        const polygonPoints = sortedPoints.map(p => `${p[0]},${p[1]}`).join(' ')
        
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
