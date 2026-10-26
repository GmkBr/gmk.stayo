import type { Reservation } from '../../modules/reservations/model.ts'
import { formatLongDate } from '../../utils/format.ts'
import { foldText, MOCK_TODAY, reservationMatchesQuery, type SearchOutcome } from './totemCheckin.ts'

export function checkoutBlockReason(reservation: Reservation, today = MOCK_TODAY): string | null {
  if (reservation.status === 'cancelled') {
    return 'Esta reserva foi cancelada. A recepção resolve.'
  }
  if (reservation.status === 'checked_out') {
    return 'O check-out desta estadia já foi feito.'
  }
  if (reservation.status !== 'checked_in') {
    return 'O check-in ainda não foi feito. Faça o check-in antes de encerrar a conta.'
  }
  if (reservation.checkOut > today) {
    return `Sua saída está prevista para ${formatLongDate(reservation.checkOut)}. A recepção confirma saída antecipada.`
  }
  return null
}

export function searchCheckoutReservations(
  list: Reservation[],
  query: string,
  today = MOCK_TODAY,
): SearchOutcome {
  if (!foldText(query)) return { kind: 'empty' }

  const matches = list.filter((item) => reservationMatchesQuery(item, query))
  if (matches.length === 0) return { kind: 'none' }

  const ready: Reservation[] = []
  const blocked: { reservation: Reservation; message: string }[] = []

  for (const reservation of matches) {
    const message = checkoutBlockReason(reservation, today)
    if (message) blocked.push({ reservation, message })
    else ready.push(reservation)
  }

  if (ready.length === 1) return { kind: 'ready', reservation: ready[0] }
  if (ready.length > 1) return { kind: 'many', reservations: ready }
  return { kind: 'blocked', reservation: blocked[0].reservation, message: blocked[0].message }
}

export const CHECKOUT_PAYMENT_OPTIONS = [
  { value: 'card' as const, label: 'Cartão' },
  { value: 'pix' as const, label: 'Pix' },
  { value: 'debit' as const, label: 'Débito' },
  { value: 'cash' as const, label: 'Dinheiro' },
]
