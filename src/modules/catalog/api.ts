import { apiRequest } from '../../api/client.ts'
import type { ApiArea, ApiCategory, ApiItem, ApiService } from './mappers.ts'
import { mapArea, mapCategory, mapItem, mapService } from './mappers.ts'
import type { CatalogCategory, CatalogItem, HotelArea, Service } from './model.ts'

export async function listCategories(hotelId: string, token?: string | null): Promise<CatalogCategory[]> {
  const raw = await apiRequest<ApiCategory[]>(`/hotels/${hotelId}/catalog/categories`, { token })
  return raw.map(mapCategory)
}

export async function createCategory(
  hotelId: string,
  body: { name: string; context: CatalogCategory['context']; areaIds?: string[]; sortOrder?: number },
): Promise<CatalogCategory> {
  return mapCategory(
    await apiRequest<ApiCategory>(`/hotels/${hotelId}/catalog/categories`, { method: 'POST', body }),
  )
}

export async function updateCategory(
  hotelId: string,
  id: string,
  body: { name: string; context: CatalogCategory['context']; areaIds?: string[]; sortOrder?: number },
): Promise<CatalogCategory> {
  return mapCategory(
    await apiRequest<ApiCategory>(`/hotels/${hotelId}/catalog/categories/${id}`, { method: 'PUT', body }),
  )
}

export async function listItems(hotelId: string, token?: string | null): Promise<CatalogItem[]> {
  const raw = await apiRequest<ApiItem[]>(`/hotels/${hotelId}/catalog/items`, { token })
  return raw.map(mapItem)
}

export async function createItem(
  hotelId: string,
  body: {
    categoryId: string
    name: string
    description?: string
    price: number
    available?: boolean
    imagePath?: string
  },
): Promise<CatalogItem> {
  return mapItem(await apiRequest<ApiItem>(`/hotels/${hotelId}/catalog/items`, { method: 'POST', body }))
}

export async function updateItem(
  hotelId: string,
  id: string,
  body: {
    categoryId: string
    name: string
    description?: string
    price: number
    available?: boolean
    imagePath?: string
  },
): Promise<CatalogItem> {
  return mapItem(
    await apiRequest<ApiItem>(`/hotels/${hotelId}/catalog/items/${id}`, { method: 'PUT', body }),
  )
}

export async function listServices(hotelId: string, token?: string | null): Promise<Service[]> {
  const raw = await apiRequest<ApiService[]>(`/hotels/${hotelId}/catalog/services`, { token })
  return raw.map(mapService)
}

export async function createService(
  hotelId: string,
  body: {
    name: string
    description?: string
    price: number
    active?: boolean
    icon?: string
    tone?: string
  },
): Promise<Service> {
  return mapService(
    await apiRequest<ApiService>(`/hotels/${hotelId}/catalog/services`, { method: 'POST', body }),
  )
}

export async function updateService(
  hotelId: string,
  id: string,
  body: {
    name: string
    description?: string
    price: number
    active?: boolean
    icon?: string
    tone?: string
  },
): Promise<Service> {
  return mapService(
    await apiRequest<ApiService>(`/hotels/${hotelId}/catalog/services/${id}`, { method: 'PUT', body }),
  )
}

export async function listAreas(hotelId: string, token?: string | null): Promise<HotelArea[]> {
  const raw = await apiRequest<ApiArea[]>(`/hotels/${hotelId}/catalog/areas`, { token })
  return raw.map(mapArea)
}

export async function createArea(hotelId: string, body: { name: string; active?: boolean }): Promise<HotelArea> {
  return mapArea(await apiRequest<ApiArea>(`/hotels/${hotelId}/catalog/areas`, { method: 'POST', body }))
}

export async function updateArea(
  hotelId: string,
  id: string,
  body: { name: string; active?: boolean },
): Promise<HotelArea> {
  return mapArea(
    await apiRequest<ApiArea>(`/hotels/${hotelId}/catalog/areas/${id}`, { method: 'PUT', body }),
  )
}
