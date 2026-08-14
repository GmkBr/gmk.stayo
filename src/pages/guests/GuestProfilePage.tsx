import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext.tsx'
import { mockConsumptions, mockGuestRequests, mockStays } from '../../data/mock/index.ts'
import { formatBRL, formatShortDate } from '../../utils/format.ts'
import { Avatar } from '../../components/ui/Avatar.tsx'
import { Badge } from '../../components/ui/Badge.tsx'
import { Card } from '../../components/ui/Card.tsx'
import { Timeline, TimelineItem } from '../../components/ui/Timeline.tsx'
import { EmptyState } from '../../components/ui/EmptyState.tsx'

export function GuestProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { guests, hotelReservations } = useApp()
  const guest = guests.find((g) => g.id === id)

  if (!guest) {
    return (
      <EmptyState
        title="Hóspede não encontrado"
        description="Este perfil não existe neste hotel."
        action={{ label: 'Voltar à lista', onClick: () => navigate('/guests') }}
      />
    )
  }

  const stays = mockStays.filter((s) => s.guestId === guest.id)
  const consumptions = mockConsumptions.filter((s) => s.guestId === guest.id)
  const requests = mockGuestRequests.filter((s) => s.guestId === guest.id)
  const reservations = hotelReservations.filter((r) => r.guestId === guest.id)

  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-6">
      <Link to="/guests" className="text-[13px] text-muted hover:text-ink">
        ← Hóspedes
      </Link>

      <div className="flex items-start gap-4">
        <Avatar name={guest.name} size="lg" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[26px] font-semibold tracking-[-0.035em]">{guest.name}</h1>
            {guest.vip && <Badge tone="amber">VIP</Badge>}
          </div>
          <p className="mt-1 text-[13px] text-muted">
            {guest.nationality} · {guest.stays} hospedagens
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold">Contato</h2>
          <dl className="grid gap-2 text-[13px]">
            <Row label="E-mail" value={guest.email} />
            <Row label="Telefone" value={guest.phone} />
            <Row label="Documento" value={guest.document} />
          </dl>
        </Card>
        <Card>
          <h2 className="mb-3 text-sm font-semibold">Preferências</h2>
          {guest.preferences.length === 0 ? (
            <p className="text-[13px] text-muted">Nenhuma preferência registrada.</p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {guest.preferences.map((item) => (
                <Badge key={item}>{item}</Badge>
              ))}
            </ul>
          )}
          {guest.notes && <p className="mt-3 text-[13px] text-muted">{guest.notes}</p>}
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Linha do tempo</h2>
        <Timeline>
          {reservations.slice(0, 6).map((item) => (
            <TimelineItem
              key={item.id}
              time={formatShortDate(item.checkIn)}
              title={`${item.category} ${item.roomNumber}`}
              detail={`${item.guests} hóspedes · ${formatBRL(item.total)}`}
            />
          ))}
        </Timeline>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold">Hospedagens anteriores</h2>
          {stays.length === 0 ? (
            <p className="text-[13px] text-muted">Sem histórico além da estadia atual.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-[13px]">
              {stays.map((stay) => (
                <li key={stay.id} className="flex justify-between border-b border-line py-2 last:border-0">
                  <span>
                    Quarto {stay.roomNumber}
                    <span className="block text-[12px] text-muted">
                      {formatShortDate(stay.checkIn)} – {formatShortDate(stay.checkOut)}
                    </span>
                  </span>
                  <span className="font-medium">{formatBRL(stay.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="mb-3 text-sm font-semibold">Consumos</h2>
          {consumptions.length === 0 ? (
            <p className="text-[13px] text-muted">Nenhum consumo lançado.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-[13px]">
              {consumptions.map((item) => (
                <li key={item.id} className="flex justify-between py-1">
                  <span>
                    {item.label}
                    <span className="block text-[12px] text-muted">{formatShortDate(item.date)}</span>
                  </span>
                  <span className="font-medium">{formatBRL(item.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Solicitações</h2>
        {requests.length === 0 ? (
          <p className="text-[13px] text-muted">Você ainda não possui solicitações neste perfil.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-[13px]">
            {requests.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-lg bg-canvas px-3 py-2">
                <span>
                  {item.label}
                  <span className="block text-[12px] text-muted">{formatShortDate(item.date)}</span>
                </span>
                <Badge>{item.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
