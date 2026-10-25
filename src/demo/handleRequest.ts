import type { RequestOptions } from '../api/client.ts'
import { DEMO_PASSWORD } from './mode.ts'
import { DemoHttpError } from './http.ts'
import {
  activeStayBySpace,
  advanceOrder,
  cancelOrder,
  cancelReservation,
  checkoutStatement,
  completeCheckin,
  completeCheckout,
  confirmReservation,
  createHotel,
  createReservation,
  createSpace,
  createTotem,
  deleteHotel,
  deleteSpace,
  demoState,
  findUserByLogin,
  hotelsFor,
  placeOrder,
  publicUser,
  queueSummary,
  registerUser,
  requireHotel,
  resetTotemPassword,
  searchCheckin,
  searchCheckout,
  sessionFor,
  stayAccount,
  updateHotel,
  updateReservation,
  updateSpace,
  updateTotem,
  userFromToken,
  validateCheckin,
} from './store.ts'

function readBody(options: RequestOptions): Record<string, unknown> {
  if (!options.body || typeof options.body !== 'object' || Array.isArray(options.body)) return {}
  return options.body as Record<string, unknown>
}

function tokenOf(options: RequestOptions) {
  if (options.token === null) return null
  return options.token ?? null
}

function userOf(options: RequestOptions) {
  const explicit = tokenOf(options)
  if (explicit) return userFromToken(explicit)
  return null
}

