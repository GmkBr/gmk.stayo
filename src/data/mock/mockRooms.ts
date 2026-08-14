import type { Room, RoomStatus } from '../../types/index.ts'

type Seed = {
  number: string
  floor: number
  category: string
  capacity: number
  status: RoomStatus
  rate: number
  guestName?: string
  guestId?: string
  checkIn?: string
  checkOut?: string
  lastCleaned?: string
  nextReservation?: string
}

function roomsFor(hotelId: string, seeds: Seed[]): Room[] {
  return seeds.map((seed) => ({
    id: `${hotelId}-${seed.number}`,
    hotelId,
    ...seed,
  }))
}

const auroraSeeds: Seed[] = [
  { number: '101', floor: 1, category: 'Standard', capacity: 2, status: 'occupied', rate: 420, guestName: 'Carla Mendes', guestId: 'g-carla', checkIn: '2026-08-13', checkOut: '2026-08-16', lastCleaned: '2026-08-13' },
  { number: '102', floor: 1, category: 'Standard', capacity: 2, status: 'clean', rate: 420, lastCleaned: '2026-08-14', nextReservation: '2026-08-15' },
  { number: '103', floor: 1, category: 'Standard', capacity: 2, status: 'cleaning', rate: 420, lastCleaned: '2026-08-12' },
  { number: '104', floor: 1, category: 'Standard', capacity: 2, status: 'maintenance', rate: 420, lastCleaned: '2026-08-10' },
  { number: '105', floor: 1, category: 'Superior', capacity: 2, status: 'available', rate: 560, lastCleaned: '2026-08-14', nextReservation: '2026-08-16' },
  { number: '106', floor: 1, category: 'Superior', capacity: 2, status: 'occupied', rate: 560, guestName: 'Pedro Alves', guestId: 'g-pedro', checkIn: '2026-08-12', checkOut: '2026-08-15', lastCleaned: '2026-08-12' },
  { number: '107', floor: 1, category: 'Superior', capacity: 2, status: 'clean', rate: 560, lastCleaned: '2026-08-14' },
  { number: '108', floor: 1, category: 'Standard', capacity: 2, status: 'dirty', rate: 420, lastCleaned: '2026-08-13' },
  { number: '201', floor: 2, category: 'Superior', capacity: 3, status: 'occupied', rate: 620, guestName: 'Família Costa', guestId: 'g-costa', checkIn: '2026-08-11', checkOut: '2026-08-18', lastCleaned: '2026-08-14' },
  { number: '202', floor: 2, category: 'Superior', capacity: 2, status: 'dirty', rate: 560, lastCleaned: '2026-08-13' },
  { number: '203', floor: 2, category: 'Suíte Premium', capacity: 2, status: 'occupied', rate: 890, guestName: 'João Silva', guestId: 'g-joao', checkIn: '2026-08-14', checkOut: '2026-08-17', lastCleaned: '2026-08-14' },
  { number: '204', floor: 2, category: 'Suíte Premium', capacity: 2, status: 'available', rate: 890, lastCleaned: '2026-08-14' },
  { number: '205', floor: 2, category: 'Superior', capacity: 2, status: 'clean', rate: 560, lastCleaned: '2026-08-14', nextReservation: '2026-08-16' },
  { number: '206', floor: 2, category: 'Standard', capacity: 2, status: 'cleaning', rate: 420, lastCleaned: '2026-08-12' },
  { number: '207', floor: 2, category: 'Standard', capacity: 2, status: 'blocked', rate: 420, lastCleaned: '2026-08-09' },
  { number: '208', floor: 2, category: 'Chalé', capacity: 4, status: 'occupied', rate: 1120, guestName: 'Ana Beatriz Lima', guestId: 'g-ana', checkIn: '2026-08-13', checkOut: '2026-08-20', lastCleaned: '2026-08-13' },
  { number: '301', floor: 3, category: 'Chalé', capacity: 4, status: 'dirty', rate: 1120, lastCleaned: '2026-08-13' },
  { number: '302', floor: 3, category: 'Suíte Premium', capacity: 2, status: 'clean', rate: 890, lastCleaned: '2026-08-14', nextReservation: '2026-08-15' },
  { number: '303', floor: 3, category: 'Superior', capacity: 2, status: 'available', rate: 560, lastCleaned: '2026-08-14' },
  { number: '304', floor: 3, category: 'Standard', capacity: 2, status: 'occupied', rate: 420, guestName: 'Lucas Ferreira', guestId: 'g-lucas', checkIn: '2026-08-14', checkOut: '2026-08-15', lastCleaned: '2026-08-14' },
  { number: '305', floor: 3, category: 'Superior', capacity: 2, status: 'maintenance', rate: 560, lastCleaned: '2026-08-11' },
  { number: '306', floor: 3, category: 'Standard', capacity: 2, status: 'cleaning', rate: 420, lastCleaned: '2026-08-13' },
  { number: '307', floor: 3, category: 'Suíte Premium', capacity: 2, status: 'occupied', rate: 890, guestName: 'Helena Duarte', guestId: 'g-helena', checkIn: '2026-08-12', checkOut: '2026-08-16', lastCleaned: '2026-08-12' },
  { number: '308', floor: 3, category: 'Chalé', capacity: 3, status: 'available', rate: 980, lastCleaned: '2026-08-14' },
]

