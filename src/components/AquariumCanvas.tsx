import { useEffect, useMemo, useRef, useState } from 'react'
import bgAsset from '@/assets/scenery/pihipihi.png'
import type { FishConfig, Project, SceneryOptions } from '@/lib/aquarium/types'
import { defaultScenery } from '@/lib/aquarium/types'
import { projectsToFishes } from '@/lib/aquarium/fish-mapping'
import { defaultBoidsConfig, updateBoids } from '@/lib/aquarium/boids'
import { getFishImage, preloadFishImages, spriteDefForBody, type SpriteDef } from '@/lib/aquarium/fish-sprites'
import { drawScenery } from '@/lib/aquarium/scenery'

interface AquariumCanvasProps {
  projects: Project[]
  scenery?: SceneryOptions
  /** Reduz overhead: usado no mini-aquário do dashboard. */
  compact?: boolean
}

export function AquariumCanvas({ projects, scenery = defaultScenery, compact = false }: AquariumCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fishesRef = useRef<FishConfig[]>([])
  const rafRef = useRef<number | null>(null)
  const bgImgRef = useRef<HTMLImageElement | null>(null)
  const sceneryRef = useRef<SceneryOptions>(scenery)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => { sceneryRef.current = scenery }, [scenery])
  useEffect(() => { preloadFishImages() }, [])

  useEffect(() => {
    const img = new Image()
    img.src = bgAsset
    img.onload = () => { bgImgRef.current = img }
    return () => { img.onload = null }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const updateSize = () => {
      const rect = parent.getBoundingClientRect()
      setSize({ w: rect.width, h: rect.height })
    }

    const ro = new ResizeObserver(() => {
      updateSize()
    })
    ro.observe(parent)
    updateSize()
    return () => ro.disconnect()
  }, [])

  const projectsKey = useMemo(
    () => projects.map((p) => `${p.id}:${p.status}:${p.progress}:${p.priority}:${p.engagement}:${p.category}`).join('|'),
    [projects],
  )

  useEffect(() => {
    if (size.w === 0 || size.h === 0) return
    fishesRef.current = projectsToFishes(projects, size.w, size.h)
  }, [projectsKey, size.w, size.h]) // eslint-disable-line react-hooks/exhaustive-deps

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
      fishesRef.current = updateBoids(fishesRef.current, defaultBoidsConfig, size.w, size.h)
      draw(ctx, fishesRef.current, size.w, size.h, bgImgRef.current, sceneryRef.current, compact)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [size.w, size.h, compact])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/5">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}

const BG_BRIGHTNESS = 0.85
const FISH_BRIGHTNESS = 1.05

function draw(
  ctx: CanvasRenderingContext2D,
  fishes: FishConfig[],
  w: number,
  h: number,
  bgImg: HTMLImageElement | null,
  scenery: SceneryOptions,
  compact: boolean,
) {
  ctx.clearRect(0, 0, w, h)

  if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
    ctx.save()
    ctx.filter = `brightness(${BG_BRIGHTNESS})`
    const scale = Math.max(w / bgImg.naturalWidth, h / bgImg.naturalHeight)
    const dx = (w - bgImg.naturalWidth * scale) / 2
    const dy = (h - bgImg.naturalHeight * scale) / 2
    ctx.drawImage(bgImg, dx, dy, bgImg.naturalWidth * scale, bgImg.naturalHeight * scale)
    ctx.restore()
  } else {
    ctx.fillStyle = '#03131f'
    ctx.fillRect(0, 0, w, h)
  }

  const t = performance.now()
  drawScenery(ctx, w, h, scenery, t)

  // sombras suaves
  if (!compact) {
    ctx.save()
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
    for (const f of fishes) {
      ctx.beginPath()
      ctx.ellipse(f.x + 4, f.y + f.size * 0.55, f.size * 0.6, f.size * 0.12, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  ctx.save()
  ctx.filter = `brightness(${FISH_BRIGHTNESS})`
  for (const f of fishes) {
    const def = spriteDefForBody(f.sprite)
    if (!def) continue
    const body = getFishImage(def.bodyUrl)
    const tail = getFishImage(def.tailUrl)
    if (!body.complete || body.naturalWidth === 0) continue
    if (!tail.complete || tail.naturalWidth === 0) continue

    const bodyH = f.size * 1.3
    const bodyW = bodyH * (body.naturalWidth / body.naturalHeight)
    const tailH = bodyH * def.tailScale
    const tailW = tailH * (tail.naturalWidth / tail.naturalHeight)

    ctx.save()
    ctx.translate(f.x, f.y)
    const bob = Math.sin(f.phase) * 1.2
    ctx.translate(0, bob)
    drawFish(ctx, body, tail, f, def, bodyW, bodyH, tailW, tailH)
    ctx.restore()
  }
  ctx.restore()
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

  const attachLocalX = spriteFacesLeft
    ? -bodyW / 2 + def.attachX * bodyW
    : bodyW / 2 - def.attachX * bodyW
  const attachLocalY = -bodyH / 2 + def.attachY * bodyH

  const tailPivotInImgX = spriteFacesLeft ? def.pivotX * tailW : tailW - def.pivotX * tailW
  const tailPivotInImgY = def.pivotY * tailH

  const speed = Math.hypot(f.vx ?? 0, f.vy ?? 0)
  const beat = 1.4 + Math.min(speed * 0.4, 1.6)
  const swing = Math.sin(f.phase * beat)
  const tailSquash = 1 - Math.abs(swing) * 0.25
  const lateralShift = swing * tailW * 0.08 * (spriteFacesLeft ? 1 : -1)

  ctx.save()
  ctx.translate(attachLocalX + lateralShift, attachLocalY)
  ctx.scale(tailSquash, 1)
  ctx.drawImage(tailImg, -tailPivotInImgX, -tailPivotInImgY, tailW, tailH)
  ctx.restore()

  ctx.drawImage(bodyImg, -bodyW / 2, -bodyH / 2, bodyW, bodyH)
}
