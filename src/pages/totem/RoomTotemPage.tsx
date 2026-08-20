import { mockHotels } from '../../data/mock/index.ts'
import { useApp } from '../../context/AppContext.tsx'
import { guestForRoom, useTotemSession } from '../../hooks/useTotemSession.ts'
import { TotemSetup } from '../../components/totem/TotemSetup.tsx'
import { RoomCatalogFlow, toOrderLines } from '../../components/totem/RoomCatalogFlow.tsx'
import { categoriesForRoom } from './totemOrder.ts'
import type { CartLine } from './totemOrder.ts'

export function RoomTotemPage() {
  const { totem, hotel, isBound, bind } = useTotemSession('room')
  const { reservations, catalogCategories, catalogItems, services, orders, addOrder, addActivity } = useApp()

  const fallbackBrand = mockHotels[0].brand

  if (!isBound || !totem || !hotel) {
    return (
      <TotemSetup
        brand={hotel?.brand ?? fallbackBrand}
        kind="room"
        onBind={(code) => {
          const result = bind(code)
          return result.ok ? { ok: true } : { ok: false, error: result.error }
        }}
      />
    )
  }

  const boundTotem = totem
  const boundHotel = hotel

  const hotelReservations = reservations.filter((item) => item.hotelId === boundHotel.id)
  const guest =
    guestForRoom(hotelReservations, boundTotem.roomNumber ?? '') ??
    hotelReservations.find((item) => item.status === 'checked_in')

  const categories = categoriesForRoom(catalogCategories.filter((item) => item.hotelId === boundHotel.id))
  const items = catalogItems.filter((item) => item.hotelId === boundHotel.id)
  const activeServices = services.filter((item) => item.hotelId === boundHotel.id && item.active)
  const roomOrders = orders.filter(
    (item) =>
      item.hotelId === boundHotel.id &&
      item.source === 'room' &&
      item.location === `Quarto ${boundTotem.roomNumber}`,
  )

  function handleSubmit(lines: CartLine[], notes: string) {
    const guestName = guest?.guestName ?? 'Hóspede'
    const orderLines = toOrderLines(lines)
    addOrder({
      hotelId: boundHotel.id,
      source: 'room',
      location: `Quarto ${boundTotem.roomNumber}`,
      guestName,
      lines: orderLines,
      totemId: boundTotem.id,
      notes: notes || undefined,
    })
    addActivity({
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      title: 'Pedido pelo quarto',
      detail: `${guestName} · Quarto ${boundTotem.roomNumber}`,
      kind: 'request',
    })
  }

  return (
    <RoomCatalogFlow
      brand={boundHotel.brand}
      roomNumber={boundTotem.roomNumber ?? '—'}
      guestName={guest?.guestName ?? 'Hóspede'}
      categories={categories}
      items={items}
      services={activeServices}
      orders={roomOrders}
      onSubmit={handleSubmit}
    />
  )
}
