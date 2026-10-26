import type { AddOrderInput } from '../modules/orders/model.ts'
import type { CreateReservationInput } from '../modules/reservations/api.ts'
import { createContext } from 'react'
import * as identityApi from '../modules/identity/api.ts'
import * as hotelsApi from '../modules/hotels/api.ts'
import * as activityApi from '../modules/activity/api.ts'
import * as devicesApi from '../modules/devices/api.ts'
import * as spacesApi from '../modules/spaces/api.ts'
import * as journeysApi from '../modules/journeys/api.ts'
import type { Activity } from '../modules/activity/model.ts'
import type { CatalogCategory, CatalogItem, HotelArea, Service } from '../modules/catalog/model.ts'
import type { CurrentUser } from '../modules/identity/model.ts'
import type { Hotel } from '../modules/hotels/model.ts'
import type { Order, OrderStatus } from '../modules/orders/model.ts'
import type { Reservation, ReservationStatus } from '../modules/reservations/model.ts'
import type { Room, Space } from '../modules/spaces/model.ts'
import type { Totem } from '../modules/devices/model.ts'
import type { CheckoutStatement } from '../modules/journeys/model.ts'

export type AppContextValue = {
  bootstrapping: boolean
  bootstrapError: string | null
  refreshing: boolean
  profile: identityApi.MeProfile | null
  user: CurrentUser
  hotels: Hotel[]
  hotelId: string
  hotel: Hotel
  setHotelId: (id: string) => void
  createHotel: (input: hotelsApi.CreateHotelInput) => Promise<Hotel>
  updateHotel: (id: string, input: hotelsApi.UpdateHotelInput) => Promise<Hotel>
  deleteHotel: (id: string) => Promise<void>
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  mobileNavOpen: boolean
  setMobileNavOpen: (open: boolean) => void
  reloadHotelData: () => Promise<void>
  retryBootstrap: () => Promise<void>
  reservations: Reservation[]
  orders: Order[]
  totems: Totem[]
  areas: HotelArea[]
  spaces: Space[]
  catalogCategories: CatalogCategory[]
  catalogItems: CatalogItem[]
  services: Service[]
  activities: Activity[]
  hotelReservations: Reservation[]
  hotelOrders: Order[]
  hotelTotems: Totem[]
  hotelAreas: HotelArea[]
  hotelSpaces: Space[]
  hotelCatalogCategories: CatalogCategory[]
  hotelCatalogItems: CatalogItem[]
  hotelServices: Service[]
  hotelActivities: Activity[]
  hotelRooms: Room[]
  queueSummary: activityApi.QueueSummary | null
  confirmReservation: (id: string) => Promise<Reservation>
  cancelReservation: (id: string) => Promise<Reservation>
  createReservation: (input: CreateReservationInput) => Promise<Reservation>
  addReservation: (reservation: Reservation) => void
  updateReservationStatus: (id: string, status: ReservationStatus) => Promise<void>
  addOrder: (input: AddOrderInput) => Promise<Order>
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<Order>
  addTotem: (input: devicesApi.CreateTotemInput) => Promise<Totem>
  updateTotem: (id: string, patch: Partial<Omit<Totem, 'id' | 'hotelId' | 'loginId' | 'userId'>>) => Promise<void>
  resetTotemPassword: (id: string, password: string) => Promise<void>
  addSpace: (input: spacesApi.CreateSpaceInput) => Promise<Space>
  updateSpace: (id: string, patch: spacesApi.UpdateSpaceInput) => Promise<Space>
  deleteSpace: (id: string) => Promise<void>
  addArea: (area: Omit<HotelArea, 'id'>) => Promise<HotelArea>
  updateArea: (id: string, patch: Partial<Omit<HotelArea, 'id' | 'hotelId'>>) => Promise<void>
  addCatalogCategory: (category: Omit<CatalogCategory, 'id'>) => Promise<CatalogCategory>
  updateCatalogCategory: (id: string, patch: Partial<Omit<CatalogCategory, 'id' | 'hotelId'>>) => Promise<void>
  addCatalogItem: (item: Omit<CatalogItem, 'id'>) => Promise<CatalogItem>
  updateCatalogItem: (id: string, patch: Partial<Omit<CatalogItem, 'id' | 'hotelId'>>) => Promise<void>
  toggleService: (id: string) => Promise<void>
  updateService: (id: string, patch: Partial<Pick<Service, 'name' | 'description' | 'price' | 'active'>>) => Promise<void>
  addActivity: (activity: Omit<Activity, 'id' | 'hotelId'>) => void
  completeCheckin: (reservationId: string) => Promise<Reservation>
  validateCheckin: (reservationId: string) => Promise<Reservation>
  searchCheckin: (query: string) => Promise<Reservation[]>
  validateCheckout: (reservationId: string) => Promise<CheckoutStatement>
  completeCheckout: (reservationId: string, input: journeysApi.CheckoutCompleteInput) => Promise<Reservation>
  searchCheckout: (query: string) => Promise<Reservation[]>
}

export const AppContext = createContext<AppContextValue | null>(null)
