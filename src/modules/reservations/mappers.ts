import type { IdBox } from '../../api/ids.ts'
import { unwrapId } from '../../api/ids.ts'
import type { PaymentMethod } from '../../shared/model.ts'
import { nightsBetween } from '../../utils/format.ts'
import type { Reservation, ReservationStatus } from './model.ts'

export type ApiReservation = {
  id: IdBox
  hotelId: IdBox
  code?: string | null
  guestId?: IdBox
  guestName: string
  guestCpf?: string | null
  cpf?: string | null
  guestEmail?: string | null
  guestPhone?: string | null
  roomId?: IdBox | string | null
  roomNumber?: string | null
  category?: string | null
  checkIn: string
  checkOut: string
  guests?: number | null
  status: ReservationStatus
  total?: number | null
  nightlyRate?: number | null
  paymentMethod?: PaymentMethod | string | null
  notes?: string | null
  history?: { at: string; text: string }[] | null
}

export const PAYMENT_ALIASES: Record<string, PaymentMethod> = {
  card: 'card',
  credit: 'credit',
  credit_card: 'credit',
  pix: 'pix',
  debit: 'debit',
  cash: 'cash',
  invoice: 'invoice',
}

export function normalizePaymentMethod(raw?: string | null): PaymentMethod {
  if (!raw?.trim()) return 'pix'
  const key = raw.trim().toLowerCase()
  return PAYMENT_ALIASES[key] ?? 'pix'
}

export function computeReservationTotal(raw: ApiReservation): number {
  const explicit = Number(raw.total)
  if (Number.isFinite(explicit) && explicit > 0) return explicit
  const rate = Number(raw.nightlyRate)
  if (!Number.isFinite(rate) || rate <= 0 || !raw.checkIn || !raw.checkOut) return 0
  return rate * nightsBetween(raw.checkIn, raw.checkOut)
}

export function normalizeDateOnly(value?: string | null): string {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return ''
  const datePart = trimmed.slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : trimmed
}

export function mapReservation(raw: ApiReservation): Reservation {
  const nightlyRate = raw.nightlyRate != null ? Number(raw.nightlyRate) || undefined : undefined
  const checkIn = normalizeDateOnly(raw.checkIn)
  const checkOut = normalizeDateOnly(raw.checkOut)
  return {
    id: unwrapId(raw.id),
    hotelId: unwrapId(raw.hotelId),
    code: raw.code?.trim() || undefined,
    guestId: unwrapId(raw.guestId) || '',
    guestName: raw.guestName,
    guestCpf: raw.guestCpf ?? raw.cpf ?? undefined,
    guestEmail: raw.guestEmail?.trim() ?? '',
    guestPhone: raw.guestPhone?.trim() ?? '',
    roomId: unwrapId(raw.roomId) || '',
    roomNumber: raw.roomNumber?.trim() ?? '',
    category: raw.category?.trim() ?? '',
    checkIn,
    checkOut,
    guests: raw.guests ?? 1,
    status: raw.status,
    nightlyRate,
    total: computeReservationTotal({ ...raw, checkIn, checkOut }),
    paymentMethod: raw.paymentMethod ? normalizePaymentMethod(raw.paymentMethod) : undefined,
    notes: raw.notes?.trim() ?? '',
    history: Array.isArray(raw.history) ? raw.history.map((h) => ({ at: h.at, text: h.text })) : [],
  }
}
