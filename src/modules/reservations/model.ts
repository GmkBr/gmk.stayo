import type { PaymentMethod } from '../../shared/model.ts'

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'arriving_today'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'

export type Reservation = {
  id: string
  hotelId: string
  /** Código legível (ex.: RES-1001). */
  code?: string
  guestId: string
  guestName: string
  guestCpf?: string
  guestEmail: string
  guestPhone: string
  roomId: string
  roomNumber: string
  category: string
  checkIn: string
  checkOut: string
  guests: number
  status: ReservationStatus
  nightlyRate?: number
  total: number
  paymentMethod?: PaymentMethod
  notes: string
  history: { at: string; text: string }[]
}
