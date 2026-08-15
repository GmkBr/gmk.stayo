import type { Activity } from '../../types/index.ts'

export const mockActivities: Activity[] = [
  { id: 'ac-1', hotelId: 'aurora', time: '09:42', title: 'Check-in no totem', detail: 'João Silva — Quarto 203', kind: 'checkin' },
  { id: 'ac-2', hotelId: 'aurora', time: '09:35', title: 'Quarto 102 marcado como limpo', kind: 'cleaning' },
  { id: 'ac-3', hotelId: 'aurora', time: '09:21', title: 'Nova solicitação', detail: 'Ar-condicionado — Quarto 305', kind: 'request' },
  { id: 'ac-4', hotelId: 'aurora', time: '08:58', title: 'Reserva confirmada', detail: 'Maria Oliveira', kind: 'reservation' },
  { id: 'ac-5', hotelId: 'aurora', time: '08:41', title: 'Check-out realizado', detail: 'Paulo Henrique Dias — Quarto 201', kind: 'checkout' },
  { id: 'ac-6', hotelId: 'aurora', time: '08:12', title: 'Limpeza iniciada', detail: 'Quarto 206 — Juliana', kind: 'cleaning' },
  { id: 'ac-7', hotelId: 'aurora', time: '07:40', title: 'Chamado aberto', detail: 'Vazamento no box — Quarto 104', kind: 'maintenance' },
  { id: 'ac-8', hotelId: 'central', time: '10:18', title: 'Check-in realizado', detail: 'Sofia Martins — Quarto 104', kind: 'checkin' },
  { id: 'ac-9', hotelId: 'vista', time: '13:30', title: 'Check-in realizado', detail: 'Bruno Teixeira — Quarto 03', kind: 'checkin' },
]