export async function handleDemoRequest(path: string, options: RequestOptions = {}): Promise<unknown> {
  await new Promise((resolve) => window.setTimeout(resolve, 90))

  const method = (options.method ?? (options.body || options.formData ? 'POST' : 'GET')).toUpperCase()
  const [pathname, search = ''] = path.split('?')
  const parts = pathname.replace(/^\/+/, '').split('/').filter(Boolean)
  const query = new URLSearchParams(search)
  const body = readBody(options)

  if (parts[0] === 'auth' && parts[1] === 'login' && method === 'POST') {
    const login = String(body.email ?? '')
    const password = String(body.password ?? '')
    const user = findUserByLogin(login)
    if (!user || (password !== user.password && password !== DEMO_PASSWORD)) {
      throw new DemoHttpError(401, 'E-mail ou senha incorretos.')
    }
    if (!user.totemId && user.accountType === 'totem') {
      const linked = demoState().totems.find((item) => item.userId === user.id)
      if (linked) user.totemId = linked.id
    }
    return sessionFor(user)
  }

  if (parts[0] === 'auth' && parts[1] === 'register' && method === 'POST') {
    const user = registerUser({
      email: String(body.email ?? ''),
      password: String(body.password ?? DEMO_PASSWORD),
      fullName: String(body.fullName ?? ''),
    })
    return sessionFor(user)
  }

  if (parts[0] === 'auth' && parts[1] === 'refresh' && method === 'POST') {
    const refresh = String(body.refreshToken ?? '')
    const id = refresh.startsWith('demo-refresh.') ? refresh.slice('demo-refresh.'.length) : ''
    const user = demoState().users.find((item) => item.id === id)
    if (!user) throw new DemoHttpError(401, 'Sessão expirada.')
    return sessionFor(user)
  }

  const actor = userOf(options) ?? userFromToken(await readConsoleToken())
  if (parts[0] === 'me' && method === 'GET') {
    if (!actor) throw new DemoHttpError(401, 'Sessão inválida.')
    return publicUser(actor)
  }

  if (!actor && parts[0] !== 'auth') {
    throw new DemoHttpError(401, 'Sessão inválida.')
  }

  if (parts[0] === 'hotels' && parts.length === 1 && method === 'GET') {
    return hotelsFor(actor!)
  }

  if (parts[0] === 'hotels' && parts.length === 1 && method === 'POST') {
    return createHotel(actor!, body)
  }

  const hotelId = parts[0] === 'hotels' ? parts[1] : ''

  if (parts[0] === 'hotels' && parts.length === 2 && method === 'GET') {
    return requireHotel(hotelId)
  }

  if (parts[0] === 'hotels' && parts.length === 2 && method === 'PUT') {
    return updateHotel(hotelId, body)
  }

  if (parts[0] === 'hotels' && parts.length === 2 && method === 'DELETE') {
    deleteHotel(actor!, hotelId)
    return null
  }

  if (parts[0] === 'hotels' && parts[2] === 'switch' && method === 'POST') {
    return null
  }

  if (!hotelId) throw new DemoHttpError(404, 'Rota não encontrada no modo demonstração.')

  const resource = parts[2]
  const id = parts[3]
  const action = parts[4]
  const db = demoState()

  if (resource === 'reservations' && !id && method === 'GET') {
    return db.reservations.filter((item) => item.hotelId === hotelId)
  }
  if (resource === 'reservations' && !id && method === 'POST') {
    return createReservation(hotelId, body)
  }
  if (resource === 'reservations' && id && !action && method === 'GET') {
    return db.reservations.find((item) => item.id === id && item.hotelId === hotelId) ?? missing('Reserva')
  }
  if (resource === 'reservations' && id && !action && method === 'PUT') {
    return updateReservation(hotelId, id, body)
  }
  if (resource === 'reservations' && id && action === 'confirm' && method === 'POST') {
    return confirmReservation(hotelId, id)
  }
  if (resource === 'reservations' && id && action === 'cancel' && method === 'POST') {
    return cancelReservation(hotelId, id)
  }

  if (resource === 'checkin' && id === 'search' && method === 'POST') {
    return searchCheckin(hotelId, String(body.q ?? body.cpf ?? ''))
  }
  if (resource === 'checkin' && id && action === 'validate' && method === 'POST') {
    return validateCheckin(hotelId, id)
  }
  if (resource === 'checkin' && id && action === 'complete' && method === 'POST') {
    return completeCheckin(hotelId, id)
  }

  if (resource === 'checkout' && id === 'search' && method === 'POST') {
    return searchCheckout(hotelId, String(body.q ?? body.cpf ?? ''))
  }
  if (resource === 'checkout' && id && action === 'validate' && method === 'POST') {
    return checkoutStatement(hotelId, id)
  }
  if (resource === 'checkout' && id && action === 'complete' && method === 'POST') {
    return completeCheckout(hotelId, id, body as never)
  }

  if (resource === 'queues' && id === 'summary' && method === 'GET') {
    return queueSummary(hotelId)
  }

  if (resource === 'orders' && !id && method === 'GET') {
    return db.orders.filter((item) => item.hotelId === hotelId)
  }
  if (resource === 'orders' && !id && method === 'POST') {
    return placeOrder(hotelId, body as never)
  }
  if (resource === 'orders' && id && action === 'status' && method === 'PATCH') {
    return advanceOrder(hotelId, id)
  }
  if (resource === 'orders' && id && action === 'cancel' && method === 'POST') {
    return cancelOrder(hotelId, id)
  }

  if (resource === 'stays' && id === 'active' && method === 'GET') {
    return activeStayBySpace(hotelId, query.get('spaceId') ?? '')
  }
  if (resource === 'stays' && id && action === 'account' && method === 'GET') {
    const stay = db.stays.find((item) => item.id === id && item.hotelId === hotelId)
    if (!stay) throw new DemoHttpError(404, 'Estadia não encontrada.')
    return stayAccount(stay)
  }
  if (resource === 'stays' && id && action === 'orders' && method === 'GET') {
    return db.orders.filter((item) => item.hotelId === hotelId && item.stayId === id)
  }

  if (resource === 'totems' && !id && method === 'GET') {
    return db.totems.filter((item) => item.hotelId === hotelId)
  }
  if (resource === 'totems' && !id && method === 'POST') {
    return createTotem(hotelId, body as never)
  }
  if (resource === 'totems' && id && action === 'reset-password' && method === 'POST') {
    resetTotemPassword(hotelId, id, String(body.password ?? DEMO_PASSWORD))
    return null
  }
  if (resource === 'totems' && id && !action && method === 'PATCH') {
    return updateTotem(hotelId, id, body as never)
  }

  if (resource === 'catalog' && id === 'categories' && !action && method === 'GET') {
    return db.categories.filter((item) => item.hotelId === hotelId)
  }
  if (resource === 'catalog' && id === 'categories' && !action && method === 'POST') {
    const next = {
      id: `cat-${Date.now().toString(36)}`,
      hotelId,
      name: String(body.name ?? 'Categoria'),
      context: (body.context as 'room' | 'area' | 'both') ?? 'room',
      areaIds: Array.isArray(body.areaIds) ? (body.areaIds as string[]) : [],
      sortOrder: Number(body.sortOrder) || db.categories.length + 1,
    }
    db.categories.push(next)
    persistTouch()
    return next
  }
  if (resource === 'catalog' && id === 'categories' && action && method === 'PUT') {
    const current = db.categories.find((item) => item.id === action && item.hotelId === hotelId)
    if (!current) throw new DemoHttpError(404, 'Categoria não encontrada.')
    current.name = String(body.name ?? current.name)
    if (body.context) current.context = body.context as never
    if (Array.isArray(body.areaIds)) current.areaIds = body.areaIds as string[]
    persistTouch()
    return current
  }

  if (resource === 'catalog' && id === 'items' && !action && method === 'GET') {
    return db.items.filter((item) => item.hotelId === hotelId)
  }
  if (resource === 'catalog' && id === 'items' && !action && method === 'POST') {
    const next = {
      id: `ci-${Date.now().toString(36)}`,
      hotelId,
      categoryId: String(body.categoryId ?? ''),
      name: String(body.name ?? 'Item'),
      description: String(body.description ?? ''),
      price: Number(body.price) || 0,
      available: body.available !== false,
      imagePath: (body.imagePath as string) || null,
    }
    db.items.push(next)
    persistTouch()
    return next
  }
  if (resource === 'catalog' && id === 'items' && action && method === 'PUT') {
    const current = db.items.find((item) => item.id === action && item.hotelId === hotelId)
    if (!current) throw new DemoHttpError(404, 'Item não encontrado.')
    current.name = String(body.name ?? current.name)
    current.description = String(body.description ?? current.description)
    current.price = Number(body.price) || 0
    current.categoryId = String(body.categoryId ?? current.categoryId)
    current.available = body.available !== false
    persistTouch()
    return current
  }

  if (resource === 'catalog' && id === 'services' && !action && method === 'GET') {
    return db.services.filter((item) => item.hotelId === hotelId)
  }
  if (resource === 'catalog' && id === 'services' && !action && method === 'POST') {
    const next = {
      id: `sv-${Date.now().toString(36)}`,
      hotelId,
      name: String(body.name ?? 'Serviço'),
      description: String(body.description ?? ''),
      price: Number(body.price) || 0,
      active: body.active !== false,
      icon: String(body.icon ?? 'tray'),
      tone: String(body.tone ?? '#e7eef2'),
    }
    db.services.push(next)
    persistTouch()
    return next
  }
  if (resource === 'catalog' && id === 'services' && action && method === 'PUT') {
    const current = db.services.find((item) => item.id === action && item.hotelId === hotelId)
    if (!current) throw new DemoHttpError(404, 'Serviço não encontrado.')
    current.name = String(body.name ?? current.name)
    current.description = String(body.description ?? current.description)
    current.price = Number(body.price) || 0
    current.active = body.active !== false
    persistTouch()
    return current
  }

  if (resource === 'catalog' && id === 'areas' && !action && method === 'GET') {
    return db.areas.filter((item) => item.hotelId === hotelId)
  }
  if (resource === 'catalog' && id === 'areas' && !action && method === 'POST') {
    const space = createSpace(hotelId, { type: 'area', name: String(body.name ?? 'Área') })
    const area = db.areas.find((item) => item.id === space.id)
    if (area && body.active === false) area.active = false
    return area ?? { id: space.id, hotelId, name: space.name, active: true }
  }
  if (resource === 'catalog' && id === 'areas' && action && method === 'PUT') {
    const current = db.areas.find((item) => item.id === action && item.hotelId === hotelId)
    if (!current) throw new DemoHttpError(404, 'Área não encontrada.')
    current.name = String(body.name ?? current.name)
    if (typeof body.active === 'boolean') current.active = body.active
    const space = db.spaces.find((item) => item.id === action)
    if (space) space.name = current.name
    persistTouch()
    return current
  }

  if (resource === 'activities' && method === 'GET') {
    return db.activities.filter((item) => item.hotelId === hotelId)
  }

  if (resource === 'spaces' && !id && method === 'GET') {
    const type = query.get('type')
    return db.spaces.filter((item) => item.hotelId === hotelId && (!type || item.type === type))
  }
  if (resource === 'spaces' && !id && method === 'POST') {
    return createSpace(hotelId, body as never)
  }
  if (resource === 'spaces' && id && method === 'PATCH') {
    return updateSpace(hotelId, id, body as never)
  }
  if (resource === 'spaces' && id && method === 'DELETE') {
    deleteSpace(hotelId, id)
    return null
  }

  throw new DemoHttpError(404, 'Rota não encontrada no modo demonstração.')
}

function missing(label: string): never {
  throw new DemoHttpError(404, `${label} não encontrado.`)
}

function persistTouch() {
  try {
    sessionStorage.setItem('stayo.demo.v1', JSON.stringify(demoState()))
  } catch {
    /* ignore */
  }
}

async function readConsoleToken() {
  try {
    const raw = localStorage.getItem('stayo.auth')
    if (!raw) return null
    const parsed = JSON.parse(raw) as { accessToken?: string }
    return parsed.accessToken ?? null
  } catch {
    return null
  }
}
