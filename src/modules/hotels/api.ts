import { apiRequest } from '../../api/client.ts'
import type { ApiHotel } from './mappers.ts'
import { mapHotel } from './mappers.ts'
import type { Hotel } from './model.ts'

export type CreateHotelInput = {
  name: string
  city: string
  state: string
  termsText?: string
  termsPath?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  brandHotelName?: string
  coverTone?: string
}

export type UpdateHotelInput = Partial<CreateHotelInput>

export async function listHotels(): Promise<Hotel[]> {
  const raw = await apiRequest<ApiHotel[]>('/hotels')
  return raw.map(mapHotel)
}

export async function getHotel(hotelId: string): Promise<Hotel> {
  return mapHotel(await apiRequest<ApiHotel>(`/hotels/${hotelId}`))
}

export async function createHotel(body: CreateHotelInput): Promise<Hotel> {
  return mapHotel(await apiRequest<ApiHotel>('/hotels', { method: 'POST', body }))
}

export async function updateHotel(hotelId: string, body: UpdateHotelInput): Promise<Hotel> {
  return mapHotel(await apiRequest<ApiHotel>(`/hotels/${hotelId}`, { method: 'PUT', body }))
}

export async function deleteHotel(hotelId: string): Promise<void> {
  await apiRequest(`/hotels/${hotelId}`, { method: 'DELETE' })
}

export async function switchHotel(hotelId: string): Promise<void> {
  await apiRequest(`/hotels/${hotelId}/switch`, { method: 'POST', body: {} })
}
