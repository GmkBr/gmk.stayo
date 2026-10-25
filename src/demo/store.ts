import { nightsBetween } from '../utils/format.ts'
import { totemEmail } from '../lib/totemLogin.ts'
import { DEMO_PASSWORD } from './mode.ts'
import { DemoHttpError } from './http.ts'
import type { CatalogContext } from '../modules/catalog/model.ts'
import type { OrderStatus } from '../modules/orders/model.ts'
import type { PaymentMethod } from '../shared/model.ts'
import type { ReservationStatus } from '../modules/reservations/model.ts'
import type { SpaceType } from '../modules/spaces/model.ts'
import type { TotemKind } from '../modules/devices/model.ts'

const STORAGE_KEY = 'stayo.demo.v1'

export type DemoBrand = {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  hotelName: string
  coverTone: string
}

export type DemoHotel = {
  id: string
  slug: string
  name: string
  city: string
  state: string
  brand: DemoBrand
  termsText?: string | null
  termsPath?: string | null
}

export type DemoReservation = {
  id: string
  hotelId: string
  code: string
  guestId: string
  guestName: string
  guestCpf: string
  guestEmail: string
  guestPhone: string
  roomId: string
  roomNumber: string
  category: string
  checkIn: string
  checkOut: string
  guests: number
  status: ReservationStatus
  nightlyRate: number
  total: number
  paymentMethod: PaymentMethod
  notes: string
  history: { at: string; text: string }[]
}

export type DemoOrderLine = { id: string; name: string; qty: number; price: number }

export type DemoOrder = {
  id: string
  hotelId: string
  reservationId?: string | null
  stayId?: string | null
  source: 'room' | 'area'
  location: string
  guestName: string
  lines: DemoOrderLine[]
  total: number
  status: OrderStatus
  createdAt: string
  totemId?: string
  notes?: string | null
}

export type DemoStay = {
  id: string
  hotelId: string
  reservationId: string
  spaceId: string
  roomNumber: string
  guestName: string
  status: 'active' | 'completed' | 'cancelled'
  checkedInAt: string | null
  checkedOutAt: string | null
}

export type DemoSpace = {
  id: string
  hotelId: string
  type: SpaceType
  name: string
  number?: string | null
  floor?: string | null
}

export type DemoTotem = {
  id: string
  hotelId: string
  loginId: string
  name: string
  kind: TotemKind
  spaceId?: string | null
  roomNumber?: string | null
  areaId?: string | null
  active: boolean
  userId: string
}

export type DemoCategory = {
  id: string
  hotelId: string
  name: string
  context: CatalogContext
  areaIds?: string[] | null
  sortOrder: number
}

export type DemoItem = {
  id: string
  hotelId: string
  categoryId: string
  name: string
  description: string
  price: number
  available: boolean
  imagePath?: string | null
}

export type DemoService = {
  id: string
  hotelId: string
  name: string
  description: string
  price: number
  active: boolean
  icon: string
  tone: string
}

export type DemoArea = {
  id: string
  hotelId: string
  name: string
  active: boolean
}

export type DemoActivity = {
  id: string
  hotelId: string
  time: string
  title: string
  detail?: string | null
  kind: 'checkin' | 'checkout' | 'request' | 'reservation' | 'order' | 'other'
}

export type DemoUser = {
  id: string
  email: string
  password: string
  fullName: string
  accountType: 'human' | 'totem'
  hotelIds: string[]
  totemId?: string
  createdAt: string
}

type DemoState = {
  users: DemoUser[]
  hotels: DemoHotel[]
  reservations: DemoReservation[]
  orders: DemoOrder[]
  stays: DemoStay[]
  spaces: DemoSpace[]
  totems: DemoTotem[]
  categories: DemoCategory[]
  items: DemoItem[]
  services: DemoService[]
  areas: DemoArea[]
  activities: DemoActivity[]
}

function isoDate(offset = 0) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + offset)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function stamp(offsetHours = 0) {
  return new Date(Date.now() + offsetHours * 3_600_000).toISOString()
}

