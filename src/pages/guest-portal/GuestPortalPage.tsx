import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  BedDouble,
  ConciergeBell,
  Info,
  UtensilsCrossed,
  Wifi,
  ClipboardList,
} from 'lucide-react'
import { useApp } from '../../context/AppContext.tsx'
import { useToast } from '../../components/ui/Toast.tsx'
import { formatShortDate } from '../../utils/format.ts'

export function GuestPortalPage() {
  const { hotel, user } = useApp()
  const { push } = useToast()
  const brand = hotel.brand

  return (
    <div
      className="min-h-svh"
      style={{
        background: brand.secondaryColor,
        ['--hotel-primary' as string]: brand.primaryColor,
        ['--hotel-accent' as string]: brand.accentColor,
      }}
    >
      <div className="mx-auto min-h-svh max-w-md">
        <header className="px-5 pt-6">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: brand.primaryColor }}>
              {brand.hotelName}
            </p>
            <Link to="/dashboard" className="text-[12px] text-muted hover:text-ink">
              Painel
            </Link>
          </div>
        </header>

        <div className="mx-5 mt-4 overflow-hidden rounded-2xl" style={{ background: brand.coverTone, height: 168 }}>
          <div className="flex h-full flex-col justify-end p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-ink/50">{hotel.city}, {hotel.state}</p>
            <p className="text-lg font-semibold tracking-[-0.03em]">{brand.hotelName}</p>
          </div>
        </div>

        <div className="px-5 py-6">
          <h1 className="text-[26px] font-semibold tracking-[-0.04em]">Olá, {user.name}.</h1>
          <p className="mt-1 text-[14px] text-muted">Esperamos que esteja aproveitando sua estadia.</p>

          <section className="mt-6 rounded-2xl bg-white p-4">
            <p className="text-[12px] text-muted">Minha estadia</p>
            <p className="mt-1 text-sm font-semibold">Suíte Premium 203</p>
            <p className="text-[13px] text-muted">
              {formatShortDate('2026-08-14')} – {formatShortDate('2026-08-17')} · 2 hóspedes
            </p>
          </section>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <PortalCard icon={<BedDouble size={18} />} title="Minha estadia" onClick={() => push({ title: 'Sua estadia', detail: 'Check-out 17 ago, 12h.' })} />
            <PortalCard icon={<ConciergeBell size={18} />} title="Serviços" onClick={() => push({ title: 'Serviços', detail: 'Spa, room service e passeios.' })} />
            <PortalCard icon={<UtensilsCrossed size={18} />} title="Restaurante" onClick={() => push({ title: 'Restaurante', detail: 'Almoço até 15h. Jantar das 19h às 22h.' })} />
            <PortalCard icon={<ClipboardList size={18} />} title="Solicitações" onClick={() => push({ title: 'Solicitação enviada', detail: 'A governança já foi avisada.', tone: 'success' })} />
            <PortalCard icon={<Info size={18} />} title="Informações" onClick={() => push({ title: 'Recepção 24h', detail: 'Ramal 9. Trilhas saem às 7h.' })} />
            <PortalCard icon={<Wifi size={18} />} title="Wi-Fi" onClick={() => push({ title: 'Aurora-Hospedes', detail: 'Senha: aurora2026' })} />
          </div>
        </div>
      </div>
    </div>
  )
}

function PortalCard({ icon, title, onClick }: { icon: ReactNode; title: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-3 rounded-2xl bg-white p-4 text-left transition-colors hover:bg-white/80"
    >
      <span className="text-[color:var(--hotel-primary)]">{icon}</span>
      <span className="text-[13px] font-semibold">{title}</span>
    </button>
  )
}
