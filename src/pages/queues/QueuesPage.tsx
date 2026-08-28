import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.tsx'
import { formatShortDate } from '../../utils/format.ts'
import { PageHeader } from '../../components/ui/PageHeader.tsx'
import { Card } from '../../components/ui/Card.tsx'
import { SectionHeader } from '../../components/ui/SectionHeader.tsx'
import { Badge } from '../../components/ui/Badge.tsx'
import { EmptyState } from '../../components/ui/EmptyState.tsx'
import type { Order, OrderStatus } from '../../types/index.ts'
// Order return type used by async status updates
import { formatBRLExact } from '../../utils/format.ts'
import { Button } from '../../components/ui/Button.tsx'

const ORDER_TONE: Record<OrderStatus, { label: string; tone: 'amber' | 'blue' | 'green' | 'red' | 'neutral' }> = {
  open: { label: 'Aberto', tone: 'amber' },
  preparing: { label: 'Em preparo', tone: 'blue' },
  delivered: { label: 'Entregue', tone: 'green' },
  cancelled: { label: 'Cancelado', tone: 'red' },
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  open: 'preparing',
  preparing: 'delivered',
}

export function QueuesPage() {
  const { hotelReservations, hotelOrders, updateOrderStatus, queueSummary, bootstrapping, bootstrapError } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [welcomeHotel, setWelcomeHotel] = useState<string | null>(() => {
    const state = location.state as { welcomeHotel?: string } | null
    return state?.welcomeHotel?.trim() || null
  })

  useEffect(() => {
    if (!welcomeHotel) return
    window.history.replaceState({}, document.title)
  }, [welcomeHotel])

  const waiting = useMemo(
    () => hotelReservations.filter((item) => item.status === 'arriving_today'),
    [hotelReservations],
  )
  const checkedIn = useMemo(
    () => hotelReservations.filter((item) => item.status === 'checked_in'),
    [hotelReservations],
  )
  const orders = hotelOrders
  const openOrders = orders.filter((item) => item.status === 'open' || item.status === 'preparing')
  const closedOrders = orders.filter((item) => item.status === 'delivered' || item.status === 'cancelled')

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
      <PageHeader
        title="Filas"
        subtitle="O que chegou pelo totem de recepção e o que os totens de quarto e área pediram."
      />

      {welcomeHotel && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-success/20 bg-success-soft px-4 py-3"
        >
          <p className="text-[13px] text-success">
            <span className="font-semibold">{welcomeHotel}</span> criado. Você já está no console deste hotel.
          </p>
          <Button variant="ghost" size="sm" onClick={() => setWelcomeHotel(null)}>
            Fechar
          </Button>
        </div>
      )}

      {bootstrapError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {bootstrapError}
        </p>
      )}
      {bootstrapping && <p className="text-[13px] text-muted">Sincronizando com a API…</p>}

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label="Aguardando check-in" value={queueSummary?.awaitingCheckin ?? waiting.length} />
        <Stat label="Check-ins feitos" value={queueSummary?.checkinsDone ?? checkedIn.length} />
        <Stat label="Pedidos abertos" value={queueSummary?.openOrders ?? openOrders.length} />
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
              description="Os totens de quarto e área enviam pedidos para cá assim que o hóspede confirma."
            />
          ) : (
            <ul className="flex flex-col">
              {openOrders.map((item) => (
                <OrderRow key={item.id} order={item} onStatusChange={updateOrderStatus} />
              ))}
              {closedOrders.map((item) => (
                <OrderRow key={item.id} order={item} onStatusChange={updateOrderStatus} />
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

function OrderRow({
  order,
  onStatusChange,
}: {
  order: Order
  onStatusChange: (id: string, status: OrderStatus) => void | Promise<Order>
}) {
  const tone = ORDER_TONE[order.status]
  const next = NEXT_STATUS[order.status]

  return (
    <li className="flex flex-col gap-2 border-b border-line py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[13px] font-medium">{order.items}</p>
        <p className="text-[12px] text-muted">
          {order.location} · {order.guestName} · {order.time}
          {order.total > 0 && ` · ${formatBRLExact(order.total)}`}
        </p>
        {order.notes && <p className="mt-1 text-[12px] text-muted">Obs.: {order.notes}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge tone={tone.tone}>{tone.label}</Badge>
        {next && (
          <Button size="sm" variant="secondary" onClick={() => void onStatusChange(order.id, next)}>
            {ORDER_TONE[next].label}
          </Button>
        )}
        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <Button size="sm" variant="ghost" onClick={() => void onStatusChange(order.id, 'cancelled')}>
            Cancelar
          </Button>
        )}
      </div>
    </li>
  )
}
