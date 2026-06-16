// Tipos para o portfólio de investimentos
export type AssetType = 'stock' | 'crypto' | 'etf' | 'bond' | 'reit'

export interface Asset {
  id: string
  symbol: string
  name: string
  type: AssetType
  quantity: number
  avgPrice: number
  currentPrice: number
  change24h: number
  change30d: number
  volatility: number // 0-1
  volume: number
}

export interface Portfolio {
  totalValue: number
  change24h: number
  change30d: number
  assets: Asset[]
}

export interface FishConfig {
  id: string
  assetId: string
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  sprite: string         // URL da imagem do peixe
  facing: 'left' | 'right' // direção em que o sprite original aponta
  speed: number          // velocidade de cruzeiro alvo (px/frame)
  cruisingSpeed: number
  direction: number      // ângulo atual (rad)
  preferredDepth: number
  targetX: number
  targetY: number
  nextTargetChange: number
  wanderAngle: number    // ruído de wander acumulado
  phase: number          // para oscilação suave
}

export interface BoidsConfig {
  separationWeight: number
  alignmentWeight: number
  cohesionWeight: number
  maxSpeed: number
  minSpeed: number
  maxForce: number       // aceleração máx por frame
  maxTurnRate: number    // radianos por frame
  perceptionRadius: number
  separationRadius: number
}

export const assetTypeColors: Record<AssetType, string> = {
  stock: '#3B82F6',
  crypto: '#F97316',
  etf: '#10B981',
  bond: '#8B5CF6',
  reit: '#EC4899',
}
