import { useCallback } from 'react'
import * as journeysApi from './api.ts'
import { buildTotemSearchBody } from '../../lib/totemSearch.ts'
import type { Reservation } from '../reservations/model.ts'

export function useJourneysModule(hotelId: string, replaceReservation: (reservation: Reservation) => void, refreshQueue: () => Promise<void>) {
  const completeCheckin = useCallback(
    async (reservationId: string) => {
      const next = await journeysApi.checkinComplete(hotelId, reservationId)
      replaceReservation(next)
      return next
    },
    [hotelId, replaceReservation],
  )

  const validateCheckin = useCallback(
    async (reservationId: string) => {
      const next = await journeysApi.checkinValidate(hotelId, reservationId)
      replaceReservation(next)
      return next
    },
    [hotelId, replaceReservation],
  )

  const searchCheckin = useCallback(
    async (query: string) => journeysApi.checkinSearch(hotelId, buildTotemSearchBody(query)),
    [hotelId],
  )

  const searchCheckout = useCallback(
    async (query: string) => journeysApi.checkoutSearch(hotelId, buildTotemSearchBody(query)),
    [hotelId],
  )

  const validateCheckout = useCallback(
    async (reservationId: string) => journeysApi.checkoutValidate(hotelId, reservationId),
    [hotelId],
  )

  const completeCheckout = useCallback(
    async (reservationId: string, input: journeysApi.CheckoutCompleteInput) => {
      const next = await journeysApi.checkoutComplete(hotelId, reservationId, input)
      replaceReservation(next)
      void refreshQueue().catch(() => undefined)
      return next
    },
    [hotelId, replaceReservation, refreshQueue],
  )

  return {
    completeCheckin,
    validateCheckin,
    searchCheckin,
    searchCheckout,
    validateCheckout,
    completeCheckout,
  }
}
