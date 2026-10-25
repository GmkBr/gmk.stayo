import { apiRequest } from '../../api/client.ts'
import { asPageResult, qs } from '../../shared/api.ts'
import type { PageResult } from '../../shared/mappers.ts'
import type { ApiOrder } from './mappers.ts'
import { mapOrder } from './mappers.ts'
import type { Order, OrderLine, OrderStatus } from './model.ts'

export type PlaceOrderInput = {
  source: 'room' | 'area'
  location: string
  guestName: string
  lines: Pick<OrderLine, 'name' | 'qty' | 'price' | 'catalogItemId' | 'serviceId'>[]
  totemId?: string
  spaceId?: string
  notes?: string
  token?: string | null
}

export async function listOrders(
  hotelId: string,
  params: { status?: OrderStatus; page?: number; size?: number } = {},
): Promise<PageResult<Order>> {
  const page = asPageResult(
    await apiRequest<PageResult<ApiOrder> | ApiOrder[]>(
      `/hotels/${hotelId}/orders${qs({ ...params, size: params.size ?? 100 })}`,
    ),
  )
  return { ...page, items: page.items.map(mapOrder) }
}

export async function placeOrder(hotelId: string, input: PlaceOrderInput): Promise<Order> {
  const { token, ...body } = input
  return mapOrder(
    await apiRequest<ApiOrder>(`/hotels/${hotelId}/orders`, {
      method: 'POST',
      body,
      token,
    }),
  )
}

export async function advanceOrderStatus(hotelId: string, orderId: string): Promise<Order> {
  return mapOrder(
    await apiRequest<ApiOrder>(`/hotels/${hotelId}/orders/${orderId}/status`, { method: 'PATCH' }),
  )
}

export async function cancelOrder(hotelId: string, orderId: string): Promise<Order> {
  return mapOrder(
    await apiRequest<ApiOrder>(`/hotels/${hotelId}/orders/${orderId}/cancel`, { method: 'POST', body: {} }),
  )
}
