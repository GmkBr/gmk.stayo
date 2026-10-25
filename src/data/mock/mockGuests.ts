import type { ConsumptionItem, Guest, GuestRequest, StayRecord } from '../../types/legacy.ts'

export const mockGuests: Guest[] = [
  { id: 'g-joao', hotelId: 'aurora', name: 'João Silva', email: 'joao.silva@email.com', phone: '(21) 98812-4402', document: '412.889.221-90', nationality: 'Brasil', status: 'staying', lastStay: '2026-08-14', stays: 4, preferences: ['Travesseiro extra', 'Andar alto', 'Café da manhã no quarto'], notes: 'Aniversário no sábado. Gosta de trilhas ao amanhecer.', vip: true },
  { id: 'g-maria', hotelId: 'aurora', name: 'Maria Oliveira', email: 'maria.oliveira@email.com', phone: '(24) 99901-2281', document: '390.112.847-33', nationality: 'Brasil', status: 'arriving', lastStay: '2026-04-02', stays: 2, preferences: ['Quarto silencioso'], notes: 'Viaja a trabalho. Check-out cedo.' },
  { id: 'g-carla', hotelId: 'aurora', name: 'Carla Mendes', email: 'carla.mendes@email.com', phone: '(11) 97654-1022', document: '221.440.918-07', nationality: 'Brasil', status: 'staying', lastStay: '2026-08-13', stays: 1, preferences: ['Cama king'], notes: '' },
  { id: 'g-pedro', hotelId: 'aurora', name: 'Pedro Alves', email: 'pedro.alves@email.com', phone: '(24) 98877-3310', document: '155.902.334-61', nationality: 'Brasil', status: 'staying', lastStay: '2026-08-12', stays: 3, preferences: ['Estacionamento coberto'], notes: 'Chegou de moto.' },
  { id: 'g-costa', hotelId: 'aurora', name: 'Família Costa', email: 'costa.familia@email.com', phone: '(32) 99120-8844', document: '088.441.229-15', nationality: 'Brasil', status: 'staying', lastStay: '2026-08-11', stays: 2, preferences: ['Berço', 'Horário flexível no jantar'], notes: 'Duas crianças, 4 e 7 anos.' },
  { id: 'g-ana', hotelId: 'aurora', name: 'Ana Beatriz Lima', email: 'ana.lima@email.com', phone: '(21) 98221-0098', document: '774.120.553-80', nationality: 'Brasil', status: 'staying', lastStay: '2026-08-13', stays: 6, preferences: ['Chalé', 'Passeio a cavalo'], notes: 'Hóspede frequente. Prefere contato por WhatsApp.', vip: true },
  { id: 'g-lucas', hotelId: 'aurora', name: 'Lucas Ferreira', email: 'lucas.ferreira@email.com', phone: '(31) 99501-6621', document: '501.228.774-19', nationality: 'Brasil', status: 'staying', lastStay: '2026-08-14', stays: 1, preferences: [], notes: 'Uma diária.' },
  { id: 'g-helena', hotelId: 'aurora', name: 'Helena Duarte', email: 'helena.duarte@email.com', phone: '(11) 98110-4477', document: '612.339.001-42', nationality: 'Portugal', status: 'staying', lastStay: '2026-08-12', stays: 1, preferences: ['Late checkout se possível'], notes: 'Fala português de Portugal.' },
  { id: 'g-ricardo', hotelId: 'aurora', name: 'Ricardo Pires', email: 'ricardo.pires@email.com', phone: '(24) 99288-1100', document: '339.221.870-55', nationality: 'Brasil', status: 'arriving', lastStay: '2026-03-22', stays: 2, preferences: ['Suíte Premium'], notes: 'Chegada prevista 15h.' },
  { id: 'g-fernanda', hotelId: 'aurora', name: 'Fernanda Souza', email: 'fernanda.souza@email.com', phone: '(19) 99773-2264', document: '228.441.009-73', nationality: 'Brasil', status: 'arriving', lastStay: '2025-12-10', stays: 3, preferences: ['Café da manhã vegano'], notes: '' },
  { id: 'g-paulo', hotelId: 'aurora', name: 'Paulo Henrique Dias', email: 'paulo.dias@email.com', phone: '(21) 98442-7781', document: '110.882.441-06', nationality: 'Brasil', status: 'departed', lastStay: '2026-08-10', stays: 5, preferences: ['Jornal impresso'], notes: 'Cliente corporativo Vale.' },
  { id: 'g-beatriz', hotelId: 'aurora', name: 'Beatriz Nogueira', email: 'beatriz.nogueira@email.com', phone: '(24) 98111-0902', document: '447.220.118-90', nationality: 'Brasil', status: 'departed', lastStay: '2026-07-28', stays: 1, preferences: [], notes: '' },
  { id: 'g-rafael', hotelId: 'central', name: 'Rafael Nunes', email: 'rafael.nunes@email.com', phone: '(21) 98800-1122', document: '201.449.330-18', nationality: 'Brasil', status: 'staying', lastStay: '2026-08-13', stays: 2, preferences: ['Andar alto'], notes: '' },
  { id: 'g-sofia', hotelId: 'central', name: 'Sofia Martins', email: 'sofia.martins@email.com', phone: '(21) 99944-2288', document: '330.118.552-41', nationality: 'Brasil', status: 'staying', lastStay: '2026-08-14', stays: 1, preferences: ['Vista para o mar'], notes: '' },
  { id: 'g-thiago', hotelId: 'central', name: 'Thiago Lopes', email: 'thiago.lopes@email.com', phone: '(11) 97600-3344', document: '918.220.441-77', nationality: 'Brasil', status: 'staying', lastStay: '2026-08-12', stays: 4, preferences: ['Academia cedo'], notes: '', vip: true },
  { id: 'g-camila', hotelId: 'vista', name: 'Camila Rocha', email: 'camila.rocha@email.com', phone: '(24) 98821-5566', document: '552.110.339-20', nationality: 'Brasil', status: 'staying', lastStay: '2026-08-13', stays: 2, preferences: ['Rede na varanda'], notes: '' },
  { id: 'g-bruno', hotelId: 'vista', name: 'Bruno Teixeira', email: 'bruno.teixeira@email.com', phone: '(11) 99102-7788', document: '102.338.441-65', nationality: 'Brasil', status: 'staying', lastStay: '2026-08-14', stays: 1, preferences: [], notes: 'Lua de mel.' },
]

