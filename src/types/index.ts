export type RoomStatus =
  | 'available'
  | 'occupied'
  | 'dirty'
  | 'cleaning'
  | 'clean'
  | 'maintenance'
  | 'blocked'

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'arriving_today'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'

export type GuestStatus = 'staying' | 'arriving' | 'departed' | 'vip'

export type MaintenanceStatus = 'open' | 'in_progress' | 'resolved'
export type MaintenancePriority = 'low' | 'medium' | 'high'

export type HousekeepingStatus = 'waiting' | 'in_progress' | 'done'
export type HousekeepingPriority = 'low' | 'medium' | 'high'
export type HousekeepingReason = 'checkout' | 'stayover' | 'deep' | 'blocked'

export type PaymentMethod = 'credit' | 'pix' | 'debit' | 'cash' | 'invoice'

export type Period = 'today' | '7d' | '30d'

export type ActivityKind =
  | 'checkin'
  | 'checkout'
  | 'cleaning'
  | 'request'
  | 'reservation'
  | 'maintenance'

export type Hotel = {
  id: string
  name: string
  city: string
  state: string
  roomCount: number
  occupancy: number
  occupancyDelta: number
  revenue: number
  revenueDelta: number
  checkInsToday: number
  checkOutsToday: number
  checkInsDelta: number
  checkOutsDelta: number
  roomsToClean: number
  inMaintenance: number
  requests: number
  occupancySeries: Record<Period, OccupancyPoint[]>
  brand: HotelBrand
}

export type HotelBrand = {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  hotelName: string
  coverTone: string
}

export type OccupancyPoint = {
  label: string
  value: number
}

export type Room = {
  id: string
  hotelId: string
  number: string
  floor: number
  category: string
  capacity: number
  status: RoomStatus
  guestName?: string
  guestId?: string
  checkIn?: string
  checkOut?: string
  lastCleaned?: string
  nextReservation?: string
  rate: number
}

export type Guest = {
  id: string
  hotelId: string
  name: string
  email: string
  phone: string
  document: string
  nationality: string
  status: GuestStatus
  lastStay?: string
  stays: number
  preferences: string[]
  notes: string
  vip?: boolean
}

export type StayRecord = {
  id: string
  guestId: string
  roomNumber: string
  checkIn: string
  checkOut: string
  total: number
}

export type ConsumptionItem = {
  id: string
  guestId: string
  label: string
  date: string
  amount: number
}

export type GuestRequest = {
  id: string
  guestId: string
  label: string
  date: string
  status: string
}

export type Reservation = {
  id: string
  hotelId: string
  guestId: string
  guestName: string
  guestEmail: string
  guestPhone: string
  roomId: string
  roomNumber: string
  category: string
  checkIn: string
  checkOut: string
  guests: number
  status: ReservationStatus
  total: number
  paymentMethod: PaymentMethod
  notes: string
  history: { at: string; text: string }[]
}

export type HousekeepingTask = {
  id: string
  hotelId: string
  roomId: string
  roomNumber: string
  reason: HousekeepingReason
  priority: HousekeepingPriority
  assignee: string
  status: HousekeepingStatus
}

export type MaintenanceRequest = {
  id: string
  hotelId: string
  code: string
  title: string
  roomNumber: string
  priority: MaintenancePriority
  status: MaintenanceStatus
  openedAt: string
  notes: string
}

export type Service = {
  id: string
  hotelId: string
  name: string
  description: string
  price: number
  active: boolean
  tone: string
  icon: 'tray' | 'spa' | 'clock' | 'car' | 'map' | 'wine' | 'bike' | 'key'
}

export type Activity = {
  id: string
  hotelId: string
  time: string
  title: string
  detail?: string
  kind: ActivityKind
}

export type AppNotification = {
  id: string
  hotelId: string
  title: string
  detail: string
  time: string
  unread: boolean
}

export type CurrentUser = {
  name: string
  role: string
  initials: string
}
