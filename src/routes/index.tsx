import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AppShell } from '@/components/AppShell'
import { AquariumCanvas } from '@/components/AquariumCanvas'
import { useProjects } from '@/hooks/use-projects'
import { statusColors, statusLabels, type ProjectStatus } from '@/lib/aquarium/types'
import { Activity, CheckCircle2, AlertTriangle, Sparkles, ArrowUpRight } from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'AquaDash — Dashboard de Projetos' },
      { name: 'description', content: 'Painel executivo de projetos com aquário interativo em tempo real.' },
    ],
  }),
  component: Dashboard,
})

function Dashboard() {
  const { projects } = useProjects()

  const stats = useMemo(() => {
    const total = projects.length
    const concluidos = projects.filter((p) => p.status === 'concluido').length
    const emRisco = projects.filter((p) => p.status === 'em_risco' || p.status === 'bloqueado').length
    const avgProgress = total ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / total) : 0
    const avgSatisfaction = total ? Math.round(projects.reduce((s, p) => s + p.satisfaction, 0) / total) : 0
    const engajExcelente = projects.filter((p) => p.engagement === 'excelente').length

    const statusCount: Record<ProjectStatus, number> = {
      planejado: 0, em_andamento: 0, revisao: 0, concluido: 0, bloqueado: 0, em_risco: 0,
    }
    for (const p of projects) statusCount[p.status]++

    const teamMap = new Map<string, { team: string; progress: number; count: number }>()
    for (const p of projects) {
      const cur = teamMap.get(p.team) ?? { team: p.team, progress: 0, count: 0 }
      cur.progress += p.progress
      cur.count++
      teamMap.set(p.team, cur)
    }
    const teamData = Array.from(teamMap.values()).map((t) => ({ team: t.team, progresso: Math.round(t.progress / t.count) }))

    return { total, concluidos, emRisco, avgProgress, avgSatisfaction, engajExcelente, statusCount, teamData }
  }, [projects])

  const pieData = (Object.keys(stats.statusCount) as ProjectStatus[])
    .map((k) => ({ name: statusLabels[k], value: stats.statusCount[k], color: statusColors[k], key: k }))
    .filter((d) => d.value > 0)

  return (
    <AppShell title="Dashboard" subtitle="Visão executiva dos projetos">
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard label="Projetos ativos" value={stats.total} icon={<Activity className="h-4 w-4" />} tint="from-cyan-500/20 to-cyan-500/0" />
          <KpiCard label="Concluídos" value={stats.concluidos} icon={<CheckCircle2 className="h-4 w-4" />} tint="from-emerald-500/20 to-emerald-500/0" />
          <KpiCard label="Em risco" value={stats.emRisco} icon={<AlertTriangle className="h-4 w-4" />} tint="from-amber-500/20 to-amber-500/0" />
          <KpiCard label="Progresso médio" value={`${stats.avgProgress}%`} icon={<Sparkles className="h-4 w-4" />} tint="from-blue-500/20 to-blue-500/0" />
        </div>

        {/* Aquário + Status */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-white/5 bg-[#0a1b29] lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mini aquário</CardTitle>
              <Link
                to="/aquario"
                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
              >
                Modo Kiosk <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <AquariumCanvas projects={projects} compact />
              </div>
              <Legend />
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-[#0a1b29]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Distribuição por status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                      {pieData.map((d) => <Cell key={d.key} fill={d.color} stroke="#0a1b29" strokeWidth={2} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#06121c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                {pieData.map((d) => (
                  <div key={d.key} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="ml-auto font-medium text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Times + Engajamento */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-white/5 bg-[#0a1b29] lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Progresso médio por time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.teamData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="team" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ background: '#06121c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                      cursor={{ fill: 'rgba(56,189,248,0.06)' }}
                    />
                    <Bar dataKey="progresso" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-[#0a1b29]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Engajamento &amp; satisfação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Satisfação média</span>
                  <span className="font-medium">{stats.avgSatisfaction}%</span>
                </div>
                <Progress value={stats.avgSatisfaction} className="h-2 bg-white/5" />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Engajamento excelente</span>
                  <span className="font-medium">{stats.engajExcelente} / {stats.total}</span>
                </div>
                <Progress value={stats.total ? (stats.engajExcelente / stats.total) * 100 : 0} className="h-2 bg-white/5" />
              </div>
              <div className="pt-2 text-xs text-muted-foreground">
                <p>Indicadores derivados das métricas operacionais dos projetos.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}

function KpiCard({ label, value, icon, tint }: { label: string; value: number | string; icon: React.ReactNode; tint: string }) {
  return (
    <Card className="relative overflow-hidden border-white/5 bg-[#0a1b29]">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tint}`} />
      <CardContent className="relative pt-6">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs uppercase tracking-wider">{label}</span>
          <span className="text-foreground/70">{icon}</span>
        </div>
        <div className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</div>
      </CardContent>
    </Card>
  )
}

function Legend() {
  const items = (Object.keys(statusColors) as ProjectStatus[])
  return (
    <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
      {items.map((k) => (
        <Badge key={k} variant="outline" className="border-white/10 bg-white/5 font-normal">
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: statusColors[k] }} />
          {statusLabels[k]}
        </Badge>
      ))}
    </div>
  )
}
