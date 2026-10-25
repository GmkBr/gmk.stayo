import type { Reservation } from '../reservations/model.ts'
import type { CheckoutCharge } from '../stays/model.ts'

export type CheckoutStatement = {
  reservation: Reservation
  charges: CheckoutCharge[]
  total: number
  openOrderIds?: string[]
  stayId?: string
}
