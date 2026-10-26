import type { PaymentMethod } from '../shared/model.ts'
import type { Reservation } from '../modules/reservations/model.ts'
import { formatBRL, formatBRLExact } from '../utils/format.ts'

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  card: 'Cartão',
  credit: 'Crédito',
  debit: 'Débito',
  pix: 'Pix',
  cash: 'Dinheiro',
  invoice: 'Faturado',
}

export function optionalContact(value?: string | null) {
  const trimmed = value?.trim()
  return trimmed || '—'
}

export function paymentLabel(method?: PaymentMethod) {
  if (!method) return '—'
  return PAYMENT_LABELS[method] ?? method
}

export function reservationRoomLabel(reservation: Pick<Reservation, 'roomNumber' | 'category'>) {
  const room = reservation.roomNumber?.trim()
  const category = reservation.category?.trim()
  if (room && category) return `${room} · ${category}`
  return room || category || '—'
}

export function reservationCodeLabel(reservation: Pick<Reservation, 'code' | 'id'>) {
  return reservation.code?.trim() || reservation.id
}

export function formatReservationTotal(reservation: Pick<Reservation, 'total'>, exact = false) {
  if (reservation.total <= 0) return '—'
  return exact ? formatBRLExact(reservation.total) : formatBRL(reservation.total)
}
