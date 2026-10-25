import { apiRequest } from '../../api/client.ts'
import { asPageResult, qs } from '../../shared/api.ts'
import type { PageResult } from '../../shared/mappers.ts'
import type { PaymentMethod } from '../../shared/model.ts'
import type { ApiReservation } from './mappers.ts'
import { mapReservation } from './mappers.ts'
import type { Reservation } from './model.ts'

export type CreateReservationInput = {
  guestName: string
  guestCpf?: string
  guestEmail?: string
  guestPhone?: string
  roomId?: string
  roomNumber?: string
  category?: string
  checkIn: string
  checkOut: string
  guests?: number
  total?: number
  paymentMethod?: PaymentMethod
  notes?: string
}

export async function searchReservations(
  hotelId: string,
  params: { q?: string; status?: string; period?: string; page?: number; size?: number } = {},
  token?: string | null,
): Promise<PageResult<Reservation>> {
  const page = asPageResult(
    await apiRequest<PageResult<ApiReservation> | ApiReservation[]>(
      `/hotels/${hotelId}/reservations${qs({ ...params, size: params.size ?? 100 })}`,
      { token },
    ),
  )
  return { ...page, items: page.items.map(mapReservation) }
}

export async function createReservation(hotelId: string, body: CreateReservationInput): Promise<Reservation> {
  return mapReservation(
    await apiRequest<ApiReservation>(`/hotels/${hotelId}/reservations`, { method: 'POST', body }),
  )
}

export async function confirmReservation(hotelId: string, id: string): Promise<Reservation> {
  return mapReservation(
    await apiRequest<ApiReservation>(`/hotels/${hotelId}/reservations/${id}/confirm`, { method: 'POST', body: {} }),
  )
}

export async function cancelReservation(hotelId: string, id: string): Promise<Reservation> {
  return mapReservation(
    await apiRequest<ApiReservation>(`/hotels/${hotelId}/reservations/${id}/cancel`, { method: 'POST', body: {} }),
  )
}

export async function updateReservation(
  hotelId: string,
  id: string,
  body: CreateReservationInput,
): Promise<Reservation> {
  return mapReservation(
    await apiRequest<ApiReservation>(`/hotels/${hotelId}/reservations/${id}`, { method: 'PUT', body }),
  )
}

export async function getReservation(hotelId: string, id: string): Promise<Reservation> {
  return mapReservation(await apiRequest<ApiReservation>(`/hotels/${hotelId}/reservations/${id}`))
}
