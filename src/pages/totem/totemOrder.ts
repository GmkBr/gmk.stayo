import type { CatalogCategory, CatalogItem, Service } from '../../types/index.ts'

export const IDLE_MS = 60_000
export const DONE_MS = 10_000
export const KIOSK_BTN = 'h-14 min-h-14 w-full rounded-xl text-base'

export function categoriesForRoom(categories: CatalogCategory[]) {
  return categories
    .filter((item) => item.context === 'room' || item.context === 'both')
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function categoriesForArea(categories: CatalogCategory[], areaId: string) {
  return categories
    .filter(
      (item) =>
        item.context === 'area' &&
        (!item.areaIds || item.areaIds.length === 0 || item.areaIds.includes(areaId)),
    )
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function itemsForCategory(items: CatalogItem[], categoryId: string) {
  return items.filter((item) => item.categoryId === categoryId && item.available)
}

export type CartLine = {
  key: string
  name: string
  price: number
  qty: number
  kind: 'catalog' | 'service'
}

export function serviceAsCartLine(service: Service): CartLine {
  return {
    key: `sv-${service.id}`,
    name: service.name,
    price: service.price,
    qty: 1,
    kind: 'service',
  }
}

export function catalogAsCartLine(item: CatalogItem): CartLine {
  return {
    key: `ci-${item.id}`,
    name: item.name,
    price: item.price,
    qty: 1,
    kind: 'catalog',
  }
}

export function cartTotal(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.price * line.qty, 0)
}

export function cartCount(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.qty, 0)
}

export function mergeCartLine(lines: CartLine[], incoming: CartLine) {
  const index = lines.findIndex((line) => line.key === incoming.key)
  if (index === -1) return [...lines, incoming]
  return lines.map((line, i) => (i === index ? { ...line, qty: line.qty + 1 } : line))
}

export function bumpCartLine(lines: CartLine[], key: string, delta: number) {
  return lines
    .map((line) => (line.key === key ? { ...line, qty: line.qty + delta } : line))
    .filter((line) => line.qty > 0)
}

export function toOrderLines(lines: CartLine[]) {
  return lines.map((line, index) => ({
    id: `ol-${index}-${line.key}`,
    name: line.name,
    qty: line.qty,
    price: line.price,
  }))
}
