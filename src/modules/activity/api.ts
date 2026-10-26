import { apiRequest } from '../../api/client.ts'
import type { ApiActivity } from './mappers.ts'
import { mapActivity } from './mappers.ts'

export type QueueSummary = {
  awaitingCheckin: number
  checkinsDone: number
  openOrders: number
}

export async function getQueueSummary(hotelId: string): Promise<QueueSummary> {
  return apiRequest<QueueSummary>(`/hotels/${hotelId}/queues/summary`)
}

export async function listActivities(hotelId: string): Promise<ReturnType<typeof mapActivity>[]> {
  const raw = await apiRequest<ApiActivity[]>(`/hotels/${hotelId}/activities`)
  return raw.map(mapActivity)
}
