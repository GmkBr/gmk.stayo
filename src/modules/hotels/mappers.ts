import type { IdBox } from '../../api/ids.ts'
import { unwrapId } from '../../api/ids.ts'
import type { Hotel, HotelBrand } from './model.ts'

export type ApiHotel = {
  id: IdBox
  slug?: string
  name: string
  city: string
  state: string
  brand: HotelBrand
  termsText?: string | null
  termsPath?: string | null
}

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
