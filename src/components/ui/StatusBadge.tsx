import type { ReservationStatus } from '../../modules/reservations/model.ts'
import type { RoomStatus } from '../../modules/spaces/model.ts'
import { Badge } from './Badge.tsx'

const roomMap: Record<RoomStatus, { label: string; tone: 'green' | 'blue' | 'amber' | 'slate' | 'red' | 'neutral' }> = {
  available: { label: 'Disponível', tone: 'green' },
  occupied: { label: 'Ocupado', tone: 'blue' },
  dirty: { label: 'Sujo', tone: 'amber' },
  cleaning: { label: 'Em limpeza', tone: 'slate' },
  clean: { label: 'Limpo', tone: 'green' },
  maintenance: { label: 'Manutenção', tone: 'red' },
  blocked: { label: 'Bloqueado', tone: 'neutral' },
}

const reservationMap: Record<
  ReservationStatus,
  { label: string; tone: 'green' | 'blue' | 'amber' | 'slate' | 'red' | 'neutral' }
> = {
  pending: { label: 'Pendente', tone: 'amber' },
  confirmed: { label: 'Confirmada', tone: 'blue' },
  arriving_today: { label: 'Check-in hoje', tone: 'green' },
  checked_in: { label: 'Hospedado', tone: 'slate' },
  checked_out: { label: 'Check-out', tone: 'neutral' },
  cancelled: { label: 'Cancelada', tone: 'red' },
}

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const item = roomMap[status]
  return <Badge tone={item.tone}>{item.label}</Badge>
}

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const item = reservationMap[status]
  return <Badge tone={item.tone}>{item.label}</Badge>
}

export function StatusBadge({
  label,
  tone = 'neutral',
}: {
  label: string
  tone?: 'green' | 'blue' | 'amber' | 'slate' | 'red' | 'neutral'
}) {
  return <Badge tone={tone}>{label}</Badge>
}

export const ROOM_STATUS_LABEL = roomMap
export const RESERVATION_STATUS_LABEL = reservationMap
