import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.tsx'
import * as api from '../api/index.ts'
import { ApiError } from '../api/client.ts'
import { hotelFromTotem } from '../lib/totemHotel.ts'
import type {
  Activity,
  CatalogCategory,
  CatalogItem,
  CurrentUser,
  Hotel,
  HotelArea,
  Order,
  OrderLine,
  OrderStatus,
  Reservation,
  ReservationStatus,
  Room,
  Service,
  Totem,
} from '../types/index.ts'

export type AddOrderInput = {
  hotelId: string
  source: Order['source']
  location: string
  guestName: string
  lines: OrderLine[]
  totemId?: string
  notes?: string
  token?: string | null
}

export type CreateReservationInput = api.CreateReservationInput

type AppContextValue = {
  bootstrapping: boolean
  bootstrapError: string | null
  refreshing: boolean
  profile: api.MeProfile | null
  user: CurrentUser
  hotels: Hotel[]
  hotelId: string
  hotel: Hotel
  setHotelId: (id: string) => void
  createHotel: (input: api.CreateHotelInput) => Promise<Hotel>
  updateHotel: (id: string, input: api.UpdateHotelInput) => Promise<Hotel>
  deleteHotel: (id: string) => Promise<void>
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  mobileNavOpen: boolean
  setMobileNavOpen: (open: boolean) => void
  reloadHotelData: () => Promise<void>
  retryBootstrap: () => Promise<void>
  reservations: Reservation[]
  orders: Order[]
  totems: Totem[]
  areas: HotelArea[]
  catalogCategories: CatalogCategory[]
  catalogItems: CatalogItem[]
  services: Service[]
  activities: Activity[]
  hotelReservations: Reservation[]
  hotelOrders: Order[]
  hotelTotems: Totem[]
  hotelAreas: HotelArea[]
  hotelCatalogCategories: CatalogCategory[]
  hotelCatalogItems: CatalogItem[]
  hotelServices: Service[]
  hotelActivities: Activity[]
  hotelRooms: Room[]
  queueSummary: api.QueueSummary | null
  confirmReservation: (id: string) => Promise<Reservation>
  cancelReservation: (id: string) => Promise<Reservation>
  createReservation: (input: CreateReservationInput) => Promise<Reservation>
  addReservation: (reservation: Reservation) => void
  updateReservationStatus: (id: string, status: ReservationStatus) => Promise<void>
  addOrder: (input: AddOrderInput) => Promise<Order>
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<Order>
  addTotem: (input: api.CreateTotemInput) => Promise<Totem>
  updateTotem: (id: string, patch: Partial<Omit<Totem, 'id' | 'hotelId' | 'loginId' | 'userId'>>) => Promise<void>
  resetTotemPassword: (id: string, password: string) => Promise<void>
  addArea: (area: Omit<HotelArea, 'id'>) => Promise<HotelArea>
  updateArea: (id: string, patch: Partial<Omit<HotelArea, 'id' | 'hotelId'>>) => Promise<void>
  addCatalogCategory: (category: Omit<CatalogCategory, 'id'>) => Promise<CatalogCategory>
  updateCatalogCategory: (id: string, patch: Partial<Omit<CatalogCategory, 'id' | 'hotelId'>>) => Promise<void>
  addCatalogItem: (item: Omit<CatalogItem, 'id'>) => Promise<CatalogItem>
  updateCatalogItem: (id: string, patch: Partial<Omit<CatalogItem, 'id' | 'hotelId'>>) => Promise<void>
  toggleService: (id: string) => Promise<void>
  updateService: (id: string, patch: Partial<Pick<Service, 'name' | 'description' | 'price' | 'active'>>) => Promise<void>
  addActivity: (activity: Omit<Activity, 'id' | 'hotelId'>) => void
  completeCheckin: (reservationId: string) => Promise<Reservation>
  searchCheckin: (query: string) => Promise<Reservation[]>
}

export const AppContext = createContext<AppContextValue | null>(null)

