import { useCallback, useState } from 'react'
import * as reservationsApi from './api.ts'
import type { Reservation } from './model.ts'
import type { CreateReservationInput } from './api.ts'

export function useReservationsModule(hotelId: string) {
  const [reservations, setReservations] = useState<Reservation[]>([])

  const replaceReservation = useCallback((next: Reservation) => {
    setReservations((prev) => {
      const idx = prev.findIndex((item) => item.id === next.id)
      if (idx < 0) return [next, ...prev]
      const copy = [...prev]
      copy[idx] = next
      return copy
    })
  }, [])

  const confirmReservation = useCallback(
    async (id: string) => {
      const next = await reservationsApi.confirmReservation(hotelId, id)
      replaceReservation(next)
      return next
    },
    [hotelId, replaceReservation],
  )

  const cancelReservationFn = useCallback(
    async (id: string) => {
      const next = await reservationsApi.cancelReservation(hotelId, id)
      replaceReservation(next)
      return next
    },
    [hotelId, replaceReservation],
  )

  const createReservation = useCallback(
    async (input: CreateReservationInput) => {
      const next = await reservationsApi.createReservation(hotelId, input)
      setReservations((prev) => [next, ...prev])
      return next
    },
    [hotelId],
  )

  const addReservation = useCallback((reservation: Reservation) => {
    setReservations((prev) => [reservation, ...prev])
  }, [])

  return {
    reservations,
    setReservations,
    replaceReservation,
    confirmReservation,
    cancelReservationFn,
    createReservation,
    addReservation,
  }
}
