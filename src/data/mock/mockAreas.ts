import type { HotelArea } from '../../modules/catalog/model.ts'

export const mockAreas: HotelArea[] = [
  { id: 'ar-rst', hotelId: 'aurora', name: 'Restaurante', active: true },
  { id: 'ar-spa', hotelId: 'aurora', name: 'Spa', active: true },
  { id: 'ar-lob', hotelId: 'aurora', name: 'Lobby', active: true },
  { id: 'ar-rst-c', hotelId: 'central', name: 'Restaurante', active: true },
  { id: 'ar-deck', hotelId: 'vista', name: 'Deck', active: true },
]
