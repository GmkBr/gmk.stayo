import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useApp } from '../../../app/useApp.ts'
import { Badge } from '../../../components/ui/Badge.tsx'
import { Button } from '../../../components/ui/Button.tsx'
import { EmptyState } from '../../../components/ui/EmptyState.tsx'
import { Input } from '../../../components/ui/Input.tsx'
import { Modal } from '../../../components/ui/Modal.tsx'
import { Select } from '../../../components/ui/Select.tsx'
import { formatBRLExact } from '../../../utils/format.ts'
import type { CatalogCategory, CatalogContext, CatalogItem } from '../../../modules/catalog/model.ts'

type CatalogTab = 'items' | 'services'

const CONTEXT_OPTIONS: { value: CatalogContext; label: string }[] = [
  { value: 'room', label: 'Quarto' },
  { value: 'area', label: 'Área' },
  { value: 'both', label: 'Quarto e área' },
]

function contextLabel(context: CatalogContext) {
  return CONTEXT_OPTIONS.find((item) => item.value === context)?.label ?? context
}

export function OperationCatalogPanel() {
  const {
    hotel,
    hotelCatalogCategories,
    hotelCatalogItems,
    hotelServices,
    hotelSpaces,
    addCatalogCategory,
    updateCatalogCategory,
    addCatalogItem,
    updateCatalogItem,
    toggleService,
  } = useApp()

  const catalogAreaSpaces = useMemo(
    () => hotelSpaces.filter((space) => space.type === 'area'),
    [hotelSpaces],
  )

  const [tab, setTab] = useState<CatalogTab>('items')
  const [itemModal, setItemModal] = useState(false)
  const [categoryModal, setCategoryModal] = useState(false)
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null)
  const [editingCategory, setEditingCategory] = useState<CatalogCategory | null>(null)

  const [itemDraft, setItemDraft] = useState({
    name: '',
    description: '',
    price: '0',
    categoryId: hotelCatalogCategories[0]?.id ?? '',
    available: true,
  })

  const [categoryDraft, setCategoryDraft] = useState({
    name: '',
    context: 'room' as CatalogContext,
    areaId: catalogAreaSpaces[0]?.id ?? '',
    sortOrder: '1',
  })

  function openNewItem() {
    setEditingItem(null)
    setItemDraft({
      name: '',
      description: '',
      price: '0',
      categoryId: hotelCatalogCategories[0]?.id ?? '',
      available: true,
    })
    setItemModal(true)
  }

  function openEditItem(item: CatalogItem) {
    setEditingItem(item)
    setItemDraft({
      name: item.name,
      description: item.description,
      price: String(item.price),
      categoryId: item.categoryId,
      available: item.available,
    })
    setItemModal(true)
  }

  async function saveItem() {
    if (!itemDraft.name.trim() || !itemDraft.categoryId) return
    const payload = {
      hotelId: hotel.id,
      categoryId: itemDraft.categoryId,
      name: itemDraft.name.trim(),
      description: itemDraft.description.trim(),
      price: Number(itemDraft.price) || 0,
      available: itemDraft.available,
    }
    if (editingItem) await updateCatalogItem(editingItem.id, payload)
    else await addCatalogItem(payload)
    setItemModal(false)
  }

  function openNewCategory() {
    setEditingCategory(null)
    setCategoryDraft({
      name: '',
      context: 'room',
      areaId: catalogAreaSpaces[0]?.id ?? '',
      sortOrder: String(hotelCatalogCategories.length + 1),
    })
    setCategoryModal(true)
  }

  async function saveCategory() {
    if (!categoryDraft.name.trim()) return
    const payload = {
      hotelId: hotel.id,
      name: categoryDraft.name.trim(),
      context: categoryDraft.context,
      areaIds: categoryDraft.context === 'area' ? [categoryDraft.areaId] : undefined,
      sortOrder: Number(categoryDraft.sortOrder) || 1,
    }
    if (editingCategory) await updateCatalogCategory(editingCategory.id, payload)
    else await addCatalogCategory(payload)
    setCategoryModal(false)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 pb-4">
      <div>
        <h2 className="text-[clamp(1.35rem,4vw,1.65rem)] font-semibold tracking-[-0.03em]">Cardápio</h2>
        <p className="mt-1 text-[14px] text-muted">Itens e serviços exibidos nos totens de quarto e área.</p>
      </div>

      <div className="flex gap-2">
        <Button
          size="kiosk"
          className="flex-1"
          variant={tab === 'items' ? 'primary' : 'secondary'}
          onClick={() => setTab('items')}
        >
          Itens
        </Button>
        <Button
          size="kiosk"
          className="flex-1"
          variant={tab === 'services' ? 'primary' : 'secondary'}
          onClick={() => setTab('services')}
        >
          Serviços
        </Button>
      </div>

      {tab === 'items' && (
        <>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button size="kiosk" variant="secondary" className="flex-1" onClick={openNewCategory}>
              <Plus size={18} />
              Nova categoria
            </Button>
            <Button size="kiosk" className="flex-1" onClick={openNewItem}>
              <Plus size={18} />
              Novo item
            </Button>
          </div>

          {hotelCatalogCategories.length === 0 ? (
            <EmptyState title="Sem categorias" description="Crie uma categoria antes de adicionar itens." />
          ) : (
            <div className="flex flex-col gap-5">
              {hotelCatalogCategories.map((category) => {
                const catItems = hotelCatalogItems.filter((item) => item.categoryId === category.id)
                return (
                  <section key={category.id}>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-[16px] font-semibold">{category.name}</h3>
                      <Badge tone="neutral">{contextLabel(category.context)}</Badge>
                    </div>
                    {catItems.length === 0 ? (
                      <p className="text-[14px] text-muted">Nenhum item nesta categoria.</p>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {catItems.map((item) => (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => openEditItem(item)}
                              className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3 text-left"
                            >
                              <span className="min-w-0">
                                <span className="block text-[15px] font-medium">{item.name}</span>
                                {item.description && (
                                  <span className="mt-0.5 block truncate text-[13px] text-muted">{item.description}</span>
                                )}
                              </span>
                              <span className="flex shrink-0 flex-col items-end gap-1">
                                <span className="text-[14px] font-medium tabular-nums">
                                  {item.price > 0 ? formatBRLExact(item.price) : 'Grátis'}
                                </span>
                                <Badge tone={item.available ? 'green' : 'neutral'}>
                                  {item.available ? 'Ativo' : 'Off'}
                                </Badge>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                )
              })}
            </div>
          )}
        </>
      )}

      {tab === 'services' && (
        <>
          {hotelServices.length === 0 ? (
            <EmptyState title="Sem serviços" description="Serviços extras aparecem no totem de quarto." />
          ) : (
            <ul className="flex flex-col gap-2">
              {hotelServices.map((service) => (
                <li
                  key={service.id}
                  className="flex flex-col gap-3 rounded-xl border border-line bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium">{service.name}</p>
                    {service.description && <p className="text-[13px] text-muted">{service.description}</p>}
                    <p className="mt-1 text-[14px] tabular-nums">{formatBRLExact(service.price)}</p>
                  </div>
                  <Button
                    size="kiosk"
                    variant={service.active ? 'secondary' : 'outline'}
                    onClick={() => void toggleService(service.id)}
                  >
                    {service.active ? 'Ativo' : 'Ativar'}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <Modal
        open={itemModal}
        onClose={() => setItemModal(false)}
        title={editingItem ? 'Editar item' : 'Novo item'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setItemModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void saveItem()}>Salvar</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label="Nome" value={itemDraft.name} onChange={(e) => setItemDraft((p) => ({ ...p, name: e.target.value }))} />
          <Input
            label="Descrição"
            value={itemDraft.description}
            onChange={(e) => setItemDraft((p) => ({ ...p, description: e.target.value }))}
          />
          <Input
            label="Preço (R$)"
            type="number"
            min={0}
            step="0.01"
            value={itemDraft.price}
            onChange={(e) => setItemDraft((p) => ({ ...p, price: e.target.value }))}
          />
          <Select
            label="Categoria"
            value={itemDraft.categoryId}
            onChange={(e) => setItemDraft((p) => ({ ...p, categoryId: e.target.value }))}
            options={hotelCatalogCategories.map((cat) => ({ value: cat.id, label: cat.name }))}
          />
          <label className="flex items-center gap-2 text-[14px]">
            <input
              type="checkbox"
              checked={itemDraft.available}
              onChange={(e) => setItemDraft((p) => ({ ...p, available: e.target.checked }))}
            />
            Disponível nos totens
          </label>
        </div>
      </Modal>

      <Modal
        open={categoryModal}
        onClose={() => setCategoryModal(false)}
        title={editingCategory ? 'Editar categoria' : 'Nova categoria'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCategoryModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void saveCategory()}>Salvar</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nome"
            value={categoryDraft.name}
            onChange={(e) => setCategoryDraft((p) => ({ ...p, name: e.target.value }))}
          />
          <Select
            label="Onde aparece"
            value={categoryDraft.context}
            onChange={(e) => setCategoryDraft((p) => ({ ...p, context: e.target.value as CatalogContext }))}
            options={CONTEXT_OPTIONS}
          />
          {categoryDraft.context === 'area' && (
            <Select
              label="Área"
              value={categoryDraft.areaId}
              onChange={(e) => setCategoryDraft((p) => ({ ...p, areaId: e.target.value }))}
              options={catalogAreaSpaces.map((area) => ({ value: area.id, label: area.name }))}
            />
          )}
        </div>
      </Modal>
    </div>
  )
}
