import { Link } from 'react-router-dom'
import { CalendarCheck, MonitorSmartphone, Tablet, UtensilsCrossed } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { StayoLogo } from '../../components/brand/StayoLogo.tsx'

const SURFACES = [
  {
    to: '/filas',
    title: 'Console',
    description: 'Reservas, fila de check-in do totem e pedidos.',
    icon: CalendarCheck,
  },
  {
    to: '/totem/recepcao',
    title: 'Totem de recepção',
    description: 'Check-in de autoatendimento ligado às reservas.',
    icon: MonitorSmartphone,
  },
  {
    to: '/totem/quarto',
    title: 'Totem de quarto',
    description: 'Pedidos e solicitações no quarto.',
    icon: Tablet,
    soon: true,
  },
  {
    to: '/totem/area',
    title: 'Totem de área',
    description: 'Pedidos no restaurante, spa e áreas comuns.',
    icon: UtensilsCrossed,
    soon: true,
  },
] as const

export function HubPage() {
  return (
    <div className="flex min-h-svh flex-col bg-canvas">
      <header className="flex h-14 items-center px-6">
        <StayoLogo />
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 pb-16">
        <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.045em]">Onde você está?</h1>
        <p className="mt-2 max-w-lg text-[15px] text-muted">
          O console acompanha o que os totens fazem. Cada totem é uma tela à parte.
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {SURFACES.map((item) => (
            <li key={item.to}>
              <SurfaceCard {...item} />
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}

function SurfaceCard({
  to,
  title,
  description,
  icon: Icon,
  soon,
}: {
  to: string
  title: string
  description: string
  icon: LucideIcon
  soon?: boolean
}) {
  return (
    <Link
      to={to}
      className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-soft transition-colors hover:border-ink/20 hover:bg-white"
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-canvas text-ink">
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <span className="mt-4 flex items-center gap-2">
        <span className="text-[16px] font-semibold tracking-[-0.03em]">{title}</span>
        {soon && (
          <span className="rounded-md bg-canvas px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
            Próximo
          </span>
        )}
      </span>
      <span className="mt-1 text-[13px] leading-relaxed text-muted">{description}</span>
    </Link>
  )
}
