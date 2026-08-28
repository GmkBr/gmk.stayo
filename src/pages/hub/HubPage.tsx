import { Link } from 'react-router-dom'
import { CalendarCheck, MonitorSmartphone } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { StayoLogo } from '../../components/brand/StayoLogo.tsx'

const SURFACES = [
  {
    to: '/login',
    title: 'Console',
    description: 'Entre com a conta da equipe e acompanhe filas, reservas e totens.',
    icon: CalendarCheck,
  },
  {
    to: '/login',
    title: 'Totem',
    description: 'Entre com o login do dispositivo — a interface abre conforme o tipo do totem.',
    icon: MonitorSmartphone,
  },
] as const

export function HubPage() {
  return (
    <div className="flex min-h-svh flex-col bg-canvas">
      <header className="flex h-14 items-center justify-between px-6">
        <StayoLogo />
        <Link to="/docs" className="text-[13px] font-medium text-muted hover:text-ink">
          Documentação
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 pb-16">
        <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.045em]">Onde você está?</h1>
        <p className="mt-2 max-w-lg text-[15px] text-muted">
          Console e totem usam o mesmo login. O sistema detecta se é equipe ou dispositivo e abre a tela certa.
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {SURFACES.map((item) => (
            <li key={item.title}>
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
}: {
  to: string
  title: string
  description: string
  icon: LucideIcon
}) {
  return (
    <Link
      to={to}
      className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-soft transition-colors hover:border-ink/20 hover:bg-white"
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-canvas text-ink">
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <h2 className="mt-4 text-[15px] font-semibold tracking-[-0.02em]">{title}</h2>
      <p className="mt-1 flex-1 text-[13px] leading-relaxed text-muted">{description}</p>
    </Link>
  )
}
