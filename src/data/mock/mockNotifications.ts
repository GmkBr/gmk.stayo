import type { AppNotification } from '../../types/index.ts'

export const mockNotifications: AppNotification[] = [
  { id: 'n-1', hotelId: 'aurora', title: '3 novas solicitações', detail: 'Hóspedes aguardando retorno da recepção.', time: 'há 4 min', unread: true },
  { id: 'n-2', hotelId: 'aurora', title: 'Quarto 203 — manutenção', detail: 'TV já resolvida. Ar-condicionado no 305 segue aberto.', time: 'há 12 min', unread: true },
  { id: 'n-3', hotelId: 'aurora', title: 'Reserva chegando em 30 minutos', detail: 'Maria Oliveira — Quarto 105.', time: 'há 18 min', unread: true },
  { id: 'n-4', hotelId: 'aurora', title: 'Quarto 102 pronto', detail: 'Governança concluiu a limpeza.', time: 'há 28 min', unread: false },
  { id: 'n-5', hotelId: 'aurora', title: 'Check-out atrasado', detail: 'Pedro Alves — Quarto 106, previsto 12h.', time: 'há 1 h', unread: false },
  { id: 'n-6', hotelId: 'central', title: 'Ocupação do fim de semana', detail: 'Sábado já em 88%.', time: 'há 2 h', unread: true },
  { id: 'n-7', hotelId: 'vista', title: 'Lua de mel no 03', detail: 'Mesa no jantar reservada às 20h.', time: 'há 40 min', unread: true },
]
