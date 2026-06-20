import type { Project } from './types'

export const mockProjects: Project[] = [
  { id: 'p1', name: 'Portal do Cliente',     category: 'web',     status: 'em_andamento', progress: 72, priority: 'alta',    satisfaction: 88, engagement: 'excelente', team: 'Atlas',  deadline: '2026-08-15' },
  { id: 'p2', name: 'App de Pedidos',        category: 'mobile',  status: 'em_risco',     progress: 45, priority: 'critica', satisfaction: 62, engagement: 'bom',       team: 'Nova',   deadline: '2026-07-30' },
  { id: 'p3', name: 'Gateway de Pagamentos', category: 'backend', status: 'concluido',    progress: 100, priority: 'alta',   satisfaction: 95, engagement: 'excelente', team: 'Vega',   deadline: '2026-05-20' },
  { id: 'p4', name: 'Pipeline de Analytics', category: 'dados',   status: 'em_andamento', progress: 58, priority: 'media',   satisfaction: 81, engagement: 'bom',       team: 'Orion',  deadline: '2026-09-10' },
  { id: 'p5', name: 'Refatoração UI Kit',    category: 'web',     status: 'revisao',      progress: 86, priority: 'media',   satisfaction: 90, engagement: 'excelente', team: 'Atlas',  deadline: '2026-07-05' },
  { id: 'p6', name: 'Push Notifications',    category: 'mobile',  status: 'planejado',    progress: 8,  priority: 'baixa',   satisfaction: 70, engagement: 'bom',       team: 'Nova',   deadline: '2026-10-22' },
  { id: 'p7', name: 'Migração de Dados',     category: 'dados',   status: 'bloqueado',    progress: 30, priority: 'critica', satisfaction: 48, engagement: 'ruim',      team: 'Orion',  deadline: '2026-08-01' },
  { id: 'p8', name: 'API de Catálogo',       category: 'backend', status: 'em_andamento', progress: 64, priority: 'alta',    satisfaction: 84, engagement: 'bom',       team: 'Vega',   deadline: '2026-08-28' },
  { id: 'p9', name: 'Painel Admin',          category: 'web',     status: 'em_andamento', progress: 40, priority: 'media',   satisfaction: 76, engagement: 'bom',       team: 'Atlas',  deadline: '2026-09-18' },
  { id: 'p10', name: 'Onboarding Mobile',    category: 'mobile',  status: 'concluido',    progress: 100, priority: 'media',  satisfaction: 92, engagement: 'excelente', team: 'Nova',   deadline: '2026-06-01' },
  { id: 'p11', name: 'Cache Distribuído',    category: 'backend', status: 'em_risco',     progress: 55, priority: 'alta',    satisfaction: 65, engagement: 'bom',       team: 'Vega',   deadline: '2026-07-25' },
  { id: 'p12', name: 'Modelo de ML',         category: 'dados',   status: 'em_andamento', progress: 38, priority: 'alta',    satisfaction: 78, engagement: 'excelente', team: 'Orion',  deadline: '2026-09-30' },
]
