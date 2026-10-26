import { useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, MapPin, Plus, Settings } from 'lucide-react'
import { useApp } from '../../app/useApp.ts'
import { HotelHubShell } from '../../components/hotels/HotelHubShell.tsx'
import { Button } from '../../components/ui/Button.tsx'
import type { Hotel } from '../../modules/hotels/model.ts'

export function HotelSelectPage() {
  const { hotels, hotelId, setHotelId, bootstrapping, bootstrapError, retryBootstrap } = useApp()
  const navigate = useNavigate()

  function enterConsole(id: string) {
    setHotelId(id)
    navigate('/filas', { replace: true })
  }

  const showList = !bootstrapping && !bootstrapError && hotels.length > 0
  const showEmpty = !bootstrapping && !bootstrapError && hotels.length === 0

  return (
    <HotelHubShell>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.045em]">Qual hotel hoje?</h1>
          <p className="mt-2 max-w-lg text-[15px] text-muted">
            Escolha o contexto operacional. Filas, reservas e totens seguem o hotel selecionado.
          </p>
        </div>
        {!bootstrapping && !bootstrapError && (
          <Button size="lg" className="shrink-0" onClick={() => navigate('/hoteis/novo')}>
            <Plus size={16} />
            Novo hotel
          </Button>
        )}
      </div>

      {bootstrapping && (
        <div
          aria-busy="true"
          aria-live="polite"
          className="rounded-2xl border border-line bg-surface px-6 py-10 text-center shadow-soft"
        >
          <p className="text-[14px] text-muted">Carregando seus hotéis…</p>
        </div>
      )}

      {bootstrapError && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-[13px] font-medium text-red-800">Não conseguimos carregar seus hotéis</p>
            <p className="mt-0.5 text-[13px] text-red-700">{bootstrapError}</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="shrink-0"
            disabled={bootstrapping}
            onClick={() => void retryBootstrap()}
          >
            {bootstrapping ? 'Tentando…' : 'Tentar novamente'}
          </Button>
        </div>
      )}

      {showEmpty && (
        <div className="flex flex-col items-center rounded-2xl border border-line bg-surface px-6 py-16 text-center shadow-soft">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#0B3D5C,#1F6F8B)] text-white shadow-soft">
            <Building2 size={26} strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-semibold tracking-[-0.03em]">Nenhum hotel ainda</h2>
          <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-muted">
            Cadastre o primeiro hotel em poucos passos. Você vira administrador e entra direto no console.
          </p>
          <Button size="lg" className="mt-6" onClick={() => navigate('/hoteis/novo')}>
            <Plus size={16} />
            Cadastrar hotel
          </Button>
        </div>
      )}

      {showList && (
        <ul className="flex flex-col gap-3">
          {hotels.map((item) => (
            <HotelCard
              key={item.id}
              hotel={item}
              active={item.id === hotelId}
              onEnter={() => enterConsole(item.id)}
              onEdit={() => navigate(`/hoteis/${item.id}/editar`)}
            />
          ))}
        </ul>
      )}
    </HotelHubShell>
  )
}

function HotelCard({
  hotel,
  active,
  onEnter,
  onEdit,
}: {
  readonly hotel: Hotel
  readonly active: boolean
  readonly onEnter: () => void
  readonly onEdit: () => void
}) {
  const { primaryColor, secondaryColor, accentColor } = hotel.brand
  const primary = primaryColor || '#0B3D5C'
  const secondary = secondaryColor || '#1F6F8B'
  const accent = accentColor || '#F4A261'
  const iconBg = primary.toUpperCase() === '#FFFFFF' || primary.toUpperCase() === '#FFF' ? secondary : primary
  const iconFg = primary.toUpperCase() === '#FFFFFF' || primary.toUpperCase() === '#FFF' ? '#FFFFFF' : '#FFFFFF'

  return (
    <li
      className={`group flex overflow-hidden rounded-2xl border bg-surface shadow-soft transition-[border-color,box-shadow] hover:border-ink/15 hover:shadow-[0_8px_24px_rgb(17_24_39_/_0.08)] motion-reduce:transition-none ${
        active ? 'border-ink/25 ring-2 ring-ink/10' : 'border-line'
      }`}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 px-4 py-4 text-left sm:px-5"
        onClick={onEnter}
        aria-label={`Entrar no console — ${hotel.name}, ${hotel.city}`}
      >
        <div
          className="-my-4 -ml-4 flex w-2.5 shrink-0 flex-col self-stretch sm:-ml-5 sm:w-3"
          aria-hidden
          title="Cores da marca"
        >
          <BrandStripe color={primary} label="Primária" />
          <BrandStripe color={secondary} label="Secundária" />
          <BrandStripe color={accent} label="Destaque" />
        </div>

        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-xl shadow-soft ring-1 ring-ink/10"
          style={{ background: iconBg, color: iconFg }}
        >
          <Building2 size={20} strokeWidth={1.75} aria-hidden />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate text-[17px] font-semibold tracking-[-0.03em]">{hotel.name}</span>
            {active && (
              <span
                className="inline-flex shrink-0 rounded-full bg-canvas px-2 py-0.5 text-[11px] font-semibold text-ink/70"
                title="Este hotel foi usado por último neste dispositivo"
              >
                Último usado
              </span>
            )}
          </span>
          <span className="mt-0.5 inline-flex items-center gap-1 text-[13px] text-muted">
            <MapPin size={13} aria-hidden />
            {hotel.city}, {hotel.state}
          </span>
        </span>

        <span className="hidden shrink-0 items-center gap-1.5 text-[13px] font-medium text-ink sm:inline-flex">
          Entrar no console
          <ArrowRight size={14} aria-hidden />
        </span>
      </button>

      <button
        type="button"
        className="flex min-h-[44px] min-w-[44px] shrink-0 cursor-pointer items-center justify-center border-l border-line text-muted transition-colors hover:bg-canvas hover:text-ink"
        aria-label={`Configurar ${hotel.name}`}
        onClick={onEdit}
      >
        <Settings size={16} />
      </button>
    </li>
  )
}

function BrandStripe({ color, label }: { readonly color: string; readonly label: string }) {
  const light = isLightHex(color)
  return (
    <div
      className={`min-h-0 flex-1 ${light ? 'ring-1 ring-inset ring-ink/12' : ''}`}
      style={{ backgroundColor: color }}
      title={label}
    />
  )
}

function isLightHex(hex: string) {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return false
  const r = Number.parseInt(normalized.slice(0, 2), 16)
  const g = Number.parseInt(normalized.slice(2, 4), 16)
  const b = Number.parseInt(normalized.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.85
}
