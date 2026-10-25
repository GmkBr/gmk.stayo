import type { CatalogCategory, CatalogItem } from '../../modules/catalog/model.ts'

export const mockCatalogCategories: CatalogCategory[] = [
  { id: 'cat-rs', hotelId: 'aurora', name: 'Alimentos', context: 'room', sortOrder: 1 },
  { id: 'cat-sol', hotelId: 'aurora', name: 'Conforto', context: 'room', sortOrder: 2 },
  { id: 'cat-ent', hotelId: 'aurora', name: 'Entradas', context: 'area', areaIds: ['ar-rst'], sortOrder: 1 },
  { id: 'cat-prt', hotelId: 'aurora', name: 'Pratos', context: 'area', areaIds: ['ar-rst'], sortOrder: 2 },
  { id: 'cat-beb', hotelId: 'aurora', name: 'Bebidas', context: 'area', areaIds: ['ar-rst', 'ar-lob'], sortOrder: 3 },
  { id: 'cat-spa', hotelId: 'aurora', name: 'Spa', context: 'area', areaIds: ['ar-spa'], sortOrder: 1 },
  { id: 'cat-rs-c', hotelId: 'central', name: 'Room service', context: 'room', sortOrder: 1 },
]

export const mockCatalogItems: CatalogItem[] = [
  { id: 'ci-1', hotelId: 'aurora', categoryId: 'cat-rs', name: 'Café da manhã no quarto', description: 'Pão, frutas, suco e café.', price: 89, available: true },
  { id: 'ci-2', hotelId: 'aurora', categoryId: 'cat-rs', name: 'Sanduíche club', description: 'Frango, bacon e salada.', price: 52, available: true },
  { id: 'ci-3', hotelId: 'aurora', categoryId: 'cat-rs', name: 'Sopa do dia', description: 'Porção individual.', price: 38, available: true },
  { id: 'ci-4', hotelId: 'aurora', categoryId: 'cat-sol', name: 'Toalhas extras', description: 'Kit com duas unidades.', price: 0, available: true },
  { id: 'ci-5', hotelId: 'aurora', categoryId: 'cat-sol', name: 'Água e gelo', description: 'Duas garrafas e balde de gelo.', price: 0, available: true },
  { id: 'ci-6', hotelId: 'aurora', categoryId: 'cat-sol', name: 'Travesseiro extra', description: 'Travesseiro de plumas.', price: 0, available: true },
  { id: 'ci-7', hotelId: 'aurora', categoryId: 'cat-ent', name: 'Bruschetta', description: 'Tomate, manjericão e azeite.', price: 34, available: true },
  { id: 'ci-8', hotelId: 'aurora', categoryId: 'cat-ent', name: 'Carpaccio', description: 'Filé mignon com rúcula.', price: 48, available: true },
  { id: 'ci-9', hotelId: 'aurora', categoryId: 'cat-prt', name: 'Risoto de cogumelos', description: 'Arroz arbóreo e parmesão.', price: 72, available: true },
  { id: 'ci-10', hotelId: 'aurora', categoryId: 'cat-prt', name: 'Filé ao molho', description: 'Batatas rústicas e legumes.', price: 98, available: true },
  { id: 'ci-11', hotelId: 'aurora', categoryId: 'cat-beb', name: 'Suco natural', description: 'Laranja ou abacaxi.', price: 18, available: true },
  { id: 'ci-12', hotelId: 'aurora', categoryId: 'cat-beb', name: 'Água com gás', description: 'Garrafa 500 ml.', price: 12, available: true },
  { id: 'ci-13', hotelId: 'aurora', categoryId: 'cat-spa', name: 'Massagem relaxante', description: '50 minutos.', price: 180, available: true },
  { id: 'ci-14', hotelId: 'aurora', categoryId: 'cat-spa', name: 'Day use spa', description: 'Sauna e piscina aquecida.', price: 120, available: true },
  { id: 'ci-15', hotelId: 'central', categoryId: 'cat-rs-c', name: 'Café expresso', description: 'Dupla porção.', price: 22, available: true },
]
