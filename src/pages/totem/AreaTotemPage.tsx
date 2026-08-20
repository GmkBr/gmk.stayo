import { mockHotels } from '../../data/mock/index.ts'
import { useApp } from '../../context/AppContext.tsx'
import { useTotemSession } from '../../hooks/useTotemSession.ts'
import { TotemSetup } from '../../components/totem/TotemSetup.tsx'
import { CatalogFlow, toOrderLines } from '../../components/totem/CatalogFlow.tsx'
import { categoriesForArea } from './totemOrder.ts'
import type { CartLine } from './totemOrder.ts'

export function AreaTotemPage() {
  const { totem, hotel, isBound, bind, unbind } = useTotemSession('area')
  const { areas, catalogCategories, catalogItems, addOrder, addActivity } = useApp()

  const fallbackBrand = mockHotels[0].brand

  if (!isBound || !totem || !hotel) {
    return (
      <TotemSetup
        brand={hotel?.brand ?? fallbackBrand}
        kind="area"
        onBind={(code) => {
          const result = bind(code)
          return result.ok ? { ok: true } : { ok: false, error: result.error }
        }}
      />
    )
  }

  const boundTotem = totem
  const boundHotel = hotel

  const area = areas.find((item) => item.id === boundTotem.areaId)
  const areaName = area?.name ?? boundTotem.name
  const categories = categoriesForArea(
    catalogCategories.filter((item) => item.hotelId === boundHotel.id),
    boundTotem.areaId ?? '',
  )
  const items = catalogItems.filter((item) => item.hotelId === boundHotel.id)

  function handleSubmit(lines: CartLine[], notes: string) {
    const guestName = 'Hóspede na área'
    const orderLines = toOrderLines(lines)
    addOrder({
      hotelId: boundHotel.id,
      source: 'area',
      location: areaName,
      guestName,
      lines: orderLines,
      totemId: boundTotem.id,
      notes: notes || undefined,
    })
    addActivity({
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      title: 'Pedido na área',
      detail: `${areaName}`,
      kind: 'request',
    })
  }

  return (
    <CatalogFlow
      brand={boundHotel.brand}
      contextLabel={areaName}
      greeting="Faça seu pedido"
      subtitle={`Cardápio e serviços de ${areaName}. Informe seu quarto nas observações, se quiser. Pagamento na recepção.`}
      categories={categories}
      items={items}
      onSubmit={handleSubmit}
      onUnbind={unbind}
    />
  )
}
