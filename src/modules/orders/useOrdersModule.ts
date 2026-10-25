import { useCallback, useState } from 'react'
import * as ordersApi from './api.ts'
import type { Order, OrderStatus } from './model.ts'
import type { AddOrderInput } from './model.ts'

export function useOrdersModule(hotelId: string) {
  const [orders, setOrders] = useState<Order[]>([])

  const replaceOrder = useCallback((next: Order) => {
    setOrders((prev) => {
      const idx = prev.findIndex((item) => item.id === next.id)
      if (idx < 0) return [next, ...prev]
      const copy = [...prev]
      copy[idx] = next
      return copy
    })
  }, [])

  const addOrder = useCallback(
    async (input: AddOrderInput) => {
      const next = await ordersApi.placeOrder(input.hotelId, {
        source: input.source,
        location: input.location,
        guestName: input.guestName,
        lines: input.lines.map(({ name, qty, price, catalogItemId, serviceId }) => ({ name, qty, price, catalogItemId, serviceId })),
        totemId: input.totemId,
        spaceId: input.spaceId,
        notes: input.notes,
        token: input.token,
      })
      if (input.hotelId === hotelId) setOrders((prev) => [next, ...prev])
      return next
    },
    [hotelId],
  )

  const updateOrderStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      const next =
        status === 'cancelled'
          ? await ordersApi.cancelOrder(hotelId, id)
          : await ordersApi.advanceOrderStatus(hotelId, id)
      replaceOrder(next)
      return next
    },
    [hotelId, replaceOrder],
  )

  return {
    orders,
    setOrders,
    addOrder,
    updateOrderStatus,
  }
}
