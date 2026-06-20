import type { SceneryOptions } from './types'

interface Bubble { x: number; y: number; r: number; vy: number; drift: number; phase: number }

let bubbles: Bubble[] = []
let lastW = 0
let lastH = 0

function ensureBubbles(w: number, h: number, count = 40) {
  if (bubbles.length === count && lastW === w && lastH === h) return
  lastW = w; lastH = h
  bubbles = Array.from({ length: count }, () => makeBubble(w, h, true))
}

function makeBubble(w: number, h: number, randomY = false): Bubble {
  return {
    x: Math.random() * w,
    y: randomY ? Math.random() * h : h + 10,
    r: 1.5 + Math.random() * 3.5,
    vy: 0.3 + Math.random() * 0.8,
    drift: 0.2 + Math.random() * 0.6,
    phase: Math.random() * Math.PI * 2,
  }
}

export function drawScenery(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: SceneryOptions,
  t: number,
) {
  if (opts.reef) drawReef(ctx, w, h)
  if (opts.algae) drawAlgae(ctx, w, h, t)
  if (opts.anchor) drawAnchor(ctx, w, h)
  if (opts.shipwreck) drawShipwreck(ctx, w, h)
  if (opts.bubbles) drawBubbles(ctx, w, h, t)
}

function drawReef(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save()
  ctx.fillStyle = 'rgba(15, 30, 45, 0.55)'
  ctx.beginPath()
  ctx.moveTo(0, h)
  ctx.lineTo(0, h - 30)
  const peaks = 8
  for (let i = 0; i <= peaks; i++) {
    const x = (i / peaks) * w
    const y = h - 22 - Math.abs(Math.sin(i * 1.7)) * 28
    ctx.lineTo(x, y)
  }
  ctx.lineTo(w, h)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawAlgae(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.save()
  ctx.strokeStyle = 'rgba(34, 120, 90, 0.55)'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  const blades = 14
  for (let i = 0; i < blades; i++) {
    const x = (i + 0.5) * (w / blades) + Math.sin(i * 2.3) * 12
    const height = 60 + ((i * 53) % 70)
    const sway = Math.sin(t * 0.0015 + i) * 8
    ctx.beginPath()
    ctx.moveTo(x, h)
    ctx.quadraticCurveTo(x + sway * 0.5, h - height * 0.5, x + sway, h - height)
    ctx.stroke()
  }
  ctx.restore()
}

function drawAnchor(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save()
  ctx.translate(w * 0.12, h - 70)
  ctx.strokeStyle = 'rgba(10, 18, 26, 0.75)'
  ctx.fillStyle = 'rgba(10, 18, 26, 0.75)'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(0, -28, 8, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, -20); ctx.lineTo(0, 30)
  ctx.moveTo(-18, -5); ctx.lineTo(18, -5)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-28, 20)
  ctx.quadraticCurveTo(0, 50, 28, 20)
  ctx.lineTo(20, 28)
  ctx.quadraticCurveTo(0, 42, -20, 28)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawShipwreck(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save()
  ctx.translate(w * 0.82, h - 50)
  ctx.fillStyle = 'rgba(8, 16, 22, 0.78)'
  ctx.beginPath()
  ctx.moveTo(-70, 10)
  ctx.lineTo(70, 10)
  ctx.lineTo(55, 35)
  ctx.lineTo(-55, 35)
  ctx.closePath()
  ctx.fill()
  ctx.fillRect(-10, -30, 4, 40)
  ctx.beginPath()
  ctx.moveTo(-8, -28)
  ctx.lineTo(18, -10)
  ctx.lineTo(-8, -10)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawBubbles(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ensureBubbles(w, h)
  ctx.save()
  ctx.strokeStyle = 'rgba(180, 220, 255, 0.55)'
  ctx.fillStyle = 'rgba(180, 220, 255, 0.12)'
  ctx.lineWidth = 1
  for (const b of bubbles) {
    b.y -= b.vy
    b.x += Math.sin(t * 0.002 + b.phase) * b.drift * 0.4
    if (b.y < -10) {
      b.x = Math.random() * w
      b.y = h + 10
    }
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }
  ctx.restore()
}
