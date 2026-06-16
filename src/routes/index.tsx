import { createFileRoute } from '@tanstack/react-router'
import { AquariumCanvas } from '@/components/AquariumCanvas'
import { mockAssets } from '@/lib/aquarium/portfolio-data'
import { getAssetTypeLegend } from '@/lib/aquarium/fish-mapping'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'AquaDash — Portfólio Aquário' },
      { name: 'description', content: 'Visualize seu portfólio de investimentos como um aquário vivo.' },
    ],
  }),
  component: Index,
})

function Index() {
  const legend = getAssetTypeLegend()

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100">
      <header className="mx-auto mb-4 flex max-w-6xl items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AquaDash</h1>
          <p className="text-sm text-slate-400">Seu portfólio nadando livremente</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {legend.map((l) => (
            <div key={l.type} className="flex items-center gap-2 text-xs">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      </header>

      <main className="mx-auto h-[75vh] max-w-6xl">
        <AquariumCanvas assets={mockAssets} />
      </main>
    </div>
  )
}
