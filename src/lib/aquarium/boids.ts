import type { BoidsConfig, FishConfig } from './types'

/**
 * Configuração: peixes independentes (sem cardume).
 * - alignmentWeight = 0 e cohesionWeight = 0  -> não se agrupam
 * - separationWeight alto                     -> nunca sobrepõem
 * - maxTurnRate baixo                         -> curvas suaves, não giram
 * - minSpeed > 0                              -> nunca param (evita o "girar no lugar")
 */
export const defaultBoidsConfig: BoidsConfig = {
  separationWeight: 4.0,
  alignmentWeight: 0,
  cohesionWeight: 0,
  maxSpeed: 0.7,
  minSpeed: 0.15,
  maxForce: 0.03,
  maxTurnRate: 0.04, // ~2.3°/frame
  perceptionRadius: 90,
  separationRadius: 0, // calculado dinamicamente a partir do tamanho
}

function mag(x: number, y: number) {
  return Math.sqrt(x * x + y * y)
}

function normalize(x: number, y: number) {
  const m = mag(x, y)
  if (m === 0) return { x: 0, y: 0 }
  return { x: x / m, y: y / m }
}

function limit(x: number, y: number, max: number) {
  const m = mag(x, y)
  if (m > max && m > 0) return { x: (x / m) * max, y: (y / m) * max }
  return { x, y }
}

/** Diferença angular menor caminho, em [-PI, PI]. */
function angleDiff(a: number, b: number) {
  let d = a - b
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return d
}

/** Steering de separação (força repulsiva entre vizinhos próximos). */
function separation(fish: FishConfig, others: FishConfig[]) {
  let sx = 0
  let sy = 0
  let count = 0

  for (const o of others) {
    if (o.id === fish.id) continue
    const dx = fish.x - o.x
    const dy = fish.y - o.y
    const d = mag(dx, dy)
    const minDist = (fish.size + o.size) / 2 + 12 // folga
    if (d > 0 && d < minDist * 2) {
      // força inversamente proporcional à distância, mais forte que linear
      const strength = (minDist * 2 - d) / (minDist * 2)
      const n = normalize(dx, dy)
      sx += n.x * strength * strength
      sy += n.y * strength * strength
      count++
    }
  }

  if (count > 0) {
    sx /= count
    sy /= count
  }
  return { x: sx, y: sy }
}

/** Steering para manter o peixe dentro do canvas, suave (sem rebote). */
function boundaries(
  fish: FishConfig,
  width: number,
  height: number
) {
  const margin = Math.max(40, fish.size)
  let sx = 0
  let sy = 0

  if (fish.x < margin) sx = (margin - fish.x) / margin
  else if (fish.x > width - margin) sx = -(fish.x - (width - margin)) / margin

  if (fish.y < margin) sy = (margin - fish.y) / margin
  else if (fish.y > height - margin) sy = -(fish.y - (height - margin)) / margin

  return { x: sx, y: sy }
}

/** Pequeno wander para movimento orgânico. */
function wander(fish: FishConfig) {
  // varia o ângulo de wander gradualmente
  fish.wanderAngle += (Math.random() - 0.5) * 0.3
  const wx = Math.cos(fish.wanderAngle)
  const wy = Math.sin(fish.wanderAngle) * 0.4 // bias horizontal
  return { x: wx * 0.25, y: wy * 0.25 }
}

/**
 * Resolução posicional de colisão: depois de mover, se 2 peixes
 * estiverem sobrepostos, empurra-os pela metade da penetração.
 * Garante zero sobreposição visual.
 */