function readHotelId() {
  return localStorage.getItem('stayo.hotel') ?? ''
}

function readCollapsed() {
  return localStorage.getItem('stayo.sidebar') === '1'
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || 'ST'
}

function roomsFromData(hotelId: string, reservations: Reservation[], totems: Totem[]): Room[] {
  const map = new Map<string, Room>()
  for (const r of reservations) {
    if (!r.roomNumber) continue
    const key = r.roomNumber
    if (map.has(key)) continue
    map.set(key, {
      id: r.roomId || `room-${key}`,
      hotelId,
      number: key,
      floor: Number(key.replace(/\D/g, '')[0] || 1),
      category: r.category || 'Standard',
      capacity: Math.max(1, r.guests),
      status: r.status === 'checked_in' ? 'occupied' : 'available',
      rate: r.total || 0,
    })
  }
  for (const t of totems) {
    if (t.kind !== 'room' || !t.roomNumber || map.has(t.roomNumber)) continue
    map.set(t.roomNumber, {
      id: `room-${t.roomNumber}`,
      hotelId,
      number: t.roomNumber,
      floor: Number(t.roomNumber.replace(/\D/g, '')[0] || 1),
      category: 'Standard',
      capacity: 2,
      status: 'available',
      rate: 0,
    })
  }
  return [...map.values()].sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
}

const EMPTY_HOTEL: Hotel = {
  id: '',
  slug: '',
  name: 'Carregando…',
  city: '',
  state: '',
  brand: {
    primaryColor: '#0B3D5C',
    secondaryColor: '#1F6F8B',
    accentColor: '#F4A261',
    hotelName: 'STAYO',
    coverTone: 'cool',
  },
}

const CONSOLE_PATHS = ['/filas', '/reservas', '/totens', '/cardapio'] as const

