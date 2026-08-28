import { apiRequest } from './client.ts'
import {
  mapActivity,
  mapArea,
  mapCategory,
  mapHotel,
  mapItem,
  mapOrder,
  mapReservation,
  mapService,
  mapTotem,
  type ApiActivity,
  type ApiArea,
  type ApiCategory,
  type ApiHotel,
  type ApiItem,
  type ApiOrder,
  type ApiReservation,
  type ApiService,
  type ApiTotem,
  type PageResult,
} from './mappers.ts'
import { unwrapId, type IdBox } from './ids.ts'
import type {
  AccountType,
  CatalogCategory,
  CatalogItem,
  Hotel,
  HotelArea,
  HotelBrand,
  Order,
  OrderLine,
  OrderStatus,
  PaymentMethod,
  Reservation,
  ReservationStatus,
  Service,
  Totem,
  TotemKind,
  TotemProfile,
} from '../types/index.ts'

export type QueueSummary = {
  awaitingCheckin: number
  checkinsDone: number
  openOrders: number
}

export type CreateReservationInput = {
  guestName: string
  guestEmail?: string
  guestPhone?: string
  roomId?: string
  roomNumber?: string
  category?: string
  checkIn: string
  checkOut: string
  guests?: number
  total?: number
  paymentMethod?: PaymentMethod
  notes?: string
}

export type PlaceOrderInput = {
  source: 'room' | 'area'
  location: string
  guestName: string
  lines: { name: string; qty: number; price: number }[]
  totemId?: string
  notes?: string
  token?: string | null
}

function qs(params: Record<string, string | number | undefined | null>) {
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '' || value === 'all') continue
    sp.set(key, String(value))
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}

export type AuthUser = {
  id: string
  email: string
  fullName: string
  status: string
  createdAt: string
  updatedAt: string
  deactivatedAt: string | null
  accountType: AccountType
  totem?: TotemProfile
}

