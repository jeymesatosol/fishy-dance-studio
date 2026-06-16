import type { Asset, AssetType, FishConfig } from './types'
import { assetTypeColors } from './types'
import { fishSprites } from './fish-sprites'

const MIN_FISH_SIZE = 22
const MAX_FISH_SIZE = 58
const MIN_SPEED = 0.35
const MAX_SPEED = 1.1

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

function mapValueToSize(value: number, minValue: number, maxValue: number) {
  if (maxValue <= minValue) return (MIN_FISH_SIZE + MAX_FISH_SIZE) / 2
  // log-scale para evitar 1 peixe gigante e o resto minúsculo
  const lv = Math.log(value + 1)
  const lmin = Math.log(minValue + 1)
  const lmax = Math.log(maxValue + 1)
  const n = clamp((lv - lmin) / (lmax - lmin), 0, 1)
  return MIN_FISH_SIZE + n * (MAX_FISH_SIZE - MIN_FISH_SIZE)
}

function mapVolatilityToSpeed(volatility: number) {
  const n = clamp(volatility, 0, 1)
  return MIN_SPEED + n * (MAX_SPEED - MIN_SPEED)
}

function mapSizeToCruisingSpeed(size: number, volatilitySpeed: number) {
  // peixes maiores nadam um pouco mais devagar
  const sizeFactor = 1 - (size - MIN_FISH_SIZE) / (MAX_FISH_SIZE - MIN_FISH_SIZE) // 1..0
  return volatilitySpeed * (0.6 + sizeFactor * 0.6)
}

export function adjustColorBrightness(hex: string, performance: number): string {
  const factor = 1 + clamp(performance, -50, 50) / 100 * 0.35
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const nr = clamp(Math.round(r * factor), 0, 255)
  const ng = clamp(Math.round(g * factor), 0, 255)
  const nb = clamp(Math.round(b * factor), 0, 255)
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`
}

/**
 * Distribuição inicial via Poisson-disk sampling simplificado:
 * cada peixe é colocado tentando manter distância mínima = soma dos raios + folga.
 */
function poissonPlace(
  sizes: number[],
  canvasWidth: number,
  canvasHeight: number,
  padding: number
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = []
  const W = Math.max(1, canvasWidth)
  const H = Math.max(1, canvasHeight)

  // ordena do maior para o menor (coloca os difíceis primeiro)
  const order = sizes
    .map((s, i) => ({ s, i }))
    .sort((a, b) => b.s - a.s)

  const placed: Array<{ x: number; y: number; r: number; i: number }> = []

  for (const { s, i } of order) {
    const r = s / 2
    let best: { x: number; y: number } | null = null
    let bestDist = -1

    for (let attempt = 0; attempt < 80; attempt++) {
      const x = r + padding + Math.random() * Math.max(1, W - 2 * (r + padding))
      const y = r + padding + Math.random() * Math.max(1, H - 2 * (r + padding))
      let minD = Infinity
      for (const p of placed) {
        const dx = x - p.x
        const dy = y - p.y
        const d = Math.sqrt(dx * dx + dy * dy) - (r + p.r)
        if (d < minD) minD = d
      }
      const required = padding
      if (minD >= required) {
        best = { x, y }
        break
      }
      if (minD > bestDist) {
        bestDist = minD
        best = { x, y }
      }
    }

    const pos = best ?? { x: W / 2, y: H / 2 }
    placed.push({ x: pos.x, y: pos.y, r, i })
    positions[i] = pos
  }

  return positions
}

export function assetsToFishes(
  assets: Asset[],
  canvasWidth: number,
  canvasHeight: number
): FishConfig[] {
  if (assets.length === 0) return []

  const values = assets.map((a) => a.quantity * a.currentPrice)
  const minV = Math.min(...values)
  const maxV = Math.max(...values)

  const sizes = assets.map((a, i) => mapValueToSize(values[i], minV, maxV))
  const positions = poissonPlace(sizes, canvasWidth, canvasHeight, 18)

  return assets.map((asset, i) => {
    const size = sizes[i]
    const volSpeed = mapVolatilityToSpeed(asset.volatility)
    const cruising = mapSizeToCruisingSpeed(size, volSpeed)
    const color = adjustColorBrightness(assetTypeColors[asset.type], asset.change30d)
    const { x, y } = positions[i]

    // direção inicial aleatória mas predominantemente horizontal (mais natural)
    const horizontalBias = Math.random() < 0.5 ? 0 : Math.PI
    const dir = horizontalBias + (Math.random() - 0.5) * (Math.PI * 0.6)

    const sprite = fishSprites[asset.type]
    return {
      id: `fish-${asset.id}`,
      assetId: asset.id,
      x,
      y,
      vx: Math.cos(dir) * cruising,
      vy: Math.sin(dir) * cruising * 0.4,
      size,
      color,
      sprite: sprite.url,
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

export function getAssetTypeLegend(): { type: AssetType; color: string; label: string }[] {
  return [
    { type: 'stock', color: assetTypeColors.stock, label: 'Ações' },
    { type: 'crypto', color: assetTypeColors.crypto, label: 'Criptomoedas' },
    { type: 'etf', color: assetTypeColors.etf, label: 'ETFs' },
    { type: 'bond', color: assetTypeColors.bond, label: 'Renda Fixa' },
    { type: 'reit', color: assetTypeColors.reit, label: 'FIIs' },
  ]
}
