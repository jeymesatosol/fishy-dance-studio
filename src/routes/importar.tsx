import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProjects } from '@/hooks/use-projects'
import type { Engagement, Priority, Project, ProjectCategory, ProjectStatus } from '@/lib/aquarium/types'
import { Upload, FileCheck2, AlertCircle, Download } from 'lucide-react'

export const Route = createFileRoute('/importar')({
  head: () => ({
    meta: [
      { title: 'AquaDash — Importar CSV' },
      { name: 'description', content: 'Importe projetos via CSV para popular o aquário.' },
    ],
  }),
  component: ImportarPage,
})

const VALID_STATUS: ProjectStatus[] = ['planejado', 'em_andamento', 'revisao', 'concluido', 'bloqueado', 'em_risco']
const VALID_CATEGORY: ProjectCategory[] = ['web', 'mobile', 'backend', 'dados']
const VALID_PRIORITY: Priority[] = ['baixa', 'media', 'alta', 'critica']
const VALID_ENGAGEMENT: Engagement[] = ['ruim', 'bom', 'excelente']

const SAMPLE_CSV = `id,name,category,status,progress,priority,satisfaction,engagement,team,deadline
p1,Portal do Cliente,web,em_andamento,72,alta,88,excelente,Atlas,2026-08-15
p2,App de Pedidos,mobile,em_risco,45,critica,62,bom,Nova,2026-07-30
p3,Gateway Pagamentos,backend,concluido,100,alta,95,excelente,Vega,2026-05-20`

function ImportarPage() {
  const { projects, replace } = useProjects()
  const inputRef = useRef<HTMLInputElement>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState<string | null>(null)

  const handleFile = (file: File) => {
    setErrors([])
    setSuccess(null)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const errs: string[] = []
        const parsed: Project[] = []
        const rows = res.data as Record<string, string>[]
        rows.forEach((row, idx) => {
          const line = idx + 2
          const id = (row.id ?? '').trim()
          const name = (row.name ?? '').trim()
          const category = (row.category ?? '').trim() as ProjectCategory
          const status = (row.status ?? '').trim() as ProjectStatus
          const priority = (row.priority ?? '').trim() as Priority
          const engagement = (row.engagement ?? '').trim() as Engagement
          const team = (row.team ?? '').trim()
          const deadline = (row.deadline ?? '').trim()
          const progress = Number(row.progress)
          const satisfaction = Number(row.satisfaction)

          if (!id || !name) return errs.push(`Linha ${line}: id e name são obrigatórios.`)
          if (!VALID_CATEGORY.includes(category)) return errs.push(`Linha ${line}: categoria "${row.category}" inválida.`)
          if (!VALID_STATUS.includes(status)) return errs.push(`Linha ${line}: status "${row.status}" inválido.`)
          if (!VALID_PRIORITY.includes(priority)) return errs.push(`Linha ${line}: prioridade "${row.priority}" inválida.`)
          if (!VALID_ENGAGEMENT.includes(engagement)) return errs.push(`Linha ${line}: engajamento "${row.engagement}" inválido.`)
          if (Number.isNaN(progress) || progress < 0 || progress > 100) return errs.push(`Linha ${line}: progresso inválido.`)
          if (Number.isNaN(satisfaction) || satisfaction < 0 || satisfaction > 100) return errs.push(`Linha ${line}: satisfação inválida.`)

          parsed.push({ id, name, category, status, progress, priority, satisfaction, engagement, team, deadline })
        })

        if (errs.length) {
          setErrors(errs.slice(0, 10))
          return
        }
        if (parsed.length === 0) {
          setErrors(['Nenhuma linha válida encontrada no CSV.'])
          return
        }
        replace(parsed)
        setSuccess(`${parsed.length} projetos importados com sucesso.`)
      },
      error: (err) => setErrors([`Falha ao ler CSV: ${err.message}`]),
    })
  }

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'aquadash-projetos-exemplo.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AppShell title="Importar CSV" subtitle={`${projects.length} projetos atualmente carregados`}>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-white/5 bg-[#0a1b29] lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Enviar arquivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const f = e.dataTransfer.files[0]
                if (f) handleFile(f)
              }}
              className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] p-12 text-center transition hover:border-cyan-500/50 hover:bg-cyan-500/[0.04]"
            >
              <div className="grid h-12 w-12 place-items-center rounded-full bg-cyan-500/10 text-cyan-400 transition group-hover:bg-cyan-500/20">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Clique ou arraste o CSV aqui</p>
                <p className="mt-1 text-xs text-muted-foreground">Colunas obrigatórias: id, name, category, status, progress, priority, satisfaction, engagement, team, deadline</p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleFile(f)
                  e.target.value = ''
                }}
              />
            </div>

            {success && (
              <div className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                <FileCheck2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {errors.length > 0 && (
              <div className="space-y-1 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
                <div className="flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4" /> Erros de validação
                </div>
                <ul className="ml-6 list-disc text-xs text-rose-200/80">
                  {errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-[#0a1b29]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Formato esperado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <ul className="space-y-1.5">
              <li><b className="text-foreground">category:</b> web, mobile, backend, dados</li>
              <li><b className="text-foreground">status:</b> planejado, em_andamento, revisao, concluido, bloqueado, em_risco</li>
              <li><b className="text-foreground">priority:</b> baixa, media, alta, critica</li>
              <li><b className="text-foreground">engagement:</b> ruim, bom, excelente</li>
              <li><b className="text-foreground">progress / satisfaction:</b> 0 a 100</li>
              <li><b className="text-foreground">deadline:</b> AAAA-MM-DD</li>
            </ul>
            <Button onClick={downloadSample} variant="outline" size="sm" className="w-full border-white/10 bg-white/5">
              <Download className="mr-1.5 h-3.5 w-3.5" /> Baixar exemplo
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