function resolveCollisions(fishes: FishConfig[]) {
  for (let i = 0; i < fishes.length; i++) {
    for (let j = i + 1; j < fishes.length; j++) {
      const a = fishes[i]
      const b = fishes[j]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const d = mag(dx, dy)
      const minDist = (a.size + b.size) / 2 + 4
      if (d > 0 && d < minDist) {
        const overlap = (minDist - d) / 2
        const n = normalize(dx, dy)
        a.x -= n.x * overlap
        a.y -= n.y * overlap
        b.x += n.x * overlap
        b.y += n.y * overlap
      } else if (d === 0) {
        // mesmo ponto: separa em direção aleatória
        const ang = Math.random() * Math.PI * 2
        a.x -= Math.cos(ang) * minDist / 2
        a.y -= Math.sin(ang) * minDist / 2
        b.x += Math.cos(ang) * minDist / 2
        b.y += Math.sin(ang) * minDist / 2
      }
    }
  }
}

export function updateBoids(
  fishes: FishConfig[],
  config: BoidsConfig,
  canvasWidth: number,
  canvasHeight: number
): FishConfig[] {
  const updated: FishConfig[] = fishes.map((fish) => {
    // === forças ===
    const sep = separation(fish, fishes)
    const bnd = boundaries(fish, canvasWidth, canvasHeight)
    const wnd = wander({ ...fish })
    // wander muta wanderAngle no clone; copiamos de volta:
    const newWanderAngle = fish.wanderAngle + (Math.random() - 0.5) * 0.3

    // alvo ocasional (variação de profundidade preferida)
    let { targetX, targetY, nextTargetChange, preferredDepth } = fish
    const now = Date.now()
    if (now > nextTargetChange) {
      targetX = Math.random() * canvasWidth
      targetY = preferredDepth + (Math.random() - 0.5) * canvasHeight * 0.25
      nextTargetChange = now + 4000 + Math.random() * 6000
    }
    const tdx = targetX - fish.x
    const tdy = targetY - fish.y
    const tDir = normalize(tdx, tdy)
    const tgt = { x: tDir.x * 0.15, y: tDir.y * 0.15 }

    // soma de steering (cohesion/alignment desligados por config)
    let ax = sep.x * config.separationWeight + bnd.x * 3 + wnd.x + tgt.x
    let ay = sep.y * config.separationWeight + bnd.y * 3 + wnd.y + tgt.y

    // limita aceleração
    const a = limit(ax, ay, config.maxForce)
    ax = a.x
    ay = a.y

    // === velocidade desejada ===
    let dvx = fish.vx + ax
    let dvy = fish.vy + ay

    // === limita TAXA DE GIRO (chave para não "girar no lugar") ===
    const currentDir = Math.atan2(fish.vy, fish.vx)
    const desiredDir = Math.atan2(dvy, dvx)
    const diff = angleDiff(desiredDir, currentDir)
    const turn = Math.max(-config.maxTurnRate, Math.min(config.maxTurnRate, diff))
    const newDir = currentDir + turn

    // velocidade-alvo: tende ao cruisingSpeed
    let speed = mag(dvx, dvy)
    speed = speed * 0.92 + fish.cruisingSpeed * 0.08 // suaviza para cruising
    speed = Math.max(config.minSpeed, Math.min(config.maxSpeed, speed))

    const newVx = Math.cos(newDir) * speed
    const newVy = Math.sin(newDir) * speed

    let newX = fish.x + newVx
    let newY = fish.y + newVy

    // clamp duro (segurança; o steering já evita chegar aqui)
    const m = fish.size / 2
    if (newX < m) newX = m
    if (newX > canvasWidth - m) newX = canvasWidth - m
    if (newY < m) newY = m
    if (newY > canvasHeight - m) newY = canvasHeight - m

    return {
      ...fish,
      x: newX,
      y: newY,
      vx: newVx,
      vy: newVy,
      direction: newDir,
      targetX,
      targetY,
      nextTargetChange,
      wanderAngle: newWanderAngle,
      phase: fish.phase + 0.08, // oscilação da cauda (mais lenta)
    }
  })

  // pós-processo: zero sobreposição
  resolveCollisions(updated)

  return updated
}
