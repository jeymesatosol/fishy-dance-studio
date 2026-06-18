import type { AssetType } from './types'
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
  /** Lado para o qual o corpo aponta nativamente (cabeça à esquerda → 'left'). */
  facing: 'left' | 'right'
  /** Altura da cauda em relação à altura do corpo (visual). */
  tailScale: number
  /** Ponto de fixação da cauda no corpo (0..1, medido do lado da cabeça). */
  attachX: number
  attachY: number
  /** Pivô na imagem da cauda (0..1, medido do lado do corpo). */
  pivotX: number
  pivotY: number
}

export const fishSprites: Record<AssetType, SpriteDef> = {
  crypto: { bodyUrl: clownfishBody.url, tailUrl: clownfishTail.url, facing: 'left', tailScale: 0.462, attachX: 0.95, attachY: 0.55, pivotX: 0.08, pivotY: 0.5 },
  stock:  { bodyUrl: bluetangBody.url,  tailUrl: bluetangTail.url,  facing: 'left', tailScale: 0.418, attachX: 0.94, attachY: 0.5,  pivotX: 0.1,  pivotY: 0.5 },
  etf:    { bodyUrl: angelfishBody.url, tailUrl: angelfishTail.url, facing: 'left', tailScale: 0.528, attachX: 0.88, attachY: 0.6,  pivotX: 0.1,  pivotY: 0.5 },
  reit:   { bodyUrl: koiBody.url,       tailUrl: koiTail.url,       facing: 'left', tailScale: 0.418, attachX: 0.94, attachY: 0.5,  pivotX: 0.15, pivotY: 0.5 },
  bond:   { bodyUrl: angelfishBody.url, tailUrl: angelfishTail.url, facing: 'left', tailScale: 0.528, attachX: 0.88, attachY: 0.6,  pivotX: 0.1,  pivotY: 0.5 },
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
