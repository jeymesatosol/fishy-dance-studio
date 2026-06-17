import { useEffect, useRef, useState } from 'react'
import type { Asset, FishConfig } from '@/lib/aquarium/types'
import { assetsToFishes } from '@/lib/aquarium/fish-mapping'
import { defaultBoidsConfig, updateBoids } from '@/lib/aquarium/boids'
import { fishSprites, getFishImage, preloadFishImages } from '@/lib/aquarium/fish-sprites'

interface AquariumCanvasProps {
  assets: Asset[]
}

export function AquariumCanvas({ assets }: AquariumCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fishesRef = useRef<FishConfig[]>([])
  const rafRef = useRef<number | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => { preloadFishImages() }, [])

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

  useEffect(() => {
    if (size.w === 0 || size.h === 0) return
    fishesRef.current = assetsToFishes(assets, size.w, size.h)
  }, [assets, size.w, size.h])

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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.18),transparent_60%)]" />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}

/** Encontra o aspect ratio cadastrado para uma URL de sprite (fallback 1.5). */
function aspectFor(url: string): number {
  for (const def of Object.values(fishSprites)) {
    if (def.url === url) return def.aspect
  }
  return 1.5
}

function draw(
  ctx: CanvasRenderingContext2D,
  fishes: FishConfig[],
  w: number,
  h: number
) {
  ctx.clearRect(0, 0, w, h)

  // sombras suaves no fundo (elipses escuras)
  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
  for (const f of fishes) {
    const aspect = aspectFor(f.sprite)
    const wImg = f.size * 1.3 * aspect
    ctx.beginPath()
    ctx.ellipse(f.x + 4, f.y + f.size * 0.55, wImg * 0.35, f.size * 0.12, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  // peixes
  for (const f of fishes) {
    const img = getFishImage(f.sprite)
    if (!img.complete || img.naturalWidth === 0) continue
    const aspect = aspectFor(f.sprite)
    const hImg = f.size * 1.3
    const wImg = hImg * aspect
    ctx.save()
    ctx.translate(f.x, f.y)
    // leve bobbing vertical com phase
    const bob = Math.sin(f.phase) * 1.2
    ctx.translate(0, bob)
    drawSprite(ctx, img, f, wImg, hImg)
    ctx.restore()
  }
}

function drawSprite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  f: FishConfig,
  wImg: number,
  hImg: number,
) {
  // Nariz do peixe aponta para a direção de movimento, sempre com a barriga para baixo.
  // Normaliza a direção para [-PI, PI].
  let dir = Math.atan2(Math.sin(f.direction), Math.cos(f.direction))
  // Se está se movendo para a esquerda (cos<0), espelhamos horizontalmente
  // em vez de girar 180°, evitando "cabeça pra baixo".
  const goingLeft = Math.cos(dir) < 0
  // Ângulo de inclinação (apenas componente vertical do movimento).
  // Quando vai para a esquerda, invertemos para manter a barriga embaixo após o flip.
  const tilt = goingLeft ? -Math.asin(Math.sin(dir)) * -1 : Math.asin(Math.sin(dir))
  // Pequeno wag de cauda
  const wag = Math.sin(f.phase * 1.6) * 0.06
  ctx.rotate(tilt + wag)
  // Se sprite original aponta para esquerda, o "default" é left; ajusta sinal.
  const spriteFacesLeft = f.facing === 'left'
  const flipX = goingLeft !== spriteFacesLeft ? -1 : 1
  if (flipX === -1) ctx.scale(-1, 1)
  ctx.drawImage(img, -wImg / 2, -hImg / 2, wImg, hImg)
}