export type AuthSessionResponse = {
  user: AuthUser
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export type MeProfile = {
  id: string
  email: string
  fullName: string
  status: string
  createdAt: string
  updatedAt: string
  deactivatedAt: string | null
  /** Derivado de status === 'ACTIVE' (compat com UI). */
  active: boolean
  accountType: AccountType
  totem?: TotemProfile
  /** Preenchido no /me para contas totem quando o BE envia o hotel embutido. */
  hotel?: Hotel
}

type ApiTotemProfile = {
  id: IdBox | string
  hotelId: IdBox | string
  loginId: string
  name: string
  kind: TotemKind
  roomNumber?: string | null
  areaId?: IdBox | string | null
  active: boolean
  brand?: HotelBrand | null
}

type ApiMe = {
  id: IdBox | string
  email: string
  fullName?: string | null
  status?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  deactivatedAt?: string | null
  phone?: string | null
  active?: boolean
  accountType?: AccountType | null
  totem?: ApiTotemProfile | null
  hotel?: ApiHotel | null
}

export async function getMe(): Promise<MeProfile> {
  const raw = await apiRequest<ApiMe>('/me')
  return mapMeProfile(raw)
}

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = {
  email: string
  password: string
  fullName: string
}

type ApiAuthUser = ApiMe

/** Público. Proxy Supabase → user + tokens. */
export async function login(input: LoginInput): Promise<AuthSessionResponse> {
  const raw = await apiRequest<AuthSessionResponse & { user: ApiAuthUser }>('/auth/login', {
    method: 'POST',
    body: input,
    token: null,
  })
  return { ...raw, user: mapAuthUser(raw.user) }
}

/** Público. Auth + users + tokens na mesma resposta. */
export async function register(input: RegisterInput): Promise<AuthSessionResponse> {
  const raw = await apiRequest<AuthSessionResponse & { user: ApiAuthUser }>('/auth/register', {
    method: 'POST',
    body: input,
    token: null,
  })
  return { ...raw, user: mapAuthUser(raw.user) }
}

export function mapAuthUser(raw: ApiAuthUser): AuthUser {
  const id = typeof raw.id === 'string' ? raw.id : unwrapId(raw.id)
  const email = raw.email
  const statusFromApi = raw.status?.trim()
  const inactiveHint = 'active' in raw && raw.active === false
  const accountType: AccountType = raw.accountType === 'totem' ? 'totem' : 'human'
  return {
    id,
    email,
    fullName: raw.fullName?.trim() || email.split('@')[0] || 'Usuário',
    status: statusFromApi || (inactiveHint ? 'INACTIVE' : 'ACTIVE'),
    createdAt: raw.createdAt ?? '',
    updatedAt: raw.updatedAt ?? '',
    deactivatedAt: raw.deactivatedAt ?? null,
    accountType,
    totem: raw.totem ? mapTotemProfile(raw.totem) : undefined,
  }
}

function mapTotemProfile(raw: ApiTotemProfile): TotemProfile {
  return {
    id: unwrapId(raw.id),
    hotelId: unwrapId(raw.hotelId),
    loginId: raw.loginId,
    name: raw.name,
    kind: raw.kind,
    roomNumber: raw.roomNumber ?? undefined,
    areaId: unwrapId(raw.areaId) || undefined,
    active: raw.active,
    brand: raw.brand ?? undefined,
  }
}

function mapMeProfile(raw: ApiMe): MeProfile {
  const user = mapAuthUser(raw)
  return {
    ...user,
    active: user.status === 'ACTIVE',
    hotel: raw.hotel ? mapHotel(raw.hotel) : undefined,
  }
}

export type CreateHotelInput = {
  name: string
  city: string
  state: string
  termsText?: string
  termsPath?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  brandHotelName?: string
  coverTone?: string
}

export type UpdateHotelInput = Partial<CreateHotelInput>

export async function listHotels(): Promise<Hotel[]> {
  const raw = await apiRequest<ApiHotel[]>('/hotels')
  return raw.map(mapHotel)
}

export async function getHotel(hotelId: string): Promise<Hotel> {
  return mapHotel(await apiRequest<ApiHotel>(`/hotels/${hotelId}`))
}

export async function createHotel(body: CreateHotelInput): Promise<Hotel> {
  return mapHotel(await apiRequest<ApiHotel>('/hotels', { method: 'POST', body }))
}

export async function updateHotel(hotelId: string, body: UpdateHotelInput): Promise<Hotel> {
  return mapHotel(await apiRequest<ApiHotel>(`/hotels/${hotelId}`, { method: 'PUT', body }))
}

export async function deleteHotel(hotelId: string): Promise<void> {
  await apiRequest(`/hotels/${hotelId}`, { method: 'DELETE' })
}

export async function switchHotel(hotelId: string): Promise<void> {
  await apiRequest(`/hotels/${hotelId}/switch`, { method: 'POST', body: {} })
}

export async function searchReservations(
  hotelId: string,
  params: { q?: string; status?: string; period?: string; page?: number; size?: number } = {},
  token?: string | null,
): Promise<PageResult<Reservation>> {
  const page = await apiRequest<PageResult<ApiReservation>>(
    `/hotels/${hotelId}/reservations${qs({ ...params, size: params.size ?? 100 })}`,
    { token },
  )
  return { ...page, items: page.items.map(mapReservation) }
}

export async function createReservation(hotelId: string, body: CreateReservationInput): Promise<Reservation> {
  return mapReservation(
    await apiRequest<ApiReservation>(`/hotels/${hotelId}/reservations`, { method: 'POST', body }),
  )
}

export async function confirmReservation(hotelId: string, id: string): Promise<Reservation> {
  return mapReservation(
    await apiRequest<ApiReservation>(`/hotels/${hotelId}/reservations/${id}/confirm`, { method: 'POST', body: {} }),
  )
}

export async function cancelReservation(hotelId: string, id: string): Promise<Reservation> {
  return mapReservation(
    await apiRequest<ApiReservation>(`/hotels/${hotelId}/reservations/${id}/cancel`, { method: 'POST', body: {} }),
  )
}

export async function updateReservation(
  hotelId: string,
  id: string,
  body: CreateReservationInput,
): Promise<Reservation> {
  return mapReservation(
    await apiRequest<ApiReservation>(`/hotels/${hotelId}/reservations/${id}`, { method: 'PUT', body }),
  )
}

export async function checkinSearch(hotelId: string, q: string): Promise<Reservation[]> {
  const raw = await apiRequest<ApiReservation[]>(`/hotels/${hotelId}/checkin/search`, {
    method: 'POST',
    body: { q },
  })
  return raw.map(mapReservation)
}

export async function checkinValidate(hotelId: string, reservationId: string): Promise<Reservation> {
  return mapReservation(
    await apiRequest<ApiReservation>(`/hotels/${hotelId}/checkin/${reservationId}/validate`, {
      method: 'POST',
      body: {},
    }),
  )
}

export async function checkinComplete(hotelId: string, reservationId: string): Promise<Reservation> {
  return mapReservation(
    await apiRequest<ApiReservation>(`/hotels/${hotelId}/checkin/${reservationId}/complete`, {
      method: 'POST',
      body: {},
    }),
  )
}

export async function getQueueSummary(hotelId: string): Promise<QueueSummary> {
  return apiRequest<QueueSummary>(`/hotels/${hotelId}/queues/summary`)
}

export async function listOrders(
  hotelId: string,
  params: { status?: OrderStatus; page?: number; size?: number } = {},
): Promise<PageResult<Order>> {
  const page = await apiRequest<PageResult<ApiOrder>>(
    `/hotels/${hotelId}/orders${qs({ ...params, size: params.size ?? 100 })}`,
  )
  return { ...page, items: page.items.map(mapOrder) }
}

export async function placeOrder(hotelId: string, input: PlaceOrderInput): Promise<Order> {
  const { token, ...body } = input
  return mapOrder(
    await apiRequest<ApiOrder>(`/hotels/${hotelId}/orders`, {
      method: 'POST',
      body,
      token,
    }),
  )
}

export async function advanceOrderStatus(hotelId: string, orderId: string): Promise<Order> {
  return mapOrder(
    await apiRequest<ApiOrder>(`/hotels/${hotelId}/orders/${orderId}/status`, { method: 'PATCH' }),
  )
}

export async function cancelOrder(hotelId: string, orderId: string): Promise<Order> {
  return mapOrder(
    await apiRequest<ApiOrder>(`/hotels/${hotelId}/orders/${orderId}/cancel`, { method: 'POST', body: {} }),
  )
}

export async function listTotems(hotelId: string): Promise<Totem[]> {
  const raw = await apiRequest<ApiTotem[]>(`/hotels/${hotelId}/totems`)
  return raw.map(mapTotem)
}

export type CreateTotemInput = {
  name: string
  kind: TotemKind
  loginSuffix: string
  password: string
  roomNumber?: string | null
  areaId?: string | null
}

function buildCreateTotemBody(input: CreateTotemInput) {
  return {
    name: input.name,
    kind: input.kind,
    loginSuffix: input.loginSuffix,
    password: input.password,
    roomNumber: input.kind === 'room' ? (input.roomNumber?.trim() || null) : null,
    areaId: input.kind === 'area' ? (input.areaId?.trim() || null) : null,
  }
}

export async function createTotem(hotelId: string, input: CreateTotemInput): Promise<Totem> {
  return mapTotem(
    await apiRequest<ApiTotem>(`/hotels/${hotelId}/totems`, {
      method: 'POST',
      body: buildCreateTotemBody(input),
    }),
  )
}

export async function updateTotem(
  hotelId: string,
  totemId: string,
  body: Partial<{
    name: string
    kind: TotemKind
    roomNumber: string
    areaId: string
    active: boolean
  }>,
): Promise<Totem> {
  return mapTotem(
    await apiRequest<ApiTotem>(`/hotels/${hotelId}/totems/${totemId}`, { method: 'PATCH', body }),
  )
}

export async function resetTotemPassword(
  hotelId: string,
  totemId: string,
  password: string,
): Promise<void> {
  await apiRequest(`/hotels/${hotelId}/totems/${totemId}/reset-password`, {
    method: 'POST',
    body: { password },
  })
}

export async function listCategories(hotelId: string, token?: string | null): Promise<CatalogCategory[]> {
  const raw = await apiRequest<ApiCategory[]>(`/hotels/${hotelId}/catalog/categories`, { token })
  return raw.map(mapCategory)
}

export async function createCategory(
  hotelId: string,
  body: { name: string; context: CatalogCategory['context']; areaIds?: string[]; sortOrder?: number },
): Promise<CatalogCategory> {
  return mapCategory(
    await apiRequest<ApiCategory>(`/hotels/${hotelId}/catalog/categories`, { method: 'POST', body }),
  )
}

export async function updateCategory(
  hotelId: string,
  id: string,
  body: { name: string; context: CatalogCategory['context']; areaIds?: string[]; sortOrder?: number },
): Promise<CatalogCategory> {
  return mapCategory(
    await apiRequest<ApiCategory>(`/hotels/${hotelId}/catalog/categories/${id}`, { method: 'PUT', body }),
  )
}

export async function listItems(hotelId: string, token?: string | null): Promise<CatalogItem[]> {
  const raw = await apiRequest<ApiItem[]>(`/hotels/${hotelId}/catalog/items`, { token })
  return raw.map(mapItem)
}

export async function createItem(
  hotelId: string,
  body: {
    categoryId: string
    name: string
    description?: string
    price: number
    available?: boolean
    imagePath?: string
  },
): Promise<CatalogItem> {
  return mapItem(await apiRequest<ApiItem>(`/hotels/${hotelId}/catalog/items`, { method: 'POST', body }))
}

export async function updateItem(
  hotelId: string,
  id: string,
  body: {
    categoryId: string
    name: string
    description?: string
    price: number
    available?: boolean
    imagePath?: string
  },
): Promise<CatalogItem> {
  return mapItem(
    await apiRequest<ApiItem>(`/hotels/${hotelId}/catalog/items/${id}`, { method: 'PUT', body }),
  )
}

export async function listServices(hotelId: string, token?: string | null): Promise<Service[]> {
  const raw = await apiRequest<ApiService[]>(`/hotels/${hotelId}/catalog/services`, { token })
  return raw.map(mapService)
}

export async function createService(
  hotelId: string,
  body: {
    name: string
    description?: string
    price: number
    active?: boolean
    icon?: string
    tone?: string
  },
): Promise<Service> {
  return mapService(
    await apiRequest<ApiService>(`/hotels/${hotelId}/catalog/services`, { method: 'POST', body }),
  )
}

export async function updateService(
  hotelId: string,
  id: string,
  body: {
    name: string
    description?: string
    price: number
    active?: boolean
    icon?: string
    tone?: string
  },
): Promise<Service> {
  return mapService(
    await apiRequest<ApiService>(`/hotels/${hotelId}/catalog/services/${id}`, { method: 'PUT', body }),
  )
}

export async function listAreas(hotelId: string, token?: string | null): Promise<HotelArea[]> {
  const raw = await apiRequest<ApiArea[]>(`/hotels/${hotelId}/catalog/areas`, { token })
  return raw.map(mapArea)
}

export async function createArea(hotelId: string, body: { name: string; active?: boolean }): Promise<HotelArea> {
  return mapArea(await apiRequest<ApiArea>(`/hotels/${hotelId}/catalog/areas`, { method: 'POST', body }))
}

export async function updateArea(
  hotelId: string,
  id: string,
  body: { name: string; active?: boolean },
): Promise<HotelArea> {
  return mapArea(
    await apiRequest<ApiArea>(`/hotels/${hotelId}/catalog/areas/${id}`, { method: 'PUT', body }),
  )
}

export async function listActivities(hotelId: string): Promise<ReturnType<typeof mapActivity>[]> {
  const raw = await apiRequest<ApiActivity[]>(`/hotels/${hotelId}/activities`)
  return raw.map(mapActivity)
}

export type { OrderLine, ReservationStatus }
