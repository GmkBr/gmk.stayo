import { apiRequest } from '../../api/client.ts'
import type { ApiTotem } from './mappers.ts'
import { mapTotem } from './mappers.ts'
import type { Totem, TotemKind } from './model.ts'

export async function listTotems(hotelId: string): Promise<Totem[]> {
  const raw = await apiRequest<ApiTotem[]>(`/hotels/${hotelId}/totems`)
  return raw.map(mapTotem)
}

export type CreateTotemInput = {
  name: string
  kind: TotemKind
  loginSuffix: string
  password: string
  roomNumber?: string | null
  areaId?: string | null
}

export function buildCreateTotemBody(input: CreateTotemInput) {
  return {
    name: input.name,
    kind: input.kind,
    loginSuffix: input.loginSuffix,
    password: input.password,
    roomNumber: input.kind === 'room' ? (input.roomNumber?.trim() || null) : null,
    areaId: input.kind === 'area' ? (input.areaId?.trim() || null) : null,
  }
}

export async function createTotem(hotelId: string, input: CreateTotemInput): Promise<Totem> {
  return mapTotem(
    await apiRequest<ApiTotem>(`/hotels/${hotelId}/totems`, {
      method: 'POST',
      body: buildCreateTotemBody(input),
    }),
  )
}

export async function updateTotem(
  hotelId: string,
  totemId: string,
  body: Partial<{
    name: string
    kind: TotemKind
    roomNumber: string
    areaId: string
    active: boolean
  }>,
): Promise<Totem> {
  return mapTotem(
    await apiRequest<ApiTotem>(`/hotels/${hotelId}/totems/${totemId}`, { method: 'PATCH', body }),
  )
}

export async function resetTotemPassword(
  hotelId: string,
  totemId: string,
  password: string,
): Promise<void> {
  await apiRequest(`/hotels/${hotelId}/totems/${totemId}/reset-password`, {
    method: 'POST',
    body: { password },
  })
}
