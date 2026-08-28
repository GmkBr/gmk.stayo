import { useApp } from '../context/AppContext.tsx'
import type { TotemKind } from '../types/index.ts'

export function guestForRoom(
  reservations: { guestName: string; roomNumber: string; status: string }[],
  roomNumber: string,
) {
  return (
    reservations.find((item) => item.roomNumber === roomNumber && item.status === 'checked_in') ??
    reservations.find((item) => item.roomNumber === roomNumber)
  )
}

export function useTotemProfile(expectedKind?: TotemKind) {
  const { profile, hotel } = useApp()
  const totem = profile?.totem ?? null
  const ready = Boolean(
    totem?.active && hotel?.id && (!expectedKind || totem.kind === expectedKind),
  )

  return { totem, hotel, ready }
}
