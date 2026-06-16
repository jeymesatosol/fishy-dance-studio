import { useEffect, useRef, useState } from 'react'
import type { Asset, FishConfig } from '@/lib/aquarium/types'
import { assetsToFishes } from '@/lib/aquarium/fish-mapping'
import { defaultBoidsConfig, updateBoids } from '@/lib/aquarium/boids'

interface AquariumCanvasProps {
  assets: Asset[]
}

export function AquariumCanvas({ assets }: AquariumCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fishesRef = useRef<FishConfig[]>([])
  const rafRef = useRef<number | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  // resize observer
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return
    const ro = new ResizeObserver(() => {
      const rect = parent.getBoundingClientRect()
      setSize({ w: rect.width, h: rect.height })
    })
    ro.observe(parent)
    return () => ro.disconnect()
  }, [])

  // (re)cria peixes quando assets ou tamanho mudam
  useEffect(() => {
    if (size.w === 0 || size.h === 0) return
    fishesRef.current = assetsToFishes(assets, size.w, size.h)
  }, [assets, size.w, size.h])

  // loop de animação
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || size.w === 0 || size.h === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size.w * dpr
    canvas.height = size.h * dpr
    canvas.style.width = `${size.w}px`
    canvas.style.height = `${size.h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const tick = () => {
      fishesRef.current = updateBoids(
        fishesRef.current,
        defaultBoidsConfig,
        size.w,
        size.h
      )
      draw(ctx, fishesRef.current, size.w, size.h)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [size.w, size.h])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#0b3a5b] via-[#0d4f73] to-[#0a2a44]">
      {/* raios de luz */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.18),transparent_60%)]" />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}

function draw(
  ctx: CanvasRenderingContext2D,
  fishes: FishConfig[],
  w: number,
  h: number
) {
  ctx.clearRect(0, 0, w, h)

  // sombra ao fundo
  for (const f of fishes) {
    ctx.save()
    ctx.translate(f.x + 3, f.y + 6)
    ctx.rotate(f.direction)
    ctx.fillStyle = 'rgba(0,0,0,0.18)'
    drawFishShape(ctx, f.size, f.phase)
    ctx.restore()
  }

  // peixes
  for (const f of fishes) {
    ctx.save()
    ctx.translate(f.x, f.y)
    ctx.rotate(f.direction)

    // corpo com gradiente
    const grad = ctx.createLinearGradient(0, -f.size / 2, 0, f.size / 2)
    grad.addColorStop(0, lighten(f.color, 0.25))
    grad.addColorStop(1, darken(f.color, 0.2))
    ctx.fillStyle = grad
    ctx.strokeStyle = darken(f.color, 0.35)
    ctx.lineWidth = 1

    drawFishShape(ctx, f.size, f.phase)
    ctx.fill()
    ctx.stroke()

    // olho
    const eyeX = f.size * 0.28
    const eyeY = -f.size * 0.08
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(eyeX, eyeY, f.size * 0.07, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#111'
    ctx.beginPath()
    ctx.arc(eyeX + f.size * 0.02, eyeY, f.size * 0.035, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }
}

/** Corpo do peixe centrado em (0,0), apontando para +x. Cauda oscila com phase. */
function drawFishShape(ctx: CanvasRenderingContext2D, size: number, phase: number) {
  const len = size
  const hh = size * 0.35 // half-height
  const tailWag = Math.sin(phase) * size * 0.18

  ctx.beginPath()
  // corpo (elipse alongada via curvas)
  ctx.moveTo(len * 0.5, 0) // ponta da cabeça
  ctx.bezierCurveTo(
    len * 0.45, -hh,
    -len * 0.25, -hh,
    -len * 0.4, tailWag * 0.4
  )
  // cauda
  ctx.lineTo(-len * 0.55, tailWag - hh * 0.6)
  ctx.lineTo(-len * 0.45, tailWag * 0.4)
  ctx.lineTo(-len * 0.55, tailWag + hh * 0.6)
  ctx.lineTo(-len * 0.4, tailWag * 0.4)
  ctx.bezierCurveTo(
    -len * 0.25, hh,
    len * 0.45, hh,
    len * 0.5, 0
  )
  ctx.closePath()
}

function hexToRgb(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  }
}
function toHex(n: number) {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
}
function lighten(hex: string, amt: number) {
  const { r, g, b } = hexToRgb(hex)
  return `#${toHex(r + (255 - r) * amt)}${toHex(g + (255 - g) * amt)}${toHex(b + (255 - b) * amt)}`
}
function darken(hex: string, amt: number) {
  const { r, g, b } = hexToRgb(hex)
  return `#${toHex(r * (1 - amt))}${toHex(g * (1 - amt))}${toHex(b * (1 - amt))}`
}
