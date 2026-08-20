import { AppContext } from '../context/AppContext.tsx'
import { clearTotemBinding, readTotemBinding, writeTotemBinding } from '../context/totemSession.ts'
import { mockHotels } from '../data/mock/index.ts'
import type { Totem, TotemKind } from '../types/index.ts'
import { useCallback, useMemo, useState } from 'react'
import { useContext } from 'react'

export function useTotemSession(expectedKind: TotemKind) {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useTotemSession must be used within AppProvider')

  const { totems, bindTotemByCode } = ctx
  const [binding, setBinding] = useState(readTotemBinding)

  const totem = useMemo(() => {
    if (!binding) return null
    return totems.find((item) => item.id === binding.totemId && item.hotelId === binding.hotelId) ?? null
  }, [binding, totems])

  const hotel = useMemo(() => {
    if (!totem) return null
    return mockHotels.find((item) => item.id === totem.hotelId) ?? null
  }, [totem])

  const isBound = Boolean(totem && totem.kind === expectedKind && totem.active)

  const bind = useCallback(
    (code: string) => {
      const match = bindTotemByCode(code, expectedKind)
      if (!match) return { ok: false as const, error: 'Código inválido ou totem inativo.' }
      const next = { totemId: match.id, hotelId: match.hotelId }
      writeTotemBinding(next)
      setBinding(next)
      return { ok: true as const, totem: match }
    },
    [bindTotemByCode, expectedKind],
  )

  const unbind = useCallback(() => {
    clearTotemBinding()
    setBinding(null)
  }, [])

  return { totem, hotel, isBound, bind, unbind }
}

export function guestForRoom(
  reservations: { guestName: string; roomNumber: string; status: string }[],
  roomNumber: string,
) {
  return (
    reservations.find((item) => item.roomNumber === roomNumber && item.status === 'checked_in') ??
    reservations.find((item) => item.roomNumber === roomNumber)
  )
}

export type { Totem }
