import { useMemo, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.tsx'
import { mockOrders } from '../../data/mock/index.ts'
import { formatShortDate } from '../../utils/format.ts'
import { PageHeader } from '../../components/ui/PageHeader.tsx'
import { Card } from '../../components/ui/Card.tsx'
import { SectionHeader } from '../../components/ui/SectionHeader.tsx'
import { Badge } from '../../components/ui/Badge.tsx'
import { EmptyState } from '../../components/ui/EmptyState.tsx'
import type { Order, OrderStatus } from '../../types/index.ts'

const ORDER_TONE: Record<OrderStatus, { label: string; tone: 'amber' | 'blue' | 'green' }> = {
  open: { label: 'Aberto', tone: 'amber' },
  preparing: { label: 'Em preparo', tone: 'blue' },
  delivered: { label: 'Entregue', tone: 'green' },
}

export function QueuesPage() {
  const { hotel, hotelReservations } = useApp()
  const navigate = useNavigate()

  const waiting = useMemo(
    () => hotelReservations.filter((item) => item.status === 'arriving_today'),
    [hotelReservations],
  )
  const checkedIn = useMemo(
    () => hotelReservations.filter((item) => item.status === 'checked_in'),
    [hotelReservations],
  )
  const orders = useMemo(() => mockOrders.filter((item) => item.hotelId === hotel.id), [hotel.id])
  const openOrders = orders.filter((item) => item.status !== 'delivered')
  const delivered = orders.filter((item) => item.status === 'delivered')

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
      <PageHeader
        title="Filas"
        subtitle="O que chegou pelo totem de recepção e o que os totens de quarto e área pediram."
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label="Aguardando check-in" value={waiting.length} />
        <Stat label="Check-ins feitos" value={checkedIn.length} />
        <Stat label="Pedidos abertos" value={openOrders.length} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <SectionHeader title="Check-in" />
          {waiting.length === 0 && checkedIn.length === 0 ? (
            <EmptyState title="Nada na fila" description="Quando alguém fizer check-in no totem, aparece aqui." />
          ) : (
            <ul className="flex flex-col">
              {waiting.map((item) => (
                <QueueRow
                  key={item.id}
                  title={item.guestName}
                  meta={`Quarto ${item.roomNumber} · ${formatShortDate(item.checkIn)}`}
                  badge={<Badge tone="amber">Aguardando totem</Badge>}
                  onClick={() => navigate('/reservas')}
                />
              ))}
              {checkedIn.slice(0, 6).map((item) => (
                <QueueRow
                  key={item.id}
                  title={item.guestName}
                  meta={`Quarto ${item.roomNumber} · totem de recepção`}
                  badge={<Badge tone="green">Feito</Badge>}
                  onClick={() => navigate('/reservas')}
                />
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <SectionHeader title="Pedidos" />
          {orders.length === 0 ? (
            <EmptyState
              title="Nenhum pedido ainda"
              description="Os totens de quarto e área passam a enviar pedidos no próximo passo."
            />
          ) : (
            <ul className="flex flex-col">
              {openOrders.map((item) => (
                <OrderRow key={item.id} order={item} />
              ))}
              {delivered.map((item) => (
                <OrderRow key={item.id} order={item} />
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-4 shadow-soft">
      <p className="text-[12px] text-muted">{label}</p>
      <p className="mt-1 text-[28px] font-semibold tabular-nums tracking-[-0.04em]">{value}</p>
    </div>
  )
}

function QueueRow({
  title,
  meta,
  badge,
  onClick,
}: {
  title: string
  meta: string
  badge: ReactNode
  onClick?: () => void
}) {
  return (
    <li className="border-b border-line last:border-0">
      <button type="button" onClick={onClick} className="flex w-full items-center justify-between gap-3 py-3 text-left">
        <span>
          <span className="block text-[13px] font-medium">{title}</span>
          <span className="block text-[12px] text-muted">{meta}</span>
        </span>
        {badge}
      </button>
    </li>
  )
}

function OrderRow({ order }: { order: Order }) {
  const tone = ORDER_TONE[order.status]
  return (
    <li className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0">
      <div>
        <p className="text-[13px] font-medium">{order.items}</p>
        <p className="text-[12px] text-muted">
          {order.location} · {order.guestName} · {order.time}
        </p>
      </div>
      <Badge tone={tone.tone}>{tone.label}</Badge>
    </li>
  )
}
