import type { Project } from './types'

export const mockProjects: Project[] = [
  { id: 'p1', name: 'Portal do Cliente',     category: 'web',     status: 'em_andamento', progress: 72, priority: 'alta',    satisfaction: 88, engagement: 'excelente', team: 'Atlas',  deadline: '2026-08-15' },
  { id: 'p2', name: 'App de Pedidos',        category: 'mobile',  status: 'em_risco',     progress: 45, priority: 'critica', satisfaction: 62, engagement: 'bom',       team: 'Nova',   deadline: '2026-07-30' },
  { id: 'p3', name: 'Gateway de Pagamentos', category: 'backend', status: 'concluido',    progress: 100, priority: 'alta',   satisfaction: 95, engagement: 'excelente', team: 'Vega',   deadline: '2026-05-20' },
  { id: 'p12', name: 'Modelo de ML',         category: 'dados',   status: 'em_andamento', progress: 38, priority: 'alta',    satisfaction: 78, engagement: 'excelente', team: 'Orion',  deadline: '2026-09-30' },
]
