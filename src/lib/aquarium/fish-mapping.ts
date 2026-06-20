import type { FishConfig, Project, Priority, Engagement } from './types'
import { statusColors } from './types'
import { fishSprites } from './fish-sprites'

const MIN_FISH_SIZE = 26
const MAX_FISH_SIZE = 62

const prioritySpeed: Record<Priority, number> = {
  baixa: 0.4,
  media: 0.65,
  alta: 0.9,
  critica: 1.15,
}

const engagementBrightness: Record<Engagement, number> = {
  ruim: -25,
  bom: 0,
  excelente: 25,
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

function progressToSize(progress: number) {
  const n = clamp(progress, 0, 100) / 100
  return MIN_FISH_SIZE + n * (MAX_FISH_SIZE - MIN_FISH_SIZE)
}

export function adjustColorBrightness(hex: string, delta: number): string {
  const factor = 1 + clamp(delta, -50, 50) / 100
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const nr = clamp(Math.round(r * factor), 0, 255)
  const ng = clamp(Math.round(g * factor), 0, 255)
  const nb = clamp(Math.round(b * factor), 0, 255)
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`
}

function poissonPlace(
  sizes: number[],
  canvasWidth: number,
  canvasHeight: number,
  padding: number,
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = []
  const W = Math.max(1, canvasWidth)
  const H = Math.max(1, canvasHeight)
  const order = sizes.map((s, i) => ({ s, i })).sort((a, b) => b.s - a.s)
  const placed: Array<{ x: number; y: number; r: number }> = []
  for (const { s, i } of order) {
    const r = s / 2
    let best: { x: number; y: number } | null = null
    let bestDist = -Infinity
    for (let attempt = 0; attempt < 80; attempt++) {
      const x = r + padding + Math.random() * Math.max(1, W - 2 * (r + padding))
      const y = r + padding + Math.random() * Math.max(1, H - 2 * (r + padding))
      let minD = Infinity
      for (const p of placed) {
        const d = Math.hypot(x - p.x, y - p.y) - (r + p.r)
        if (d < minD) minD = d
      }
      if (minD >= padding) { best = { x, y }; break }
      if (minD > bestDist) { bestDist = minD; best = { x, y } }
    }
    const pos = best ?? { x: W / 2, y: H / 2 }
    placed.push({ x: pos.x, y: pos.y, r })
    positions[i] = pos
  }
  return positions
}

export function projectsToFishes(
  projects: Project[],
  canvasWidth: number,
  canvasHeight: number,
): FishConfig[] {
  if (projects.length === 0) return []
  const sizes = projects.map((p) => progressToSize(p.progress))
  const positions = poissonPlace(sizes, canvasWidth, canvasHeight, 18)

  return projects.map((p, i) => {
    const size = sizes[i]
    const cruising = prioritySpeed[p.priority]
    const color = adjustColorBrightness(statusColors[p.status], engagementBrightness[p.engagement])
    const { x, y } = positions[i]
    const horizontalBias = Math.random() < 0.5 ? 0 : Math.PI
    const dir = horizontalBias + (Math.random() - 0.5) * (Math.PI * 0.6)
    const sprite = fishSprites[p.category]
    return {
      id: `fish-${p.id}`,
      projectId: p.id,
      x,
      y,
      vx: Math.cos(dir) * cruising,
      vy: Math.sin(dir) * cruising * 0.4,
      size,
      color,
      sprite: sprite.bodyUrl,
      facing: sprite.facing,
      speed: cruising,
      cruisingSpeed: cruising,
      direction: dir,
      preferredDepth: y,
      targetX: x,
      targetY: y,
      nextTargetChange: Date.now() + Math.random() * 4000,
      wanderAngle: Math.random() * Math.PI * 2,
      phase: Math.random() * Math.PI * 2,
    }
  })
}
