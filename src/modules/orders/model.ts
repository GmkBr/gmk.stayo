

export type OrderStatus = 'open' | 'preparing' | 'delivered' | 'cancelled'

export type OrderSource = 'room' | 'area'

export type OrderLine = {
  id: string
  name: string
  qty: number
  price: number
  catalogItemId?: string
  serviceId?: string
}

export type Order = {
  id: string
  hotelId: string
  reservationId?: string
  stayId?: string
  source: OrderSource
  location: string
  guestName: string
  items: string
  lines: OrderLine[]
  total: number
  status: OrderStatus
  time: string
  createdAt?: string
  totemId?: string
  notes?: string
}

export type AddOrderInput = {
  hotelId: string
  source: Order['source']
  location: string
  guestName: string
  lines: OrderLine[]
  totemId?: string
  spaceId?: string
  notes?: string
  token?: string | null
}
