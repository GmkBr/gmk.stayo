import { apiRequest } from '../../api/client.ts'
import { qs } from '../../shared/api.ts'
import type { ApiSpace } from './mappers.ts'
import { mapSpace } from './mappers.ts'
import type { Space, SpaceType } from './model.ts'

export async function listSpaces(hotelId: string, type?: SpaceType): Promise<Space[]> {
  const raw = await apiRequest<ApiSpace[]>(`/hotels/${hotelId}/spaces${qs({ type })}`)
  return raw.map(mapSpace)
}

export type CreateSpaceInput =
  | { type: 'room'; number: string; name?: string; floor?: string }
  | { type: 'area'; name: string }

export type UpdateSpaceInput = Partial<{
  number: string
  name: string
  floor: string
}>

export async function createSpace(hotelId: string, body: CreateSpaceInput): Promise<Space> {
  return mapSpace(await apiRequest<ApiSpace>(`/hotels/${hotelId}/spaces`, { method: 'POST', body }))
}

export async function updateSpace(hotelId: string, spaceId: string, body: UpdateSpaceInput): Promise<Space> {
  return mapSpace(
    await apiRequest<ApiSpace>(`/hotels/${hotelId}/spaces/${spaceId}`, { method: 'PATCH', body }),
  )
}

export async function deleteSpace(hotelId: string, spaceId: string): Promise<void> {
  await apiRequest(`/hotels/${hotelId}/spaces/${spaceId}`, { method: 'DELETE' })
}
