import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { AquariumCanvas } from '@/components/AquariumCanvas'
import { useProjects } from '@/hooks/use-projects'
import { defaultScenery, type SceneryOptions } from '@/lib/aquarium/types'
import { Settings2, ArrowLeft, X } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

export const Route = createFileRoute('/aquario')({
  head: () => ({
    meta: [
      { title: 'AquaDash — Aquário em modo kiosk' },
      { name: 'description', content: 'Aquário em tela cheia para apresentações e dashboards executivos.' },
    ],
  }),
  component: KioskPage,
})

function KioskPage() {
  const { projects } = useProjects()
  const [scenery, setScenery] = useState<SceneryOptions>(defaultScenery)
  const [showConfig, setShowConfig] = useState(false)

  const toggle = (k: keyof SceneryOptions) => setScenery((s) => ({ ...s, [k]: !s[k] }))

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <AquariumCanvas projects={projects} scenery={scenery} />

      <Link
        to="/"
        className="group absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs text-white/80 backdrop-blur hover:bg-black/60 hover:text-white"
        aria-label="Voltar ao dashboard"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
        Dashboard
      </Link>

      <button
        onClick={() => setShowConfig((v) => !v)}
        className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white/80 backdrop-blur hover:bg-black/60 hover:text-white"
        aria-label="Configurar cenário"
      >
        <Settings2 className="h-4 w-4" />
      </button>

      {showConfig && (
        <div className="absolute right-4 top-16 z-20 w-64 rounded-xl border border-white/10 bg-black/70 p-4 text-sm text-white shadow-2xl backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/70">Cenário</h3>
            <button onClick={() => setShowConfig(false)} className="text-white/50 hover:text-white" aria-label="Fechar">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {([
              ['reef', 'Recife'],
              ['algae', 'Algas'],
              ['bubbles', 'Bolhas'],
              ['anchor', 'Âncora'],
              ['shipwreck', 'Navio naufragado'],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between gap-2">
                <span className="text-white/80">{label}</span>
                <Switch checked={scenery[key]} onCheckedChange={() => toggle(key)} />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
