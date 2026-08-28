import type {
  Activity,
  ActivityKind,
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
} from '../types/index.ts'
import { unwrapId, unwrapIdList, type IdBox } from './ids.ts'

export type PageResult<T> = {
  items: T[]
  total: number
  page: number
  size: number
}

type ApiHotel = {
  id: IdBox
  slug?: string
  name: string
  city: string
  state: string
  brand: HotelBrand
  termsText?: string | null
  termsPath?: string | null
}

type ApiReservation = {
  id: IdBox
  hotelId: IdBox
  guestId?: IdBox
  guestName: string
  guestEmail?: string | null
  guestPhone?: string | null
  roomId?: string | null
  roomNumber?: string | null
  category?: string | null
  checkIn: string
  checkOut: string
  guests: number
  status: ReservationStatus
  total: number
  paymentMethod?: PaymentMethod | null
  notes?: string | null
  history?: { at: string; text: string }[] | null
}

type ApiOrder = {
  id: IdBox
  hotelId: IdBox
  source: Order['source']
  location: string
  guestName: string
  lines?: OrderLine[] | null
  total: number
  status: OrderStatus
  createdAt?: string | null
  totemId?: IdBox
  notes?: string | null
}

type ApiTotem = {
  id: IdBox
  hotelId: IdBox
  loginId: string
  name: string
  kind: TotemKind
  roomNumber?: string | null
  areaId?: IdBox
  active: boolean
  userId?: IdBox
}

type ApiCategory = {
  id: IdBox
  hotelId: IdBox
  name: string
  context: CatalogCategory['context']
  areaIds?: IdBox[] | null
  sortOrder: number
}

type ApiItem = {
  id: IdBox
  hotelId: IdBox
  categoryId: IdBox
  name: string
  description?: string | null
  price: number
  available: boolean
  imagePath?: string | null
}

type ApiService = {
  id: IdBox
  hotelId: IdBox
  name: string
  description?: string | null
  price: number
  active: boolean
  icon?: string | null
  tone?: string | null
}

type ApiArea = {
  id: IdBox
  hotelId: IdBox
  name: string
  active: boolean
}

type ApiActivity = {
  id: IdBox
  hotelId: IdBox
  time: string
  title: string
  detail?: string | null
  kind: ActivityKind
}

function summarizeLines(lines: OrderLine[]) {
  if (lines.length === 0) return 'Pedido vazio'
  if (lines.length === 1) return lines[0].qty > 1 ? `${lines[0].qty}× ${lines[0].name}` : lines[0].name
  return lines.map((line) => (line.qty > 1 ? `${line.qty}× ${line.name}` : line.name)).join(' · ')
}

function clockFromIso(iso?: string | null) {
  if (!iso) return '--:--'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const SERVICE_ICONS = new Set(['tray', 'spa', 'clock', 'car', 'map', 'wine', 'bike', 'key'])

export function mapHotel(raw: ApiHotel): Hotel {
  return {
    id: unwrapId(raw.id),
    slug: raw.slug ?? '',
    name: raw.name,
    city: raw.city,
    state: raw.state,
    brand: raw.brand,
    termsText: raw.termsText ?? undefined,
    termsPath: raw.termsPath ?? undefined,
  }
}

export function mapReservation(raw: ApiReservation): Reservation {
  return {
    id: unwrapId(raw.id),
    hotelId: unwrapId(raw.hotelId),
    guestId: unwrapId(raw.guestId) || '',
    guestName: raw.guestName,
    guestEmail: raw.guestEmail ?? '',
    guestPhone: raw.guestPhone ?? '',
    roomId: raw.roomId ?? '',
    roomNumber: raw.roomNumber ?? '',
    category: raw.category ?? '',
    checkIn: raw.checkIn,
    checkOut: raw.checkOut,
    guests: raw.guests,
    status: raw.status,
    total: Number(raw.total) || 0,
    paymentMethod: raw.paymentMethod ?? 'pix',
    notes: raw.notes ?? '',
    history: (raw.history ?? []).map((h) => ({ at: h.at, text: h.text })),
  }
}

export function mapOrder(raw: ApiOrder): Order {
  const lines = (raw.lines ?? []).map((line) => ({
    id: line.id || crypto.randomUUID(),
    name: line.name,
    qty: line.qty,
    price: Number(line.price) || 0,
  }))
  return {
    id: unwrapId(raw.id),
    hotelId: unwrapId(raw.hotelId),
    source: raw.source,
    location: raw.location,
    guestName: raw.guestName,
    items: summarizeLines(lines),
    lines,
    total: Number(raw.total) || 0,
    status: raw.status,
    time: clockFromIso(raw.createdAt),
    createdAt: raw.createdAt ?? undefined,
    totemId: unwrapId(raw.totemId) || undefined,
    notes: raw.notes ?? undefined,
  }
}

export function mapTotem(raw: ApiTotem): Totem {
  return {
    id: unwrapId(raw.id),
    hotelId: unwrapId(raw.hotelId),
    loginId: raw.loginId,
    name: raw.name,
    kind: raw.kind,
    roomNumber: raw.roomNumber ?? undefined,
    areaId: unwrapId(raw.areaId) || undefined,
    active: raw.active,
    userId: unwrapId(raw.userId) || undefined,
  }
}

export function mapCategory(raw: ApiCategory): CatalogCategory {
  return {
    id: unwrapId(raw.id),
    hotelId: unwrapId(raw.hotelId),
    name: raw.name,
    context: raw.context,
    areaIds: unwrapIdList(raw.areaIds),
    sortOrder: raw.sortOrder,
  }
}

export function mapItem(raw: ApiItem): CatalogItem {
  return {
    id: unwrapId(raw.id),
    hotelId: unwrapId(raw.hotelId),
    categoryId: unwrapId(raw.categoryId),
    name: raw.name,
    description: raw.description ?? '',
    price: Number(raw.price) || 0,
    available: raw.available,
    imagePath: raw.imagePath ?? undefined,
  }
}

export function mapService(raw: ApiService): Service {
  const icon = raw.icon && SERVICE_ICONS.has(raw.icon) ? (raw.icon as Service['icon']) : 'tray'
  return {
    id: unwrapId(raw.id),
    hotelId: unwrapId(raw.hotelId),
    name: raw.name,
    description: raw.description ?? '',
    price: Number(raw.price) || 0,
    active: raw.active,
    tone: raw.tone ?? 'neutral',
    icon,
  }
}

export function mapArea(raw: ApiArea): HotelArea {
  return {
    id: unwrapId(raw.id),
    hotelId: unwrapId(raw.hotelId),
    name: raw.name,
    active: raw.active,
  }
}

export function mapActivity(raw: ApiActivity): Activity {
  return {
    id: unwrapId(raw.id),
    hotelId: unwrapId(raw.hotelId),
    time: clockFromIso(raw.time),
    title: raw.title,
    detail: raw.detail ?? undefined,
    kind: raw.kind,
  }
}

export type {
  ApiHotel,
  ApiReservation,
  ApiOrder,
  ApiTotem,
  ApiCategory,
  ApiItem,
  ApiService,
  ApiArea,
  ApiActivity,
}
