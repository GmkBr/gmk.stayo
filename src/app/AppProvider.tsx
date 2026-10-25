import { useInterfaceModule } from '../modules/interface/useInterfaceModule.ts'
import { useReservationsModule } from '../modules/reservations/useReservationsModule.ts'
import { useOrdersModule } from '../modules/orders/useOrdersModule.ts'
import { useDevicesModule } from '../modules/devices/useDevicesModule.ts'
import { useSpacesModule } from '../modules/spaces/useSpacesModule.ts'
import { useCatalogModule } from '../modules/catalog/useCatalogModule.ts'
import { useActivityModule } from '../modules/activity/useActivityModule.ts'
import { useJourneysModule } from '../modules/journeys/useJourneysModule.ts'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.tsx'
import * as reservationsApi from '../modules/reservations/api.ts'
import * as identityApi from '../modules/identity/api.ts'
import * as hotelsApi from '../modules/hotels/api.ts'
import * as activityApi from '../modules/activity/api.ts'
import * as devicesApi from '../modules/devices/api.ts'
import * as spacesApi from '../modules/spaces/api.ts'
import * as journeysApi from '../modules/journeys/api.ts'
import * as ordersApi from '../modules/orders/api.ts'
import * as catalogApi from '../modules/catalog/api.ts'
import { ApiError } from '../api/client.ts'
import { hotelFromTotem } from '../lib/totemHotel.ts'
import { isTotemAccount, mergeTotemSession } from '../auth/account.ts'
import type { CurrentUser } from '../modules/identity/model.ts'
import type { Hotel } from '../modules/hotels/model.ts'
import type { Reservation, ReservationStatus } from '../modules/reservations/model.ts'
import type { Room } from '../modules/spaces/model.ts'
import type { Totem } from '../modules/devices/model.ts'
import { AppContext, type AppContextValue } from './context.ts'

