

export type RoomStatus =
  | 'available'
  | 'occupied'
  | 'dirty'
  | 'cleaning'
  | 'clean'
  | 'maintenance'
  | 'blocked'

export type Room = {
  id: string
  hotelId: string
  number: string
  floor: number
  category: string
  capacity: number
  status: RoomStatus
  rate: number
}

export type SpaceType = 'room' | 'area' | 'reception' | 'operation'

export type Space = {
  id: string
  hotelId: string
  type: SpaceType
  name: string
  number?: string
  floor?: string
}
