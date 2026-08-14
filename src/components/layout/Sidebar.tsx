import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  BedDouble,
  CalendarCheck,
  LayoutDashboard,
  MonitorSmartphone,
  Settings,
  Smartphone,
  Sparkles,
  UtensilsCrossed,
  Users,
  Wrench,
  PanelLeft,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { StayoLogo } from '../brand/StayoLogo.tsx'
import { Avatar } from '../ui/Avatar.tsx'
import { Tooltip } from '../ui/Tooltip.tsx'
import { cn } from '../../utils/cn.ts'
import { useApp } from '../../context/AppContext.tsx'

type Item = { to: string; label: string; icon: LucideIcon }

const OVERVIEW: Item[] = [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }]

const OPERATION: Item[] = [
  { to: '/reservations', label: 'Reservas', icon: CalendarCheck },
  { to: '/guests', label: 'Hóspedes', icon: Users },
  { to: '/rooms', label: 'Quartos', icon: BedDouble },
  { to: '/housekeeping', label: 'Governança', icon: Sparkles },
  { to: '/maintenance', label: 'Manutenção', icon: Wrench },
]

const EXPERIENCE: Item[] = [
  { to: '/services', label: 'Serviços', icon: UtensilsCrossed },
  { to: '/guest', label: 'Guest Portal', icon: Smartphone },
  { to: '/self-service', label: 'Autoatendimento', icon: MonitorSmartphone },
]

const MANAGEMENT: Item[] = [
  { to: '/reports', label: 'Relatórios', icon: BarChart3 },
  { to: '/settings', label: 'Configurações', icon: Settings },
]

function NavSection({ title, items, collapsed }: { title: string; items: Item[]; collapsed: boolean }) {
  return (
    <div className="px-3">
      {!collapsed && (
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted/80">{title}</p>
      )}
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => {
          const link = (
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors duration-150',
                  collapsed && 'justify-center px-0',
                  isActive ? 'bg-canvas text-ink' : 'text-muted hover:bg-canvas hover:text-ink',
                )
              }
            >
              <item.icon size={18} strokeWidth={1.75} />
              {!collapsed && item.label}
            </NavLink>
          )

          return (
            <li key={item.to}>
              {collapsed ? (
                <Tooltip content={item.label}>{link}</Tooltip>
              ) : (
                link
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, user, mobileNavOpen, setMobileNavOpen } = useApp()
  const collapsed = sidebarCollapsed && !mobileNavOpen

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-line bg-surface transition-[width] duration-200',
        collapsed ? 'w-[72px]' : 'w-[250px]',
      )}
    >
      <div className={cn('flex h-14 items-center justify-between px-4', collapsed && 'justify-center px-2')}>
        <StayoLogo collapsed={collapsed} />
        {!collapsed && (
          <button
            type="button"
            aria-label="Recolher menu"
            onClick={() => {
              if (mobileNavOpen) setMobileNavOpen(false)
              else toggleSidebar()
            }}
            className="hidden size-8 items-center justify-center rounded-lg text-muted hover:bg-canvas lg:flex"
          >
            <PanelLeft size={16} />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto py-3 scrollbar-thin">
        <NavSection title="Overview" items={OVERVIEW} collapsed={collapsed} />
        <NavSection title="Operação" items={OPERATION} collapsed={collapsed} />
        <NavSection title="Experiência" items={EXPERIENCE} collapsed={collapsed} />
        <NavSection title="Gestão" items={MANAGEMENT} collapsed={collapsed} />
      </nav>

      <div className={cn('border-t border-line p-3', collapsed && 'flex flex-col items-center')}>
        {collapsed ? (
          <Tooltip content={`${user.name} · ${user.role}`}>
            <Avatar name={user.name} size="sm" />
          </Tooltip>
        ) : (
          <div className="flex items-center gap-2.5 rounded-lg px-1 py-1">
            <Avatar name={user.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold">{user.name}</p>
              <p className="truncate text-[12px] text-muted">{user.role}</p>
            </div>
          </div>
        )}
        {collapsed && (
          <button
            type="button"
            aria-label="Expandir menu"
            onClick={toggleSidebar}
            className="mt-3 hidden size-8 items-center justify-center rounded-lg text-muted hover:bg-canvas lg:flex"
          >
            <PanelLeft size={16} />
          </button>
        )}
      </div>
    </aside>
  )
}
