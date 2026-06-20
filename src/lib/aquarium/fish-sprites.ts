import type { ProjectCategory } from './types'
import clownfishBody from '@/assets/fish/clownfish-body.png.asset.json'
import clownfishTail from '@/assets/fish/clownfish-tail.png.asset.json'
import angelfishBody from '@/assets/fish/angelfish-body.png.asset.json'
import angelfishTail from '@/assets/fish/angelfish-tail.png.asset.json'
import koiBody from '@/assets/fish/koi-body.png.asset.json'
import koiTail from '@/assets/fish/koi-tail.png.asset.json'
import bluetangBody from '@/assets/fish/bluetang-body.png.asset.json'
import bluetangTail from '@/assets/fish/bluetang-tail.png.asset.json'

export interface SpriteDef {
  bodyUrl: string
  tailUrl: string
  facing: 'left' | 'right'
  tailScale: number
  attachX: number
  attachY: number
  pivotX: number
  pivotY: number
}

export const fishSprites: Record<ProjectCategory, SpriteDef> = {
  mobile:  { bodyUrl: clownfishBody.url, tailUrl: clownfishTail.url, facing: 'left', tailScale: 0.462, attachX: 0.95, attachY: 0.55, pivotX: 0.08, pivotY: 0.5 },
  backend: { bodyUrl: bluetangBody.url,  tailUrl: bluetangTail.url,  facing: 'left', tailScale: 0.418, attachX: 0.94, attachY: 0.5,  pivotX: 0.1,  pivotY: 0.5 },
  web:     { bodyUrl: angelfishBody.url, tailUrl: angelfishTail.url, facing: 'left', tailScale: 0.528, attachX: 0.88, attachY: 0.6,  pivotX: 0.1,  pivotY: 0.5 },
  dados:   { bodyUrl: koiBody.url,       tailUrl: koiTail.url,       facing: 'left', tailScale: 0.418, attachX: 0.94, attachY: 0.5,  pivotX: 0.15, pivotY: 0.5 },
}

const cache = new Map<string, HTMLImageElement>()

export function getFishImage(url: string): HTMLImageElement {
  let img = cache.get(url)
  if (!img) {
    img = new Image()
    img.src = url
    cache.set(url, img)
  }
  return img
}

export function spriteDefForBody(bodyUrl: string): SpriteDef | undefined {
  for (const def of Object.values(fishSprites)) {
    if (def.bodyUrl === bodyUrl) return def
  }
  return undefined
}

export function preloadFishImages() {
  for (const def of Object.values(fishSprites)) {
    getFishImage(def.bodyUrl)
    getFishImage(def.tailUrl)
  }
}
