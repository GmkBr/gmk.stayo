import type { IdBox } from '../../api/ids.ts'
import { unwrapId, unwrapIdList } from '../../api/ids.ts'
import type { CatalogCategory, CatalogItem, HotelArea, Service } from './model.ts'

export type ApiCategory = {
  id: IdBox
  hotelId: IdBox
  name: string
  context: CatalogCategory['context']
  areaIds?: IdBox[] | null
  sortOrder: number
}

export type ApiItem = {
  id: IdBox
  hotelId: IdBox
  categoryId: IdBox
  name: string
  description?: string | null
  price: number
  available: boolean
  imagePath?: string | null
}

export type ApiService = {
  id: IdBox
  hotelId: IdBox
  name: string
  description?: string | null
  price: number
  active: boolean
  icon?: string | null
  tone?: string | null
}

export type ApiArea = {
  id: IdBox
  hotelId: IdBox
  name: string
  active: boolean
}

export const SERVICE_ICONS = new Set(['tray', 'spa', 'clock', 'car', 'map', 'wine', 'bike', 'key'])

export function mapCategory(raw: ApiCategory): CatalogCategory {
  return {
    id: unwrapId(raw.id),
    hotelId: unwrapId(raw.hotelId),
    name: raw.name,
    context: raw.context,
    areaIds: unwrapIdList(raw.areaIds),
    sortOrder: raw.sortOrder,
  }
}

export function mapItem(raw: ApiItem): CatalogItem {
  return {
    id: unwrapId(raw.id),
    hotelId: unwrapId(raw.hotelId),
    categoryId: unwrapId(raw.categoryId),
    name: raw.name,
    description: raw.description ?? '',
    price: Number(raw.price) || 0,
    available: raw.available,
    imagePath: raw.imagePath ?? undefined,
  }
}

export function mapService(raw: ApiService): Service {
  const icon = raw.icon && SERVICE_ICONS.has(raw.icon) ? (raw.icon as Service['icon']) : 'tray'
  return {
    id: unwrapId(raw.id),
    hotelId: unwrapId(raw.hotelId),
    name: raw.name,
    description: raw.description ?? '',
    price: Number(raw.price) || 0,
    active: raw.active,
    tone: raw.tone ?? 'neutral',
    icon,
  }
}

export function mapArea(raw: ApiArea): HotelArea {
  return {
    id: unwrapId(raw.id),
    hotelId: unwrapId(raw.hotelId),
    name: raw.name,
    active: raw.active,
  }
}
