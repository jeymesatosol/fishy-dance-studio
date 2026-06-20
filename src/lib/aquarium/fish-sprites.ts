import type { ProjectCategory } from './types'
import clownfishBody from '@/assets/fish/palhaco/corpo.png'
import clownfishTail from '@/assets/fish/palhaco/cauda.png'

import bluetangBody from '@/assets/fish/azul/corpo.png'
import bluetangTail from '@/assets/fish/azul/cauda.png'

import koiBody from '@/assets/fish/carpa/corpo.png'
import koiTail from '@/assets/fish/carpa/cauda.png'

import angelfishBody from '@/assets/fish/dourado/corpo.png'
import angelfishTail from '@/assets/fish/dourado/cauda.png'

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
  mobile:  { bodyUrl: clownfishBody, tailUrl: clownfishTail, facing: 'left', tailScale: 0.462, attachX: 0.95, attachY: 0.55, pivotX: 0.08, pivotY: 0.5 },
  backend: { bodyUrl: bluetangBody,  tailUrl: bluetangTail,  facing: 'left', tailScale: 0.35, attachX: 0.94, attachY: 0.5,  pivotX: 0.1,  pivotY: 0.5 },
  web:     { bodyUrl: angelfishBody, tailUrl: angelfishTail, facing: 'left', tailScale: 0.38, attachX: 0.84, attachY: 0.58,  pivotX: 0.1,  pivotY: 0.5 },
  dados:   { bodyUrl: koiBody,       tailUrl: koiTail,       facing: 'left', tailScale: 0.6, attachX: 0.97, attachY: 0.449,  pivotX: 0.15, pivotY: 0.5 },
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