function isConsolePath(pathname: string) {
  return CONSOLE_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

function isTotemPath(pathname: string) {
  return pathname === '/totem' || pathname.startsWith('/totem/')
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { ready: authReady, accessToken, user: authUser, usingDevToken } = useAuth()
  const { pathname } = useLocation()
  const [bootstrapping, setBootstrapping] = useState(true)
  const [bootstrapError, setBootstrapError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [profile, setProfile] = useState<api.MeProfile | null>(null)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [hotelId, setHotelIdState] = useState(readHotelId)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readCollapsed)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [totems, setTotems] = useState<Totem[]>([])
  const [areas, setAreas] = useState<HotelArea[]>([])
  const [catalogCategories, setCatalogCategories] = useState<CatalogCategory[]>([])
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [queueSummary, setQueueSummary] = useState<api.QueueSummary | null>(null)

  const hotel = hotels.find((h) => h.id === hotelId) ?? EMPTY_HOTEL

  const user = useMemo<CurrentUser>(() => {
    if (profile) {
      if (profile.accountType === 'totem' && profile.totem) {
        return {
          name: profile.totem.name,
          role: 'Totem',
          initials: initialsOf(profile.totem.name),
          email: profile.email,
        }
      }
      return {
        name: profile.fullName,
        role: 'Console',
        initials: initialsOf(profile.fullName),
        email: profile.email,
      }
    }
    if (authUser) {
      const name = authUser.fullName || authUser.email.split('@')[0] || 'Usuário'
      return { name, role: 'Console', initials: initialsOf(name), email: authUser.email }
    }
    if (usingDevToken) return { name: 'Admin local', role: 'Administrador', initials: 'AL', email: 'admin@stayo.local' }
    return { name: 'Convidado', role: '—', initials: '—' }
  }, [profile, authUser, usingDevToken])

  const setHotelId = useCallback((id: string) => {
    setHotelIdState(id)
    localStorage.setItem('stayo.hotel', id)
    // Best-effort: notifica o BE do contexto (se a rota existir).
    void api.switchHotel(id).catch(() => undefined)
  }, [])

  const clearHotelScoped = useCallback(() => {
    setReservations([])
    setOrders([])
    setTotems([])
    setAreas([])
    setCatalogCategories([])
    setCatalogItems([])
    setServices([])
    setActivities([])
    setQueueSummary(null)
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('stayo.sidebar', next ? '1' : '0')
      return next
    })
  }, [])

  const loadHotelScoped = useCallback(async (id: string) => {
    if (!id) return
    setRefreshing(true)
    try {
      const [resPage, orderPage, totemList, areaList, cats, items, svcs, acts, summary] =
        await Promise.all([
          api.searchReservations(id, { size: 200 }),
          api.listOrders(id, { size: 200 }),
          api.listTotems(id),
          api.listAreas(id),
          api.listCategories(id),
          api.listItems(id),
          api.listServices(id),
          api.listActivities(id),
          api.getQueueSummary(id),
        ])
      setReservations(resPage.items)
      setOrders(orderPage.items)
      setTotems(totemList)
      setAreas(areaList)
      setCatalogCategories(cats)
      setCatalogItems(items)
      setServices(svcs)
      setActivities(acts)
      setQueueSummary(summary)
    } finally {
      setRefreshing(false)
    }
  }, [])

  const createHotelFn = useCallback(
    async (input: api.CreateHotelInput) => {
      const next = await api.createHotel(input)
      setHotels((prev) => {
        if (prev.some((h) => h.id === next.id)) return prev.map((h) => (h.id === next.id ? next : h))
        return [...prev, next]
      })
      setHotelIdState(next.id)
      localStorage.setItem('stayo.hotel', next.id)
      setBootstrapError(null)
      return next
    },
    [],
  )

  const updateHotelFn = useCallback(async (id: string, input: api.UpdateHotelInput) => {
    const next = await api.updateHotel(id, input)
    setHotels((prev) => prev.map((h) => (h.id === id ? next : h)))
    return next
  }, [])

  const deleteHotelFn = useCallback(
    async (id: string) => {
      await api.deleteHotel(id)
      const remaining = hotels.filter((h) => h.id !== id)
      setHotels(remaining)
      if (id === hotelId) {
        if (remaining[0]) {
          setHotelIdState(remaining[0].id)
          localStorage.setItem('stayo.hotel', remaining[0].id)
        } else {
          setHotelIdState('')
          localStorage.removeItem('stayo.hotel')
          clearHotelScoped()
        }
      }
    },
    [clearHotelScoped, hotelId, hotels],
  )

  const bootstrap = useCallback(async () => {
    if (!accessToken) {
      setProfile(null)
      setHotels([])
      setHotelIdState('')
      clearHotelScoped()
      setBootstrapping(false)
      setBootstrapError(null)
      return
    }
    setBootstrapping(true)
    setBootstrapError(null)
    let loadedMe: api.MeProfile | null = null
    try {
      const me = await api.getMe()
      loadedMe = me
      setProfile(me)

      if (me.accountType === 'totem' && me.totem) {
        const h = hotelFromTotem(me.totem, me.hotel)
        setHotels([h])
        setHotelIdState(h.id)
        localStorage.setItem('stayo.hotel', h.id)
        return
      }

      const list = await api.listHotels()
      setHotels(list)

      if (list.length === 0) {
        setHotelIdState('')
        localStorage.removeItem('stayo.hotel')
        clearHotelScoped()
        return
      }

      const savedId = readHotelId()
      const preferred = list.find((h) => h.id === savedId)
      if (preferred) {
        setHotelIdState(preferred.id)
      } else {
        setHotelIdState('')
        localStorage.removeItem('stayo.hotel')
        clearHotelScoped()
      }
    } catch (err) {
      // 401: AuthContext já dispara signOut via setUnauthorizedHandler → RequireAuth → /login
      const message =
        err instanceof ApiError
          ? err.status === 404
            ? profile?.accountType === 'totem'
              ? 'Não foi possível carregar o hotel do totem. Verifique se o hotel existe e se a conta totem tem acesso.'
              : 'GET /me não encontrado. Confira se o backend expõe /api/v1/me.'
            : err.status === 401
              ? 'Sessão inválida. Redirecionando para o login…'
              : err.message
          : err instanceof Error
            ? err.message
            : 'Falha ao carregar dados da API'
      setBootstrapError(message)
      if (loadedMe?.accountType !== 'totem') {
        setProfile(null)
        setHotels([])
      }
      if (err instanceof ApiError && err.status === 401) {
        setHotelIdState('')
        clearHotelScoped()
      }
    } finally {
      setBootstrapping(false)
    }
  }, [accessToken, clearHotelScoped])

  useEffect(() => {
    if (!authReady) return
    void bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap when auth token ready
  }, [authReady, accessToken])

  useEffect(() => {
    if (!accessToken || !hotelId || bootstrapping) return
    if (!isConsolePath(pathname) && !isTotemPath(pathname)) return
    void loadHotelScoped(hotelId)
  }, [accessToken, hotelId, bootstrapping, pathname, loadHotelScoped])

  const reloadHotelData = useCallback(async () => {
    if (hotel.id) await loadHotelScoped(hotel.id)
  }, [hotel.id, loadHotelScoped])

  const retryBootstrap = useCallback(async () => {
    await bootstrap()
  }, [bootstrap])

  const replaceReservation = useCallback((next: Reservation) => {
    setReservations((prev) => {
      const idx = prev.findIndex((item) => item.id === next.id)
      if (idx < 0) return [next, ...prev]
      const copy = [...prev]
      copy[idx] = next
      return copy
    })
  }, [])

  const replaceOrder = useCallback((next: Order) => {
    setOrders((prev) => {
      const idx = prev.findIndex((item) => item.id === next.id)
      if (idx < 0) return [next, ...prev]
      const copy = [...prev]
      copy[idx] = next
      return copy
    })
  }, [])

  const confirmReservation = useCallback(
    async (id: string) => {
      const next = await api.confirmReservation(hotel.id, id)
      replaceReservation(next)
      return next
    },
    [hotel.id, replaceReservation],
  )

  const cancelReservationFn = useCallback(
    async (id: string) => {
      const next = await api.cancelReservation(hotel.id, id)
      replaceReservation(next)
      return next
    },
    [hotel.id, replaceReservation],
  )

  const createReservation = useCallback(
    async (input: CreateReservationInput) => {
      const next = await api.createReservation(hotel.id, input)
      setReservations((prev) => [next, ...prev])
      return next
    },
    [hotel.id],
  )

  const addReservation = useCallback((reservation: Reservation) => {
    setReservations((prev) => [reservation, ...prev])
  }, [])

  const updateReservationStatus = useCallback(
    async (id: string, status: ReservationStatus) => {
      if (status === 'cancelled') {
        await cancelReservationFn(id)
        return
      }
      if (status === 'confirmed') {
        await confirmReservation(id)
        return
      }
      if (status === 'checked_in') {
        const next = await api.checkinComplete(hotel.id, id)
        replaceReservation(next)
        return
      }
      setReservations((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)))
    },
    [cancelReservationFn, confirmReservation, hotel.id, replaceReservation],
  )

  const addOrder = useCallback(
    async (input: AddOrderInput) => {
      const next = await api.placeOrder(input.hotelId, {
        source: input.source,
        location: input.location,
        guestName: input.guestName,
        lines: input.lines.map(({ name, qty, price }) => ({ name, qty, price })),
        totemId: input.totemId,
        notes: input.notes,
        token: input.token,
      })
      if (input.hotelId === hotel.id) setOrders((prev) => [next, ...prev])
      return next
    },
    [hotel.id],
  )

  const updateOrderStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      const next =
        status === 'cancelled'
          ? await api.cancelOrder(hotel.id, id)
          : await api.advanceOrderStatus(hotel.id, id)
      replaceOrder(next)
      return next
    },
    [hotel.id, replaceOrder],
  )

  const addTotem = useCallback(
    async (input: api.CreateTotemInput) => {
      const next = await api.createTotem(hotel.id, input)
      setTotems((prev) => [...prev, next])
      return next
    },
    [hotel.id],
  )

  const updateTotemFn = useCallback(
    async (id: string, patch: Partial<Omit<Totem, 'id' | 'hotelId' | 'loginId' | 'userId'>>) => {
      const current = totems.find((t) => t.id === id)
      if (!current) return
      const next = await api.updateTotem(hotel.id, id, {
        name: patch.name ?? current.name,
        kind: patch.kind ?? current.kind,
        roomNumber: patch.roomNumber ?? current.roomNumber,
        areaId: patch.areaId ?? current.areaId,
        active: patch.active ?? current.active,
      })
      setTotems((prev) => prev.map((item) => (item.id === id ? next : item)))
    },
    [hotel.id, totems],
  )

  const resetTotemPasswordFn = useCallback(
    async (id: string, password: string) => {
      await api.resetTotemPassword(hotel.id, id, password)
    },
    [hotel.id],
  )

  const addArea = useCallback(
    async (area: Omit<HotelArea, 'id'>) => {
      const next = await api.createArea(hotel.id, { name: area.name, active: area.active })
      setAreas((prev) => [...prev, next])
      return next
    },
    [hotel.id],
  )

  const updateAreaFn = useCallback(
    async (id: string, patch: Partial<Omit<HotelArea, 'id' | 'hotelId'>>) => {
      const current = areas.find((a) => a.id === id)
      if (!current) return
      const next = await api.updateArea(hotel.id, id, {
        name: patch.name ?? current.name,
        active: patch.active ?? current.active,
      })
      setAreas((prev) => prev.map((item) => (item.id === id ? next : item)))
    },
    [areas, hotel.id],
  )

  const addCatalogCategory = useCallback(
    async (category: Omit<CatalogCategory, 'id'>) => {
      const next = await api.createCategory(hotel.id, {
        name: category.name,
        context: category.context,
        areaIds: category.areaIds,
        sortOrder: category.sortOrder,
      })
      setCatalogCategories((prev) => [...prev, next])
      return next
    },
    [hotel.id],
  )

  const updateCatalogCategory = useCallback(
    async (id: string, patch: Partial<Omit<CatalogCategory, 'id' | 'hotelId'>>) => {
      const current = catalogCategories.find((c) => c.id === id)
      if (!current) return
      const next = await api.updateCategory(hotel.id, id, {
        name: patch.name ?? current.name,
        context: patch.context ?? current.context,
        areaIds: patch.areaIds ?? current.areaIds,
        sortOrder: patch.sortOrder ?? current.sortOrder,
      })
      setCatalogCategories((prev) => prev.map((item) => (item.id === id ? next : item)))
    },
    [catalogCategories, hotel.id],
  )

  const addCatalogItem = useCallback(
    async (item: Omit<CatalogItem, 'id'>) => {
      const next = await api.createItem(hotel.id, {
        categoryId: item.categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        available: item.available,
        imagePath: item.imagePath,
      })
      setCatalogItems((prev) => [...prev, next])
      return next
    },
    [hotel.id],
  )

  const updateCatalogItem = useCallback(
    async (id: string, patch: Partial<Omit<CatalogItem, 'id' | 'hotelId'>>) => {
      const current = catalogItems.find((i) => i.id === id)
      if (!current) return
      const next = await api.updateItem(hotel.id, id, {
        categoryId: patch.categoryId ?? current.categoryId,
        name: patch.name ?? current.name,
        description: patch.description ?? current.description,
        price: patch.price ?? current.price,
        available: patch.available ?? current.available,
        imagePath: patch.imagePath ?? current.imagePath,
      })
      setCatalogItems((prev) => prev.map((item) => (item.id === id ? next : item)))
    },
    [catalogItems, hotel.id],
  )

  const updateServiceFn = useCallback(
    async (id: string, patch: Partial<Pick<Service, 'name' | 'description' | 'price' | 'active'>>) => {
      const current = services.find((s) => s.id === id)
      if (!current) return
      const next = await api.updateService(hotel.id, id, {
        name: patch.name ?? current.name,
        description: patch.description ?? current.description,
        price: patch.price ?? current.price,
        active: patch.active ?? current.active,
        icon: current.icon,
        tone: current.tone,
      })
      setServices((prev) => prev.map((item) => (item.id === id ? next : item)))
    },
    [hotel.id, services],
  )

  const toggleService = useCallback(
    async (id: string) => {
      const current = services.find((s) => s.id === id)
      if (!current) return
      await updateServiceFn(id, { active: !current.active })
    },
    [services, updateServiceFn],
  )

  const addActivity = useCallback(
    (activity: Omit<Activity, 'id' | 'hotelId'>) => {
      setActivities((prev) => [
        { ...activity, id: `local-${Date.now()}`, hotelId: hotel.id },
        ...prev,
      ])
    },
    [hotel.id],
  )

  const completeCheckin = useCallback(
    async (reservationId: string) => {
      const next = await api.checkinComplete(hotel.id, reservationId)
      replaceReservation(next)
      return next
    },
    [hotel.id, replaceReservation],
  )

  const searchCheckin = useCallback(
    async (query: string) => api.checkinSearch(hotel.id, query),
    [hotel.id],
  )

  const hotelRooms = useMemo(
    () => roomsFromData(hotel.id, reservations, totems),
    [hotel.id, reservations, totems],
  )

  const value = useMemo<AppContextValue>(
    () => ({
      bootstrapping,
      bootstrapError,
      refreshing,
      profile,
      user,
      hotels,
      hotelId,
      hotel,
      setHotelId,
      createHotel: createHotelFn,
      updateHotel: updateHotelFn,
      deleteHotel: deleteHotelFn,
      sidebarCollapsed,
      toggleSidebar,
      mobileNavOpen,
      setMobileNavOpen,
      reloadHotelData,
      retryBootstrap,
      reservations,
      orders,
      totems,
      areas,
      catalogCategories,
      catalogItems,
      services,
      activities,
      hotelReservations: reservations,
      hotelOrders: orders,
      hotelTotems: totems,
      hotelAreas: areas,
      hotelCatalogCategories: catalogCategories,
      hotelCatalogItems: catalogItems,
      hotelServices: services,
      hotelActivities: activities,
      hotelRooms,
      queueSummary,
      confirmReservation,
      cancelReservation: cancelReservationFn,
      createReservation,
      addReservation,
      updateReservationStatus,
      addOrder,
      updateOrderStatus,
      addTotem,
      updateTotem: updateTotemFn,
      resetTotemPassword: resetTotemPasswordFn,
      addArea,
      updateArea: updateAreaFn,
      addCatalogCategory,
      updateCatalogCategory,
      addCatalogItem,
      updateCatalogItem,
      toggleService,
      updateService: updateServiceFn,
      addActivity,
      completeCheckin,
      searchCheckin,
    }),
    [
      bootstrapping,
      bootstrapError,
      refreshing,
      profile,
      user,
      hotels,
      hotelId,
      hotel,
      setHotelId,
      createHotelFn,
      updateHotelFn,
      deleteHotelFn,
      sidebarCollapsed,
      toggleSidebar,
      mobileNavOpen,
      reloadHotelData,
      retryBootstrap,
      reservations,
      orders,
      totems,
      areas,
      catalogCategories,
      catalogItems,
      services,
      activities,
      hotelRooms,
      queueSummary,
      confirmReservation,
      cancelReservationFn,
      createReservation,
      addReservation,
      updateReservationStatus,
      addOrder,
      updateOrderStatus,
      addTotem,
      updateTotemFn,
      resetTotemPasswordFn,
      addArea,
      updateAreaFn,
      addCatalogCategory,
      updateCatalogCategory,
      addCatalogItem,
      updateCatalogItem,
      toggleService,
      updateServiceFn,
      addActivity,
      completeCheckin,
      searchCheckin,
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
