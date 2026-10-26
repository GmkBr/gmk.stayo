import { ApiError, apiRequest } from '../../api/client.ts'
import type { PaymentMethod } from '../../shared/model.ts'
import type { ApiReservation } from '../reservations/mappers.ts'
import { mapReservation } from '../reservations/mappers.ts'
import type { Reservation } from '../reservations/model.ts'
import type { ApiCheckinActionResponse, ApiCheckoutStatement } from './mappers.ts'
import { mapCheckoutStatement } from './mappers.ts'
import type { CheckoutStatement } from './model.ts'

export function mapCheckinAction(raw: ApiCheckinActionResponse | ApiReservation): Reservation {
  if (raw && typeof raw === 'object' && 'reservation' in raw && raw.reservation) {
    const blocked = raw.blockReason?.trim()
    if (blocked) throw new ApiError(409, { message: blocked })
    return mapReservation(raw.reservation)
  }
  return mapReservation(raw as ApiReservation)
}

export async function checkinSearch(hotelId: string, input: string | TotemSearchInput): Promise<Reservation[]> {
  const body = typeof input === 'string' ? { q: input.trim() } : input
  const raw = await apiRequest<ApiReservation[]>(`/hotels/${hotelId}/checkin/search`, {
    method: 'POST',
    body,
  })
  return raw.map(mapReservation)
}

export async function checkinValidate(hotelId: string, reservationId: string): Promise<Reservation> {
  return mapCheckinAction(
    await apiRequest<ApiCheckinActionResponse | ApiReservation>(
      `/hotels/${hotelId}/checkin/${reservationId}/validate`,
      { method: 'POST', body: {} },
    ),
  )
}

export async function checkinComplete(hotelId: string, reservationId: string): Promise<Reservation> {
  return mapCheckinAction(
    await apiRequest<ApiCheckinActionResponse | ApiReservation>(
      `/hotels/${hotelId}/checkin/${reservationId}/complete`,
      { method: 'POST', body: {} },
    ),
  )
}

export async function checkoutSearch(hotelId: string, input: string | TotemSearchInput): Promise<Reservation[]> {
  const body = typeof input === 'string' ? { q: input.trim() } : input
  const raw = await apiRequest<ApiReservation[]>(`/hotels/${hotelId}/checkout/search`, {
    method: 'POST',
    body,
  })
  return raw.map(mapReservation)
}

export async function checkoutValidate(hotelId: string, reservationId: string): Promise<CheckoutStatement> {
  return mapCheckoutStatement(
    await apiRequest<ApiCheckoutStatement>(`/hotels/${hotelId}/checkout/${reservationId}/validate`, {
      method: 'POST',
      body: {},
    }),
  )
}

export async function checkoutComplete(
  hotelId: string,
  reservationId: string,
  body: CheckoutCompleteInput,
): Promise<Reservation> {
  return mapReservation(
    await apiRequest<ApiReservation>(`/hotels/${hotelId}/checkout/${reservationId}/complete`, {
      method: 'POST',
      body,
    }),
  )
}

export type TotemSearchInput = { q?: string; cpf?: string }

export type CheckoutCompleteInput = {
  paymentMethod: PaymentMethod
  paidAmount: number
  notes?: string
}
