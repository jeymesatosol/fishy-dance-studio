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
  const dir = Math.atan2(Math.sin(f.direction), Math.cos(f.direction))
  const goingLeft = Math.cos(dir) < 0
  // Inclinação vertical: com o flip horizontal (quando goingLeft), o sinal precisa inverter
  // para que a cabeça siga o eixo Y do movimento real.
  const tilt = goingLeft ? -Math.asin(Math.sin(dir)) : Math.asin(Math.sin(dir))
  // Leve oscilação do corpo inteiro (yaw natural durante o nado).
  const yaw = Math.sin(f.phase * 1.2) * 0.025
  ctx.rotate(tilt + yaw)

  const spriteFacesLeft = f.facing === 'left'
  const flipX = goingLeft !== spriteFacesLeft ? -1 : 1
  if (flipX === -1) ctx.scale(-1, 1)

  // Importante: após o eventual scale(-1,1), o desenho do sprite continua
  // ocorrendo em coordenadas LOCAIS do código. Nessas coordenadas locais,
  // o pixel original da cabeça está sempre do lado para onde o sprite
  // aponta nativamente (spriteFacesLeft). O flip apenas reflete o
  // resultado visual. Portanto o lado da cabeça (em coords de código)
  // depende de spriteFacesLeft, e NÃO da direção de movimento.
  const headLeftInCode = spriteFacesLeft
  const tailFrac = 0.36
  const tailW = wImg * tailFrac
  const bodyW = wImg - tailW
  // Faixa do corpo (lado da cabeça) e da cauda (lado oposto), em coords locais.
  const bodyX = headLeftInCode ? -wImg / 2 : -wImg / 2 + tailW
  const tailX = headLeftInCode ? wImg / 2 - tailW : -wImg / 2
  // Pivô da articulação fica na junção corpo-cauda.
  const pivotX = headLeftInCode ? wImg / 2 - tailW : -wImg / 2 + tailW

  // Velocidade de batida proporcional à velocidade real do peixe (mais lenta).
  const speed = Math.hypot(f.vx ?? 0, f.vy ?? 0)
  const beat = 1.4 + Math.min(speed * 0.4, 1.6)
  // Ângulo da cauda (articulação) — amplitude moderada.
  const tailSwing = Math.sin(f.phase * beat) * 0.38
  // Direção do giro consistente em relação ao lado da cauda em coords locais.
  const tailAngle = headLeftInCode ? tailSwing : -tailSwing
  // bodyW é usado no clip do corpo (apenas para clareza/lint).
  void bodyW


  // --- Corpo ---
  ctx.save()
  ctx.beginPath()
  ctx.rect(bodyX, -hImg / 2, bodyW, hImg)
  ctx.clip()
  ctx.drawImage(img, -wImg / 2, -hImg / 2, wImg, hImg)
  ctx.restore()

  // --- Cauda articulada ---
  ctx.save()
  ctx.translate(pivotX, 0)
  ctx.rotate(tailAngle)
  ctx.translate(-pivotX, 0)
  ctx.beginPath()
  ctx.rect(tailX, -hImg / 2, tailW, hImg)
  ctx.clip()
  ctx.drawImage(img, -wImg / 2, -hImg / 2, wImg, hImg)
  ctx.restore()
}
