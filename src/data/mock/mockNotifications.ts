import type { AppNotification } from '../../types/legacy.ts'

export const mockNotifications: AppNotification[] = [
  { id: 'n-1', hotelId: 'aurora', title: 'Check-in no totem', detail: 'João Silva — Quarto 203.', time: 'há 4 min', unread: true },
  { id: 'n-2', hotelId: 'aurora', title: 'Pedido novo', detail: 'Toalhas extras — Quarto 308.', time: 'há 8 min', unread: true },
  { id: 'n-3', hotelId: 'aurora', title: 'Maria Oliveira na fila', detail: 'Reserva rs-1002. Chegada prevista 14h.', time: 'há 18 min', unread: true },
  { id: 'n-4', hotelId: 'aurora', title: 'Pedido entregue', detail: 'Room service — Quarto 101.', time: 'há 28 min', unread: false },
  { id: 'n-5', hotelId: 'aurora', title: 'Pedido no restaurante', detail: 'Mesa 4 · 2 almoços.', time: 'há 1 h', unread: false },
  { id: 'n-6', hotelId: 'central', title: 'Check-in no totem', detail: 'Sofia Martins — Quarto 104.', time: 'há 2 h', unread: true },
  { id: 'n-7', hotelId: 'vista', title: 'Pedido no deck', detail: 'Dois drinks — Bruno Teixeira.', time: 'há 40 min', unread: true },
]
