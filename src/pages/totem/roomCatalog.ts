import {
  BellRing,
  ClipboardList,
  Flower2,
  LayoutGrid,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import type { CatalogCategory, CatalogItem } from '../../types/index.ts'

export const ROOM_IDLE_MS = 180_000
export const ROOM_PAYMENT_NOTE = 'Valor na conta do quarto. Paga no checkout da recepção.'

export type RoomShortcut = {
  id: string
  label: string
  hint: string
  icon: LucideIcon
  categoryId?: string
  showServices?: boolean
  showOrders?: boolean
}

export const ROOM_SHORTCUTS: RoomShortcut[] = [
  {
    id: 'eat',
    label: 'Alimentos',
    hint: 'Servido no quarto',
    icon: UtensilsCrossed,
    categoryId: 'cat-rs',
  },
  {
    id: 'orders',
    label: 'Meus pedidos',
    hint: 'Acompanhe o andamento',
    icon: ClipboardList,
    showOrders: true,
  },
  {
    id: 'spa',
    label: 'Spa e extras',
    hint: 'Serviços do hotel',
    icon: Flower2,
    showServices: true,
  },
  {
    id: 'all',
    label: 'Cardápio',
    hint: 'Ver tudo',
    icon: LayoutGrid,
  },
]

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'cat-rs': UtensilsCrossed,
  'cat-sol': BellRing,
  'cat-rs-c': UtensilsCrossed,
}

export function iconForCategory(categoryId: string) {
  return CATEGORY_ICONS[categoryId] ?? LayoutGrid
}

export function deliveryHint(category: CatalogCategory | undefined, price: number) {
  if (!category) return price > 0 ? '~25 min' : 'Imediato'
  if (category.name.toLowerCase().includes('confort')) return 'Imediato'
  if (price === 0) return 'Imediato'
  return '~25 min'
}

export function featuredItems(items: CatalogItem[], categories: CatalogCategory[], limit = 4) {
  const roomCategoryIds = new Set(categories.map((item) => item.id))
  return items.filter((item) => roomCategoryIds.has(item.categoryId)).slice(0, limit)
}

export function categorySubtitle(category: CatalogCategory | undefined) {
  if (!category) return ''
  if (category.name.toLowerCase().includes('room') || category.name.toLowerCase().includes('aliment'))
    return 'Servido no seu quarto'
  if (category.name.toLowerCase().includes('confort')) return 'Toalhas, extras e itens imediatos'
  return 'Disponível agora'
}

export function qtyInCart(cart: { key: string; qty: number }[], itemId: string) {
  return cart.find((line) => line.key === `ci-${itemId}`)?.qty ?? 0
}
