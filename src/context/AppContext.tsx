import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  mockActivities,
  mockAreas,
  mockCatalogCategories,
  mockCatalogItems,
  mockGuests,
  mockHousekeeping,
  mockHotels,
  mockMaintenance,
  mockOrders,
  mockReservations,
  mockRooms,
  mockServices,
  mockTotems,
} from '../data/mock/index.ts'
import type {
  Activity,
  CatalogCategory,
  CatalogItem,
  Guest,
  Hotel,
  HotelArea,
  HousekeepingStatus,
  HousekeepingTask,
  MaintenanceRequest,
  MaintenanceStatus,
  Order,
  OrderLine,
  OrderStatus,
  Period,
  Reservation,
  ReservationStatus,
  Room,
  RoomStatus,
  Service,
  Totem,
  TotemKind,
} from '../types/index.ts'
import { clockLabel } from '../utils/format.ts'

const USER = { name: 'João', role: 'Administrador', initials: 'JS' }

export type AddOrderInput = {
  hotelId: string
  source: Order['source']
  location: string
  guestName: string
  lines: OrderLine[]
  totemId?: string
  notes?: string
}

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
  orders: Order[]
  totems: Totem[]
  areas: HotelArea[]
  catalogCategories: CatalogCategory[]
  catalogItems: CatalogItem[]
  hotelRooms: Room[]
  hotelGuests: Guest[]
  hotelReservations: Reservation[]
  hotelHousekeeping: HousekeepingTask[]
  hotelMaintenance: MaintenanceRequest[]
  hotelServices: Service[]
  hotelActivities: Activity[]
  hotelOrders: Order[]
  hotelTotems: Totem[]
  hotelAreas: HotelArea[]
  hotelCatalogCategories: CatalogCategory[]
  hotelCatalogItems: CatalogItem[]
  updateReservationStatus: (id: string, status: ReservationStatus) => void
  addReservation: (reservation: Reservation) => void
  updateRoomStatus: (id: string, status: RoomStatus) => void
  updateHousekeepingStatus: (id: string, status: HousekeepingStatus) => void
  updateMaintenanceStatus: (id: string, status: MaintenanceStatus) => void
  addMaintenance: (request: MaintenanceRequest) => void
  toggleService: (id: string) => void
  updateService: (id: string, patch: Partial<Pick<Service, 'name' | 'description' | 'price' | 'active'>>) => void
  addActivity: (activity: Omit<Activity, 'id' | 'hotelId'>) => void
  addOrder: (input: AddOrderInput) => Order
  updateOrderStatus: (id: string, status: OrderStatus) => void
  bindTotemByCode: (code: string, kind: TotemKind) => Totem | null
  addTotem: (totem: Omit<Totem, 'id'>) => Totem
  updateTotem: (id: string, patch: Partial<Omit<Totem, 'id' | 'hotelId'>>) => void
  addArea: (area: Omit<HotelArea, 'id'>) => HotelArea
  updateArea: (id: string, patch: Partial<Omit<HotelArea, 'id' | 'hotelId'>>) => void
  addCatalogCategory: (category: Omit<CatalogCategory, 'id'>) => CatalogCategory
  updateCatalogCategory: (id: string, patch: Partial<Omit<CatalogCategory, 'id' | 'hotelId'>>) => void
  addCatalogItem: (item: Omit<CatalogItem, 'id'>) => CatalogItem
  updateCatalogItem: (id: string, patch: Partial<Omit<CatalogItem, 'id' | 'hotelId'>>) => void
}

export const AppContext = createContext<AppContextValue | null>(null)

function readHotelId() {
  return localStorage.getItem('stayo.hotel') ?? 'aurora'
}

function readCollapsed() {
  return localStorage.getItem('stayo.sidebar') === '1'
}

function foldCode(value: string) {
  return value.trim().toUpperCase()
}