function clock(offsetHours = 0) {
  return new Date(Date.now() + offsetHours * 3_600_000).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`
}

const AURORA = 'hotel-aurora'
const LEME = 'hotel-leme'

const AURORA_BRAND: DemoBrand = {
  primaryColor: '#0B3D5C',
  secondaryColor: '#1F6F8B',
  accentColor: '#C4784A',
  hotelName: 'Aurora',
  coverTone: 'cool',
}

const LEME_BRAND: DemoBrand = {
  primaryColor: '#1C3D32',
  secondaryColor: '#3D6B58',
  accentColor: '#C4A574',
  hotelName: 'Leme',
  coverTone: 'warm',
}

function seed(): DemoState {
  const today = isoDate(0)
  const yesterday = isoDate(-1)
  const tomorrow = isoDate(1)
  const plus2 = isoDate(2)
  const plus3 = isoDate(3)
  const plus5 = isoDate(5)
  const now = new Date().toISOString()

  const hotels: DemoHotel[] = [
    {
      id: AURORA,
      slug: 'aurora',
      name: 'Hotel Aurora',
      city: 'Florianópolis',
      state: 'SC',
      brand: AURORA_BRAND,
      termsText: `Check-out até 12h.
Silêncio após 22h nas áreas comuns.
Consumo do quarto é cobrado no checkout da recepção.
O cartão do quarto desativa após o check-out.`,
      termsPath: null,
    },
    {
      id: LEME,
      slug: 'leme',
      name: 'Pousada Leme',
      city: 'Rio de Janeiro',
      state: 'RJ',
      brand: LEME_BRAND,
      termsText: 'Check-out até 11h. Café incluso até 10h.',
      termsPath: null,
    },
  ]

  const spaces: DemoSpace[] = [
    { id: 'sp-201', hotelId: AURORA, type: 'room', name: 'Standard', number: '201', floor: '2' },
    { id: 'sp-203', hotelId: AURORA, type: 'room', name: 'Standard', number: '203', floor: '2' },
    { id: 'sp-305', hotelId: AURORA, type: 'room', name: 'Superior', number: '305', floor: '3' },
    { id: 'sp-401', hotelId: AURORA, type: 'room', name: 'Suíte Mar', number: '401', floor: '4' },
    { id: 'sp-rest', hotelId: AURORA, type: 'area', name: 'Restaurante Maré', number: null, floor: null },
    { id: 'sp-spa', hotelId: AURORA, type: 'area', name: 'Spa Aurora', number: null, floor: null },
    { id: 'sp-l12', hotelId: LEME, type: 'room', name: 'Quarto jardim', number: '12', floor: '1' },
    { id: 'sp-lcafe', hotelId: LEME, type: 'area', name: 'Café da pousada', number: null, floor: null },
  ]

  const users: DemoUser[] = [
    {
      id: 'user-ana',
      email: 'ana@stayo.app',
      password: DEMO_PASSWORD,
      fullName: 'Ana Costa',
      accountType: 'human',
      hotelIds: [AURORA, LEME],
      createdAt: now,
    },
    totemUser('user-recepcao', 'recepcao-01', 'Recepção Aurora'),
    totemUser('user-quarto', 'quarto-01', 'Quarto Aurora'),
    totemUser('user-area', 'area-restaurante', 'Restaurante Maré'),
    totemUser('user-cozinha', 'cozinha-01', 'Cozinha Aurora'),
    totemUser('user-leme-recepcao', 'leme-recepcao', 'Recepção Leme'),
  ]

  const totems: DemoTotem[] = [
    totem('totem-recepcao', AURORA, 'recepcao-01', 'Recepção lobby', 'reception', 'user-recepcao'),
    totem('totem-quarto', AURORA, 'quarto-01', 'Totem de quarto', 'room', 'user-quarto'),
    totem('totem-area', AURORA, 'area-restaurante', 'Restaurante Maré', 'area', 'user-area'),
    totem('totem-cozinha', AURORA, 'cozinha-01', 'Cozinha', 'operation', 'user-cozinha'),
    totem('totem-leme-recepcao', LEME, 'leme-recepcao', 'Recepção Leme', 'reception', 'user-leme-recepcao'),
  ]

  const reservations: DemoReservation[] = [
    reservation({
      id: 'res-clara',
      hotelId: AURORA,
      code: 'RES-1842',
      guestName: 'Clara Mendes',
      guestCpf: '39022188015',
      guestEmail: 'clara.mendes@email.com',
      guestPhone: '(48) 98812-4410',
      roomId: 'sp-401',
      roomNumber: '401',
      category: 'Suíte Mar',
      checkIn: today,
      checkOut: plus2,
      guests: 2,
      status: 'arriving_today',
      nightlyRate: 890,
      paymentMethod: 'credit',
      notes: 'Chegada prevista 15h. Pediu berço.',
      history: [{ at: `${today} 08:10`, text: 'Reserva confirmada para chegada hoje' }],
    }),
    reservation({
      id: 'res-joao',
      hotelId: AURORA,
      code: 'RES-1843',
      guestName: 'João Vasconcelos',
      guestCpf: '12345678909',
      guestEmail: 'joao.vasconcelos@email.com',
      guestPhone: '(11) 97620-1188',
      roomId: 'sp-203',
      roomNumber: '203',
      category: 'Standard',
      checkIn: today,
      checkOut: plus3,
      guests: 1,
      status: 'arriving_today',
      nightlyRate: 480,
      paymentMethod: 'pix',
      notes: '',
      history: [{ at: `${today} 09:02`, text: 'Reserva confirmada para chegada hoje' }],
    }),
    reservation({
      id: 'res-helena',
      hotelId: AURORA,
      code: 'RES-1790',
      guestName: 'Helena Duarte',
      guestCpf: '98765432100',
      guestEmail: 'helena.duarte@email.com',
      guestPhone: '(21) 98100-3321',
      roomId: 'sp-305',
      roomNumber: '305',
      category: 'Superior',
      checkIn: yesterday,
      checkOut: tomorrow,
      guests: 2,
      status: 'checked_in',
      nightlyRate: 520,
      paymentMethod: 'credit',
      notes: 'Aniversário. Preferência por travesseiro extra.',
      history: [
        { at: `${yesterday} 14:18`, text: 'Check-in no totem de recepção' },
        { at: `${yesterday} 14:20`, text: 'Estadia aberta no quarto 305' },
      ],
    }),
    reservation({
      id: 'res-pedro',
      hotelId: AURORA,
      code: 'RES-1850',
      guestName: 'Pedro Nunes',
      guestCpf: '45678912300',
      guestEmail: 'pedro.nunes@email.com',
      guestPhone: '(47) 99910-2200',
      roomId: 'sp-201',
      roomNumber: '201',
      category: 'Standard',
      checkIn: tomorrow,
      checkOut: plus5,
      guests: 2,
      status: 'pending',
      nightlyRate: 450,
      paymentMethod: 'pix',
      notes: 'Aguardando depósito.',
      history: [{ at: `${today} 07:40`, text: 'Reserva criada no console' }],
    }),
    reservation({
      id: 'res-marina',
      hotelId: AURORA,
      code: 'RES-1701',
      guestName: 'Marina Lopes',
      guestCpf: '11122233396',
      guestEmail: 'marina.lopes@email.com',
      guestPhone: '(48) 99100-7788',
      roomId: 'sp-201',
      roomNumber: '201',
      category: 'Standard',
      checkIn: isoDate(-4),
      checkOut: yesterday,
      guests: 1,
      status: 'checked_out',
      nightlyRate: 450,
      paymentMethod: 'pix',
      notes: '',
      history: [
        { at: `${isoDate(-4)} 15:02`, text: 'Check-in no totem' },
        { at: `${yesterday} 11:40`, text: 'Check-out pago no totem' },
      ],
    }),
    reservation({
      id: 'res-leme-sofia',
      hotelId: LEME,
      code: 'LEM-220',
      guestName: 'Sofia Martins',
      guestCpf: '22233344455',
      guestEmail: 'sofia.martins@email.com',
      guestPhone: '(21) 98877-1002',
      roomId: 'sp-l12',
      roomNumber: '12',
      category: 'Quarto jardim',
      checkIn: today,
      checkOut: plus2,
      guests: 2,
      status: 'arriving_today',
      nightlyRate: 390,
      paymentMethod: 'pix',
      notes: '',
      history: [{ at: `${today} 08:00`, text: 'Reserva confirmada' }],
    }),
  ]

  const stays: DemoStay[] = [
    {
      id: 'stay-helena',
      hotelId: AURORA,
      reservationId: 'res-helena',
      spaceId: 'sp-305',
      roomNumber: '305',
      guestName: 'Helena Duarte',
      status: 'active',
      checkedInAt: stamp(-22),
      checkedOutAt: null,
    },
  ]

  const orders: DemoOrder[] = [
    order({
      id: 'ord-cafe',
      hotelId: AURORA,
      reservationId: 'res-helena',
      stayId: 'stay-helena',
      source: 'room',
      location: 'Quarto 305',
      guestName: 'Helena Duarte',
      lines: [{ id: 'ln-1', name: 'Café da manhã no quarto', qty: 2, price: 89 }],
      status: 'delivered',
      createdAt: stamp(-3),
      notes: null,
    }),
    order({
      id: 'ord-sand',
      hotelId: AURORA,
      reservationId: 'res-helena',
      stayId: 'stay-helena',
      source: 'room',
      location: 'Quarto 305',
      guestName: 'Helena Duarte',
      lines: [{ id: 'ln-2', name: 'Sanduíche club', qty: 1, price: 52 }],
      status: 'preparing',
      createdAt: stamp(-0.4),
      notes: 'Sem cebola',
    }),
    order({
      id: 'ord-mesa',
      hotelId: AURORA,
      source: 'area',
      location: 'Restaurante Maré',
      guestName: 'Mesa 4',
      lines: [
        { id: 'ln-3', name: 'Risoto de cogumelos', qty: 1, price: 72 },
        { id: 'ln-4', name: 'Suco natural', qty: 2, price: 18 },
      ],
      status: 'open',
      createdAt: stamp(-0.15),
      notes: 'Quarto 305',
    }),
  ]

  const categories: DemoCategory[] = [
    { id: 'cat-rs', hotelId: AURORA, name: 'Alimentos', context: 'room', sortOrder: 1 },
    { id: 'cat-sol', hotelId: AURORA, name: 'Conforto', context: 'room', sortOrder: 2 },
    { id: 'cat-ent', hotelId: AURORA, name: 'Entradas', context: 'area', areaIds: ['sp-rest'], sortOrder: 1 },
    { id: 'cat-prt', hotelId: AURORA, name: 'Pratos', context: 'area', areaIds: ['sp-rest'], sortOrder: 2 },
    { id: 'cat-beb', hotelId: AURORA, name: 'Bebidas', context: 'area', areaIds: ['sp-rest'], sortOrder: 3 },
    { id: 'cat-spa', hotelId: AURORA, name: 'Spa', context: 'area', areaIds: ['sp-spa'], sortOrder: 1 },
    { id: 'cat-leme', hotelId: LEME, name: 'Café', context: 'both', sortOrder: 1 },
  ]

  const items: DemoItem[] = [
    item('ci-1', AURORA, 'cat-rs', 'Café da manhã no quarto', 'Pão, frutas, suco e café.', 89),
    item('ci-2', AURORA, 'cat-rs', 'Sanduíche club', 'Frango, bacon e salada.', 52),
    item('ci-3', AURORA, 'cat-rs', 'Sopa do dia', 'Porção individual.', 38),
    item('ci-4', AURORA, 'cat-sol', 'Toalhas extras', 'Kit com duas unidades.', 0),
    item('ci-5', AURORA, 'cat-sol', 'Água e gelo', 'Duas garrafas e balde de gelo.', 0),
    item('ci-6', AURORA, 'cat-sol', 'Travesseiro extra', 'Travesseiro de plumas.', 0),
    item('ci-7', AURORA, 'cat-ent', 'Bruschetta', 'Tomate, manjericão e azeite.', 34),
    item('ci-8', AURORA, 'cat-ent', 'Carpaccio', 'Filé mignon com rúcula.', 48),
    item('ci-9', AURORA, 'cat-prt', 'Risoto de cogumelos', 'Arroz arbóreo e parmesão.', 72),
    item('ci-10', AURORA, 'cat-prt', 'Filé ao molho', 'Batatas rústicas e legumes.', 98),
    item('ci-11', AURORA, 'cat-beb', 'Suco natural', 'Laranja ou abacaxi.', 18),
    item('ci-12', AURORA, 'cat-beb', 'Água com gás', 'Garrafa 500 ml.', 12),
    item('ci-13', AURORA, 'cat-spa', 'Massagem relaxante', '50 minutos.', 180),
    item('ci-14', AURORA, 'cat-spa', 'Day use spa', 'Sauna e piscina aquecida.', 120),
    item('ci-15', LEME, 'cat-leme', 'Café coado', 'Bule para dois.', 28),
  ]

  const services: DemoService[] = [
    {
      id: 'sv-1',
      hotelId: AURORA,
      name: 'Late checkout',
      description: 'Saída até 16h, sujeito a disponibilidade.',
      price: 180,
      active: true,
      icon: 'clock',
      tone: '#e7eef2',
    },
    {
      id: 'sv-2',
      hotelId: AURORA,
      name: 'Massagem no quarto',
      description: 'Sessão de 40 minutos.',
      price: 220,
      active: true,
      icon: 'spa',
      tone: '#f3ebe4',
    },
    {
      id: 'sv-3',
      hotelId: AURORA,
      name: 'Transfer aeroporto',
      description: 'Ida ou volta, até 3 passageiros.',
      price: 140,
      active: true,
      icon: 'car',
      tone: '#e8eee9',
    },
    {
      id: 'sv-4',
      hotelId: AURORA,
      name: 'Bike nas trilhas',
      description: 'Aluguel por meio período, com capacete.',
      price: 60,
      active: false,
      icon: 'bike',
      tone: '#e6ece8',
    },
  ]

  const areas: DemoArea[] = [
    { id: 'sp-rest', hotelId: AURORA, name: 'Restaurante Maré', active: true },
    { id: 'sp-spa', hotelId: AURORA, name: 'Spa Aurora', active: true },
    { id: 'sp-lcafe', hotelId: LEME, name: 'Café da pousada', active: true },
  ]

  const activities: DemoActivity[] = [
    {
      id: 'ac-1',
      hotelId: AURORA,
      time: clock(-0.4),
      title: 'Pedido em preparo',
      detail: 'Helena Duarte — sanduíche club',
      kind: 'order',
    },
    {
      id: 'ac-2',
      hotelId: AURORA,
      time: clock(-0.15),
      title: 'Pedido no restaurante',
      detail: 'Mesa 4 · risoto e sucos',
      kind: 'order',
    },
    {
      id: 'ac-3',
      hotelId: AURORA,
      time: '08:10',
      title: 'Chegada de hoje',
      detail: 'Clara Mendes — quarto 401',
      kind: 'reservation',
    },
  ]

  return {
    users,
    hotels,
    reservations,
    orders,
    stays,
    spaces,
    totems,
    categories,
    items,
    services,
    areas,
    activities,
  }
}

function totemUser(id: string, loginId: string, fullName: string): DemoUser {
  return {
    id,
    email: totemEmail(loginId),
    password: DEMO_PASSWORD,
    fullName,
    accountType: 'totem',
    hotelIds: [],
    totemId: id.replace('user-', 'totem-') === id ? undefined : undefined,
    createdAt: new Date().toISOString(),
  }
}

function totem(
  id: string,
  hotelId: string,
  loginId: string,
  name: string,
  kind: TotemKind,
  userId: string,
): DemoTotem {
  return {
    id,
    hotelId,
    loginId,
    name,
    kind,
    spaceId: null,
    roomNumber: null,
    areaId: null,
    active: true,
    userId,
  }
}

function reservation(input: Omit<DemoReservation, 'guestId' | 'total'> & { guestId?: string; total?: number }): DemoReservation {
  const total =
    input.total && input.total > 0
      ? input.total
      : input.nightlyRate * nightsBetween(input.checkIn, input.checkOut)
  return {
    ...input,
    guestId: input.guestId ?? `guest-${input.id}`,
    total,
  }
}

function order(input: Omit<DemoOrder, 'total'> & { total?: number }): DemoOrder {
  const total = input.lines.reduce((sum, line) => sum + line.qty * line.price, 0)
  return { ...input, total }
}

function item(
  id: string,
  hotelId: string,
  categoryId: string,
  name: string,
  description: string,
  price: number,
): DemoItem {
  return { id, hotelId, categoryId, name, description, price, available: true, imagePath: null }
}

let state: DemoState | null = null

function persist() {
  if (!state) return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore quota */
  }
}

function load(): DemoState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState
      if (parsed?.hotels?.length && parsed.users?.length) return parsed
    }
  } catch {
    /* reseed */
  }
  const next = seed()
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
  return next
}

export function demoState() {
  if (!state) state = load()
  return state
}

export function resetDemoState() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  state = seed()
  persist()
}

function commit() {
  persist()
}

export function findUserByLogin(login: string) {
  const trimmed = login.trim().toLowerCase()
  if (!trimmed) return null
  const email = trimmed.includes('@') ? trimmed : totemEmail(trimmed)
  return demoState().users.find((user) => user.email.toLowerCase() === email) ?? null
}

export function publicUser(user: DemoUser) {
  const totemRecord = user.totemId
    ? demoState().totems.find((item) => item.id === user.totemId)
    : demoState().totems.find((item) => item.userId === user.id)
  const hotel = totemRecord ? demoState().hotels.find((item) => item.id === totemRecord.hotelId) : undefined
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    status: 'ACTIVE',
    createdAt: user.createdAt,
    updatedAt: user.createdAt,
    deactivatedAt: null,
    accountType: user.accountType,
    totem: totemRecord
      ? {
          id: totemRecord.id,
          hotelId: totemRecord.hotelId,
          loginId: totemRecord.loginId,
          name: totemRecord.name,
          kind: totemRecord.kind,
          spaceId: totemRecord.spaceId,
          roomNumber: totemRecord.roomNumber,
          areaId: totemRecord.areaId,
          active: totemRecord.active,
          brand: hotel?.brand,
        }
      : undefined,
    hotel: hotel ?? undefined,
  }
}

export function sessionFor(user: DemoUser) {
  return {
    user: publicUser(user),
    accessToken: `demo.${user.id}`,
    refreshToken: `demo-refresh.${user.id}`,
    tokenType: 'Bearer',
    expiresIn: 60 * 60 * 8,
  }
}

export function userFromToken(token: string | null | undefined) {
  if (!token?.startsWith('demo.')) return null
  const id = token.slice('demo.'.length)
  return demoState().users.find((user) => user.id === id) ?? null
}

export function hotelsFor(user: DemoUser) {
  if (user.accountType === 'totem') {
    const profile = publicUser(user)
    return profile.hotel ? [profile.hotel] : []
  }
  const allowed = new Set(user.hotelIds)
  return demoState().hotels.filter((hotel) => allowed.has(hotel.id))
}

export function queueSummary(hotelId: string) {
  const db = demoState()
  return {
    awaitingCheckin: db.reservations.filter((item) => item.hotelId === hotelId && item.status === 'arriving_today')
      .length,
    checkinsDone: db.reservations.filter((item) => item.hotelId === hotelId && item.status === 'checked_in').length,
    openOrders: db.orders.filter(
      (item) => item.hotelId === hotelId && (item.status === 'open' || item.status === 'preparing'),
    ).length,
  }
}

function matchQuery(reservation: DemoReservation, raw: string) {
  const q = raw.trim().toLowerCase()
  if (!q) return false
  const digits = q.replace(/\D/g, '')
  const cpf = reservation.guestCpf.replace(/\D/g, '')
  if (digits.length >= 4 && cpf.includes(digits)) return true
  const blob = `${reservation.guestName} ${reservation.code} ${reservation.roomNumber}`.toLowerCase()
  return blob.includes(q)
}

export function searchCheckin(hotelId: string, query: string) {
  return demoState().reservations.filter(
    (item) => item.hotelId === hotelId && matchQuery(item, query) && item.status !== 'cancelled',
  )
}

export function searchCheckout(hotelId: string, query: string) {
  return demoState().reservations.filter(
    (item) => item.hotelId === hotelId && matchQuery(item, query) && item.status === 'checked_in',
  )
}

function checkinBlock(reservation: DemoReservation) {
  if (reservation.status === 'cancelled') return 'Esta reserva foi cancelada.'
  if (reservation.status === 'checked_in') return 'Esta reserva já fez check-in.'
  if (reservation.status === 'checked_out') return 'Esta reserva já fez check-out.'
  if (reservation.status === 'pending') return 'A reserva ainda não foi confirmada. Fale com a recepção.'
  const today = isoDate(0)
  if (reservation.checkIn > today) return 'O check-in desta reserva ainda não está liberado.'
  if (reservation.checkIn < today && reservation.status !== 'arriving_today' && reservation.status !== 'confirmed') {
    return 'Não é possível fazer check-in nesta reserva.'
  }
  return null
}

export function validateCheckin(hotelId: string, reservationId: string) {
  const reservation = requireReservation(hotelId, reservationId)
  const blockReason = checkinBlock(reservation)
  if (blockReason) throw new DemoHttpError(409, blockReason)
  return { blockReason: null, reservation }
}

export function completeCheckin(hotelId: string, reservationId: string) {
  const reservation = requireReservation(hotelId, reservationId)
  const blockReason = checkinBlock(reservation)
  if (blockReason) throw new DemoHttpError(409, blockReason)

  const db = demoState()
  const existing = db.stays.find((stay) => stay.reservationId === reservation.id && stay.status === 'active')
  if (!existing) {
    db.stays.unshift({
      id: uid('stay'),
      hotelId,
      reservationId: reservation.id,
      spaceId: reservation.roomId,
      roomNumber: reservation.roomNumber,
      guestName: reservation.guestName,
      status: 'active',
      checkedInAt: new Date().toISOString(),
      checkedOutAt: null,
    })
  }
  reservation.status = 'checked_in'
  reservation.history = [
    { at: new Date().toLocaleString('pt-BR'), text: 'Check-in no totem de recepção' },
    ...reservation.history,
  ]
  commit()
  return { blockReason: null, reservation }
}

function stayOf(reservationId: string) {
  return demoState().stays.find((stay) => stay.reservationId === reservationId && stay.status === 'active') ?? null
}

export function checkoutStatement(hotelId: string, reservationId: string) {
  const reservation = requireReservation(hotelId, reservationId)
  if (reservation.status !== 'checked_in') {
    throw new DemoHttpError(409, 'Só é possível encerrar uma reserva com hóspede no quarto.')
  }
  const stay = stayOf(reservation.id)
  const related = demoState().orders.filter(
    (orderItem) => orderItem.hotelId === hotelId && (orderItem.stayId === stay?.id || orderItem.reservationId === reservation.id),
  )
  const nights = nightsBetween(reservation.checkIn, reservation.checkOut)
  const roomAmount = reservation.nightlyRate * nights
  const charges: { type: string; label: string; amount: number; orderId?: string }[] = [
    {
      type: 'room',
      label: `Diárias · ${nights} noite${nights > 1 ? 's' : ''} · quarto ${reservation.roomNumber}`,
      amount: roomAmount,
    },
  ]
  const openOrders: string[] = []
  for (const orderItem of related) {
    if (orderItem.status === 'delivered') {
      const label = orderItem.lines.map((line) => (line.qty > 1 ? `${line.qty}× ${line.name}` : line.name)).join(', ')
      charges.push({ type: 'order', label, amount: orderItem.total, orderId: orderItem.id })
    } else if (orderItem.status === 'open' || orderItem.status === 'preparing') {
      openOrders.push(orderItem.id)
    }
  }
  const total = charges.reduce((sum, charge) => sum + charge.amount, 0)
  return {
    reservation,
    charges,
    total,
    openOrders,
    stayId: stay?.id ?? null,
  }
}

export function completeCheckout(
  hotelId: string,
  reservationId: string,
  body: { paymentMethod?: PaymentMethod; paidAmount?: number },
) {
  const statement = checkoutStatement(hotelId, reservationId)
  const reservation = requireReservation(hotelId, reservationId)
  reservation.status = 'checked_out'
  if (body.paymentMethod) reservation.paymentMethod = body.paymentMethod
  reservation.history = [
    {
      at: new Date().toLocaleString('pt-BR'),
      text: `Check-out no totem · ${body.paymentMethod ?? 'pagamento registrado'}`,
    },
    ...reservation.history,
  ]
  const stay = statement.stayId ? demoState().stays.find((item) => item.id === statement.stayId) : stayOf(reservation.id)
  if (stay) {
    stay.status = 'completed'
    stay.checkedOutAt = new Date().toISOString()
  }
  commit()
  return reservation
}

export function placeOrder(
  hotelId: string,
  body: {
    source: 'room' | 'area'
    location: string
    guestName: string
    lines: { name: string; qty: number; price: number; catalogItemId?: string; serviceId?: string }[]
    totemId?: string
    spaceId?: string
    notes?: string
  },
) {
  if (!body.lines?.length) throw new DemoHttpError(400, 'O pedido precisa de ao menos um item.')
  const db = demoState()
  const pricedLines = body.lines.map((line, index) => {
    if (Boolean(line.catalogItemId) === Boolean(line.serviceId)) {
      throw new DemoHttpError(400, 'Informe catalogItemId ou serviceId em cada item.')
    }
    if (!Number.isInteger(line.qty) || line.qty < 1 || line.qty > 100) {
      throw new DemoHttpError(400, 'Quantidade deve estar entre 1 e 100.')
    }
    const entry = line.catalogItemId
      ? db.items.find((item) => item.id === line.catalogItemId && item.hotelId === hotelId)
      : db.services.find((service) => service.id === line.serviceId && service.hotelId === hotelId)
    if (!entry) throw new DemoHttpError(404, 'Item não encontrado neste hotel.')
    if (('available' in entry && !entry.available) || ('active' in entry && !entry.active)) {
      throw new DemoHttpError(409, 'Item indisponível. Atualize o cardápio.')
    }
    if ('categoryId' in entry) {
      const category = db.categories.find((item) => item.id === entry.categoryId && item.hotelId === hotelId)
      if (!category || (category.context !== 'both' && category.context !== body.source)
        || (body.source === 'area' && category.areaIds?.length && !category.areaIds.includes(body.spaceId ?? ''))) {
        throw new DemoHttpError(403, 'Item não disponível neste espaço.')
      }
    } else if (body.source !== 'room') {
      throw new DemoHttpError(403, 'Serviços extras são exclusivos dos quartos.')
    }
    if (!Number.isFinite(line.price) || line.price !== entry.price) {
      throw new DemoHttpError(409, 'O preço mudou. Atualize o cardápio antes de enviar o pedido.')
    }
    return { id: `ln-${index + 1}`, name: entry.name, qty: line.qty, price: entry.price }
  })
  let stay: DemoStay | null = null
  let reservationId: string | null = null
  if (body.source === 'room') {
    if (!body.spaceId) throw new DemoHttpError(409, 'Selecione o quarto antes de pedir.')
    stay =
      demoState().stays.find(
        (item) => item.hotelId === hotelId && item.spaceId === body.spaceId && item.status === 'active',
      ) ?? null
    if (!stay) {
      throw new DemoHttpError(409, 'Não há hóspede neste quarto. O check-in precisa ser feito na recepção.')
    }
    reservationId = stay.reservationId
  }
  const next: DemoOrder = order({
    id: uid('ord'),
    hotelId,
    reservationId,
    stayId: stay?.id ?? null,
    source: body.source,
    location: body.location,
    guestName: body.source === 'room' && stay ? stay.guestName : body.guestName,
    lines: pricedLines,
    status: 'open',
    createdAt: new Date().toISOString(),
    totemId: body.totemId,
    notes: body.notes ?? null,
  })
  demoState().orders.unshift(next)
  commit()
  return next
}

export function advanceOrder(hotelId: string, orderId: string) {
  const current = requireOrder(hotelId, orderId)
  if (current.status === 'cancelled') throw new DemoHttpError(409, 'Pedido cancelado não avança.')
  if (current.status === 'open') current.status = 'preparing'
  else if (current.status === 'preparing') current.status = 'delivered'
  commit()
  return current
}

export function cancelOrder(hotelId: string, orderId: string) {
  const current = requireOrder(hotelId, orderId)
  if (current.status === 'delivered') throw new DemoHttpError(409, 'Pedido já entregue não pode ser cancelado.')
  current.status = 'cancelled'
  commit()
  return current
}

export function stayAccount(stay: DemoStay) {
  const reservation = demoState().reservations.find((item) => item.id === stay.reservationId)
  const related = demoState().orders.filter((item) => item.stayId === stay.id && item.status !== 'cancelled')
  const delivered = related.filter((item) => item.status === 'delivered')
  const pending = related.filter((item) => item.status === 'open' || item.status === 'preparing')
  const nights = reservation ? nightsBetween(reservation.checkIn, reservation.checkOut) : 1
  const roomTotal = (reservation?.nightlyRate ?? 0) * nights
  const deliveredOrdersTotal = delivered.reduce((sum, item) => sum + item.total, 0)
  const pendingOrdersTotal = pending.reduce((sum, item) => sum + item.total, 0)
  return {
    stay,
    roomTotal,
    deliveredOrdersTotal,
    pendingOrdersTotal,
    billableTotal: roomTotal + deliveredOrdersTotal,
    pendingOrderIds: pending.map((item) => item.id),
  }
}

export function activeStayBySpace(hotelId: string, spaceId: string) {
  const stay = demoState().stays.find(
    (item) => item.hotelId === hotelId && item.spaceId === spaceId && item.status === 'active',
  )
  if (!stay) throw new DemoHttpError(404, 'Nenhuma estadia ativa neste quarto.')
  return stayAccount(stay)
}

function requireReservation(hotelId: string, id: string) {
  const found = demoState().reservations.find((item) => item.id === id && item.hotelId === hotelId)
  if (!found) throw new DemoHttpError(404, 'Reserva não encontrada.')
  return found
}

function requireOrder(hotelId: string, id: string) {
  const found = demoState().orders.find((item) => item.id === id && item.hotelId === hotelId)
  if (!found) throw new DemoHttpError(404, 'Pedido não encontrado.')
  return found
}

export function requireHotel(id: string) {
  const found = demoState().hotels.find((item) => item.id === id)
  if (!found) throw new DemoHttpError(404, 'Hotel não encontrado.')
  return found
}

export function createHotel(user: DemoUser, body: Record<string, unknown>) {
  const name = String(body.name ?? '').trim() || 'Novo hotel'
  const text = (key: string) => (typeof body[key] === 'string' ? String(body[key]) : '')
  const hotel: DemoHotel = {
    id: uid('hotel'),
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'hotel',
    name,
    city: text('city'),
    state: text('state'),
    brand: {
      primaryColor: text('primaryColor') || '#0B3D5C',
      secondaryColor: text('secondaryColor') || '#1F6F8B',
      accentColor: text('accentColor') || '#C4784A',
      hotelName: text('brandHotelName') || name,
      coverTone: text('coverTone') || 'cool',
    },
    termsText: text('termsText'),
    termsPath: text('termsPath'),
  }
  demoState().hotels.push(hotel)
  if (!user.hotelIds.includes(hotel.id)) user.hotelIds.push(hotel.id)
  commit()
  return hotel
}

export function updateHotel(id: string, body: Record<string, unknown>) {
  const hotel = requireHotel(id)
  if (typeof body.name === 'string' && body.name.trim()) hotel.name = body.name.trim()
  if (typeof body.city === 'string') hotel.city = body.city
  if (typeof body.state === 'string') hotel.state = body.state
  if ('termsText' in body) hotel.termsText = typeof body.termsText === 'string' ? body.termsText : ''
  if ('termsPath' in body) hotel.termsPath = typeof body.termsPath === 'string' ? body.termsPath : ''
  const brand = { ...hotel.brand }
  if (typeof body.primaryColor === 'string' && body.primaryColor) brand.primaryColor = body.primaryColor
  if (typeof body.secondaryColor === 'string' && body.secondaryColor) brand.secondaryColor = body.secondaryColor
  if (typeof body.accentColor === 'string' && body.accentColor) brand.accentColor = body.accentColor
  if (typeof body.brandHotelName === 'string' && body.brandHotelName.trim()) brand.hotelName = body.brandHotelName.trim()
  if (typeof body.coverTone === 'string' && body.coverTone) brand.coverTone = body.coverTone
  hotel.brand = brand
  commit()
  return hotel
}

export function deleteHotel(user: DemoUser, id: string) {
  requireHotel(id)
  const db = demoState()
  db.hotels = db.hotels.filter((item) => item.id !== id)
  user.hotelIds = user.hotelIds.filter((item) => item !== id)
  commit()
}

export function confirmReservation(hotelId: string, id: string) {
  const reservation = requireReservation(hotelId, id)
  if (reservation.status === 'cancelled' || reservation.status === 'checked_out') {
    throw new DemoHttpError(409, 'Esta reserva não pode ser confirmada.')
  }
  if (reservation.status === 'pending' || reservation.status === 'confirmed') {
    reservation.status = reservation.checkIn === isoDate(0) ? 'arriving_today' : 'confirmed'
    reservation.history = [{ at: new Date().toLocaleString('pt-BR'), text: 'Reserva confirmada no console' }, ...reservation.history]
  }
  commit()
  return reservation
}

export function cancelReservation(hotelId: string, id: string) {
  const reservation = requireReservation(hotelId, id)
  if (reservation.status === 'checked_in') {
    throw new DemoHttpError(409, 'Hóspede já está no quarto. Faça o check-out antes de cancelar.')
  }
  reservation.status = 'cancelled'
  reservation.history = [{ at: new Date().toLocaleString('pt-BR'), text: 'Reserva cancelada no console' }, ...reservation.history]
  commit()
  return reservation
}

export function createReservation(hotelId: string, body: Record<string, unknown>) {
  const guestName = String(body.guestName ?? '').trim()
  if (!guestName) throw new DemoHttpError(400, 'Informe o nome do hóspede.')
  const checkIn = String(body.checkIn ?? isoDate(0)).slice(0, 10)
  const checkOut = String(body.checkOut ?? isoDate(1)).slice(0, 10)
  const roomNumber = String(body.roomNumber ?? '').trim()
  const space = demoState().spaces.find(
    (item) => item.hotelId === hotelId && item.type === 'room' && item.number === roomNumber,
  )
  const nightlyRate = Number(body.total) > 0 ? Number(body.total) : 480
  const today = isoDate(0)
  const status: ReservationStatus = checkIn === today ? 'arriving_today' : checkIn < today ? 'confirmed' : 'confirmed'
  const next: DemoReservation = reservation({
    id: uid('res'),
    hotelId,
    code: `RES-${Math.floor(1800 + Math.random() * 700)}`,
    guestName,
    guestCpf: String(body.guestCpf ?? '').replace(/\D/g, ''),
    guestEmail: String(body.guestEmail ?? ''),
    guestPhone: String(body.guestPhone ?? ''),
    roomId: space?.id ?? String(body.roomId ?? ''),
    roomNumber,
    category: String(body.category ?? space?.name ?? 'Standard'),
    checkIn,
    checkOut,
    guests: Number(body.guests) || 1,
    status,
    nightlyRate,
    paymentMethod: (body.paymentMethod as PaymentMethod) || 'pix',
    notes: String(body.notes ?? ''),
    history: [{ at: new Date().toLocaleString('pt-BR'), text: 'Reserva criada no console' }],
  })
  if (body.total && Number(body.total) > 0) next.total = Number(body.total)
  demoState().reservations.unshift(next)
  commit()
  return next
}

export function updateReservation(hotelId: string, id: string, body: Record<string, unknown>) {
  const current = requireReservation(hotelId, id)
  if (typeof body.guestName === 'string' && body.guestName.trim()) current.guestName = body.guestName.trim()
  if (typeof body.guestEmail === 'string') current.guestEmail = body.guestEmail
  if (typeof body.guestPhone === 'string') current.guestPhone = body.guestPhone
  if (typeof body.notes === 'string') current.notes = body.notes
  if (typeof body.roomNumber === 'string') current.roomNumber = body.roomNumber
  if (typeof body.checkIn === 'string') current.checkIn = body.checkIn.slice(0, 10)
  if (typeof body.checkOut === 'string') current.checkOut = body.checkOut.slice(0, 10)
  commit()
  return current
}

export function createSpace(hotelId: string, body: { type: SpaceType; number?: string; name?: string; floor?: string }) {
  const space: DemoSpace = {
    id: uid('sp'),
    hotelId,
    type: body.type,
    name: body.name?.trim() || (body.type === 'room' ? 'Quarto' : 'Área'),
    number: body.type === 'room' ? body.number?.trim() || null : null,
    floor: body.floor?.trim() || null,
  }
  demoState().spaces.push(space)
  if (body.type === 'area') {
    demoState().areas.push({ id: space.id, hotelId, name: space.name, active: true })
  }
  commit()
  return space
}

export function updateSpace(hotelId: string, id: string, body: { number?: string; name?: string; floor?: string }) {
  const space = demoState().spaces.find((item) => item.id === id && item.hotelId === hotelId)
  if (!space) throw new DemoHttpError(404, 'Espaço não encontrado.')
  if (body.name) space.name = body.name
  if (body.number) space.number = body.number
  if (body.floor) space.floor = body.floor
  const area = demoState().areas.find((item) => item.id === id)
  if (area && body.name) area.name = body.name
  commit()
  return space
}

export function deleteSpace(hotelId: string, id: string) {
  const used = demoState().totems.some((item) => item.hotelId === hotelId && item.spaceId === id)
  if (used) throw new DemoHttpError(409, 'Este espaço está vinculado a um totem.')
  const active = demoState().stays.some((item) => item.spaceId === id && item.status === 'active')
  if (active) throw new DemoHttpError(409, 'Há uma estadia ativa neste espaço.')
  const db = demoState()
  db.spaces = db.spaces.filter((item) => !(item.id === id && item.hotelId === hotelId))
  db.areas = db.areas.filter((item) => !(item.id === id && item.hotelId === hotelId))
  commit()
}

export function createTotem(
  hotelId: string,
  body: { name: string; kind: TotemKind; loginSuffix: string; password: string; roomNumber?: string | null; areaId?: string | null },
) {
  const loginId = body.loginSuffix.trim().toLowerCase()
  if (!loginId) throw new DemoHttpError(400, 'Informe o login do totem.')
  const email = totemEmail(loginId)
  if (demoState().users.some((user) => user.email.toLowerCase() === email)) {
    throw new DemoHttpError(409, 'Este login já está em uso.')
  }
  const userId = uid('user')
  const totemId = uid('totem')
  demoState().users.push({
    id: userId,
    email,
    password: body.password || DEMO_PASSWORD,
    fullName: body.name,
    accountType: 'totem',
    hotelIds: [],
    totemId,
    createdAt: new Date().toISOString(),
  })
  const next: DemoTotem = {
    id: totemId,
    hotelId,
    loginId,
    name: body.name.trim() || loginId,
    kind: body.kind,
    spaceId: null,
    roomNumber: body.kind === 'room' ? body.roomNumber ?? null : null,
    areaId: body.kind === 'area' ? body.areaId ?? null : null,
    active: true,
    userId,
  }
  demoState().totems.push(next)
  commit()
  return next
}

export function updateTotem(hotelId: string, id: string, body: Partial<DemoTotem>) {
  const current = demoState().totems.find((item) => item.id === id && item.hotelId === hotelId)
  if (!current) throw new DemoHttpError(404, 'Totem não encontrado.')
  if (body.name) current.name = body.name
  if (body.kind) current.kind = body.kind
  if ('roomNumber' in body) current.roomNumber = body.roomNumber ?? null
  if ('areaId' in body) current.areaId = body.areaId ?? null
  if (typeof body.active === 'boolean') current.active = body.active
  commit()
  return current
}

export function resetTotemPassword(hotelId: string, id: string, password: string) {
  const current = demoState().totems.find((item) => item.id === id && item.hotelId === hotelId)
  if (!current) throw new DemoHttpError(404, 'Totem não encontrado.')
  const user = demoState().users.find((item) => item.id === current.userId)
  if (user) user.password = password
  commit()
}

export function registerUser(body: { email: string; password: string; fullName: string }) {
  const email = body.email.trim().toLowerCase()
  if (demoState().users.some((user) => user.email.toLowerCase() === email)) {
    throw new DemoHttpError(409, 'Já existe uma conta com este e-mail.')
  }
  const user: DemoUser = {
    id: uid('user'),
    email,
    password: body.password,
    fullName: body.fullName.trim() || email.split('@')[0],
    accountType: 'human',
    hotelIds: [],
    createdAt: new Date().toISOString(),
  }
  demoState().users.push(user)
  commit()
  return user
}

export function linkTotemUsers() {
  const db = demoState()
  for (const record of db.totems) {
    const user = db.users.find((item) => item.id === record.userId)
    if (user) user.totemId = record.id
  }
}

function fixSeedLinks() {
  const db = demoState()
  const pairs: [string, string][] = [
    ['user-recepcao', 'totem-recepcao'],
    ['user-quarto', 'totem-quarto'],
    ['user-area', 'totem-area'],
    ['user-cozinha', 'totem-cozinha'],
    ['user-leme-recepcao', 'totem-leme-recepcao'],
  ]
  for (const [userId, totemId] of pairs) {
    const user = db.users.find((item) => item.id === userId)
    if (user && !user.totemId) user.totemId = totemId
  }
}

const loaded = demoState()
void loaded
fixSeedLinks()
