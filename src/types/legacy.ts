

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
