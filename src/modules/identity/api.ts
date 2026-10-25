import { apiRequest } from '../../api/client.ts'
import type { IdBox } from '../../api/ids.ts'
import { unwrapId } from '../../api/ids.ts'
import { isTotemEmail } from '../../lib/totemLogin.ts'
import type { TotemKind, TotemProfile } from '../devices/model.ts'
import type { ApiHotel } from '../hotels/mappers.ts'
import { mapHotel } from '../hotels/mappers.ts'
import type { Hotel, HotelBrand } from '../hotels/model.ts'
import type { AccountType } from './model.ts'

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

export type ApiTotemProfile = {
  id: IdBox | string
  hotelId: IdBox | string
  loginId: string
  name: string
  kind: TotemKind
  spaceId?: IdBox | string | null
  roomNumber?: string | null
  areaId?: IdBox | string | null
  active: boolean
  brand?: HotelBrand | null
}

export type ApiMe = {
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

export type ApiAuthUser = ApiMe

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

export async function refresh(refreshToken: string): Promise<AuthSessionResponse> {
  const raw = await apiRequest<AuthSessionResponse & { user: ApiAuthUser }>('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
    token: null,
  })
  return { ...raw, user: mapAuthUser(raw.user) }
}

export function mapAuthUser(raw: ApiAuthUser): AuthUser {
  const id = typeof raw.id === 'string' ? raw.id : unwrapId(raw.id)
  const email = raw.email
  const statusFromApi = raw.status?.trim()
  const inactiveHint = 'active' in raw && raw.active === false
  const accountType: AccountType =
    raw.accountType === 'totem' || isTotemEmail(email) ? 'totem' : 'human'
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

export function mapTotemProfile(raw: ApiTotemProfile): TotemProfile {
  return {
    id: unwrapId(raw.id),
    hotelId: unwrapId(raw.hotelId),
    loginId: raw.loginId,
    name: raw.name,
    kind: raw.kind,
    spaceId: unwrapId(raw.spaceId) || undefined,
    roomNumber: raw.roomNumber ?? undefined,
    areaId: unwrapId(raw.areaId) || undefined,
    active: raw.active,
    brand: raw.brand ?? undefined,
  }
}

export function mapMeProfile(raw: ApiMe): MeProfile {
  const user = mapAuthUser(raw)
  return {
    ...user,
    active: user.status === 'ACTIVE',
    hotel: raw.hotel ? mapHotel(raw.hotel) : undefined,
  }
}