export const mockStays: StayRecord[] = [
  { id: 'st-1', guestId: 'g-joao', roomNumber: '203', checkIn: '2026-08-14', checkOut: '2026-08-17', total: 2480 },
  { id: 'st-2', guestId: 'g-joao', roomNumber: '204', checkIn: '2026-03-18', checkOut: '2026-03-21', total: 2310 },
  { id: 'st-3', guestId: 'g-joao', roomNumber: '302', checkIn: '2025-11-02', checkOut: '2025-11-05', total: 2670 },
  { id: 'st-4', guestId: 'g-ana', roomNumber: '208', checkIn: '2026-08-13', checkOut: '2026-08-20', total: 7840 },
  { id: 'st-5', guestId: 'g-ana', roomNumber: '308', checkIn: '2026-01-10', checkOut: '2026-01-14', total: 3920 },
  { id: 'st-6', guestId: 'g-maria', roomNumber: '205', checkIn: '2026-08-14', checkOut: '2026-08-16', total: 980 },
  { id: 'st-7', guestId: 'g-paulo', roomNumber: '201', checkIn: '2026-08-07', checkOut: '2026-08-10', total: 1860 },
]

export const mockConsumptions: ConsumptionItem[] = [
  { id: 'c-1', guestId: 'g-joao', label: 'Room service — almoço', date: '2026-08-14', amount: 89 },
  { id: 'c-2', guestId: 'g-joao', label: 'Frigobar', date: '2026-08-14', amount: 42 },
  { id: 'c-3', guestId: 'g-ana', label: 'Passeio a cavalo', date: '2026-08-14', amount: 220 },
  { id: 'c-4', guestId: 'g-ana', label: 'Jantar no restaurante', date: '2026-08-13', amount: 186 },
  { id: 'c-5', guestId: 'g-maria', label: 'Late checkout reservado', date: '2026-08-14', amount: 80 },
]

export const mockGuestRequests: GuestRequest[] = [
  { id: 'rq-1', guestId: 'g-joao', label: 'Travesseiros extras', date: '2026-08-14', status: 'Atendida' },
  { id: 'rq-2', guestId: 'g-helena', label: 'Ar-condicionado — Quarto 305', date: '2026-08-14', status: 'Aberta' },
  { id: 'rq-3', guestId: 'g-costa', label: 'Berço no quarto', date: '2026-08-11', status: 'Atendida' },
]
