

export type CheckoutChargeType = 'room' | 'order'

export type CheckoutCharge = {
  type: CheckoutChargeType
  label: string
  amount: number
  orderId?: string
}

export type StayStatus = 'active' | 'completed' | 'cancelled'

export type Stay = {
  id: string
  hotelId: string
  reservationId: string
  spaceId: string
  roomNumber?: string
  guestName: string
  status: StayStatus
  checkedInAt?: string
  checkedOutAt?: string
}

export type StayAccount = {
  stay: Stay
  roomTotal: number
  deliveredOrdersTotal: number
  pendingOrdersTotal: number
  billableTotal: number
  pendingOrderIds: string[]
}
