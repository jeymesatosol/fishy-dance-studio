import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '@/components/AppShell'
import { useProjects } from '@/hooks/use-projects'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  statusColors, statusLabels, categoryLabels, priorityLabels,
} from '@/lib/aquarium/types'
import { RotateCcw } from 'lucide-react'

export const Route = createFileRoute('/projetos')({
  head: () => ({
    meta: [
      { title: 'AquaDash — Projetos' },
      { name: 'description', content: 'Lista completa dos projetos rastreados pelo AquaDash.' },
    ],
  }),
  component: ProjetosPage,
})

const engagementVariant: Record<string, string> = {
  excelente: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  bom: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  ruim: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
}

function ProjetosPage() {
  const { projects, reset } = useProjects()

  return (
    <AppShell
      title="Projetos"
      subtitle={`${projects.length} projetos rastreados`}
      actions={
        <Button variant="outline" size="sm" onClick={reset} className="border-white/10 bg-white/5">
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Restaurar mock
        </Button>
      }
    >
      <div className="overflow-hidden rounded-xl border border-white/5 bg-[#0a1b29]">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead>Projeto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead className="w-[180px]">Progresso</TableHead>
              <TableHead>Satisfação</TableHead>
              <TableHead>Engajamento</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Prazo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((p) => (
              <TableRow key={p.id} className="border-white/5">
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{categoryLabels[p.category]}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-white/10 bg-white/5 font-normal">
                    <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: statusColors[p.status] }} />
                    {statusLabels[p.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{priorityLabels[p.priority]}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={p.progress} className="h-1.5 bg-white/5" />
                    <span className="w-9 text-right text-xs text-muted-foreground">{p.progress}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{p.satisfaction}%</TableCell>
                <TableCell>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] capitalize ${engagementVariant[p.engagement]}`}>
                    {p.engagement}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{p.team}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(p.deadline).toLocaleDateString('pt-BR')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AppShell>
  )
}
