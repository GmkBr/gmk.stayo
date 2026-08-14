import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  mockActivities,
  mockGuests,
  mockHousekeeping,
  mockHotels,
  mockMaintenance,
  mockReservations,
  mockRooms,
  mockServices,
} from '../data/mock/index.ts'
import type {
  Activity,
  Guest,
  Hotel,
  HousekeepingStatus,
  HousekeepingTask,
  MaintenanceRequest,
  MaintenanceStatus,
  Period,
  Reservation,
  ReservationStatus,
  Room,
  RoomStatus,
  Service,
} from '../types/index.ts'

const USER = { name: 'João', role: 'Administrador', initials: 'JS' }

type AppContextValue = {
  user: typeof USER
  hotels: Hotel[]
  hotel: Hotel
  setHotelId: (id: string) => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  mobileNavOpen: boolean
  setMobileNavOpen: (open: boolean) => void
  period: Period
  setPeriod: (period: Period) => void
  rooms: Room[]
  guests: Guest[]
  reservations: Reservation[]
  housekeeping: HousekeepingTask[]
  maintenance: MaintenanceRequest[]
  services: Service[]
  activities: Activity[]
  hotelRooms: Room[]
  hotelGuests: Guest[]
  hotelReservations: Reservation[]
  hotelHousekeeping: HousekeepingTask[]
  hotelMaintenance: MaintenanceRequest[]
  hotelServices: Service[]
  hotelActivities: Activity[]
  updateReservationStatus: (id: string, status: ReservationStatus) => void
  addReservation: (reservation: Reservation) => void
  updateRoomStatus: (id: string, status: RoomStatus) => void
  updateHousekeepingStatus: (id: string, status: HousekeepingStatus) => void
  updateMaintenanceStatus: (id: string, status: MaintenanceStatus) => void
  addMaintenance: (request: MaintenanceRequest) => void
  toggleService: (id: string) => void
  addActivity: (activity: Omit<Activity, 'id' | 'hotelId'>) => void
}

const AppContext = createContext<AppContextValue | null>(null)

function readHotelId() {
  return localStorage.getItem('stayo.hotel') ?? 'aurora'
}

function readCollapsed() {
  return localStorage.getItem('stayo.sidebar') === '1'
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [hotelId, setHotelIdState] = useState(readHotelId)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readCollapsed)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [period, setPeriod] = useState<Period>('7d')
  const [rooms, setRooms] = useState(mockRooms)
  const [guests] = useState(mockGuests)
  const [reservations, setReservations] = useState(mockReservations)
  const [housekeeping, setHousekeeping] = useState(mockHousekeeping)
  const [maintenance, setMaintenance] = useState(mockMaintenance)
  const [services, setServices] = useState(mockServices)
  const [activities, setActivities] = useState(mockActivities)

  const hotel = mockHotels.find((h) => h.id === hotelId) ?? mockHotels[0]

  const setHotelId = useCallback((id: string) => {
    setHotelIdState(id)
    localStorage.setItem('stayo.hotel', id)
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('stayo.sidebar', next ? '1' : '0')
      return next
    })
  }, [])

  const addActivity = useCallback((activity: Omit<Activity, 'id' | 'hotelId'>) => {
    setActivities((prev) => [
      { ...activity, id: `ac-${Date.now()}`, hotelId },
      ...prev,
    ])
  }, [hotelId])

  const updateReservationStatus = useCallback((id: string, status: ReservationStatus) => {
    setReservations((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)))
  }, [])

  const addReservation = useCallback((reservation: Reservation) => {
    setReservations((prev) => [reservation, ...prev])
  }, [])

  const updateRoomStatus = useCallback((id: string, status: RoomStatus) => {
    setRooms((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)))
  }, [])

  const updateHousekeepingStatus = useCallback((id: string, status: HousekeepingStatus) => {
    setHousekeeping((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)))
  }, [])

  const updateMaintenanceStatus = useCallback((id: string, status: MaintenanceStatus) => {
    setMaintenance((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)))
  }, [])

  const addMaintenance = useCallback((request: MaintenanceRequest) => {
    setMaintenance((prev) => [request, ...prev])
  }, [])

  const toggleService = useCallback((id: string) => {
    setServices((prev) => prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item)))
  }, [])

  const value = useMemo<AppContextValue>(
    () => ({
      user: USER,
      hotels: mockHotels,
      hotel,
      setHotelId,
      sidebarCollapsed,
      toggleSidebar,
      mobileNavOpen,
      setMobileNavOpen,
      period,
      setPeriod,
      rooms,
      guests,
      reservations,
      housekeeping,
      maintenance,
      services,
      activities,
      hotelRooms: rooms.filter((item) => item.hotelId === hotel.id),
      hotelGuests: guests.filter((item) => item.hotelId === hotel.id),
      hotelReservations: reservations.filter((item) => item.hotelId === hotel.id),
      hotelHousekeeping: housekeeping.filter((item) => item.hotelId === hotel.id),
      hotelMaintenance: maintenance.filter((item) => item.hotelId === hotel.id),
      hotelServices: services.filter((item) => item.hotelId === hotel.id),
      hotelActivities: activities.filter((item) => item.hotelId === hotel.id),
      updateReservationStatus,
      addReservation,
      updateRoomStatus,
      updateHousekeepingStatus,
      updateMaintenanceStatus,
      addMaintenance,
      toggleService,
      addActivity,
    }),
    [
      hotel,
      setHotelId,
      sidebarCollapsed,
      toggleSidebar,
      mobileNavOpen,
      period,
      rooms,
      guests,
      reservations,
      housekeeping,
      maintenance,
      services,
      activities,
      updateReservationStatus,
      addReservation,
      updateRoomStatus,
      updateHousekeepingStatus,
      updateMaintenanceStatus,
      addMaintenance,
      toggleService,
      addActivity,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
