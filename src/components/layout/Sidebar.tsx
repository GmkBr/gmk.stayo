import { Link, NavLink } from 'react-router-dom'
import { BookOpen, CalendarCheck, ListChecks, PanelLeft } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { StayoLogo } from '../brand/StayoLogo.tsx'
import { Avatar } from '../ui/Avatar.tsx'
import { Tooltip } from '../ui/Tooltip.tsx'
import { cn } from '../../utils/cn.ts'
import { useApp } from '../../context/AppContext.tsx'

type Item = { to: string; label: string; icon: LucideIcon }

const ITEMS: Item[] = [
  { to: '/filas', label: 'Filas', icon: ListChecks },
  { to: '/reservas', label: 'Reservas', icon: CalendarCheck },
]

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
        <Link to="/" aria-label="Trocar superfície">
          <StayoLogo collapsed={collapsed} />
        </Link>
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
        <div className="px-3">
          {!collapsed && (
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted/80">Console</p>
          )}
          <ul className="flex flex-col gap-0.5">
            {ITEMS.map((item) => {
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
                  {collapsed ? <Tooltip content={item.label}>{link}</Tooltip> : link}
                </li>
              )
            })}
          </ul>
        </div>
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
          <>
            <Tooltip content="Documentação">
              <Link
                to="/docs"
                aria-label="Documentação"
                className="mt-3 flex size-8 items-center justify-center rounded-lg text-muted hover:bg-canvas"
              >
                <BookOpen size={16} />
              </Link>
            </Tooltip>
            <button
              type="button"
              aria-label="Expandir menu"
              onClick={toggleSidebar}
              className="mt-1 hidden size-8 items-center justify-center rounded-lg text-muted hover:bg-canvas lg:flex"
            >
              <PanelLeft size={16} />
            </button>
          </>
        )}
        {!collapsed && (
          <div className="mt-2 flex flex-col gap-1 px-1">
            <Link to="/" className="text-[12px] text-muted hover:text-ink">
              Trocar superfície
            </Link>
            <Link to="/docs" className="text-[12px] text-muted hover:text-ink">
              Documentação
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}
