import type { IdBox } from '../../api/ids.ts'
import { unwrapId } from '../../api/ids.ts'
import { clockFromIso } from '../../shared/mappers.ts'
import type { Order, OrderLine, OrderStatus } from './model.ts'

export type ApiOrder = {
  id: IdBox
  hotelId: IdBox
  reservationId?: IdBox | string | null
  stayId?: IdBox | string | null
  source: Order['source']
  location: string
  guestName: string
  lines?: OrderLine[] | null
  total: number
  status: OrderStatus
  createdAt?: string | null
  totemId?: IdBox
  notes?: string | null
}

export function summarizeLines(lines: OrderLine[]) {
  if (lines.length === 0) return 'Pedido vazio'
  if (lines.length === 1) return lines[0].qty > 1 ? `${lines[0].qty}× ${lines[0].name}` : lines[0].name
  return lines.map((line) => (line.qty > 1 ? `${line.qty}× ${line.name}` : line.name)).join(' · ')
}

export function mapOrder(raw: ApiOrder): Order {
  const lines = (raw.lines ?? []).map((line) => ({
    id: line.id || crypto.randomUUID(),
    name: line.name,
    qty: line.qty,
    price: Number(line.price) || 0,
  }))
  return {
    id: unwrapId(raw.id),
    hotelId: unwrapId(raw.hotelId),
    reservationId: unwrapId(raw.reservationId) || undefined,
    stayId: unwrapId(raw.stayId) || undefined,
    source: raw.source,
    location: raw.location,
    guestName: raw.guestName,
    items: summarizeLines(lines),
    lines,
    total: Number(raw.total) || 0,
    status: raw.status,
    time: clockFromIso(raw.createdAt),
    createdAt: raw.createdAt ?? undefined,
    totemId: unwrapId(raw.totemId) || undefined,
    notes: raw.notes ?? undefined,
  }
}
