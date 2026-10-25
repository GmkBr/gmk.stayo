import type { IdBox } from '../../api/ids.ts'
import { unwrapId } from '../../api/ids.ts'
import type { Space, SpaceType } from './model.ts'

export type ApiSpace = {
  id: IdBox
  hotelId: IdBox
  type: SpaceType
  name: string
  number?: string | null
  floor?: string | null
}

export function mapSpace(raw: ApiSpace): Space {
  return {
    id: unwrapId(raw.id),
    hotelId: unwrapId(raw.hotelId),
    type: raw.type,
    name: raw.name,
    number: raw.number ?? undefined,
    floor: raw.floor ?? undefined,
  }
}
