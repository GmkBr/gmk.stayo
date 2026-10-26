import { Link, NavLink } from 'react-router-dom'
import { BookOpen, CalendarCheck, ListChecks, MapPin, PanelLeft, Tablet, UtensilsCrossed } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { QueueSummary } from '../../modules/activity/api.ts'
import { StayoLogo } from '../brand/StayoLogo.tsx'
import { Tooltip } from '../ui/Tooltip.tsx'
import { cn } from '../../utils/cn.ts'
import { useApp } from '../../app/useApp.ts'

type Item = { to: string; label: string; icon: LucideIcon }

const ITEMS: Item[] = [
  { to: '/filas', label: 'Filas', icon: ListChecks },
  { to: '/reservas', label: 'Reservas', icon: CalendarCheck },
  { to: '/espacos', label: 'Espaços', icon: MapPin },
  { to: '/totens', label: 'Totens', icon: Tablet },
  { to: '/cardapio', label: 'Cardápio', icon: UtensilsCrossed },
]

function filasBadge(summary: QueueSummary | null): number {
  if (!summary) return 0
  return summary.awaitingCheckin + summary.openOrders
}

function formatBadge(count: number): string {
  if (count > 99) return '99+'
  return String(count)
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileNavOpen, setMobileNavOpen, queueSummary } = useApp()
  const collapsed = sidebarCollapsed && !mobileNavOpen
  const pendingFilas = filasBadge(queueSummary)

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-line bg-surface transition-[width] duration-200',
        collapsed ? 'w-[72px] overflow-visible' : 'w-[250px]',
      )}
    >
      <div
        className={cn(
          'flex h-14 shrink-0 items-center px-4',
          collapsed ? 'justify-center px-2' : 'justify-between',
        )}
      >
        <Link to="/hub" aria-label="Trocar superfície">
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

      <nav
        className={cn(
          'flex flex-col py-3',
          collapsed ? 'shrink-0 overflow-visible' : 'min-h-0 flex-1 overflow-y-auto scrollbar-thin',
        )}
        aria-label="Operação"
      >
        <div className={cn(collapsed ? 'w-full px-2' : 'px-3')}>
          {!collapsed && (
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted/80">
              Operação
            </p>
          )}
          <ul className={cn('flex flex-col gap-1', collapsed && 'items-center')}>
            {ITEMS.map((item) => {
              const badge = item.to === '/filas' ? pendingFilas : 0
              const link = (
                <NavLink
                  to={item.to}
                  aria-label={collapsed ? item.label : undefined}
                  className={({ isActive }) => {
                    const base = cn(
                      'flex items-center rounded-lg text-[13px] font-medium transition-colors duration-150',
                      collapsed
                        ? 'size-10 shrink-0 justify-center p-0'
                        : 'gap-3 border-l-2 py-2 px-2.5',
                    )
                    if (isActive) {
                      return cn(
                        base,
                        'bg-accent-soft font-semibold text-ink',
                        !collapsed && 'border-accent pl-[calc(0.625rem-2px)]',
                      )
                    }
                    return cn(
                      base,
                      collapsed
                        ? 'text-muted hover:bg-canvas hover:text-ink'
                        : 'border-transparent text-muted hover:bg-canvas hover:text-ink',
                    )
                  }}
                >
                  <span className="relative inline-flex shrink-0 items-center justify-center">
                    <item.icon size={18} strokeWidth={1.75} className="shrink-0" />
                    {badge > 0 && collapsed && (
                      <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-accent ring-2 ring-surface" />
                    )}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="min-w-0 flex-1">{item.label}</span>
                      {badge > 0 && (
                        <span className="flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                          {formatBadge(badge)}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )

              return (
                <li key={item.to} className={cn(collapsed && 'flex w-full justify-center')}>
                  {collapsed ? (
                    <Tooltip content={item.label} className="inline-flex">
                      {link}
                    </Tooltip>
                  ) : (
                    link
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      <div
        className={cn(
          'shrink-0 border-t border-line p-3',
          collapsed && 'mt-auto flex flex-col items-center gap-1',
        )}
      >
        {collapsed ? (
          <>
            <Tooltip content="Documentação" side="top">
              <Link
                to="/docs"
                aria-label="Documentação"
                className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-canvas"
              >
                <BookOpen size={16} />
              </Link>
            </Tooltip>
            <Tooltip content="Expandir menu" side="top">
              <button
                type="button"
                aria-label="Expandir menu"
                onClick={toggleSidebar}
                className="hidden size-8 items-center justify-center rounded-lg text-muted hover:bg-canvas lg:flex"
              >
                <PanelLeft size={16} />
              </button>
            </Tooltip>
          </>
        ) : (
          <div className="flex flex-col gap-1 px-1">
            <Link to="/hub" className="text-[12px] text-muted hover:text-ink">
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
