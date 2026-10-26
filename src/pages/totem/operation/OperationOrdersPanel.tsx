import { useMemo } from 'react'
import { RefreshCw } from 'lucide-react'
import { useApp } from '../../../app/useApp.ts'
import { Badge } from '../../../components/ui/Badge.tsx'
import { Button } from '../../../components/ui/Button.tsx'
import { EmptyState } from '../../../components/ui/EmptyState.tsx'
import { formatBRLExact } from '../../../utils/format.ts'
import type { Order, OrderStatus } from '../../../modules/orders/model.ts'
import { NEXT_ORDER_STATUS, ORDER_STATUS, sourceLabel } from './orderStatus.ts'

export function OperationOrdersPanel() {
  const { hotelOrders, updateOrderStatus, reloadHotelData, refreshing, queueSummary } = useApp()

  const openOrders = useMemo(
    () => hotelOrders.filter((item) => item.status === 'open' || item.status === 'preparing'),
    [hotelOrders],
  )
  const recentClosed = useMemo(
    () =>
      hotelOrders
        .filter((item) => item.status === 'delivered' || item.status === 'cancelled')
        .slice(0, 8),
    [hotelOrders],
  )

  return (
    <div className="flex flex-1 flex-col gap-4 pb-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[clamp(1.35rem,4vw,1.65rem)] font-semibold tracking-[-0.03em]">Pedidos</h2>
          <p className="mt-1 text-[14px] text-muted">
            {queueSummary?.openOrders ?? openOrders.length} em aberto · totens de quarto e área
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          disabled={refreshing}
          onClick={() => void reloadHotelData()}
          aria-label="Atualizar pedidos"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : undefined} />
        </Button>
      </div>

      {openOrders.length === 0 ? (
        <EmptyState
          title="Nenhum pedido em aberto"
          description="Quando um hóspede confirmar no totem de quarto ou área, o pedido aparece aqui."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {openOrders.map((order) => (
            <OrderCard key={order.id} order={order} onStatusChange={updateOrderStatus} emphasis />
          ))}
        </ul>
      )}

      {recentClosed.length > 0 && (
        <section className="mt-4 border-t border-line pt-4">
          <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">Recentes</h3>
          <ul className="flex flex-col gap-2">
            {recentClosed.map((order) => (
              <OrderCard key={order.id} order={order} onStatusChange={updateOrderStatus} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function OrderCard({
  order,
  onStatusChange,
  emphasis = false,
}: {
  order: Order
  onStatusChange: (id: string, status: OrderStatus) => void | Promise<Order>
  emphasis?: boolean
}) {
  const tone = ORDER_STATUS[order.status]
  const next = NEXT_ORDER_STATUS[order.status]

  return (
    <li
      className={`rounded-2xl border bg-white px-4 py-4 ${emphasis ? 'border-line shadow-soft' : 'border-line/70'}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={`font-semibold leading-snug ${emphasis ? 'text-[17px]' : 'text-[15px]'}`}>{order.items}</p>
          <p className="mt-1 text-[14px] text-muted">
            {order.location} · {order.guestName}
          </p>
          <p className="mt-0.5 text-[13px] text-muted">
            {sourceLabel(order.source)} · {order.time}
            {order.total > 0 && ` · ${formatBRLExact(order.total)}`}
          </p>
          {order.notes && <p className="mt-2 text-[14px] text-ink/80">Obs.: {order.notes}</p>}
        </div>
        <Badge tone={tone.tone}>{tone.label}</Badge>
      </div>

      {(next || (order.status !== 'cancelled' && order.status !== 'delivered')) && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {next && (
            <Button size="kiosk" className="flex-1" onClick={() => void onStatusChange(order.id, next)}>
              Marcar como {ORDER_STATUS[next].label.toLowerCase()}
            </Button>
          )}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <Button
              size="kiosk"
              variant="secondary"
              className="flex-1"
              onClick={() => void onStatusChange(order.id, 'cancelled')}
            >
              Cancelar
            </Button>
          )}
        </div>
      )}
    </li>
  )
}
