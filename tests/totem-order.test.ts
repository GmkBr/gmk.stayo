import assert from 'node:assert/strict'
import { test } from 'node:test'
import { catalogAsCartLine, serviceAsCartLine, toOrderLines, categoriesForArea, mergeCartLine, bumpCartLine, ordersNewestFirst } from '../src/pages/totem/totemOrder.ts'
import { demoState, resetDemoState, placeOrder } from '../src/demo/store.ts'
import type { CatalogCategory, CatalogItem, Order, Service } from '../src/types/index.ts'

// O cenário demo usa o armazenamento do browser; o teste fornece apenas essa interface em memória.
const memory = new Map<string, string>()
Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: {
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => memory.set(key, value),
  removeItem: (key: string) => memory.delete(key),
} })

test('carrinho preserva referências distintas de produto e serviço até o payload', () => {
  const product = catalogAsCartLine({ id: 'product', name: 'Água', price: 5 } as CatalogItem)
  const service = serviceAsCartLine({ id: 'service', name: 'Lavanderia', price: 20 } as Service)
  const lines = toOrderLines([product, service])
  assert.equal(lines[0].catalogItemId, 'product')
  assert.equal(lines[0].serviceId, undefined)
  assert.equal(lines[1].serviceId, 'service')
  assert.equal(lines[1].catalogItemId, undefined)
})

test('limite por item não pode ser ultrapassado por atalhos ou botões de quantidade', () => {
  const line = { ...catalogAsCartLine({ id: 'product', name: 'Água', price: 5 } as CatalogItem), qty: 100 }
  assert.equal(mergeCartLine([line], line)[0].qty, 100)
  assert.equal(bumpCartLine([line], line.key, 1)[0].qty, 100)
})

test('áreas incluem categorias compartilhadas e respeitam as áreas permitidas', () => {
  const categories = [
    { id: 'both', context: 'both', sortOrder: 1 },
    { id: 'room', context: 'room', sortOrder: 2 },
    { id: 'other', context: 'area', sortOrder: 3, areaIds: ['other-area'] },
  ] as CatalogCategory[]
  assert.deepEqual(categoriesForArea(categories, 'restaurant').map((item) => item.id), ['both'])
})

test('pedido após a meia-noite aparece antes dos pedidos do dia anterior', () => {
  const orders = [
    { id: 'yesterday', time: '23:54', createdAt: '2026-10-14T23:54:00-03:00' },
    { id: 'today', time: '00:19', createdAt: '2026-10-15T00:19:00-03:00' },
  ] as Order[]
  assert.deepEqual(ordersNewestFirst(orders).map((order) => order.id), ['today', 'yesterday'])
  assert.equal(orders[0].id, 'yesterday')
})

test('pedido demo usa preço e nome do catálogo e mantém vínculo com a estadia', () => {
  resetDemoState()
  const db = demoState()
  const stay = db.stays.find((item) => item.status === 'active')!
  const category = db.categories.find((item) => item.hotelId === stay.hotelId && ['room', 'both'].includes(item.context))!
  const item = db.items.find((entry) => entry.categoryId === category.id && entry.available)!
  const result = placeOrder(stay.hotelId, { source: 'room', location: 'Quarto', guestName: 'Nome falso',
    spaceId: stay.spaceId, lines: [{ catalogItemId: item.id, name: 'Nome falso', qty: 2, price: item.price }] })
  assert.equal(result.stayId, stay.id)
  assert.equal(result.guestName, stay.guestName)
  assert.equal(result.lines[0].name, item.name)
  assert.equal(result.total, item.price * 2)
})

test('preço adulterado não grava pedido na demonstração', () => {
  resetDemoState()
  const db = demoState()
  const stay = db.stays.find((item) => item.status === 'active')!
  const category = db.categories.find((item) => item.hotelId === stay.hotelId && ['room', 'both'].includes(item.context))!
  const item = db.items.find((entry) => entry.categoryId === category.id && entry.available)!
  const count = db.orders.length
  assert.throws(() => placeOrder(stay.hotelId, { source: 'room', location: 'Quarto', guestName: 'Hóspede',
    spaceId: stay.spaceId, lines: [{ catalogItemId: item.id, name: item.name, qty: 1, price: item.price + 1 }] }), { status: 409 })
  assert.equal(db.orders.length, count)
})
