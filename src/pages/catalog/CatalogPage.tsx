import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useApp } from '../../context/AppContext.tsx'
import { PageHeader } from '../../components/ui/PageHeader.tsx'
import { Card } from '../../components/ui/Card.tsx'
import { Tabs } from '../../components/ui/Tabs.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { Badge } from '../../components/ui/Badge.tsx'
import { Modal } from '../../components/ui/Modal.tsx'
import { Input } from '../../components/ui/Input.tsx'
import { Select } from '../../components/ui/Select.tsx'
import { EmptyState } from '../../components/ui/EmptyState.tsx'
import { formatBRLExact } from '../../utils/format.ts'
import type { CatalogCategory, CatalogContext, CatalogItem } from '../../types/index.ts'

type TabId = 'itens' | 'servicos' | 'areas'

export function CatalogPage() {
  const {
    hotel,
    hotelCatalogCategories,
    hotelCatalogItems,
    hotelServices,
    hotelAreas,
    toggleService,
    addCatalogCategory,
    updateCatalogCategory,
    addCatalogItem,
    updateCatalogItem,
    addArea,
    updateArea,
  } = useApp()

  const [tab, setTab] = useState<TabId>('itens')
  const [itemModal, setItemModal] = useState(false)
  const [categoryModal, setCategoryModal] = useState(false)
  const [areaModal, setAreaModal] = useState(false)
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
    areaId: hotelAreas[0]?.id ?? '',
    sortOrder: '1',
  })

  const [areaDraft, setAreaDraft] = useState({ name: '', active: true })

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
      context: tab === 'itens' ? 'room' : 'area',
      areaId: hotelAreas[0]?.id ?? '',
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

  async function saveArea() {
    if (!areaDraft.name.trim()) return
    await addArea({ hotelId: hotel.id, name: areaDraft.name.trim(), active: areaDraft.active })
    setAreaModal(false)
    setAreaDraft({ name: '', active: true })
  }

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
      <PageHeader
        title="Cardápio e serviços"
        subtitle="O que os totens de quarto e área podem oferecer. Cobrança na recepção, no checkout."
      />

      <Tabs
        tabs={[
          { id: 'itens', label: 'Itens do cardápio' },
          { id: 'servicos', label: 'Serviços' },
          { id: 'areas', label: 'Áreas' },
        ]}
        value={tab}
        onChange={(id) => setTab(id as TabId)}
      />

      {tab === 'itens' && (
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] text-muted">Categorias e itens disponíveis nos totens.</p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={openNewCategory}>
                <Plus size={14} />
                Categoria
              </Button>
              <Button size="sm" onClick={openNewItem}>
                <Plus size={14} />
                Item
              </Button>
            </div>
          </div>

          {hotelCatalogCategories.length === 0 ? (
            <EmptyState title="Sem categorias" description="Crie uma categoria antes de adicionar itens." />
          ) : (
            <div className="flex flex-col gap-6">
              {hotelCatalogCategories.map((category) => {
                const catItems = hotelCatalogItems.filter((item) => item.categoryId === category.id)
                return (
                  <div key={category.id}>
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-[14px] font-semibold">{category.name}</h3>
                      <Badge tone="neutral">{contextLabel(category.context)}</Badge>
                    </div>
                    {catItems.length === 0 ? (
                      <p className="text-[12px] text-muted">Nenhum item nesta categoria.</p>
                    ) : (
                      <ul className="flex flex-col">
                        {catItems.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-0"
                          >
                            <button type="button" onClick={() => openEditItem(item)} className="min-w-0 flex-1 text-left">
                              <p className="text-[13px] font-medium">{item.name}</p>
                              <p className="text-[12px] text-muted">{item.description}</p>
                            </button>
                            <div className="flex shrink-0 items-center gap-2">
                              <span className="text-[13px] tabular-nums">
                                {item.price > 0 ? formatBRLExact(item.price) : 'Grátis'}
                              </span>
                              <Badge tone={item.available ? 'green' : 'neutral'}>
                                {item.available ? 'Ativo' : 'Indisponível'}
                              </Badge>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}

      {tab === 'servicos' && (
        <Card>
          <p className="mb-4 text-[13px] text-muted">
            Serviços extras no totem de quarto (spa, transfer, late checkout…).
          </p>
          <ul className="flex flex-col">
            {hotelServices.map((service) => (
              <li
                key={service.id}
                className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-medium">{service.name}</p>
                  <p className="text-[12px] text-muted">{service.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-[13px] tabular-nums">{formatBRLExact(service.price)}</span>
                  <Button
                    size="sm"
                    variant={service.active ? 'secondary' : 'outline'}
                    onClick={() => void toggleService(service.id)}
                  >
                    {service.active ? 'Ativo' : 'Inativo'}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'areas' && (
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-[13px] text-muted">Restaurante, spa, lobby — vinculados aos totens de área.</p>
            <Button size="sm" onClick={() => setAreaModal(true)}>
              <Plus size={14} />
              Área
            </Button>
          </div>
          <ul className="flex flex-col">
            {hotelAreas.map((area) => (
              <li key={area.id} className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0">
                <p className="text-[13px] font-medium">{area.name}</p>
                <Button
                  size="sm"
                  variant={area.active ? 'secondary' : 'outline'}
                  onClick={() => updateArea(area.id, { active: !area.active })}
                >
                  {area.active ? 'Ativa' : 'Inativa'}
                </Button>
              </li>
            ))}
          </ul>
        </Card>
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
            min="0"
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
          <label className="flex items-center gap-2 text-[13px]">
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
        title="Nova categoria"
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
            options={[
              { value: 'room', label: 'Totem de quarto' },
              { value: 'area', label: 'Totem de área' },
              { value: 'both', label: 'Ambos' },
            ]}
          />
          {categoryDraft.context === 'area' && (
            <Select
              label="Área"
              value={categoryDraft.areaId}
              onChange={(e) => setCategoryDraft((p) => ({ ...p, areaId: e.target.value }))}
              options={hotelAreas.map((area) => ({ value: area.id, label: area.name }))}
            />
          )}
        </div>
      </Modal>

      <Modal
        open={areaModal}
        onClose={() => setAreaModal(false)}
        title="Nova área"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAreaModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void saveArea()}>Salvar</Button>
          </>
        }
      >
        <Input
          label="Nome da área"
          value={areaDraft.name}
          onChange={(e) => setAreaDraft((p) => ({ ...p, name: e.target.value }))}
          placeholder="Restaurante, Spa, Lobby…"
        />
      </Modal>
    </div>
  )
}

function contextLabel(context: CatalogContext) {
  if (context === 'room') return 'Quarto'
  if (context === 'area') return 'Área'
  return 'Quarto e área'
}
