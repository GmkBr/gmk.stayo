import { useTotemProfile } from '../../hooks/useTotemProfile.ts'
import { useTotemSpaceBinding } from '../../hooks/useTotemSpaceBinding.ts'
import { useTotemCatalog } from '../../hooks/useTotemCatalog.ts'
import { CatalogFlow, toOrderLines } from '../../components/totem/CatalogFlow.tsx'
import { categoriesForArea } from './totemOrder.ts'
import type { CartLine } from './totemOrder.ts'
import { useApp } from '../../app/useApp.ts'
import { TotemSpaceSetup } from './TotemSpaceSetup.tsx'

export function AreaTotemPage() {
  const { ready: profileReady } = useTotemProfile('area')
  const { totem, hotel, binding, needsSetup, confirmBinding, clearBinding, resolving, isDedicated } =
    useTotemSpaceBinding('area')
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
      <TotemSpaceSetup kind="area" hotel={hotel} brand={hotel.brand} onSelect={confirmBinding} />
    )
  }

  if (!totem || !hotel?.id || !binding) return null

  const activeTotem = totem
  const activeHotel = hotel
  const activeBinding = binding
  const areaName = activeBinding.spaceName
  const categories = categoriesForArea(catalog.categories, activeBinding.spaceId)
  const items = catalog.items

  async function handleSubmit(lines: CartLine[], notes: string) {
    const guestName = 'Hóspede na área'
    const orderLines = toOrderLines(lines)
    await addOrder({
      hotelId: activeHotel.id,
      source: 'area',
      location: areaName,
      guestName,
      lines: orderLines,
      totemId: activeTotem.id,
      spaceId: activeBinding.spaceId,
      notes: notes || undefined,
    })
    addActivity({
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      title: 'Pedido na área',
      detail: areaName,
      kind: 'order',
    })
  }

  return (
    <CatalogFlow
      brand={activeHotel.brand}
      title={activeHotel.name}
      contextLabel={areaName}
      greeting="Faça seu pedido"
      subtitle={`Cardápio e serviços de ${areaName}. Informe seu quarto nas observações, se quiser. Pagamento na recepção.`}
      categories={categories}
      items={items}
      onSubmit={handleSubmit}
      onChangeSpace={isDedicated ? undefined : clearBinding}
      changeSpaceLabel="Trocar área"
    />
  )
}
