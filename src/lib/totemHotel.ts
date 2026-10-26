import type { Hotel, HotelBrand } from '../modules/hotels/model.ts'
import type { TotemProfile } from '../modules/devices/model.ts'
import { normalizeTotemBrand } from './totemBrand.ts'

const DEFAULT_BRAND: HotelBrand = {
  primaryColor: '#0B3D5C',
  secondaryColor: '#1F6F8B',
  accentColor: '#F4A261',
  hotelName: 'STAYO',
  coverTone: 'cool',
}

/** Hotel mínimo quando o totem ainda não tem brand do backend. */
export function fallbackHotelForTotem(totem: TotemProfile): Hotel {
  return {
    id: totem.hotelId,
    slug: '',
    name: totem.name,
    city: '',
    state: '',
    brand: {
      ...DEFAULT_BRAND,
      hotelName: totem.brand?.hotelName ?? totem.name,
    },
  }
}

/**
 * Monta o contexto de hotel do totem a partir do /me ou login.
 * Usa `totem.brand` quando presente — sem GET /hotels/{id}.
 */
export function hotelFromTotem(totem: TotemProfile, embedded?: Hotel | null): Hotel {
  if (embedded?.id) return embedded

  if (totem.brand) {
    const brand = normalizeTotemBrand(totem.brand, totem.name)
    return {
      id: totem.hotelId,
      slug: '',
      name: brand.hotelName || totem.name,
      city: '',
      state: '',
      brand,
    }
  }

  return fallbackHotelForTotem(totem)
}
