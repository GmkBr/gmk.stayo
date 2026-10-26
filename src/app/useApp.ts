import { useContext, useMemo } from 'react'
import { AppContext } from './context.ts'

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function useHotelData(hotelId: string) {
  const ctx = useApp()
  return useMemo(
    () => ({
      reservations: ctx.reservations.filter((item) => item.hotelId === hotelId),
      services: ctx.services.filter((item) => item.hotelId === hotelId && item.active),
      catalogCategories: ctx.catalogCategories.filter((item) => item.hotelId === hotelId),
      catalogItems: ctx.catalogItems.filter((item) => item.hotelId === hotelId && item.available),
      areas: ctx.areas.filter((item) => item.hotelId === hotelId && item.active),
    }),
    [ctx.reservations, ctx.services, ctx.catalogCategories, ctx.catalogItems, ctx.areas, hotelId],
  )
}
