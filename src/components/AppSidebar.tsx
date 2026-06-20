import { Link, useRouterState } from '@tanstack/react-router'
import { LayoutDashboard, Fish, FolderKanban, Upload, Waves } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

const items = [
  { title: 'Dashboard',  url: '/',          icon: LayoutDashboard },
  { title: 'Aquário',    url: '/aquario',   icon: Fish },
  { title: 'Projetos',   url: '/projetos',  icon: FolderKanban },
  { title: 'Importar',   url: '/importar',  icon: Upload },
] as const

export function AppSidebar() {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'
  const pathname = useRouterState({ select: (r) => r.location.pathname })

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5">
      <SidebarHeader className="px-3 pb-2 pt-4">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 text-white shadow-lg shadow-cyan-500/20">
            <Waves className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-semibold text-foreground">AquaDash</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">v3 · projetos vivos</div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = item.url === '/' ? pathname === '/' : pathname.startsWith(item.url)
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