const centralSeeds: Seed[] = [
  { number: '101', floor: 1, category: 'Classic', capacity: 2, status: 'occupied', rate: 680, guestName: 'Rafael Nunes', guestId: 'g-rafael', checkIn: '2026-08-13', checkOut: '2026-08-15', lastCleaned: '2026-08-13' },
  { number: '102', floor: 1, category: 'Classic', capacity: 2, status: 'clean', rate: 680, lastCleaned: '2026-08-14' },
  { number: '103', floor: 1, category: 'Deluxe', capacity: 2, status: 'dirty', rate: 840, lastCleaned: '2026-08-13' },
  { number: '104', floor: 1, category: 'Deluxe', capacity: 2, status: 'occupied', rate: 840, guestName: 'Sofia Martins', guestId: 'g-sofia', checkIn: '2026-08-14', checkOut: '2026-08-17', lastCleaned: '2026-08-14' },
  { number: '201', floor: 2, category: 'Suite', capacity: 2, status: 'available', rate: 1180, lastCleaned: '2026-08-14' },
  { number: '202', floor: 2, category: 'Classic', capacity: 2, status: 'cleaning', rate: 680, lastCleaned: '2026-08-12' },
  { number: '203', floor: 2, category: 'Deluxe', capacity: 3, status: 'occupied', rate: 920, guestName: 'Thiago Lopes', guestId: 'g-thiago', checkIn: '2026-08-12', checkOut: '2026-08-16', lastCleaned: '2026-08-12' },
  { number: '204', floor: 2, category: 'Suite', capacity: 2, status: 'maintenance', rate: 1180, lastCleaned: '2026-08-10' },
]

const vistaSeeds: Seed[] = [
  { number: '01', floor: 1, category: 'Garden', capacity: 2, status: 'occupied', rate: 540, guestName: 'Camila Rocha', guestId: 'g-camila', checkIn: '2026-08-13', checkOut: '2026-08-18', lastCleaned: '2026-08-13' },
  { number: '02', floor: 1, category: 'Garden', capacity: 2, status: 'clean', rate: 540, lastCleaned: '2026-08-14' },
  { number: '03', floor: 1, category: 'Mar', capacity: 2, status: 'occupied', rate: 720, guestName: 'Bruno Teixeira', guestId: 'g-bruno', checkIn: '2026-08-14', checkOut: '2026-08-16', lastCleaned: '2026-08-14' },
  { number: '04', floor: 1, category: 'Mar', capacity: 2, status: 'dirty', rate: 720, lastCleaned: '2026-08-13' },
  { number: '05', floor: 1, category: 'Suíte Vista', capacity: 3, status: 'available', rate: 980, lastCleaned: '2026-08-14' },
  { number: '06', floor: 1, category: 'Garden', capacity: 2, status: 'cleaning', rate: 540, lastCleaned: '2026-08-12' },
]

export const mockRooms: Room[] = [
  ...roomsFor('aurora', auroraSeeds),
  ...roomsFor('central', centralSeeds),
  ...roomsFor('vista', vistaSeeds),
]
