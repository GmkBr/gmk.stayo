import { apiRequest } from '../../api/client.ts'
import { qs } from '../../shared/api.ts'
import type { ApiOrder } from '../orders/mappers.ts'
import { mapOrder } from '../orders/mappers.ts'
import type { Order } from '../orders/model.ts'
import type { ApiStayAccount } from './mappers.ts'
import { mapStayAccount } from './mappers.ts'
import type { StayAccount } from './model.ts'

export async function getActiveStayBySpace(hotelId: string, spaceId: string): Promise<StayAccount> {
  return mapStayAccount(
    await apiRequest<ApiStayAccount>(`/hotels/${hotelId}/stays/active${qs({ spaceId })}`),
  )
}

export async function getStayAccount(hotelId: string, stayId: string): Promise<StayAccount> {
  return mapStayAccount(await apiRequest<ApiStayAccount>(`/hotels/${hotelId}/stays/${stayId}/account`))
}

export async function listStayOrders(hotelId: string, stayId: string): Promise<Order[]> {
  const raw = await apiRequest<ApiOrder[]>(`/hotels/${hotelId}/stays/${stayId}/orders`)
  return raw.map(mapOrder)
}
