

export type ActivityKind =
  | 'checkin'
  | 'checkout'
  | 'request'
  | 'reservation'
  | 'order'
  | 'other'
  | 'cleaning'
  | 'maintenance'

export type Activity = {
  id: string
  hotelId: string
  time: string
  title: string
  detail?: string
  kind: ActivityKind
}
