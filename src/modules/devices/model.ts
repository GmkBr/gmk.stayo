import type { HotelBrand } from '../hotels/model.ts'

export type TotemKind = 'reception' | 'room' | 'area' | 'operation'

export type TotemProfile = {
  id: string
  hotelId: string
  loginId: string
  name: string
  kind: TotemKind
  spaceId?: string
  roomNumber?: string
  areaId?: string
  active: boolean
  brand?: HotelBrand
}

export type Totem = {
  id: string
  hotelId: string
  loginId: string
  name: string
  kind: TotemKind
  spaceId?: string
  roomNumber?: string
  areaId?: string
  active: boolean
  userId?: string
}
