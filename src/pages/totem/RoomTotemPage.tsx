import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.tsx'
import { useTotemSpaceBinding } from '../../hooks/useTotemSpaceBinding.ts'
import { useTotemCatalog } from '../../hooks/useTotemCatalog.ts'
import { useActiveStay } from '../../hooks/useActiveStay.ts'
import { RoomCatalogFlow, toOrderLines } from '../../components/totem/RoomCatalogFlow.tsx'
import { categoriesForRoom } from './totemOrder.ts'
import type { CartLine } from './totemOrder.ts'
import { useApp } from '../../app/useApp.ts'
import { TotemSpaceSetup } from './TotemSpaceSetup.tsx'
import { useTotemProfile } from '../../hooks/useTotemProfile.ts'

export function RoomTotemPage() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { ready: profileReady } = useTotemProfile('room')
  const { totem, hotel, binding, needsSetup, confirmBinding, clearBinding, resolving, isDedicated } =
    useTotemSpaceBinding('room')
  const { addOrder, addActivity } = useApp()
  const catalog = useTotemCatalog(hotel?.id)

  if (!profileReady || resolving) {
    return (
      <div className="totem-shell flex min-h-svh items-center justify-center text-[15px] text-muted">
        Carregando totem…
      </div>
    )
  }

  if (!totem || !hotel?.id) return null

  if (needsSetup) {
    return (
      <TotemSpaceSetup kind="room" hotel={hotel} brand={hotel.brand} onSelect={confirmBinding} />
    )
  }

  if (!totem || !hotel?.id || !binding) return null

  return (
    <RoomTotemContent
      totem={totem}
      hotel={hotel}
      binding={binding}
      catalog={catalog}
      addOrder={addOrder}
      addActivity={addActivity}
      onChangeSpace={isDedicated ? undefined : clearBinding}
      onStaffSignOut={() => {
        void signOut().then(() => navigate('/login', { replace: true }))
      }}
    />
  )
}

type RoomTotemContentProps = {
  totem: NonNullable<ReturnType<typeof useTotemSpaceBinding>['totem']>
  hotel: NonNullable<ReturnType<typeof useTotemSpaceBinding>['hotel']>
  binding: NonNullable<ReturnType<typeof useTotemSpaceBinding>['binding']>
  catalog: ReturnType<typeof useTotemCatalog>
  addOrder: ReturnType<typeof useApp>['addOrder']
  addActivity: ReturnType<typeof useApp>['addActivity']
  onChangeSpace?: () => void
  onStaffSignOut: () => void
}

function RoomTotemContent({
  totem,
  hotel,
  binding,
  catalog,
  addOrder,
  addActivity,
  onChangeSpace,
  onStaffSignOut,
}: RoomTotemContentProps) {
  const roomNumber = binding.spaceNumber ?? binding.spaceName
  const { account, orders, loading: stayLoading, reload } = useActiveStay(hotel.id, binding.spaceId)
  const guestName = account?.stay.guestName ?? 'Hóspede'
  const orderingBlocked = stayLoading || !account

  const categories = categoriesForRoom(catalog.categories)
  const items = catalog.items
  const activeServices = catalog.services.filter((s) => s.active)

  async function handleSubmit(lines: CartLine[], notes: string) {
    if (orderingBlocked) throw new Error('Faça check-in na recepção antes de pedir pelo quarto.')

    const orderLines = toOrderLines(lines)
    await addOrder({
      hotelId: hotel.id,
      source: 'room',
      location: `Quarto ${roomNumber}`,
      guestName,
      lines: orderLines,
      totemId: totem.id,
      spaceId: binding.spaceId,
      notes: notes || undefined,
    })
    addActivity({
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }),
      title: 'Pedido do quarto',
      detail: `${guestName} · Quarto ${roomNumber}`,
      kind: 'order',
    })
    void reload()
  }

  return (
    <RoomCatalogFlow
      brand={hotel.brand}
      title={hotel.name}
      roomNumber={roomNumber}
      guestName={guestName}
      categories={categories}
      items={items}
      services={activeServices}
      orders={orders}
      stayAccount={account}
      orderingBlocked={orderingBlocked}
      onSubmit={handleSubmit}
      onChangeSpace={onChangeSpace}
      onStaffSignOut={onStaffSignOut}
    />
  )
}
