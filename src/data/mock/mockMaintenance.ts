import type { MaintenanceRequest } from '../../types/legacy.ts'

export const mockMaintenance: MaintenanceRequest[] = [
  { id: 'mt-1', hotelId: 'aurora', code: '1842', title: 'Ar-condicionado', roomNumber: '305', priority: 'high', status: 'open', openedAt: '2026-08-14 09:21', notes: 'Não gela. Hóspede no 307 relatou ruído no corredor, mas o chamado é do 305 (vazio).' },
  { id: 'mt-2', hotelId: 'aurora', code: '1841', title: 'Vazamento no box', roomNumber: '104', priority: 'high', status: 'in_progress', openedAt: '2026-08-14 07:40', notes: 'Técnico a caminho. Quarto bloqueado.' },
  { id: 'mt-3', hotelId: 'aurora', code: '1838', title: 'Lâmpada da cabeceira', roomNumber: '201', priority: 'low', status: 'open', openedAt: '2026-08-13 21:12', notes: 'Troca simples. Pode esperar o stayover.' },
  { id: 'mt-4', hotelId: 'aurora', code: '1834', title: 'Fechadura eletrônica', roomNumber: '207', priority: 'medium', status: 'in_progress', openedAt: '2026-08-13 11:05', notes: 'Cartão não lê. Quarto bloqueado até teste.' },
  { id: 'mt-5', hotelId: 'aurora', code: '1829', title: 'Torneira da pia', roomNumber: '108', priority: 'medium', status: 'resolved', openedAt: '2026-08-12 16:44', notes: 'Reparo concluído ontem.' },
  { id: 'mt-6', hotelId: 'aurora', code: '1822', title: 'TV sem sinal', roomNumber: '203', priority: 'low', status: 'resolved', openedAt: '2026-08-11 19:02', notes: 'Reset do decoder.' },
  { id: 'mt-7', hotelId: 'central', code: '910', title: 'Ar-condicionado', roomNumber: '204', priority: 'high', status: 'open', openedAt: '2026-08-14 08:12', notes: 'Unidade externa.' },
  { id: 'mt-8', hotelId: 'vista', code: '118', title: 'Chuveiro', roomNumber: '05', priority: 'medium', status: 'open', openedAt: '2026-08-13 18:30', notes: 'Pressão baixa.' },
]
