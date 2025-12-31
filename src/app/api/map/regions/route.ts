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
