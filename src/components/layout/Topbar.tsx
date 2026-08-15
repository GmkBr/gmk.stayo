import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, Menu, Search } from 'lucide-react'
import { useApp } from '../../context/AppContext.tsx'
import { mockNotifications } from '../../data/mock/index.ts'
import { Breadcrumb } from '../ui/Breadcrumb.tsx'
import { Avatar } from '../ui/Avatar.tsx'
import { DropdownMenu } from '../ui/Dropdown.tsx'
import { IconButton } from '../ui/IconButton.tsx'
import { GlobalSearch } from './GlobalSearch.tsx'

const LABELS: Record<string, string> = {
  filas: 'Filas',
  reservas: 'Reservas',
}

export function Topbar() {
  const { hotel, hotels, setHotelId, user, setMobileNavOpen } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [hotelOpen, setHotelOpen] = useState(false)

  const crumbs = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean)
    if (parts.length === 0) return [{ label: 'Filas' }]
    return parts.map((part, i) => ({
      label: LABELS[part] ?? decodeURIComponent(part),
      to: i < parts.length - 1 ? `/${parts.slice(0, i + 1).join('/')}` : undefined,
    }))
  }, [location.pathname])

  const notes = mockNotifications.filter((n) => n.hotelId === hotel.id)
  const unread = notes.filter((n) => n.unread).length

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4">
      <IconButton className="lg:hidden" label="Abrir menu" onClick={() => setMobileNavOpen(true)}>
        <Menu size={18} />
      </IconButton>

      <div className="min-w-0 flex-1">
        <Breadcrumb items={[{ label: 'STAYO', to: '/' }, ...crumbs]} />
      </div>

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="hidden h-9 w-64 items-center gap-2 rounded-lg border border-line bg-canvas px-3 text-left text-[13px] text-muted transition-colors hover:border-ink/20 md:flex"
      >
        <Search size={15} />
        Buscar...
        <kbd className="ml-auto rounded border border-line bg-surface px-1.5 text-[10px] text-muted">/</kbd>
      </button>
      <IconButton className="md:hidden" label="Buscar" onClick={() => setSearchOpen(true)}>
        <Search size={16} />
      </IconButton>

      <DropdownMenu
        trigger={
          <button
            type="button"
            aria-label="Notificações"
            className="relative flex size-9 items-center justify-center rounded-lg hover:bg-canvas"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-accent" />
            )}
          </button>
        }
      >
        <div className="px-3 py-2.5 border-b border-line">
          <p className="text-[13px] font-semibold">Notificações</p>
          <p className="text-[12px] text-muted">{unread} sem ler</p>
        </div>
        <ul>
          {notes.map((note) => (
            <li key={note.id} className="border-b border-line last:border-0">
              <div className="flex gap-2 px-3 py-2.5">
                {note.unread && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />}
                <div className={note.unread ? '' : 'pl-3.5'}>
                  <p className="text-[13px] font-medium">{note.title}</p>
                  <p className="text-[12px] text-muted">{note.detail}</p>
                  <p className="mt-0.5 text-[11px] text-muted">{note.time}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </DropdownMenu>

      <div className="relative">
          <button
            type="button"
            onClick={() => setHotelOpen((v) => !v)}
            className="flex h-9 max-w-[160px] items-center gap-2 rounded-lg border border-line px-2.5 text-[13px] hover:bg-canvas sm:max-w-[220px]"
          >
          <span className="truncate font-medium">{hotel.name}</span>
          <ChevronDown size={14} className="shrink-0 text-muted" />
        </button>
        {hotelOpen && (
          <ul className="absolute right-0 z-40 mt-1 w-64 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-soft">
            {hotels.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="flex w-full flex-col px-3 py-2 text-left hover:bg-canvas"
                  onClick={() => {
                    setHotelId(item.id)
                    setHotelOpen(false)
                  }}
                >
                  <span className="text-[13px] font-medium">{item.name}</span>
                  <span className="text-[12px] text-muted">
                    {item.city}, {item.state}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-1 hover:bg-canvas"
      >
        <Avatar name={user.name} size="sm" />
        <span className="hidden text-[13px] font-medium lg:inline">{user.name}</span>
      </button>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