function readHotelId() {
  return localStorage.getItem('stayo.hotel') ?? ''
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

const CONSOLE_PATHS = ['/filas', '/reservas', '/espacos', '/totens', '/cardapio'] as const

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
  const [profile, setProfile] = useState<identityApi.MeProfile | null>(null)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [hotelId, setHotelIdState] = useState(readHotelId)
  const hotel = hotels.find((h) => h.id === hotelId) ?? EMPTY_HOTEL
  const { sidebarCollapsed, toggleSidebar, mobileNavOpen, setMobileNavOpen } = useInterfaceModule()
  const {
    reservations,
    setReservations,
    replaceReservation,
    confirmReservation,
    cancelReservationFn,
    createReservation,
    addReservation,
  } = useReservationsModule(hotel.id)
  const {
    orders,
    setOrders,
    addOrder,
    updateOrderStatus,
  } = useOrdersModule(hotel.id)
  const {
    totems,
    setTotems,
    addTotem,
    updateTotemFn,
    resetTotemPasswordFn,
  } = useDevicesModule(hotel.id)
  const {
    spaces,
    setSpaces,
    addSpaceFn,
    updateSpaceFn,
    deleteSpaceFn,
    hotelSpaces,
    addAreaSpace,
    updateAreaSpace,
  } = useSpacesModule(hotel.id)
  const {
    areas,
    setAreas,
    catalogCategories,
    setCatalogCategories,
    catalogItems,
    setCatalogItems,
    services,
    setServices,
    addArea,
    updateAreaFn,
    addCatalogCategory,
    updateCatalogCategory,
    addCatalogItem,
    updateCatalogItem,
    updateServiceFn,
    toggleService,
  } = useCatalogModule(hotel.id, addAreaSpace, updateAreaSpace)
  const {
    activities,
    setActivities,
    queueSummary,
    setQueueSummary,
    addActivity,
    refreshQueue,
  } = useActivityModule(hotel.id)
  const {
    completeCheckin,
    validateCheckin,
    searchCheckin,
    searchCheckout,
    validateCheckout,
    completeCheckout,
  } = useJourneysModule(hotel.id, replaceReservation, refreshQueue)
  const hotelLoadVersion = useRef(0)
  const bootstrapVersion = useRef(0)
  const hotelDataScope = isTotemAccount(profile)
    ? profile?.totem?.kind === 'operation' ? 'operation' : null
    : 'console'


  const user = useMemo<CurrentUser>(() => {
    if (profile) {
      if (isTotemAccount(profile) && profile.totem) {
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
      if (isTotemAccount(authUser) && authUser.totem) {
        return {
          name: authUser.totem.name,
          role: 'Totem',
          initials: initialsOf(authUser.totem.name),
          email: authUser.email,
        }
      }
      const name = authUser.fullName || authUser.email.split('@')[0] || 'Usuário'
      return { name, role: 'Console', initials: initialsOf(name), email: authUser.email }
    }
    if (usingDevToken) return { name: 'Admin local', role: 'Administrador', initials: 'AL', email: 'admin@stayo.local' }
    return { name: 'Convidado', role: '—', initials: '—' }
  }, [profile, authUser, usingDevToken])

  const clearHotelScoped = useCallback(() => {
    hotelLoadVersion.current += 1
    setRefreshing(false)
    setReservations([])
    setOrders([])
    setTotems([])
    setSpaces([])
    setAreas([])
    setCatalogCategories([])
    setCatalogItems([])
    setServices([])
    setActivities([])
    setQueueSummary(null)
  }, [setReservations, setOrders, setTotems, setSpaces, setAreas, setCatalogCategories, setCatalogItems, setServices, setActivities, setQueueSummary])

  const setHotelId = useCallback((id: string) => {
    if (id !== hotelId) {
      clearHotelScoped()
      setBootstrapError(null)
    }
    setHotelIdState(id)
    localStorage.setItem('stayo.hotel', id)
    // Best-effort: notifica o BE do contexto (se a rota existir).
    void hotelsApi.switchHotel(id).catch(() => undefined)
  }, [clearHotelScoped, hotelId])

  const loadHotelScoped = useCallback(async (id: string, scope: 'console' | 'operation') => {
    if (!id) return
    const version = ++hotelLoadVersion.current
    setRefreshing(true)
    const scopeLabels = [
      'reservas',
      'pedidos',
      'totens',
      'espaços',
      'áreas',
      'categorias',
      'itens',
      'serviços',
      'atividades',
      'filas',
    ] as const
    const criticalIndexes = new Set([1, 5, 6, 7])
    try {
      const results = await Promise.allSettled([
        scope === 'console' ? reservationsApi.searchReservations(id, { size: 200 }) : Promise.resolve({ items: [], total: 0, page: 0, size: 0 }),
        ordersApi.listOrders(id, { size: 200 }),
        scope === 'console' ? devicesApi.listTotems(id) : Promise.resolve([]),
        scope === 'console' ? spacesApi.listSpaces(id) : Promise.resolve([]),
        catalogApi.listAreas(id),
        catalogApi.listCategories(id),
        catalogApi.listItems(id),
        catalogApi.listServices(id),
        scope === 'console' ? activityApi.listActivities(id) : Promise.resolve([]),
        scope === 'console' ? activityApi.getQueueSummary(id) : Promise.resolve(null),
      ])
      if (version !== hotelLoadVersion.current) return

      const pick = <T,>(index: number) =>
        results[index]?.status === 'fulfilled' ? (results[index] as PromiseFulfilledResult<T>).value : null

      const failures = results
        .map((result, index) => (result.status === 'rejected' ? scopeLabels[index] : null))
        .filter((label): label is (typeof scopeLabels)[number] => label != null)
      const criticalFailures = results
        .map((result, index) =>
          result.status === 'rejected' && criticalIndexes.has(index) ? scopeLabels[index] : null,
        )
        .filter((label): label is (typeof scopeLabels)[number] => label != null)
      if (criticalFailures.length > 0) {
        setBootstrapError(`Falha ao carregar: ${criticalFailures.join(', ')}`)
      } else if (failures.length === 0) {
        setBootstrapError(null)
      }

      const resPage = pick<Awaited<ReturnType<typeof reservationsApi.searchReservations>>>(0)
      if (resPage) setReservations(resPage.items)

      const orderPage = pick<Awaited<ReturnType<typeof ordersApi.listOrders>>>(1)
      if (orderPage) setOrders(orderPage.items)

      const totemList = pick<Awaited<ReturnType<typeof devicesApi.listTotems>>>(2)
      if (totemList) setTotems(totemList)

      const spaceList = pick<Awaited<ReturnType<typeof spacesApi.listSpaces>>>(3)
      if (spaceList) setSpaces(spaceList)

      const areaList = pick<Awaited<ReturnType<typeof catalogApi.listAreas>>>(4)
      if (areaList) setAreas(areaList)

      const cats = pick<Awaited<ReturnType<typeof catalogApi.listCategories>>>(5)
      if (cats) setCatalogCategories(cats)

      const items = pick<Awaited<ReturnType<typeof catalogApi.listItems>>>(6)
      if (items) setCatalogItems(items)

      const svcs = pick<Awaited<ReturnType<typeof catalogApi.listServices>>>(7)
      if (svcs) setServices(svcs)

      const acts = pick<Awaited<ReturnType<typeof activityApi.listActivities>>>(8)
      if (acts) setActivities(acts)

      const summary = pick<Awaited<ReturnType<typeof activityApi.getQueueSummary>>>(9)
      if (summary) setQueueSummary(summary)
    } finally {
      if (version === hotelLoadVersion.current) setRefreshing(false)
    }
  }, [setReservations, setOrders, setTotems, setSpaces, setAreas, setCatalogCategories, setCatalogItems, setServices, setActivities, setQueueSummary])

  const createHotelFn = useCallback(
    async (input: hotelsApi.CreateHotelInput) => {
      const next = await hotelsApi.createHotel(input)
      clearHotelScoped()
      setHotels((prev) => {
        if (prev.some((h) => h.id === next.id)) return prev.map((h) => (h.id === next.id ? next : h))
        return [...prev, next]
      })
      setHotelIdState(next.id)
      localStorage.setItem('stayo.hotel', next.id)
      setBootstrapError(null)
      return next
    },
    [clearHotelScoped],
  )

  const updateHotelFn = useCallback(async (id: string, input: hotelsApi.UpdateHotelInput) => {
    const next = await hotelsApi.updateHotel(id, input)
    setHotels((prev) => prev.map((h) => (h.id === id ? next : h)))
    return next
  }, [])

  const deleteHotelFn = useCallback(
    async (id: string) => {
      await hotelsApi.deleteHotel(id)
      const remaining = hotels.filter((h) => h.id !== id)
      setHotels(remaining)
      if (id === hotelId) {
        clearHotelScoped()
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
    const version = ++bootstrapVersion.current
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
    let loadedMe: identityApi.MeProfile | null = null
    try {
      const me = mergeTotemSession(await identityApi.getMe(), authUser)
      if (version !== bootstrapVersion.current) return
      loadedMe = me
      setProfile(me)

      if (isTotemAccount(me)) {
        if (me.totem) {
          const h = hotelFromTotem(me.totem, me.hotel)
          setHotels([h])
          setHotelIdState(h.id)
          localStorage.setItem('stayo.hotel', h.id)
        }
        return
      }

      const list = await hotelsApi.listHotels()
      if (version !== bootstrapVersion.current) return
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
      if (version !== bootstrapVersion.current) return
      // 401: AuthContext já dispara signOut via setUnauthorizedHandler → RequireAuth → /login
      const message =
        err instanceof ApiError
          ? err.status === 404
            ? isTotemAccount(authUser) || isTotemAccount(loadedMe)
              ? 'Não foi possível carregar o hotel do totem. Verifique se o hotel existe e se a conta totem tem acesso.'
              : 'GET /me não encontrado. Confira se o backend expõe /api/v1/me.'
            : err.status === 401
              ? 'Sessão inválida. Redirecionando para o login…'
              : err.message
          : err instanceof Error
            ? err.message
            : 'Falha ao carregar dados da API'
      setBootstrapError(message)
      if (loadedMe?.accountType !== 'totem' && !isTotemAccount(loadedMe)) {
        setProfile(null)
        setHotels([])
      }
      if (err instanceof ApiError && err.status === 401) {
        setHotelIdState('')
        clearHotelScoped()
      }
    } finally {
      if (version === bootstrapVersion.current) setBootstrapping(false)
    }
  }, [accessToken, authUser, clearHotelScoped])

  useEffect(() => {
    if (!authReady) return
    void bootstrap()
    return () => { bootstrapVersion.current += 1 }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap when auth token ready
  }, [authReady, accessToken])

  useEffect(() => {
    if (!accessToken || !hotelId || bootstrapping || !hotelDataScope) return
    if (!isConsolePath(pathname) && !isTotemPath(pathname)) return
    void loadHotelScoped(hotelId, hotelDataScope)
    return () => { hotelLoadVersion.current += 1 }
  }, [accessToken, hotelId, bootstrapping, pathname, loadHotelScoped, hotelDataScope])

  const reloadHotelData = useCallback(async () => {
    if (hotel.id && hotelDataScope) await loadHotelScoped(hotel.id, hotelDataScope)
  }, [hotel.id, loadHotelScoped, hotelDataScope])

  const retryBootstrap = useCallback(async () => {
    await bootstrap()
  }, [bootstrap])

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
        const next = await journeysApi.checkinComplete(hotel.id, id)
        replaceReservation(next)
        return
      }
      setReservations((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)))
    },
    [cancelReservationFn, confirmReservation, hotel.id, replaceReservation, setReservations],
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
      spaces,
      catalogCategories,
      catalogItems,
      services,
      activities,
      hotelReservations: reservations,
      hotelOrders: orders,
      hotelTotems: totems,
      hotelAreas: areas,
      hotelSpaces,
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
      addSpace: addSpaceFn,
      updateSpace: updateSpaceFn,
      deleteSpace: deleteSpaceFn,
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
      validateCheckin,
      searchCheckin,
      validateCheckout,
      completeCheckout,
      searchCheckout,
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
      setMobileNavOpen,
      reloadHotelData,
      retryBootstrap,
      reservations,
      orders,
      totems,
      areas,
      spaces,
      catalogCategories,
      catalogItems,
      services,
      activities,
      hotelRooms,
      hotelSpaces,
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
      addSpaceFn,
      updateSpaceFn,
      deleteSpaceFn,
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
      validateCheckin,
      searchCheckin,
      validateCheckout,
      completeCheckout,
      searchCheckout,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
