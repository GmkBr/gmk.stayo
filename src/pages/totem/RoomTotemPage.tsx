import { guestForRoom, useTotemProfile } from '../../hooks/useTotemProfile.ts'
import { useTotemCatalog } from '../../hooks/useTotemCatalog.ts'
import { RoomCatalogFlow, toOrderLines } from '../../components/totem/RoomCatalogFlow.tsx'
import { categoriesForRoom } from './totemOrder.ts'
import type { CartLine } from './totemOrder.ts'
import { useApp } from '../../context/AppContext.tsx'

export function RoomTotemPage() {
  const { totem, hotel, ready } = useTotemProfile('room')
  const { addOrder, addActivity } = useApp()
  const catalog = useTotemCatalog(hotel?.id)

  if (!ready || !totem || !hotel?.id) return null

  const boundTotem = totem
  const boundHotel = hotel

  const guest =
    guestForRoom(catalog.reservations, boundTotem.roomNumber ?? '') ??
    catalog.reservations.find((item) => item.status === 'checked_in')

  const categories = categoriesForRoom(catalog.categories)
  const items = catalog.items
  const activeServices = catalog.services.filter((s) => s.active)

  function handleSubmit(lines: CartLine[], notes: string) {
    const guestName = guest?.guestName ?? 'Hóspede'
    const orderLines = toOrderLines(lines)
    void addOrder({
      hotelId: boundHotel.id,
      source: 'room',
      location: `Quarto ${boundTotem.roomNumber}`,
      guestName,
      lines: orderLines,
      totemId: boundTotem.id,
      notes: notes || undefined,
    }).then(() => {
      addActivity({
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }),
        title: 'Pedido do quarto',
        detail: `${guestName} · Quarto ${boundTotem.roomNumber}`,
        kind: 'order',
      })
    })
  }

  return (
    <RoomCatalogFlow
      brand={boundHotel.brand}
      title={boundHotel.name}
      roomNumber={boundTotem.roomNumber ?? '—'}
      guestName={guest?.guestName ?? 'Hóspede'}
      categories={categories}
      items={items}
      services={activeServices}
      orders={[]}
      onSubmit={handleSubmit}
    />
  )
}
