import { useEffect, useRef, useState } from 'react'
import type { Asset, FishConfig } from '@/lib/aquarium/types'
import { assetsToFishes } from '@/lib/aquarium/fish-mapping'
import { defaultBoidsConfig, updateBoids } from '@/lib/aquarium/boids'
import { getFishImage, preloadFishImages, spriteDefForBody, type SpriteDef } from '@/lib/aquarium/fish-sprites'

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

function draw(
  ctx: CanvasRenderingContext2D,
  fishes: FishConfig[],
  w: number,
  h: number
) {
  ctx.clearRect(0, 0, w, h)

  // sombras
  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
  for (const f of fishes) {
    ctx.beginPath()
    ctx.ellipse(f.x + 4, f.y + f.size * 0.55, f.size * 0.6, f.size * 0.12, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  for (const f of fishes) {
    const def = spriteDefForBody(f.sprite)
    if (!def) continue
    const body = getFishImage(def.bodyUrl)
    const tail = getFishImage(def.tailUrl)
    if (!body.complete || body.naturalWidth === 0) continue
    if (!tail.complete || tail.naturalWidth === 0) continue

    const bodyH = f.size * 1.3
    const bodyAspect = body.naturalWidth / body.naturalHeight
    const bodyW = bodyH * bodyAspect

    const tailH = bodyH * def.tailScale
    const tailAspect = tail.naturalWidth / tail.naturalHeight
    const tailW = tailH * tailAspect

    ctx.save()
    ctx.translate(f.x, f.y)
    const bob = Math.sin(f.phase) * 1.2
    ctx.translate(0, bob)
    drawFish(ctx, body, tail, f, def, bodyW, bodyH, tailW, tailH)
    ctx.restore()
  }
}

function drawFish(
  ctx: CanvasRenderingContext2D,
  bodyImg: HTMLImageElement,
  tailImg: HTMLImageElement,
  f: FishConfig,
  def: SpriteDef,
  bodyW: number,
  bodyH: number,
  tailW: number,
  tailH: number,
) {
  const dir = Math.atan2(Math.sin(f.direction), Math.cos(f.direction))
  const goingLeft = Math.cos(dir) < 0
  const tilt = goingLeft ? -Math.asin(Math.sin(dir)) : Math.asin(Math.sin(dir))
  const yaw = Math.sin(f.phase * 1.2) * 0.025
  ctx.rotate(tilt + yaw)

  const spriteFacesLeft = def.facing === 'left'
  const flipX = goingLeft !== spriteFacesLeft ? -1 : 1
  if (flipX === -1) ctx.scale(-1, 1)

  // Em coords de código, mantemos sempre a orientação NATIVA do sprite.
  // Para spriteFacesLeft, cabeça na esquerda, cauda na direita.
  // attachX é medido a partir do lado da cabeça → em coords locais:
  //   - facing left:  attach = -bodyW/2 + attachX * bodyW
  //   - facing right: attach =  bodyW/2 - attachX * bodyW
  const attachLocalX = spriteFacesLeft
    ? -bodyW / 2 + def.attachX * bodyW
    : bodyW / 2 - def.attachX * bodyW
  const attachLocalY = -bodyH / 2 + def.attachY * bodyH

  // pivotX na imagem da cauda, medido do lado do corpo
  // - facing left: lado do corpo da cauda = esquerda da img da cauda
  //   → pivô em coords da img: pivotX * tailW (a partir da esquerda)
  // - facing right: lado do corpo = direita da img → pivô a partir da direita
  const tailPivotInImgX = spriteFacesLeft ? def.pivotX * tailW : tailW - def.pivotX * tailW
  const tailPivotInImgY = def.pivotY * tailH

  // Batida da cauda — movimento lateral discreto ao longo do eixo do corpo
  // (em vez de rotação vertical, a cauda desliza/escala horizontalmente
  // simulando uma vista superior do nado).
  const speed = Math.hypot(f.vx ?? 0, f.vy ?? 0)
  const beat = 1.4 + Math.min(speed * 0.4, 1.6)
  const swing = Math.sin(f.phase * beat) // -1..1
  // compressão horizontal sutil (lateral squash) — sempre <= 1
  const tailSquash = 1 - Math.abs(swing) * 0.25
  // deslocamento lateral discreto ao longo do eixo do corpo (coords locais do código)
  const lateralShift = swing * tailW * 0.08 * (spriteFacesLeft ? 1 : -1)

  // --- Cauda articulada (desenhada ANTES do corpo p/ esconder a junção) ---
  ctx.save()
  ctx.translate(attachLocalX + lateralShift, attachLocalY)
  ctx.scale(tailSquash, 1)
  ctx.drawImage(tailImg, -tailPivotInImgX, -tailPivotInImgY, tailW, tailH)
  ctx.restore()

  // --- Corpo (por cima, ocultando a articulação) ---
  ctx.drawImage(bodyImg, -bodyW / 2, -bodyH / 2, bodyW, bodyH)
}
