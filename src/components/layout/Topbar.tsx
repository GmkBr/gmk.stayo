import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Menu, Search, Settings } from 'lucide-react'
import { useApp } from '../../app/useApp.ts'
import { useAuth } from '../../auth/AuthContext.tsx'
import { Breadcrumb } from '../ui/Breadcrumb.tsx'
import { Avatar } from '../ui/Avatar.tsx'
import { IconButton } from '../ui/IconButton.tsx'
import { GlobalSearch } from './GlobalSearch.tsx'

const LABELS: Record<string, string> = {
  filas: 'Filas',
  reservas: 'Reservas',
  espacos: 'Espaços',
  totens: 'Totens',
  cardapio: 'Cardápio',
}

export function Topbar() {
  const { hotel, user, setMobileNavOpen } = useApp()
  const { signOut, usingDevToken } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)

  const crumbs = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean)
    if (parts.length === 0) return [{ label: 'Filas' }]
    return parts.map((part, i) => ({
      label: LABELS[part] ?? decodeURIComponent(part),
      to: i < parts.length - 1 ? `/${parts.slice(0, i + 1).join('/')}` : undefined,
    }))
  }, [location.pathname])

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

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => navigate('/hoteis')}
          className="flex h-9 max-w-[160px] items-center gap-2 rounded-lg border border-line px-2.5 text-[13px] hover:bg-canvas sm:max-w-[220px]"
          title="Trocar hotel"
        >
          <span className="truncate font-medium">{hotel.name}</span>
          <ChevronDown size={14} className="shrink-0 text-muted" />
        </button>
        <IconButton
          label="Configurar hotel"
          onClick={() => navigate(`/hoteis/${hotel.id}/editar`, { state: { returnTo: location.pathname } })}
        >
          <Settings size={16} />
        </IconButton>
      </div>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-1 hover:bg-canvas"
        title={usingDevToken ? 'Token local de desenvolvimento' : user.email}
      >
        <Avatar name={user.name} size="sm" />
        <span className="hidden text-[13px] font-medium lg:inline">{user.name}</span>
      </button>

      <IconButton
        label="Sair"
        onClick={() => {
          void signOut().then(() => navigate('/login'))
        }}
      >
        <LogOut size={16} />
      </IconButton>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
