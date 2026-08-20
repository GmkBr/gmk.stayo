import type { Totem } from '../../types/index.ts'

export const mockTotems: Totem[] = [
  {
    id: 'tm-q203',
    hotelId: 'aurora',
    code: 'Q203-AUR',
    name: 'Quarto 203',
    kind: 'room',
    roomNumber: '203',
    active: true,
  },
  {
    id: 'tm-q308',
    hotelId: 'aurora',
    code: 'Q308-AUR',
    name: 'Quarto 308',
    kind: 'room',
    roomNumber: '308',
    active: true,
  },
  {
    id: 'tm-rst',
    hotelId: 'aurora',
    code: 'RST-AUR',
    name: 'Restaurante',
    kind: 'area',
    areaId: 'ar-rst',
    active: true,
  },
  {
    id: 'tm-spa',
    hotelId: 'aurora',
    code: 'SPA-AUR',
    name: 'Spa',
    kind: 'area',
    areaId: 'ar-spa',
    active: true,
  },
  {
    id: 'tm-q104',
    hotelId: 'central',
    code: 'Q104-CEN',
    name: 'Quarto 104',
    kind: 'room',
    roomNumber: '104',
    active: true,
  },
]
