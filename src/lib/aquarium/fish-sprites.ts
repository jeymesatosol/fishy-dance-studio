import type { AssetType } from './types'
import clownfish from '@/assets/fish/clownfish.png.asset.json'
import bluetang from '@/assets/fish/bluetang.png.asset.json'
import angelfish from '@/assets/fish/angelfish.png.asset.json'
import koi from '@/assets/fish/koi.png.asset.json'

export interface SpriteDef {
  url: string
  facing: 'left' | 'right'
  /** proporção largura/altura visual aproximada para escalar o sprite com base no `size` (altura) */
  aspect: number
}

export const fishSprites: Record<AssetType, SpriteDef> = {
  crypto: { url: clownfish.url, facing: 'right', aspect: 1.5 },
  stock:  { url: bluetang.url,  facing: 'left',  aspect: 1.55 },
  etf:    { url: angelfish.url, facing: 'left',  aspect: 1.4 },
  reit:   { url: koi.url,       facing: 'left',  aspect: 1.55 },
  bond:   { url: angelfish.url, facing: 'left',  aspect: 1.4 },
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

export function preloadFishImages() {
  for (const def of Object.values(fishSprites)) getFishImage(def.url)
}
