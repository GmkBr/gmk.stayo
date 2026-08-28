import { useAuth } from '../../auth/AuthContext.tsx'
import { useTotemProfile } from '../../hooks/useTotemProfile.ts'
import { useTotemCatalog } from '../../hooks/useTotemCatalog.ts'
import { CatalogFlow, toOrderLines } from '../../components/totem/CatalogFlow.tsx'
import { categoriesForArea } from './totemOrder.ts'
import type { CartLine } from './totemOrder.ts'
import { useApp } from '../../context/AppContext.tsx'

export function AreaTotemPage() {
  const { totem, hotel, ready } = useTotemProfile('area')
  const { addOrder, addActivity } = useApp()
  const { signOut } = useAuth()
  const catalog = useTotemCatalog(hotel?.id)

  if (!ready || !totem || !hotel?.id) return null

  const boundTotem = totem
  const boundHotel = hotel

  const area = catalog.areas.find((item) => item.id === boundTotem.areaId)
  const areaName = area?.name ?? boundTotem.name
  const categories = categoriesForArea(catalog.categories, boundTotem.areaId ?? '')
  const items = catalog.items

  function handleSubmit(lines: CartLine[], notes: string) {
    const guestName = 'Hóspede na área'
    const orderLines = toOrderLines(lines)
    void addOrder({
      hotelId: boundHotel.id,
      source: 'area',
      location: areaName,
      guestName,
      lines: orderLines,
      totemId: boundTotem.id,
      notes: notes || undefined,
    }).then(() => {
      addActivity({
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        title: 'Pedido na área',
        detail: areaName,
        kind: 'order',
      })
    })
  }

  return (
    <CatalogFlow
      brand={boundHotel.brand}
      title={boundHotel.name}
      contextLabel={areaName}
      greeting="Faça seu pedido"
      subtitle={`Cardápio e serviços de ${areaName}. Informe seu quarto nas observações, se quiser. Pagamento na recepção.`}
      categories={categories}
      items={items}
      onSubmit={handleSubmit}
      onUnbind={() => void signOut()}
    />
  )
}
