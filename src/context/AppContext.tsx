// Compatibility facade for existing integrations. Application composition lives in src/app.
export { AppProvider } from '../app/AppProvider.tsx'
export { AppContext } from '../app/context.ts'
export { useApp, useHotelData } from '../app/useApp.ts'
export type { AddOrderInput } from '../modules/orders/model.ts'
export type { CreateReservationInput } from '../modules/reservations/api.ts'
