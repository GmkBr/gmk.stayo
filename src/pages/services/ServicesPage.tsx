import {
  Bike,
  CarFront,
  Clock3,
  KeyRound,
  Map,
  Sparkles,
  UtensilsCrossed,
  Wine,
} from 'lucide-react'
import { useApp } from '../../context/AppContext.tsx'
import { useToast } from '../../components/ui/Toast.tsx'
import { formatBRL } from '../../utils/format.ts'
import { PageHeader } from '../../components/ui/PageHeader.tsx'
import { Badge } from '../../components/ui/Badge.tsx'
import { Button } from '../../components/ui/Button.tsx'
import type { Service } from '../../types/index.ts'

const ICONS = {
  tray: UtensilsCrossed,
  spa: Sparkles,
  clock: Clock3,
  car: CarFront,
  map: Map,
  wine: Wine,
  bike: Bike,
  key: KeyRound,
}

export function ServicesPage() {
  const { hotelServices, toggleService } = useApp()
  const { push } = useToast()

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
      <PageHeader title="Serviços" subtitle="O que o hotel oferece além da diária — e o que está ativo hoje." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {hotelServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onToggle={() => {
              toggleService(service.id)
              push({
                title: service.active ? 'Serviço desativado' : 'Serviço ativado',
                detail: service.name,
              })
            }}
          />
        ))}
      </div>
    </div>
  )
}

function ServiceCard({ service, onToggle }: { service: Service; onToggle: () => void }) {
  const { push } = useToast()
  const Icon = ICONS[service.icon]
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-soft">
      <div className="flex h-28 items-end justify-between px-4 py-3" style={{ background: service.tone }}>
        <Icon size={22} className="text-ink/70" />
        <Badge tone={service.active ? 'green' : 'neutral'}>{service.active ? 'Ativo' : 'Inativo'}</Badge>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h2 className="text-sm font-semibold">{service.name}</h2>
        <p className="mt-1 flex-1 text-[13px] text-muted">{service.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm font-semibold">{formatBRL(service.price)}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => push({ title: 'Edição simulada', detail: service.name })}>
              Editar
            </Button>
            <Button size="sm" variant="secondary" onClick={onToggle}>
              {service.active ? 'Desativar' : 'Ativar'}
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
