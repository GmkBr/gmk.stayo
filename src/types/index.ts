export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'arriving_today'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'

export type RoomStatus =
  | 'available'
  | 'occupied'
  | 'dirty'
  | 'cleaning'
  | 'clean'
  | 'maintenance'
  | 'blocked'

export type PaymentMethod = 'credit' | 'pix' | 'debit' | 'cash' | 'invoice'

export type ActivityKind =
  | 'checkin'
  | 'checkout'
  | 'request'
  | 'reservation'
  | 'order'
  | 'other'
  | 'cleaning'
  | 'maintenance'

export type HotelBrand = {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  hotelName: string
  coverTone: string
}

export type Hotel = {
  id: string
  slug: string
  name: string
  city: string
  state: string
  brand: HotelBrand
  /** Texto exibido no check-in do totem (uma regra por linha). Opcional. */
  termsText?: string
  /** Path do PDF no storage (ex.: hotel-assets/mare/terms.pdf). Opcional. */
  termsPath?: string
}

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

export type Guest = {
  id: string
  hotelId: string
  name: string
  email: string
  phone: string
  document: string
  nationality: string
  status: 'staying' | 'arriving' | 'departed' | 'vip'
  lastStay?: string
  stays: number
  preferences: string[]
  notes: string
  vip?: boolean
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

export type OrderStatus = 'open' | 'preparing' | 'delivered' | 'cancelled'
export type OrderSource = 'room' | 'area'

export type OrderLine = {
  id: string
  name: string
  qty: number
  price: number
}

export type Order = {
  id: string
  hotelId: string
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

export type TotemKind = 'reception' | 'room' | 'area' | 'operation'

export type AccountType = 'human' | 'totem'

export type TotemProfile = {
  id: string
  hotelId: string
  loginId: string
  name: string
  kind: TotemKind
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
  roomNumber?: string
  areaId?: string
  active: boolean
  userId?: string
}

export type HotelArea = {
  id: string
  hotelId: string
  name: string
  active: boolean
}

export type CatalogContext = 'room' | 'area' | 'both'

export type CatalogCategory = {
  id: string
  hotelId: string
  name: string
  context: CatalogContext
  areaIds?: string[]
  sortOrder: number
}

export type CatalogItem = {
  id: string
  hotelId: string
  categoryId: string
  name: string
  description: string
  price: number
  available: boolean
  imagePath?: string
}

export type CurrentUser = {
  name: string
  role: string
  initials: string
  email?: string
}

/** Tipos legados (mocks não usados pela API). Mantidos para o build. */
export type HousekeepingStatus = 'waiting' | 'in_progress' | 'done'
export type HousekeepingPriority = 'low' | 'medium' | 'high'
export type HousekeepingReason = 'checkout' | 'stayover' | 'deep' | 'blocked'
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

export type MaintenanceStatus = 'open' | 'in_progress' | 'resolved'
export type MaintenancePriority = 'low' | 'medium' | 'high'
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

export type AppNotification = {
  id: string
  hotelId: string
  title: string
  detail: string
  time: string
  unread: boolean
}

export type Period = 'today' | '7d' | '30d'
export type OccupancyPoint = { label: string; value: number }
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
