// Tipos do domínio AquaDash — projetos representados como peixes

export type ProjectStatus =
  | 'planejado'
  | 'em_andamento'
  | 'revisao'
  | 'concluido'
  | 'bloqueado'
  | 'em_risco'

export type ProjectCategory = 'web' | 'mobile' | 'backend' | 'dados'

export type Priority = 'baixa' | 'media' | 'alta' | 'critica'

export type Engagement = 'ruim' | 'bom' | 'excelente'

export interface Project {
  id: string
  name: string
  category: ProjectCategory
  status: ProjectStatus
  progress: number // 0-100
  priority: Priority
  satisfaction: number // 0-100
  engagement: Engagement
  team: string
  deadline: string // ISO yyyy-mm-dd
}

export const statusColors: Record<ProjectStatus, string> = {
  planejado: '#64748b',
  em_andamento: '#3b82f6',
  revisao: '#a855f7',
  concluido: '#22c55e',
  bloqueado: '#ef4444',
  em_risco: '#f59e0b',
}

export const statusLabels: Record<ProjectStatus, string> = {
  planejado: 'Planejado',
  em_andamento: 'Em andamento',
  revisao: 'Em revisão',
  concluido: 'Concluído',
  bloqueado: 'Bloqueado',
  em_risco: 'Em risco',
}

export const categoryLabels: Record<ProjectCategory, string> = {
  web: 'Web',
  mobile: 'Mobile',
  backend: 'Backend',
  dados: 'Dados',
}

export const priorityLabels: Record<Priority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
}

export interface SceneryOptions {
  reef: boolean
  algae: boolean
  bubbles: boolean
  anchor: boolean
  shipwreck: boolean
}

export const defaultScenery: SceneryOptions = {
  reef: true,
  algae: true,
  bubbles: true,
  anchor: false,
  shipwreck: false,
}

export interface FishConfig {
  id: string
  projectId: string
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  sprite: string
  facing: 'left' | 'right'
  speed: number
  cruisingSpeed: number
  direction: number
  preferredDepth: number
  targetX: number
  targetY: number
  nextTargetChange: number
  wanderAngle: number
  phase: number
}

export interface BoidsConfig {
  separationWeight: number
  alignmentWeight: number
  cohesionWeight: number
  maxSpeed: number
  minSpeed: number
  maxForce: number
  maxTurnRate: number
  perceptionRadius: number
  separationRadius: number
}