function summarizeLines(lines: OrderLine[]) {
  if (lines.length === 0) return 'Pedido vazio'
  if (lines.length === 1) return lines[0].qty > 1 ? `${lines[0].qty}× ${lines[0].name}` : lines[0].name
  return lines.map((line) => (line.qty > 1 ? `${line.qty}× ${line.name}` : line.name)).join(' · ')
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
  const [orders, setOrders] = useState(mockOrders)
  const [totems, setTotems] = useState(mockTotems)
  const [areas, setAreas] = useState(mockAreas)
  const [catalogCategories, setCatalogCategories] = useState(mockCatalogCategories)
  const [catalogItems, setCatalogItems] = useState(mockCatalogItems)

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

  const addActivity = useCallback(
    (activity: Omit<Activity, 'id' | 'hotelId'>) => {
      setActivities((prev) => [{ ...activity, id: `ac-${Date.now()}`, hotelId }, ...prev])
    },
    [hotelId],
  )

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

  const updateService = useCallback(
    (id: string, patch: Partial<Pick<Service, 'name' | 'description' | 'price' | 'active'>>) => {
      setServices((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
    },
    [],
  )

  const addOrder = useCallback((input: AddOrderInput) => {
    const total = input.lines.reduce((sum, line) => sum + line.price * line.qty, 0)
    const order: Order = {
      id: `or-${Date.now()}`,
      hotelId: input.hotelId,
      source: input.source,
      location: input.location,
      guestName: input.guestName,
      items: summarizeLines(input.lines),
      lines: input.lines,
      total,
      status: 'open',
      time: clockLabel(),
      totemId: input.totemId,
      notes: input.notes,
    }
    setOrders((prev) => [order, ...prev])
    return order
  }, [])

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)))
  }, [])

  const bindTotemByCode = useCallback(
    (code: string, kind: TotemKind) => {
      const normalized = foldCode(code)
      const match = totems.find(
        (item) => foldCode(item.code) === normalized && item.kind === kind && item.active,
      )
      return match ?? null
    },
    [totems],
  )

  const addTotem = useCallback((totem: Omit<Totem, 'id'>) => {
    const created: Totem = { ...totem, id: `tm-${Date.now()}` }
    setTotems((prev) => [...prev, created])
    return created
  }, [])

  const updateTotem = useCallback((id: string, patch: Partial<Omit<Totem, 'id' | 'hotelId'>>) => {
    setTotems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }, [])

  const addArea = useCallback((area: Omit<HotelArea, 'id'>) => {
    const created: HotelArea = { ...area, id: `ar-${Date.now()}` }
    setAreas((prev) => [...prev, created])
    return created
  }, [])

  const updateArea = useCallback((id: string, patch: Partial<Omit<HotelArea, 'id' | 'hotelId'>>) => {
    setAreas((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }, [])

  const addCatalogCategory = useCallback((category: Omit<CatalogCategory, 'id'>) => {
    const created: CatalogCategory = { ...category, id: `cat-${Date.now()}` }
    setCatalogCategories((prev) => [...prev, created])
    return created
  }, [])

  const updateCatalogCategory = useCallback(
    (id: string, patch: Partial<Omit<CatalogCategory, 'id' | 'hotelId'>>) => {
      setCatalogCategories((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
    },
    [],
  )

  const addCatalogItem = useCallback((item: Omit<CatalogItem, 'id'>) => {
    const created: CatalogItem = { ...item, id: `ci-${Date.now()}` }
    setCatalogItems((prev) => [...prev, created])
    return created
  }, [])

  const updateCatalogItem = useCallback(
    (id: string, patch: Partial<Omit<CatalogItem, 'id' | 'hotelId'>>) => {
      setCatalogItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
    },
    [],
  )

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
      orders,
      totems,
      areas,
      catalogCategories,
      catalogItems,
      hotelRooms: rooms.filter((item) => item.hotelId === hotel.id),
      hotelGuests: guests.filter((item) => item.hotelId === hotel.id),
      hotelReservations: reservations.filter((item) => item.hotelId === hotel.id),
      hotelHousekeeping: housekeeping.filter((item) => item.hotelId === hotel.id),
      hotelMaintenance: maintenance.filter((item) => item.hotelId === hotel.id),
      hotelServices: services.filter((item) => item.hotelId === hotel.id),
      hotelActivities: activities.filter((item) => item.hotelId === hotel.id),
      hotelOrders: orders.filter((item) => item.hotelId === hotel.id),
      hotelTotems: totems.filter((item) => item.hotelId === hotel.id),
      hotelAreas: areas.filter((item) => item.hotelId === hotel.id),
      hotelCatalogCategories: catalogCategories.filter((item) => item.hotelId === hotel.id),
      hotelCatalogItems: catalogItems.filter((item) => item.hotelId === hotel.id),
      updateReservationStatus,
      addReservation,
      updateRoomStatus,
      updateHousekeepingStatus,
      updateMaintenanceStatus,
      addMaintenance,
      toggleService,
      updateService,
      addActivity,
      addOrder,
      updateOrderStatus,
      bindTotemByCode,
      addTotem,
      updateTotem,
      addArea,
      updateArea,
      addCatalogCategory,
      updateCatalogCategory,
      addCatalogItem,
      updateCatalogItem,
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
      orders,
      totems,
      areas,
      catalogCategories,
      catalogItems,
      updateReservationStatus,
      addReservation,
      updateRoomStatus,
      updateHousekeepingStatus,
      updateMaintenanceStatus,
      addMaintenance,
      toggleService,
      updateService,
      addActivity,
      addOrder,
      updateOrderStatus,
      bindTotemByCode,
      addTotem,
      updateTotem,
      addArea,
      updateArea,
      addCatalogCategory,
      updateCatalogCategory,
      addCatalogItem,
      updateCatalogItem,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function useHotelData(hotelId: string) {
  const ctx = useApp()
  return useMemo(
    () => ({
      reservations: ctx.reservations.filter((item) => item.hotelId === hotelId),
      services: ctx.services.filter((item) => item.hotelId === hotelId && item.active),
      catalogCategories: ctx.catalogCategories.filter((item) => item.hotelId === hotelId),
      catalogItems: ctx.catalogItems.filter((item) => item.hotelId === hotelId && item.available),
      areas: ctx.areas.filter((item) => item.hotelId === hotelId && item.active),
    }),
    [ctx.reservations, ctx.services, ctx.catalogCategories, ctx.catalogItems, ctx.areas, hotelId],
  )
}
