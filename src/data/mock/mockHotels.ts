import type { Hotel } from '../../modules/hotels/model.ts'

/** Seed visual legado — a app usa hotels da API. */
export const mockHotels: Hotel[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'aurora',
    name: 'Hotel Aurora',
    city: 'Florianópolis',
    state: 'SC',
    brand: {
      primaryColor: '#0B3D5C',
      secondaryColor: '#1F6F8B',
      accentColor: '#F4A261',
      hotelName: 'Aurora',
      coverTone: 'cool',
    },
    termsText: `Check-out até 12h.
Silêncio após 22h nas áreas comuns.
Animais apenas nos chalés.
O cartão do quarto desativa após o check-out.`,
  },
]
