import type { Asset, Portfolio } from '@/lib/aquarium/types'

export const mockAssets: Asset[] = [
  { id: '1', symbol: 'BTC', name: 'Bitcoin', type: 'crypto', quantity: 0.15, avgPrice: 180000, currentPrice: 520000, change24h: 4.5, change30d: 15.2, volatility: 0.72, volume: 28000000000 },
  { id: '2', symbol: 'ETH', name: 'Ethereum', type: 'crypto', quantity: 2.5, avgPrice: 8500, currentPrice: 18200, change24h: 3.8, change30d: 22.1, volatility: 0.68, volume: 12000000000 },
  { id: '3', symbol: 'IVVB11', name: 'iShares S&P 500', type: 'etf', quantity: 80, avgPrice: 285, currentPrice: 312.5, change24h: 0.8, change30d: 4.2, volatility: 0.22, volume: 8500000 },
  { id: '4', symbol: 'ITUB4', name: 'Itaú Unibanco PN', type: 'stock', quantity: 200, avgPrice: 28, currentPrice: 32.45, change24h: 0.5, change30d: 3.2, volatility: 0.25, volume: 28000000 },
  { id: '5', symbol: 'WEGE3', name: 'WEG ON', type: 'stock', quantity: 75, avgPrice: 42, currentPrice: 48.9, change24h: 1.8, change30d: 9.2, volatility: 0.32, volume: 15000000 },
  { id: '6', symbol: 'SOL', name: 'Solana', type: 'crypto', quantity: 12, avgPrice: 90, currentPrice: 145, change24h: -2.1, change30d: 8.4, volatility: 0.85, volume: 3500000000 },
  { id: '7', symbol: 'HGLG11', name: 'CSHG Logística', type: 'reit', quantity: 50, avgPrice: 165, currentPrice: 172, change24h: 0.2, change30d: 1.8, volatility: 0.15, volume: 1200000 },
  { id: '8', symbol: 'TESOURO', name: 'Tesouro IPCA+', type: 'bond', quantity: 10, avgPrice: 3200, currentPrice: 3380, change24h: 0.05, change30d: 0.9, volatility: 0.05, volume: 500000 },
]

export function calculatePortfolio(assets: Asset[]): Portfolio {
  const totalValue = assets.reduce((s, a) => s + a.quantity * a.currentPrice, 0)
  const change24h = assets.reduce((s, a) => s + a.change24h * ((a.quantity * a.currentPrice) / totalValue), 0)
  const change30d = assets.reduce((s, a) => s + a.change30d * ((a.quantity * a.currentPrice) / totalValue), 0)
  return { totalValue, change24h, change30d, assets }
}
