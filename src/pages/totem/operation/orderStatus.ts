import type { OrderStatus } from '../../../modules/orders/model.ts'

export const ORDER_STATUS: Record<
  OrderStatus,
  { label: string; tone: 'amber' | 'blue' | 'green' | 'red' | 'neutral' }
> = {
  open: { label: 'Aberto', tone: 'amber' },
  preparing: { label: 'Em preparo', tone: 'blue' },
  delivered: { label: 'Entregue', tone: 'green' },
  cancelled: { label: 'Cancelado', tone: 'red' },
}

export const NEXT_ORDER_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  open: 'preparing',
  preparing: 'delivered',
}

export function sourceLabel(source: string) {
  if (source === 'room') return 'Quarto'
  if (source === 'area') return 'Área'
  return 'Totem'
}
