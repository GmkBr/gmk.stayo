import type { Hotel, Reservation } from '../../types/index.ts'
import { formatLongDate } from '../../utils/format.ts'

/** Data em que o mock da operação está congelado. */
export const MOCK_TODAY = '2026-08-14'

export const FLOW_STEPS = [
  { id: 'busca', label: 'Reserva' },
  { id: 'dados', label: 'Dados' },
  { id: 'docs', label: 'Documento' },
  { id: 'termos', label: 'Termos' },
] as const

export type FlowStepId = (typeof FLOW_STEPS)[number]['id']

export const IDLE_MS = 45_000
export const DONE_MS = 12_000
export const SEARCH_MS = 450
export const SCAN_MS = 1_200

export function foldText(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
}

function digits(value: string) {
  return value.replace(/\D/g, '')
}

export function reservationMatchesQuery(reservation: Reservation, query: string) {
  const q = foldText(query)
  if (!q) return false
  const name = foldText(reservation.guestName)
  const compactId = foldText(reservation.id).replace(/\s/g, '')
  const compactQuery = q.replace(/\s/g, '')
  if (name.includes(q) || compactId.includes(compactQuery)) return true
  const queryDigits = digits(query)
  const idDigits = digits(reservation.id)
  return queryDigits.length >= 4 && idDigits.endsWith(queryDigits)
}

export function blockReason(reservation: Reservation, today = MOCK_TODAY): string | null {
  if (reservation.status === 'cancelled') {
    return 'Esta reserva foi cancelada. A recepção resolve.'
  }
  if (reservation.status === 'pending') {
    return 'O pagamento ainda não confirmou. A recepção resolve.'
  }
  if (reservation.status === 'checked_in') {
    return 'O check-in desta reserva já foi feito. Se o cartão não saiu, fale com a recepção.'
  }
  if (reservation.status === 'checked_out') {
    return 'Esta estadia já encerrou. A recepção resolve.'
  }
  if (reservation.checkIn > today) {
    return `Sua reserva começa em ${formatLongDate(reservation.checkIn)}. A recepção confirma chegada antecipada.`
  }
  if (reservation.status === 'arriving_today' || reservation.status === 'confirmed') return null
  return 'A recepção precisa concluir este check-in.'
}

export type SearchOutcome =
  | { kind: 'empty' }
  | { kind: 'none' }
  | { kind: 'ready'; reservation: Reservation }
  | { kind: 'many'; reservations: Reservation[] }
  | { kind: 'blocked'; reservation: Reservation; message: string }

export function searchReservations(list: Reservation[], query: string, today = MOCK_TODAY): SearchOutcome {
  if (!foldText(query)) return { kind: 'empty' }

  const matches = list.filter((item) => reservationMatchesQuery(item, query))
  if (matches.length === 0) return { kind: 'none' }

  const ready: Reservation[] = []
  const blocked: { reservation: Reservation; message: string }[] = []

  for (const reservation of matches) {
    const message = blockReason(reservation, today)
    if (message) blocked.push({ reservation, message })
    else ready.push(reservation)
  }

  if (ready.length === 1) return { kind: 'ready', reservation: ready[0] }
  if (ready.length > 1) return { kind: 'many', reservations: ready }
  return { kind: 'blocked', reservation: blocked[0].reservation, message: blocked[0].message }
}

export function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] ?? fullName
}

export function wingCopy(category: string, floor: number) {
  const label = category.toLowerCase()
  if (label.includes('chalé') || label.includes('chale')) return 'pelo caminho dos chalés'
  if (label.includes('suíte') || label.includes('suite')) return `pela ala das suítes, andar ${floor}`
  if (label.includes('mar')) return 'pela ala do mar, à direita do lobby'
  if (label.includes('garden') || label.includes('jardim')) return 'pelo jardim, à esquerda do lobby'
  return `pela ala do andar ${floor}`
}

export function termsFor(hotel: Hotel) {
  const lines = ['Check-out até 12h.', 'Silêncio após 22h nas áreas comuns.', 'O cartão do quarto desativa após o check-out.']
  if (hotel.id === 'aurora') lines.splice(1, 0, 'Animais apenas nos chalés.')
  return lines
}

export function clockLabel(date = new Date()) {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })
}
