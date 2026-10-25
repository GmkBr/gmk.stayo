import { ApiError } from '../../api/client.ts'
import type { CreateHotelInput } from '../../modules/hotels/api.ts'
import type { Hotel } from '../../modules/hotels/model.ts'

export const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
].map((uf) => ({ value: uf, label: uf }))

export const COVER_TONES = [
  { value: 'cool', label: 'Frio' },
  { value: 'warm', label: 'Quente' },
  { value: 'neutral', label: 'Neutro' },
]

export const DEFAULT_BRAND = {
  primaryColor: '#0B3D5C',
  secondaryColor: '#1F6F8B',
  accentColor: '#F4A261',
  brandHotelName: '',
  coverTone: 'cool',
}

export const DEFAULT_TERMS_EXAMPLE = `Check-out até 12h.
Silêncio após 22h nas áreas comuns.
O cartão do quarto desativa após o check-out.`

export type HotelDraft = {
  name: string
  city: string
  state: string
  termsText: string
  termsPath: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  brandHotelName: string
  coverTone: string
}

export type DraftToInputOptions = {
  /** No PUT: envia "" para limpar termos vazios em vez de omitir o campo. */
  persistEmptyTerms?: boolean
}

export function emptyDraft(): HotelDraft {
  return {
    name: '',
    city: '',
    state: '',
    termsText: '',
    termsPath: '',
    ...DEFAULT_BRAND,
  }
}

export function draftFromHotel(hotel: Hotel): HotelDraft {
  return {
    name: hotel.name,
    city: hotel.city,
    state: hotel.state || 'SC',
    termsText: hotel.termsText ?? '',
    termsPath: hotel.termsPath ?? '',
    primaryColor: hotel.brand.primaryColor || DEFAULT_BRAND.primaryColor,
    secondaryColor: hotel.brand.secondaryColor || DEFAULT_BRAND.secondaryColor,
    accentColor: hotel.brand.accentColor || DEFAULT_BRAND.accentColor,
    brandHotelName: hotel.brand.hotelName || '',
    coverTone: hotel.brand.coverTone || 'cool',
  }
}

export function draftToInput(draft: HotelDraft, options?: DraftToInputOptions): CreateHotelInput {
  const body: CreateHotelInput = {
    name: draft.name.trim(),
    city: draft.city.trim(),
    state: draft.state.trim().toUpperCase(),
  }

  const termsText = draft.termsText.trim()
  const termsPath = draft.termsPath.trim()
  if (options?.persistEmptyTerms) {
    body.termsText = termsText
    body.termsPath = termsPath
  } else {
    if (termsText) body.termsText = termsText
    if (termsPath) body.termsPath = termsPath
  }

  if (draft.primaryColor.trim()) body.primaryColor = normalizeHexColor(draft.primaryColor, DEFAULT_BRAND.primaryColor)
  if (draft.secondaryColor.trim()) body.secondaryColor = normalizeHexColor(draft.secondaryColor, DEFAULT_BRAND.secondaryColor)
  if (draft.accentColor.trim()) body.accentColor = normalizeHexColor(draft.accentColor, DEFAULT_BRAND.accentColor)
  if (draft.brandHotelName.trim()) body.brandHotelName = draft.brandHotelName.trim()
  if (draft.coverTone.trim()) body.coverTone = draft.coverTone.trim()
  return body
}

export function termsLinesFromText(text: string | undefined): string[] {
  if (!text?.trim()) return []
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
}

export function messageFromHotelError(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    if (err.status === 403) return 'Sem permissão. Apenas dono ou ADMIN do hotel pode fazer isso.'
    if (err.status === 401) return 'Sessão expirada. Entre novamente.'
    return err.message || fallback
  }
  if (err instanceof Error) return err.message
  return fallback
}

const HEX_COLOR = /^#?[0-9A-Fa-f]{6}$/

export function normalizeHexColor(value: string, fallback: string): string {
  const trimmed = value.trim()
  if (!HEX_COLOR.test(trimmed)) return fallback
  const hex = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
  return hex.toUpperCase()
}

export function previewGradient(primary: string, secondary: string, coverTone: string): string {
  const p = normalizeHexColor(primary, DEFAULT_BRAND.primaryColor)
  const s = normalizeHexColor(secondary, DEFAULT_BRAND.secondaryColor)
  if (coverTone === 'warm') {
    return `linear-gradient(145deg, ${p} 0%, color-mix(in srgb, ${s} 68%, #C4845C) 100%)`
  }
  if (coverTone === 'neutral') {
    return `linear-gradient(145deg, color-mix(in srgb, ${p} 82%, #6B7280) 0%, color-mix(in srgb, ${s} 82%, #9CA3AF) 100%)`
  }
  return `linear-gradient(145deg, ${p} 0%, color-mix(in srgb, ${s} 72%, #5B9BD5) 100%)`
}

export const UF_OPTIONS_WITH_PLACEHOLDER = [{ value: '', label: 'Selecione a UF' }, ...UF_OPTIONS]
