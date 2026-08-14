import type { Reservation } from '../../types/index.ts'
import { formatBRL, formatShortDate } from '../../utils/format.ts'
import { Avatar } from './Avatar.tsx'
import { ReservationStatusBadge } from './StatusBadge.tsx'

export function ReservationCard({
  reservation,
  onClick,
}: {
  reservation: Reservation
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-line bg-surface p-3 text-left transition-colors hover:bg-canvas"
    >
      <Avatar name={reservation.guestName} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold">{reservation.guestName}</p>
        <p className="truncate text-[12px] text-muted">
          Quarto {reservation.roomNumber} · {formatShortDate(reservation.checkIn)} – {formatShortDate(reservation.checkOut)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <ReservationStatusBadge status={reservation.status} />
        <span className="text-[12px] text-muted">{formatBRL(reservation.total)}</span>
      </div>
    </button>
  )
}
