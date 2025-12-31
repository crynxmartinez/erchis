// Polygon utility functions for map boundary extraction

/**
 * Douglas-Peucker algorithm for polygon simplification
 * Reduces the number of points while maintaining the shape
 */
export function simplifyPolygon(points: number[][], tolerance: number = 2): number[][] {
  if (points.length <= 2) return points

  // Find the point with maximum distance from line segment
  let maxDistance = 0
  let maxIndex = 0
  const end = points.length - 1

  for (let i = 1; i < end; i++) {
    const distance = perpendicularDistance(points[i], points[0], points[end])
    if (distance > maxDistance) {
      maxDistance = distance
      maxIndex = i
    }
  }

  // If max distance is greater than tolerance, recursively simplify
  if (maxDistance > tolerance) {
    const left = simplifyPolygon(points.slice(0, maxIndex + 1), tolerance)
    const right = simplifyPolygon(points.slice(maxIndex), tolerance)
    
    // Combine results (remove duplicate middle point)
    return [...left.slice(0, -1), ...right]
  } else {
    // Return just the endpoints
    return [points[0], points[end]]
  }
}

/**
 * Calculate perpendicular distance from point to line segment
 */
function perpendicularDistance(point: number[], lineStart: number[], lineEnd: number[]): number {
  const [px, py] = point
  const [x1, y1] = lineStart
  const [x2, y2] = lineEnd

  const dx = x2 - x1
  const dy = y2 - y1

  if (dx === 0 && dy === 0) {
    // Line segment is a point
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2)
  }

  const t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)
  const clampedT = Math.max(0, Math.min(1, t))

  const closestX = x1 + clampedT * dx
  const closestY = y1 + clampedT * dy

  return Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2)
}

/**
 * Build an adjacency graph from boundary edges
 * Returns a map of vertex ID to array of connected vertex IDs
 */
export function buildEdgeGraph(edges: Set<string>): Map<number, number[]> {
  const graph = new Map<number, number[]>()

  edges.forEach(edge => {
    const [v1, v2] = edge.split('-').map(Number)

    if (!graph.has(v1)) graph.set(v1, [])
    if (!graph.has(v2)) graph.set(v2, [])

    graph.get(v1)!.push(v2)
    graph.get(v2)!.push(v1)
  })

  return graph
}

/**
 * Trace a boundary path starting from a vertex
 * Returns an ordered array of vertex IDs forming a closed polygon
 */
export function traceBoundaryPath(
  startVertex: number,
  graph: Map<number, number[]>,
  visited: Set<string>
): number[] {
  const path: number[] = [startVertex]
  let currentVertex = startVertex
  let previousVertex = -1

  while (true) {
    const neighbors = graph.get(currentVertex) || []
    
    // Find next unvisited neighbor (prefer not going back)
    let nextVertex = -1
    for (const neighbor of neighbors) {
      const edgeKey = currentVertex < neighbor 
        ? `${currentVertex}-${neighbor}` 
        : `${neighbor}-${currentVertex}`
      
      if (!visited.has(edgeKey) && neighbor !== previousVertex) {
        nextVertex = neighbor
        visited.add(edgeKey)
        break
      }
    }

    // If no unvisited neighbor found, try to close the loop
    if (nextVertex === -1) {
      // Check if we can return to start
      if (neighbors.includes(startVertex) && path.length > 2) {
        break
      }
      // Otherwise, we're done with this path
      break
    }

    path.push(nextVertex)
    previousVertex = currentVertex
    currentVertex = nextVertex

    // Check if we've returned to start
    if (currentVertex === startVertex && path.length > 2) {
      break
    }

    // Safety check to prevent infinite loops
    if (path.length > 10000) {
      console.warn('Boundary path exceeded maximum length')
      break
    }
  }

  return path
}

/**
 * Calculate the centroid (geometric center) of a polygon
 */
export function calculateCentroid(points: number[][]): { x: number; y: number } {
  if (points.length === 0) return { x: 0, y: 0 }

  let area = 0
  let cx = 0
  let cy = 0

  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    const [xi, yi] = points[i]
    const [xj, yj] = points[j]

    const cross = xi * yj - xj * yi
    area += cross
    cx += (xi + xj) * cross
    cy += (yi + yj) * cross
  }

  area *= 0.5
  
  if (Math.abs(area) < 0.001) {
    // Fallback to simple average if area is too small
    const sumX = points.reduce((sum, p) => sum + p[0], 0)
    const sumY = points.reduce((sum, p) => sum + p[1], 0)
    return { x: sumX / points.length, y: sumY / points.length }
  }

  cx /= (6 * area)
  cy /= (6 * area)

  return { x: cx, y: cy }
}

/**
 * Sort points by angle from center (for creating proper polygon)
 */
export function sortPointsByAngle(points: number[][], center: { x: number; y: number }): number[][] {
  return points
    .map(p => ({
      point: p,
      angle: Math.atan2(p[1] - center.y, p[0] - center.x)
    }))
    .sort((a, b) => a.angle - b.angle)
    .map(item => item.point)
}

/**
 * Check if a polygon is clockwise
 */
export function isClockwise(points: number[][]): boolean {
  let sum = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    sum += (points[j][0] - points[i][0]) * (points[j][1] + points[i][1])
  }
  return sum > 0
}

/**
 * Reverse polygon direction if needed to ensure consistent winding
 */
export function ensureCounterClockwise(points: number[][]): number[][] {
  return isClockwise(points) ? points.reverse() : points
}
