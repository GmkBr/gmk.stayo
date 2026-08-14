import type { HousekeepingTask } from '../../types/index.ts'

export const mockHousekeeping: HousekeepingTask[] = [
  { id: 'hk-1', hotelId: 'aurora', roomId: 'aurora-203', roomNumber: '203', reason: 'checkout', priority: 'high', assignee: 'Ana', status: 'waiting' },
  { id: 'hk-2', hotelId: 'aurora', roomId: 'aurora-108', roomNumber: '108', reason: 'checkout', priority: 'high', assignee: 'Ana', status: 'waiting' },
  { id: 'hk-3', hotelId: 'aurora', roomId: 'aurora-202', roomNumber: '202', reason: 'checkout', priority: 'medium', assignee: 'Rafaela', status: 'waiting' },
  { id: 'hk-4', hotelId: 'aurora', roomId: 'aurora-301', roomNumber: '301', reason: 'checkout', priority: 'medium', assignee: 'Rafaela', status: 'waiting' },
  { id: 'hk-5', hotelId: 'aurora', roomId: 'aurora-103', roomNumber: '103', reason: 'stayover', priority: 'medium', assignee: 'Juliana', status: 'in_progress' },
  { id: 'hk-6', hotelId: 'aurora', roomId: 'aurora-206', roomNumber: '206', reason: 'checkout', priority: 'high', assignee: 'Juliana', status: 'in_progress' },
  { id: 'hk-7', hotelId: 'aurora', roomId: 'aurora-306', roomNumber: '306', reason: 'stayover', priority: 'low', assignee: 'Carla', status: 'in_progress' },
  { id: 'hk-8', hotelId: 'aurora', roomId: 'aurora-102', roomNumber: '102', reason: 'stayover', priority: 'low', assignee: 'Ana', status: 'done' },
  { id: 'hk-9', hotelId: 'aurora', roomId: 'aurora-107', roomNumber: '107', reason: 'checkout', priority: 'medium', assignee: 'Rafaela', status: 'done' },
  { id: 'hk-10', hotelId: 'aurora', roomId: 'aurora-302', roomNumber: '302', reason: 'deep', priority: 'low', assignee: 'Carla', status: 'done' },
  { id: 'hk-11', hotelId: 'aurora', roomId: 'aurora-207', roomNumber: '207', reason: 'blocked', priority: 'low', assignee: '—', status: 'waiting' },
  { id: 'hk-12', hotelId: 'aurora', roomId: 'aurora-105', roomNumber: '105', reason: 'stayover', priority: 'low', assignee: 'Juliana', status: 'done' },
  { id: 'hk-13', hotelId: 'central', roomId: 'central-103', roomNumber: '103', reason: 'checkout', priority: 'high', assignee: 'Lívia', status: 'waiting' },
  { id: 'hk-14', hotelId: 'central', roomId: 'central-202', roomNumber: '202', reason: 'stayover', priority: 'medium', assignee: 'Lívia', status: 'in_progress' },
  { id: 'hk-15', hotelId: 'vista', roomId: 'vista-04', roomNumber: '04', reason: 'checkout', priority: 'high', assignee: 'Marina', status: 'waiting' },
  { id: 'hk-16', hotelId: 'vista', roomId: 'vista-06', roomNumber: '06', reason: 'stayover', priority: 'medium', assignee: 'Marina', status: 'in_progress' },
]
