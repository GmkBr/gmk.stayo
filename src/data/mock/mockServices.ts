import type { Service } from '../../types/index.ts'

export const mockServices: Service[] = [
  { id: 'sv-1', hotelId: 'aurora', name: 'Room Service', description: 'Cardápio do restaurante servido no quarto, das 7h às 23h.', price: 89, active: true, tone: '#efe7d8', icon: 'tray' },
  { id: 'sv-2', hotelId: 'aurora', name: 'Spa', description: 'Massagem relaxante de 50 minutos com vista para o pasto.', price: 180, active: true, tone: '#e4ebe3', icon: 'spa' },
  { id: 'sv-3', hotelId: 'aurora', name: 'Late Checkout', description: 'Permanência no quarto até 15h, sujeito a disponibilidade.', price: 80, active: true, tone: '#e8eaf0', icon: 'clock' },
  { id: 'sv-4', hotelId: 'aurora', name: 'Transfer', description: 'Traslado Resende × hotel, ida ou volta, até 4 pessoas.', price: 150, active: true, tone: '#ece6dc', icon: 'car' },
  { id: 'sv-5', hotelId: 'aurora', name: 'Passeio', description: 'Trilha guiada ou passeio a cavalo no final da tarde.', price: 220, active: true, tone: '#e7eee6', icon: 'map' },
  { id: 'sv-6', hotelId: 'aurora', name: 'Jantar no campo', description: 'Mesa para dois no jardim, com menu da casa.', price: 260, active: true, tone: '#f0e6dc', icon: 'wine' },
  { id: 'sv-7', hotelId: 'aurora', name: 'Bike nas trilhas', description: 'Aluguel de bicicleta por meio período, com capacete.', price: 60, active: false, tone: '#e6ece8', icon: 'bike' },
  { id: 'sv-8', hotelId: 'aurora', name: 'Early Check-in', description: 'Entrada a partir das 10h, se o quarto estiver pronto.', price: 70, active: true, tone: '#e9edf4', icon: 'key' },
  { id: 'sv-9', hotelId: 'central', name: 'Room Service', description: 'Cardápio 24h no quarto.', price: 75, active: true, tone: '#e8eaf0', icon: 'tray' },
  { id: 'sv-10', hotelId: 'vista', name: 'Passeio de barco', description: 'Saída pela manhã na baía, 3 horas.', price: 280, active: true, tone: '#dce9ee', icon: 'map' },
]
