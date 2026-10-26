import type { IdBox } from '../../api/ids.ts'
import { unwrapId } from '../../api/ids.ts'
import type { Totem, TotemKind } from './model.ts'

export type ApiTotem = {
  id: IdBox
  hotelId: IdBox
  loginId: string
  name: string
  kind: TotemKind
  spaceId?: IdBox | string | null
  roomNumber?: string | null
  areaId?: IdBox
  active: boolean
  userId?: IdBox
}

export function mapTotem(raw: ApiTotem): Totem {
  return {
    id: unwrapId(raw.id),
    hotelId: unwrapId(raw.hotelId),
    loginId: raw.loginId,
    name: raw.name,
    kind: raw.kind,
    spaceId: unwrapId(raw.spaceId) || undefined,
    roomNumber: raw.roomNumber ?? undefined,
    areaId: unwrapId(raw.areaId) || undefined,
    active: raw.active,
    userId: unwrapId(raw.userId) || undefined,
  }
}
